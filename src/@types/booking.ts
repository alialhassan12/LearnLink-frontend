import type { Student } from "./student";
import type { Teacher } from "./teacher";

export interface Booking{
    id?:number;
    teacher_id:number;
    student_id?:number;
    scheduled_day:string;
    scheduled_date:string;
    scheduled_time:string;
    subject:string;
    student_note?:string;
    price:number;
    status?:string;
    created_at?:string;
    updated_at?:string;

    teacher?:Teacher;
    student?:Student;
}