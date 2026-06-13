import {create} from "zustand";
import type { Booking } from "../@types/booking";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";

interface BookingStore{
    newBooking:Booking |null;
    teacherBookings:Booking[] | null;
    studentBookings:Booking[] | null;
    isGettingTeacherBookings:boolean;
    teacherBookingsPagination:{
        current_page:number;
        last_page:number;
        total:number;
        per_page:number;
        has_more:boolean;
        from:number;
        to:number;
    } | null;
    studentBookingsPagination:{
        current_page:number;
        last_page:number;
        total:number;
        per_page:number;
        has_more:boolean;
        from:number;
        to:number;
    } | null;
    getTeacherBookings:(page?:number)=>Promise<void>;
    createBooking:(booking:Booking)=>Promise<void>;
    isCreatingBooking:boolean;
    isGettingStudentBookings:boolean;
    getStudentBookings:(page?:number)=>Promise<void>;
    isRejectingBooking:boolean;
    rejectBooking:(booking_id:number)=>Promise<void>;
    isApprovingBooking:boolean;
    approveBooking:(booking_id:number)=>Promise<void>;
    max_live_sessions:number;
    current_live_sessions:number;
}

const useBookingStore =create<BookingStore>((set,get)=>({
    newBooking:null,
    
    isCreatingBooking:false,
    createBooking:async(booking:Booking) => {
        set({isCreatingBooking:true});
        try{
            const response=await axiosInstance.post('/booking/new-booking',booking);
            set({newBooking:response.data.booking});
            toast.success('Booking created successfully');
        }
        catch(error){
            toast.error('Failed to create booking: ',error.response?.data?.message || 'Unknown error');
        } finally{
            set({isCreatingBooking:false});
        }
    },

    teacherBookings:[],
    teacherBookingsPagination:null,
    isGettingTeacherBookings:false,
    getTeacherBookings:async(page:number=1)=>{
        set({isGettingTeacherBookings:true});
        try{
            const response=await axiosInstance.get(`/bookings/teacher-bookings?page=${page}`);
            set({
                teacherBookings:response.data.bookings.data,
                teacherBookingsPagination:response.data.pagination,
                max_live_sessions:response.data.max_live_sessions,
                current_live_sessions:response.data.current_live_sessions
            });
            console.log(response.data);
        }
        catch(error:any){
            toast.error('Failed to get teacher bookings: ',error.response?.data?.message || 'Unknown error');
        } finally{
            set({isGettingTeacherBookings:false});
        }
    },

    studentBookings:[],
    studentBookingsPagination:null,
    isGettingStudentBookings:false,
    getStudentBookings:async(page=1)=>{
        set({isGettingStudentBookings:true});
        try{
            const response=await axiosInstance.get(`/bookings/student-bookings?page=${page}`);
            set({
                studentBookings:response.data.bookings.data,
                studentBookingsPagination:response.data.pagination
            });
        }
        catch(error:any){
            toast.error(error.response?.data?.message);
        } finally{
            set({isGettingStudentBookings:false});
        }
    },

    isRejectingBooking:false,
    rejectBooking:async(booking_id:number)=>{
        set({isRejectingBooking:true});
        try{
            const response=await axiosInstance.post('/bookings/reject-booking',{booking_id});
            set((state)=>{
                const booking=response.data.booking;
                const teacherBookings=state.teacherBookings?.filter((b)=>b.id!==booking_id);
                return {
                    teacherBookings: [...teacherBookings, booking]
                };
            });
            toast.success(response.data.message);
        }
        catch(error:any){
            toast.error(error.response?.data?.message);
        } finally{
            set({isRejectingBooking:false});
        }
    },

    isApprovingBooking:false,
    approveBooking:async(booking_id:number)=>{
        set({isApprovingBooking:true});
        try{
            const response=await axiosInstance.post('/bookings/approve-booking',{booking_id});
            set((state)=>{
                const booking=response.data.booking;
                const teacherBookings=state.teacherBookings?.filter((b)=>b.id!==booking_id);
                return {
                    teacherBookings: [...teacherBookings, booking],
                    current_live_sessions:response.data.current_live_sessions
                };
            });
            toast.success(response.data.message);
        }
        catch(error:any){
            toast.error(error.response?.data?.message);
        } finally{
            set({isApprovingBooking:false});
        }
    },

    max_live_sessions:0,
    current_live_sessions:0

}));

export default useBookingStore;