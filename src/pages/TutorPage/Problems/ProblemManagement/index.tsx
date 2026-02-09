import type React from "react";
import { useProblemManagement } from "./hooks/useProblemManagement";
import ProblemManagementView from "./components/ProblemManagementView";

const ProblemManagement: React.FC = () => {
	const d = useProblemManagement();
	return <ProblemManagementView {...d} />;
};

export default ProblemManagement;
