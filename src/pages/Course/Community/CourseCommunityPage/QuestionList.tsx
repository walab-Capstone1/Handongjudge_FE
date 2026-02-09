import type React from "react";
import * as S from "./styles";
import QuestionCard from "./QuestionCard";
import type { Question } from "./types";

interface QuestionListProps {
  questions: Question[];
  onQuestionClick: (questionId: number) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onQuestionClick,
}) => (
  <S.QuestionsList>
    {questions.length === 0 ? (
      <S.EmptyState>
        <p>아직 질문이 없습니다.</p>
        <p>첫 번째 질문을 작성해보세요!</p>
      </S.EmptyState>
    ) : (
      questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onClick={() => onQuestionClick(question.id)}
        />
      ))
    )}
  </S.QuestionsList>
);

export default QuestionList;
