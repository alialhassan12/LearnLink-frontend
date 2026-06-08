import type { Booking } from "./booking";
import type { SessionMaterial } from "./sessionMaterial";
import type { Student } from "./student";
import type { Teacher } from "./teacher";

export interface LiveSession{
    id:number;
    booking_id:number;
    scheduled_date:string;
    scheduled_day:string;
    scheduled_time:string;
    duration:number;
    status:string;
    recording_url:string;
    created_at:string;
    updated_at:string;
    subject?:string;
    student_note?:string;
    session_materials?:SessionMaterial[];

    booking?:Booking;
    teacher?:Teacher;
    student?:Student;
}

