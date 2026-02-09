import type React from "react";
import { useProblemSetEdit } from "./hooks/useProblemSetEdit";
import ProblemSetEditView from "./components/ProblemSetEditView";

const ProblemSetEdit: React.FC = () => {
	const d = useProblemSetEdit();
	return <ProblemSetEditView {...d} />;
};

export default ProblemSetEdit;
