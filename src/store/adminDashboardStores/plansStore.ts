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

    changePlanStatus:(planId:number,status:string)=>Promise<void>;
    isChangingPlanStatus:boolean;

    planToEdit:Plan|null;
    setPlanToEdit:(plan:Plan)=>void;
    isEdittingPlan:boolean;
    editPlan:(plan:Plan)=>Promise<boolean>;
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
    },

    isChangingPlanStatus:false,
    changePlanStatus:async(planId:number,status:string)=>{
        set({isChangingPlanStatus:true});
        try{
            const response=await axiosInstance.put('/admin/plans/change-status',{
                plan_id:planId,
                status:status
            });
            set((state)=>{
                return {
                    allPlans:state.allPlans.map((plan)=>(plan.id===planId?response.data.plan:plan))
                }
            })
            toast.success(response.data.message || 'Plan status changed successfully');
        }catch(error:any){
            console.log(error?.response?.data?.message);
            toast.error(error?.response?.data?.message);
        }finally{
            set({isChangingPlanStatus:false});
        }
    },

    planToEdit:null,
    setPlanToEdit:(plan:Plan)=>{
        set({planToEdit:plan});
    },

    isEdittingPlan:false,
    editPlan:async(plan:Plan)=>{
        set({isEdittingPlan:true});
        try{
            const response=await axiosInstance.put('/admin/plans/update',plan);
            set((state)=>{
                return {
                    allPlans:state.allPlans.map((p)=>(p.id===plan.id?response.data.plan:p))
                }
            })
            toast.success(response.data.message || 'Plan updated successfully');
            return true;
        }catch(error:any){
            console.log(error?.response?.data?.message);
            toast.error(error?.response?.data?.message);
            return false;
        }finally{
            set({isEdittingPlan:false});
        }
    }
}));