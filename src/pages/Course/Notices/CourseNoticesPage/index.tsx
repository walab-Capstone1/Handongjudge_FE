import type React from "react";
import { useCourseNoticesPage } from "./hooks/useCourseNoticesPage";
import CourseNoticesPageView from "./components/CourseNoticesPageView";

const CourseNoticesPage: React.FC = () => {
	const d = useCourseNoticesPage();
	return <CourseNoticesPageView {...d} />;
};

export default CourseNoticesPage;
