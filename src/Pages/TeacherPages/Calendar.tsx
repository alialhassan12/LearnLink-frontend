import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCalendarStore } from "../../store/calendarStore";
import { useEffect } from "react";

export default function Calendar() {
    const {isGettingTeacherEvents,getTeacherEvents,teacherEvents}=useCalendarStore();

    useEffect(()=>{
        getTeacherEvents();
    },[]);

    const events=teacherEvents.map((event)=>{
        return{
            title:event.subject,
            start:new Date(`${event.scheduled_date}T${event.scheduled_time}`).toISOString(),
        }
    });

    if(isGettingTeacherEvents){
        return <CalendarSkeleton/>;
    }

    return (
        <div>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                nowIndicator={true}
                validRange={{
                    start: new Date().toISOString().split("T")[0],
                }}
                eventClick={(info)=>{
                    alert(info.event.title);
                }}
                events={events}
            />
        </div>
    );
}

const CalendarSkeleton=()=>{
    return(
        <div className="flex items-center justify-center h-screen">
            <div className="text-xl font-medium">Loading Your Schedule...</div>
        </div>
    );
}