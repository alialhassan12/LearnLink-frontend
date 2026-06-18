import { useEffect } from 'react';
import useTeacherStore from '../../store/teacherStore'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { BookOpenText, CalendarDays, DollarSign, Languages, User } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const Profile=()=>{
    const {getTeacher,teacher,isGettingTeacher}=useTeacherStore();
    const navigate=useNavigate();

    useEffect(()=>{
        getTeacher();
    },[getTeacher]);
    
    if (isGettingTeacher) {
        return (
            <div className='flex flex-col gap-5'>
                {/* user top card skeleton */}
                <div className='flex flex-col sm:flex-row gap-4 items-center bg-card border border-border rounded-lg p-4 animate-pulse'>
                    <Skeleton className='w-24 h-24 rounded-full' />
                    <div className='flex flex-col flex-1 gap-2 w-full'>
                        <div className='flex flex-row justify-between items-center'>
                            <Skeleton className='h-6 w-1/3' />
                            <Skeleton className='h-10 w-24' />
                        </div>
                        <Skeleton className='h-4 w-1/2' />
                        <Skeleton className='h-4 w-1/4' />
                        <Skeleton className='h-4 w-1/4' />
                    </div>
                </div>

                {/* bio, languages and subjects skeleton */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                    <div className='bg-card border border-border rounded-lg p-4 flex flex-col gap-3'>
                        <Skeleton className='h-6 w-1/4' />
                        <Skeleton className='h-32 w-full' />
                    </div>
                    <div className='flex flex-col gap-4'>
                        <div className='bg-card border border-border rounded-lg p-4 flex flex-col gap-3'>
                            <Skeleton className='h-6 w-1/4' />
                            <Skeleton className='h-4 w-1/2' />
                        </div>
                        <div className='bg-card border border-border rounded-lg p-4 flex flex-col gap-3'>
                            <Skeleton className='h-6 w-1/4' />
                            <Skeleton className='h-4 w-1/2' />
                        </div>
                    </div>
                </div>
                {/* hourly rate skeleton */}
                <div className='bg-card border border-border rounded-lg p-4'>
                    <div className='flex flex-row gap-2 items-center text-lg font-medium text-text-strong mb-3'>
                        <Skeleton className='h-6 w-1/4' />
                    </div>
                    {/* session rates */}
                    <div className='flex flex-col gap-2 mt-2 border border-border rounded-lg p-3'>
                        <div className='flex flex-row items-center gap-1'>
                            <Skeleton className='w-4 h-4'/>
                            <Skeleton className='h-4 w-1/2'/>
                        </div>
                        <div className='flex flex-row items-center mt-2 gap-2'>
                            <Skeleton className='w-2 h-2'/>
                            <Skeleton className='p-2 rounded-lg bg-bg-1/80 border border-border w-1/2 text-text-strong font-bold'/>
                            <Skeleton className='w-2 h-2'/>
                        </div>
                    </div>
                </div>
                {/* Weekly Availability Skeleton */}
                <div className='bg-card border border-border rounded-lg p-4'>
                    <div className='flex flex-row gap-2 items-center text-lg font-medium text-text-strong mb-3'>
                        <Skeleton className='h-6 w-1/3' />
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className='p-3 rounded-lg border border-border flex flex-col gap-2'>
                                <Skeleton className='h-4 w-1/2' />
                                <Skeleton className='h-4 w-3/4' />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-5'>
            {/* user top card section */}
            <div className='flex flex-col sm:flex-row gap-4 items-center bg-card border border-border rounded-lg p-4'>
                {/* user avatar */}
                <div className='flex-shrink-0'>
                    <Avatar className='w-24 h-24 border-2 border-primary'>
                        <AvatarImage src={teacher?.user?.avatar_url} alt={teacher?.user?.name} />
                        <AvatarFallback className='bg-primary text-white text-4xl'>
                            {teacher?.user?.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>
                {/* user info  */}
                <div className='flex flex-col flex-1 w-full'>
                    <div className='flex flex-row justify-between items-center'>
                        <p className='text-lg font-medium text-text-strong'>Dr. {teacher?.user?.name}</p>
                        <Button 
                            onClick={()=>navigate("edit")}
                            className='h-10 px-4 hover:bg-primary/80 cursor-pointer'
                        >
                            Edit Profile
                        </Button>
                    </div>
                    <p className='text-sm text-text-weak mt-1'>{teacher?.headline ? teacher?.headline : 'No Headline Yet'}</p>
                    <p className='text-sm text-text-weak'>{teacher?.user?.email}</p>
                    <p className='text-sm text-text-weak'>{teacher?.location ? teacher?.location : 'No Location Yet'}</p>
                </div>
            </div>

            {/* bio, languages and subjects */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                {/* bio card */}
                <div className='bg-card border border-border rounded-lg p-4'>
                    <p className='flex flex-row gap-2 items-center text-lg font-medium text-text-strong mb-3'>
                        <BookOpenText className='text-primary' />
                        About me / Bio
                    </p>
                    <p className='text-sm text-text-weak leading-relaxed'>
                        {teacher?.bio ? teacher?.bio : 'No Bio yet'}
                    </p>
                </div>

                <div className='flex flex-col gap-4'>
                    {/* languages card */}
                    <div className='bg-card border border-border rounded-lg p-4'>
                        <p className='flex flex-row gap-2 items-center text-lg font-medium text-text-strong mb-3'>
                            <Languages className='text-primary' />
                            Languages
                        </p>
                        <p className='text-sm text-text-weak'>
                            {teacher?.languages?.length ? teacher?.languages.join(', ') : 'No languages listed'}
                        </p>
                    </div>

                    {/* subjects card */}
                    <div className='bg-card border border-border rounded-lg p-4'>
                        <p className='flex flex-row gap-2 items-center text-lg font-medium text-text-strong mb-3'>
                            <BookOpenText className='text-primary' />
                            Subjects
                        </p>
                        <p className='text-sm text-text-weak'>
                            {teacher?.subjects?.length ? teacher?.subjects.join(', ') : 'No subjects listed'}
                        </p>
                    </div>
                </div>
            </div>
            {/* hourly rate */}
            <div className='bg-card border border-border rounded-lg p-4'>
                <div className='flex flex-row gap-2 items-center text-lg font-medium text-text-strong mb-3'>
                    <DollarSign className='text-primary' />
                    Session Rates
                </div>
                {/* session rates */}
                <div className='flex flex-col gap-2 mt-2 border border-border rounded-lg p-3'>
                    <div className='flex flex-row items-center gap-1'>
                        <User className='text-primary text-sm'/>
                        <p className='text-text-strong font-bold text-sm'>1-on-1 Sessions</p>
                    </div>
                    <div className='flex flex-row items-center mt-2 gap-2'>
                        <p className='text-text-strong font-bold'>$</p>
                        <p className='p-2 rounded-lg bg-bg-1/80 border border-border w-1/2 text-text-strong font-bold'>
                            {teacher?.hourly_rate? teacher?.hourly_rate : 'Not Set Yet'}
                        </p>
                        <p> / hour</p>
                    </div>
                </div>
            </div>

            {/* Weekly Availability */}
            <div className='bg-card border border-border rounded-lg p-4'>
                <div className='flex flex-row gap-2 items-center text-lg font-medium text-text-strong mb-3'>
                    <CalendarDays className='text-primary' />
                    Weekly Availability
                </div>
                <div className='flex flex-col gap-3'>
                    {teacher?.availabilities?.length ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                            {teacher.availabilities.map((avail, index) => (
                                <div key={index} className='flex flex-col p-3 rounded-lg bg-muted/50 border border-border'>
                                    <p className='text-sm font-bold text-primary uppercase'>{avail.day_of_week}</p>
                                    <p className='text-sm text-text-strong mt-1'>
                                        {avail.start_time} - {avail.end_time}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className='text-sm text-text-weak italic'>No availability set yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
};

export default Profile;
