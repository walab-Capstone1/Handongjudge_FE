import type React from "react";
import { useCodingQuizPage } from "./hooks/useCodingQuizPage";
import CodingQuizPageView from "./components/CodingQuizPageView";

const CodingQuizPage: React.FC = () => {
	const d = useCodingQuizPage();
	return <CodingQuizPageView {...d} />;
};

export default CodingQuizPage;
