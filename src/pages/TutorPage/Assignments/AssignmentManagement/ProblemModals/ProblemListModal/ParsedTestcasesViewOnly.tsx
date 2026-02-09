import type { ProblemListTestcaseItem } from "../types";

export interface ParsedTestcasesViewOnlyProps {
	parsedTestCases: ProblemListTestcaseItem[];
	showParsedTestCases: boolean;
	setShowParsedTestCases: (v: boolean) => void;
}

/**
 * 편집 폼 - 파싱된 테스트케이스 조회 전용 (메타데이터 모드일 때)
 */
export default function ParsedTestcasesViewOnly({
	parsedTestCases,
	showParsedTestCases,
	setShowParsedTestCases,
}: ParsedTestcasesViewOnlyProps) {
	return (
		<fieldset className="problem-create-form-section">
			<legend className="problem-create-label">테스트케이스 조회</legend>
			<div
				className="problem-create-parsed-testcases-section"
				style={{ marginTop: "8px" }}
			>
				<button
					type="button"
					onClick={() => setShowParsedTestCases(!showParsedTestCases)}
					className="problem-create-parsed-testcases-toggle"
				>
					<span>{showParsedTestCases ? "▼" : "▶"}</span>
					<span>테스트케이스 ({parsedTestCases.length}개) - 조회 전용</span>
				</button>
				{showParsedTestCases && (
					<div className="problem-create-parsed-testcases">
						{parsedTestCases.map((testCase, idx) => (
							<div
								key={`parsed-view-${idx}-${testCase.name ?? ""}`}
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
		</fieldset>
	);
}
