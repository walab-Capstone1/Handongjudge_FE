import styled, { keyframes } from "styled-components";

// Animations
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const slideInUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const problemListFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const problemListSlideInUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const copyProblemFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const copyProblemSlideInUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Modal Overlays
export const ModalOverlay = styled.div`
  position: fixed;
  top: 65px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease;
  padding-top: 2rem;
  overflow-y: auto;
  box-sizing: border-box;
`;

export const ProblemListModalOverlay = styled.div`
  position: fixed;
  top: 65px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 10000;
  animation: ${problemListFadeIn} 0.2s ease;
  padding-top: 2rem;
  overflow-y: auto;
  box-sizing: border-box;
`;

export const CopyProblemModalOverlay = styled.div`
  position: fixed;
  top: 65px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 10000;
  animation: ${copyProblemFadeIn} 0.2s ease;
  padding-top: 2rem;
  overflow-y: auto;
  box-sizing: border-box;
`;

export const ModalOverlayProblemSelect = styled(ModalOverlay)`
  z-index: 10000 !important;
  position: fixed !important;
  top: 65px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 2rem !important;
  box-sizing: border-box !important;
  overflow: auto !important;
  background: rgba(0, 0, 0, 0.5) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
`;

export const ModalOverlayDetail = styled(ModalOverlay)`
  z-index: 50000 !important;
  position: fixed !important;
  top: 65px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 2rem !important;
  box-sizing: border-box !important;
  overflow: auto !important;
  background: rgba(0, 0, 0, 0.5) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
`;

// Modal Content
export const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: calc(90vh - 65px);
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideInUp} 0.3s ease;
  margin: auto;
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const ModalContentLarge = styled(ModalContent)`
  max-width: 80vw;
  width: 80vw;
  min-width: 600px;
  max-height: calc(90vh - 65px);
`;

export const ProblemListModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: calc(90vh - 65px);
  overflow: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${problemListSlideInUp} 0.3s ease;
  margin-top: 0;
`;

export const ProblemListModalContentExtraLarge = styled(
	ProblemListModalContent,
)`
  max-width: 95vw;
  width: 95vw;
  min-width: 800px;
  max-height: 90vh;
`;

export const CopyProblemModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: calc(90vh - 65px);
  overflow: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${copyProblemSlideInUp} 0.3s ease;
  margin-top: 0;
  display: flex;
  flex-direction: column;
`;

export const CopyProblemModalContentLarge = styled(CopyProblemModalContent)`
  max-width: 95vw !important;
  width: 95vw !important;
  min-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

export const ProblemModalLarge = styled.div`
  max-width: 95vw !important;
  width: 95vw !important;
  min-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

// Modal Header
export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb !important;
  background-image: none !important;
  color: #1e293b;
  flex-shrink: 0;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const ModalCloseButton = styled.button`
  background: #e5e7eb;
  border: none;
  font-size: 1.75rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #d1d5db;
    color: #374151;
    transform: rotate(90deg);
  }
`;

export const ProblemListModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb !important;
  background-image: none !important;
  color: #1e293b;
`;

export const ProblemListModalClose = styled.button`
  background: #e5e7eb;
  border: none;
  font-size: 1.75rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #d1d5db;
    color: #374151;
    transform: rotate(90deg);
  }
`;

export const CopyProblemModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-shrink: 0;
`;

export const CopyProblemModalHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

export const CopyProblemModalClose = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 1.75rem;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

// Modal Body
export const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2rem;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

export const ProblemModalBody = styled.div`
  padding: 1.5rem 2rem;
  padding-bottom: 1.5rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 0;
  background: white;
`;

export const ProblemListModalBody = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const CopyProblemModalBody = styled.div`
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 0;
  background: white;
`;

// Modal Footer
export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
`;

export const CopyProblemModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
`;

// Form Components
export const Form = styled.form`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
`;

export const ProblemForm = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.625rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  box-sizing: border-box;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  box-sizing: border-box;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const InfoBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0 1.5rem 0;

  p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    color: #495057;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
    line-height: 1.6;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: #2d3436;
      font-weight: 700;
    }
  }
`;

export const FileInput = styled.div`
  width: 100%;
  padding: 0.8rem;
  border: 2px dashed #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }
`;

export const FileHelp = styled.span`
  display: block;
  color: #636e72;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  line-height: 1.5;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const FileSelected = styled.span`
  color: #28a745;
  font-weight: 600;
  display: inline-block;
  margin-left: 8px;
`;

export const Optional = styled.span`
  color: #999;
  font-weight: normal;
  font-size: 0.9rem;
`;

// Buttons
export const ButtonSecondary = styled.button`
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

export const ButtonPrimary = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #5568d3 0%, #6a3d8c 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const RequiredMessage = styled.p`
  margin: 0 0 1rem 0;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  margin-top: auto;
  border-top: 1px solid #e5e7eb;
`;

export const ProblemActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

export const ButtonCopyProblem = styled.button`
  padding: 0.75rem 1.5rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

export const ButtonCreateNew = styled(ButtonCopyProblem)``;

export const FooterActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-left: auto;
`;

export const FooterButtonSecondary = styled(ButtonSecondary)`
  padding: 0.75rem 1.5rem;
  border: 2px solid #e5e7eb;
  background: white;
  color: #64748b;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    color: #374151;
  }
`;

export const FooterButtonPrimary = styled(ButtonPrimary)`
  padding: 0.75rem 1.5rem;
  background: #667eea !important;
  background-image: none !important;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #5568d3 !important;
    background-image: none !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
`;
