import type { FC } from "react";
import TutorLayout from "../../../../layouts/TutorLayout";
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
