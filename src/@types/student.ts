import type { Booking } from "./booking";
import type { Course } from "./course";
import type { user } from "./user";

export interface Student{
    id:number;
    user_id:number;
    bio:string;
    headline:string;
    user?:user;
    bookings?:Booking[];
    enrolled_courses?:Course[];
}