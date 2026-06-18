import { useEffect, useState } from "react";
import { useLiveSessionStore } from "../../../store/liveSessionsStore";
import { Calendar, Clock, ClockCheck, Video, MessageSquare, VideoOff } from "lucide-react";
import { Separator } from "../../../components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Skeleton } from "../../../components/ui/skeleton";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import MessageButton from "../../../components/MessageButton";

const MySessions = () => {
    const { getTeacherLiveSessions, teacherLiveSessions, isGettingTeacherLiveSessions } = useLiveSessionStore();
    const [filterTabs, setFilterTabs] = useState<string>("all");
    const filteredSessions = teacherLiveSessions.filter((session) => filterTabs === "all" || filterTabs === session.status);
    const navigate = useNavigate();

    useEffect(() => {
        getTeacherLiveSessions();
    }, []);

    const cards = [
        {
            id: 1,
            title: "Upcoming Sessions",
            value: teacherLiveSessions.filter((session) => session.status === "booked").length,
            icon: Clock
        },
        {
            id: 2,
            title: "Completed Sessions",
            value: teacherLiveSessions.filter((session) => session.status === "completed").length,
            icon: ClockCheck
        },
        {
            id: 3,
            title: "Today's Sessions",
            value: teacherLiveSessions.filter((session) => new Date(session.scheduled_date).toDateString() === new Date().toDateString()).length,
            icon: Calendar
        }
    ];

    if (isGettingTeacherLiveSessions) {
        return <MySessionsSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                    <div key={card.id} className="bg-card p-6 rounded-xl shadow-sm border border-border/60 hover:border-primary transition-all duration-300 group">
                        <div className="flex flex-row justify-between items-center">
                            <div className="p-2.5 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <card.icon className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{card.title}</p>
                        </div>
                        <div className="mt-4">
                            <p className="text-foreground font-bold text-3xl">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Separator className="my-2" />

            {/* live sessions list */}
            <Tabs defaultValue={filterTabs} onValueChange={(value) => setFilterTabs(value)}>
                <TabsList>
                    <TabsTrigger value="all">All Sessions</TabsTrigger>
                    <TabsTrigger value="booked">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSessions.length > 0 ? (
                        filteredSessions.map((session) => {
                            return (
                                <div key={session.id} className="flex flex-col gap-2 bg-background border border-border/60 rounded-xl hover:shadow-md transition-all duration-200 p-4 group">
                                    {/* Student Avatar & Name */}
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <Avatar className="h-12 w-12 border-2 border-primary/10">
                                            <AvatarImage src={session.student?.user?.avatar_url} />
                                            <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                                                {session.student?.user?.name ? session.student.user.name[0].toUpperCase() : 'S'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{session.student?.user?.name}</h2>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex flex-row md:flex-col justify-between w-full md:w-auto gap-2 md:gap-1">
                                        <div className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider w-fit ${
                                            session.status === 'booked' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                            session.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                            'bg-rose-100 text-rose-700 border border-rose-200'
                                        }`}>
                                            {session.status}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div className="flex items-center gap-1 w-full md:w-auto">
                                        <p className="text-muted-foreground">Subject:</p>
                                        <span className="text-foreground font-semibold">{session.subject || 'N/A'}</span>
                                    </div>

                                    {/* Date & Time */}
                                    <div className="flex flex-col">
                                        <div className="flex flex-wrap items-center gap-3 mt-1">
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded-md">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{session.scheduled_day} | {session.scheduled_date}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded-md">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{session.scheduled_time}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Student Note */}
                                    <div className="flex flex-col w-full">
                                        <p className="text-muted-foreground">Note:</p>
                                        <span className="text-foreground text-sm line-clamp-2">{session.student_note || 'No note'}</span>
                                    </div>

                                    <Separator />

                                    {/* Action Buttons */}
                                    <div className="flex flex-col w-full gap-2">
                                        <Button
                                            onClick={() => navigate(`/dashboard/my-sessions/view/${session?.id}`)}
                                            className="w-full bg-primary hover:bg-primary/90 text-white shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                                        >
                                            <Video className="w-4 h-4 mr-2" />
                                            {session.status == "booked" ? "Start Session" : "View Session"}
                                        </Button>

                                        <MessageButton
                                            recieverUser={session.student.user}
                                            variant="outline" 
                                            className="h-10 w-full mt-2 text-muted-foreground hover:text-primary hover:bg-primary/10 ml-auto md:ml-0 cursor-pointer"
                                            
                                        >
                                            <div className="flex w-full items-center justify-center gap-2">
                                                <MessageSquare  /> 
                                                <p>Message</p>
                                            </div>
                                        </MessageButton>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 border border-dashed border-border rounded-xl col-span-full">
                            <VideoOff className="h-10 w-10 text-text-weak mx-auto" />
                            <p className="text-muted-foreground font-medium">No sessions found for this category</p>
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
};

const MySessionsSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card p-6 rounded-xl border border-border/60 space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="w-10 h-10 rounded-lg" />
                            <Skeleton className="w-24 h-4" />
                        </div>
                        <Skeleton className="w-16 h-8" />
                    </div>
                ))}
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex flex-wrap gap-2 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="w-24 h-10 rounded-lg" />
                ))}
            </div>
            
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                    <div
                        key={index}
                        className="flex flex-col gap-2 bg-background border border-border/60 rounded-xl p-4"
                    >
                        {/* Student Avatar & Name */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-5 rounded w-32" />
                            </div>
                        </div>
                        {/* Status Badge */}
                        <div className="flex flex-row md:flex-col justify-between w-full md:w-auto gap-2 md:gap-1">
                            <Skeleton className="h-5 rounded w-20" />
                        </div>
                        {/* Subject */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Skeleton className="h-4 rounded w-14" />
                            <Skeleton className="h-4 rounded w-24" />
                        </div>
                        {/* Date and Time slots */}
                        <div className="flex flex-col">
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                <Skeleton className="h-6 rounded-md w-28" />
                                <Skeleton className="h-6 rounded-md w-20" />
                            </div>
                        </div>
                        {/* Note */}
                        <div className="flex flex-col w-full gap-1">
                            <Skeleton className="h-4 rounded w-10" />
                            <Skeleton className="h-4 rounded w-full" />
                        </div>
                        <Separator />
                        {/* Action buttons */}
                        <div className="flex flex-col w-full gap-2">
                            <Skeleton className="h-10 rounded w-full" />
                            <Skeleton className="h-10 rounded w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MySessions;