import type {
	ProblemListFormData,
	ProblemListTestcaseItem,
	ProblemListEditFormHandlers,
} from "../types";

export interface TestcasesSectionProps {
	formData: ProblemListFormData;
	enableFullEdit: boolean;
	parsedTestCases: ProblemListTestcaseItem[];
	showParsedTestCases: boolean;
	setShowParsedTestCases: (v: boolean) => void;
	handlers: Pick<
		ProblemListEditFormHandlers,
		"handleTestcaseAdd" | "handleTestcaseRemove" | "handleTestcaseChange"
	>;
}

/**
 * 편집 폼 - 테스트케이스 섹션 (새 테스트케이스 + 파싱된 테스트케이스 조회)
 */
export default function TestcasesSection({
	formData,
	enableFullEdit,
	parsedTestCases,
	showParsedTestCases,
	setShowParsedTestCases,
	handlers,
}: TestcasesSectionProps) {
	const { handleTestcaseAdd, handleTestcaseRemove, handleTestcaseChange } =
		handlers;

	return (
		<fieldset className="problem-create-form-section">
			<legend className="problem-create-label">테스트케이스 파일</legend>
			{enableFullEdit && (
				<div className="problem-create-file-upload-wrapper">
					<input
						type="file"
						id="testcaseInput"
						multiple
						accept=".in,.ans"
						onChange={handleTestcaseAdd}
						className="problem-create-file-input"
					/>
					<label
						htmlFor="testcaseInput"
						className="problem-create-file-label-inline"
					>
						추가
					</label>
					<span
						className="problem-create-help-text"
						style={{
							display: "block",
							marginTop: "4px",
							fontSize: "12px",
							color: "#666",
						}}
					>
						테스트케이스 입력(.in) 및 출력(.ans) 파일 (예: 01.in, 01.ans)
					</span>
				</div>
			)}
			{formData.testcases.length > 0 && (
				<div className="problem-create-testcase-list">
					{formData.testcases.map((testcase, idx) => (
						<div
							key={`testcase-${idx}-${testcase.name ?? ""}`}
							className="problem-create-testcase-item-compact"
						>
							<div className="problem-create-testcase-header-compact">
								<div className="problem-create-testcase-header-left">
									<span className="problem-create-testcase-name">
										{testcase.name ?? `테스트케이스 ${idx + 1}`}
									</span>
									<select
										value={testcase.type ?? "secret"}
										onChange={(e) =>
											handleTestcaseChange(idx, "type", e.target.value)
										}
										className="problem-create-testcase-type-select"
										disabled={!enableFullEdit}
									>
										<option value="sample">샘플</option>
										<option value="secret">비밀</option>
									</select>
									<span className="problem-create-testcase-type-badge">
										{testcase.type === "sample" ? "샘플" : "비밀"}
									</span>
								</div>
								{enableFullEdit && (
									<button
										type="button"
										onClick={() => handleTestcaseRemove(idx)}
										className="problem-create-testcase-remove-btn"
									>
										삭제
									</button>
								)}
							</div>
							<div className="problem-create-testcase-body-compact">
								{testcase.input && (
									<div className="problem-create-testcase-content-item">
										<div className="problem-create-testcase-content-label">
											입력
										</div>
										<pre className="problem-create-testcase-content-text">
											{testcase.input}
										</pre>
									</div>
								)}
								{testcase.output && (
									<div className="problem-create-testcase-content-item">
										<div className="problem-create-testcase-content-label">
											출력
										</div>
										<pre className="problem-create-testcase-content-text">
											{testcase.output}
										</pre>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{parsedTestCases.length > 0 && (
				<div
					className="problem-create-parsed-testcases-section"
					style={{ marginTop: "16px" }}
				>
					<button
						type="button"
						onClick={() => setShowParsedTestCases(!showParsedTestCases)}
						className="problem-create-parsed-testcases-toggle"
					>
						<span>{showParsedTestCases ? "▼" : "▶"}</span>
						<span>
							기존 테스트케이스 ({parsedTestCases.length}개) - 조회 전용
						</span>
					</button>
					{showParsedTestCases && (
						<div className="problem-create-parsed-testcases">
							{parsedTestCases.map((testCase, idx) => (
								<div
									key={`parsed-${idx}-${testCase.name ?? ""}`}
									className="problem-create-testcase-item-compact"
								>
									<div className="problem-create-testcase-header-compact">
										<div className="problem-create-testcase-header-left">
											<span className="problem-create-testcase-name">
												{testCase.name ?? `테스트케이스 ${idx + 1}`}
											</span>
											<span className="problem-create-testcase-type-badge">
												{testCase.type === "sample" ? "샘플" : "비밀"}
											</span>
										</div>
									</div>
									<div className="problem-create-testcase-body-compact">
										{testCase.input && (
											<div className="problem-create-testcase-content-item">
												<div className="problem-create-testcase-content-label">
													입력
												</div>
												<pre className="problem-create-testcase-content-text">
													{testCase.input}
												</pre>
											</div>
										)}
										{testCase.output && (
											<div className="problem-create-testcase-content-item">
												<div className="problem-create-testcase-content-label">
													출력
												</div>
												<pre className="problem-create-testcase-content-text">
													{testCase.output}
												</pre>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</fieldset>
	);
}
