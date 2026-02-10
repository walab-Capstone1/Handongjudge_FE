import type { FC } from "react";
import { createPortal } from "react-dom";
import TutorLayout from "../../../../layouts/TutorLayout";
import LoadingSpinner from "../../../../components/UI/LoadingSpinner";
import { useNoticeEdit } from "./hooks/useNoticeEdit";
import * as S from "../NoticeCreatePage/styles";
import NoticeEditForm from "./components/NoticeEditForm";

const NoticeEditPage: FC = () => {
	const {
		loading,
		saving,
		currentSection,
		formData,
		setFormData,
		editorReady,
		handleSubmit,
		handleBack,
	} = useNoticeEdit();

	if (loading) {
		return (
			<TutorLayout selectedSection={currentSection}>
				<div style={{ padding: "2rem", textAlign: "center" }}>
					<p>공지사항을 불러오는 중...</p>
				</div>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={currentSection}>
			{saving &&
				createPortal(
					<div
						style={{
							position: "fixed",
							inset: 0,
							backgroundColor: "rgba(0,0,0,0.35)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							zIndex: 10000,
						}}
					>
						<div
							style={{
								background: "white",
								padding: "1.5rem 2rem",
								borderRadius: "12px",
								boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
							}}
						>
							<LoadingSpinner message="공지사항 수정 중..." />
						</div>
					</div>,
					document.body,
				)}
			<S.Page>
				<S.Header>
					<S.BackButton onClick={handleBack}>← 뒤로가기</S.BackButton>
					<S.HeaderContent>
						<h1>공지사항 수정</h1>
						{currentSection && (
							<S.SectionInfo>{currentSection.courseTitle}</S.SectionInfo>
						)}
					</S.HeaderContent>
				</S.Header>
				<S.Body>
					<NoticeEditForm
						formData={formData}
						setFormData={setFormData}
						editorReady={editorReady}
						saving={saving}
						onSubmit={handleSubmit}
						onBack={handleBack}
					/>
				</S.Body>
			</S.Page>
		</TutorLayout>
	);
};

export default NoticeEditPage;
