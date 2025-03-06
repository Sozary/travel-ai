import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { LatLngTuple, Icon, LatLngBounds } from "leaflet";
import { DayItinerary, ActivityCoordinates } from "../types";
import { geocodingService } from "../services/geocoding";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { fetchRoute } from "../services/direction/routingService";

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
    setLoadingLocations: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
    selectedDay: number | null;
}
const MapController = ({ selectedLocation, activityCoordinates, days, selectedDay }: { selectedLocation: string | null; activityCoordinates: ActivityCoordinates; days: DayItinerary[], selectedDay: number | null }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedLocation) return;

        const allPositions = days
            .flatMap(day =>
                day.activities.map(activity => activityCoordinates[`${activity.name} ${activity.location}`])
            )
            .filter((coord): coord is LatLngTuple => coord !== undefined);

        if (allPositions.length > 0) {
            const bounds = new LatLngBounds(allPositions);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [activityCoordinates, days, map, selectedLocation]);

    useEffect(() => {
        if (selectedLocation) {
            const position = activityCoordinates[selectedLocation];
            if (position) {
                map.flyTo(position, 16, { duration: 0.5 });
            }
        }
    }, [selectedLocation, activityCoordinates, map]);

    useEffect(() => {
        if (selectedLocation) return;

        if (!selectedDay) {
            const allPositions = days
                .flatMap(day =>
                    day.activities.map(activity => activityCoordinates[`${activity.name} ${activity.location}`])
                )
                .filter((coord): coord is LatLngTuple => coord !== undefined);

            if (allPositions.length > 0) {
                const bounds = new LatLngBounds(allPositions);
                map.fitBounds(bounds, { padding: [50, 50] });
            }
            return;
        }

        const day = days.find(day => day.day === selectedDay);
        if (day) {
            const allPositions = day.activities
                .map(activity => activityCoordinates[`${activity.name} ${activity.location}`])
                .filter((coord): coord is LatLngTuple => coord !== undefined);

            if (allPositions.length > 0) {
                const bounds = new LatLngBounds(allPositions);
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [selectedLocation, activityCoordinates, map, days, selectedDay]);

    return null;
};


export const ItineraryMap = ({ days, selectedLocation, setLoadingLocations, selectedDay }: ItineraryMapProps) => {
    const [activityCoordinates, setActivityCoordinates] = useState<ActivityCoordinates>({});
    const [routes, setRoutes] = useState<{ [key: string]: LatLngTuple[] }>({});
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);
    /** Fetch routes only between consecutive activities that have both locations */
    const fetchRoutesForDays = useCallback(async (days: DayItinerary[], activityCoordinates: ActivityCoordinates) => {
        const newRoutes: { [key: string]: LatLngTuple[] } = { ...routes };

        for (const day of days) {
            const orderedActivities = day.activities
                .map(activity => ({
                    key: `${activity.name} ${activity.location}`,
                    coord: activityCoordinates[`${activity.name} ${activity.location}`]
                }))
                .filter(({ coord }) => coord !== undefined);

            for (let i = 0; i < orderedActivities.length - 1; i++) {
                const start = orderedActivities[i].coord;
                const end = orderedActivities[i + 1].coord;
                const routeKey = `${orderedActivities[i].key} -> ${orderedActivities[i + 1].key}`;

                if (!newRoutes[routeKey]) {
                    console.log('Fetching', orderedActivities[i].key, '=>', orderedActivities[i + 1].key);

                    const route = await fetchRoute([start, end]);
                    console.log('Got route', route);

                    if (route) {
                        newRoutes[routeKey] = route;
                    }
                }
            }
        }

        if (Object.keys(newRoutes).length > Object.keys(routes).length && isMountedRef.current) {
            setRoutes(newRoutes);
        }
    }, [routes]);

    const fetchCoordinatesForLocations = useCallback(async (locations: string[]) => {
        if (!isMountedRef.current) return;

        const uniqueLocations = [...new Set(locations)];
        const newCoordinates: ActivityCoordinates = {};
        const loadingStateUpdate: { [key: string]: boolean } = {};

        uniqueLocations.forEach((location) => {
            if (!activityCoordinates[location]) {
                loadingStateUpdate[location] = true;
            }
        });

        setLoadingLocations((prev) => ({ ...prev, ...loadingStateUpdate }));

        for (const location of uniqueLocations) {
            if (activityCoordinates[location]) continue;

            const coords = await geocodingService.fetchCoordinates(location);
            if (coords && isMountedRef.current) {
                newCoordinates[location] = coords;
            }
        }

        if (Object.keys(newCoordinates).length > 0 && isMountedRef.current) {
            setActivityCoordinates((prev) => ({ ...prev, ...newCoordinates }));
            setLoadingLocations((prev) => {
                const updatedLoadingState = { ...prev };
                Object.keys(newCoordinates).forEach((location) => {
                    updatedLoadingState[location] = false;
                });
                return updatedLoadingState;
            });

            fetchRoutesForDays(days, { ...activityCoordinates, ...newCoordinates });
        }
    }, [setLoadingLocations, activityCoordinates, fetchRoutesForDays, days]);




    useEffect(() => {
        const locations = days.flatMap(day => day.activities.map(activity => `${activity.name} ${activity.location}`));

        const timeoutId = setTimeout(() => {
            if (isMountedRef.current) {
                fetchCoordinatesForLocations(locations);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [days, fetchCoordinatesForLocations]);



    return (
        <div className="w-full h-[400px]">
            <MapContainer center={[48.8566, 2.3522]} zoom={2} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Handles zooming & fitting to all activities */}
                <MapController selectedLocation={selectedLocation} activityCoordinates={activityCoordinates} selectedDay={selectedDay} days={days} />

                {days.map((day) =>
                    day.activities.map((activity, idx) => {
                        const position = activityCoordinates[`${activity.name} ${activity.location}`];
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
                {Object.entries(routes).map(([day, route]) => (
                    <Polyline
                        key={`route-${day}`}
                        positions={route}
                        color="blue"
                        weight={4}
                        opacity={0.7}
                    />
                ))}


            </MapContainer>
        </div>
    );
};

