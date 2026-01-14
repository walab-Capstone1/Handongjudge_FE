import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
import Header from "../../components/Header";
import { FaUsers, FaBook, FaFileAlt, FaCode, FaBullhorn, FaBookOpen, FaUniversity, FaList } from "react-icons/fa";
import "./SuperAdminDashboard.css";

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSections: 0,
    totalAssignments: 0,
    totalProblems: 0,
    totalSystemNotices: 0,
    totalSystemGuides: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await APIService.getSuperAdminStats();
      console.log('통계 API 응답:', response);
      
      // 응답 구조 확인: response.data.data 또는 response.data
      const statsData = response?.data?.data || response?.data || response;
      
      if (statsData) {
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalSections: statsData.totalSections || 0,
          totalAssignments: statsData.totalAssignments || 0,
          totalProblems: statsData.totalProblems || 0,
          totalSystemNotices: statsData.totalSystemNotices || 0,
          totalSystemGuides: statsData.totalSystemGuides || 0
        });
      } else {
        console.warn('통계 데이터가 없습니다:', response);
      }
      setLoading(false);
    } catch (error) {
      console.error('통계 조회 실패:', error);
      setLoading(false);
    }
  };

  const userName = user?.name || user?.username || user?.email || "시스템 관리자";

  if (loading) {
    return (
      <div>
        <Header userName={userName} />
        <div className="super-admin-loading">
          <div className="admin-loading-spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header userName={userName} />
      <div className="super-admin-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">시스템 관리자 대시보드</h1>
          <p className="dashboard-subtitle">
            시스템 전반에 대한 운영 및 유지보수를 관리합니다.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>전체 사용자</h3>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaBook />
            </div>
            <div className="stat-content">
              <h3>전체 수업</h3>
              <p className="stat-number">{stats.totalSections}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaFileAlt />
            </div>
            <div className="stat-content">
              <h3>전체 과제</h3>
              <p className="stat-number">{stats.totalAssignments}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaCode />
            </div>
            <div className="stat-content">
              <h3>전체 문제</h3>
              <p className="stat-number">{stats.totalProblems}</p>
            </div>
          </div>
        </div>

        {/* 관리 메뉴 */}
        <div className="admin-menu-grid">
          <div 
            className="admin-menu-card"
            onClick={() => navigate('/super-admin/system-notices')}
          >
            <div className="menu-icon">
              <FaBullhorn />
            </div>
            <h3>시스템 전체 공지사항</h3>
            <p>모든 사용자에게 표시되는 공지사항 관리</p>
          </div>
          <div 
            className="admin-menu-card"
            onClick={() => navigate('/super-admin/system-guides')}
          >
            <div className="menu-icon">
              <FaBookOpen />
            </div>
            <h3>시스템 이용안내</h3>
            <p>시스템 사용 방법 및 가이드 관리</p>
          </div>
          <div 
            className="admin-menu-card"
            onClick={() => navigate('/super-admin/courses')}
          >
            <div className="menu-icon">
              <FaUniversity />
            </div>
            <h3>수업 관리</h3>
            <p>모든 수업 조회 및 관리</p>
          </div>
          <div 
            className="admin-menu-card"
            onClick={() => navigate('/super-admin/problems')}
          >
            <div className="menu-icon">
              <FaCode />
            </div>
            <h3>문제 관리</h3>
            <p>모든 문제 조회 및 관리</p>
          </div>
          <div 
            className="admin-menu-card"
            onClick={() => navigate('/super-admin/users')}
          >
            <div className="menu-icon">
              <FaUsers />
            </div>
            <h3>사용자 관리</h3>
            <p>모든 사용자 조회 및 역할 변경</p>
          </div>
          <div 
            className="admin-menu-card"
            onClick={() => navigate('/super-admin/submissions')}
          >
            <div className="menu-icon">
              <FaList />
            </div>
            <h3>제출 레코드 관리</h3>
            <p>모든 제출 내역 조회 및 관리</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

