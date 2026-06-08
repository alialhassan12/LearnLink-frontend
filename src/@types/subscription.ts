import type { Plan } from "./plan";

export interface Subscription{
    id?:number;
    plan_id:number;
    user_id:number;
    tokens_used:number;
    start_at:string;
    end_at:string;
    status:string;
    plan?:Plan;
    created_at?:string;
    updated_at?:string;
}