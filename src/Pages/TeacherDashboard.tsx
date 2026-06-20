import TeacherSidebar from "../components/teacherDashboardComponents/TeacherSidebar";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar"
import { Separator } from "../components/ui/separator";
import { TooltipProvider } from "../components/ui/tooltip";
import { Route, Routes, useNavigate } from "react-router-dom";
import Dashboard from "./TeacherPages/Dashboard";
import MyCourses from "./TeacherPages/MyCourses";
import { ThemeToggle } from "../components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import useAuthStore from "../store/authStore";
import { Bell, Sparkles } from "lucide-react";
import CreateCourse from "./TeacherPages/CreateCourse";
import PublishedSuccessful from "./TeacherPages/PublishedSuccessful";
import Profile from "./TeacherPages/Profile";
import EditProfile from "./TeacherPages/EditProfile";
import Bookings from "./TeacherPages/Bookings";
import MySessions from "./TeacherPages/Sessions/MySessions";
import SessionView from "./TeacherPages/Sessions/SessionView";
import MessagesLayout from "./MessagesLayout";
import CourseDetails from "./TeacherPages/CourseDetails";
import EditCourse from "./TeacherPages/EditCourse";
import { Button } from "../components/ui/button";
import AiAssistantLayout from "./AiAssistantLayout";
import Calendar from "./TeacherPages/Calendar";
import SubscriptionPlans from "./TeacherPages/SubscriptionPlans";

const TeacherDashboard=()=>{
    const {authUser}=useAuthStore();
    const navigate=useNavigate();

    return(
        <SidebarProvider>
            <TooltipProvider>
                {/* sidebar */}
                <TeacherSidebar />
                {/* content */}
                <div className="p-4 space-y-4 w-full">
                    {/* top bar */}
                    <div className="flex items-center justify-between sticky top-0 z-50 bg-bg-1/50 backdrop-blur-xl border-b border-border">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                variant={'secondary'} 
                                className={`cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out hover:text-primary flex ${location.pathname==='/dashboard/ai-assistant'? 'text-primary ':''}`}
                                onClick={()=>navigate("/dashboard/ai-assistant")}
                            >
                                <Sparkles className={`w-4 h-4 ${location.pathname==='/dashboard/ai-assistant'? 'animate-bounce':''}`}/>
                                <p className="font-medium">AI Assistant</p>
                            </Button>
                            <ThemeToggle />
                            <Bell className="cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out hover:text-primary text-text-strong" />
                            <div className="flex items-center gap-2">
                                <Separator orientation="vertical" />
                                <Avatar className="cursor-pointer" onClick={()=>navigate("/dashboard/profile")}>
                                    <AvatarImage src={authUser?.avatar_url} />
                                    <AvatarFallback>{authUser?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium">{authUser?.name}</span>
                                    <span className="text-sm text-text-weak">Teacher</span>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                    {/* content routes */}
                    <Routes>
                        <Route path="/" element={<Dashboard/>}/>
                        <Route path="/bookings" element={<Bookings/>}/>
                        <Route path="/calendar" element={<Calendar/>}></Route>
                        <Route path="/my-courses" >
                            <Route index element={<MyCourses/>}/>
                            <Route path="create" element={<CreateCourse/>}/>
                            <Route path="published-successful" element={<PublishedSuccessful/>}/>
                            <Route path="view/:id" element={<CourseDetails/>}/>
                            <Route path="edit/:id" element={<EditCourse/>}/>
                        </Route>
                        <Route path="/my-sessions">
                            <Route index element={<MySessions/>}/>
                            <Route path="view/:id" element={<SessionView/>}/>
                            
                        </Route>
                        <Route path="/chat" element={<MessagesLayout/>}></Route>
                        <Route path="/profile" >
                            <Route index element={<Profile/>}></Route>
                            <Route path="edit" element={<EditProfile/>}></Route>
                        </Route>
                        <Route path="ai-assistant" element={<AiAssistantLayout/>}/>
                        <Route path="subscriptions" element={<SubscriptionPlans/>}/>
                    </Routes>
                </div>
                
            </TooltipProvider>
        </SidebarProvider>
    );
};

export default TeacherDashboard;