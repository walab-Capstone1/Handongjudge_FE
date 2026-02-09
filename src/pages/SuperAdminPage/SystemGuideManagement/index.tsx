import type React from "react";
import { useSystemGuideManagement } from "./hooks/useSystemGuideManagement";
import SystemGuideManagementView from "./components/SystemGuideManagementView";

const SystemGuideManagement: React.FC = () => {
	const d = useSystemGuideManagement();
	return <SystemGuideManagementView {...d} />;
};

export default SystemGuideManagement;
