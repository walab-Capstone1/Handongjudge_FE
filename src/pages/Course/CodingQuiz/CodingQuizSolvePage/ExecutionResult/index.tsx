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
	submissionId?: number | string;
	language?: string;
	submittedAt?: string;
	result?: string;
	outputList?: Testcase[];
	type?: string;
	status?: string;
	message?: string;
	resultInfo?: ResultInfo;
	// 퀴즈 scoring 필드
	passedCount?: number;
	totalCount?: number;
	points?: number;
	score?: number;
}

interface TestcaseProgress {
	index: number;
	result: string;
}

interface ExecutionResultProps {
	submissionResult: SubmissionResult | null;
	isSubmitting: boolean;
	testcaseResults?: TestcaseProgress[] | null;
	onResetTestcaseResults?: () => void;
	totalTestcaseCount?: number | null;
}

const RESULT_COLOR: Record<string, string> = {
	correct: "#28a745",
	"wrong-answer": "#dc3545",
	timelimit: "#fd7e14",
	"memory-limit": "#fd7e14",
	"run-error": "#dc3545",
	"compiler-error": "#dc3545",
	"presentation-error": "#fd7e14",
	"no-output": "#6c757d",
};

const ExecutionResult: React.FC<ExecutionResultProps> = ({
	submissionResult,
	isSubmitting,
	testcaseResults,
	onResetTestcaseResults,
	totalTestcaseCount,
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

		const { result, outputList, passedCount, totalCount, score, points } =
			submissionResult;
		const { passed, total } = getTestcaseSummary(outputList);
		const hasOutputList = outputList && outputList.length > 0;
		const p = passedCount ?? passed;
		const t = totalCount ?? total;
		const isQuizScoring =
			score !== undefined && points !== undefined;

		if (result === "AC") {
			const details: string[] = hasOutputList
				? [
						`실행 시간: ${Math.max(...outputList!.map((t) => t.runtime || 0))}ms`,
						`메모리 사용: ${formatMemory(Math.max(...outputList!.map((t) => t.memory_used || 0)))}`,
					]
				: [];
			if (isQuizScoring) details.push(`획득 점수: ${score!.toFixed(1)}/${points}점`);
			return {
				type: "success" as const,
				title: "정답",
				description: hasOutputList
					? `모든 테스트케이스 통과 (${t}/${t})`
					: "정답",
				details,
			};
		} else if (["WA", "PE"].includes(result || "")) {
			const failedCount = t - p;
			const details: string[] = hasOutputList
				? [
						`첫 번째 실패: 테스트케이스 #${outputList!.find((tc) => tc.result !== "correct")?.testcase_rank || 1}`,
					]
				: ["테스트하기를 통해 테스트케이스를 확인하세요."];
			if (isQuizScoring) details.push(`획득 점수: ${score!.toFixed(1)}/${points}점`);
			return {
				type: "error" as const,
				title: "오답",
				description: hasOutputList
					? `${failedCount}개 테스트케이스 실패 (${p}/${t})`
					: "오답",
				details,
			};
		} else if (result === "TLE") {
			const details = ["실행 시간을 단축해보세요"];
			if (isQuizScoring) details.push(`획득 점수: ${score!.toFixed(1)}/${points}점`);
			return {
				type: "warning" as const,
				title: "시간 초과",
				description: hasOutputList
					? `실행 시간 제한 초과 (${p}/${t})`
					: "실행 시간 제한 초과",
				details,
			};
		} else if (result === "MLE") {
			const details = ["메모리 사용량을 줄여보세요"];
			if (isQuizScoring) details.push(`획득 점수: ${score!.toFixed(1)}/${points}점`);
			return {
				type: "warning" as const,
				title: "메모리 초과",
				description: hasOutputList
					? `메모리 제한 초과 (${p}/${t})`
					: "메모리 제한 초과",
				details,
			};
		} else if (result === "RE") {
			const details = ["코드 로직을 다시 확인해보세요"];
			if (isQuizScoring) details.push(`획득 점수: ${score!.toFixed(1)}/${points}점`);
			return {
				type: "error" as const,
				title: "런타임 에러",
				description: hasOutputList
					? `실행 중 오류 발생 (${p}/${t})`
					: "실행 중 오류 발생",
				details,
			};
		} else if (result === "CE") {
			const details = ["문법 오류를 확인해보세요"];
			if (isQuizScoring) details.push(`획득 점수: 0/${points}점`);
			return {
				type: "error" as const,
				title: "컴파일 에러",
				description: "코드 컴파일 실패",
				details,
			};
		}

		return null;
	};

	const doneCount = testcaseResults?.length ?? 0;
	const totalCount = totalTestcaseCount ?? null;
	const showProgress = isSubmitting && (doneCount > 0 || totalCount !== null);
	const progressPct = totalCount ? Math.round((doneCount / totalCount) * 100) : null;

	return (
		<S.ResultArea>
			<div>
				{isSubmitting && !showProgress ? (
					<S.ResultLoading>
						<LoadingSpinner message="" />
					</S.ResultLoading>
				) : showProgress ? (
					<div style={{ padding: "4px 0" }}>
						{/* 헤더: 스피너 + 카운트 */}
						<S.ResultLoading style={{ marginBottom: "14px" }}>
							<LoadingSpinner message="" />
							<span>
								채점 중...{" "}
								{totalCount !== null
									? `${doneCount} / ${totalCount}`
									: `${doneCount}개 완료`}
							</span>
						</S.ResultLoading>

						{/* 프로그레스 바 */}
						{progressPct !== null && (
							<div style={{ marginBottom: "14px" }}>
								<div
									style={{
										height: "6px",
										borderRadius: "999px",
										backgroundColor: "#e9ecef",
										overflow: "hidden",
									}}
								>
									<div
										style={{
											height: "100%",
											width: `${progressPct}%`,
											borderRadius: "999px",
											backgroundColor: "#0d6efd",
											transition: "width 0.3s ease",
										}}
									/>
								</div>
								<div style={{ textAlign: "right", fontSize: "0.75rem", color: "#6c757d", marginTop: "4px" }}>
									{progressPct}%
								</div>
							</div>
						)}

						{/* 테스트케이스 그리드 */}
						<div style={{ marginBottom: "6px", fontWeight: 600, fontSize: "0.85rem", color: "#495057" }}>
							테스트케이스 현황
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))",
								gap: "8px",
							}}
						>
							{Array.from({ length: totalCount ?? doneCount }, (_, i) => {
								const idx = i + 1;
								const done = testcaseResults?.find((tc) => tc.index === idx);
								return (
									<div
										key={idx}
										title={done ? done.result : "채점 대기"}
										style={{
											height: "48px",
											borderRadius: "8px",
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											justifyContent: "center",
											gap: "2px",
											fontSize: "0.7rem",
											fontWeight: 700,
											color: done ? "#fff" : "#adb5bd",
											backgroundColor: done
												? (RESULT_COLOR[done.result] ?? "#6c757d")
												: "#f1f3f5",
											border: done ? "none" : "2px dashed #dee2e6",
											transition: "background-color 0.25s ease, color 0.25s ease, border 0.25s ease",
										}}
									>
										<span style={{ fontSize: "0.65rem", opacity: 0.85 }}>#{idx}</span>
										<span>
											{done
												? done.result === "correct" ? "✓" : "✗"
												: "…"}
										</span>
									</div>
								);
							})}
						</div>

						{/* 범례 */}
						<div style={{ display: "flex", gap: "12px", marginTop: "12px", fontSize: "0.75rem", color: "#6c757d" }}>
							<span><span style={{ color: "#28a745" }}>●</span> 정답</span>
							<span><span style={{ color: "#dc3545" }}>●</span> 오답</span>
							<span><span style={{ color: "#adb5bd" }}>●</span> 대기</span>
						</div>
					</div>
				) : submissionResult ? (
					<>
						{(() => {
							const summary = getResultSummary(submissionResult);
							const icon = summary?.type === "success" ? "✅" : summary?.type === "warning" ? "⚠️" : "❌";
							const label = summary?.title ?? submissionResult.resultInfo?.message ?? "";
							const desc = summary?.description ?? "";
							const type = summary?.type ?? (submissionResult.resultInfo?.status === "error" ? "error" : "success");
							return (
								<S.ResultSummary $type={type}>
									<S.CompactRow>
										<S.SummaryIcon $type={type}>{icon}</S.SummaryIcon>
										<S.SummaryTitle>{label}</S.SummaryTitle>
										{desc && <S.SummaryDescription>{desc}</S.SummaryDescription>}
									</S.CompactRow>
									{submissionResult.status !== "error" && submissionResult.submittedAt && (
										<S.SubmissionInfo>
											언어: {submissionResult.language} · {new Date(submissionResult.submittedAt).toLocaleString("ko-KR")}
										</S.SubmissionInfo>
									)}
								</S.ResultSummary>
							);
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
								const p = submissionResult.passedCount ?? passed;
								const t = submissionResult.totalCount ?? total;
								const hasScore =
									submissionResult.score !== undefined &&
									submissionResult.points !== undefined;
								return (
									<S.TestcasesSection>
										<S.TestcasesHeader>
											<strong>
												테스트케이스 결과: {p}/{t}
												{hasScore &&
													` | 획득 점수: ${submissionResult.score!.toFixed(1)}/${submissionResult.points}점`}
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
