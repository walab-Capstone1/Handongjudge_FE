import type { FC } from "react";
import { removeCopyLabel } from "../../../../../utils/problemUtils";
import * as S from "../styles";
import type { CodingTestManagementHookReturn } from "../hooks/useCodingTestManagement";

interface SubmissionCodeModalProps {
	d: CodingTestManagementHookReturn;
}

function getResultLabel(result: string) {
	const labels: Record<string, string> = {
		AC: "정답",
		WA: "오답",
		TLE: "시간초과",
		RE: "런타임에러",
		CE: "컴파일에러",
		MLE: "메모리초과",
		OLE: "출력초과",
	};
	return labels[result] ?? result ?? "-";
}

const SubmissionCodeModal: FC<SubmissionCodeModalProps> = ({ d }) => {
	if (!d.showCodeModal) return null;

	return (
		<S.ModalOverlay onClick={d.closeCodeModal}>
			<S.ModalContent $large onClick={(e) => e.stopPropagation()}>
				<S.ModalHeader>
					<h2>제출 코드 상세</h2>
					<S.ModalClose type="button" onClick={d.closeCodeModal}>
						×
					</S.ModalClose>
				</S.ModalHeader>
				<S.ModalBody>
					{d.submissionCodeLoading ? (
						<S.NoData>
							<p>코드를 불러오는 중...</p>
						</S.NoData>
					) : d.submissionCodeData ? (
						<>
							<div
								style={{
									display: "flex",
									gap: "1rem",
									marginBottom: "1rem",
									flexWrap: "wrap",
								}}
							>
								<span>
									<strong>문제:</strong>{" "}
									{removeCopyLabel(d.submissionCodeData.problemTitle)}
								</span>
								<span>
									<strong>결과:</strong> {getResultLabel(d.submissionCodeData.result)}
								</span>
								<span>
									<strong>제출시간:</strong>{" "}
									{d.formatDateTime(d.submissionCodeData.submittedAt)}
								</span>
								<span>
									<strong>언어:</strong> {d.submissionCodeData.language ?? "-"}
								</span>
							</div>
							<pre
								style={{
									background: "#1e293b",
									color: "#e2e8f0",
									padding: "1rem",
									borderRadius: "8px",
									overflow: "auto",
									maxHeight: "400px",
									fontSize: "0.875rem",
									whiteSpace: "pre-wrap",
									wordBreak: "break-word",
								}}
							>
								{d.submissionCodeData.code}
							</pre>
						</>
					) : (
						<S.NoData>
							<p>코드를 불러올 수 없습니다.</p>
						</S.NoData>
					)}
				</S.ModalBody>
				<S.ModalFooter>
					<S.CancelButton type="button" onClick={d.closeCodeModal}>
						닫기
					</S.CancelButton>
				</S.ModalFooter>
			</S.ModalContent>
		</S.ModalOverlay>
	);
};

export default SubmissionCodeModal;
