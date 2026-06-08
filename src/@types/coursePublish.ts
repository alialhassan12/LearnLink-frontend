export interface CoursePublish{
    category_id:number,
    title:string,
    description:string,
    thumbnail:File | string,
    language:string,
    price:number,
    sections:{title:string,order:number,materials:{file:File,type:string,size:number,title:string}[]}[]
}