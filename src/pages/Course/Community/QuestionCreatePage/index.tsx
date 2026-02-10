import type React from "react";
import { useQuestionCreatePage } from "./hooks/useQuestionCreatePage";
import QuestionCreatePageView from "./components/QuestionCreatePageView";

const QuestionCreatePage: React.FC = () => {
	const d = useQuestionCreatePage();
	return <QuestionCreatePageView {...d} />;
};

export default QuestionCreatePage;
