import { useAdminStore } from "@/store/adminDashboardStores/adminStore";
import { useEffect } from "react";
import { Users, GraduationCap, BookOpen, UserCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import useAuthStore from "@/store/authStore";

const AdminContentDashboard = () => {
    const { getDashboardData, dashboardData, isGettingDashboardData } = useAdminStore();
    const { authUser } = useAuthStore();

    useEffect(() => {
        getDashboardData();
    }, []);

    if (isGettingDashboardData) {
        return <DashboardSkeleton />;
    }

    const stats = [
        { label: "Total Users", value: dashboardData?.totalUsers ?? 0, icon: Users },
        { label: "Teachers", value: dashboardData?.totalTeachers ?? 0, icon: GraduationCap },
        { label: "Students", value: dashboardData?.totalStudents ?? 0, icon: UserCircle },
        { label: "Total Courses", value: dashboardData?.totalCourses ?? 0, icon: BookOpen },
    ];

    const roleColor = (role: string) => {
        switch (role) {
            case "teacher": return "bg-amber-100 text-amber-700 border-amber-200";
            case "student": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-secondary text-secondary-foreground";
        }
    };

    const statusColor = (status?: string) => {
        switch (status) {
            case "published": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "draft": return "bg-rose-100 text-rose-700 border-rose-200";
            default: return "bg-secondary text-secondary-foreground";
        }
    };

    return (
        <div className="space-y-6">
            {/* welcome header */}
            <div>
                <h1 className="text-2xl font-semibold text-text-strong">Welcome back, {authUser?.name}!</h1>
                <p className="text-sm text-text-weak">Platform overview at a glance.</p>
            </div>

            {/* stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} size="sm" className="hover:border-primary/50 transition-colors">
                        <CardContent className="flex flex-col gap-2 pt-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-weak font-medium uppercase tracking-wider">{stat.label}</span>
                                <div className="p-1.5 bg-primary/10 rounded-md">
                                    <stat.icon className="w-4 h-4 text-primary" />
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-text-strong">{stat.value}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* bottom section: recent users + recent courses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* recent users */}
                <Card>
                    <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm text-text-strong">Recent Users</span>
                    </div>
                    <div className="divide-y divide-border">
                        {dashboardData?.recentUsers && dashboardData.recentUsers.length > 0 ? (
                            dashboardData.recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                                    <Avatar size="sm">
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback className="text-xs">{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-strong truncate">{user.name}</p>
                                        <p className="text-xs text-text-weak truncate">{user.email}</p>
                                    </div>
                                    <Badge variant="outline" className={`shrink-0 text-[10px] ${roleColor(user.role)}`}>
                                        {user.role}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-text-weak">No recent users</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* recent courses */}
                <Card>
                    <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm text-text-strong">Recent Courses</span>
                    </div>
                    <div className="divide-y divide-border">
                        {dashboardData?.recentCourses && dashboardData.recentCourses.length > 0 ? (
                            dashboardData.recentCourses.map((course) => (
                                <div key={course.id} className="flex items-center gap-3 px-4 py-3">
                                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                                        {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url} className="h-full w-full object-cover" />
                                        ) : (
                                            <BookOpen className="w-4 h-4 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-strong truncate">{course.title}</p>
                                        <p className="text-xs text-text-weak truncate">${course.price} &middot; {course.language}</p>
                                    </div>
                                    <Badge variant="outline" className={`shrink-0 text-[10px] ${statusColor(course.status)}`}>
                                        {course.status ?? "draft"}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-text-weak">No recent courses</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminContentDashboard;

const DashboardSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="space-y-2">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} size="sm">
                        <CardContent className="flex flex-col gap-3 pt-3">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-7 w-7 rounded-md" />
                            </div>
                            <Skeleton className="h-7 w-12" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <div className="px-4 py-3 border-b border-border">
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="divide-y divide-border">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-3 w-28" />
                                    <Skeleton className="h-2.5 w-36" />
                                </div>
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
                </Card>
                <Card>
                    <div className="px-4 py-3 border-b border-border">
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="divide-y divide-border">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-3 w-32" />
                                    <Skeleton className="h-2.5 w-24" />
                                </div>
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
