import type React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import APIService from "../../../services/APIService";
import * as S from "../../TutorPage/ProblemCreate/styles";
import type { Problem, SubmissionResult } from "./types";

const ProblemSolvePage: React.FC = () => {
	const { sectionId, assignmentId, problemId } = useParams<{
		sectionId: string;
		assignmentId: string;
		problemId: string;
	}>();
	const [problem, setProblem] = useState<Problem | null>(null);
	const [code, setCode] = useState("");
	const [language, setLanguage] = useState("python");
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [result, setResult] = useState<SubmissionResult | null>(null);

	useEffect(() => {
		const fetchProblem = async () => {
			try {
				setLoading(true);
				const response = await APIService.getProblemInfo(problemId!);
				setProblem(response?.data || response);
			} catch (error) {
				console.error("문제 조회 실패:", error);
			} finally {
				setLoading(false);
			}
		};

		if (problemId) {
			fetchProblem();
		}
	}, [problemId]);

	const handleSubmit = async () => {
		if (!code.trim()) {
			alert("코드를 입력하세요.");
			return;
		}

		try {
			setSubmitting(true);
			setResult(null);
			const response = await APIService.submitCode(
				Number.parseInt(problemId!),
				Number.parseInt(sectionId!),
				code,
				language
			);
			setResult(response?.data || response);

			if (response?.data?.result === "ACCEPTED") {
				alert("정답입니다!");
			}
		} catch (error) {
			console.error("코드 제출 실패:", error);
			alert("제출에 실패했습니다.");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<MainLayout>
				<LoadingSpinner message="문제 정보를 불러오는 중..." />
			</MainLayout>
		);
	}

	if (!problem) {
		return (
			<MainLayout>
				<S.Container>
					<S.Title>문제를 찾을 수 없습니다</S.Title>
				</S.Container>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<S.Container>
				<S.Header>
					<S.Title>{problem.title}</S.Title>
				</S.Header>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "2rem",
					}}
				>
					<div>
						<div
							style={{
								background: "white",
								padding: "2rem",
								borderRadius: "8px",
								marginBottom: "1rem",
							}}
						>
							<h3
								style={{
									fontSize: "1.1rem",
									fontWeight: 600,
									marginBottom: "1rem",
								}}
							>
								문제 설명
							</h3>
							<p style={{ whiteSpace: "pre-wrap" }}>{problem.description}</p>
						</div>

						{problem.sampleInputs && problem.sampleInputs.length > 0 && (
							<div
								style={{
									background: "white",
									padding: "2rem",
									borderRadius: "8px",
								}}
							>
								<h3
									style={{
										fontSize: "1.1rem",
										fontWeight: 600,
										marginBottom: "1rem",
									}}
								>
									예제 입출력
								</h3>
								{problem.sampleInputs.map((sample, index) => (
									<div key={index} style={{ marginBottom: "1rem" }}>
										<strong>예제 {index + 1}</strong>
										<pre
											style={{
												background: "#f9fafb",
												padding: "0.5rem",
												borderRadius: "4px",
												marginTop: "0.5rem",
											}}
										>
											입력: {sample.input}
										</pre>
										<pre
											style={{
												background: "#f9fafb",
												padding: "0.5rem",
												borderRadius: "4px",
												marginTop: "0.5rem",
											}}
										>
											출력: {sample.output}
										</pre>
									</div>
								))}
							</div>
						)}
					</div>

					<div>
						<S.Form
							onSubmit={(e) => {
								e.preventDefault();
								handleSubmit();
							}}
						>
							<S.FormGroup>
								<S.Label>언어 선택</S.Label>
								<S.Select
									value={language}
									onChange={(e) => setLanguage(e.target.value)}
								>
									<option value="python">Python</option>
									<option value="java">Java</option>
									<option value="cpp">C++</option>
									<option value="javascript">JavaScript</option>
								</S.Select>
							</S.FormGroup>

							<S.FormGroup>
								<S.Label>코드</S.Label>
								<S.Textarea
									value={code}
									onChange={(e) => setCode(e.target.value)}
									placeholder="코드를 입력하세요..."
									style={{ minHeight: "400px", fontFamily: "monospace" }}
								/>
							</S.FormGroup>

							<S.SubmitButton type="submit" disabled={submitting}>
								{submitting ? "제출 중..." : "코드 제출"}
							</S.SubmitButton>
						</S.Form>

						{result && (
							<div
								style={{
									marginTop: "1rem",
									padding: "1.5rem",
									borderRadius: "8px",
									background:
										result.result === "ACCEPTED" ? "#d1fae5" : "#fee2e2",
									color: result.result === "ACCEPTED" ? "#059669" : "#dc2626",
								}}
							>
								<h4 style={{ margin: "0 0 0.5rem 0" }}>
									제출 결과: {result.result}
								</h4>
								{result.message && (
									<p style={{ margin: 0 }}>{result.message}</p>
								)}
								{result.passedTests !== undefined && (
									<p style={{ margin: "0.5rem 0 0 0" }}>
										통과한 테스트: {result.passedTests} / {result.totalTests}
									</p>
								)}
							</div>
						)}
					</div>
				</div>
			</S.Container>
		</MainLayout>
	);
};

export default ProblemSolvePage;
