import { create } from "zustand";
import type {  SessionMaterial } from "../@types/sessionMaterial";
import axiosInstance from "../lib/axios";
import { toast } from "sonner";

interface SessionMaterialsStore{
    sessionMaterials:SessionMaterial[];
    setSessionMaterials:(materials:SessionMaterial[])=>void;
    isuploadingMaterials:boolean;
    uploadMaterials:(filesData:{
        live_session_id:number,
        files:{
            fileTitle:string,
            fileType:string,
            file:File
        }[]
    })=>Promise<void>;
    isDeletingSessionMaterial:boolean;
    deleteSessionMaterial:(sessionMaterialId:number)=>Promise<void>;
}

export const useSessionMaterialsStore = create<SessionMaterialsStore>((set)=>({
    sessionMaterials:[],
    setSessionMaterials:(materials:SessionMaterial[])=>set({sessionMaterials:materials}),
    
    isuploadingMaterials:false,
    uploadMaterials:async(filesData:{
        live_session_id:number,
        files:{
            fileTitle:string,
            fileType:string,
            file:File
        }[]
    })=>{
        set({isuploadingMaterials:true});
        try {
            const formData = new FormData();
            formData.append('live_session_id', filesData.live_session_id.toString());
            
            filesData.files.forEach((fileItem, index) => {
                formData.append(`files[${index}][file]`, fileItem.file);
                formData.append(`files[${index}][fileTitle]`, fileItem.fileTitle);
                formData.append(`files[${index}][fileType]`, fileItem.fileType);
            });

            const response=await axiosInstance.post('/live-sessions/upload-materials',formData,{
                headers:{
                    'Content-Type':'multipart/form-data'
                }
            });

            // update the session materials list by concat the new materials
            const updatedSessionMaterials=response.data.session_materials;
            set((state)=>{
                const updatedMaterials=state.sessionMaterials.concat(updatedSessionMaterials);
                return {sessionMaterials:updatedMaterials};
            });
            toast.success(response.data.message);
        } catch (error:any) {
            console.log(error?.response?.data?.message||"Failed to upload materials");
            throw error;
        } finally {
            set({isuploadingMaterials:false});
        }
    },

    isDeletingSessionMaterial:false,
    deleteSessionMaterial:async(sessionMaterialId:number)=>{
        set({isDeletingSessionMaterial:true});
        try {
            const response=await axiosInstance.delete('/live-sessions/delete-material',{data:{sessionMaterialId:sessionMaterialId}});
            set((state)=>{
                const updatedMaterials=state.sessionMaterials.filter((material)=>material.id !==sessionMaterialId);
                return {sessionMaterials:updatedMaterials};
            });
            toast.success(response.data.message);
        } catch (error:any) {
            console.log(error?.response?.data?.message||"Failed to delete material");
            throw error;
        }finally{
            set({isDeletingSessionMaterial:false});
        }
    }


}));