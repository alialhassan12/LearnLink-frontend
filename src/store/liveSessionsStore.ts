import {create} from 'zustand';
import type {LiveSession} from '../@types/liveSession';
import axiosInstance from '../lib/axios';


export interface LiveSessionState{
    token:string;
    url:string;
    session_id:number | null;
    isGettingToken:boolean;
    getToken:(roomName:string,session_id:number)=>Promise<void>;

    isEndingSession:boolean;
    endSession:(session_id:number)=>Promise<void>;

    teacherLiveSessions:LiveSession[];
    isGettingTeacherLiveSessions:boolean;
    getTeacherLiveSessions:()=>Promise<void>;

    studentLiveSessions:LiveSession[];
    isGettingStudentLiveSessions:boolean;
    getStudentLiveSessions:()=>Promise<void>;

    teacherSelectedSession:LiveSession | null;
    isGettingTeacherSelectedSession:boolean;
    getTeacherSelectedSession:(id:number)=>Promise<LiveSession | null>;

    studentSelectedSession:LiveSession |null;
    isGettingStudentSelectedSession:boolean;
    getStudentSelectedSession:(id:number)=>Promise<LiveSession | null>;
}

export const useLiveSessionStore=create<LiveSessionState>((set)=>({
    teacherLiveSessions:[],

    isGettingTeacherLiveSessions:false,
    getTeacherLiveSessions:async()=>{
        set({isGettingTeacherLiveSessions:true});
        try {
            const response=await axiosInstance.get('/live-sessions/teacher-sessions');
            set({teacherLiveSessions:response.data.live_sessions});
            console.log("live sessions fetched",response.data.live_sessions);
        } catch (error:any) {
            console.error('Error fetching live sessions:', error?.response?.data?.message || error?.message || 'Unknown error');
        } finally{
            set({isGettingTeacherLiveSessions:false});
        }
    },

    token:"",
    url:"",
    session_id:null,
    isGettingToken:false,
    getToken:async(roomName:string,session_id:number)=>{
        set({isGettingToken:true});
        try {
            const response=await axiosInstance.post('/livekit/token',{room_name:roomName});
            set({token:response.data.token,url:response.data.url,session_id:session_id});
            
        } catch (error:any) {
            console.error('Error fetching token:', error?.response?.data?.message || error?.message || 'Unknown error');
        } finally{
            set({isGettingToken:false});
        }
    },

    isEndingSession:false,
    endSession:async(session_id:number)=>{
        set({isEndingSession:true});
        try {
            const response=await axiosInstance.post('/live-session/end-session',{session_id});
            console.log(response.data.message);
        } catch (error:any) {
            console.error('Error ending session:', error?.response?.data?.message || error?.message || 'Unknown error');
        }finally{
            set({isEndingSession:false});
        }
    },

    studentLiveSessions:[],
    isGettingStudentLiveSessions:false,
    getStudentLiveSessions:async()=>{
        set({isGettingStudentLiveSessions:true});
        try {
            const response=await axiosInstance.get('/live-sessions/student-sessions');
            set({studentLiveSessions:response.data.live_sessions});
            console.log("student live sessions fetched",response.data.live_sessions);
        } catch (error:any) {
            console.error('Error fetching live sessions:', error?.response?.data?.message || error?.message || 'Unknown error');
        } finally{
            set({isGettingStudentLiveSessions:false});
        }
    },

    teacherSelectedSession:null,
    isGettingTeacherSelectedSession:false,
    getTeacherSelectedSession:async(id:number)=>{
        set({isGettingTeacherSelectedSession:true});
        try {
            const response =await axiosInstance.get(`/live-sessions/teacher-session/${id}`);
            set({teacherSelectedSession:response.data.session});
            return response.data.session;
        } catch (error:any) {
            console.error('Error fetching teacher selected session:', error?.response?.data?.message || error?.message || 'Unknown error');
            return null;
        } finally{
            set({isGettingTeacherSelectedSession:false});
        }
    },

    studentSelectedSession:null,
    isGettingStudentSelectedSession:false,
    getStudentSelectedSession:async(id:number)=>{
        set({isGettingStudentSelectedSession:true});
        try {
            const response=await axiosInstance.get(`/live-sessions/student-session/${id}`);
            set({studentSelectedSession:response.data.session});
            return response.data.session;
        } catch (error:any) {
            console.error('Error fetching student selected session:', error?.response?.data?.message || error?.message || 'Unknown error');
            return null;
        } finally{
            set({isGettingStudentSelectedSession:false});
        }
    }

}));