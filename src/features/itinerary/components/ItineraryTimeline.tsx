import { useState } from "react";
import { Day } from "../types";
import { DaySelector } from "./DaySelector";
import ActivityCard from "./ActivityCard";

interface ItineraryTimelineProps {
    days: Day[];
}

export const ItineraryTimeline = ({ days }: ItineraryTimelineProps) => {
    const [selectedDay, setSelectedDay] = useState(1);
    const currentDay = days.find(day => day.day === selectedDay);
    console.log(days);

    return (
        <div className="bg-white rounded-2xl">
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
                        <div key={index} className="flex-none w-[275px]">
                            <ActivityCard
                                activity={activity}
                                isLast={index === currentDay.activities.length - 1}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}; 