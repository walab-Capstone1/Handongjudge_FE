import type React from "react";

interface SubmissionHistoryProps {
	problemId: number;
	sectionId: number;
	userId: number;
	onClose: () => void;
}

// SubmissionHistory는 APIService에 getSubmissionHistory 메서드가 없어 임시로 빈 컴포넌트로 대체
const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({ onClose }) => {
	return (
		<div style={{ padding: "2rem", textAlign: "center" }}>
			<h3>제출 히스토리</h3>
			<p>제출 히스토리 기능은 준비 중입니다.</p>
			<button onClick={onClose}>닫기</button>
		</div>
	);
};

export default SubmissionHistory;
