import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authState } from "../../../../../recoil/atoms";
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
	ProblemWorkStatus,
} from "../types";

export function useCodingQuizSolve() {
	const { sectionId, quizId } = useParams<{
		sectionId: string;
		quizId: string;
	}>();
	const [searchParams] = useSearchParams();
	const auth = useRecoilValue(authState);
	const [userRole, setUserRole] = useState<string | null>(null);
	const timeUpHandled = useRef(false);

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
	const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
	const [isProblemChanging, setIsProblemChanging] = useState(false);
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [problemStatusById, setProblemStatusById] = useState<
		Record<number, ProblemWorkStatus>
	>({});
	const [nowMs, setNowMs] = useState(Date.now());

	// 시험 중복 접속 방지용 (모든 역할 공통)
	const [examClientSessionId] = useState<string>(() =>
	{
		const storageKey = "coding-quiz-client-session-id";
		if (typeof window !== "undefined") {
			const existing = window.sessionStorage.getItem(storageKey);
			if (existing) return existing;
		}
		const newSessionId =
			typeof crypto !== "undefined" && crypto.randomUUID
				? crypto.randomUUID()
				: Math.random().toString(36).slice(2);
		if (typeof window !== "undefined") {
			window.sessionStorage.setItem(storageKey, newSessionId);
		}
		return newSessionId;
	},
	);
	const [examSessionConflict, setExamSessionConflict] = useState(false);
	const [examSessionTakenOver, setExamSessionTakenOver] = useState(false);
	const problemChangeRequestIdRef = useRef(0);
	// 마지막으로 서버에 저장된 코드 (hasUnsavedChanges 판단 기준)
	const lastSavedCodeRef = useRef<string>("");
	// IndexedDB 디바운스 저장 타이머
	const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// 저장 안내 모달
	const [showUnsavedModal, setShowUnsavedModal] = useState(false);
	// 모달 확인 후 전환할 문제 ID
	const pendingProblemIdRef = useRef<number | null>(null);

	// 사용자 역할 확인
	useEffect(() => {
		const fetchUserRole = async () => {
			if (!sectionId || !auth.user) return;
			try {
				const response = await apiService.getMyRoleInSection(Number(sectionId));
				let raw: unknown = response;
				if (typeof response === "object" && response !== null) {
					raw =
						(response as { data?: unknown })?.data ??
						(response as { role?: unknown })?.role ??
						response;
					if (typeof raw === "object" && raw !== null && "role" in raw) {
						raw = (raw as { role: unknown }).role;
					}
				}
				const role =
					typeof raw === "string"
						? raw.toUpperCase()
						: String(raw ?? "").toUpperCase();
				setUserRole(role);
			} catch (error) {
				console.error("역할 조회 실패:", error);
				setUserRole(null);
			}
		};
		if (auth.isAuthenticated && sectionId) {
			fetchUserRole();
		}
	}, [auth.isAuthenticated, auth.user, sectionId]);

	const isManager = userRole === "ADMIN" || userRole === "TUTOR" || userRole === "SUPER_ADMIN";
	const isQuizEndedByTime =
		!!quizInfo.endTime && nowMs >= quizInfo.endTime.getTime();
	const isQuizEnded = isTimeUp || quizInfo.status === "ENDED" || isQuizEndedByTime;

	// 학생 제출/테스트 차단: 시간 종료 또는 PAUSED(일시정지) 상태
	const isSubmitBlocked =
		!isManager && (isQuizEnded || quizInfo.status === "PAUSED");
	const isSaveWarning =
		!isManager &&
		!!quizInfo.endTime &&
		quizInfo.status !== "ENDED" &&
		quizInfo.endTime.getTime() - nowMs > 0 &&
		quizInfo.endTime.getTime() - nowMs <= 5 * 60 * 1000;
	const isEditLocked = !isManager && isQuizEnded;

	// 종료 후에도 페이지 진입은 허용하고, 내부 잠금 로직으로만 제어

	useEffect(() => {
		if (!quizInfo.endTime) return;
		const timer = setInterval(() => setNowMs(Date.now()), 1000);
		return () => clearInterval(timer);
	}, [quizInfo.endTime]);

	// 운영 중 종료시간이 변경될 수 있으므로 퀴즈 시간을 주기적으로 동기화
	useEffect(() => {
		if (!sectionId || !quizId) return;
		const interval = setInterval(async () => {
			try {
				const quizInfoRes = await apiService.getQuizInfo(sectionId, quizId);
				const quizData = quizInfoRes?.data ?? quizInfoRes;
				setQuizInfo((prev) => ({
					...prev,
					...quizData,
					startTime: quizData?.startTime ? new Date(quizData.startTime) : null,
					endTime: quizData?.endTime ? new Date(quizData.endTime) : null,
				}));
			} catch {
				// 일시적 네트워크 오류는 무시
			}
		}, 10000);
		return () => clearInterval(interval);
	}, [sectionId, quizId]);

	// 종료 후 시간이 연장되면 잠금 상태를 자동 해제
	useEffect(() => {
		if (!quizInfo.endTime) return;
		if (nowMs < quizInfo.endTime.getTime() && isTimeUp) {
			setIsTimeUp(false);
			timeUpHandled.current = false;
		}
	}, [quizInfo.endTime, nowMs, isTimeUp]);

	useEffect(() => {
		const loadAllInfo = async () => {
			// auth 복원이 끝날 때까지 대기 (새로고침 시 토큰 없이 401 나는 것 방지)
			if (!quizId || !sectionId || auth.loading) return;
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
	}, [quizId, sectionId, searchParams, auth.loading]);

	useEffect(() => {
		const loadProblemStatuses = async () => {
			if (!sectionId || !quizId || problems.length === 0) return;
			try {
				const response = await apiService.getQuizProblemStatuses(sectionId, quizId);
				const list = (response?.data ?? response ?? []) as ProblemWorkStatus[];
				const nextMap: Record<number, ProblemWorkStatus> = {};
				for (const item of list) {
					if (item?.problemId != null) {
						nextMap[item.problemId] = item;
					}
				}
				setProblemStatusById(nextMap);
			} catch (error) {
				console.warn("문제 상태 조회 실패:", error);
			}
		};
		loadProblemStatuses();
	}, [sectionId, quizId, problems]);

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

	// 시험 페이지 진입 시 중복 접속 확인
	useEffect(() => {
		if (!quizId || !sectionId || userRole === null) return;

		const tryEnter = async () => {
			try {
				const res = await apiService.enterQuizSession(
					sectionId,
					quizId,
					examClientSessionId,
				);
				const status =
					(res as { data?: { status?: string }; status?: string })?.data
						?.status ??
					(res as { status?: string })?.status;
				if (status === "CONFLICT") {
					setExamSessionConflict(true);
				}
			} catch (err) {
				console.error("시험 세션 진입 실패:", err);
			}
		};
		tryEnter();

		return () => {
			// 페이지 이탈 시 세션 해제
			apiService
				.exitQuizSession(sectionId, quizId, examClientSessionId)
				.catch(() => {});
		};
	}, [quizId, sectionId, userRole, examClientSessionId]);

	// Heartbeat: 30초마다 세션 유효성 확인 및 TTL 연장
	useEffect(() => {
		if (!quizId || !sectionId || userRole === null || examSessionConflict)
			return;

		const interval = setInterval(async () => {
			try {
				const res = await apiService.heartbeatQuizSession(
					sectionId,
					quizId,
					examClientSessionId,
				);
				const valid =
					(res as { data?: { valid?: boolean }; valid?: boolean })?.data
						?.valid ??
					(res as { valid?: boolean })?.valid;
				if (valid === false) {
					setExamSessionTakenOver(true);
				}
			} catch {
				// 네트워크 오류는 무시 (TTL 내에서 자연 해제)
			}
		}, 30000);

		return () => clearInterval(interval);
	}, [quizId, sectionId, userRole, examSessionConflict, examClientSessionId]);

	useEffect(() => {
		const loadCode = async () => {
			if (!selectedProblemId || !sectionId || !language || !sessionId || auth.loading) return;
			try {
				// IndexedDB와 서버를 동시에 조회
				const [sessionResult, serverResult] = await Promise.allSettled([
					indexedDBManager.getSessionCode(selectedProblemId, sectionId, language),
					apiService.loadProgress(selectedProblemId, sectionId, language),
				]);

				const sessionRecord = sessionResult.status === "fulfilled" ? sessionResult.value : null;
				const serverData = serverResult.status === "fulfilled" ? serverResult.value : null;

				const sessionCode = sessionRecord?.code ?? null;
				const sessionTimestamp = sessionRecord?.timestamp ?? 0;

				const serverSaveKey = `lastServerSave_${selectedProblemId}_${sectionId}_${language}`;
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
						setCode(sessionCode!);
						setCodeLoadSource("session");
						lastSavedCodeRef.current = serverCode!;
					} else {
						setCode(serverCode!);
						setCodeLoadSource("backend");
						lastSavedCodeRef.current = serverCode!;
					}
				} else if (isValidSession) {
					setCode(sessionCode!);
					setCodeLoadSource("session");
					lastSavedCodeRef.current = "";
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
	}, [selectedProblemId, sectionId, language, sessionId, auth.loading]);

	const saveToBackend = useCallback(async (showModal = false) => {
		if (!code || !selectedProblemId || !sectionId) return;
		try {
			setSessionSaveStatus("saving");
			// 서버와 IndexedDB에 동시 저장
			await Promise.all([
				apiService.saveProgress(selectedProblemId, sectionId, language, code),
				indexedDBManager.saveSessionCode(selectedProblemId, sectionId, language, code).catch(() => {}),
			]);
			// 서버 저장 시각을 localStorage에 기록 (timestamp 비교용)
			localStorage.setItem(`lastServerSave_${selectedProblemId}_${sectionId}_${language}`, Date.now().toString());
			lastSavedCodeRef.current = code;
			setSessionSaveStatus("saved");
			setProblemStatusById((prev) => ({
				...prev,
				[selectedProblemId]: {
					problemId: selectedProblemId,
					submitted: prev[selectedProblemId]?.submitted ?? false,
					result: prev[selectedProblemId]?.result ?? null,
					saved: true,
				},
			}));

			if (showModal) {
				setShowSaveModal(true);
				setTimeout(() => setShowSaveModal(false), 2000);
			} else {
				setTimeout(() => setSessionSaveStatus("idle"), 2000);
			}
		} catch (error) {
			console.error("저장 실패:", error);
			setSessionSaveStatus("error");
			setTimeout(() => setSessionSaveStatus("idle"), 2000);
		}
	}, [code, language, selectedProblemId, sectionId]);

	// Ctrl+S 단축키 핸들러
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "s") {
				event.preventDefault();
				saveToBackend(false); // 모달 없이 저장
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [saveToBackend]);

	useEffect(() => {
		if (isTimeUp) return;
		const autoSaveInterval = setInterval(() => {
			saveToBackend(false);
		}, 5 * 60 * 1000);
		return () => clearInterval(autoSaveInterval);
	}, [isTimeUp, saveToBackend]);

	// 코드 변경 시 IndexedDB에 자동 저장 (디바운스 500ms)
	useEffect(() => {
		if (!sessionId || !selectedProblemId || !sectionId || auth.loading) return;
		if (!code || code === getDefaultCode(language)) return;
		if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
		autoSaveTimerRef.current = setTimeout(() => {
			indexedDBManager
				.saveSessionCode(selectedProblemId, sectionId, language, code)
				.catch((err) => console.warn("IndexedDB 자동 저장 실패:", err));
		}, 500);
		return () => {
			if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
		};
	}, [code, sessionId, selectedProblemId, sectionId, language, auth.loading]);

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

	// "여기서 계속하기" - 기존 세션 강제 인계
	const handleExamSessionTakeover = useCallback(async () => {
		if (!quizId || !sectionId) return;
		try {
			await apiService.takeoverQuizSession(sectionId, quizId, examClientSessionId);
			setExamSessionConflict(false);
		} catch (err) {
			console.error("세션 인계 실패:", err);
		}
	}, [quizId, sectionId, examClientSessionId]);

	const handleTimeUp = useCallback(() => {
		// 이미 처리된 경우 중복 실행 방지
		if (timeUpHandled.current) return;
		timeUpHandled.current = true;

		setIsTimeUp(true);
		alert("퀴즈 시간이 종료되었습니다. 현재 페이지는 조회 가능하며 제출/수정은 잠금됩니다.");
	}, []);

	// 문제 전환 실제 실행 (코드 로딩은 loadCode effect에 위임)
	const doSwitchProblem = useCallback(
		async (problemId: number) => {
			if (!sectionId) return;
			const requestId = ++problemChangeRequestIdRef.current;
			try {
				setIsProblemChanging(true);
				// 새 문제로 전환 전 상태 초기화
				lastSavedCodeRef.current = "";
				setCode(getDefaultCode(language));
				setCodeLoadSource(null);
				setSelectedProblemId(problemId); // → loadCode effect 재실행
				const problemInfo = await apiService.getProblemInfo(String(problemId));
				if (requestId !== problemChangeRequestIdRef.current) return;
				const problemData = problemInfo?.data ?? problemInfo;
				setCurrentProblem(problemData);
				if (requestId !== problemChangeRequestIdRef.current) return;
				setSubmissionResult(null);
			} catch (error) {
				console.error("문제 변경 실패:", error);
			} finally {
				if (requestId === problemChangeRequestIdRef.current) {
					setIsProblemChanging(false);
				}
			}
		},
		[sectionId, language],
	);

	const handleProblemChange = useCallback(
		async (problemId: number) => {
			if (problemId === selectedProblemId || !sectionId || isProblemChanging) return;

			// 미저장 변경사항이 있고 편집 잠금 상태가 아닐 때 → 저장 안내 모달
			const hasUnsaved = code !== lastSavedCodeRef.current && code !== getDefaultCode(language);
			if (hasUnsaved && !isSubmitBlocked) {
				pendingProblemIdRef.current = problemId;
				setShowUnsavedModal(true);
				return;
			}

			await doSwitchProblem(problemId);
		},
		[selectedProblemId, sectionId, isProblemChanging, code, language, isSubmitBlocked, doSwitchProblem],
	);

	// 저장 안내 모달 핸들러
	const handleUnsavedModalSave = useCallback(async () => {
		setShowUnsavedModal(false);
		await saveToBackend(false);
		const pending = pendingProblemIdRef.current;
		pendingProblemIdRef.current = null;
		if (pending !== null) await doSwitchProblem(pending);
	}, [saveToBackend, doSwitchProblem]);

	const handleUnsavedModalSkip = useCallback(async () => {
		setShowUnsavedModal(false);
		const pending = pendingProblemIdRef.current;
		pendingProblemIdRef.current = null;
		if (pending !== null) await doSwitchProblem(pending);
	}, [doSwitchProblem]);

	const handleUnsavedModalCancel = useCallback(() => {
		setShowUnsavedModal(false);
		pendingProblemIdRef.current = null;
	}, []);

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
		// 관리자/튜터가 아니고 (시간 종료 또는 일시정지)인 경우 제출 불가
		if (isSubmitBlocked) {
			alert(
				quizInfo.status === "PAUSED"
					? "코딩 테스트가 일시정지 상태입니다. 제출할 수 없습니다."
					: "시간이 종료되어 제출할 수 없습니다.",
			);
			return;
		}
		if (!sectionId || selectedProblemId == null) return;

		setIsSubmitting(true);
		setSubmissionResult(null);
		try {
			const submissionResponse = await apiService.submitQuizCode(
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
					type: "output",
					outputList: res.outputList,
					passedCount: res.passedCount,
					totalCount: res.totalCount,
					points: res.points,
					score: res.score,
				});
				setProblemStatusById((prev) => ({
					...prev,
					[selectedProblemId]: {
						problemId: selectedProblemId,
						submitted: true,
						result,
						saved: prev[selectedProblemId]?.saved ?? false,
					},
				}));
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
	}, [code, language, sectionId, selectedProblemId, isSubmitBlocked, quizInfo.status]);

	const handleSubmitWithOutput = useCallback(async () => {
		if (!code.trim()) {
			alert("코드를 작성해주세요.");
			return;
		}
		// 관리자/튜터가 아니고 (시간 종료 또는 일시정지)인 경우 테스트 불가
		if (isSubmitBlocked) {
			alert(
				quizInfo.status === "PAUSED"
					? "코딩 테스트가 일시정지 상태입니다. 테스트할 수 없습니다."
					: "시간이 종료되어 테스트할 수 없습니다.",
			);
			return;
		}
		if (!sectionId || selectedProblemId == null) return;

		setIsSubmitting(true);
		setSubmissionResult(null);
		try {
			// 퀴즈 페이지에서는 테스트하기도 퀴즈 전용 API를 사용해야
			// 과제/퀴즈 혼합 검증 충돌을 피할 수 있다.
			const submissionResponse = await apiService.submitQuizCode(
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
				passedCount: res.passedCount,
				totalCount: res.totalCount,
				points: res.points,
				score: res.score,
			});
			// 제출 후 세션 유지 (백엔드에서 불러올 수 있도록)
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
		isSubmitBlocked,
		quizInfo.status,
	]);

	const handleLanguageChange = useCallback((newLang: string) => {
		if (newLang !== "c") return;
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

	const hasUnsavedChanges = code !== lastSavedCodeRef.current && code !== getDefaultCode(language);

	return {
		sectionId,
		sectionInfo,
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
		isSubmitBlocked,
		isSaveWarning,
		isEditLocked,
		sessionSaveStatus,
		codeLoadSource,
		sessionCleared,
		isLoading,
		horizontalSizes,
		verticalSizes,
		panelLayout,
		isProblemModalOpen,
		isProblemChanging,
		setIsProblemModalOpen,
		showSaveModal,
		problemStatusById,
		examSessionConflict,
		examSessionTakenOver,
		handleExamSessionTakeover,
		handleTimeUp,
		handleProblemChange,
		handlePanelMove,
		handleSubmit,
		handleSubmitWithOutput,
		saveToBackend,
		handleLanguageChange,
		handleHorizontalDragEnd,
		handleVerticalDragEnd,
		gutterStyleCallback,
		hasUnsavedChanges,
		showUnsavedModal,
		handleUnsavedModalSave,
		handleUnsavedModalSkip,
		handleUnsavedModalCancel,
	};
}

export type UseCodingQuizSolveReturn = ReturnType<typeof useCodingQuizSolve>;
