import { Day } from "../types";
import { ItineraryTimeline } from "./ItineraryTimeline";

interface ItineraryDisplayProps {
    days: Day[];
}

export const ItineraryDisplay = ({ days }: ItineraryDisplayProps) => {
    if (days.length === 0) return null;

    return (
        <div className="mt-4">
            <ItineraryTimeline days={days} />
        </div>
    );
}; 