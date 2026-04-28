import React from "react";
import CourseSidebar from "../../../../../components/Course/CourseSidebar";
import CourseHeader from "../../../../../components/Course/CourseHeader";
import TipTapEditor from "../../../../../components/Editor/TipTapEditor";
import * as S from "../styles";
import type { QuestionCreatePageHookReturn } from "../hooks/useQuestionCreatePage";

export default function QuestionCreatePageView(
	d: QuestionCreatePageHookReturn,
) {
	const {
		sectionId,
		navigate,
		loading,
		isSidebarCollapsed,
		sectionInfo,
		assignmentsWithProblems,
		formData,
		setFormData,
		getSelectValue,
		handleSelectChange,
		handleSubmit,
		handleToggleSidebar,
	} = d;

	if (!sectionId) return null;

	return (
		<S.Container $isCollapsed={isSidebarCollapsed}>
			<CourseSidebar
				sectionId={sectionId}
				activeMenu="커뮤니티"
				isCollapsed={isSidebarCollapsed}
				onMenuClick={() => {}}
				onToggleSidebar={handleToggleSidebar}
			/>
			<S.Content $isCollapsed={isSidebarCollapsed}>
				<CourseHeader
					courseName={
						sectionInfo?.courseTitle ?? sectionInfo?.courseName ?? "질문 작성"
					}
					onToggleSidebar={handleToggleSidebar}
					isSidebarCollapsed={isSidebarCollapsed}
				/>
				<S.Body>
					<S.PageHeader>
						<h1>질문 작성</h1>
						<p>궁금한 점을 자유롭게 질문해주세요</p>
					</S.PageHeader>

					<S.Form onSubmit={handleSubmit}>
						<S.FormGroup>
							<S.FormLabel>
								제목 <S.Required>*</S.Required>
							</S.FormLabel>
							<S.FormInput
								type="text"
								placeholder="질문 제목을 입력하세요"
								value={formData.title}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										title: e.target.value,
									}))
								}
								maxLength={200}
								aria-label="질문 제목"
							/>
							<S.CharCount>{formData.title.length}/200</S.CharCount>
						</S.FormGroup>

						<S.FormGroup>
							<S.FormLabel>관련 과제/문제 (선택)</S.FormLabel>
							<S.FormSelect
								value={getSelectValue()}
								onChange={(e) => handleSelectChange(e.target.value)}
								aria-label="관련 과제/문제 선택"
							>
								<option value="">과제/문제를 선택하세요</option>
								{assignmentsWithProblems.map((assignment) => (
									<React.Fragment key={assignment.id}>
										<option
											value={`assignment-${assignment.id}`}
											style={{
												fontWeight: "bold",
												backgroundColor: "#f0f0f0",
											}}
										>
											📁 {assignment.title}
										</option>
										{assignment.problems &&
											assignment.problems.length > 0 &&
											assignment.problems.map((problem) => (
												<option
													key={problem.id ?? problem.problemId}
													value={`assignment-${assignment.id}-problem-${problem.id ?? problem.problemId}`}
													style={{
														paddingLeft: "24px",
													}}
												>
													&nbsp;&nbsp;└{" "}
													{problem.title ??
														problem.problemTitle ??
														`문제 ${problem.id ?? problem.problemId}`}
												</option>
											))}
									</React.Fragment>
								))}
							</S.FormSelect>
						</S.FormGroup>

						<S.FormGroup>
							<S.FormLabel>
								내용 <S.Required>*</S.Required>
							</S.FormLabel>
							<TipTapEditor
								content={formData.content}
								onChange={(html) =>
									setFormData((prev) => ({
										...prev,
										content: html,
									}))
								}
								placeholder="질문 내용을 자세히 작성해주세요&#10;&#10;예시:&#10;1. 무엇을 구현하려고 했나요?&#10;2. 어떤 문제가 발생했나요?&#10;3. 어떤 시도를 해보셨나요?"
							/>
						</S.FormGroup>

						<S.FormOptions>
							<S.OptionGroup>
								<S.OptionLabel>
									<input
										type="checkbox"
										checked={formData.isAnonymous}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												isAnonymous: e.target.checked,
												anonymousUseNickname: e.target.checked
													? prev.anonymousUseNickname
													: true,
											}))
										}
										aria-label="익명으로 질문하기"
									/>
									<span>익명으로 질문하기</span>
								</S.OptionLabel>
								{formData.isAnonymous && (
									<S.AnonymousChoiceRow>
										<S.RadioChoice>
											<input
												type="radio"
												name="anon-display"
												checked={formData.anonymousUseNickname}
												onChange={() =>
													setFormData((prev) => ({
														...prev,
														anonymousUseNickname: true,
													}))
												}
											/>
											<span>무작위 별칭으로 표시 (형용사+동물 등)</span>
										</S.RadioChoice>
										<S.RadioChoice>
											<input
												type="radio"
												name="anon-display"
												checked={!formData.anonymousUseNickname}
												onChange={() =>
													setFormData((prev) => ({
														...prev,
														anonymousUseNickname: false,
													}))
												}
											/>
											<span>게시에는 '익명'으로만 표시</span>
										</S.RadioChoice>
									</S.AnonymousChoiceRow>
								)}
								<S.OptionDescription>
									무작위 별칭은 서버에서 이 수업 안에서 겹치지 않게 정해집니다.
									교수·TA는 작성자 실명을 볼 수 있습니다.
								</S.OptionDescription>
							</S.OptionGroup>

							<S.OptionGroup>
								<S.OptionLabel>
									<input
										type="checkbox"
										checked={!formData.isPublic}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												isPublic: !e.target.checked,
											}))
										}
										aria-label="비공개 질문"
									/>
									<span>비공개 질문 (교수만 볼 수 있음)</span>
								</S.OptionLabel>
								<S.OptionDescription>
									비공개로 설정하면 교수님만 질문을 볼 수 있습니다
								</S.OptionDescription>
							</S.OptionGroup>
						</S.FormOptions>

						<S.FormActions>
							<S.BtnCancel
								type="button"
								onClick={() => navigate(`/sections/${sectionId}/community`)}
							>
								취소
							</S.BtnCancel>
							<S.BtnSubmit type="submit" disabled={loading}>
								{loading ? "작성 중..." : "질문 작성"}
							</S.BtnSubmit>
						</S.FormActions>
					</S.Form>
				</S.Body>
			</S.Content>
		</S.Container>
	);
}
