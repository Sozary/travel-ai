import { API_URL } from "../constants/api";
import { Day } from "../types/itinerary";

export const fetchItinerary = async (
	prompt: string,
	tripType: string,
	onDayReceived: (day: Day) => void
): Promise<void> => {
	const response = await fetch(
		`${API_URL}?destination=${encodeURIComponent(
			prompt
		)}&trip_type=${tripType}`,
		{ method: "GET", headers: { Accept: "text/event-stream" } }
	);

	if (!response.body) throw new Error("No response body");

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";

	while (true) {
		const { value, done } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });

		try {
			// Try to find complete day objects in the buffer
			const dayMatches = buffer.match(
				/\{\s*"day":\s*\d+,\s*"city":\s*"[^"]+",\s*"activities":\s*\[[^\]]+\],\s*"transport":\s*"[^"]+"\s*\}/g
			);

			if (dayMatches) {
				for (const match of dayMatches) {
					const day = JSON.parse(match);
					console.log("New day received:", day);
					onDayReceived(day);
					// Remove the processed day from buffer
					buffer = buffer.replace(match, "");
				}
			}
		} catch {
			// If JSON parsing fails, continue accumulating data
			console.log("Waiting for more data...");
		}
	}
};
