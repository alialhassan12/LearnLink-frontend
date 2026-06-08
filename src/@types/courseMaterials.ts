export interface CourseMaterial{
    id?:number;
    section_id?:number;
    title:string;
    type:string;
    path?:string;
    file?:File;
    size?:number;
    created_at?:string;
    updated_at?:string;
}