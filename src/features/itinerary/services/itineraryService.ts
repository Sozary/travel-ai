import toast from "react-hot-toast";
import { API_URL } from "../../../shared/constants/api";
import { Activity } from "../types/itinerary";

export const fetchItinerary = async (
	prompt: string,
	tripType: string,
	apiKey: string,
	onActivityReceived: (activity: Activity, dayNumber: number) => void,
	onDayReceived: (dayNumber: number) => void
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
			let currentDay: number | null = null;

			try {
				while (true) {
					const { value, done } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					buffer = buffer
						.replace(/```json/g, "")
						.replace(/```/g, "")
						.replace(/\[\s*,+\s*\]/g, "[]") // Fix empty arrays like [, , ]
						.replace(/,\s*([\]}])/g, "$1") // Remove trailing commas before ] or }
						.trim();

					const dayMatch = buffer.match(/"day":\s*(\d+),/);

					if (dayMatch) {
						currentDay = parseInt(dayMatch[1], 10);
						onDayReceived(currentDay);
						buffer = buffer.replace(dayMatch[0], "");
					}

					const activityMatches = buffer.match(
						/\{\s*"name":\s*".+?",\s*"location":\s*".+?",\s*"duration":\s*".+?",\s*"transport_to_next":\s*".+?"(?:,\s*"type":\s*".+?")?\s*\}/g
					);

					if (activityMatches && currentDay !== null) {
						for (const match of activityMatches) {
							try {
								const activity = JSON.parse(match);
								onActivityReceived(activity, currentDay);
								receivedData = true;
								buffer = buffer.replace(match, "");
							} catch (parseError) {
								console.error("Error parsing activity:", parseError);
							}
						}
					}
				}
			} finally {
				reader.releaseLock();
			}

			if (currentDay !== null) {
				onDayReceived(currentDay); // Remove day if no activities
			}

			try {
				const cleanedBuffer = buffer
					.replace(/```json/g, "")
					.replace(/^json/, "")
					.replace(/"days":\s*\[\s*(,\s*)*\]/g, '"days": []') // Fix empty day arrays
					.replace(/,\s*([\]}])/g, "$1") // Remove trailing commas before ] or }
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
