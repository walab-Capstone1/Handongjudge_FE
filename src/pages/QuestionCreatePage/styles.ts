import styled from "styled-components";

export const Container = styled.div<{ $isCollapsed: boolean }>`
  display: block;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const Content = styled.div<{ $isCollapsed: boolean }>`
  margin-left: ${(props) => (props.$isCollapsed ? "70px" : "250px")};
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  transition: margin-left 0.3s ease;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const Body = styled.div`
  padding: 78px 100px 40px 100px;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    padding: 78px 40px 40px 40px;
  }
  @media (max-width: 768px) {
    padding: 78px 20px 40px 20px;
  }
`;

export const PageHeader = styled.div`
  margin-bottom: 32px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }
  p {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
`;

export const Form = styled.form`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 24px;
  position: relative;
`;

export const FormLabel = styled.label`
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

export const Required = styled.span`
  color: #e53e3e;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const CharCount = styled.span`
  position: absolute;
  right: 0;
  top: 0;
  font-size: 12px;
  color: #999;
`;

export const FormSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const FormOptions = styled.div`
  margin: 32px 0;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
`;

export const OptionGroup = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  cursor: pointer;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

export const NicknameDisplay = styled.span`
  margin-left: 8px;
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
`;

export const OptionDescription = styled.p`
  margin: 4px 0 0 26px;
  font-size: 13px;
  color: #666;
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 8px;
  }
`;

export const BtnCancel = styled.button`
  padding: 12px 24px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: auto;
  width: auto;

  &:hover {
    background: #f8f9fa;
    border-color: #ccc;
  }

  @media (max-width: 768px) {
    width: auto;
    align-self: flex-start;
  }
`;

export const BtnSubmit = styled.button`
  padding: 12px 32px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);

  &:hover:not(:disabled) {
    background: #5568d3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

/* 모달 */
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }
  > p {
    font-size: 14px;
    color: #666;
    margin: 0 0 24px 0;
  }
`;

export const ModalFormGroup = styled.div`
  input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 15px;
    box-sizing: border-box;
  }
  input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const ErrorMessage = styled.p`
  margin: 8px 0 0 0;
  font-size: 13px;
  color: #e53e3e;
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

export const BtnModalCancel = styled.button`
  padding: 10px 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

export const BtnModalSubmit = styled.button`
  padding: 10px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #5568d3;
  }
`;
