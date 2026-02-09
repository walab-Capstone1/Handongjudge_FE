import type React from "react";
import * as S from "./styles";

interface BreadcrumbItem {
	label: string;
	path: string;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
	if (!items || items.length === 0) return null;

	return (
		<S.Container aria-label="Breadcrumb">
			<S.List>
				{items.map((item, index) => {
					const isLast = index === items.length - 1;
					return (
						<S.Item key={item.path + item.label}>
							{isLast ? (
								<S.CurrentItem aria-current="page">{item.label}</S.CurrentItem>
							) : (
								<>
									<S.ItemLink to={item.path}>{item.label}</S.ItemLink>
									<S.Separator aria-hidden="true">/</S.Separator>
								</>
							)}
						</S.Item>
					);
				})}
			</S.List>
		</S.Container>
	);
};

export default Breadcrumb;
