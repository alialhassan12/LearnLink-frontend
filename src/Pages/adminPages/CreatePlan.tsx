import { Bolt, CircleCheck, Eye, Info, Plus, Settings, Trash } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "../../components/ui/native-select";
import { useState } from "react";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import AddFeatureDialog, { type CustomFeature } from "../../components/adminDashboard/AddFeatureDialog";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { toast } from "sonner";
import { usePlanStore } from "../../store/adminDashboardStores/plansStore";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../components/ui/spinner";

const CreatePlan = () => {
    const {createPlan,isCreatingPlan}=usePlanStore();
    const navigate=useNavigate();

    const [standardFeatures,setStandardFeatures]=useState<{
        label:string,
        name:string,
        type: 'number' | 'boolean' | 'string',
        value:any,
        limitedcheck?:boolean
    }[]>([
        {
            label:"Max Courses",
            name:"max_courses",
            type:"number",
            value:0,
            limitedcheck:false
        },
        {
            label:"Sessions per Month",
            name:"sessions_per_month",
            type:"number",
            value:0,
            limitedcheck:false
        },
        {
            label:"AI Tokens per Month",
            name:"ai_tokens_per_month",
            type:"number",
            value:0,
            limitedcheck:false
        },
        {
            label:"Search Priority",
            name:"search_priority",
            type:"boolean",
            value:false
        }
    ]);
    const [formData,setFormData]=useState<{
        planName:string,
        planDescription:string,
        type:string,
        price:number,
        duration:number | null,
        is_free:boolean,
        status:string
    }>({planName:"",planDescription:"",type:"",price:1,duration:null,is_free:false,status:"active"});

    const [customFeatures,setCustomFeatures]=useState<CustomFeature[]>([]);

    const [addFeatureDialog,setAddFeatureDialog]=useState<boolean>(false);

    const handleDeleteCustomFeature = (name: string) => {
        setCustomFeatures(prev => prev.filter(f => f.name !== name));
    };
    const clearForm=()=>{
        setFormData({planName:"",planDescription:"",type:"",price:1,is_free:false,duration:null,status:"active"});
        setCustomFeatures([]);
        setStandardFeatures([
            {
                label:"Max Courses",
                name:"max_courses",
                type:"number",
                value:0,
                limitedcheck:false
            },
            {
                label:"Sessions per Month",
                name:"sessions_per_month",
                type:"number",
                value:0,
                limitedcheck:false
            },
            {
                label:"AI Tokens per Month",
                name:"ai_tokens_per_month",
                type:"number",
                value:0,
                limitedcheck:false
            },
            {
                label:"Search Priority",
                name:"search_priority",
                type:"boolean",
                value:false
            }
        ]);
    }

    const handleCreatePlan=async()=>{
        if(formData.planName.trim() === "" || formData.planDescription.trim() === "" || formData.type.trim() === "" ){
            toast.error("Please fill all the fields");
            return;
        }
        if(formData.duration<=0){
            toast.error("Please enter valid duration");
            return;
        }
        const features:any={}
        standardFeatures.forEach((feature)=>{
            features[feature.name]=feature.value;
        });
        customFeatures.forEach((feature)=>{
            features[feature.name]=feature.value;
        });

        const data={
            title:formData.planName,
            description:formData.planDescription,
            type:formData.type,
            features:features,
            duration_days:formData.duration,
            price:formData.is_free?0:formData.price,
            is_free:formData.is_free,
            status:formData.status
        }
        // console.log(data);
        const success=await createPlan(data);
        if(success){
            clearForm();
            navigate("/admin/dashboard/plans");
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {/* header */}
            <div className="">
                <p className="text-text-strong text-3xl font-bold">Create New Plan</p>
                <p className="text-text-weak">Create and configure subscription plans for LearnLink users.</p>
            </div>
            {/* body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* left section */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* basic plan info */}
                    <div className="flex flex-col p-4 sm:p-6 bg-card border border-border rounded-lg">
                        <div className="flex flex-row items-center gap-2 mb-6">
                            <Info size={"22"} className="text-primary/70 font-bold"/>
                            <p className=" text-text-strong text-2xl font-semibold">Basic plan info</p>
                        </div>
                        {/* title */}
                        <div className="flex flex-col gap-2 mb-4">
                            <label className="uppercase text-text-weak text-sm">Plan Title</label>
                            <Input 
                                type="text" 
                                placeholder="Name your plan"
                                className="h-10 text-text-strong" 
                                value={formData.planName}
                                onChange={(e)=>setFormData({...formData,planName:e.target.value})}
                            />
                        </div>
                        {/* description */}
                        <div className="flex flex-col gap-2 mb-4">
                            <label className="uppercase text-text-weak text-sm">Plan Description</label>
                            <Textarea  
                                placeholder="Describe your plan"
                                className="min-h-20 text-text-strong" 
                                value={formData.planDescription}
                                onChange={(e)=>setFormData({...formData,planDescription:e.target.value})}
                            />
                        </div>
                        {/* Plan Type */}
                        <div className="flex flex-col gap-2 mb-4">
                            <label className="uppercase text-text-weak text-sm">Plan Type</label>
                            <NativeSelect 
                                defaultValue={""}
                                className="text-text-strong"
                                value={formData.type}
                                onChange={(e)=>setFormData({...formData,type:e.target.value})}
                            >
                                <NativeSelectOption className="bg-card text-text-strong text-sm" disabled value={""}>Select plan type</NativeSelectOption>
                                <NativeSelectOption className="bg-card text-text-strong text-sm" value="teacher">Teacher</NativeSelectOption>
                                <NativeSelectOption className="bg-card text-text-strong text-sm" value="student">Student</NativeSelectOption>
                            </NativeSelect>
                        </div>
                    </div>
                    {/* plan features */}
                    {formData.type == "" &&(
                        <></>
                    )}
                    <div className="flex flex-col p-4 sm:p-6 bg-card border border-border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex flex-row items-center gap-2">
                                <Bolt size={"22"} className="text-primary/70 font-bold"/>
                                <p className=" text-text-strong text-2xl font-semibold">Plan Features</p>
                            </div>
                            <Button 
                                variant="outline" 
                                className="flex items-center cursor-pointer"
                                onClick={() => setAddFeatureDialog(true)}
                            >
                                <Plus size={"20"}/>
                                <p>Add Feature</p>
                            </Button>
                        </div>
                        {/* features */}
                        <div className="flex flex-col gap-4">
                            {formData.type && formData.type=="teacher" &&(

                                standardFeatures.map((feature,index)=>{
                                    return (
                                        <div key={index} className="flex flex-col bg-bg-1/60 border border-border p-4 rounded-md">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <span className="font-medium text-text-strong">{feature.label}</span>
                                                {
                                                    feature.type==="number"&&(
                                                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                                            <Input 
                                                                type="number"
                                                                value={feature.value}
                                                                min={-1}
                                                                className="w-24 text-text-strong" 
                                                                disabled={feature.limitedcheck}
                                                                onChange={(e)=>setStandardFeatures(prev=>prev.map(f=>f.name===feature.name?{...f,value:e.target.value}:f))}
                                                            />
                                                            <div className="flex flex-row items-center gap-2">
                                                                <label className="text-text-weak text-sm">
                                                                    {feature.limitedcheck?"unlimited":"limited"}
                                                                </label>
                                                                <Switch
                                                                    checked={feature.limitedcheck}
                                                                    onCheckedChange={(checked)=>setStandardFeatures(prev=>prev.map(f=>f.name===feature.name?{...f,limitedcheck:checked,value:checked?-1:0}:f))}
                                                                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-zinc-500/40 cursor-pointer"
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                {
                                                    feature.type==="string"&&(
                                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                                            <Input 
                                                                type="text"
                                                                value={feature.value}
                                                                placeholder="Value"
                                                                className="w-full sm:w-48 text-text-strong" 
                                                                onChange={(e)=>setStandardFeatures(prev=>prev.map(f=>f.name===feature.name?{...f,value:e.target.value}:f))}
                                                            />
                                                        </div>
                                                    )
                                                }
                                                {
                                                    feature.type==="boolean" &&(
                                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                                            <label className="text-text-weak text-sm">{feature.value?"Enabled":"Disabled"}</label>
                                                            <Switch 
                                                                checked={feature.value}
                                                                onCheckedChange={(checked)=>setStandardFeatures(prev=>prev.map(f=>f.name===feature.name?{...f,value:checked}:f))}
                                                                className="cursor-pointer"
                                                            />
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            )
                            }
                            <div className="flex flex-row items-center justify-between mt-4">
                                <span className="font-medium">Custom Features</span>
                            </div>
                            {
                                customFeatures.map((feature,index)=>{
                                    return (
                                        <div key={index} className="flex flex-col bg-bg-1/60 border border-border p-4 rounded-md">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <span className="font-medium text-text-strong">{feature.label}</span>
                                                {
                                                    feature.type==="number"&&(
                                                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                                            <Input 
                                                                type="number"
                                                                value={feature.value}
                                                                min={-1}
                                                                className="w-24 text-text-strong" 
                                                                disabled={feature.limitedcheck}
                                                                onChange={(e)=>setCustomFeatures(prev=>prev.map(f=>f.name===feature.name?{...f,value:e.target.value}:f))}
                                                            />
                                                            <div className="flex flex-row items-center gap-2">
                                                                <label className="text-text-weak text-sm">
                                                                    {feature.limitedcheck?"unlimited":"limited"}
                                                                </label>
                                                                <Switch
                                                                    checked={feature.limitedcheck}
                                                                    onCheckedChange={(checked)=>setCustomFeatures(prev=>prev.map(f=>f.name===feature.name?{...f,limitedcheck:checked,value:checked?-1:0}:f))}
                                                                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-zinc-500/40 cursor-pointer"
                                                                />
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="hover:text-red-500 hover:bg-red-500/10"
                                                                    onClick={() => handleDeleteCustomFeature(feature.name)}
                                                                >
                                                                    <Trash/>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                {
                                                    feature.type==="string"&&(
                                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                                            <Input 
                                                                type="text"
                                                                value={feature.value}
                                                                placeholder="Value"
                                                                className="w-full sm:w-48 text-text-strong" 
                                                                onChange={(e)=>setCustomFeatures(prev=>prev.map(f=>f.name===feature.name?{...f,value:e.target.value}:f))}
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="hover:text-red-500 hover:bg-red-500/10"
                                                                onClick={() => handleDeleteCustomFeature(feature.name)}
                                                            >
                                                                <Trash/>
                                                            </Button>
                                                        </div>
                                                    )
                                                }
                                                {
                                                    feature.type==="boolean" &&(
                                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                                            <label className="text-text-weak text-sm">{feature.value?"Enabled":"Disabled"}</label>
                                                            <Switch 
                                                                checked={feature.value}
                                                                onCheckedChange={(checked)=>setCustomFeatures(prev=>prev.map(f=>f.name===feature.name?{...f,value:checked}:f))}
                                                                className="cursor-pointer"
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="hover:text-red-500 hover:bg-red-500/10"
                                                                onClick={() => handleDeleteCustomFeature(feature.name)}
                                                            >
                                                                <Trash/>
                                                            </Button>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    {/* pricing and duration */}
                    <div className="flex flex-col p-4 sm:p-6 bg-card border border-border rounded-lg">
                        <div className="flex flex-row items-center gap-2 mb-6">
                            <Settings size={"22"} className="text-primary/70 font-bold"/>
                            <p className=" text-text-strong text-2xl font-semibold">Subscription Settings</p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
                            {/* duration */}
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                                <label className="uppercase text-text-weak text-sm">Duration (in days)</label>
                                <Input 
                                    type="number" 
                                    placeholder="Enter duration in days" 
                                    className="h-10 text-text-strong w-full sm:w-52" 
                                    min={1} 
                                    value={formData.is_free?null:formData.duration}
                                    disabled={formData.is_free}
                                    onChange={(e)=>setFormData({...formData,duration:Number(e.target.value)})}
                                />
                            </div>
                            {/* amount */}
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                                <label className="uppercase text-text-weak text-sm">Price (in USD)</label>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="number" 
                                        placeholder="Enter price in USD" 
                                        className="h-10 text-text-strong w-full sm:w-52" 
                                        min={1} 
                                        disabled={formData.is_free}
                                        value={formData.is_free?0:formData.price}
                                        onChange={(e)=>setFormData({...formData,price:Number(e.target.value)})}
                                    />
                                    <Switch 
                                        checked={formData.is_free}
                                        onCheckedChange={(checked)=>setFormData({...formData,is_free:checked,price:0,duration:checked?null:1})}
                                        className="cursor-pointer"
                                    />
                                    <span className="text-text-weak">Free</span>
                                </div>
                            </div>
                            {/* status */}
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                                <label className="uppercase text-text-weak text-sm">Status</label>
                                <NativeSelect 
                                    className="h-10 text-text-strong w-full sm:w-52" 
                                    value={formData.status}
                                    onChange={(e)=>setFormData({...formData,status:e.target.value})}
                                >
                                    <NativeSelectOption value="active">Active</NativeSelectOption>
                                    <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
                                </NativeSelect>
                            </div>
                        </div>
                    </div>
                </div>
                {/* right section */}
                <div className="lg:col-span-1">
                    <div className="flex flex-col gap-4 lg:sticky lg:top-24 h-fit">
                        {/* plan preview */}
                        <div className="flex flex-col py-6 px-6 sm:px-10 gap-4 border border-border rounded-lg bg-gradient-to-bl from-primary/30 via-bg-card/10 to-bg-card hover:bg-gradient-to-bl hover:from-primary/50 hover:via-bg-card/10 hover:to-bg-card transition-all duration-800">
                            <Badge variant={(formData.type === "teacher" || formData.type === "student") ? "default" : "outline"}>
                                {formData.type.charAt(0).toUpperCase() + formData.type.slice(1) || "Unknown Type"} Plan
                            </Badge>
                            <div className="flex flex-col items-start justify-center">
                                <p className=" text-text-strong text-2xl font-semibold">{formData.planName || "Plan Title"}</p>
                                <p className="text-sm text-text-weak">{formData.planDescription || "No description provided yet."}</p>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <p className="text-3xl font-bold text-text-strong">${formData.price || 0}</p>
                                {formData.duration !== null?(
                                    <span className="text-sm text-text-weak">/ {formData.duration || 0} days</span>
                                ):(
                                    <span className="text-sm text-text-weak">Lifetime</span>
                                )}
                            </div>
                            <Separator/>
                            {/* features */}
                            <div className="flex flex-col gap-2">
                                {standardFeatures.map((feature,index)=>{
                                    return(
                                        <div 
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            <CircleCheck className="w-4 h-4 text-primary"/>
                                            <span className="text-sm text-text-strong">{feature.label}</span>
                                        </div>
                                    );
                                })}
                                {customFeatures.map((feature,index)=>{
                                    return(
                                        <div 
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            <CircleCheck className="w-4 h-4 text-primary"/>
                                            <span className="text-sm text-text-strong">{feature.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <Button className="w-full">
                                Subscribe now
                            </Button>
                        </div>
                        <div className="flex items-center justify-center gap-2 p-4 bg-card border border-border rounded-lg text-text-weak">
                            <Eye size={"20"}/>
                            <p className=" font-semibold">Live Preview updates as you type</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* footer */}
            <div className="sticky bottom-0 left-0 right-0 flex items-center justify-end gap-2 p-4 bg-bg-1/80 backdrop-blur-md border-t border-border z-50">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="cursor-pointer h-10 hover:bg-card hover:border-primary hover:text-primary"
                    disabled={isCreatingPlan}
                    onClick={()=>{
                        clearForm();
                        navigate(-1);
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    variant="default" 
                    size="sm" 
                    className="cursor-pointer h-10 hover:bg-primary/80"
                    onClick={handleCreatePlan}
                    disabled={isCreatingPlan}
                >
                    {isCreatingPlan?
                    <div className="flex items-center gap-2">
                        <Spinner/>
                        <p>Creating Plan...</p>
                    </div>:
                    <p>Create Plan</p>
                    }
                </Button>
            </div>
            <AddFeatureDialog open={addFeatureDialog} setOpen={setAddFeatureDialog} addFeature={setCustomFeatures} features={customFeatures} standardFeatures={standardFeatures}/>
        </div>
    );
};

export default CreatePlan;