import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import APIService from "../../services/APIService";
import "./SystemNoticeManagement.css";

const SystemNoticeManagement = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 0
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await APIService.getAllSystemNotices();
      setNotices(Array.isArray(response) ? response : []);
      setLoading(false);
    } catch (error) {
      console.error('시스템 공지사항 조회 실패:', error);
      setNotices([]);
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNotice(null);
    setFormData({ title: '', content: '', priority: 0 });
    setShowModal(true);
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      priority: notice.priority || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (noticeId) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      try {
        await APIService.deleteSystemNotice(noticeId);
        fetchNotices();
        alert('공지사항이 삭제되었습니다.');
      } catch (error) {
        console.error('공지사항 삭제 실패:', error);
        alert('공지사항 삭제에 실패했습니다.');
      }
    }
  };

  const handleToggleActive = async (noticeId, currentActive) => {
    try {
      const newActive = !currentActive;
      await APIService.toggleSystemNoticeActive(noticeId, newActive);
      fetchNotices();
    } catch (error) {
      console.error('공지사항 활성화 상태 변경 실패:', error);
      alert('공지사항 활성화 상태 변경에 실패했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      if (editingNotice) {
        await APIService.updateSystemNotice(editingNotice.id, formData);
        alert('공지사항이 수정되었습니다.');
      } else {
        await APIService.createSystemNotice(formData);
        alert('공지사항이 생성되었습니다.');
      }
      
      setShowModal(false);
      setEditingNotice(null);
      setFormData({ title: '', content: '', priority: 0 });
      fetchNotices();
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      alert('공지사항 저장에 실패했습니다.');
    }
  };

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
      <div className="system-notice-management">
        <div className="page-header">
          <div>
            <button onClick={() => navigate('/super-admin')} className="back-button">
              ← 뒤로가기
            </button>
            <h1>시스템 전체 공지사항 관리</h1>
          </div>
          <button onClick={handleCreate} className="create-button">
            + 새 공지사항 만들기
          </button>
        </div>

        <div className="notices-list">
          {notices.length === 0 ? (
            <div className="empty-state">
              <p>등록된 공지사항이 없습니다.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <div key={notice.id} className={`notice-card ${!notice.active ? 'inactive' : ''}`}>
                <div className="notice-header">
                  <div>
                    <h3>{notice.title}</h3>
                    <div className="notice-meta">
                      <span>우선순위: {notice.priority}</span>
                      <span>작성자: {notice.createdByName || '시스템 관리자'}</span>
                      <span>{new Date(notice.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                  <div className="notice-actions">
                    <button
                      className={`toggle-button ${notice.active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(notice.id, notice.active)}
                    >
                      {notice.active ? '활성' : '비활성'}
                    </button>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(notice)}
                    >
                      수정
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(notice.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="notice-content">
                  {notice.content}
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
                <h2>{editingNotice ? '공지사항 수정' : '새 공지사항 만들기'}</h2>
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

export default SystemNoticeManagement;

