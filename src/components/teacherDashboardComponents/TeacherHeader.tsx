import { Bell, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { SidebarTrigger } from "../ui/sidebar";
import { ThemeToggle } from "../ThemeToggle";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import useAuthStore from "@/store/authStore";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationHistoryButton from "../NotificationHistoryButton";

const TeacherHeader=()=>{
    const {authUser}=useAuthStore();
    
    const navigate=useNavigate();
    const location = useLocation();

    return(
        <div className="flex items-center justify-between sticky top-0 z-50 bg-bg-1/50 backdrop-blur-xl border-b border-border px-2 py-1 sm:px-0 sm:py-0">
            <div className="flex items-center gap-2 sm:gap-4">
                <SidebarTrigger />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <Button 
                    variant={'secondary'} 
                    className={`cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out hover:text-primary flex ${location.pathname==='/dashboard/ai-assistant'? 'text-primary ':''}`}
                    onClick={()=>navigate("/dashboard/ai-assistant")}
                >
                    <Sparkles className={`w-4 h-4 ${location.pathname==='/dashboard/ai-assistant'? 'animate-bounce':''}`}/>
                    <p className="font-medium hidden sm:block">AI Assistant</p>
                </Button>
                <ThemeToggle />
                <NotificationHistoryButton/>
                <div className="flex items-center gap-2">
                    <Separator orientation="vertical" className="hidden sm:block" />
                    <Avatar className="cursor-pointer" onClick={()=>navigate("/dashboard/profile")}>
                        <AvatarImage src={authUser?.avatar_url} />
                        <AvatarFallback>{authUser?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col">
                        <span className="font-medium">{authUser?.name}</span>
                        <span className="text-sm text-text-weak">Teacher</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherHeader;
