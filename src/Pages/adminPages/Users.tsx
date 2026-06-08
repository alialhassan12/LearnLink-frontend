import { useEffect, useState } from "react";
import { useAdminStore } from "../../store/adminDashboardStores/adminStore";
import { Button } from "../../components/ui/button";
import { Search, UserPlus, MoreVertical, Eye, Ban, CheckCircle2 } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Skeleton } from "../../components/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "../../components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Spinner } from "../../components/ui/spinner";

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

const Users = () => {
    const { 
        users,
        userPaginationData,
        isGettingAllUsers,
        getAllUsers,
        suspendUser,
        activateUser,
        isSuspendingUser,
        isActivatingUser,
    } = useAdminStore();
    
    const [searchInput, setSearchInput] = useState<string>("");
    const [selectedUserId,setSelectedUserId]=useState<number | null>(null);

    useEffect(() => {
        getAllUsers();
    }, [getAllUsers]);

    const filteredUsers = (users || []).filter((user) => {
        const searchTrim = searchInput.trim().toLowerCase();
        if (user.name.toLowerCase().includes(searchTrim) || user.email.toLowerCase().includes(searchTrim))
            return user;
    });

    const { current_page, last_page, from, to, total } = userPaginationData || {
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0
    };

    const fromVal = from || 0;
    const toVal = to || 0;
    const totalVal = total || 0;
    const lastPageVal = last_page || 1;

    const pageNumbers = getPageNumbers(current_page, lastPageVal);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= lastPageVal) {
            getAllUsers(page);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* header */}
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
                    <p className="text-3xl text-text-strong font-extrabold">User Management</p>
                    <p className="text-text-weak">Manage and monitor your global learning community.</p>
                </div>
                <Button
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 ease-in-out cursor-pointer hover:scale-105 shrink-0 self-start sm:self-auto"
                >
                    <UserPlus />
                    Add User
                </Button>
            </div>

            {/* filters */}
            <div className="flex flex-row items-center justify-between gap-2 border border-border rounded-2xl p-2 bg-card/30">
                {/* search bar */}
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-weak" />
                    <Input
                        placeholder="Search users..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full border-border pl-9 border-none focus-visible:border-none focus-visible:ring-0"
                    />
                </div>
            </div>

            {/* table */}
            <div className="w-full border border-border/80 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-border/80">
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">User</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">Role</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">Status</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4">Subscription</th>
                                <th className="text-xs font-bold tracking-wider text-text-weak uppercase px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {isGettingAllUsers ? (
                                <TableSkeleton />
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-text-weak font-medium">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const roleUpper = (user.role || "").toUpperCase();
                                    const statusLower = (user.status || "active").toLowerCase();
                                    const planTitle = user.subscription?.plan?.title || "Basic";
                                    const initials = user.name
                                        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                                        : "??";

                                    return (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-900/5 transition-colors duration-150"
                                        >
                                            {/* USER */}    
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <Avatar size="lg" className="border border-border/30 shadow-sm">
                                                        {user.avatar ? (
                                                            <AvatarImage src={user.avatar} alt={user.name} />
                                                        ) : null}
                                                        <AvatarFallback className="bg-neutral-800 text-neutral-200 font-semibold text-xs">
                                                            {initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm text-text-strong leading-tight">
                                                            {user.name}
                                                        </span>
                                                        <span className="text-xs text-text-weak mt-0.5">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* ROLE */}
                                            <td className="px-6 py-4 align-middle">
                                                {roleUpper === "TEACHER" ? (
                                                    <span className="inline-flex items-center text-[10px] tracking-wider uppercase font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                        Teacher
                                                    </span>
                                                ) : roleUpper === "STUDENT" ? (
                                                    <span className="inline-flex items-center text-[10px] tracking-wider uppercase font-extrabold px-2.5 py-1 rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                                                        Student
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-[10px] tracking-wider uppercase font-extrabold px-2.5 py-1 rounded-full bg-neutral-500/10 text-text-weak border border-neutral-500/20">
                                                        {user.role}
                                                    </span>
                                                )}
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-6 py-4 align-middle">
                                                {statusLower === "active" && (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-text-strong font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] shrink-0"></span>
                                                        Active
                                                    </span>
                                                )}
                                                {statusLower === "inactive" && (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-text-strong font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] shrink-0"></span>
                                                        Suspended
                                                    </span>
                                                )}
                                            </td>

                                            {/* SUBSCRIPTION */}
                                            <td className="px-6 py-4 align-middle">
                                                {planTitle.toLowerCase().includes("pro") ? (
                                                    <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-fuchsia-950/20 text-fuchsia-300 border border-fuchsia-850/30 shadow-[0_0_12px_rgba(217,70,239,0.05)]">
                                                        {planTitle}
                                                    </span>
                                                ) : planTitle.toLowerCase().includes("enterprise") ? (
                                                    <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-amber-950/30 text-amber-400 border border-amber-900/30 shadow-[0_0_12px_rgba(245,158,11,0.05)]">
                                                        {planTitle}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-neutral-850/40 text-neutral-450 border border-neutral-700/30">
                                                        {planTitle}
                                                    </span>
                                                )}
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-6 py-4 align-middle text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                        disabled={selectedUserId === user.id && (isActivatingUser || isSuspendingUser)}
                                                        className={`p-2 text-text-weak hover:text-text-strong rounded-full hover:bg-neutral-800/30 cursor-pointer`}
                                                    >
                                                        <Button  variant="ghost">
                                                            {selectedUserId === user.id && (isActivatingUser || isSuspendingUser) ?
                                                                <Spinner/> 
                                                                :
                                                                <MoreVertical className="h-4 w-4" />
                                                            }
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="p-2 w-40 text-text-weak" align="end">
                                                        <DropdownMenuItem className="flex items-center cursor-pointer">
                                                            <Eye/>
                                                            <p>View User</p>
                                                        </DropdownMenuItem>
                                                        {statusLower === "active" && (
                                                            <DropdownMenuItem 
                                                                onClick={() => {
                                                                    setSelectedUserId(user.id);
                                                                    suspendUser(user.id);
                                                                }}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                <Ban/>
                                                                <p>Suspend User</p>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {statusLower === "inactive" && (
                                                            <DropdownMenuItem 
                                                                onClick={() => {
                                                                    setSelectedUserId(user.id);
                                                                    activateUser(user.id);
                                                                }}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                <CheckCircle2/>
                                                                <p>Activate User</p>
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* pagination footer */}
                {userPaginationData && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/80">
                        <div className="text-xs text-text-weak">
                            Showing <span className="font-semibold text-text-strong">{fromVal}-{toVal}</span> of{" "}
                            <span className="font-semibold text-text-strong">{totalVal.toLocaleString()}</span> users
                        </div>
                        <Pagination className="mx-0 w-auto">
                            <PaginationContent className="flex items-center gap-1">
                                <PaginationItem>
                                    <PaginationPrevious
                                        size="icon"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(current_page - 1);
                                        }}
                                        className={`h-9 w-9 p-0 flex items-center justify-center rounded-lg border border-border/80 bg-transparent text-text-weak hover:text-text-strong hover:bg-neutral-800/40 transition-colors ${
                                            current_page === 1
                                                ? "opacity-40 cursor-not-allowed pointer-events-none"
                                                : "cursor-pointer"
                                        }`}
                                        text=""
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
                                                        ? "pointer-events-none bg-[#818cf8] border-[#818cf8] text-white font-bold hover:bg-[#6366f1] dark:bg-indigo-500 dark:border-indigo-500 dark:hover:bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.2)] "
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
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(current_page + 1);
                                        }}
                                        className={`h-9 w-9 p-0 flex items-center justify-center rounded-lg border border-border/80 bg-transparent text-text-weak hover:text-text-strong hover:bg-neutral-800/40 transition-colors ${
                                            current_page === lastPageVal
                                                ? "opacity-40 cursor-not-allowed pointer-events-none"
                                                : "cursor-pointer"
                                        }`}
                                        text=""
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

const TableSkeleton = () => {
    return (
        <>
            {[...Array(4)].map((_, index) => (
                <tr key={index} className="border-b border-border/40 last:border-0">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-2 w-2 rounded-full" />
                            <Skeleton className="h-4 w-14" />
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                        <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                    </td>
                </tr>
            ))}
        </>
    );
};

export default Users;