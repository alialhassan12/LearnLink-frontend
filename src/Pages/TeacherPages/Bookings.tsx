import { Calendar, Check, Clock, MessageSquare, X } from "lucide-react";
import useBookingStore from "../../store/bookingStore";
import { useEffect, useState } from "react";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import MessageButton from "../../components/MessageButton";
import { toast } from "sonner";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "../../components/ui/pagination";

const Bookings = () => {
    const {teacherBookings,isGettingTeacherBookings,getTeacherBookings,teacherBookingsPagination,isRejectingBooking,rejectBooking,approveBooking,isApprovingBooking,max_live_sessions,current_live_sessions}=useBookingStore();
    const [selectedBooking,setSelectedBooking]=useState<number | null>(null);
    // const pendingBookings=teacherBookings.filter((booking)=>booking.status==="pending");
    // const approvedBookings=teacherBookings.filter((booking)=>booking.status==="approved");
    // const rejectedBookings=teacherBookings.filter((booking)=>booking.status==="rejected");
    // const cards=[
    //     {
    //         title:"pending bookings",
    //         value:pendingBookings.length,
    //         icon:ClipboardClock
    //     },
    //     {
    //         title:"approved bookings",
    //         value:approvedBookings.length,
    //         icon:ClipboardCheck
    //     },
    //     {
    //         title:"rejected bookings",
    //         value:rejectedBookings.length,
    //         icon:ClipboardX
    //     }
    // ];
    const [filterTabs,setFilterTabs]=useState("all");
    const filteredBookings = (teacherBookings ?? []).filter((booking)=>filterTabs==="all"|| booking.status === filterTabs);

    useEffect(() => {
        getTeacherBookings();
    }, []);

    const handleRejectBooking=async(booking_id:number)=>{
        await rejectBooking(booking_id);
    }
    const handleApproveBooking=async(booking_id:number)=>{
        if(current_live_sessions>=max_live_sessions){
            return toast.error("You have reached the maximum number of live sessions allowed per month. Please upgrade your subscription plan or wait for the next month.");
        }
        await approveBooking(booking_id);
    }

    if(isGettingTeacherBookings){
        return <SkeletonBookingState />;
    }
    if((teacherBookings ?? []).length ===0){
        return <EmptyBookingState />;
    }

    return (
        <div>
            {/* summary cards */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {cards.map((card, index) => (
                    <div key={index} className="bg-background border border-border/60 rounded-xl p-6 text-left hover:border-primary transition-all duration-200 shadow-sm group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <card.icon className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{card.title}</span>
                        </div>
                        <div className="text-3xl font-bold">{card.value}</div>
                    </div>
                ))}
            </div> */}
            {/* Live Sessions Tracker */}
            <div className="flex flex-col items-center gap-1 text-foreground mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <p className="font-medium">Live Sessions Tracker: {current_live_sessions} / {max_live_sessions} per month</p>
                </div>
                <div className="w-full bg-primary/10 rounded-full h-2 dark:bg-primary/20">
                    <div className="bg-primary h-2 rounded-full max-w-[100%]" style={{width: `${(current_live_sessions / max_live_sessions) * 100}%`}}></div>
                </div>
                {
                    (current_live_sessions>=max_live_sessions) && (
                        <div className="text-sm font-medium text-destructive w-full text-left p-2">
                            <p>You have reached your monthly limit of live sessions.</p>
                            <p>You cant approve new booking until next month.</p>
                            <p>Upgrade your subscription to increase your live sessions limit.</p>
                        </div>
                    )
                }
            </div>
            <Separator className="my-4"/>
            {/* filter section */}
            <Tabs 
                defaultValue={filterTabs} 
                onValueChange={(value)=>setFilterTabs(value)}
                className='w-full'
            >
                <TabsList className='w-full'>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
                {/* booking list */}
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBookings && filteredBookings.length > 0 && (
                        filteredBookings.map((booking) => {
                            return (
                                <div key={booking.id} className=" flex flex-col gap-2  bg-background border border-border/60 rounded-xl hover:shadow-md transition-all duration-200 p-4 group">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <Avatar className="h-12 w-12 border-2 border-primary/10">
                                            <AvatarImage src={booking.student?.user?.avatar_url} />
                                            <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                                                {booking.student?.user?.name?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{booking.student?.user?.name}</h2>
                                        </div>
                                    </div>
                                    <div className="flex flex-row md:flex-col justify-between w-full md:w-auto gap-2 md:gap-1">
                                        <div className="text-xl font-bold text-foreground">${booking.price}</div>
                                        <div className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider w-fit ${
                                            booking.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                            booking.status === 'rejected' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                            'bg-amber-100 text-amber-700 border border-amber-200'
                                        }`}>
                                            {booking.status}
                                        </div>
                                    </div>
                                    {/* subject */}
                                    <div className="flex items-center gap-1 w-full md:w-auto">
                                        <p className="text-muted-foreground">Subject:</p>
                                        <span className="text-foreground font-semibold">{booking.subject}</span>
                                    </div>
                                    {/* date time */}
                                    <div className="flex flex-col">
                                        <div className="flex flex-wrap items-center gap-3 mt-1">
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded-md">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{booking.scheduled_day} | {booking.scheduled_date}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded-md">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{booking.scheduled_time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* student note */}
                                    <div className="flex flex-col w-full">
                                        <p className="text-muted-foreground">Note:</p>
                                        <span className="text-foreground text-sm line-clamp-2">{booking.student_note || 'No note'}</span>
                                    </div>
                                    <Separator/>
                                    {/* action buttons */}
                                    <div className="flex flex-col w-full">
                                        {booking.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedBooking(booking.id ?? null);
                                                        handleApproveBooking(booking.id ?? 0)
                                                    }}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    {isApprovingBooking && selectedBooking === booking.id ?(  
                                                        <>
                                                            <Spinner/>
                                                            Approving...
                                                        </>
                                                    ):   
                                                        <>
                                                            <Check className="w-4 h-4 mr-2" />
                                                            Approve
                                                        </>
                                                    }
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setSelectedBooking(booking.id ?? null);
                                                        handleRejectBooking(booking.id ?? 0)}}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    {isRejectingBooking && selectedBooking === booking.id ?(  
                                                        <>
                                                            <Spinner/>
                                                            Rejecting...
                                                        </>
                                                    ):   
                                                        <>
                                                            <X className="w-4 h-4 mr-2" />
                                                            Reject
                                                        </>
                                                    }
                                                </Button>
                                            </div>
                                        )}
                                        {/* message btn */}
                                        <MessageButton
                                            recieverUser={booking.student?.user!}
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
                    )}
                    {filteredBookings.length===0 && (
                        <div className=" text-center py-12 border border-dashed border-border rounded-xl col-span-full mt-2">
                            <p className="text-muted-foreground font-medium">No bookings found for this filter.</p>
                        </div>
                    )}
                    {
                        (teacherBookings ?? []).length===0 &&
                        <div className=" text-center py-12 border border-dashed border-border rounded-xl col-span-full">
                            <p className="text-muted-foreground font-medium">No bookings found for this filter.</p>
                        </div>
                    }
                </div>
            </Tabs>
            <Pagination className="my-2">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious 
                            size="lg"
                            onClick={()=>{
                                if(teacherBookingsPagination?.current_page>1){
                                    getTeacherBookings(teacherBookingsPagination?.current_page - 1)
                                }
                            }}
                            className={`${teacherBookingsPagination?.current_page===1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        />
                    </PaginationItem>
                    {Array.from({length: teacherBookingsPagination?.last_page ?? 0}, (_, i)=>i+1).map((page)=>( 
                        <PaginationItem 
                            key={page}
                            className={`px-3 py-1 rounded-full ${teacherBookingsPagination?.current_page===page ? 'bg-bg-2' : ''}`}
                        >
                            {page}
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext 
                            size="lg"
                            onClick={()=>{
                                if(teacherBookingsPagination?.has_more){
                                    getTeacherBookings(teacherBookingsPagination?.current_page + 1)
                                }
                            }}
                            className={`${!teacherBookingsPagination?.has_more ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

// empty booking state
const EmptyBookingState = () => {
    return (
        <div className="text-center p-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-4">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">No Bookings Yet</h1>
            <p className="text-gray-500 mb-8">You're all caught up. Check back later when students start booking lessons with you.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {/* Placeholder Stats */}
                <div className="bg-background border border-border/60 rounded-xl p-6 text-left hover:border-primary transition-colors">
                    <div className="text-sm text-muted-foreground mb-2">Total Bookings</div>
                    <div className="text-3xl font-bold">0</div>
                </div>
                <div className="bg-background border border-border/60 rounded-xl p-6 text-left hover:border-primary transition-colors">
                    <div className="text-sm text-muted-foreground mb-2">Total Earnings</div>
                    <div className="text-3xl font-bold">$0</div>
                </div>
                <div className="bg-background border border-border/60 rounded-xl p-6 text-left hover:border-primary transition-colors">
                    <div className="text-sm text-muted-foreground mb-2">Upcoming</div>
                    <div className="text-3xl font-bold">0</div>
                </div>
            </div>
        </div>
    );
};

// skeleton loading 
const SkeletonBookingState = () => {
    return (
        <div className="animate-pulse space-y-6">
            {/* Skeleton for cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-background border border-border/60 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 bg-secondary rounded-lg"></div>
                            <div className="w-24 h-4 bg-secondary rounded"></div>
                        </div>
                        <div className="w-16 h-8 bg-secondary rounded"></div>
                    </div>
                ))}
            </div> */}
            
            <div className="h-10 w-full bg-secondary rounded-md"></div>

            {/* Skeleton for bookings grid */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                    <div
                        key={index}
                        className="flex flex-col gap-2 bg-background border border-border/60 rounded-xl p-4"
                    >
                        {/* Student Avatar & Name */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="h-12 w-12 rounded-full bg-secondary"></div>
                            <div className="flex flex-col gap-1">
                                <div className="h-5 bg-secondary rounded w-32"></div>
                            </div>
                        </div>
                        {/* Price and Status Badge */}
                        <div className="flex flex-row md:flex-col justify-between w-full md:w-auto gap-2 md:gap-1">
                            <div className="h-6 bg-secondary rounded w-16"></div>
                            <div className="h-5 bg-secondary rounded w-20"></div>
                        </div>
                        {/* Subject */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="h-4 bg-secondary rounded w-14"></div>
                            <div className="h-4 bg-secondary rounded w-24"></div>
                        </div>
                        {/* Date and Time slots */}
                        <div className="flex flex-col">
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                <div className="h-6 bg-secondary rounded-md w-28"></div>
                                <div className="h-6 bg-secondary rounded-md w-20"></div>
                            </div>
                        </div>
                        {/* Note */}
                        <div className="flex flex-col w-full gap-1">
                            <div className="h-4 bg-secondary rounded w-10"></div>
                            <div className="h-4 bg-secondary rounded w-full"></div>
                        </div>
                        <Separator />
                        {/* Action buttons (simulating Approve/Reject and Message buttons) */}
                        <div className="flex flex-col w-full gap-2">
                            {index % 2 === 0 ? (
                                // Simulate a pending booking (with action buttons + message button)
                                <>
                                    <div className="flex gap-2">
                                        <div className="h-9 bg-secondary rounded flex-1"></div>
                                        <div className="h-9 bg-secondary rounded flex-1"></div>
                                    </div>
                                    <div className="h-10 bg-secondary rounded w-full"></div>
                                </>
                            ) : (
                                // Simulate approved/rejected booking (only message button)
                                <div className="h-10 bg-secondary rounded w-full"></div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Bookings;