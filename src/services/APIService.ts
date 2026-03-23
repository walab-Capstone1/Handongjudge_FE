import tokenManager from "../utils/tokenManager";

class APIService {
	private baseURL: string;

	constructor() {
		this.baseURL = process.env.REACT_APP_API_URL || "https://hcl.walab.info/api"; // 
	}

	async request(endpoint: string, options: RequestInit = {}): Promise<any> {
		const url = `${this.baseURL}${endpoint}`;

		const config: RequestInit = {
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		};

		const accessToken = tokenManager.getAccessToken();
		if (accessToken) {
			(config.headers as Record<string, string>).Authorization =
				`Bearer ${accessToken}`;
		}

		try {
			const response = await fetch(url, config);

			if (response.status === 401) {
				console.log("토큰 만료, 갱신 시도 중...");
				try {
					await tokenManager.refreshToken();
					const newAccessToken = tokenManager.getAccessToken();
					if (newAccessToken) {
						(config.headers as Record<string, string>).Authorization =
							`Bearer ${newAccessToken}`;
						const retryResponse = await fetch(url, config);
						return this.handleResponse(retryResponse);
					}
				} catch (refreshError) {
					console.error("토큰 갱신 실패:", refreshError);
					tokenManager.clearTokens();
					throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
				}
			}

			return this.handleResponse(response);
		} catch (error) {
			console.error("API 요청 오류:", error);
			throw error;
		}
	}

	async handleResponse(response: Response): Promise<any> {
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message || `HTTP ${response.status}: ${response.statusText}`,
			);
		}

		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			return response.json();
		} else {
			const text = await response.text();
			if (/^\d+$/.test(text.trim())) {
				return Number.parseInt(text.trim(), 10);
			}
			return text;
		}
	}

	async register(registerData: any): Promise<any> {
		try {
			const response = await this.request("/auth/register", {
				method: "POST",
				body: JSON.stringify(registerData),
			});
			return response;
		} catch (error) {
			console.error("회원가입 오류:", error);
			throw error;
		}
	}

	async loginWithKakao(code: string): Promise<any> {
		return this.request("/auth/kakao/callback", {
			method: "POST",
			body: JSON.stringify({ code }),
		});
	}

	async login(email: string, password: string): Promise<any> {
		const response = await this.request("/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		});

		if (response.accessToken) {
			tokenManager.setAccessToken(response.accessToken);
		}

		return response;
	}

	async logout(): Promise<void> {
		try {
			await this.request("/auth/logout", {
				method: "POST",
			});
		} catch (error) {
			console.error("로그아웃 오류:", error);
		} finally {
			tokenManager.clearTokens();
		}
	}

	async getUserInfo(): Promise<any> {
		const response = await this.request("/user/me");
		const userData = response.data || response;
		return userData;
	}

	async requestPasswordReset(email: string): Promise<any> {
		return await this.request("/auth/forgot-password", {
			method: "POST",
			body: JSON.stringify({ email }),
		});
	}

	async resetPassword(token: string, newPassword: string): Promise<any> {
		return await this.request("/auth/reset-password", {
			method: "POST",
			body: JSON.stringify({ token, newPassword }),
		});
	}

	async getUserEnrolledSections(): Promise<any> {
		return await this.request("/user/dashboard");
	}

	async getAssignments(sectionId: number | string): Promise<any> {
		return await this.request(`/sections/${sectionId}/assignments`, {
			method: "GET",
		});
	}

	async getAssignmentProblems(
		sectionId: number | string,
		assignmentId: number | string,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/assignments/${assignmentId}/problems`,
			{
				method: "GET",
			},
		);
	}

	async getAssignmentInfo(assignmentId: number | string): Promise<any> {
		return await this.request(`/assignments/${assignmentId}`, {
			method: "GET",
		});
	}

	async submitCode(
		sectionId: number | string,
		problemId: number | string,
		code: string,
		language: string,
	): Promise<any> {
		return await this.request("/submissions/submitAndGetResult", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				problemId: Number.parseInt(String(problemId)),
				sectionId: Number.parseInt(String(sectionId)),
				language,
				codeString: code,
			}),
		});
	}

	async submitCodeAndGetOutput(
		sectionId: number | string,
		problemId: number | string,
		code: string,
		language: string,
	): Promise<any> {
		return await this.request("/submissions/submitAndGetResult/output", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				problemId: Number.parseInt(String(problemId)),
				sectionId: Number.parseInt(String(sectionId)),
				language,
				codeString: code,
			}),
		});
	}

	/**
	 * 퀴즈 전용 제출 - 테스트케이스별 scoring 적용
	 */
	async submitQuizCode(
		sectionId: number | string,
		problemId: number | string,
		code: string,
		language: string,
	): Promise<any> {
		return await this.request("/quiz/submitAndGetResult", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				problemId: Number.parseInt(String(problemId)),
				sectionId: Number.parseInt(String(sectionId)),
				language,
				codeString: code,
			}),
		});
	}

	async saveProgress(
		problemId: number | string,
		sectionId: number | string,
		language: string,
		code: string,
	): Promise<any> {
		return await this.request("/progress/save", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				problemId: Number.parseInt(String(problemId)),
				sectionId: Number.parseInt(String(sectionId)),
				language,
				codeString: code,
				savedAt: new Date().toISOString(),
			}),
		});
	}

	async loadProgress(
		problemId: number | string,
		sectionId: number | string,
		language: string,
	): Promise<any> {
		// 먼저 저장된 진행 상황 확인
		try {
			const progressResult = await this.request(
				`/progress/load?problemId=${problemId}&sectionId=${sectionId}&language=${language}`,
				{
					method: "GET",
				},
			);
			if (progressResult?.codeString || progressResult?.data?.codeString) {
				return progressResult;
			}
		} catch (err) {
			console.warn("진행 상황 불러오기 실패, 제출 기록 시도:", err);
		}
		
		// 진행 상황이 없으면 제출 기록 확인
		return await this.request(
			`/submissions/lastSubmitCode?problemId=${problemId}&sectionId=${sectionId}&language=${language}`,
			{
				method: "GET",
			},
		);
	}

	async getProblemInfo(problemId: number | string): Promise<any> {
		return await this.request(`/problems/${problemId}`);
	}

	async getAllProblems(): Promise<any> {
		return await this.request("/problems");
	}

	/**
	 * 단일 문제 생성 (JSON body, 백엔드 ProblemCreateRequest DTO)
	 */
	async createProblem(request: {
		title: string;
		description: string;
		inputFormat?: string;
		outputFormat?: string;
		tags?: string;
		difficulty?: string;
		timeLimit?: string;
		memoryLimit?: string;
		sampleInputs?: string;
		testcases: { name: string; input: string; output: string; type?: string }[];
	}): Promise<number> {
		const url = `${this.baseURL}/problems`;
		const accessToken = tokenManager.getAccessToken();

		const config: RequestInit = {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(request),
		};

		if (accessToken) {
			(config.headers as Record<string, string>).Authorization =
				`Bearer ${accessToken}`;
		}

		try {
			const response = await fetch(url, config);

			if (response.status === 401) {
				await tokenManager.refreshToken();
				const newAccessToken = tokenManager.getAccessToken();
				if (newAccessToken) {
					(config.headers as Record<string, string>).Authorization =
						`Bearer ${newAccessToken}`;
					const retryResponse = await fetch(url, {
						...config,
						headers: {
							...config.headers,
							Authorization: `Bearer ${newAccessToken}`,
						},
					});
					return this.handleResponse(retryResponse);
				}
				tokenManager.clearTokens();
				throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
			}

			return this.handleResponse(response);
		} catch (error) {
			console.error("문제 생성 API 요청 오류:", error);
			throw error;
		}
	}

	async addProblemToAssignment(
		assignmentId: number | string,
		problemId: number | string,
	): Promise<any> {
		console.log("🔗 과제에 문제 추가 API 호출:", {
			assignmentId,
			problemId,
			url: `/assignments/${assignmentId}/${problemId}`,
			assignmentIdType: typeof assignmentId,
			problemIdType: typeof problemId,
		});

		return await this.request(`/assignments/${assignmentId}/${problemId}`, {
			method: "POST",
		});
	}

	async parseFolderFormatFiles(formData: FormData): Promise<any> {
		const url = `${this.baseURL}/problems/parse-folder`;
		const accessToken = tokenManager.getAccessToken();

		const config: RequestInit = {
			method: "POST",
			credentials: "include",
			headers: {},
			body: formData,
		};

		if (accessToken) {
			(config.headers as Record<string, string>).Authorization =
				`Bearer ${accessToken}`;
		}

		try {
			const response = await fetch(url, config);

			if (response.status === 401) {
				await tokenManager.refreshToken();
				const newAccessToken = tokenManager.getAccessToken();
				if (newAccessToken) {
					(config.headers as Record<string, string>).Authorization =
						`Bearer ${newAccessToken}`;
					const retryResponse = await fetch(url, config);
					return this.handleResponse(retryResponse);
				}
			}

			return this.handleResponse(response);
		} catch (error) {
			console.error("폴더 형식 파싱 오류:", error);
			throw error;
		}
	}

	async parseFolderFormatZip(formData: FormData): Promise<any> {
		const url = `${this.baseURL}/problems/parse-folder-zip`;
		const accessToken = tokenManager.getAccessToken();

		const config: RequestInit = {
			method: "POST",
			credentials: "include",
			headers: {},
			body: formData,
		};

		if (accessToken) {
			(config.headers as Record<string, string>).Authorization =
				`Bearer ${accessToken}`;
		}

		try {
			const response = await fetch(url, config);

			if (response.status === 401) {
				await tokenManager.refreshToken();
				const newAccessToken = tokenManager.getAccessToken();
				if (newAccessToken) {
					(config.headers as Record<string, string>).Authorization =
						`Bearer ${newAccessToken}`;
					const retryResponse = await fetch(url, config);
					return this.handleResponse(retryResponse);
				}
			}

			return this.handleResponse(response);
		} catch (error) {
			console.error("폴더 형식 ZIP 파싱 오류:", error);
			throw error;
		}
	}

	async parseZipFile(formData: FormData): Promise<any> {
		const url = `${this.baseURL}/problems/parse-zip`;
		const accessToken = tokenManager.getAccessToken();

		const config: RequestInit = {
			method: "POST",
			credentials: "include",
			headers: {},
			body: formData,
		};

		if (accessToken) {
			(config.headers as Record<string, string>).Authorization =
				`Bearer ${accessToken}`;
		}

		try {
			const response = await fetch(url, config);

			if (response.status === 401) {
				await tokenManager.refreshToken();
				const newAccessToken = tokenManager.getAccessToken();
				if (newAccessToken) {
					(config.headers as Record<string, string>).Authorization =
						`Bearer ${newAccessToken}`;
					const retryResponse = await fetch(url, config);
					return this.handleResponse(retryResponse);
				}
			}

			return this.handleResponse(response);
		} catch (error) {
			console.error("ZIP 파일 파싱 오류:", error);
			throw error;
		}
	}

	async parseProblemZip(problemId: number | string): Promise<any> {
		return await this.request(`/problems/${problemId}/parse`, {
			method: "GET",
		});
	}

	async updateProblem(
		problemId: number | string,
		formData: FormData,
	): Promise<any> {
		const url = `${this.baseURL}/problems/${problemId}`;
		const accessToken = tokenManager.getAccessToken();

		const config: RequestInit = {
			method: "PUT",
			credentials: "include",
			headers: {},
			body: formData,
		};

		if (accessToken) {
			(config.headers as Record<string, string>).Authorization =
				`Bearer ${accessToken}`;
		}

		try {
			const response = await fetch(url, config);

			if (response.status === 401) {
				await tokenManager.refreshToken();
				const newAccessToken = tokenManager.getAccessToken();
				if (newAccessToken) {
					(config.headers as Record<string, string>).Authorization =
						`Bearer ${newAccessToken}`;
					const retryResponse = await fetch(url, config);
					return this.handleResponse(retryResponse);
				}
			}

			return this.handleResponse(response);
		} catch (error) {
			console.error("문제 수정 오류:", error);
			throw error;
		}
	}

	async removeProblemFromAssignment(
		assignmentId: number | string,
		problemId: number | string,
	): Promise<any> {
		return await this.request(`/assignments/${assignmentId}/${problemId}`, {
			method: "DELETE",
		});
	}

	async deleteProblem(problemId: number | string): Promise<any> {
		return await this.request(`/problems/${problemId}`, {
			method: "DELETE",
		});
	}

	async getProblemAssignments(problemId: number | string): Promise<any> {
		return await this.request(`/problems/${problemId}/assignments`);
	}

	async getProblemUsage(problemId: number | string): Promise<any> {
		return await this.request(`/problems/${problemId}/usage`);
	}

	async copyProblem(
		problemId: number | string,
		newTitle: string | null = null,
	): Promise<any> {
		const body = newTitle ? { newTitle } : {};
		return await this.request(`/problems/${problemId}/copy`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});
	}

	/**
	 * 단일 문제 Export (HandongJudge 포맷 ZIP 다운로드)
	 */
	async exportProblem(problemId: number | string): Promise<Blob> {
		const url = `${this.baseURL}/problems/${problemId}/export`;
		const accessToken = tokenManager.getAccessToken();
		const config: RequestInit = {
			method: "GET",
			credentials: "include",
			headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
		};
		const response = await fetch(url, config);
		if (!response.ok) throw new Error(`Export 실패: ${response.status}`);
		return response.blob();
	}

	/**
	 * 여러 문제 Bulk Export (HandongJudge 포맷 ZIP 하나로 다운로드)
	 */
	async exportProblemsBulk(problemIds: number[]): Promise<Blob> {
		if (!problemIds.length) throw new Error("내보낼 문제를 선택하세요.");
		const query = problemIds.map((id) => `ids=${id}`).join("&");
		const url = `${this.baseURL}/problems/export?${query}`;
		const accessToken = tokenManager.getAccessToken();
		const config: RequestInit = {
			method: "GET",
			credentials: "include",
			headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
		};
		const response = await fetch(url, config);
		if (!response.ok) throw new Error(`Bulk Export 실패: ${response.status}`);
		return response.blob();
	}

	/**
	 * Bulk Parse (HandongJudge 포맷 ZIP 파싱)
	 */
	async parseBulkZip(formData: FormData): Promise<any> {
		const url = `${this.baseURL}/problems/bulk/parse`;
		let accessToken = tokenManager.getAccessToken();
		const doFetch = () => {
			const config: RequestInit = {
				method: "POST",
				credentials: "include",
				headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
				body: formData,
			};
			return fetch(url, config);
		};
		let response = await doFetch();
		if (response.status === 401) {
			await tokenManager.refreshToken();
			accessToken = tokenManager.getAccessToken();
			if (accessToken) response = await doFetch();
		}
		if (!response.ok) {
			const err = await response.json().catch(() => ({}));
			throw new Error(err.message || `Bulk Parse 실패: ${response.status}`);
		}
		return response.json();
	}

	/**
	 * Bulk Create (승인된 문제 목록 생성)
	 */
	async bulkCreateProblems(problems: any[]): Promise<any> {
		return await this.request("/problems/bulk", {
			method: "POST",
			body: JSON.stringify({ problems }),
		});
	}

	async copySection(
		sectionId: number | string,
		sectionNumber: string,
		year: number,
		semester: string,
		courseTitle: string,
		description: string,
		copyNotices: boolean,
		copyAssignments: boolean,
		selectedNoticeIds: number[],
		selectedAssignmentIds: number[],
		assignmentProblems: any,
		noticeEdits: any,
		assignmentEdits: any,
		problemEdits: any,
	): Promise<any> {
		return await this.request(`/sections/${sectionId}/copy`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				sectionNumber,
				year,
				semester,
				courseTitle,
				description: description || "",
				copyNotices: copyNotices !== false,
				copyAssignments: copyAssignments !== false,
				selectedNoticeIds: selectedNoticeIds || [],
				selectedAssignmentIds: selectedAssignmentIds || [],
				assignmentProblems: assignmentProblems || {},
				noticeEdits: noticeEdits || {},
				assignmentEdits: assignmentEdits || {},
				problemEdits: problemEdits || {},
			}),
		});
	}

	async getAdminStats(): Promise<any> {
		return await this.request("/admin/dashboard/stats");
	}

	async getSuperAdminStats(): Promise<any> {
		return await this.request("/admin/system-admin/stats");
	}

	async getAllSectionsForSuperAdmin(): Promise<any> {
		return await this.request("/admin/system-admin/sections");
	}

	async getAllUsersForSuperAdmin(): Promise<any> {
		return await this.request("/admin/system-admin/users");
	}

	async getAllSubmissionsForSuperAdmin(page = 0, size = 50): Promise<any> {
		return await this.request(
			`/admin/system-admin/submissions?page=${page}&size=${size}`,
		);
	}

	async getRecentActivity(): Promise<any> {
		return await this.request("/admin/dashboard/activity");
	}

	async getInstructorDashboard(): Promise<any> {
		return await this.request("/user/dashboard?instructorOnly=true");
	}

	async getInstructorStudents(): Promise<any> {
		return await this.request("/user/instructor/students");
	}

	async getStudentAssignmentsProgress(
		userId: number | string,
		sectionId: number | string,
	): Promise<any> {
		return await this.request(
			`/user/students/${userId}/sections/${sectionId}/assignments-progress`,
		);
	}

	async getStudentAssignmentProblemsStatus(
		userId: number | string,
		sectionId: number | string,
		assignmentId: number | string,
	): Promise<any> {
		return await this.request(
			`/user/students/${userId}/sections/${sectionId}/assignments/${assignmentId}/problems-status`,
		);
	}

	async getStudentQuizProblemsStatus(
		userId: number | string,
		sectionId: number | string,
		quizId: number | string,
	): Promise<any> {
		return await this.request(
			`/user/students/${userId}/sections/${sectionId}/quizzes/${quizId}/problems-status`,
		);
	}

	async getSectionStudents(sectionId: number | string): Promise<any> {
		return await this.request(`/user/sections/${sectionId}/students`);
	}

	async getAssignmentsBySection(sectionId: number | string): Promise<any> {
		return await this.request(`/sections/${sectionId}/assignments`);
	}

	async getManagingSections(): Promise<any> {
		return await this.request("/user/sections/managing");
	}

	async getEnrolledSections(): Promise<any> {
		return await this.request("/user/sections/enrolled");
	}

	async getMyRoleInSection(sectionId: number | string): Promise<any> {
		return await this.request(`/sections/${sectionId}/my-role`);
	}

	async getAllSectionRoles(): Promise<any> {
		return await this.request("/user/sections/roles");
	}

	async addTutorToSection(
		sectionId: number | string,
		userId: number | string,
	): Promise<any> {
		return await this.request(`/sections/${sectionId}/tutors`, {
			method: "POST",
			body: JSON.stringify({ userId }),
		});
	}

	async removeTutorFromSection(
		sectionId: number | string,
		userId: number | string,
	): Promise<any> {
		return await this.request(`/sections/${sectionId}/tutors/${userId}`, {
			method: "DELETE",
		});
	}

	async getSectionAdmins(sectionId: number | string): Promise<any> {
		return await this.request(`/sections/${sectionId}/admins`);
	}

	async getQuizzesBySection(sectionId: number | string): Promise<any> {
		return await this.request(`/sections/${sectionId}/quizzes`);
	}

	async getQuizInfo(
		sectionId: number | string,
		quizId: number | string,
	): Promise<any> {
		return await this.request(`/sections/${sectionId}/quizzes/${quizId}`);
	}

	async getQuizProblems(
		sectionId: number | string,
		quizId: number | string,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/quizzes/${quizId}/problems`,
		);
	}

	async getQuizStudentProgress(
		sectionId: number | string,
		quizId: number | string,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/quizzes/${quizId}/student-progress`,
		);
	}

	async getQuizSubmissionStats(
		sectionId: number | string,
		quizId: number | string,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/quizzes/${quizId}/submission-stats`,
		);
	}

	async removeQuizProblem(
		sectionId: number | string,
		quizId: number | string,
		problemId: number | string,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/quizzes/${quizId}/problems/${problemId}`,
			{ method: "DELETE" },
		);
	}

	async getQuizGrades(
		sectionId: number | string,
		quizId: number | string,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/quizzes/${quizId}/grades`,
		);
	}

	async saveQuizGrade(
		sectionId: number | string,
		quizId: number | string,
		gradeData: {
			userId: number;
			problemId: number;
			score: number | null;
			comment?: string | null;
		},
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/quizzes/${quizId}/grades`,
			{
				method: "POST",
				body: JSON.stringify(gradeData),
			},
		);
	}

	async saveBulkQuizGrades(
		sectionId: number | string,
		quizId: number | string,
		bulkGradeData: {
			grades: { userId: number; problemId: number; score: number }[];
		},
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/quizzes/${quizId}/grades/bulk`,
			{
				method: "POST",
				body: JSON.stringify(bulkGradeData),
			},
		);
	}

	async setQuizProblemPoints(
		sectionId: number | string,
		quizId: number | string,
		problemId: number | string,
		points: number,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/quizzes/${quizId}/grades/problems/${problemId}/points`,
			{
				method: "PUT",
				body: JSON.stringify({ points }),
			},
		);
	}

	async setBulkQuizProblemPoints(
		sectionId: number | string,
		quizId: number | string,
		problemPoints: Record<number, number>,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/quizzes/${quizId}/grades/points/bulk`,
			{
				method: "PUT",
				body: JSON.stringify(problemPoints),
			},
		);
	}

	async createQuiz(sectionId: number | string, quizData: any): Promise<any> {
		return await this.request(`/sections/${sectionId}/quizzes`, {
			method: "POST",
			body: JSON.stringify(quizData),
		});
	}

	async updateQuiz(
		sectionId: number | string,
		quizId: number | string,
		quizData: any,
	): Promise<any> {
		return await this.request(`/sections/${sectionId}/quizzes/${quizId}`, {
			method: "PUT",
			body: JSON.stringify(quizData),
		});
	}

	async deleteQuiz(
		sectionId: number | string,
		quizId: number | string,
	): Promise<any> {
		return await this.request(`/sections/${sectionId}/quizzes/${quizId}`, {
			method: "DELETE",
		});
	}

	async getAssignmentSubmissionStats(
		assignmentId: number | string,
		sectionId: number | string,
	): Promise<any> {
		try {
			console.log(
				`API 호출: /sections/${sectionId}/assignments/${assignmentId}/submission-stats`,
			);
			const response = await this.request(
				`/sections/${sectionId}/assignments/${assignmentId}/submission-stats`,
			);
			console.log(`API 응답:`, response);
			return response;
		} catch (error) {
			console.error("과제 제출 통계 조회 실패:", error);
			return null;
		}
	}

	async getUpcomingAssignments(
		sectionId: number | string,
		days = 3,
	): Promise<any> {
		try {
			const response = await this.request(
				`/sections/${sectionId}/assignments/upcoming?days=${days}`,
			);
			return response?.data || response || [];
		} catch (error) {
			console.error("마감 직전 과제 조회 실패:", error);
			return [];
		}
	}

	async getAssignmentStudentProgress(
		assignmentId: number | string,
		sectionId: number | string,
	): Promise<any> {
		try {
			console.log(
				`API 호출: /sections/${sectionId}/assignments/${assignmentId}/student-progress`,
			);
			const response = await this.request(
				`/sections/${sectionId}/assignments/${assignmentId}/student-progress`,
			);
			console.log(`API 응답:`, response);
			return response;
		} catch (error) {
			console.error("학생 진행 현황 조회 실패:", error);
			return [];
		}
	}

	async getStudentAcceptedCode(
		sectionId: number | string,
		assignmentId: number | string,
		userId: number | string,
		problemId: number | string,
	): Promise<any> {
		try {
			const response = await this.request(
				`/sections/${sectionId}/assignments/${assignmentId}/students/${userId}/problems/${problemId}/accepted-code`,
			);
			return response;
		} catch (error) {
			console.error("학생 코드 조회 실패:", error);
			throw error;
		}
	}

	async getStudentQuizAcceptedCode(
		sectionId: number | string,
		quizId: number | string,
		userId: number | string,
		problemId: number | string,
	): Promise<any> {
		try {
			const response = await this.request(
				`/sections/${sectionId}/quizzes/${quizId}/students/${userId}/problems/${problemId}/accepted-code`,
			);
			return response;
		} catch (error) {
			console.error("퀴즈 제출 코드 조회 실패:", error);
			throw error;
		}
	}

	async createNotice(noticeData: any): Promise<any> {
		return await this.request("/notices", {
			method: "POST",
			body: JSON.stringify(noticeData),
		});
	}

	async getInstructorNotices(): Promise<any> {
		return await this.request("/notices/instructor/my");
	}

	async getSectionNotices(sectionId: number | string): Promise<any> {
		return await this.request(`/notices?sectionId=${sectionId}`);
	}

	async updateNotice(noticeId: number | string, noticeData: any): Promise<any> {
		return await this.request(`/notices/${noticeId}`, {
			method: "PUT",
			body: JSON.stringify(noticeData),
		});
	}

	async deleteNotice(noticeId: number | string): Promise<any> {
		return await this.request(`/notices/${noticeId}`, {
			method: "DELETE",
		});
	}

	async markNoticeAsRead(noticeId: number | string): Promise<any> {
		return await this.request(`/user/read/notice/${noticeId}`, {
			method: "POST",
		});
	}

	async markAssignmentAsRead(assignmentId: number | string): Promise<any> {
		return await this.request(`/user/read/assignment/${assignmentId}`, {
			method: "POST",
		});
	}

	async getSectionInfo(sectionId: number | string): Promise<any> {
		return await this.request(`/sections/${sectionId}`);
	}

	async getAssignmentInfoBySection(
		sectionId: number | string,
		assignmentId: number | string,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/assignments/${assignmentId}`,
		);
	}

	async getAllCourses(): Promise<any> {
		return await this.request("/admin/courses");
	}

	async createCourse(courseData: any): Promise<any> {
		return await this.request("/courses", {
			method: "POST",
			body: JSON.stringify(courseData),
		});
	}

	async createCourseAsSuperAdmin(data: any): Promise<any> {
		return await this.request("/courses", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateCourse(courseId: number | string, courseData: any): Promise<any> {
		return await this.request(`/admin/courses/${courseId}`, {
			method: "PUT",
			body: JSON.stringify(courseData),
		});
	}

	async deleteCourse(courseId: number | string): Promise<any> {
		return await this.request(`/admin/courses/${courseId}`, {
			method: "DELETE",
		});
	}

	async getCourseSections(courseId: number | string): Promise<any> {
		return await this.request(`/admin/courses/${courseId}/sections`);
	}

	async getAllAssignments(): Promise<any> {
		return await this.request("/admin/assignments");
	}

	async createAssignment(
		sectionId: number | string,
		assignmentData: any,
	): Promise<any> {
		return await this.request(`/sections/${sectionId}/assignments`, {
			method: "POST",
			body: JSON.stringify(assignmentData),
		});
	}

	async updateAssignment(
		sectionId: number | string,
		assignmentId: number | string,
		assignmentData: any,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/assignments/${assignmentId}`,
			{
				method: "PUT",
				body: JSON.stringify(assignmentData),
			},
		);
	}

	async deleteAssignment(
		sectionId: number | string,
		assignmentId: number | string,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/assignments/${assignmentId}`,
			{
				method: "DELETE",
			},
		);
	}

	async getAssignmentSubmissions(assignmentId: number | string): Promise<any> {
		return await this.request(`/admin/assignments/${assignmentId}/submissions`);
	}

	async getAllUsers(): Promise<any> {
		return await this.request("/admin/users");
	}

	async createUser(userData: any): Promise<any> {
		return await this.request("/admin/users", {
			method: "POST",
			body: JSON.stringify(userData),
		});
	}

	async updateUser(userId: number | string, userData: any): Promise<any> {
		return await this.request(`/admin/users/${userId}`, {
			method: "PUT",
			body: JSON.stringify(userData),
		});
	}

	async getUserSubmissionStatus(
		sectionId: number | string,
		assignmentId: number | string,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/assignments/${assignmentId}/user-submission-status`,
		);
	}

	async deleteUser(userId: number | string): Promise<any> {
		return await this.request(`/admin/users/${userId}`, {
			method: "DELETE",
		});
	}

	async toggleUserStatus(
		userId: number | string,
		status: string,
	): Promise<any> {
		return await this.request(`/admin/system-admin/users/${userId}/status`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ status }),
		});
	}

	async getUserEnrollments(userId: number | string): Promise<any> {
		return await this.request(`/admin/users/${userId}/enrollments`);
	}

	async enrollUserToCourse(
		userId: number | string,
		courseId: number | string,
	): Promise<any> {
		return await this.request(`/admin/users/${userId}/enroll`, {
			method: "POST",
			body: JSON.stringify({ courseId }),
		});
	}

	async unenrollUserFromCourse(
		userId: number | string,
		courseId: number | string,
	): Promise<any> {
		return await this.request(`/admin/users/${userId}/unenroll`, {
			method: "POST",
			body: JSON.stringify({ courseId }),
		});
	}

	async getUserProfile(): Promise<any> {
		return await this.request("/mypage/profile");
	}

	async getUserStats(): Promise<any> {
		return await this.request("/mypage/stats");
	}

	async getRecentSubmissions(limit = 10): Promise<any> {
		return await this.request(`/mypage/recent-submissions?limit=${limit}`);
	}

	async getGitHubStatus(): Promise<any> {
		return await this.request("/mypage/github-status");
	}

	async setGitHubRepository(repositoryData: any): Promise<any> {
		return await this.request("/mypage/github/repository", {
			method: "POST",
			body: JSON.stringify(repositoryData),
		});
	}

	async toggleAutoCommit(enabled: boolean): Promise<any> {
		return await this.request("/mypage/github/auto-commit", {
			method: "POST",
			body: JSON.stringify({ enabled }),
		});
	}

	async getCommitHistory(limit = 10): Promise<any> {
		return await this.request(`/mypage/github/commits?limit=${limit}`);
	}

	async getDetailedStats(): Promise<any> {
		return await this.request("/mypage/stats/detailed");
	}

	async getLearningProgress(): Promise<any> {
		return await this.request("/mypage/progress");
	}

	async getSubmissionCode(submissionId: number | string): Promise<any> {
		return await this.request(`/mypage/submission/${submissionId}/code`);
	}

	/**
	 * 특정 사용자의 문제별 제출 이력 조회 (튜터/관리자용)
	 */
	async getSubmissionHistory(
		problemId: number,
		sectionId: number,
		userId: number,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/problems/${problemId}/users/${userId}/submissions`,
		);
	}

	async enrollByCode(enrollmentCode: string): Promise<any> {
		return await this.request(`/sections/enroll/${enrollmentCode}`, {
			method: "POST",
		});
	}

	async createSection(data: any): Promise<any> {
		return await this.request("/sections", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async toggleSectionActive(
		sectionId: number | string,
		isActive: boolean,
	): Promise<any> {
		return await this.request(`/sections/${sectionId}/active`, {
			method: "PATCH",
			body: JSON.stringify({ active: isActive }),
		});
	}

	async deleteSection(sectionId: number | string): Promise<any> {
		return await this.request(`/sections/${sectionId}`, {
			method: "DELETE",
		});
	}

	async toggleNoticeActive(
		noticeId: number | string,
		isActive: boolean,
	): Promise<any> {
		return await this.request(`/notices/${noticeId}/active`, {
			method: "PATCH",
			body: JSON.stringify({ active: isActive }),
		});
	}

	async toggleAssignmentActive(
		sectionId: number | string,
		assignmentId: number | string,
		isActive: boolean,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/assignments/${assignmentId}/active`,
			{
				method: "PATCH",
				body: JSON.stringify({ active: isActive }),
			},
		);
	}

	async updateQuizStatus(
		sectionId: number | string,
		quizId: number | string,
		status: "ACTIVE" | "PAUSED" | "ENDED",
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/quizzes/${quizId}/status`,
			{
				method: "PATCH",
				body: JSON.stringify({ status }),
			},
		);
	}

	async toggleQuizActive(
		sectionId: number | string,
		quizId: number | string,
		isActive: boolean,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/quizzes/${quizId}/active`,
			{
				method: "PATCH",
				body: JSON.stringify({ active: isActive }),
			},
		);
	}

	async getCourses(): Promise<any> {
		return await this.request("/courses");
	}

	async deleteCourseByApi(courseId: number | string): Promise<any> {
		return await this.request(`/courses/${courseId}`, {
			method: "DELETE",
		});
	}

	async getCurrentUserId(): Promise<number> {
		const userInfo = await this.getUserInfo();
		if (userInfo.data && userInfo.data.user_id) {
			return userInfo.data.user_id;
		}
		if (userInfo.user_id) {
			return userInfo.user_id;
		}
		if (userInfo.id) {
			return userInfo.id;
		}
		throw new Error("사용자 ID를 찾을 수 없습니다.");
	}

	async getCommunityNotifications(
		sectionId: number | string | null,
		page = 0,
		size = 10,
	): Promise<any> {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			size: size.toString(),
		});

		if (sectionId) {
			queryParams.append("sectionId", sectionId.toString());
		}

		return await this.request(
			`/community/notifications?${queryParams.toString()}`,
		);
	}

	async markCommunityNotificationAsRead(
		notificationId: number | string,
	): Promise<any> {
		return await this.request(
			`/community/notifications/${notificationId}/read`,
			{
				method: "PUT",
			},
		);
	}

	async getUnreadNotifications(): Promise<any> {
		return await this.request("/community/notifications/unread");
	}

	async getUnreadNotificationCount(): Promise<any> {
		return await this.request("/community/notifications/unread/count");
	}

	async markAllNotificationsAsRead(): Promise<any> {
		return await this.request("/community/notifications/read-all", {
			method: "PUT",
		});
	}

	async getQuestionDetail(questionId: number | string): Promise<any> {
		return await this.request(`/community/questions/${questionId}`);
	}

	async likeQuestion(questionId: number | string): Promise<any> {
		return await this.request(`/community/likes/questions/${questionId}`, {
			method: "POST",
		});
	}

	async resolveQuestion(questionId: number | string): Promise<any> {
		return await this.request(`/community/questions/${questionId}/resolve`, {
			method: "POST",
		});
	}

	async deleteQuestion(questionId: number | string): Promise<any> {
		return await this.request(`/community/questions/${questionId}`, {
			method: "DELETE",
		});
	}

	async getComments(questionId: number | string): Promise<any> {
		return await this.request(`/community/comments?questionId=${questionId}`);
	}

	async createComment(
		questionId: number | string,
		content: string,
		isAnonymous: boolean,
	): Promise<any> {
		return await this.request("/community/comments", {
			method: "POST",
			body: JSON.stringify({
				questionId: Number.parseInt(String(questionId)),
				content: content,
				isAnonymous: isAnonymous,
			}),
		});
	}

	async likeComment(commentId: number | string): Promise<any> {
		return await this.request(`/community/likes/comments/${commentId}`, {
			method: "POST",
		});
	}

	async acceptComment(commentId: number | string): Promise<any> {
		return await this.request(`/community/comments/${commentId}/accept`, {
			method: "POST",
		});
	}

	async unacceptComment(commentId: number | string): Promise<any> {
		return await this.request(`/community/comments/${commentId}/accept`, {
			method: "DELETE",
		});
	}

	async deleteComment(commentId: number | string): Promise<any> {
		return await this.request(`/community/comments/${commentId}`, {
			method: "DELETE",
		});
	}

	async createSystemNotice(noticeData: any): Promise<any> {
		return await this.request("/system-notices", {
			method: "POST",
			body: JSON.stringify(noticeData),
		});
	}

	async getActiveSystemNotices(): Promise<any> {
		return await this.request("/system-notices/active");
	}

	async getAllSystemNotices(): Promise<any> {
		return await this.request("/system-notices");
	}

	async updateSystemNotice(
		noticeId: number | string,
		noticeData: any,
	): Promise<any> {
		return await this.request(`/system-notices/${noticeId}`, {
			method: "PUT",
			body: JSON.stringify(noticeData),
		});
	}

	async deleteSystemNotice(noticeId: number | string): Promise<any> {
		return await this.request(`/system-notices/${noticeId}`, {
			method: "DELETE",
		});
	}

	async toggleSystemNoticeActive(
		noticeId: number | string,
		isActive: boolean,
	): Promise<any> {
		return await this.request(`/system-notices/${noticeId}/active`, {
			method: "PATCH",
			body: JSON.stringify({ active: isActive }),
		});
	}

	async createSystemGuide(guideData: any): Promise<any> {
		return await this.request("/system-guides", {
			method: "POST",
			body: JSON.stringify(guideData),
		});
	}

	async getActiveSystemGuides(category: string | null = null): Promise<any> {
		const endpoint = category
			? `/system-guides/active?category=${encodeURIComponent(category)}`
			: "/system-guides/active";
		return await this.request(endpoint);
	}

	async getAllSystemGuides(): Promise<any> {
		return await this.request("/system-guides");
	}

	async getSystemGuideCategories(): Promise<any> {
		return await this.request("/system-guides/categories");
	}

	async updateSystemGuide(
		guideId: number | string,
		guideData: any,
	): Promise<any> {
		return await this.request(`/system-guides/${guideId}`, {
			method: "PUT",
			body: JSON.stringify(guideData),
		});
	}

	async deleteSystemGuide(guideId: number | string): Promise<any> {
		return await this.request(`/system-guides/${guideId}`, {
			method: "DELETE",
		});
	}

	async toggleSystemGuideActive(
		guideId: number | string,
		isActive: boolean,
	): Promise<any> {
		return await this.request(`/system-guides/${guideId}/active`, {
			method: "PATCH",
			body: JSON.stringify({ active: isActive }),
		});
	}

	async getProblemSets(): Promise<any> {
		return await this.request("/problem-sets");
	}

	async getProblemSet(problemSetId: number | string): Promise<any> {
		return await this.request(`/problem-sets/${problemSetId}`);
	}

	async createProblemSet(data: any): Promise<any> {
		return await this.request("/problem-sets", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateProblemSet(
		problemSetId: number | string,
		data: any,
	): Promise<any> {
		return await this.request(`/problem-sets/${problemSetId}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteProblemSet(problemSetId: number | string): Promise<any> {
		return await this.request(`/problem-sets/${problemSetId}`, {
			method: "DELETE",
		});
	}

	async addProblemToSet(
		problemSetId: number | string,
		problemId: number | string,
		order: number | null = null,
	): Promise<any> {
		return await this.request(`/problem-sets/${problemSetId}/problems`, {
			method: "POST",
			body: JSON.stringify({ problemId, order }),
		});
	}

	async removeProblemFromSet(
		problemSetId: number | string,
		problemId: number | string,
	): Promise<any> {
		return await this.request(
			`/problem-sets/${problemSetId}/problems/${problemId}`,
			{
				method: "DELETE",
			},
		);
	}

	async getAssignmentGrades(
		sectionId: number | string,
		assignmentId: number | string,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/assignments/${assignmentId}/grades`,
		);
	}

	async saveGrade(
		sectionId: number | string,
		assignmentId: number | string,
		gradeData: any,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/assignments/${assignmentId}/grades`,
			{
				method: "POST",
				body: JSON.stringify(gradeData),
			},
		);
	}

	async saveBulkGrades(
		sectionId: number | string,
		assignmentId: number | string,
		bulkGradeData: any,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/assignments/${assignmentId}/grades/bulk`,
			{
				method: "POST",
				body: JSON.stringify(bulkGradeData),
			},
		);
	}

	async setProblemPoints(
		sectionId: number | string,
		assignmentId: number | string,
		problemId: number | string,
		points: number,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/assignments/${assignmentId}/grades/problems/${problemId}/points`,
			{
				method: "PUT",
				body: JSON.stringify({ points }),
			},
		);
	}

	async setBulkProblemPoints(
		sectionId: number | string,
		assignmentId: number | string,
		problemPoints: any,
	): Promise<any> {
		return await this.request(
			`/sections/${sectionId}/assignments/${assignmentId}/grades/points/bulk`,
			{
				method: "PUT",
				body: JSON.stringify(problemPoints),
			},
		);
	}
}

const apiService = new APIService();
export default apiService;
