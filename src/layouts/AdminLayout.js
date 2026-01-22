import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import APIService from "../services/APIService";

import "./AdminLayout.css";

const AdminLayout = ({ children, selectedSection = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(selectedSection);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
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
        
        // URL에서 sectionId가 있으면 해당 수업 찾기
        if (sectionIdFromUrl) {
          const found = sectionsData.find(s => s.sectionId === parseInt(sectionIdFromUrl));
          if (found) {
            setCurrentSection(found);
            setShowSectionMenu(true);
          }
        } else if (selectedSection) {
          setCurrentSection(selectedSection);
          setShowSectionMenu(true);
        }
      } catch (error) {
        console.error('수업 목록 조회 실패:', error);
      }
    };
    fetchSections();
  }, [sectionIdFromUrl, selectedSection]);

  // 수업 선택 핸들러
  const handleSectionSelect = (section, e) => {
    e.stopPropagation();
    const isCurrentlyExpanded = expandedSections[section.sectionId];
    setCurrentSection(section);
    setShowSectionMenu(true);
    // 다른 수업들의 드롭다운 닫기
    setExpandedSections({
      [section.sectionId]: !isCurrentlyExpanded
    });
    navigate(`/tutor/assignments/section/${section.sectionId}`);
  };

  // 수업 펼치기/접기 핸들러 (화살표 클릭 시)
  const handleSectionToggle = (sectionId, e) => {
    e.stopPropagation();
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // 필터링된 수업 목록
  const filteredSections = sections.filter(section => {
    const yearMatch = filterYear === 'ALL' || section.year === parseInt(filterYear);
    const semesterMatch = filterSemester === 'ALL' || section.semester === filterSemester;
    return yearMatch && semesterMatch;
  });

  // 사용 가능한 년도 목록
  const availableYears = [...new Set(sections.map(s => s.year))].sort((a, b) => b - a);

  // 전역 메뉴 (항상 표시)
  const globalMenuItems = [
    { path: "/tutor", label: "대시보드", subItems: [] },
    { 
      path: "/tutor/problems", 
      label: "문제 관리", 
      subItems: [
        { path: "/tutor/problems", label: "문제 등록 및 관리" },
        { path: "/tutor/problems/sets", label: "문제집 관리" },
      ]
    },
    { path: "/tutor/settings", label: "시스템 설정", subItems: [] },
  ];

  // 수업별 메뉴 (수업 선택 시 표시)
  const sectionMenuItems = currentSection ? [
    { 
      path: `/tutor/assignments/section/${currentSection.sectionId}`, 
      label: "과제 관리",
      subItems: [
        { path: `/tutor/assignments/section/${currentSection.sectionId}`, label: "과제 목록" },
        { path: `/tutor/assignments/section/${currentSection.sectionId}/progress`, label: "과제별 풀이 현황", subItems: [] },
      ]
    },
    { path: `/tutor/notices/section/${currentSection.sectionId}`, label: "공지사항 관리", subItems: [] },
    { path: `/tutor/users/section/${currentSection.sectionId}`, label: "수강생 관리", subItems: [] },
  ] : [];

  return (
    <div className="admin-layout">
      <Navbar />
      <div className="admin-container">
        <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <h2 className="sidebar-title">{sidebarCollapsed ? '' : '관리 페이지'}</h2>
            <button 
              className="sidebar-toggle-btn"
              onClick={() => {
                setSidebarCollapsed(!sidebarCollapsed);
                // 사이드바 접을 때 모든 드롭다운 닫기
                if (!sidebarCollapsed) {
                  setShowSectionMenu(false);
                  setExpandedMenus({});
                  setExpandedSections({});
                }
              }}
              title={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            >
              {sidebarCollapsed ? '▶' : '◀'}
            </button>
          </div>
          
          <nav className="sidebar-nav">
            {/* 전역 메뉴 */}
            {globalMenuItems.map((item) => {
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
                  >
                    <span className="sidebar-label">{item.label}</span>
                    {item.subItems.length > 0 && (
                      <span className={`sidebar-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
                    )}
                  </Link>
                  {item.subItems.length > 0 && (
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

            {/* 구분선 */}
            <div className="sidebar-divider"></div>

            {/* 수업 선택 영역 */}
            <div className="sidebar-section-selector">
              <div 
                className="sidebar-section-header"
                onClick={() => setShowSectionMenu(!showSectionMenu)}
              >
                <span className="sidebar-label">수업 선택</span>
                <span className={`sidebar-arrow ${showSectionMenu ? 'expanded' : ''}`}>▼</span>
              </div>
              
              {showSectionMenu && sections.length > 0 && (
                <div className="sidebar-section-filters">
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="sidebar-filter-select"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="ALL">모든 년도</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}년</option>
                    ))}
                  </select>
                  <select
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value)}
                    className="sidebar-filter-select"
                    onClick={(e) => e.stopPropagation()}
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
              )}
              
              {sections.length > 0 && (
                <div className={`sidebar-section-list ${showSectionMenu ? 'expanded' : ''}`}>
                  <div>
                    {filteredSections.map((section) => {
                    const isSelected = currentSection?.sectionId === section.sectionId;
                    const isExpanded = expandedSections[section.sectionId] ?? false;
                    return (
                      <div key={section.sectionId}>
                        <div
                          className={`sidebar-section-item ${isSelected ? 'active' : ''}`}
                          onClick={(e) => handleSectionSelect(section, e)}
                        >
                          <div className="section-item-content">
                            <div className="section-item-title">
                              {section.courseTitle}
                            </div>
                            <div className="section-item-subtitle">
                              {section.sectionNumber}분반 · {section.year}년 {getSemesterLabel(section.semester)}
                            </div>
                          </div>
                          {isSelected && (
                            <span 
                              className={`sidebar-arrow ${isExpanded ? 'expanded' : ''}`}
                              onClick={(e) => handleSectionToggle(section.sectionId, e)}
                            >
                              ▼
                            </span>
                          )}
                        </div>
                        
                        {/* 선택된 수업의 메뉴를 바로 아래에 표시 */}
                        {isSelected && (
                          <div className={`sidebar-section-submenu ${isExpanded ? 'expanded' : ''}`}>
                            <div>
                              {sectionMenuItems.map((item) => {
                              const isActive = location.pathname === item.path || 
                                              location.pathname.startsWith(item.path + '/');
                              const isExpanded = expandedMenus[item.path] ?? (isActive && item.subItems.length > 0);
                              
                              return (
                                <div key={item.path} className="sidebar-menu-group">
                                  <Link
                                    to={item.path}
                                    className={`sidebar-item sidebar-sub-item ${isActive ? "active" : ""}`}
                                    onClick={(e) => {
                                      if (item.subItems.length > 0) {
                                        e.preventDefault();
                                        setExpandedMenus(prev => ({
                                          ...prev,
                                          [item.path]: !isExpanded
                                        }));
                                      }
                                    }}
              >
                <span className="sidebar-label">{item.label}</span>
                                    {item.subItems.length > 0 && (
                                      <span className={`sidebar-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
                                    )}
                                  </Link>
                                  {item.subItems.length > 0 && (
                                    <div className={`sidebar-submenu sidebar-submenu-nested ${isExpanded ? 'expanded' : ''}`}>
                                      <div>
                                        {item.subItems.map((subItem) => (
                                          <Link
                                            key={subItem.path}
                                            to={subItem.path}
                                            className={`sidebar-item sidebar-sub-item-nested ${
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
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </aside>
        <main className="admin-main">
          <Breadcrumb items={generateBreadcrumbs(location, sections, currentSection)} />
          <div className="admin-content">{children}</div>
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

export default AdminLayout;
