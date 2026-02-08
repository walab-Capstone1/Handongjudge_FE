import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Split from "react-split";
import apiService from "../../../services/APIService";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ProblemDescription from "../../CodingQuizSolvePage/ProblemDescription";
import CodeEditor from "../../CodingQuizSolvePage/CodeEditor";
import ExecutionResult from "../../CodingQuizSolvePage/ExecutionResult";
import DraggablePanel from "../../CodingQuizSolvePage/DraggablePanel";
import indexedDBManager from "../../../utils/IndexedDBManager";
import type { Problem, SubmissionResultState } from "./types";
import * as S from "./styles";

type PanelKey = "description" | "editor" | "result";
type PanelLayout = {
	left: PanelKey;
	topRight: PanelKey;
	bottomRight: PanelKey;
};
type SessionSaveStatus = "idle" | "saving" | "saved" | "error";
type CodeLoadSource = "session" | "backend" | "default" | null;

function getDefaultCode(lang: string): string {
	switch (lang) {
		case "javascript":
			return "function solution() {\n  // 여기에 코드를 작성하세요\n  return;\n}";
		case "python":
			return "def solution():\n    # 여기에 코드를 작성하세요\n    return";
		case "java":
			return "public class Solution {\n    public static void main(String[] args) {\n        // 여기에 코드를 작성하세요\n    }\n}";
		case "cpp":
			return "#include <iostream>\nusing namespace std;\n\nint main() {\n    // 여기에 코드를 작성하세요\n    return 0;\n}";
		case "c":
			return "#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 작성하세요\n    return 0;\n}";
		default:
			return "// 여기에 코드를 작성하세요\n";
	}
}

const RESULT_MAPPING_JUDGE: Record<
	string,
	{ status: string; message: string; color: string }
> = {
	AC: { status: "success", message: "정답 (Accepted)", color: "#28a745" },
	WA: { status: "error", message: "오답 (Wrong Answer)", color: "#dc3545" },
	TLE: {
		status: "error",
		message: "시간 초과 (Time Limit Exceeded)",
		color: "#ffc107",
	},
	MLE: {
		status: "error",
		message: "메모리 초과 (Memory Limit Exceeded)",
		color: "#fd7e14",
	},
	RE: {
		status: "error",
		message: "런타임 에러 (Runtime Error)",
		color: "#e83e8c",
	},
	CE: {
		status: "error",
		message: "컴파일 에러 (Compilation Error)",
		color: "#6f42c1",
	},
	PE: {
		status: "error",
		message: "출력 형식 오류 (Presentation Error)",
		color: "#17a2b8",
	},
	NO: { status: "error", message: "출력 없음 (No Output)", color: "#6c757d" },
};

const RESULT_MAPPING_OUTPUT: Record<
	string,
	{ status: string; message: string; color: string }
> = {
	correct: { status: "success", message: "정답 (Accepted)", color: "#28a745" },
	"wrong-answer": {
		status: "error",
		message: "오답 (Wrong Answer)",
		color: "#dc3545",
	},
	timelimit: {
		status: "error",
		message: "시간 초과 (Time Limit Exceeded)",
		color: "#ffc107",
	},
	"memory-limit": {
		status: "error",
		message: "메모리 초과 (Memory Limit Exceeded)",
		color: "#fd7e14",
	},
	"run-error": {
		status: "error",
		message: "런타임 에러 (Runtime Error)",
		color: "#e83e8c",
	},
	"compiler-error": {
		status: "error",
		message: "컴파일 에러 (Compilation Error)",
		color: "#6f42c1",
	},
	"presentation-error": {
		status: "error",
		message: "출력 형식 오류 (Presentation Error)",
		color: "#17a2b8",
	},
	"no-output": {
		status: "error",
		message: "출력 없음 (No Output)",
		color: "#6c757d",
	},
	...RESULT_MAPPING_JUDGE,
};

const ProblemSolvePage: React.FC = () => {
	const { assignmentId, problemId, sectionId } = useParams<{
		assignmentId: string;
		problemId: string;
		sectionId: string;
	}>();
	const navigate = useNavigate();

	const [language, setLanguage] = useState("c");
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [code, setCode] = useState(() => getDefaultCode("c"));
	const [submissionResult, setSubmissionResult] =
		useState<SubmissionResultState | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [currentProblem, setCurrentProblem] = useState<Problem>({
		title: "Loading...",
		description: "Loading...",
	});
	const [sectionInfo, setSectionInfo] = useState<{
		courseTitle: string;
		sectionNumber: number;
		instructorName?: string;
	}>({
		courseTitle: "Loading...",
		sectionNumber: 0,
		instructorName: "",
	});
	const [assignmentInfo, setAssignmentInfo] = useState<{
		title: string;
		assignmentNumber?: string;
		dueDate: string | null;
		endDate: string | null;
	}>({
		title: "Loading...",
		assignmentNumber: "",
		dueDate: null,
		endDate: null,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [horizontalSizes, setHorizontalSizes] = useState([40, 60]);
	const [verticalSizes, setVerticalSizes] = useState([70, 30]);
	const [panelLayout, setPanelLayout] = useState<PanelLayout>({
		left: "description",
		topRight: "editor",
		bottomRight: "result",
	});
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [sessionSaveStatus, setSessionSaveStatus] =
		useState<SessionSaveStatus>("idle");
	const [codeLoadSource, setCodeLoadSource] = useState<CodeLoadSource>(null);
	const [sessionCleared, setSessionCleared] = useState(false);

	// Load problem, section, assignment information
	useEffect(() => {
		const loadAllInfo = async () => {
			if (!problemId || !sectionId || !assignmentId) return;
			try {
				setIsLoading(true);
				const [problemInfo, sectionInfoRes, assignmentInfoRes] =
					await Promise.all([
						apiService.getProblemInfo(problemId),
						apiService.getSectionInfo(sectionId),
						apiService.getAssignmentInfoBySection(sectionId, assignmentId),
					]);
				const problemData = problemInfo?.data ?? problemInfo;
				const sectionData = sectionInfoRes?.data ?? sectionInfoRes;
				const assignmentData = assignmentInfoRes?.data ?? assignmentInfoRes;
				setCurrentProblem(problemData as Problem);
				setSectionInfo(sectionData);
				setAssignmentInfo(assignmentData);
			} catch (error) {
				console.error("정보 로드 실패:", error);
				setCurrentProblem({
					title: "오류",
					description: "문제를 불러오는데 실패했습니다.",
				});
			} finally {
				setIsLoading(false);
			}
		};
		loadAllInfo();
	}, [problemId, sectionId, assignmentId]);

	// IndexedDB 세션 초기화
	useEffect(() => {
		const initializeSession = async () => {
			try {
				await indexedDBManager.init();
				const currentSessionId = indexedDBManager.getSessionId();
				setSessionId(currentSessionId);
				indexedDBManager
					.cleanupOldData()
					.catch((err) => console.warn("오래된 데이터 정리 실패:", err));
			} catch (error) {
				console.error("IndexedDB 초기화 실패:", error);
			}
		};
		initializeSession();
	}, []);

	const saveToSession = useCallback(async () => {
		if (
			!sessionId ||
			!code ||
			code === getDefaultCode(language) ||
			!problemId ||
			!sectionId
		)
			return;
		try {
			setSessionSaveStatus("saving");
			await indexedDBManager.saveSessionCode(
				problemId,
				sectionId,
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
	}, [sessionId, code, language, problemId, sectionId]);

	const loadFromSession = useCallback(async (): Promise<string | null> => {
		if (!sessionId || !problemId || !sectionId) return null;
		try {
			const savedData = await indexedDBManager.getSessionCode(
				problemId,
				sectionId,
				language,
			);
			return savedData ? savedData.code : null;
		} catch {
			return null;
		}
	}, [sessionId, problemId, sectionId, language]);

	const clearSessionAfterSubmission = useCallback(async () => {
		if (!sessionId || !problemId || !sectionId) return;
		try {
			await indexedDBManager.deleteSessionCode(problemId, sectionId, language);
			setCodeLoadSource("backend");
			setSessionCleared(true);
			setTimeout(() => setSessionCleared(false), 3000);
		} catch (err) {
			console.warn("세션 데이터 정리 실패:", err);
		}
	}, [sessionId, problemId, sectionId, language]);

	// Ctrl+S 단축키
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "s") {
				event.preventDefault();
				saveToSession();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [saveToSession]);

	// 페이지 로드 시 코드 불러오기 (IndexedDB → 백엔드 → 기본)
	useEffect(() => {
		const loadCode = async () => {
			if (!problemId || !sectionId || !language || !sessionId) return;
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
				const response = await apiService.loadProgress(
					problemId,
					sectionId,
					language,
				);
				const raw = response as
					| { codeString?: string; code?: string }
					| string
					| undefined;
				const backendCode =
					typeof raw === "object" && raw !== null
						? (raw?.codeString ?? raw?.code ?? undefined)
						: typeof raw === "string"
							? raw
							: undefined;
				if (
					backendCode &&
					typeof backendCode === "string" &&
					backendCode.trim() !== "" &&
					backendCode !== getDefaultCode(language)
				) {
					setCode(backendCode);
					setCodeLoadSource("backend");
					return;
				}
				setCode(getDefaultCode(language));
				setCodeLoadSource("default");
			} catch {
				setCode(getDefaultCode(language));
				setCodeLoadSource("default");
			}
		};
		loadCode();
	}, [problemId, sectionId, language, sessionId, loadFromSession]);

	const handlePanelMove = useCallback(
		(draggedPanelId: string, targetPanelId: string) => {
			if (draggedPanelId === targetPanelId) return;
			setPanelLayout((currentLayout) => {
				let draggedPos: keyof PanelLayout | null = null;
				let targetPos: keyof PanelLayout | null = null;
				if (currentLayout.left === draggedPanelId) draggedPos = "left";
				else if (currentLayout.topRight === draggedPanelId)
					draggedPos = "topRight";
				else if (currentLayout.bottomRight === draggedPanelId)
					draggedPos = "bottomRight";
				if (currentLayout.left === targetPanelId) targetPos = "left";
				else if (currentLayout.topRight === targetPanelId)
					targetPos = "topRight";
				else if (currentLayout.bottomRight === targetPanelId)
					targetPos = "bottomRight";
				if (draggedPos && targetPos) {
					return {
						...currentLayout,
						[draggedPos]: targetPanelId,
						[targetPos]: draggedPanelId,
					};
				}
				return currentLayout;
			});
		},
		[],
	);

	const handleLanguageChange = useCallback((newLang: string) => {
		setLanguage(newLang);
		setCode(getDefaultCode(newLang));
	}, []);

	const handleSubmit = useCallback(async () => {
		if (!code.trim()) {
			alert("코드를 작성해주세요.");
			return;
		}
		if (!sectionId || !problemId) return;
		setIsSubmitting(true);
		setSubmissionResult(null);
		try {
			const submissionResponse = await apiService.submitCode(
				sectionId,
				problemId,
				code,
				language,
			);
			const res = submissionResponse?.data ?? submissionResponse;
			const result = res?.result ?? res?.resultType;
			const fallback = {
				status: "unknown",
				message: String(result),
				color: "#6c757d",
			};
			const resultInfo = RESULT_MAPPING_JUDGE[result ?? "WA"] ?? fallback;
			setSubmissionResult({
				status: "completed",
				result: result ?? "NO",
				resultInfo,
				submissionId: res?.submissionId,
				submittedAt: res?.submittedAt,
				language: res?.language ?? language,
				code,
				type: "judge",
			});
			await clearSessionAfterSubmission();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "코드 제출에 실패했습니다.";
			setSubmissionResult({
				status: "error",
				message,
				resultInfo: { status: "error", message: "제출 실패", color: "#dc3545" },
				type: "judge",
			});
		} finally {
			setIsSubmitting(false);
		}
	}, [code, language, sectionId, problemId, clearSessionAfterSubmission]);

	const handleSubmitWithOutput = useCallback(async () => {
		if (!code.trim()) {
			alert("코드를 작성해주세요.");
			return;
		}
		if (!sectionId || !problemId) return;
		setIsSubmitting(true);
		setSubmissionResult(null);
		try {
			const submissionResponse = await apiService.submitCodeAndGetOutput(
				sectionId,
				problemId,
				code,
				language,
			);
			const res = submissionResponse?.data ?? submissionResponse;
			const result = res?.result ?? res?.resultType;
			const resultInfo = RESULT_MAPPING_OUTPUT[result] ?? {
				status: "unknown",
				message: String(result ?? "unknown"),
				color: "#6c757d",
			};
			setSubmissionResult({
				status: "completed",
				result: result ?? "no-output",
				resultInfo,
				submissionId: res?.submissionId,
				submittedAt: res?.submittedAt,
				language: res?.language ?? language,
				code,
				outputList: res?.outputList ?? undefined,
				type: "output",
			});
			await clearSessionAfterSubmission();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "코드 제출에 실패했습니다.";
			setSubmissionResult({
				status: "error",
				message,
				resultInfo: { status: "error", message: "제출 실패", color: "#dc3545" },
				type: "output",
				outputList: undefined,
			});
		} finally {
			setIsSubmitting(false);
		}
	}, [code, language, sectionId, problemId, clearSessionAfterSubmission]);

	const handleHorizontalDragEnd = useCallback((sizes: number[]) => {
		setHorizontalSizes(sizes);
	}, []);

	const handleVerticalDragEnd = useCallback((sizes: number[]) => {
		setVerticalSizes(sizes);
	}, []);

	const gutterStyleCallback = useCallback(
		(_dim: "width" | "height", _gutterSize: number, _index: number) => ({
			backgroundColor: theme === "dark" ? "#2d3748" : "#cbd5e0",
		}),
		[theme],
	);

	const problemDescription =
		currentProblem.description ||
		`# ${currentProblem.title}\n\n## 문제 설명\n이 문제는 ${currentProblem.title}에 대한 설명입니다.\n\n## 제한사항\n- 문제에 대한 제한사항을 확인하세요.\n\n## 입출력 예시\n\`\`\`\n입력: 예시 입력\n출력: 예시 출력\n\`\`\`\n\n## 힌트\n- 문제 해결을 위한 힌트를 참고하세요.`;

	const panels: Record<PanelKey, React.ReactNode> = {
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
				assignmentInfo={assignmentInfo}
				isSubmitting={isSubmitting}
				onCodeChange={setCode}
				onSubmit={handleSubmit}
				onSubmitWithOutput={handleSubmitWithOutput}
				sessionSaveStatus={sessionSaveStatus}
				onSessionSave={saveToSession}
				codeLoadSource={codeLoadSource ?? undefined}
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

	const titles: Record<PanelKey, string> = {
		description: "문제 설명",
		editor: "코드 에디터",
		result: "실행 결과",
	};

	const renderPanel = (panelType: PanelKey, showDragHandle = true) => (
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

	if (isLoading) {
		return (
			<S.PageWrapper className={`problem-solve-page ${theme}`} $theme={theme}>
				<S.LoadingContainer $theme={theme}>
					<LoadingSpinner />
				</S.LoadingContainer>
			</S.PageWrapper>
		);
	}

	return (
		<DndProvider backend={HTML5Backend}>
			<S.PageWrapper className={`problem-solve-page ${theme}`} $theme={theme}>
				<S.Header $theme={theme}>
					<S.Breadcrumb>
						<S.BreadcrumbLink
							type="button"
							onClick={() => navigate(`/sections/${sectionId}/dashboard`)}
						>
							{sectionInfo.courseTitle}
						</S.BreadcrumbLink>
						<span> › </span>

						<S.BreadcrumbLink
							type="button"
							onClick={() =>
								navigate(
									`/sections/${sectionId}/course-assignments?assignmentId=${assignmentId}`,
								)
							}
						>
							{assignmentInfo.title}
						</S.BreadcrumbLink>
						<span> › </span>
						<S.BreadcrumbCurrent $theme={theme}>
							{currentProblem.title}
						</S.BreadcrumbCurrent>
					</S.Breadcrumb>
					<S.Controls>
						<S.ThemeButton
							type="button"
							$active={theme === "light"}
							$theme={theme}
							onClick={() => setTheme("light")}
						>
							Light
						</S.ThemeButton>
						<S.ThemeButton
							type="button"
							$active={theme === "dark"}
							$theme={theme}
							onClick={() => setTheme("dark")}
						>
							Dark
						</S.ThemeButton>
						<S.LanguageSelect
							$theme={theme}
							value={language}
							onChange={(e) => handleLanguageChange(e.target.value)}
							disabled
							style={{ opacity: 0.7, cursor: "not-allowed" }}
						>
							<option value="c">C</option>
						</S.LanguageSelect>
					</S.Controls>
				</S.Header>

				<S.MainSplit>
					<Split
						sizes={horizontalSizes}
						direction="horizontal"
						minSize={200}
						gutterSize={20}
						gutterStyle={gutterStyleCallback}
						onDragEnd={handleHorizontalDragEnd}
						style={{ display: "flex", width: "100%" }}
					>
						{renderPanel(panelLayout.left, true)}
						<Split
							sizes={verticalSizes}
							direction="vertical"
							minSize={100}
							gutterSize={20}
							gutterStyle={gutterStyleCallback}
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
				</S.MainSplit>
			</S.PageWrapper>
		</DndProvider>
	);
};

export default ProblemSolvePage;
