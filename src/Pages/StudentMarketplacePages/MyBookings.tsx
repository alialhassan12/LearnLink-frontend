import { Calendar, Clock, MessageSquare, Wallet, CalendarCheck, Clock8 } from "lucide-react";
import useBookingStore from "../../store/bookingStore";
import { useEffect, useState } from "react";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import type { user } from "../../@types/user";
import MessageButton from "../../components/MessageButton";

const MyBookings = () => {
    const { studentBookings, getStudentBookings, isGettingStudentBookings } = useBookingStore();
    const [filterTabs, setFilterTabs] = useState("all");

    useEffect(() => {
        getStudentBookings();
    }, []);

    const filteredBookings = studentBookings.filter((booking) =>
        filterTabs === "all" || booking.status === filterTabs
    );

    const stats = [
        {
            title: "Total Spent",
            value: `$${studentBookings.reduce((total,booking)=>booking.status==="approved"?total+Number(booking.price):total,0)}`,
            icon: Wallet,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            title: "Upcoming Sessions",
            value: studentBookings.filter(b => b.status === "approved").length,
            icon: CalendarCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-100"
        },
        {
            title: "Pending Requests",
            value: studentBookings.filter(b => b.status === "pending").length,
            icon: Clock8,
            color: "text-amber-600",
            bg: "bg-amber-100"
        }
    ];

    if (isGettingStudentBookings) {
        return <SkeletonBookingState />;
    }

    if (studentBookings.length === 0) {
        return <EmptyBookingState />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">My Bookings</h1>
                    <p className="text-muted-foreground mt-1">Manage your learning sessions and track your progress.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-background border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                                <p className="text-2xl font-bold text-foreground mt-0.5">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Separator className="my-8 opacity-50" />

            {/* Filters and List */}
            <Tabs defaultValue="all" className="w-full" onValueChange={setFilterTabs}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <TabsList className="bg-secondary/50 p-1 rounded-xl">
                        <TabsTrigger value="all" className="rounded-lg px-6">All</TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-lg px-6">Pending</TabsTrigger>
                        <TabsTrigger value="approved" className="rounded-lg px-6">Approved</TabsTrigger>
                        <TabsTrigger value="rejected" className="rounded-lg px-6">Rejected</TabsTrigger>
                    </TabsList>
                    <div className="text-sm text-muted-foreground font-medium bg-secondary/30 px-3 py-1.5 rounded-full">
                        Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                            <div key={booking.id} className="group relative bg-background border border-border/60 rounded-2xl p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
                                {/* Status bar accent */}
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                    booking.status === 'approved' ? 'bg-emerald-500' :
                                    booking.status === 'rejected' ? 'bg-rose-500' :
                                    'bg-amber-500'
                                }`} />

                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-4">
                                    {/* Teacher Info */}
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <Avatar className="h-16 w-16 border-2 border-background ring-2 ring-primary/10 shadow-sm">
                                                <AvatarImage src={booking.teacher?.user?.avatar} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                                                    {booking.teacher?.user.name?.[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background ${
                                                booking.status === 'approved' ? 'bg-emerald-500' :
                                                booking.status === 'rejected' ? 'bg-rose-500' :
                                                'bg-amber-500'
                                            }`} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                {booking.teacher?.user.name}
                                            </h3>
                                            <h3 className="text-lg">
                                                Subject: <span className="text-primary font-semibold">{booking.subject}</span>
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-secondary/40 px-2.5 py-1 rounded-lg">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span>{booking.scheduled_day}, {booking.scheduled_date}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-secondary/40 px-2.5 py-1 rounded-lg">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    <span>{booking.scheduled_time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price and Status */}
                                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-border/40">
                                        <div className="text-2xl font-black text-foreground">${booking.price}</div>
                                        <div className={`px-4 py-1 rounded-full text-[11px] uppercase font-bold tracking-widest border ${
                                            booking.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            booking.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                            'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                            {booking.status}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        <MessageButton 
                                            variant="outline" 
                                            recieverUser={booking?.teacher?.user as user}
                                            className="flex-1 lg:flex-none h-11 px-6 rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary transition-all duration-300"
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Message Teacher
                                        </MessageButton>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-border/60 rounded-3xl bg-secondary/10">
                            <div className="bg-background w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Calendar className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">No bookings found</h3>
                            <p className="text-muted-foreground mt-1">Try adjusting your filter or book a new session.</p>
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
};

const SkeletonBookingState = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-8">
        <div className="space-y-2">
            <div className="h-10 bg-secondary rounded-lg w-64" />
            <div className="h-5 bg-secondary/60 rounded-lg w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-secondary rounded-2xl" />
            ))}
        </div>
        <div className="h-12 bg-secondary rounded-xl w-full max-w-md" />
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-secondary rounded-2xl" />
            ))}
        </div>
    </div>
);

const EmptyBookingState = () => (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-primary/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-primary/[0.02]">
            <Calendar className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-4xl font-black text-foreground mb-4">Your Schedule is Empty</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10">
            Start your learning journey today! Browse our marketplace and find the perfect teacher for your goals.
        </p>
        <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300">
            Browse Teachers
        </Button>
    </div>
);

export default MyBookings;
