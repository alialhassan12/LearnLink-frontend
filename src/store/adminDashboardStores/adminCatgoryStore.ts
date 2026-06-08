import {create} from "zustand"
import type { Category } from "../../@types/category"
import axiosInstance from "../../lib/axios";
import { toast } from "sonner";

interface AdminCategoryStore{
    categories:Category[];

    isGettingAdminCategories:boolean;
    getAdminCategories:()=>Promise<void>;

    isCreatingCategory:boolean;
    createAdminCategory:(title:string)=>Promise<void>;

    isEditingCategory:boolean;
    editAdminCategory:(id:number,title:string)=>Promise<void>;

    isDeleteingCategory:boolean;
    deleteAdminCategory:(id:number)=>Promise<void>;

    isChangingCategoryStatus:boolean;
    changeCategoryStatus:(status:string,id:number)=>Promise<void>;
}

export const useAdminCategoryStore=create<AdminCategoryStore>((set)=>({
    categories:[],

    isGettingAdminCategories:false,
    getAdminCategories:async()=>{
        set({isGettingAdminCategories:true});
        try {
            const response=await axiosInstance.get("/admin/categories");
            set({categories:response?.data?.categories});
        } catch (error:any) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        } finally{
            set({isGettingAdminCategories:false});
        }
    },

    isCreatingCategory:false,
    createAdminCategory:async(title:string)=>{
        set({isCreatingCategory:true});
        try {
            const response=await axiosInstance.post("/admin/categories/new",{title});
            set((state)=>({
                categories:[...state.categories,{...response.data.category,"courses_count":0,"status":"active"}]
            }));
            toast.success(response?.data?.message || 'Category created successfully');
        } catch (error:any) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        } finally {
            set({isCreatingCategory:false});
        }
    },

    isEditingCategory:false,
    editAdminCategory:async(id:number,title:string)=>{
        set({isEditingCategory:true});
        try {
            const response=await axiosInstance.put("/admin/categories/update",{
                category_id:id,
                title:title
            });
            set((state)=>{
                const updatedCategories=state.categories.map((category)=>
                    category.id===id?{...category,title:title}:category
                );
                return {categories:updatedCategories};
            });
            toast.success(response?.data?.message || 'Category updated successfully');
        } catch (error:any) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        } finally{
            set({isEditingCategory:false});
        }
    },

    isDeleteingCategory:false,
    deleteAdminCategory:async(id:number)=>{
        set({isDeleteingCategory:true});
        try {
            const response=await axiosInstance.delete(`/admin/categories/delete/${id}`);
            set((state)=>{
                const filteredCategories=state.categories.filter((category)=>category.id!==id);
                return {categories:filteredCategories};
            });
            toast.success(response?.data?.message || 'Category deleted successfully');
        } catch (error:any) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        }finally{
            set({isDeleteingCategory:false});
        }
    },

    isChangingCategoryStatus:false,
    changeCategoryStatus:async(status:string,id:number)=>{
        set({isChangingCategoryStatus:true});
        try {
            const response=await axiosInstance.put("/admin/categories/change-status",{
                category_id:id,
                status:status
            });
            set((state)=>{
                const updatedCategories=state.categories.map((category)=>{
                    if(category.id===id){
                        return {...category,status:status};
                    }
                    return category;
                });
                return {categories:updatedCategories};
            });
            toast.success(response?.data?.message || 'Category status changed successfully');
        } catch (error:any) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        } finally {
            set({isChangingCategoryStatus:false});
        }
    }
}));