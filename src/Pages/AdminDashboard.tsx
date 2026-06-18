import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar"
import { Separator } from "../components/ui/separator";
import { TooltipProvider } from "../components/ui/tooltip";
import { Route, Routes, useNavigate } from "react-router-dom";

import { ThemeToggle } from "../components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import useAuthStore from "../store/authStore";
import { Bell } from "lucide-react";
import AdminSidebar from "../components/adminDashboard/AdminSidebar";
import AdminContentDashboard from "./adminPages/AdminContentDashboard";
import Plans from "./adminPages/Plans";
import Users from "./adminPages/Users";
import CreatePlan from "./adminPages/CreatePlan";
import Categories from "./adminPages/Categories";

const AdminDashboard=()=>{
    const {authUser}=useAuthStore();
    const navigate=useNavigate();

    return(
        <SidebarProvider>
            <TooltipProvider>
                {/* sidebar */}
                <AdminSidebar/>
                {/* content */}
                <div className="p-4 space-y-4 w-full">
                    {/* top bar */}
                    <div className="flex items-center justify-between sticky top-0 z-50 bg-bg-1/50 backdrop-blur-xl border-b border-border">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Bell className="cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out hover:text-primary text-text-strong" />
                            <div className="flex items-center gap-2">
                                <Separator orientation="vertical" />
                                <Avatar className="cursor-pointer" >
                                    <AvatarImage src={authUser?.avatar_url} />
                                    <AvatarFallback>{authUser?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium">{authUser?.name}</span>
                                    <span className="text-sm text-text-weak">Admin</span>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                    {/* content routes */}
                    <Routes>
                        <Route path="/" element={<AdminContentDashboard/>}/>
                        <Route path="/users" element={<Users/>}/>
                        <Route path="/plans">
                            <Route index element={<Plans/>}/>
                            <Route path="new" element={<CreatePlan/>}/>
                        </Route>
                        <Route path="/categories" element={<Categories/>}/>
                    </Routes>
                </div>
                
            </TooltipProvider>
        </SidebarProvider>
    );
};

export default AdminDashboard;