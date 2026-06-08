import { ArrowLeft, Home, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCourseStore } from "../../store/courseStore";

const publishedSuccessful = () => {
    const {newCourse}=useCourseStore();
    const navigate=useNavigate();
    return (
        <div className="flex justify-center items-center h-[90vh]">
            <div className="flex flex-col w-[60%] border border-border bg-card justify-center p-10 rounded-lg  items-center gap-3">
                {/* icon */}
                <div className="p-4 bg-primary/20 rounded-full">
                    <Sparkles size={30} className="text-primary"/>
                </div>
                {/* text */}
                <div className="text-center my-5">
                    <p className="text-xl font-semibold text-text-strong ">Congratulations!</p>
                    <p className="text-text-weak leading-relaxed">
                        Your course <span className="text-primary font-bold">"{newCourse?.title}" </span>
                        is now live and ready for students to enroll
                    </p>
                </div>
                <div className="flex flex-row gap-2">
                    <Button className="h-10 px-4 hover:bg-primary/80 cursor-pointer" onClick={()=>navigate('/dashboard/my-courses')}>
                        <ArrowLeft size={20}/> <span className="font-medium"> Back to Dashboard</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default publishedSuccessful;