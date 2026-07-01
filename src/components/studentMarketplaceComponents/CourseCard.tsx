import { ArrowRight, Star } from "lucide-react";
import type { Course } from "../../@types/course";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useNavigate } from "react-router-dom";
import { useCourseEnrollmentStore } from "../../store/studentmarketplaceStores/courseEnrollmentStore";

const CourseCard=({course}:{course:Course})=>{
    const {enrolledCoursesIds}=useCourseEnrollmentStore();
    const navigate=useNavigate();
    

    return (
        <div className="flex flex-col rounded-xl overflow-hidden border border-border hover:shadow-lg hover:-translate-y-[4px] hover:shadow-primary/10 hover:border-primary/30 hover:duration-300 transition-all">
            {/* course image */}
            <div className="w-full bg-bg-1 overflow-hidden">
                {course.thumbnail_url?(
                    <img src={course.thumbnail_url} className="object-cover"/>
                ):(
                    <div className="flex items-center justify-center h-full text-text-weak">
                        No Thumbnail
                    </div>
                )}
            </div>
            {/* course info */}
            <div className="flex flex-col gap-2 p-4">
                <span className="text-[10px] text-primary uppercase font-medium tracking-wider">{course.category?.title}</span>
                <p className="text-text-strong line-clamp-2 text-base font-medium">{course.title}</p>
                <div className="flex items-center gap-1 mt-2">
                    <Star size={12} className="text-yellow-500"/>
                    <span className="text-yellow-500 text-xs font-semibold ">{Number(course.course_reviews_avg_rating).toFixed(1)}</span>
                    <span className="text-xs text-text-weak">({course.course_reviews_count} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarFallback>{course.teacher?.user?.name?.charAt(0)}</AvatarFallback>
                        <AvatarImage src={course.teacher?.user?.avatar_url}/>
                    </Avatar>
                    <span className="text-sm text-text-strong">{course.teacher?.user?.name}</span>
                </div>

                <Separator/>
                <div className="flex flex-row justify-between items-center">
                    <p className="text-lg font-semibold text-primary">${course.price}</p>
                    {enrolledCoursesIds.includes(course.id ?? 0) ? (
                        <Button
                            size="sm"
                            className="rounded-full bg-primary hover:bg-primary/80 text-white font-medium cursor-pointer"
                            onClick={()=>navigate(`/marketplace/learnings/course/${course.id}`)}
                        >
                            Go to Course
                        </Button>
                    ) : (
                        <Button
                            onClick={() => navigate(`/marketplace/browse/courses/${course.id}`)}
                            size="icon"
                            className="rounded-full bg-primary hover:bg-primary/80 text-white font-medium cursor-pointer"
                        >
                            <ArrowRight />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseCard;