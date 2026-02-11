import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
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
} from "../types";

export function useCodingQuizSolve() {
	const { sectionId, quizId } = useParams<{
		sectionId: string;
		quizId: string;
	}>();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
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
	const [showSaveModal, setShowSaveModal] = useState(false);

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

	// 퀴즈 종료 여부 확인 및 학생 리다이렉션
	useEffect(() => {
		if (!quizInfo.endTime || !sectionId || userRole === null) return;
		
		const now = new Date();
		const endTime = new Date(quizInfo.endTime);
		
		// 학생이고 시간이 종료된 경우 리다이렉션
		if (now > endTime && !isManager) {
			navigate(`/sections/${sectionId}/coding-quiz`);
		}
	}, [quizInfo.endTime, sectionId, userRole, isManager, navigate]);

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
	}, [quizId, sectionId, searchParams, isManager, navigate]);

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
				// 1순위: 세션에서 불러오기
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
				
				// 2순위: 백엔드에서 제출 기록 불러오기
				const response = await apiService.loadProgress(
					selectedProblemId,
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
				
				// 3순위: 기본 코드
				setCode(getDefaultCode(language));
				setCodeLoadSource("default");
			} catch {
				setCode(getDefaultCode(language));
				setCodeLoadSource("default");
			}
		};
		loadCode();
	}, [selectedProblemId, sectionId, language, sessionId, loadFromSession]);

	const saveToSession = useCallback(async (showModal = false) => {
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
			
			if (showModal) {
				// 저장하기 버튼: 모달 표시
				setShowSaveModal(true);
				setTimeout(() => setShowSaveModal(false), 2000);
			} else {
				// Ctrl+S: 상태 메시지만
				setTimeout(() => setSessionSaveStatus("idle"), 2000);
			}
		} catch (error) {
			console.error("세션 저장 실패:", error);
			setSessionSaveStatus("error");
			setTimeout(() => setSessionSaveStatus("idle"), 2000);
		}
	}, [sessionId, code, language, selectedProblemId, sectionId]);

	// Ctrl+S 단축키 핸들러
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "s") {
				event.preventDefault();
				saveToSession(false); // 모달 없이 저장
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [saveToSession]);

	useEffect(() => {
		if (!sessionId || isTimeUp) return;
		const autoSaveInterval = setInterval(() => {
			saveToSession(false); // 자동 저장도 모달 없이
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
		// 이미 처리된 경우 중복 실행 방지
		if (timeUpHandled.current) return;
		timeUpHandled.current = true;

		setIsTimeUp(true);
		
		// 학생인 경우 리다이렉션
		if (!isManager && sectionId) {
			alert("퀴즈 시간이 종료되었습니다.");
			navigate(`/sections/${sectionId}/coding-quiz`);
		} else {
			// 관리자/튜터는 알림만 표시
			alert("퀴즈 시간이 종료되었습니다.");
		}
	}, [isManager, sectionId, navigate]);

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
		// 관리자/튜터가 아니고 시간이 종료된 경우 제출 불가
		if (!isManager && isTimeUp) {
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
		// 관리자/튜터가 아니고 시간이 종료된 경우 테스트 불가
		if (!isManager && isTimeUp) {
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
		isTimeUp,
		isManager,
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
		sessionSaveStatus,
		codeLoadSource,
		sessionCleared,
		isLoading,
		horizontalSizes,
		verticalSizes,
		panelLayout,
		isProblemModalOpen,
		setIsProblemModalOpen,
		showSaveModal,
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
