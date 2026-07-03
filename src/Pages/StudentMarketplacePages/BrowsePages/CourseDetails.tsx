import { useNavigate, useParams } from "react-router-dom";
import { useCourseStore } from "../../../store/courseStore";
import { useEffect } from "react";
import { Separator } from "../../../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { Bookmark, PlayCircle, Star } from "lucide-react";
import { Skeleton } from "../../../components/ui/skeleton";
import { useCourseEnrollmentStore } from "../../../store/studentmarketplaceStores/courseEnrollmentStore";
import useAuthStore from "../../../store/authStore";
import { toast } from "sonner";
import { Spinner } from "../../../components/ui/spinner";

const CourseDetails=()=>{
    const {id}=useParams();
    const {authUser}=useAuthStore();
    const {course,getCourseById,isGettingCourseById}=useCourseStore();
    const {enroll,isEnrolling,enrolledCoursesIds}=useCourseEnrollmentStore();
    const navigate=useNavigate();

    useEffect(()=>{
        if(id){
            getCourseById(Number(id));
        }
    },[id]);

    const handleEnroll=()=>{
        if(!authUser){
            toast.error("Unauthenticated");
            return;
        }
        if(authUser.role!=="student"){
            toast.error("Unauthorized Access");
            return;
        }
        enroll(Number(id));
    }

    if(isGettingCourseById){
        return <CourseDetailsSkeleton />;
    }

    return (
        <div className="px-4 py-8 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* left course details */}
                <div className="flex flex-col gap-9 w-full lg:w-[65%]">
                    {/* basic info */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <span className="text-xs uppercase px-3 py-1 bg-primary/10 rounded-full tracking-wide font-bold text-primary">{course?.category?.title}</span>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-text-strong">{course?.title}</h1>
                        </div>
                    </div>
                    <Separator />
                    {/* about course */}
                    <div className="flex flex-col gap-4">
                        <h1 className="text-2xl font-bold text-text-strong">About this course</h1>
                        <p className="text-text-weak font-medium border border-border rounded-xl p-5 bg-card/50 leading-relaxed shadow-sm">
                            {course?.description}
                        </p>
                    </div>
                    {/* course sections */}
                    <div className="flex flex-col gap-4">
                        <h1 className="text-2xl font-bold text-text-strong">Course Sections</h1>
                        <div className="flex flex-col gap-3">
                            {course?.sections?.map((section, index)=>{
                                return(
                                    <div key={section.id} className="flex flex-row gap-4 p-4 items-center bg-card border border-border rounded-xl shadow-sm hover:border-primary/30 hover:shadow-md transition-all">
                                        <div className="bg-primary/10 text-primary p-3 rounded-full flex-shrink-0">
                                            <PlayCircle size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="font-semibold text-lg text-text-strong">Section {index + 1}: {section.title}</h2>
                                        </div>
                                        <div className="text-sm text-text-weak font-medium px-3 py-1 bg-bg-2 rounded-full hidden sm:block">
                                            set of materials
                                        </div>
                                    </div>
                                );
                            })}
                            {(!course?.sections || course.sections.length === 0) && (
                                <p className="text-text-weak text-sm italic">No sections available for this course yet.</p>
                            )}
                        </div>
                    </div>
                    {/* instructor */}
                    <div className="flex flex-col gap-4">
                        <h1 className="text-2xl font-bold text-text-strong">Instructor</h1>
                        <div className="flex flex-col sm:flex-row gap-5 p-5 bg-card border border-border rounded-xl shadow-sm items-start sm:items-center">
                            <Avatar className="w-20 h-20 border-2 border-border flex-shrink-0">
                                <AvatarFallback className="text-xl font-bold">
                                    {course?.teacher?.user?.name?.[0]}
                                </AvatarFallback>
                                <AvatarImage src={course?.teacher?.user?.avatar_url}/>
                            </Avatar>
                            <div className="flex flex-col gap-2 flex-1">
                                <div >
                                    <p className="font-bold text-lg text-text-strong">{course?.teacher?.user?.name}</p>
                                    <p className="text-primary font-medium text-sm ">{course?.teacher?.headline}</p>
                                </div>
                                <p className="text-text-weak text-sm sm:text-base line-clamp-2">{course?.teacher?.bio}</p>
                            </div>
                            <div className="flex flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
                                <Button variant="outline" className="w-full sm:w-auto cursor-pointer hover:bg-primary/90 hover:scale-105 transition-all" onClick={()=>navigate(`/marketplace/browse/teachers/${course?.teacher_id}`)}>
                                    View Profile
                                </Button>
                                <Button className="w-full sm:w-auto cursor-pointer hover:bg-primary/90 hover:scale-105 transition-all">
                                    Book Session
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* right course card */}
                <div className="w-full lg:w-[30%] lg:sticky lg:top-24 mt-8 lg:mt-0">
                    <div className="flex flex-col gap-5 bg-card p-5 border border-border rounded-xl shadow-lg">
                        <div className="w-full rounded-xl overflow-hidden bg-bg-1 aspect-video">
                            <img src={course?.thumbnail_url} className="w-full h-full object-cover" alt="Course Thumbnail" />
                        </div>
                        {/* price */}
                        <div>
                            <h1 className="text-3xl font-bold text-text-strong">${course?.price}</h1>
                        </div>
                        {/* rating */}
                        {(course?.course_reviews_avg_rating && course?.course_reviews_count) && (
                            <div className="flex items-center gap-1">
                                <Star size={15} className="text-yellow-500"/>
                                <span className="text-yellow-500 text-sm font-semibold ">{Number(course.course_reviews_avg_rating).toFixed(1)}</span>
                                <span className="text-sm text-text-weak">({course.course_reviews_count} reviews)</span>
                            </div>
                        )}
                        {(!course?.course_reviews_avg_rating && !course?.course_reviews_count) && (
                            <div className="flex items-center gap-1">
                                <Star size={15} className="text-yellow-500"/>
                                <span className="text-yellow-500 text-sm font-semibold ">0</span>
                                <span className="text-sm text-text-weak">No reviews yet</span>
                            </div>
                        )}
                        {/* buttons */}
                        <div className="flex flex-col gap-3">
                            {enrolledCoursesIds.includes(Number(id))
                                ?(
                                    <Button 
                                        onClick={()=>navigate(`/marketplace/learnings/course/${course?.id}`)}
                                        className="w-full py-6 text-base font-bold hover:scale-105 hover:bg-primary/80 active:scale-95 cursor-pointer"
                                    >
                                        Go to Course
                                    </Button>
                                )
                                :(
                                    <Button 
                                        className="w-full py-6 text-base font-bold hover:scale-105 hover:bg-primary/80 active:scale-95 cursor-pointer"
                                        disabled={isEnrolling}
                                        onClick={handleEnroll}
                                    >
                                        {isEnrolling ? <>
                                            <Spinner/>
                                            <span>Enrolling...</span>
                                            </>:"Enroll Now"
                                        }
                                    </Button>
                                )
                            }
                            <Button variant="outline" className="w-full py-6 text-base font-semibold hover:scale-105 hover:bg-primary/10 cursor-pointer text-text-strong"><Bookmark className="mr-2 h-5 w-5" /> Save Course</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CourseDetailsSkeleton=()=>{
    return (
        <div className="px-4 py-8 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Left Side */}
                <div className="flex flex-col gap-9 w-full lg:w-[65%]">
                    {/* Basic Info */}
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-10 w-1/2" />
                        </div>
                    </div>
                    
                    <Separator />
                    
                    {/* About Course */}
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                    
                    {/* Course Sections */}
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-8 w-48" />
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                    
                    {/* Instructor */}
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-44 sm:h-32 w-full rounded-xl" />
                    </div>
                </div>

                {/* Right Side (Sticky Card) */}
                <div className="w-full lg:w-[30%] lg:sticky lg:top-24 mt-8 lg:mt-0">
                    <div className="flex flex-col gap-5 bg-card p-5 border border-border rounded-xl shadow-lg">
                        <Skeleton className="w-full aspect-video rounded-xl" />
                        <Skeleton className="h-10 w-24" />
                        <div className="flex flex-col gap-3 mt-2">
                            <Skeleton className="h-12 w-full rounded-md" />
                            <Skeleton className="h-12 w-full rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;