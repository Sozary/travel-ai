import { LatLngTuple } from "leaflet";
import { GeocodingProvider } from "../types";

export class GoogleMapProvider implements GeocodingProvider {
	private coordinatesCache: Map<string, LatLngTuple>;
	private failedLocations: Set<string>;
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
		this.coordinatesCache = new Map();
		this.failedLocations = new Set();
	}

	async fetchCoordinates(location: string): Promise<LatLngTuple | null> {
		// Check cache first
		if (this.coordinatesCache.has(location)) {
			return this.coordinatesCache.get(location) || null;
		}

		// Don't retry failed locations
		if (this.failedLocations.has(location)) {
			return null;
		}

		const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
			location
		)}&key=${this.apiKey}`;

		try {
			const response = await fetch(url);
			const data = await response.json();

			if (data.status === "OK" && data.results.length > 0) {
				const coords: LatLngTuple = [
					parseFloat(data.results[0].geometry.location.lat),
					parseFloat(data.results[0].geometry.location.lng),
				];
				this.coordinatesCache.set(location, coords);
				return coords;
			} else {
				this.failedLocations.add(location);
				return null;
			}
		} catch {
			this.failedLocations.add(location);
			return null;
		}
	}
}
