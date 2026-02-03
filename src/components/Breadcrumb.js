import React from 'react';
import {
  Breadcrumb as BreadcrumbContainer,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbCurrent,
  BreadcrumbSeparator
} from './styleddiv';

const Breadcrumb = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <BreadcrumbContainer aria-label="Breadcrumb">
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <BreadcrumbItem key={index}>
              {isLast ? (
                <BreadcrumbCurrent aria-current="page">
                  {item.label}
                </BreadcrumbCurrent>
              ) : (
                <>
                  <BreadcrumbLink to={item.path}>
                    {item.label}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator aria-hidden="true">
                    /
                  </BreadcrumbSeparator>
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbContainer>
  );
};

export default Breadcrumb;

