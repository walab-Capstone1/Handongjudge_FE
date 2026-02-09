import type React from "react";
import { useSuperAdminUserManagement } from "./hooks/useSuperAdminUserManagement";
import SuperAdminUserManagementView from "./components/SuperAdminUserManagementView";

const SuperAdminUserManagement: React.FC = () => {
	const d = useSuperAdminUserManagement();
	return <SuperAdminUserManagementView {...d} />;
};

export default SuperAdminUserManagement;
