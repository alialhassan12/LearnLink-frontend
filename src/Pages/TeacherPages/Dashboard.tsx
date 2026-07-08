import useTeacherStore from "@/store/teacherStore";
import { useEffect } from "react";
import { BookOpen, Users, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import useAuthStore from "@/store/authStore";

const Dashboard = () => {
    const { getTeacherDashboardData, teacherDashboardData, isGettingTeacherDashboardData } = useTeacherStore();
    const { authUser } = useAuthStore();

    useEffect(() => {
        getTeacherDashboardData();
    }, []);

    if (isGettingTeacherDashboardData) {
        return <TeacherDashboardSkeleton />;
    }

    const stats = [
        { label: "Total Courses", value: teacherDashboardData?.total_courses ?? 0, icon: BookOpen },
        { label: "Total Enrollments", value: teacherDashboardData?.total_enrollments ?? 0, icon: Users },
        { label: "Upcoming Sessions", value: teacherDashboardData?.upcoming_sessions?.length ?? 0, icon: Calendar },
        { label: "Pending Bookings", value: teacherDashboardData?.pending_bookings?.length ?? 0, icon: Clock },
    ];

    return (
        <div className="space-y-6">
            {/* welcome header */}
            <div>
                <h1 className="text-2xl font-semibold text-text-strong">Welcome back, {authUser?.name}!</h1>
                <p className="text-sm text-text-weak">Here&apos;s what&apos;s happening with your teaching today.</p>
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

            {/* bottom section: upcoming sessions + pending bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* upcoming sessions */}
                <Card>
                    <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm text-text-strong">Upcoming Sessions</span>
                    </div>
                    <div className="divide-y divide-border">
                        {teacherDashboardData?.upcoming_sessions && teacherDashboardData.upcoming_sessions.length > 0 ? (
                            teacherDashboardData.upcoming_sessions.map((session) => (
                                <div key={session.id} className="flex items-center gap-3 px-4 py-3">
                                    <Avatar size="default">
                                        <AvatarImage src={session.student?.user?.avatar_url} />
                                        <AvatarFallback className="text-xs">{session.student?.user?.name?.[0] ?? 'S'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-strong truncate">{session.student?.user?.name}</p>
                                        <p className="text-xs text-text-weak truncate">{session.subject} &middot; {session.scheduled_day}, {session.scheduled_date}</p>
                                    </div>
                                    <Badge variant="secondary" className="shrink-0">{session.scheduled_time}</Badge>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-text-weak">No upcoming sessions</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* pending bookings */}
                <Card>
                    <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm text-text-strong">Pending Bookings</span>
                    </div>
                    <div className="divide-y divide-border">
                        {teacherDashboardData?.pending_bookings && teacherDashboardData.pending_bookings.length > 0 ? (
                            teacherDashboardData.pending_bookings.map((booking) => (
                                <div key={booking.id} className="flex items-center gap-3 px-4 py-3">
                                    <Avatar size="sm">
                                        <AvatarImage src={booking.student?.user?.avatar_url} />
                                        <AvatarFallback className="text-xs">{booking.student?.user?.name?.[0] ?? 'S'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-strong truncate">{booking.student?.user?.name}</p>
                                        <p className="text-xs text-text-weak truncate">{booking.subject}</p>
                                    </div>
                                    <span className="text-sm font-semibold text-text-strong shrink-0">${booking.price}</span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-text-weak">No pending bookings</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;

const TeacherDashboardSkeleton = () => {
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
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-3 w-28" />
                                    <Skeleton className="h-2.5 w-36" />
                                </div>
                                <Skeleton className="h-5 w-14 rounded-full" />
                            </div>
                        ))}
                    </div>
                </Card>
                <Card>
                    <div className="px-4 py-3 border-b border-border">
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="divide-y divide-border">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-3 w-28" />
                                    <Skeleton className="h-2.5 w-20" />
                                </div>
                                <Skeleton className="h-4 w-10" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
