import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useAuthStore from "../store/authStore";
import { Separator } from "./ui/separator";
import { Bell, Menu, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import NotificationHistoryButton from "./NotificationHistoryButton";

const Header = () => {
    const {authUser}=useAuthStore();
    const location=useLocation();
    const navigate=useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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
        <div className="sticky top-0 border-b border-border transition-colors duration-300 bg-bg-1/50 backdrop-blur-md z-50">
            {/* Main header bar */}
            <div className="flex flex-row justify-between items-center p-4">
                {/* logo and nav links for student */}
                <div className="flex flex-row items-center gap-3">
                    <Link to={'/'} className="text-xl md:text-2xl font-bold text-primary">LearnLink</Link>
                    <Separator orientation="vertical" className="h-10 hidden md:block" />
                    
                    {/* nav links for student — desktop only */}
                    {authUser?.role==='student' &&(
                        <div className="hidden lg:flex flex-row gap-4">
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

                {/* Desktop right side actions */}
                {/* if no user then show login and register */}
                {!authUser?
                    <div className="hidden md:flex flex-row gap-4 items-center">
                        <ThemeToggle/>
                        <Button className="h-10 cursor-pointer font-medium" variant={'outline'} onClick={()=>navigate("/auth/login")}>Log In</Button>
                        <Button className="h-10 cursor-pointer font-medium" onClick={()=>navigate("/auth/register")}>Sign Up</Button>
                    </div>
                :
                // if user is student
                authUser?.role==='student'?
                    <div className="hidden md:flex flex-row items-center gap-2">
                        <Button 
                            variant={'secondary'} 
                            className={`cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out hover:text-primary flex ${location.pathname==='/marketplace/ai-assistant'? 'text-primary ':''}`}
                            onClick={()=>navigate("/marketplace/ai-assistant")}
                        >
                            <Sparkles className={`w-4 h-4 ${location.pathname==='/marketplace/ai-assistant'? 'animate-bounce':''}`}/>
                            <p className="font-medium">AI Assistant</p>
                        </Button>
                        <ThemeToggle/>
                        <NotificationHistoryButton/>
                        <div className="flex items-center gap-2">
                            <Separator orientation="vertical" />
                            <Avatar className="cursor-pointer" onClick={()=>navigate("/marketplace/profile")}>
                                <AvatarImage src={authUser?.avatar_url} />
                                <AvatarFallback>{authUser?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="hidden xl:flex flex-col">
                                <span className="font-medium">{authUser?.name}</span>
                                <span className="text-sm text-text-weak">Student</span>
                            </div>
                        </div>
                    </div>
                :
                    <div className="hidden md:flex flex-row items-center gap-2">
                        <ThemeToggle/>
                        <NotificationHistoryButton/>
                        <div className="flex items-center gap-2">
                            <Separator orientation="vertical" />
                            <Avatar className="cursor-pointer" onClick={()=>navigate("/dashboard")}>
                                <AvatarImage src={authUser?.avatar_url} />
                                <AvatarFallback>{authUser?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="hidden xl:flex flex-col">
                                <span className="font-medium">{authUser?.name}</span>
                                <span className="text-sm text-text-weak">Teacher</span>
                            </div>
                        </div>
                    </div>
                }

                {/* Mobile: theme toggle + hamburger */}
                <div className="flex md:hidden items-center gap-2">
                    <ThemeToggle/>
                    {authUser&&(
                        <NotificationHistoryButton/>
                    )}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                        className="p-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu panel */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-2 px-4 pb-4 border-t border-border">
                    {/* Student nav links */}
                    {authUser?.role==='student' && (
                        <div className="flex flex-col gap-1 pt-3">
                            {navLinks.student.map((link)=>(
                                <Link 
                                    key={link.id} 
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`hover:text-primary hover:bg-primary/5 transition font-medium py-2 px-3 rounded-lg ${location.pathname===link.path?'text-primary bg-primary/10':''}`}
                                >
                                    {link.title}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Mobile actions */}
                    {!authUser ? (
                        <div className="flex flex-col gap-2 pt-3">
                            <Button className="h-10 w-full cursor-pointer font-medium" variant={'outline'} onClick={()=>{navigate("/auth/login"); setMobileMenuOpen(false);}}>Log In</Button>
                            <Button className="h-10 w-full cursor-pointer font-medium" onClick={()=>{navigate("/auth/register"); setMobileMenuOpen(false);}}>Sign Up</Button>
                        </div>
                    ) : authUser?.role==='student' ? (
                        <div className="flex flex-col gap-3 pt-3 border-t border-border">
                            <Button 
                                variant={'secondary'} 
                                className={`cursor-pointer w-full hover:text-primary flex justify-center ${location.pathname==='/marketplace/ai-assistant'? 'text-primary ':''}`}
                                onClick={()=>{navigate("/marketplace/ai-assistant"); setMobileMenuOpen(false);}}
                            >
                                <Sparkles className={`w-4 h-4 ${location.pathname==='/marketplace/ai-assistant'? 'animate-bounce':''}`}/>
                                <p className="font-medium">AI Assistant</p>
                            </Button>
                            <div className="flex items-center gap-3 px-3 py-2">
                                <Avatar className="cursor-pointer" onClick={()=>{navigate("/marketplace/profile"); setMobileMenuOpen(false);}}>
                                    <AvatarImage src={authUser?.avatar_url} />
                                    <AvatarFallback>{authUser?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium">{authUser?.name}</span>
                                    <span className="text-sm text-text-weak">Student</span>
                                </div>
                                <Bell className="ml-auto cursor-pointer hover:text-primary transition-colors" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 px-3 py-2 pt-3 border-t border-border">
                            <Avatar className="cursor-pointer" onClick={()=>{navigate("/dashboard"); setMobileMenuOpen(false);}}>
                                <AvatarImage src={authUser?.avatar_url} />
                                <AvatarFallback>{authUser?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-medium">{authUser?.name}</span>
                                <span className="text-sm text-text-weak">Teacher</span>
                            </div>
                            <Bell className="ml-auto cursor-pointer hover:text-primary transition-colors text-text-strong" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;