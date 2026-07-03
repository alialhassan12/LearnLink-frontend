import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useCourseStore } from "../../store/courseStore";
import useCategoryStore  from "../../store/categoryStore";
import type { CourseSection } from "../../@types/course_section";
import type { Course } from "../../@types/course";
import { ChevronDown, Image, Info, LayoutList, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "../../components/ui/native-select";
import { Button } from "../../components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible";
import AddSection from "../../components/teacherDashboardComponents/AddSection";
import { Spinner } from "../../components/ui/spinner";
import { Skeleton } from "../../components/ui/skeleton";

const EditCourse=()=>{
    const {id}=useParams();
    const {
        editCourse,
        isEditingCourse,
        courseWithMaterials,
        isGettingCourseWithMaterialsById,
        getCourseWithMaterialsById,
    }=useCourseStore();
    const {categories,getCategories,isGettingCategories}=useCategoryStore();
    const [openAddSection,setOpenAddSection]=useState<boolean>(false);
    const [formData,setFormData]=useState<Course|null>(null);

    const navigate=useNavigate();
    const uploadRef=useRef<HTMLInputElement>(null);
    const addMaterialRef=useRef<HTMLInputElement>(null);

    useEffect(()=>{
        getCategories();
        getCourseWithMaterialsById(Number(id));
        if(id){
            const course=courseWithMaterials;
            setFormData({
                course_id: course?.id ?? 0,
                teacher_id: course?.teacher_id ?? 0,
                category_id: course?.category_id ?? 0,
                title: course?.title ?? '',
                description: course?.description ?? '',
                thumbnail: course?.thumbnail ?? '',
                language: course?.language ?? '',
                price: course?.price as number ?? 0,
                sections: course?.sections as CourseSection[],
            })
        }
    },[id]);

    const handleEditCourse=async()=>{
        if(!formData || !formData.course_id) return;
        const success=await editCourse(formData.course_id,formData);
        if(success){
            navigate("/dashboard/my-courses");
        }
    }

    const handleUploadClick=()=>{
        uploadRef.current?.click();
    }

    const handleAddMaterialClick=()=>{
        addMaterialRef.current?.click();
    }


    const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file=e.target.files?.[0];
        if (!file) return;
        if(file){
            setFormData((prev)=>({...(prev as Course),thumbnail:file}));
        }
    }

    const handleAddMaterial=(sectionId:number,e:React.ChangeEvent<HTMLInputElement>)=>{
        const file=e.target.files?.[0];
        if (!file) return;
        if(file){
            setFormData((prev)=>{
                if(!prev) return null;
                return{
                    ...prev,
                    sections:prev.sections?.map((s)=>{
                        if(s.id!==sectionId) return s;

                        return{
                            ...s,
                            materials:[...(s.materials ?? []),{
                                id:-(s.materials?.length!+1),
                                file:file,
                                title:file.name,
                                type:file.type.startsWith("video/")?"video":file.type.startsWith("image/")?"image":"document",
                                size:file.size,
                            }]
                        }
                    })
                }
            })
        }
    }
    const handleDeleteMaterial=(sectionId:number,materialId:number)=>{
        setFormData((prev)=>{
            if(!prev) return null;
            return{
                ...prev,
                sections:prev.sections?.map((s)=>{
                    if(s.id !== sectionId) return s;
                    return{
                        ...s,
                        materials:s.materials?.filter((m)=>m.id !==materialId)
                    }
                })
            }
        })
    }
    const handleDeleteSection=(sectionId:number)=>{
        setFormData((prev)=>{
            if(!prev) return null;
            return{
                ...prev,
                sections:prev.sections?.filter((s)=>s.id !==sectionId)
            }
        })
    }

    if(isGettingCourseWithMaterialsById || isGettingCategories || !formData){
        return <EditCourseSkeleton/>
    }

    return(
        <div className="flex flex-col items-center gap-5">
            {/* basic info */}
            <div className="flex flex-col gap-4 bg-card border border-border rounded-lg p-4 sm:p-6 w-full">
                <div className="flex flex-row items-center justify-start gap-3 ">
                    <div className="bg-primary/10 text-primary p-2 rounded-full shrink-0">
                        <Info/>
                    </div>
                    <div className="flex flex-col items-start justify-start ">
                        <h2 className="text-lg font-semibold">Basic Information</h2>
                        <p className="text-muted-foreground text-sm">The core details of your course that students see first.</p>
                    </div>
                </div>
                {/* form */}
                <div className="flex flex-col gap-2">
                    {/* title */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Course Title</label>
                        <Input
                            value={formData?.title}
                            onChange={(e)=>setFormData({...formData,title:e.target.value})}
                            className="h-10"
                            placeholder="Enter course title"
                        />
                    </div>
                    {/* description */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Description </label>
                        <Textarea
                            value={formData?.description}
                            onChange={(e)=>setFormData({...formData,description:e.target.value})}
                            className="h-40"
                            placeholder="Enter course description"
                        />
                    </div>
                    {/* category + price */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full">
                        <div className="w-full sm:w-1/2">
                            <label className="text-sm font-medium text-muted-foreground">Category</label>
                            <NativeSelect 
                                className="w-full h-10" 
                                value={formData?.category_id} 
                                onChange={(e)=>setFormData({...formData,category_id:Number(e.target.value)})}
                            >
                                {categories.map((category)=>{
                                    return(
                                        <NativeSelectOption value={category?.id} key={category?.id} >{category?.title}</NativeSelectOption>
                                    );
                                })}
                            </NativeSelect>
                        </div>
                        <div className="w-full sm:w-1/2">
                            <label className="text-sm font-medium text-muted-foreground">Price</label>
                            <Input
                                type="number"
                                min={0}
                                step={0.01}
                                value={formData?.price}
                                onChange={(e)=>setFormData({...formData,price:Number(e.target.value)})}
                                className="h-10"
                                placeholder="Enter course price"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* thumbnail */}
            <div className="flex flex-col gap-4 bg-card border border-border rounded-lg p-4 sm:p-6 w-full">
                <div className="flex flex-row items-center justify-start gap-3 ">
                    <div className="bg-primary/10 text-primary p-2 rounded-full shrink-0">
                        <Image/>
                    </div>
                    <div className="flex flex-col items-start justify-start ">
                        <h2 className="text-lg font-semibold">Course Thumbnail</h2>
                        <p className="text-muted-foreground text-sm">Upload visual assets to attract more students.</p>
                    </div>
                </div>
                <div className="flex justify-center items-center w-full">
                    <div className="flex flex-col gap-2 w-full max-w-[480px]">
                        <div 
                            className="relative w-full aspect-video border-2 border-dashed border-border bg-muted rounded-lg overflow-hidden flex justify-center items-center hover:border-primary/50 transition-colors cursor-pointer group"
                            onClick={handleUploadClick}
                        >
                            {
                                formData?.thumbnail ? (
                                    <img src={formData?.thumbnail instanceof File ? URL.createObjectURL(formData?.thumbnail) : courseWithMaterials?.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Image className="w-12 h-12 text-muted-foreground" />
                                )
                            }
                            {/* overlay on hover */}
                            <div className="absolute inset-0 bg-black/35 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Upload className="w-10 h-10 text-white" />
                                <span className="text-sm text-white font-medium mt-2">{formData?.thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}</span>
                            </div>
                        </div>
                        <input type="file" className="hidden" ref={uploadRef} onChange={handleFileChange}/>
                    </div>
                </div>
            </div>

            {/* course sections */}
            <div className="flex flex-col gap-4 bg-card border border-border rounded-lg p-4 sm:p-6 w-full ">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                    <div className="flex flex-row items-center gap-3 ">
                        <div className="bg-primary/10 text-primary p-2 rounded-full shrink-0">
                            <LayoutList/>
                        </div>
                        <div className="flex flex-col items-start justify-start ">
                            <h2 className="text-lg font-semibold">Course Sections</h2>
                            <p className="text-muted-foreground text-sm">Structure your course into sections and lessons.</p>
                        </div>
                    </div>
                    <Button 
                        variant="outline" 
                        className="h-10 cursor-pointer w-full sm:w-auto shrink-0"
                        onClick={()=>setOpenAddSection(true)}
                    >
                        <Plus className="w-4 h-4 mr-2"/>
                        Add Section
                    </Button>
                </div>
                <div className="flex flex-col divide-y divide-border">
                    {formData?.sections?.map((section,index)=>{
                        return(
                            <div className="flex flex-row items-center gap-3 p-4 w-full">
                                <Collapsible key={index} className="w-full border border-border rounded-md">
                                    <CollapsibleTrigger className="w-full hover:bg-muted/50 rounded-md transition-colors p-4 cursor-pointer group">
                                        <div className="flex flex-row justify-between items-center w-full">
                                            <div className="flex flex-col items-start text-left">
                                                <p className="text-sm md:text-base font-medium group-hover:text-primary transition-colors">{section.title}</p>
                                                <p className="text-muted-foreground text-xs md:text-sm mt-1">{section.materials.length} materials</p>
                                            </div>
                                            <ChevronDown className="w-5 h-5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform duration-200"/>

                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="p-4 pt-0">
                                        <div className="flex flex-col gap-2 mt-4">
                                            {section?.materials?.map((material,index)=>{
                                                return(
                                                    <div key={index} className="bg-background border border-border p-3 rounded-md flex flex-row items-center justify-between gap-3 hover:border-primary/30 transition-colors">
                                                        <div className="flex flex-row items-center gap-2">
                                                            <div className="p-2 bg-muted rounded-md shrink-0">
                                                                <Upload className="w-4 h-4 text-muted-foreground"/>
                                                            </div>
                                                            <p className="text-sm font-medium line-clamp-1">{material.title}</p>
                                                        </div>
                                                        <Button 
                                                            onClick={()=>handleDeleteMaterial(section?.id ?? 0,material?.id ?? 0)}
                                                            variant="destructive" 
                                                            size="icon" 
                                                            className="h-8 w-8 cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4"/>
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                            {section.materials.length === 0 && (
                                                <div className="text-center p-4 text-sm text-muted-foreground border border-dashed border-border rounded-md">
                                                    No materials in this section yet.
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-row items-center justify-center pt-4">
                                            <Button variant="outline" onClick={()=>handleAddMaterialClick()} className="h-10 cursor-pointer bg-card border border-border rounded-md w-full">
                                                <Plus className="w-4 h-4"/>
                                                <span className="text-sm font-medium ml-2">Add Material</span>
                                            </Button>
                                            <input ref={addMaterialRef} type="file" className="hidden" onChange={(e)=>handleAddMaterial(section?.id ?? 0,e)}/>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                                <Button 
                                    onClick={()=>handleDeleteSection(section?.id ?? 0)}
                                    className="cursor-pointer shrink-0 h-10" 
                                    variant="destructive" 
                                    size="icon"
                                >
                                    <Trash2/>
                                </Button>
                            </div>
                        );
                    })}
                    {(!formData?.sections || formData?.sections.length === 0) && (
                        <div className="text-center p-8 text-muted-foreground text-sm">
                            No sections added to this course yet.
                        </div>
                    )}
                </div>
            </div>
            <AddSection open={openAddSection} setOpen={setOpenAddSection} setFormData={setFormData} />
            <div className="sticky flex flex-row justify-end items-center gap-2 w-full p-4 bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-20">
                <Button 
                    className="cursor-pointer" 
                    variant="outline" 
                    disabled={isEditingCourse}
                    onClick={()=>navigate(-1)}
                >
                    Cancel
                </Button>
                <Button 
                    className="cursor-pointer bg-primary border-primary text-white"
                    disabled={isEditingCourse}
                    onClick={handleEditCourse}
                >
                    {isEditingCourse?
                        <div className="flex flex-row items-center gap-2">
                            <Spinner/>
                            <p className="text-sm font-medium">Updating Course</p>
                        </div>
                        :
                        <div className="flex flex-row items-center gap-2">
                            <Pencil className="w-4 h-4"/>
                            <p className="text-sm font-medium">Update Course</p>
                        </div>
                    }
                </Button>
            </div>
        </div>
    )
}

const EditCourseSkeleton = () => {
    return (
        <div className="flex flex-col items-center gap-5 w-full animate-pulse pb-20">
            {/* basic info skeleton */}
            <div className="flex flex-col gap-4 bg-card border border-border rounded-lg p-4 sm:p-6 w-full">
                <div className="flex flex-row items-center justify-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-72 max-w-full" />
                    </div>
                </div>
                <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full">
                        <div className="w-full sm:w-1/2 flex flex-col gap-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="w-full sm:w-1/2 flex flex-col gap-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* thumbnail skeleton */}
            <div className="flex flex-col gap-4 bg-card border border-border rounded-lg p-4 sm:p-6 w-full">
                <div className="flex flex-row items-center justify-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-72 max-w-full" />
                    </div>
                </div>
                <div className="flex justify-center items-center w-full mt-2">
                    <div className="w-full max-w-[480px]">
                        <Skeleton className="w-full aspect-video rounded-lg" />
                    </div>
                </div>
            </div>

            {/* course sections skeleton */}
            <div className="flex flex-col gap-4 bg-card border border-border rounded-lg p-4 sm:p-6 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                    <div className="flex flex-row items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-72 max-w-full" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-32 shrink-0 rounded-md" />
                </div>
                <div className="flex flex-col gap-3 mt-2">
                    <Skeleton className="h-16 w-full rounded-md" />
                    <Skeleton className="h-16 w-full rounded-md" />
                </div>
            </div>

            {/* sticky footer skeleton */}
            <div className="sticky flex flex-row justify-end items-center gap-2 w-full p-4 bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-20">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-36 rounded-md" />
            </div>
        </div>
    );
};

export default EditCourse;