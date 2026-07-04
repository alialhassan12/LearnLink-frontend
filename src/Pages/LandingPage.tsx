import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {Calendar, Lock, MessageCircle, Sparkles, Tag, Video} from 'lucide-react'
import useAuthStore from "../store/authStore";
import heroImg from "../assets/hero.webp";

const LandingPage = () => {
    const {authUser}=useAuthStore();
    const tools=[
        {
            id:1,
            title:'Live Sessions',
            icon:Video,
            description:'Host interactive, on-demand classes with real-time Q&A and cloud recording storage.'
        },
        {
            id:2,
            title:'Course MarketPlace',
            icon:Tag,
            description:'A curated world of knowledge. Sell your expertise or discover your next career breakthrough.'
        },
        {
            id:3,
            title:'AI Teaching Assistant',
            icon:Sparkles,
            description:'Automate grading, generate lesson plans, and provide 24/7 student support with our proprietary AI engine.'
        },
        {
            id:4,
            title:'Smart Booking',
            icon:Calendar,
            description:'Seamlessly sync with your Google or Outlook calendars for hassle-free session scheduling.'
        },
        {
            id:5,
            title:'Secure Payments',
            icon:Lock,
            description:'Global payment processing with instant payouts and automated tax documentation.'
        },
        {
            id:6,
            title:'Unified Messaging',
            icon:MessageCircle,
            description:'Keep student communications organized in one secure hub, separated from your personal life.'
        }
    ];
    const steps=[
        {
            id:1,
            title:'Sign Up',
            description:'Create your profile in minutes. Choose whether you\'re here to learn or to share your gift.'
        },
        {
            id:2,
            title:'Explore & Match',
            description:'Browse verified mentors, compare credentials, and find your perfect match.'
        },
        {
            id:3,
            title:'Grow Together',
            description:'Join live sessions, complete assignments, and track your progress with beautiful analytics.'
        }
    ];

    const navigate=useNavigate();

    const handleGetStarted=async()=>{
        if(!authUser) navigate('/auth/login');
        else if(authUser?.role==='admin') navigate("/admin/dashboard");
        else if(authUser?.role==='teacher') navigate('/dashboard');
        else if(authUser?.role==='student') navigate('/marketplace');
    }

    return (
        <div>
            <Header/>
            {/* hero section */}
            <div className="min-h-screen w-full flex flex-col md:flex-row justify-center md:justify-between px-6 sm:px-10 md:px-14 lg:px-20 items-center gap-10 md:gap-6 py-16 md:py-0" >
                {/* left */}
                <div data-aos="fade-right" className="flex flex-col gap-5 w-full md:w-[50%] text-center md:text-left items-center md:items-start">
                    <div className="flex flex-col  gap-6" >
                        <div className="text-3xl sm:text-4xl md:text-5xl font-bold">
                            <p className="text-text-strong ">Learn  Anything.</p>
                            <p className="text-primary ">Teach  Everything.</p>
                        </div>
                        <p className="text-text-weak w-full md:w-[80%] text-base md:text-lg">
                            Empower youre grouth with immersive live seassions,
                            expertly curated courses, and powerful AI-driven teaching
                            tools built for the modern scholar.
                        </p>
                        {/* buttons */}
                        <div className="flex flex-row gap-4 sm:gap-6">
                            <button onClick={handleGetStarted} className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer flex items-center justify-center gap-2">
                                Get Started
                            </button>
                            <button className="px-6 py-3 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>

                {/* right */}
                <div data-aos="fade-left" className="w-full md:w-[50%]">
                    <div className="rounded-3xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300 ease-in-out">
                        <img className="w-full rounded-3xl" src={heroImg} alt="Hero" />
                    </div>
                </div>

            </div>

            {/* Tools */}
            <div className="px-6 py-12 sm:px-10 sm:py-16 md:p-20 bg-bg-2">
                <div data-aos="fade-up">
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-text-strong text-2xl sm:text-3xl font-bold">Tools for Every Journey</p>
                        <p className="text-text-weak w-full sm:w-[70%] md:w-[50%] text-center mt-3">A comprehensive ecosystem designed to handle everything from scheduling to sophisticated AI-assisted learning</p>
                    </div>
                </div>

                {/* grid */}
                <div className="mt-10 md:mt-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tools.map((tool) => (
                            <div data-aos="fade-up" data-aos-delay={(tool.id - 1) * 100} key={tool.id} className="cursor-pointer">
                                <div className="flex flex-col gap-3 h-full bg-bg-1 rounded-lg p-5 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all duration-300 ease-in-out">
                                    <div className="flex flex-row items-center gap-2">
                                        <tool.icon className="text-primary" />
                                        <p className="text-text-strong text-lg font-bold">{tool.title}</p>
                                    </div>
                                    <p className="text-text-weak">{tool.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Path TO Mastery */}
            <div className="px-6 py-12 sm:px-10 sm:py-16 md:p-20">
                <div data-aos="fade-up">
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-text-strong text-2xl sm:text-3xl font-bold">Your Path To Mastery</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-10">
                        {steps.map((step)=>(
                            <div key={step.id} data-aos="fade-up" data-aos-delay={(step.id-1)*100}>
                                <div className="flex flex-col h-full justify-center gap-2 items-center relative">
                                    <div className="w-15 h-15 border-2 border-primary rounded-full flex justify-center items-center bg-bg-1 z-1">
                                        <p className="text-primary text-xl font-bold ">{step.id}</p>
                                    </div>
                                    <p className="text-text-strong text-xl sm:text-2xl mt-3">{step.title}</p>
                                    <p className="text-text-weak mt-3 w-full sm:w-[80%] text-center">{step.description}</p>
                                    <span className="hidden md:block w-full h-0.5 absolute top-[25%] -left-2 bg-gray-300/70"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default LandingPage;