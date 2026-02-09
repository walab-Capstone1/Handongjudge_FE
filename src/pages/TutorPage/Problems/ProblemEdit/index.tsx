import type React from "react";
import { useProblemEdit } from "./hooks/useProblemEdit";
import ProblemEditView from "./components/ProblemEditView";

const ProblemEdit: React.FC = () => {
	const d = useProblemEdit();
	return <ProblemEditView {...d} />;
};

export default ProblemEdit;
