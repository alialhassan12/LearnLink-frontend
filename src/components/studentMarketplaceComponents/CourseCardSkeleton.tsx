import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

const CourseCardSkeleton = () => {
    return (
        <div className="flex flex-col rounded-xl overflow-hidden border border-border">
            {/* course image */}
            <Skeleton className="w-full aspect-video rounded-none" />
            
            {/* course info */}
            <div className="flex flex-col gap-2 p-4">
                {/* Category */}
                <Skeleton className="h-3 w-16" />
                
                {/* Title */}
                <div className="space-y-1.5 py-1">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                </div>
                
                {/* Teacher */}
                <div className="flex items-center gap-2 mt-1">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-24" />
                </div>

                <Separator className="my-1"/>
                
                {/* Footer (Price & Button) */}
                <div className="flex flex-row justify-between items-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                </div>
            </div>
        </div>
    );
};

export default CourseCardSkeleton;