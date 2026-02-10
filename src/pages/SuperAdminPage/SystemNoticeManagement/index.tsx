import type React from "react";
import { useSystemNoticeManagement } from "./hooks/useSystemNoticeManagement";
import SystemNoticeManagementView from "./components/SystemNoticeManagementView";

const SystemNoticeManagement: React.FC = () => {
	const d = useSystemNoticeManagement();
	return <SystemNoticeManagementView {...d} />;
};

export default SystemNoticeManagement;
