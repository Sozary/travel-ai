import { GeocodingProvider } from "./types";
import { MapsCoProvider } from "./providers/MapsCoProvider";
import { OpenStreetMapProvider } from "./providers/OpenStreetMapProvider";

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
