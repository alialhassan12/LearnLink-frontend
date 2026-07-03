import { Info, Loader2, NotebookPen, Save, Upload, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useStudentStore } from "../../store/studentmarketplaceStores/studentStore";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Field, FieldGroup, FieldLabel } from "../../components/ui/field";
import { Textarea } from "../../components/ui/textarea";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const EditProfile=()=>{
    const {setAuthUser,authUser}=useAuthStore();
    const {student,editStudentProfile,isEditingStudentProfile}=useStudentStore();
    const [formData,setFormData]=useState<{
        name:string;
        email:string;
        avatar:File | null;
        avatar_url:string;
        bio:string,
        headline:string
    }>({
        name:student?.user?.name || "",
        email:student?.user?.email || "",
        avatar:null,
        avatar_url:student?.user?.avatar_url || "",
        bio:student?.bio || "",
        headline:student?.headline || ""
    });
    
    const navigate=useNavigate(); 

    const avatarRef=useRef<HTMLInputElement>(null);

    const handleAvatarChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file=e.target.files?.[0];
        if (!file) return;
        if(file){
            setFormData({
                ...formData,
                avatar:file,
                avatar_url:URL.createObjectURL(file)
            });
        }
    }
    const handleRemoveAvatar=()=>{
        setFormData({
            ...formData,
            avatar:null,
            avatar_url:""
        });
    }

    const handleEditProfile=async()=>{
        const data=new FormData();

        data.append("name",formData.name);
        data.append("headline",formData.headline);
        data.append("bio",formData.bio);
        if(formData.avatar){
            data.append("avatar",formData.avatar);
        }

        const updatedStudent=await editStudentProfile(data);
        if(updatedStudent){
            setAuthUser({
                ...authUser,
                name:updatedStudent.user.name,
                avatar_url:updatedStudent.user.avatar_url
            });
            navigate(-1);
        }
    }

    return (
        <div className="flex flex-col gap-4 px-4 py-4">
            {/* top section */}
            <div className="flex flex-col gap-2 justify-start items-start">
                <h1 className="text-2xl font-medium text-text-strong">Edit Public Profile</h1>
                <p className="text-sm text-text-weak">Manage how you appear to other students and institutions in the marketplace.</p>
            </div>

            {/* basic info */}
            <div className="flex flex-col gap-4 bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-text-strong"/>
                    <p className="text-lg font-semibold text-text-strong">
                        Basic Info
                    </p>
                </div>

                {/* avatar upload section */}
                <div className="flex flex-col gap-3 items-center relative">
                    <div className="relative w-48 h-48 rounded-full overflow-hidden border-2 border-secondary cursor-pointer" onClick={()=>{avatarRef.current?.click();}}>
                        <Avatar className="h-full w-full hover:scale-110 transition-all duration-300 ease-in-out group" >
                            <AvatarImage src={formData.avatar_url} className="object-cover"/>
                            <AvatarFallback className="text-4xl">
                                {formData.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                            {/* overlay to show when hover */}
                            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex items-center justify-center">
                                <Upload className="h-8 w-8 text-white " />
                            </div>
                        </Avatar>
                        
                        <Input type="file" accept="image/*" className="hidden" ref={avatarRef} onChange={handleAvatarChange}/>
                    </div>
                    {((typeof formData.avatar === 'object' && formData.avatar !== null) || (formData.avatar_url != "")) && (
                        <Button 
                            className="h-10 px-4 cursor-pointer rounded-full"
                            variant="destructive"
                            onClick={handleRemoveAvatar}
                        >
                            <X/>remove avatar
                        </Button>
                    )}
                </div>
                {/* name , headline , location */}
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel>Name</FieldLabel>
                        <Input 
                            name="name" 
                            value={formData.name}
                            onChange={(e)=>{
                                setFormData({...formData,name:e.target.value})
                            }}
                            type="text" 
                            placeholder="Dr. Example"
                        />
                    </Field>
                    <Field>
                        <FieldLabel>Headline</FieldLabel>
                        <Input 
                            name="headline" 
                            value={formData.headline}
                            onChange={(e)=>{
                                setFormData({...formData,headline:e.target.value})
                            }}
                            type="text" 
                            placeholder="Add a headline for your profile"
                        />
                    </Field>
                </FieldGroup>
            </div>
            {/* Bio / About section*/}
            <div className="flex flex-col gap-4 bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2">
                    <NotebookPen className="h-5 w-5 text-text-strong"/>
                    <p className="text-lg font-semibold text-text-strong">
                        Bio / About
                    </p>
                </div>
                <Field>
                    <Textarea 
                        name="bio" 
                        value={formData.bio}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            setFormData(prev=>({...prev,bio:e.target.value}))
                        }}
                        placeholder="Talk about ur experience and teaching skills"
                        className="min-h-[200px] resize-none"
                    />
                </Field>
            </div>

            {/* bottom section */}
            <div className="flex justify-end items-end border-t border-border py-4 px-4 mt-4 sticky bottom-0 z-50 bg-bg-1/50 backdrop-blur-xl">
                <div className="flex flex-row gap-2">
                    <Button
                        onClick={()=>{
                            navigate(-1);
                        }}
                        className="px-4 h-10 cursor-pointer"
                        disabled={isEditingStudentProfile} 
                        variant="outline"
                    >
                        <p className="font-medium">Discard</p>
                        <X className="w-4 h-4"/>
                    </Button>
                    <Button 
                        className="px-4 h-10 cursor-pointer bg-primary hover:bg-primary/80"
                        variant="default"
                        onClick={handleEditProfile}
                        disabled={isEditingStudentProfile}
                    >
                        {isEditingStudentProfile ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin"/>
                                <p className="font-medium">Saving...</p>
                            </>
                        ) : (
                            <>
                                <p className="font-medium">Save</p>
                                <Save className="w-4 h-4"/>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;