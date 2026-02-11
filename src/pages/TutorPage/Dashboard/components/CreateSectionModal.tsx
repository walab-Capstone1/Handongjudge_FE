import type React from "react";
import { useState } from "react";
import * as S from "../styles";
import type { DashboardFormData } from "../types";

const REQUIRED_MSG = "필수 항목(*)을 입력해 주세요.";

interface CreateSectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	formData: DashboardFormData;
	setFormData: React.Dispatch<React.SetStateAction<DashboardFormData>>;
	onSubmit: () => void;
}

const CreateSectionModal: React.FC<CreateSectionModalProps> = ({
	isOpen,
	onClose,
	formData,
	setFormData,
	onSubmit,
}) => {
	const [errors, setErrors] = useState<Record<string, boolean>>({});

	if (!isOpen) return null;

	const titleTrimmed = formData.courseTitle?.toString().trim() ?? "";
	const yearVal =
		formData.year != null && formData.year !== ""
			? Number(formData.year)
			: Number.NaN;
	const yearOk = !Number.isNaN(yearVal) && yearVal >= 2020 && yearVal <= 2099;
	const hasTitle = titleTrimmed.length > 0;

	const handleSubmit = () => {
		const errs: Record<string, boolean> = {};
		if (!hasTitle) errs.courseTitle = true;
		if (!yearOk) errs.year = true;
		setErrors(errs);
		if (Object.keys(errs).length > 0) return;
		onSubmit();
	};

	const hasErrors = Object.keys(errors).length > 0;

	return (
		<S.ModalOverlay onClick={onClose}>
			<S.ModalContent onClick={(e) => e.stopPropagation()}>
				<S.ModalHeader>
					<h2 style={{ color: "white" }}>새 수업 만들기</h2>
					<S.ModalClose onClick={onClose}>×</S.ModalClose>
				</S.ModalHeader>
				<S.ModalBody>
					{hasErrors && (
						<S.RequiredMessage role="alert">{REQUIRED_MSG}</S.RequiredMessage>
					)}
					<S.FormGroup>
						<label htmlFor="create-section-course-title">강의 제목 *</label>
						<S.FormInput
							id="create-section-course-title"
							type="text"
							value={formData.courseTitle}
							onChange={(e) => {
								setErrors((prev) => ({ ...prev, courseTitle: false }));
								setFormData((prev) => ({
									...prev,
									courseTitle: e.target.value,
								}));
							}}
							placeholder="예: 자바프로그래밍"
							style={
								errors.courseTitle ? { borderColor: "#dc2626" } : undefined
							}
						/>
					</S.FormGroup>
					<S.FormGroup>
						<label htmlFor="create-section-description">수업 설명</label>
						<S.FormTextarea
							id="create-section-description"
							value={formData.description}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder="수업에 대한 설명을 입력하세요 (선택사항)"
							rows={3}
						/>
					</S.FormGroup>
					<S.FormRow>
						<S.FormGroup>
							<label htmlFor="create-section-year">년도 *</label>
							<S.FormInput
								id="create-section-year"
								type="number"
								value={formData.year}
								onChange={(e) => {
									setErrors((prev) => ({ ...prev, year: false }));
									setFormData((prev) => ({ ...prev, year: e.target.value }));
								}}
								placeholder="2025"
								min={2020}
								max={2099}
								style={errors.year ? { borderColor: "#dc2626" } : undefined}
							/>
						</S.FormGroup>
						<S.FormGroup>
							<label htmlFor="create-section-semester">구분 *</label>
							<S.FormSelect
								id="create-section-semester"
								value={formData.semester}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, semester: e.target.value }))
								}
							>
								<option value="SPRING">1학기</option>
								<option value="SUMMER">여름학기</option>
								<option value="FALL">2학기</option>
								<option value="WINTER">겨울학기</option>
								<option value="CAMP">캠프</option>
								<option value="SPECIAL">특강</option>
								<option value="IRREGULAR">비정규 세션</option>
							</S.FormSelect>
						</S.FormGroup>
					</S.FormRow>
				</S.ModalBody>
				<S.ModalFooter>
					<S.BtnCancel onClick={onClose}>취소</S.BtnCancel>
					<S.BtnSubmit
						type="button"
						onClick={handleSubmit}
						disabled={!hasTitle || !yearOk}
					>
						생성하기
					</S.BtnSubmit>
				</S.ModalFooter>
			</S.ModalContent>
		</S.ModalOverlay>
	);
};

export default CreateSectionModal;
