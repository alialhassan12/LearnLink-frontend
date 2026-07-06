import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import { Progress } from "../../components/ui/progress";
import CreateCourseStep1 from "../../components/teacherDashboardComponents/createCourseSteps/CreateCourseStep1";
import useCreateCourseStore from "../../store/createCourseStore";
import { toast } from "sonner";
import CreateCourseStep2 from "../../components/teacherDashboardComponents/createCourseSteps/CreateCourseStep2";
import CreateCourseStep3 from "../../components/teacherDashboardComponents/createCourseSteps/CreateCourseStep3";
import { useNavigate } from "react-router-dom";
import { useCourseStore } from "../../store/courseStore";
import { Spinner } from "../../components/ui/spinner";


const CreateCourse=()=>{
    const [stepProgress,setStepProgress]=useState<number>(10);
    const {courseData,courseSections,clearCourseAndSectionData}=useCreateCourseStore();
    const {isSavingDraft,saveDraftCourse}=useCourseStore();
    const navigate=useNavigate();

    const handleNextStep=()=>{  
        if(stepProgress===10){
            if(!courseData.title || courseData.category_id==0 || !courseData.language || !courseData.description){
                toast.error("Please fill all the course basic info fields");
                return;
            }
            setStepProgress(50);
        }
        if(stepProgress===50){
            if(courseSections.length===0){
                toast.error("Please add at least one section");
                return;
            }
            setStepProgress(100);
        }
    }
    const handlePreviousStep=()=>{
        if(stepProgress===50){
            setStepProgress(10);
        }else if(stepProgress===100){
            setStepProgress(50);
        }
    }

    const handleSaveDraft=async()=>{
        const data={
            "category_id":Number(courseData?.category_id || 0),
            "title":courseData?.title || "untitled-course",
            "description":courseData?.description || "",
            "thumbnail":courseData?.thumbnail,
            "language":courseData?.language || "",
            "price":Number(courseData?.price || 0),
            "sections":courseSections?.map(section=>{
                return({
                    "title":section?.title,
                    "order":Number(section?.order),
                    "materials":section?.files?.map(file=>{
                        return({
                            "file":file?.file,
                            "type":file?.type,
                            "size":file?.size,
                            "title":file?.title
                        });
                    })
                });
            })
        };
        const saved=await saveDraftCourse(data);
        if(saved){
            clearCourseAndSectionData();
            navigate("/dashboard/my-courses");
        }
    }

    return(
        <div>
            {/* top section */}
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col ">
                    <p className="text-sm text-primary tracking-widest">COURSE BUILDER</p>
                    <p className="text-4xl font-bold text-text-strong">Create New Course</p>
                </div>
                <div>
                    <Button
                        disabled={isSavingDraft}
                        onClick={handleSaveDraft}
                        variant="outline" 
                        className="px-4 h-10 cursor-pointer border-primary">
                        {isSavingDraft 
                            ?   
                            <div className="flex items-center gap-2">
                                <Spinner/>
                                <p>Saving Draft ...</p>
                            </div>
                            :
                            "Save Draft"
                        }
                    </Button>
                </div>
            </div>

            {/* body section */}
            <div className="">
                {/* progress bar of the steps */}
                <div className="lg:w-1/2 mt-4 mx-auto sm:w-full sticky top-15 z-10 bg-bg-1/50 backdrop-blur-xl rounded-xl p-4">
                    <Progress value={stepProgress}  />
                    <div className="flex justify-between mt-2">
                        <div className="flex flex-col items-center translate-y-[-50%] gap-1">
                            <span className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm ${stepProgress >= 10 ? "bg-primary text-white" : "bg-border"} transition-colors duration-200 ease-in-out`}>
                                1
                            </span>
                            <p className={`text-xs font-medium ${stepProgress >= 10 ? "text-primary" : "text-text-weak"} transition-colors duration-200 ease-in-out`}>Basic Info</p>
                        </div>
                        <div className="flex flex-col items-center translate-y-[-50%] gap-1">
                            <span className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm ${stepProgress >= 50 ? "bg-primary text-white" : "bg-border"} transition-colors duration-200 ease-in-out`}>
                                2
                            </span>
                            <p className={`text-xs font-medium ${stepProgress >= 50 ? "text-primary" : "text-text-weak"} transition-colors duration-200 ease-in-out`}>Course Content</p>
                        </div>
                        <div className="flex flex-col items-center translate-y-[-50%] gap-1">
                            <span className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm ${stepProgress >= 100 ? "bg-primary text-white" : "bg-border"} `}>
                                3
                            </span>
                            <p className={`text-xs font-medium ${stepProgress >= 100 ? "text-primary" : "text-text-weak"}`}>Publish Course</p>
                        </div>
                    </div>
                </div>

                {/* content of steps */}
                {/* step1: basic info of course */}
                {
                    stepProgress===10 && (
                        <CreateCourseStep1/>
                    )
                }

                {/* step2: course content */}
                {
                    stepProgress===50 && (
                        <CreateCourseStep2/>
                    )
                }

                {/* step3: publish course */}
                {
                    stepProgress===100 && (
                        <CreateCourseStep3/>
                    )
                }
            </div>

            {/* bottom section */}
            <div className="flex justify-between items-center border-t border-border py-4 sticky bottom-0 z-50 bg-bg-1/50 backdrop-blur-xl">
                <Button
                    onClick={()=>{
                        clearCourseAndSectionData();
                        window.history.back();
                    }}
                    className="px-4 h-10 cursor-pointer" 
                    variant="outline"
                >
                    <X/>
                    Discard
                </Button>
                <div className="flex flex-row gap-2">
                    <Button 
                        onClick={handlePreviousStep}
                        disabled={stepProgress===10}
                        className="px-4 h-10 cursor-pointer"
                        variant="outline"
                    >
                        <ChevronLeft/>
                        Previous
                    </Button>
                    <Button 
                        onClick={handleNextStep}
                        className="px-4 h-10 cursor-pointer bg-primary hover:bg-primary/80"
                        variant="default"
                        disabled={stepProgress===100}
                        >
                        Next
                        <ChevronRight/>
                    </Button>
                </div>
            </div>
        </div>
    );
};  
export default CreateCourse;