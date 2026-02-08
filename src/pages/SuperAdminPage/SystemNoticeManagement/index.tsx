import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import APIService from "../../../services/APIService";
import Header from "../../../components/Header";
import LoadingSpinner from "../../../components/LoadingSpinner";
import * as S from "../../TutorPage/TutorDashboard/styles";
import type { SystemNotice, CreateSystemNoticeData } from "./types";

const SystemNoticeManagement: React.FC = () => {
	const { user } = useAuth();
	const [notices, setNotices] = useState<SystemNotice[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [formData, setFormData] = useState<CreateSystemNoticeData>({
		title: "",
		content: "",
		isActive: true,
	});

	useEffect(() => {
		fetchNotices();
	}, []);

	const fetchNotices = async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllSystemNotices();
			setNotices(response?.data || response || []);
		} catch (error) {
			console.error("시스템 공지 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreate = async () => {
		if (!formData.title.trim()) {
			alert("제목을 입력하세요.");
			return;
		}

		try {
			await APIService.createSystemNotice(formData);
			alert("시스템 공지가 생성되었습니다.");
			setShowModal(false);
			setFormData({ title: "", content: "", isActive: true });
			fetchNotices();
		} catch (error) {
			console.error("시스템 공지 생성 실패:", error);
			alert("생성에 실패했습니다.");
		}
	};

	const handleDelete = async (noticeId: number) => {
		if (!window.confirm("정말로 삭제하시겠습니까?")) return;

		try {
			await APIService.deleteSystemNotice(noticeId);
			alert("삭제되었습니다.");
			fetchNotices();
		} catch (error) {
			console.error("삭제 실패:", error);
			alert("삭제에 실패했습니다.");
		}
	};

	const toggleActive = async (noticeId: number, currentStatus: boolean) => {
		try {
			await APIService.updateSystemNotice(noticeId, {
				isActive: !currentStatus,
			});
			fetchNotices();
		} catch (error) {
			console.error("상태 변경 실패:", error);
		}
	};

	if (loading) {
		return (
			<>
				<Header onUserNameClick={() => {}} />
				<LoadingSpinner message="시스템 공지를 불러오는 중..." />
			</>
		);
	}

	return (
		<>
			<Header onUserNameClick={() => {}} />
			<S.Container>
				<S.Header>
					<S.Title>시스템 공지사항 관리</S.Title>
					<S.Button onClick={() => setShowModal(true)}>+ 새 공지 작성</S.Button>
				</S.Header>

				<S.CoursesGrid>
					{notices.map((notice) => (
						<S.CourseCard key={notice.id}>
							<S.CourseHeader>
								<S.CourseTitle>{notice.title}</S.CourseTitle>
								<S.Badge
									style={{
										background: notice.isActive ? "#d1fae5" : "#f3f4f6",
										color: notice.isActive ? "#059669" : "#6b7280",
									}}
								>
									{notice.isActive ? "활성" : "비활성"}
								</S.Badge>
							</S.CourseHeader>
							<S.CourseInfo>{notice.content.substring(0, 100)}...</S.CourseInfo>
							<div
								style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
							>
								<S.ActionButton
									onClick={() => toggleActive(notice.id, notice.isActive)}
								>
									{notice.isActive ? "비활성화" : "활성화"}
								</S.ActionButton>
								<S.ActionButton onClick={() => handleDelete(notice.id)}>
									삭제
								</S.ActionButton>
							</div>
						</S.CourseCard>
					))}
				</S.CoursesGrid>

				{notices.length === 0 && (
					<div
						style={{
							textAlign: "center",
							padding: "4rem",
							background: "white",
							borderRadius: "8px",
						}}
					>
						<p style={{ color: "#9ca3af" }}>등록된 시스템 공지가 없습니다.</p>
					</div>
				)}

				{showModal && (
					<div
						style={{
							position: "fixed",
							inset: 0,
							background: "rgba(0,0,0,0.5)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							zIndex: 1000,
						}}
					>
						<div
							style={{
								background: "white",
								padding: "2rem",
								borderRadius: "8px",
								width: "90%",
								maxWidth: "600px",
							}}
						>
							<h3 style={{ margin: "0 0 1.5rem 0" }}>새 시스템 공지 작성</h3>
							<div style={{ marginBottom: "1rem" }}>
								<label
									style={{
										display: "block",
										marginBottom: "0.5rem",
										fontWeight: 600,
									}}
								>
									제목
								</label>
								<input
									type="text"
									value={formData.title}
									onChange={(e) =>
										setFormData({ ...formData, title: e.target.value })
									}
									style={{
										width: "100%",
										padding: "0.75rem",
										border: "1px solid #e5e7eb",
										borderRadius: "6px",
									}}
								/>
							</div>
							<div style={{ marginBottom: "1rem" }}>
								<label
									style={{
										display: "block",
										marginBottom: "0.5rem",
										fontWeight: 600,
									}}
								>
									내용
								</label>
								<textarea
									value={formData.content}
									onChange={(e) =>
										setFormData({ ...formData, content: e.target.value })
									}
									rows={6}
									style={{
										width: "100%",
										padding: "0.75rem",
										border: "1px solid #e5e7eb",
										borderRadius: "6px",
									}}
								/>
							</div>
							<div style={{ marginBottom: "1.5rem" }}>
								<label
									style={{
										display: "flex",
										alignItems: "center",
										gap: "0.5rem",
									}}
								>
									<input
										type="checkbox"
										checked={formData.isActive}
										onChange={(e) =>
											setFormData({ ...formData, isActive: e.target.checked })
										}
									/>
									즉시 활성화
								</label>
							</div>
							<div
								style={{
									display: "flex",
									gap: "0.5rem",
									justifyContent: "flex-end",
								}}
							>
								<button
									onClick={() => setShowModal(false)}
									style={{
										padding: "0.75rem 1.5rem",
										border: "1px solid #e5e7eb",
										borderRadius: "6px",
										background: "white",
										cursor: "pointer",
									}}
								>
									취소
								</button>
								<button
									onClick={handleCreate}
									style={{
										padding: "0.75rem 1.5rem",
										border: "none",
										borderRadius: "6px",
										background: "#667eea",
										color: "white",
										cursor: "pointer",
									}}
								>
									생성
								</button>
							</div>
						</div>
					</div>
				)}
			</S.Container>
		</>
	);
};

export default SystemNoticeManagement;
