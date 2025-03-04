export interface Activity {
	name: string;
	location: string;
	transport_to_next: string;
}

export interface Day {
	day: number;
	activities: Activity[];
}

export interface TripType {
	label: string;
	value: string;
	icon: React.ReactNode;
}
