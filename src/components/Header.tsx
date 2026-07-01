import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useAuthStore from "../store/authStore";
import { Separator } from "./ui/separator";
import { Bell, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
    const {authUser}=useAuthStore();
    const location=useLocation();
    const navigate=useNavigate();

    const navLinks={
        student:[
            {
                id:1,
                title:'Browse',
                path:'/marketplace'
            },
            {
                id:2,
                title:'My Learning',
                path:'/marketplace/learnings'
            },
            {
                id:3,
                title:'My Bookings',
                path:'/marketplace/bookings'
            },
            {
                id:4,
                title:'Live Sessions',
                path:'/marketplace/live-sessions'
            },
            {
                id:5,
                title:'Chat',
                path:'/marketplace/chat'
            }
        ]
    };
    
    return (
        <div className="flex flex-row justify-between items-center p-4 sticky top-0 border-b border-border transition-colors duration-300 bg-bg-1/50 backdrop-blur-md z-1">
            {/* logo and nav links for student */}
            <div className="flex flex-row justify-between items-center gap-3">
                <Link to={'/'} className="text-2xl font-bold text-primary">LearnLink</Link>
                <Separator orientation="vertical" className="h-10" />
                
                {/* nav links for student */}
                {authUser?.role==='student' &&(
                    <div className="flex flex-row gap-4">
                        {navLinks.student.map((link)=>{
                            return(
                                <Link 
                                    key={link.id} 
                                    to={link.path}
                                    className={`hover:text-primary transition font-medium ${location.pathname===link.path?'text-primary':''}`}
                                >
                                    {link.title}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* if no user then show login and register */}
            {!authUser?
                <div className="flex flex-row gap-4">
                    <ThemeToggle/>
                    <Button className="h-10 cursor-pointer font-medium" variant={'outline'} onClick={()=>navigate("/auth/login")}>Log In</Button>
                    <Button className="h-10 cursor-pointer font-medium" onClick={()=>navigate("/auth/register")}>Sign Up</Button>
                </div>
            :
            // if user is student
            authUser?.role==='student'?
                <div className="flex flex-row items-center gap-2">
                    <Button 
                        variant={'secondary'} 
                        className={`cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out hover:text-primary flex ${location.pathname==='/marketplace/ai-assistant'? 'text-primary ':''}`}
                        onClick={()=>navigate("/marketplace/ai-assistant")}
                    >
                        <Sparkles className={`w-4 h-4 ${location.pathname==='/marketplace/ai-assistant'? 'animate-bounce':''}`}/>
                        <p className="font-medium">AI Assistant</p>
                    </Button>
                    <ThemeToggle/>
                    <Bell className="cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out hover:text-primary " />
                    <div className="flex items-center gap-2">
                        <Separator orientation="vertical" />
                        <Avatar className="cursor-pointer" onClick={()=>navigate("/marketplace/profile")}>
                            <AvatarImage src={authUser?.avatar_url} />
                            <AvatarFallback>{authUser?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium">{authUser?.name}</span>
                            <span className="text-sm text-text-weak">Student</span>
                        </div>
                    </div>
                </div>
            :
                <div className="flex flex-row items-center gap-2">
                    <ThemeToggle/>
                    <Bell className="cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out hover:text-primary text-text-strong" />
                    <div className="flex items-center gap-2">
                        <Separator orientation="vertical" />
                        <Avatar className="cursor-pointer" onClick={()=>navigate("/dashboard")}>
                            <AvatarImage src={authUser?.avatar_url} />
                            <AvatarFallback>{authUser?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium">{authUser?.name}</span>
                            <span className="text-sm text-text-weak">Teacher</span>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default Header;