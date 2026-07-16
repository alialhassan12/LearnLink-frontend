import { useAdminStore } from "@/store/adminDashboardStores/adminStore";
import { useEffect, useState } from "react";
import {
    Users,
    GraduationCap,
    BookOpen,
    UserCircle,
    Star,
    DollarSign,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Award,
    Calendar,
    Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import useAuthStore from "@/store/authStore";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

const AdminContentDashboard = () => {
    const { getDashboardData, dashboardData, isGettingDashboardData } = useAdminStore();
    const { authUser } = useAuthStore();
    const [teacherTab, setTeacherTab] = useState<"rating" | "sessions">("rating");
    const [courseTab, setCourseTab] = useState<"enrollment" | "revenue">("enrollment");

    useEffect(() => {
        getDashboardData();
    }, []);

    if (isGettingDashboardData) {
        return <DashboardSkeleton />;
    }

    const stats = [
        { label: "Total Users", value: dashboardData?.totalUsers ?? 0, icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
        { label: "Teachers", value: dashboardData?.totalTeachers ?? 0, icon: GraduationCap, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Students", value: dashboardData?.totalStudents ?? 0, icon: UserCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Total Courses", value: dashboardData?.totalCourses ?? 0, icon: BookOpen, color: "text-rose-500", bg: "bg-rose-500/10" },
    ];

    const roleColor = (role: string) => {
        switch (role) {
            case "teacher": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "student": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
            default: return "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
        }
    };

    const statusColor = (status?: string) => {
        switch (status) {
            case "published": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "draft": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            default: return "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
        }
    };

    // Chart config for Shadcn charts wrapper
    const userGrowthConfig = {
        users: {
            label: "New Users",
            color: "#6366f1",
        },
    };

    const enrollmentsConfig = {
        enrollments: {
            label: "Enrollments",
            color: "#ec4899",
        },
    };

    const revenueConfig = {
        revenue: {
            label: "Monthly Revenue ($)",
            color: "#10b981",
        },
    };

    const formatMonth = (monthStr: string) => {
        if (!monthStr) return "";
        const [year, month] = monthStr.split("-");
        const date = new Date(Number(year), Number(month) - 1);
        return date.toLocaleDateString("en-US", { month: "short" });
    };

    const topTeachers = teacherTab === "rating"
        ? (dashboardData?.topTeachersByRating ?? [])
        : (dashboardData?.topTeachersBySessions ?? []);

    const topCourses = courseTab === "enrollment"
        ? (dashboardData?.topCoursesByEnrollment ?? [])
        : (dashboardData?.topCoursesByRevenue ?? []);

    return (
        <div className="space-y-8 pb-8">
            {/* Welcome header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-text-strong">Welcome back, {authUser?.name}!</h1>
                <p className="text-sm text-text-weak">Here's a comprehensive view of your platform operations and metrics.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="hover:border-primary/50 transition-all duration-300 shadow-md">
                        <CardContent className="flex flex-col gap-2 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-text-weak uppercase tracking-wider">{stat.label}</span>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                            </div>
                            <span className="text-3xl font-black text-text-strong">
                                {stat.value.toLocaleString()}
                            </span>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend Area Chart */}
                <Card className="lg:col-span-2 shadow-md">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-500" />
                                Revenue Performance
                            </CardTitle>
                            <CardDescription>Estimated revenue trend from bookings and subscriptions</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs py-1 self-start sm:self-auto mt-2 sm:mt-0">
                            6-Month Trend
                        </Badge>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        {dashboardData?.revenueTrend && dashboardData.revenueTrend.length > 0 ? (
                            <ChartContainer config={revenueConfig} className="h-full w-full">
                                <AreaChart data={dashboardData.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={formatMonth}
                                        className="text-text-weak"
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `$${v}`}
                                        className="text-text-weak"
                                    />
                                    <ChartTooltip content={<ChartTooltipContent indicator="line" labelFormatter={(label) => formatMonth(label as string)} />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ChartContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-weak text-sm">
                                No revenue data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* User Registrations Bar Chart */}
                <Card className="shadow-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            User Registration Growth
                        </CardTitle>
                        <CardDescription>Monthly user acquisition trend</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        {dashboardData?.userGrowth && dashboardData.userGrowth.length > 0 ? (
                            <ChartContainer config={userGrowthConfig} className="h-full w-full">
                                <BarChart data={dashboardData.userGrowth} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={formatMonth}
                                        className="text-text-weak"
                                    />
                                    <YAxis tickLine={false} axisLine={false} className="text-text-weak" />
                                    <ChartTooltip content={<ChartTooltipContent indicator="dot" labelFormatter={(label) => formatMonth(label as string)} />} />
                                    <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-weak text-sm">
                                No registration data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Course Enrollments & Performance Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Course Enrollments Growth Chart */}
                <Card className="shadow-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-pink-500" />
                            Enrollment Trends
                        </CardTitle>
                        <CardDescription>Monthly course enrollments count</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        {dashboardData?.courseEnrollments && dashboardData.courseEnrollments.length > 0 ? (
                            <ChartContainer config={enrollmentsConfig} className="h-full w-full">
                                <LineChart data={dashboardData.courseEnrollments} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={formatMonth}
                                        className="text-text-weak"
                                    />
                                    <YAxis tickLine={false} axisLine={false} className="text-text-weak" />
                                    <ChartTooltip content={<ChartTooltipContent indicator="dashed" labelFormatter={(label) => formatMonth(label as string)} />} />
                                    <Line type="monotone" dataKey="enrollments" stroke="#ec4899" strokeWidth={2.5} dot={{ stroke: "#ec4899", strokeWidth: 1 }} />
                                </LineChart>
                            </ChartContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-weak text-sm">
                                No enrollment data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Performing Teachers */}
                <Card className="shadow-md">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                Top Instructors
                            </CardTitle>
                            <div className="flex gap-1 bg-muted p-0.5 rounded-lg border border-border">
                                <button
                                    onClick={() => setTeacherTab("rating")}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                                        teacherTab === "rating" ? "bg-background text-text-strong shadow-xs" : "text-text-weak hover:text-text-strong"
                                    }`}
                                >
                                    Rating
                                </button>
                                <button
                                    onClick={() => setTeacherTab("sessions")}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                                        teacherTab === "sessions" ? "bg-background text-text-strong shadow-xs" : "text-text-weak hover:text-text-strong"
                                    }`}
                                >
                                    Sessions
                                </button>
                            </div>
                        </div>
                        <CardDescription>Top educators by aggregate rating or bookings</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2 divide-y divide-border">
                        {topTeachers && topTeachers.length > 0 ? (
                            topTeachers.map((teacher, index) => {
                                const initial = teacher.user?.name?.[0]?.toUpperCase() ?? "T";
                                return (
                                    <div key={teacher.id} className="flex items-center gap-3 py-3 last:pb-0">
                                        <span className="text-xs font-bold text-text-weak/70 w-4">{index + 1}</span>
                                        <Avatar className="w-8 h-8 shrink-0">
                                            <AvatarImage src={teacher.user?.avatar_url} />
                                            <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-text-strong truncate">{teacher.user?.name}</p>
                                            <p className="text-[10px] text-text-weak truncate">{teacher.headline || "LearnLink Instructor"}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            {teacherTab === "rating" ? (
                                                <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                                                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                                                    <span>{Number(teacher.avg_rating || 0).toFixed(1)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-indigo-500">
                                                    {teacher.approved_bookings_count ?? 0} sessions
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-8 text-center text-xs text-text-weak">
                                No instructor metrics available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Courses */}
                <Card className="shadow-md">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Award className="w-5 h-5 text-rose-500" />
                                Top Courses
                            </CardTitle>
                            <div className="flex gap-1 bg-muted p-0.5 rounded-lg border border-border">
                                <button
                                    onClick={() => setCourseTab("enrollment")}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                                        courseTab === "enrollment" ? "bg-background text-text-strong shadow-xs" : "text-text-weak hover:text-text-strong"
                                    }`}
                                >
                                    Students
                                </button>
                                <button
                                    onClick={() => setCourseTab("revenue")}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                                        courseTab === "revenue" ? "bg-background text-text-strong shadow-xs" : "text-text-weak hover:text-text-strong"
                                    }`}
                                >
                                    Revenue
                                </button>
                            </div>
                        </div>
                        <CardDescription>Top content modules by student enrollments or gross sales</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2 divide-y divide-border">
                        {topCourses && topCourses.length > 0 ? (
                            topCourses.map((course, index) => (
                                <div key={course.id} className="flex items-center gap-3 py-3 last:pb-0">
                                    <span className="text-xs font-bold text-text-weak/70 w-4">{index + 1}</span>
                                    <div className="h-8 w-8 rounded-md bg-rose-500/10 flex items-center justify-center shrink-0 overflow-hidden border border-border/30">
                                        {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url} className="h-full w-full object-cover" />
                                        ) : (
                                            <BookOpen className="w-4 h-4 text-rose-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-text-strong truncate">{course.title}</p>
                                        <p className="text-[10px] text-text-weak truncate">by {course.teacher?.user?.name || "Instructor"}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {courseTab === "enrollment" ? (
                                            <span className="text-xs font-bold text-indigo-500">
                                                {(course.enrollments_count ?? 0).toLocaleString()} users
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-emerald-500">
                                                ${Number(course.revenue || 0).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-xs text-text-weak">
                                No course metrics available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom section: Recent Users + Recent Courses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent users */}
                <Card className="shadow-md">
                    <CardHeader className="pb-3 flex flex-row items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" />
                        <div className="flex flex-col gap-0.5">
                            <CardTitle className="text-sm font-bold text-text-strong">Recent Users</CardTitle>
                            <CardDescription>Latest user registrations</CardDescription>
                        </div>
                    </CardHeader>
                    <div className="divide-y divide-border">
                        {dashboardData?.recentUsers && dashboardData.recentUsers.length > 0 ? (
                            dashboardData.recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-3 px-6 py-3.5">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback className="text-xs">{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-text-strong truncate">{user.name}</p>
                                        <p className="text-[10px] text-text-weak truncate">{user.email}</p>
                                    </div>
                                    <Badge variant="outline" className={`shrink-0 text-[9px] font-bold ${roleColor(user.role)}`}>
                                        {user.role}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <p className="text-xs text-text-weak">No recent users</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Recent courses */}
                <Card className="shadow-md">
                    <CardHeader className="pb-3 flex flex-row items-center gap-2">
                        <BookOpen className="w-5 h-5 text-rose-500" />
                        <div className="flex flex-col gap-0.5">
                            <CardTitle className="text-sm font-bold text-text-strong">Recent Courses</CardTitle>
                            <CardDescription>Latest published course modules</CardDescription>
                        </div>
                    </CardHeader>
                    <div className="divide-y divide-border">
                        {dashboardData?.recentCourses && dashboardData.recentCourses.length > 0 ? (
                            dashboardData.recentCourses.map((course) => (
                                <div key={course.id} className="flex items-center gap-3 px-6 py-3.5">
                                    <div className="h-8 w-8 rounded-md bg-rose-500/10 flex items-center justify-center shrink-0 overflow-hidden border border-border/30">
                                        {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url} className="h-full w-full object-cover" />
                                        ) : (
                                            <BookOpen className="w-4 h-4 text-rose-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-text-strong truncate">{course.title}</p>
                                        <p className="text-[10px] text-text-weak truncate">${course.price} &middot; {course.language}</p>
                                    </div>
                                    <Badge variant="outline" className={`shrink-0 text-[9px] font-bold ${statusColor(course.status)}`}>
                                        {course.status ?? "draft"}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <p className="text-xs text-text-weak">No recent courses</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const DashboardSkeleton = () => {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="flex flex-col gap-3 pt-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-[350px] rounded-2xl" />
                <Skeleton className="h-[350px] rounded-2xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-[350px] rounded-2xl" />
                <Skeleton className="h-[350px] rounded-2xl" />
                <Skeleton className="h-[350px] rounded-2xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[300px] rounded-2xl" />
                <Skeleton className="h-[300px] rounded-2xl" />
            </div>
        </div>
    );
};

export default AdminContentDashboard;
