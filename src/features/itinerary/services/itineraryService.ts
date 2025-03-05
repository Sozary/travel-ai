import { API_URL } from "../../../shared/constants/api";
import { Day } from "../types/itinerary";

export const fetchItinerary = async (
	prompt: string,
	tripType: string,
	apiKey: string,
	onDayReceived: (day: Day) => void
): Promise<void> => {
	try {
		const response = await fetch(
			`${API_URL}?destination=${encodeURIComponent(
				prompt
			)}&trip_type=${tripType}&api_key=${apiKey}`,
			{ method: "GET", headers: { Accept: "text/event-stream" } }
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		if (!response.body) {
			throw new Error("No response body");
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = "";

		try {
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });

				// Try to find complete day objects in the buffer
				const dayMatches = buffer.match(
					/\{\s*"day":\s*\d+,\s*"activities":\s*\[[\s\S]*?\]\s*\}/g
				);

				if (dayMatches) {
					for (const match of dayMatches) {
						try {
							const day = JSON.parse(match);
							onDayReceived(day);
							buffer = buffer.replace(match, "");
						} catch (parseError) {
							console.error("Error parsing day:", parseError);
						}
					}
				}
			}
		} finally {
			reader.releaseLock();
		}
	} catch (error) {
		console.error("Error in fetchItinerary:", error);
		throw error;
	}
};
