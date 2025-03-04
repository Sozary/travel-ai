"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngTuple } from "leaflet";

// Define types
interface Activity {
    name: string;
    location: string;
    transport_to_next: string;
}

export interface DayItinerary {
    day: number;
    activities: Activity[];
}

interface ItineraryProps {
    itinerary: DayItinerary[];
}

// Function to fetch coordinates from OpenStreetMap (Nominatim API)
const fetchCoordinates = async (location: string): Promise<LatLngTuple | null> => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        } else {
            console.warn(`No coordinates found for ${location}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching coordinates for ${location}:`, error);
        return null;
    }
};

const MapItinerary = ({ itinerary }: ItineraryProps) => {
    const [activityCoordinates, setActivityCoordinates] = useState<Record<string, LatLngTuple>>({});

    useEffect(() => {
        const fetchAllCoordinates = async () => {
            const newCoordinates: Record<string, LatLngTuple> = {};

            for (const day of itinerary) {
                for (const activity of day.activities) {
                    if (!activityCoordinates[activity.location]) {
                        const coords = await fetchCoordinates(activity.location);
                        if (coords) {
                            newCoordinates[activity.location] = coords;
                        }
                    }
                }
            }
            setActivityCoordinates((prev) => ({ ...prev, ...newCoordinates }));
        };

        fetchAllCoordinates();
    }, [itinerary]);

    // Extract coordinates in sequence for Polyline
    const route: LatLngTuple[] = itinerary
        .flatMap((day) =>
            day.activities
                .map((activity) => activityCoordinates[activity.location])
                .filter((coord) => coord !== undefined)
        ) as LatLngTuple[];

    return (
        <MapContainer center={[48.8566, 2.3522]} zoom={12} style={{ height: "500px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {itinerary.map((day) =>
                day.activities.map((activity, idx) => {
                    const position = activityCoordinates[activity.location];
                    if (!position) return null;

                    return (
                        <Marker key={`${day.day}-${idx}`} position={position}>
                            <Popup>
                                <strong>{activity.name}</strong> <br />
                                <em>{activity.location}</em> <br />
                                {idx < day.activities.length - 1 && (
                                    <>
                                        <b>Transport to next:</b> {activity.transport_to_next}
                                    </>
                                )}
                            </Popup>
                        </Marker>
                    );
                })
            )}

            {/* Draw route with a polyline */}
            {route.length > 1 && <Polyline positions={route} color="blue" />}
        </MapContainer>
    );
};

export default MapItinerary;
