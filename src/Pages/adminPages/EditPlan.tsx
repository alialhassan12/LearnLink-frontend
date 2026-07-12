import { useEffect, useState } from "react";
import { Bolt, CircleCheck, Eye, Info, Plus, Settings, Trash } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "../../components/ui/native-select";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import AddFeatureDialog, { type CustomFeature } from "../../components/adminDashboard/AddFeatureDialog";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { toast } from "sonner";
import { usePlanStore } from "../../store/adminDashboardStores/plansStore";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../components/ui/spinner";
import type { Plan } from "@/@types/plan";

const EditPlan = () => {
    const { planToEdit,setPlanToEdit, editPlan, isEdittingPlan } = usePlanStore();
    const navigate = useNavigate();

    // Check if planToEdit is missing and redirect
    useEffect(() => {
        if (!planToEdit) {
            navigate("/admin/dashboard/plans");
        }
    }, [planToEdit, navigate]);

    // Basic form state
    const [formData, setFormData] = useState({
        planName: planToEdit?.title || "",
        planDescription: planToEdit?.description || "",
        type: planToEdit?.type || "",
        price: planToEdit?.price !== undefined ? Number(planToEdit.price) : 0,
        duration: planToEdit?.duration_days !== undefined ? planToEdit.duration_days : null,
        is_free: planToEdit?.is_free || false,
        status: planToEdit?.status || "active"
    });

    // Helper for custom feature labels formatting
    const formatKeyToLabel = (key: string) => {
        return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Standard Features (relevant for teacher plans)
    const [standardFeatures, setStandardFeatures] = useState<{
        label: string;
        name: string;
        type: 'number' | 'boolean' | 'string';
        value: any;
        limitedcheck?: boolean;
    }[]>(() => {
        const features: any = planToEdit?.features || {};
        return [
            {
                label: "Max Courses",
                name: "max_courses",
                type: "number",
                value: features.max_courses !== undefined ? (features.max_courses === -1 ? 0 : Number(features.max_courses)) : 1,
                limitedcheck: features.max_courses === -1
            },
            {
                label: "Sessions per Month",
                name: "sessions_per_month",
                type: "number",
                value: features.sessions_per_month !== undefined ? (features.sessions_per_month === -1 ? 0 : Number(features.sessions_per_month)) : 5,
                limitedcheck: features.sessions_per_month === -1
            },
            {
                label: "AI Tokens per Month",
                name: "ai_tokens_per_month",
                type: "number",
                value: features.ai_tokens_per_month !== undefined ? (features.ai_tokens_per_month === -1 ? 0 : Number(features.ai_tokens_per_month)) : 10000,
                limitedcheck: features.ai_tokens_per_month === -1
            },
            {
                label: "Search Priority",
                name: "search_priority",
                type: "boolean",
                value: features.search_priority !== undefined ? !!features.search_priority : false
            }
        ];
    });

    // Custom features list:
    // Any features in planToEdit.features that are NOT standard keys (if it's a teacher plan), or ALL features (if it's a student plan).
    const [customFeatures, setCustomFeatures] = useState<CustomFeature[]>(() => {
        const features: any = planToEdit?.features || {};
        const isTeacher = planToEdit?.type === "teacher";
        const standardKeys = ["max_courses", "sessions_per_month", "ai_tokens_per_month", "search_priority"];
        const list: CustomFeature[] = [];

        Object.entries(features).forEach(([key, val]) => {
            if (isTeacher && standardKeys.includes(key)) {
                return;
            }

            let type: 'number' | 'boolean' | 'string' = 'string';
            if (typeof val === 'boolean') {
                type = 'boolean';
            } else if (typeof val === 'number') {
                type = 'number';
            }

            list.push({
                label: formatKeyToLabel(key),
                name: key,
                type,
                value: type === 'number' && val === -1 ? 0 : val,
                limitedcheck: type === 'number' && val === -1
            });
        });

        return list;
    });

    const [addFeatureDialog, setAddFeatureDialog] = useState<boolean>(false);

    const handleDeleteCustomFeature = (name: string) => {
        setCustomFeatures(prev => prev.filter(f => f.name !== name));
    };

    const handleSavePlan = async () => {
        if (!formData.planName.trim() || !formData.planDescription.trim() || !formData.type.trim()) {
            toast.error("Please fill all the fields");
            return;
        }

        if (!formData.is_free && (formData.duration === null || formData.duration <= 0)) {
            toast.error("Please enter a valid duration");
            return;
        }

        // Construct features object
        const featuresPayload: any = {};

        if (formData.type === "teacher") {
            // Include standard features
            standardFeatures.forEach((feat) => {
                featuresPayload[feat.name] = feat.limitedcheck 
                    ? -1 
                    : (feat.type === "number" ? Number(feat.value) : feat.value);
            });
        } else {
            // Student plan doesn't have standard features in the UI, but Laravel's backend validation strictly requires:
            // max_courses, sessions_per_month, ai_tokens_per_month, search_priority.
            // If they are present as custom features, use their custom values. Otherwise, use safe fallbacks.
            const standardFallbacks: any = {
                max_courses: 0,
                sessions_per_month: 0,
                ai_tokens_per_month: 0,
                search_priority: false
            };

            Object.entries(standardFallbacks).forEach(([name, defValue]) => {
                const customMatch = customFeatures.find(f => f.name === name);
                if (customMatch) {
                    featuresPayload[name] = customMatch.limitedcheck 
                        ? -1 
                        : (customMatch.type === "number" ? Number(customMatch.value) : customMatch.value);
                } else {
                    featuresPayload[name] = defValue;
                }
            });
        }

        // Add custom features (avoiding standard key duplication if already added)
        customFeatures.forEach((feat) => {
            if (featuresPayload[feat.name] !== undefined && formData.type !== "teacher") {
                // If it's student, and the feature matches one of the standard keys, it was already handled above.
                return;
            }
            featuresPayload[feat.name] = feat.limitedcheck 
                ? -1 
                : (feat.type === "number" ? Number(feat.value) : feat.value);
        });

        const updatedPlan: Plan = {
            id: planToEdit!.id,
            title: formData.planName,
            description: formData.planDescription,
            type: formData.type,
            features: featuresPayload,
            duration_days: formData.is_free ? -1 : (formData.duration || 0),
            price: formData.is_free ? 0 : formData.price,
            is_free: formData.is_free,
            status: formData.status
        };

        const success = await editPlan(updatedPlan);
        if (success) {
            navigate("/admin/dashboard/plans");
        }
    };

    if (!planToEdit) return null;

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div>
                <p className="text-text-strong text-3xl font-bold">Edit Plan</p>
                <p className="text-text-weak">Modify subscription tiers, features, and settings for the LearnLink ecosystem.</p>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Section */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Basic Plan Info */}
                    <div className="flex flex-col p-4 sm:p-6 bg-card border border-border rounded-lg">
                        <div className="flex flex-row items-center gap-2 mb-6">
                            <Info size={"22"} className="text-primary/70 font-bold"/>
                            <p className="text-text-strong text-2xl font-semibold">Basic plan info</p>
                        </div>
                        {/* Title */}
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
                        {/* Description */}
                        <div className="flex flex-col gap-2 mb-4">
                            <label className="uppercase text-text-weak text-sm">Plan Description</label>
                            <Textarea  
                                placeholder="Describe your plan"
                                className="min-h-20 text-text-strong" 
                                value={formData.planDescription}
                                onChange={(e)=>setFormData({...formData,planDescription:e.target.value})}
                            />
                        </div>
                        {/* Plan Type (Disabled during edit to ensure system integrity) */}
                        <div className="flex flex-col gap-2 mb-4">
                            <label className="uppercase text-text-weak text-sm">Plan Type</label>
                            <NativeSelect 
                                className="text-text-strong opacity-70 cursor-not-allowed"
                                value={formData.type}
                                disabled
                            >
                                <NativeSelectOption className="bg-card text-text-strong text-sm" value="teacher">Teacher</NativeSelectOption>
                                <NativeSelectOption className="bg-card text-text-strong text-sm" value="student">Student</NativeSelectOption>
                            </NativeSelect>
                            <span className="text-xs text-text-weak italic mt-1">Plan type cannot be changed once a plan is created.</span>
                        </div>
                    </div>

                    {/* Plan Features */}
                    <div className="flex flex-col p-4 sm:p-6 bg-card border border-border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex flex-row items-center gap-2">
                                <Bolt size={"22"} className="text-primary/70 font-bold"/>
                                <p className="text-text-strong text-2xl font-semibold">Plan Features</p>
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

                        {/* Standard Features (Only for Teacher plans) */}
                        {formData.type === "teacher" && (
                            <div className="flex flex-col gap-4 mb-6">
                                <span className="font-semibold text-text-strong border-b border-border pb-2">Standard Features</span>
                                {standardFeatures.map((feature, index) => (
                                    <div key={index} className="flex flex-col bg-bg-1/60 border border-border p-4 rounded-md">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <span className="font-medium text-text-strong">{feature.label}</span>
                                            {feature.type === "number" && (
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
                                                            {feature.limitedcheck ? "unlimited" : "limited"}
                                                        </label>
                                                        <Switch
                                                            checked={feature.limitedcheck}
                                                            onCheckedChange={(checked)=>setStandardFeatures(prev=>prev.map(f=>f.name===feature.name?{...f,limitedcheck:checked,value:checked?-1:0}:f))}
                                                            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-zinc-500/40 cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {feature.type === "boolean" && (
                                                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                                    <label className="text-text-weak text-sm">{feature.value ? "Enabled" : "Disabled"}</label>
                                                    <Switch 
                                                        checked={feature.value}
                                                        onCheckedChange={(checked)=>setStandardFeatures(prev=>prev.map(f=>f.name===feature.name?{...f,value:checked}:f))}
                                                        className="cursor-pointer"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Custom Features */}
                        <div className="flex flex-col gap-4">
                            <span className="font-semibold text-text-strong border-b border-border pb-2">Custom Features</span>
                            {customFeatures.length === 0 ? (
                                <p className="text-sm text-text-weak italic">No custom features added yet.</p>
                            ) : (
                                customFeatures.map((feature, index) => (
                                    <div key={index} className="flex flex-col bg-bg-1/60 border border-border p-4 rounded-md">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <span className="font-medium text-text-strong">{feature.label}</span>
                                            {feature.type === "number" && (
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
                                                            {feature.limitedcheck ? "unlimited" : "limited"}
                                                        </label>
                                                        <Switch
                                                            checked={feature.limitedcheck}
                                                            onCheckedChange={(checked)=>setCustomFeatures(prev=>prev.map(f=>f.name===feature.name?{...f,limitedcheck:checked,value:checked?-1:0}:f))}
                                                            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-zinc-500/40 cursor-pointer"
                                                        />
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                                                            onClick={() => handleDeleteCustomFeature(feature.name)}
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            {feature.type === "string" && (
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
                                                        className="hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                                                        onClick={() => handleDeleteCustomFeature(feature.name)}
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            {feature.type === "boolean" && (
                                                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                                    <label className="text-text-weak text-sm">{feature.value ? "Enabled" : "Disabled"}</label>
                                                    <Switch 
                                                        checked={feature.value}
                                                        onCheckedChange={(checked)=>setCustomFeatures(prev=>prev.map(f=>f.name===feature.name?{...f,value:checked}:f))}
                                                        className="cursor-pointer"
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                                                        onClick={() => handleDeleteCustomFeature(feature.name)}
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Subscription Settings */}
                    <div className="flex flex-col p-4 sm:p-6 bg-card border border-border rounded-lg">
                        <div className="flex flex-row items-center gap-2 mb-6">
                            <Settings size={"22"} className="text-primary/70 font-bold"/>
                            <p className="text-text-strong text-2xl font-semibold">Subscription Settings</p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
                            {/* Duration */}
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                                <label className="uppercase text-text-weak text-sm">Duration (in days)</label>
                                <Input 
                                    type="number" 
                                    placeholder="Enter duration in days" 
                                    className="h-10 text-text-strong w-full sm:w-52" 
                                    min={1} 
                                    value={formData.is_free ? "" : (formData.duration || "")}
                                    disabled={formData.is_free}
                                    onChange={(e)=>setFormData({...formData,duration:e.target.value ? Number(e.target.value) : null})}
                                />
                            </div>
                            {/* Price */}
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                                <label className="uppercase text-text-weak text-sm">Price (in USD)</label>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="number" 
                                        placeholder="Enter price in USD" 
                                        className="h-10 text-text-strong w-full sm:w-52" 
                                        min={0} 
                                        disabled={formData.is_free}
                                        value={formData.is_free ? 0 : formData.price}
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
                            {/* Status */}
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

                {/* Right Section (Preview) */}
                <div className="lg:col-span-1">
                    <div className="flex flex-col gap-4 lg:sticky lg:top-24 h-fit">
                        {/* Plan Preview */}
                        <div className="flex flex-col py-6 px-6 sm:px-10 gap-4 border border-border rounded-lg bg-gradient-to-bl from-primary/30 via-bg-card/10 to-bg-card hover:bg-gradient-to-bl hover:from-primary/50 hover:via-bg-card/10 hover:to-bg-card transition-all duration-800">
                            <Badge variant={(formData.type === "teacher" || formData.type === "student") ? "default" : "outline"}>
                                {formData.type ? formData.type.charAt(0).toUpperCase() + formData.type.slice(1) : "Unknown"} Plan
                            </Badge>
                            <div className="flex flex-col items-start justify-center">
                                <p className="text-text-strong text-2xl font-semibold">{formData.planName || "Plan Title"}</p>
                                <p className="text-sm text-text-weak">{formData.planDescription || "No description provided yet."}</p>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <p className="text-3xl font-bold text-text-strong">${formData.is_free ? 0 : formData.price}</p>
                                {!formData.is_free && formData.duration !== null ? (
                                    <span className="text-sm text-text-weak">/ {formData.duration} days</span>
                                ) : (
                                    <span className="text-sm text-text-weak">Lifetime</span>
                                )}
                            </div>
                            <Separator/>
                            
                            {/* Features Preview */}
                            <div className="flex flex-col gap-2">
                                {/* Standard Features for Teacher */}
                                {formData.type === "teacher" && (
                                    standardFeatures.map((feature, index) => {
                                        const displayValue = feature.limitedcheck 
                                            ? "Unlimited" 
                                            : (feature.type === "boolean" ? (feature.value ? "Yes" : "No") : String(feature.value));
                                        return (
                                            <div key={index} className="flex items-center gap-2">
                                                <CircleCheck className="w-4 h-4 shrink-0 text-primary"/>
                                                <span className="text-sm text-text-strong">
                                                    {feature.label}: <span className="font-semibold">{displayValue}</span>
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                                {/* Custom Features */}
                                {customFeatures.map((feature, index) => {
                                    const displayValue = feature.limitedcheck 
                                        ? "Unlimited" 
                                        : (feature.type === "boolean" ? (feature.value ? "Yes" : "No") : String(feature.value));
                                    return (
                                        <div key={index} className="flex items-center gap-2">
                                            <CircleCheck className="w-4 h-4 shrink-0 text-primary"/>
                                            <span className="text-sm text-text-strong">
                                                {feature.label}: <span className="font-semibold">{displayValue}</span>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <Button className="w-full" disabled>
                                Subscribe now (Preview)
                            </Button>
                        </div>
                        <div className="flex items-center justify-center gap-2 p-4 bg-card border border-border rounded-lg text-text-weak">
                            <Eye size={"20"}/>
                            <p className="font-semibold">Live Preview updates as you edit</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 left-0 right-0 flex items-center justify-end gap-2 p-4 bg-bg-1/80 backdrop-blur-md border-t border-border z-50">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="cursor-pointer h-10 hover:bg-card hover:border-primary hover:text-primary"
                    disabled={isEdittingPlan}
                    onClick={() =>{
                        setPlanToEdit(null);
                        navigate("/admin/dashboard/plans")
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    variant="default" 
                    size="sm" 
                    className="cursor-pointer h-10 hover:bg-primary/80"
                    onClick={handleSavePlan}
                    disabled={isEdittingPlan}
                >
                    {isEdittingPlan ? (
                        <div className="flex items-center gap-2">
                            <Spinner/>
                            <p>Saving Plan...</p>
                        </div>
                    ) : (
                        <p>Save Changes</p>
                    )}
                </Button>
            </div>
            <AddFeatureDialog 
                open={addFeatureDialog} 
                setOpen={setAddFeatureDialog} 
                addFeature={setCustomFeatures} 
                features={customFeatures} 
                standardFeatures={formData.type === "teacher" ? (standardFeatures as any) : []}
            />
        </div>
    );
};

export default EditPlan;