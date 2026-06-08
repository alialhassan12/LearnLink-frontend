import { Filter, Search } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../../components/ui/sheet";
import CourseFilterSection from "../../../components/studentMarketplaceComponents/CourseFilterSection";
import { useCourseStore } from "../../../store/courseStore";
import { useEffect } from "react";
import useCategoryStore from "../../../store/categoryStore";
import CourseCardSkeleton from "../../../components/studentMarketplaceComponents/CourseCardSkeleton";
import CourseCard from "../../../components/studentMarketplaceComponents/CourseCard";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../../components/ui/pagination";

const BrowseCourses=()=>{
    const {
        courses,
        getCourses,
        isGettingCourses,
        coursePaginationData,
        courseFilters,
        setCourseFilters,
        clearCourseFilters,
    }=useCourseStore();
    
    const {categories,getCategories,isGettingCategories}=useCategoryStore();

    useEffect(()=>{
        getCourses();
    },[getCourses]);

    useEffect(()=>{
        if(!isGettingCategories){
            getCategories();
        }
    },[getCategories]);

    const isLoading=isGettingCategories || isGettingCourses;

    return (
        <div className="px-10 py-10">
            {/* top search bar */}
            <div data-aos="fade-down" className="flex flex-col gap-4 justify-center items-center my-6 md:my-10 px-4">
                {/* title */}
                <h1 className="text-2xl md:text-3xl font-bold text-text-strong text-center">Explore Courses From Expert Teachers</h1>
                {/* search bar */}
                <div data-aos="zoom-out" className="w-full md:w-[80%] lg:w-[60%] bg-bg-1 rounded-xl p-2 border border-border flex flex-col md:flex-row items-center gap-3 md:gap-5 shadow-sm">
                    {/* search input */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-weak h-4 w-4" />
                        <Input 
                            type="text"
                            placeholder="Search by category, subject, or keyword..."
                            className="w-full h-11 pl-10 border-none focus-visible:ring-0 bg-transparent"
                        />
                    </div>
                    {/* search button */}
                    <Button 
                        className="w-full md:w-auto h-11 px-8 cursor-pointer font-medium hover:scale-[1.02] transition-all duration-300 ease-in-out bg-primary hover:bg-primary/90"
                    >
                        Search
                    </Button>
                </div>
            </div>
            {/* body */}
            <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                {/* mobile filter trigger */}
                <div className="lg:hidden flex justify-between items-center bg-bg-1 p-4 rounded-lg border border-border mb-4">
                    <p className="font-semibold text-text-strong">Filters</p>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <span>Filter</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                            </SheetHeader>
                            <div className="py-6 overflow-y-auto h-full">
                                <CourseFilterSection 
                                    categories={categories}
                                    isGettingFilters={isLoading}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* desktop filters */}
                <aside className="hidden lg:block w-[280px] shrink-0">
                    <div data-aos="fade-right" className="sticky top-24 flex flex-col gap-6 p-6 bg-bg-1 border border-border rounded-xl shadow-sm">
                        <CourseFilterSection 
                            categories={categories}
                            isGettingFilters={isLoading}
                        />
                    </div>
                </aside>

                {/* courses grid */}
                <main className="flex-1 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <CourseCardSkeleton key={i} />
                            ))
                        ) : (
                            courses.length > 0 ? (
                                courses.map((course, i) => (
                                    <CourseCard key={course.id || i} course={course} />
                                ))
                            ) : (
                                <div className="col-span-full md:col-span-2 lg:col-span-3 text-center py-20 text-text-weak">
                                    <p className="text-lg">No courses found matching your criteria.</p>
                                    <Button 
                                        variant="link" 
                                        className="text-primary cursor-pointer"
                                        onClick={()=>{
                                            clearCourseFilters();
                                            getCourses(1);
                                        }}
                                    >
                                        Clear all filters
                                    </Button>
                                </div>
                            )
                        )}
                    </div>

                    {/* course pagination */}
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    size="lg" 
                                    className={`${coursePaginationData?.current_page === 1 ? 'pointer-events-none opacity-50' : ''}`}
                                    onClick={() => getCourses(coursePaginationData?.current_page - 1)} 
                                />
                            </PaginationItem>
                            {
                                Array.from({ length: coursePaginationData?.last_page }).map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink 
                                            size="lg"
                                            onClick={() => getCourses(i + 1)}
                                            isActive={coursePaginationData?.current_page === i + 1}
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))
                            }
                            <PaginationItem>
                                <PaginationNext 
                                    size="lg" 
                                    className={`${coursePaginationData?.current_page === coursePaginationData?.last_page ? 'pointer-events-none opacity-50' : ''}`}
                                    onClick={() => getCourses(coursePaginationData?.current_page + 1)} 
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </main>
            </div>
        </div>
    );
};

export default BrowseCourses;