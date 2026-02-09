import type React from "react";
import { useSuperAdminDashboard } from "./hooks/useSuperAdminDashboard";
import SuperAdminDashboardView from "./components/SuperAdminDashboardView";

const SuperAdminDashboard: React.FC = () => {
	const d = useSuperAdminDashboard();
	return <SuperAdminDashboardView {...d} />;
};

export default SuperAdminDashboard;
