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

const API_URL = "http://localhost:8000/generate-itinerary/";

const Prompt = () => {
    const [selectedTripKind, setSelectedTripKind] = useState<string | null>(null);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [streamedData, setStreamedData] = useState<string>(""); // Raw streamed data
    const isMounted = useRef(true); // Prevents updates after unmount

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false }; // Cleanup function
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
        setStreamedData(""); // Clear previous output

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

                const chunk = decoder.decode(value, { stream: true });

                if (!isMounted.current) return;

                setStreamedData(prev => prev + chunk); // Append new chunk
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
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                        setPrompt(e.target.value);
                    }}
                    rows={2}
                />
                <Search
                    color="#3662e3"
                    size={24}
                    className={clsx(
                        "absolute right-[15px] top-1/2 -translate-y-1/2 cursor-pointer transition",
                        { "scale-0": !prompt, "scale-100": prompt }
                    )}
                    onClick={fetchItinerary}
                />
            </div>
            <div className="flex gap-[10px] mt-[10px] overflow-x-auto">
                {tripKind.map((item) => (
                    <div
                        key={item.value}
                        className={clsx(
                            "flex items-center gap-[8px] rounded-full p-[10px] cursor-pointer transition",
                            { "bg-[#dee9fc]": selectedTripKind === item.value, "bg-white": selectedTripKind !== item.value }
                        )}
                        onClick={() => {
                            setSelectedTripKind(item.value);
                            if (prompt) fetchItinerary();
                        }}
                    >
                        {item.icon}
                        <label className="text-[#3662e3] text-[14px] font-medium">{item.label}</label>
                    </div>
                ))}
            </div>

            {/* Show loading state */}
            {loading && <p className="mt-4 text-gray-500">Generating itinerary...</p>}

            {/* Display streamed raw output */}
            {streamedData && (
                <div className="mt-4 p-4 border rounded">
                    <h2 className="text-xl font-semibold">Raw Response:</h2>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{streamedData}</pre>
                </div>
            )}
        </div>
    );
};

export default Prompt;
