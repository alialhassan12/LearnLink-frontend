import useBrowseStore from "../../../store/studentmarketplaceStores/browseStore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Globe, MapPin, User } from "lucide-react";
import { Separator } from "../../../components/ui/separator";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { toast } from "sonner";
import useBookingStore from "../../../store/bookingStore";
import { Spinner } from "../../../components/ui/spinner";
import { NativeSelect, NativeSelectOption } from "../../../components/ui/native-select";
import { Textarea } from "../../../components/ui/textarea";
import MessageButton from "../../../components/MessageButton";
import type { user } from "../../../@types/user";
import { useCourseEnrollmentStore } from "../../../store/studentmarketplaceStores/courseEnrollmentStore";

const TeacherProfileSkeleton = () => (
    <div className="flex flex-col gap-10 px-4 py-6 md:px-10 md:py-10 max-w-7xl mx-auto animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Skeleton className="h-32 w-32 md:h-48 md:w-48 rounded-full shrink-0" />
            <div className="flex flex-col gap-3 w-full md:pt-4 items-center md:items-start">
                <Skeleton className="h-10 w-64 rounded-lg" />
                <Skeleton className="h-5 w-48 rounded-lg" />
                <div className="flex flex-row items-center gap-4 mt-2">
                    <Skeleton className="h-8 w-32 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-full" />
                </div>
            </div>
        </div>

        {/* Body Skeleton */}
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="flex flex-col gap-8 flex-1">
                {/* About Section */}
                <div className="flex flex-col bg-card border border-border rounded-2xl p-6 gap-4">
                    <Skeleton className="h-7 w-48 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full rounded-lg" />
                        <Skeleton className="h-4 w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4 rounded-lg" />
                    </div>
                </div>

                {/* Subjects Section */}
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-7 w-48 rounded-lg" />
                    <div className="flex flex-row gap-2 flex-wrap">
                        <Skeleton className="h-10 w-24 rounded-lg" />
                        <Skeleton className="h-10 w-32 rounded-lg" />
                        <Skeleton className="h-10 w-28 rounded-lg" />
                    </div>
                </div>

                {/* Availability Section */}
                <div className="flex flex-col gap-6 bg-card border border-border rounded-xl p-6">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-7 w-48 rounded-lg" />
                        <Skeleton className="h-4 w-32 rounded-lg" />
                    </div>
                    <div className="flex flex-row flex-wrap gap-4 justify-center md:justify-start">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <Skeleton className="h-5 w-16 rounded-lg" />
                                <Skeleton className="h-10 w-20 rounded-lg" />
                                <Skeleton className="h-10 w-20 rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column (Booking) */}
            <div className="w-full lg:w-80 xl:w-96">
                <div className="flex flex-col bg-card border border-border rounded-2xl p-6 gap-6 sticky top-24">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-4 w-12 rounded-lg" />
                    </div>
                    <Separator />
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-24 rounded-lg" />
                        <Skeleton className="h-20 w-full rounded-xl" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-32 rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-11 w-full rounded-xl" />
                        <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const TeacherProfile = () => {
    const {id}=useParams();
    const {teacher,getTeacherById,isGettingTeacherById}=useBrowseStore();
    const {createBooking,isCreatingBooking}=useBookingStore();
    const {enrolledCoursesIds}=useCourseEnrollmentStore();
    const navigate=useNavigate();

    const day_of_week=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    
    const [selectedDate,setSelectedDate]=useState("");
    const [dateError,setDateError]=useState(false);
    const [selectedSubject,setSelectedSubject]=useState<string>("");
    const [student_note,setStudentNote]=useState<string>("");

    useEffect(()=>{
        getTeacherById(Number(id));
    },[]);

    const handleBookSession= async()=>{
        const date=selectedDate.split("T")[0];
        const time=selectedDate.split("T")[1];

        if(date && time){
            setDateError(false);
            const day=new Date(date).getDay();
            const scheduled_date=new Date(date).toDateString();

            if(teacher.availabilities.some((slot)=>{
                if(slot.day_of_week==day_of_week[day]){
                    if(slot.start_time<=time && slot.end_time>=time){
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                return false;
            })){
                await createBooking({
                    teacher_id:Number(id),
                    scheduled_day:day_of_week[day],
                    scheduled_time:time,
                    scheduled_date:scheduled_date,
                    subject:selectedSubject,
                    student_note:student_note,
                    price:teacher.hourly_rate
                });
                setDateError(false);
                setSelectedDate("");
                setStudentNote("");
                setSelectedSubject("");
            }else{
                setDateError(true);
                toast.error("Not available on this day or at this time. Please check teacher's availability.");
            }
        }else{
            setDateError(true);
            toast.error("Please select a date and time");
        }
    }

    const handleNavigateToCourse=(courseId:number)=>{
        if(enrolledCoursesIds.includes(courseId)){
            navigate(`/marketplace/learnings/course/${courseId}`);
        }else{
            navigate(`/marketplace/browse/courses/${courseId}`);
        }
    }

    if (isGettingTeacherById) {
        return <TeacherProfileSkeleton />;
    }

    if (!teacher) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-xl text-text-weak font-medium">Teacher not found</p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 px-4 py-6 md:px-10 md:py-10 max-w-7xl mx-auto">
            {/* teacher basic info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-32 w-32 md:h-48 md:w-48 border-4 border-card shadow-xl shrink-0">
                    <AvatarFallback className="text-4xl md:text-6xl">{teacher?.user?.name.charAt(0).toUpperCase()}</AvatarFallback>
                    <AvatarImage src={teacher?.user?.avatar_url} className="object-cover" />
                </Avatar>
                <div className="flex flex-col text-center md:text-left md:pt-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-text-strong">{teacher?.user?.name}</h1>
                    <p className="text-lg text-primary font-medium mt-1">{teacher?.headline}</p>
                    <div className="flex flex-row items-center justify-center md:justify-start gap-3 mt-4 flex-wrap">
                        {/* languages */}
                        <div className="flex flex-row text-sm text-text-weak gap-1.5 items-center bg-bg-1 px-3 py-1.5 rounded-full border border-border">
                            <Globe className="w-4 h-4 text-primary"/>
                            <span className="font-medium">{teacher?.languages?.join(", ")}</span>
                        </div>
                        {/* location */}
                        <div className="flex flex-row text-sm text-text-weak gap-1.5 items-center bg-bg-1 px-3 py-1.5 rounded-full border border-border">
                            <MapPin className="w-4 h-4 text-primary"></MapPin>
                            {teacher?.location && <span className="font-medium">{teacher?.location}</span>}
                            {!teacher?.location &&<span className="font-medium">Not specified</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* teachers details and booking availability */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* left side details */}
                <div className="flex flex-col gap-8 flex-1">
                    {/* bio */}
                    <div className="flex flex-col border border-border bg-card rounded-2xl p-6 shadow-sm gap-4">
                        <h2 className="text-xl font-bold text-text-strong">About {teacher?.user?.name.split(" ")[0]}</h2>
                        <p className="text-base text-text-weak leading-relaxed">{teacher?.bio}</p>
                    </div>

                    {/* subjects */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-text-strong">Subjects & Expertise</h2>
                        <div className="flex flex-row gap-2 flex-wrap">
                            {teacher?.subjects?.map((subject,index)=>(
                                <span key={index} className="text-sm text-text-strong font-semibold bg-card border border-border px-4 py-2 rounded-xl shadow-sm hover:border-primary/50 transition-colors">
                                    {subject}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* availability */}
                    <div className="flex flex-col gap-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-row justify-between items-center">
                            <h2 className="text-xl font-bold text-text-strong">Weekly Availability</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-text-weak uppercase tracking-wider font-semibold">Timezone:</span>
                                <span className="text-primary text-sm font-bold bg-primary/10 px-2 py-0.5 rounded">Lebanon</span>
                            </div>
                        </div> 
                        <div className="flex flex-row flex-wrap gap-4 justify-center md:justify-start">
                            {day_of_week.map((day,index)=>{
                                const day_availability=teacher?.availabilities?.find(availability=>availability.day_of_week===day);
                                let start_time="---";
                                let end_time="---";
                                if (day_availability){
                                    start_time=day_availability.start_time;
                                    end_time=day_availability.end_time;
                                }
                                
                                return (
                                    <div key={index} className="flex flex-col items-center gap-2 min-w-[100px] p-3 rounded-xl bg-bg-1 border border-border/50">
                                        <span className="text-sm text-text-strong font-bold">{day.substring(0, 3)}</span>
                                        <div className="flex flex-col gap-1.5 w-full">
                                            <span className={`text-xs font-bold rounded-lg py-1.5 text-center ${day_availability ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-text-weak'}`}>
                                                {start_time}
                                            </span>
                                            <span className={`text-xs font-bold rounded-lg py-1.5 text-center ${day_availability ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-text-weak'}`}>
                                                {end_time}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* courses taught by the teacher */}
                    <div className="flex flex-col gap-6">
                        <h2 className="text-xl font-bold text-text-strong">Courses by {teacher?.user?.name.split(" ")[0]}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teacher?.published_courses?.map((course,index)=>{
                                    return (
                                    <div 
                                        key={index}
                                        onClick={()=>handleNavigateToCourse(course.id)} 
                                        className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 ease-in-out cursor-pointer"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <img src={course.thumbnail instanceof File ? URL.createObjectURL(course.thumbnail) : course.thumbnail || ""} 
                                                alt="course image" 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">
                                                Course
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col gap-2">
                                            <h3 className="text-lg font-bold text-text-strong group-hover:text-primary transition-colors line-clamp-1">{course.title}</h3>
                                            <p className="text-sm text-text-weak line-clamp-2 leading-relaxed">{course.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* right side booking */}
                <div className="w-full lg:w-80 xl:w-96">
                    <div className="flex flex-col h-fit gap-6 bg-card border border-border rounded-2xl p-6 sticky top-20 shadow-sm">
                        {/* price */}
                        <div className="flex flex-row justify-start items-baseline gap-1">
                            <span className="text-3xl font-bold text-text-strong">${teacher?.hourly_rate}</span>
                            <span className="text-sm text-text-weak font-medium">/ hour</span>
                        </div>
                        <Separator/>
                        
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-text-weak font-bold uppercase tracking-wider text-[10px]">Session Type</p>
                            <div className="w-full bg-primary/5 p-4 rounded-xl border border-primary/20 text-primary flex flex-col justify-center items-center gap-1">
                                <User className="w-6 h-6"/>
                                <p className="font-bold">1-on-1 Session</p>
                            </div>
                        </div>
                        {/* date input */}
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-text-weak font-bold uppercase tracking-wider text-[10px]">Select Date & Time</p>
                            <Input 
                                type="datetime-local" 
                                min={new Date().toISOString()} 
                                value={selectedDate}
                                onChange={(e)=>setSelectedDate(e.target.value)}
                                aria-invalid={dateError}
                                className="w-full h-11 rounded-xl border-border focus:border-primary transition-colors"
                            />
                        </div>
                        {/* subject select */}
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-text-weak font-bold uppercase tracking-wider text-[10px]">Select Subject</p>
                            <NativeSelect
                                className="w-full"
                                value={selectedSubject}
                                onChange={(e)=>setSelectedSubject(e.target.value)}
                            >
                                <NativeSelectOption value="" disabled>Select a Subject</NativeSelectOption>
                                {
                                    teacher?.subjects?.map((subject)=>{
                                        return(
                                            <NativeSelectOption key={subject} value={subject}>
                                                {subject}
                                            </NativeSelectOption>
                                        );
                                    })
                                }
                            </NativeSelect>
                        </div>
                        {/* student note (optional) */}
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-text-weak font-bold uppercase tracking-wider text-[10px]">Student Note (optional)</p>
                            <Textarea
                                placeholder="Enter your note"
                                value={student_note}
                                onChange={(e)=>setStudentNote(e.target.value)}
                                className="w-full h-20 rounded-xl border-border focus:border-primary transition-colors resize-none"
                            />
                        </div>

                        {/* buttons */}
                        <div className="flex flex-col gap-3 pt-2">
                            <Button 
                                className="w-full h-11 cursor-pointer font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                                onClick={handleBookSession}
                                disabled={isCreatingBooking}
                            >
                                {isCreatingBooking?(
                                    <>
                                        <Spinner className="mr-2" />
                                        Booking...
                                    </>
                                ):(
                                    "Book Session"
                                )}
                            </Button>
                            <MessageButton
                                recieverUser={teacher?.user as user} 
                                variant="outline" 
                                className="w-full h-11 cursor-pointer font-bold rounded-xl hover:bg-muted transition-colors"
                            >
                                Message Teacher
                            </MessageButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;