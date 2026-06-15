import {create } from 'zustand';
import type {Teacher} from '../../@types/teacher';
import axiosInstance from '../../lib/axios';
import { toast } from 'sonner';

interface TeacherFilter {
    subjects?:string[];
    language?:string;
    hourlyRate:[min:number,max:number];
    rating?:number | null;
}

interface TeacherPaginationData{
    current_page:number;
    last_page:number;
    per_page:number;
    total:number;
    from:number;
    to:number;
}

interface BrowseStoreState{
    teachers:Teacher[];
    teacher:Teacher | null;
    subjects:string[];
    languages:string[];
    getSubjects:()=>Promise<void>;
    getLanguages:()=>Promise<void>;
    isGettingFilters:boolean;
    setIsGettingFilters:(value:boolean)=>void;
    isGettingTeachers:boolean;
    teacherPaginationData:TeacherPaginationData | null;
    getTeachers:(page?:number)=>Promise<void>;
    isGettingTeacherById:boolean;
    getTeacherById:(id:number)=>Promise<void>;

    //teacher filters
    teacherFilter:TeacherFilter;
    setTeacherFilter:(filter:TeacherFilter)=>void;
    clearTeacherFilter:()=>void;

}

const useBrowseStore=create<BrowseStoreState>((set,get)=>({
    teachers:[],
    subjects:[],
    languages:[],
    isGettingFilters:false,
    setIsGettingFilters:(value:boolean)=>set({isGettingFilters:value}),
    
    getSubjects:async()=>{
        try {
            const response = await axiosInstance.get('/teachers/subjects');
            set({subjects:response.data.subjects});
        } catch (error:any) {
            toast.error(error.response?.data?.message);
        }
    },

    getLanguages:async()=>{
        try {
            const response = await axiosInstance.get('/teachers/languages');
            set({languages:response.data.languages});
        } catch (error:any) {
            toast.error(error.response?.data?.message);
        }
    },

    isGettingTeachers:false,
    teacherPaginationData:null,
    getTeachers:async(page:number=1)=>{
        set({isGettingTeachers:true});
        const currentFilters=get().teacherFilter;
        try {
            if((currentFilters.hourlyRate[0] !== 0 && currentFilters.hourlyRate[1]!==2000) || (currentFilters.subjects?.length !== 0) || (currentFilters.language !== "all") || (currentFilters.rating !== 0)){
                const response = await axiosInstance.post(`/teachers/filters?page=${page}`,currentFilters);
                set({teachers:response.data.teachers,teacherPaginationData:response.data.pagination});
            }else{
                const response = await axiosInstance.get(`/teachers?page=${page}`);
                set({teachers:response.data.teachers,teacherPaginationData:response.data.pagination});
                console.log(response.data);
            }
        } catch (error:any) {
            console.log(error.response?.data?.message);
            toast.error(error.response?.data?.message);
        } finally {
            set({isGettingTeachers:false});
        }
    },

    teacher:null,
    isGettingTeacherById:false,
    getTeacherById:async (id:number)=>{ 
        set({isGettingTeacherById:true});
        try {
            const response = await axiosInstance.get(`/teacher/${id}`);
            set({teacher:response.data.teacher});
            console.log("teacher:",response.data.teacher);
        } catch (error:any) {
            toast.error(error.response?.data?.message);
        } finally {
            set({isGettingTeacherById:false});
        }
    },

    // teacher filters
    teacherFilter:{
        subjects:[],
        language:"all",
        hourlyRate:[0,2000],
        rating:0
    },
    setTeacherFilter:(filter:TeacherFilter)=>set({teacherFilter:filter}),
    clearTeacherFilter:()=>set({teacherFilter:{
        subjects:[],
        language:"all",
        hourlyRate:[0,2000],
        rating:0
    }})

}));

export default useBrowseStore;