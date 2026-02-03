import React from 'react';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  Form,
  FormRow,
  FormGroup,
  Label,
  Input,
  Textarea,
  FormActions,
  ButtonSecondary,
  ButtonPrimary
} from './styleddiv';

/**
 * 과제 수정 모달 컴포넌트
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {Object} formData - 폼 데이터
 * @param {Object} selectedAssignment - 선택된 과제
 * @param {Array} sections - 분반 목록
 * @param {Function} onClose - 모달 닫기 핸들러
 * @param {Function} onSubmit - 제출 핸들러
 * @param {Function} onInputChange - 입력 변경 핸들러
 */
const AssignmentEditModal = ({
  isOpen,
  formData,
  selectedAssignment,
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
          <ModalTitle>과제 수정</ModalTitle>
          <ModalCloseButton onClick={onClose}>
            ✕
          </ModalCloseButton>
        </ModalHeader>
        
        <Form onSubmit={onSubmit}>
          <FormRow>
            <FormGroup>
              <Label htmlFor="edit-title">과제명 *</Label>
              <Input
                type="text"
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                placeholder="과제명을 입력하세요"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="edit-assignmentNumber">과제 번호</Label>
              <Input
                type="text"
                id="edit-assignmentNumber"
                name="assignmentNumber"
                value={formData.assignmentNumber}
                onChange={onInputChange}
                placeholder="예: HW1, Assignment1"
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor="edit-description">과제 설명</Label>
            <Textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              placeholder="과제에 대한 상세 설명을 입력하세요"
              rows="4"
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="edit-startDate">시작일</Label>
              <Input
                type="datetime-local"
                id="edit-startDate"
                name="startDate"
                value={formData.startDate}
                onChange={onInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="edit-endDate">마감일</Label>
              <Input
                type="datetime-local"
                id="edit-endDate"
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
              과제 수정
            </ButtonPrimary>
          </FormActions>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AssignmentEditModal;

