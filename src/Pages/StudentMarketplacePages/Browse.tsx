import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import browseHeroImg from '../../assets/browseHero.png';

const Browse =()=>{
    const navigator=useNavigate();

    return (
        <div className="px-5 sm:px-10 lg:px-20 py-6 sm:py-10">
            {/* landing */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-0">
                {/* left */}
                <div data-aos="fade-right" className="flex flex-col gap-5 w-full lg:w-[50%] text-center lg:text-left order-2 lg:order-1">
                    <div className="flex flex-col gap-2">
                        {/* text */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-strong">Find the Perfect Teacher for Your Learning Journey</h1>
                        <p className="text-text-weak text-sm sm:text-md">Book live sessions, join courses, and learn from expert instructors worldwide. Personalized education tailored to your goals.</p>
                        {/* buttons */}
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-5 pt-5">
                            <Button 
                                onClick={()=>navigator("/marketplace/browse/teachers")}
                                className="h-10 w-full sm:w-auto cursor-pointer font-medium hover:bg-primary/80 hover:scale-105 transition-all duration-300 ease-in-out">Find Teachers
                            </Button>
                            <Button 
                                onClick={()=>navigator("/marketplace/browse/courses")}
                                className="h-10 w-full sm:w-auto cursor-pointer font-medium hover:scale-105 transition-all duration-300 ease-in-out" variant={'outline'} >Browse Courses
                            </Button>
                        </div>
                    </div>
                </div>
                {/* right */}
                <div data-aos="fade-left" className="w-full sm:w-[70%] lg:w-[50%] flex justify-center order-1 lg:order-2">
                    <div className="rounded-3xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/40 rotate-0 lg:rotate-5 hover:rotate-0 transition-all duration-300 ease-in-out">
                        <img className="w-full rounded-3xl" src={browseHeroImg} alt="Hero" />
                    </div>
                </div>
            </div>

            
        </div>
    );
};

export default Browse;
