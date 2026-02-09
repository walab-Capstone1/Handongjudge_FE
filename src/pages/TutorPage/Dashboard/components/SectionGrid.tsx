import type React from "react";
import * as S from "../styles";
import SectionCard from "./SectionCard";
import type { DashboardSection } from "../types";

interface SectionGridProps {
	sections: DashboardSection[];
	hasActiveFilters: boolean;
	onToggleActive: (sectionId: number, currentActive: boolean) => void;
	onDelete: (sectionId: number, sectionTitle: string) => void;
	openDropdownId: number | null;
	setOpenDropdownId: (id: number | null) => void;
}

const SectionGrid: React.FC<SectionGridProps> = ({
	sections,
	hasActiveFilters,
	onToggleActive,
	onDelete,
	openDropdownId,
	setOpenDropdownId,
}) => (
	<>
		<S.SectionsGrid>
			{sections.map((section) => (
				<SectionCard
					key={section.sectionId}
					section={section}
					onToggleActive={onToggleActive}
					onDelete={onDelete}
					openDropdownId={openDropdownId}
					onDropdownToggle={(id) => setOpenDropdownId(id === 0 ? null : id)}
				/>
			))}
		</S.SectionsGrid>
		{sections.length === 0 && (
			<S.NoSections>
				<p>
					{hasActiveFilters
						? "검색 조건에 맞는 수업이 없습니다."
						: "담당하고 있는 수업이 없습니다."}
				</p>
			</S.NoSections>
		)}
	</>
);

export default SectionGrid;
