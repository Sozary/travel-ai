import { LatLngTuple } from "leaflet";
import { GeocodingProvider } from "../types";

export class OpenStreetMapProvider implements GeocodingProvider {
	private coordinatesCache: Map<string, LatLngTuple>;
	private failedLocations: Set<string>;

	constructor() {
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

		const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
			location
		)}`;

		try {
			const response = await fetch(url);
			const data = await response.json();

			if (data.length > 0) {
				const coords: LatLngTuple = [
					parseFloat(data[0].lat),
					parseFloat(data[0].lon),
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
