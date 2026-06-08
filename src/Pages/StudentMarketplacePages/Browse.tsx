import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

const Browse =()=>{
    const navigator=useNavigate();

    return (
        <div className="px-20 py-10">
            {/* landing */}
            <div className="flex flex-row justify-between items-center flex-wrap">
                {/* left */}
                <div data-aos="fade-right" className="flex flex-col gap-5 w-[50%]">
                    <div className="flex flex-col gap-2">
                        {/* text */}
                        <h1 className="text-4xl font-bold text-text-strong">Find the Perfect Teacher for Your Learning Journey</h1>
                        <p className="text-text-weak text-md">Book live sessions, join courses, and learn from expert instructors worldwide. Personalized education tailored to your goals.</p>
                        {/* buttons */}
                        <div className="flex flex-row gap-5 pt-5">
                            <Button 
                                onClick={()=>navigator("/marketplace/browse/teachers")}
                                className="h-10 cursor-pointer font-medium hover:bg-primary/80 hover:scale-105 transition-all duration-300 ease-in-out">Find Teachers
                            </Button>
                            <Button 
                                onClick={()=>navigator("/marketplace/browse/courses")}
                                className="h-10 cursor-pointer font-medium hover:scale-105 transition-all duration-300 ease-in-out" variant={'outline'} >Browse Courses
                            </Button>
                        </div>
                    </div>
                </div>
                {/* right */}
                <div data-aos="fade-left" className="w-[50%] flex justify-center">
                    <div className="rounded-3xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/40 rotate-5 hover:rotate-0 transition-all duration-300 ease-in-out">
                        <img className="w-full rounded-3xl" src="/src/assets/browsehero.png" alt="Hero" />
                    </div>
                </div>
            </div>

            
        </div>
    );
};

export default Browse;
