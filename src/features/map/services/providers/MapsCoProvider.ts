import { LatLngTuple } from "leaflet";
import { GeocodingProvider, QueuedLocation } from "../types";
import { OpenStreetMapProvider } from "./OpenStreetMapProvider";

export class MapsCoProvider implements GeocodingProvider {
	private apiKey: string;
	private rateLimitDelay: number;
	private lastFetchTime: number;
	private isProcessing: boolean;
	private locationQueue: QueuedLocation[];
	private coordinatesCache: Map<string, LatLngTuple>;
	private failedLocations: Set<string>;
	private osmProvider: OpenStreetMapProvider;
	private activeIntervals: Set<number>;

	constructor(apiKey: string, rateLimitDelay: number = 1000) {
		this.apiKey = apiKey;
		this.rateLimitDelay = rateLimitDelay;
		this.lastFetchTime = 0;
		this.isProcessing = false;
		this.locationQueue = [];
		this.coordinatesCache = new Map();
		this.failedLocations = new Set();
		this.osmProvider = new OpenStreetMapProvider();
		this.activeIntervals = new Set();
	}

	private cleanupInterval(interval: number) {
		clearInterval(interval);
		this.activeIntervals.delete(interval);
	}

	private async processQueue() {
		if (this.isProcessing || this.locationQueue.length === 0) return;

		this.isProcessing = true;

		while (this.locationQueue.length > 0) {
			const now = Date.now();
			const timeSinceLastFetch = now - this.lastFetchTime;

			if (timeSinceLastFetch < this.rateLimitDelay) {
				const waitTime = this.rateLimitDelay - timeSinceLastFetch;
				await new Promise((resolve) => setTimeout(resolve, waitTime));
			}

			// Get the most recent location from the queue
			const { location } = this.locationQueue.pop()!;

			// Skip if already cached or failed
			if (
				this.coordinatesCache.has(location) ||
				this.failedLocations.has(location)
			) {
				continue;
			}

			const coords = await this.fetchFromApi(location);
			if (coords) {
				this.coordinatesCache.set(location, coords);
			}
			this.lastFetchTime = Date.now();
		}
		this.isProcessing = false;
	}

	private async fetchFromApi(location: string): Promise<LatLngTuple | null> {
		const url = `https://geocode.maps.co/search?q=${encodeURIComponent(
			location
		)}&api_key=${this.apiKey}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();

			if (data.length > 0) {
				return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
			} else {
				// Try OpenStreetMap as fallback
				const osmCoords = await this.osmProvider.fetchCoordinates(location);
				if (osmCoords) {
					this.coordinatesCache.set(location, osmCoords);
					return osmCoords;
				}
				this.failedLocations.add(location);
				return null;
			}
		} catch {
			this.failedLocations.add(location);
			return null;
		}
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

		// Add to queue with current timestamp
		this.locationQueue.push({
			location,
			timestamp: Date.now(),
		});

		// Sort queue by timestamp (most recent first)
		this.locationQueue.sort((a, b) => b.timestamp - a.timestamp);

		// Start processing the queue
		this.processQueue();

		// Wait for the coordinates to be fetched
		return new Promise((resolve) => {
			const checkInterval = setInterval(() => {
				if (this.coordinatesCache.has(location)) {
					this.cleanupInterval(checkInterval);
					resolve(this.coordinatesCache.get(location) || null);
				} else if (this.failedLocations.has(location)) {
					this.cleanupInterval(checkInterval);
					resolve(null);
				}
			}, 100);

			this.activeIntervals.add(checkInterval);
		});
	}
}
