import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import {create} from "zustand";
import type { Notification } from "@/@types/notification";

interface NotificationStoreState{
    notifications:Notification[];

    isGettingNotifications:boolean;
    getNotifications:()=>Promise<void>;
}

export const useNotificationStore=create<NotificationStoreState>((set)=>({
    notifications:[],

    isGettingNotifications:false,
    getNotifications:async()=>{
        set({isGettingNotifications:true});
        try{
            const response=await axiosInstance.get('/notifications/history');
            set({notifications:response.data.notifications});
        }catch(error:any){
            console.log(error?.response?.data?.message);
            toast.error(error?.response?.data?.message);
        }finally{
            set({isGettingNotifications:false});
        }
    }
}));