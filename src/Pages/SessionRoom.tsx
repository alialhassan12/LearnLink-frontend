import {
    LiveKitRoom,
    VideoConference,
    RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import CustomLeaveButton from "../components/CustomLeaveButton";

function SessionRoom({
    token,
    serverUrl,
    session_id,
}: {
    token: string;
    serverUrl: string;
    session_id:number;
}) {
    
    const {authUser}=useAuthStore();
    const navigate = useNavigate();
    const isTeacher=authUser?.role==="teacher";


    if (!token || !serverUrl) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
                <p className="text-muted-foreground text-lg">Waiting for session credentials...</p>
                <button 
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col">
            <LiveKitRoom
                token={token}
                serverUrl={serverUrl}
                connect={true}
                audio={true}
                video={true}
                data-lk-theme="default"
                className=""
                onDisconnected={() => {
                    navigate(-1);
                }}
            >
                <VideoConference />
                <RoomAudioRenderer />
                <div className="absolute top-4 left-4 z-50 md:top-auto md:bottom-4 md:left-4 md:right-auto">
                    <CustomLeaveButton isTeacher={isTeacher} session_id={session_id}/>
                </div>
            </LiveKitRoom>
        </div>
    );
}

export default SessionRoom;