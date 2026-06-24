import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './Pages/LandingPage'
import Aos from "aos"
import "aos/dist/aos.css"
import Login from './Pages/Login';
import useAuthStore from './store/authStore';
import { useEffect } from 'react';
import StudentMarketPlace from './Pages/StudentMarketPlace';
import TeacherDashboard from './Pages/TeacherDashboard';
import Register from './Pages/Register';
import { Toaster } from "./components/ui/sonner";
import { useLiveSessionStore } from './store/liveSessionsStore';
import SessionRoom from './Pages/SessionRoom';
import { useCourseEnrollmentStore } from './store/studentmarketplaceStores/courseEnrollmentStore';
import AdminDashboard from './Pages/AdminDashboard';
import { useChatStore } from './store/chatStore';

// Wrapper for routes that require the user to be logged in
const ProtectedRoute = ({ children,allowedRoles }: { children: React.ReactNode,allowedRoles:string[] }) => {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
      </div>
    );
  }
  if (!authUser) {
    return <Navigate to="/auth/login" />;
  }
  // check if the user has access to the route
  if(allowedRoles && !allowedRoles.includes(authUser.role)){
    return <Navigate to="/"/>
  }
  return <>{children}</>;
};

// Wrapper for routes that logged-in users shouldn't see (like Login page)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { authUser, isCheckingAuth } = useAuthStore();
  if (isCheckingAuth) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
      </div>
    );
  }
  if (authUser) {
    if(authUser.role==='admin') return <Navigate to="/admin/dashboard"/>;
    if(authUser.role==='teacher') return <Navigate to="/dashboard"/>;
    if(authUser.role==='student') return <Navigate to="/marketplace"/>;
  }
  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();
  const {token,url,session_id}=useLiveSessionStore();
  const {getEnrolledCoursesIds}=useCourseEnrollmentStore();
  const {getConversations}=useChatStore();

  const initialize = async () => {
    const loggedIn = await checkAuth();
    // If user is logged in and is a student, fetch enrolled courses ids
    if (loggedIn && useAuthStore.getState().authUser?.role === 'student'){
      await getEnrolledCoursesIds();
    }
    // If user is logged in, fetch conversations
    if(loggedIn){
      await getConversations();
    }
  };
  
  useEffect(() => {
    Aos.init({
      duration: 1000
    });
    initialize();
  }, []);

  return (
    <>
      
      <Routes>
        {/* Public Route - Loads instantly without waiting for auth check */}
        <Route path='/' element={<LandingPage/>}></Route>
        
        {/* Guest Route - Redirects to dashboard if already logged in */}
        <Route path='/auth/login' element={
          <GuestRoute>
            <Login/>
          </GuestRoute>
        }></Route>
        <Route path='/auth/register' element={
          <GuestRoute>
            <Register/>
          </GuestRoute>
        }></Route>

        {/* Protected Route - Requires login */}
        <Route path='/admin/dashboard/*' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard/>
          </ProtectedRoute>
        }></Route>

        <Route path='/dashboard/*' element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard/>
          </ProtectedRoute>
        }></Route>

        <Route path='/marketplace/*' element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentMarketPlace />
          </ProtectedRoute>
        }></Route>

        <Route path='/room/:roomName' element={
          <ProtectedRoute allowedRoles={['student','teacher']}>
            <SessionRoom token={token} serverUrl={url} session_id={session_id}/>
          </ProtectedRoute>
        }>

        </Route>

      </Routes>
      <Toaster position='bottom-right'/>
    </>
  )
}

export default App
