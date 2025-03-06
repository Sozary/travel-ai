'use client'

import { useState, useEffect, useRef } from 'react';
import clsx from "clsx";
import Search from "../../../shared/assets/icons/Search";
import { Activity, Day } from "../types/itinerary";
import { fetchItinerary } from "../services/itineraryService";
import { TripTypeSelector } from "./TripTypeSelector";
import { ItineraryTimeline } from "./ItineraryTimeline";
import toast from "react-hot-toast";
import { ItineraryMap } from "../../map/components/ItineraryMap";

const Prompt = () => {
    const [selectedTripKind, setSelectedTripKind] = useState<string | null>(null);
    const [prompt, setPrompt] = useState("");
    const [fetchingMoreDays, setFetchingMoreDays] = useState(false);
    const [loading, setLoading] = useState(false);
    const [days, setDays] = useState<Day[]>([]);
    const isMounted = useRef(true);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [loadingLocations, setLoadingLocations] = useState<{ [key: string]: boolean }>({});


    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const handleActivityReceived = (activity: Activity, dayNumber: number) => {
        if (!isMounted.current) return;

        setDays(prevDays => {
            const updatedDays = prevDays.map(day => {
                if (day.day === dayNumber) {
                    return {
                        ...day,
                        activities: [...day.activities, activity] // Append activity immediately
                    };
                }
                return day;
            });

            // If the day doesn't exist yet, add it
            if (!updatedDays.find(d => d.day === dayNumber)) {
                updatedDays.push({ day: dayNumber, activities: [activity], city: "", transport: "" });
            }

            return updatedDays.sort((a, b) => a.day - b.day);
        });
    };

    const handleDayReceived = (dayNumber: number) => {
        setDays(prevDays => {
            if (!prevDays.some(d => d.day === dayNumber)) {
                return [...prevDays, { day: dayNumber, activities: [], city: "", transport: "" }];
            }
            return prevDays;
        });
    };

    const [apiKey, setApiKey] = useState<string>('');

    useEffect(() => {
        const storedKey = localStorage.getItem("openai_api_key");
        if (storedKey) {
            setApiKey(storedKey);
        } else {
            alert("OpenAI API Key is required to generate itinerary, please reload");
        }
    }, []);
    const handleFetchItinerary = async () => {
        if (!prompt) {
            toast.error("Please write about your trip first");
            return;
        }
        if (!selectedTripKind) {
            toast.error("Please select a trip type");
            return;
        }

        setLoading(true);
        setFetchingMoreDays(true);
        setDays([]);

        try {
            await fetchItinerary(prompt, selectedTripKind, apiKey, handleActivityReceived, handleDayReceived);
        } catch (error) {
            console.error("Error fetching itinerary:", error);
            toast.error("Failed to generate itinerary");
        } finally {
            if (isMounted.current) {
                setLoading(false);
                setFetchingMoreDays(false);
            }
        }
    };

    return (
        <div className="flex flex-col">
            <div className="px-[15px] py-[20px]">
                <div className="relative">
                    <textarea
                        name="prompt"
                        placeholder="Tell me about the best places to visit in Asia..."
                        className="w-full border border-[#E2E8F0] rounded-[8px] p-[10px] pr-[40px] bg-white resize-none overflow-hidden"
                        value={prompt}
                        onChange={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                            setPrompt(e.target.value);
                        }}
                        rows={2}
                    />
                    <Search
                        color="#3662e3"
                        size={24}
                        className={clsx("absolute right-[15px] top-1/2 -translate-y-1/2 cursor-pointer transition", {
                            "scale-0": !prompt,
                            "scale-100": prompt
                        })}
                        onClick={handleFetchItinerary}
                    />
                </div>

                <TripTypeSelector
                    selectedTripKind={selectedTripKind}
                    onTripTypeSelect={setSelectedTripKind}
                />

                {/* Show loading state */}
                {loading && <p className="mt-4 text-gray-500">Generating itinerary...</p>}
            </div>

            {/* Map takes full width */}
            {days.length > 0 && (
                <div className="w-full">
                    <ItineraryMap selectedDay={selectedDay} days={days} selectedLocation={selectedLocation} setLoadingLocations={setLoadingLocations} />
                </div>
            )}
            {/* Content with padding */}
            {/* Always show the timeline */}
            <ItineraryTimeline days={days} onActivityChange={setSelectedLocation} fetchingMoreDays={fetchingMoreDays} loadingLocations={loadingLocations} setSelectedMapDay={setSelectedDay} />
        </div>
    );
};

export default Prompt;

