import clsx from "clsx";
import Search from "../assets/Search";
import { useState } from "react";
import Mountain from "../assets/trip-categories/Mountain";
import Relaxation from "../assets/trip-categories/Relaxation";
import Backpack from "../assets/trip-categories/Backpack";
import Family from "../assets/trip-categories/Family";
import Romantic from "../assets/trip-categories/Romantic";

const Prompt = () => {
    const [selectedTripKind, setSelectedTripKind] = useState<string | null>(null);
    const [prompt, setPrompt] = useState("");
    const tripKind = [{
        label: "Adventure",
        value: 'adventure',
        icon: <Mountain color="#3662e3" size={24} />
    }, {
        label: "Relaxation",
        value: 'relax',
        icon: <Relaxation color="#3662e3" size={24} />
    }, {
        label: "Backpacking",
        value: 'backpacking',
        icon: <Backpack color="#3662e3" size={24} />
    }, {
        label: "Family",
        value: 'family',
        icon: <Family color="#3662e3" size={24} />
    }, {
        label: "Romantic",
        value: 'romantic',
        icon: <Romantic color="#3662e3" size={24} />
    }];
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
                />
            </div>
            <div className="flex gap-[10px] mt-[10px] overflow-x-auto">
                {tripKind.map((item) => (
                    <div key={item.value} className={clsx("flex items-center gap-[8px] rounded-full p-[10px] cursor-pointer transition", {
                        "bg-[#dee9fc]": selectedTripKind === item.value,
                        "bg-white": selectedTripKind !== item.value
                    })} onClick={() => setSelectedTripKind(item.value)}>
                        {item.icon}
                        <label className="text-[#3662e3] text-[14px] font-medium">{item.label}</label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Prompt;