import { useEffect, useState } from "react";
import { useAdminStore } from "../../store/adminDashboardStores/adminStore";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../../components/ui/pagination";
import { Spinner } from "../../components/ui/spinner";
import {
    Search,
    BookOpen,
    MoreVertical,
    Eye,
    EyeOff,
    Globe2,
    Star,
    Users,
} from "lucide-react";

const getPageNumbers = (current: number, last: number) => {
    const pages: (number | string)[] = [];
    if (last <= 5) {
        for (let i = 1; i <= last; i++) pages.push(i);
    } else {
        if (current <= 3) {
            pages.push(1, 2, 3, "...", last);
        } else if (current >= last - 2) {
            pages.push(1, "...", last - 2, last - 1, last);
        } else {
            pages.push(1, "...", current - 1, current, current + 1, "...", last);
        }
    }
    return pages;
};

const Courses = () => {
    const {
        courses,
        coursePaginationData,
        isGettingCourses,
        getCourses,
        changeCourseStatus,
        isChangingCourseStatus,
    } = useAdminStore();

    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    useEffect(() => {
        getCourses();
    }, [getCourses]);

    const filteredCourses = (courses || []).filter((course) => {
        const q = searchInput.trim().toLowerCase();
        const matchesSearch =
            !q ||
            course.title.toLowerCase().includes(q) ||
            (course.teacher?.user?.name ?? "").toLowerCase().includes(q) ||
            (course.category?.title ?? "").toLowerCase().includes(q);
        const matchesStatus =
            statusFilter === "all" || course.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const {
        current_page = 1,
        last_page = 1,
        from = 0,
        to = 0,
        total = 0,
    } = coursePaginationData ?? {};

    const pageNumbers = getPageNumbers(current_page, last_page);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= last_page) getCourses(page);
    };

    const handleStatusToggle = async (courseId: number, currentStatus: string) => {
        setSelectedCourseId(courseId);
        const newStatus = currentStatus === "published" ? "draft" : "published";
        await changeCourseStatus(courseId, newStatus);
        setSelectedCourseId(null);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
                    <p className="text-3xl text-text-strong font-extrabold">Course Management</p>
                    <p className="text-text-weak">Review, monitor, and control all courses on the platform.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-row items-center justify-between gap-3 border border-border rounded-2xl p-2 bg-card/30 flex-wrap">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-weak" />
                    <Input
                        placeholder="Search courses, teachers..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full border-none pl-9 focus-visible:ring-0"
                    />
                </div>
                <div className="flex items-center gap-2 pr-1">
                    {(["all", "published", "draft"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 cursor-pointer ${
                                statusFilter === s
                                    ? "bg-primary text-white shadow-md"
                                    : "text-text-weak hover:bg-neutral-800/30"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="w-full border border-border/80 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-border/80">
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">Course</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">Teacher</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">Category</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4 text-center">Enrollments</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4 text-center">Rating</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">Status</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {isGettingCourses ? (
                                <CoursesTableSkeleton />
                            ) : filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-16 text-text-weak font-medium">
                                        <div className="flex flex-col items-center gap-3">
                                            <BookOpen className="w-10 h-10 opacity-30" />
                                            <span>No courses found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCourses.map((course) => {
                                    const rating = course.course_reviews_avg_rating
                                        ? Number(course.course_reviews_avg_rating).toFixed(1)
                                        : null;
                                    const reviewCount = course.course_reviews_count ?? 0;
                                    const enrollments = course.enrollments_count ?? 0;
                                    const teacherName = course.teacher?.user?.name ?? "—";
                                    const categoryName = course.category?.title ?? "—";
                                    const isPublished = course.status === "published";
                                    const isBusy = selectedCourseId === course.id && isChangingCourseStatus;

                                    return (
                                        <tr
                                            key={course.id}
                                            className="hover:bg-gray-900/5 transition-colors duration-150"
                                        >
                                            {/* COURSE */}
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-800/40 border border-border/30">
                                                        {course.thumbnail_url ? (
                                                            <img
                                                                src={course.thumbnail_url}
                                                                alt={course.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <BookOpen className="w-5 h-5 text-text-weak" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col max-w-[200px]">
                                                        <span className="font-semibold text-sm text-text-strong leading-tight line-clamp-1">
                                                            {course.title}
                                                        </span>
                                                        <span className="text-xs text-text-weak mt-0.5 flex items-center gap-1">
                                                            <Globe2 className="w-3 h-3" />
                                                            {course.language}
                                                            <span className="mx-1">·</span>
                                                            ${Number(course.price).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* TEACHER */}
                                            <td className="px-6 py-4 align-middle">
                                                <span className="text-sm text-text-strong font-medium">{teacherName}</span>
                                            </td>

                                            {/* CATEGORY */}
                                            <td className="px-6 py-4 align-middle">
                                                <span className="inline-flex items-center text-[10px] tracking-wider uppercase font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                    {categoryName}
                                                </span>
                                            </td>

                                            {/* ENROLLMENTS */}
                                            <td className="px-6 py-4 align-middle text-center">
                                                <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-text-strong">
                                                    <Users className="w-3.5 h-3.5 text-text-weak" />
                                                    {enrollments.toLocaleString()}
                                                </div>
                                            </td>

                                            {/* RATING */}
                                            <td className="px-6 py-4 align-middle text-center">
                                                {rating ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                        <span className="text-sm font-semibold text-text-strong">{rating}</span>
                                                        <span className="text-xs text-text-weak">({reviewCount})</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-text-weak">No reviews</span>
                                                )}
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-6 py-4 align-middle">
                                                {isPublished ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-text-strong font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] shrink-0" />
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-text-strong font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] shrink-0" />
                                                        Draft
                                                    </span>
                                                )}
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-6 py-4 align-middle text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild disabled={isBusy}>
                                                        <Button variant="ghost" className="p-2 text-text-weak hover:text-text-strong rounded-full hover:bg-neutral-800/30 cursor-pointer">
                                                            {isBusy ? <Spinner /> : <MoreVertical className="h-4 w-4" />}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="p-2 w-44 text-text-weak" align="end">
                                                        <DropdownMenuItem
                                                            className="flex items-center gap-2 cursor-pointer"
                                                            onClick={() => navigate(`/admin/dashboard/courses/${course.id}`)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            <span>View Details</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className={`flex items-center gap-2 cursor-pointer ${
                                                                isPublished
                                                                    ? "text-amber-500 focus:text-amber-500"
                                                                    : "text-emerald-500 focus:text-emerald-500"
                                                            }`}
                                                            onClick={() => handleStatusToggle(course.id, course.status)}
                                                        >
                                                            {isPublished ? (
                                                                <>
                                                                    <EyeOff className="w-4 h-4" />
                                                                    <span>Unpublish</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye className="w-4 h-4" />
                                                                    <span>Publish</span>
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {coursePaginationData && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/80">
                        <div className="text-xs text-text-weak">
                            Showing{" "}
                            <span className="font-semibold text-text-strong">{from}–{to}</span>{" "}
                            of{" "}
                            <span className="font-semibold text-text-strong">{total.toLocaleString()}</span> courses
                        </div>
                        <Pagination className="mx-0 w-auto">
                            <PaginationContent className="flex items-center gap-1">
                                <PaginationItem>
                                    <PaginationPrevious
                                        size="icon"
                                        text=""
                                        onClick={(e) => { e.preventDefault(); handlePageChange(current_page - 1); }}
                                        className={`h-9 w-9 p-0 flex items-center justify-center rounded-lg border border-border/80 bg-transparent text-text-weak hover:text-text-strong hover:bg-neutral-800/40 transition-colors ${
                                            current_page === 1 ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer"
                                        }`}
                                    />
                                </PaginationItem>
                                {pageNumbers.map((page, idx) => (
                                    <PaginationItem key={idx}>
                                        {page === "..." ? (
                                            <PaginationEllipsis className="h-9 w-9 text-text-weak flex items-center justify-center" />
                                        ) : (
                                            <PaginationLink
                                                size="icon"
                                                isActive={page === current_page}
                                                onClick={(e) => { e.preventDefault(); handlePageChange(page as number); }}
                                                className={`h-9 w-9 text-xs flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer border ${
                                                    page === current_page
                                                        ? "pointer-events-none bg-[#818cf8] border-[#818cf8] text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                                                        : "border-transparent text-text-weak hover:text-text-strong hover:bg-neutral-800/40"
                                                }`}
                                            >
                                                {page}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        size="icon"
                                        text=""
                                        onClick={(e) => { e.preventDefault(); handlePageChange(current_page + 1); }}
                                        className={`h-9 w-9 p-0 flex items-center justify-center rounded-lg border border-border/80 bg-transparent text-text-weak hover:text-text-strong hover:bg-neutral-800/40 transition-colors ${
                                            current_page === last_page ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer"
                                        }`}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    );
};

const CoursesTableSkeleton = () => (
    <>
        {[...Array(6)].map((_, i) => (
            <tr key={i} className="border-b border-border/40 last:border-0">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-10 mx-auto" /></td>
                <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-16 mx-auto" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                <td className="px-6 py-4 text-center"><Skeleton className="h-8 w-8 rounded-full mx-auto" /></td>
            </tr>
        ))}
    </>
);

export default Courses;
