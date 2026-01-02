import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
import "./ProblemManagement.css";

const ProblemManagement = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await APIService.getAllProblems();
      const problemsData = response?.data || response || [];
      setProblems(problemsData);
    } catch (error) {
      console.error('문제 목록 조회 실패:', error);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'ALL' || problem.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading-container">
          <div className="admin-loading-spinner"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="problem-management">
        <div className="admin-page-header">
          <h1 className="admin-page-title">문제 관리</h1>
          <div className="admin-header-actions">
            <button 
              className="admin-btn-primary"
              onClick={() => navigate('/admin/problems/create')}
            >
              새 문제 만들기
            </button>
          </div>
        </div>

        <div className="admin-filters-section">
          <div className="admin-search-box">
            <input
              type="text"
              placeholder="문제명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="admin-filter-select"
          >
            <option value="ALL">모든 난이도</option>
            <option value="Level 1">Level 1</option>
            <option value="Level 2">Level 2</option>
            <option value="Level 3">Level 3</option>
          </select>
        </div>

        <div className="admin-problems-grid">
          {filteredProblems.length > 0 ? (
            filteredProblems.map((problem) => (
              <div key={problem.id} className="admin-problem-card">
                <div className="admin-problem-card-header">
                  <h3 className="admin-problem-card-title">{problem.title}</h3>
                </div>
                <div className="admin-problem-card-body">
                  <div className="admin-problem-meta">
                    <span className="admin-problem-level">{problem.level || "Level 1"}</span>
                    {problem.timeLimit && (
                      <span className="admin-problem-limit">시간: {problem.timeLimit}초</span>
                    )}
                    {problem.memoryLimit && (
                      <span className="admin-problem-limit">메모리: {problem.memoryLimit}MB</span>
                    )}
                  </div>
                </div>
                <div className="admin-problem-card-actions">
                  <button 
                    className="admin-btn-secondary"
                    onClick={() => navigate(`/admin/problems/${problem.id}/edit`)}
                  >
                    수정
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="admin-empty-state">
              <p>등록된 문제가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProblemManagement;

