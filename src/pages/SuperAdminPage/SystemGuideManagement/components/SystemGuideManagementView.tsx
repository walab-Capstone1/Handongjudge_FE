import Header from "../../../../components/Layout/Header";
import LoadingSpinner from "../../../../components/UI/LoadingSpinner";
import * as S from "../../../TutorPage/Dashboard/styles";
import type { SystemGuideManagementHookReturn } from "../hooks/useSystemGuideManagement";

export default function SystemGuideManagementView(
	d: SystemGuideManagementHookReturn,
) {
	if (d.loading) {
		return (
			<>
				<Header onUserNameClick={() => {}} />
				<LoadingSpinner message="시스템 가이드를 불러오는 중..." />
			</>
		);
	}

	return (
		<>
			<Header onUserNameClick={() => {}} />
			<S.Container>
				<S.Header>
					<S.Title>시스템 가이드 관리</S.Title>
					<S.Button onClick={() => alert("가이드 작성 기능 준비 중")}>
						+ 새 가이드 작성
					</S.Button>
				</S.Header>
				<S.CoursesGrid>
					{d.guides.map((guide) => (
						<S.CourseCard key={guide.id}>
							<S.CourseHeader>
								<S.CourseTitle>{guide.title}</S.CourseTitle>
								{guide.category && <S.Badge>{guide.category}</S.Badge>}
							</S.CourseHeader>
							<S.CourseInfo>{guide.content.substring(0, 150)}...</S.CourseInfo>
							<div
								style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
							>
								<S.ActionButton onClick={() => alert("수정 기능 준비 중")}>
									수정
								</S.ActionButton>
								<S.ActionButton onClick={() => d.handleDelete(guide.id)}>
									삭제
								</S.ActionButton>
							</div>
						</S.CourseCard>
					))}
				</S.CoursesGrid>
				{d.guides.length === 0 && (
					<div
						style={{
							textAlign: "center",
							padding: "4rem",
							background: "white",
							borderRadius: "8px",
						}}
					>
						<p style={{ color: "#9ca3af" }}>등록된 시스템 가이드가 없습니다.</p>
					</div>
				)}
			</S.Container>
		</>
	);
}
