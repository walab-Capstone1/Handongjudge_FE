import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { authState } from "../../../../recoil/atoms";
import apiService from "../../../../services/APIService";
import tokenManager from "../../../../utils/tokenManager";
import indexedDBManager from "../../../../utils/IndexedDBManager";
import { getDefaultCode } from "../utils/getDefaultCode";
import {
	RESULT_MAPPING_JUDGE,
	RESULT_MAPPING_OUTPUT,
} from "../utils/resultMappings";
import type { Problem, SubmissionResultState } from "../types";
import type { ProblemWorkStatus } from "../../../Course/CodingQuiz/CodingQuizSolvePage/types";

export type TestcaseResult = { index: number; result: string };

export type PanelKey = "description" | "editor" | "result";
export type PanelLayout = {
	left: PanelKey;
	topRight: PanelKey;
	bottomRight: PanelKey;
};
type SessionSaveStatus = "idle" | "saving" | "saved" | "error";
type CodeLoadSource = "session" | "backend" | "default" | null;
type AssignmentProblemSummary = { id: number; title: string; order: number };
type SectionAssignmentSummary = { id: number; title: string };
type PendingNavigation = { assignmentId: string; problemId: number };

export function useProblemSolve() {
	const { assignmentId, problemId, sectionId } = useParams<{
		assignmentId: string;
		problemId: string;
		sectionId: string;
	}>();

	const [language] = useState("c");
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [code, setCode] = useState(() => getDefaultCode("c"));
	const [submissionResult, setSubmissionResult] =
		useState<SubmissionResultState | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [testcaseResults, setTestcaseResults] = useState<TestcaseResult[] | null>(null);
	const [totalTestcaseCount, setTotalTestcaseCount] = useState<number | null>(null);
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
		active?: boolean;
	}>({
		title: "Loading...",
		assignmentNumber: "",
		dueDate: null,
		endDate: null,
		active: true,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
	const [isAssignmentActive, setIsAssignmentActive] = useState(true);
	const navigate = useNavigate();
	const [horizontalSizes, setHorizontalSizes] = useState([28, 72]);
	const [verticalSizes, setVerticalSizes] = useState([82, 18]);
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
	const [userRole, setUserRole] = useState<string | null>(null);
	const [problems, setProblems] = useState<AssignmentProblemSummary[]>([]);
	const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
	const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
	const [isProblemChanging, setIsProblemChanging] = useState(false);
	const [sectionAssignments, setSectionAssignments] = useState<
		SectionAssignmentSummary[]
	>([]);
	const [problemStatusById, setProblemStatusById] = useState<
		Record<number, ProblemWorkStatus>
	>({});
	const auth = useRecoilValue(authState);

	// 마지막으로 서버에 저장된 코드 (hasUnsavedChanges 판단 기준)
	const lastSavedCodeRef = useRef<string>("");
	// IndexedDB 디바운스 저장 타이머
	const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// 제출하기 폴링 취소 플래그 (언마운트 또는 재제출 시 이전 폴링 중단)
	const submissionPollingCancelledRef = useRef(false);
	// 테스트하기 SSE 연결 취소용 AbortController
	const sseAbortControllerRef = useRef<AbortController | null>(null);
	// 테스트하기 SSE 수신 중 output 누적용 (re-render 없이 축적)
	const testcaseOutputAccumRef = useRef<NonNullable<SubmissionResultState["outputList"]>>([]);
	const [showUnsavedModal, setShowUnsavedModal] = useState(false);
	const pendingNavigationRef = useRef<PendingNavigation | null>(null);

	const mergeStatusesFromApi = useCallback(
		(
			response: unknown,
			prev: Record<number, ProblemWorkStatus>,
		): Record<number, ProblemWorkStatus> => {
			const root =
				typeof response === "object" &&
				response !== null &&
				"data" in (response as Record<string, unknown>)
					? (response as { data: unknown }).data
					: response;
			if (!root || typeof root !== "object") return prev;
			const list = (root as { problemStatuses?: unknown }).problemStatuses;
			if (!Array.isArray(list)) return prev;
			const next: Record<number, ProblemWorkStatus> = {};
			for (const row of list) {
				const rec = row as Record<string, unknown>;
				const pid = Number(rec.problemId);
				if (!Number.isFinite(pid)) continue;
				const hasSubmitted = Boolean(rec.hasSubmitted);
				const hasCorrect = Boolean(rec.hasCorrectSubmission);
				const was = prev[pid];
				next[pid] = {
					problemId: pid,
					submitted: hasSubmitted,
					result: hasSubmitted ? (hasCorrect ? "AC" : "WA") : null,
					saved: hasSubmitted ? false : Boolean(was?.saved),
				};
			}
			return next;
		},
		[],
	);

	const refreshProblemStatuses = useCallback(async () => {
		if (!sectionId || !assignmentId || auth.loading) return;
		try {
			const res = await apiService.getUserSubmissionStatus(
				sectionId,
				assignmentId,
			);
			setProblemStatusById((prev) => mergeStatusesFromApi(res, prev));
		} catch (e) {
			console.warn("과제 문제 제출 상태 조회 실패:", e);
		}
	}, [sectionId, assignmentId, auth.loading, mergeStatusesFromApi]);

	useEffect(() => {
		if (
			!sectionId ||
			!assignmentId ||
			problems.length === 0 ||
			auth.loading
		)
			return;
		void refreshProblemStatuses();
	}, [sectionId, assignmentId, problems, auth.loading, refreshProblemStatuses]);

	useEffect(() => {
		if (!isProblemModalOpen || !sectionId || !assignmentId || auth.loading)
			return;
		void refreshProblemStatuses();
	}, [
		isProblemModalOpen,
		sectionId,
		assignmentId,
		auth.loading,
		refreshProblemStatuses,
	]);

	useEffect(() => {
		const loadAllInfo = async () => {
			// auth 복원이 끝날 때까지 대기 (새로고침 시 토큰 없이 401 나는 것 방지)
			if (!problemId || !sectionId || !assignmentId || auth.loading) return;
			try {
				setIsLoading(true);
				
				// 사용자 역할 확인 (비활성화된 과제 접근 체크용)
				let currentUserRole: string | null = null;
				try {
					const roleResponse = await apiService.getMyRoleInSection(sectionId);
					currentUserRole = roleResponse?.data?.role ?? roleResponse?.role ?? null;
					setUserRole(currentUserRole);
				} catch (roleError) {
					console.warn("사용자 역할 확인 실패:", roleError);
					// 역할 확인 실패해도 계속 진행
				}

				const [problemInfo, sectionInfoRes, assignmentInfoRes, assignmentProblemsRes] =
					await Promise.all([
						apiService.getProblemInfo(problemId),
						apiService.getSectionInfo(sectionId),
						apiService.getAssignmentInfoBySection(sectionId, assignmentId),
						apiService.getAssignmentProblems(sectionId, assignmentId),
					]);
				const problemData = problemInfo?.data ?? problemInfo;
				const sectionData = sectionInfoRes?.data ?? sectionInfoRes;
				const assignmentData = assignmentInfoRes?.data ?? assignmentInfoRes;
				const assignmentProblemsRaw =
					(assignmentProblemsRes as { problems?: unknown[] })?.problems ??
					(assignmentProblemsRes as { data?: unknown[] })?.data ??
					(Array.isArray(assignmentProblemsRes) ? assignmentProblemsRes : []);
				const assignmentProblems: AssignmentProblemSummary[] = (
					assignmentProblemsRaw as Array<Record<string, unknown>>
				)
					.map((p, idx) => ({
						id: Number(p.id ?? p.problemId),
						title: String(p.title ?? p.problemTitle ?? `문제 ${idx + 1}`),
						order: Number(p.order ?? p.problemOrder ?? idx + 1),
					}))
					.filter((p) => Number.isFinite(p.id))
					.sort((a, b) => a.order - b.order);
				setCurrentProblem(problemData as Problem);
				setSectionInfo(sectionData);
				setAssignmentInfo(assignmentData);
				setProblems(assignmentProblems);

				// 과제 비활성화 체크 및 리다이렉트
				const active = assignmentData?.active ?? true;
				setIsAssignmentActive(active);

				// 학생인 경우 비활성화된 과제 접근 차단 및 리다이렉트
				if (!active) {
					const isManager = currentUserRole === "ADMIN" || currentUserRole === "TUTOR";
					
					if (!isManager) {
						// 학생인 경우: 알림 후 리다이렉트
						alert("해당 과제는 비활성화되어 있어 접근할 수 없습니다.");
						navigate(`/sections/${sectionId}/course-assignments`);
						return;
					}
					// 관리자인 경우: 접근 허용 (조회만 가능, 제출은 불가)
					console.warn("과제가 비활성화되어 있습니다. (관리자 접근)");
				}

				// 마감일 체크
				if (assignmentData?.endDate) {
					const endDate = new Date(assignmentData.endDate);
					const now = new Date();
					const deadlinePassed = now > endDate;
					setIsDeadlinePassed(deadlinePassed);
				} else {
					setIsDeadlinePassed(false);
				}
			} catch (error: any) {
				console.error("정보 로드 실패:", error);
				// 비활성화된 과제 접근 시도한 경우 리다이렉트
				if (
					error?.message?.includes("비활성화") ||
					error?.message?.includes("접근할 수 없습니다")
				) {
					alert("해당 과제는 비활성화되어 있어 접근할 수 없습니다.");
					navigate(`/sections/${sectionId}/course-assignments`);
					return;
				}
				setCurrentProblem({
					title: "오류",
					description: "문제를 불러오는데 실패했습니다.",
				});
			} finally {
				setIsLoading(false);
			}
		};
		loadAllInfo();
	}, [problemId, sectionId, assignmentId, navigate, auth.loading]);

	useEffect(() => {
		if (!sectionId || auth.loading) return;
		let cancelled = false;
		(async () => {
			try {
				const res = await apiService.getAssignmentsBySection(sectionId);
				const raw = (res as { data?: unknown })?.data ?? res ?? [];
				const arr = Array.isArray(raw) ? raw : [];
				const list: SectionAssignmentSummary[] = arr
					.map((a: Record<string, unknown>, idx: number) => ({
						id: Number(a.id),
						title: String(a.title ?? `과제 ${idx + 1}`),
					}))
					.filter((x) => Number.isFinite(x.id))
					.sort((a, b) => a.id - b.id);
				if (!cancelled) setSectionAssignments(list);
			} catch {
				if (!cancelled) setSectionAssignments([]);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [sectionId, auth.loading]);

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

	const [showSaveModal, setShowSaveModal] = useState(false);

	const saveToBackend = useCallback(async (showModal = false) => {
		if (
			!code ||
			code === getDefaultCode(language) ||
			!problemId ||
			!sectionId
		)
			return;
		try {
			setSessionSaveStatus("saving");
			// 서버와 IndexedDB에 동시 저장
			await Promise.all([
				apiService.saveProgress(problemId, sectionId, language, code),
				indexedDBManager.saveSessionCode(problemId, sectionId, language, code).catch(() => {}),
			]);
			// 서버 저장 시각을 localStorage에 기록 (timestamp 비교용)
			localStorage.setItem(`lastServerSave_${problemId}_${sectionId}_${language}`, Date.now().toString());
			lastSavedCodeRef.current = code;
			setSessionSaveStatus("saved");

			const pid = Number(problemId);
			if (Number.isFinite(pid)) {
				setProblemStatusById((prev) => {
					const cur = prev[pid];
					if (cur?.submitted) return prev;
					return {
						...prev,
						[pid]: {
							problemId: pid,
							submitted: false,
							result: null,
							saved: true,
						},
					};
				});
			}

			if (showModal) {
				setShowSaveModal(true);
				setTimeout(() => setShowSaveModal(false), 2000);
			} else {
				setTimeout(() => setSessionSaveStatus("idle"), 2000);
			}
		} catch (error) {
			console.error("백엔드 저장 실패:", error);
			setSessionSaveStatus("error");
			setTimeout(() => setSessionSaveStatus("idle"), 2000);
		}
	}, [code, language, problemId, sectionId]);

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
				saveToBackend(); // 백엔드에 직접 저장
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [saveToBackend]);

	useEffect(() => {
		const loadCode = async () => {
			if (!problemId || !sectionId || !language || auth.loading) return;
			try {
				// IndexedDB와 서버를 동시에 조회
				const [sessionResult, serverResult] = await Promise.allSettled([
					indexedDBManager.getSessionCode(problemId, sectionId, language),
					apiService.loadProgress(problemId, sectionId, language),
				]);

				const sessionRecord = sessionResult.status === "fulfilled" ? sessionResult.value : null;
				const serverData = serverResult.status === "fulfilled" ? serverResult.value : null;

				const sessionCode = sessionRecord?.code ?? null;
				const sessionTimestamp = sessionRecord?.timestamp ?? 0;

				// 마지막 서버 저장 시각 (저장 시 localStorage에 기록)
				const serverSaveKey = `lastServerSave_${problemId}_${sectionId}_${language}`;
				const lastServerSaveTime = parseInt(localStorage.getItem(serverSaveKey) ?? "0", 10);

				const raw = serverData as { codeString?: string; code?: string } | string | undefined;
				const serverCode =
					typeof raw === "object" && raw !== null
						? (raw?.codeString ?? raw?.code ?? undefined)
						: typeof raw === "string" ? raw : undefined;

				const isValidSession = Boolean(sessionCode && sessionCode.trim() !== "" && sessionCode !== getDefaultCode(language));
				const isValidServer = Boolean(serverCode && typeof serverCode === "string" && serverCode.trim() !== "" && serverCode !== getDefaultCode(language));

				if (isValidSession && isValidServer) {
					if (sessionTimestamp > lastServerSaveTime) {
						// 로컬이 더 최신 (예: 서버 저장 전에 브라우저를 닫았을 때)
						setCode(sessionCode!);
						setCodeLoadSource("session");
						lastSavedCodeRef.current = serverCode!; // 서버 버전이 마지막 "공식 저장"
					} else {
						// 서버가 최신 또는 동일
						setCode(serverCode!);
						setCodeLoadSource("backend");
						lastSavedCodeRef.current = serverCode!;
					}
				} else if (isValidSession) {
					setCode(sessionCode!);
					setCodeLoadSource("session");
					lastSavedCodeRef.current = ""; // 서버 저장 기록 없음
				} else if (isValidServer) {
					setCode(serverCode!);
					setCodeLoadSource("backend");
					lastSavedCodeRef.current = serverCode!;
				} else {
					setCode(getDefaultCode(language));
					setCodeLoadSource("default");
					lastSavedCodeRef.current = "";
				}
			} catch {
				setCode(getDefaultCode(language));
				setCodeLoadSource("default");
				lastSavedCodeRef.current = "";
			}
		};
		loadCode();
	}, [problemId, sectionId, language, auth.loading]);

	// 코드 변경 시 IndexedDB에 자동 저장 (디바운스 500ms)
	useEffect(() => {
		if (!sessionId || !problemId || !sectionId || auth.loading) return;
		if (!code || code === getDefaultCode(language)) return;
		if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
		autoSaveTimerRef.current = setTimeout(() => {
			indexedDBManager
				.saveSessionCode(problemId, sectionId, language, code)
				.catch((err) => console.warn("IndexedDB 자동 저장 실패:", err));
		}, 500);
		return () => {
			if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
		};
	}, [code, sessionId, problemId, sectionId, language, auth.loading]);

	// 5분마다 서버 자동 저장
	useEffect(() => {
		const interval = setInterval(() => {
			saveToBackend(false);
		}, 5 * 60 * 1000);
		return () => clearInterval(interval);
	}, [saveToBackend]);

	// 언마운트 시 진행 중인 폴링/SSE 취소
	useEffect(() => {
		return () => {
			submissionPollingCancelledRef.current = true;
			sseAbortControllerRef.current?.abort();
		};
	}, []);

	// 페이지 이탈/새로고침 시 미저장 변경사항 경고
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			const hasUnsaved = code !== lastSavedCodeRef.current && code !== getDefaultCode(language);
			if (hasUnsaved) {
				e.preventDefault();
				e.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [code, language]);

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

	const handleSubmit = useCallback(async () => {
		if (!code.trim()) {
			alert("코드를 작성해주세요.");
			return;
		}
		if (!sectionId || !problemId) return;

		// 비활성화 체크 (마감일 지나면 지각 제출로 허용)
		// 관리자/튜터는 비활성화된 과제도 제출 가능
		const isManager = userRole === "ADMIN" || userRole === "TUTOR";
		if (!isAssignmentActive && !isManager) {
			alert("해당 과제는 비활성화되어 있어 제출할 수 없습니다.");
			return;
		}

		const deadlineRaw = assignmentInfo.endDate || assignmentInfo.dueDate;
		if (
			!isManager &&
			deadlineRaw &&
			Date.now() > new Date(deadlineRaw).getTime()
		) {
			if (
				!window.confirm(
					"마감 시간이 지났습니다. 지금 제출하면 지각으로 표시됩니다. 계속하시겠습니까?",
				)
			) {
				return;
			}
		}

		// 이전 폴링이 진행 중이면 취소
		submissionPollingCancelledRef.current = true;
		await new Promise((r) => setTimeout(r, 0));
		submissionPollingCancelledRef.current = false;

		setIsSubmitting(true);
		setSubmissionResult(null);
		setTestcaseResults(null);

		try {
			// Step 1: DOMjudge에 제출 — 즉시 submissionDbId 반환
			const submitRes = await apiService.submitCodeAsync(
				sectionId,
				problemId,
				code,
				language,
			);
			const submissionDbId: number = submitRes?.submissionDbId;
			if (!submissionDbId) {
				throw new Error("제출 ID를 받지 못했습니다. 다시 시도해주세요.");
			}

			// Step 2: 결과 폴링 (1.5초 간격, 최대 35초)
			const POLL_INTERVAL_MS = 1500;
			const TIMEOUT_MS = 35_000;
			const deadline = Date.now() + TIMEOUT_MS;
			let resultData: any = null;

			while (Date.now() < deadline) {
				if (submissionPollingCancelledRef.current) return;
				await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
				if (submissionPollingCancelledRef.current) return;

				const pollRes = await apiService.getAssignmentResult(submissionDbId);
				if (pollRes) {
					resultData = pollRes?.data ?? pollRes;
					break;
				}
			}

			if (!resultData) {
				throw new Error(
					"채점 결과를 가져오는 데 시간이 초과되었습니다. 제출은 완료되었을 수 있으니 제출 목록에서 확인해 주세요.",
				);
			}

			const result = resultData?.result ?? resultData?.resultType;
			const fallback = { status: "unknown", message: String(result), color: "#6c757d" };
			const resultInfo = RESULT_MAPPING_JUDGE[result ?? "WA"] ?? fallback;
			setSubmissionResult({
				status: "completed",
				result: result ?? "NO",
				resultInfo,
				submissionId: resultData?.submissionId,
				submittedAt: resultData?.submittedAt,
				language: resultData?.language ?? language,
				code,
				type: "judge",
			});
			await clearSessionAfterSubmission();
			await refreshProblemStatuses();

		} catch (error: unknown) {
			if (submissionPollingCancelledRef.current) return;
			const message =
				error instanceof Error ? error.message : "코드 제출에 실패했습니다.";
			if (
				message.includes("비활성화") ||
				message.includes("제출할 수 없습니다")
			) {
				setIsAssignmentActive(false);
				alert(message);
				setTimeout(() => {
					navigate(`/sections/${sectionId}/course-assignments`);
				}, 1000);
				setIsSubmitting(false);
				return;
			}
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
		problemId,
		clearSessionAfterSubmission,
		refreshProblemStatuses,
		isAssignmentActive,
		navigate,
		userRole,
		assignmentInfo.endDate,
		assignmentInfo.dueDate,
	]);

	// SSE 세션 결과 초기화 (재제출 시 이전 테스트케이스 결과 지우기)
	const resetTestcaseResults = useCallback(() => {
		setTestcaseResults(null);
	}, []);

	const handleSubmitWithOutput = useCallback(async () => {
		if (!code.trim()) {
			alert("코드를 작성해주세요.");
			return;
		}
		if (!sectionId || !problemId) return;

		const isManager = userRole === "ADMIN" || userRole === "TUTOR";
		if (!isAssignmentActive && !isManager) {
			alert("해당 과제는 비활성화되어 있어 테스트할 수 없습니다.");
			return;
		}

		// 이전 SSE 연결 종료
		sseAbortControllerRef.current?.abort();
		const abortController = new AbortController();
		sseAbortControllerRef.current = abortController;

		setIsSubmitting(true);
		setSubmissionResult(null);
		setTestcaseResults(null);
		setTotalTestcaseCount(null);
		testcaseOutputAccumRef.current = [];

		try {
			// Step 1: DOMjudge에 제출 — sessionKey(= domjudgeSubmissionId) 반환
			const submitRes = await apiService.testSubmitAsync(
				sectionId,
				problemId,
				code,
				language,
			);
			const sessionKey: string = submitRes?.sessionKey;
			const resSectionId: number = submitRes?.sectionId;
			const submittedAt: string = submitRes?.submittedAt;
			const submittedLanguage: string = submitRes?.language ?? language;
			if (!sessionKey) {
				throw new Error("세션 키를 받지 못했습니다. 다시 시도해주세요.");
			}

			// Step 2: SSE 스트리밍으로 테스트케이스 output 수신
			const baseURL = process.env.REACT_APP_API_URL || "https://hcl.walab.info/api";
			const token = tokenManager.getAccessToken();

			await fetchEventSource(
				`${baseURL}/submissions/test/stream/${sessionKey}?sectionId=${resSectionId}`,
				{
					method: "GET",
					headers: {
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					},
					signal: abortController.signal,
					openWhenHidden: true,
					onmessage(event) {
						if (abortController.signal.aborted) return;
						try {
							const data = JSON.parse(event.data);

						if (event.event === "total") {
							setTotalTestcaseCount(data.count);

						} else if (event.event === "testcase") {
							// 진행 인디케이터용 (re-render O)
							setTestcaseResults((prev) => [
									...(prev ?? []),
									{ index: data.index, result: data.result },
								]);
								// 최종 outputList 구성용 (re-render X)
								testcaseOutputAccumRef.current = [
									...testcaseOutputAccumRef.current,
									{
										testcase_rank: data.index,
										result: data.result ?? null,
										runtime: data.runtime,
										memory_used: data.memoryUsed,
										testcase_input: data.testcaseInput,
										expected_output: data.expectedOutput,
										output: data.output,
										output_error: data.outputError,
										output_diff: data.outputDiff,
									},
								];

							} else if (event.event === "complete") {
								const result: string = data.result;
								const resultInfo = RESULT_MAPPING_OUTPUT[result] ?? {
									status: "unknown",
									message: String(result ?? "unknown"),
									color: "#6c757d",
								};
								setSubmissionResult({
									status: "completed",
									result,
									resultInfo,
									submittedAt,
									language: submittedLanguage,
									code,
									outputList: testcaseOutputAccumRef.current,
									type: "output",
								});
								abortController.abort();

							} else if (event.event === "ce") {
								const resultInfo = RESULT_MAPPING_OUTPUT["CE"] ?? {
									status: "ce",
									message: "컴파일 에러",
									color: "#fd7e14",
								};
								setSubmissionResult({
									status: "completed",
									result: "CE",
									resultInfo,
									submittedAt,
									language: submittedLanguage,
									code,
									type: "output",
								});
								abortController.abort();

							} else if (event.event === "error") {
								setSubmissionResult({
									status: "error",
									message: data.message,
									resultInfo: { status: "error", message: "테스트 실패", color: "#dc3545" },
									type: "output",
								});
								abortController.abort();
							}
						} catch {
							// JSON 파싱 실패는 무시
						}
					},
					onerror(err) {
						if (abortController.signal.aborted) return;
						throw err;
					},
				},
			);

		} catch (error: unknown) {
			if (abortController.signal.aborted) return;
			const message =
				error instanceof Error ? error.message : "코드 제출에 실패했습니다.";
			if (
				message.includes("비활성화") ||
				message.includes("제출할 수 없습니다")
			) {
				setIsAssignmentActive(false);
				alert(message);
				setTimeout(() => {
					navigate(`/sections/${sectionId}/course-assignments`);
				}, 1000);
				setIsSubmitting(false);
				return;
			}
			setSubmissionResult({
				status: "error",
				message,
				resultInfo: { status: "error", message: "테스트 실패", color: "#dc3545" },
				type: "output",
				outputList: undefined,
			});
		} finally {
			setIsSubmitting(false);
		}
	}, [code, language, sectionId, problemId, isAssignmentActive, navigate, userRole]);

	const handleHorizontalDragEnd = useCallback((sizes: number[]) => {
		setHorizontalSizes(sizes);
	}, []);

	const handleVerticalDragEnd = useCallback((sizes: number[]) => {
		setVerticalSizes(sizes);
	}, []);

	const doNavigateToProblem = useCallback(
		(targetAssignmentId: string, targetProblemId: number) => {
			if (!sectionId) return;
			setIsProblemChanging(true);
			navigate(
				`/sections/${sectionId}/assignments/${targetAssignmentId}/detail/problems/${targetProblemId}`,
			);
			setTimeout(() => setIsProblemChanging(false), 150);
		},
		[sectionId, navigate],
	);

	const requestNavigateToProblem = useCallback(
		(targetAssignmentId: string, targetProblemId: number) => {
			if (!assignmentId || isProblemChanging) return;
			if (
				targetAssignmentId === assignmentId &&
				targetProblemId === Number(problemId)
			)
				return;
			const hasUnsaved =
				code !== lastSavedCodeRef.current && code !== getDefaultCode(language);
			if (hasUnsaved) {
				pendingNavigationRef.current = {
					assignmentId: targetAssignmentId,
					problemId: targetProblemId,
				};
				setShowUnsavedModal(true);
				return;
			}
			doNavigateToProblem(targetAssignmentId, targetProblemId);
		},
		[
			assignmentId,
			problemId,
			isProblemChanging,
			code,
			language,
			doNavigateToProblem,
		],
	);

	const handleProblemChange = useCallback(
		(problemIdToMove: number) => {
			if (!assignmentId) return;
			requestNavigateToProblem(assignmentId, problemIdToMove);
		},
		[assignmentId, requestNavigateToProblem],
	);

	const handleSelectOtherAssignment = useCallback(
		async (targetAssignmentId: number) => {
			if (!sectionId || !assignmentId) return;
			if (Number(targetAssignmentId) === Number(assignmentId)) {
				setIsAssignmentModalOpen(false);
				return;
			}
			try {
				const res = await apiService.getAssignmentProblems(
					sectionId,
					String(targetAssignmentId),
				);
				const raw =
					(res as { problems?: unknown[] })?.problems ??
					(res as { data?: unknown[] })?.data ??
					(Array.isArray(res) ? res : []);
				const arr = Array.isArray(raw) ? raw : [];
				const mapped = arr
					.map((p: Record<string, unknown>, idx: number) => ({
						id: Number(p.id ?? p.problemId),
						order: Number(p.order ?? p.problemOrder ?? idx + 1),
					}))
					.filter((p) => Number.isFinite(p.id))
					.sort((a, b) => a.order - b.order);
				if (mapped.length === 0) {
					alert("이 과제에 등록된 문제가 없습니다.");
					return;
				}
				const firstId = mapped[0].id;
				setIsAssignmentModalOpen(false);
				requestNavigateToProblem(String(targetAssignmentId), firstId);
			} catch {
				alert("과제 문제 목록을 불러오지 못했습니다.");
			}
		},
		[sectionId, assignmentId, requestNavigateToProblem],
	);

	const problemNav = useMemo(() => {
		const cid = problemId ? Number(problemId) : NaN;
		const idx = problems.findIndex((p) => p.id === cid);
		if (idx < 0 || problems.length === 0) {
			return {
				prevProblemId: null as number | null,
				nextProblemId: null as number | null,
				indexLabel: "",
			};
		}
		return {
			prevProblemId: idx > 0 ? problems[idx - 1].id : null,
			nextProblemId:
				idx < problems.length - 1 ? problems[idx + 1].id : null,
			indexLabel: `${idx + 1} / ${problems.length}`,
		};
	}, [problems, problemId]);

	const handleUnsavedModalSave = useCallback(async () => {
		setShowUnsavedModal(false);
		await saveToBackend(false);
		const pending = pendingNavigationRef.current;
		pendingNavigationRef.current = null;
		if (pending != null) {
			doNavigateToProblem(pending.assignmentId, pending.problemId);
		}
	}, [saveToBackend, doNavigateToProblem]);

	const handleUnsavedModalSkip = useCallback(() => {
		setShowUnsavedModal(false);
		const pending = pendingNavigationRef.current;
		pendingNavigationRef.current = null;
		if (pending != null) {
			doNavigateToProblem(pending.assignmentId, pending.problemId);
		}
	}, [doNavigateToProblem]);

	const handleUnsavedModalCancel = useCallback(() => {
		setShowUnsavedModal(false);
		pendingNavigationRef.current = null;
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

	// 서버에 저장되지 않은 변경사항 여부 (beforeunload 경고 및 UI 표시용)
	const hasUnsavedChanges = code !== lastSavedCodeRef.current && code !== getDefaultCode(language);

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
		testcaseResults,
		resetTestcaseResults,
		totalTestcaseCount,
		sessionSaveStatus,
		codeLoadSource,
		sessionCleared,
		isLoading,
		horizontalSizes,
		verticalSizes,
		panelLayout,
		problems,
		isProblemModalOpen,
		isProblemChanging,
		setIsProblemModalOpen,
		handlePanelMove,
		handleProblemChange,
		problemNav,
		sectionAssignments,
		isAssignmentModalOpen,
		setIsAssignmentModalOpen,
		handleSelectOtherAssignment,
		handleSubmit,
		handleSubmitWithOutput,
		saveToSession,
		saveToBackend,
		showSaveModal,
		handleHorizontalDragEnd,
		handleVerticalDragEnd,
		gutterStyleCallback,
		isDeadlinePassed,
		isAssignmentActive,
		userRole,
		hasUnsavedChanges,
		showUnsavedModal,
		handleUnsavedModalSave,
		handleUnsavedModalSkip,
		handleUnsavedModalCancel,
		problemStatusById,
	};
}
