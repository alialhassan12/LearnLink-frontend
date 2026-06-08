import type { user } from "./user";
import type { Message } from "./message";

export interface Conversation{
    id:number;
    type:string;
    group_name?:string;
    group_description?:string;
    last_message_id?:number;
    last_message?:Message;
    participants?:{id:number,user_id:number, user?:user}[];
    created_at?:string;
    updated_at?:string;
}