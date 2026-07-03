import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Calendar, Clock, DollarSign, Info, Languages, Loader2, NotebookPen, Plus, Save, Tag, Trash2, Upload, X } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useState,useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import useAuthStore from "../../store/authStore";
import useTeacherStore from "../../store/teacherStore";
import { NativeSelect, NativeSelectOption } from "../../components/ui/native-select";
import { toast } from "sonner";

const EditProfile=()=>{
    const {authUser,setAuthUser}=useAuthStore();
    const {updateTeacher,isUpdatingTeacher,teacher}=useTeacherStore();
    const avatarRef=useRef<HTMLInputElement>(null);
    const navigator=useNavigate();
    
    const [formData, setFormData]=useState<{
        name:string,
        headline:string,
        avatar:File | string,
        location:string,
        bio:string,
        subjects:string[],
        languages:string[],
        hourlyRate:number,
        availability:Array<{day_of_week:string, start_time:string, end_time:string}>,
    }>({
        name:teacher?.user?.name || '',
        headline:teacher?.headline || '',
        avatar:teacher?.user?.avatar_url || new File([],''),
        location:teacher?.location || '',
        bio:teacher?.bio || '',
        subjects:teacher?.subjects || [],
        languages:teacher?.languages || [],
        hourlyRate:teacher?.hourly_rate || 0,
        availability:teacher?.availabilities || [],
    });
    const [avatarPreview,setAvatarPreview]=useState<string>("");
    const [addSubjectField,setAddSubjectField]=useState<string>("");
    const [addLanguageField,setAddLanguageField]=useState<string>("");
    
    const [newSlot, setNewSlot] = useState({
        day_of_week: 'Monday',
        start_time: '09:00',
        end_time: '10:00'
    });

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // handlers
    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const {name,value}=e.target;
        setFormData((prev)=>({...prev,[name]:value}));
    };

    const handleAvatarChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file=e.target.files?.[0];
        if (!file) return;
        if(file){
            setFormData((prev)=>({...prev,avatar:file}));
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    
    const removeAvatar=()=>{
        setFormData((prev)=>({...prev,avatar:new File([],'')}));
        setAvatarPreview('');
    };

    const handleAddSubject=()=>{
        if(formData.subjects.includes(addSubjectField.trim()))return;
        if(!addSubjectField.trim())return;
        setFormData((prev)=>({...prev,subjects:[...prev.subjects,addSubjectField.toLocaleLowerCase().trim()]}));
        setAddSubjectField("");
    };
    const handleRemoveSubject=(index:number)=>{
        setFormData((prev)=>({...prev,subjects:prev.subjects.filter((_,i)=>i!==index)}));
    };
    const handleAddLanguage=()=>{
        if(formData.languages.includes(addLanguageField.trim()))return;
        if(!addLanguageField.trim())return;
        setFormData((prev)=>({...prev,languages:[...prev.languages,addLanguageField.toLocaleLowerCase().trim()]}));
        setAddLanguageField("");
    };
    const handleRemoveLanguage=(index:number)=>{
        setFormData((prev)=>({...prev,languages:prev.languages.filter((_,i)=>i!==index)}));
    };

    const handleAddSlot = () => {
        if(!newSlot.day_of_week||!newSlot.start_time||!newSlot.end_time)
            return;
        if(formData.availability?.some(slot=>slot.day_of_week===newSlot.day_of_week)){
            toast.error("Day already exists");
            return;
        }
        if(newSlot.start_time>=newSlot.end_time){
            toast.error("Start time must be before end time");
            return;
        }
        setFormData(prev => ({
            ...prev,
            availability: [...prev.availability, newSlot]
        }));
        setNewSlot({day_of_week:'Monday',start_time:'09:00',end_time:'10:00'});
    };

    const handleRemoveSlot = (index: number) => {
        setFormData(prev => ({
            ...prev,
            availability: prev.availability.filter((_, i) => i !== index)
        }));
    };

    const handleSaveChanges= async()=>{
        const newFormdata=new FormData();
        newFormdata.append('name',formData.name);
        newFormdata.append('headline',formData.headline);
        newFormdata.append('location',formData.location);
        newFormdata.append('bio',formData.bio);
        newFormdata.append('subjects',JSON.stringify(formData.subjects));
        newFormdata.append('languages',JSON.stringify(formData.languages));
        newFormdata.append('hourly_rate',formData.hourlyRate.toString());
        if(formData.avatar instanceof File && formData.avatar.size>0){
            newFormdata.append('avatar',formData.avatar);
        }
        newFormdata.append('availability',JSON.stringify(formData.availability));
        
        const updatedTeacher=await updateTeacher(newFormdata);
        if(updatedTeacher){
            // update auth user avatar
            setAuthUser({
                ...authUser!,
                name:updatedTeacher.name,
                avatar_url:updatedTeacher.user.avatar_url,
            });

            navigator("/dashboard/profile");
        }
    }

    return (
        <div className="flex flex-col gap-5">
            {/* top section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-2xl font-medium text-text-strong">Public Profile</p>
                    <p className="text-sm text-text-weak">Manage how you appear to students and institutions in the marketplace.</p>
                </div>
                <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                    <Button 
                        onClick={()=>navigator(-1)}
                        variant="outline" 
                        className="flex-1 sm:flex-none h-10 px-4 cursor-pointer">
                        <X className="h-4 w-4" /> <span className="font-medium">Discard</span>
                    </Button>
                    <Button 
                        onClick={handleSaveChanges}
                        disabled={isUpdatingTeacher}
                        className="flex-1 sm:flex-none h-10 px-4 hover:bg-primary/80 cursor-pointer"
                    >
                        {isUpdatingTeacher?(<Loader2 className="h-4 w-4 animate-spin"/>):<Save className="h-4 w-4" />} 
                        <span className="font-medium">{isUpdatingTeacher?"Updating...":"Save"}</span>
                    </Button>
                </div>
            </div>
            {/* basic info section */}
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
                            <AvatarImage src={(typeof formData.avatar === 'string' ? formData.avatar : avatarPreview==''?null:avatarPreview)} className="object-cover"/>
                            <AvatarFallback className="text-4xl">
                                {authUser?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                            {/* overlay to show when hover */}
                            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex items-center justify-center">
                                <Upload className="h-8 w-8 text-white " />
                            </div>
                        </Avatar>
                        
                        <Input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} ref={avatarRef}/>
                    </div>
                    {(typeof formData.avatar === 'string' || avatarPreview) && (
                        <Button className="h-10 px-4 cursor-pointer rounded-full" onClick={removeAvatar} variant="destructive">
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
                            onChange={handleChange}
                            type="text" 
                            placeholder="Dr. Example"
                        />
                    </Field>
                    <Field>
                        <FieldLabel>Headline</FieldLabel>
                        <Input 
                            name="headline" 
                            value={formData.headline}
                            onChange={handleChange}
                            type="text" 
                            placeholder="Add a headline to highlight your expertise"
                        />
                    </Field>
                    <Field className="md:col-span-2">
                        <FieldLabel>Location</FieldLabel>
                        <Input 
                            name="location" 
                            value={formData.location}
                            onChange={handleChange}
                            type="text" 
                            placeholder="City, Country"
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
            {/* subject and languages tags */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Experties or subjects tags section */}
                <div className="flex flex-col gap-4 bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-text-strong"/>
                        <p className="text-lg font-semibold text-text-strong">
                            Expertise / Subjects Tags
                        </p>
                    </div>
                    {/* tags list */}
                    <div className="flex flex-row flex-wrap gap-2 border border-dashed rounded-lg p-2 min-h-[50px]">
                        {formData.subjects.length===0?(
                            <p className="text-sm text-text-weak">No tags added yet.</p>
                        ):(
                            formData.subjects.map((subject,index)=>(
                                <div key={index} className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-full">
                                    <span className="text-sm text-primary">{subject}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer" onClick={()=>handleRemoveSubject(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                    {/* add tag section */}
                    <div className="flex flex-row gap-2">
                        <Field className="flex-1">
                            <Input 
                                type="text" 
                                placeholder="Add a tag"
                                value={addSubjectField}
                                onChange={(e)=>setAddSubjectField(e.target.value)}
                                onKeyDown={(e)=>{
                                    if(e.key==='Enter')handleAddSubject();
                                }}
                            />
                        </Field>
                        <Button
                            onClick={handleAddSubject}
                            variant="outline" 
                            className="px-4 cursor-pointer"
                        >
                            <Plus className="h-4 w-4" /> <span className="hidden sm:inline ml-1">Add</span>
                        </Button>
                    </div>
                </div>
                {/* languages section */}
                <div className="flex flex-col gap-4 bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <Languages className="h-5 w-5 text-text-strong"/>
                        <p className="text-lg font-semibold text-text-strong">
                            Languages
                        </p>
                    </div>
                    {/* languages list */}
                    <div className="flex flex-row flex-wrap gap-2 border border-dashed rounded-lg p-2 min-h-[50px]">
                        {formData.languages.length===0?(
                            <p className="text-sm text-text-weak">No languages added yet.</p>
                        ):(
                            formData.languages.map((language,index)=>(
                                <div key={index} className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-full">
                                    <span className="text-sm text-primary">{language}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer" onClick={()=>handleRemoveLanguage(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                    {/* add languages section */}
                    <div className="flex flex-row gap-2">
                        <Field className="flex-1">
                            <Input 
                                type="text" 
                                placeholder="Add a language"
                                value={addLanguageField}
                                onChange={(e)=>setAddLanguageField(e.target.value)}
                                onKeyDown={(e)=>{
                                    if(e.key==='Enter')handleAddLanguage();
                                }}
                            />
                        </Field>
                        <Button
                            onClick={handleAddLanguage}
                            variant="outline" 
                            className="px-4 cursor-pointer"
                        >
                            <Plus className="h-4 w-4" /> <span className="hidden sm:inline ml-1">Add</span>
                        </Button>
                    </div>
                </div>
            </div>
            {/* hourly rate section */}
            <div className="flex flex-col gap-4 bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-text-strong"/>
                    <p className="text-lg font-semibold text-text-strong">
                        Hourly Rate
                    </p>
                </div>
                <div className="w-full md:w-1/2">
                    <Field>
                        <FieldLabel>Base Hourly Rate ($)</FieldLabel>
                        <div className="flex items-center gap-2">
                            <span className="text-lg text-text-strong font-medium">$</span>
                            <Input 
                                type="number" 
                                placeholder="0.00"
                                value={formData.hourlyRate}
                                onChange={(e)=>setFormData(prev=>({...prev,hourlyRate:+e.target.value}))}
                            />
                            <span className="text-sm text-text-weak">/hour</span>
                        </div>
                    </Field>
                </div>
            </div>
            {/* Availability section */}
            <div className="flex flex-col gap-4 bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-text-strong"/>
                    <p className="text-lg font-semibold text-text-strong">
                        Weekly Availability
                    </p>
                </div>
                
                <div className="flex flex-col gap-6">
                    {/* add new slot form */}
                    <div className="p-4 bg-bg-1/30 border border-dashed border-border rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <Field>
                                <FieldLabel>Day of Week</FieldLabel>
                                <NativeSelect 
                                    className="w-full"
                                    value={newSlot.day_of_week}
                                    onChange={(e)=>setNewSlot(prev=>({...prev, day_of_week: e.target.value}))}
                                >
                                    {days.map(day => (
                                        <NativeSelectOption key={day} value={day}>{day}</NativeSelectOption>
                                    ))}
                                </NativeSelect>
                            </Field>
                            <Field>
                                <FieldLabel>Start Time</FieldLabel>
                                <Input 
                                    type="time" 
                                    value={newSlot.start_time}
                                    onChange={(e)=>setNewSlot(prev=>({...prev, start_time: e.target.value}))}
                                />
                            </Field>
                            <Field>
                                <FieldLabel>End Time</FieldLabel>
                                <Input 
                                    type="time" 
                                    value={newSlot.end_time}
                                    onChange={(e)=>setNewSlot(prev=>({...prev, end_time: e.target.value}))}
                                />
                            </Field>
                            <Button 
                                onClick={handleAddSlot}
                                variant="outline" 
                                className="h-10 px-4 cursor-pointer w-full lg:w-auto"
                            >
                                <Plus className="h-4 w-4" /> <span className="ml-1">Add Slot</span>
                            </Button>
                        </div>
                    </div>

                    {/* slots list */}
                    <div className="flex flex-col gap-3">
                        {formData.availability.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-border border-dashed">
                                <Clock className="h-8 w-8 text-text-weak mb-2 opacity-50" />
                                <p className="text-sm text-text-weak italic">No availability slots added yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {formData.availability.map((slot, index) => (
                                    <div key={index} className="flex flex-row justify-between items-center p-3 rounded-lg bg-bg-1/50 border border-border group hover:border-primary/50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-primary uppercase">{slot.day_of_week}</span>
                                            <span className="text-sm text-text-strong font-medium">
                                                {slot.start_time} - {slot.end_time}
                                            </span>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveSlot(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;