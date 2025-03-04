import clsx from "clsx";
import Mountain from "../icons/Mountain";
import Relaxation from "../icons/Relaxation";
import Backpack from "../icons/Backpack";
import Family from "../icons/Family";
import Romantic from "../icons/Romantic";
import { TripType } from "../types/itinerary";

interface TripTypeSelectorProps {
    selectedTripKind: string | null;
    onTripTypeSelect: (value: string) => void;
}

const tripTypes: TripType[] = [
    { label: "Adventure", value: "adventure", icon: <Mountain color="#3662e3" size={24} /> },
    { label: "Relaxation", value: "relax", icon: <Relaxation color="#3662e3" size={24} /> },
    { label: "Backpacking", value: "backpacking", icon: <Backpack color="#3662e3" size={24} /> },
    { label: "Family", value: "family", icon: <Family color="#3662e3" size={24} /> },
    { label: "Romantic", value: "romantic", icon: <Romantic color="#3662e3" size={24} /> },
];

export const TripTypeSelector = ({ selectedTripKind, onTripTypeSelect }: TripTypeSelectorProps) => {
    return (
        <div className="flex gap-[10px] px-[10px] mt-[10px] overflow-x-auto">
            {tripTypes.map((item) => (
                <div
                    key={item.value}
                    className={clsx("flex items-center gap-[8px] rounded-full p-[10px] cursor-pointer transition", {
                        "bg-[#dee9fc]": selectedTripKind === item.value,
                        "bg-white": selectedTripKind !== item.value
                    })}
                    onClick={() => onTripTypeSelect(item.value)}
                >
                    {item.icon}
                    <label className="text-[#3662e3] text-[14px] font-medium">{item.label}</label>
                </div>
            ))}
        </div>
    );
}; 