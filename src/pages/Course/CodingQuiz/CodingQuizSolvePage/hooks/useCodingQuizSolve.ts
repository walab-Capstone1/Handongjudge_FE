import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import apiService from "../../../../../services/APIService";
import indexedDBManager from "../../../../../utils/IndexedDBManager";
import { getDefaultCode, resultMapping } from "../utils";
import type {
	QuizInfo,
	SectionInfo,
	CurrentProblem,
	PanelLayout,
	SubmissionResult,
	Problem,
} from "../types";

export function useCodingQuizSolve() {
	const { sectionId, quizId } = useParams<{
		sectionId: string;
		quizId: string;
	}>();
	const [searchParams] = useSearchParams();

	const [language, setLanguage] = useState("c");
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [code, setCode] = useState(() => getDefaultCode("c"));
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
			if (!quizId || !sectionId) return;
			try {
				setIsLoading(true);
				const [quizInfoRes, sectionInfoRes, problemsRes] = await Promise.all([
					apiService.getQuizInfo(sectionId, quizId),
					apiService.getSectionInfo(sectionId),
					apiService.getQuizProblems(sectionId, quizId),
				]);

				const quizData = quizInfoRes?.data ?? quizInfoRes;
				const sectionData = sectionInfoRes?.data ?? sectionInfoRes;
				const problemsData = problemsRes?.data ?? problemsRes;

				const quizInfoData: QuizInfo = {
					...quizData,
					startTime: quizData?.startTime ? new Date(quizData.startTime) : null,
					endTime: quizData?.endTime ? new Date(quizData.endTime) : null,
				};

				const problemsList: Problem[] = (problemsData || []).map(
					(p: {
						problemId: number;
						title: string;
						problemOrder: number;
						description?: string;
					}) => ({
						id: p.problemId,
						title: p.title,
						order: p.problemOrder,
						description: p.description || "",
					}),
				);

				const urlProblemId = searchParams.get("problemId");
				const defaultProblemId = urlProblemId
					? Number.parseInt(urlProblemId, 10)
					: (problemsList[0]?.id ?? null);

				if (!defaultProblemId) {
					throw new Error("문제를 찾을 수 없습니다");
				}

				const problemInfo = await apiService.getProblemInfo(
					String(defaultProblemId),
				);
				const problemData = problemInfo?.data ?? problemInfo;

				setQuizInfo(quizInfoData);
				setProblems(problemsList);
				setSectionInfo(sectionData);
				setCurrentProblem(problemData);
				setSelectedProblemId(defaultProblemId);
			} catch (error) {
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

	const loadFromSession = useCallback(async (): Promise<string | null> => {
		if (!sessionId || !selectedProblemId || !sectionId) return null;
		try {
			const savedData = await indexedDBManager.getSessionCode(
				selectedProblemId,
				sectionId,
				language,
			);
			return savedData ? savedData.code : null;
		} catch {
			return null;
		}
	}, [sessionId, selectedProblemId, sectionId, language]);

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
			} catch {
				setCode(getDefaultCode(language));
				setCodeLoadSource("default");
			}
		};
		loadCode();
	}, [selectedProblemId, sectionId, language, sessionId, loadFromSession]);

	const saveToSession = useCallback(async () => {
		if (
			!sessionId ||
			!code ||
			code === getDefaultCode(language) ||
			!selectedProblemId ||
			!sectionId
		)
			return;
		try {
			setSessionSaveStatus("saving");
			await indexedDBManager.saveSessionCode(
				selectedProblemId,
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
	}, [sessionId, code, language, selectedProblemId, sectionId]);

	useEffect(() => {
		if (!sessionId || isTimeUp) return;
		const autoSaveInterval = setInterval(() => {
			saveToSession();
		}, 10000);
		return () => clearInterval(autoSaveInterval);
	}, [sessionId, isTimeUp, saveToSession]);

	const clearSessionAfterSubmission = useCallback(async () => {
		if (!sessionId || !selectedProblemId || !sectionId) return;
		try {
			await indexedDBManager.deleteSessionCode(
				selectedProblemId,
				sectionId,
				language,
			);
			setCodeLoadSource("backend");
			setSessionCleared(true);
			setTimeout(() => setSessionCleared(false), 3000);
		} catch (err) {
			console.warn("세션 데이터 정리 실패:", err);
		}
	}, [sessionId, selectedProblemId, sectionId, language]);

	const handleTimeUp = useCallback(() => {
		setIsTimeUp(true);
		alert("퀴즈 시간이 종료되었습니다. 자동으로 제출됩니다.");
	}, []);

	const handleProblemChange = useCallback(
		async (problemId: number) => {
			if (problemId === selectedProblemId || !sectionId) return;
			try {
				setSelectedProblemId(problemId);
				const problemInfo = await apiService.getProblemInfo(String(problemId));
				const problemData = problemInfo?.data ?? problemInfo;
				setCurrentProblem(problemData);

				try {
					const savedData = await indexedDBManager.getSessionCode(
						problemId,
						sectionId,
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
				} catch {
					setCode(getDefaultCode(language));
					setCodeLoadSource("default");
				}
				setSubmissionResult(null);
			} catch (error) {
				console.error("문제 변경 실패:", error);
			}
		},
		[selectedProblemId, sectionId, language],
	);

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

	const handleSubmit = useCallback(async () => {
		if (!code.trim()) {
			alert("코드를 작성해주세요.");
			return;
		}
		if (isTimeUp) {
			alert("시간이 종료되어 제출할 수 없습니다.");
			return;
		}
		if (!sectionId || selectedProblemId == null) return;

		setIsSubmitting(true);
		setSubmissionResult(null);
		try {
			const submissionResponse = await apiService.submitCode(
				sectionId,
				String(selectedProblemId),
				code,
				language,
			);
			const res = submissionResponse?.data ?? submissionResponse;
			if (res) {
				const result = res.result ?? res.resultType;
				const resultInfo = resultMapping[result] ?? {
					status: "unknown",
					message: `알 수 없는 결과: ${result}`,
					color: "#6c757d",
				};
				setSubmissionResult({
					status: "completed",
					result: result,
					resultInfo,
					submissionId: res.submissionId,
					submittedAt: res.submittedAt,
					language: res.language ?? language,
					code,
					type: "judge",
				});
				await clearSessionAfterSubmission();
			} else {
				throw new Error("제출 응답을 받지 못했습니다.");
			}
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
	}, [
		code,
		language,
		sectionId,
		selectedProblemId,
		isTimeUp,
		clearSessionAfterSubmission,
	]);

	const handleSubmitWithOutput = useCallback(async () => {
		if (!code.trim()) {
			alert("코드를 작성해주세요.");
			return;
		}
		if (isTimeUp) {
			alert("시간이 종료되어 테스트할 수 없습니다.");
			return;
		}
		if (!sectionId || selectedProblemId == null) return;

		setIsSubmitting(true);
		setSubmissionResult(null);
		try {
			const submissionResponse = await apiService.submitCodeAndGetOutput(
				sectionId,
				String(selectedProblemId),
				code,
				language,
			);
			const res = submissionResponse?.data ?? submissionResponse;
			if (res) {
				const result = res.result ?? res.resultType;
				const resultInfo = resultMapping[result] ?? {
					status: "unknown",
					message: `알 수 없는 결과: ${result}`,
					color: "#6c757d",
				};
				setSubmissionResult({
					status: "completed",
					result,
					resultInfo,
					submissionId: res.submissionId,
					submittedAt: res.submittedAt,
					language: res.language ?? language,
					code,
					outputList: res.outputList,
					type: "output",
				});
				await clearSessionAfterSubmission();
			} else {
				throw new Error("제출 응답을 받지 못했습니다.");
			}
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
	}, [
		code,
		language,
		sectionId,
		selectedProblemId,
		isTimeUp,
		clearSessionAfterSubmission,
	]);

	const handleLanguageChange = useCallback((newLang: string) => {
		setLanguage(newLang);
		setCode(getDefaultCode(newLang));
	}, []);

	const handleHorizontalDragEnd = useCallback((sizes: number[]) => {
		setHorizontalSizes(sizes);
	}, []);

	const handleVerticalDragEnd = useCallback((sizes: number[]) => {
		setVerticalSizes(sizes);
	}, []);

	const gutterStyleCallback = useCallback(
		() => ({ backgroundColor: theme === "dark" ? "#2d3748" : "#cbd5e0" }),
		[theme],
	);

	const problemDescription =
		currentProblem.description ||
		`# ${currentProblem.title}\n\n## 문제 설명\n이 문제는 ${currentProblem.title}에 대한 설명입니다.\n\n## 제한사항\n- 문제에 대한 제한사항을 확인하세요.\n\n## 입출력 예시\n\`\`\`\n입력: 예시 입력\n출력: 예시 출력\n\`\`\``;

	return {
		sectionId,
		quizInfo,
		problems,
		selectedProblemId,
		currentProblem,
		problemDescription,
		language,
		theme,
		setTheme,
		code,
		setCode,
		submissionResult,
		isSubmitting,
		isTimeUp,
		sessionSaveStatus,
		codeLoadSource,
		sessionCleared,
		isLoading,
		horizontalSizes,
		verticalSizes,
		panelLayout,
		handleTimeUp,
		handleProblemChange,
		handlePanelMove,
		handleSubmit,
		handleSubmitWithOutput,
		saveToSession,
		handleLanguageChange,
		handleHorizontalDragEnd,
		handleVerticalDragEnd,
		gutterStyleCallback,
	};
}

export type UseCodingQuizSolveReturn = ReturnType<typeof useCodingQuizSolve>;
