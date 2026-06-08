export interface AiMessage{
    id:number;
    ai_chat_id:number;
    role:string;
    content:string;
    type:string;
    tokens_used:number;
    file_name?:string;
    file_path?:string | File;
    file_type?:string;
    created_at:string;
    updated_at:string;
}