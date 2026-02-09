import type React from "react";
import * as S from "../styles";
import type { ProblemEditHookReturn } from "../hooks/useProblemEdit";

type ProblemEditTestcasesSectionProps = Pick<
	ProblemEditHookReturn,
	| "formData"
	| "enableFullEdit"
	| "parsedTestCases"
	| "showParsedTestCases"
	| "setShowParsedTestCases"
	| "handleTestcaseAdd"
	| "handleTestcaseRemove"
	| "handleTestcaseChange"
>;

const ProblemEditTestcasesSection: React.FC<
	ProblemEditTestcasesSectionProps
> = ({
	formData,
	enableFullEdit,
	parsedTestCases,
	showParsedTestCases,
	setShowParsedTestCases,
	handleTestcaseAdd,
	handleTestcaseRemove,
	handleTestcaseChange,
}) => (
	<>
		{enableFullEdit && (
			<S.Fieldset aria-labelledby="problem-edit-testcase-label">
				<S.Legend id="problem-edit-testcase-label">테스트케이스 파일</S.Legend>
				<S.FileUploadWrapper>
					<S.FileInput
						type="file"
						id="testcaseInput"
						multiple
						accept=".in,.ans"
						onChange={handleTestcaseAdd}
					/>
					<S.FileLabelInline htmlFor="testcaseInput">추가</S.FileLabelInline>
					<S.HelpText
						style={{
							display: "block",
							marginTop: "4px",
							fontSize: "12px",
							color: "#666",
						}}
					>
						테스트케이스 입력(.in) 및 출력(.ans) 파일 (예: 01.in, 01.ans)
					</S.HelpText>
				</S.FileUploadWrapper>
				{formData.testcases.length > 0 && (
					<S.TestcaseList>
						{formData.testcases.map((testcase, idx) => (
							<S.TestcaseItemCompact
								key={testcase.name ?? `testcase-new-${idx}`}
							>
								<S.TestcaseHeaderCompact>
									<S.TestcaseHeaderLeft>
										<S.TestcaseName>
											{testcase.name ?? `테스트케이스 ${idx + 1}`}
										</S.TestcaseName>
										<S.TestcaseTypeSelect
											value={testcase.type ?? "secret"}
											onChange={(e) =>
												handleTestcaseChange(idx, "type", e.target.value)
											}
										>
											<option value="sample">샘플</option>
											<option value="secret">비밀</option>
										</S.TestcaseTypeSelect>
										<S.TestcaseTypeBadge>
											{testcase.type === "sample" ? "샘플" : "비밀"}
										</S.TestcaseTypeBadge>
									</S.TestcaseHeaderLeft>
									<S.TestcaseRemoveBtn
										type="button"
										onClick={() => handleTestcaseRemove(idx)}
									>
										삭제
									</S.TestcaseRemoveBtn>
								</S.TestcaseHeaderCompact>
								<S.TestcaseBodyCompact>
									{testcase.input && (
										<S.TestcaseContentItem>
											<S.TestcaseContentLabel>입력</S.TestcaseContentLabel>
											<S.TestcaseContentText>
												{testcase.input}
											</S.TestcaseContentText>
										</S.TestcaseContentItem>
									)}
									{testcase.output && (
										<S.TestcaseContentItem>
											<S.TestcaseContentLabel>출력</S.TestcaseContentLabel>
											<S.TestcaseContentText>
												{testcase.output}
											</S.TestcaseContentText>
										</S.TestcaseContentItem>
									)}
								</S.TestcaseBodyCompact>
							</S.TestcaseItemCompact>
						))}
					</S.TestcaseList>
				)}
				{parsedTestCases.length > 0 && (
					<S.ParsedSection style={{ marginTop: "16px" }}>
						<S.ParsedToggle
							type="button"
							onClick={() => setShowParsedTestCases(!showParsedTestCases)}
						>
							<span>{showParsedTestCases ? "▼" : "▶"}</span>
							<span>
								기존 테스트케이스 ({parsedTestCases.length}개) - 조회 전용
							</span>
						</S.ParsedToggle>
						{showParsedTestCases && (
							<S.ParsedList>
								{parsedTestCases.map((testCase, idx) => (
									<S.TestcaseItemCompact
										key={testCase.name ?? `parsed-tc-${idx}`}
									>
										<S.TestcaseHeaderCompact>
											<S.TestcaseHeaderLeft>
												<S.TestcaseName>
													{testCase.name ?? `테스트케이스 ${idx + 1}`}
												</S.TestcaseName>
												<S.TestcaseTypeBadge>
													{testCase.type === "sample" ? "샘플" : "비밀"}
												</S.TestcaseTypeBadge>
											</S.TestcaseHeaderLeft>
										</S.TestcaseHeaderCompact>
										<S.TestcaseBodyCompact>
											{testCase.input && (
												<S.TestcaseContentItem>
													<S.TestcaseContentLabel>입력</S.TestcaseContentLabel>
													<S.TestcaseContentText>
														{testCase.input}
													</S.TestcaseContentText>
												</S.TestcaseContentItem>
											)}
											{testCase.output && (
												<S.TestcaseContentItem>
													<S.TestcaseContentLabel>출력</S.TestcaseContentLabel>
													<S.TestcaseContentText>
														{testCase.output}
													</S.TestcaseContentText>
												</S.TestcaseContentItem>
											)}
										</S.TestcaseBodyCompact>
									</S.TestcaseItemCompact>
								))}
							</S.ParsedList>
						)}
					</S.ParsedSection>
				)}
			</S.Fieldset>
		)}

		{!enableFullEdit && parsedTestCases.length > 0 && (
			<S.Fieldset aria-labelledby="problem-edit-parsed-label">
				<S.Legend id="problem-edit-parsed-label">테스트케이스 조회</S.Legend>
				<S.ParsedSection style={{ marginTop: "8px" }}>
					<S.ParsedToggle
						type="button"
						onClick={() => setShowParsedTestCases(!showParsedTestCases)}
					>
						<span>{showParsedTestCases ? "▼" : "▶"}</span>
						<span>테스트케이스 ({parsedTestCases.length}개) - 조회 전용</span>
					</S.ParsedToggle>
					{showParsedTestCases && (
						<S.ParsedList>
							{parsedTestCases.map((testCase, idx) => (
								<S.TestcaseItemCompact
									key={testCase.name ?? `parsed-view-${idx}`}
								>
									<S.TestcaseHeaderCompact>
										<S.TestcaseHeaderLeft>
											<S.TestcaseName>
												{testCase.name ?? `테스트케이스 ${idx + 1}`}
											</S.TestcaseName>
											<S.TestcaseTypeBadge>
												{testCase.type === "sample" ? "샘플" : "비밀"}
											</S.TestcaseTypeBadge>
										</S.TestcaseHeaderLeft>
									</S.TestcaseHeaderCompact>
									<S.TestcaseBodyCompact>
										{testCase.input && (
											<S.TestcaseContentItem>
												<S.TestcaseContentLabel>입력</S.TestcaseContentLabel>
												<S.TestcaseContentText>
													{testCase.input}
												</S.TestcaseContentText>
											</S.TestcaseContentItem>
										)}
										{testCase.output && (
											<S.TestcaseContentItem>
												<S.TestcaseContentLabel>출력</S.TestcaseContentLabel>
												<S.TestcaseContentText>
													{testCase.output}
												</S.TestcaseContentText>
											</S.TestcaseContentItem>
										)}
									</S.TestcaseBodyCompact>
								</S.TestcaseItemCompact>
							))}
						</S.ParsedList>
					)}
				</S.ParsedSection>
			</S.Fieldset>
		)}
	</>
);

export default ProblemEditTestcasesSection;
