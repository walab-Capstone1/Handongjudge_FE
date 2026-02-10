import type React from "react";
import { useCourseNoticeDetailPage } from "./hooks/useCourseNoticeDetailPage";
import CourseNoticeDetailPageView from "./components/CourseNoticeDetailPageView";

const CourseNoticeDetailPage: React.FC = () => {
	const d = useCourseNoticeDetailPage();
	return <CourseNoticeDetailPageView {...d} />;
};

export default CourseNoticeDetailPage;
