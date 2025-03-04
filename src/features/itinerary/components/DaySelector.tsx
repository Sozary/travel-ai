import { Day } from "../types";

interface DaySelectorProps {
    days: Day[];
    selectedDay: number;
    onDaySelect: (day: number) => void;
}

export const DaySelector = ({ days, selectedDay, onDaySelect }: DaySelectorProps) => {
    return (
        <div className="w-full border-b border-gray-100">
            <div className="flex space-x-2 overflow-x-auto pb-2 px-[15px]">
                {days.map((day) => (
                    <button
                        key={day.day}
                        onClick={() => onDaySelect(day.day)}
                        className={`px-4 py-2 cursor-pointer rounded-full text-sm font-medium whitespace-nowrap transition-all 
                            ${selectedDay === day.day
                                ? 'bg-[#3662e3] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Day {day.day}
                    </button>
                ))}
            </div>
        </div>
    );
}; 