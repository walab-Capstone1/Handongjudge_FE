import type React from "react";
import * as S from "./styles";

interface CommunityHeaderProps {
  onCreateQuestion: () => void;
}

const CommunityHeader: React.FC<CommunityHeaderProps> = ({ onCreateQuestion }) => (
  <S.HeaderSection>
    <S.TitleBlock>
      <h1>질의응답</h1>
      <p>궁금한 점을 질문하고 서로 도와주세요</p>
    </S.TitleBlock>
    <S.CreateQuestionBtn type="button" onClick={onCreateQuestion}>
      <span>+ 질문하기</span>
    </S.CreateQuestionBtn>
  </S.HeaderSection>
);

export default CommunityHeader;
