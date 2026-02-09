import type React from "react";
import { useSuperAdminSubmissionManagement } from "./hooks/useSuperAdminSubmissionManagement";
import SuperAdminSubmissionManagementView from "./components/SuperAdminSubmissionManagementView";

const SuperAdminSubmissionManagement: React.FC = () => {
	const d = useSuperAdminSubmissionManagement();
	return <SuperAdminSubmissionManagementView {...d} />;
};

export default SuperAdminSubmissionManagement;
