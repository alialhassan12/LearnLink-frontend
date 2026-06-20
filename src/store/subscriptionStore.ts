import {create} from "zustand";
import axiosInstance from "../lib/axios";
import type { Plan } from "../@types/plan";
import type { Subscription } from "../@types/subscription";
import { toast } from "sonner";

interface SubscriptionState{
    currentSubscription:Subscription|null;
    setCurrentSubscription:(sub:Subscription|null)=>void;

    isGettingPlans:boolean;
    activePlans:Plan[];
    getActivePlans:()=>Promise<void>;

    isUpgrading:boolean;
    upgradeSubscription:(plan_id:number)=>Promise<void>;
}

export const useSubscriptionStore=create<SubscriptionState>((set)=>({
    currentSubscription:null,
    setCurrentSubscription:(sub:Subscription|null)=>set({currentSubscription:sub}),

    activePlans:[],
    isGettingPlans:false,
    getActivePlans:async()=>{
        set({isGettingPlans:true});
        try{
            const response=await axiosInstance.get('/plans');
            set({activePlans:response.data.plans});
        }catch(error){
            console.error("Error fetching plans:",error);
            toast.error("Error fetching plans");
        }finally{
            set({isGettingPlans:false});
        }
    },

    isUpgrading:false,
    upgradeSubscription:async(plan_id:number)=>{
        set({isUpgrading:true});
        try{
            const response=await axiosInstance.post('/plans/subscription/upgrade',{
                plan_id
            });
            set({currentSubscription:response.data.subscription});
            toast.success(response.data.message);
        }catch(error){
            console.error("Error upgrading subscription:",error);
            toast.error("Error upgrading subscription");
        }finally{
            set({isUpgrading:false});
        }
    }
}));