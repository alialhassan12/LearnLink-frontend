import { useEffect } from "react";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import useAuthStore from "../../store/authStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { BookOpen, Video, Sparkles, Check, X, TrendingUp, Loader2 } from "lucide-react";

const SubscriptionPlans = () => {
    const { authUser } = useAuthStore();
    const { getActivePlans, activePlans, isGettingPlans, currentSubscription, setCurrentSubscription,upgradeSubscription,isUpgrading } = useSubscriptionStore();
    
    useEffect(() => {
        const init = async () => {
            await getActivePlans();
            setCurrentSubscription(authUser?.subscription || null);
        };
        init();
    }, [authUser]);
    
    const handleUpgrade=async(planId:number)=>{
        await upgradeSubscription(planId);
    }

    if (isGettingPlans) {
        return <SubscriptionPlansSkeleton />;
    }

    return (
        <div className="flex flex-col items-center justify-center py-8 px-4 w-full animate-fade-in">
            {/* Page Header */}
            <div className="text-center max-w-2xl flex flex-col gap-2 mb-12">
                <h1 className="text-3xl md:text-4xl font-extrabold text-text-strong tracking-tight">
                    Subscription Plans
                </h1>
                <p className="text-text-weak text-sm md:text-base leading-relaxed">
                    Choose the plan that fits your teaching needs and unlock more courses, scheduled live sessions, and AI helper tools.
                </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl items-stretch justify-center">
                {activePlans && activePlans.length > 0 ? (
                    activePlans.map((plan) => {
                        const isCurrent = currentSubscription?.plan_id === plan.id;
                        
                        return (
                            <Card 
                                key={plan.id} 
                                className={`relative flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                                    isCurrent 
                                        ? "border-2 border-primary bg-card/60 shadow-lg scale-102 ring-2 ring-primary/10" 
                                        : "border border-border/60 hover:border-primary/30 hover:shadow-md"
                                }`}
                            >
                                {/* Active Badge Banner */}
                                {isCurrent && (
                                    <Badge 
                                        className="absolute top-3 right-3 font-semibold uppercase bg-primary text-white text-[10px] tracking-wider py-0.5 px-2.5 rounded-full"
                                    >
                                        Current Plan
                                    </Badge>
                                )}

                                <div>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-xl font-bold text-text-strong flex items-center gap-2">
                                            {plan.title}
                                        </CardTitle>
                                        
                                        {/* Price indicator */}
                                        <div className="mt-3 flex items-baseline gap-1">
                                            <span className="text-3xl font-extrabold text-text-strong">
                                                ${plan.price}
                                            </span>
                                            <span className="text-xs text-text-weak font-medium">
                                                /{plan.duration_days === 30 ? 'month' : plan.duration_days === 365 ? 'year' :plan.duration_days !== null? `${plan.duration_days} days`:"life time"}
                                            </span>
                                        </div>

                                        <CardDescription className="text-xs text-text-weak mt-2 leading-relaxed min-h-[40px]">
                                            {plan.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="pt-2 pb-6 border-t border-border/40">
                                        <p className="text-[11px] font-bold text-text-weak uppercase tracking-wider mb-4">
                                            Features Included:
                                        </p>
                                        <div className="flex flex-col gap-3.5">
                                            {/* Max Courses Feature */}
                                            <div className="flex items-center gap-3">
                                                <div className="p-1 rounded-full bg-primary/10 text-primary shrink-0">
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs text-text-strong">
                                                    Up to <strong className="font-semibold">{plan.features.max_courses}</strong> published courses
                                                </span>
                                            </div>

                                            {/* Sessions Feature */}
                                            <div className="flex items-center gap-3">
                                                <div className="p-1 rounded-full bg-primary/10 text-primary shrink-0">
                                                    <Video className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs text-text-strong">
                                                    <strong className="font-semibold">{plan.features.sessions_per_month}</strong> live sessions / month
                                                </span>
                                            </div>

                                            {/* AI Tokens Feature */}
                                            <div className="flex items-center gap-3">
                                                <div className="p-1 rounded-full bg-primary/10 text-primary shrink-0">
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs text-text-strong">
                                                    <strong className="font-semibold">{plan.features.ai_tokens_per_month.toLocaleString()}</strong> AI tokens / month
                                                </span>
                                            </div>

                                            {/* Search Priority Feature */}
                                            <div className="flex items-center gap-3">
                                                <div className="p-1 rounded-full bg-primary/10 text-primary shrink-0">
                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs text-text-strong flex items-center gap-1.5">
                                                    {plan.features.search_priority ? (
                                                        <>
                                                            Priority search visibility
                                                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            Standard search visibility
                                                            <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>

                                <CardFooter className="pt-2 pb-5">
                                    {isCurrent ? (
                                        <div className="w-full text-center py-2.5 px-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold rounded-lg text-xs border border-emerald-500/20">
                                            Currently Active Plan
                                        </div>
                                    ) : (
                                        plan.is_free?(
                                            <div className="w-full text-center py-2.5 px-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold rounded-lg text-xs border border-emerald-500/20">
                                                Auto-downgrade when upgraded plan expires
                                            </div>
                                        ):(
                                            <Button
                                                onClick={() => handleUpgrade(plan.id)}
                                                disabled={isUpgrading}
                                                className="w-full h-10 text-xs font-semibold cursor-pointer hover:bg-primary/80 transition-all duration-200"
                                            >
                                                {isUpgrading ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Processing...
                                                    </div>
                                                ):("Upgrade Plan")}
                                            </Button>
                                        )
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-12 border border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground font-medium">No active subscription plans found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SubscriptionPlansSkeleton = () => {
    return (
        <div className="flex flex-col items-center justify-center py-8 px-4 w-full animate-pulse">
            {/* Header Skeleton */}
            <div className="text-center max-w-2xl flex flex-col items-center gap-3 mb-12 w-full">
                <Skeleton className="h-9 w-64 rounded-md" />
                <Skeleton className="h-4 w-96 rounded-md mt-1" />
            </div>

            {/* Plans Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl items-stretch justify-center">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="flex flex-col justify-between p-5 border border-border/40 gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-6 w-24 rounded-md" />
                                <Skeleton className="h-8 w-32 rounded-md mt-1" />
                            </div>
                            <Skeleton className="h-4 w-full rounded-md" />
                            <Skeleton className="h-4 w-5/6 rounded-md" />
                        </div>
                        
                        <div className="flex flex-col gap-3 py-4 border-t border-b border-border/30">
                            {[...Array(4)].map((_, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-4 w-40 rounded-md" />
                                </div>
                            ))}
                        </div>

                        <Skeleton className="h-10 w-full rounded-md" />
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionPlans;