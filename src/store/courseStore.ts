import {create} from "zustand";
import type { CoursePublish } from "../@types/coursePublish";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";
import type { Course } from "../@types/course";
import type { CourseReview } from "../@types/courseReview";

interface CourseFilter{
    category_id?:number;
    price_range:[min:number,max:number];
}

interface CoursePaginationData{
    current_page:number;
    last_page:number;
    per_page:number;
    total:number;
    from:number;
    to:number;
}

interface CourseStore{
    newCourse:Course | null;
    setNewCourse:(newCourse:Course)=>void;
    isPublishing:boolean;
    setIsPublishing:(isPublishing:boolean)=>void;
    publishCourse:(data:CoursePublish)=>Promise<boolean>;
    isSavingDraft:boolean;
    saveDraftCourse:(data?:CoursePublish)=>Promise<boolean>;
    isEditingCourse:boolean;
    editCourse:(course_id:number,data:Course)=>Promise<boolean>;
    isChangingCourseStatus:boolean;
    changeCourseStatus:(status:string,course_id:number)=>Promise<boolean>;
    
    //teacher courses
    teacherCourses:Course[];
    getTeacherCourses:()=>Promise<boolean>;
    isGettingTeacherCourses:boolean;
    maxCoursesAllowed:number;

    //all courses
    courses:Course[];
    coursePaginationData:CoursePaginationData | null;
    getCourses:(page?:number)=>Promise<boolean>;
    isGettingCourses:boolean,

    // course filters
    courseFilters:CourseFilter;
    setCourseFilters:(courseFilters:CourseFilter)=>void;
    clearCourseFilters:()=>void;

    // single course
    course:Course | null;
    getCourseById:(id:number)=>Promise<boolean>;
    isGettingCourseById:boolean;

    // course details with its materials
    // for enrolled students and teachers to view and edit course with its materials
    courseWithMaterials:Course | null;
    getCourseWithMaterialsById:(id:number)=>Promise<boolean>;
    isGettingCourseWithMaterialsById:boolean;
    
    //download course material
    downoladCourseMaterial:(materialId:number)=>Promise<any>;
    isDownloadingCourseMaterial:boolean;

    // course reviews
    courseReviews:CourseReview[];
    isCreatingCourseReview:boolean;
    createCourseReview:(course_id:number,rating:number,review_text?:string)=>Promise<void>;
}

export const useCourseStore = create<CourseStore>((set,get) => ({
    newCourse:null,
    courseReviews:[],

    setNewCourse:(newCourse:Course)=>set((state)=>({...state,newCourse})),
    isPublishing:false,
    setIsPublishing:(isPublishing:boolean)=>set((state)=>({...state,isPublishing})),

    publishCourse:async(data:CoursePublish)=>{
        set({isPublishing:true});
        try{
            const formData = new FormData();
            formData.append('category_id', String(data.category_id));
            formData.append('title', data.title);
            formData.append('description', data.description);
            if (data.thumbnail) {
                formData.append('thumbnail', data.thumbnail);
            }
            formData.append('language', data.language);
            formData.append('price', String(data.price));

            data.sections.forEach((section, index) => {
                formData.append(`sections[${index}][title]`, section.title);
                formData.append(`sections[${index}][order]`, String(section.order));
                
                section.materials.forEach((material, mIndex) => {
                    formData.append(`sections[${index}][materials][${mIndex}][title]`, material.title);
                    formData.append(`sections[${index}][materials][${mIndex}][type]`, material.type);
                    formData.append(`sections[${index}][materials][${mIndex}][size]`, String(Math.round(material.size)));
                    if (material.file) {
                        formData.append(`sections[${index}][materials][${mIndex}][file]`, material.file);
                    }
                });
            });

            const response=await axiosInstance.post('/courses/create-course', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            set({newCourse:response.data.course,teacherCourses:[...get().teacherCourses,response.data.course]});
            toast.success(response.data.message);

            return true;
        }catch(error:any){
            toast.error(error.response?.data?.message || "An error occurred");
            return false;
        }finally{
            set({isPublishing:false});
        }
    },

    isSavingDraft:false,
    saveDraftCourse:async(data?:CoursePublish)=>{
        set({isSavingDraft:true});
        try{
            const formData = new FormData();
            formData.append('category_id', String(data?.category_id ?? 0));
            formData.append('title', data?.title ?? '');
            formData.append('description', data?.description ?? '');
            if (data?.thumbnail) {
                formData.append('thumbnail', data?.thumbnail);
            }
            formData.append('language', data?.language ?? '');
            formData.append('price', String(data?.price ?? 0));

            data?.sections?.forEach((section, index) => {
                formData.append(`sections[${index}][title]`, section?.title);
                formData.append(`sections[${index}][order]`, String(section?.order));
                
                section?.materials?.forEach((material, mIndex) => {
                    formData.append(`sections[${index}][materials][${mIndex}][title]`, material?.title);
                    formData.append(`sections[${index}][materials][${mIndex}][type]`, material?.type);
                    formData.append(`sections[${index}][materials][${mIndex}][size]`, String(Math.round(material?.size)));
                    if (material?.file) {
                        formData.append(`sections[${index}][materials][${mIndex}][file]`, material?.file);
                    }
                });
            });

            const response=await axiosInstance.post('/courses/save-draft', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            set({newCourse:response.data.course,teacherCourses:[...get().teacherCourses,response.data.course]});
            toast.success(response.data.message);

            return true;
        }catch(error:any){
            toast.error(error.response?.data?.message || "An error occurred");
            return false;
        }finally{
            set({isSavingDraft:false});
        }
    },

    isGettingTeacherCourses:false,
    teacherCourses:[],
    maxCoursesAllowed:0,
    getTeacherCourses:async()=>{
        set({isGettingTeacherCourses:true});
        try{
            const response=await axiosInstance.get('/courses/my-courses');
            set({
                teacherCourses:response.data.courses,
                maxCoursesAllowed:response.data.max_courses_allowed
            });
            console.log(response.data);
            return true;
        }catch(error:any){
            toast.error(error.response?.data?.message || "An error occurred");
            return false;
        }finally{
            set({isGettingTeacherCourses:false});
        }
    },

    courses:[],
    coursePaginationData:null,
    courseFilters:{
        category_id: undefined,
        price_range: [0, 100]
    },
    setCourseFilters:(courseFilters:CourseFilter)=>set({courseFilters}),
    clearCourseFilters:()=>set({courseFilters:{
        category_id: undefined,
        price_range: [0, 100]
    }}),
    
    isGettingCourses:false,
    getCourses:async(page:number=1)=>{
        set({isGettingCourses:true});
        const filters=get().courseFilters;
        try{
            if(filters.category_id || filters.price_range[0] !== 0 || filters.price_range[1] !== 100){
                const response=await axiosInstance.post(`/courses/get-courses/filtered?page=${page}`,{
                    category_id:filters.category_id,
                    price_range:filters.price_range
                });
                set({courses:response.data.courses,coursePaginationData:response.data.pagination});
            }else{
                const response=await axiosInstance.get(`/courses/get-courses?page=${page}`);
                set({courses:response.data.courses,coursePaginationData:response.data.pagination});
            }
            return true;
        }catch(error:any){
            toast.error(error.response?.data?.message || "An error occurred");
            return false;
        }finally{
            set({isGettingCourses:false});
        }
    },

    course:null,
    isGettingCourseById:false,
    getCourseById:async(id:number)=>{
        set({isGettingCourseById:true});
        try{
            const response=await axiosInstance.get(`/courses/get-course/${id}`);
            set({course:response.data.course});
            console.log(response.data.course);
            return true;
        }catch(error:any){
            toast.error(error.response?.data?.message || "An error occurred");
            return false;
        }finally{
            set({isGettingCourseById:false});
        }
    },

    courseWithMaterials:null,
    isGettingCourseWithMaterialsById:false,
    getCourseWithMaterialsById:async(id:number)=>{
        set({isGettingCourseWithMaterialsById:true});
        try {
            const response=await axiosInstance.get(`/courses/course/${id}`);
            set({
                courseWithMaterials:response.data.course,
                courseReviews:response.data.course.course_reviews
            });
            console.log(response.data.course);
            return true;
        } catch (error:any) {
            toast.error(error.response?.data?.message || "An error occurred");
            return false;
        }finally{
            set({isGettingCourseWithMaterialsById:false});
        }
    },

    isEditingCourse:false,
    editCourse:async(course_id:number,data:Course)=>{
        set({isEditingCourse:true});
        try {
            const formData =new FormData();
            formData.append('course_id',String(course_id));
            formData.append('category_id',String(data.category_id));
            formData.append('title',data.title);
            formData.append('description',data.description);
            
            if(data.thumbnail instanceof File){
                formData.append('thumbnail',data.thumbnail);
            }
            formData.append('language',data.language);
            formData.append('price',String(data.price));
            data?.sections?.forEach((section, index) => {
                if (section?.id) {
                    formData.append(`sections[${index}][id]`, String(section.id));
                }
                formData.append(`sections[${index}][title]`, section?.title);
                formData.append(`sections[${index}][order]`, String(section?.order));
                
                section?.materials?.forEach((material, mIndex) => {
                    if (material?.id) {
                        formData.append(`sections[${index}][materials][${mIndex}][id]`, String(material.id));
                    }
                    formData.append(`sections[${index}][materials][${mIndex}][title]`, material?.title);
                    formData.append(`sections[${index}][materials][${mIndex}][type]`, material?.type);
                    formData.append(`sections[${index}][materials][${mIndex}][size]`, String(Math.round(material?.size ?? 0)));
                    if (material?.file) {
                        formData.append(`sections[${index}][materials][${mIndex}][file]`, material?.file);
                    }
                });
            });

            const response=await axiosInstance.put('/courses/edit-course', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            set({
                newCourse:response.data.course,
                teacherCourses:get().teacherCourses.map((course)=>course.id===course_id?response.data.course:course)
            });
            console.log(response.data);
            toast.success(response.data.message);

            return true;
        } catch (error:any) {
            toast.error(error.response?.data?.message || "An error occurred");
            return false;
        } finally{
            set({isEditingCourse:false});
        }
    },

    isChangingCourseStatus:false,
    changeCourseStatus:async(status:string,course_id:number)=>{
        set({isChangingCourseStatus:true});
        try {
            const response=await axiosInstance.post('/courses/change-course-status',{course_id,status});
            set({
                teacherCourses:get().teacherCourses.map((course)=>course.id===course_id?response.data.course:course)
            });
            toast.success(response.data.message);
            return true;
        } catch (error:any) {
            toast.error(error.response?.data?.message || "An error occurred");
            return false;
        }finally{
            set({isChangingCourseStatus:false});
        }
    },
    
    isDownloadingCourseMaterial:false,
    downoladCourseMaterial:async(materialId:number)=>{
        set({isDownloadingCourseMaterial:true});
        try{
            const response=await axiosInstance.get(`/courses/download-material/${materialId}`,{
                responseType:"blob"
            });
            return response.data;
        }catch(error:any){
            toast.error(error.response?.data?.message || "An error occurred");
            return error;
        }finally{
            set({isDownloadingCourseMaterial:false});
        }
    },

    isCreatingCourseReview:false,
    createCourseReview:async(course_id:number,rating:number,review_text?:string)=>{
        set({isCreatingCourseReview:true});
        try{
            const response=await axiosInstance.post('/courses/review/new',{course_id,rating,review_text});
            set({
                courseReviews:[...get().courseReviews,response.data.review]
            });
            toast.success(response.data.message);
        }catch(error:any){
            toast.error(error.response?.data?.message || "An error occurred");
        }finally{
            set({isCreatingCourseReview:false});
        }
    }
}));
