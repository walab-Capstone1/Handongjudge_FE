import type React from "react";
import * as S from "../styles";
import type { DashboardFormData, DashboardCourse } from "../types";

interface CreateSectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	formData: DashboardFormData;
	setFormData: React.Dispatch<React.SetStateAction<DashboardFormData>>;
	availableCourses: DashboardCourse[];
	onSubmit: () => void;
}

const CreateSectionModal: React.FC<CreateSectionModalProps> = ({
	isOpen,
	onClose,
	formData,
	setFormData,
	availableCourses,
	onSubmit,
}) => {
	if (!isOpen) return null;

	return (
		<S.ModalOverlay onClick={onClose}>
			<S.ModalContent onClick={(e) => e.stopPropagation()}>
				<S.ModalHeader>
					<h2>새 수업 만들기</h2>
					<S.ModalClose onClick={onClose}>×</S.ModalClose>
				</S.ModalHeader>
				<S.ModalBody>
					<S.FormGroup>
						<label>강의 선택 또는 새 강의 제목 입력</label>
						<S.FormSelect
							value={formData.courseId}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									courseId: e.target.value,
									courseTitle: "",
								}))
							}
						>
							<option value="">새 강의 만들기</option>
							{availableCourses.map((course) => (
								<option key={course.id} value={course.id}>
									{course.title}
								</option>
							))}
						</S.FormSelect>
					</S.FormGroup>
					{!formData.courseId && (
						<>
							<S.FormGroup>
								<label>새 강의 제목</label>
								<S.FormInput
									type="text"
									value={formData.courseTitle}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, courseTitle: e.target.value }))
									}
									placeholder="예: 자바프로그래밍"
								/>
							</S.FormGroup>
							<S.FormGroup>
								<label>수업 설명</label>
								<S.FormTextarea
									value={formData.description}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, description: e.target.value }))
									}
									placeholder="수업에 대한 설명을 입력하세요 (선택사항)"
									rows={3}
								/>
							</S.FormGroup>
						</>
					)}
					<S.FormRow>
						<S.FormGroup>
							<label>년도</label>
							<S.FormInput
								type="number"
								value={formData.year}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, year: e.target.value }))
								}
								placeholder="2025"
								min={2020}
								max={2099}
							/>
						</S.FormGroup>
						<S.FormGroup>
							<label>구분</label>
							<S.FormSelect
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
						onClick={onSubmit}
						disabled={!formData.courseId && !formData.courseTitle}
					>
						생성하기
					</S.BtnSubmit>
				</S.ModalFooter>
			</S.ModalContent>
		</S.ModalOverlay>
	);
};

export default CreateSectionModal;
