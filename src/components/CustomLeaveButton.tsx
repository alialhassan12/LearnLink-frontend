import { LeaveIcon, useRoomContext } from "@livekit/components-react";
import { useLiveSessionStore } from "../store/liveSessionsStore";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

const CustomLeaveButton =({isTeacher,session_id}:{isTeacher:boolean,session_id:number})=>{
    const room=useRoomContext();
    const{endSession,isEndingSession}=useLiveSessionStore();
    
    const handleLeave=async()=>{
        await room.disconnect()
        if(isTeacher){
            endSession(session_id);
        }
    }

    return(
        <Button
            variant="destructive"  
            disabled={isEndingSession}
            onClick={handleLeave} 
        >
            {
                isTeacher ? (
                    isEndingSession?<Spinner/>:<LeaveIcon/>
                ):(
                    <LeaveIcon/>
                )
            }
            Leave
        </Button>
    );
}

export default CustomLeaveButton;
