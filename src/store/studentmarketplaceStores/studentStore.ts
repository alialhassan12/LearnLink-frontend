import {create} from "zustand";
import type { Student } from "../../@types/student";
import axiosInstance from "../../lib/axios";
import type { Booking } from "../../@types/booking";
import type { Enrollment } from "../../@types/enrollment";
import { toast } from "sonner";

interface StudentStore{
    student:Student | null;
    loggedInStudentId:number;
    completed_sessions_count:number;
    upcomming_sessions_count:number;
    enrolled_courses_count:number;
    upcomming_sessions:Booking[];
    enrolled_courses:Enrollment[];
    setStudent:(student:Student)=>void;
    getLoggedInStudentId:()=>Promise<void>;
    getStudent:()=>Promise<void>;
    isGettingStudent:boolean;

    editStudentProfile:(formData:FormData)=>Promise<Student>;
    isEditingStudentProfile:boolean;
}

export const useStudentStore=create<StudentStore>((set)=>({
    student:null,
    loggedInStudentId:-1,
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
    },

    getLoggedInStudentId:async()=>{
        try {
            const response=await axiosInstance.get('/student/get-student-id');
            set({loggedInStudentId:response.data.student_id});
            console.log(response.data);
        } catch (error:any) {
            console.log(error.response?.data?.message);
        }
    },

    isEditingStudentProfile:false,
    editStudentProfile:async(formData:FormData)=>{
        set({isEditingStudentProfile:true});
        try {
            const response = await axiosInstance.put('/student/update-profile',formData,{
                headers:{
                    'Content-Type':'multipart/form-data',
                }
            });
            set({student:response.data.student});
            toast.success(response.data.message);
            return response.data.student;
        } catch (error:any) {
            console.log(error.response?.data?.message);
            toast.error(error.response?.data?.message);
            return null;
        }finally{
            set({isEditingStudentProfile:false});
        }
    }
}));