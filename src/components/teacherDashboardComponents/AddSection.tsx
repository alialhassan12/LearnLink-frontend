import { X } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { type Course } from "../../@types/course";
import { useState, type Dispatch, type SetStateAction } from "react";

const AddSection=({open,setOpen,setFormData}:{open:boolean,setOpen:(open:boolean)=>void,setFormData:Dispatch<SetStateAction<Course | null>>})=>{

    const [sectionTitle,setSectionTitle]=useState<string>("");

    const handleAddSection=()=>{
        if(sectionTitle.trim() === "") return;
        
        setFormData((prev)=>{
            if(!prev) return null;
            return{
                ...prev,
                sections:[...(prev.sections || []),{
                    title:sectionTitle.trim(),
                    order:prev.sections ? prev.sections.length + 1 : 1,
                    materials:[]
                }]
            }
        });
        setSectionTitle("");
        setOpen(false);
    }

    return(
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader className="flex flex-row items-center justify-between">
                    <AlertDialogTitle className="text-lg font-semibold">Add Section</AlertDialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full border-0 hover:bg-border cursor-pointer"
                        onClick={()=>setOpen(false)}
                    >
                        <X />
                    </Button>
                </AlertDialogHeader>
                <Separator/>
                <div className="w-full">
                    <Input 
                        value={sectionTitle}
                        onChange={(e)=>setSectionTitle(e.target.value)}
                        className="bg-card border-border" 
                        type="text" 
                        placeholder="Section Title"
                    />
                </div>
                <div className="w-full flex flex-row justify-end gap-2">
                    <Button variant="ghost" onClick={()=>setOpen(false)} className="cursor-pointer hover:bg-red-400 border-0">Cancel</Button>
                    <Button variant="outline" onClick={handleAddSection} className="cursor-pointer bg-primary border-primary text-white font-medium">Add Section</Button>                    
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AddSection;