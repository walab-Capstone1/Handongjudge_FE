import type React from "react";
import { useSuperAdminProblemManagement } from "./hooks/useSuperAdminProblemManagement";
import SuperAdminProblemManagementView from "./components/SuperAdminProblemManagementView";

const SuperAdminProblemManagement: React.FC = () => {
	const d = useSuperAdminProblemManagement();
	return <SuperAdminProblemManagementView {...d} />;
};

export default SuperAdminProblemManagement;
