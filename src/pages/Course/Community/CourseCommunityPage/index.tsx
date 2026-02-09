import type React from "react";
import { useCourseCommunityPage } from "./hooks/useCourseCommunityPage";
import CourseCommunityPageView from "./components/CourseCommunityPageView";

const CourseCommunityPage: React.FC = () => {
	const d = useCourseCommunityPage();
	return <CourseCommunityPageView {...d} />;
};

export default CourseCommunityPage;
