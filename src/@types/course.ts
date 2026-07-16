import type { Category } from "./category";
import type { CourseSection } from "./course_section";
import type { CourseReview } from "./courseReview";
import type { Enrollment } from "./enrollment";
import type { Teacher } from "./teacher";

export interface Course{
    id?:number;
    course_id?:number;
    title:string,
    teacher_id?:number,
    category_id:number,
    description:string,
    thumbnail:string | File,
    thumbnail_url?:string,
    language:string,
    price:number,
    status?:string,
    created_at?:string,
    updated_at?:string,

    //teacher courses
    category?:Category,
    teacher?:Teacher,
    sections?:CourseSection[],
    enrollments?:Enrollment[],
    enrollments_count?:number,
    
    course_reviews?:CourseReview[],
    course_reviews_avg_rating?:number;
    course_reviews_count?:number;
}