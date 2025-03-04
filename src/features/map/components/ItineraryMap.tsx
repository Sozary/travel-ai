import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { LatLngTuple, Icon, LatLngBounds } from "leaflet";
import { DayItinerary, ActivityCoordinates } from "../types";
import { geocodingService } from "../services";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in react-leaflet
delete (Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ItineraryMapProps {
    days: DayItinerary[];
    selectedLocation: string | null;
}
const MapController = ({ selectedLocation, activityCoordinates, days }: { selectedLocation: string | null; activityCoordinates: ActivityCoordinates; days: DayItinerary[] }) => {
    const map = useMap();

    // Fit map to all locations initially
    useEffect(() => {
        const allPositions = days
            .flatMap(day => day.activities.map(activity => activityCoordinates[activity.location]))
            .filter(coord => coord !== undefined) as LatLngTuple[];

        if (allPositions.length > 0) {
            const bounds = new LatLngBounds(allPositions);
            map.fitBounds(bounds, { padding: [50, 50] }); // Ensure some padding around
        }
    }, [activityCoordinates, days, map]);

    // Zoom to selected location
    useEffect(() => {
        if (selectedLocation && activityCoordinates[selectedLocation]) {
            const position = activityCoordinates[selectedLocation];
            map.flyTo(position, 16, { duration: .5 }); // Smooth zoom effect
        }
    }, [selectedLocation, activityCoordinates, map]);

    return null;
};


export const ItineraryMap = ({ days, selectedLocation }: ItineraryMapProps) => {
    const [activityCoordinates, setActivityCoordinates] = useState<ActivityCoordinates>({});
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const fetchCoordinatesForLocations = useCallback(async (locations: string[]) => {
        if (!isMountedRef.current) return;

        const uniqueLocations = [...new Set(locations)];
        const newCoordinates: ActivityCoordinates = {};
        let hasNewCoordinates = false;

        for (const location of uniqueLocations) {
            if (activityCoordinates[location]) continue;

            const coords = await geocodingService.fetchCoordinates(location);

            if (coords && isMountedRef.current) {
                newCoordinates[location] = coords;
                hasNewCoordinates = true;
            }
        }

        if (hasNewCoordinates && isMountedRef.current) {
            setActivityCoordinates((prev) => ({ ...prev, ...newCoordinates }));
        }
    }, [activityCoordinates]);

    useEffect(() => {
        const locations = days.flatMap(day => day.activities.map(activity => activity.location));
        const timeoutId = setTimeout(() => {
            if (isMountedRef.current) {
                fetchCoordinatesForLocations(locations);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [days, fetchCoordinatesForLocations]);


    return (
        <div className="w-full h-[400px]">
            <MapContainer center={[48.8566, 2.3522]} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Handles zooming & fitting to all activities */}
                <MapController selectedLocation={selectedLocation} activityCoordinates={activityCoordinates} days={days} />

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
                {days.map((day) => {
                    const dayRoute: LatLngTuple[] = day.activities
                        .map((activity) => activityCoordinates[activity.location])
                        .filter((coord) => coord !== undefined) as LatLngTuple[];

                    return (
                        dayRoute.length > 1 && (
                            <Polyline
                                key={`route-${day.day}`}
                                positions={dayRoute}
                                color="blue"
                                weight={4}
                                opacity={0.7}
                            />
                        )
                    );
                })}

            </MapContainer>
        </div>
    );
};
