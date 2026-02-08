export interface Week {
	title: string;
	description: string;
	frequency: string;
	avgScore: string;
	problemSet: string;
}

export interface WeekCardProps {
	week: Week;
}
