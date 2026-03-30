import type { FC } from "react";
import * as S from "../styles";
import type { CodingTestManagementHookReturn } from "../hooks/useCodingTestManagement";

interface EditQuizModalProps {
	d: CodingTestManagementHookReturn;
}

const EditQuizModal: FC<EditQuizModalProps> = ({ d }) => {
	if (!d.showEditModal || !d.selectedQuiz) return null;

	return (
		<S.ModalOverlay
			onClick={() => {
				d.setShowEditModal(false);
				d.setSelectedQuiz(null);
			}}
		>
			<S.ModalContent onClick={(e) => e.stopPropagation()}>
				<S.ModalHeader>
					<h2>코딩 테스트 수정</h2>
					<S.ModalClose
						type="button"
						onClick={() => {
							d.setShowEditModal(false);
							d.setSelectedQuiz(null);
						}}
					>
						×
					</S.ModalClose>
				</S.ModalHeader>
				<S.ModalBody>
					<S.FormGroup>
						<label htmlFor="edit-quiz-title">제목 *</label>
						<input
							id="edit-quiz-title"
							type="text"
							value={d.formData.title}
							onChange={(e) =>
								d.setFormData((prev) => ({ ...prev, title: e.target.value }))
							}
							placeholder="코딩 테스트 제목을 입력하세요"
						/>
					</S.FormGroup>
					<S.FormGroup>
						<label htmlFor="edit-quiz-desc">설명</label>
						<textarea
							id="edit-quiz-desc"
							value={d.formData.description}
							onChange={(e) =>
								d.setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder="코딩 테스트 설명을 입력하세요"
							rows={4}
						/>
					</S.FormGroup>
					<S.FormRow>
						<S.FormGroup>
							<label htmlFor="edit-quiz-start">시작 시간 *</label>
							<input
								id="edit-quiz-start"
								type="datetime-local"
								value={d.formData.startTime}
								onChange={(e) =>
									d.setFormData((prev) => ({ ...prev, startTime: e.target.value }))
								}
							/>
						</S.FormGroup>
						<S.FormGroup>
							<label htmlFor="edit-quiz-end">종료 시간 *</label>
							<input
								id="edit-quiz-end"
								type="datetime-local"
								value={d.formData.endTime}
								onChange={(e) =>
									d.setFormData((prev) => ({ ...prev, endTime: e.target.value }))
								}
							/>
						</S.FormGroup>
					</S.FormRow>
					<S.FormGroup>
						<p
							style={{
								margin: 0,
								fontSize: "0.875rem",
								color: "#64748b",
								lineHeight: 1.5,
							}}
						>
							문제 추가·제거는 목록에서 해당 코딩 테스트를 연 뒤「대회 문제」탭에서
							할 수 있습니다.
						</p>
					</S.FormGroup>
					<S.ModalFooter>
						<S.CancelButton
							type="button"
							onClick={() => {
								d.setShowEditModal(false);
								d.setSelectedQuiz(null);
							}}
						>
							취소
						</S.CancelButton>
						<S.SubmitButton
							type="button"
							onClick={d.handleSubmitEdit}
							disabled={d.isSubmittingEdit}
						>
							{d.isSubmittingEdit ? "수정 중..." : "수정"}
						</S.SubmitButton>
					</S.ModalFooter>
				</S.ModalBody>
			</S.ModalContent>
		</S.ModalOverlay>
	);
};

export default EditQuizModal;
