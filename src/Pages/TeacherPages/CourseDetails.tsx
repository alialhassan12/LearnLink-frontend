import { useNavigate, useParams } from "react-router-dom";
import { useCourseStore } from "../../store/courseStore";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { ChevronDown, Eye, Pencil, Shredder, Upload, Users } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible";
import { Skeleton } from "../../components/ui/skeleton";
import CoursePreview from "../../components/teacherDashboardComponents/CoursePreview";
import { Spinner } from "../../components/ui/spinner";

const CourseDetails = () => {
    const {id}=useParams();
    const {
        courseWithMaterials,
        getCourseWithMaterialsById,
        isGettingCourseWithMaterialsById,
        changeCourseStatus,
        isChangingCourseStatus
    }=useCourseStore();

    const [openCoursePreview,setOpenCoursePreview]=useState(false);
    const navigate=useNavigate();

    useEffect(()=>{
        if(id) getCourseWithMaterialsById(Number(id));
    },[id,getCourseWithMaterialsById]);

    const cards=[
        {
            title:"Total Enrollments",
            value:courseWithMaterials?.enrollments_count,
            icon:Users
        },
    ];

    if(isGettingCourseWithMaterialsById){
        return <CourseDetailsSkeleton />
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* top section */}
            <div className="flex flex-col rounded-lg border border-border relative min-h-[200px] overflow-hidden bg-bg-1">
                <div className="h-[100px] md:h-[110px] bg-primary w-full absolute top-0 left-0 z-0"></div>
                <div className="pt-[60px] md:pt-[70px] px-4 pb-4 relative z-10 w-full">
                    <div className="flex flex-col md:flex-row gap-4 justify-between w-full items-stretch md:items-end h-full">
                        {/* title, status card */}
                        <div className="flex flex-col items-start gap-4 bg-card p-4 border border-border rounded-lg flex-1 shadow-sm">
                            <div className="flex flex-row justify-between items-start md:items-center gap-4 w-full">
                                <h2 className="text-xl md:text-2xl font-bold">{courseWithMaterials?.title}</h2>
                                {courseWithMaterials?.status==="draft" && (
                                    <span className="text-[10px] text-red-600 font-medium uppercase px-2 py-1 bg-muted backdrop-blur-sm rounded whitespace-nowrap">Draft</span>
                                )}
                                {courseWithMaterials?.status==="published" && (
                                    <span className="text-[10px] text-green-600 font-medium uppercase px-2 py-1 bg-muted backdrop-blur-sm rounded whitespace-nowrap">Published</span>
                                )}
                            </div>
                            {/* description */}
                            <div className="flex flex-col w-full">
                                <p className="text-sm text-muted-foreground overflow-hidden line-clamp-2 md:max-w-[70%]">{courseWithMaterials?.description}</p>
                            </div>
                        </div>
                        {/* buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                            <Button
                                variant="outline"
                                onClick={()=>setOpenCoursePreview(true)}
                                className="h-[48px] md:h-[100px] cursor-pointer flex items-center justify-center bg-card shadow-sm"
                            >
                                <Eye className="w-4 h-4"/> <span className="text-sm font-medium ml-2">Preview Course</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={()=>navigate(`/dashboard/my-courses/edit/${id}`)}
                                className="h-[48px] md:h-[100px] cursor-pointer flex items-center justify-center bg-card shadow-sm"
                            >
                                <Pencil className="w-4 h-4"/> <span className="text-sm font-medium ml-2">Edit Course</span>
                            </Button>
                            {
                                courseWithMaterials?.status==="draft"?(
                                    <Button
                                        variant="outline"
                                        onClick={async()=>{
                                            await changeCourseStatus("published",Number(id));
                                            navigate(-1);
                                        }}
                                        disabled={isChangingCourseStatus}
                                        className="h-[48px] md:h-[100px] cursor-pointer flex items-center justify-center bg-card shadow-sm"
                                    >
                                        {isChangingCourseStatus?
                                            <>
                                                <Spinner/> <span className="text-sm font-medium ml-2">Publishing...</span>
                                            </>
                                            :
                                            <>
                                                <Upload className="w-4 h-4"/> <span className="text-sm font-medium ml-2">Publish Course</span>
                                            </>
                                        }
                                    </Button>
                                ):(
                                    <Button
                                        variant="outline"
                                        onClick={async()=>{
                                            await changeCourseStatus("draft",Number(id));
                                            navigate(-1);
                                        }}
                                        disabled={isChangingCourseStatus}
                                        className="h-[48px] md:h-[100px] cursor-pointer flex items-center justify-center bg-card shadow-sm"
                                    >
                                        {isChangingCourseStatus?
                                            <>
                                                <Spinner/> <span className="text-sm font-medium ml-2">Unpublishing...</span>
                                            </>
                                            :
                                            <>
                                                <Shredder className="w-4 h-4"/> <span className="text-sm font-medium ml-2">Unpublish Course</span>
                                            </>
                                        }
                                    </Button>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                {cards.map((card, index)=>{
                    return(
                        <div key={index} className="flex flex-col gap-2 p-4 rounded-lg border border-border shadow-sm bg-card">
                            <div className="p-2 bg-primary/10 rounded-lg w-fit">
                                <card.icon className="w-5 h-5 text-primary"/>
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-muted-foreground">{card.title}</h2>
                                <h3 className="text-2xl font-bold">{card.value || 0}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* sections */}
            <div className="flex flex-col bg-card border border-border rounded-lg w-full overflow-hidden shadow-sm">
                {/* header */}
                <div className="flex flex-row justify-between items-center p-4 border-b border-border bg-muted/30">
                    <p className="text-base font-semibold">Course Sections</p>
                    <span className="text-sm text-muted-foreground font-medium">{courseWithMaterials?.sections?.length || 0} sections</span>
                </div>
                <div className="flex flex-col divide-y divide-border">
                    {courseWithMaterials?.sections?.map((section)=>{
                        return(
                            <Collapsible key={section.id}>
                                <CollapsibleTrigger className="w-full hover:bg-muted/50 transition-colors p-4 cursor-pointer group">
                                    <div className="flex flex-row justify-between items-center w-full">
                                        <div className="flex flex-col items-start text-left">
                                            <p className="text-sm md:text-base font-medium group-hover:text-primary transition-colors">{section.title}</p>
                                            <p className="text-muted-foreground text-xs md:text-sm mt-1">{section.materials.length} materials</p>
                                        </div>
                                        <ChevronDown className="w-5 h-5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform duration-200"/>
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="p-4 pt-0">
                                    <div className="flex flex-col gap-2 mt-4">
                                        {section.materials.map((material)=>{
                                            return(
                                                <div key={material.id} className="bg-background border border-border p-3 rounded-md flex flex-row items-center gap-3 hover:border-primary/30 transition-colors">
                                                    <div className="p-2 bg-muted rounded-md shrink-0">
                                                        <Upload className="w-4 h-4 text-muted-foreground"/>
                                                    </div>
                                                    <p className="text-sm font-medium line-clamp-1">{material.title}</p>
                                                </div>
                                            );
                                        })}
                                        {section.materials.length === 0 && (
                                            <div className="text-center p-4 text-sm text-muted-foreground border border-dashed border-border rounded-md">
                                                No materials in this section yet.
                                            </div>
                                        )}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                    {(!courseWithMaterials?.sections || courseWithMaterials?.sections.length === 0) && (
                        <div className="text-center p-8 text-muted-foreground text-sm">
                            No sections added to this course yet.
                        </div>
                    )}
                </div>
            </div>
            <CoursePreview course={courseWithMaterials} open={openCoursePreview} setOpen={setOpenCoursePreview}/>
        </div>
    );
};

const CourseDetailsSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 w-full animate-in fade-in duration-500">
            {/* Top section skeleton */}
            <div className="flex flex-col rounded-lg border border-border overflow-hidden relative min-h-[200px] bg-bg-1">
                <Skeleton className="h-[100px] md:h-[110px] w-full absolute top-0 left-0 z-0 rounded-none" />
                <div className="pt-[60px] md:pt-[70px] px-4 pb-4 relative z-10 w-full">
                    <div className="flex flex-col md:flex-row gap-4 justify-between w-full items-stretch md:items-end">
                        {/* Title, status card skeleton */}
                        <div className="flex flex-col items-start gap-4 bg-card p-4 border border-border rounded-lg flex-1 shadow-sm w-full">
                            <div className="flex flex-row justify-between items-center gap-4 w-full">
                                <Skeleton className="h-7 w-[60%] sm:w-[40%] md:w-[250px]" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <div className="flex flex-col w-full gap-2">
                                <Skeleton className="h-4 w-full md:w-[70%]" />
                                <Skeleton className="h-4 w-[80%] md:w-[50%]" />
                            </div>
                        </div>
                        {/* Buttons skeleton */}
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                            <Skeleton className="h-[48px] md:h-[100px] w-full sm:w-[140px] rounded-md" />
                            <Skeleton className="h-[48px] md:h-[100px] w-full sm:w-[140px] rounded-md" />
                            <Skeleton className="h-[48px] md:h-[100px] w-full sm:w-[160px] rounded-md" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border shadow-sm bg-card w-full">
                    <Skeleton className="w-9 h-9 rounded-lg" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-7 w-12" />
                    </div>
                </div>
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border shadow-sm bg-card w-full">
                    <Skeleton className="w-9 h-9 rounded-lg" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-7 w-12" />
                    </div>
                </div>
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border shadow-sm bg-card w-full">
                    <Skeleton className="w-9 h-9 rounded-lg" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-7 w-12" />
                    </div>
                </div>
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border shadow-sm bg-card w-full">
                    <Skeleton className="w-9 h-9 rounded-lg" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-7 w-12" />
                    </div>
                </div>
            </div>

            {/* Sections skeleton */}
            <div className="flex flex-col bg-card border border-border rounded-lg w-full shadow-sm">
                <div className="flex flex-row justify-between items-center p-4 border-b border-border bg-muted/30">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex flex-col w-full p-4 gap-3">
                    <Skeleton className="h-[72px] w-full rounded-md" />
                    <Skeleton className="h-[72px] w-full rounded-md" />
                    <Skeleton className="h-[72px] w-full rounded-md" />
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;