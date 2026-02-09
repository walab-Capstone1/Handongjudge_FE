import type { FC } from "react";
import { useProblemSetManagement } from "./hooks/useProblemSetManagement";
import ProblemSetManagementView from "./components/ProblemSetManagementView";

const ProblemSetManagement: FC = () => {
	const d = useProblemSetManagement();
	return <ProblemSetManagementView {...d} />;
};

export default ProblemSetManagement;
