import { useNavigate, useParams } from "react-router-dom";
import { useLiveSessionStore } from "../../../store/liveSessionsStore";
import { Button } from "../../../components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Calendar, Clock, Download, Mail, Trash2, Upload, Video } from "lucide-react";
import { Separator } from "../../../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import useAuthStore from "../../../store/authStore";
import { toast } from "sonner";
import { useSessionMaterialsStore } from "../../../store/sessionMaterialsStore";
import { Spinner } from "../../../components/ui/spinner";
import { Skeleton } from "../../../components/ui/skeleton";
import type { user } from "../../../@types/user";
import MessageButton from "../../../components/MessageButton";

const SessionView =()=>{
    const {id}=useParams();
    const {authUser}=useAuthStore();
    const {getToken,isGettingToken,teacherSelectedSession,isGettingTeacherSelectedSession,getTeacherSelectedSession}=useLiveSessionStore();
    const {sessionMaterials,setSessionMaterials,uploadMaterials,isuploadingMaterials,deleteSessionMaterial,isDeletingSessionMaterial}=useSessionMaterialsStore();
    const navigate=useNavigate();
    const [selectedMaterialId,setSelectedMaterialId]=useState<number|null>(null);

    const inputRef=useRef<HTMLInputElement>(null);
    const [filesData,setFilesData]=useState<{
        fileTitle:string,
        fileType:string,
        file:File 
    }[]>([]);

    useEffect(()=>{
        const fetchSession=async ()=>{
            if(id){
                const session=await getTeacherSelectedSession(Number(id));
                if(session?.session_materials){
                    setSessionMaterials(session.session_materials);
                }
            }
        }
        fetchSession();
    },[id,getTeacherSelectedSession]);

    // handle remove uploaded file
    const handleRemoveUploadedFile=(fileTitle:string)=>{
        setFilesData((prev)=>prev.filter((item)=>item.fileTitle!==fileTitle));
        if(inputRef.current){
            inputRef.current.value="";
        }
    }
    // handle delete file
    const handleDeleteSessionMaterial=async(sessionMaterialId:number)=>{
        setSelectedMaterialId(sessionMaterialId);
        await deleteSessionMaterial(sessionMaterialId);
        setSelectedMaterialId(null);
    }

    // handle file upload
    const handleFileUpload =(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file=e.target.files?.[0];
        if(file){
            setFilesData((prev)=>[...prev,{
                fileTitle:file.name,
                fileType:file.type,
                file:file
            }]);
            if(inputRef.current){
                inputRef.current.value="";
            }
        }
    }

    // handle drag over
    const handleDragOver=(e:React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault();
    }

    // handle drop
    const handleDrop=(e:React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault();
        const file=e.dataTransfer.files[0];
        if(file){
            setFilesData((prev)=>[...prev,{
                fileTitle:file.name,
                fileType:file.type,
                file:file
            }]);
            if(inputRef.current){
                inputRef.current.value="";
            }
        }
    }

    const handleUploadFiles=async()=>{
        if(filesData.length===0){
            toast.error("Please select files to upload");
            return;
        }
        try {
            const data:{
                live_session_id:number,
                files:{
                    fileTitle:string,
                    fileType:string,
                    file:File
                }[]
            }={
                live_session_id:Number(id),
                files:filesData
            };

            await uploadMaterials(data);
            setFilesData([]);
            if(inputRef.current){
                inputRef.current.value="";
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleStartSession=async()=>{
        if(id){
            const roomName=`session-${id}`;
            await getToken(roomName,Number(id));
            navigate(`/room/${roomName}`);
        }
    }

    const calculateTimeLeft=()=>{
        if (!teacherSelectedSession?.scheduled_date || !teacherSelectedSession?.scheduled_time) return { hours: '00', minutes: '00' };

        const scheduledDate = new Date(teacherSelectedSession.scheduled_date);
        const scheduledTime = teacherSelectedSession.scheduled_time;
        
        // Parse the time string (e.g., "14:30")
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        
        // Set the time on the scheduled date
        scheduledDate.setHours(hours, minutes, 0, 0);
        
        const now = new Date();
        const difference = scheduledDate.getTime() - now.getTime();
        
        if (difference <= 0) {
            return {
                hours: '00',
                minutes: '00'
            };
        }
        
        const hoursLeft = Math.floor(difference / (1000 * 60 * 60));
        const minutesLeft = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        return {
            hours: String(hoursLeft).padStart(2, '0'),
            minutes: String(minutesLeft).padStart(2, '0')
        };
    };
    const [timeLeft,setTimeLeft]=useState(calculateTimeLeft());
    
    useEffect(()=>{
        const timer=setInterval(()=>{
            setTimeLeft(calculateTimeLeft());
        },1000);
        return ()=>clearInterval(timer);
    },[]);

    if(isGettingTeacherSelectedSession){
        return <SessionViewSkeleton/>;
    }

    return(
        <div className="p-2 md:p-0">
            {/* top section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-xl font-semibold capitalize text-primary">{teacherSelectedSession?.subject}</p>
                    <p className="text-sm font-medium text-text-strong">Student : {teacherSelectedSession?.student?.user?.name}</p>
                    <div className="flex flex-row gap-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="text-primary w-5 h-5"/>
                            <p className="text-text-strong text-sm">{teacherSelectedSession?.scheduled_day.slice(0,3).toUpperCase()}</p>
                            <p className="text-text-strong text-sm">{teacherSelectedSession?.scheduled_date}</p>
                        </div>
                        <Separator orientation="vertical" className="h-6"/>
                        <div className="flex items-center gap-2">
                            <Clock className="text-primary w-5 h-5"/>
                            <p className="text-text-strong text-sm">{teacherSelectedSession?.scheduled_time}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                teacherSelectedSession?.status === 'booked' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                teacherSelectedSession?.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                'bg-rose-100 text-rose-700 border border-rose-200'
                            }`}>
                                {teacherSelectedSession?.status}
                            </span>
                        </div>
                    </div>
                </div>
                {/* starts in timer */}
                <div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-text-strong text-sm">Starts in</p>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex flex-row gap-2">
                                <div className="flex items-center gap-2 border border-border/60 bg-card/60 px-3 py-1 rounded-md">
                                    <p className="text-text-strong text-lg">{timeLeft.hours}</p>
                                    <p className="text-text-strong text-sm">hrs</p>
                                </div>
                                <div className="flex items-center gap-2 text-text-strong text-lg">
                                    <p className="text-text-strong text-lg">:</p>
                                </div>
                                <div className="flex items-center gap-2 border border-border/60 bg-card/60 px-3 py-1 rounded-md">
                                    <p className="text-text-strong text-lg">{timeLeft.minutes}</p>
                                    <p className="text-text-strong text-sm">mins</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Separator className="my-4"/>

            {/* session actions and details section */}
            <div className="flex flex-col md:flex-row  gap-6 mb-5">
                {/* session actions */}
                <div className="flex flex-col w-full md:w-[65%] gap-6 justify-center items-center rounded-2xl bg-gradient-to-br from-primary/70 via-primary/35 to-background shadow-xl p-6 md:p-12 lg:p-16">
                    <div className="w-16 h-16 bg-accent-foreground/10 flex justify-center items-center rounded-full border border-border/60 shadow-lg">
                        <Video size={30} className="text-text-strong"/>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-text-strong text-center font-bold text-lg">Join the Classroom</p>
                        <p className="text-text-strong text-center">{teacherSelectedSession?.scheduled_day.slice(0,3).toUpperCase()}, {teacherSelectedSession?.scheduled_date}</p>
                        <p className="text-text-strong text-center">{teacherSelectedSession?.scheduled_time}</p>
                    </div>
                    <div className="flex flex-row flex-wrap justify-center gap-4 w-full">
                        <Button 
                            className="flex-1 py-8 px-10 cursor-pointer hover:scale-105 hover:text-primary transition-all duration-300 rounded-xl bg-text-strong/80  " 
                            variant="outline"
                            onClick={handleStartSession}
                            disabled={isGettingToken}
                        >
                            {isGettingToken
                            ? <Spinner/>
                            : <>
                                Start Session
                                <ArrowRight/>
                            </>
                            }
                        </Button>
                        <MessageButton 
                            recieverUser={teacherSelectedSession?.student?.user as user}
                            className="flex-1 py-8 px-10 cursor-pointer hover:scale-105 hover:text-primary transition-all duration-300 rounded-xl bg-text-strong/80  " 
                            variant="outline"
                            disabled={isGettingToken}
                        >
                            Message Student   
                            <Mail/>
                        </MessageButton>
                    </div>
                </div>
                {/* details card */}
                <div className="flex flex-col gap-2 h-fit items-center bg-card border border-border rounded-lg p-6 w-full md:w-[35%]">
                    <div className="w-full">
                        <p className="text-text-strong text-lg font-bold">Details</p>
                    </div>
                    <Separator className=""/>
                    <div className="flex flex-row justify-between w-full items-center">
                        <p className="text-text-strong text-sm">Type</p>
                        <p className="text-text-strong text-sm">1-on-1 Session</p>
                    </div>
                    <div className="flex flex-col w-full gap-2 mt-4">
                        <p className="text-text-strong text-sm">Participants</p>
                        <div className="flex flex-row items-center gap-2">
                            <Avatar>
                                <AvatarImage src={authUser?.avatar_url}/>
                                <AvatarFallback>{authUser?.name.slice(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <p className="text-primary font-bold text-sm">YOU (HOST)</p>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <Avatar>
                                <AvatarImage src={teacherSelectedSession?.student?.user?.avatar_url}/>
                                <AvatarFallback>{teacherSelectedSession?.student?.user?.name.slice(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <p className="text-text-strong text-sm">{teacherSelectedSession?.student?.user?.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* materials and notes */}
            <div className="flex flex-col md:flex-row  gap-6">
                {/* materials */}
                <div className="flex flex-col w-full md:w-[65%] bg-card border border-border rounded-lg p-6">
                    <div className="w-full flex flex-row justify-between items-center mb-4">
                        <p className="text-text-strong text-lg font-bold">Session Materials</p>
                        <Button 
                            className="cursor-pointer" 
                            variant="outline" 
                            onClick={()=>(inputRef.current as HTMLInputElement).click()}>
                                <Upload size={16}/> 
                                Add Material
                        </Button>
                        <input className="hidden" type="file" ref={inputRef} onChange={handleFileUpload}/>
                    </div>
                    <Separator className=""/>
                    {/* files display */}
                    <div className="flex flex-col w-full gap-2 mt-4">
                        {sessionMaterials?.length ===0 && filesData.length ===0 && (
                            <p className="text-text-weak text-sm">No files uploaded yet</p>
                        )}
                        <div className="flex flex-col gap-2">
                            {sessionMaterials?.map((file,index)=>(
                                <div className="flex flex-row items-center justify-between border border-border/60 rounded-md p-4" key={index}>
                                    <div className="flex flex-row items-center gap-2">
                                        <p className="text-text-strong text-sm">{file.title}</p>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer"><Download size={16}/></Button>
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="h-8 w-8 cursor-pointer" 
                                            onClick={()=>handleDeleteSessionMaterial(file.id)}
                                            disabled={isDeletingSessionMaterial && selectedMaterialId!==file.id}
                                        >
                                            {isDeletingSessionMaterial && selectedMaterialId===file.id
                                            ? <Spinner/>
                                            : <Trash2 size={16}/>}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {
                            filesData.map((file,index)=>(
                                <div className="flex flex-row items-center justify-between border border-border/60 rounded-md p-4" key={index}>
                                    <div className="flex flex-row items-center gap-2">
                                        <p className="text-text-strong text-sm">{file.fileTitle}</p>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer"><Download size={16}/></Button>
                                        <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" onClick={()=>handleRemoveUploadedFile(file.fileTitle)}><Trash2 size={16}/></Button>
                                    </div>
                                </div>
                            ))
                        }
                        {filesData.length>0&&(
                            <Button 
                                variant="outline" 
                                className="mt-2"
                                disabled={isuploadingMaterials}
                                onClick={handleUploadFiles}
                            >
                                {isuploadingMaterials
                                ?<>
                                    <Spinner/>
                                    <p>Saving...</p>
                                </>
                                :"Save Files"
                                }
                            </Button>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}

const SessionViewSkeleton=()=>{
    return (
        <div className="flex flex-col gap-6 p-2 md:p-0">
            {/* top section skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-64" />
                    <div className="flex flex-row gap-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex flex-row gap-2">
                        <Skeleton className="h-10 w-16" />
                        <Skeleton className="h-10 w-4" />
                        <Skeleton className="h-10 w-16" />
                    </div>
                </div>
            </div>
            
            <Separator />

            {/* session actions and details skeleton */}
            <div className="flex flex-col md:flex-row gap-6 mb-5">
                <div className="flex flex-col w-full md:w-[65%] gap-6 justify-center items-center rounded-2xl bg-muted/30 p-6 md:p-12 lg:p-16">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex flex-col gap-2 items-center">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex flex-row gap-4 w-full justify-center">
                        <Skeleton className="h-14 w-40 rounded-xl" />
                        <Skeleton className="h-14 w-40 rounded-xl" />
                    </div>
                </div>
                <div className="flex flex-col gap-4 h-fit bg-card border border-border rounded-lg p-6 w-full md:w-[35%]">
                    <Skeleton className="h-6 w-20" />
                    <Separator />
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex flex-col gap-3 mt-2">
                        <Skeleton className="h-4 w-24" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>
            </div>

            {/* materials skeleton */}
            <div className="flex flex-col w-full md:w-[65%] bg-card border border-border rounded-lg p-6">
                <div className="w-full flex flex-row justify-between items-center mb-4">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Separator />
                <div className="flex flex-col gap-3 mt-4">
                    <Skeleton className="h-16 w-full rounded-md" />
                    <Skeleton className="h-16 w-full rounded-md" />
                </div>
            </div>
        </div>
    );
}

export default SessionView;