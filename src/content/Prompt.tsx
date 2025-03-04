'use client'

import { useState, useEffect, useRef } from 'react';
import clsx from "clsx";
import Search from "../assets/Search";
import Mountain from "../assets/trip-categories/Mountain";
import Relaxation from "../assets/trip-categories/Relaxation";
import Backpack from "../assets/trip-categories/Backpack";
import Family from "../assets/trip-categories/Family";
import Romantic from "../assets/trip-categories/Romantic";
import toast from "react-hot-toast";

interface Day {
    day: number;
    city: string;
    activities: string[];
    transport: string;
}

const API_URL = "http://localhost:8000/generate-itinerary/";

const Prompt = () => {
    const [selectedTripKind, setSelectedTripKind] = useState<string | null>(null);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [days, setDays] = useState<Day[]>([]);
    const bufferRef = useRef("");
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            bufferRef.current = "";
        };
    }, []);

    const tripKind = [
        { label: "Adventure", value: "adventure", icon: <Mountain color="#3662e3" size={24} /> },
        { label: "Relaxation", value: "relax", icon: <Relaxation color="#3662e3" size={24} /> },
        { label: "Backpacking", value: "backpacking", icon: <Backpack color="#3662e3" size={24} /> },
        { label: "Family", value: "family", icon: <Family color="#3662e3" size={24} /> },
        { label: "Romantic", value: "romantic", icon: <Romantic color="#3662e3" size={24} /> },
    ];

    const fetchItinerary = async () => {
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
        bufferRef.current = "";

        try {
            const response = await fetch(
                `${API_URL}?destination=${encodeURIComponent(prompt)}&trip_type=${selectedTripKind}`,
                { method: "GET", headers: { "Accept": "text/event-stream" } }
            );

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                bufferRef.current += decoder.decode(value, { stream: true });

                try {
                    // Try to find complete day objects in the buffer
                    const dayMatches = bufferRef.current.match(/\{\s*"day":\s*\d+,\s*"city":\s*"[^"]+",\s*"activities":\s*\[[^\]]+\],\s*"transport":\s*"[^"]+"\s*\}/g);

                    if (dayMatches) {
                        for (const match of dayMatches) {
                            const day = JSON.parse(match);
                            console.log("New day received:", day);
                            setDays(prev => {
                                // Only add if this day doesn't already exist
                                if (!prev.find(d => d.day === day.day)) {
                                    return [...prev, day].sort((a, b) => a.day - b.day);
                                }
                                return prev;
                            });
                            // Remove the processed day from buffer
                            bufferRef.current = bufferRef.current.replace(match, "");
                        }
                    }
                } catch {
                    // If JSON parsing fails, continue accumulating data
                    console.log("Waiting for more data...");
                }
            }
        } catch (error) {
            console.error("Error fetching itinerary:", error);
            toast.error("Failed to generate itinerary");
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    return (
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
                    onClick={fetchItinerary}
                />
            </div>
            <div className="flex gap-[10px] mt-[10px] overflow-x-auto">
                {tripKind.map((item) => (
                    <div
                        key={item.value}
                        className={clsx("flex items-center gap-[8px] rounded-full p-[10px] cursor-pointer transition", {
                            "bg-[#dee9fc]": selectedTripKind === item.value,
                            "bg-white": selectedTripKind !== item.value
                        })}
                        onClick={() => {
                            setSelectedTripKind(item.value);
                            if (prompt) {
                                fetchItinerary();
                            }
                        }}
                    >
                        {item.icon}
                        <label className="text-[#3662e3] text-[14px] font-medium">{item.label}</label>
                    </div>
                ))}
            </div>

            {/* Show loading state */}
            {loading && <p className="mt-4 text-gray-500">Generating itinerary...</p>}

            {/* Display days as they come in */}
            {days.length > 0 && (
                <div className="mt-4 p-4 border rounded">
                    <h2 className="text-xl font-semibold">Your Itinerary</h2>
                    {days.map((day) => (
                        <div key={day.day} className="mt-2 p-2 border rounded bg-gray-100">
                            <h3 className="font-bold">Day {day.day}: {day.city}</h3>
                            <ul className="list-disc pl-5">
                                {day.activities.map((activity, idx) => (
                                    <li key={idx}>{activity}</li>
                                ))}
                            </ul>
                            <p className="text-gray-500">Transport: {day.transport}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Prompt;
