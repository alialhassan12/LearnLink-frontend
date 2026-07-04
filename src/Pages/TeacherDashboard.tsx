import TeacherSidebar from "../components/teacherDashboardComponents/TeacherSidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { TooltipProvider } from "../components/ui/tooltip";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./TeacherPages/Dashboard";
import MyCourses from "./TeacherPages/MyCourses";;
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
import AiAssistantLayout from "./AiAssistantLayout";
import Calendar from "./TeacherPages/Calendar";
import SubscriptionPlans from "./TeacherPages/SubscriptionPlans";
import TeacherHeader from "@/components/teacherDashboardComponents/TeacherHeader";

const TeacherDashboard=()=>{

    return(
        <SidebarProvider>
            <TooltipProvider>
                {/* sidebar */}
                <TeacherSidebar />
                {/* content */}
                <div className="p-4 space-y-4 w-full">
                    {/* top bar */}
                    <TeacherHeader/>
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