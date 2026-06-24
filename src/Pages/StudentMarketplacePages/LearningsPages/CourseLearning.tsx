import { useParams, useNavigate } from "react-router-dom";
import { useCourseStore } from "../../../store/courseStore";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, PlayCircle, FileText, Image, FileDown, ChevronDown, ChevronRight, BookOpen, Clock, Globe, Star } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Skeleton } from "../../../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import type { CourseMaterial } from "../../../@types/courseMaterials";
import { toast } from "sonner";
import { Spinner } from "../../../components/ui/spinner";
import { useStudentStore } from "../../../store/studentmarketplaceStores/studentStore";

const CourseLearning = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { 
        courseWithMaterials, 
        isGettingCourseWithMaterialsById, 
        getCourseWithMaterialsById,
        isDownloadingCourseMaterial,
        downoladCourseMaterial,
        isCreatingCourseReview,
        createCourseReview,
        courseReviews
    } = useCourseStore();
    const { loggedInStudentId, getLoggedInStudentId } = useStudentStore();
    const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
    const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [reviewText, setReviewText] = useState<string>("");

    useEffect(() => {
        if (id) {
            getLoggedInStudentId();
            getCourseWithMaterialsById(Number(id));
        }
    }, [id]);

    const handleSubmitCourseReview = async () => {
        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }
        if (id) {
            try {
                await createCourseReview(Number(id), rating, reviewText);
                setRating(0);
                setReviewText("");
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Auto-select first available material and expand sections when course data is loaded
    useEffect(() => {
        if (courseWithMaterials?.sections) {
            // Expand all sections by default
            const initialExpanded: Record<number, boolean> = {};
            courseWithMaterials.sections.forEach((section) => {
                if (section.id) {
                    initialExpanded[section.id] = true;
                }
            });
            setExpandedSections(initialExpanded);

            // Select first material of first section with materials
            const sorted = [...courseWithMaterials.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
            const firstSectionWithMaterials = sorted.find(
                (sec) => sec.materials && sec.materials.length > 0
            );
            if (firstSectionWithMaterials && firstSectionWithMaterials.materials && firstSectionWithMaterials.materials.length > 0) {
                setSelectedMaterial(firstSectionWithMaterials.materials[0]);
            }
        }
    }, [courseWithMaterials]);

    const sortedSections = [...(courseWithMaterials?.sections || [])].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
    );

    // Flatten all materials to easily calculate next/previous lesson
    const allMaterials = sortedSections.reduce<CourseMaterial[]>((acc, section) => {
        return acc.concat(section.materials || []);
    }, []);

    const currentIndex = allMaterials.findIndex(m => m.id === selectedMaterial?.id);
    const prevMaterial = currentIndex > 0 ? allMaterials[currentIndex - 1] : null;
    const nextMaterial = currentIndex !== -1 && currentIndex < allMaterials.length - 1 ? allMaterials[currentIndex + 1] : null;

    const toggleSection = (sectionId: number) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const getMaterialIcon = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes("video") || lowerType === "mp4" || lowerType === "mov") {
            return <PlayCircle className="text-blue-500" size={18} />;
        }
        if (lowerType.includes("pdf") || lowerType.includes("doc") || lowerType.includes("text") || lowerType === "pdf" || lowerType === "docx") {
            return <FileText className="text-orange-500" size={18} />;
        }
        if (lowerType.includes("image") || lowerType === "png" || lowerType === "jpg" || lowerType === "jpeg" || lowerType === "webp") {
            return <Image className="text-green-500" size={18} />;
        }
        return <FileDown className="text-purple-500" size={18} />;
    };

    const handleDownloadMaterial=async(materialId:number,fileTitle:string)=>{
        try{
            toast.info("start Downloading...");
            const blob = await downoladCourseMaterial(materialId);
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileTitle;

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl);

            toast.success("downloaded successfuly");
        }catch(error){
            console.log(error);
            toast.error("Failed to download file");
        }
    }

    const renderMaterialContent = (material: CourseMaterial) => {
        const lowerType = material.type.toLowerCase();
        console.log(lowerType);
        const path = material.path || "";

        if (lowerType.includes("video") || lowerType === "mp4" || lowerType === "mov") {
            return (
                <video
                    key={material.id}
                    src={path}
                    controls
                    className="w-full h-full object-contain bg-black rounded-xl shadow-inner"
                    autoPlay
                />
            );
        }

        if (lowerType.includes("image") || lowerType === "png" || lowerType === "jpg" || lowerType === "jpeg" || lowerType === "webp") {
            return (
                <div className="flex items-center justify-center w-full h-full bg-card p-4 rounded-xl">
                    <img
                        src={path}
                        alt={material.title}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                </div>
            );
        }

        if (lowerType.includes("pdf") || lowerType === "pdf") {
            return (
                <div className="flex flex-col w-full h-full bg-card rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700">
                        <span className="text-sm font-medium text-slate-200 truncate max-w-[70%]">
                            {material.title}
                        </span>
                        <Button
                            onClick={() => handleDownloadMaterial(material.id, material.title)}
                            disabled={isDownloadingCourseMaterial}
                            className="inline-flex items-center text-xs text-primary hover:text-primary/80 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition"
                        >
                            <FileDown size={14} className="mr-1.5" /> Full Screen / Download
                        </Button>
                    </div>
                    <iframe
                        src={`${path}#toolbar=0`}
                        className="w-full flex-1 border-none bg-slate-800"
                        title={material.title}
                    />
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-2 items-center justify-center w-full h-full bg-card border-dashed border-border rounded-xl p-8 text-center">
                <div className="p-4 bg-primary/10 rounded-full text-primary mb-4 animate-bounce">
                    <FileDown size={48} />
                </div>
                <h3 className="text-xl font-bold text-text-strong mb-2">{material.title}</h3>
                <p className="text-sm text-text-weak max-w-md">
                    This file format ({material.type.toUpperCase()}) cannot be previewed directly in the browser. You can download it to view locally.
                </p>
                <Button
                    onClick={() => handleDownloadMaterial(material.id, material.title)}
                    disabled={isDownloadingCourseMaterial}
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-all font-medium shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
                >
                    <FileDown size={18} className="mr-2" />
                    Download File ({(material.size ? (material.size / 1024 / 1024).toFixed(2) : "0")} MB)
                </Button>
            </div>
        );
    };

    const renderEmptyViewer = () => {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-slate-50 dark:bg-slate-900 border border-dashed border-border rounded-xl p-8 text-center">
                <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
                    <BookOpen size={48} />
                </div>
                <h3 className="text-xl font-bold text-text-strong mb-2">Welcome to your Course!</h3>
                <p className="text-sm text-text-weak max-w-md">
                    Select any lesson, reading material, or assignment from the course syllabus on the right to start learning.
                </p>
            </div>
        );
    };

    if (isGettingCourseWithMaterialsById) {
        return <CourseLearningSkeleton />
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border/80 pb-4">
                <button
                    onClick={() => navigate("/marketplace/learnings")}
                    className="inline-flex items-center gap-2 text-text-weak hover:text-text-strong transition font-medium group text-sm self-start cursor-pointer"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to My Learnings
                </button>
                <div className="text-sm text-text-weak truncate max-w-md hidden md:block">
                    Current: <span className="font-semibold text-text-strong">{selectedMaterial?.title || "Overview"}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Viewer & Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Viewer Container */}
                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-xl border border-border/50 flex items-center justify-center">
                        {selectedMaterial ? renderMaterialContent(selectedMaterial) : renderEmptyViewer()}
                    </div>

                    {/* Lesson Navigation Buttons */}
                    <div className="flex justify-between items-center bg-card border border-border p-4 rounded-xl shadow-sm">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!prevMaterial}
                            onClick={() => prevMaterial && setSelectedMaterial(prevMaterial)}
                            className="cursor-pointer font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                        >
                            <ArrowLeft size={16} className="mr-1.5" /> Previous Lesson
                        </Button>
                        <span className="text-xs text-text-weak font-medium">
                            {selectedMaterial && allMaterials.length > 0
                                ? `Lesson ${currentIndex + 1} of ${allMaterials.length}`
                                : `Select a Lesson`
                            }
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!nextMaterial}
                            onClick={() => nextMaterial && setSelectedMaterial(nextMaterial)}
                            className="cursor-pointer font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                        >
                            Next Lesson <ArrowRight size={16} className="ml-1.5" />
                        </Button>
                    </div>

                    {/* Selected Material Title & Details */}
                    <div>
                        <h1 className="text-2xl font-bold text-text-strong tracking-tight">
                            {selectedMaterial?.title || courseWithMaterials?.title}
                        </h1>
                        <p className="text-sm text-text-weak mt-1">
                            {selectedMaterial
                                ? `File Size: ${(selectedMaterial.size ? (selectedMaterial.size / 1024 / 1024).toFixed(2) : "0")} MB | Format: ${selectedMaterial.type.toUpperCase()}`
                                : `Select a learning resource below`
                            }
                        </p>
                    </div>

                    {/* Course Tabs (Overview, Author) */}
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="border-b border-border w-full justify-start rounded-none bg-transparent h-auto p-0 mb-6">
                            <TabsTrigger
                                value="overview"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm font-medium"
                            >
                                Course Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="instructor"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm font-medium"
                            >
                                Instructor
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm font-medium"
                            >
                                Reviews
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-0">
                            <div className="bg-card border border-border p-6 rounded-xl space-y-4 shadow-sm">
                                <h3 className="text-lg font-bold text-text-strong">About This Course</h3>
                                <p className="text-text-strong text-sm leading-relaxed whitespace-pre-line">
                                    {courseWithMaterials?.description || "No description provided for this course."}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-primary" />
                                        <div className="text-xs">
                                            <p className="text-text-weak">Language</p>
                                            <p className="font-semibold text-text-strong">{courseWithMaterials?.language || "English"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} className="text-primary" />
                                        <div className="text-xs">
                                            <p className="text-text-weak">Syllabus</p>
                                            <p className="font-semibold text-text-strong">{courseWithMaterials?.sections?.length || 0} Sections</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Globe size={16} className="text-primary" />
                                        <div className="text-xs">
                                            <p className="text-text-weak">Price Status</p>
                                            <p className="font-semibold text-text-strong">
                                                {courseWithMaterials?.price && courseWithMaterials.price > 0
                                                    ? `$${courseWithMaterials.price}`
                                                    : "Free Access"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="instructor" className="mt-0">
                            <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-start gap-4">
                                <Avatar className="h-16 w-16 border-2 border-border shadow-sm">
                                    <AvatarImage src={courseWithMaterials?.teacher?.user?.avatar_url || undefined} />
                                    <AvatarFallback className="text-lg font-bold">
                                        {courseWithMaterials?.teacher?.user?.name?.charAt(0).toUpperCase() || "I"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2 flex-1">
                                    <h3 className="text-lg font-bold text-text-strong">
                                        Dr. {courseWithMaterials?.teacher?.user?.name || "Instructor"}
                                    </h3>
                                    <p className="text-xs text-text-weak uppercase tracking-wider font-semibold">
                                        Instructor on LearnLink
                                    </p>
                                    <p className="text-sm text-text-strong leading-relaxed">
                                        Qualified instructor specializing in academic coursework. Contact via the internal message board for live sessions and Q&A scheduling.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-0">
                            <div className="bg-card border border-border p-6 rounded-xl space-y-6 shadow-sm">
                                <h3 className="text-lg font-bold text-text-strong">Course Review</h3>
                                
                                {(() => {
                                    const myReview = courseReviews?.find((r) => r.student_id === loggedInStudentId);
                                    
                                    if (myReview) {
                                        return (
                                            <div className="flex flex-col gap-4">
                                                <p className="text-text-weak text-sm">
                                                    Thank you for reviewing this course. Your feedback helps other students make informed decisions.
                                                </p>
                                                <Separator className="bg-border/50" />
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={22}
                                                            className={star <= myReview.rating ? "fill-amber-400 text-amber-400" : "text-border/40 text-muted-foreground/30"}
                                                        />
                                                    ))}
                                                    <span className="ml-2 text-sm font-bold text-text-strong">{myReview.rating} / 5</span>
                                                </div>
                                                {myReview.review ? (
                                                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                                                        <p className="text-sm text-text-strong italic">"{myReview.review}"</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-text-weak italic">No written comment provided.</p>
                                                )}
                                                <div className="flex justify-end">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                        Submitted
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div className="flex flex-col gap-6 max-w-xl">
                                                <p className="text-text-weak text-sm">
                                                    How would you rate this course? Share your learning experience to help other students.
                                                </p>
                                                <Separator className="bg-border/50" />
                                                
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-text-strong">Rating</label>
                                                    <div 
                                                        className="flex items-center gap-2"
                                                        onMouseLeave={() => setHoverRating(0)}
                                                    >
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                className="cursor-pointer transition-transform duration-200 hover:scale-110 focus:outline-none"
                                                                onClick={() => setRating(star)}
                                                                onMouseEnter={() => setHoverRating(star)}
                                                            >
                                                                <Star
                                                                    size={30}
                                                                    className={`transition-colors duration-200 ${
                                                                        star <= (hoverRating || rating)
                                                                            ? "fill-amber-400 text-amber-400"
                                                                            : "text-border/40 text-muted-foreground/30 hover:text-amber-300"
                                                                    }`}
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-text-strong">Review Description (Optional)</label>
                                                    <textarea
                                                        value={reviewText}
                                                        onChange={(e) => setReviewText(e.target.value)}
                                                        placeholder="Write your review here..."
                                                        rows={4}
                                                        className="w-full p-4 rounded-2xl bg-muted/20 border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none text-sm text-text-strong placeholder:text-text-weak"
                                                    />
                                                </div>

                                                <Button
                                                    onClick={handleSubmitCourseReview}
                                                    disabled={rating === 0 || isCreatingCourseReview}
                                                    className="w-full sm:w-auto self-start px-8 py-6 rounded-2xl bg-primary text-background font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                                                >
                                                    {isCreatingCourseReview ? (
                                                        <Spinner className="text-background" />
                                                    ) : (
                                                        "Submit Review"
                                                    )}
                                                </Button>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Panel: Course Syllabus Playlist */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-bold text-text-strong px-1">Course Syllabus</h2>
                    <div className="space-y-3">
                        {sortedSections.map((section, sIndex) => {
                            const isExpanded = expandedSections[section.id || 0];
                            const sectionMaterials = section.materials || [];

                            return (
                                <div
                                    key={section.id}
                                    className="border border-border bg-card rounded-xl overflow-hidden shadow-sm transition-all duration-300"
                                >
                                    {/* Section Header */}
                                    <button
                                        onClick={() => section.id && toggleSection(section.id)}
                                        className="w-full flex items-center justify-between p-4 font-semibold text-text-strong hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-left cursor-pointer border-none outline-none"
                                    >
                                        <div className="pr-2">
                                            <p className="text-xs text-text-weak uppercase tracking-wider font-bold">
                                                Section {sIndex + 1}
                                            </p>
                                            <h3 className="text-sm font-bold text-text-strong mt-0.5">
                                                {section.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-text-weak rounded-full font-medium">
                                                {sectionMaterials.length} {sectionMaterials.length === 1 ? 'item' : 'items'}
                                            </span>
                                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        </div>
                                    </button>

                                    {/* Section Materials List */}
                                    {isExpanded && (
                                        <div className="border-t border-border bg-slate-50/30 dark:bg-slate-900/10 divide-y divide-border/60">
                                            {sectionMaterials.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-text-weak">
                                                    No materials uploaded for this section.
                                                </div>
                                            ) : (
                                                sectionMaterials.map((material) => {
                                                    const isSelected = selectedMaterial?.id === material.id;

                                                    return (
                                                        <button
                                                            key={material.id}
                                                            onClick={() => setSelectedMaterial(material)}
                                                            className={`w-full flex items-start gap-3 p-3.5 text-left transition-all duration-200 cursor-pointer border-none outline-none ${
                                                                isSelected
                                                                    ? "bg-primary/10 border-l-4 border-primary pl-2.5 font-medium"
                                                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/30 pl-3.5"
                                                            }`}
                                                        >
                                                            <div className="mt-0.5 shrink-0">
                                                                {getMaterialIcon(material.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className={`text-xs leading-snug truncate ${
                                                                    isSelected ? "text-primary font-semibold" : "text-text-strong"
                                                                }`}>
                                                                    {material.title}
                                                                </h4>
                                                                <span className="text-[10px] text-text-weak uppercase mt-1 block">
                                                                    {material.type} • {(material.size ? (material.size / 1024 / 1024).toFixed(2) : "0")} MB
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CourseLearningSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
            {/* Header Back Button */}
            <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-9 w-32 rounded" />
                <Skeleton className="h-5 w-48 rounded" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Viewer & Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Video Viewer Box */}
                    <Skeleton className="w-full aspect-video rounded-xl" />

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-10 w-28 rounded" />
                        <Skeleton className="h-10 w-28 rounded" />
                    </div>

                    {/* Title and Instructor info */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <Skeleton className="h-8 w-3/4 rounded" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-28 rounded" />
                                <Skeleton className="h-3 w-20 rounded" />
                            </div>
                        </div>
                    </div>

                    {/* Tabs area */}
                    <div className="space-y-3 pt-6">
                        <Skeleton className="h-10 w-64 rounded" />
                        <Skeleton className="h-24 w-full rounded" />
                    </div>
                </div>

                {/* Right Panel: Syllabus */}
                <div className="lg:col-span-1 space-y-4">
                    <Skeleton className="h-6 w-36 rounded" />
                    {[1, 2, 3].map((sectionId) => (
                        <div key={sectionId} className="border border-border rounded-xl p-4 space-y-3">
                            <Skeleton className="h-6 w-2/3 rounded" />
                            <div className="space-y-2 pl-2">
                                <Skeleton className="h-10 w-full rounded" />
                                <Skeleton className="h-10 w-full rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseLearning;