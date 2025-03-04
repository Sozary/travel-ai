import { useEffect, useState } from "react";
import { Day } from "../types";
import { DaySelector } from "./DaySelector";
import ActivityCard from "./ActivityCard";

interface ItineraryTimelineProps {
    days: Day[];
    onActivitySelect: (location: string) => void;
    

}

export const ItineraryTimeline = ({ days, onActivitySelect }: ItineraryTimelineProps) => {
    const [selectedDay, setSelectedDay] = useState<number>(1);

    useEffect(() => {
        if (days.length > 0) {
            setSelectedDay(days[0].day);
        }
    }, [days]);

    const currentDay = days.find(day => day.day === selectedDay);

    return (
        <div className="bg-white rounded-2xl py-[15px]">
            {/* Day Selector with shadow */}
            <div className="shadow-md">
                <DaySelector
                    days={days}
                    selectedDay={selectedDay}
                    onDaySelect={setSelectedDay}
                />
            </div>

            {/* Activities */}
            <div className="p-4 bg-[#F9FAFB]">
                <div className="flex space-x-4 overflow-x-auto pb-2">
                    {currentDay?.activities.map((activity, index) => (
                        <div key={index} className="flex-none w-[275px]" onClick={() => onActivitySelect(activity.location)}>
                            <ActivityCard
                                activity={activity}
                                isLast={index === currentDay.activities.length - 1}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}; 