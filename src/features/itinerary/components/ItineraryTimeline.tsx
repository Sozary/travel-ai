import { useEffect, useState, useRef } from "react";
import { Day } from "../types";
import { DaySelector } from "./DaySelector";
import ActivityCard from "./ActivityCard";

interface ItineraryTimelineProps {
    days: Day[];
    onActivityChange: (location: string) => void;
    fetchingMoreDays: boolean;
    loadingLocations: { [key: string]: boolean };
    setSelectedMapDay: (day: number) => void;
}

export const ItineraryTimeline = ({ days, onActivityChange, fetchingMoreDays, loadingLocations, setSelectedMapDay }: ItineraryTimelineProps) => {
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
    const activityRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        setSelectedMapDay(selectedDay);
    }, [selectedDay, setSelectedMapDay]);

    useEffect(() => {
        if (days.length > 0 && !days.some(d => d.day === selectedDay)) {
            setSelectedDay(days[0].day); // Only set if the selected day no longer exists
        }
    }, [days, selectedDay]);


    const currentDay = days.find(day => day.day === selectedDay);

    return (
        <div className="bg-white rounded-2xl py-[15px]">
            {/* Day Selector with shadow */}
            <div className="shadow-md">
                <DaySelector days={days} selectedDay={selectedDay} onDaySelect={setSelectedDay} fetchingMoreDays={fetchingMoreDays} />
            </div>

            {/* Activities */}
            <div className="p-4 bg-[#F9FAFB] overflow-x-auto pb-2 flex space-x-4">
                {currentDay?.activities.map((activity, index) => {
                    const activityKey = `${activity.name} ${activity.location}`;
                    const isLoading = loadingLocations[activityKey] ?? true;


                    return <div
                        key={index}
                        onClick={() => {
                            if (!isLoading) {
                                if (selectedActivity === activityKey) {
                                    setSelectedActivity(null);
                                    onActivityChange("");
                                } else {
                                    setSelectedActivity(activityKey);
                                    onActivityChange(activityKey);
                                }
                            }
                        }}
                        className={`flex-none w-[275px] transition-colors duration-300 cursor-pointer rounded-xl 
                            ${selectedActivity === activityKey ? "bg-blue-100" : "bg-white"}`}
                        ref={(el) => {
                            activityRefs.current[index] = el;
                        }}
                    >
                        <ActivityCard
                            loading={isLoading}
                            selected={selectedActivity === activityKey}
                            activity={activity}
                            isLast={index === currentDay.activities.length - 1}
                        />
                    </div>
                }

                )}
            </div>
        </div>
    );
};
