import { createPortal } from "react-dom";
import TutorLayout from "../../../../../layouts/TutorLayout";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import type { ProblemEditHookReturn } from "../hooks/useProblemEdit";
import * as S from "../styles";
import ProblemEditBanners from "./ProblemEditBanners";
import ProblemEditBasicFields from "./ProblemEditBasicFields";
import ProblemEditDescriptionSection from "./ProblemEditDescriptionSection";
import ProblemEditInputOutputSection from "./ProblemEditInputOutputSection";
import ProblemEditSampleInputsSection from "./ProblemEditSampleInputsSection";
import ProblemEditTestcasesSection from "./ProblemEditTestcasesSection";

export default function ProblemEditView(d: ProblemEditHookReturn) {
	if (d.loading) {
		return (
			<TutorLayout>
				<S.ProblemEditGlobalStyle />
				<S.Container className="problem-edit">
					<S.LoadingContainer>
						<S.LoadingSpinner />
					</S.LoadingContainer>
				</S.Container>
			</TutorLayout>
		);
	}

	const back = d.getBackNavigation();

	return (
		<TutorLayout>
			{d.submitting &&
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
							<LoadingSpinner message="문제 수정 중..." />
						</div>
					</div>,
					document.body,
				)}
			<S.ProblemEditGlobalStyle />
			<S.Container className="problem-edit">
				<S.PageHeader>
					<S.PageTitle>문제 수정</S.PageTitle>
					<S.BackButton
						type="button"
						onClick={() => {
							d.navigate(back.path, { state: back.state });
						}}
						title="뒤로가기"
					>
						← 뒤로가기
					</S.BackButton>
				</S.PageHeader>

				{d.error && <S.ErrorMessage>{d.error}</S.ErrorMessage>}

				<ProblemEditBanners
					enableFullEdit={d.enableFullEdit}
					setEnableFullEdit={d.setEnableFullEdit}
				/>

				<S.Form onSubmit={d.handleSubmit}>
					<S.Step>
						<S.FormGrid>
							<ProblemEditBasicFields
								formData={d.formData}
								currentTag={d.currentTag}
								setCurrentTag={d.setCurrentTag}
								zipFile={d.zipFile}
								enableFullEdit={d.enableFullEdit}
								handleInputChange={d.handleInputChange}
								handleTagAdd={d.handleTagAdd}
								handleTagKeyPress={d.handleTagKeyPress}
								handleTagRemove={d.handleTagRemove}
								handleZipFileChange={d.handleZipFileChange}
							/>

						<ProblemEditDescriptionSection
							descriptionRef={d.descriptionRef}
							formData={d.formData}
							setFormData={d.setFormData}
							enableFullEdit={d.enableFullEdit}
							getFullDescription={d.getFullDescription}
							insertMarkdownText={d.insertMarkdownText}
							wrapWithMarkdown={d.wrapWithMarkdown}
							insertMarkdownHeading={d.insertMarkdownHeading}
						/>

							<ProblemEditInputOutputSection
								formData={d.formData}
								enableFullEdit={d.enableFullEdit}
								handleInputChange={d.handleInputChange}
							/>

							<ProblemEditSampleInputsSection
								formData={d.formData}
								enableFullEdit={d.enableFullEdit}
								handleSampleInputChange={d.handleSampleInputChange}
								addSampleInput={d.addSampleInput}
								removeSampleInput={d.removeSampleInput}
							/>

							<ProblemEditTestcasesSection
								formData={d.formData}
								enableFullEdit={d.enableFullEdit}
								parsedTestCases={d.parsedTestCases}
								showParsedTestCases={d.showParsedTestCases}
								setShowParsedTestCases={d.setShowParsedTestCases}
								handleTestcaseAdd={d.handleTestcaseAdd}
								handleTestcaseRemove={d.handleTestcaseRemove}
								handleTestcaseChange={d.handleTestcaseChange}
							/>
						</S.FormGrid>

						<S.Actions>
							<S.BackButton
								type="button"
								onClick={() => {
									d.navigate(back.path, { state: back.state });
								}}
								disabled={d.submitting}
								title="뒤로가기"
							>
								← 뒤로가기
							</S.BackButton>
							<S.SubmitButton type="submit" disabled={d.submitting}>
								{d.submitting ? "수정 중..." : "수정 완료"}
							</S.SubmitButton>
						</S.Actions>
					</S.Step>
				</S.Form>
			</S.Container>
		</TutorLayout>
	);
}
