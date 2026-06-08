import { Plus } from "lucide-react";
import { 
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle 
} from "../ui/alert-dialog";
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";
import { toast } from "sonner";
import { Button } from "../ui/button";

export interface CustomFeature {
    label: string;
    name: string;
    type: 'number' | 'boolean' | 'string';
    value: any;
    limitedcheck?: boolean;
}

const AddFeatureDialog=({open,setOpen,addFeature,features,standardFeatures}:{open:boolean,setOpen:(open:boolean)=>void,addFeature:React.Dispatch<React.SetStateAction<CustomFeature[]>>,features:CustomFeature[],standardFeatures:CustomFeature[]})=>{
    const [feature,setFeature]=useState<{
        type:"number" | "boolean" | "string",
        label:string
    }>({
        type:"number",
        label:""
    });
    
    const handleAddFeature=()=>{
        if(!feature.label || !feature.type){
            toast.error("Please fill all the fields");
            return;
        }
        const featureName=feature.label.toLowerCase().split(' ').join('_');
        if(standardFeatures.some((f)=>f.name === featureName) || features.some((f)=>f.name===featureName)){
            toast.error("Feature already exists");
            return;
        }

        let defaultValue: any = "";
        let limitedcheck: boolean | undefined = undefined;

        if (feature.type === "number") {
            defaultValue = 0;
            limitedcheck = false;
        } else if (feature.type === "boolean") {
            defaultValue = false;
        }

        const newFeature: CustomFeature = {
            label: feature.label,
            name: featureName,
            type: feature.type,
            value: defaultValue,
            limitedcheck
        };

        addFeature([...features, newFeature]);
        setOpen(false);
        setFeature({
            type:"number",
            label:""
        });
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Add Feature</AlertDialogTitle>
                    <AlertDialogDescription>
                        Add a new feature to the plan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="label">Feature Label</Label>
                        <Input id="label" value={feature.label} onChange={(e)=>setFeature({...feature,label:e.target.value})}/>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Feature Value Type</Label>
                        <NativeSelect className="w-full" value={feature.type} onChange={(e)=>setFeature({...feature,type:e.target.value as "number" | "boolean" | "string"})}>
                            <NativeSelectOption disabled value={""} className="bg-card text-text-strong text-sm">Select Feature Type</NativeSelectOption>
                            <NativeSelectOption value="number">Number</NativeSelectOption>
                            <NativeSelectOption value="string">Text</NativeSelectOption>
                            <NativeSelectOption value="boolean">Yes/No</NativeSelectOption>
                        </NativeSelect>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline" size="sm" className="cursor-pointer">Cancel</AlertDialogCancel>
                    <Button 
                        variant="default" 
                        size="sm" 
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={handleAddFeature}
                    >
                        <Plus size={"20"}/>Add
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
export default AddFeatureDialog;