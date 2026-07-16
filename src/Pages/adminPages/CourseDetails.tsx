import { useEffect } from "react";
import { useAdminStore } from "../../store/adminDashboardStores/adminStore";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Spinner } from "../../components/ui/spinner";
import {
    ArrowLeft,
    Star,
    Users,
    BookOpen,
    Globe2,
    DollarSign,
    Eye,
    EyeOff,
    Tag,
    FileText,
    Calendar,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";

const CourseDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        selectedCourse,
        isGettingCourseDetails,
        getCourseDetails,
        clearSelectedCourse,
        changeCourseStatus,
        isChangingCourseStatus,
    } = useAdminStore();

    const [expandedSections, setExpandedSections] = useState<number[]>([]);

    useEffect(() => {
        if (id) getCourseDetails(Number(id));
        return () => clearSelectedCourse();
    }, [id]);

    const toggleSection = (sectionId: number) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId) ? prev.filter((s) => s !== sectionId) : [...prev, sectionId]
        );
    };

    const handleStatusToggle = async () => {
        if (!selectedCourse) return;
        const newStatus = selectedCourse.status === "published" ? "draft" : "published";
        await changeCourseStatus(selectedCourse.id, newStatus);
    };

    if (isGettingCourseDetails) {
        return <CourseDetailsSkeleton />;
    }

    if (!selectedCourse) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <BookOpen className="w-12 h-12 text-text-weak opacity-40" />
                <p className="text-text-weak font-medium">Course not found.</p>
                <Button variant="outline" onClick={() => navigate("/admin/dashboard/courses")}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
                </Button>
            </div>
        );
    }

    const course = selectedCourse;
    const isPublished = course.status === "published";
    const avgRating = course.course_reviews_avg_rating
        ? Number(course.course_reviews_avg_rating).toFixed(1)
        : null;
    const teacherName = course.teacher?.user?.name ?? "Unknown";
    const teacherAvatar = course.teacher?.user?.avatar_url ?? undefined;
    const teacherInitials = teacherName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    const stats = [
        {
            icon: Users,
            label: "Enrolled Students",
            value: (course.enrollments_count ?? 0).toLocaleString(),
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
        },
        {
            icon: Star,
            label: "Average Rating",
            value: avgRating ? `${avgRating} / 5` : "No reviews yet",
            color: "text-amber-400",
            bg: "bg-amber-500/10",
        },
        {
            icon: FileText,
            label: "Total Reviews",
            value: (course.course_reviews_count ?? 0).toLocaleString(),
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            icon: DollarSign,
            label: "Price",
            value: `$${Number(course.price).toFixed(2)}`,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
        },
    ];

    return (
        <div className="flex flex-col gap-6 pb-8">
            {/* Back + Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/admin/dashboard/courses")}
                        className="rounded-xl border border-border/80 hover:bg-neutral-800/30 shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <p className="text-2xl font-extrabold text-text-strong leading-tight line-clamp-1">
                            {course.title}
                        </p>
                        <p className="text-sm text-text-weak mt-0.5">Course Details & Management</p>
                    </div>
                </div>

                {/* Status toggle */}
                <Button
                    disabled={isChangingCourseStatus}
                    onClick={handleStatusToggle}
                    className={`shrink-0 cursor-pointer transition-all duration-300 ${
                        isPublished
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                    }`}
                    variant="ghost"
                >
                    {isChangingCourseStatus ? (
                        <Spinner className="w-4 h-4" />
                    ) : isPublished ? (
                        <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Unpublish Course
                        </>
                    ) : (
                        <>
                            <Eye className="w-4 h-4 mr-2" />
                            Publish Course
                        </>
                    )}
                </Button>
            </div>

            {/* Hero Banner */}
            <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-border/80 bg-neutral-900/50">
                {course.thumbnail_url ? (
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-text-weak opacity-20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {/* Status badge on the banner */}
                <div className="absolute bottom-4 left-4">
                    {isPublished ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                            Published
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                            Draft
                        </span>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="flex flex-col gap-3 p-4 rounded-2xl border border-border/80 bg-card/30"
                    >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xl font-extrabold text-text-strong">{stat.value}</p>
                            <p className="text-xs text-text-weak mt-0.5">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column – Description + Sections */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                    {/* Description */}
                    <div className="p-5 rounded-2xl border border-border/80 bg-card/30">
                        <h3 className="font-bold text-text-strong mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            Description
                        </h3>
                        <p className="text-sm text-text-weak leading-relaxed">
                            {course.description || "No description provided."}
                        </p>
                    </div>

                    {/* Course Sections */}
                    {course.sections && course.sections.length > 0 && (
                        <div className="p-5 rounded-2xl border border-border/80 bg-card/30">
                            <h3 className="font-bold text-text-strong mb-4 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                Course Content
                                <span className="ml-auto text-xs text-text-weak font-normal">
                                    {course.sections.length} section{course.sections.length !== 1 ? "s" : ""}
                                </span>
                            </h3>
                            <div className="flex flex-col gap-2">
                                {course.sections.map((section) => {
                                    const isOpen = expandedSections.includes(section.id!);
                                    const materialCount = section.materials?.length ?? 0;
                                    return (
                                        <div key={section.id} className="border border-border/60 rounded-xl overflow-hidden">
                                            <button
                                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800/20 transition-colors cursor-pointer text-left"
                                                onClick={() => toggleSection(section.id!)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isOpen ? (
                                                        <ChevronDown className="w-4 h-4 text-text-weak shrink-0" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-text-weak shrink-0" />
                                                    )}
                                                    <span className="text-sm font-semibold text-text-strong">
                                                        {section.title}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-text-weak shrink-0">
                                                    {materialCount} material{materialCount !== 1 ? "s" : ""}
                                                </span>
                                            </button>
                                            {isOpen && materialCount > 0 && (
                                                <div className="border-t border-border/40 px-4 py-2 flex flex-col gap-1 bg-neutral-900/10">
                                                    {section.materials!.map((mat) => (
                                                        <div
                                                            key={mat.id}
                                                            className="flex items-center gap-2 py-1.5 text-sm text-text-weak"
                                                        >
                                                            <FileText className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                                                            <span className="line-clamp-1">{mat.title}</span>
                                                            <span className="ml-auto text-xs text-text-weak/60 uppercase">
                                                                {mat.type}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {isOpen && materialCount === 0 && (
                                                <div className="border-t border-border/40 px-4 py-3 text-xs text-text-weak bg-neutral-900/10">
                                                    No materials in this section.
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    {course.course_reviews && course.course_reviews.length > 0 && (
                        <div className="p-5 rounded-2xl border border-border/80 bg-card/30">
                            <h3 className="font-bold text-text-strong mb-4 flex items-center gap-2">
                                <Star className="w-4 h-4 text-primary" />
                                Student Reviews
                                <span className="ml-auto text-xs text-text-weak font-normal">
                                    {course.course_reviews.length} review{course.course_reviews.length !== 1 ? "s" : ""}
                                </span>
                            </h3>
                            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                                {course.course_reviews.map((review) => {
                                    const reviewerName = review.student?.user?.name ?? "Student";
                                    const reviewerAvatar = review.student?.user?.avatar_url ?? undefined;
                                    const reviewerInitials = reviewerName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2);
                                    return (
                                        <div key={review.id} className="flex gap-3 p-3 rounded-xl bg-neutral-900/20 border border-border/40">
                                            <Avatar className="w-8 h-8 shrink-0">
                                                <AvatarImage src={reviewerAvatar} />
                                                <AvatarFallback className="text-xs">{reviewerInitials}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-text-strong">{reviewerName}</span>
                                                    <div className="flex items-center gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-3 h-3 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-neutral-600"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-text-weak leading-relaxed">{review.review}</p>
                                                <p className="text-[10px] text-text-weak/60 mt-0.5">
                                                    {new Date(review.created_at).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right column – Course Info + Teacher + Enrolled Students */}
                <div className="flex flex-col gap-5">
                    {/* Course Meta */}
                    <div className="p-5 rounded-2xl border border-border/80 bg-card/30">
                        <h3 className="font-bold text-text-strong mb-4">Course Info</h3>
                        <div className="flex flex-col gap-3">
                            <MetaRow icon={<Globe2 className="w-4 h-4" />} label="Language" value={course.language} />
                            <MetaRow icon={<Tag className="w-4 h-4" />} label="Category" value={course.category?.title ?? "—"} />
                            <MetaRow icon={<DollarSign className="w-4 h-4" />} label="Price" value={`$${Number(course.price).toFixed(2)}`} />
                            <MetaRow
                                icon={<Calendar className="w-4 h-4" />}
                                label="Created"
                                value={new Date(course.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            />
                            <MetaRow
                                icon={<Calendar className="w-4 h-4" />}
                                label="Last Updated"
                                value={new Date(course.updated_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            />
                        </div>
                    </div>

                    {/* Teacher */}
                    {course.teacher && (
                        <div className="p-5 rounded-2xl border border-border/80 bg-card/30">
                            <h3 className="font-bold text-text-strong mb-4">Instructor</h3>
                            <div className="flex items-center gap-3">
                                <Avatar className="w-11 h-11 border border-border/30">
                                    <AvatarImage src={teacherAvatar} />
                                    <AvatarFallback className="text-sm font-semibold">{teacherInitials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm text-text-strong">{teacherName}</p>
                                    <p className="text-xs text-text-weak">{course.teacher.user?.email ?? ""}</p>
                                </div>
                            </div>
                            {course.teacher.headline && (
                                <p className="mt-3 text-xs text-text-weak leading-relaxed">
                                    {course.teacher.headline}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Enrolled Students */}
                    {course.enrollments && course.enrollments.length > 0 && (
                        <div className="p-5 rounded-2xl border border-border/80 bg-card/30">
                            <h3 className="font-bold text-text-strong mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                Enrolled Students
                                <span className="ml-auto text-xs text-text-weak font-normal">
                                    {course.enrollments_count?.toLocaleString() ?? course.enrollments.length}
                                </span>
                            </h3>
                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                                {course.enrollments.map((enrollment) => {
                                    const studentName = enrollment.student?.user?.name ?? "Student";
                                    const studentAvatar = enrollment.student?.user?.avatar_url ?? undefined;
                                    const initials = studentName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2);
                                    return (
                                        <div key={enrollment.id} className="flex items-center gap-2.5">
                                            <Avatar className="w-7 h-7 shrink-0">
                                                <AvatarImage src={studentAvatar} />
                                                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-medium text-text-strong truncate">{studentName}</span>
                                                <span className="text-[10px] text-text-weak">
                                                    Enrolled {new Date(enrollment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MetaRow = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) => (
    <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-text-weak text-xs">
            {icon}
            <span>{label}</span>
        </div>
        <span className="text-xs font-semibold text-text-strong">{value}</span>
    </div>
);

const CourseDetailsSkeleton = () => (
    <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex flex-col gap-1.5">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-40" />
            </div>
        </div>
        <Skeleton className="w-full h-52 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-48 rounded-2xl" />
            </div>
            <div className="flex flex-col gap-4">
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
            </div>
        </div>
    </div>
);

export default CourseDetails;
