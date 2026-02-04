import type React from "react";
import * as S from "./styles";
import type { Stats } from "./types";

export type FilterStatus = "ALL" | "PENDING" | "RESOLVED";

interface CommunityStatsBarProps {
  filter: FilterStatus;
  stats: Stats;
  onFilterChange: (filter: FilterStatus) => void;
}

const CommunityStatsBar: React.FC<CommunityStatsBarProps> = ({
  filter,
  stats,
  onFilterChange,
}) => (
  <S.StatsBar>
    <S.StatFilterBtn
      type="button"
      $active={filter === "ALL"}
      onClick={() => onFilterChange("ALL")}
    >
      <span className="stat-label">전체</span>
      <span className="stat-count">{stats.total}</span>
    </S.StatFilterBtn>
    <S.StatFilterBtn
      type="button"
      $active={filter === "PENDING"}
      onClick={() => onFilterChange("PENDING")}
    >
      <span className="stat-label">미해결</span>
      <span className="stat-count">{stats.pending}</span>
    </S.StatFilterBtn>
    <S.StatFilterBtn
      type="button"
      $active={filter === "RESOLVED"}
      onClick={() => onFilterChange("RESOLVED")}
    >
      <span className="stat-label">해결됨</span>
      <span className="stat-count">{stats.resolved}</span>
    </S.StatFilterBtn>
  </S.StatsBar>
);

export default CommunityStatsBar;
