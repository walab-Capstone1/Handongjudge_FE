import type React from "react";
import * as S from "./styles";
import type { Assignment, Problem } from "./types";

interface CommunityFilterBarProps {
  assignmentFilter: string;
  problemFilter: string;
  assignments: Assignment[];
  problems: Problem[];
  onAssignmentChange: (value: string) => void;
  onProblemChange: (value: string) => void;
  onClearFilters: () => void;
}

const CommunityFilterBar: React.FC<CommunityFilterBarProps> = ({
  assignmentFilter,
  problemFilter,
  assignments,
  problems,
  onAssignmentChange,
  onProblemChange,
  onClearFilters,
}) => (
  <S.FilterBar>
    <S.FilterGroup>
      <S.FilterLabel>과제</S.FilterLabel>
      <S.FilterSelect
        value={assignmentFilter}
        onChange={(e) => onAssignmentChange(e.target.value)}
        aria-label="과제 필터"
      >
        <option value="ALL">전체</option>
        {assignments.map((a) => (
          <option key={a.id} value={String(a.id)}>
            {a.title}
          </option>
        ))}
      </S.FilterSelect>
    </S.FilterGroup>
    <S.FilterGroup>
      <S.FilterLabel>문제</S.FilterLabel>
      <S.FilterSelect
        value={problemFilter}
        onChange={(e) => onProblemChange(e.target.value)}
        aria-label="문제 필터"
        disabled={assignmentFilter === "ALL"}
      >
        <option value="ALL">전체</option>
        {problems.map((p) => (
          <option key={p.id ?? p.problemId} value={String(p.id ?? p.problemId)}>
            {p.title ?? p.problemTitle ?? `문제 ${p.id ?? p.problemId}`}
          </option>
        ))}
      </S.FilterSelect>
    </S.FilterGroup>
    <S.FilterClearBtn type="button" onClick={onClearFilters}>
      필터 초기화
    </S.FilterClearBtn>
  </S.FilterBar>
);

export default CommunityFilterBar;
