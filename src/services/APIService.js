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
    return response.json();
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
    return response.data || response;
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

  // 공지사항 확인 처리
  async markNoticeAsRead(noticeId) {
    return await this.request(`/notices/${noticeId}/read`, {
      method: 'POST',
    });
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




}

const apiService = new APIService();
export default apiService;