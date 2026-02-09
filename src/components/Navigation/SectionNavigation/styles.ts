import styled from "styled-components";

export const Container = styled.div`
  background: white;
  border-bottom: 1px solid #e1e8ed;
  margin-bottom: 2rem;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.75rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1.25rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: white !important;
  margin: 0;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    text-align: left;
  }
`;

export const CourseName = styled.div`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  backdrop-filter: blur(10px);
`;

export const EnrollmentButton = styled.button`
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 10px;
  padding: 0.875rem 1.75rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  white-space: nowrap;

  svg {
    font-size: 1rem;
  }

  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

export const Content = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0 1rem;
  }
`;

export const SearchBox = styled.div`
  max-width: 280px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

export const FilterDropdown = styled.div`
  min-width: 150px;
`;

export const FilterSelect = styled.select`
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
`;

export const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #667eea;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;

  &:hover {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
`;

export const SecondaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    border-color: #dee2e6;
  }
`;
