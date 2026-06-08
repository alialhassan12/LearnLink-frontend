import {create} from "zustand";
import type { AiMessage } from "../@types/aiMessage";
import axiosInstance from "../lib/axios";

interface AiMessagesStore{
    aiMessages:AiMessage[];

    isGettingAiMessages:boolean;
    getAiMessages:(chatId:number)=>Promise<void>;

    isReceivingAiMessage:boolean;
    addMessage:(message:AiMessage)=>void;
    sendMessageToAi:(chatId:number | null,content:string,chatTitle?:string)=>Promise<any>;
    sendMessageWithFileToAi:(chatId:number|null,content:string,file:File,chatTitle?:string)=>Promise<any>;
}

export const useAiMessagesStore=create<AiMessagesStore>((set)=>({
    aiMessages:[],

    isGettingAiMessages:false,
    getAiMessages:async(chatId:number)=>{
        set({isGettingAiMessages:true});
        try {
            const response=await axiosInstance.post('/ai/messages', { ai_chat_id: chatId });
            set({aiMessages:response.data.messages});
        } catch (error:any) {
            console.log(error?.response?.data?.message || 'Failed to retrieve AI messages');
        }finally{
            set({isGettingAiMessages:false});
        }
    },

    isReceivingAiMessage:false,
    sendMessageToAi:async(chatId:number | null,content:string,chatTitle?:string)=>{
        set({isReceivingAiMessage:true});
        try {
            const response=await axiosInstance.post('/ai/messages/new',{
                "ai_chat_id":chatId,
                "prompt":content,
                "chat_title":chatTitle
            });
            const incomingMessage = response.data.ai_message;
            set((state)=>({
                aiMessages:[...state.aiMessages, incomingMessage],
            }));
            return response.data;
        } catch (error:any) {
            console.log(error?.response?.data || 'Failed to send message');
            throw error;
        }finally{
            set({isReceivingAiMessage:false});
        }
    },

    addMessage:(message:AiMessage)=>{
        set((state)=>{
            return {aiMessages:[...state.aiMessages, message]};
        })
    },

    sendMessageWithFileToAi:async(chatId:number|null,content:string,file:File,chatTitle?:string)=>{
        set({isReceivingAiMessage:true});
        try{
            const response=await axiosInstance.post('/ai/messages-with-file/new',{
                "ai_chat_id":chatId,
                "prompt":content,
                "chat_title":chatTitle,
                "file":file
            },{
                headers:{
                    'Content-Type':'multipart/form-data'
                }
            });

            const incomingMessage=response.data.ai_message;
            set((state)=>{
                return {aiMessages:[...state.aiMessages, incomingMessage]};
            });
            
            return response.data;
        }catch(error:any){
            console.log(error?.response?.data || 'Failed to send message');
            throw error;
        }finally{
            set({isReceivingAiMessage:false});
        }
    }
}))