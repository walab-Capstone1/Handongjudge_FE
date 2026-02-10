import React from "react";
import { useGradeManagement } from "./hooks/useGradeManagement";
import GradeManagementView from "./components/GradeManagementView";

const GradeManagement: React.FC = () => {
	const d = useGradeManagement();
	return <GradeManagementView {...d} />;
};

export default GradeManagement;
