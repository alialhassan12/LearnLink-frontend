import {create} from "zustand";
import type { Conversation } from "../@types/conversation";
import type { Message } from "../@types/message";
import axiosInstance from "../lib/axios";

interface ChatState{
    conversations:Conversation[];
    addConversation:(conversation:Conversation)=>void;
    activeConversation:Conversation | null;
    setActiveConversation:(conversation:Conversation | null)=>void;
    messages:Message[];

    isGettingConversations:boolean;
    getConversations:()=>Promise<void>;

    isGettingMessages:boolean;
    getMessages:(conversation_id:number)=>Promise<void>;

    isSendingMessage:boolean;
    sendMessage:(receiver_id:number,type:string,content?:string,file?:File,file_name?:string)=>Promise<void>;
}

export const useChatStore=create<ChatState>((set)=>({
    conversations:[],
    addConversation:(conversation:Conversation)=>set((state)=>({
        conversations:[conversation,...state.conversations],
    })),
    activeConversation:null,
    setActiveConversation:(conversation:Conversation|null)=>set({activeConversation:conversation}),
    messages:[],
    setMessages:(messages:Message[])=>set({messages}),

    isGettingConversations:false,
    getConversations:async()=>{
        set({isGettingConversations:true});
        try {
            const response=await axiosInstance.get('/messages/conversations');
            set({conversations:response.data.conversations});
            console.log('conversations:',response.data.conversations);
        } catch (error:any) {
            console.log('error getting conversations:',error?.response?.data);
        }finally{
            set({isGettingConversations:false});
        }
    },

    isGettingMessages:false,
    getMessages:async(conversation_id:number)=>{
        if (conversation_id < 0) {
            set({messages:[]});
            return;
        }
        set({isGettingMessages:true});
        try {
            const response=await axiosInstance.post('/messages/conversation',{'conversation_id':conversation_id});
            set({messages:response.data.messages});
        } catch (error:any) {
            set({messages:[]});
            console.log('error getting messages:',error?.response?.data);
        }finally{
            set({isGettingMessages:false});
        }
    },

    isSendingMessage:false,
    sendMessage:async(receiver_id:number,type:string,content?:string,file?:File,file_name?:string)=>{
        set({isSendingMessage:true});
        try {
            const formData=new FormData();
            formData.append('receiver_id',receiver_id.toString());
            formData.append('type',type);
            if(content){
                formData.append('content',content);
            }
            if(file){
                formData.append('file',file);
            }
            if(file_name){
                formData.append('file_name',file_name);
            }
            const response=await axiosInstance.post('/messages/send',formData,{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const sentMessage = response.data.message;
            if (sentMessage) {
                set((state) => {
                    const nextState: Partial<ChatState> = {};
                    
                    // Add the message locally
                    const messageExists = state.messages.some(m => String(m.id) === String(sentMessage.id));
                    if (!messageExists) {
                        nextState.messages = [...state.messages, sentMessage];
                    }
                    
                    // If the active conversation is temporary or its ID doesn't match the new message's conversation ID, update it
                    if (state.activeConversation && state.activeConversation.id !== sentMessage.conversation_id) {
                        const updatedActiveConv = {
                            ...state.activeConversation,
                            id: sentMessage.conversation_id
                        };
                        nextState.activeConversation = updatedActiveConv;
                        
                        nextState.conversations = state.conversations.map(conv => 
                            conv.id === state.activeConversation!.id 
                                ? { ...conv, id: sentMessage.conversation_id, last_message: sentMessage, updated_at: sentMessage.created_at }
                                : conv
                        );
                    } else {
                        nextState.conversations = state.conversations.map(conv => {
                            if (conv.id === sentMessage.conversation_id) {
                                return {
                                    ...conv,
                                    last_message: sentMessage,
                                    updated_at: sentMessage.created_at
                                };
                            }
                            return conv;
                        });
                    }
                    
                    if (nextState.conversations) {
                        nextState.conversations.sort((a, b) => {
                            const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
                            const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
                            return timeB - timeA;
                        });
                    }
                    
                    return nextState;
                });
                
                // Fetch the actual conversation records from the backend in the background to ensure everything is completely in sync
                // We do NOT await this request so that the message sending status is cleared immediately.
                const activeConv = useChatStore.getState().activeConversation;
                if (activeConv) {
                    axiosInstance.get('/messages/conversations')
                        .then((convsResponse) => {
                            const updatedConvs = convsResponse.data.conversations;
                            const matchingConv = updatedConvs.find((c: Conversation) => c.id === sentMessage.conversation_id);
                            
                            set({
                                conversations: updatedConvs,
                                activeConversation: matchingConv || activeConv
                            });
                        })
                        .catch((err) => {
                            console.error('Failed to sync conversations after sending first message:', err);
                        });
                }
            }
        } catch (error:any) {
            console.log('error sending message:',error?.response?.data);
        }finally{
            set({isSendingMessage:false});
        }
    }
}));