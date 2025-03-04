import { useEffect, useState, useRef } from "react";
import { Day } from "../types";
import { DaySelector } from "./DaySelector";
import ActivityCard from "./ActivityCard";

interface ItineraryTimelineProps {
    days: Day[];
    onActivityChange: (location: string) => void;
}

export const ItineraryTimeline = ({ days, onActivityChange }: ItineraryTimelineProps) => {
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [visibleActivity, setVisibleActivity] = useState<string | null>(null);
    const activityRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (days.length > 0) {
            setSelectedDay(days[0].day);
        }
    }, [days]);

    const currentDay = days.find(day => day.day === selectedDay);

    useEffect(() => {
        if (!currentDay) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const mostVisible = entries
                    .filter(entry => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (mostVisible) {
                    const index = activityRefs.current.findIndex(ref => ref === mostVisible.target);
                    if (index !== -1) {
                        const newVisibleLocation = currentDay.activities[index].location;
                        setVisibleActivity(newVisibleLocation);
                        onActivityChange(newVisibleLocation);
                    }
                }
            },
            { threshold: 0.6 } // At least 60% of the card should be visible to trigger
        );

        activityRefs.current.forEach(ref => ref && observer.observe(ref));

        return () => {
            activityRefs.current.forEach(ref => ref && observer.unobserve(ref));
        };
    }, [currentDay, onActivityChange]);

    return (
        <div className="bg-white rounded-2xl py-[15px]">
            {/* Day Selector with shadow */}
            <div className="shadow-md">
                <DaySelector days={days} selectedDay={selectedDay} onDaySelect={setSelectedDay} />
            </div>

            {/* Activities */}
            <div className="p-4 bg-[#F9FAFB] overflow-x-auto pb-2 flex space-x-4">
                {currentDay?.activities.map((activity, index) => (
                    <div
                        key={index}
                        className={`flex-none w-[275px] transition-colors duration-300  rounded-xl`}
                        ref={(el) => {
                            activityRefs.current[index] = el;
                        }}
                    >
                        <ActivityCard
                            selected={visibleActivity === activity.location}
                            activity={activity}
                            isLast={index === currentDay.activities.length - 1}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
