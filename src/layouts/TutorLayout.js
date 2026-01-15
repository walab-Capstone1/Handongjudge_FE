import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import APIService from "../services/APIService";
import { 
  FaHome, 
  FaBook, 
  FaTasks, 
  FaBullhorn, 
  FaUsers, 
  FaCog,
  FaChevronDown,
  FaChevronRight,
  FaBars,
  FaTimes
} from "react-icons/fa";

import "./TutorLayout.css";

const TutorLayout = ({ children, selectedSection = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(selectedSection);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [filterYear, setFilterYear] = useState('ALL');
  const [filterSemester, setFilterSemester] = useState('ALL');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // URL에서 sectionId 추출
  const sectionIdFromUrl = params.sectionId || location.pathname.match(/\/section\/(\d+)/)?.[1];

  // 학기 표시 헬퍼 함수
  const getSemesterLabel = (semester) => {
    switch(semester) {
      case 'SPRING': return '1학기';
      case 'SUMMER': return '여름학기';
      case 'FALL': return '2학기';
      case 'WINTER': return '겨울학기';
      default: return '1학기';
    }
  };

  // 수업 목록 가져오기
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await APIService.getInstructorDashboard();
        const sectionsData = response?.data || [];
        setSections(sectionsData);
        
        // localStorage에서 마지막 선택 수업 불러오기
        const lastSelectedSectionId = localStorage.getItem('tutor_lastSelectedSectionId');
        
        // URL에서 sectionId가 있으면 해당 수업 찾기
        if (sectionIdFromUrl) {
          const found = sectionsData.find(s => s.sectionId === parseInt(sectionIdFromUrl));
          if (found) {
            setCurrentSection(found);
            localStorage.setItem('tutor_lastSelectedSectionId', found.sectionId.toString());
          }
        } else if (selectedSection) {
          setCurrentSection(selectedSection);
          localStorage.setItem('tutor_lastSelectedSectionId', selectedSection.sectionId.toString());
        } else if (lastSelectedSectionId) {
          // localStorage에 저장된 수업이 있으면 자동 선택
          const found = sectionsData.find(s => s.sectionId === parseInt(lastSelectedSectionId));
          if (found) {
            setCurrentSection(found);
            // URL 업데이트 (페이지 새로고침 시)
            if (!location.pathname.includes('/section/')) {
              navigate(`/tutor/assignments/section/${found.sectionId}`, { replace: true });
            }
          }
        }
      } catch (error) {
        console.error('수업 목록 조회 실패:', error);
      }
    };
    fetchSections();
  }, [sectionIdFromUrl, selectedSection, location.pathname, navigate]);

  // 수업 선택 핸들러
  const handleSectionSelect = (section) => {
    setCurrentSection(section);
    setShowSectionModal(false);
    localStorage.setItem('tutor_lastSelectedSectionId', section.sectionId.toString());
    navigate(`/tutor/assignments/section/${section.sectionId}`);
  };

  // 필터링된 수업 목록
  const filteredSections = sections.filter(section => {
    const yearMatch = filterYear === 'ALL' || section.year === parseInt(filterYear);
    const semesterMatch = filterSemester === 'ALL' || section.semester === filterSemester;
    return yearMatch && semesterMatch;
  });

  // 사용 가능한 년도 목록
  const availableYears = [...new Set(sections.map(s => s.year))].sort((a, b) => b - a);

  // 주요 기능 메뉴 (1순위: 대시보드 + 문제관리 통합)
  const mainMenuItems = [
    { 
      path: "/tutor", 
      label: "대시보드", 
      icon: FaHome,
      subItems: [] 
    },
    { 
      path: "/tutor/problems", 
      label: "문제 관리", 
      icon: FaBook,
      subItems: [
        { path: "/tutor/problems", label: "문제 등록 및 관리" },
        { path: "/tutor/problems/sets", label: "문제집 관리" },
      ]
    },
  ];

  // 시스템 설정 메뉴 (4순위: 최하단 고정)
  const settingsMenuItems = [
    { 
      path: "/tutor/settings", 
      label: "시스템 설정", 
      icon: FaCog,
      subItems: [] 
    },
  ];

  // 수업별 메뉴 (3순위: 수업 선택 시에만 표시)
  const sectionMenuItems = currentSection ? [
    { 
      path: `/tutor/assignments/section/${currentSection.sectionId}`, 
      label: "과제 관리",
      icon: FaTasks,
      subItems: [
        { path: `/tutor/assignments/section/${currentSection.sectionId}`, label: "과제 목록" },
        { path: `/tutor/assignments/section/${currentSection.sectionId}/progress`, label: "과제별 풀이 현황", subItems: [] },
      ]
    },
    { 
      path: `/tutor/notices/section/${currentSection.sectionId}`, 
      label: "공지사항 관리", 
      icon: FaBullhorn,
      subItems: [] 
    },
    { 
      path: `/tutor/users/section/${currentSection.sectionId}`, 
      label: "수강생 관리", 
      icon: FaUsers,
      subItems: [] 
    },
  ] : [];

  return (
    <div className="tutor-layout">
      <Navbar />
      <div className="tutor-container">
        <aside className={`tutor-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="sidebar-nav">
            <div className="sidebar-header">
              <h2 className="sidebar-title">{sidebarCollapsed ? '' : '관리 페이지'}</h2>
              <button 
                className="sidebar-toggle-btn"
                onClick={() => {
                  setSidebarCollapsed(!sidebarCollapsed);
                  if (!sidebarCollapsed) {
                    setExpandedMenus({});
                  }
                }}
                title={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
                aria-label={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
              >
                {sidebarCollapsed ? <FaBars /> : <FaTimes />}
              </button>
            </div>
              {/* 1순위: 주요 기능 섹션 (대시보드 + 문제관리) */}
              <div className="sidebar-section">
                <div className="sidebar-section-title">주요 기능</div>
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                                  location.pathname.startsWith(item.path + '/');
                  const isExpanded = expandedMenus[item.path] ?? (isActive && item.subItems.length > 0);
                  
                  return (
                    <div key={item.path} className="sidebar-menu-group">
                      <Link
                        to={item.path}
                        className={`sidebar-item ${isActive ? "active" : ""}`}
                        onClick={(e) => {
                          if (item.subItems.length > 0) {
                            e.preventDefault();
                            setExpandedMenus(prev => ({
                              ...prev,
                              [item.path]: !isExpanded
                            }));
                          }
                        }}
                        title={sidebarCollapsed ? item.label : undefined}
                        data-tooltip={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className="sidebar-icon" />
                        {!sidebarCollapsed && <span className="sidebar-label">{item.label}</span>}
                        {!sidebarCollapsed && item.subItems.length > 0 && (
                          <span className={`sidebar-arrow ${isExpanded ? 'expanded' : ''}`}>
                            <FaChevronDown />
                          </span>
                        )}
                      </Link>
                      {!sidebarCollapsed && item.subItems.length > 0 && (
                        <div className={`sidebar-submenu ${isExpanded ? 'expanded' : ''}`}>
                          <div>
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                className={`sidebar-item sidebar-sub-item ${
                                  location.pathname === subItem.path ? "active" : ""
                                }`}
                              >
                                <span className="sidebar-label">{subItem.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 구분선 */}
              <div className="sidebar-divider"></div>

              {/* 2순위: 수업 선택 카드 */}
              <div className="sidebar-section">
                <div className="sidebar-section-title">수업 선택</div>
                <div className="sidebar-section-card">
                  {currentSection ? (
                    <div className="section-card-content">
                      {!sidebarCollapsed && (
                        <>
                          <div className="section-card-header">
                            <h3 className="section-card-title">{currentSection.courseTitle}</h3>
                          </div>
                          <div className="section-card-meta">
                            <span className="section-card-badge">
                              {currentSection.year}년 {getSemesterLabel(currentSection.semester)}
                            </span>
                          </div>
                        </>
                      )}
                      <button 
                        className="section-change-btn"
                        onClick={() => setShowSectionModal(true)}
                        title={sidebarCollapsed ? '수업 변경' : ''}
                      >
                        {sidebarCollapsed ? <FaCog /> : '수업 변경'}
                      </button>
                    </div>
                  ) : (
                    <div className="section-card-content section-card-empty">
                      {!sidebarCollapsed && (
                        <div className="section-card-empty-text">수업을 선택해주세요</div>
                      )}
                      <button 
                        className="section-change-btn"
                        onClick={() => setShowSectionModal(true)}
                        title={sidebarCollapsed ? '수업 선택' : ''}
                      >
                        {sidebarCollapsed ? <FaCog /> : '수업 선택'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 3순위: 수업별 관리 메뉴 (수업 선택 시에만 표시) */}
              {currentSection && sectionMenuItems.length > 0 && (
                <>
                  {/* 구분선 */}
                  <div className="sidebar-divider"></div>
                  
                  <div className="sidebar-section sidebar-section-menu">
                    <div className="sidebar-section-title">수업 관리</div>
                    {sectionMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || 
                                      location.pathname.startsWith(item.path + '/');
                      const isExpanded = expandedMenus[item.path] ?? (isActive && item.subItems.length > 0);
                      
                      return (
                        <div key={item.path} className="sidebar-menu-group">
                          <Link
                            to={item.path}
                            className={`sidebar-item sidebar-section-item ${isActive ? "active" : ""}`}
                            onClick={(e) => {
                              if (item.subItems.length > 0) {
                                e.preventDefault();
                                setExpandedMenus(prev => ({
                                  ...prev,
                                  [item.path]: !isExpanded
                                }));
                              }
                            }}
                            title={sidebarCollapsed ? item.label : undefined}
                            data-tooltip={sidebarCollapsed ? item.label : undefined}
                          >
                            <Icon className="sidebar-icon" />
                            {!sidebarCollapsed && <span className="sidebar-label">{item.label}</span>}
                            {!sidebarCollapsed && item.subItems.length > 0 && (
                              <span className={`sidebar-arrow ${isExpanded ? 'expanded' : ''}`}>
                                <FaChevronDown />
                              </span>
                            )}
                          </Link>
                          {!sidebarCollapsed && item.subItems.length > 0 && (
                            <div className={`sidebar-submenu ${isExpanded ? 'expanded' : ''}`}>
                              <div>
                                {item.subItems.map((subItem) => (
                                  <Link
                                    key={subItem.path}
                                    to={subItem.path}
                                    className={`sidebar-item sidebar-sub-item ${
                                      location.pathname === subItem.path ? "active" : ""
                                    }`}
                                  >
                                    <span className="sidebar-label">{subItem.label}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* 구분선 */}
              <div className="sidebar-divider"></div>

              {/* 4순위: 시스템 설정 (최하단 고정) */}
              <div className="sidebar-section sidebar-settings-menu">
                <div className="sidebar-section-title">설정</div>
                {settingsMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                                  location.pathname.startsWith(item.path + '/');
                  
                  return (
                    <div key={item.path} className="sidebar-menu-group">
                      <Link
                        to={item.path}
                        className={`sidebar-item ${isActive ? "active" : ""}`}
                        title={sidebarCollapsed ? item.label : undefined}
                        data-tooltip={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className="sidebar-icon" />
                        {!sidebarCollapsed && <span className="sidebar-label">{item.label}</span>}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </nav>

          {/* 수업 선택 모달 */}
          {showSectionModal && (
            <div className="section-modal-overlay" onClick={() => setShowSectionModal(false)}>
              <div className="section-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="section-modal-header">
                  <h3>수업 선택</h3>
                  <button 
                    className="section-modal-close"
                    onClick={() => setShowSectionModal(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="section-modal-body">
                  <div className="section-modal-filters">
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="section-modal-filter-select"
                    >
                      <option value="ALL">모든 년도</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}년</option>
                      ))}
                    </select>
                    <select
                      value={filterSemester}
                      onChange={(e) => setFilterSemester(e.target.value)}
                      className="section-modal-filter-select"
                    >
                      <option value="ALL">모든 구분</option>
                      <option value="SPRING">1학기</option>
                      <option value="SUMMER">여름학기</option>
                      <option value="FALL">2학기</option>
                      <option value="WINTER">겨울학기</option>
                      <option value="CAMP">캠프</option>
                      <option value="SPECIAL">특강</option>
                      <option value="IRREGULAR">비정규 세션</option>
                    </select>
                  </div>
                  <div className="section-modal-list">
                    {filteredSections.length > 0 ? (
                      filteredSections.map((section) => {
                        const isSelected = currentSection?.sectionId === section.sectionId;
                        return (
                          <div
                            key={section.sectionId}
                            className={`section-modal-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSectionSelect(section)}
                          >
                            <div className="section-modal-item-content">
                              <div className="section-modal-item-title">{section.courseTitle}</div>
                              <div className="section-modal-item-subtitle">
                                {section.year}년 {getSemesterLabel(section.semester)}
                              </div>
                            </div>
                            {isSelected && (
                              <span className="section-modal-check">✓</span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="section-modal-empty">조건에 맞는 수업이 없습니다.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
        <main className="tutor-main">
          <Breadcrumb items={generateBreadcrumbs(location, sections, currentSection)} />
          <div className="tutor-content">{children}</div>
        </main>
      </div>
    </div>
  );
};

// Breadcrumb 생성 함수
const generateBreadcrumbs = (location, sections, currentSection) => {
  const pathnames = location.pathname.split('/').filter(x => x);
  let breadcrumbItems = [{ label: 'Home', path: '/' }];

  let currentPath = '';
  pathnames.forEach((name, index) => {
    currentPath += `/${name}`;
    let label = name;
    let path = currentPath;

    // 경로별 라벨 설정
    if (name === 'tutor') {
      label = '관리 페이지';
      path = '/tutor';
    } else if (name === 'problems') {
      label = '문제 관리';
    } else if (name === 'sets') {
      label = '문제집 관리';
    } else if (name === 'settings') {
      label = '시스템 설정';
    } else if (name === 'assignments' && pathnames[index - 1] === 'tutor') {
      label = '과제 관리';
    } else if (name === 'notices' && pathnames[index - 1] === 'tutor') {
      label = '공지사항 관리';
    } else if (name === 'users' && pathnames[index - 1] === 'tutor') {
      label = '수강생 관리';
    } else if (name === 'section' && pathnames[index + 1]) {
      const id = pathnames[index + 1];
      const section = sections.find(s => s.sectionId === parseInt(id));
      if (section) {
        label = `${section.courseTitle} ${section.sectionNumber}분반`;
        path = `/tutor/assignments/section/${id}`;
      } else {
        label = `Section ${id}`;
      }
    } else if (name === 'progress' && pathnames[index - 1] === 'assignments') {
      label = '풀이 현황';
    } else if (name === 'create') {
      label = '생성';
    } else if (name === 'edit' && pathnames[index - 1]) {
      label = '수정';
    }
    
    // 'section' 세그먼트 자체는 건너뛰기 (ID가 뒤에 오는 경우)
    if (name !== 'section' || !pathnames[index + 1] || isNaN(pathnames[index + 1])) {
      breadcrumbItems.push({ label, path });
    }
  });

  return breadcrumbItems;
};

export default TutorLayout;
