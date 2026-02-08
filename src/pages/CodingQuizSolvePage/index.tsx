import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Split from "react-split";
import apiService from "../../services/APIService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProblemDescription from "./ProblemDescription";
import CodeEditor from "./CodeEditor";
import ExecutionResult from "./ExecutionResult";
import DraggablePanel from "./DraggablePanel";
import QuizTimer from "../../components/QuizTimer";
import indexedDBManager from "../../utils/IndexedDBManager";
// CSS는 ProblemSolvePage 컴포넌트들이 각자 스타일을 가지고 있음
import { getDefaultCode, resultMapping } from "./utils";
import type {
	QuizInfo,
	SectionInfo,
	CurrentProblem,
	PanelLayout,
	SubmissionResult,
	Problem,
} from "./types";

const CodingQuizSolvePage: React.FC = () => {
	const { sectionId, quizId } = useParams<{
		sectionId: string;
		quizId: string;
	}>();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const [language, setLanguage] = useState("c");
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [code, setCode] = useState(getDefaultCode("c"));
	const [submissionResult, setSubmissionResult] =
		useState<SubmissionResult | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [currentProblem, setCurrentProblem] = useState<CurrentProblem>({
		title: "Loading...",
		description: "Loading...",
	});
	const [sectionInfo, setSectionInfo] = useState<SectionInfo>({
		courseTitle: "Loading...",
		sectionNumber: 0,
		instructorName: "Loading...",
	});
	const [quizInfo, setQuizInfo] = useState<QuizInfo>({
		title: "Loading...",
		description: "",
		startTime: null,
		endTime: null,
		status: "WAITING",
		problems: [],
	});
	const [problems, setProblems] = useState<Problem[]>([]);
	const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(true);
	const [horizontalSizes, setHorizontalSizes] = useState([40, 60]);
	const [verticalSizes, setVerticalSizes] = useState([70, 30]);
	const [isTimeUp, setIsTimeUp] = useState(false);

	const [panelLayout, setPanelLayout] = useState<PanelLayout>({
		left: "description",
		topRight: "editor",
		bottomRight: "result",
	});

	const [sessionId, setSessionId] = useState<string | null>(null);
	const [sessionSaveStatus, setSessionSaveStatus] = useState<
		"idle" | "saving" | "saved" | "error"
	>("idle");
	const [codeLoadSource, setCodeLoadSource] = useState<string | null>(null);
	const [sessionCleared, setSessionCleared] = useState(false);

	useEffect(() => {
		const loadAllInfo = async () => {
			if (!quizId || !sectionId) {
				return;
			}

			try {
				setIsLoading(true);
				console.log("퀴즈 정보 로드 시작:", { quizId, sectionId });

				const [quizInfoRes, sectionInfoRes, problemsRes] = await Promise.all([
					apiService.getQuizInfo(sectionId, quizId),
					apiService.getSectionInfo(sectionId),
					apiService.getQuizProblems(sectionId, quizId),
				]);

				const quizData = quizInfoRes.data || quizInfoRes;
				const sectionData = sectionInfoRes.data || sectionInfoRes;
				const problemsData = problemsRes.data || problemsRes;

				const quizInfoData: QuizInfo = {
					...quizData,
					startTime: new Date(quizData.startTime),
					endTime: new Date(quizData.endTime),
				};

				const problemsList: Problem[] = problemsData.map((p: any) => ({
					id: p.problemId,
					title: p.title,
					order: p.problemOrder,
					description: p.description || "",
				}));

				const urlProblemId = searchParams.get("problemId");
				const defaultProblemId = urlProblemId
					? Number.parseInt(urlProblemId)
					: problemsList[0]?.id || null;

				if (!defaultProblemId) {
					throw new Error("문제를 찾을 수 없습니다");
				}

				const problemInfo = await apiService.getProblemInfo(defaultProblemId);
				const problemData = problemInfo.data || problemInfo;

				setQuizInfo(quizInfoData);
				setProblems(problemsList);
				setSectionInfo(sectionData);
				setCurrentProblem(problemData);
				setSelectedProblemId(defaultProblemId);
			} catch (error: any) {
				console.error("정보 로드 실패:", error);
				setCurrentProblem({
					title: "오류",
					description: "퀴즈를 불러오는데 실패했습니다.",
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadAllInfo();
	}, [quizId, sectionId, searchParams]);

	useEffect(() => {
		const initializeSession = async () => {
			try {
				await indexedDBManager.init();
				const currentSessionId = indexedDBManager.getSessionId();
				setSessionId(currentSessionId);
			} catch (error) {
				console.error("IndexedDB 초기화 실패:", error);
			}
		};

		initializeSession();
	}, []);

	const handleTimeUp = () => {
		setIsTimeUp(true);
		alert("퀴즈 시간이 종료되었습니다. 자동으로 제출됩니다.");
	};

	useEffect(() => {
		const loadCode = async () => {
			if (!selectedProblemId || !sectionId || !language || !sessionId) return;

			try {
				const sessionCode = await loadFromSession();

				if (
					sessionCode &&
					sessionCode.trim() !== "" &&
					sessionCode !== getDefaultCode(language)
				) {
					setCode(sessionCode);
					setCodeLoadSource("session");
					return;
				}

				setCode(getDefaultCode(language));
				setCodeLoadSource("default");
			} catch (error: any) {
				console.log("코드 불러오기 실패:", error.message);
				setCode(getDefaultCode(language));
				setCodeLoadSource("default");
			}
		};

		loadCode();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedProblemId, sectionId, language, sessionId]);

	useEffect(() => {
		if (!sessionId || isTimeUp) return;

		const autoSaveInterval = setInterval(() => {
			saveToSession();
		}, 10000);

		return () => clearInterval(autoSaveInterval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [code, language, sessionId, isTimeUp]);

	const handleProblemChange = async (problemId: number) => {
		if (problemId === selectedProblemId) return;

		try {
			setSelectedProblemId(problemId);

			const problemInfo = await apiService.getProblemInfo(problemId);
			const problemData = problemInfo.data || problemInfo;
			setCurrentProblem(problemData);

			try {
				const savedData = await indexedDBManager.getSessionCode(
					problemId,
					sectionId!,
					language,
				);
				const sessionCode = savedData ? savedData.code : null;
				if (
					sessionCode &&
					sessionCode.trim() !== "" &&
					sessionCode !== getDefaultCode(language)
				) {
					setCode(sessionCode);
					setCodeLoadSource("session");
				} else {
					setCode(getDefaultCode(language));
					setCodeLoadSource("default");
				}
			} catch (error) {
				console.log("세션 코드 불러오기 실패:", error);
				setCode(getDefaultCode(language));
				setCodeLoadSource("default");
			}

			setSubmissionResult(null);
		} catch (error) {
			console.error("문제 변경 실패:", error);
		}
	};

	const saveToSession = async () => {
		if (
			!sessionId ||
			!code ||
			code === getDefaultCode(language) ||
			!selectedProblemId
		) {
			return;
		}

		try {
			setSessionSaveStatus("saving");
			await indexedDBManager.saveSessionCode(
				selectedProblemId,
				sectionId!,
				language,
				code,
			);
			setSessionSaveStatus("saved");
			setTimeout(() => setSessionSaveStatus("idle"), 2000);
		} catch (error) {
			console.error("세션 저장 실패:", error);
			setSessionSaveStatus("error");
			setTimeout(() => setSessionSaveStatus("idle"), 2000);
		}
	};

	const loadFromSession = async (): Promise<string | null> => {
		if (!sessionId || !selectedProblemId) return null;

		try {
			const savedData = await indexedDBManager.getSessionCode(
				selectedProblemId,
				sectionId!,
				language,
			);
			return savedData ? savedData.code : null;
		} catch (error) {
			console.error("세션 코드 불러오기 실패:", error);
			return null;
		}
	};

	const clearSessionAfterSubmission = async () => {
		if (!sessionId || !selectedProblemId) return;

		try {
			await indexedDBManager.deleteSessionCode(
				selectedProblemId,
				sectionId!,
				language,
			);
			setCodeLoadSource("backend");
			setSessionCleared(true);
			setTimeout(() => setSessionCleared(false), 3000);
		} catch (error) {
			console.warn("세션 데이터 정리 실패:", error);
		}
	};

	const handlePanelMove = (draggedPanelId: string, targetPanelId: string) => {
		if (draggedPanelId === targetPanelId) {
			return;
		}

		setPanelLayout((currentLayout) => {
			let draggedPos: keyof PanelLayout | null = null;
			let targetPos: keyof PanelLayout | null = null;

			if (currentLayout.left === draggedPanelId) draggedPos = "left";
			else if (currentLayout.topRight === draggedPanelId)
				draggedPos = "topRight";
			else if (currentLayout.bottomRight === draggedPanelId)
				draggedPos = "bottomRight";

			if (currentLayout.left === targetPanelId) targetPos = "left";
			else if (currentLayout.topRight === targetPanelId) targetPos = "topRight";
			else if (currentLayout.bottomRight === targetPanelId)
				targetPos = "bottomRight";

			if (draggedPos && targetPos) {
				const newLayout = { ...currentLayout };
				newLayout[draggedPos] = targetPanelId;
				newLayout[targetPos] = draggedPanelId;
				return newLayout;
			}

			return currentLayout;
		});
	};

	const handleSubmit = async () => {
		if (!code.trim()) {
			alert("코드를 작성해주세요.");
			return;
		}

		if (isTimeUp) {
			alert("시간이 종료되어 제출할 수 없습니다.");
			return;
		}

		setIsSubmitting(true);
		setSubmissionResult(null);

		try {
			const submissionResponse = await apiService.submitCode(
				sectionId!,
				selectedProblemId!,
				code,
				language,
			);

			if (submissionResponse) {
				const {
					result,
					submissionId,
					submittedAt,
					language: submittedLanguage,
				} = submissionResponse;

				const resultInfo = resultMapping[result] || {
					status: "unknown",
					message: `알 수 없는 결과: ${result}`,
					color: "#6c757d",
				};

				setSubmissionResult({
					status: "completed",
					result: result,
					resultInfo: resultInfo,
					submissionId: submissionId,
					submittedAt: submittedAt,
					language: submittedLanguage,
					code: code,
					type: "judge",
				});

				await clearSessionAfterSubmission();
			} else {
				throw new Error("제출 응답을 받지 못했습니다.");
			}
		} catch (error: any) {
			console.error("코드 제출 실패:", error);
			setSubmissionResult({
				status: "error",
				message: error.message || "코드 제출에 실패했습니다.",
				resultInfo: { status: "error", message: "제출 실패", color: "#dc3545" },
				type: "judge",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmitWithOutput = async () => {
		if (!code.trim()) {
			alert("코드를 작성해주세요.");
			return;
		}

		if (isTimeUp) {
			alert("시간이 종료되어 테스트할 수 없습니다.");
			return;
		}

		setIsSubmitting(true);
		setSubmissionResult(null);

		try {
			const submissionResponse = await apiService.submitCodeAndGetOutput(
				sectionId!,
				selectedProblemId!,
				code,
				language,
			);

			if (submissionResponse) {
				const {
					result,
					submissionId,
					submittedAt,
					language: submittedLanguage,
					outputList,
				} = submissionResponse;

				const resultInfo = resultMapping[result] || {
					status: "unknown",
					message: `알 수 없는 결과: ${result}`,
					color: "#6c757d",
				};

				setSubmissionResult({
					status: "completed",
					result: result,
					resultInfo: resultInfo,
					submissionId: submissionId,
					submittedAt: submittedAt,
					language: submittedLanguage,
					code: code,
					outputList: outputList,
					type: "output",
				});

				await clearSessionAfterSubmission();
			} else {
				throw new Error("제출 응답을 받지 못했습니다.");
			}
		} catch (error: any) {
			console.error("코드 제출 및 아웃풋 요청 실패:", error);
			setSubmissionResult({
				status: "error",
				message: error.message || "코드 제출에 실패했습니다.",
				resultInfo: { status: "error", message: "제출 실패", color: "#dc3545" },
				type: "output",
				outputList: null,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleLanguageChange = (newLang: string) => {
		setLanguage(newLang);
		setCode(getDefaultCode(newLang));
	};

	const handleHorizontalDragEnd = (sizes: number[]) => {
		setHorizontalSizes(sizes);
	};

	const handleVerticalDragEnd = (sizes: number[]) => {
		setVerticalSizes(sizes);
	};

	const renderGutter = (direction: string) => {
		return () => ({
			backgroundColor: theme === "dark" ? "#2d3748" : "#cbd5e0",
		});
	};

	const renderPanel = (panelType: string, showDragHandle = true) => {
		const problemDescription =
			currentProblem.description ||
			`
# ${currentProblem.title}

## 문제 설명
이 문제는 ${currentProblem.title}에 대한 설명입니다.

## 제한사항
- 문제에 대한 제한사항을 확인하세요.

## 입출력 예시
\`\`\`
입력: 예시 입력
출력: 예시 출력
\`\`\`
`;

		const panels: Record<string, React.ReactNode> = {
			description: (
				<ProblemDescription
					currentProblem={currentProblem}
					problemDescription={problemDescription}
				/>
			),
			editor: (
				<CodeEditor
					language={language}
					code={code}
					theme={theme}
					assignmentInfo={quizInfo}
					isSubmitting={isSubmitting || isTimeUp}
					onCodeChange={(value: string) => setCode(value)}
					onSubmit={handleSubmit}
					onSubmitWithOutput={handleSubmitWithOutput}
					sessionSaveStatus={sessionSaveStatus}
					onSessionSave={saveToSession}
					codeLoadSource={codeLoadSource}
					sessionCleared={sessionCleared}
				/>
			),
			result: (
				<ExecutionResult
					submissionResult={submissionResult}
					isSubmitting={isSubmitting}
				/>
			),
		};

		const titles: Record<string, string> = {
			description: "문제 설명",
			editor: "코드 에디터",
			result: "실행 결과",
		};

		return (
			<DraggablePanel
				id={panelType}
				type={panelType}
				title={titles[panelType]}
				onMove={handlePanelMove}
				showDragHandle={showDragHandle}
			>
				{panels[panelType]}
			</DraggablePanel>
		);
	};

	if (isLoading) {
		return (
			<div className={`problem-solve-page ${theme}`}>
				<div className="loading-container">
					<LoadingSpinner />
				</div>
			</div>
		);
	}

	return (
		<DndProvider backend={HTML5Backend}>
			<div className={`problem-solve-page ${theme}`}>
				<div className="problem-solve-header quiz-header">
					<div className="breadcrumb">
						<span
							className="breadcrumb-link"
							onClick={() => navigate(`/sections/${sectionId}/coding-quiz`)}
						>
							코딩 테스트
						</span>
						<span> › </span>
						<strong>{quizInfo.title}</strong>
					</div>
					<div className="header-right">
						{problems.length > 1 && (
							<div className="problem-selector-header">
								{problems.map((problem, index) => (
									<button
										key={problem.id}
										className={`problem-selector-btn ${selectedProblemId === problem.id ? "active" : ""}`}
										onClick={() => handleProblemChange(problem.id)}
									>
										{index + 1}
									</button>
								))}
							</div>
						)}
						<QuizTimer endTime={quizInfo.endTime!} onTimeUp={handleTimeUp} />
						<div className="controls">
							<button
								className={`theme-button ${theme === "light" ? "active" : ""}`}
								onClick={() => setTheme("light")}
							>
								Light
							</button>
							<button
								className={`theme-button ${theme === "dark" ? "active" : ""}`}
								onClick={() => setTheme("dark")}
							>
								Dark
							</button>
							<select
								className="language-select"
								value={language}
								onChange={(e) => handleLanguageChange(e.target.value)}
								disabled={isTimeUp}
							>
								<option value="c">C</option>
								<option value="cpp">C++</option>
								<option value="java">Java</option>
								<option value="python">Python</option>
							</select>
						</div>
					</div>
				</div>

				<div className="main-split">
					<Split
						sizes={horizontalSizes}
						direction="horizontal"
						minSize={200}
						gutterSize={20}
						gutterStyle={renderGutter("horizontal")}
						onDragEnd={handleHorizontalDragEnd}
						style={{ display: "flex", width: "100%" }}
					>
						{renderPanel(panelLayout.left, true)}

						<Split
							sizes={verticalSizes}
							direction="vertical"
							minSize={100}
							gutterSize={20}
							gutterStyle={renderGutter("vertical")}
							onDragEnd={handleVerticalDragEnd}
							style={{
								display: "flex",
								flexDirection: "column",
								height: "100%",
							}}
						>
							{renderPanel(panelLayout.topRight, true)}
							{renderPanel(panelLayout.bottomRight, true)}
						</Split>
					</Split>
				</div>
			</div>
		</DndProvider>
	);
};

export default CodingQuizSolvePage;
