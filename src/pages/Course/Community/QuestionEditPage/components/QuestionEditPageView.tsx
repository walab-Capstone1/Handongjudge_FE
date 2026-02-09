import CourseSidebar from "../../../../../components/Course/CourseSidebar";
import CourseHeader from "../../../../../components/Course/CourseHeader";
import type { QuestionEditPageHookReturn } from "../hooks/useQuestionEditPage";
import * as S from "../styles";

export default function QuestionEditPageView(d: QuestionEditPageHookReturn) {
	const courseNameDisplay = d.sectionInfo
		? d.sectionInfo.sectionNumber
			? `[${d.sectionInfo.courseTitle ?? ""}] ${d.sectionInfo.sectionNumber}분반`
			: (d.sectionInfo.courseTitle ?? "질문 수정")
		: "로딩 중...";

	if (d.loading) {
		return (
			<S.Container $isCollapsed={d.isSidebarCollapsed}>
				<CourseSidebar
					sectionId={d.sectionId}
					activeMenu="커뮤니티"
					isCollapsed={d.isSidebarCollapsed}
					onMenuClick={() => {}}
				/>
				<S.Content $isCollapsed={d.isSidebarCollapsed}>
					<CourseHeader
						courseName={courseNameDisplay}
						onToggleSidebar={d.handleToggleSidebar}
						isSidebarCollapsed={d.isSidebarCollapsed}
					/>
					<S.Body>
						<S.LoadingMessage>로딩 중...</S.LoadingMessage>
					</S.Body>
				</S.Content>
			</S.Container>
		);
	}

	return (
		<S.Container $isCollapsed={d.isSidebarCollapsed}>
			<CourseSidebar
				sectionId={d.sectionId}
				activeMenu="커뮤니티"
				isCollapsed={d.isSidebarCollapsed}
				onMenuClick={() => {}}
			/>
			<S.Content $isCollapsed={d.isSidebarCollapsed}>
				<CourseHeader
					courseName={d.sectionInfo?.courseTitle ?? "질문 수정"}
					onToggleSidebar={d.handleToggleSidebar}
					isSidebarCollapsed={d.isSidebarCollapsed}
				/>
				<S.Body>
					<S.PageHeader>
						<h1>질문 수정</h1>
						<p>질문 내용을 수정해주세요</p>
					</S.PageHeader>

					<S.Form onSubmit={d.handleSubmit}>
						<S.FormGroup>
							<S.FormLabel>
								제목 <S.Required>*</S.Required>
							</S.FormLabel>
							<S.FormInput
								type="text"
								placeholder="질문 제목을 입력하세요"
								value={d.formData.title}
								onChange={(e) =>
									d.setFormData((prev) => ({
										...prev,
										title: e.target.value,
									}))
								}
								maxLength={200}
								aria-label="질문 제목"
							/>
							<S.CharCount>{d.formData.title.length}/200</S.CharCount>
						</S.FormGroup>

						<S.FormGroup>
							<S.FormLabel>
								내용 <S.Required>*</S.Required>
							</S.FormLabel>
							<S.FormTextarea
								placeholder="질문 내용을 자세히 작성해주세요"
								value={d.formData.content}
								onChange={(e) =>
									d.setFormData((prev) => ({
										...prev,
										content: e.target.value,
									}))
								}
								rows={15}
								aria-label="질문 내용"
							/>
						</S.FormGroup>

						<S.FormOptions>
							<S.OptionGroup>
								<S.OptionLabel>
									<input
										type="checkbox"
										checked={!d.formData.isPublic}
										onChange={(e) =>
											d.setFormData((prev) => ({
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
								onClick={() =>
									d.navigate(
										`/sections/${d.sectionId}/community/${d.questionId}`,
									)
								}
							>
								취소
							</S.BtnCancel>
							<S.BtnSubmit type="submit" disabled={d.submitting}>
								{d.submitting ? "수정 중..." : "수정 완료"}
							</S.BtnSubmit>
						</S.FormActions>
					</S.Form>
				</S.Body>
			</S.Content>
		</S.Container>
	);
}
