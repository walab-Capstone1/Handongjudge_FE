import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import APIService from "../services/APIService";
import "./EnrollPage.css";

const EnrollPage = () => {
  const { enrollmentCode } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [error, setError] = useState(null);

  // useEffect 제거 - 자동 리다이렉트 없음

  const handleEnroll = async () => {
    try {
      setEnrollLoading(true);
      setError(null);

      const response = await APIService.enrollByCode(enrollmentCode);

      if (response.success) {
        alert(`${response.courseTitle} 수강 신청이 완료되었습니다!`);
        // 수강 신청 완료 후 대시보드로 이동
        //window.location.href = '/main';
        navigate('/main');
      } else {
        setError(response.message || '수강 신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('수강 신청 실패:', error);
      setError(error.message || '수강 신청에 실패했습니다.');
    } finally {
      setEnrollLoading(false);
    }
  };

  // 인증 상태 확인 중
  if (authLoading) {
    return (
      <div className="enroll-page">
        <div className="enroll-container">
          <div className="enroll-card">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>인증 확인 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="enroll-page">
        <div className="enroll-container">
          <div className="enroll-card">
            <div className="enroll-header">
              <h1 className="enroll-title">로그인이 필요합니다</h1>
              <p className="enroll-subtitle">
                수업 참가를 위해 먼저 로그인해주세요
              </p>
            </div>

            <div className="enroll-body">
              <div className="enrollment-code-display">
                <label>참가 코드</label>
                <div className="code-box">{enrollmentCode}</div>
              </div>

              <div className="enroll-info">
                <p>
                  이 참가 코드로 수업에 참가하려면 로그인이 필요합니다.
                </p>
              </div>

              <div className="enroll-actions">
                <button
                  className="btn-enroll"
                  onClick={() => {
                    sessionStorage.setItem('pendingEnrollmentCode', enrollmentCode);
                    //window.location.href = '/';
                    navigate('/');
                  }}
                >
                  로그인하러 가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enroll-page">
      <div className="enroll-container">
        <div className="enroll-card">
          <div className="enroll-header">
            <h1 className="enroll-title">수업 참가</h1>
            <p className="enroll-subtitle">
              참가 코드를 통해 수업에 등록합니다
            </p>
          </div>

          <div className="enroll-body">
            <div className="enrollment-code-display">
              <label>참가 코드</label>
              <div className="code-box">{enrollmentCode}</div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="enroll-info">
              <p>
                이 참가 코드로 수업에 등록하시겠습니까?
              </p>
            </div>

            <div className="enroll-actions">
              <button
                className="btn-cancel"
                onClick={() => navigate('/main')}
                disabled={enrollLoading}
              >
                취소
              </button>
              <button
                className="btn-enroll"
                onClick={handleEnroll}
                disabled={enrollLoading}
              >
                {enrollLoading ? '처리 중...' : '수강 신청'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollPage;

