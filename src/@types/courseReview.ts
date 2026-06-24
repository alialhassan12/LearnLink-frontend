import type { Student } from "./student";

export interface CourseReview{
    id:number;
    course_id:number;
    student_id:number
    rating:number;
    review:string;
    created_at:string;
    updated_at:string;
    student?:Student;
}