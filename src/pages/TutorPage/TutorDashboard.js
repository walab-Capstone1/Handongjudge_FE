import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
import { removeCopyLabel } from "../../utils/problemUtils";
import ReactMarkdown from "react-markdown";
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaUsers, FaChartLine, FaArrowUp, FaArrowDown, FaMinus } from "react-icons/fa";
import "./TutorDashboard.css";

const TutorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [formData, setFormData] = useState({
    courseTitle: '',
    description: '',
    sectionNumber: '',
    year: new Date().getFullYear(),
    semester: 'SPRING'
  });
  const [copyFormData, setCopyFormData] = useState({
    sourceSectionId: '',
    courseTitle: '',
    description: '',
    year: new Date().getFullYear(),
    semester: 'SPRING',
    copyNotices: true,
    copyAssignments: true,
    selectedNoticeIds: [],
    selectedAssignmentIds: [],
    assignmentProblems: {} // { assignmentId: [problemIds] }
  });
  const [sourceNotices, setSourceNotices] = useState([]);
  const [sourceAssignments, setSourceAssignments] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [expandedAssignments, setExpandedAssignments] = useState({});
  const [copyStep, setCopyStep] = useState(1); // 1: 기본정보, 2: 공지사항, 3: 과제/문제
  const [selectedNoticeDetail, setSelectedNoticeDetail] = useState(null);
  const [selectedProblemDetail, setSelectedProblemDetail] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  // 새로운 상태: 각 수업별 상세 통계
  const [sectionStats, setSectionStats] = useState({}); // { sectionId: { submissionRate, atRiskStudents, issues, ... } }
  const [loadingSectionStats, setLoadingSectionStats] = useState(false);

  // 각 수업별 상세 통계 계산
  const calculateSectionStats = async (sectionId) => {
    try {
      // 1. 과제 목록 조회 (평균 제출률 계산용)
      const assignmentsResponse = await APIService.getAssignmentsBySection(sectionId);
      const assignments = assignmentsResponse?.data || assignmentsResponse || [];
      
      if (assignments.length === 0) {
        return {
          averageSubmissionRate: 0,
          atRiskStudents: 0,
          issues: 0,
          upcomingDeadlines: [],
          pendingGrading: 0,
          totalAssignments: 0,
          activeAssignments: 0
        };
      }

      // 2. 마감 직전 과제 조회 (새 API 사용)
      const upcomingAssignments = await APIService.getUpcomingAssignments(sectionId, 3);
      let upcomingDeadlines = upcomingAssignments.map(assignment => ({
        assignmentId: assignment.assignmentId,
        title: assignment.title,
        endDate: assignment.endDate,
        submissionRate: assignment.submissionRate || 0
      }));

      // 3. 마감 직전 과제가 없으면 모든 활성 과제를 마감일 순으로 정렬
      if (upcomingDeadlines.length === 0) {
        const now = new Date();
        const activeAssignments = assignments.filter(a => a.active && a.endDate);
        
        // 마감일이 미래인 과제만 필터링하고 마감일 순으로 정렬
        const futureAssignments = activeAssignments
          .filter(a => {
            const endDate = new Date(a.endDate);
            return endDate > now;
          })
          .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

        // 각 과제의 제출 통계 조회
        for (const assignment of futureAssignments.slice(0, 3)) {
          try {
            const statsResponse = await APIService.getAssignmentSubmissionStats(assignment.id, sectionId);
            if (statsResponse) {
              upcomingDeadlines.push({
                assignmentId: assignment.id,
                title: assignment.title,
                endDate: assignment.endDate,
                submissionRate: statsResponse.submissionRate || 0
              });
            }
          } catch (error) {
            console.error(`과제 ${assignment.id} 통계 조회 실패:`, error);
            // 통계 조회 실패 시에도 과제 정보는 추가 (제출률 0)
            upcomingDeadlines.push({
              assignmentId: assignment.id,
              title: assignment.title,
              endDate: assignment.endDate,
              submissionRate: 0
            });
          }
        }
      }

      // 4. 각 과제별 제출 통계 조회 (평균 제출률 계산용)
      let totalSubmissionRate = 0;
      let validAssignments = 0;
      let pendingGrading = 0;
      const now = new Date();

      for (const assignment of assignments) {
        if (!assignment.active) continue;
        
        try {
          const statsResponse = await APIService.getAssignmentSubmissionStats(assignment.id, sectionId);
          if (statsResponse) {
            const submissionRate = statsResponse.submissionRate || 0;
            totalSubmissionRate += submissionRate;
            validAssignments++;

            // 제출률이 낮은 과제는 채점 대기로 간주 (50% 미만)
            if (submissionRate < 50 && assignment.endDate) {
              const endDate = new Date(assignment.endDate);
              if (endDate < now) {
                pendingGrading++;
              }
            }
          }
        } catch (error) {
          console.error(`과제 ${assignment.id} 통계 조회 실패:`, error);
        }
      }

      const averageSubmissionRate = validAssignments > 0 ? totalSubmissionRate / validAssignments : 0;

      // 5. 위험 학생 수 계산 (제출률이 50% 미만인 학생)
      // 실제로는 학생별 제출 현황을 조회해야 하지만, 여기서는 과제별 통계로 추정
      const atRiskStudents = Math.ceil((100 - averageSubmissionRate) / 100 * (sections.find(s => s.sectionId === sectionId)?.studentCount || 0));

      // 6. 해결 필요 이슈 개수
      const issues = upcomingDeadlines.length + pendingGrading;

      return {
        averageSubmissionRate: Math.round(averageSubmissionRate * 10) / 10,
        atRiskStudents,
        issues,
        upcomingDeadlines,
        pendingGrading,
        totalAssignments: assignments.length,
        activeAssignments: assignments.filter(a => a.active).length
      };
    } catch (error) {
      console.error(`수업 ${sectionId} 통계 계산 실패:`, error);
      return {
        averageSubmissionRate: 0,
        atRiskStudents: 0,
        issues: 0,
        upcomingDeadlines: [],
        pendingGrading: 0,
        totalAssignments: 0,
        activeAssignments: 0
      };
    }
  };

  // 건강도 판정 함수
  const getHealthStatus = (sectionStat) => {
    if (!sectionStat) return { status: 'unknown', label: '알 수 없음', color: '#9ca3af' };
    
    const { averageSubmissionRate, atRiskStudents } = sectionStat;
    
    // 건강함: 제출률 80% 이상, 위험 학생 3명 이하
    if (averageSubmissionRate >= 80 && atRiskStudents <= 3) {
      return { status: 'healthy', label: '건강함', color: '#10b981' };
    }
    // 위험: 제출률 60% 미만, 위험 학생 10명 초과
    if (averageSubmissionRate < 60 || atRiskStudents > 10) {
      return { status: 'danger', label: '위험', color: '#ef4444' };
    }
    // 주의: 그 외
    return { status: 'warning', label: '주의', color: '#f59e0b' };
  };

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const dashboardResponse = await APIService.getInstructorDashboard();
        const dashboardData = dashboardResponse?.data || [];
        setSections(dashboardData);
        setLoading(false);

        // 각 수업별 통계 계산
        setLoadingSectionStats(true);
        const statsMap = {};
        for (const section of dashboardData) {
          if (section.active !== false) {
            statsMap[section.sectionId] = await calculateSectionStats(section.sectionId);
          }
        }
        setSectionStats(statsMap);
        setLoadingSectionStats(false);
      } catch (error) {
        setSections([]);
        setLoading(false);
        setLoadingSectionStats(false);
      }
    };

    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await APIService.getAdminStats();
        setStats(response?.data || null);
      } catch (error) {
        console.error('통계 조회 실패:', error);
        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchSections();
    fetchStats();
  }, []);

  const handleSectionClick = (section) => {
    // 관리자 페이지에서는 비활성화된 수업도 접근 가능
    // 수업 카드를 클릭하면 해당 수업의 과제 관리 페이지로 이동
    navigate(`/tutor/assignments/section/${section.sectionId}`, { state: { section } });
  };

  const handleCopyEnrollmentLink = (enrollmentCode, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    if (enrollmentCode) {
      const enrollmentLink = `${window.location.origin}/enroll/${enrollmentCode}`;
      navigator.clipboard.writeText(enrollmentLink).then(() => {
        alert('수업 참가 링크가 복사되었습니다!');
      }).catch((err) => {
        console.error('복사 실패:', err);
        alert('링크 복사에 실패했습니다.');
      });
    }
  };

  const handleToggleActive = async (sectionId, currentActive, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    try {
      const newActiveStatus = !currentActive;
      console.log('활성화 상태 변경 시도:', { sectionId, currentActive, newActiveStatus });
      const response = await APIService.toggleSectionActive(sectionId, newActiveStatus);
      console.log('API 응답:', response);
      alert(newActiveStatus ? '수업이 활성화되었습니다.' : '수업이 비활성화되었습니다.');
      
      // 수업 목록 다시 불러오기
      const dashboardResponse = await APIService.getInstructorDashboard();
      const dashboardData = dashboardResponse?.data || [];
      setSections(dashboardData);
    } catch (error) {
      console.error('수업 상태 변경 실패:', error);
      console.error('에러 상세:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`수업 상태 변경에 실패했습니다.\n${error.message || '네트워크 오류가 발생했습니다.'}`);
    }
  };

  const handleCreateSection = async () => {
    try {
      const instructorId = await APIService.getCurrentUserId();

      // 1단계: Course 생성
      const courseResponse = await APIService.createCourse({
        title: formData.courseTitle,
        description: formData.description || ''
      });

      // 2단계: Section 생성 (DomJudge Contest 자동 생성)
      // sectionNumber는 null로 전달 (표시용이므로 불필요)
      const sectionResponse = await APIService.createSection({
        courseId: courseResponse.id,
        instructorId: instructorId,
        sectionNumber: null,
        year: parseInt(formData.year),
        semester: formData.semester
      });

      alert('수업이 성공적으로 생성되었습니다!');
      setShowCreateModal(false);
      setFormData({
        courseTitle: '',
        description: '',
        sectionNumber: '',
        year: new Date().getFullYear(),
        semester: 'SPRING'
      });
      
      // 수업 목록 다시 불러오기
      const dashboardResponse = await APIService.getInstructorDashboard();
      const dashboardData = dashboardResponse?.data || [];
      setSections(dashboardData);
    } catch (error) {
      console.error('수업 생성 실패:', error);
      alert(error.message || '수업 생성에 실패했습니다.');
    }
  };

  // 수업 선택 시 공지사항 및 과제 목록 불러오기
  const handleSourceSectionChange = async (sectionId) => {
    setCopyFormData({...copyFormData, sourceSectionId: sectionId, selectedNoticeIds: [], selectedAssignmentIds: [], assignmentProblems: {}});
    setExpandedAssignments({});
    
    if (sectionId) {
      try {
        // 공지사항 조회
        setLoadingNotices(true);
        const notices = await APIService.getSectionNotices(sectionId);
        const noticesData = notices?.data || notices || [];
        setSourceNotices(noticesData);

        // 과제 조회
        setLoadingAssignments(true);
        const assignments = await APIService.getAssignmentsBySection(sectionId);
        const assignmentsData = assignments?.data || assignments || [];
        
        // 각 과제의 문제 목록 조회
        const assignmentsWithProblems = await Promise.all(
          assignmentsData.map(async (assignment) => {
            try {
              const problems = await APIService.getAssignmentProblems(sectionId, assignment.id);
              return {
                ...assignment,
                problems: problems || []
              };
            } catch (error) {
              console.error(`과제 ${assignment.id}의 문제 조회 실패:`, error);
              return { ...assignment, problems: [] };
            }
          })
        );
        
        setSourceAssignments(assignmentsWithProblems);

        // 기본적으로 모든 공지사항 및 과제 선택
        const initialAssignmentProblems = {};
        assignmentsWithProblems.forEach(assignment => {
          initialAssignmentProblems[assignment.id] = assignment.problems.map(p => p.id);
        });

        setCopyFormData(prev => ({
          ...prev,
          sourceSectionId: sectionId,
          selectedNoticeIds: noticesData.map(n => n.id),
          selectedAssignmentIds: assignmentsWithProblems.map(a => a.id),
          assignmentProblems: initialAssignmentProblems
        }));
      } catch (error) {
        console.error('데이터 조회 실패:', error);
        setSourceNotices([]);
        setSourceAssignments([]);
      } finally {
        setLoadingNotices(false);
        setLoadingAssignments(false);
      }
    } else {
      setSourceNotices([]);
      setSourceAssignments([]);
    }
  };

  const handleNoticeToggle = (noticeId) => {
    setCopyFormData(prev => {
      const isSelected = prev.selectedNoticeIds.includes(noticeId);
      return {
        ...prev,
        selectedNoticeIds: isSelected
          ? prev.selectedNoticeIds.filter(id => id !== noticeId)
          : [...prev.selectedNoticeIds, noticeId]
      };
    });
  };

  const handleSelectAllNotices = () => {
    if (copyFormData.selectedNoticeIds.length === sourceNotices.length) {
      // 모두 선택 해제
      setCopyFormData(prev => ({...prev, selectedNoticeIds: []}));
    } else {
      // 모두 선택
      setCopyFormData(prev => ({...prev, selectedNoticeIds: sourceNotices.map(n => n.id)}));
    }
  };

  // 과제 선택/해제
  const handleAssignmentToggle = (assignmentId) => {
    setCopyFormData(prev => {
      const isSelected = prev.selectedAssignmentIds.includes(assignmentId);
      if (isSelected) {
        // 과제 선택 해제 시 해당 과제의 문제도 모두 해제
        const newAssignmentProblems = {...prev.assignmentProblems};
        delete newAssignmentProblems[assignmentId];
        return {
          ...prev,
          selectedAssignmentIds: prev.selectedAssignmentIds.filter(id => id !== assignmentId),
          assignmentProblems: newAssignmentProblems
        };
      } else {
        // 과제 선택 시 해당 과제의 모든 문제 선택
        const assignment = sourceAssignments.find(a => a.id === assignmentId);
        return {
          ...prev,
          selectedAssignmentIds: [...prev.selectedAssignmentIds, assignmentId],
          assignmentProblems: {
            ...prev.assignmentProblems,
            [assignmentId]: assignment?.problems.map(p => p.id) || []
          }
        };
      }
    });
  };

  // 모든 과제 선택/해제
  const handleSelectAllAssignments = () => {
    if (copyFormData.selectedAssignmentIds.length === sourceAssignments.length) {
      // 모두 선택 해제
      setCopyFormData(prev => ({...prev, selectedAssignmentIds: [], assignmentProblems: {}}));
    } else {
      // 모두 선택
      const allAssignmentProblems = {};
      sourceAssignments.forEach(assignment => {
        allAssignmentProblems[assignment.id] = assignment.problems.map(p => p.id);
      });
      setCopyFormData(prev => ({
        ...prev,
        selectedAssignmentIds: sourceAssignments.map(a => a.id),
        assignmentProblems: allAssignmentProblems
      }));
    }
  };

  // 과제 펼치기/접기
  const toggleAssignmentExpand = (assignmentId) => {
    setExpandedAssignments(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  // 과제의 문제 선택/해제
  const handleProblemToggle = (assignmentId, problemId) => {
    setCopyFormData(prev => {
      const currentProblems = prev.assignmentProblems[assignmentId] || [];
      const isSelected = currentProblems.includes(problemId);
      
      return {
        ...prev,
        assignmentProblems: {
          ...prev.assignmentProblems,
          [assignmentId]: isSelected
            ? currentProblems.filter(id => id !== problemId)
            : [...currentProblems, problemId]
        }
      };
    });
  };

  // 과제의 모든 문제 선택/해제
  const handleSelectAllProblems = (assignmentId) => {
    const assignment = sourceAssignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const currentProblems = copyFormData.assignmentProblems[assignmentId] || [];
    const allProblems = assignment.problems.map(p => p.id);

    setCopyFormData(prev => ({
      ...prev,
      assignmentProblems: {
        ...prev.assignmentProblems,
        [assignmentId]: currentProblems.length === allProblems.length ? [] : allProblems
      }
    }));
  };

  const handleCopySection = async () => {
    try {
      if (!copyFormData.sourceSectionId) {
        alert('복사할 수업을 선택해주세요.');
        return;
      }

      if (!copyFormData.courseTitle) {
        alert('새 수업 제목을 입력해주세요.');
        return;
      }

      // sectionNumber는 null로 전달 (표시용이므로 불필요)
      const response = await APIService.copySection(
        parseInt(copyFormData.sourceSectionId),
        null,
        parseInt(copyFormData.year),
        copyFormData.semester,
        copyFormData.courseTitle,
        copyFormData.description || '',
        copyFormData.copyNotices,
        copyFormData.copyAssignments,
        copyFormData.copyNotices ? copyFormData.selectedNoticeIds : [],
        copyFormData.copyAssignments ? copyFormData.selectedAssignmentIds : [],
        copyFormData.copyAssignments ? copyFormData.assignmentProblems : {}
      );

      if (response.success) {
        alert('수업이 성공적으로 복사되었습니다!');
        setShowCopyModal(false);
        setCopyStep(1);
        setCopyFormData({
          sourceSectionId: '',
          courseTitle: '',
          description: '',
          year: new Date().getFullYear(),
          semester: 'SPRING',
          copyNotices: true,
          copyAssignments: true,
          selectedNoticeIds: [],
          selectedAssignmentIds: [],
          assignmentProblems: {}
        });
        setSourceNotices([]);
        setSourceAssignments([]);
        setExpandedAssignments({});
        
        // 수업 목록 다시 불러오기
        const dashboardResponse = await APIService.getInstructorDashboard();
        const dashboardData = dashboardResponse?.data || [];
        setSections(dashboardData);
      } else {
        alert(response.message || '수업 복사에 실패했습니다.');
      }
    } catch (error) {
      console.error('수업 복사 실패:', error);
      alert(error.message || '수업 복사에 실패했습니다.');
    }
  };

  // 학기 표시 헬퍼 함수
  const getSemesterLabel = (semester) => {
    switch(semester) {
      case 'SPRING': return '1학기';
      case 'SUMMER': return '여름학기';
      case 'FALL': return '2학기';
      case 'WINTER': return '겨울학기';
      case 'CAMP': return '캠프';
      case 'SPECIAL': return '특강';
      case 'IRREGULAR': return '비정규 세션';
      default: return semester || '1학기';
    }
  };

  // D-day 계산 함수
  const calculateDDay = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '마감';
    if (diffDays === 0) return 'D-day';
    return `D-${diffDays}`;
  };

  // 과제별 풀이 현황으로 이동
  const handleAssignmentProgressClick = (e, sectionId, assignmentId) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    if (assignmentId) {
      navigate(`/tutor/assignments/section/${sectionId}/progress/${assignmentId}`);
    } else {
      navigate(`/tutor/assignments/section/${sectionId}/progress`);
    }
  };

  // 년도 필터링
  const years = ['ALL', ...new Set(sections.map(s => s.year).filter(Boolean))].sort((a, b) => {
    if (a === 'ALL') return -1;
    if (b === 'ALL') return 1;
    return b - a;
  });

  // 학기 필터링 (1학기, 여름학기, 2학기, 겨울학기, 캠프, 특강, 비정규 세션)
  const semesters = [
    { value: 'ALL', label: '전체' },
    { value: 'SPRING', label: '1학기' },
    { value: 'SUMMER', label: '여름학기' },
    { value: 'FALL', label: '2학기' },
    { value: 'WINTER', label: '겨울학기' },
    { value: 'CAMP', label: '캠프' },
    { value: 'SPECIAL', label: '특강' },
    { value: 'IRREGULAR', label: '비정규 세션' }
  ];

  // 필터링된 수업 목록
  const filteredSections = sections.filter(section => {
    const matchesYear = selectedYear === 'ALL' || section.year === parseInt(selectedYear);
    const matchesSemester = selectedSemester === 'ALL' || section.semester === selectedSemester;
    return matchesYear && matchesSemester;
  });

  // 워크로드 관리 데이터 계산
  const workloadData = useMemo(() => {
    const upcomingDeadlines = [];
    let totalPendingGrading = 0;
    let totalStudentsNeedingConsultation = 0;

    filteredSections.forEach(section => {
      const stat = sectionStats[section.sectionId];
      if (stat) {
        upcomingDeadlines.push(...stat.upcomingDeadlines.map(d => ({
          ...d,
          sectionId: section.sectionId,
          sectionName: `${section.courseTitle} ${section.sectionNumber || ''}분반`
        })));
        totalPendingGrading += stat.pendingGrading;
        // 위험 학생이 5명 이상이면 상담 필요로 간주
        if (stat.atRiskStudents >= 5) {
          totalStudentsNeedingConsultation += stat.atRiskStudents;
        }
      }
    });

    // 마감일 순으로 정렬
    upcomingDeadlines.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

    return {
      upcomingDeadlines: upcomingDeadlines.slice(0, 5), // 최대 5개만 표시
      pendingGrading: totalPendingGrading,
      studentsNeedingConsultation: totalStudentsNeedingConsultation
    };
  }, [filteredSections, sectionStats]);

  // 수업별 예상 소요 시간 계산
  const calculateTimeAllocation = useMemo(() => {
    const allocations = [];
    let totalIssues = 0;

    filteredSections.forEach(section => {
      const stat = sectionStats[section.sectionId];
      if (stat) {
        totalIssues += stat.issues;
        allocations.push({
          sectionId: section.sectionId,
          sectionName: `${section.courseTitle} ${section.sectionNumber || ''}분반`,
          issues: stat.issues,
          healthStatus: getHealthStatus(stat)
        });
      }
    });

    // 이슈 수에 비례하여 시간 할당
    if (totalIssues === 0) {
      return allocations.map(a => ({ ...a, timePercentage: Math.round(100 / allocations.length) }));
    }

    return allocations.map(a => ({
      ...a,
      timePercentage: Math.round((a.issues / totalIssues) * 100)
    })).sort((a, b) => b.timePercentage - a.timePercentage);
  }, [filteredSections, sectionStats]);

  // 수업 간 비교 분석 (같은 과목의 분반 간 비교)
  const comparisonData = useMemo(() => {
    const courseGroups = {};
    
    filteredSections.forEach(section => {
      const courseTitle = section.courseTitle;
      if (!courseGroups[courseTitle]) {
        courseGroups[courseTitle] = [];
      }
      const stat = sectionStats[section.sectionId];
      courseGroups[courseTitle].push({
        sectionId: section.sectionId,
        sectionNumber: section.sectionNumber,
        year: section.year,
        semester: section.semester,
        studentCount: section.studentCount || 0,
        submissionRate: stat?.averageSubmissionRate || 0,
        atRiskStudents: stat?.atRiskStudents || 0,
        healthStatus: getHealthStatus(stat)
      });
    });

    // 2개 이상의 분반이 있는 과목만 비교
    const comparisons = [];
    Object.keys(courseGroups).forEach(courseTitle => {
      const sections = courseGroups[courseTitle];
      if (sections.length >= 2) {
        const avgSubmissionRate = sections.reduce((sum, s) => sum + s.submissionRate, 0) / sections.length;
        const avgAtRisk = sections.reduce((sum, s) => sum + s.atRiskStudents, 0) / sections.length;
        
        comparisons.push({
          courseTitle,
          sections,
          averageSubmissionRate: Math.round(avgSubmissionRate * 10) / 10,
          averageAtRisk: Math.round(avgAtRisk * 10) / 10
        });
      }
    });

    return comparisons;
  }, [filteredSections, sectionStats]);

  if (loading) {
    return (
      <TutorLayout>
        <div className="dashboard-loading">
          <div className="tutor-loading-spinner"></div>
          <p>분반 정보를 불러오는 중...</p>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="tutor-dashboard">
        <div className="tutor-dashboard-header">
          <h1 className="dashboard-title">전체 수업 운영 현황</h1>
          <p className="dashboard-subtitle">
            모든 수업의 전반적인 상황을 한눈에 파악하고, 우선순위를 결정하세요.
          </p>
        </div>

        {/* 필터 섹션 */}
        <div className="tutor-filter-section">
          <div className="tutor-filter-left">
            <div className="tutor-filter-group">
              <label className="tutor-filter-label">년도</label>
              <select 
                className="tutor-filter-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year === 'ALL' ? '전체' : `${year}년`}
                  </option>
                ))}
              </select>
            </div>
            <div className="tutor-filter-group">
              <label className="tutor-filter-label">학기</label>
              <select 
                className="tutor-filter-select"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                {semesters.map(semester => (
                  <option key={semester.value} value={semester.value}>
                    {semester.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="tutor-filter-stats">
              <span className="tutor-filter-count">총 {filteredSections.length}개 수업</span>
            </div>
          </div>
        </div>

        {/* 랜드스케이프 배치: 수업 카드 */}
        <div className="dashboard-landscape-layout">
          {/* 왼쪽: 전체 수업 카드 */}
          <div className="dashboard-sections-panel">
            <h2 className="section-title">
              <FaChartLine className="section-title-icon" />
              전체 수업 운영 현황
            </h2>
          {loadingSectionStats ? (
            <div className="dashboard-loading">
              <div className="tutor-loading-spinner"></div>
              <p>수업 통계를 계산하는 중...</p>
            </div>
          ) : (
            <div className="health-cards-grid">
              {filteredSections.map((section) => {
                const stat = sectionStats[section.sectionId] || {};
                const healthStatus = getHealthStatus(stat);
                const isActive = section.active !== false;
                
                return (
                  <div
                    key={section.sectionId}
                    className={`health-card ${!isActive ? 'inactive' : ''}`}
                    onClick={() => isActive && handleSectionClick(section)}
                  >
                    <div className="health-card-header">
                      <div className="health-status-indicator">
                        <div className="health-status-dot"></div>
                      </div>
                      <div className="health-card-title-area">
                        <h3 className="health-card-title">{section.courseTitle}</h3>
                        <span className="health-card-badge">
                          {section.year || '2024'}년 {getSemesterLabel(section.semester)}
                          {section.sectionNumber && ` ${section.sectionNumber}분반`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="health-card-body">
                      {stat.upcomingDeadlines && stat.upcomingDeadlines.length > 0 ? (
                        <div className="upcoming-assignments-list">
                          {stat.upcomingDeadlines.slice(0, 3).map((deadline, index) => {
                            const dDay = calculateDDay(deadline.endDate);
                            return (
                              <div
                                key={deadline.assignmentId || index}
                                className="upcoming-assignment-item"
                                onClick={(e) => isActive && handleAssignmentProgressClick(e, section.sectionId, deadline.assignmentId)}
                              >
                                <div className="upcoming-assignment-header">
                                  <span className="upcoming-assignment-title">{deadline.title}</span>
                                  <span className={`upcoming-assignment-dday ${dDay === 'D-day' || dDay === '마감' ? 'urgent' : ''}`}>
                                    {dDay}
                                  </span>
                                </div>
                                <div className="upcoming-assignment-meta">
                                  <span className="upcoming-assignment-rate">제출률: {deadline.submissionRate?.toFixed(1) || 0}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="no-upcoming-assignments">
                          <p>마감 직전 과제가 없습니다.</p>
                        </div>
                      )}
                    </div>
                    
                    {isActive && (
                      <div className="health-card-footer">
                        <span className="health-card-hint">클릭하여 상세 보기</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredSections.length === 0 && (
                <div className="dashboard-empty-state">
                  <p>조건에 맞는 수업이 없습니다.</p>
                </div>
              )}
            </div>
          )}
          </div>
        </div>


        {/* 워크로드 관리 섹션 (제거 예정 - 주석 처리) */}
        {false && (
        <div className="dashboard-workload-section">
          <h2 className="section-title">
            <FaClock className="section-title-icon" />
            워크로드 관리
          </h2>
          <div className="workload-grid">
            {/* 임박한 마감 일정 */}
            <div className="workload-card">
              <h3 className="workload-card-title">임박한 마감 일정</h3>
              {workloadData.upcomingDeadlines.length > 0 ? (
                <div className="workload-list">
                  {workloadData.upcomingDeadlines.map((deadline, index) => {
                    const endDate = new Date(deadline.endDate);
                    const now = new Date();
                    const hoursLeft = Math.floor((endDate - now) / (1000 * 60 * 60));
                    const isUrgent = hoursLeft <= 24;
                    
                    return (
                      <div key={index} className={`workload-item ${isUrgent ? 'urgent' : ''}`}>
                        <div className="workload-item-header">
                          <span className="workload-item-title">{deadline.title}</span>
                          <span className="workload-item-time">
                            {hoursLeft <= 0 ? '마감됨' : `${hoursLeft}시간 남음`}
                          </span>
                        </div>
                        <div className="workload-item-meta">
                          <span className="workload-item-section">{deadline.sectionName}</span>
                          <span className="workload-item-rate">제출률: {deadline.submissionRate.toFixed(1)}%</span>
                        </div>
                        {deadline.submissionRate < 50 && (
                          <button 
                            className="workload-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              // 리마인더 발송 기능 (추후 구현)
                              alert('리마인더 발송 기능은 추후 구현 예정입니다.');
                            }}
                          >
                            리마인더 발송
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="workload-empty">임박한 마감 일정이 없습니다.</div>
              )}
            </div>

            {/* 처리 대기 업무 */}
            <div className="workload-card">
              <h3 className="workload-card-title">처리 대기 업무</h3>
              <div className="workload-tasks">
                <div className="workload-task">
                  <FaExclamationTriangle className="workload-task-icon" />
                  <div className="workload-task-content">
                    <span className="workload-task-label">채점 대기 중인 과제</span>
                    <span className="workload-task-value">{workloadData.pendingGrading}건</span>
                    <span className="workload-task-time">예상 소요: {workloadData.pendingGrading * 30}분</span>
                  </div>
                </div>
                <div className="workload-task">
                  <FaUsers className="workload-task-icon" />
                  <div className="workload-task-content">
                    <span className="workload-task-label">개별 상담 필요 학생</span>
                    <span className="workload-task-value">{workloadData.studentsNeedingConsultation}명</span>
                    <span className="workload-task-time">예상 소요: {workloadData.studentsNeedingConsultation * 15}분</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 수업별 예상 소요 시간 */}
            <div className="workload-card workload-card-full">
              <h3 className="workload-card-title">이번 주 수업별 예상 소요 시간</h3>
              {calculateTimeAllocation.length > 0 ? (
                <div className="time-allocation-list">
                  {calculateTimeAllocation.map((allocation) => (
                    <div key={allocation.sectionId} className="time-allocation-item">
                      <div className="time-allocation-header">
                        <span className="time-allocation-section">{allocation.sectionName}</span>
                        <span className="time-allocation-percentage">{allocation.timePercentage}%</span>
                      </div>
                      <div className="time-allocation-bar">
                        <div 
                          className="time-allocation-fill" 
                          style={{ 
                            width: `${allocation.timePercentage}%`,
                            backgroundColor: allocation.healthStatus.color
                          }}
                        ></div>
                      </div>
                      <div className="time-allocation-footer">
                        <span className="time-allocation-status" style={{ color: allocation.healthStatus.color }}>
                          {allocation.healthStatus.label}
                        </span>
                        <span className="time-allocation-issues">{allocation.issues}개 이슈</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="workload-empty">수업 데이터가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* 수업 생성 모달 */}
        {showCreateModal && (
          <div className="tutor-modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="tutor-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="tutor-modal-header">
                <h2>새 수업 만들기</h2>
                <button 
                  className="tutor-modal-close"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="tutor-modal-body">
                <div className="tutor-form-group">
                  <label>강의 제목</label>
                  <input
                    type="text"
                    value={formData.courseTitle}
                    onChange={(e) => setFormData({...formData, courseTitle: e.target.value})}
                    className="tutor-form-input"
                    placeholder="예: 자바프로그래밍"
                  />
                </div>

                <div className="tutor-form-group">
                  <label>수업 설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="tutor-form-input"
                    placeholder="수업에 대한 설명을 입력하세요 (선택사항)"
                    rows="3"
                  />
                </div>

                <div className="tutor-form-row">
                  <div className="tutor-form-group">
                    <label>년도</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="tutor-form-input"
                      placeholder="2025"
                      min="2020"
                      max="2099"
                    />
                  </div>

                  <div className="tutor-form-group">
                    <label>구분</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({...formData, semester: e.target.value})}
                      className="tutor-form-select"
                    >
                      <option value="SPRING">1학기</option>
                      <option value="SUMMER">여름학기</option>
                      <option value="FALL">2학기</option>
                      <option value="WINTER">겨울학기</option>
                      <option value="CAMP">캠프</option>
                      <option value="SPECIAL">특강</option>
                      <option value="IRREGULAR">비정규 세션</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="tutor-modal-footer">
                <button 
                  className="tutor-btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  취소
                </button>
                <button 
                  className="tutor-btn-submit"
                  onClick={handleCreateSection}
                  disabled={!formData.courseTitle}
                >
                  생성하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수업 가져오기 모달 */}
        {showCopyModal && (
          <div className="tutor-modal-overlay" onClick={() => {
            setShowCopyModal(false);
            setCopyStep(1);
            setSelectedNoticeDetail(null);
            setSelectedProblemDetail(null);
          }}>
            <div className={`tutor-modal-content ${copyStep === 1 ? '' : 'tutor-modal-content-large'}`} onClick={(e) => e.stopPropagation()}>
              <div className="tutor-modal-header">
                <h2>수업 가져오기</h2>
                <button 
                  className="tutor-modal-close"
                  onClick={() => {
                    setShowCopyModal(false);
                    setCopyStep(1);
                    setSelectedNoticeDetail(null);
                    setSelectedProblemDetail(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className={copyStep === 1 ? "tutor-modal-body" : "tutor-modal-body tutor-modal-body-large"}>
                {/* 1단계: 기본 정보 */}
                {copyStep === 1 && (
                  <div className="tutor-step-content">
                    <h3 className="tutor-step-title">1단계: 기본 정보 입력</h3>
                    
                <div className="tutor-form-group">
                      <label>복사할 수업 선택 *</label>
                  <select
                    value={copyFormData.sourceSectionId}
                        onChange={(e) => handleSourceSectionChange(e.target.value)}
                    className="tutor-form-select"
                  >
                    <option value="">수업을 선택하세요</option>
                    {sections.map((section) => (
                      <option key={section.sectionId} value={section.sectionId}>
                            {section.courseTitle} ({section.year || '2024'}년 {getSemesterLabel(section.semester)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="tutor-form-group">
                      <label>새 수업 제목 *</label>
                  <input
                        type="text"
                        value={copyFormData.courseTitle}
                        onChange={(e) => setCopyFormData({...copyFormData, courseTitle: e.target.value})}
                    className="tutor-form-input"
                        placeholder="예: 자바프로그래밍"
                      />
                    </div>

                    <div className="tutor-form-group">
                      <label>수업 설명</label>
                      <textarea
                        value={copyFormData.description}
                        onChange={(e) => setCopyFormData({...copyFormData, description: e.target.value})}
                        className="tutor-form-input"
                        placeholder="수업에 대한 설명을 입력하세요 (선택사항)"
                        rows="4"
                  />
                </div>

                <div className="tutor-form-row">
                  <div className="tutor-form-group">
                        <label>년도 *</label>
                    <input
                      type="number"
                      value={copyFormData.year}
                      onChange={(e) => setCopyFormData({...copyFormData, year: e.target.value})}
                      className="tutor-form-input"
                      placeholder="2025"
                      min="2020"
                      max="2099"
                    />
                  </div>

                  <div className="tutor-form-group">
                        <label>구분 *</label>
                    <select
                      value={copyFormData.semester}
                      onChange={(e) => setCopyFormData({...copyFormData, semester: e.target.value})}
                      className="tutor-form-select"
                    >
                      <option value="SPRING">1학기</option>
                      <option value="SUMMER">여름학기</option>
                      <option value="FALL">2학기</option>
                      <option value="WINTER">겨울학기</option>
                          <option value="CAMP">캠프</option>
                          <option value="SPECIAL">특강</option>
                          <option value="IRREGULAR">비정규 세션</option>
                    </select>
                  </div>
                </div>
              </div>
                )}

                {/* 2단계: 공지사항 선택 */}
                {copyStep === 2 && (
                  <div className="tutor-step-content">
                    <h3 className="tutor-step-title">2단계: 공지사항 선택</h3>
                    <p className="tutor-step-description">가져올 공지사항을 선택하세요. 건너뛰면 공지사항을 가져오지 않습니다.</p>
                    
                    {loadingNotices ? (
                      <div className="tutor-loading-items">공지사항을 불러오는 중...</div>
                    ) : sourceNotices.length === 0 ? (
                      <div className="tutor-no-items">가져올 공지사항이 없습니다.</div>
                    ) : (
                      <div className="tutor-selection-box-large">
                        <div className="tutor-selection-header">
                          <label className="tutor-checkbox-label">
                            <input
                              type="checkbox"
                              checked={copyFormData.selectedNoticeIds.length === sourceNotices.length && sourceNotices.length > 0}
                              onChange={handleSelectAllNotices}
                            />
                            <span>전체 선택</span>
                          </label>
                          <span className="tutor-item-count">
                            {copyFormData.selectedNoticeIds.length} / {sourceNotices.length}개 선택됨
                          </span>
                        </div>
                        
                        <div className="tutor-item-list-large">
                          {sourceNotices.map((notice) => (
                            <div key={notice.id} className="tutor-list-item-large">
                              <label className="tutor-checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={copyFormData.selectedNoticeIds.includes(notice.id)}
                                  onChange={() => handleNoticeToggle(notice.id)}
                                />
                                <div className="tutor-item-info">
                                  <span className="tutor-item-title-large">{notice.title}</span>
                                  <span className="tutor-item-meta">
                                    {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                                  </span>
                                </div>
                              </label>
                              <button
                                className="tutor-btn-view-detail"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNoticeDetail(notice);
                                }}
                              >
                                상세보기
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3단계: 과제 및 문제 선택 */}
                {copyStep === 3 && (
                  <div className="tutor-step-content">
                    <h3 className="tutor-step-title">3단계: 과제 및 문제 선택</h3>
                    <p className="tutor-step-description">가져올 과제와 문제를 선택하세요. 과제를 클릭하면 해당 과제의 문제 목록을 볼 수 있습니다.</p>
                    
                    {loadingAssignments ? (
                      <div className="tutor-loading-items">과제를 불러오는 중...</div>
                    ) : sourceAssignments.length === 0 ? (
                      <div className="tutor-no-items">가져올 과제가 없습니다.</div>
                    ) : (
                      <div className="tutor-selection-box-large">
                        <div className="tutor-selection-header">
                          <label className="tutor-checkbox-label">
                            <input
                              type="checkbox"
                              checked={copyFormData.selectedAssignmentIds.length === sourceAssignments.length && sourceAssignments.length > 0}
                              onChange={handleSelectAllAssignments}
                            />
                            <span>전체 선택</span>
                          </label>
                          <span className="tutor-item-count">
                            {copyFormData.selectedAssignmentIds.length} / {sourceAssignments.length}개 과제 선택됨
                          </span>
                        </div>
                        
                        <div className="assignment-list-large">
                          {sourceAssignments.map((assignment) => {
                            const isAssignmentSelected = copyFormData.selectedAssignmentIds.includes(assignment.id);
                            const selectedProblems = copyFormData.assignmentProblems[assignment.id] || [];
                            const isExpanded = expandedAssignments[assignment.id];
                            
                            return (
                              <div key={assignment.id} className={`assignment-item-large ${isExpanded ? 'tutor-expanded' : ''}`}>
                                <div className="assignment-item-header-large">
                                  <label className="tutor-checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={isAssignmentSelected}
                                      onChange={() => handleAssignmentToggle(assignment.id)}
                                    />
                                    <div className="assignment-info-large">
                                      <span className="assignment-title-large">{assignment.title}</span>
                                      <span className="assignment-meta">
                                        {assignment.problems?.length || 0}개 문제
                                        {assignment.endDate && ` · 마감: ${new Date(assignment.endDate).toLocaleDateString('ko-KR')}`}
                                      </span>
                                    </div>
                                  </label>
                                  {assignment.problems && assignment.problems.length > 0 && (
                                    <button
                                      className="tutor-btn-expand-assignment-large"
                                      onClick={() => toggleAssignmentExpand(assignment.id)}
                                      disabled={!isAssignmentSelected}
                                    >
                                      {isExpanded ? '접기 ▲' : '문제 보기 ▼'}
                                    </button>
                                  )}
                                </div>
                                
                                {isExpanded && isAssignmentSelected && assignment.problems && assignment.problems.length > 0 && (
                                  <div className="tutor-problem-selection-box-large">
                                    <div className="tutor-problem-selection-header-large">
                                      <label className="tutor-checkbox-label">
                                        <input
                                          type="checkbox"
                                          checked={selectedProblems.length === assignment.problems.length}
                                          onChange={() => handleSelectAllProblems(assignment.id)}
                                        />
                                        <span>문제 전체 선택</span>
                                      </label>
                                      <span className="tutor-item-count">
                                        {selectedProblems.length} / {assignment.problems.length}개
                                      </span>
                                    </div>
                                    <div className="tutor-problem-list-large">
                                      {assignment.problems.map((problem, index) => (
                                        <div key={problem.id} className="tutor-problem-item-large">
                                          <div className="tutor-problem-item-large-header">
                                            <input
                                              type="checkbox"
                                              checked={selectedProblems.includes(problem.id)}
                                              onChange={() => handleProblemToggle(assignment.id, problem.id)}
                                              className="tutor-problem-checkbox"
                                            />
                                          </div>
                                          <div className="tutor-problem-item-large-body">
                                            <div className="tutor-problem-title-row">
                                              <h4 className="tutor-problem-title-large">
                                                <span className="tutor-problem-number-large">{index + 1}.</span>
                                                {removeCopyLabel(problem.title)}
                                              </h4>
                                              <button
                                                className="tutor-btn-view-detail-card"
                                                onClick={async (e) => {
                                                  e.stopPropagation();
                                                  try {
                                                    const problemInfo = await APIService.getProblemInfo(problem.id);
                                                    setSelectedProblemDetail(problemInfo.data || problemInfo);
                                                  } catch (error) {
                                                    console.error('문제 정보 조회 실패:', error);
                                                    alert('문제 정보를 불러오는데 실패했습니다.');
                                                  }
                                                }}
                                              >
                                                설명보기
                                              </button>
                                            </div>
                                          </div>
                                        </div>
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
                )}

                {/* 4단계: 최종 확인 */}
                {copyStep === 4 && (
                  <div className="tutor-step-content">
                    <h3 className="tutor-step-title">4단계: 최종 확인</h3>
                    <p className="tutor-step-description">선택하신 내용을 확인하고 수업을 생성하세요.</p>
                    
                    <div className="tutor-summary-section">
                      <div className="tutor-summary-item">
                        <h4 className="tutor-summary-label">수업 정보</h4>
                        <div className="tutor-summary-content">
                          <div className="tutor-summary-row">
                            <span className="tutor-summary-key">제목:</span>
                            <span className="tutor-summary-value">{copyFormData.courseTitle}</span>
                          </div>
                          {copyFormData.description && (
                            <div className="tutor-summary-row">
                              <span className="tutor-summary-key">설명:</span>
                              <span className="tutor-summary-value">{copyFormData.description}</span>
                            </div>
                          )}
                          <div className="tutor-summary-row">
                            <span className="tutor-summary-key">년도:</span>
                            <span className="tutor-summary-value">{copyFormData.year}년</span>
                          </div>
                          <div className="tutor-summary-row">
                            <span className="tutor-summary-key">구분:</span>
                            <span className="tutor-summary-value">{getSemesterLabel(copyFormData.semester)}</span>
                          </div>
                        </div>
                      </div>

                      {copyFormData.copyNotices ? (
                        <div className="tutor-summary-item">
                          <h4 className="tutor-summary-label">공지사항</h4>
                          <div className="tutor-summary-content">
                            <div className="tutor-summary-row">
                              <span className="tutor-summary-key">가져올 공지사항:</span>
                              <span className="tutor-summary-value">
                                {copyFormData.selectedNoticeIds.length}개 선택됨
                              </span>
                            </div>
                            {copyFormData.selectedNoticeIds.length > 0 && (
                              <div className="tutor-summary-list">
                                {sourceNotices
                                  .filter(n => copyFormData.selectedNoticeIds.includes(n.id))
                                  .map(notice => (
                                    <div key={notice.id} className="tutor-summary-list-item">
                                      • {notice.title}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="tutor-summary-item">
                          <h4 className="tutor-summary-label">공지사항</h4>
                          <div className="tutor-summary-content">
                            <span className="tutor-summary-skipped">건너뛰기</span>
                          </div>
                        </div>
                      )}

                      {copyFormData.copyAssignments ? (
                        <div className="tutor-summary-item">
                          <h4 className="tutor-summary-label">과제 및 문제</h4>
                          <div className="tutor-summary-content">
                            <div className="tutor-summary-row">
                              <span className="tutor-summary-key">가져올 과제:</span>
                              <span className="tutor-summary-value">
                                {copyFormData.selectedAssignmentIds.length}개 선택됨
                              </span>
                            </div>
                            {copyFormData.selectedAssignmentIds.length > 0 && (
                              <div className="tutor-summary-list">
                                {sourceAssignments
                                  .filter(a => copyFormData.selectedAssignmentIds.includes(a.id))
                                  .map(assignment => {
                                    const selectedProblems = copyFormData.assignmentProblems[assignment.id] || [];
                                    return (
                                      <div key={assignment.id} className="tutor-summary-list-item">
                                        <div className="tutor-summary-assignment">
                                          • {assignment.title} ({selectedProblems.length}개 문제)
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="tutor-summary-item">
                          <h4 className="tutor-summary-label">과제 및 문제</h4>
                          <div className="tutor-summary-content">
                            <span className="tutor-summary-skipped">건너뛰기</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>


              <div className="tutor-modal-footer">
                {/* 1단계 버튼 */}
                {copyStep === 1 && (
                  <>
                <button 
                  className="tutor-btn-cancel"
                      onClick={() => {
                        setShowCopyModal(false);
                        setCopyStep(1);
                      }}
                >
                  취소
                </button>
                    <button 
                      className="tutor-btn-next"
                      onClick={() => setCopyStep(2)}
                      disabled={!copyFormData.sourceSectionId || !copyFormData.courseTitle}
                    >
                      다음
                    </button>
                  </>
                )}

                {/* 2단계 버튼 */}
                {copyStep === 2 && (
                  <>
                    <button 
                      className="tutor-btn-prev"
                      onClick={() => setCopyStep(1)}
                    >
                      이전
                    </button>
                    <button 
                      className="tutor-btn-skip"
                      onClick={() => {
                        setCopyFormData(prev => ({...prev, copyNotices: false, selectedNoticeIds: []}));
                        setCopyStep(3);
                      }}
                    >
                      건너뛰기
                    </button>
                    <button 
                      className="tutor-btn-next"
                      onClick={() => {
                        setCopyFormData(prev => ({...prev, copyNotices: true}));
                        setCopyStep(3);
                      }}
                      disabled={copyFormData.selectedNoticeIds.length === 0}
                    >
                      다음 ({copyFormData.selectedNoticeIds.length}개 선택)
                    </button>
                  </>
                )}

                {/* 3단계 버튼 */}
                {copyStep === 3 && (
                  <>
                    <button 
                      className="tutor-btn-prev"
                      onClick={() => setCopyStep(2)}
                    >
                      이전
                    </button>
                    <button 
                      className="tutor-btn-skip"
                      onClick={() => {
                        setCopyFormData(prev => ({...prev, copyAssignments: false, selectedAssignmentIds: [], assignmentProblems: {}}));
                        setCopyStep(4);
                      }}
                    >
                      건너뛰기
                    </button>
                    <button 
                      className="tutor-btn-next"
                      onClick={() => {
                        setCopyFormData(prev => ({...prev, copyAssignments: true}));
                        setCopyStep(4);
                      }}
                      disabled={copyFormData.selectedAssignmentIds.length === 0}
                    >
                      다음 ({copyFormData.selectedAssignmentIds.length}개 과제)
                    </button>
                  </>
                )}

                {/* 4단계: 최종 확인 */}
                {copyStep === 4 && (
                  <>
                    <button 
                      className="tutor-btn-prev"
                      onClick={() => setCopyStep(3)}
                    >
                      이전
                    </button>
                <button 
                  className="tutor-btn-submit"
                  onClick={handleCopySection}
                >
                      수업 만들기
                </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 상세보기 패널 */}
        {(selectedNoticeDetail || selectedProblemDetail) && (
          <>
            <div className="tutor-detail-overlay" onClick={() => {
              setSelectedNoticeDetail(null);
              setSelectedProblemDetail(null);
            }}></div>
            <div className="tutor-detail-panel" onClick={(e) => e.stopPropagation()}>
              <div className="tutor-detail-panel-header">
                <h3>{selectedNoticeDetail ? '공지사항 상세' : '문제 설명'}</h3>
                <button
                  className="tutor-btn-close-detail"
                  onClick={() => {
                    setSelectedNoticeDetail(null);
                    setSelectedProblemDetail(null);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="tutor-detail-panel-content">
                {selectedNoticeDetail && (
                  <div className="notice-detail-content">
                    <h4 className="tutor-detail-title">{selectedNoticeDetail.title}</h4>
                    <div className="tutor-detail-meta">
                      작성일: {new Date(selectedNoticeDetail.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="tutor-detail-body">
                      {selectedNoticeDetail.content}
                    </div>
                  </div>
                )}
                {selectedProblemDetail && (
                  <div className="tutor-problem-detail-content">
                    <h4 className="tutor-detail-title">{selectedProblemDetail.title}</h4>
                    <div className="tutor-detail-meta">
                      {selectedProblemDetail.timeLimit && (
                        <span>시간 제한: {selectedProblemDetail.timeLimit}초</span>
                      )}
                      {selectedProblemDetail.memoryLimit && (
                        <span>메모리 제한: {selectedProblemDetail.memoryLimit}MB</span>
                      )}
                    </div>
                    <div className="tutor-detail-body tutor-problem-description">
                      {selectedProblemDetail.description ? (
                        (() => {
                          const description = selectedProblemDetail.description;
                          const isMarkdown = description.includes('# ') || 
                            description.includes('## ') || 
                            description.includes('```') ||
                            description.includes('**') ||
                            !description.includes('<');
                          
                          return isMarkdown ? (
                            <ReactMarkdown
                              components={{
                                code({node, inline, className, children, ...props}) {
                                  return inline ? (
                                    <code className="tutor-inline-code" {...props}>
                                      {children}
                                    </code>
                                  ) : (
                                    <pre className="tutor-code-block">
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                  );
                                }
                              }}
                            >
                              {description}
                            </ReactMarkdown>
                          ) : (
                            <div dangerouslySetInnerHTML={{ __html: description }} />
                          );
                        })()
                      ) : (
                        <p>설명이 없습니다.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </TutorLayout>
  );
};

export default TutorDashboard;