import type { FC } from "react";
import { createPortal } from "react-dom";
import TutorLayout from "../../../../layouts/TutorLayout";
import LoadingSpinner from "../../../../components/UI/LoadingSpinner";
import { useAssignmentEdit } from "./hooks/useAssignmentEdit";
import * as S from "./styles";
import AssignmentEditForm from "./components/AssignmentEditForm";

const AssignmentEditPage: FC = () => {
	const {
		loading,
		submitting,
		currentSection,
		formData,
		handleInputChange,
		handleSubmit,
		handleBack,
	} = useAssignmentEdit();

	if (loading) {
		return (
			<TutorLayout selectedSection={currentSection}>
				<LoadingSpinner message="과제 정보를 불러오는 중..." />
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={currentSection}>
			{submitting &&
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
							<LoadingSpinner message="과제 수정 중..." />
						</div>
					</div>,
					document.body,
				)}
			<S.Page>
				<S.Header>
					<S.BackButton type="button" onClick={handleBack}>
						← 뒤로가기
					</S.BackButton>
					<S.HeaderContent>
						<h1>과제 수정</h1>
						{currentSection && (
							<S.SectionInfo>
								{currentSection.courseTitle} - {currentSection.sectionNumber}{" "}
								분반
							</S.SectionInfo>
						)}
					</S.HeaderContent>
				</S.Header>
				<S.Body>
					<AssignmentEditForm
						formData={formData}
						onInputChange={handleInputChange}
						submitting={submitting}
						onSubmit={handleSubmit}
						onBack={handleBack}
					/>
				</S.Body>
			</S.Page>
		</TutorLayout>
	);
};

export default AssignmentEditPage;
