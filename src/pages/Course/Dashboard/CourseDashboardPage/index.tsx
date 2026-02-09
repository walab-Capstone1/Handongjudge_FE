import type React from "react";
import { useCourseDashboard } from "./hooks/useCourseDashboard";
import CourseDashboardView from "./components/CourseDashboardView";

const CourseDashboardPage: React.FC = () => {
	const d = useCourseDashboard();
	return <CourseDashboardView {...d} />;
};

export default CourseDashboardPage;
