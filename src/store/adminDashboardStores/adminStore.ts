import {create} from "zustand";
import type { user } from "../../@types/user";
import axiosInstance from "../../lib/axios";
import { toast } from "sonner";
import type { Course } from "@/@types/course";
import type { CourseSection } from "@/@types/course_section";
import type { Enrollment } from "@/@types/enrollment";
import type { CourseReview } from "@/@types/courseReview";
import type { Teacher } from "@/@types/teacher";
import type { Category } from "@/@types/category";

interface CoursePagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface AdminStore{
    users:user[]
    userPaginationData:{
        current_page:number;
        last_page:number;
        per_page:number;
        total:number;
        from:number;
        to:number;
    } | null;
    isGettingAllUsers:boolean;
    getAllUsers:(page?:number)=>Promise<void>;

    suspendUser:(user_id:number)=>Promise<void>;
    activateUser:(user_id:number)=>Promise<void>;
    isSuspendingUser:boolean;
    isActivatingUser:boolean;

    // dashboard
    dashboardData:{
        totalUsers:number;
        totalTeachers:number;
        totalStudents:number;
        totalCourses:number;
        recentUsers:user[];
        recentCourses:Course[];
        userGrowth:{ month: string; users: number }[];
        courseEnrollments:{ month: string; enrollments: number }[];
        revenueTrend:{ month: string; revenue: number }[];
        topTeachersByRating:Teacher[];
        topTeachersBySessions:Teacher[];
        topCoursesByEnrollment:Course[];
        topCoursesByRevenue:Course[];
    } | null;
    isGettingDashboardData:boolean;
    getDashboardData:()=>Promise<void>;

    // courses management
    courses: Course[];
    coursePaginationData: CoursePagination | null;
    isGettingCourses: boolean;
    getCourses: (page?: number) => Promise<void>;

    selectedCourse: Course | null;
    isGettingCourseDetails: boolean;
    getCourseDetails: (id: number) => Promise<void>;
    clearSelectedCourse: () => void;

    isChangingCourseStatus: boolean;
    changeCourseStatus: (course_id: number, status: string) => Promise<void>;
}

export const useAdminStore=create<AdminStore>((set)=>({
    users:[],
    userPaginationData:null,
    isGettingAllUsers:false,
    getAllUsers:async(page:number=1)=>{
        set({isGettingAllUsers:true});
        try {
            const response=await axiosInstance.get(`/admin/users?page=${page}`);
            set({users:response?.data?.users?.data,userPaginationData:response?.data?.pagination});
            console.log(response.data.users.data);
        } catch (error:any) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        }finally{
            set({isGettingAllUsers:false});
        }
    },

    isSuspendingUser:false,
    suspendUser:async(user_id:number)=>{
        set({isSuspendingUser:true});
        try {
            const response=await axiosInstance.put('/admin/users/suspend',{user_id});
            toast.success(response?.data?.message);
            set((state)=>({
                users:state.users.map((user)=>user.id===user_id?{...user,status:'inactive'}:user)
            }));
        } catch (error:any) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        }finally{
            set({isSuspendingUser:false});
        }
    },

    isActivatingUser:false,
    activateUser:async(user_id:number)=>{
        set({isActivatingUser:true});
        try {
            const response=await axiosInstance.put('/admin/users/activate',{user_id:user_id});
            toast.success(response?.data?.message);
            set((state)=>({
                users:state.users.map((user)=>user.id===user_id?{...user,status:'active'}:user)
            }));
        } catch (error:any) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        }finally{
            set({isActivatingUser:false});
        }
    },

    dashboardData:null,
    isGettingDashboardData:false,
    getDashboardData:async()=>{
        set({isGettingDashboardData:true});
        try {
            const response=await axiosInstance.get('/admin/dashboard');
            set({dashboardData:response?.data?.data});
            console.log(response.data.data);
        } catch (error:any) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        }finally{
            set({isGettingDashboardData:false});
        }
    },

    // ── courses management ──────────────────────────────────────────────
    courses: [],
    coursePaginationData: null,
    isGettingCourses: false,
    getCourses: async (page = 1) => {
        set({ isGettingCourses: true });
        try {
            const response = await axiosInstance.get(`/admin/courses?page=${page}`);
            set({
                courses: response?.data?.courses?.data,
                coursePaginationData: {
                    current_page: response?.data?.courses?.current_page,
                    last_page: response?.data?.courses?.last_page,
                    per_page: response?.data?.courses?.per_page,
                    total: response?.data?.courses?.total,
                    from: response?.data?.courses?.from,
                    to: response?.data?.courses?.to,
                },
            });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        } finally {
            set({ isGettingCourses: false });
        }
    },

    selectedCourse: null,
    isGettingCourseDetails: false,
    getCourseDetails: async (id) => {
        set({ isGettingCourseDetails: true });
        try {
            const response = await axiosInstance.get(`/admin/courses/${id}`);
            set({ selectedCourse: response?.data?.course });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        } finally {
            set({ isGettingCourseDetails: false });
        }
    },
    clearSelectedCourse: () => set({ selectedCourse: null }),

    isChangingCourseStatus: false,
    changeCourseStatus: async (course_id, status) => {
        set({ isChangingCourseStatus: true });
        try {
            const response = await axiosInstance.put('/admin/courses/change-status', { course_id, status });
            toast.success(response?.data?.message);
            // optimistic update in the list
            set((state) => ({
                courses: state.courses.map((c) =>
                    c.id === course_id ? { ...c, status } : c
                ),
                // also update the open detail if it's the same course
                selectedCourse:
                    state.selectedCourse?.id === course_id
                        ? { ...state.selectedCourse, status }
                        : state.selectedCourse,
            }));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        } finally {
            set({ isChangingCourseStatus: false });
        }
    },
}));
