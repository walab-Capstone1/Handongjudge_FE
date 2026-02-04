import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";

// Alert Components
export const Alert = styled.div`
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  position: relative;
`;

export const AlertSuccess = styled(Alert)`
  background-color: var(--color-success-light);
  color: #065f46;
  border: 1px solid var(--color-success);
`;

export const AlertError = styled(Alert)`
  background-color: var(--color-error-light);
  color: #991b1b;
  border: 1px solid var(--color-error);
`;

export const AlertWarning = styled(Alert)`
  background-color: var(--color-warning-light);
  color: #92400e;
  border: 1px solid var(--color-warning);
`;

export const AlertInfo = styled(Alert)`
  background-color: var(--color-info-light);
  color: #1e40af;
  border: 1px solid var(--color-info);
`;

export const AlertContent = styled.div`
  flex: 1;
  font-size: var(--font-size-sm);
  line-height: 1.5;
`;

export const AlertClose = styled.button`
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  cursor: pointer;
  color: inherit;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity var(--transition-base);
  flex-shrink: 0;

  &:hover {
    opacity: 1;
  }
`;

// LoadingSpinner Components
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingSpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: var(--spacing-md);
`;

export const LoadingSpinner = styled.div`
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const LoadingSpinnerSm = styled(LoadingSpinner)`
  width: 24px;
  height: 24px;
  border-width: 3px;
`;

export const LoadingSpinnerMd = styled(LoadingSpinner)`
  width: 40px;
  height: 40px;
  border-width: 4px;
`;

export const LoadingSpinnerLg = styled(LoadingSpinner)`
  width: 56px;
  height: 56px;
  border-width: 5px;
`;

export const LoadingSpinnerMessage = styled.p`
  margin: 0;
  color: var(--color-text-medium);
  font-size: var(--font-size-sm);
`;

// EmptyState Components
export const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-medium);
`;

export const EmptyStateIcon = styled.div`
  font-size: 3rem;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-md);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const EmptyStateTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-dark);
  margin: 0 0 var(--spacing-sm) 0;
`;

export const EmptyStateMessage = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-text-medium);
  margin: 0 0 var(--spacing-lg) 0;
`;

export const EmptyStateAction = styled.div`
  margin-top: var(--spacing-md);
`;

// Breadcrumb Components
export const Breadcrumb = styled.nav`
  margin-bottom: var(--spacing-md);
`;

export const BreadcrumbList = styled.ol`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

export const BreadcrumbLink = styled(Link)`
  color: var(--color-text-medium);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: color var(--transition-base);

  &:hover {
    color: var(--color-primary);
  }
`;

export const BreadcrumbCurrent = styled.span`
  color: var(--color-text-dark);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
`;

export const BreadcrumbSeparator = styled.span`
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  user-select: none;
`;

// Navbar Components
export const Navbar = styled.nav`
  background-color: white;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

export const NavbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: relative;
  box-sizing: border-box;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100vw;
    height: 1px;
    background-color: #e1e8ed;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    margin-left: calc(-50vw + 50%);
  }

  @media (max-width: 1200px) {
    padding: 1rem 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
`;

export const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 4.5rem;

  @media (max-width: 768px) {
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

export const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #667eea;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  font-family: "Inter", "Segoe UI", "Roboto", sans-serif;
  letter-spacing: 0.5px;
  transition: color 0.2s ease;
  margin-left: 0;
  padding-left: 0;

  &:hover {
    color: #5a67d8;
  }
`;

export const LogoImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
`;

export const NavLink = styled(Link)`
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  font-family: "Inter", "Segoe UI", "Roboto", sans-serif;
  transition: color 0.2s ease;

  &:hover {
    color: #667eea;
  }
`;

export const AdminLink = styled(NavLink)`
  color: #d33625 !important;
  font-weight: 600;
  position: relative;

  &:hover {
    color: #c0392b !important;
  }

  &::before {
    margin-right: 0.5rem;
    font-size: 0.9rem;
  }
`;

export const NavRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 0.5rem;
  }
`;

export const SettingsButton = styled(Link)`
  background-color: #f1f3f4;
  color: #2d3436;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e1e8ed;
    color: #0984e3;
  }
`;

export const UserInfo = styled.span`
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: "Inter", "Segoe UI", "Roboto", sans-serif;
  padding: 0.5rem 0;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

export const LogoutButton = styled.button`
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  font-family: "Inter", "Segoe UI", "Roboto", sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
`;
