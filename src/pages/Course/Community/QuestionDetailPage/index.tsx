import type React from "react";
import { useQuestionDetailPage } from "./hooks/useQuestionDetailPage";
import QuestionDetailPageView from "./components/QuestionDetailPageView";

const QuestionDetailPage: React.FC = () => {
	const d = useQuestionDetailPage();
	return <QuestionDetailPageView {...d} />;
};

export default QuestionDetailPage;
