import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import APIService from "../services/APIService";
import "./ClassPage.css";

const ClassPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [enrolledSections, setEnrolledSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all, in-progress, completed
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent, name
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  
  // useAuth에서 사용자 정보 가져오기
  const userName = user?.name || user?.username || user?.email || "사용자 이름";

  useEffect(() => {
    const fetchEnrolledSections = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await APIService.getUserEnrolledSections();
        console.log('수강 중인 코스 응답:', response);
        setEnrolledSections(response.data || response);
      } catch (err) {
        console.error('수강 중인 section 조회 실패:', err);
        setError(err.message || '수강 중인 강의를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledSections();
  }, [isAuthenticated]);

  // 상태 업데이트 콜백
  const handleStatusUpdate = async () => {
    try {
      const response = await APIService.getUserEnrolledSections();
      setEnrolledSections(response.data || response);
    } catch (err) {
      console.error('대시보드 새로고침 실패:', err);
    }
  };

  // API 응답 데이터를 CourseCard 컴포넌트에 맞는 형태로 변환
  const transformSectionData = (section) => {
    return {
      id: section.sectionId,
      title: section.courseTitle,
      subtitle: `강의 ID: ${section.courseId}`,
      batch: `${section.sectionNumber}분반`,
      courseName: `[${section.courseTitle}] ${section.sectionNumber}분반`,
      status: generateStatus(section),
      instructor: section.instructorName,
      color: getRandomColor(section.sectionId),
      sectionId: section.sectionId,
      courseId: section.courseId,
      active: section.active,
      createdAt: section.createdAt || new Date().toISOString()
    };
  };

  // section 데이터를 기반으로 상태 정보 생성
  const generateStatus = (section) => {
    const status = [];
    
    if (section.newNoticeCount > 0) {
      status.push({ type: "announcement", text: `새로운 공지`, color: "green" });
    }
    
    if (section.newAssignmentCount > 0) {
      status.push({ type: "assignment", text: `새로운 과제`, color: "blue" });
    }
    
    return status;
  };

  // section ID를 기반으로 일관된 색상 생성
  const getRandomColor = (id) => {
    const colors = ['purple', 'orange', 'red', 'blue', 'green'];
    return colors[id % colors.length];
  };

  // 탭별 필터링
  const getFilteredSections = () => {
    let filtered = enrolledSections.map(transformSectionData);

    // 탭 필터링
    if (activeTab === "in-progress") {
      filtered = filtered.filter(section => section.active !== false);
    } else if (activeTab === "completed") {
      filtered = filtered.filter(section => section.active === false);
    }

    // 검색 필터링
    if (searchTerm) {
      filtered = filtered.filter(section =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 정렬
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  };

  // 통계 계산
  const getStats = () => {
    const all = enrolledSections.length;
    const inProgress = enrolledSections.filter(s => s.active !== false).length;
    const completed = enrolledSections.filter(s => s.active === false).length;
    return { all, inProgress, completed };
  };

  const extractEnrollmentCode = (input) => {
    const trimmed = input.trim();
    const urlPattern = /\/enroll\/([^\/\s?#]+)/;
    const urlMatch = trimmed.match(urlPattern);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    try {
      const url = new URL(trimmed);
      const pathMatch = url.pathname.match(/\/enroll\/([^\/\s?#]+)/);
      if (pathMatch) {
        return pathMatch[1];
      }
    } catch (e) {
      // URL이 아닌 경우 그대로 사용
    }
    
    return trimmed;
  };

  const handleEnrollByCode = async () => {
    if (!enrollmentCode.trim()) {
      alert('참가 코드를 입력하세요.');
      return;
    }
    
    const code = extractEnrollmentCode(enrollmentCode);
    
    if (!code) {
      alert('유효한 참가 코드나 링크를 입력하세요.');
      return;
    }
    
    try {
      setEnrollLoading(true);
      const resp = await APIService.enrollByCode(code);
      if (resp && resp.success) {
        alert(`${resp.courseTitle} 수강 신청이 완료되었습니다!`);
        setEnrollmentCode("");
        const refreshed = await APIService.getUserEnrolledSections();
        setEnrolledSections(refreshed.data || refreshed);
      } else {
        alert(resp?.message || '수강 신청에 실패했습니다.');
      }
    } catch (e) {
      alert(e.message || '수강 신청 중 오류가 발생했습니다.');
    } finally {
      setEnrollLoading(false);
    }
  };

  const stats = getStats();
  const filteredSections = getFilteredSections();

  if (loading) {
    return (
      <ClassPageContainer>
        <Header userName={userName} />
        <div className="loading-container">
          <LoadingSpinner />
          <p>수강 중인 강의를 불러오는 중...</p>
        </div>
        <Footer />
      </ClassPageContainer>
    );
  }

  if (error) {
    return (
      <ClassPageContainer>
        <Header userName={userName} />
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            다시 시도
          </button>
        </div>
        <Footer />
      </ClassPageContainer>
    );
  }

  return (
    <ClassPageContainer>
      <Header userName={userName} />
      
      <ContentSection>
        <PageTitle>수강 중인 코스</PageTitle>
        
        <TabNavigation>
          <Tab
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          >
            전체 ({stats.all})
          </Tab>
          <Tab
            active={activeTab === "in-progress"}
            onClick={() => setActiveTab("in-progress")}
          >
            수강 중 ({stats.inProgress})
          </Tab>
          <Tab
            active={activeTab === "completed"}
            onClick={() => setActiveTab("completed")}
          >
            수강 종료 ({stats.completed})
          </Tab>
          <EnrollButton onClick={() => setShowEnrollModal(true)}>
            수업 참가
          </EnrollButton>
        </TabNavigation>

        <SearchAndSort>
          <SearchBar>
            <SearchInput
              type="text"
              placeholder="강의명 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon>🔍</SearchIcon>
          </SearchBar>
          <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">최근 개설일 순</option>
            <option value="name">강의명 순</option>
          </SortSelect>
        </SearchAndSort>

        {filteredSections.length === 0 ? (
          <EmptyState>
            <p>수강 중인 강의가 없습니다.</p>
          </EmptyState>
        ) : (
          <CoursesGrid>
            {filteredSections.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </CoursesGrid>
        )}
      </ContentSection>

      {showEnrollModal && (
        <ModalOverlay onClick={() => setShowEnrollModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>수업 참가</h2>
              <CloseButton onClick={() => setShowEnrollModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <label>참가 코드 또는 링크</label>
              <input
                type="text"
                className="enroll-input"
                placeholder={`예: ABCD1234 또는 ${window.location.origin}/enroll/ABCD1234`}
                value={enrollmentCode}
                onChange={(e) => setEnrollmentCode(e.target.value)}
              />
              <p className="enroll-help-text">참가 코드만 입력하거나 전체 링크를 붙여넣으세요.</p>
            </ModalBody>
            <ModalActions>
              <CancelButton onClick={() => setShowEnrollModal(false)}>취소</CancelButton>
              <EnrollSubmitButton
                onClick={async () => {
                  await handleEnrollByCode();
                  setShowEnrollModal(false);
                }}
                disabled={enrollLoading}
              >
                {enrollLoading ? '처리 중...' : '참가하기'}
              </EnrollSubmitButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      <Footer />
    </ClassPageContainer>
  );
};

// Styled Components
const ClassPageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
`;

const ContentSection = styled.div`
  flex: 1;
  padding: 2rem;
  max-width: 1152px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
`;

const TabNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? '#667eea' : '#6b7280'};
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -0.5rem;

  &:hover {
    color: #667eea;
  }
`;

const EnrollButton = styled.button`
  margin-left: auto;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #5568d3;
  }
`;

const SearchAndSort = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SearchBar = styled.div`
  position: relative;
  width: 16.666%;
  max-width: 400px;
`;

const SearchIcon = styled.span`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;
  text-align: left;
  background: transparent;

  &::placeholder {
    text-align: left;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SortSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  background: transparent;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: #636e72;
  
  p {
    font-size: 1.1rem;
    margin: 0;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  width: 90%;
  max-width: 480px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 800;
    color: #1f2937;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
`;

const ModalBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
  }

  .enroll-input {
    width: 100%;
    padding: 0.6rem 0.9rem;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    font-size: 0.9rem;
    box-sizing: border-box;
  }

  .enroll-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .enroll-help-text {
    font-size: 0.8rem;
    color: #6b7280;
    margin: 0.25rem 0 0 0;
    line-height: 1.4;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e7eb;
`;

const CancelButton = styled.button`
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
`;

const EnrollSubmitButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #5568d3;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default ClassPage;

