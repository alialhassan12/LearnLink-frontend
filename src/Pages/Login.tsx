import { Eye, EyeClosed, GraduationCap } from "lucide-react";
import { Input } from "../components/ui/input";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "../components/ui/field";
import { Link } from "react-router-dom";
import { useState } from "react";
import Footer from "../components/Footer";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Spinner } from "../components/ui/spinner";
import { Button } from "../components/ui/button";
import { useCourseEnrollmentStore } from "../store/studentmarketplaceStores/courseEnrollmentStore";
import { useChatStore } from "../store/chatStore";

const Login = () => {
    const {login,isloggingIn,authUser}=useAuthStore();
    const {getEnrolledCoursesIds}=useCourseEnrollmentStore();
    const {getConversations}=useChatStore();

    const navigate=useNavigate();
    const [formData, setFormData] = useState<{
        email: string;
        password: string;
    }>({
        email: '',
        password: ''
    });
    const [error, setError] = useState<string>('');
    const [hasError, setHasError] = useState<boolean>(false);
    const [showPassword,setShowPassword]=useState<boolean>(false);
    
    // handlers
    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        });
    }
    const handleSubmit=async (e:any)=>{
        e.preventDefault();

        if(formData.email.trim()=== '' || formData.password.trim()=== '')
        {
            setError('Please fill all the fields');
            setHasError(true);
            return;
        }
        if(!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        {
            setError('Please enter a valid email');
            setHasError(true);
            return;
        }
        if(formData.password.length <8){
            setError('Password must be at least 8 characters long');
            setHasError(true);
            return;
        }
        setHasError(false);
        setError('');

        // send request to backend
        const success = await login(formData);
        if(success){
            getConversations();
            if(authUser?.role==='admin') navigate("/admin/dashboard");
            if(authUser?.role==='teacher') navigate('/dashboard');
            if(authUser?.role==='student'){ 
                // fetch enrolled courses ids before navigating
                getEnrolledCoursesIds();
                navigate('/marketplace')
            };
        }
    }

    return (
        <>
            <Header/>
            <div className="flex flex-col justify-center items-center min-h-screen bg-bg-2 px-4 sm:px-6 py-10">
                <div className="" data-aos="zoom-in">
                    {/* title */}
                    <div className="flex flex-row justify-center items-center gap-3 text-primary text-2xl font-bold mb-10">
                        <GraduationCap size={40}/>
                        <p>LearnLink</p>
                    </div>
                    {/* form */}
                    <form onSubmit={handleSubmit} className="bg-bg-1 border border-gray-400/30 flex flex-col justify-center items-center shadow-2xl shadow-primary/30 rounded-lg p-6 sm:p-10 w-full max-w-md">
                        <div className="flex flex-col items-center gap-2 mb-10">
                            <p className="text-text-strong font-bold text-2xl">Welcome Back</p>
                            <p className="text-text-weak text-sm">Access your teaching and learning dashboard.</p>
                        </div>
                        <div className="w-full">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Email Address</FieldLabel>
                                    <Input type="email" onChange={handleChange} disabled={isloggingIn} name="email" placeholder="example@email.com" className="py-5" aria-invalid={hasError}></Input>
                                </Field>
                                <Field>
                                    <FieldLabel>Password</FieldLabel>
                                    <div className="relative">
                                        <Input 
                                            type={showPassword ? "text" : "password"} 
                                            onChange={handleChange} 
                                            disabled={isloggingIn} 
                                            name="password" 
                                            placeholder="••••••••" 
                                            className="py-5 pr-10" 
                                            aria-invalid={hasError} 
                                        />
                                        <button
                                            type="button"
                                            onClick={()=>setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary transition-colors"
                                            disabled={isloggingIn}
                                        >
                                            {showPassword ? <EyeClosed size={20}/> : <Eye size={20}/>}
                                        </button>
                                    </div>
                                    <FieldDescription className="text-xs">
                                        <Link to="/auth/forget-password" className="text-primary">Forget your password?</Link>
                                    </FieldDescription>
                                </Field>
                                <Field>
                                    {error && (
                                        <FieldDescription className="text-xs text-red-500">
                                            {error}
                                        </FieldDescription>
                                    )}
                                </Field>
                                {/* button to submit form */}
                                <Button
                                    disabled={isloggingIn}
                                    type="submit"
                                    className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/80 cursor-pointer">
                                    {isloggingIn
                                        ? <><Spinner data-icon="inline-start" /> Logging In</>
                                        : 'Login'
                                    }
                                </Button>
                            </FieldGroup>
                            <div className="w-full mt-5">
                                <div className="flex flex-row items-center gap-2 w-full">
                                    <div className="w-full border-gray-400/30 border"></div>
                                    <p className="text-text-weak text-sm">or</p>
                                    <div className="w-full border-gray-400/30 border"></div>
                                </div>
                            </div>
                            <div className="flex gap-1 text-sm text-text-weak justify-center items-center mt-2">
                                Don't have an account? 
                                <Link to="/auth/register" className="text-primary hover:underline">Register</Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default Login;