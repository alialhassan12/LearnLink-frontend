import { CheckCircle } from "lucide-react";

const ProTeacherBadge = () => {
    return (
        <div className="flex flex-row gap-1 justify-center items-center absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-md text-xs font-bold shadow-md z-10">
            <CheckCircle className="h-3 w-3 text-white" />
            <span>Pro Teacher</span>
        </div>
    );
};

export default ProTeacherBadge;