import { Activity } from "../types";
import Location from "../icons/Location";
import Arrow from "../icons/Arrow";

interface ActivityCardProps {
    activity: Activity;
    isLast: boolean;
    selected: boolean;
}

const ActivityCard = ({ activity, isLast, selected }: ActivityCardProps) => {
    return (
        <div className={`rounded-xl p-4 border border-gray-100 h-[150px] flex flex-col ${selected ? "bg-blue-100" : "bg-white "}`}>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                    <Location color="#3662e3" size={15} />
                    <h3 className="font-medium text-gray-900">{activity.name}</h3>
                </div>
                <div className="flex flex-col gap-1 bg-[#f3f4f6] text-[#4d6255] text-sm p-2 rounded-md font-medium">
                    <div>
                        Visit duration: {activity.duration}
                    </div>
                    <div>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`} className="transition-colors duration-300 hover:text-[#3662e3]" target="_blank">Address details here</a>
                    </div>
                </div>
            </div>

            {!isLast && activity.transport_to_next && (
                <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-500 flex items-center gap-1 font-medium">
                        <Arrow className="rotate-180" color="#6a7282" size={15} /> Next: {activity.transport_to_next} to the next activity
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityCard; 