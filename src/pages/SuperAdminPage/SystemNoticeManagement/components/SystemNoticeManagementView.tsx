import Header from "../../../../components/Layout/Header";
import LoadingSpinner from "../../../../components/UI/LoadingSpinner";
import * as S from "../../../TutorPage/Dashboard/styles";
import type { SystemNoticeManagementHookReturn } from "../hooks/useSystemNoticeManagement";

export default function SystemNoticeManagementView(
	d: SystemNoticeManagementHookReturn,
) {
	if (d.loading) {
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
					<S.Button onClick={() => d.setShowModal(true)}>
						+ 새 공지 작성
					</S.Button>
				</S.Header>
				<S.CoursesGrid>
					{d.notices.map((notice) => (
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
									onClick={() => d.toggleActive(notice.id, notice.isActive)}
								>
									{notice.isActive ? "비활성화" : "활성화"}
								</S.ActionButton>
								<S.ActionButton onClick={() => d.handleDelete(notice.id)}>
									삭제
								</S.ActionButton>
							</div>
						</S.CourseCard>
					))}
				</S.CoursesGrid>
				{d.notices.length === 0 && (
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
				{d.showModal && (
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
									value={d.formData.title}
									onChange={(e) =>
										d.setFormData({ ...d.formData, title: e.target.value })
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
									value={d.formData.content}
									onChange={(e) =>
										d.setFormData({ ...d.formData, content: e.target.value })
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
										checked={d.formData.isActive}
										onChange={(e) =>
											d.setFormData({
												...d.formData,
												isActive: e.target.checked,
											})
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
									onClick={() => d.setShowModal(false)}
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
									onClick={d.handleCreate}
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
}
