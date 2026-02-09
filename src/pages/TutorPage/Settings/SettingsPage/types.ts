export interface Settings {
	profile: {
		name: string;
		email: string;
	};
	notifications: {
		emailNotifications: boolean;
		assignmentReminders: boolean;
		submissionAlerts: boolean;
	};
	preferences: {
		theme: "light" | "dark" | "auto";
		language: "ko" | "en";
	};
}
