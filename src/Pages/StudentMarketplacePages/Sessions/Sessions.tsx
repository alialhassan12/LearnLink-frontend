import { useEffect, useState } from "react";
import { useLiveSessionStore } from "../../../store/liveSessionsStore";
import { Calendar, CalendarCheck, CalendarDays, Clock, Clock8, Video } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Skeleton } from "../../../components/ui/skeleton";

const SessionsSkeleton = () => {
    return (
        <div className="px-4 py-4 space-y-6 animate-in fade-in duration-500">
            {/* top section skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="flex flex-row gap-2 w-full md:w-auto">
                    <Skeleton className="h-20 w-32 rounded-lg" />
                    <Skeleton className="h-20 w-32 rounded-lg" />
                </div>
            </div>

            {/* next session skeleton */}
            <Skeleton className="w-full h-[300px] md:h-[400px] rounded-lg" />

            {/* tabs skeleton */}
            <div className="space-y-4">
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-28" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
};

const Sessions = ()=>{
    const {studentLiveSessions,getStudentLiveSessions,isGettingStudentLiveSessions}=useLiveSessionStore();
    const [filterTabs,setFilterTabs]=useState<string>("booked");
    const navigate=useNavigate();

    
    useEffect(()=>{
        getStudentLiveSessions();
    },[getStudentLiveSessions]);
    
    const cards=[
        {
            title:"Scheduled",
            value:studentLiveSessions.filter((s)=>s.status==="booked").length,
            icon:CalendarDays,
        },
        {
            title:"Completed",
            value:studentLiveSessions.filter((s)=>s.status==="completed").length,
            icon:CalendarCheck,
        }
    ];

    // get next session
    const nextSession=studentLiveSessions.filter((s)=>s.status==="booked").sort((a,b)=>new Date(a.scheduled_date).getTime()-new Date(b.scheduled_date).getTime())[0];
    
    // filtered sessions
    const filteredSessions = studentLiveSessions.filter((s) => s.status === filterTabs);

    if (isGettingStudentLiveSessions) {
        return <SessionsSkeleton />;
    }

    return (
        <div className="px-4 py-6 max-w-7xl mx-auto space-y-8">
            {/* top section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-text-strong tracking-tight">My Sessions</h1>
                    <p className="text-text-weak text-base">Manage your upcoming and past learning experiences.</p>
                </div>
                <div className="flex flex-row gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {cards.map((card, index) => {
                        return (
                            <div key={index} className="flex flex-row p-4 bg-card border border-border rounded-xl justify-center items-center gap-3 min-w-[140px] flex-1 md:flex-none shadow-sm">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <card.icon className="text-primary w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-xs font-medium text-text-weak uppercase tracking-wider">{card.title}</p>
                                    <p className="text-2xl text-text-strong font-bold">{card.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* next session section */}
            {nextSession ? (
                <div className="relative overflow-hidden w-full rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/20 shadow-xl p-6 md:p-12 lg:p-16">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32" />

                    <div className="relative flex flex-col lg:flex-row justify-between items-center gap-10">
                        <div data-aos="fade-right" className="flex flex-col gap-6 w-full lg:w-[60%]">
                            <div className="flex flex-row gap-2 items-center text-primary bg-primary/10 px-3 py-1.5 rounded-full w-max border border-primary/20">
                                <Clock8 size={16} className="animate-pulse" />
                                <p className="text-xs font-bold uppercase tracking-widest">Happening Soon</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col text-3xl md:text-4xl font-bold text-text-strong leading-tight">
                                    <p>Next Session <span className="text-primary">{nextSession?.subject}</span></p>
                                    <p>with <span className="text-primary">{nextSession?.teacher?.user?.name}</span></p>
                                </div>
                                <div className="flex flex-wrap gap-4 text-lg">
                                    <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-border">
                                        <Calendar className="text-primary w-5 h-5" />
                                        <span className="font-semibold">{nextSession?.scheduled_day}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-border">
                                        <Clock className="text-primary w-5 h-5" />
                                        <span className="font-semibold">{nextSession?.scheduled_time}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-lg text-text-weak leading-relaxed max-w-xl">
                                Get your materials ready and ensure your camera is working. Your mentor is looking forward to seeing you!
                            </p>

                            <Button
                                onClick={() => navigate(`/marketplace/live-sessions/${nextSession?.id}`)}
                                className="w-full sm:w-fit h-12 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Join Preparation Room
                            </Button>
                        </div>

                        <div data-aos="fade-left" className="relative group">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500 scale-110" />
                            <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full border-4 border-primary/20 p-2 bg-background overflow-hidden shadow-2xl">
                                <img
                                    src={nextSession?.teacher?.user?.avatar}
                                    alt={nextSession?.teacher?.user?.name}
                                    className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : !isGettingStudentLiveSessions && (
                <div className="w-full rounded-2xl bg-muted/30 border border-dashed border-border p-12 text-center">
                    <p className="text-xl text-text-weak">No upcoming sessions scheduled yet.</p>
                </div>
            )}
            <div className="space-y-6">
                <Tabs value={filterTabs} onValueChange={(value) => setFilterTabs(value)} className="w-full">
                    <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
                        <TabsTrigger value="booked" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Scheduled</TabsTrigger>
                        <TabsTrigger value="completed" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Completed</TabsTrigger>
                        <TabsTrigger value="cancelled" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Cancelled</TabsTrigger>
                    </TabsList>

                    <div className="space-y-4">
                        {filteredSessions.length > 0 ? (
                            filteredSessions.map((session) => {
                                return (
                                    <div key={session.id} className="group flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card rounded-2xl p-6 border border-border/60 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-14 h-14 border-2 border-primary/10 ring-2 ring-background ring-offset-2 ring-offset-primary/5">
                                                    <AvatarImage src={session.teacher?.user?.avatar} />
                                                    <AvatarFallback className="bg-primary/5 text-primary font-bold text-xl">
                                                        {session.teacher?.user?.name ? session.teacher.user.name[0] : 'T'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-text-strong font-bold text-lg group-hover:text-primary transition-colors">{session.teacher?.user?.name}</p>
                                                    <p className="text-md">
                                                        Subject: <span className="text-primary font-semibold">{session.subject}</span>
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border ${
                                                            session.status === 'booked' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                            session.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                            'bg-rose-50 text-rose-600 border-rose-200'
                                                        }`}>
                                                            {session.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="hidden sm:block h-10 w-px bg-border/60 mx-2" />

                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-text-weak group-hover:text-text-strong transition-colors">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span className="text-sm font-medium">{new Date(session.scheduled_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-text-weak group-hover:text-text-strong transition-colors">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    <span className="text-sm font-medium">{session.scheduled_time}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <Button
                                                onClick={() => navigate(`/marketplace/live-sessions/${session.id}`)}
                                                variant={session.status === 'booked' ? "default" : "outline"}
                                                className="w-full md:w-auto h-11 px-8 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                <Video className="w-4 h-4 mr-2" />
                                                {session.status === "booked" ? "Join Session" : "View Details"}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 rounded-2xl bg-muted/20 border-2 border-dashed border-border p-8 text-center">
                                <div className="p-4 bg-background rounded-full mb-4 shadow-sm">
                                    <Video className="w-8 h-8 text-text-weak" />
                                </div>
                                <h3 className="text-xl font-bold text-text-strong">No {filterTabs} sessions found</h3>
                                <p className="text-text-weak mt-2">When you book sessions, they will appear here.</p>
                            </div>
                        )}
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
       
export default Sessions