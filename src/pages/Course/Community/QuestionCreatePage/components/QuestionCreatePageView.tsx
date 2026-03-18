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
		nickname,
		showNicknameModal,
		setShowNicknameModal,
		nicknameInput,
		setNicknameInput,
		nicknameError,
		setNicknameError,
		getSelectValue,
		handleSelectChange,
		handleSubmit,
		handleNicknameSubmit,
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
											}))
										}
										aria-label="익명으로 질문하기"
									/>
									<span>익명으로 질문하기</span>
									{formData.isAnonymous && nickname && (
										<S.NicknameDisplay>(별명: {nickname})</S.NicknameDisplay>
									)}
								</S.OptionLabel>
								<S.OptionDescription>
									익명으로 질문하면 이름 대신 별명이 표시됩니다
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

			{showNicknameModal && (
				<S.ModalOverlay
					onClick={() => setShowNicknameModal(false)}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Escape" || e.key === "Enter") {
							setShowNicknameModal(false);
						}
					}}
					aria-label="닫기"
				>
					<S.ModalContent
						onClick={(e) => e.stopPropagation()}
						role="dialog"
						aria-modal="true"
						aria-labelledby="nickname-modal-title"
					>
						<h2 id="nickname-modal-title">별명 설정</h2>
						<p>익명으로 질문하려면 별명을 설정해주세요</p>
						<S.ModalFormGroup>
							<input
								type="text"
								placeholder="별명 입력 (2-50자)"
								value={nicknameInput}
								onChange={(e) => {
									setNicknameInput(e.target.value);
									setNicknameError("");
								}}
								maxLength={50}
								aria-label="별명 입력"
							/>
							{nicknameError && (
								<S.ErrorMessage>{nicknameError}</S.ErrorMessage>
							)}
						</S.ModalFormGroup>
						<S.ModalActions>
							<S.BtnModalCancel
								type="button"
								onClick={() => {
									setShowNicknameModal(false);
									setFormData((prev) => ({
										...prev,
										isAnonymous: false,
									}));
								}}
							>
								취소
							</S.BtnModalCancel>
							<S.BtnModalSubmit type="button" onClick={handleNicknameSubmit}>
								설정
							</S.BtnModalSubmit>
						</S.ModalActions>
					</S.ModalContent>
				</S.ModalOverlay>
			)}
		</S.Container>
	);
}
