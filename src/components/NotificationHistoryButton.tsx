import { useNotificationStore } from "@/store/notificationStore";
import { useEffect } from "react";
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription, 
    SheetTrigger
} from "./ui/sheet";
import { Skeleton } from "./ui/skeleton";
import type { Notification } from "@/@types/notification";
import { 
    Bell, 
    BellOff, 
    Calendar, 
    BookOpen, 
    Sparkles, 
    Cpu, 
    MessageSquare 
} from "lucide-react";
import { Button } from "./ui/button";

// Helper to determine icon, colors, and badge indicator colors based on notification type
const getNotificationConfig = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('booking') || t.includes('session') || t.includes('calendar')) {
        return {
            icon: Calendar,
            bgClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400',
            indicatorClass: 'bg-indigo-500'
        };
    }
    if (t.includes('course') || t.includes('material') || t.includes('enroll')) {
        return {
            icon: BookOpen,
            bgClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400',
            indicatorClass: 'bg-emerald-500'
        };
    }
    if (t.includes('upgrade') || t.includes('plan') || t.includes('payment') || t.includes('money')) {
        return {
            icon: Sparkles,
            bgClass: 'bg-amber-500/10 border-amber-500/20 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400',
            indicatorClass: 'bg-amber-500'
        };
    }
    if (t.includes('ai') || t.includes('bot') || t.includes('token')) {
        return {
            icon: Cpu,
            bgClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400',
            indicatorClass: 'bg-cyan-500'
        };
    }
    if (t.includes('chat') || t.includes('message')) {
        return {
            icon: MessageSquare,
            bgClass: 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400',
            indicatorClass: 'bg-blue-500'
        };
    }
    // Default system notification
    return {
        icon: Bell,
        bgClass: 'bg-zinc-500/10 border-zinc-500/20 text-text-strong dark:bg-zinc-500/20 dark:text-text-strong',
        indicatorClass: 'bg-primary'
    };
};

// Custom helper to format dates in a friendly, relative/elapsed format
const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 0) return 'Just now';
        if (diffInSeconds < 60) return 'Just now';
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
        return '';
    }
};

const NotificationHistoryButton = () => {
    const { notifications, isGettingNotifications, getNotifications } = useNotificationStore();

    useEffect(() => {
        getNotifications();
    }, [getNotifications]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button>
                    <Bell className="cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out hover:text-primary text-text-strong" />
                </button>
            </SheetTrigger>
            <SheetContent className="flex flex-col h-full sm:max-w-md w-full p-0 gap-0">
                {/* Header */}
                <SheetHeader className="border-b border-border p-6 pb-5">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Bell className="w-5 h-5" />
                        </div>
                        <SheetTitle className="text-xl font-bold">Notifications</SheetTitle>
                    </div>
                    <SheetDescription>
                        Stay updated with bookings, course requests, and system alerts.
                    </SheetDescription>
                </SheetHeader>

                {/* Notifications Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    {isGettingNotifications ? (
                        <NotificationsLoadingSkeleton />
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                            <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 animate-pulse">
                                <BellOff className="w-8 h-8" />
                            </div>
                            <p className="text-text-strong font-semibold text-lg">All caught up!</p>
                            <p className="text-text-weak text-sm mt-1.5 max-w-[250px]">
                                You don't have any notifications at the moment. We'll let you know when something new arrives.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {notifications.map((notification: Notification, index) => {
                                const config = getNotificationConfig(notification.type);
                                const Icon = config.icon;
                                return (
                                    <div 
                                        key={notification.created_at || index} 
                                        className={`group relative flex gap-3.5 p-4 border rounded-xl transition-all duration-300 ${
                                            notification.is_read 
                                                ? 'bg-card border-border/60 hover:bg-zinc-500/5 dark:hover:bg-zinc-800/20' 
                                                : 'bg-primary/5 border-primary/20 hover:bg-primary/10 dark:bg-primary/10 dark:border-primary/30 dark:hover:bg-primary/15'
                                        }`}
                                    >
                                        {/* Unread dot indicator */}
                                        {!notification.is_read && (
                                            <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${config.indicatorClass} animate-pulse`} />
                                        )}
                                        
                                        {/* Icon wrapper */}
                                        <div className={`p-2.5 h-10 w-10 rounded-xl shrink-0 flex items-center justify-center border shadow-sm ${config.bgClass}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        {/* Description & metadata content */}
                                        <div className="flex flex-col gap-1 flex-1 min-w-0 pr-2">
                                            <p className={`text-sm font-semibold truncate ${
                                                notification.is_read ? 'text-text-strong' : 'text-primary'
                                            }`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-text-weak leading-relaxed break-words">
                                                {notification.body}
                                            </p>
                                            <span className="text-[10px] text-text-weak/80 mt-1 font-medium tracking-wide">
                                                {formatRelativeTime(notification.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

// Shimmer skeletons utilizing Shadcn UI components
export const NotificationsLoadingSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 animate-in fade-in-50">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex gap-3.5 p-4 border border-border/60 rounded-xl">
                    {/* Circle icon skeleton */}
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                            {/* Title skeleton */}
                            <Skeleton className="h-4 w-1/2" />
                            {/* Time skeleton */}
                            <Skeleton className="h-3 w-12" />
                        </div>
                        {/* Body description lines */}
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-3/4" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationHistoryButton;