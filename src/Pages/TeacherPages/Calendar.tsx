import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCalendarStore } from "../../store/calendarStore";
import { Skeleton } from "../../components/ui/skeleton";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "../../components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import MessageButton from "../../components/MessageButton";
import { cn } from "../../lib/utils";
import { 
    Calendar as CalendarIcon, 
    Clock, 
    MessageSquare, 
    TrendingUp, 
    CheckCircle2, 
    AlertCircle, 
    XCircle,
    DollarSign
} from "lucide-react";
import type { Booking } from "../../@types/booking";

export default function Calendar() {
    const { isGettingTeacherEvents, getTeacherEvents, teacherEvents } = useCalendarStore();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        getTeacherEvents();
    }, []);

    // Format events for FullCalendar
    const events = teacherEvents.map((event) => {
        return {
            id: String(event.id),
            title: event.subject,
            start: new Date(`${event.scheduled_date}T${event.scheduled_time}`).toISOString(),
            extendedProps: {
                booking: event
            }
        };
    });

    // Upcoming sessions (today and in the future), sorted chronologically
    const upcomingEvents = teacherEvents
        .filter((event) => {
            const eventDate = new Date(`${event.scheduled_date}T${event.scheduled_time}`);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return eventDate >= today;
        })
        .sort((a, b) => {
            const dateA = new Date(`${a.scheduled_date}T${a.scheduled_time}`).getTime();
            const dateB = new Date(`${b.scheduled_date}T${b.scheduled_time}`).getTime();
            return dateA - dateB;
        })
        .slice(0, 5);

    // Calculate Statistics
    const totalBookings = teacherEvents.length;
    const approvedBookingsCount = teacherEvents.filter(e => e.status === 'approved').length;
    const pendingBookingsCount = teacherEvents.filter(e => e.status === 'pending' || !e.status).length;
    const estimatedRevenue = teacherEvents
        .filter(e => e.status === 'approved')
        .reduce((sum, curr) => sum + (curr.price || 0), 0);

    if (isGettingTeacherEvents) {
        return <CalendarSkeleton />;
    }

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-medium text-text-strong">Schedule Calendar</h1>
                <p className="text-sm text-text-weak">Manage and view your upcoming teaching slots, classes, and student bookings.</p>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: FullCalendar */}
                <div className="lg:col-span-8 xl:col-span-9 bg-card border border-border/60 rounded-xl p-5 shadow-xs relative">
                    <style>{`
                        /* CSS OVERRIDES FOR FULLCALENDAR TO MATCH THE SHADCN STYLE */
                        .fc {
                            --fc-border-color: var(--border);
                            --fc-button-bg-color: var(--bg-1);
                            --fc-button-border-color: var(--border);
                            --fc-button-text-color: var(--text-strong);
                            --fc-button-hover-bg-color: var(--bg-2);
                            --fc-button-hover-border-color: var(--border);
                            --fc-button-active-bg-color: var(--primary);
                            --fc-button-active-border-color: var(--primary);
                            --fc-button-active-text-color: white;
                            --fc-today-bg-color: var(--bg-2);
                            font-family: inherit;
                        }
                        .fc .fc-toolbar-title {
                            font-size: 1.125rem;
                            font-weight: 600;
                            color: var(--text-strong);
                        }
                        .fc .fc-button {
                            padding: 0.375rem 0.75rem;
                            font-size: 0.875rem;
                            font-weight: 500;
                            border-radius: var(--radius-md) !important;
                            transition: all 0.2s ease;
                            text-transform: capitalize;
                        }
                        .fc .fc-button-primary:not(:disabled).fc-button-active,
                        .fc .fc-button-primary:not(:disabled):active {
                            background-color: var(--primary) !important;
                            border-color: var(--primary) !important;
                            color: white !important;
                        }
                        .fc .fc-button-primary:focus {
                            box-shadow: none !important;
                        }
                        .fc-theme-standard td, .fc-theme-standard th {
                            border-color: var(--border) !important;
                        }
                        .fc-col-header-cell {
                            padding: 0.5rem 0 !important;
                            font-weight: 600;
                            color: var(--text-strong);
                            background-color: var(--bg-2);
                        }
                        .fc-daygrid-day {
                            transition: background-color 0.2s ease;
                        }
                        .fc-daygrid-day:hover {
                            background-color: var(--bg-2);
                        }
                        .fc-day-today {
                            background-color: var(--fc-today-bg-color) !important;
                        }
                        .fc-event {
                            border: none !important;
                            background: transparent !important;
                            padding: 0 !important;
                            margin: 1px 2px !important;
                        }
                        .fc-h-event {
                            background-color: transparent !important;
                            border: none !important;
                        }
                        /* Dark Mode adjustments for FullCalendar icon/texts */
                        .fc .fc-button-primary {
                            background-color: var(--bg-1) !important;
                            border: 1px solid var(--border) !important;
                            color: var(--text-strong) !important;
                        }
                        .fc .fc-button-primary:hover {
                            background-color: var(--bg-2) !important;
                        }
                        .fc .fc-button-primary:disabled {
                            opacity: 0.5;
                        }
                    `}</style>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        nowIndicator={true}
                        validRange={{
                            start: new Date().toISOString().split("T")[0],
                        }}
                        eventClick={(info) => {
                            const booking = info.event.extendedProps.booking;
                            setSelectedBooking(booking);
                            setIsDetailsOpen(true);
                        }}
                        events={events}
                        eventContent={(eventInfo) => {
                            const booking = eventInfo.event.extendedProps.booking;
                            const status = booking?.status || "pending";
                            const colorClasses = 
                                status === "approved" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-2 border-emerald-500" :
                                status === "rejected" ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-l-2 border-rose-500" :
                                "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-l-2 border-amber-500";
                            return (
                                <div className={`flex flex-col gap-0.5 px-2 py-1 rounded-md text-xs w-full overflow-hidden truncate transition-all hover:opacity-90 cursor-pointer ${colorClasses}`}>
                                    <div className="font-semibold truncate">{eventInfo.event.title}</div>
                                    <div className="text-[10px] opacity-80 truncate">{eventInfo.timeText}</div>
                                </div>
                            );
                        }}
                        height="auto"
                    />
                </div>

                {/* Right Side: Stats and Upcoming List */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 w-full">
                    
                    {/* Quick Stats Panel */}
                    <div className="bg-card border border-border/60 rounded-xl p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2 font-semibold text-text-strong">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <span>Schedule Stats</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center p-3 bg-secondary/15 rounded-lg border border-border/30">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-primary/10 rounded-md">
                                        <CalendarIcon className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium text-text-strong">Total Bookings</span>
                                </div>
                                <span className="font-bold text-lg text-text-strong">{totalBookings}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-secondary/15 rounded-lg border border-border/30">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-emerald-500/10 rounded-md">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="text-sm font-medium text-text-strong">Approved</span>
                                </div>
                                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{approvedBookingsCount}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-secondary/15 rounded-lg border border-border/30">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-amber-500/10 rounded-md">
                                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <span className="text-sm font-medium text-text-strong">Pending</span>
                                </div>
                                <span className="font-bold text-lg text-amber-600 dark:text-amber-400">{pendingBookingsCount}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-secondary/15 rounded-lg border border-border/30">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-primary/10 rounded-md">
                                        <DollarSign className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium text-text-strong">Est. Earnings</span>
                                </div>
                                <span className="font-bold text-lg text-primary">${estimatedRevenue}</span>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Sessions List */}
                    <div className="bg-card border border-border/60 rounded-xl p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-text-strong">Upcoming Sessions</span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-full">Next 5</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <div 
                                        key={event.id}
                                        onClick={() => {
                                            setSelectedBooking(event);
                                            setIsDetailsOpen(true);
                                        }}
                                        className="flex items-start gap-3 p-3 bg-secondary/10 hover:bg-secondary/20 border border-border/40 rounded-lg cursor-pointer transition-all duration-200 group"
                                    >
                                        <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
                                            <AvatarImage src={event.student?.user?.avatar_url} />
                                            <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                                                {event.student?.user?.name ? event.student.user.name[0].toUpperCase() : "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 flex flex-col overflow-hidden">
                                            <div className="flex justify-between items-start gap-1">
                                                <span className="font-semibold text-xs text-text-strong truncate group-hover:text-primary transition-colors">
                                                    {event.student?.user?.name || "Student"}
                                                </span>
                                                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full shrink-0 font-extrabold ${
                                                    event.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                                                    event.status === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' :
                                                    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                                }`}>
                                                    {event.status || 'pending'}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-medium text-text-strong mt-0.5 truncate">{event.subject}</span>
                                            <div className="flex items-center gap-1 text-[10px] text-text-weak mt-1">
                                                <CalendarIcon className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{event.scheduled_date} | {event.scheduled_time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 border border-dashed border-border rounded-lg">
                                    <p className="text-xs text-text-weak font-medium">No upcoming sessions</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Details Sheet Overlay */}
            <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card p-4">
                    <SheetHeader className="border-b border-border pb-4">
                        <SheetTitle className="text-xl font-bold flex items-center gap-2 text-text-strong">
                            <CalendarIcon className="w-5 h-5 text-primary" /> Session Details
                        </SheetTitle>
                        <SheetDescription className="text-text-weak">
                            Comprehensive details of this student session.
                        </SheetDescription>
                    </SheetHeader>
                    {selectedBooking && (
                        <div className="flex flex-col gap-5 mt-5">
                            {/* Subject and Price */}
                            <div className="flex justify-between items-start border-b border-border pb-4">
                                <div className="overflow-hidden">
                                    <span className="text-[10px] font-bold text-text-weak uppercase tracking-wider">Subject</span>
                                    <h3 className="text-base font-bold text-text-strong mt-0.5 break-words">{selectedBooking.subject}</h3>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-[10px] font-bold text-text-weak uppercase tracking-wider">Session Price</span>
                                    <div className="text-lg font-extrabold text-primary mt-0.5">${selectedBooking.price}</div>
                                </div>
                            </div>

                            {/* Date, Time & Status */}
                            <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
                                <div>
                                    <span className="text-[10px] font-bold text-text-weak uppercase tracking-wider flex items-center gap-1">
                                        <CalendarIcon className="w-3 h-3 text-primary" /> Date & Day
                                    </span>
                                    <p className="font-semibold text-text-strong text-sm mt-1">{selectedBooking.scheduled_date}</p>
                                    <p className="text-[11px] text-text-weak">{selectedBooking.scheduled_day}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-text-weak uppercase tracking-wider flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-primary" /> Start Time
                                    </span>
                                    <p className="font-semibold text-text-strong text-sm mt-1">{selectedBooking.scheduled_time}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[10px] font-bold text-text-weak uppercase tracking-wider">Status</span>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            selectedBooking.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' :
                                            selectedBooking.status === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-900' :
                                            'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                                        }`}>
                                            {selectedBooking.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                                            {selectedBooking.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                            {selectedBooking.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                                            {selectedBooking.status || 'pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Student Profile Card */}
                            <div className="flex flex-col gap-2 border-b border-border pb-4">
                                <span className="text-[10px] font-bold text-text-weak uppercase tracking-wider">Student Info</span>
                                {selectedBooking.student?.user ? (
                                    <div className="flex items-center gap-3 bg-secondary/15 p-3 rounded-lg border border-border/30">
                                        <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
                                            <AvatarImage src={selectedBooking.student.user.avatar_url} />
                                            <AvatarFallback className="bg-primary/5 text-primary font-bold text-sm">
                                                {selectedBooking.student.user.name[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-bold text-text-strong text-sm truncate">{selectedBooking.student.user.name}</span>
                                            <span className="text-[11px] text-text-weak truncate">{selectedBooking.student.user.email}</span>
                                            {selectedBooking.student.headline && (
                                                <span className="text-[11px] text-primary font-semibold mt-0.5 truncate">{selectedBooking.student.headline}</span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-text-weak italic">No profile details available</p>
                                )}
                            </div>

                            {/* Student Notes */}
                            <div className="flex flex-col gap-2 border-b border-border pb-4">
                                <span className="text-[10px] font-bold text-text-weak uppercase tracking-wider">Student's Notes</span>
                                <div className="bg-secondary/10 p-3 rounded-lg border border-border/30 text-xs text-text-strong leading-relaxed italic">
                                    {selectedBooking.student_note || "No note was attached to this booking."}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {selectedBooking.student?.user && (
                                <div className="mt-2">
                                    <MessageButton
                                        recieverUser={selectedBooking.student.user}
                                        variant="outline"
                                        className="h-11 w-full text-muted-foreground hover:text-primary hover:bg-primary/10 border-primary/20 hover:border-primary/50 cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Message Student
                                    </MessageButton>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

const CalendarSkeleton = () => {
    return (
        <div className="flex flex-col gap-6 w-full animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-64 rounded-md" />
                <Skeleton className="h-4 w-96 rounded-md" />
            </div>

            {/* Layout Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                {/* Main Calendar Area Skeleton */}
                <div className="lg:col-span-8 xl:col-span-9 bg-card border border-border/50 rounded-xl p-5 flex flex-col gap-4">
                    {/* Month header control */}
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-1">
                            <Skeleton className="h-9 w-12 rounded-md" />
                            <Skeleton className="h-9 w-12 rounded-md" />
                            <Skeleton className="h-9 w-16 rounded-md" />
                        </div>
                        <Skeleton className="h-6 w-36 rounded-md" />
                        <div className="flex gap-1">
                            <Skeleton className="h-9 w-16 rounded-md" />
                            <Skeleton className="h-9 w-16 rounded-md" />
                            <Skeleton className="h-9 w-16 rounded-md" />
                        </div>
                    </div>
                    
                    {/* Day Grid Skeletons */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Weekday headers */}
                        {[...Array(7)].map((_, i) => (
                            <Skeleton key={i} className="h-6 w-full rounded-md" />
                        ))}
                        {/* Calendar cells (simulating 35 cells for a month) */}
                        {[...Array(35)].map((_, i) => (
                            <div key={i} className="aspect-square border border-border/20 rounded-md p-1 flex flex-col justify-between">
                                <Skeleton className="h-3 w-4 rounded" />
                                {i % 7 === 2 && <Skeleton className="h-4 w-11/12 rounded bg-amber-500/10" />}
                                {i % 7 === 4 && <Skeleton className="h-4 w-10/12 rounded bg-emerald-500/10" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar area skeleton */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 w-full">
                    {/* Stats Widget */}
                    <div className="bg-card border border-border/50 rounded-xl p-5 flex flex-col gap-3">
                        <Skeleton className="h-5 w-28 rounded-md" />
                        <div className="grid grid-cols-1 gap-2 mt-1">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-secondary/10 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-8 h-8 rounded bg-primary/10" />
                                        <Skeleton className="h-4 w-16 rounded" />
                                    </div>
                                    <Skeleton className="h-5 w-8 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming List Skeletons */}
                    <div className="bg-card border border-border/50 rounded-xl p-5 flex flex-col gap-4">
                        <Skeleton className="h-5 w-36 rounded" />
                        <div className="flex flex-col gap-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <div className="flex justify-between items-start">
                                            <Skeleton className="h-4 w-20 rounded" />
                                            <Skeleton className="h-3 w-10 rounded" />
                                        </div>
                                        <Skeleton className="h-3 w-16 rounded" />
                                        <Skeleton className="h-3 w-28 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};