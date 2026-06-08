import type { Subscription } from "./subscription";

export interface user{ 
    id:number, 
    name:string, 
    email:string, 
    role:string, 
    avatar:string |null
    subscription?:Subscription;
    status?:string;
    created_at?:string;
    updated_at?:string;
}