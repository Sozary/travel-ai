'use client'

import { useState, useEffect, useRef } from 'react';
import clsx from "clsx";
import Search from "../../../shared/assets/icons/Search";
import { Day } from "../types/itinerary";
import { fetchItinerary } from "../services/itineraryService";
import { TripTypeSelector } from "./TripTypeSelector";
import { ItineraryTimeline } from "./ItineraryTimeline";
import toast from "react-hot-toast";
import { ItineraryMap } from "../../map/components/ItineraryMap";
const testData = [
    {
        "day": 1,
        "activities": [
            { "name": "Luxembourg Gardens", "duration": "2 hours", "location": "Luxembourg Gardens, Paris, France", "transport_to_next": "Walking" },
            { "name": "Sainte-Chapelle", "duration": "1 hour", "location": "Sainte-Chapelle, Paris, France", "transport_to_next": "Metro" },
            { "name": "Place Dauphine", "duration": "1 hour", "location": "Place Dauphine, Paris, France", "transport_to_next": "Walking" }
        ]
    },
    {
        "day": 2,
        "activities": [
            { "name": "Montmartre", "duration": "1 hour", "location": "Montmartre, Paris, France", "transport_to_next": "Metro" },
            { "name": "Basilica of the Sacré-Cœur", "duration": "1 hour", "location": "Basilica of the Sacré-Cœur, Paris, France", "transport_to_next": "Walking" },
            { "name": "Place du Tertre", "duration": "1 hour", "location": "Place du Tertre, Paris, France", "transport_to_next": "Walking" }
        ]
    },
    {
        "day": 3,
        "activities": [
            { "name": "Rodin Museum", "duration": "1 hour", "location": "Rodin Museum, Paris, France", "transport_to_next": "Metro" },
            { "name": "Les Invalides", "duration": "1 hour", "location": "Les Invalides, Paris, France", "transport_to_next": "Walking" },
            { "name": "Musée d'Orsay", "duration": "1 hour", "location": "Musée d'Orsay, Paris, France", "transport_to_next": "Walking" }
        ]
    },
    {
        "day": 4,
        "activities": [
            { "name": "Seine River Cruise", "duration": "1 hour", "location": "Seine River, Paris, France", "transport_to_next": "Walking" },
            { "name": "Ile de la Cité", "duration": "1 hour", "location": "Ile de la Cité, Paris, France", "transport_to_next": "Walking" },
            { "name": "Latin Quarter", "duration": "1 hour", "location": "Latin Quarter, Paris, France", "transport_to_next": "Walking" }
        ]
    },
    {
        "day": 5,
        "activities": [
            { "name": "Parc des Buttes-Chaumont", "duration": "30 minutes", "location": "Parc des Buttes-Chaumont, Paris, France", "transport_to_next": "Metro" },
            { "name": "Canal Saint-Martin", "duration": "1 hour", "location": "Canal Saint-Martin, Paris, France", "transport_to_next": "Walking" }
        ]
    }
]

const Prompt = () => {
    const [selectedTripKind, setSelectedTripKind] = useState<string | null>(null);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [days, setDays] = useState<Day[]>([]);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const handleDayReceived = (day: Day) => {
        if (!isMounted.current) return;

        setDays(prev => {
            if (!prev.find(d => d.day === day.day)) {
                return [...prev, day].sort((a, b) => a.day - b.day);
            }
            return prev;
        });
    };

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
        setDays([]);

        try {
            await fetchItinerary(prompt, selectedTripKind, handleDayReceived);
        } catch (error) {
            console.error("Error fetching itinerary:", error);
            toast.error("Failed to generate itinerary");
        } finally {
            if (isMounted.current) setLoading(false);
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
                    <ItineraryMap days={days} />
                </div>
            )}
            {/* Content with padding */}
            {/* Always show the timeline */}
            <ItineraryTimeline days={testData} />
        </div>
    );
};

export default Prompt;

