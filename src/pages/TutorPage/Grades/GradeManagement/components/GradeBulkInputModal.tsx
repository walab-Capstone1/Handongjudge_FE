import * as S from "../styles";
import type { StudentGradeRow } from "../types";

export interface GradeBulkInputModalProps {
	show: boolean;
	grades: StudentGradeRow[];
	bulkInputs: Record<number, number | "">;
	setBulkInputs: React.Dispatch<
		React.SetStateAction<Record<number, number | "">>
	>;
	bulkSaving: boolean;
	onClose: () => void;
	onSave: () => void;
}

export default function GradeBulkInputModal({
	show,
	grades,
	bulkInputs,
	setBulkInputs,
	bulkSaving,
	onClose,
	onSave,
}: GradeBulkInputModalProps) {
	if (!show || grades.length === 0) return null;

	return (
		<S.ModalOverlay
			onClick={() => {
				onClose();
				setBulkInputs({});
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape") {
					onClose();
					setBulkInputs({});
				}
			}}
			role="button"
			tabIndex={0}
		>
			<S.ModalContent
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<S.ModalHeader>
					<h2>일괄 점수 입력</h2>
					<S.ModalClose
						type="button"
						onClick={() => {
							onClose();
							setBulkInputs({});
						}}
						aria-label="닫기"
					>
						×
					</S.ModalClose>
				</S.ModalHeader>
				<S.ModalBody>
					<S.BulkInfo>
						<p>문제별로 모든 학생에게 동일한 점수를 일괄 입력할 수 있습니다.</p>
					</S.BulkInfo>
					<S.BulkInputs>
						{grades[0]?.problemGrades?.map((problem) => (
							<S.BulkInputRow key={problem.problemId}>
								<S.BulkLabel
									as="label"
									htmlFor={`bulk-problem-${problem.problemId}`}
								>
									{problem.problemTitle ?? ""} (배점: {problem.points ?? 0}
									점)
								</S.BulkLabel>
								<S.BulkInput
									id={`bulk-problem-${problem.problemId}`}
									type="number"
									min={0}
									max={problem.points ?? 100}
									value={bulkInputs[problem.problemId] ?? ""}
									onChange={(e) => {
										const v =
											e.target.value === "" ? "" : Number(e.target.value);
										setBulkInputs((prev) => ({
											...prev,
											[problem.problemId]: v,
										}));
									}}
									placeholder="점수 입력"
								/>
							</S.BulkInputRow>
						))}
					</S.BulkInputs>
					<S.ModalActions>
						<S.BtnCancel
							type="button"
							onClick={() => {
								onClose();
								setBulkInputs({});
							}}
						>
							취소
						</S.BtnCancel>
						<S.BtnSubmit
							type="button"
							onClick={onSave}
							disabled={bulkSaving || Object.keys(bulkInputs).length === 0}
						>
							{bulkSaving ? "저장 중..." : "일괄 저장"}
						</S.BtnSubmit>
					</S.ModalActions>
				</S.ModalBody>
			</S.ModalContent>
		</S.ModalOverlay>
	);
}
