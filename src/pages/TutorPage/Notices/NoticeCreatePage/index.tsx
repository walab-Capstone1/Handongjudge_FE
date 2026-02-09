import type { FC } from "react";
import TutorLayout from "../../../../layouts/TutorLayout";
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
