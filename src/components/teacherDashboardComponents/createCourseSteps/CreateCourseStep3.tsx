import { Banknote, DollarSign, Eye, Upload, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Field, FieldLabel } from "../../ui/field";
import { Input } from "../../ui/input";
import useCreateCourseStore from "../../../store/createCourseStore";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import useAuthStore from "../../../store/authStore";
import { Button } from "../../ui/button";
import { useState } from "react";
import { useCourseStore } from "../../../store/courseStore";
import { useNavigate } from "react-router-dom";


const CreateCourseStep3=()=>{
    const {courseData,setCourseData,imagePreview,courseSections,clearCourseAndSectionData}=useCreateCourseStore();
    const {publishCourse,isPublishing}=useCourseStore();
    const {authUser}=useAuthStore();
    const [pricePreview,setPricePreview]=useState<number>(0);
    const navigate=useNavigate();

    const handlePriceInputChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const value=Number(e.target.value);
        setPricePreview(value);
        setCourseData({
            ...courseData,
            price:value
        });
    };
    const handlePublishCourse=async ()=>{
        const data={
            "category_id":Number(courseData.category_id),
            "title":courseData.title,
            "description":courseData.description,
            "thumbnail":courseData.thumbnail,
            "language":courseData.language,
            "price":Number(courseData.price),
            "sections":courseSections.map(section=>{
                return({
                    "title":section.title,
                    "order":Number(section.order),
                    "materials":section.files.map(file=>{
                        return({
                            "file":file.file,
                            "type":file.type,
                            "size":file.size,
                            "title":file.title
                        });
                    })
                });
            })
        };

        const isPublished=await publishCourse(data);
        if(isPublished){
            clearCourseAndSectionData();
            // navigate to published successful page
            navigate('/dashboard/my-courses/published-successful');
        }
    };

    return(
        <div className="flex flex-row gap-2 flex-wrap my-2">
            <Card className="w-[60%] h-fit px-2">
                <CardHeader className="">
                    <Banknote className="text-primary text-xl"/>
                    <CardTitle className="text-text-strong text-xl font-semibold">
                        Course Fee
                    </CardTitle>
                    <CardDescription className="text-text-weak text-sm">
                        Set the price for your course
                    </CardDescription>
                </CardHeader>
                <CardContent  className="flex flex-row flex-wrap gap-3">
                    <Field className="w-[40%]">
                        <FieldLabel className="text-text-strong text-lg font-semibold">
                            Base Price
                        </FieldLabel>
                        <Input 
                            type="number" 
                            placeholder="10.000" 
                            value={courseData.price}
                            onChange={handlePriceInputChange}
                        />
                    </Field>
                    <Field className="w-[25%]">
                        <FieldLabel className="text-text-strong text-lg font-semibold">
                            Currency
                        </FieldLabel>
                        <Input disabled value={"USD"} className="text-text-strong"/>
                    </Field>
                </CardContent>
                {/* publish button */}
                <Button disabled={isPublishing} onClick={handlePublishCourse} className="w-full cursor-pointer hover:bg-primary/80 h-10">
                    {isPublishing ? <Loader2 className="animate-spin" /> : <Upload/>} {isPublishing ? 'Publishing...' : 'Publish Course Now'}
                </Button>
            </Card>
            <Card className="w-[37%]">
                <CardHeader className="flex flex-row gap-2 justify-start items-center">
                    <Eye className="text-primary text-xl"/>
                    <CardTitle className="text-text-strong text-xl font-semibold">
                        MarketPlace Preview
                    </CardTitle>
                </CardHeader>
                <CardContent  className="flex flex-col gap-3">
                    <div className="flex flex-col bg-bg-1 rounded-md overflow-hidden">
                        {/* img */}
                        <div className="flex flex-col gap-2">
                            <img src={imagePreview} className="w-full object-cover object-center "/>
                        </div>
                        {/* content */}
                        <div className="flex flex-col p-3">
                            {/* title */}
                            <p className="text-text-strong font-semibold ">{courseData.title}</p>
                            
                            <div className="flex flex-row gap-2 items-center mt-3">
                                <Avatar>
                                    <AvatarFallback>
                                        {authUser?.name[0].toUpperCase()}
                                    </AvatarFallback>
                                    <AvatarImage src={authUser?.avatar_url} className="w-full object-cover object-center "/>
                                </Avatar>
                                <div className="flex flex-row justify-between items-center w-full">
                                    <p className="text-text-strong font-semibold ">
                                        {authUser?.name}
                                    </p>
                                    <p className="text-primary text-2xl font-bold flex items-center gap-1">
                                        <DollarSign/>{pricePreview}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateCourseStep3;