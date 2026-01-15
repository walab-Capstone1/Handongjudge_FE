import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
import Header from "../../components/Header";
import "../AdminPage/UserManagement.css";

const SuperAdminUserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  const userName = user?.name || user?.username || user?.email || "시스템 관리자";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await APIService.getAllUsersForSuperAdmin();
      console.log('사용자 목록 API 응답:', response);
      
      // 응답 구조 확인: response.data.data 또는 response.data
      const usersData = response?.data?.data || response?.data || response;
      
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        console.warn('사용자 데이터가 배열이 아닙니다:', usersData);
        setUsers([]);
      }
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return '시스템 관리자';
      case 'ADMIN': return '교수';
      case 'USER': return '학생';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return '#e17055';
      case 'ADMIN': return '#667eea';
      case 'USER': return '#00b894';
      default: return '#636e72';
    }
  };

  if (loading) {
    return (
      <div>
        <Header userName={userName} />
        <div className="admin-loading-container">
          <div className="admin-loading-spinner"></div>
          <p>사용자 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header userName={userName} />
      <div className="user-management" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="admin-page-header">
          <div className="admin-header-left">
            <h1 className="admin-page-title">사용자 관리 (시스템 관리자)</h1>
            <div className="admin-search-box">
              <input
                type="text"
                placeholder="이름, 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>
          <div className="admin-header-right">
            <button 
              className="admin-btn-primary"
              onClick={() => navigate('/super-admin')}
              style={{ marginRight: '10px' }}
            >
              대시보드로
            </button>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="section-filter"
            >
              <option value="ALL">모든 역할</option>
              <option value="SUPER_ADMIN">시스템 관리자</option>
              <option value="ADMIN">교수</option>
              <option value="USER">학생</option>
            </select>
          </div>
        </div>

        <div className="admin-users-table-container">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>역할</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((userItem) => (
                <tr key={userItem.id || userItem.userId}>
                  <td className="user-name">
                    <div className="user-avatar">
                      {userItem.name?.charAt(0) || 'U'}
                    </div>
                    {userItem.name || '이름 없음'}
                  </td>
                  <td>{userItem.email || '-'}</td>
                  <td>
                    <span 
                      className="section-badge"
                      style={{ backgroundColor: getRoleColor(userItem.role) }}
                    >
                      {getRoleLabel(userItem.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${userItem.active !== false ? 'ACTIVE' : 'INACTIVE'}`}>
                      {userItem.active !== false ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-action-buttons">
                      <button 
                        className="admin-btn-detail-view"
                        onClick={() => {
                          // TODO: 사용자 상세보기 또는 수정 기능
                          alert('사용자 수정 기능은 추후 구현 예정입니다.');
                        }}
                      >
                        수정
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="admin-no-data">
                    <div className="admin-no-data-message">
                      <span className="admin-no-data-icon"></span>
                      <div>
                        {users.length === 0 ? (
                          <>
                            <p><strong>등록된 사용자가 없습니다</strong></p>
                          </>
                        ) : (
                          <>
                            <p><strong>검색 조건에 맞는 사용자가 없습니다</strong></p>
                            <p>다른 검색어나 필터 조건을 사용해보세요.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminUserManagement;

