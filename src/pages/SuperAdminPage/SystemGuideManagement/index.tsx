import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import APIService from "../../../services/APIService";
import Header from "../../../components/Header";
import LoadingSpinner from "../../../components/LoadingSpinner";
import * as S from "../../TutorPage/Tutordashboard/styles";
import type { SystemGuide } from "./types";

const SystemGuideManagement: React.FC = () => {
	const { user } = useAuth();
	const [guides, setGuides] = useState<SystemGuide[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchGuides();
	}, []);

	const fetchGuides = async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllSystemGuides();
			setGuides(response?.data || response || []);
		} catch (error) {
			console.error("시스템 가이드 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (guideId: number) => {
		if (!window.confirm("정말로 삭제하시겠습니까?")) return;

		try {
			await APIService.deleteSystemGuide(guideId);
			alert("삭제되었습니다.");
			fetchGuides();
		} catch (error) {
			console.error("삭제 실패:", error);
			alert("삭제에 실패했습니다.");
		}
	};

	if (loading) {
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
					{guides.map((guide) => (
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
								<S.ActionButton onClick={() => handleDelete(guide.id)}>
									삭제
								</S.ActionButton>
							</div>
						</S.CourseCard>
					))}
				</S.CoursesGrid>

				{guides.length === 0 && (
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
};

export default SystemGuideManagement;
