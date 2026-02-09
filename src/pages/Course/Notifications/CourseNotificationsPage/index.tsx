import type React from "react";
import { useCourseNotificationsPage } from "./hooks/useCourseNotificationsPage";
import CourseNotificationsPageView from "./components/CourseNotificationsPageView";

const CourseNotificationsPage: React.FC = () => {
	const d = useCourseNotificationsPage();
	return <CourseNotificationsPageView {...d} />;
};

export default CourseNotificationsPage;
