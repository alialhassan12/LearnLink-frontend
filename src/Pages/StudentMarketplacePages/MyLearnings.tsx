import { BookOpenCheck, BookOpenText, Search, SquarePlay } from "lucide-react";
import { useCourseEnrollmentStore } from "../../store/studentmarketplaceStores/courseEnrollmentStore";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../components/ui/pagination";

const MyLearnings = () => {
    const { getEnrollments, enrollments, isGettingEnrollments, enrollmentsPagination } = useCourseEnrollmentStore();
    const [filterTab, setFilterTab] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const navigate=useNavigate();

    useEffect(() => {
        getEnrollments();
    }, [getEnrollments]);

    const cards = [
        {
            id: 0,
            title: "Course Enrolled",
            value: enrollments?.length || 0
        },
        {
            id: 1,
            title: "Course Completed",
            value: enrollments?.filter((enrollment) => enrollment.progress === 100)?.length || 0
        }
    ];

    const filteredEnrollments = enrollments?.filter((enrollment) => {
        const matchesTab = (() => {
            if (filterTab === "all") return true;
            if (filterTab === "in_progress") return (enrollment.progress || 0) < 100;
            if (filterTab === "completed") return (enrollment.progress || 0) === 100;
            return false;
        })();

        const title = enrollment.course?.title || "";
        const teacherName = enrollment.course?.teacher?.user?.name || "";
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            teacherName.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    }) || [];

    if (isGettingEnrollments) {
        return <MyLearningsSkeleton />
    }

    return (
        <div className="px-4 py-4">
            {/* title */}
            <div className="flex flex-col gap-2 justify-start items-start">
                <h1 className="text-3xl font-bold text-text-strong">My Learnings</h1>
                <p className="text-text-weak">Continue your courses and track your progress.</p>
            </div>

            {/* cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {cards.map((card) => {
                    return (
                        <div key={card.id} className="flex flex-row justify-start items-center bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-300 hover:border-primary/20 hover:-translate-y-0.5">
                            {card.id === 0 && (
                                <div className="flex justify-center items-center bg-primary/10 rounded-full p-4 text-primary">
                                    <BookOpenText size={35} />
                                </div>
                            )}
                            {card.id === 1 && (
                                <div className="flex justify-center items-center bg-green-600/10 rounded-full p-4 text-green-600">
                                    <BookOpenCheck size={35} />
                                </div>
                            )}
                            <div className="ml-4">
                                <p className="text-xl font-bold text-text-strong">{card.value}</p>
                                <h2 className="text-sm text-text-weak">{card.title}</h2>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* filter tabs and search bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center w-full mt-10">
                <Tabs defaultValue={filterTab} onValueChange={(value) => setFilterTab(value)}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                </Tabs>
                
                {/* search bar */}
                <div className="relative flex flex-row gap-2 w-full md:w-72 lg:w-80">
                    <Input
                        type="text"
                        placeholder="Search by course or instructor"
                        className="h-10 w-full pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Search size={15} className="text-text-weak" />
                    </div>
                </div>
            </div>

            {/* enrollments cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex flex-col justify-start items-center bg-card border border-border rounded-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:border-primary/20 hover:-translate-y-1">
                        <img
                            src={enrollment.course?.thumbnail_url || ''}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            alt={enrollment.course?.title || "Course thumbnail"}
                        />
                        <div className="flex flex-col gap-2 p-4 w-full">
                            {/* teacher */}
                            <div className="flex items-center gap-2">
                                <Avatar>
                                    <AvatarImage src={enrollment.course?.teacher?.user?.avatar_url || undefined} />
                                    <AvatarFallback>{enrollment.course?.teacher?.user?.name?.charAt(0).toUpperCase() || 'C'}</AvatarFallback>
                                </Avatar>
                                <p className="text-text-weak">Dr. {enrollment.course?.teacher?.user?.name || 'Instructor'}</p>
                            </div>
                            {/* title */}
                            <h2 className="text-lg font-bold text-text-strong">{enrollment.course?.title}</h2>
                            {/* progress bar */}
                            <div className="w-full h-2 bg-border rounded-full">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-300"
                                    style={{ width: `${enrollment.progress || 0}%` }}
                                />
                            </div>
                            {/* progress percentage */}
                            <p className="text-sm text-text-weak">{enrollment.progress || 0}%</p>

                            <Button 
                                className="w-full mt-2 cursor-pointer hover:scale-105 transition-transform duration-300" size="lg"
                                onClick={()=>navigate(`/marketplace/learnings/course/${enrollment.course_id}`)}
                            >
                                {enrollment.progress === 100 ? 'View Course' : 'Continue Learning'}
                                <SquarePlay />
                            </Button>
                        </div>
                    </div>
                ))}
                {filteredEnrollments.length === 0 && (
                    <div className="col-span-full flex flex-col justify-center items-center w-full h-60 border-dashed border-border border-2 rounded-lg">
                        <p className="text-lg text-text-weak text-center px-4">
                            {searchQuery ? (
                                `No courses matching "${searchQuery}" found!`
                            ) : (
                                <>
                                    {filterTab === "all" && "No enrollments found!"}
                                    {filterTab === "in_progress" && "No in progress courses found!"}
                                    {filterTab === "completed" && "No completed courses found!"}
                                </>
                            )}
                        </p>
                    </div>
                )}
            </div>

            {enrollmentsPagination && enrollmentsPagination.last_page > 1 && (
                <Pagination className="mt-8">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                size={"lg"}
                                onClick={() => {
                                    if (enrollmentsPagination.current_page > 1) {
                                        getEnrollments(enrollmentsPagination.current_page - 1);
                                    }
                                }}
                                className={`${enrollmentsPagination.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                            />
                        </PaginationItem>
                        {Array.from({ length: enrollmentsPagination.last_page }).map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    size={"lg"}
                                    onClick={() => getEnrollments(i + 1)}
                                    isActive={enrollmentsPagination.current_page === i + 1}
                                    className="cursor-pointer"
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext 
                                size={"lg"}
                                onClick={() => {
                                    if (enrollmentsPagination.current_page < enrollmentsPagination.last_page) {
                                        getEnrollments(enrollmentsPagination.current_page + 1);
                                    }
                                }}
                                className={`${enrollmentsPagination.current_page === enrollmentsPagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

const MyLearningsSkeleton = () => {
    return (
        <div className="px-4 py-4 animate-pulse">
            {/* title skeleton */}
            <div className="flex flex-col gap-2 justify-start items-start">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-80" />
            </div>

            {/* cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {[1, 2].map((id) => (
                    <div key={id} className="flex flex-row justify-start items-center bg-card border border-border rounded-lg p-6">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="ml-4 flex-1">
                            <Skeleton className="h-6 w-12 rounded" />
                            <Skeleton className="h-4 w-28 rounded mt-2" />
                        </div>
                    </div>
                ))}
            </div>

            {/* filter tabs and search bar skeleton */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center w-full mt-10">
                <Skeleton className="h-10 w-80 rounded-md" />
                <Skeleton className="h-10 w-full md:w-72 lg:w-80 rounded-md" />
            </div>

            {/* enrollments cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {[1, 2, 3].map((id) => (
                    <div key={id} className="flex flex-col justify-start items-center bg-card border border-border rounded-lg overflow-hidden">
                        {/* thumbnail skeleton */}
                        <Skeleton className="w-full h-48" />
                        <div className="flex flex-col gap-3 p-4 w-full">
                            {/* teacher skeleton */}
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-32 rounded" />
                            </div>
                            {/* title skeleton */}
                            <Skeleton className="h-6 w-3/4 rounded mt-1" />
                            {/* progress bar skeleton */}
                            <div className="space-y-2 mt-1 w-full">
                                <Skeleton className="h-2 w-full rounded-full" />
                                <Skeleton className="h-4 w-8 rounded" />
                            </div>
                            {/* button skeleton */}
                            <Skeleton className="h-11 w-full rounded-md mt-2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyLearnings;