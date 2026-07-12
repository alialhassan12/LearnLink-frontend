export interface Notification{
    user_id:number;
    title:string;
    body:string;
    type:string;
    data?:{
        type?:string;
        booking_id?:number;
    };
    is_read:boolean;
    created_at?:string;
    updated_at?:string;
}