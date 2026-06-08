import { useRef, useState } from "react";
import useCreateCourseStore from "../../../store/createCourseStore";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Button } from "../../ui/button";
import { ChevronDown, ChevronRight, Folder, Plus, Upload,FolderPlus, Trash } from "lucide-react";
import { Input } from "../../ui/input";
import { toast } from "sonner";

const CreateCourseStep2=()=>{
    const {courseData, courseSections, addCourseSection, addFileToSection,removeFileFromSection}=useCreateCourseStore();
    const [openFolder,setOpenFolder]=useState<boolean>(false);
    const [sectionName,setSectionName]=useState<string>("");
    const [selectedSection,setSelectedSection]=useState<string>("");
    const [openAddSection,setOpenAddSection]=useState<boolean>(false);

    const handleAddSection=()=>{
        if(!sectionName){
            toast.error("Please enter a section name");
            return;
        }
        if(courseSections.some((section)=>section.title.toLowerCase()===sectionName.trim().toLowerCase())){
            toast.error("Section already exists");
            return;
        }
        addCourseSection(sectionName);
        setSectionName("");
        setOpenAddSection(false);
    }

    const fileInputRef=useRef<HTMLInputElement>(null);
    const triggerFileInput=()=>{
        fileInputRef.current?.click();
    };

    const handleFileInput=(event:React.ChangeEvent<HTMLInputElement>)=>{
        const file=event.target.files?.[0];
        const fileTitle=file?.name.split(".")[0];
        const fileType=file?.type.split("/")[0];
        const fileSize=file?.size;
        // const fileOrder=courseSections.find((section)=>section.title===selectedSection)?.files.length+1;
        if(file && selectedSection && fileSize){
            addFileToSection(selectedSection, file,fileTitle,fileSize,fileType);
        }
    };
    
    const currentSection = courseSections.find(s => s.title === selectedSection);
    const currentFiles = currentSection?.files || [];

    const handleRemoveFile=(fileTitle:string)=>{
        if(currentSection){
            removeFileFromSection(selectedSection,fileTitle);
        }
    }

    return(
        <div className="flex flex-row gap-4 mt-4 mb-4">
            {/* left collapsabile folder creation section */}
            <Card className="w-[25%] flex flex-col rounded-md border-none bg-transparent">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <div className="text-sm font-semibold text-text-strong">{courseData.title}</div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setOpenAddSection(!openAddSection);
                            setSectionName("");
                        }}
                        className="text-text-weak"
                    >
                        <FolderPlus/>
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* existing sections */}
                    {courseSections.map((section,index)=>{
                        return(
                            <div 
                                key={index} 
                                onClick={()=>{
                                    setSelectedSection(section.title);
                                    setOpenAddSection(false);
                                }}
                                className={`flex flex-row items-center gap-2 mb-2 hover:bg-gray-300/30 p-1 rounded-md cursor-pointer ${selectedSection===section.title ? "bg-primary/20 text-white" : ""}`}
                            >
                                <div className="flex flex-row items-center gap-2">
                                    {selectedSection===section.title ? <ChevronDown/> : <ChevronRight/>}
                                    <p className={`flex justify-start items-center gap-2 text-text-strong ${selectedSection===section.title ? "text-white" : ""}`}>
                                        <Folder size={18}/> {section.title}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {/* add section */}
                    {openAddSection && (
                        <div className="flex flex-col gap-2">
                            <Input 
                                type="text" 
                                value={sectionName} 
                                onChange={(e)=>setSectionName(e.target.value)} 
                                onKeyDown={(e)=>{
                                    if(e.key==="Enter"){
                                        handleAddSection();
                                    }
                                    if(e.key==="Escape"){
                                        setOpenAddSection(false);
                                    }
                                }}
                                placeholder="Section Name"
                                className="h-8"
                            />
                            <div className="flex flex-row gap-2">
                                <Button onClick={handleAddSection} variant="default" className="cursor-pointer bg-primary hover:bg-primary/80">
                                    <Plus/>
                                </Button>
                                <Button onClick={()=>{setOpenAddSection(false);}} variant="outline" className="cursor-pointer bg-transparent hover:bg-transparent">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                    
                </CardContent>
            </Card>

            {/* right folder content area */}
            <Card className="border border-border bg-transparent rounded-md p-4 w-full h-[500px]">
                {/* heading */}
                <div className="flex flex-row justify-between items-center">
                    <p className="text-text-strong text-xl font-semibold">Course Content</p>
                </div>
                {!selectedSection && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-text-weak text-lg font-medium">No content yet</p>
                        <p className="text-text-weak text-sm">Select a section to add content</p>
                    </div>
                )}
                {selectedSection && (
                    <div className="flex flex-col gap-2">
                        {/* upload files div */}
                        <div onClick={triggerFileInput} className="flex justify-center items-center w-full h-full cursor-pointer ">
                            <div className="flex flex-col gap-2 items-center border-2 border-dashed border-text-weak/50 rounded-md p-4">
                                <Upload size={24} className="text-text-weak"/>
                                <p className="text-text-weak text-sm font-medium">Upload Video, Audio, PDF or Images</p>
                                <Input className="hidden" ref={fileInputRef} type="file" onChange={handleFileInput}/>
                            </div>
                        </div>

                        {/* uploaded files list */}
                        <div className="border border-border rounded-md p-2">
                            {currentFiles.length===0 && (
                                <p className="text-text-weak text-sm">No files uploaded yet</p>
                            )}
                            {currentFiles.map((file,index)=>{
                                return(
                                    <div key={index} className="flex flex-row items-center justify-between gap-2 p-2 hover:bg-bg-1 rounded-md">
                                        <div className="flex flex-row items-center gap-2">
                                            <p className="text-text-strong text-sm">{file.title}</p>
                                            <p className="text-text-weak text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                            <p className="text-text-weak text-sm">{file.type}</p>
                                        </div>
                                        <div>
                                            <Button 
                                                variant="ghost" 
                                                onClick={()=>handleRemoveFile(file.title)}
                                                size="icon" 
                                                className="hover:bg-transparent hover:text-destructive cursor-pointer" title="Delete"
                                            >
                                                <Trash/>
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default CreateCourseStep2;