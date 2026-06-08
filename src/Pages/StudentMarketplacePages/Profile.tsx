import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentStore } from "../../store/studentmarketplaceStores/studentStore";
import { useCourseEnrollmentStore } from "../../store/studentmarketplaceStores/courseEnrollmentStore";
import useBookingStore from "../../store/bookingStore";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { 
    Album, 
    Calendar, 
    CheckCheck, 
    Mail, 
    User, 
    BookOpen, 
    Clock, 
    ArrowUpRight, 
    Compass, 
    Lock, 
    ShieldCheck, 
    Sparkles,
    ChevronRight,
    LogOut
} from "lucide-react";
import CourseCard from "../../components/studentMarketplaceComponents/CourseCard";
import useAuthStore from "../../store/authStore";
import { Spinner } from "../../components/ui/spinner";

const Profile = () => {
    const navigate = useNavigate();
    const { student, isGettingStudent, getStudent, completedSessionCount } = useStudentStore();
    const { enrolledCoursesIds, enrollments, getEnrollments, isGettingEnrollments } = useCourseEnrollmentStore();
    const { studentBookings, getStudentBookings, isGettingStudentBookings } = useBookingStore();

    const {logout,isLoggingout}=useAuthStore    ();

    const handleLogout=async()=>{
        const loggedOut=await logout();
        if(loggedOut){
            navigate("/");
        }
    }

    useEffect(() => {
        getStudent();
        getEnrollments();
        getStudentBookings();
    }, [getStudent, getEnrollments, getStudentBookings]);

    const activeBookingsCount = studentBookings.filter(b => b.status === "approved" || b.status === "pending").length;

    const cards = [
        {
            id: 0,
            title: "Sessions Completed",
            icon: CheckCheck,
            value: completedSessionCount,
            bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
            iconBg: "bg-emerald-100 dark:bg-emerald-900/50"
        },
        {
            id: 1,
            title: "Courses Enrolled",
            icon: Album,
            value: enrolledCoursesIds.length,
            bg: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
            iconBg: "bg-blue-100 dark:bg-blue-900/50"
        },
        {
            id: 2,
            title: "Upcoming Sessions",
            icon: Clock,
            value: activeBookingsCount,
            bg: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
            iconBg: "bg-amber-100 dark:bg-amber-900/50"
        }
    ];

    const isLoading = isGettingStudent || isGettingEnrollments || isGettingStudentBookings;

    if (isLoading || !student) {
        return <StudentProfileSkeleton />
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-8 animate-fade-in">
            {/* Banner & Basic Info Header */}
            <div className="relative border border-border rounded-2xl shadow-sm bg-card overflow-hidden transition-all duration-300">
                {/* Decorative Banner Background */}
                <div className="h-32 md:h-44 w-full bg-gradient-to-r from-primary/30 via-blue-500/10 to-primary/5 dark:from-primary/20 dark:via-blue-950/20 dark:to-transparent" />
                
                {/* Profile Header Content */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 md:px-8 md:pb-8 -mt-16 md:-mt-20 relative text-center md:text-left">
                    {/* Avatar */}
                    <div className="relative">
                        <Avatar className="w-32 h-32 md:w-36 md:h-36 border-4 border-background ring-4 ring-primary/5 shadow-md">
                            <AvatarImage src={student?.user?.avatar || undefined} />
                            <AvatarFallback className="text-4xl text-primary font-bold">
                                {student?.user?.name?.[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-2 right-2 p-1.5 bg-emerald-500 rounded-full border-2 border-background w-5 h-5 shadow-sm" title="Online" />
                    </div>

                    {/* Meta details */}
                    <div className="flex-1 flex flex-col justify-end pt-0 md:pt-4 w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3 w-full">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-text-strong tracking-tight">{student?.user?.name}</h1>
                                <p className="text-primary font-semibold text-base mt-0.5">{student?.headline || "Aspiring Scholar"}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/80 text-text-strong rounded-full text-xs font-semibold border border-border shadow-sm">
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    Joined {new Date(student?.user?.created_at || "").toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20 shadow-sm">
                                    {/* <Sparkles className="w-3.5 h-3.5" /> */}
                                    Student Account
                                </span>
                            </div>
                        </div>

                        <p className="text-text-weak text-sm md:text-base leading-relaxed max-w-3xl">
                            {student?.bio || "No biography provided yet. Add information about your academic interests and goals!"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.id} className="flex flex-row justify-start items-center bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 ease-in-out group">
                            <div className={`p-4 rounded-2xl ${card.iconBg} ${card.bg.split(' ')[1]} transition-transform group-hover:scale-110 duration-300`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-black text-text-strong">{card.value}</p>
                                <p className="text-sm font-semibold text-text-weak tracking-wide uppercase mt-0.5">{card.title}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Enrollments and Bookings */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    
                    {/* Recent Course Progress */}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-text-strong flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                Enrolled Courses Progress
                            </h2>
                            {enrollments.length > 0 && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-primary font-bold flex items-center gap-1 hover:text-primary/80"
                                    onClick={() => navigate("/marketplace/learnings")}
                                >
                                    View All Learnings
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        {enrollments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {enrollments.slice(0, 2).map((enrollment) => (
                                    <CourseCard key={enrollment?.course_id} course={enrollment?.course}/>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col justify-center items-center py-10 px-4 border-2 border-dashed border-border rounded-2xl bg-secondary/10">
                                <div className="p-3 bg-background rounded-full mb-3 text-text-weak">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-text-strong">No enrolled courses yet</h3>
                                <p className="text-xs text-text-weak text-center max-w-sm mt-1 mb-4">
                                    Start learning by enrolling in top-rated courses from experts worldwide.
                                </p>
                                <Button 
                                    size="sm" 
                                    className="gap-1.5 font-bold"
                                    onClick={() => navigate("/marketplace/browse/courses")}
                                >
                                    <Compass className="w-4 h-4" />
                                    Explore Courses
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Sessions (Bookings) */}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-text-strong flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Upcoming Tutoring Sessions
                            </h2>
                            {studentBookings.length > 0 && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-primary font-bold flex items-center gap-1 hover:text-primary/80"
                                    onClick={() => navigate("/marketplace/bookings")}
                                >
                                    View Schedule
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        {studentBookings.filter(b => b.status !== 'rejected').length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {studentBookings
                                    .filter(b => b.status !== 'rejected')
                                    .slice(0, 2)
                                    .map((booking) => (
                                        <div key={booking.id} className="relative bg-card border border-border/80 rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all duration-300 overflow-hidden group">
                                            {/* Accent status tag */}
                                            <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                                booking.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'
                                            }`} />
                                            
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pl-2">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12 border border-border shadow-sm ring-2 ring-primary/5">
                                                        <AvatarImage src={booking?.teacher?.user?.avatar || undefined} />
                                                        <AvatarFallback className="bg-primary/5 text-primary font-bold text-base">
                                                            {booking?.teacher?.user?.name?.[0].toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold text-text-strong group-hover:text-primary transition-colors text-base">
                                                            {booking?.teacher?.user?.name}
                                                        </h4>
                                                        <p className="text-xs text-text-weak">
                                                            Subject: <span className="text-primary font-semibold">{booking?.subject}</span>
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                                            <span className="flex items-center gap-1 text-[11px] font-medium text-text-weak bg-secondary/50 px-2 py-0.5 rounded-md">
                                                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                                                {booking?.scheduled_day}, {booking?.scheduled_date}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-[11px] font-medium text-text-weak bg-secondary/50 px-2 py-0.5 rounded-md">
                                                                <Clock className="w-3.5 h-3.5 text-primary" />
                                                                {booking?.scheduled_time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40 gap-1.5">
                                                    <div className="text-lg font-black text-text-strong">${booking?.price}</div>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                                                        booking?.status === 'approved' 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50' 
                                                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                                                    }`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="flex flex-col justify-center items-center py-10 px-4 border-2 border-dashed border-border rounded-2xl bg-secondary/10">
                                <div className="p-3 bg-background rounded-full mb-3 text-text-weak">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-text-strong">No upcoming sessions</h3>
                                <p className="text-xs text-text-weak text-center max-w-sm mt-1 mb-4">
                                    Book a personalized live tutoring session with expert instructors.
                                </p>
                                <Button 
                                    size="sm" 
                                    className="gap-1.5 font-bold"
                                    onClick={() => navigate("/marketplace/browse/teachers")}
                                >
                                    <User className="w-4 h-4" />
                                    Find Tutors
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side: Sidebar Info & Account Settings */}
                <div className="flex flex-col gap-6">
                    {/* General Info Card */}
                    <div className="flex flex-col gap-4 p-6 border border-border rounded-2xl bg-card shadow-sm">
                        <h3 className="text-lg font-bold text-text-strong flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            General Information
                        </h3>
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex flex-col gap-1 pb-3 border-b border-border/60">
                                <span className="text-xs font-semibold text-text-weak uppercase tracking-wider">Email Address</span>
                                <span className="text-text-strong font-medium flex items-center gap-1.5 truncate mt-0.5">
                                    <Mail className="w-4 h-4 text-primary shrink-0" />
                                    {student?.user?.email}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 pb-3 border-b border-border/60">
                                <span className="text-xs font-semibold text-text-weak uppercase tracking-wider">Account Status</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Active
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-text-weak uppercase tracking-wider">Member Since</span>
                                <span className="text-text-strong font-medium mt-0.5">
                                    {new Date(student?.user?.created_at || "").toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="flex flex-col gap-4 p-6 border border-border rounded-2xl bg-card shadow-sm">
                        <div>
                            <h3 className="text-lg font-bold text-text-strong flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary" />
                                Security Settings
                            </h3>
                            <p className="text-text-weak text-xs mt-1">Manage your account credentials and security preferences.</p>
                        </div>
                        
                        <div className="flex flex-col gap-4 pt-2">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-text-strong">Update Password</span>
                                    <span className="text-text-weak text-xs mt-0.5">Regularly change your password to keep your account secure.</span>
                                </div>
                                <Button variant="outline" className="w-full mt-2 h-10 font-bold text-xs hover:border-primary/45 hover:text-primary transition-all duration-300">
                                    Change Password
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 pt-2">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-text-strong">Logout</span>
                                    <span className="text-text-weak text-xs mt-0.5">Logout of your account.</span>
                                </div>
                                <Button 
                                    variant="destructive"
                                    onClick={handleLogout}
                                    disabled={isLoggingout}
                                >
                                    {isLoggingout?
                                        <div className="flex items-center gap-2">
                                            <Spinner className="size-4 animate-spin text-red-500" />
                                            <span>Logging out...</span>
                                        </div>
                                        :
                                        <div className="flex items-center gap-2">
                                            <LogOut className="size-4" />
                                            <span>Logout</span>
                                        </div>
                                    }
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentProfileSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-8 animate-pulse">
            {/* Header Card Skeleton */}
            <div className="relative border border-border rounded-2xl bg-card overflow-hidden">
                <div className="h-32 md:h-44 w-full bg-secondary/40" />
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 md:px-8 md:pb-8 -mt-16 md:-mt-20 relative z-10">
                    <Skeleton className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-background shadow-md shrink-0" />
                    <div className="flex-1 flex flex-col justify-end pt-0 md:pt-4 w-full gap-3 text-center md:text-left items-center md:items-start">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                            <div className="space-y-2 flex flex-col items-center md:items-start">
                                <Skeleton className="h-8 w-48 rounded-lg" />
                                <Skeleton className="h-4 w-32 rounded" />
                            </div>
                            <div className="flex gap-2 justify-center">
                                <Skeleton className="h-8 w-28 rounded-full" />
                                <Skeleton className="h-8 w-28 rounded-full" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-5/6 rounded" />
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center bg-card border border-border rounded-2xl p-6 gap-4">
                        <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-7 w-12 rounded" />
                            <Skeleton className="h-4 w-28 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Dashboard Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side Skeletons */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Courses progress skeleton */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-48 rounded" />
                            <Skeleton className="h-4 w-24 rounded" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="border border-border rounded-2xl overflow-hidden bg-card">
                                    <Skeleton className="h-32 w-full" />
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-5 w-5 rounded-full" />
                                            <Skeleton className="h-3.5 w-20 rounded" />
                                        </div>
                                        <Skeleton className="h-4 w-3/4 rounded" />
                                        <div className="space-y-1.5 mt-1">
                                            <Skeleton className="h-3 w-full rounded" />
                                            <Skeleton className="h-1.5 w-full rounded-full" />
                                        </div>
                                        <Skeleton className="h-9 w-full rounded-md mt-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bookings skeleton */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-48 rounded" />
                            <Skeleton className="h-4 w-24 rounded" />
                        </div>
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="border border-border rounded-2xl p-5 bg-card flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4.5 w-32 rounded" />
                                            <Skeleton className="h-3 w-24 rounded" />
                                            <div className="flex gap-2">
                                                <Skeleton className="h-5 w-28 rounded" />
                                                <Skeleton className="h-5 w-20 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 items-end flex flex-col w-full sm:w-auto">
                                        <Skeleton className="h-6 w-12 rounded" />
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right side Skeletons */}
                <div className="space-y-6">
                    {/* General Info Skeleton */}
                    <div className="border border-border rounded-2xl bg-card p-6 space-y-4">
                        <Skeleton className="h-6 w-40 rounded" />
                        <div className="space-y-3 pt-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-1.5 pb-2 border-b border-border/40 last:border-0 last:pb-0">
                                    <Skeleton className="h-3.5 w-20 rounded" />
                                    <Skeleton className="h-4 w-36 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security settings skeleton */}
                    <div className="border border-border rounded-2xl bg-card p-6 space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-36 rounded" />
                            <Skeleton className="h-3 w-48 rounded" />
                        </div>
                        <div className="space-y-2 pt-2">
                            <Skeleton className="h-4 w-28 rounded" />
                            <Skeleton className="h-3.5 w-44 rounded" />
                            <Skeleton className="h-10 w-full rounded-md mt-2" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;