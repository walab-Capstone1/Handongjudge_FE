import type React from "react";
import { useQuestionEditPage } from "./hooks/useQuestionEditPage";
import QuestionEditPageView from "./components/QuestionEditPageView";

const QuestionEditPage: React.FC = () => {
	const d = useQuestionEditPage();
	return <QuestionEditPageView {...d} />;
};

export default QuestionEditPage;
