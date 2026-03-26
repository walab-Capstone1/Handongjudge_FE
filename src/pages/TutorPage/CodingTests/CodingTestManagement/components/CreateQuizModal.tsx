import type { FC } from "react";
import * as S from "../styles";
import type { CodingTestManagementHookReturn } from "../hooks/useCodingTestManagement";

interface CreateQuizModalProps {
	d: CodingTestManagementHookReturn;
}

const CreateQuizModal: FC<CreateQuizModalProps> = ({ d }) => {
	if (!d.showCreateModal) return null;

	return (
		<S.ModalOverlay
			onClick={() => d.setShowCreateModal(false)}
			onKeyDown={(e) => {
				if (e.key === "Escape") d.setShowCreateModal(false);
			}}
			role="presentation"
		>
			<S.ModalContent onClick={(e) => e.stopPropagation()}>
				<S.ModalHeader>
					<h2>새 코딩 테스트 만들기</h2>
					<S.ModalClose
						type="button"
						onClick={() => d.setShowCreateModal(false)}
					>
						×
					</S.ModalClose>
				</S.ModalHeader>
				<S.ModalBody>
					<S.FormGroup>
						<label htmlFor="create-quiz-title">제목 *</label>
						<input
							id="create-quiz-title"
							type="text"
							value={d.formData.title}
							onChange={(e) =>
								d.setFormData((prev) => ({ ...prev, title: e.target.value }))
							}
							placeholder="코딩 테스트 제목을 입력하세요"
						/>
					</S.FormGroup>
					<S.FormGroup>
						<label htmlFor="create-quiz-desc">설명</label>
						<textarea
							id="create-quiz-desc"
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
							<label htmlFor="create-quiz-start">시작 시간 *</label>
							<input
								id="create-quiz-start"
								type="datetime-local"
								value={d.formData.startTime}
								onChange={(e) =>
									d.setFormData((prev) => ({ ...prev, startTime: e.target.value }))
								}
							/>
						</S.FormGroup>
						<S.FormGroup>
							<label htmlFor="create-quiz-end">종료 시간 *</label>
							<input
								id="create-quiz-end"
								type="datetime-local"
								value={d.formData.endTime}
								onChange={(e) =>
									d.setFormData((prev) => ({ ...prev, endTime: e.target.value }))
								}
							/>
						</S.FormGroup>
					</S.FormRow>
					<S.FormGroup>
						<span
							id="create-quiz-d.problems-label"
							style={{
								fontWeight: 500,
								fontSize: "0.875rem",
								marginBottom: "0.5rem",
								display: "block",
							}}
						>
							문제 선택 *
						</span>
						<S.ProblemSelectSection aria-labelledby="create-quiz-d.problems-label">
							<S.BtnSelectProblems
								type="button"
								onClick={() => d.setShowAddProblemModal(true)}
							>
								문제 선택 ({d.selectedProblemIds.length}개 선택됨)
							</S.BtnSelectProblems>
							{d.selectedProblemIds.length > 0 && (
								<S.SelectedCount>
									{d.selectedProblemIds.length}개의 문제가 선택되었습니다.
								</S.SelectedCount>
							)}
						</S.ProblemSelectSection>
					</S.FormGroup>
					<S.ModalFooter>
						<S.CancelButton
							type="button"
							onClick={() => d.setShowCreateModal(false)}
						>
							취소
						</S.CancelButton>
						<S.SubmitButton
							type="button"
							onClick={d.handleSubmitCreate}
							disabled={d.isSubmittingCreate}
						>
							{d.isSubmittingCreate ? "생성 중..." : "생성"}
						</S.SubmitButton>
					</S.ModalFooter>
				</S.ModalBody>
			</S.ModalContent>
		</S.ModalOverlay>
	);
};

export default CreateQuizModal;
