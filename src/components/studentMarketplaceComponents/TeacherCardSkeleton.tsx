import { Skeleton } from "../ui/skeleton";

const TeacherCardSkeleton = () => (
    <div className="flex flex-col gap-6 bg-card border border-border rounded-2xl p-5">
        <Skeleton className="w-full h-48 rounded-xl shrink-0" />
        <div className="flex flex-col flex-1 gap-4 py-2">
            <div className="flex justify-between items-start">
                <div className="space-y-2 w-full max-w-[200px]">
                    <Skeleton className="h-6 w-full rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                </div>
                <Skeleton className="h-6 w-20 rounded hidden sm:block" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex gap-3 mt-auto">
                <Skeleton className="h-11 flex-1 rounded-xl" />
                <Skeleton className="h-11 flex-1 rounded-xl" />
            </div>
        </div>
    </div>
);

export default TeacherCardSkeleton;