import { LatLngTuple } from "leaflet";

export interface GeocodingProvider {
	fetchCoordinates(location: string): Promise<LatLngTuple | null>;
}

export interface QueuedLocation {
	location: string;
	timestamp: number;
}
