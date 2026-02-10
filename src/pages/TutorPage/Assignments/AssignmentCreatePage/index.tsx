import type { FC } from "react";
import { createPortal } from "react-dom";
import TutorLayout from "../../../../layouts/TutorLayout";
import LoadingSpinner from "../../../../components/UI/LoadingSpinner";
import { useAssignmentCreate } from "./hooks/useAssignmentCreate";
import * as S from "./styles";
import AssignmentCreateForm from "./components/AssignmentCreateForm";

const AssignmentCreatePage: FC = () => {
	const {
		loading,
		currentSection,
		formData,
		handleInputChange,
		handleSubmit,
		handleBack,
	} = useAssignmentCreate();

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
							<LoadingSpinner message="과제 생성 중..." />
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
						<h1>새 과제 만들기</h1>
						{currentSection && (
							<S.SectionInfo>
								{currentSection.courseTitle} - {currentSection.sectionNumber}{" "}
								분반
							</S.SectionInfo>
						)}
					</S.HeaderContent>
				</S.Header>
				<S.Body>
					<AssignmentCreateForm
						formData={formData}
						onInputChange={handleInputChange}
						loading={loading}
						onSubmit={handleSubmit}
						onBack={handleBack}
					/>
				</S.Body>
			</S.Page>
		</TutorLayout>
	);
};

export default AssignmentCreatePage;
