import { Ban, CircleCheck, Edit, MoreVertical, Plus, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePlanStore } from "../../store/adminDashboardStores/plansStore";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";
import type { Plan } from "../../@types/plan";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";

const Plans = () => {
    const navigate = useNavigate();
    const { allPlans, getAllPlans, isGettingAllPlans } = usePlanStore();

    useEffect(() => {
        getAllPlans();
    }, [getAllPlans]);

    return (
        <div className="flex flex-col gap-6">
            {/* header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold text-text-strong">Monetization Engine</h1>
                    <p className="text-text-weak">
                        Manage your product pricing strategy. Adjust tiers, features, and billing cycles for the LearnLink ecosystem.
                    </p>
                </div>
                <Button
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 ease-in-out cursor-pointer hover:scale-105 shrink-0 self-start sm:self-auto"
                    onClick={() => navigate('/admin/dashboard/plans/new')}
                >
                    <Plus />
                    Create Plan
                </Button>
            </div>

            {/* stats bar */}
            {!isGettingAllPlans && allPlans.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                        <div className="p-2 rounded-lg bg-indigo-500/10">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-xs text-text-weak uppercase tracking-wide">Total Plans</p>
                            <p className="text-xl font-bold text-text-strong">{allPlans.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <Zap className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs text-text-weak uppercase tracking-wide">Active Plans</p>
                            <p className="text-xl font-bold text-text-strong">{allPlans.filter(p => p.status === 'active').length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Users className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-xs text-text-weak uppercase tracking-wide">Plan Types</p>
                            <p className="text-xl font-bold text-text-strong">{new Set(allPlans.map(p => p.type)).size}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* plans grid */}
            {isGettingAllPlans ? (
                <PlansSkeleton />
            ) : allPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-border rounded-2xl bg-card/30">
                    <div className="p-4 rounded-full bg-primary/10">
                        <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center">
                        <p className="text-text-strong font-semibold text-lg">No plans yet</p>
                        <p className="text-text-weak text-sm mt-1">Create your first subscription plan to get started.</p>
                    </div>
                    <Button
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 cursor-pointer"
                        onClick={() => navigate('/admin/dashboard/plans/new')}
                    >
                        <Plus /> Create Your First Plan
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {allPlans.map((plan) => (
                        <PlanCard key={plan.id} plan={plan} />
                    ))}
                </div>
            )}
        </div>
    );
};

const formatFeatureValue = (value: any): string => {
    if (value === -1) return "Unlimited";
    if (value === true) return "Yes";
    if (value === false) return "No";
    return String(value);
};

const PlanCard = ({ plan }: { plan: Plan }) => {
    const {changePlanStatus,isChangingPlanStatus,setPlanToEdit} = usePlanStore();
    const [selectedPlanId,setSelectedPlanId]=useState<number | null>(null);
    const isActive = plan.status === "active";

    const navigate=useNavigate();

    return (
        <div className="group flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            {/* card header gradient band */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />

            <div className="flex flex-col flex-1 px-6 py-5 gap-4">
                {/* badges row */}
                <div className="flex items-center justify-between gap-2">
                    <Badge
                        variant="outline"
                        className="capitalize text-xs font-semibold border-primary/30 text-primary bg-primary/5"
                    >
                        {plan.type}
                    </Badge>
                    <div className="flex flex-row items-center gap-2">
                        <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                isActive
                                    ? "bg-green-500/10 text-green-500"
                                    : "bg-zinc-500/10 text-text-weak"
                            }`}
                        >
                            {isActive ? "● Active" : "○ Inactive"}
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                asChild
                            >
                                <Button variant="ghost" className="hover:cursor-pointer" disabled={isChangingPlanStatus}>
                                    {isChangingPlanStatus && plan.id=== selectedPlanId?
                                        <Spinner/>
                                        :
                                        <MoreVertical/>
                                    }
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="p-2 w-40 text-text-weak" align="end">
                                <DropdownMenuItem
                                    onClick={()=>{
                                        setSelectedPlanId(plan.id);
                                        changePlanStatus(plan.id,isActive?'inactive':'active')
                                    }}
                                    className="flex items-center cursor-pointer"
                                    disabled={isChangingPlanStatus && plan.id=== selectedPlanId}
                                >
                                    <Ban/>
                                    <p>{plan.status === "active" ? "Deactivate Plan" : "Activate Plan"}</p>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    className="flex items-center cursor-pointer"
                                    onClick={()=>{
                                        setPlanToEdit(plan);
                                        navigate("/admin/dashboard/plans/edit")
                                    }}
                                >
                                    <Edit/>
                                    <p>Edit Plan</p>
                                </DropdownMenuItem>
                                
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* title */}
                <div>
                    <p className="text-xl font-bold text-text-strong leading-tight">{plan.title}</p>
                    <p className="text-text-weak text-sm mt-1 line-clamp-2">{plan.description}</p>
                </div>

                {/* pricing */}
                <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-text-strong">${plan.price}</span>
                    {plan.is_free?(
                        <span className="text-text-weak text-sm mb-1">Lifetime</span>
                    ):(
                        <span className="text-text-weak text-sm mb-1">/ {plan.duration_days} days</span>
                    )}
                </div>

                <Separator />

                {/* features */}
                <div className="flex flex-col gap-2 flex-1">
                    {Object.entries(plan.features).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                            <CircleCheck className="w-4 h-4 shrink-0 text-primary" />
                            <p className="capitalize text-text-strong text-sm">
                                <span>{key.replaceAll('_', ' ')}</span>
                                <span className="text-text-weak">: </span>
                                <span className="font-semibold">{formatFeatureValue(value)}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PlanCardSkeleton = () => (
    <div className="flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden">
        {/* gradient band */}
        <Skeleton className="h-1.5 w-full rounded-none" />
        <div className="flex flex-col px-6 py-5 gap-4">
            {/* badges row */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            {/* title */}
            <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
            {/* price */}
            <div className="flex items-end gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-4 w-20 mb-1" />
            </div>
            {/* separator */}
            <Skeleton className="h-px w-full" />
            {/* features */}
            <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                        <Skeleton className="h-4 flex-1" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const PlansSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
            <PlanCardSkeleton key={i} />
        ))}
    </div>
);

export default Plans;