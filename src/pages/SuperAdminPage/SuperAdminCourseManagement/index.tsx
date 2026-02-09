import type React from "react";
import { useSuperAdminCourseManagement } from "./hooks/useSuperAdminCourseManagement";
import SuperAdminCourseManagementView from "./components/SuperAdminCourseManagementView";

const SuperAdminCourseManagement: React.FC = () => {
	const d = useSuperAdminCourseManagement();
	return <SuperAdminCourseManagementView {...d} />;
};

export default SuperAdminCourseManagement;
