import { Route, Routes } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import useAuthStore from "../store/authStore";
import Browse from "./StudentMarketplacePages/Browse";
import BrowseTeachers from "./StudentMarketplacePages/BrowsePages/BrowseTeachers";
import BrowseCourses from "./StudentMarketplacePages/BrowsePages/BrowseCourses";
import TeacherProfile from "./StudentMarketplacePages/BrowsePages/TeacherProfile";
import MyBookings from "./StudentMarketplacePages/MyBookings";
import Sessions from "./StudentMarketplacePages/Sessions/Sessions";
import SessionView from "./StudentMarketplacePages/Sessions/SessionView";
import CourseDetails from "./StudentMarketplacePages/BrowsePages/CourseDetails";
import MessagesLayout from "./MessagesLayout";
import MyLearnings from "./StudentMarketplacePages/MyLearnings";
import CourseLearning from "./StudentMarketplacePages/LearningsPages/CourseLearning";
import Profile from "./StudentMarketplacePages/Profile";
import AiAssistantLayout from "./AiAssistantLayout";

const StudentMarketPlace=()=>{
    const authUser=useAuthStore((state)=>state.authUser);
    const logout=useAuthStore((state)=>state.logout);

    return (
        <div>
            <Header/>
            {/* content routes */}
            <Routes>
                <Route path="/" element={<Browse/>} />
                <Route path="/browse/teachers" element={<BrowseTeachers/>} />
                <Route path="/browse/teachers/:id" element={<TeacherProfile/>}/>
                <Route path="/browse/courses" element={<BrowseCourses/>} />
                <Route path="/browse/courses/:id" element={<CourseDetails/>}/>
                <Route path="/bookings" element={<MyBookings/>} />
                <Route path="/live-sessions" element={<Sessions/>} />
                <Route path="/live-sessions/:id" element={<SessionView/>} />
                <Route path="/chat" element={<MessagesLayout/>}/>
                <Route path="/learnings">
                    <Route index element={<MyLearnings/>}/>
                    <Route path="course/:id" element={<CourseLearning/>}/>
                </Route>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/ai-assistant" element={<AiAssistantLayout/>}/>
            </Routes>
            <Footer/>
        </div>
    );
};

export default StudentMarketPlace;