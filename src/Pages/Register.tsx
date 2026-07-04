import { BookOpen, ChartArea, Eye, EyeClosed, GraduationCap } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Input } from "../components/ui/input";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldTitle,
} from "../components/ui/field";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuthStore from "../store/authStore";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";

const Register = () => {

    const {register,isRegistering,authUser}=useAuthStore();
    const navigate=useNavigate();
    const [showPassword,setShowPassword]=useState<boolean>(false);
    const [showPasswordConfirmation,setShowPasswordConfirmation]=useState<boolean>(false);

    const [formData,setFormData]=useState<{
        name:string;
        email:string;
        password:string;
        password_confirmation:string;
        role:string;
    }>({
        name:'',
        email:'',
        password:'',
        password_confirmation:'',
        role:'student'
    });

    const[error,setError]=useState<{
        name?:string;
        email?:string;
        password?:string;
        password_confirmation?:string;
        role?:string;
    }>({
        name:'',
        email:'',
        password:'',
        password_confirmation:'',
        role:''
    });
    const [hasError,setHasError]=useState<{
        name?:boolean;
        email?:boolean;
        password?:boolean;
        password_confirmation?:boolean;
    }>({
        name:false,
        email:false,
        password:false,
        password_confirmation:false,
    });

    // handlers
    const handleInputChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        })
    }
    const handleRoleChange=(e:string)=>{
        setFormData({
            ...formData,
            role:e
        })
    }
    const handleSubmit=async (e:any)=>{
        e.preventDefault();

        if(formData.email.trim()=== '' || formData.password.trim()=== '' || formData.name.trim()=== '' || formData.password_confirmation.trim()=== '')
        {
            setError({
                name:formData.name.trim()=== '' ? 'Required field' : '',
                email:formData.email.trim()=== '' ? 'Required field' : '',
                password:formData.password.trim()=== '' ? 'Required field' : '',
                password_confirmation:formData.password_confirmation.trim()=== '' ? 'Required field' : ''
            });
            setHasError({
                name:formData.name.trim()=== '' ? true : false,
                email:formData.email.trim()=== '' ? true : false,
                password:formData.password.trim()=== '' ? true : false,
                password_confirmation:formData.password_confirmation.trim()=== '' ? true : false
            });
            return;
        }
        if(!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        {
            setError({email:'Please enter a valid email'});
            setHasError({name:false,email:true,password:false,password_confirmation:false});
            return;
        }
        if(formData.password.length <8){
            setError({password:'Password must be at least 8 characters long'});
            setHasError({name:false,email:false,password:true,password_confirmation:false});
            return;
        }
        if(formData.password !== formData.password_confirmation){
            setError({
                password_confirmation:'Passwords do not match',
                password:'Passwords do not match'
            });
            setHasError({
                name:false,
                email:false,
                password:true,
                password_confirmation:true
            });
            return;
        }
        
        setError({name:'',email:'',password:'',password_confirmation:''});
        setHasError({name:false,email:false,password:false,password_confirmation:false});

        // send request to backend
        const success = await register(formData);
        if(success){
            if(authUser?.role==='teacher') navigate('/dashboard');
            if(authUser?.role==='student') navigate('/marketplace');
        }
    }

    return (
        <>
            <Header/>

            <div className="flex flex-col lg:flex-row bg-bg-2 min-h-screen">
                {/* left */}
                <div className="hidden lg:flex w-full lg:w-[50%] flex-col gap-4 justify-center items-start p-10 lg:p-20 bg-primary text-white" data-aos="fade-right">
                    <div className="flex flex-row gap-2 text-2xl justify-center items-center mb-3">
                        <GraduationCap size={40}/>
                        LearnLink
                    </div>
                    <p className="text-white text-3xl font-bold">
                        Empowering the next generation of scholars.
                    </p>
                    <p className="text-text-weak text-md">
                        Join a community of educators and students dedicated to deep focus and academic excellence.
                    </p>
                    <div className="flex flex-row justify-center items-center gap-4 mt-8">
                        <div className="bg-text-strong/20 rounded-lg h-full p-6 border border-primary/10 w-1/2 flex flex-col justify-start items-start ">
                            <BookOpen size={25} className="mb-2"/>
                            <p className="text-lg font-bold">Curriculum Design</p>
                            <p className="text-text-weak text-sm">
                                Advanced tools for structured learning.
                            </p>
                        </div>
                        <div className="bg-text-strong/20 rounded-lg h-full p-6 border border-primary/10 w-1/2 flex flex-col justify-start items-start ">
                            <ChartArea size={25} className="mb-2"/>
                            <p className="text-lg font-bold">Growth Analytics</p>
                            <p className="text-text-weak text-sm">
                                Real-time tracking of student progress.
                            </p>
                        </div>
                    </div>
                </div>

                {/* right */}
                <div className="w-full lg:w-[50%] h-full flex flex-col justify-center items-start px-6 sm:px-10 lg:pl-10 lg:pr-20 py-10 lg:py-16" data-aos="fade-left">
                    {/* title */}
                    <div className="flex flex-col gap-2">
                        <p className="text-text-strong text-xl sm:text-2xl font-bold">Create Account</p>
                        <p className="text-text-weak text-md">Get started with your LearnLink journey today</p>
                    </div>
                    {/* form */}
                    <form onSubmit={handleSubmit} className="w-full mt-6 sm:mt-10">
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Full Name</FieldLabel>
                                <Input 
                                    type="text" 
                                    name="name" 
                                    placeholder="Enter your full name" 
                                    className="py-5" 
                                    value={formData.name}
                                    disabled={isRegistering}
                                    onChange={handleInputChange}
                                    aria-invalid={hasError.name}
                                />
                                {
                                    hasError.name && (
                                        <FieldDescription className="text-xs text-red-500">
                                            {error.name}
                                        </FieldDescription>
                                    )
                                }
                            </Field>
                            <Field>
                                <FieldLabel>Email Address</FieldLabel>
                                <Input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Enter your email" 
                                    className="py-5" 
                                    value={formData.email}
                                    disabled={isRegistering}
                                    onChange={handleInputChange}
                                    aria-invalid={hasError.email}
                                />
                                {
                                    hasError.email && (
                                        <FieldDescription className="text-xs text-red-500">
                                            {error.email}
                                        </FieldDescription>
                                    )
                                }
                            </Field>
                            <Field>
                                <FieldLabel>Password</FieldLabel>
                                <div className="relative">
                                    <Input 
                                        type={showPassword ? "text" : "password"}
                                        name="password" 
                                        placeholder="••••••••" 
                                        className="py-5 pr-10" 
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        disabled={isRegistering}
                                        aria-invalid={hasError.password}
                                    />
                                    <button
                                        type="button"
                                        onClick={()=>setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary transition-colors"
                                        disabled={isRegistering}
                                    >
                                        {showPassword ? <EyeClosed size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>

                                {
                                    hasError.password && (
                                        <FieldDescription className="text-xs text-red-500">
                                            {error.password}
                                        </FieldDescription>
                                    )
                                }
                            </Field>
                            <Field>
                                <FieldLabel>Confirm Password</FieldLabel>
                                <div className="relative">
                                    <Input 
                                        type={showPasswordConfirmation ? "text" : "password"}
                                        name="password_confirmation" 
                                        placeholder="••••••••" 
                                        className="py-5 pr-10" 
                                        disabled={isRegistering}
                                        value={formData.password_confirmation}
                                        onChange={handleInputChange}
                                        aria-invalid={hasError.password_confirmation}
                                    />
                                    <button
                                        type="button"
                                        onClick={()=>setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary transition-colors"
                                        disabled={isRegistering}
                                    >
                                        {showPasswordConfirmation ? <EyeClosed size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>
                                {
                                    hasError.password_confirmation && (
                                        <FieldDescription className="text-xs text-red-500">
                                            {error.password_confirmation}
                                        </FieldDescription>
                                    )
                                }
                            </Field>
                            <Field>
                                <FieldLabel>I'm a...</FieldLabel>
                                <RadioGroup disabled={isRegistering} defaultValue={formData.role} className=" flex flex-row gap-2 " onValueChange={handleRoleChange}>
                                    <FieldLabel >
                                        <Field orientation="horizontal">
                                        <FieldContent>
                                            <FieldTitle>Student</FieldTitle>
                                        </FieldContent>
                                        <RadioGroupItem value="student" />
                                        </Field>
                                    </FieldLabel>
                                    <FieldLabel >
                                        <Field orientation="horizontal">
                                        <FieldContent>
                                            <FieldTitle>Teacher</FieldTitle>
                                        </FieldContent>
                                        <RadioGroupItem value="teacher" />
                                        </Field>
                                    </FieldLabel>
                                </RadioGroup>
                            </Field>
                        </FieldGroup>
                        {/* create account button */}
                        <Button
                            disabled={isRegistering}
                            type="submit"
                            className="w-full py-3 mb-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/80 cursor-pointer mt-4">
                            {isRegistering
                                ? <><Spinner data-icon="inline-start" /> Creating Account</>
                                : 'Create Account'
                            }
                        </Button>
                        {/* already have an account */}
                        <p className="text-center text-text-weak text-sm">
                            Already have an account? <Link to="/auth/login" className="text-primary hover:underline">Login</Link>
                        </p>
                    </form>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default Register;