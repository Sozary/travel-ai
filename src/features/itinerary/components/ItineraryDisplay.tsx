import { Day } from "../types/itinerary";

interface ItineraryDisplayProps {
    days: Day[];
}

export const ItineraryDisplay = ({ days }: ItineraryDisplayProps) => {
    if (days.length === 0) return null;

    return (
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
    );
}; 