import type { FC } from "react";
import { createPortal } from "react-dom";
import TutorLayout from "../../../../layouts/TutorLayout";
import LoadingSpinner from "../../../../components/UI/LoadingSpinner";
import { useNoticeCreate } from "./hooks/useNoticeCreate";
import * as S from "./styles";
import NoticeCreateForm from "./components/NoticeCreateForm";

const NoticeCreatePage: FC = () => {
	const {
		loading,
		currentSection,
		formData,
		setFormData,
		mounted,
		handleSubmit,
		handleBack,
	} = useNoticeCreate();

	return (
		<TutorLayout selectedSection={currentSection}>
			{loading &&
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
							<LoadingSpinner message="공지사항 작성 중..." />
						</div>
					</div>,
					document.body,
				)}
			<S.Page>
				<S.Header>
					<S.BackButton onClick={handleBack}>← 뒤로가기</S.BackButton>
					<S.HeaderContent>
						<h1>새 공지사항 작성</h1>
						{currentSection && (
							<S.SectionInfo>{currentSection.courseTitle}</S.SectionInfo>
						)}
					</S.HeaderContent>
				</S.Header>
				<S.Body>
					<NoticeCreateForm
						formData={formData}
						setFormData={setFormData}
						mounted={mounted}
						loading={loading}
						onSubmit={handleSubmit}
						onBack={handleBack}
					/>
				</S.Body>
			</S.Page>
		</TutorLayout>
	);
};

export default NoticeCreatePage;
