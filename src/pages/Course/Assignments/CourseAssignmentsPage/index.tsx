import type React from "react";
import { useCourseAssignmentsPage } from "./hooks/useCourseAssignmentsPage";
import CourseAssignmentsPageView from "./components/CourseAssignmentsPageView";

const CourseAssignmentsPage: React.FC = () => {
	const d = useCourseAssignmentsPage();
	return <CourseAssignmentsPageView {...d} />;
};

export default CourseAssignmentsPage;
