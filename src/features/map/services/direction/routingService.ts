import { LatLngTuple } from "leaflet";

export const fetchRoute = async (
	waypoints: LatLngTuple[]
): Promise<LatLngTuple[] | null> => {
	if (waypoints.length < 2) return null;

	const coordinates = waypoints.map(([lat, lon]) => `${lon},${lat}`).join(";");
	const url = `https://router.project-osrm.org/route/v1/walking/${coordinates}?overview=full&geometries=geojson`;

	try {
		const response = await fetch(url);
		const data = await response.json();

		if (data.code === "Ok" && data.routes.length > 0) {
			return data.routes[0].geometry.coordinates.map(
				([lon, lat]: [number, number]) => [lat, lon] as LatLngTuple
			);
		}
	} catch (error) {
		console.error("Error fetching route:", error);
	}

	return null;
};
