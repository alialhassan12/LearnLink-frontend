import type { user } from "../@types/user";
import useAuthStore from "../store/authStore";
import { Button } from "./ui/button"
import { useChatStore } from "../store/chatStore";
import { useNavigate } from "react-router-dom";
import type { Conversation } from "../@types/conversation";

interface MessageButtonInterface{
    recieverUser:user;
    className?:string;
    children:React.ReactNode;
    variant?:"default" | "outline" | "destructive" | "secondary" | "ghost" | "link" | null;
    disabled?:boolean;
}

const MessageButton =({recieverUser,className,children,variant,disabled}:MessageButtonInterface)=>{
    const {authUser}=useAuthStore();
    const {conversations,setActiveConversation,addConversation,getMessages,setMessages}=useChatStore();
    const navigate =useNavigate();

    const handleSendMessage=()=>{
        if(disabled){
            return;
        }
        const conversation =conversations.find((c)=>c.participants.some((p)=>p.user_id===recieverUser.id));

        if(conversation){
            setActiveConversation(conversation);
            getMessages(conversation.id);
            if(authUser?.role == 'student') navigate("/marketplace/chat");
            if(authUser?.role == 'teacher') navigate("/dashboard/chat");
            return;
        }
        
        const newConversationId=-recieverUser.id;
        
        const newConversation:Conversation={
            id:newConversationId,
            type:"direct",
            participants:[
                {
                    id:0,
                    user_id:authUser!.id,
                    user:{
                        id:authUser!.id,
                        name:authUser!.name,
                        email:authUser!.email,
                        avatar_url:authUser!.avatar_url,
                        role:authUser!.role as "teacher" | "student"
                    }
                },
                {
                    id:1,
                    user_id:recieverUser.id,
                    user:{
                        id:recieverUser.id,
                        name:recieverUser.name,
                        email:recieverUser.email,
                        avatar_url:recieverUser.avatar_url,
                        role:recieverUser.role as "teacher" | "student"
                    }
                }
            ]
        }
        setActiveConversation(newConversation);
        setMessages([]);
        addConversation(newConversation);
        if(authUser?.role == 'student') navigate("/marketplace/chat");
        if(authUser?.role == 'teacher') navigate("/dashboard/chat");
    }

    return(
        <Button 
            variant={variant}
            onClick={handleSendMessage}
            className={`cursor-pointer ${className}`}
            disabled={disabled}
        >
            {children}
        </Button>
    )
}

export default MessageButton;