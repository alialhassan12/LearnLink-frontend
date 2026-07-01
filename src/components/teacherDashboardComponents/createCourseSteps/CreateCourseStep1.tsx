import { useEffect, useRef } from "react";
import useCreateCourseStore from "../../../store/createCourseStore";
import { Field, FieldGroup, FieldLabel } from "../../ui/field";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {NativeSelect,NativeSelectOption} from "../../ui/native-select";
import { Image, NotebookPen, NotebookText, Upload } from "lucide-react";
import { Button } from "../../ui/button";
import useCategoryStore from "../../../store/categoryStore";

const CreateCourseStep1=()=>{
    const {courseData,setCourseData,imagePreview,setImagePreview}=useCreateCourseStore();
    const {categories,getCategories}=useCategoryStore();

    useEffect(()=>{
        getCategories();
    },[]);

    const fileInputRef=useRef<HTMLInputElement>(null);
    // trigger file input
    const triggerFileInput=()=>{
        fileInputRef.current?.click();
    };

    // handle remove image
    const handleRemoveImage=()=>{
        setImagePreview("");
        setCourseData({...courseData,thumbnail:null});
        if(fileInputRef.current){
            fileInputRef.current.value="";
        }
    };
    
    // handle file upload
    const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file=e.target.files?.[0];
        if(file){
            setCourseData({...courseData,thumbnail:file});
            const reader=new FileReader();
            reader.onloadend=()=>{
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }
    // handle drag and drop
    const handleDragOver=(e:React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault();
    }
    const handleDrop=(e:React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault();
        const file=e.dataTransfer.files[0];
        if(file){
            setCourseData({...courseData,thumbnail:file});
            const reader=new FileReader();
            reader.onloadend=()=>{
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }
    return (
        <div className="flex flex-row gap-4 w-full mb-10 flex-wrap">
            {/* left general info */}
            <div className="flex flex-col justify-start items-start w-[50%] gap-4">
                {/* general info form */}
                <div className="flex flex-col gap-4 bg-card p-6 rounded-lg w-[100%]">
                    {/* title */}
                    <div className="flex flex-row items-center gap-2">
                        <NotebookPen/>
                        <p className="text-text-strong font-semibold text-2xl">General Info</p>
                    </div>
                    {/* form */}
                    <FieldGroup>
                        <Field>
                            <FieldLabel className="text-sm font-semibold text-text-weak">
                                Course Title
                            </FieldLabel>
                            <Input 
                                className="border-border" 
                                placeholder="Enter your course title" 
                                type="text"
                                value={courseData.title}
                                onChange={(e)=>setCourseData({...courseData,title:e.target.value})}
                            />
                        </Field>
                        {/* category select */}
                        <Field>
                            <FieldLabel className="text-sm font-semibold text-text-weak">
                                Category
                            </FieldLabel>
                            <NativeSelect
                                value={courseData.category_id}
                                onChange={(e)=>setCourseData({...courseData,category_id:Number(e.target.value)})}
                            >
                                <NativeSelectOption value={0} disabled>Select Category</NativeSelectOption>
                                {categories.map((category)=>{
                                    return(
                                        <NativeSelectOption className="bg-card text-text-strong" key={category.id} value={category.id}>{category.title}</NativeSelectOption>
                                    );
                                })}
                            </NativeSelect>
                        </Field>
                        {/* language select */}
                        <Field>
                            <FieldLabel className="text-sm font-semibold text-text-weak">
                                Language
                            </FieldLabel>
                            <NativeSelect
                                value={courseData.language}

                                onChange={(e)=>setCourseData({...courseData,language:e.target.value})}
                            >
                                <NativeSelectOption  value="" disabled >Select Language</NativeSelectOption>
                                <NativeSelectOption className="bg-card text-text-strong" value="English">English</NativeSelectOption>
                                <NativeSelectOption className="bg-card text-text-strong" value="Arabic">Arabic</NativeSelectOption>
                            </NativeSelect>
                        </Field>
                    </FieldGroup>
                </div>
                {/* description */}
                <div className="flex flex-col gap-4 bg-card p-6 rounded-lg w-[100%]">
                    {/* title */}
                    <div className="flex flex-row items-center gap-2">
                        <NotebookText/>
                        <p className="text-text-strong font-semibold text-2xl">Course Description</p>
                    </div>
                    {/* description input */}
                    <Field>
                        <Textarea 
                            value={courseData.description}
                            onChange={(e)=>setCourseData({...courseData,description:e.target.value})}
                            placeholder="Tell students what they will learn and why they should take this course..."
                        />
                    </Field>
                </div>
            </div>
            {/* right thumbnail */}
            <div className="flex flex-col gap-4 bg-card p-6 rounded-lg w-[40%] h-fit">
                {imagePreview
                    ?(
                        <>
                            <img src={imagePreview} className="w-full h-full object-cover rounded-lg" />
                            <Button variant={"destructive"} onClick={handleRemoveImage} className="w-full h-10 cursor-pointer">Remove Image</Button>
                        </>
                    )
                    :(
                        <>
                            {/* title */}
                            <div className="flex flex-row items-center gap-2">
                                <Image/>
                                <p className="text-text-strong font-semibold text-2xl">Course Thumbnail</p>
                            </div>
                            {/* thumbnail input */}
                            <div
                                onClick={triggerFileInput} 
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className="border border-dashed w-full h-40 rounded-lg flex flex-col justify-center items-center p-3 cursor-pointer hover:bg-bg-1 transition-all duration-300 ease-in-out"
                            >
                                <div className="bg-bg-1 p-4 rounded-full text-text-strong mb-3">
                                    <Upload size={20}/>
                                </div>
                                <p className="text-text-weak text-xs text-center">Drag and Drop, or click here to upload. Use .JPG, .JPEG, or .PNG Max 5MB.</p>
                            </div>
                            <Input 
                                className="hidden" 
                                ref={fileInputRef} 
                                type="file" 
                                accept=".jpg,.jpeg,.png" 
                                onChange={handleFileChange}
                            />
                        </>
                    )
                }
                
            </div>
        </div>
    );
}
export default CreateCourseStep1;