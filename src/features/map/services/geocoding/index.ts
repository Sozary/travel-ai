import { GeocodingProvider } from "./types";
import { MapsCoProvider } from "./providers/MapsCoProvider";
import { OpenStreetMapProvider } from "./providers/OpenStreetMapProvider";
import { GoogleMapProvider } from "./providers/GoogleMapProvider";

const MAPS_CO_API_KEY = import.meta.env.VITE_MAPS_CO_API_KEY;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const PROVIDER = import.meta.env.VITE_GEOCODING_PROVIDER || "google";

let geocodingService: GeocodingProvider;

switch (PROVIDER) {
	case "mapsco":
		if (!MAPS_CO_API_KEY) {
			console.error("Maps.co API key is not set in environment variables");
		} else {
			geocodingService = new MapsCoProvider(MAPS_CO_API_KEY);
		}
		break;
	case "google":
		if (!GOOGLE_API_KEY) {
			console.error("Google API key is not set in environment variables");
		} else {
			geocodingService = new GoogleMapProvider(GOOGLE_API_KEY);
		}
		break;
	case "osm":
	default:
		geocodingService = new OpenStreetMapProvider();
		break;
}

export { geocodingService };
