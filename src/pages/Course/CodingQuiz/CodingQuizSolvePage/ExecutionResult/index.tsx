import type React from "react";
import { useState, useEffect } from "react";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import * as S from "./styles";

interface Testcase {
	id?: number;
	testcase_rank: number;
	result: string | null;
	runtime?: number;
	memory_used?: number;
	testcase_input?: string;
	expected_output?: string;
	output?: string;
	output_error?: string;
	output_diff?: string;
}

interface ResultInfo {
	status: string;
	message: string;
	color: string;
}

interface SubmissionResult {
	submissionId?: number;
	language?: string;
	submittedAt?: string;
	result?: string;
	outputList?: Testcase[];
	type?: string;
	status?: string;
	message?: string;
	resultInfo?: ResultInfo;
}

interface ExecutionResultProps {
	submissionResult: SubmissionResult | null;
	isSubmitting: boolean;
}

const ExecutionResult: React.FC<ExecutionResultProps> = ({
	submissionResult,
	isSubmitting,
}) => {
	const [selectedTestcase, setSelectedTestcase] = useState<number | null>(null);

	// 테스트케이스 결과가 있으면 첫 번째 세부사항을 기본으로 표시
	useEffect(() => {
		if (
			submissionResult?.type === "output" &&
			submissionResult?.outputList &&
			submissionResult.outputList.length > 0
		) {
			setSelectedTestcase(0);
		} else {
			setSelectedTestcase(null);
		}
	}, [submissionResult?.type, submissionResult?.outputList]);

	const getTestcaseResultText = (result: string | null): string => {
		const resultTexts: { [key: string]: string } = {
			correct: "정답",
			"wrong-answer": "오답",
			timelimit: "시간 초과",
			"memory-limit": "메모리 초과",
			"run-error": "런타임 에러",
			"compiler-error": "컴파일 에러",
			"presentation-error": "출력 형식 오류",
			"no-output": "출력 없음",
		};
		return result ? resultTexts[result] || "알 수 없음" : "미실행";
	};

	const formatMemory = (bytes: number | undefined): string => {
		if (!bytes) return "0 B";
		const units = ["B", "KB", "MB", "GB"];
		let size = bytes;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}

		return `${size.toFixed(1)} ${units[unitIndex]}`;
	};

	const highlightDifferences = (diffText: string | undefined) => {
		if (!diffText) return null;

		const lines = diffText.split("\n");
		const highlightedLines = lines.map((line, index) => {
			if (line.includes("Judge:")) {
				const parts = line.split("Judge:");
				return (
					<S.DiffLine key={index}>
						{parts[0]}
						<S.DiffExpected>Judge: {parts[1]}</S.DiffExpected>
					</S.DiffLine>
				);
			} else if (line.includes("Team:")) {
				const parts = line.split("Team:");
				return (
					<S.DiffLine key={index}>
						{parts[0]}
						<S.DiffActual>Team: {parts[1]}</S.DiffActual>
					</S.DiffLine>
				);
			} else if (
				line.includes("mismatch") ||
				line.includes("Wrong") ||
				line.includes("error")
			) {
				return (
					<S.DiffLine key={index} $error>
						{line}
					</S.DiffLine>
				);
			} else {
				return <S.DiffLine key={index}>{line}</S.DiffLine>;
			}
		});

		return <S.DiffHighlighted>{highlightedLines}</S.DiffHighlighted>;
	};

	const getTestcaseSummary = (outputList: Testcase[] | undefined) => {
		if (!outputList || outputList.length === 0) return { passed: 0, total: 0 };

		const passed = outputList.filter(
			(testcase) => testcase.result === "correct",
		).length;
		const total = outputList.length;

		return { passed, total };
	};

	const getResultSummary = (submissionResult: SubmissionResult) => {
		if (!submissionResult) return null;

		const { result, outputList } = submissionResult;
		const { passed, total } = getTestcaseSummary(outputList);
		const hasOutputList = outputList && outputList.length > 0;

		if (result === "AC") {
			return {
				type: "success" as const,
				title: "정답",
				description: hasOutputList
					? `모든 테스트케이스 통과 (${total}/${total})`
					: "정답",
				details: hasOutputList
					? [
							`실행 시간: ${Math.max(...outputList!.map((t) => t.runtime || 0))}ms`,
							`메모리 사용: ${formatMemory(Math.max(...outputList!.map((t) => t.memory_used || 0)))}`,
						]
					: [],
			};
		} else if (["WA", "PE"].includes(result || "")) {
			const failedCount = total - passed;
			return {
				type: "error" as const,
				title: "오답",
				description: hasOutputList
					? `${failedCount}개 테스트케이스 실패 (${passed}/${total})`
					: "오답",
				details: hasOutputList
					? [
							`첫 번째 실패: 테스트케이스 #${outputList!.find((t) => t.result !== "correct")?.testcase_rank || 1}`,
						]
					: ["테스트하기를 통해 테스트케이스를 확인하세요."],
			};
		} else if (result === "TLE") {
			return {
				type: "warning" as const,
				title: "시간 초과",
				description: hasOutputList
					? `실행 시간 제한 초과 (${passed}/${total})`
					: "실행 시간 제한 초과",
				details: ["실행 시간을 단축해보세요"],
			};
		} else if (result === "MLE") {
			return {
				type: "warning" as const,
				title: "메모리 초과",
				description: hasOutputList
					? `메모리 제한 초과 (${passed}/${total})`
					: "메모리 제한 초과",
				details: ["메모리 사용량을 줄여보세요"],
			};
		} else if (result === "RE") {
			return {
				type: "error" as const,
				title: "런타임 에러",
				description: hasOutputList
					? `실행 중 오류 발생 (${passed}/${total})`
					: "실행 중 오류 발생",
				details: ["코드 로직을 다시 확인해보세요"],
			};
		} else if (result === "CE") {
			return {
				type: "error" as const,
				title: "컴파일 에러",
				description: "코드 컴파일 실패",
				details: ["문법 오류를 확인해보세요"],
			};
		}

		return null;
	};

	return (
		<S.ResultArea>
			<div>
				{isSubmitting ? (
					<S.ResultLoading>
						<LoadingSpinner />
						<span>제출 중...</span>
					</S.ResultLoading>
				) : submissionResult ? (
					<>
						{(() => {
							const summary = getResultSummary(submissionResult);
							if (summary) {
								return (
									<S.ResultSummary $type={summary.type}>
										<S.SummaryHeader>
											<S.SummaryIcon $type={summary.type}>
												{summary.type === "success"
													? "✅"
													: summary.type === "warning"
														? "⚠️"
														: "❌"}
											</S.SummaryIcon>
											<S.SummaryTitle>{summary.title}</S.SummaryTitle>
										</S.SummaryHeader>
										<S.SummaryDescription>
											{summary.description}
										</S.SummaryDescription>
										{summary.details.length > 0 && (
											<S.SummaryDetails>
												{summary.details.map((detail, index) => (
													<S.SummaryDetail key={index}>
														{detail}
													</S.SummaryDetail>
												))}
											</S.SummaryDetails>
										)}
										<S.SubmissionInfo>
											제출 ID: {submissionResult.submissionId} | 언어:{" "}
											{submissionResult.language} | 제출 시간:{" "}
											{new Date(submissionResult.submittedAt).toLocaleString(
												"ko-KR",
											)}
										</S.SubmissionInfo>
									</S.ResultSummary>
								);
							} else {
								return (
									<S.ResultSummary
										$type={
											submissionResult.resultInfo?.status === "error"
												? "error"
												: "success"
										}
										style={{ color: submissionResult.resultInfo?.color }}
									>
										<strong>{submissionResult.resultInfo?.message}</strong>
										<br />
										제출 ID: {submissionResult.submissionId} | 언어:{" "}
										{submissionResult.language} | 제출 시간:{" "}
										{new Date(submissionResult.submittedAt).toLocaleString(
											"ko-KR",
										)}
									</S.ResultSummary>
								);
							}
						})()}

						{submissionResult.status === "error" && (
							<S.ErrorMessage>
								<strong>오류:</strong> {submissionResult.message}
							</S.ErrorMessage>
						)}

						{submissionResult.type === "output" &&
							submissionResult.outputList &&
							(() => {
								const { passed, total } = getTestcaseSummary(
									submissionResult.outputList,
								);
								return (
									<S.TestcasesSection>
										<S.TestcasesHeader>
											<strong>
												테스트케이스 결과: {passed}/{total}
											</strong>
										</S.TestcasesHeader>

										<S.TestcaseButtons>
											{submissionResult.outputList.map((testcase, index) => (
												<S.TestcaseButton
													key={testcase.id || index}
													$result={testcase.result || "not-run"}
													$selected={selectedTestcase === index}
													onClick={() => setSelectedTestcase(index)}
												>
													#{testcase.testcase_rank}
												</S.TestcaseButton>
											))}
										</S.TestcaseButtons>

										{selectedTestcase !== null &&
											submissionResult.outputList[selectedTestcase] &&
											(() => {
												const testcase =
													submissionResult.outputList[selectedTestcase];
												return (
													<S.SelectedTestcase>
														<S.TestcaseInfoHeader>
															<S.TestcaseNumber>
																테스트케이스 #{testcase.testcase_rank}
															</S.TestcaseNumber>
															<S.TestcaseResult
																$result={testcase.result || "not-run"}
															>
																{getTestcaseResultText(testcase.result)}
															</S.TestcaseResult>
														</S.TestcaseInfoHeader>

														{testcase.result && (
															<S.TestcaseDetails>
																<S.TestcaseStats>
																	<S.StatItem>
																		<strong>실행시간:</strong>{" "}
																		{testcase.runtime}ms
																	</S.StatItem>
																	<S.StatItem>
																		<strong>메모리:</strong>{" "}
																		{formatMemory(testcase.memory_used)}
																	</S.StatItem>
																</S.TestcaseStats>

																{testcase.testcase_input && (
																	<S.TestcaseSection>
																		<S.Label $type="input">
																			테스트 입력:
																		</S.Label>
																		<S.Content>
																			<pre>{testcase.testcase_input}</pre>
																		</S.Content>
																	</S.TestcaseSection>
																)}

																{testcase.expected_output && (
																	<S.TestcaseSection>
																		<S.Label $type="expected">
																			기대 출력:
																		</S.Label>
																		<S.Content>
																			<pre>{testcase.expected_output}</pre>
																		</S.Content>
																	</S.TestcaseSection>
																)}

																{testcase.output && (
																	<S.TestcaseSection>
																		<S.Label $type="output">실제 출력:</S.Label>
																		<S.Content>
																			<pre>{testcase.output}</pre>
																		</S.Content>
																	</S.TestcaseSection>
																)}

																{testcase.output_error && (
																	<S.TestcaseSection>
																		<S.Label $type="error">실행 에러:</S.Label>
																		<S.Content>
																			<pre>{testcase.output_error}</pre>
																		</S.Content>
																	</S.TestcaseSection>
																)}

																{testcase.output_diff && (
																	<S.TestcaseSection>
																		<S.Label $type="diff">차이점:</S.Label>
																		<S.Content>
																			{highlightDifferences(
																				testcase.output_diff,
																			)}
																		</S.Content>
																	</S.TestcaseSection>
																)}
															</S.TestcaseDetails>
														)}
													</S.SelectedTestcase>
												);
											})()}
									</S.TestcasesSection>
								);
							})()}
					</>
				) : (
					<div style={{ opacity: 0.6 }}>제출 후 결과가 여기에 표시됩니다.</div>
				)}
			</div>
		</S.ResultArea>
	);
};

export default ExecutionResult;
