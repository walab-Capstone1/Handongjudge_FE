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
    console.log('APIService - getUserInfo 응답:', response);
    
    // 응답 데이터 구조에 따라 적절히 반환
    const userData = response.data || response;
    console.log('APIService - 처리된 사용자 데이터:', userData);
    
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
    // 먼저 과제 정보를 조회하여 sectionId를 얻습니다
    
    console.log('SubmitCode sectionId', sectionId);
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

  // 과제에서 문제 제거 (백엔드 API 필요)
  async removeProblemFromAssignment(assignmentId, problemId) {
    return await this.request(`/assignments/${assignmentId}/${problemId}`, {
      method: 'DELETE',
    });
  }

  // ==================== 관리자 API ====================
  
  // 대시보드 통계 조회
  async getAdminStats() {
    return await this.request('/admin/dashboard/stats');
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

  // 특정 분반 학생 조회
  async getSectionStudents(sectionId) {
    return await this.request(`/user/sections/${sectionId}/students`);
  }

  // 특정 분반의 과제 목록 (기존 API 활용)
  async getAssignmentsBySection(sectionId) {
    return await this.request(`/sections/${sectionId}/assignments`);
  }

  // 특정 과제의 문제 목록 조회
  async getAssignmentProblems(sectionId, assignmentId) {
    return await this.request(`/sections/${sectionId}/assignments/${assignmentId}/problems`);
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

    // 과제 정보 조회 (기존 API 사용)
    async getAssignmentInfo(sectionId, assignmentId) {
        return await this.request(`/sections/${sectionId}/assignments/${assignmentId}`);
    }



  // ==================== 강의 관리 API ====================
  
  // 모든 강의 조회 (관리자)
  async getAllCourses() {
    return await this.request('/admin/courses');
  }

  // 강의 생성
  async createCourse(courseData) {
    return await this.request('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
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
  async createAssignment(assignmentData) {
    return await this.request('/admin/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  // 과제 수정
  async updateAssignment(assignmentId, assignmentData) {
    return await this.request(`/admin/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  }

  // 과제 삭제
  async deleteAssignment(assignmentId) {
    return await this.request(`/admin/assignments/${assignmentId}`, {
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

  // 사용자 삭제
  async deleteUser(userId) {
    return await this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // 사용자 상태 변경 (활성/비활성)
  async toggleUserStatus(userId, status) {
    return await this.request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
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

}

const apiService = new APIService();
export default apiService;