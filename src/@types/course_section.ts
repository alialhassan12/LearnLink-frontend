import type { CourseMaterial } from "./courseMaterials";

export interface CourseSection{
    id?:number;
    course_id?:number;
    title:string;
    order?:number;
    materials?:CourseMaterial[];
    created_at?:string;
    updated_at?:string;
}
