import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideInUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ModalOverlay = styled.div`
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

const ModalContent = styled.div`
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

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #1e293b;
  flex-shrink: 0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

const ModalCloseButton = styled.button`
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

const Form = styled.form`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.625rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  box-sizing: border-box;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  box-sizing: border-box;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const ButtonSecondary = styled.button`
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

const ButtonPrimary = styled.button`
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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

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

/**
 * 과제 추가 모달 컴포넌트
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {Object} formData - 폼 데이터
 * @param {Array} sections - 분반 목록
 * @param {Function} onClose - 모달 닫기 핸들러
 * @param {Function} onSubmit - 제출 핸들러
 * @param {Function} onInputChange - 입력 변경 핸들러
 */
const AssignmentAddModal = ({
  isOpen,
  formData,
  sections,
  onClose,
  onSubmit,
  onInputChange
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>새 과제 추가</ModalTitle>
          <ModalCloseButton onClick={onClose}>
            ✕
          </ModalCloseButton>
        </ModalHeader>
        
        <Form onSubmit={onSubmit}>
          <FormRow>
            <FormGroup>
              <Label htmlFor="title">과제명 *</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                placeholder="과제명을 입력하세요"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="assignmentNumber">과제 번호</Label>
              <Input
                type="text"
                id="assignmentNumber"
                name="assignmentNumber"
                value={formData.assignmentNumber}
                onChange={onInputChange}
                placeholder="예: HW1, Assignment1"
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor="sectionId">분반 선택 *</Label>
            <Select
              id="sectionId"
              name="sectionId"
              value={formData.sectionId}
              onChange={onInputChange}
              required
            >
              <option value="">분반을 선택하세요</option>
              {sections.map((section) => (
                <option key={section.sectionId} value={section.sectionId}>
                  {section.courseTitle} (분반 {section.sectionNumber || section.sectionId})
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">과제 설명</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              placeholder="과제에 대한 상세 설명을 입력하세요"
              rows="4"
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="startDate">시작일</Label>
              <Input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={onInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="endDate">마감일</Label>
              <Input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={onInputChange}
              />
            </FormGroup>
          </FormRow>

          <FormActions>
            <ButtonSecondary type="button" onClick={onClose}>
              취소
            </ButtonSecondary>
            <ButtonPrimary type="submit">
              과제 생성
            </ButtonPrimary>
          </FormActions>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AssignmentAddModal;

