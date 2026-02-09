import type React from "react";
import * as S from "./styles";
import { formatDate } from "./utils";
import type { Question } from "./types";

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => (
  <S.QuestionCardBtn type="button" onClick={onClick}>
    <S.QuestionMain>
      <S.QuestionHeader>
        <S.BadgesGroup>
          {question.isPinned && <S.PinBadge>고정</S.PinBadge>}
          <S.StatusBadge $status={(question.status ?? "PENDING").toLowerCase()}>
            {question.status === "RESOLVED" ? "해결됨" : "미해결"}
          </S.StatusBadge>
          {question.isAnonymous && <S.AnonymousBadge>익명</S.AnonymousBadge>}
        </S.BadgesGroup>
        {(question.assignmentTitle ?? question.problemTitle) && (
          <S.TagsRow>
            {question.assignmentTitle && (
              <S.Tag>{question.assignmentTitle}</S.Tag>
            )}
            {question.problemTitle && (
              <>
                {question.assignmentTitle && <S.Separator>·</S.Separator>}
                <S.Tag>{question.problemTitle}</S.Tag>
              </>
            )}
          </S.TagsRow>
        )}
        <S.AuthorDate>
          <span className="author">
            {question.authorDisplayName ?? question.authorName ?? "익명"}
          </span>
          <S.Separator>·</S.Separator>
          <span className="date">{formatDate(question.createdAt)}</span>
        </S.AuthorDate>
      </S.QuestionHeader>
      <S.QuestionTitleText>{question.title}</S.QuestionTitleText>
    </S.QuestionMain>
    <S.QuestionStats>
      <span className="stat">
        <span className="label">조회</span>
        <span className="value">{question.viewCount ?? 0}</span>
      </span>
      <span className="stat">
        <span className="label">댓글</span>
        <span className="value">{question.commentCount ?? 0}</span>
      </span>
      <span className="stat">
        <span className="label">추천</span>
        <span className="value">{question.likeCount ?? 0}</span>
      </span>
    </S.QuestionStats>
  </S.QuestionCardBtn>
);

export default QuestionCard;
