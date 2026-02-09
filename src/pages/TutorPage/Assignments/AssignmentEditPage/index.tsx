import type { FC } from "react";
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
