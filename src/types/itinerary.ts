export interface Day {
	day: number;
	city: string;
	activities: string[];
	transport: string;
}

export interface TripType {
	label: string;
	value: string;
	icon: React.ReactNode;
}
