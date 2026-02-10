import styled from "styled-components";

export const Container = styled.div`
  padding: 0;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

export const Header = styled.div`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

export const BackButton = styled.button`
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #e5e7eb;
    color: #1e293b;
  }
`;

export const HeaderContent = styled.div`
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
      sans-serif;
  }
`;

export const SectionInfo = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
`;

export const Body = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

export const Form = styled.form`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;

  .required {
    color: #ef4444;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const CharCount = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 2.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

export const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;
  border: none;
  background: #f3f4f6;
  color: #475569;

  &:hover {
    background: #e5e7eb;
    color: #1e293b;
  }
`;

export const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;
  border: none;
  background: #667eea;
  color: white;

  &:hover:not(:disabled) {
    background: #5568d3;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1rem;
  color: #64748b;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;
`;
