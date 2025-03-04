import { LatLngTuple } from "leaflet";

export interface GeocodingProvider {
	fetchCoordinates(location: string): Promise<LatLngTuple | null>;
}

interface QueuedLocation {
	location: string;
	timestamp: number;
}

class MapsCoProvider implements GeocodingProvider {
	private apiKey: string;
	private rateLimitDelay: number;
	private lastFetchTime: number;
	private isProcessing: boolean;
	private locationQueue: QueuedLocation[];
	private coordinatesCache: Map<string, LatLngTuple>;
	private failedLocations: Set<string>;
	private osmProvider: OpenStreetMapProvider;

	constructor(apiKey: string, rateLimitDelay: number = 1000) {
		this.apiKey = apiKey;
		this.rateLimitDelay = rateLimitDelay;
		this.lastFetchTime = 0;
		this.isProcessing = false;
		this.locationQueue = [];
		this.coordinatesCache = new Map();
		this.failedLocations = new Set();
		this.osmProvider = new OpenStreetMapProvider();
	}

	private logQueueState() {
		console.log("Current queue state:", {
			queueLength: this.locationQueue.length,
			isProcessing: this.isProcessing,
			locations: this.locationQueue.map((loc) => ({
				location: loc.location,
				timestamp: new Date(loc.timestamp).toISOString(),
			})),
		});
	}

	private async processQueue() {
		if (this.isProcessing || this.locationQueue.length === 0) return;

		this.isProcessing = true;
		console.log("Starting queue processing");
		this.logQueueState();

		while (this.locationQueue.length > 0) {
			const now = Date.now();
			const timeSinceLastFetch = now - this.lastFetchTime;

			if (timeSinceLastFetch < this.rateLimitDelay) {
				const waitTime = this.rateLimitDelay - timeSinceLastFetch;
				console.log(`Rate limiting: waiting ${waitTime}ms`);
				await new Promise((resolve) => setTimeout(resolve, waitTime));
			}

			// Get the most recent location from the queue
			const { location } = this.locationQueue.pop()!;
			console.log(`Processing location: ${location}`);

			// Skip if already cached or failed
			if (
				this.coordinatesCache.has(location) ||
				this.failedLocations.has(location)
			) {
				console.log(
					`Skipping ${location} - already ${
						this.coordinatesCache.has(location) ? "cached" : "failed"
					}`
				);
				continue;
			}

			const coords = await this.fetchFromApi(location);
			if (coords) {
				this.coordinatesCache.set(location, coords);
				console.log(`Successfully cached coordinates for ${location}:`, coords);
			}
			this.lastFetchTime = Date.now();

			this.logQueueState();
		}
		this.isProcessing = false;
		console.log("Queue processing completed");
	}

	private async fetchFromApi(location: string): Promise<LatLngTuple | null> {
		const url = `https://geocode.maps.co/search?q=${encodeURIComponent(
			location
		)}&api_key=${this.apiKey}`;

		try {
			console.log(`Fetching coordinates for ${location} from maps.co`);
			const response = await fetch(url);
			const data = await response.json();

			if (data.length > 0) {
				return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
			} else {
				console.warn(
					`No coordinates found for ${location} with maps.co, trying OpenStreetMap`
				);
				// Try OpenStreetMap as fallback
				const osmCoords = await this.osmProvider.fetchCoordinates(location);
				if (osmCoords) {
					this.coordinatesCache.set(location, osmCoords);
					return osmCoords;
				}
				this.failedLocations.add(location);
				return null;
			}
		} catch (error) {
			console.error(`Error fetching coordinates for ${location}:`, error);
			this.failedLocations.add(location);
			return null;
		}
	}

	async fetchCoordinates(location: string): Promise<LatLngTuple | null> {
		// Check cache first
		if (this.coordinatesCache.has(location)) {
			console.log(`Using cached coordinates for ${location}`);
			return this.coordinatesCache.get(location) || null;
		}

		// Don't retry failed locations
		if (this.failedLocations.has(location)) {
			console.log(`Skipping failed location: ${location}`);
			return null;
		}

		// Add to queue with current timestamp
		this.locationQueue.push({
			location,
			timestamp: Date.now(),
		});

		// Sort queue by timestamp (most recent first)
		this.locationQueue.sort((a, b) => b.timestamp - a.timestamp);
		console.log(`Added ${location} to queue`);
		this.logQueueState();

		// Start processing the queue
		this.processQueue();

		// Wait for the coordinates to be fetched
		return new Promise((resolve) => {
			const checkInterval = setInterval(() => {
				if (this.coordinatesCache.has(location)) {
					clearInterval(checkInterval);
					console.log(`Coordinates ready for ${location}`);
					resolve(this.coordinatesCache.get(location) || null);
				} else if (this.failedLocations.has(location)) {
					clearInterval(checkInterval);
					console.log(`Location failed: ${location}`);
					resolve(null);
				}
			}, 100);
		});
	}
}

class OpenStreetMapProvider implements GeocodingProvider {
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
				console.warn(`No coordinates found for ${location}`);
				this.failedLocations.add(location);
				return null;
			}
		} catch (error) {
			console.error(`Error fetching coordinates for ${location}:`, error);
			this.failedLocations.add(location);
			return null;
		}
	}
}

// Create and export the geocoding service instance
const API_KEY = import.meta.env.VITE_MAPS_CO_API_KEY;
const PROVIDER = import.meta.env.VITE_GEOCODING_PROVIDER || "mapsco";

let geocodingService: GeocodingProvider;

switch (PROVIDER) {
	case "osm":
		geocodingService = new OpenStreetMapProvider();
		break;
	case "mapsco":
	default:
		if (!API_KEY) {
			console.error("Maps.co API key is not set in environment variables");
		}
		geocodingService = new MapsCoProvider(API_KEY);
}

export { geocodingService };
