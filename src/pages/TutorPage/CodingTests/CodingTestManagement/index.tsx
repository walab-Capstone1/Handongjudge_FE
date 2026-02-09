import type React from "react";
import { useCodingTestManagement } from "./hooks/useCodingTestManagement";
import CodingTestManagementView from "./components/CodingTestManagementView";

const CodingTestManagement: React.FC = () => {
	const d = useCodingTestManagement();
	return <CodingTestManagementView {...d} />;
};

export default CodingTestManagement;
