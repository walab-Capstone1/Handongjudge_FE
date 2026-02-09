import type React from "react";
import { useCodingQuizSolve } from "./hooks/useCodingQuizSolve";
import CodingQuizSolveView from "./components/CodingQuizSolveView";

const CodingQuizSolvePage: React.FC = () => {
	const d = useCodingQuizSolve();
	return <CodingQuizSolveView {...d} />;
};

export default CodingQuizSolvePage;
