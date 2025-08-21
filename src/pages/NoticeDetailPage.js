import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import APIService from "../services/APIService";
import "./NoticeDetailPage.css";

const NoticeDetailPage = () => {
  const { sectionId, noticeId } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNoticeDetail();
  }, [sectionId, noticeId]);

  const fetchNoticeDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // 병렬로 공지사항 상세 정보와 섹션 정보를 가져옴
      const [noticesResponse, sectionResponse] = await Promise.all([
        APIService.getSectionNotices(sectionId),
        APIService.getSectionInfo(sectionId)
      ]);

      const notices = noticesResponse.data || noticesResponse;
      const targetNotice = notices.find(n => n.id === parseInt(noticeId));
      
      if (!targetNotice) {
        setError("공지사항을 찾을 수 없습니다.");
        return;
      }

      setNotice(targetNotice);
      setSectionInfo(sectionResponse.data || sectionResponse);

      // 공지사항 읽음 처리
      if (targetNotice.isNew) {
        try {
          await APIService.markNoticeAsRead(targetNotice.id);
          setNotice(prev => ({ ...prev, isNew: false }));
        } catch (readError) {
          console.error("공지사항 읽음 처리 실패:", readError);
        }
      }

    } catch (err) {
      console.error("공지사항 상세 조회 실패:", err);
      setError("공지사항을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGoBack = () => {
    navigate(`/sections/${sectionId}?tab=notices`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="notice-detail-page">
          <div className="loading-container">
            <LoadingSpinner />
            <p>공지사항을 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !notice) {
    return (
      <MainLayout>
        <div className="notice-detail-page">
          <div className="error-container">
            <h3>오류가 발생했습니다</h3>
            <p>{error}</p>
            <button onClick={handleGoBack} className="btn-secondary">
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="notice-detail-page">
        <div className="notice-detail-header">
          <button onClick={handleGoBack} className="back-button">
            <span className="back-icon">←</span>
            목록으로
          </button>
          <div className="breadcrumb">
            <span className="breadcrumb-item">{sectionInfo?.courseTitle}</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item">{sectionInfo?.sectionNumber}분반</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item current">공지사항</span>
          </div>
        </div>

        <div className="notice-content-container">
          <div className="notice-meta-info">
            <div className="notice-status">
              {notice.isNew && <span className="new-badge">NEW</span>}
            </div>
            <div className="notice-date">
              {formatDate(notice.createdAt)}
            </div>
          </div>

          <h1 className="notice-title">{notice.title}</h1>

          <div className="notice-content">
            {notice.content}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NoticeDetailPage;

