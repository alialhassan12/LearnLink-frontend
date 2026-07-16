import { useEffect, useState } from "react";
import { useAdminSubscriptionStore } from "../../store/adminDashboardStores/adminSubscriptionStore";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../../components/ui/pagination";
import {
    Search,
    Users,
    CheckCircle2,
    XCircle,
    CreditCard,
    Gift,
    Calendar,
    Zap,
} from "lucide-react";

const getPageNumbers = (current: number, last: number) => {
    const pages: (number | string)[] = [];
    if (last <= 5) {
        for (let i = 1; i <= last; i++) pages.push(i);
    } else {
        if (current <= 3) {
            pages.push(1, 2, 3, "...", last);
        } else if (current >= last - 2) {
            pages.push(1, "...", last - 2, last - 1, last);
        } else {
            pages.push(1, "...", current - 1, current, current + 1, "...", last);
        }
    }
    return pages;
};

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

const Subscriptions = () => {
    const {
        subscriptions,
        subscriptionPaginationData,
        isGettingSubscriptions,
        getSubscriptions,
        metrics,
    } = useAdminSubscriptionStore();

    const [searchInput, setSearchInput] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");
    const [planFilter, setPlanFilter] = useState<"all" | "free" | "paid">("all");

    useEffect(() => {
        getSubscriptions();
    }, [getSubscriptions]);

    const filtered = (subscriptions || []).filter((sub) => {
        const q = searchInput.trim().toLowerCase();
        const matchesSearch =
            !q ||
            (sub.user?.name ?? "").toLowerCase().includes(q) ||
            (sub.user?.email ?? "").toLowerCase().includes(q) ||
            (sub.plan?.title ?? "").toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
        const matchesPlan =
            planFilter === "all" ||
            (planFilter === "free" ? sub.plan?.is_free : !sub.plan?.is_free);
        return matchesSearch && matchesStatus && matchesPlan;
    });

    const {
        current_page = 1,
        last_page = 1,
        from = 0,
        to = 0,
        total = 0,
    } = subscriptionPaginationData ?? {};

    const pageNumbers = getPageNumbers(current_page, last_page);
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= last_page) getSubscriptions(page);
    };

    const metricCards = [
        {
            label: "Total Subscriptions",
            value: subscriptionPaginationData?.total ?? metrics.total,
            icon: Users,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20",
        },
        {
            label: "Active",
            value: metrics.active,
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
        },
        {
            label: "Expired",
            value: metrics.expired,
            icon: XCircle,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
        },
        {
            label: "Paid Plans",
            value: metrics.paid,
            icon: CreditCard,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
            border: "border-violet-500/20",
        },
        {
            label: "Free Plans",
            value: metrics.free,
            icon: Gift,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <p className="text-3xl font-extrabold text-text-strong">Subscription Management</p>
                <p className="text-text-weak">Monitor all user subscriptions, plan types and billing status.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {isGettingSubscriptions
                    ? [...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl" />
                    ))
                    : metricCards.map((card) => (
                        <div
                            key={card.label}
                            className={`flex flex-col gap-3 p-4 rounded-2xl border ${card.border} bg-card/40`}
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bg}`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-xl font-extrabold text-text-strong">{card.value}</p>
                                <p className="text-[11px] text-text-weak mt-0.5 leading-tight">{card.label}</p>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Filters */}
            <div className="flex flex-row items-center justify-between gap-3 border border-border rounded-2xl p-2 bg-card/30 flex-wrap">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-weak" />
                    <Input
                        placeholder="Search by user, email, plan..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full border-none pl-9 focus-visible:ring-0"
                    />
                </div>
                <div className="flex items-center gap-2 pr-1 flex-wrap">
                    <div className="flex items-center gap-1">
                        {(["all", "active", "expired"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 cursor-pointer ${
                                    statusFilter === s
                                        ? "bg-primary text-white shadow-md"
                                        : "text-text-weak hover:bg-neutral-800/20"
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="w-px h-5 bg-border/60" />
                    <div className="flex items-center gap-1">
                        {(["all", "free", "paid"] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPlanFilter(p)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 cursor-pointer ${
                                    planFilter === p
                                        ? "bg-indigo-500/80 text-text-strong shadow-md"
                                        : "text-text-weak hover:bg-neutral-800/20"
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="w-full border border-border/80 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-border/80">
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">User</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">Plan</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4 text-center">Tokens Used</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">Start Date</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">End Date</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {isGettingSubscriptions ? (
                                <SubscriptionsTableSkeleton />
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-text-weak font-medium">
                                        <div className="flex flex-col items-center gap-3">
                                            <Zap className="w-10 h-10 opacity-30" />
                                            <span>No subscriptions found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((sub) => {
                                    const userName = sub.user?.name ?? "Unknown";
                                    const userEmail = sub.user?.email ?? "";
                                    const userAvatar = sub.user?.avatar_url ?? undefined;
                                    const initials = userName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2);

                                    const planTitle = sub.plan?.title ?? "—";
                                    const isFree = sub.plan?.is_free;
                                    const isActive = sub.status === "active";
                                    const isPro = planTitle.toLowerCase().includes("pro");
                                    const isPremium = planTitle.toLowerCase().includes("premium");

                                    // check if ending soon (within 7 days)
                                    const daysLeft = sub.end_at
                                        ? Math.ceil(
                                            (new Date(sub.end_at).getTime() - Date.now()) /
                                                (1000 * 60 * 60 * 24)
                                        )
                                        : null;
                                    const endingSoon =
                                        isActive && daysLeft !== null && daysLeft <= 7 && daysLeft > 0;

                                    return (
                                        <tr
                                            key={sub.id}
                                            className="hover:bg-gray-900/5 transition-colors duration-150"
                                        >
                                            {/* USER */}
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-9 h-9 border border-border/30 shrink-0">
                                                        <AvatarImage src={userAvatar} />
                                                        <AvatarFallback className="text-xs font-semibold">
                                                            {initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm text-text-strong leading-tight">
                                                            {userName}
                                                        </span>
                                                        <span className="text-xs text-text-weak">{userEmail}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* PLAN */}
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    {isFree ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-bg-2 text-text-weak border border-neutral-700/30">
                                                            <Gift className="w-3 h-3" />
                                                            {planTitle}
                                                        </span>
                                                    ) : isPro ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-fuchsia-900/10 text-fuchsia-400 border border-fuchsia-800/30 shadow-[0_0_10px_rgba(217,70,239,0.05)]">
                                                            <Zap className="w-3 h-3" />
                                                            {planTitle}
                                                        </span>
                                                    ) : isPremium ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-900/10 text-amber-400 border border-amber-800/30 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
                                                            <CreditCard className="w-3 h-3" />
                                                            {planTitle}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-900/10 text-indigo-400 border border-indigo-800/30">
                                                            <CreditCard className="w-3 h-3" />
                                                            {planTitle}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* TOKENS USED */}
                                            <td className="px-6 py-4 align-middle text-center">
                                                <span className="text-sm font-semibold text-text-strong">
                                                    {(sub.tokens_used ?? 0).toLocaleString()}
                                                </span>
                                            </td>

                                            {/* START DATE */}
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex items-center gap-1.5 text-sm text-text-weak">
                                                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                    {sub.start_at ? formatDate(sub.start_at) : "—"}
                                                </div>
                                            </td>

                                            {/* END DATE */}
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1.5 text-sm text-text-weak">
                                                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                        {sub.end_at ? formatDate(sub.end_at) : "Lifetime"}
                                                    </div>
                                                    {endingSoon && (
                                                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                                                            Expires in {daysLeft}d
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-6 py-4 align-middle">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-strong">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] shrink-0" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-strong">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] shrink-0" />
                                                        Expired
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {subscriptionPaginationData && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/80">
                        <div className="text-xs text-text-weak">
                            Showing{" "}
                            <span className="font-semibold text-text-strong">{from}–{to}</span>{" "}
                            of{" "}
                            <span className="font-semibold text-text-strong">{total.toLocaleString()}</span>{" "}
                            subscriptions
                        </div>
                        <Pagination className="mx-0 w-auto">
                            <PaginationContent className="flex items-center gap-1">
                                <PaginationItem>
                                    <PaginationPrevious
                                        size="icon"
                                        text=""
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(current_page - 1);
                                        }}
                                        className={`h-9 w-9 p-0 flex items-center justify-center rounded-lg border border-border/80 bg-transparent text-text-weak hover:text-text-strong hover:bg-neutral-800/40 transition-colors ${
                                            current_page === 1
                                                ? "opacity-40 cursor-not-allowed pointer-events-none"
                                                : "cursor-pointer"
                                        }`}
                                    />
                                </PaginationItem>
                                {pageNumbers.map((page, idx) => (
                                    <PaginationItem key={idx}>
                                        {page === "..." ? (
                                            <PaginationEllipsis className="h-9 w-9 text-text-weak flex items-center justify-center" />
                                        ) : (
                                            <PaginationLink
                                                size="icon"
                                                isActive={page === current_page}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePageChange(page as number);
                                                }}
                                                className={`h-9 w-9 text-xs flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer border ${
                                                    page === current_page
                                                        ? "pointer-events-none bg-[#818cf8] border-[#818cf8] text-text-strong font-bold shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                                                        : "border-transparent text-text-weak hover:text-text-strong hover:bg-neutral-800/40"
                                                }`}
                                            >
                                                {page}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        size="icon"
                                        text=""
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(current_page + 1);
                                        }}
                                        className={`h-9 w-9 p-0 flex items-center justify-center rounded-lg border border-border/80 bg-transparent text-text-weak hover:text-text-strong hover:bg-neutral-800/40 transition-colors ${
                                            current_page === last_page
                                                ? "opacity-40 cursor-not-allowed pointer-events-none"
                                                : "cursor-pointer"
                                        }`}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    );
};

const SubscriptionsTableSkeleton = () => (
    <>
        {[...Array(8)].map((_, i) => (
            <tr key={i} className="border-b border-border/40 last:border-0">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-36" />
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-12 mx-auto" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
            </tr>
        ))}
    </>
);

export default Subscriptions;
