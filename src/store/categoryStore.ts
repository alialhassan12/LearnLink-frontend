import {create} from "zustand";
import type { Category } from "../@types/category";
import axiosInstance from "../lib/axios";

interface useCategoryStoreState{
    categories:Category[],
    isGettingCategories:boolean,
    getCategories:()=>Promise<void>,
}

const useCategoryStore=create<useCategoryStoreState>((set)=>({
    categories:[],
    isGettingCategories:false,
    getCategories: async ()=>{
        try {
            set({isGettingCategories:true});
            const response= await axiosInstance.get('/categories');
            set({categories:response.data.categories});
        } catch (error) {
            console.error("Error getting categories:", error);
        } finally {
            set({isGettingCategories:false});
        }
    }
}));

export default useCategoryStore;