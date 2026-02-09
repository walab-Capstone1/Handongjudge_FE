import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import apiService from "../../../../services/APIService";
import indexedDBManager from "../../../../utils/IndexedDBManager";
import { getDefaultCode } from "../utils/getDefaultCode";
import {
	RESULT_MAPPING_JUDGE,
	RESULT_MAPPING_OUTPUT,
} from "../utils/resultMappings";
import type { Problem, SubmissionResultState } from "../types";

export type PanelKey = "description" | "editor" | "result";
export type PanelLayout = {
	left: PanelKey;
	topRight: PanelKey;
	bottomRight: PanelKey;
};
type SessionSaveStatus = "idle" | "saving" | "saved" | "error";
type CodeLoadSource = "session" | "backend" | "default" | null;

export function useProblemSolve() {
	const { assignmentId, problemId, sectionId } = useParams<{
		assignmentId: string;
		problemId: string;
		sectionId: string;
	}>();

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
						[draggedPos]: targetPanelId as PanelKey,
						[targetPos]: draggedPanelId as PanelKey,
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

	return {
		sectionId,
		assignmentId,
		sectionInfo,
		assignmentInfo,
		currentProblem,
		problemDescription,
		language,
		theme,
		setTheme,
		code,
		setCode,
		submissionResult,
		isSubmitting,
		sessionSaveStatus,
		codeLoadSource,
		sessionCleared,
		isLoading,
		horizontalSizes,
		verticalSizes,
		panelLayout,
		handlePanelMove,
		handleLanguageChange,
		handleSubmit,
		handleSubmitWithOutput,
		saveToSession,
		handleHorizontalDragEnd,
		handleVerticalDragEnd,
		gutterStyleCallback,
	};
}
