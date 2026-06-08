import {create} from "zustand";
import type { Student } from "../../@types/student";
import axiosInstance from "../../lib/axios";

interface StudentStore{
    student:Student | null;
    completedSessionCount:number;
    setStudent:(student:Student)=>void;

    getStudent:()=>Promise<void>;
    isGettingStudent:boolean;
}

export const useStudentStore=create<StudentStore>((set)=>({
    student:null,
    completedSessionCount:0,
    setStudent:(student:Student)=>set({student}),

    isGettingStudent:false,
    getStudent:async()=>{
        set({isGettingStudent:true});
        try {
            const response = await axiosInstance.get('/student/profile');
            set({student:response.data.student});
            set({completedSessionCount:response.data.completedSessions});
            console.log(response.data);
        } catch (error:any) {
            console.log(error.response?.data?.message);
        }finally{
            set({isGettingStudent:false});
        }
    }
}));