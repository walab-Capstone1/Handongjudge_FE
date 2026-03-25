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
	| "handleTestcaseAddManual"
	| "handleTestcaseRemove"
	| "handleTestcaseChange"
	| "handleParsedTestcaseRemove"
	| "handleParsedTestcaseChange"
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
	handleTestcaseAddManual,
	handleTestcaseRemove,
	handleTestcaseChange,
	handleParsedTestcaseRemove,
	handleParsedTestcaseChange,
}) => (
	<>
		{enableFullEdit && (
			<S.Fieldset aria-labelledby="problem-edit-testcase-label">
				<S.Legend id="problem-edit-testcase-label">테스트케이스</S.Legend>
				<S.FileUploadWrapper>
					<S.FileInput
						type="file"
						id="testcaseInput"
						multiple
						accept=".in,.ans"
						onChange={handleTestcaseAdd}
					/>
					<S.FileLabelInline htmlFor="testcaseInput">파일 추가</S.FileLabelInline>
					<button
						type="button"
						onClick={handleTestcaseAddManual}
						style={{
							marginLeft: "8px",
							padding: "6px 12px",
							borderRadius: "6px",
							border: "1px solid #cbd5e1",
							background: "#f8fafc",
							cursor: "pointer",
							fontSize: "13px",
						}}
					>
						직접 추가
					</button>
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
										<input
											type="text"
											value={testcase.name ?? ""}
											onChange={(e) =>
												handleTestcaseChange(idx, "name", e.target.value)
											}
											placeholder={`테스트케이스 ${idx + 1}`}
											style={{
												fontSize: "inherit",
												fontWeight: 600,
												padding: "4px 8px",
												border: "1px solid #e2e8f0",
												borderRadius: "4px",
												minWidth: "140px",
											}}
										/>
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
									<S.TestcaseContentItem>
										<S.TestcaseContentLabel>입력</S.TestcaseContentLabel>
										<textarea
											value={testcase.input ?? ""}
											onChange={(e) =>
												handleTestcaseChange(idx, "input", e.target.value)
											}
											placeholder="입력 데이터"
											rows={3}
											style={{
												width: "100%",
												fontFamily: "monospace",
												fontSize: "13px",
												padding: "8px",
												border: "1px solid #e2e8f0",
												borderRadius: "6px",
												resize: "vertical",
											}}
										/>
									</S.TestcaseContentItem>
									<S.TestcaseContentItem>
										<S.TestcaseContentLabel>출력</S.TestcaseContentLabel>
										<textarea
											value={testcase.output ?? ""}
											onChange={(e) =>
												handleTestcaseChange(idx, "output", e.target.value)
											}
											placeholder="출력 데이터"
											rows={3}
											style={{
												width: "100%",
												fontFamily: "monospace",
												fontSize: "13px",
												padding: "8px",
												border: "1px solid #e2e8f0",
												borderRadius: "6px",
												resize: "vertical",
											}}
										/>
									</S.TestcaseContentItem>
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
								기존 테스트케이스 ({parsedTestCases.length}개)
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
												<S.TestcaseTypeSelect
													value={testCase.type ?? "secret"}
													onChange={(e) =>
														handleParsedTestcaseChange(idx, "type", e.target.value)
													}
												>
													<option value="sample">샘플</option>
													<option value="secret">비밀</option>
												</S.TestcaseTypeSelect>
											</S.TestcaseHeaderLeft>
											<S.TestcaseRemoveBtn
												type="button"
												onClick={() => handleParsedTestcaseRemove(idx)}
											>
												삭제
											</S.TestcaseRemoveBtn>
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
