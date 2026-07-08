import {create} from 'zustand';
import type {Teacher} from '../@types/teacher';
import axiosInstance from '../lib/axios';
import { toast } from 'sonner';
import axios from 'axios';
import type { LiveSession } from '@/@types/liveSession';
import type { Booking } from '@/@types/booking';

interface TeacherStoreState{
    teacher:Teacher|null;
    setTeacher:(teacher:Teacher)=>void;
    getTeacher:()=>Promise<void>;
    isGettingTeacher:boolean;
    updateTeacher:(updatedTeacherData:FormData)=>Promise<Teacher|null>;
    isUpdatingTeacher:boolean;

    teacherDashboardData:{
        total_courses:number;
        upcoming_sessions:LiveSession[];
        total_enrollments:number;
        pending_bookings:Booking[];
    } | null;
    isGettingTeacherDashboardData:boolean;
    getTeacherDashboardData:()=>Promise<void>;
}


const useTeacherStore=create<TeacherStoreState>((set)=>({
    teacher:null,
    setTeacher:(teacher:Teacher)=>set({teacher}),

    teacherDashboardData:null,
    isGettingTeacher:false,
    getTeacher:async ()=>{
        set({isGettingTeacher:true});
        try {
            const response = await axiosInstance.get('/teacher/profile');
            set({teacher:response.data.teacher});
        } catch (error:any) {
            console.log(error.response?.data?.message);
        } finally{
            set({isGettingTeacher:false});
        }
    },

    isUpdatingTeacher:false,
    updateTeacher:async(updatedTeacherData:FormData)=>{
        try {
            set({isUpdatingTeacher:true});
            const response = await axiosInstance.put('/teacher/update-profile',updatedTeacherData,{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            set({teacher:response.data.teacher});
            toast.success(response.data.message);
            return response.data.teacher;
        } catch (error:any) {
            toast.error(error.response?.data?.message);
            return null;
        } finally{
            set({isUpdatingTeacher:false});
        }
    },

    isGettingTeacherDashboardData:false,
    getTeacherDashboardData:async()=>{
        set({isGettingTeacherDashboardData:true});
        try{
            const response=await axiosInstance.get('/teacher/dashboard');
            set({teacherDashboardData:response.data.data});
        }catch(error:any){
            toast.error(error.response?.data?.message || "Failed to fetch teacher dashboard data");
        }finally{
            set({isGettingTeacherDashboardData:false});
        }
    }
}));

export default useTeacherStore;
