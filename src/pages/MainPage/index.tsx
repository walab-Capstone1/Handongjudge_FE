import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import CourseCard from "../../components/CourseCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
import * as S from "./styles";
import type { Section, CourseCardData, StatusItem } from "./types";

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [enrolledSections, setEnrolledSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

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
        console.log('🔥 메인 페이지 대시보드 응답:', response);
        setEnrolledSections(response.data || response);
      } catch (err) {
        console.error('수강 중인 section 조회 실패:', err);
        setError((err as Error).message || '수강 중인 강의를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledSections();
  }, [isAuthenticated]);

  const handleStatusUpdate = async () => {
    console.log('🔥 상태 업데이트 콜백 호출됨 - 대시보드 새로고침');
    try {
      const response = await APIService.getUserEnrolledSections();
      console.log('🔥 대시보드 새로고침 응답:', response);
      setEnrolledSections(response.data || response);
    } catch (err) {
      console.error('🔥 대시보드 새로고침 실패:', err);
    }
  };

  const generateStatus = (section: Section): StatusItem[] => {
    const status: StatusItem[] = [];
    
    if (section.newNoticeCount > 0) {
      status.push({ type: "announcement", text: "새로운 공지", color: "green" });
    }
    
    if (section.newAssignmentCount > 0) {
      status.push({ type: "assignment", text: "새로운 과제", color: "blue" });
    }
    
    return status;
  };

  const getRandomColor = (id: number): string => {
    const colors = ['purple', 'orange', 'red', 'blue', 'green'];
    return colors[id % colors.length];
  };

  const transformSectionData = (section: Section): CourseCardData => {
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
      active: section.active
    };
  };

  const extractEnrollmentCode = (input: string): string => {
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

    if (!isAuthenticated) {
      sessionStorage.setItem('pendingEnrollmentCode', code);
      setShowEnrollModal(false);
      setEnrollmentCode("");
      navigate("/login", {
        state: {
          redirectTo: `/enroll/${code}`,
          message: '수업 참가를 위해 로그인이 필요합니다.'
        }
      });
      return;
    }
    
    try {
      setEnrollLoading(true);
      const resp = await APIService.enrollByCode(code);
      if (resp && resp.success) {
        alert(`${resp.courseTitle} 수강 신청이 완료되었습니다!`);
        setEnrollmentCode("");
        setShowEnrollModal(false);
        const refreshed = await APIService.getUserEnrolledSections();
        setEnrolledSections(refreshed.data || refreshed);
      } else {
        alert(resp?.message || '수강 신청에 실패했습니다.');
      }
    } catch (e) {
      alert((e as Error).message || '수강 신청 중 오류가 발생했습니다.');
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <S.MainPageContainer>
          <S.LoadingContainer>
            <LoadingSpinner />
            <p>수강 중인 강의를 불러오는 중...</p>
          </S.LoadingContainer>
        </S.MainPageContainer>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <S.MainPageContainer>
          <S.ErrorContainer>
            <S.ErrorMessage>{error}</S.ErrorMessage>
            <S.RetryButton onClick={() => window.location.reload()}>
              다시 시도
            </S.RetryButton>
          </S.ErrorContainer>
        </S.MainPageContainer>
      </MainLayout>
    );
  }

  const transformedSections = enrolledSections.map(transformSectionData);

  return (
    <MainLayout>
      <S.MainPageContainer>
        <S.ContentSection>
          <S.SectionHeader>
            <S.SectionInfo>
              <S.TitleContainer>
                <S.SectionTitle>
                  {user?.name || '사용자'}'s class
                </S.SectionTitle>
                <S.OpenEnrollButton onClick={() => setShowEnrollModal(true)}>
                  수업 참가
                </S.OpenEnrollButton>
              </S.TitleContainer>
            </S.SectionInfo>
          </S.SectionHeader>
          
          {transformedSections.length === 0 ? (
            <S.EmptyState>
              <p>수강 중인 강의가 없습니다.</p>
            </S.EmptyState>
          ) : (
            <S.CoursesGrid>
              {transformedSections.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onStatusUpdate={handleStatusUpdate}
                  onEnroll={() => {}}
                />
              ))}
            </S.CoursesGrid>
          )}
        </S.ContentSection>

        {showEnrollModal && (
          <S.ModalOverlay onClick={() => setShowEnrollModal(false)}>
            <S.Modal onClick={(e) => e.stopPropagation()}>
              <S.ModalHeader>
                <h2>수업 참가</h2>
                <S.CloseButton onClick={() => setShowEnrollModal(false)}>×</S.CloseButton>
              </S.ModalHeader>
              <S.ModalBody>
                <label>참가 코드 또는 링크</label>
                <S.EnrollInput
                  type="text"
                  placeholder={`예: ABCD1234 또는 ${window.location.origin}/enroll/ABCD1234`}
                  value={enrollmentCode}
                  onChange={(e) => setEnrollmentCode(e.target.value)}
                />
                <S.HelpText>참가 코드만 입력하거나 전체 링크를 붙여넣으세요.</S.HelpText>
              </S.ModalBody>
              <S.ModalActions>
                <S.CancelButton onClick={() => setShowEnrollModal(false)}>취소</S.CancelButton>
                <S.EnrollButton
                  onClick={handleEnrollByCode}
                  disabled={enrollLoading}
                >
                  {enrollLoading ? '처리 중...' : '참가하기'}
                </S.EnrollButton>
              </S.ModalActions>
            </S.Modal>
          </S.ModalOverlay>
        )}
      </S.MainPageContainer>
    </MainLayout>
  );
};

export default MainPage;
