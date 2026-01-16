import tokenManager from '../utils/tokenManager';

class APIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  }

  // HTTP 요청 헬퍼 함수
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      credentials: 'include', // Refresh Token 쿠키 포함
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Access Token이 있으면 헤더에 추가
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, config);
      
      // 401 에러 시 토큰 갱신 시도
      if (response.status === 401) {
        console.log('토큰 만료, 갱신 시도 중...');
        try {
          await tokenManager.refreshToken();
          // 토큰 갱신 성공 시 원래 요청 재시도
          const newAccessToken = tokenManager.getAccessToken();
          if (newAccessToken) {
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            const retryResponse = await fetch(url, config);
            return this.handleResponse(retryResponse);
          }
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 처리
          console.error('토큰 갱신 실패:', refreshError);
          tokenManager.clearTokens();
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('API 요청 오류:', error);
      throw error;
    }
  }

  // 응답 처리
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Content-Type 확인하여 적절한 파싱 방법 선택
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // JSON이 아닌 경우 텍스트로 반환 (숫자 등)
      const text = await response.text();
      // 숫자인지 확인하고 숫자로 변환
      if (/^\d+$/.test(text.trim())) {
        return parseInt(text.trim(), 10);
      }
      return text;
    }
  }

  // 회원가입
  async register(registerData) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      });
      return response;
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  }

  // 일반 로그인
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Access Token 저장 (Refresh Token은 쿠키에서 처리)
    if (response.accessToken) {
      tokenManager.setAccessToken(response.accessToken);
    }

    return response;
  }



  // 로그아웃
  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      tokenManager.clearTokens();
    }
  }

  // 사용자 정보 조회
  async getUserInfo() {
    const response = await this.request('/user/me');
    
    // 응답 데이터 구조에 따라 적절히 반환
    const userData = response.data || response;
    
    return userData;
  }



  // 비밀번호 재설정 요청
  async requestPasswordReset(email) {
    return await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // 비밀번호 재설정
  async resetPassword(token, newPassword) {
    return await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // 유저별 수강 중인 section 조회 (현재 백엔드 API에 맞춤)
  async getUserEnrolledSections() {
    return await this.request('/user/dashboard');
  }

  // 과제 목록 조회
  async getAssignments(sectionId) {
    return await this.request(`/sections/${sectionId}/assignments`,{
      method: 'GET',
    });  
  }
  // 과제 문제 목록 조회
  async getAssignmentProblems(sectionId,assignmentId) {
    return await this.request(`/sections/${sectionId}/assignments/${assignmentId}/problems`,{ 
      method: 'GET',
    });
  }

  // 과제 정보 조회 (assignmentId만으로 조회)
  async getAssignmentInfo(assignmentId) {
    return await this.request(`/assignments/${assignmentId}`, {
      method: 'GET',
    });     
  }



  // 과제 생성

  // 코드 제출 API
  async submitCode(sectionId, problemId, code, language) {
    return await this.request('/submissions/submitAndGetResult', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        problemId: parseInt(problemId),
        sectionId: parseInt(sectionId),
        language,
        codeString : code
      }),
    });
  }

  // 코드 제출 및 아웃풋 받기 API
  async submitCodeAndGetOutput(sectionId, problemId, code, language) {
    return await this.request('/submissions/submitAndGetResult/output', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        problemId: parseInt(problemId),
        sectionId: parseInt(sectionId),
        language,
        codeString: code
      }),
    });
  }

  // 진행 상황 저장 API
  async saveProgress(problemId, sectionId, language, code) {
    return await this.request('/progress/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        problemId: parseInt(problemId),
        sectionId: parseInt(sectionId),
        language,
        codeString: code,
        savedAt: new Date().toISOString()
      }),
    });
  }

  // 진행 상황 불러오기 API
  async loadProgress(problemId, sectionId, language) {
    return await this.request(`/submissions/lastSubmitCode?problemId=${problemId}&sectionId=${sectionId}&language=${language}`, {
      method: 'GET'
    });
  }
  

  // 제출 결과 조회 API (현재 백엔드에서 즉시 결과를 반환하므로 사용하지 않음)
  // async getSubmissionResult(submissionId) {
  //   return await this.request(`/submissions/${submissionId}`);
  // }

  // 문제 정보 조회 API
  async getProblemInfo(problemId) {
    return await this.request(`/problems/${problemId}`);
  }

  // ==================== 문제 관리 API ====================
  
  // 모든 문제 목록 조회
  async getAllProblems() {
    return await this.request('/problems');
  }

  // 문제 생성
  async createProblem(formData) {
    const url = `${this.baseURL}/problems`;
    
    // Access Token 가져오기
    const accessToken = tokenManager.getAccessToken();
    console.log('문제 생성 API 호출 - 토큰 상태:', {
      hasToken: !!accessToken,
      tokenLength: accessToken ? accessToken.length : 0
    });
    
    const config = {
      method: 'POST',
      credentials: 'include',
      headers: {},
      body: formData,
      // FormData 사용 시 Content-Type 헤더를 설정하지 않음 (브라우저가 자동 설정)
    };

    // Access Token이 있으면 헤더에 추가
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, config);
      
      // 401 에러 시 토큰 갱신 시도
      if (response.status === 401) {
        console.log('토큰 만료, 갱신 시도 중...');
        try {
          await tokenManager.refreshToken();
          const newAccessToken = tokenManager.getAccessToken();
          if (newAccessToken) {
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            const retryResponse = await fetch(url, config);
            return this.handleResponse(retryResponse);
          }
        } catch (refreshError) {
          console.error('토큰 갱신 실패:', refreshError);
          tokenManager.clearTokens();
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('문제 생성 API 요청 오류:', error);
      throw error;
    }
  }

  // 과제에 문제 추가
  async addProblemToAssignment(assignmentId, problemId) {
    console.log('🔗 과제에 문제 추가 API 호출:', {
      assignmentId,
      problemId,
      url: `/assignments/${assignmentId}/${problemId}`,
      assignmentIdType: typeof assignmentId,
      problemIdType: typeof problemId
    });
    
    return await this.request(`/assignments/${assignmentId}/${problemId}`, {
      method: 'POST',
    });
  }

  // ZIP 파일 파싱 (미리보기)
  async parseZipFile(formData) {
    const url = `${this.baseURL}/problems/parse-zip`;
    const accessToken = tokenManager.getAccessToken();
    
    const config = {
      method: 'POST',
      credentials: 'include',
      headers: {},
      body: formData,
    };

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        await tokenManager.refreshToken();
        const newAccessToken = tokenManager.getAccessToken();
        if (newAccessToken) {
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          const retryResponse = await fetch(url, config);
          return this.handleResponse(retryResponse);
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('ZIP 파일 파싱 오류:', error);
      throw error;
    }
  }

  // 문제 수정
  async updateProblem(problemId, formData) {
    const url = `${this.baseURL}/problems/${problemId}`;
    const accessToken = tokenManager.getAccessToken();
    
    const config = {
      method: 'PUT',
      credentials: 'include',
      headers: {},
      body: formData,
    };

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        await tokenManager.refreshToken();
        const newAccessToken = tokenManager.getAccessToken();
        if (newAccessToken) {
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          const retryResponse = await fetch(url, config);
          return this.handleResponse(retryResponse);
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('문제 수정 오류:', error);
      throw error;
    }
  }

  // 과제에서 문제 제거 (백엔드 API 필요)
  async removeProblemFromAssignment(assignmentId, problemId) {
    return await this.request(`/assignments/${assignmentId}/${problemId}`, {
      method: 'DELETE',
    });
  }

  // 문제 삭제
  async deleteProblem(problemId) {
    return await this.request(`/problems/${problemId}`, {
      method: 'DELETE',
    });
  }

  // 문제 복사
  async copyProblem(problemId, newTitle = null) {
    const body = newTitle ? { newTitle } : {};
    return await this.request(`/problems/${problemId}/copy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  // 수업 복사
  async copySection(sectionId, sectionNumber, year, semester, courseTitle, description, copyNotices, copyAssignments, selectedNoticeIds, selectedAssignmentIds, assignmentProblems, noticeEdits, assignmentEdits, problemEdits) {
    return await this.request(`/sections/${sectionId}/copy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sectionNumber,
        year,
        semester,
        courseTitle,
        description: description || '',
        copyNotices: copyNotices !== false, // 기본값 true
        copyAssignments: copyAssignments !== false, // 기본값 true
        selectedNoticeIds: selectedNoticeIds || [],
        selectedAssignmentIds: selectedAssignmentIds || [],
        assignmentProblems: assignmentProblems || {},
        noticeEdits: noticeEdits || {},
        assignmentEdits: assignmentEdits || {},
        problemEdits: problemEdits || {}
      }),
    });
  }

  // ==================== 관리자 API ====================
  
  // 대시보드 통계 조회
  async getAdminStats() {
    return await this.request('/admin/dashboard/stats');
  }

  // 시스템 관리자 통계 조회
  async getSuperAdminStats() {
    return await this.request('/admin/system-admin/stats');
  }

  // 시스템 관리자용 모든 수업 조회
  async getAllSectionsForSuperAdmin() {
    return await this.request('/admin/system-admin/sections');
  }

  // 시스템 관리자용 모든 사용자 조회
  async getAllUsersForSuperAdmin() {
    return await this.request('/admin/system-admin/users');
  }

  // 시스템 관리자용 모든 제출 레코드 조회
  async getAllSubmissionsForSuperAdmin(page = 0, size = 50) {
    return await this.request(`/admin/system-admin/submissions?page=${page}&size=${size}`);
  }

  // 최근 활동 조회
  async getRecentActivity() {
    return await this.request('/admin/dashboard/activity');
  }

  // ==================== 교수 관련 API (기존 API 활용) ====================
  
  // 교수 대시보드 데이터 (기존 dashboard API 활용)
  async getInstructorDashboard() {
    return await this.request('/user/dashboard');
  }

  // 교수별 담당 학생 조회
  async getInstructorStudents() {
    return await this.request('/user/instructor/students');
  }
  
  // 학생의 특정 분반 과제 진도율 조회
  async getStudentAssignmentsProgress(userId, sectionId) {
    return await this.request(`/user/students/${userId}/sections/${sectionId}/assignments-progress`);
  }
  
  // 학생의 특정 과제의 문제별 상태 조회
  async getStudentAssignmentProblemsStatus(userId, sectionId, assignmentId) {
    return await this.request(`/user/students/${userId}/sections/${sectionId}/assignments/${assignmentId}/problems-status`);
  }

  // 특정 분반 학생 조회
  async getSectionStudents(sectionId) {
    return await this.request(`/user/sections/${sectionId}/students`);
  }

  // 특정 분반의 과제 목록 (기존 API 활용)
  async getAssignmentsBySection(sectionId) {
    return await this.request(`/sections/${sectionId}/assignments`);
  }


  // 과제별 제출 통계 조회 (분반별)
  async getAssignmentSubmissionStats(assignmentId, sectionId) {
    try {
      console.log(`API 호출: /sections/${sectionId}/assignments/${assignmentId}/submission-stats`);
      const response = await this.request(`/sections/${sectionId}/assignments/${assignmentId}/submission-stats`);
      console.log(`API 응답:`, response);
      return response;
    } catch (error) {
      console.error('과제 제출 통계 조회 실패:', error);
      return null;
    }
  }

  // 마감 직전 과제 조회
  async getUpcomingAssignments(sectionId, days = 3) {
    try {
      const response = await this.request(`/sections/${sectionId}/assignments/upcoming?days=${days}`);
      return response?.data || response || [];
    } catch (error) {
      console.error('마감 직전 과제 조회 실패:', error);
      return [];
    }
  }

  // 전체 과제 제출 통계 조회 (교수용) - 백엔드에 해당 엔드포인트가 없어서 주석 처리
  // async getAllAssignmentsSubmissionStats() {
  //   try {
  //     const response = await this.request('/assignments/instructor/all-submission-stats');
  //     return response;
  //   } catch (error) {
  //     console.error('전체 과제 제출 통계 조회 실패:', error);
  //     return [];
  //   }
  // }

  // 과제별 학생 진행 현황 조회 (학생별 문제 풀이 현황)
  async getAssignmentStudentProgress(assignmentId, sectionId) {
    try {
      console.log(`API 호출: /sections/${sectionId}/assignments/${assignmentId}/student-progress`);
      const response = await this.request(`/sections/${sectionId}/assignments/${assignmentId}/student-progress`);
      console.log(`API 응답:`, response);
      return response;
    } catch (error) {
      console.error('학생 진행 현황 조회 실패:', error);
      return [];
    }
  }

  // ==================== 공지사항 관련 API ====================

  // 공지사항 생성
  async createNotice(noticeData) {
    return await this.request('/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData)
    });
  }

  // 교수의 모든 공지사항 조회
  async getInstructorNotices() {
    return await this.request('/notices/instructor/my');
  }

  // 특정 분반의 공지사항 조회
  async getSectionNotices(sectionId) {
    return await this.request(`/notices?sectionId=${sectionId}`);
  }

  // 공지사항 수정
  async updateNotice(noticeId, noticeData) {
    return await this.request(`/notices/${noticeId}`, {
      method: 'PUT',
      body: JSON.stringify(noticeData)
    });
  }

  // 공지사항 삭제
  async deleteNotice(noticeId) {
    return await this.request(`/notices/${noticeId}`, {
      method: 'DELETE'
    });
  }

      // 공지사항 읽음 처리
    async markNoticeAsRead(noticeId) {
        return await this.request(`/user/read/notice/${noticeId}`, {
            method: 'POST'
        });
    }

    // 과제 읽음 처리
    async markAssignmentAsRead(assignmentId) {
        return await this.request(`/user/read/assignment/${assignmentId}`, {
            method: 'POST'
        });
    }

    // 섹션 정보 조회
    async getSectionInfo(sectionId) {
        return await this.request(`/sections/${sectionId}`);
    }

    // 과제 정보 조회 (sectionId와 assignmentId로 조회 - Super Admin용)
    async getAssignmentInfoBySection(sectionId, assignmentId) {
        return await this.request(`/sections/${sectionId}/assignments/${assignmentId}`);
    }



  // ==================== 강의 관리 API ====================
  
  // 모든 강의 조회 (관리자)
  async getAllCourses() {
    return await this.request('/admin/courses');
  }

  // 강의 생성 (Admin용)
  async createCourse(courseData) {
    return await this.request('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  // 강의 생성 (Super Admin용 - 일반 courses 엔드포인트)
  async createCourseAsSuperAdmin(data) {
    return await this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 강의 수정
  async updateCourse(courseId, courseData) {
    return await this.request(`/admin/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  // 강의 삭제
  async deleteCourse(courseId) {
    return await this.request(`/admin/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  // 강의별 섹션 조회
  async getCourseSections(courseId) {
    return await this.request(`/admin/courses/${courseId}/sections`);
  }

  // ==================== 과제 관리 API ====================
  
  // 모든 과제 조회 (관리자)
  async getAllAssignments() {
    return await this.request('/admin/assignments');
  }

  // 과제 생성
  async createAssignment(sectionId, assignmentData) {
    return await this.request(`/sections/${sectionId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  // 과제 수정
  async updateAssignment(sectionId, assignmentId, assignmentData) {
    return await this.request(`/sections/${sectionId}/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  }

  // 과제 삭제
  async deleteAssignment(sectionId, assignmentId) {
    return await this.request(`/sections/${sectionId}/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  }

  // 과제별 제출 현황 조회
  async getAssignmentSubmissions(assignmentId) {
    return await this.request(`/admin/assignments/${assignmentId}/submissions`);
  }

  // ==================== 사용자 관리 API ====================
  
  // 모든 사용자 조회 (관리자)
  async getAllUsers() {
    return await this.request('/admin/users');
  }

  // 사용자 생성
  async createUser(userData) {
    return await this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // 사용자 수정
  async updateUser(userId, userData) {
    return await this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // 사용자별 과제 제출 상태 조회
  async getUserSubmissionStatus(sectionId, assignmentId) {
    return await this.request(`/sections/${sectionId}/assignments/${assignmentId}/user-submission-status`);
  }

  // 사용자 삭제
  async deleteUser(userId) {
    return await this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // 사용자 상태 변경 (활성/비활성)
  async toggleUserStatus(userId, status) {
    return await this.request(`/admin/system-admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
  }

  // 사용자별 강의 등록 현황 조회
  async getUserEnrollments(userId) {
    return await this.request(`/admin/users/${userId}/enrollments`);
  }

  // 사용자를 강의에 등록
  async enrollUserToCourse(userId, courseId) {
    return await this.request(`/admin/users/${userId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  }

  // 사용자를 강의에서 제외
  async unenrollUserFromCourse(userId, courseId) {
    return await this.request(`/admin/users/${userId}/unenroll`, {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  }

  // ==================== 마이페이지 API ====================
  
  // 사용자 프로필 정보 조회 (GitHub 정보 포함)
  async getUserProfile() {
    return await this.request('/mypage/profile');
  }

  // 사용자 학습 통계 조회
  async getUserStats() {
    return await this.request('/mypage/stats');
  }

  // 최근 제출 기록 조회
  async getRecentSubmissions(limit = 10) {
    return await this.request(`/mypage/recent-submissions?limit=${limit}`);
  }

  // 수강 중인 과목 현황 조회
  async getEnrolledSections() {
    return await this.request('/mypage/enrolled-sections');
  }

  // GitHub 연동 상태 조회
  async getGitHubStatus() {
    return await this.request('/mypage/github-status');
  }

  // GitHub 저장소 설정
  async setGitHubRepository(repositoryData) {
    return await this.request('/mypage/github/repository', {
      method: 'POST',
      body: JSON.stringify(repositoryData),
    });
  }

  // 자동 커밋 설정 토글
  async toggleAutoCommit(enabled) {
    return await this.request('/mypage/github/auto-commit', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  }

  // 커밋 히스토리 조회
  async getCommitHistory(limit = 10) {
    return await this.request(`/mypage/github/commits?limit=${limit}`);
  }

  // 상세 학습 통계 조회 (차트용)
  async getDetailedStats() {
    return await this.request('/mypage/stats/detailed');
  }

  // 학습 진행도 조회
  async getLearningProgress() {
    return await this.request('/mypage/progress');
  }

  // 제출된 코드 조회
  async getSubmissionCode(submissionId) {
    return await this.request(`/mypage/submission/${submissionId}/code`);
  }

  // enrollmentCode로 수강 신청
  async enrollByCode(enrollmentCode) {
    return await this.request(`/sections/enroll/${enrollmentCode}`, {
      method: 'POST',
    });
  }

  // 수업(Section) 생성
  async createSection(data) {
    return await this.request('/sections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 수업(Section) 활성화/비활성화
  async toggleSectionActive(sectionId, isActive) {
    return await this.request(`/sections/${sectionId}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ active: isActive }),
    });
  }

  // 공지사항 활성화/비활성화 토글
  async toggleNoticeActive(noticeId, isActive) {
    return await this.request(`/notices/${noticeId}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ active: isActive }),
    });
  }

  // 과제 활성화/비활성화 토글
  async toggleAssignmentActive(sectionId, assignmentId, isActive) {
    return await this.request(`/sections/${sectionId}/assignments/${assignmentId}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ active: isActive }),
    });
  }


  // 강의(Course) 목록 조회
  async getCourses() {
    return await this.request('/courses');
  }

  // 현재 로그인한 사용자 ID 조회
  async getCurrentUserId() {
    const userInfo = await this.getUserInfo();
    // userInfo 구조: { data: { user_id: ... } } 또는 { user_id: ... }
    if (userInfo.data && userInfo.data.user_id) {
      return userInfo.data.user_id;
    }
    if (userInfo.user_id) {
      return userInfo.user_id;
    }
    if (userInfo.id) {
      return userInfo.id;
    }
    throw new Error('사용자 ID를 찾을 수 없습니다.');
  }

  // ==================== 커뮤니티 알림 API ====================
  
  // 커뮤니티 알림 목록 조회
  async getCommunityNotifications(sectionId, page = 0, size = 10) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (sectionId) {
      queryParams.append('sectionId', sectionId.toString());
    }
    
    return await this.request(`/community/notifications?${queryParams.toString()}`);
  }

  // 커뮤니티 알림 읽음 처리
  async markCommunityNotificationAsRead(notificationId) {
    return await this.request(`/community/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  // ==================== 커뮤니티 질문 API ====================
  
  // 질문 상세 조회
  async getQuestionDetail(questionId) {
    return await this.request(`/community/questions/${questionId}`);
  }

  // 질문 추천
  async likeQuestion(questionId) {
    return await this.request(`/community/likes/questions/${questionId}`, {
      method: 'POST'
    });
  }

  // 질문 해결/미해결 변경
  async resolveQuestion(questionId) {
    return await this.request(`/community/questions/${questionId}/resolve`, {
      method: 'POST'
    });
  }

  // 질문 삭제
  async deleteQuestion(questionId) {
    return await this.request(`/community/questions/${questionId}`, {
      method: 'DELETE'
    });
  }

  // ==================== 커뮤니티 댓글 API ====================
  
  // 댓글 목록 조회
  async getComments(questionId) {
    return await this.request(`/community/comments?questionId=${questionId}`);
  }

  // 댓글 작성
  async createComment(questionId, content, isAnonymous) {
    return await this.request('/community/comments', {
      method: 'POST',
      body: JSON.stringify({
        questionId: parseInt(questionId),
        content: content,
        isAnonymous: isAnonymous
      })
    });
  }

  // 댓글 추천
  async likeComment(commentId) {
    return await this.request(`/community/likes/comments/${commentId}`, {
      method: 'POST'
    });
  }

  // 댓글 채택
  async acceptComment(commentId) {
    return await this.request(`/community/comments/${commentId}/accept`, {
      method: 'POST'
    });
  }

  // 댓글 채택 해제
  async unacceptComment(commentId) {
    return await this.request(`/community/comments/${commentId}/accept`, {
      method: 'DELETE'
    });
  }

  // 댓글 삭제
  async deleteComment(commentId) {
    return await this.request(`/community/comments/${commentId}`, {
      method: 'DELETE'
    });
  }

  // ==================== 시스템 전체 공지사항 API ====================
  
  // 시스템 전체 공지사항 생성 (SUPER_ADMIN만)
  async createSystemNotice(noticeData) {
    return await this.request('/system-notices', {
      method: 'POST',
      body: JSON.stringify(noticeData)
    });
  }

  // 활성화된 시스템 전체 공지사항 조회 (모든 사용자)
  async getActiveSystemNotices() {
    return await this.request('/system-notices/active');
  }

  // 모든 시스템 전체 공지사항 조회 (SUPER_ADMIN만)
  async getAllSystemNotices() {
    return await this.request('/system-notices');
  }

  // 시스템 전체 공지사항 수정 (SUPER_ADMIN만)
  async updateSystemNotice(noticeId, noticeData) {
    return await this.request(`/system-notices/${noticeId}`, {
      method: 'PUT',
      body: JSON.stringify(noticeData)
    });
  }

  // 시스템 전체 공지사항 삭제 (SUPER_ADMIN만)
  async deleteSystemNotice(noticeId) {
    return await this.request(`/system-notices/${noticeId}`, {
      method: 'DELETE'
    });
  }

  // 시스템 전체 공지사항 활성화/비활성화 (SUPER_ADMIN만)
  async toggleSystemNoticeActive(noticeId, isActive) {
    return await this.request(`/system-notices/${noticeId}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ active: isActive })
    });
  }

  // ==================== 시스템 이용안내 API ====================
  
  // 시스템 이용안내 생성 (SUPER_ADMIN만)
  async createSystemGuide(guideData) {
    return await this.request('/system-guides', {
      method: 'POST',
      body: JSON.stringify(guideData)
    });
  }

  // 활성화된 시스템 이용안내 조회 (모든 사용자)
  async getActiveSystemGuides(category = null) {
    const endpoint = category 
      ? `/system-guides/active?category=${encodeURIComponent(category)}`
      : '/system-guides/active';
    return await this.request(endpoint);
  }

  // 모든 시스템 이용안내 조회 (SUPER_ADMIN만)
  async getAllSystemGuides() {
    return await this.request('/system-guides');
  }

  // 이용안내 카테고리 목록 조회
  async getSystemGuideCategories() {
    return await this.request('/system-guides/categories');
  }

  // 시스템 이용안내 수정 (SUPER_ADMIN만)
  async updateSystemGuide(guideId, guideData) {
    return await this.request(`/system-guides/${guideId}`, {
      method: 'PUT',
      body: JSON.stringify(guideData)
    });
  }

  // 시스템 이용안내 삭제 (SUPER_ADMIN만)
  async deleteSystemGuide(guideId) {
    return await this.request(`/system-guides/${guideId}`, {
      method: 'DELETE'
    });
  }

  // 시스템 이용안내 활성화/비활성화 (SUPER_ADMIN만)
  async toggleSystemGuideActive(guideId, isActive) {
    return await this.request(`/system-guides/${guideId}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ active: isActive })
    });
  }

}

const apiService = new APIService();
export default apiService;