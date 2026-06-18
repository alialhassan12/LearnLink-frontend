import type { Course } from "../../@types/course";
import { AlertDialog, AlertDialogContent, AlertDialogHeader } from "../ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { ArrowRight, X } from "lucide-react";

const CoursePreview = ({course,open,setOpen}:{course:Course,open:boolean,setOpen:(open:boolean)=>void})=>{
    return(
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="max-w-[400px]">
                <AlertDialogHeader className="flex flex-row justify-end items-center " >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full border-0 hover:bg-border cursor-pointer"
                        onClick={()=>setOpen(false)}
                    >
                        <X />
                    </Button>
                </AlertDialogHeader>
                <div className="flex flex-col rounded-xl overflow-hidden border border-border">
                    {/* course image */}
                    <div className="w-full bg-bg-1 overflow-hidden">
                        <img src={course?.thumbnail_url} alt={course?.title} className="object-cover"/>
                    </div>
                    {/* course info */}
                    <div className="flex flex-col gap-2 p-4">
                        <span className="text-[10px] text-primary uppercase font-medium tracking-wider">{course?.category?.title}</span>
                        <p className="text-text-strong line-clamp-2 text-base font-medium">{course?.title}</p>
                        <div className="flex items-center gap-2">
                            <Avatar>
                                <AvatarFallback>{course?.teacher?.user?.name?.charAt(0)}</AvatarFallback>
                                <AvatarImage src={course?.teacher?.user?.avatar_url}/>
                            </Avatar>
                            <span className="text-sm text-text-strong">{course?.teacher?.user?.name}</span>
                        </div>

                        <Separator/>
                        <div className="flex flex-row justify-between items-center">
                            <Button
                                size="icon"
                                className="rounded-full bg-primary hover:bg-primary/80 text-white font-medium cursor-pointer"
                            >
                                <ArrowRight />
                            </Button>
                        </div>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CoursePreview;