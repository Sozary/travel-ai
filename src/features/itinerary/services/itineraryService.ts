import toast from "react-hot-toast";
import { API_URL } from "../../../shared/constants/api";
import { Day } from "../types/itinerary";

export const fetchItinerary = async (
	prompt: string,
	tripType: string,
	apiKey: string,
	onDayReceived: (day: Day) => void
): Promise<void> => {
	let startDay = 1;
	let continueFetching = true;
	while (continueFetching) {
		try {
			const response = await fetch(
				`${API_URL}?destination=${encodeURIComponent(
					prompt
				)}&trip_type=${tripType}&api_key=${apiKey}&start_day=${startDay}`,
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
			let receivedData = false; // Track if we receive any valid data

			try {
				while (true) {
					const { value, done } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					buffer = buffer
						.replace(/```json/g, "")
						.replace(/```/g, "")
						.trim();

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
								receivedData = true;
							} catch (parseError) {
								console.error("Error parsing day:", parseError);
							}
						}
					}
				}
			} finally {
				reader.releaseLock();
			}
			try {
				const cleanedBuffer = buffer
					.replace(/```json/g, "")
					.replace(/^json/, "")
					.replace(/"days":\s*\[\s*(,\s*)*\]/g, '"days": []')
					.replace(/```/g, "")
					.trim();
				const responseJson = JSON.parse(cleanedBuffer);

				if (responseJson.continue) {
					startDay = responseJson.next_start_day;
					continueFetching = true;
				} else {
					continueFetching = false;
				}
			} catch (parseError) {
				console.error("Error parsing final response JSON:", parseError);
			}

			if (!receivedData) {
				toast.error(
					"An error occurred while generating the itinerary.\nMost likely the API key is invalid.\nWe cleared the one you had inputted. Please reload the page and try again."
				);
				localStorage.removeItem("openai_api_key");
			}
		} catch (error) {
			console.error("Error in fetchItinerary:", error);
			throw error;
		}
	}
};
