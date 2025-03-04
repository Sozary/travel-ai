import { useState } from "react";
import { ItineraryTimeline } from "../../itinerary/components/ItineraryTimeline";

// Test data for the timeline
const testData = {
    "days": [
        {
            "day": 1,
            "activities": [
                { "name": "Luxembourg Gardens", "location": "Luxembourg Gardens, Paris, France", "transport_to_next": "Walking" },
                { "name": "Sainte-Chapelle", "location": "Sainte-Chapelle, Paris, France", "transport_to_next": "Metro" },
                { "name": "Place Dauphine", "location": "Place Dauphine, Paris, France", "transport_to_next": "Walking" }
            ]
        },
        {
            "day": 2,
            "activities": [
                { "name": "Montmartre", "location": "Montmartre, Paris, France", "transport_to_next": "Metro" },
                { "name": "Basilica of the Sacré-Cœur", "location": "Basilica of the Sacré-Cœur, Paris, France", "transport_to_next": "Walking" },
                { "name": "Place du Tertre", "location": "Place du Tertre, Paris, France", "transport_to_next": "Walking" }
            ]
        },
        {
            "day": 3,
            "activities": [
                { "name": "Rodin Museum", "location": "Rodin Museum, Paris, France", "transport_to_next": "Metro" },
                { "name": "Les Invalides", "location": "Les Invalides, Paris, France", "transport_to_next": "Walking" },
                { "name": "Musée d'Orsay", "location": "Musée d'Orsay, Paris, France", "transport_to_next": "Walking" }
            ]
        },
        {
            "day": 4,
            "activities": [
                { "name": "Seine River Cruise", "location": "Seine River, Paris, France", "transport_to_next": "Walking" },
                { "name": "Ile de la Cité", "location": "Ile de la Cité, Paris, France", "transport_to_next": "Walking" },
                { "name": "Latin Quarter", "location": "Latin Quarter, Paris, France", "transport_to_next": "Walking" }
            ]
        },
        {
            "day": 5,
            "activities": [
                { "name": "Parc des Buttes-Chaumont", "location": "Parc des Buttes-Chaumont, Paris, France", "transport_to_next": "Metro" },
                { "name": "Canal Saint-Martin", "location": "Canal Saint-Martin, Paris, France", "transport_to_next": "Walking" }
            ]
        }
    ],
    "total_budget": "2000 euros",
    "transportation": ["Metro", "Walking"],
    "accommodation": "Budget hotel"
};

export const Prompt = () => {
    const [prompt, setPrompt] = useState("");

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
                <ItineraryTimeline days={testData.days} />
            </div>
            <div className="p-4 border-t">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your dream trip..."
                        className="flex-1 p-2 border rounded"
                    />
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
}; 