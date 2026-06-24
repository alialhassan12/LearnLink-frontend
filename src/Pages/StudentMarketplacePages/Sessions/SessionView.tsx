import { useNavigate, useParams } from "react-router-dom";
import { useLiveSessionStore } from "../../../store/liveSessionsStore";
import { Skeleton } from "../../../components/ui/skeleton";
import { useEffect, useState } from "react";
import { ArrowRight, Download, Mail, Video, Star } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import useAuthStore  from "../../../store/authStore";
import { Spinner } from "../../../components/ui/spinner";
import { toast } from "sonner";
import MessageButton from "../../../components/MessageButton";

const SessionView = () => {
    const {id}=useParams();
    const {authUser}=useAuthStore();
    const {
        studentSelectedSession,
        isGettingStudentSelectedSession,
        getStudentSelectedSession,getToken,
        isGettingToken,
        createSessionReview,
        isCreatingSessionReview,
        sessionReview
    }=useLiveSessionStore();
    const navigate=useNavigate();
    const [selectedMaterialId,setSelectedMaterialId]=useState<number|null>(null);
    const [isDownloadingMaterial,setIsDownloadingMaterial]=useState<boolean>(false);
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [reviewText, setReviewText] = useState<string>("");

    const handleSubmitReview = async () => {
        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }
        if (id) {
            await createSessionReview(Number(id), rating, reviewText);
        }
    };

    useEffect(()=>{
        if(id){
            getStudentSelectedSession(Number(id));
        }
    },[id,getStudentSelectedSession]);

    // handle start session
    const handleStartSession=async()=>{
        if(id){
            const roomName=`session-${id}`;
            await getToken(roomName,Number(id));
            navigate(`/room/${roomName}`);
        }
    }

    const handleDownloadMaterial=(url:string,fileTitle:string,materialId:number)=>{
        setSelectedMaterialId(materialId);
        setIsDownloadingMaterial(true);
        try {
            const link=document.createElement("a");
            link.href=url;
            link.download=fileTitle;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Downloading...");
        } catch (error) {
            console.log(error);
            toast.error("Failed to download file");
        } finally {
            setIsDownloadingMaterial(false);
            setSelectedMaterialId(null);
        }
    }

    if(isGettingStudentSelectedSession){
        return (<SessionViewSkeleton/>);
    }

    return (
        <div className="max-w-7xl mx-auto py-6 md:py-10 px-4 md:px-6">
            {/* Header section with breadcrumbs or just title if needed */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-text-strong tracking-tight">Session Details</h1>
                <p className="text-text-weak text-sm mt-1">Manage your upcoming live session and access materials.</p>
            </div>

            {/* session actions and details section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* session actions */}
                <div className="lg:col-span-2 flex flex-col gap-6 justify-center items-center rounded-3xl bg-gradient-to-br from-primary/80 via-primary/40 to-background shadow-2xl shadow-primary/10 p-8 md:p-12 lg:p-16 border border-primary/10 relative overflow-hidden group">
                    {/* Decorative background element */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500"></div>
                    
                    <div className="w-20 h-20 bg-background/50 backdrop-blur-md flex justify-center items-center rounded-2xl border border-white/20 shadow-xl relative  transition-transform duration-500 group-hover:scale-110">
                        <Video size={40} className="text-primary"/>
                    </div>
                    
                    <div className="flex flex-col gap-3 relative text-center">
                        <p className="text-text-strong font-extrabold text-2xl md:text-3xl tracking-tight">Join the Classroom</p>
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-text-strong/90 font-medium">{studentSelectedSession?.scheduled_day.slice(0,3).toUpperCase()}, {studentSelectedSession?.scheduled_date}</p>
                            <p className="text-text-strong/80 text-lg font-semibold">{studentSelectedSession?.scheduled_time}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md relative ">
                        <Button 
                            disabled={isGettingToken}
                            onClick={handleStartSession}
                            className="flex-1 py-7 px-8 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-2xl bg-text-strong text-background font-bold shadow-lg shadow-text-strong/20" 
                        >
                            {isGettingToken ? <Spinner className="text-background"/>: <span className="flex items-center gap-2 text-lg">Join Session <ArrowRight size={20}/></span>}
                        </Button>
                        <MessageButton 
                            disabled={isGettingToken}
                            variant="outline"
                            recieverUser={studentSelectedSession?.teacher?.user}
                            className="flex-1 py-7 px-8 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-2xl bg-background/50 backdrop-blur-sm border-border hover:bg-background/80 font-bold" 
                        >
                            <span className="flex items-center gap-2 text-lg">Message <Mail size={20}/></span>
                        </MessageButton>
                    </div>
                </div>

                {/* details card */}
                <div className="flex flex-col gap-6 bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 h-fit">
                    <div>
                        <p className="text-text-strong text-xl font-bold tracking-tight">Details</p>
                        <Separator className="mt-3 bg-border/50"/>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-border/30">
                            <p className="text-text-weak text-sm font-medium">Type</p>
                            <p className="text-text-strong text-sm font-semibold">1-on-1 Session</p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-text-strong text-sm font-bold uppercase tracking-wider opacity-60">Participants</p>
                            
                            {/* User */}
                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                                <Avatar className="h-12 w-12 border-2 border-primary/20">
                                    <AvatarImage src={authUser?.avatar_url}/>
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {authUser?.name.slice(0,2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-text-strong font-bold text-sm truncate">{authUser?.name.toUpperCase()}</p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary">YOU</span>
                                </div>
                            </div>

                            {/* Teacher */}
                            <div className="flex items-center gap-4 p-3 rounded-2xl border border-border/50 hover:bg-muted/30 transition-colors">
                                <Avatar className="h-12 w-12 border-2 border-border/20">
                                    <AvatarImage src={studentSelectedSession?.teacher?.user?.avatar_url}/>
                                    <AvatarFallback className="bg-muted text-text-weak font-bold">
                                        {studentSelectedSession?.teacher?.user?.name.slice(0,2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-text-strong font-bold text-sm truncate">{studentSelectedSession?.teacher?.user?.name.toUpperCase()}</p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-text-weak">TEACHER</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Review section */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm mb-8">
                <h2 className="text-xl font-bold text-text-strong tracking-tight mb-2">Session Review</h2>
                <p className="text-text-weak text-sm mb-6">
                    {sessionReview 
                        ? "Thank you for reviewing this live session. Your feedback helps us improve." 
                        : "How was your experience? Rate this session and share your feedback with the teacher."}
                </p>
                <Separator className="mb-6 bg-border/50"/>

                {sessionReview ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={24}
                                    className={star <= sessionReview.rating ? "fill-amber-400 text-amber-400" : "text-border/40 text-muted-foreground/30"}
                                />
                            ))}
                            <span className="ml-2 text-sm font-bold text-text-strong">{sessionReview.rating} / 5</span>
                        </div>
                        {sessionReview.review ? (
                            <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                                <p className="text-sm text-text-strong italic">"{sessionReview.review}"</p>
                            </div>
                        ) : (
                            <p className="text-sm text-text-weak italic">No written comment provided.</p>
                        )}
                        <div className="flex justify-end">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                Submitted
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 max-w-xl">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-text-strong">Rating</label>
                            <div 
                                className="flex items-center gap-2"
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="cursor-pointer transition-transform duration-200 hover:scale-110 focus:outline-none"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                    >
                                        <Star
                                            size={32}
                                            className={`transition-colors duration-200 ${
                                                star <= (hoverRating || rating)
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-border/40 text-muted-foreground/30 hover:text-amber-300"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-text-strong">Review Description (Optional)</label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Share your experience with the teacher..."
                                rows={4}
                                className="w-full p-4 rounded-2xl bg-muted/20 border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none text-sm text-text-strong placeholder:text-text-weak"
                            />
                        </div>

                        <Button
                            onClick={handleSubmitReview}
                            disabled={rating === 0 || isCreatingSessionReview}
                            className="w-full sm:w-auto self-start px-8 py-6 rounded-2xl bg-primary text-background font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                        >
                            {isCreatingSessionReview ? (
                                <Spinner className="text-background" />
                            ) : (
                                "Submit Review"
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* materials section */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-text-strong tracking-tight">Session Materials</h2>
                        <p className="text-text-weak text-sm">Download files provided by your teacher for this session.</p>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 rounded-full">
                        <span className="text-primary text-xs font-bold">{studentSelectedSession?.session_materials.length || 0} Files</span>
                    </div>
                </div>
                
                <Separator className="mb-6 bg-border/50"/>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentSelectedSession?.session_materials.length === 0 ? (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center bg-muted/20 rounded-2xl border border-dashed border-border">
                            <p className="text-text-weak font-medium">No materials shared for this session yet.</p>
                        </div>
                    ) : (
                        studentSelectedSession?.session_materials.map((material, index) => (
                            <div 
                                className="group flex items-center justify-between bg-background border border-border/60 hover:border-primary/50 hover:shadow-md transition-all duration-300 rounded-2xl p-4" 
                                key={index}
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors duration-300">
                                        <Download size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-text-strong font-bold text-sm truncate group-hover:text-primary transition-colors">{material.title}</p>
                                        <p className="text-text-weak text-[10px] font-bold uppercase tracking-wider">{material.file_type}</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary text-text-weak shrink-0 transition-colors"
                                    onClick={()=>handleDownloadMaterial(material.file_url,material.title,material.id)}
                                    disabled={isDownloadingMaterial && selectedMaterialId===material.id}
                                >
                                    {isDownloadingMaterial && selectedMaterialId===material.id ? <Spinner/>:<Download size={18}/>}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

};

const SessionViewSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto py-6 md:py-10 px-4 md:px-6">
            <div className="mb-8 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* session actions skeleton */}
                <div className="lg:col-span-2 flex flex-col gap-6 justify-center items-center rounded-3xl bg-muted/20 p-8 md:p-12 lg:p-16 border border-border/50">
                    <Skeleton className="w-20 h-20 rounded-2xl" />
                    <div className="flex flex-col gap-3 items-center">
                        <Skeleton className="h-8 w-56" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md">
                        <Skeleton className="flex-1 h-14 rounded-2xl" />
                        <Skeleton className="flex-1 h-14 rounded-2xl" />
                    </div>
                </div>

                {/* details card skeleton */}
                <div className="flex flex-col gap-6 bg-card border border-border/50 rounded-3xl p-6 md:p-8 h-fit">
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-px w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <div className="space-y-4 pt-2">
                            <Skeleton className="h-4 w-32" />
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* materials section skeleton */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-px w-full mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between border border-border/50 rounded-2xl p-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


export default SessionView;