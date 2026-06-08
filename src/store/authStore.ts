import {create} from "zustand";
import type { user } from "../@types/user";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";

interface useAuthStoreInterface{
    authUser:user |null,
    setAuthUser:(user:user)=>void,
    login:({email,password}: {email:string,password:string})=>Promise<boolean>,
    isloggingIn:boolean,
    checkAuth:()=>Promise<boolean>,
    isCheckingAuth:boolean,
    isLoggingout:boolean,
    logout:()=>Promise<boolean>,
    isRegistering:boolean,
    register:({name,email,password,password_confirmation,role}: {name:string,email:string,password:string,password_confirmation:string,role:string})=>Promise<boolean>,
}

const useAuthStore=create<useAuthStoreInterface>((set)=>({
    authUser:null,
    setAuthUser:(user:user)=>set({authUser:user}),

    isloggingIn:false,
    login: async ({email,password}: {email:string,password:string})=>{
        set({isloggingIn:true});
        try {
            const response=await axiosInstance.post('/auth/login',{email,password});
            localStorage.setItem('token',response.data.token);
            set({authUser:response.data.user});
            toast.success(response.data.message);
            return true;
        } catch (error:any) {
            toast.error(error.response.data.message);
            return false;
        } finally{
            set({isloggingIn:false});
        }
    },

    isCheckingAuth:false,
    checkAuth:async()=>{
        if(!localStorage.getItem('token')){
            set({authUser:null});
            return false;
        }
        set({isCheckingAuth:true});
        try {
            const response=await axiosInstance.get('/auth/me');
            set({authUser:response.data.user});
            return true;
        } catch (error:any) {
            localStorage.removeItem('token');
            set({authUser:null});
            toast.error(error.response.data.message);
            return false;
        } finally{
            set({isCheckingAuth:false});
        }
    },

    isLoggingout:false,
    logout:async()=>{
        set({isLoggingout:true});
        try {
            await axiosInstance.post('/auth/logout');
            localStorage.removeItem('token');
            set({authUser:null});
            toast.success('Logout successful');
            return true;
        } catch (error:any) {
            toast.error(error.response.data.message);
            return false;
        } finally{
            set({isLoggingout:false});
        }
    },

    isRegistering:false,
    register:async({name,email,password,password_confirmation,role}: {name:string,email:string,password:string,password_confirmation:string,role:string})=>{
        set({isRegistering:true});
        try {
            const response=await axiosInstance.post('/auth/register',{name,email,password,password_confirmation,role});
            localStorage.setItem('token',response.data.token);
            set({authUser:response.data.user});
            toast.success(response.data.message);
            return true;
        } catch (error:any) {
            toast.error(error.response.data.message);
            return false;
        } finally{
            set({isRegistering:false});
        }
    }
}));

export default useAuthStore