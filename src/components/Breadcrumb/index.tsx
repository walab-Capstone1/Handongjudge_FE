import React from "react";
import { Link } from "react-router-dom";
import * as S from "./styles";

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <S.Container>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <S.Separator>/</S.Separator>}
          {index === items.length - 1 ? (
            <S.CurrentItem>{item.label}</S.CurrentItem>
          ) : (
            <S.ItemLink to={item.path}>{item.label}</S.ItemLink>
          )}
        </React.Fragment>
      ))}
    </S.Container>
  );
};

export default Breadcrumb;
