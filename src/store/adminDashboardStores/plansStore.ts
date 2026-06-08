import {create} from "zustand";
import type { Plan } from "../../@types/plan";
import axiosInstance from "../../lib/axios";
import { toast } from "sonner";

interface PlansStore{
    allPlans:Plan[];
    newPlan:Plan | null;
    
    isGettingAllPlans:boolean;
    getAllPlans:()=>Promise<void>;

    isCreatingPlan:boolean;
    createPlan:(plan:Plan)=>Promise<boolean>;
}

export const usePlanStore=create<PlansStore>((set)=>({
    allPlans:[],
    newPlan:null,

    isGettingAllPlans:false,
    getAllPlans:async()=>{
        set({isGettingAllPlans:true});
        try{
            const response=await axiosInstance.get('/admin/plans');
            set({allPlans:response.data.plans});
            console.log(response.data.plans);
        }catch(error:any){
            console.log(error?.response?.data?.message);
            toast.error(error?.response?.data?.message);
        }finally{
            set({isGettingAllPlans:false});
        }
    },

    isCreatingPlan:false,
    createPlan:async(plan:Plan)=>{
        set({isCreatingPlan:true});
        try {
            const response= await axiosInstance.post('/admin/plans/create-plan',plan);
            set((state)=>({allPlans:[...state.allPlans,response.data.plan]}));
            console.log(response.data.plan);
            toast.success(response.data.message || 'Plan created successfully');
            return true;
        } catch (error:any) {
            console.log(error?.response?.data?.message);
            toast.error(error?.response?.data?.message);
            return false;
        }finally{
            set({isCreatingPlan:false});
        }
    }
}));