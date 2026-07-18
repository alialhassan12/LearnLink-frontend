import { Button } from "../ui/button";
import type { Teacher } from "../../@types/teacher";
import { useNavigate } from "react-router-dom";
import ProTeacherBadge from "./ProTeacherBadge";
import { Star } from "lucide-react";

const TeacherCard = ({ teacher }: { teacher: Teacher }) => {

    const navigator=useNavigate();

    const handleViewProfile=()=>{
        navigator(`/marketplace/browse/teachers/${teacher.id}`);
    }
    
    return(
            <div data-aos="fade-up" className="group flex flex-col gap-6 bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                {/* teacher image */}
                <div className="relative w-full h-48 md:h-48 shrink-0">
                    {
                        teacher?.user?.avatar_url?(
                            <img 
                                className="w-full h-full rounded-xl object-cover shadow-sm group-hover:scale-[1.02] transition-transform duration-500" 
                                src={teacher?.user?.avatar_url} 
                                alt={teacher?.user?.name}
                            />
                        ):
                        (
                            <div className="w-full h-full rounded-xl bg-gray-300/30 flex items-center justify-center">
                                <span className="text-gray-400 text-5xl">{teacher?.user?.name?.charAt(0).toUpperCase()}</span>
                            </div>
                        )
                    }
                    {
                        teacher?.user?.subscription?.plan?.features?.search_priority && teacher?.user?.subscription?.status === 'active' && (
                            <ProTeacherBadge />
                        )
                    }
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-border flex items-center gap-1 shadow-sm">
                        <span className="text-primary font-bold text-sm">${teacher?.hourly_rate}</span>
                        <span className="text-[10px] text-text-weak font-medium">/hr</span>
                    </div>
                </div>

                {/* teacher info */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex flex-row justify-between items-start mb-2">
                        <div className="min-w-0">
                            <h3 className="text-xl font-bold text-text-strong truncate group-hover:text-primary transition-colors">{teacher?.user?.name}</h3>
                            <p className="text-sm font-medium text-primary line-clamp-1">{teacher?.headline}</p>
                        </div>
                        <div className="hidden sm:flex flex-col items-end shrink-0">
                            <div className="flex items-center gap-1">
                                <div className="flex items-center">
                                    <Star size={15} className="font-bold text-yellow-500"/>
                                    <span className="text-sm font-bold  ml-1 text-yellow-500">
                                        {teacher?.avg_rating}
                                    </span>
                                </div>
                                <span className="text-xs text-text-weak">({teacher?.review_count} reviews)</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-text-weak line-clamp-2 mb-4 leading-relaxed">
                        {teacher.bio}
                    </p>

                    {/* Subjects as badges */}
                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                        {teacher.subjects?.slice(0, 3).map((subject: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-bg-1 border border-border rounded-full text-[11px] font-semibold text-text-strong uppercase tracking-wider group-hover:border-primary/20 transition-colors">
                                {subject}
                            </span>
                        ))}
                        {teacher.subjects?.length > 3 && (
                            <span className="px-2 py-1 text-[11px] font-medium text-text-weak underline">
                                +{teacher.subjects.length - 3} more
                            </span>
                        )}
                    </div>

                    <div className="flex flex-row items-center gap-3">
                        <Button 
                            onClick={handleViewProfile}
                            className="flex-1 h-11 rounded-xl cursor-pointer font-semibold transition-all" variant="outline"
                        >
                            View Profile
                        </Button>
                    </div>
                </div>
            </div>
    );
};

export default TeacherCard;