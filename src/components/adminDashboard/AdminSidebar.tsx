import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger
} from "../ui/sidebar"
import {ThemeToggle} from "../ThemeToggle"
import { BookOpen, Calendar, DollarSign, GraduationCap, LayoutDashboard, MessageCircle, Video, LogOut, User, Users, Tag, Boxes } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { Spinner } from "../ui/spinner";

const AdminSidebar = () => {
    const location=useLocation();
    const pathname=location.pathname;
    const navigate=useNavigate();
    const {logout,isLoggingout}=useAuthStore();

    const handleLogout=async()=>{
        const loggedOut=await logout();
        if(loggedOut){
            navigate("/");
        }
    }

    const OverviewNavItems=[
        {
            label:"Dashboard",
            path:"/admin/dashboard",
            icon:LayoutDashboard,
            onClick:()=>navigate("/admin/dashboard")
        },
        {
            label:"Users Management",
            path:"/admin/dashboard/users",
            icon:Users,
            onClick:()=>navigate("/admin/dashboard/users")
        },
        {
            label:"Plans Management",
            path:"/admin/dashboard/plans",
            icon:Tag,
            onClick:()=>navigate("/admin/dashboard/plans")
        },
        {
            label:"Categories Management",
            path:"/admin/dashboard/categories",
            icon:Boxes,
            onClick:()=>navigate("/admin/dashboard/categories")
        }
    ];

    return (
        <Sidebar collapsible="icon" variant="floating">
            {/* Sidebar Header */}
            <SidebarHeader className="flex flex-col justify-center items-center mt-4 mb-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
                            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <GraduationCap className="size-6" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold text-base text-text-strong">LearnLink</span>
                                <span className="text-xs text-text-weak">Admin Console</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Sidebar Content */}
            <SidebarContent>
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-medium text-text-weak/70 uppercase tracking-wider mb-2">
                        Overview
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {OverviewNavItems.map((item,index)=>(
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton tooltip={item.label} onClick={item.onClick} className={`transition-all hover:translate-x-1 ${item.path===pathname?'border-l-2 border-primary text-primary':''}`}>
                                        <item.icon className="text-primary/80" />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Sidebar Footer */}
            <SidebarFooter className="p-4 mb-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <ThemeToggle />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarTrigger />
                    </SidebarMenuItem>
                    <SidebarMenuItem className="mt-2">
                        <SidebarMenuButton 
                            tooltip="Logout" 
                            onClick={handleLogout}
                            disabled={isLoggingout}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all"
                        >
                            {isLoggingout?
                                <div className="flex items-center gap-2">
                                    <Spinner className="size-4 animate-spin text-red-500" />
                                    <span>Logging out...</span>
                                </div>
                                :
                                <div className="flex items-center gap-2">
                                    <LogOut className="size-4" />
                                    <span>Logout</span>
                                </div>
                            }
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AdminSidebar;