import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { FileX, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useEffect, useState} from "react";
import { useCourseStore } from "../../store/courseStore";
import { Separator } from "../../components/ui/separator";
import { Skeleton } from "../../components/ui/skeleton";

const MyCourses=()=>{
    const {teacherCourses,getTeacherCourses,isGettingTeacherCourses,maxCoursesAllowed}=useCourseStore();
    const [filterTabs,setFilterTabs]=useState<string>("all");
    const navigate=useNavigate();

    useEffect(()=>{
        getTeacherCourses();
    },[getTeacherCourses]);

    const coursesPublishedCount=teacherCourses.filter((course)=>course.status==="published").length;

    const filteredCourses=filterTabs==="all"? teacherCourses : teacherCourses.filter((course)=>course.status===filterTabs);

    return(
        <div className="flex flex-col gap-5">
            {/* top section */}
            <div className="flex flex-row justify-between items-center">
                <div>
                    <p className="text-2xl font-medium text-text-strong">My Courses</p>
                    <p className="text-sm text-text-weak">Manage, edit, and track the performance of your educational content.</p>
                </div>
                    <Link to="/dashboard/my-courses/create" className="flex flex-row items-center gap-2">
                        <Button className="h-10 px-4 hover:bg-primary/80 cursor-pointer">
                            <Plus /> <span className="font-medium">Create Course</span>
                        </Button>
                    </Link>
            </div>
            {/* filter section */}
            <div className="py-1">
                <Tabs defaultValue={filterTabs} onValueChange={(value)=>setFilterTabs(value)} className="flex flex-col gap-3">
                    <TabsList className="w-full md:w-[50%] lg:w-[30%]">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="published">Published</TabsTrigger>
                        <TabsTrigger value="draft">Draft</TabsTrigger>
                    </TabsList>
                    {
                        isGettingTeacherCourses?(
                            <Skeleton className="h-5 w-32" />
                        ):(
                            <p className="text-sm text-text-weak">
                                {coursesPublishedCount}/{maxCoursesAllowed===-1?"Unlimited":maxCoursesAllowed} courses published
                                {coursesPublishedCount>=maxCoursesAllowed && maxCoursesAllowed!==-1 && (
                                    <span className="text-red-500  line-clamp-2">Upgrade your subscription to publish more courses. You can still save courses as draft.</span>
                                )}
                            </p>
                        )
                    }
                    {/* courses section */}
                    <div className="border-t border-border pt-4">
                        {isGettingTeacherCourses ? (
                            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4">
                                {[...Array(4)].map((_, index) => (
                                    <div key={index} className="flex flex-col rounded-lg overflow-hidden bg-card border border-border/50">
                                        <Skeleton className="aspect-video w-full rounded-none" />
                                        <div className="flex flex-col gap-3 p-4">
                                            <div className="flex flex-col gap-2">
                                                <Skeleton className="h-6 w-3/4" />
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-2/3" />
                                            </div>
                                            <Separator orientation="horizontal" />
                                            <div className="flex flex-col gap-2">
                                                <Skeleton className="h-4 w-1/3" />
                                                <Skeleton className="h-4 w-1/4" />
                                            </div>
                                            <div className="flex flex-row justify-between items-center pt-2">
                                                <Skeleton className="h-10 w-24 rounded-md" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4">
                                {filteredCourses.map((course)=>(
                                    <div 
                                        key={course.id} 
                                        className="flex flex-col relative rounded-lg overflow-hidden bg-card hover:scale-105 hover:border hover:border-primary/50 transition-all duration-300 ease-in-out"
                                    >
                                        {/* thumbnail section */}
                                        <div className="aspect-video w-full overflow-hidden">
                                            <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                                        </div>
                                        {/* course title and description section */}
                                        <div className="flex flex-col gap-3 p-4">
                                            <div>
                                                <p className="text-lg font-medium text-text-strong">{course.title}</p>
                                                <p className="text-sm text-text-weak line-clamp-2">{course.description}</p>
                                            </div>
                                            <Separator orientation="horizontal"/>
                                            {/* language and price section */}
                                            <div>
                                                <p className="text-sm text-text-weak">{course.language}</p>
                                                <p className="text-sm text-text-weak">{course.price}</p>
                                            </div>

                                            {/* status button and edit course button section */}
                                            <div className="flex flex-row justify-between items-center">
                                                <Button  
                                                    className="h-10 px-4 hover:bg-primary/80 cursor-pointer"
                                                    onClick={()=>navigate(`/dashboard/my-courses/view/${course.id}`)}
                                                >
                                                    View Course
                                                </Button>
                                            </div>
                                        </div>
                                        {/* badge */}
                                        <div className="absolute top-2 right-2 ">
                                            {course.status==="draft" && (
                                                <span className="text-[10px] text-red-600 font-medium uppercase px-2 py-1 backdrop-blur-sm rounded">Draft</span>
                                            )}
                                            {course.status==="published" && (
                                                <span className="text-[10px] text-green-600 font-medium uppercase px-2 py-1 backdrop-blur-sm rounded">Published</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!isGettingTeacherCourses && filteredCourses.length === 0 && (
                            <div className="flex items-center justify-center py-10 w-full border border-dashed border-border rounded-lg">
                                <div className="flex flex-col gap-2 items-center justify-center">
                                    <FileX className="h-10 w-10 text-text-weak" />
                                    <p className="text-text-weak text-center font-medium">No courses Found</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Tabs>
            </div>
            
        </div>
    );
};
export default MyCourses;