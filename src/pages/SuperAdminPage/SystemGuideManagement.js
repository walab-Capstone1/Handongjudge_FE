import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import APIService from "../../services/APIService";
import "./SystemGuideManagement.css";

const SystemGuideManagement = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    priority: 0
  });

  useEffect(() => {
    fetchGuides();
    fetchCategories();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await APIService.getAllSystemGuides();
      setGuides(Array.isArray(response) ? response : []);
      setLoading(false);
    } catch (error) {
      console.error('시스템 이용안내 조회 실패:', error);
      setGuides([]);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await APIService.getSystemGuideCategories();
      setCategories(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
    }
  };

  const handleCreate = () => {
    setEditingGuide(null);
    setFormData({ title: '', content: '', category: '', priority: 0 });
    setShowModal(true);
  };

  const handleEdit = (guide) => {
    setEditingGuide(guide);
    setFormData({
      title: guide.title,
      content: guide.content,
      category: guide.category || '',
      priority: guide.priority || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (guideId) => {
    if (window.confirm('정말로 이 이용안내를 삭제하시겠습니까?')) {
      try {
        await APIService.deleteSystemGuide(guideId);
        fetchGuides();
        alert('이용안내가 삭제되었습니다.');
      } catch (error) {
        console.error('이용안내 삭제 실패:', error);
        alert('이용안내 삭제에 실패했습니다.');
      }
    }
  };

  const handleToggleActive = async (guideId, currentActive) => {
    try {
      const newActive = !currentActive;
      await APIService.toggleSystemGuideActive(guideId, newActive);
      fetchGuides();
    } catch (error) {
      console.error('이용안내 활성화 상태 변경 실패:', error);
      alert('이용안내 활성화 상태 변경에 실패했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      if (editingGuide) {
        await APIService.updateSystemGuide(editingGuide.id, formData);
        alert('이용안내가 수정되었습니다.');
      } else {
        await APIService.createSystemGuide(formData);
        alert('이용안내가 생성되었습니다.');
      }
      
      setShowModal(false);
      setEditingGuide(null);
      setFormData({ title: '', content: '', category: '', priority: 0 });
      fetchGuides();
      fetchCategories();
    } catch (error) {
      console.error('이용안내 저장 실패:', error);
      alert('이용안내 저장에 실패했습니다.');
    }
  };

  const filteredGuides = selectedCategory === 'ALL' 
    ? guides 
    : guides.filter(guide => guide.category === selectedCategory);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="super-admin-loading">
          <div className="admin-loading-spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="system-guide-management">
        <div className="page-header">
          <div>
            <button onClick={() => navigate('/super-admin')} className="back-button">
              ← 뒤로가기
            </button>
            <h1>시스템 이용안내 관리</h1>
          </div>
          <button onClick={handleCreate} className="create-button">
            + 새 이용안내 만들기
          </button>
        </div>

        {/* 카테고리 필터 */}
        <div className="category-filter">
          <label>카테고리:</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">전체</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="guides-list">
          {filteredGuides.length === 0 ? (
            <div className="empty-state">
              <p>등록된 이용안내가 없습니다.</p>
            </div>
          ) : (
            filteredGuides.map((guide) => (
              <div key={guide.id} className={`guide-card ${!guide.active ? 'inactive' : ''}`}>
                <div className="guide-header">
                  <div>
                    <h3>{guide.title}</h3>
                    <div className="guide-meta">
                      {guide.category && <span className="category-badge">{guide.category}</span>}
                      <span>우선순위: {guide.priority}</span>
                      <span>작성자: {guide.createdByName || '시스템 관리자'}</span>
                      <span>{new Date(guide.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                  <div className="guide-actions">
                    <button
                      className={`toggle-button ${guide.active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(guide.id, guide.active)}
                    >
                      {guide.active ? '활성' : '비활성'}
                    </button>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(guide)}
                    >
                      수정
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(guide.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="guide-content">
                  {guide.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 생성/수정 모달 */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingGuide ? '이용안내 수정' : '새 이용안내 만들기'}</h2>
                <button onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                  <label>제목 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>내용 *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows="10"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>카테고리</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="예: 사용법, FAQ, 업데이트"
                  />
                </div>
                <div className="form-group">
                  <label>우선순위</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                  <small>숫자가 클수록 우선순위가 높습니다.</small>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)}>취소</button>
                  <button type="submit">저장</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemGuideManagement;

