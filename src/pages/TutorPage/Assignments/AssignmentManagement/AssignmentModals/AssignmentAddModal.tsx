import type React from "react";
import { useState } from "react";
import * as S from "./styleddiv";

const REQUIRED_MSG = "필수 항목(*)을 입력해 주세요.";

interface FormData {
	title: string;
	description: string;
	assignmentNumber: string;
	startDate: string;
	dueDate: string;
	sectionId: string;
}

interface Section {
	sectionId: number;
	courseTitle: string;
	sectionName: string;
}

interface AssignmentAddModalProps {
	isOpen: boolean;
	formData: FormData;
	sections: Section[];
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	onInputChange: (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => void;
	loading?: boolean;
}

const AssignmentAddModal: React.FC<AssignmentAddModalProps> = ({
	isOpen,
	formData,
	sections,
	onClose,
	onSubmit,
	onInputChange,
	loading = false,
}) => {
	const [errors, setErrors] = useState<Record<string, boolean>>({});

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const errs: Record<string, boolean> = {};
		if (!formData.sectionId?.trim()) errs.sectionId = true;
		if (!formData.title?.trim()) errs.title = true;
		if (!formData.startDate?.trim()) errs.startDate = true;
		if (!formData.dueDate?.trim()) errs.dueDate = true;
		setErrors(errs);
		if (Object.keys(errs).length > 0) {
			return;
		}
		onSubmit(e);
	};

	const hasErrors = Object.keys(errors).length > 0;

	return (
		<S.ModalOverlay>
			<S.ModalContent>
				<S.ModalHeader>
					<S.ModalTitle>새 과제 생성</S.ModalTitle>
					<S.ModalCloseButton onClick={onClose}>✕</S.ModalCloseButton>
				</S.ModalHeader>

				<S.Form onSubmit={handleSubmit}>
					{hasErrors && (
						<S.RequiredMessage role="alert">{REQUIRED_MSG}</S.RequiredMessage>
					)}
					<S.FormGroup>
						<S.Label htmlFor="sectionId">분반 선택 *</S.Label>
						<S.Select
							id="sectionId"
							name="sectionId"
							value={formData.sectionId}
							onChange={(e) => {
								setErrors((prev) => ({ ...prev, sectionId: false }));
								onInputChange(e);
							}}
							required
							style={errors.sectionId ? { borderColor: "#dc2626" } : undefined}
						>
							<option value="">분반을 선택하세요</option>
							{sections.map((section) => (
								<option key={section.sectionId} value={section.sectionId}>
									{section.courseTitle}
								</option>
							))}
						</S.Select>
					</S.FormGroup>

					<S.FormRow>
						<S.FormGroup>
							<S.Label htmlFor="title">과제명 *</S.Label>
							<S.Input
								type="text"
								id="title"
								name="title"
								value={formData.title}
								onChange={(e) => {
									setErrors((prev) => ({ ...prev, title: false }));
									onInputChange(e);
								}}
								placeholder="과제명을 입력하세요"
								required
								style={errors.title ? { borderColor: "#dc2626" } : undefined}
							/>
						</S.FormGroup>

						<S.FormGroup>
							<S.Label htmlFor="assignmentNumber">과제 번호</S.Label>
							<S.Input
								type="text"
								id="assignmentNumber"
								name="assignmentNumber"
								value={formData.assignmentNumber}
								onChange={onInputChange}
								placeholder="예: HW1, Assignment1"
							/>
						</S.FormGroup>
					</S.FormRow>

					<S.FormGroup>
						<S.Label htmlFor="description">과제 설명</S.Label>
						<S.Textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={onInputChange}
							placeholder="과제에 대한 상세 설명을 입력하세요"
							rows={4}
						/>
					</S.FormGroup>

					<S.FormRow>
						<S.FormGroup>
							<S.Label htmlFor="startDate">시작일 *</S.Label>
							<S.Input
								type="datetime-local"
								id="startDate"
								name="startDate"
								value={formData.startDate}
								onChange={(e) => {
									setErrors((prev) => ({ ...prev, startDate: false }));
									onInputChange(e);
								}}
								style={
									errors.startDate ? { borderColor: "#dc2626" } : undefined
								}
							/>
						</S.FormGroup>

						<S.FormGroup>
							<S.Label htmlFor="dueDate">마감일 *</S.Label>
							<S.Input
								type="datetime-local"
								id="dueDate"
								name="dueDate"
								value={formData.dueDate}
								onChange={(e) => {
									setErrors((prev) => ({ ...prev, dueDate: false }));
									onInputChange(e);
								}}
								style={errors.dueDate ? { borderColor: "#dc2626" } : undefined}
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
							{loading ? "생성 중..." : "과제 생성"}
						</S.ButtonPrimary>
					</S.FormActions>
				</S.Form>
			</S.ModalContent>
		</S.ModalOverlay>
	);
};

export default AssignmentAddModal;
