import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaComments } from "react-icons/fa";
import APIService from "../services/APIService";
import "./TutorNotificationPanel.css";

/**
 * TutorNotificationPanel - 튜터 페이지 전용 알림 패널 컴포넌트
 * 
 * 모든 튜터 페이지에서 사용할 수 있는 알림 패널입니다.
 * 드래그 가능하며, 사용자가 설정한 위치를 기억합니다.
 * 읽지 않은 알림이 있을 때 시각적 피드백을 제공합니다.
 */
const TutorNotificationPanel = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sections, setSections] = useState([]);
  
  // 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ right: null, bottom: null }); // px 단위, null이면 기본값
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 }); // 드래그 시작 위치
  const [hasDragged, setHasDragged] = useState(false); // 실제로 드래그했는지 여부
  const iconRef = useRef(null);
  const containerRef = useRef(null);

  // localStorage에서 위치 불러오기
  useEffect(() => {
    const savedPosition = localStorage.getItem('tutor_notification_position');
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        if (pos.right !== null && pos.bottom !== null) {
          setPosition(pos);
        }
      } catch (error) {
        console.error('위치 정보 불러오기 실패:', error);
      }
    }
  }, []);

  // 위치를 localStorage에 저장
  useEffect(() => {
    if (position.right !== null && position.bottom !== null) {
      localStorage.setItem('tutor_notification_position', JSON.stringify(position));
    }
  }, [position]);

  // 화면 크기 변경 시 위치 재조정
  useEffect(() => {
    const handleResize = () => {
      if (position.right !== null && position.bottom !== null) {
        // 현재 위치가 화면 밖으로 나갔는지 체크
        const iconSize = 56;
        const minMargin = 16;
        const maxRight = window.innerWidth - iconSize - minMargin;
        const maxBottom = window.innerHeight - iconSize - minMargin;
        
        if (position.right > maxRight || position.bottom > maxBottom) {
          // 위치를 화면 안으로 조정
          const adjusted = constrainPosition(
            window.innerWidth - position.right - iconSize,
            window.innerHeight - position.bottom - iconSize
          );
          setPosition(adjusted);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  // 수업 목록 가져오기 (알림의 수업 이름 표시용)
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const dashboardResponse = await APIService.getInstructorDashboard();
        const dashboardData = dashboardResponse?.data || [];
        setSections(dashboardData);
      } catch (error) {
        console.error('수업 목록 조회 실패:', error);
      }
    };
    fetchSections();
  }, []);

  // 경계 체크 및 자동 조정 함수
  const constrainPosition = (x, y) => {
    const iconSize = 56; // px
    const minMargin = 16; // px
    const maxX = window.innerWidth - iconSize - minMargin;
    const maxY = window.innerHeight - iconSize - minMargin;
    
    const constrainedX = Math.max(minMargin, Math.min(x, maxX));
    const constrainedY = Math.max(minMargin, Math.min(y, maxY));
    
    return {
      right: window.innerWidth - constrainedX - iconSize,
      bottom: window.innerHeight - constrainedY - iconSize
    };
  };

  // 드래그 시작
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // 왼쪽 버튼만
    if (e.target.closest('.tutor-alarm-badge')) return; // 배지 클릭은 무시
    
    // 드래그 시작 위치 저장
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setHasDragged(false);
    
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - (rect.left + rect.width / 2),
        y: e.clientY - (rect.top + rect.height / 2)
      });
    }
    // preventDefault는 호출하지 않음 (클릭 이벤트가 정상 작동하도록)
  };

  // 드래그 중
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      // 이동 거리 계산
      const deltaX = Math.abs(e.clientX - dragStartPos.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // 5px 이상 이동했을 때만 드래그로 간주
      if (distance > 5) {
        if (!hasDragged) {
          setHasDragged(true);
          e.preventDefault(); // 드래그 시작 시에만 preventDefault
        }
        
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        const constrained = constrainPosition(newX, newY);
        setPosition(constrained);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setHasDragged(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, dragStartPos, hasDragged]);

  // 아이콘 클릭 (드래그가 아닐 때만)
  const handleIconClick = (e) => {
    // 실제로 드래그하지 않았을 때만 클릭으로 처리
    if (!hasDragged) {
      setShowNotificationPanel(!showNotificationPanel);
    }
  };

  // 알림 조회
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      // 모든 수업의 알림 조회 (sectionId 없이)
      const notificationsResponse = await APIService.getCommunityNotifications(null, 0, 20);
      const notificationsList = notificationsResponse.data?.content || [];
      
      // 알림 데이터 변환
      const processedNotifications = notificationsList.map(notif => {
        let title = '';
        let link = '';
        let sectionTitle = '';
        
        switch (notif.type) {
          case 'NOTICE_CREATED':
            title = notif.noticeTitle || '공지사항';
            link = notif.sectionId && notif.noticeId ? `/sections/${notif.sectionId}/course-notices/${notif.noticeId}` : null;
            break;
          case 'ASSIGNMENT_CREATED':
            title = notif.assignmentTitle || '새 과제';
            link = notif.sectionId && notif.assignmentId ? `/sections/${notif.sectionId}/course-assignments?assignmentId=${notif.assignmentId}` : null;
            break;
          case 'QUESTION_COMMENT':
            title = notif.message || '커뮤니티에 새 댓글이 달렸습니다';
            link = notif.sectionId && notif.questionId ? `/sections/${notif.sectionId}/community/${notif.questionId}` : null;
            break;
          case 'COMMENT_ACCEPTED':
            title = notif.message || '댓글이 채택되었습니다';
            link = notif.sectionId && notif.questionId ? `/sections/${notif.sectionId}/community/${notif.questionId}` : null;
            break;
          default:
            title = notif.message || '알림';
            link = notif.sectionId ? `/sections/${notif.sectionId}/community` : null;
        }
        
        // API에서 직접 courseTitle을 가져오거나, 없으면 sections에서 찾기
        if (notif.courseTitle) {
          sectionTitle = notif.courseTitle;
        } else {
          const section = sections.find(s => s.sectionId === notif.sectionId);
          if (section) {
            sectionTitle = section.courseTitle;
          }
        }
        
        return {
          ...notif,
          displayTitle: title,
          displayLink: link,
          sectionTitle: sectionTitle || '알 수 없는 수업',
          createdAt: notif.createdAt
        };
      });
      
      setNotifications(processedNotifications);
      // 읽지 않은 알림 개수 계산
      const unread = processedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('알림 조회 실패:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // 초기 알림 로드
  useEffect(() => {
    fetchNotifications();
  }, []);

  // 수업 목록이 업데이트되면 알림 다시 조회
  useEffect(() => {
    if (sections.length > 0) {
      fetchNotifications();
    }
  }, [sections]);

  // 알림 아이템 클릭 핸들러
  const handleNotificationClick = (notif, e) => {
    e.stopPropagation();
    let targetPath = null;
    
    // 알림 타입에 따라 정확한 경로로 리다이렉트
    switch (notif.type) {
      case 'NOTICE_CREATED':
        if (notif.sectionId && notif.noticeId) {
          targetPath = `/sections/${notif.sectionId}/course-notices/${notif.noticeId}`;
        } else if (notif.sectionId) {
          targetPath = `/sections/${notif.sectionId}/course-notices`;
        }
        break;
      case 'ASSIGNMENT_CREATED':
        if (notif.sectionId && notif.assignmentId) {
          targetPath = `/sections/${notif.sectionId}/course-assignments?assignmentId=${notif.assignmentId}`;
        } else if (notif.sectionId) {
          targetPath = `/sections/${notif.sectionId}/course-assignments`;
        }
        break;
      case 'QUESTION_COMMENT':
      case 'COMMENT_ACCEPTED':
      case 'COMMENT_REPLY':
        if (notif.sectionId && notif.questionId) {
          targetPath = `/sections/${notif.sectionId}/community/${notif.questionId}`;
        } else if (notif.sectionId) {
          targetPath = `/sections/${notif.sectionId}/community`;
        }
        break;
      default:
        if (notif.displayLink) {
          targetPath = notif.displayLink;
        } else if (notif.sectionId) {
          targetPath = `/sections/${notif.sectionId}/community`;
        }
    }
    
    if (targetPath) {
      navigate(targetPath);
      setShowNotificationPanel(false);
    }
  };

  // 기본 위치 및 현재 위치 계산
  const getDefaultPosition = () => {
    if (typeof window === 'undefined') return { right: 32, bottom: 32 };
    return {
      right: window.innerWidth - 56 - 32, // 아이콘 크기 + 여백
      bottom: 32
    };
  };

  const defaultPos = getDefaultPosition();
  const currentRight = position.right !== null ? position.right : defaultPos.right;
  const currentBottom = position.bottom !== null ? position.bottom : defaultPos.bottom;

  // 패널 위치 계산 (아이콘 위에 표시, 화면 밖으로 나가지 않도록)
  const getPanelPosition = () => {
    if (typeof window === 'undefined') return { right: 32, bottom: 100 };
    
    const panelHeight = 400; // 대략적인 패널 높이
    const panelWidth = 420;
    let panelRight = currentRight;
    let panelBottom = currentBottom + 56 + 16; // 아이콘 높이 + 여백
    
    // 패널이 화면 밖으로 나가는지 체크
    if (panelBottom + panelHeight > window.innerHeight) {
      // 패널을 아이콘 아래에 표시
      panelBottom = currentBottom - panelHeight - 16;
      if (panelBottom < 0) {
        panelBottom = 16;
      }
    }
    
    // 패널이 오른쪽으로 나가는지 체크
    if (panelRight + panelWidth > window.innerWidth) {
      panelRight = window.innerWidth - panelWidth - 16;
    }
    
    // 패널이 왼쪽으로 나가는지 체크
    if (panelRight < 0) {
      panelRight = 16;
    }
    
    return { right: panelRight, bottom: panelBottom };
  };

  const panelPosition = getPanelPosition();

  return (
    <div 
      ref={containerRef}
      className="tutor-alarm-container"
      style={{
        right: `${currentRight}px`,
        bottom: `${currentBottom}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <button 
        ref={iconRef}
        className={`tutor-alarm-icon-btn ${unreadCount > 0 ? 'tutor-alarm-has-unread' : ''} ${isDragging && hasDragged ? 'tutor-alarm-dragging' : ''}`}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMouseDown(e);
        }}
        onClick={handleIconClick}
        title="수업 알림 (드래그하여 이동)"
        style={{
          cursor: isDragging && hasDragged ? 'grabbing' : 'grab'
        }}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="tutor-alarm-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {showNotificationPanel && (
        <>
          <div 
            className="tutor-alarm-overlay"
            onClick={() => setShowNotificationPanel(false)}
          ></div>
          <div 
            className="tutor-alarm-panel"
            style={{
              right: `${panelPosition.right}px`,
              bottom: `${panelPosition.bottom}px`
            }}
          >
            <div className="tutor-alarm-panel-header">
              <h2 className="tutor-alarm-panel-title">
                <FaBell className="tutor-alarm-title-icon" />
                교수 수업 알림
              </h2>
              <button 
                className="tutor-alarm-close-btn"
                onClick={() => setShowNotificationPanel(false)}
              >
                ×
              </button>
            </div>
            <div className="tutor-alarm-panel-body">
              {loadingNotifications ? (
                <div className="tutor-alarm-loading">
                  <div className="tutor-alarm-loading-spinner"></div>
                  <p>알림을 불러오는 중...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="tutor-alarm-list">
                  {notifications.map((notif, index) => (
                    <div
                      key={notif.id || index}
                      className={`tutor-alarm-item ${!notif.isRead ? 'tutor-alarm-unread' : ''}`}
                      onClick={(e) => handleNotificationClick(notif, e)}
                    >
                      <div className="tutor-alarm-icon">
                        {notif.type === 'QUESTION_COMMENT' || notif.type === 'COMMENT_ACCEPTED' ? (
                          <FaComments />
                        ) : (
                          <FaBell />
                        )}
                      </div>
                      <div className="tutor-alarm-content">
                        <div className="tutor-alarm-title">{notif.displayTitle}</div>
                        <div className="tutor-alarm-meta">
                          <span className="tutor-alarm-section">{notif.sectionTitle}</span>
                          <span className="tutor-alarm-time">
                            {new Date(notif.createdAt).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tutor-alarm-empty">
                  <p>알림이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TutorNotificationPanel;

