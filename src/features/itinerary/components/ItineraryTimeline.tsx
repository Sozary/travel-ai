import { useEffect, useState, useRef } from "react";
import { Day } from "../types";
import { DaySelector } from "./DaySelector";
import ActivityCard from "./ActivityCard";

interface ItineraryTimelineProps {
    days: Day[];
    onActivityChange: (location: string) => void;
    fetchingMoreDays: boolean;
    loadingLocations: { [key: string]: boolean };
}

export const ItineraryTimeline = ({ days, onActivityChange, fetchingMoreDays, loadingLocations }: ItineraryTimelineProps) => {
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
    const activityRefs = useRef<(HTMLDivElement | null)[]>([]);

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
                <DaySelector days={days} selectedDay={selectedDay} onDaySelect={setSelectedDay} fetchingMoreDays={fetchingMoreDays} />
            </div>

            {/* Activities */}
            <div className="p-4 bg-[#F9FAFB] overflow-x-auto pb-2 flex space-x-4">
                {currentDay?.activities.map((activity, index) => {
                    const isLoading = loadingLocations[activity.location] ?? true;

                    return <div
                        key={index}
                        onClick={() => {
                            if (!isLoading) {
                                if (selectedActivity === activity.location) {
                                    setSelectedActivity(null)
                                    onActivityChange("");
                                } else {
                                    setSelectedActivity(activity.location);
                                    onActivityChange(activity.location);
                                }
                            }
                        }}
                        className={`flex-none w-[275px] transition-colors duration-300 cursor-pointer rounded-xl`}
                        ref={(el) => {
                            activityRefs.current[index] = el;
                        }}
                    >
                        <ActivityCard
                            loading={loadingLocations[activity.location]}
                            selected={selectedActivity === activity.location}
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
