import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import APIService from "../../services/APIService";
import "./MyInfoPage.css";

const MyInfoPage = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [githubStatus, setGithubStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoCommitEnabled, setAutoCommitEnabled] = useState(false);

  useEffect(() => {
    fetchMyPageData();
  }, []);

  const fetchMyPageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 기본 데이터 조회 (필수)
      const [profileResponse, statsResponse] = await Promise.all([
        APIService.getUserProfile(),
        APIService.getUserStats()
      ]);

      console.log('프로필 응답:', profileResponse);
      console.log('통계 응답:', statsResponse);

      setProfile(profileResponse.data || profileResponse);
      setStats(statsResponse.data || statsResponse);

      // GitHub 상태 조회 (선택적 - 실패해도 전체 로딩을 막지 않음)
      try {
        const githubResponse = await APIService.getGitHubStatus();
        console.log('GitHub 응답:', githubResponse);
        setGithubStatus(githubResponse.data || githubResponse);
        
        if (githubResponse.data?.autoCommitEnabled) {
          setAutoCommitEnabled(githubResponse.data.autoCommitEnabled);
        }
      } catch (githubErr) {
        console.warn('GitHub 상태 조회 실패 (무시):', githubErr);
        // GitHub 연동이 안된 사용자의 기본값 설정
        setGithubStatus({
          isConnected: false,
          githubUsername: null,
          githubProfileUrl: null,
          autoCommitEnabled: false
        });
      }

    } catch (err) {
      console.error('마이페이지 데이터 조회 실패:', err);
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCommitToggle = async () => {
    try {
      const newStatus = !autoCommitEnabled;
      await APIService.toggleAutoCommit(newStatus);
      setAutoCommitEnabled(newStatus);
      alert(newStatus ? '자동 커밋이 활성화되었습니다!' : '자동 커밋이 비활성화되었습니다.');
    } catch (err) {
      console.error('자동 커밋 설정 실패:', err);
      alert('설정 변경에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '정보 없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="my-info-page">
          <div className="loading-container">
            <LoadingSpinner />
            <p>마이페이지 정보를 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="my-info-page">
          <div className="error-container">
            <h3>오류가 발생했습니다</h3>
            <p>{error}</p>
            <button onClick={fetchMyPageData} className="retry-button">
              다시 시도
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="my-info-page">
        <div className="page-container">
          {/* 통합 헤더 */}
          <div className="mypage-header">
            <h1 className="mypage-title">마이페이지</h1>
            <div className="mypage-navigation">
              <Link to="/mypage/info" className="mypage-nav-link active">
                내 정보
              </Link>
              <Link to="/mypage/assignments" className="mypage-nav-link">
                내 과제
              </Link>
            </div>
          </div>

          <div className="content-grid">
            {/* 프로필 정보 섹션 */}
            <div className="profile-section">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">프로필 정보</h2>
                </div>
                <div className="card-content">
                  <div className="profile-avatar">
                    {profile?.profileImageUrl ? (
                      <img src={profile.profileImageUrl} alt="프로필" className="avatar-image" />
                    ) : (
                      <div className="avatar-placeholder">
                        {profile?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="profile-info">
                    <div className="info-item">
                      <label>이름</label>
                      <span>{profile?.name || '정보 없음'}</span>
                    </div>
                    <div className="info-item">
                      <label>이메일</label>
                      <span>{profile?.email || '정보 없음'}</span>
                    </div>
                    <div className="info-item">
                      <label>역할</label>
                      <span className={`role-badge ${profile?.role?.toLowerCase()}`}>
                        {profile?.role === 'ADMIN' ? '교수' : '학생'}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>가입일</label>
                      <span>{formatDate(profile?.createdAt)}</span>
                    </div>
                    <div className="info-item">
                      <label>로그인 방식</label>
                      <span className={`provider-badge ${profile?.provider?.toLowerCase()}`}>
                        {profile?.provider === 'GITHUB' ? 'GitHub' : 
                         profile?.provider === 'GOOGLE' ? 'Google' : '일반 로그인'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 학습 통계 섹션 */}
            <div className="stats-section">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">학습 통계</h2>
                </div>
                <div className="card-content">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-number">{stats?.totalSubmissions || 0}</div>
                      <div className="stat-label">총 제출 수</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{stats?.correctSubmissions || 0}</div>
                      <div className="stat-label">정답 제출</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{stats?.accuracyRate?.toFixed(1) || '0.0'}%</div>
                      <div className="stat-label">정답률</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{stats?.solvedProblems || 0}</div>
                      <div className="stat-label">해결한 문제</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{stats?.enrolledSections || 0}</div>
                      <div className="stat-label">수강 분반</div>
                    </div>
                  </div>

                  {/* 언어별 통계 */}
                  {stats?.languageStats && Object.keys(stats.languageStats).length > 0 && (
                    <div className="language-stats">
                      <h3>사용 언어 통계</h3>
                      <div className="language-list">
                        {Object.entries(stats.languageStats).map(([language, count]) => (
                          <div key={language} className="language-item">
                            <span className="language-name">{language}</span>
                            <span className="language-count">{count}회</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* GitHub 연동 섹션 */}
            <div className="github-section">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">GitHub 연동</h2>
                </div>
                <div className="card-content">
                  {githubStatus?.isConnected ? (
                    <div className="github-connected">
                      <div className="github-info">
                        <div className="github-avatar">
                          <div className="github-icon">📁</div>
                        </div>
                        <div className="github-details">
                          <h3>{githubStatus.githubUsername}</h3>
                          <a 
                            href={githubStatus.githubProfileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="github-link"
                          >
                            GitHub 프로필 보기 →
                          </a>
                        </div>
                      </div>
                      
                      <div className="github-settings">
                        <div className="setting-item">
                          <div className="setting-info">
                            <h4>자동 커밋</h4>
                            <p>문제 해결 시 자동으로 GitHub에 커밋합니다.</p>
                          </div>
                          <button 
                            className={`toggle-button ${autoCommitEnabled ? 'enabled' : 'disabled'}`}
                            onClick={handleAutoCommitToggle}
                          >
                            {autoCommitEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="github-not-connected">
                      <div className="github-icon">😺</div>
                      <h3>GitHub 연동 없음</h3>
                      <p>GitHub를 연동하면 자동 커밋 기능을 사용할 수 있습니다.</p>
                      <div className="github-connect-actions">
                        <a 
                          href="https://hj.walab.info/api/oauth2/authorization/github"
                          className="github-connect-button"
                        >
                          GitHub 계정 연동하기
                        </a>
                        <p className="github-connect-note">
                          연동 후 다시 로그인하시면 GitHub 기능을 사용할 수 있습니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 최근 활동 섹션 */}
            {stats?.recentActivities && stats.recentActivities.length > 0 && (
              <div className="recent-activity-section">
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">최근 활동</h2>
                  </div>
                  <div className="card-content">
                    <div className="activity-list">
                      {stats.recentActivities.map((activity, index) => (
                        <div key={index} className="activity-item">
                          <div className="activity-info">
                            <div className="activity-title">{activity.problemTitle}</div>
                            <div className="activity-meta">
                              <span className="activity-section">{activity.sectionName}</span>
                              <span className="activity-language">{activity.language}</span>
                            </div>
                          </div>
                          <div className="activity-result">
                            <span className={`result-badge ${activity.result}`}>
                              {activity.result === 'correct' ? '정답' : '오답'}
                            </span>
                            <span className="activity-date">
                              {formatDate(activity.submittedAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MyInfoPage; 