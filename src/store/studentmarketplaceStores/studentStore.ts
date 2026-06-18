import {create} from "zustand";
import type { Student } from "../../@types/student";
import axiosInstance from "../../lib/axios";
import type { Booking } from "../../@types/booking";
import type { Enrollment } from "../../@types/enrollment";

interface StudentStore{
    student:Student | null;
    completed_sessions_count:number;
    upcomming_sessions_count:number;
    enrolled_courses_count:number;
    upcomming_sessions:Booking[];
    enrolled_courses:Enrollment[];
    setStudent:(student:Student)=>void;

    getStudent:()=>Promise<void>;
    isGettingStudent:boolean;
}

export const useStudentStore=create<StudentStore>((set)=>({
    student:null,
    completed_sessions_count:0,
    upcomming_sessions_count:0,
    enrolled_courses_count:0,
    upcomming_sessions:[],
    enrolled_courses:[],
    setStudent:(student:Student)=>set({student}),

    isGettingStudent:false,
    getStudent:async()=>{
        set({isGettingStudent:true});
        try {
            const response = await axiosInstance.get('/student/profile');
            set({student:response.data.student});
            set({
                completed_sessions_count:response.data.completed_sessions_count,
                upcomming_sessions_count:response.data.upcomming_sessions_count,
                enrolled_courses_count:response.data.enrolled_courses_count,
                upcomming_sessions:response.data.upcomming_sessions,
                enrolled_courses:response.data.enrolled_courses
            });
        } catch (error:any) {
            console.log(error.response?.data?.message);
        }finally{
            set({isGettingStudent:false});
        }
    }
}));