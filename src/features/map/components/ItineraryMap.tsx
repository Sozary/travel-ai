import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { LatLngTuple, Icon } from 'leaflet';
import { DayItinerary, ActivityCoordinates } from '../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface ItineraryMapProps {
    days: DayItinerary[];
}

export const ItineraryMap = ({ days }: ItineraryMapProps) => {
    const [activityCoordinates, setActivityCoordinates] = useState<ActivityCoordinates>({});
    const [isLoading, setIsLoading] = useState(true);
    const pendingLocationsRef = useRef<Set<string>>(new Set());
    const processedLocationsRef = useRef<Set<string>>(new Set());

    const fetchCoordinatesForLocations = useCallback(async (locations: string[]) => {
        const uniqueLocations = [...new Set(locations)];
        const newCoordinates: ActivityCoordinates = {};
        let hasNewCoordinates = false;

        for (const location of uniqueLocations) {
            // Skip if we already have coordinates or if it's being processed
            if (activityCoordinates[location] ||
                pendingLocationsRef.current.has(location) ||
                processedLocationsRef.current.has(location)) {
                continue;
            }

            console.log(`Fetching coordinates for: ${location}`);
            pendingLocationsRef.current.add(location);

            const coords = await fetchCoordinates(location);
            if (coords) {
                newCoordinates[location] = coords;
                hasNewCoordinates = true;
            }

            pendingLocationsRef.current.delete(location);
            processedLocationsRef.current.add(location);
        }

        if (hasNewCoordinates) {
            setActivityCoordinates(prev => ({ ...prev, ...newCoordinates }));
        }
    }, [activityCoordinates]);

    useEffect(() => {
        const locations = days.flatMap(day =>
            day.activities.map(activity => activity.location)
        );

        // Reset processed locations when days change
        processedLocationsRef.current.clear();

        // Debounce the coordinate fetching
        const timeoutId = setTimeout(() => {
            fetchCoordinatesForLocations(locations);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [days, fetchCoordinatesForLocations]);

    // Extract coordinates in sequence for Polyline
    const route: LatLngTuple[] = days
        .flatMap((day) =>
            day.activities
                .map((activity) => activityCoordinates[activity.location])
                .filter((coord) => coord !== undefined)
        ) as LatLngTuple[];

    if (isLoading || days.length === 0) {
        return <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">Loading map...</p>
        </div>;
    }

    return (
        <div className="w-full h-[400px] rounded-lg overflow-hidden">
            <MapContainer
                center={[48.8566, 2.3522]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                className="rounded-lg"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {days.map((day) =>
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
        </div>
    );
}; 