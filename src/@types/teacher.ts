import type { Course } from "./course";
import type { user } from "./user";

export interface Teacher {
    id: number;    
    user_id:number;
    name?:string,
    email?:string,
    avatar?:string,
    bio: string;
    headline: string;
    location: string;
    hourly_rate: number;
    subjects: string[];
    languages: string[];
    created_at: string;
    updated_at: string;
    availabilities?: {
        day_of_week: string;
        start_time: string;
        end_time: string;
    }[];
    courses_count?: number;
    courses?: Course[];
    published_courses?:Course[];
    user?:user;
    avg_rating?:number;
    review_count?:number;
}