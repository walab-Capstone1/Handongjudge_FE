import type React from "react";

interface TutorAccessGateProps {
	children: React.ReactNode;
}

/**
 * 튜터/관리 페이지 접근 게이트.
 * 학생도 본인 수업을 만들 수 있어야 하므로 접근 막지 않음.
 * (관리할 수업이 없으면 대시보드에서 빈 목록 + "수업 만들기"로 첫 수업 생성)
 */
const TutorAccessGate: React.FC<TutorAccessGateProps> = ({ children }) => {
	return <>{children}</>;
};

export default TutorAccessGate;
