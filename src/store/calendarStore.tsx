import {create} from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";
import type { Booking } from "../@types/booking";

interface CalendarState{
    teacherEvents:Booking[];
    isGettingTeacherEvents:boolean;
    getTeacherEvents:()=>Promise<void>;
}

export const useCalendarStore=create<CalendarState>((set)=>({
    teacherEvents:[],
    isGettingTeacherEvents:false,
    getTeacherEvents:async()=>{
        try {
            set({isGettingTeacherEvents:true});
            const response=await axiosInstance.get('/calendar/get-events');
            set({teacherEvents:response.data.events});
        } catch (error:any) {
            console.log(error?.response?.data?.message);
            toast.error("Failed to fetch events");
        }finally{
            set({isGettingTeacherEvents:false});
        }
    }
}));