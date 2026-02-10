import type React from "react";
import * as S from "./styleddiv";

interface FormData {
	title: string;
	description: string;
	assignmentNumber: string;
	startDate: string;
	dueDate: string;
}

interface Section {
	sectionId: number;
	courseTitle: string;
	sectionName: string;
}

interface Assignment {
	id: number;
	title: string;
	description?: string;
	assignmentNumber?: string;
	startDate?: string;
	dueDate?: string;
}

interface AssignmentEditModalProps {
	isOpen: boolean;
	formData: FormData;
	selectedAssignment: Assignment | null;
	sections: Section[];
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	onInputChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => void;
	loading?: boolean;
}

const AssignmentEditModal: React.FC<AssignmentEditModalProps> = ({
	isOpen,
	formData,
	selectedAssignment,
	sections,
	onClose,
	onSubmit,
	onInputChange,
	loading = false,
}) => {
	if (!isOpen) return null;

	return (
		<S.ModalOverlay>
			<S.ModalContent>
				<S.ModalHeader>
					<S.ModalTitle>과제 수정</S.ModalTitle>
					<S.ModalCloseButton onClick={onClose}>✕</S.ModalCloseButton>
				</S.ModalHeader>

				<S.Form onSubmit={onSubmit}>
					<S.FormRow>
						<S.FormGroup>
							<S.Label htmlFor="edit-title">과제명 *</S.Label>
							<S.Input
								type="text"
								id="edit-title"
								name="title"
								value={formData.title}
								onChange={onInputChange}
								placeholder="과제명을 입력하세요"
								required
							/>
						</S.FormGroup>

						<S.FormGroup>
							<S.Label htmlFor="edit-assignmentNumber">과제 번호</S.Label>
							<S.Input
								type="text"
								id="edit-assignmentNumber"
								name="assignmentNumber"
								value={formData.assignmentNumber}
								onChange={onInputChange}
								placeholder="예: HW1, Assignment1"
							/>
						</S.FormGroup>
					</S.FormRow>

					<S.FormGroup>
						<S.Label htmlFor="edit-description">과제 설명</S.Label>
						<S.Textarea
							id="edit-description"
							name="description"
							value={formData.description}
							onChange={onInputChange}
							placeholder="과제에 대한 상세 설명을 입력하세요"
							rows={4}
						/>
					</S.FormGroup>

					<S.FormRow>
						<S.FormGroup>
							<S.Label htmlFor="edit-startDate">시작일</S.Label>
							<S.Input
								type="datetime-local"
								id="edit-startDate"
								name="startDate"
								value={formData.startDate}
								onChange={onInputChange}
							/>
						</S.FormGroup>

						<S.FormGroup>
							<S.Label htmlFor="edit-dueDate">마감일</S.Label>
							<S.Input
								type="datetime-local"
								id="edit-dueDate"
								name="dueDate"
								value={formData.dueDate}
								onChange={onInputChange}
							/>
						</S.FormGroup>
					</S.FormRow>

					<S.FormActions>
						<S.ButtonSecondary
							type="button"
							onClick={onClose}
							disabled={loading}
						>
							취소
						</S.ButtonSecondary>
						<S.ButtonPrimary type="submit" disabled={loading}>
							{loading ? "수정 중..." : "수정 완료"}
						</S.ButtonPrimary>
					</S.FormActions>
				</S.Form>
			</S.ModalContent>
		</S.ModalOverlay>
	);
};

export default AssignmentEditModal;
