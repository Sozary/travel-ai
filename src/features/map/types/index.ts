import { LatLngTuple } from "leaflet";

export interface Activity {
	name: string;
	location: string;
	transport_to_next: string;
}

export interface DayItinerary {
	day: number;
	activities: Activity[];
}

export interface MapItineraryProps {
	itinerary: DayItinerary[];
}

export interface ActivityCoordinates {
	[key: string]: LatLngTuple;
}
