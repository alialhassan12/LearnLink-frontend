import {create} from "zustand";

interface CreateCourseStoreState{
    courseData:{
        title:string,
        teacher_id:number,
        category_id:number,
        language:string,
        description:string,
        thumbnail: File | null,
        price:number
    },
    setCourseData:(courseData:{
        title:string,
        teacher_id:number,
        category_id:number,
        language:string,
        description:string,
        thumbnail: File | null,
        price:number
    })=>void,
    // image preview of thumbnail
    imagePreview:string,
    setImagePreview:(imagePreview:string)=>void,

    // course section
    courseSections:{title:string,order:number,files:{file:File,title:string,size:number,type:string}[]}[],
    setCourseSections:(courseSections:{title:string,order:number,files:{file:File,title:string,size:number,type:string}[]}[])=>void,
    addCourseSection:(title:string)=>void,
    addFileToSection:(sectionTitle:string,file:File,fileTitle:string,fileSize:number,fileType:string)=>void,
    removeFileFromSection:(sectionTitle:string,fileTitle:string)=>void,

    // clear state
    clearCourseAndSectionData:()=>void,
}



const useCreateCourseStore=create<CreateCourseStoreState>((set)=>({
    courseData:{
        title:"",
        teacher_id:0,
        category_id:0,
        language:"",
        description:"",
        thumbnail:null,
        price:0
    },
    setCourseData:(courseData:{
        title:string,
        teacher_id:number,
        category_id:number,
        language:string,
        description:string,
        thumbnail:File,
        price:number
    })=>set((state)=>({...state,courseData})),

    // image preview of thumbnail
    imagePreview:"",
    setImagePreview:(imagePreview:string)=>set((state)=>({...state,imagePreview})),
    
    // course section
    courseSections:[],
    setCourseSections:(courseSections:{title:string,order:number,files:{file:File,title:string,size:number,type:string}[]}[])=>set((state)=>({...state,courseSections})),
    
    addCourseSection:(title:string)=>set((state)=>{
        const newOrder = state.courseSections.length;
        return {
            ...state,
            courseSections: [...state.courseSections, { title, order: newOrder, files: [] }]
        };
    }),

    addFileToSection:(sectionTitle:string,file:File,fileTitle:string,fileSize:number,fileType:string)=>set((state)=>({
        ...state,
        courseSections: state.courseSections.map(section => 
            section.title === sectionTitle 
                ? { ...section, files: [...section.files, {file,title:fileTitle,type:fileType,size:fileSize}]} 
                : section
        )
    })),

    removeFileFromSection:(sectionTitle:string,fileTitle:string)=>set((state)=>({
        ...state,
        courseSections:state.courseSections.map(section=>{
            if(section.title===sectionTitle){
                return {
                    ...section,
                    files:section.files.filter(file=>file.title!==fileTitle)
                };
            };
            return section;
        })
    })),

    clearCourseAndSectionData:()=>set(()=>({courseData:{title:"",teacher_id:0,category_id:0,language:"",description:"",thumbnail:null,price:0}
                                                ,courseSections:[],imagePreview:""})),

}));

export default useCreateCourseStore;