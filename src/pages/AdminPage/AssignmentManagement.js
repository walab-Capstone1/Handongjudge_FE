import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import SectionNavigation from "../../components/SectionNavigation";
import APIService from "../../services/APIService";
import { removeCopyLabel } from "../../utils/problemUtils";
import ReactMarkdown from "react-markdown";
import "./AssignmentManagement.css";
import "./AssignmentManagementList.css";
import "./AssignmentTable.css";
import "./Pagination.css";

const AssignmentManagement = () => {
  const { sectionId } = useParams(); // URL에서 분반 고유 ID 가져오기
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [showCreateProblemModal, setShowCreateProblemModal] = useState(false);
  const [showStandaloneProblemModal, setShowStandaloneProblemModal] = useState(false);
  const [showBulkProblemModal, setShowBulkProblemModal] = useState(false);
  const [showCopyProblemModal, setShowCopyProblemModal] = useState(false);
  const [copyableProblems, setCopyableProblems] = useState([]);
  const [copyProblemSearchTerm, setCopyProblemSearchTerm] = useState('');
  const [selectedSectionForProblem, setSelectedSectionForProblem] = useState('');
  const [currentProblemPage, setCurrentProblemPage] = useState(1);
  const PROBLEMS_PER_PAGE = 10;
  const [selectedProblemIds, setSelectedProblemIds] = useState([]);
  const [selectedProblemDetail, setSelectedProblemDetail] = useState(null);
  const [assignmentsForProblem, setAssignmentsForProblem] = useState([]);
  const [expandedAssignmentsForProblem, setExpandedAssignmentsForProblem] = useState({});
  const [assignmentProblems, setAssignmentProblems] = useState({});
  const [loadingAssignmentsForProblem, setLoadingAssignmentsForProblem] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('ALL');
  const [problemViewMode, setProblemViewMode] = useState('list'); // 'list' or 'hierarchy'
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [availableProblems, setAvailableProblems] = useState([]);
  const [problemSearchTerm, setProblemSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sectionId: '',
    startDate: '',
    endDate: '',
    assignmentNumber: ''
  });
  const [problemFormData, setProblemFormData] = useState({
    title: '',
    descriptionFile: null,
    zipFile: null
  });
  const [bulkProblemData, setBulkProblemData] = useState({
    problems: [{ title: '', descriptionFile: null, zipFile: null }]
  });
  const [submissionStats, setSubmissionStats] = useState({});
  const [currentSection, setCurrentSection] = useState(null);
  const [expandedAssignments, setExpandedAssignments] = useState({});
  const [showProblemListModal, setShowProblemListModal] = useState(false);
  const [selectedAssignmentForProblemList, setSelectedAssignmentForProblemList] = useState(null);
  const [selectedProblemForDetail, setSelectedProblemForDetail] = useState(null);
  const [showProblemDetailModal, setShowProblemDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [problemListSearchTerm, setProblemListSearchTerm] = useState('');
  const [openMoreMenu, setOpenMoreMenu] = useState(null);
  const ASSIGNMENTS_PER_PAGE = 10;

  useEffect(() => {
    fetchAssignments();
    fetchSections();
  }, [sectionId]); // sectionId가 변경될 때마다 다시 조회

  useEffect(() => {
    if (assignments.length > 0) {
      fetchSubmissionStats();
    }
  }, [assignments]); // 과제 목록이 변경될 때마다 제출 통계 조회

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMoreMenu !== null && !event.target.closest('.admin-more-menu')) {
        setOpenMoreMenu(null);
      }
    };

    if (openMoreMenu !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openMoreMenu]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      // 1. 먼저 dashboard에서 분반 정보 가져오기
      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || [];
      setSections(sectionsData);
      
      // 현재 분반 정보 설정
      if (sectionId) {
        const currentSectionData = sectionsData.find(section => 
          section.sectionId === parseInt(sectionId)
        );
        setCurrentSection(currentSectionData);
      }
      
      // 2. 과제 조회 (분반별 또는 전체)
      let allAssignments = [];
      
      if (sectionId) {
        // 분반별 과제 관리: 해당 분반의 과제만 조회
        try {
          const currentSection = sectionsData.find(section => section.sectionId === parseInt(sectionId));
          if (currentSection) {
            const sectionAssignments = await APIService.getAssignmentsBySection(parseInt(sectionId));
            
            // 각 과제의 문제 수 조회
            const assignmentsWithDetails = await Promise.all(
              (sectionAssignments || []).map(async (assignment) => {
                try {
                  const problems = await APIService.getAssignmentProblems(parseInt(sectionId), assignment.id);
                  
                  return {
                    ...assignment,
                    sectionName: `${currentSection.courseTitle} - ${currentSection.sectionNumber}분반`,
                    sectionId: parseInt(sectionId),
                    problemCount: problems?.length || 0,
                    problems: problems || [],
                    dueDate: assignment.endDate,
                    submissionCount: 0,
                    totalStudents: currentSection.totalStudents || 0
                  };
                } catch (error) {
                  return {
                    ...assignment,
                    sectionName: `${currentSection.courseTitle} - ${currentSection.sectionNumber}분반`,
                    sectionId: parseInt(sectionId),
                    problemCount: 0,
                    problems: [],
                    dueDate: assignment.endDate,
                    submissionCount: 0,
                    totalStudents: currentSection.totalStudents || 0
                  };
                }
              })
            );
            
            allAssignments = assignmentsWithDetails;
          }
        } catch (error) {
          console.error('분반별 과제 조회 실패:', error);
        }
      } else {
        // 전체 과제 관리: 모든 분반의 과제 조회
        for (const section of sectionsData) {
          try {
            const sectionAssignments = await APIService.getAssignmentsBySection(section.sectionId);
            
            // 각 과제의 문제 수 조회
            const assignmentsWithDetails = await Promise.all(
              (sectionAssignments || []).map(async (assignment) => {
                try {
                  const problems = await APIService.getAssignmentProblems(section.sectionId, assignment.id);
                  
                  return {
                    ...assignment,
                    sectionName: `${section.courseTitle} - ${section.sectionNumber}분반`,
                    sectionId: section.sectionId,
                    problemCount: problems?.length || 0,
                    problems: problems || [],
                    dueDate: assignment.endDate,
                    submissionCount: 0,
                    totalStudents: section.totalStudents || 0
                  };
                } catch (error) {
                  return {
                    ...assignment,
                    sectionName: `${section.courseTitle} - ${section.sectionNumber}분반`,
                    sectionId: section.sectionId,
                    problemCount: 0,
                    problems: [],
                    dueDate: assignment.endDate,
                    submissionCount: 0,
                    totalStudents: section.totalStudents || 0
                  };
                }
              })
            );
            
            allAssignments = [...allAssignments, ...assignmentsWithDetails];
          } catch (error) {
            // 분반 과제 조회 실패 시 무시
          }
        }
      }
      
      setAssignments(allAssignments);
      setLoading(false);
    } catch (error) {
      setAssignments([]);
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    // fetchAssignments에서 이미 처리됨
  };

  const fetchSubmissionStats = async () => {
    try {
      console.log('제출 통계 조회 시작:', { assignments: assignments.length, sectionId });
      console.log('과제 목록:', assignments);
      const stats = {};
      
      for (const assignment of assignments) {
        console.log(`과제 ${assignment.id} 처리 중:`, assignment);
        
        if (sectionId) {
          // 분반별 과제 제출 통계
          console.log(`분반별 과제 ${assignment.id} 제출 통계 조회 중...`);
          const response = await APIService.getAssignmentSubmissionStats(assignment.id, sectionId);
          console.log(`과제 ${assignment.id} 응답:`, response);
          
          // API 응답이 있으면 사용, 없으면 기본값 설정
          if (response) {
            console.log(`과제 ${assignment.id} 응답 데이터:`, {
              totalStudents: response.totalStudents,
              problemStats: response.problemStats
            });
            
            // 백엔드에서 이미 정확한 데이터를 제공하므로 그대로 사용
            stats[assignment.id] = response;
          } else {
            console.log(`과제 ${assignment.id} API 응답 없음`);
            // 백엔드 API 응답이 없으면 해당 과제는 통계에서 제외
          }
        } else {
          // 전체 과제 제출 통계 (교수용) - 분반별로 개별 호출
          console.log(`전체 과제 ${assignment.id} 제출 통계 조회 중...`);
          console.log(`과제 ${assignment.id}의 sectionId:`, assignment.sectionId);
          
          if (!assignment.sectionId) {
            console.error(`과제 ${assignment.id}의 sectionId가 없습니다!`);
            continue; // 이 과제는 건너뛰기
          }
          
          const response = await APIService.getAssignmentSubmissionStats(assignment.id, assignment.sectionId);
          
          if (response) {
            console.log(`과제 ${assignment.id} 전체 통계 데이터:`, response);
            
            // 백엔드에서 이미 정확한 데이터를 제공하므로 그대로 사용
            stats[assignment.id] = response;
          } else {
            console.log(`과제 ${assignment.id} 전체 통계 데이터 없음`);
            // 백엔드 API 응답이 없으면 해당 과제는 통계에서 제외
          }
        }
      }
      
      console.log('최종 제출 통계:', stats);
      setSubmissionStats(stats);
    } catch (error) {
      console.error('제출 통계 조회 실패:', error);
      
      // 에러 발생 시 빈 통계 설정
      setSubmissionStats({});
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      sectionId: '',
      startDate: '',
      endDate: '',
      assignmentNumber: ''
    });
  };

  const handleAddAssignment = () => {
    setShowAddModal(true);
    resetForm();
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // sectionId를 제외한 데이터만 전송
      const { sectionId, ...assignmentData } = formData;
      
      // 날짜 형식을 백엔드가 기대하는 형식으로 변환
      if (assignmentData.startDate) {
        assignmentData.startDate = new Date(assignmentData.startDate).toISOString();
      }
      if (assignmentData.endDate) {
        assignmentData.endDate = new Date(assignmentData.endDate).toISOString();
      }
      
      console.log('과제 생성 요청:', {
        sectionId: parseInt(sectionId),
        assignmentData
      });
      
      const response = await APIService.createAssignment(
        parseInt(sectionId),
        assignmentData
      );
      
      console.log('과제 생성 응답:', response);
      alert('과제가 성공적으로 생성되었습니다.');
      handleCloseModal();
      fetchAssignments(); // 목록 새로고침
    } catch (error) {
      console.error('과제 생성 실패:', error);
      alert('과제 생성에 실패했습니다.');
    }
  };

  const handleEdit = (assignment) => {
    console.log('과제 수정:', assignment);
    setSelectedAssignment(assignment);
    
    // 기존 데이터로 폼 초기화
    setFormData({
      title: assignment.title || '',
      description: assignment.description || '',
      sectionId: assignment.sectionId || '',
      startDate: assignment.startDate ? new Date(assignment.startDate).toISOString().slice(0, 16) : '',
      endDate: assignment.endDate ? new Date(assignment.endDate).toISOString().slice(0, 16) : '',
      assignmentNumber: assignment.assignmentNumber || ''
    });
    
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedAssignment(null);
    resetForm();
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    try {
      // sectionId를 제외한 데이터만 전송
      const { sectionId, ...assignmentData } = formData;
      
      // 날짜 형식을 백엔드가 기대하는 형식으로 변환
      if (assignmentData.startDate) {
        assignmentData.startDate = new Date(assignmentData.startDate).toISOString();
      }
      if (assignmentData.endDate) {
        assignmentData.endDate = new Date(assignmentData.endDate).toISOString();
      }
      
      console.log('과제 수정 요청:', {
        sectionId: selectedAssignment.sectionId,
        assignmentId: selectedAssignment.id,
        assignmentData
      });
      
      const response = await APIService.updateAssignment(
        selectedAssignment.sectionId,
        selectedAssignment.id,
        assignmentData
      );
      
      console.log('과제 수정 응답:', response);
      alert('과제가 성공적으로 수정되었습니다.');
      handleCloseEditModal();
      fetchAssignments(); // 목록 새로고침
    } catch (error) {
      console.error('과제 수정 실패:', error);
      alert('과제 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm('정말로 이 과제를 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없으며, 관련된 모든 제출 기록도 함께 삭제됩니다.')) {
      try {
        if (!sectionId) {
          alert('수업 정보가 없습니다.');
          return;
        }
        await APIService.deleteAssignment(sectionId, assignmentId);
        alert('과제가 성공적으로 삭제되었습니다.');
        fetchAssignments(); // 목록 새로고침
      } catch (error) {
        console.error('과제 삭제 실패:', error);
        alert('과제 삭제에 실패했습니다. ' + (error.message || ''));
      }
    }
  };

  const handleToggleActive = async (sectionId, assignmentId, currentActive) => {
    try {
      const newActive = !currentActive;
      await APIService.toggleAssignmentActive(sectionId, assignmentId, newActive);
      fetchAssignments(); // 목록 새로고침
    } catch (error) {
      console.error('과제 활성화 상태 변경 실패:', error);
      alert('과제 활성화 상태 변경에 실패했습니다.');
    }
  };

  // 문제 추가 관련 함수들
  const handleAddProblem = async (assignment) => {
    setSelectedAssignment(assignment);
    setShowProblemModal(true);
    setSelectedProblemIds([]);
    setSelectedProblemDetail(null);
    setProblemSearchTerm('');
    await fetchAvailableProblems();
  };

  const handleSectionChangeForProblem = async (sectionId) => {
    setSelectedSectionForProblem(sectionId);
    setExpandedAssignmentsForProblem({});
    setAssignmentProblems({});
    setSelectedProblemIds([]);
    setCopyProblemSearchTerm('');
    
    if (!sectionId) {
      setAssignmentsForProblem([]);
        return;
      }

    try {
      setLoadingAssignmentsForProblem(true);
      const assignments = await APIService.getAssignmentsBySection(parseInt(sectionId));
      const assignmentsData = assignments.data || assignments;
      
      // 각 과제의 문제 목록 가져오기
      const assignmentsWithProblems = await Promise.all(
        assignmentsData.map(async (assignment) => {
          try {
            const problemsResponse = await APIService.getAssignmentProblems(parseInt(sectionId), assignment.id);
          const problems = problemsResponse.data || problemsResponse;
            return {
              ...assignment,
              problems: Array.isArray(problems) ? problems : (problems.problems || [])
            };
          } catch (error) {
            console.error(`과제 ${assignment.id}의 문제 조회 실패:`, error);
            return {
              ...assignment,
              problems: []
            };
          }
        })
      );
      
      setAssignmentsForProblem(assignmentsWithProblems);
      
      // assignmentProblems 맵 초기화
      const problemsMap = {};
      assignmentsWithProblems.forEach(assignment => {
        problemsMap[assignment.id] = assignment.problems || [];
      });
      setAssignmentProblems(problemsMap);
        } catch (error) {
      console.error('과제 목록 조회 실패:', error);
      setAssignmentsForProblem([]);
    } finally {
      setLoadingAssignmentsForProblem(false);
    }
  };

  const toggleAssignmentForProblem = (assignmentId) => {
    setExpandedAssignmentsForProblem(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  const handleProblemToggleForAdd = (assignmentId, problemId) => {
    setSelectedProblemIds(prev => {
      if (prev.includes(problemId)) {
        return prev.filter(id => id !== problemId);
      } else {
        return [...prev, problemId];
      }
    });
  };

  const handleSelectAllProblemsForAssignment = (assignmentId) => {
    const problems = assignmentProblems[assignmentId] || [];
    const problemIds = problems.map(p => p.id);
    const allSelected = problemIds.every(id => selectedProblemIds.includes(id));
    
    if (allSelected) {
      // 모두 선택 해제
      setSelectedProblemIds(prev => prev.filter(id => !problemIds.includes(id)));
    } else {
      // 모두 선택
      setSelectedProblemIds(prev => {
        const newIds = [...prev];
        problemIds.forEach(id => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      });
    }
  };

  const fetchAvailableProblems = async () => {
    try {
      // 모든 문제 가져오기 (instructor가 만든 문제들)
      const allProblems = await APIService.getAllProblems();
      setAvailableProblems(allProblems);
    } catch (error) {
      console.error('문제 목록 조회 실패:', error);
      setAvailableProblems([]);
    }
  };

  const fetchCopyableProblems = async (sectionId = null) => {
    try {
      if (!sectionId) {
        setCopyableProblems([]);
        return;
      }

      // 선택한 섹션의 모든 과제 조회
      const assignments = await APIService.getAssignmentsBySection(sectionId);
      const assignmentsData = assignments.data || assignments;

      // 모든 과제의 문제들을 수집 (중복 제거)
      const problemMap = new Map();
      
      for (const assignment of assignmentsData) {
        try {
          const problemsResponse = await APIService.getAssignmentProblems(sectionId, assignment.id);
          const problems = problemsResponse.data || problemsResponse;
          
          if (Array.isArray(problems)) {
            problems.forEach(problem => {
              if (!problemMap.has(problem.id)) {
                problemMap.set(problem.id, problem);
              }
            });
          }
        } catch (error) {
          console.error(`과제 ${assignment.id}의 문제 조회 실패:`, error);
        }
      }

      // Map을 배열로 변환
      const problemsArray = Array.from(problemMap.values());
      setCopyableProblems(problemsArray);
      setCurrentProblemPage(1); // 페이지 초기화
    } catch (error) {
      console.error('복사 가능한 문제 목록 조회 실패:', error);
      setCopyableProblems([]);
    }
  };

  const handleCopyProblem = async (problemId, newTitle = null) => {
    try {
      const newProblemId = await APIService.copyProblem(problemId, newTitle);
      alert('문제가 성공적으로 복사되었습니다.');
      setShowCopyProblemModal(false);
      
      // 복사된 문제를 현재 과제에 추가
      if (selectedAssignment) {
        await APIService.addProblemToAssignment(selectedAssignment.id, newProblemId);
        alert('복사된 문제가 과제에 추가되었습니다.');
        fetchAssignments();
      }
    } catch (error) {
      console.error('문제 복사 실패:', error);
      alert(error.message || '문제 복사에 실패했습니다.');
    }
  };

  const handleSelectProblem = async (problemIds) => {
    try {
      // 문제를 복사한 후 과제에 추가 (1:1 매핑을 위해)
      for (const problemId of problemIds) {
        // 문제 복사
        const newProblemId = await APIService.copyProblem(problemId);
        // 복사된 문제를 과제에 추가
        await APIService.addProblemToAssignment(selectedAssignment.id, newProblemId);
      }
      alert(`${problemIds.length}개의 문제가 성공적으로 복사되어 추가되었습니다.`);
      setShowProblemModal(false);
      setSelectedProblemIds([]);
      fetchAssignments(); // 목록 새로고침
    } catch (error) {
      console.error('문제 추가 실패:', error);
      alert('문제 추가에 실패했습니다. ' + (error.message || ''));
    }
  };

  const handleProblemToggle = (problemId) => {
    setSelectedProblemIds(prev => {
      if (prev.includes(problemId)) {
        return prev.filter(id => id !== problemId);
      } else {
        return [...prev, problemId];
      }
    });
  };

  const handleSelectAllProblems = () => {
    if (selectedProblemIds.length === filteredProblems.length && filteredProblems.length > 0) {
      setSelectedProblemIds([]);
    } else {
      setSelectedProblemIds(filteredProblems.map(p => p.id));
    }
  };

  const handleRemoveProblem = async (assignmentId, problemId) => {
    if (window.confirm('이 문제를 과제에서 제거하시겠습니까?')) {
      try {
        await APIService.removeProblemFromAssignment(assignmentId, problemId);
        alert('문제가 성공적으로 제거되었습니다.');
        fetchAssignments(); // 목록 새로고침
      } catch (error) {
        console.error('문제 제거 실패:', error);
        alert('문제 제거에 실패했습니다.');
      }
    }
  };

  const handleCreateNewProblem = () => {
    setShowProblemModal(false);
    setShowCreateProblemModal(true);
  };

  const handleProblemInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      
      // 파일 타입 검증
      if (name === 'descriptionFile') {
        const allowedTypes = ['.md', '.txt', '.tex'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        if (!allowedTypes.includes(fileExtension)) {
          alert('문제 설명 파일은 .md, .txt, .tex 형식만 업로드 가능합니다.');
          e.target.value = '';
          return;
        }
      }
      
      if (name === 'zipFile') {
        if (!file.name.toLowerCase().endsWith('.zip')) {
          alert('문제 파일은 .zip 형식만 업로드 가능합니다.');
          e.target.value = '';
          return;
        }
        
        // 파일 크기 검증 (50MB 제한)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          alert('파일 크기는 50MB를 초과할 수 없습니다.');
          e.target.value = '';
          return;
        }
      }
      
      setProblemFormData(prev => ({
        ...prev,
        [name]: file
      }));
    } else {
      setProblemFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCreateProblemSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!problemFormData.title.trim()) {
      alert('문제 제목을 입력해주세요.');
      return;
    }
    
    if (!problemFormData.zipFile) {
      alert('문제 파일(.zip)을 업로드해주세요.');
      return;
    }
    
    try {
      // 디버깅: 현재 인증 상태 확인
      const currentToken = localStorage.getItem('accessToken');
      console.log('🔐 현재 인증 상태:', {
        hasLocalStorageToken: !!currentToken,
        tokenPreview: currentToken ? currentToken.substring(0, 20) + '...' : null
      });
      
      // 로딩 상태 표시를 위한 상태 추가 (필요시)
      console.log('문제 생성 시작:', {
        title: problemFormData.title,
        hasDescriptionFile: !!problemFormData.descriptionFile,
        hasZipFile: !!problemFormData.zipFile,
        zipFileSize: problemFormData.zipFile?.size
      });
      
      const formData = new FormData();
      formData.append('title', problemFormData.title);
      
      if (problemFormData.descriptionFile) {
        formData.append('descriptionFile', problemFormData.descriptionFile);
      }
      
      if (problemFormData.zipFile) {
        formData.append('zipFile', problemFormData.zipFile);
      }

      // 문제 생성
      const response = await APIService.createProblem(formData);
      // 백엔드에서 단순히 숫자(Long)를 반환하므로 직접 사용
      const problemId = response;
      
      console.log('문제 생성 성공, ID:', problemId, typeof problemId);
      
      alert('문제가 성공적으로 생성되었습니다. 문제 목록에서 원하는 과제에 추가할 수 있습니다.');
      setShowCreateProblemModal(false);
      resetProblemForm();
      fetchAssignments(); // 목록 새로고침
    } catch (error) {
      console.error('문제 생성 실패:', error);
      
      // 에러 메시지 개선
      let errorMessage = '문제 생성에 실패했습니다.';
      if (error.message) {
        errorMessage += `\n오류: ${error.message}`;
      }
      if (error.response?.data?.message) {
        errorMessage += `\n서버 오류: ${error.response.data.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const resetProblemForm = () => {
    setProblemFormData({
      title: '',
      descriptionFile: null,
      zipFile: null
    });
  };

  const closeProblemModals = () => {
    setShowProblemModal(false);
    setShowCreateProblemModal(false);
    setSelectedAssignment(null);
    setProblemSearchTerm('');
    setSelectedProblemIds([]);
    setSelectedProblemDetail(null);
    resetProblemForm();
  };

  // 독립적인 문제 생성 관련 함수들
  const handleStandaloneProblemCreate = () => {
    setShowStandaloneProblemModal(true);
    resetProblemForm();
  };

  const closeStandaloneProblemModal = () => {
    setShowStandaloneProblemModal(false);
    resetProblemForm();
  };

  const handleStandaloneProblemSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!problemFormData.title.trim()) {
      alert('문제 제목을 입력해주세요.');
      return;
    }
    
    if (!problemFormData.zipFile) {
      alert('문제 파일(.zip)을 업로드해주세요.');
      return;
    }
    
    try {
      console.log('독립적인 문제 생성 시작:', {
        title: problemFormData.title,
        hasDescriptionFile: !!problemFormData.descriptionFile,
        hasZipFile: !!problemFormData.zipFile,
        zipFileSize: problemFormData.zipFile?.size
      });
      
      const formData = new FormData();
      formData.append('title', problemFormData.title);
      
      if (problemFormData.descriptionFile) {
        formData.append('descriptionFile', problemFormData.descriptionFile);
      }
      
      if (problemFormData.zipFile) {
        formData.append('zipFile', problemFormData.zipFile);
      }

      // 문제 생성 (과제에 자동 추가하지 않음)
      const response = await APIService.createProblem(formData);
      const problemId = response;
      
      console.log('독립적인 문제 생성 성공, ID:', problemId);
      
      alert(`문제가 성공적으로 생성되었습니다.\n문제 ID: ${problemId}\n\n이제 원하는 과제에서 "문제 추가" 버튼을 통해 이 문제를 추가할 수 있습니다.`);
      closeStandaloneProblemModal();
      // 필요시 문제 목록 새로고침을 위해 availableProblems 업데이트
      fetchAvailableProblems();
    } catch (error) {
      console.error('독립적인 문제 생성 실패:', error);
      
      let errorMessage = '문제 생성에 실패했습니다.';
      if (error.message) {
        errorMessage += `\n오류: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // 대량 문제 생성 관련 함수들
  const handleBulkProblemCreate = () => {
    setShowBulkProblemModal(true);
    setBulkProblemData({
      problems: [{ title: '', descriptionFile: null, zipFile: null }]
    });
  };

  const closeBulkProblemModal = () => {
    setShowBulkProblemModal(false);
    setBulkProblemData({
      problems: [{ title: '', descriptionFile: null, zipFile: null }]
    });
  };

  const addProblemRow = () => {
    setBulkProblemData(prev => ({
      ...prev,
      problems: [...prev.problems, { title: '', descriptionFile: null, zipFile: null }]
    }));
  };

  const removeProblemRow = (index) => {
    if (bulkProblemData.problems.length > 1) {
      setBulkProblemData(prev => ({
        ...prev,
        problems: prev.problems.filter((_, i) => i !== index)
      }));
    }
  };

  const handleBulkProblemInputChange = (index, field, value) => {
    setBulkProblemData(prev => ({
      ...prev,
      problems: prev.problems.map((problem, i) => 
        i === index ? { ...problem, [field]: value } : problem
      )
    }));
  };

  const handleBulkProblemFileChange = (index, field, file) => {
    // 파일 검증
    if (field === 'descriptionFile') {
      const allowedTypes = ['.md', '.txt', '.tex'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedTypes.includes(fileExtension)) {
        alert('문제 설명 파일은 .md, .txt, .tex 형식만 업로드 가능합니다.');
        return;
      }
    }
    
    if (field === 'zipFile') {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        alert('문제 파일은 .zip 형식만 업로드 가능합니다.');
        return;
      }
      
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        alert('파일 크기는 50MB를 초과할 수 없습니다.');
        return;
      }
    }

    setBulkProblemData(prev => ({
      ...prev,
      problems: prev.problems.map((problem, i) => 
        i === index ? { ...problem, [field]: file } : problem
      )
    }));
  };

  const handleBulkProblemSubmit = async (e) => {
    e.preventDefault();
    
    // 모든 문제 검증
    for (let i = 0; i < bulkProblemData.problems.length; i++) {
      const problem = bulkProblemData.problems[i];
      if (!problem.title.trim()) {
        alert(`${i + 1}번째 문제의 제목을 입력해주세요.`);
        return;
      }
      if (!problem.zipFile) {
        alert(`${i + 1}번째 문제의 파일(.zip)을 업로드해주세요.`);
        return;
      }
    }

    try {
      console.log('대량 문제 생성 시작:', bulkProblemData.problems.length, '개');
      
      const createdProblems = [];
      
      for (let i = 0; i < bulkProblemData.problems.length; i++) {
        const problem = bulkProblemData.problems[i];
        console.log(`${i + 1}/${bulkProblemData.problems.length} 문제 생성 중: ${problem.title}`);
        
        const formData = new FormData();
        formData.append('title', problem.title);
        
        if (problem.descriptionFile) {
          formData.append('descriptionFile', problem.descriptionFile);
        }
        
        if (problem.zipFile) {
          formData.append('zipFile', problem.zipFile);
        }

        try {
          const response = await APIService.createProblem(formData);
          const problemId = response;
          createdProblems.push({ id: problemId, title: problem.title });
          console.log(`문제 생성 완료: ${problem.title} (ID: ${problemId})`);
        } catch (error) {
          console.error(`문제 생성 실패: ${problem.title}`, error);
          alert(`${problem.title} 문제 생성에 실패했습니다.\n오류: ${error.message}\n\n지금까지 ${createdProblems.length}개 문제가 생성되었습니다.`);
          break;
        }
      }
      
      if (createdProblems.length > 0) {
        const problemList = createdProblems.map(p => `• ${p.title} (ID: ${p.id})`).join('\n');
        alert(`${createdProblems.length}개의 문제가 성공적으로 생성되었습니다!\n\n${problemList}\n\n원하는 과제에서 "문제 추가" 버튼으로 추가할 수 있습니다.`);
        closeBulkProblemModal();
        fetchAvailableProblems();
      }
    } catch (error) {
      console.error('대량 문제 생성 실패:', error);
      alert('문제 생성 중 오류가 발생했습니다.');
    }
  };

  const toggleAssignment = (assignmentId) => {
    setExpandedAssignments(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#52c41a';
      case 'medium': return '#faad14';
      case 'hard': return '#ff4d4f';
      default: return '#666';
    }
  };

  const getSemesterLabel = (semester) => {
    const labels = {
      'SPRING': '1학기',
      'FALL': '2학기',
      'CAMP': '캠프',
      'SPECIAL': '특강',
      'IRREGULAR': '비정규 세션'
    };
    return labels[semester] || semester;
  };

  // 문제 필터링 (현재 수업의 문제들)
  const filteredProblems = availableProblems.filter(problem =>
    problem.title.toLowerCase().includes(problemSearchTerm.toLowerCase())
  );

  // 기존 문제 가져오기 모달에서의 문제 필터링 (선택한 수업의 문제들)
  const getFilteredProblemsForCopy = () => {
    if (!selectedSectionForProblem) return [];
    
    const allProblems = [];
    assignmentsForProblem.forEach(assignment => {
      const problems = assignmentProblems[assignment.id] || [];
      allProblems.push(...problems);
    });
    
    if (copyProblemSearchTerm) {
      return allProblems.filter(problem =>
        problem.title.toLowerCase().includes(copyProblemSearchTerm.toLowerCase())
      );
    }
    return allProblems;
  };

  const getSubmissionRate = (submitted, total) => {
    return total > 0 ? Math.round((submitted / total) * 100) : 0;
  };

  // 필터링된 과제 목록
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = filterSection === 'ALL' || assignment.sectionName.includes(filterSection);
    return matchesSearch && matchesSection;
  });

  // 페이지네이션
  const totalPages = Math.ceil(filteredAssignments.length / ASSIGNMENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * ASSIGNMENTS_PER_PAGE;
  const endIndex = startIndex + ASSIGNMENTS_PER_PAGE;
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

  // 검색어 변경 시 첫 페이지로
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSection]);

  // 고유한 섹션 목록 추출
  const uniqueSections = [...new Set(assignments.map(assignment => assignment.sectionName))].filter(Boolean);

  if (loading) {
    return (
      <AdminLayout selectedSection={currentSection}>
        <div className="admin-loading-container">
          <div className="admin-loading-spinner"></div>
          <p>과제 데이터를 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout selectedSection={currentSection}>
      <>
      {/* 분반별 페이지인 경우 통합 네비게이션 표시 */}
      {sectionId && currentSection && (
        <>
          <div className="admin-page-header">
            <h1 className="admin-page-title">과제 관리</h1>
            <div className="admin-header-actions">
              <button 
                className="admin-btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                과제 추가하기
              </button>
            </div>
          </div>
          
          <div className="admin-filters-section">
            <div className="admin-search-box">
              <input
                type="text"
                placeholder="과제명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>
        </>
      )}
      
      {/* 전체 페이지인 경우 기존 헤더 유지 */}
      {!sectionId && (
        <div className="assignment-management">
          <div className="admin-page-header">
          <div className="admin-header-left">
            <h1 className="admin-page-title">전체 과제 관리</h1>
            {/* 분반별 페이지가 아닌 경우에만 검색창 표시 */}
            {!sectionId && (
              <div className="admin-search-box">
                <input
                  type="text"
                  placeholder="과제명, 설명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-search-input"
                />
              </div>
            )}
          </div>
          <div className="admin-header-right">
            {/* 분반별 페이지가 아닌 경우에만 필터 표시 */}
            {!sectionId && (
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="section-filter"
              >
                <option value="ALL">모든 수업</option>
                {uniqueSections.map((section, index) => (
                  <option key={index} value={section}>{section}</option>
                ))}
              </select>
            )}
            <div className="admin-header-actions">
              <button 
                className="admin-btn-secondary"
                onClick={handleStandaloneProblemCreate}
                title="단일 문제를 생성합니다"
              >
                <span>📝</span>
                새 문제 만들기
              </button>
              <button 
                className="admin-btn-secondary"
                onClick={handleBulkProblemCreate}
                title="여러 문제를 한번에 생성합니다"
              >
                문제 대량 생성
              </button>
              <button 
                className="admin-btn-secondary admin-btn-primary-color"
                onClick={handleAddAssignment}
              >
                새 과제 만들기
              </button>
            </div>
          </div>
        </div>
        </div>
      )}
      
      <div className="assignment-management">
        {sectionId ? (
          <div className="admin-assignments-table-container">
            <table className="admin-assignments-table">
              <thead>
                <tr>
                  <th>과제 제목</th>
                  <th>마감일</th>
                  <th>문제 수</th>
                  <th>제출 현황</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="admin-table-empty">
                      과제가 없습니다.
                    </td>
                  </tr>
                ) : (
                  paginatedAssignments.map((assignment) => (
                    <tr key={assignment.id} className={assignment.active === false ? 'admin-disabled' : ''}>
                      <td className="admin-assignment-title-cell">
                        <div>
                          <div className="admin-assignment-title">{assignment.title}</div>
                          {assignment.description && (
                            <div className="admin-assignment-description">{assignment.description}</div>
                          )}
                  </div>
                      </td>
                      <td className="admin-assignment-meta-cell">
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }) : '미설정'}
                      </td>
                      <td className="admin-assignment-meta-cell">{assignment.problemCount || 0}개</td>
                      <td className="admin-assignment-meta-cell">
                        {submissionStats[assignment.id] ? 
                          `${submissionStats[assignment.id].submittedStudents}/${submissionStats[assignment.id].totalStudents}` 
                          : `0/${assignment.totalStudents || 0}`}
                      </td>
                      <td className="admin-assignment-actions-cell">
                        <div className="admin-assignment-actions-inline">
                    <button 
                            className="admin-btn-table-action"
                            onClick={() => {
                              setSelectedAssignmentForProblemList(assignment);
                              setShowProblemListModal(true);
                              setProblemListSearchTerm('');
                            }}
                          >
                            문제 목록 관리
                    </button>
                    <button 
                            className="admin-btn-table-action"
                            onClick={() => handleAddProblem(assignment)}
                          >
                            문제 추가
                          </button>
                          <button 
                            className="admin-btn-table-action admin-btn-edit"
                      onClick={() => handleEdit(assignment)}
                    >
                      수정
                    </button>
                          <div className="admin-more-menu">
                      <button 
                              className="admin-btn-table-action admin-btn-more"
                        title="더보기"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMoreMenu(openMoreMenu === assignment.id ? null : assignment.id);
                        }}
                      >
                        ⋯
                      </button>
                            {openMoreMenu === assignment.id && (
                              <div className="admin-more-dropdown">
                        <button 
                                  className="admin-btn-text-small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleActive(assignment.sectionId, assignment.id, assignment.active);
                                    setOpenMoreMenu(null);
                                  }}
                        >
                          {assignment.active ? '비활성화' : '활성화'}
                        </button>
                        <button 
                                  className="admin-btn-text-small admin-delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(assignment.id);
                                    setOpenMoreMenu(null);
                                  }}
                        >
                          삭제
                        </button>
                      </div>
                            )}
                    </div>
                  </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="admin-pagination">
                <div className="admin-pagination-info">
                  총 {filteredAssignments.length}개 중 {startIndex + 1}-{Math.min(endIndex, filteredAssignments.length)}개 표시
                </div>
                <div className="admin-pagination-controls">
                  <button
                    className="admin-btn-pagination"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    이전
                  </button>
                  <div className="admin-pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`admin-btn-pagination-page ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
              </div>
                  <button
                    className="admin-btn-pagination"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="admin-assignments-list">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className={`admin-assignment-list-item ${expandedAssignments[assignment.id] ? 'admin-expanded' : ''} ${assignment.active === false ? 'admin-disabled' : ''}`}>
              <div className="admin-assignment-list-main">
                <div className="admin-assignment-list-info">
                  <div className="admin-assignment-list-title-section">
                    <h3 className="admin-assignment-list-title">{assignment.title}</h3>
                    {assignment.description && (
                      <p className="admin-assignment-list-description">{assignment.description}</p>
                    )}
              </div>
                  <div className="admin-assignment-list-meta">
                    <span className="admin-assignment-meta-item">
                      <span className="admin-meta-label">마감일</span>
                      <span className="admin-meta-value">
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '미설정'}
                </span>
                </span>
                    <span className="admin-assignment-meta-item">
                      <span className="admin-meta-label">문제 수</span>
                      <span className="admin-meta-value">{assignment.problemCount || 0}개</span>
                    </span>
                    <span className="admin-assignment-meta-item">
                      <span className="admin-meta-label">제출현황</span>
                      <span className="admin-meta-value">
                  {submissionStats[assignment.id] ? 
                    `${submissionStats[assignment.id].submittedStudents}/${submissionStats[assignment.id].totalStudents}` 
                    : `0/${assignment.totalStudents || 0}`}
                      </span>
                </span>
              </div>
                </div>
                <div className="admin-assignment-list-actions">
              <button 
                    className="admin-btn-list-action"
                onClick={() => toggleAssignment(assignment.id)}
              >
                {expandedAssignments[assignment.id] ? '문제 목록 숨기기' : '문제 목록 보기'}
              </button>
                  <button 
                    className="admin-btn-list-action"
                    onClick={() => handleAddProblem(assignment)}
                  >
                    문제 추가
                  </button>
                  <button 
                    className="admin-btn-list-action"
                      onClick={() => handleEdit(assignment)}
                    >
                      수정
                    </button>
                  <div className="admin-more-menu">
                      <button 
                      className="admin-btn-list-action admin-btn-more"
                        title="더보기"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMoreMenu(openMoreMenu === assignment.id ? null : assignment.id);
                        }}
                      >
                        ⋯
                      </button>
                    {openMoreMenu === assignment.id && (
                      <div className="admin-more-dropdown">
                        <button 
                          className="admin-btn-text-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(assignment.sectionId, assignment.id, assignment.active);
                            setOpenMoreMenu(null);
                          }}
                        >
                          {assignment.active ? '비활성화' : '활성화'}
                        </button>
                        <button 
                          className="admin-btn-text-small admin-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(assignment.id);
                            setOpenMoreMenu(null);
                          }}
                        >
                          삭제
                  </button>
                </div>
                    )}
                  </div>
                </div>
              </div>

              {expandedAssignments[assignment.id] && (
                <div className="assignment-expanded-content">
                  <div className="admin-problems-section">
                <div className="admin-problems-header">
                  <h4 className="admin-problems-title">문제 목록 ({assignment.problemCount || 0}개)</h4>
                </div>
                <div className="admin-problems-list">
                  {assignment.problems && assignment.problems.length > 0 ? (
                    assignment.problems.map((problem, index) => (
                      <div key={problem.id || index} className="admin-problem-item">
                        <div className="admin-problem-item-left">
                          <span className="admin-problem-number">{index + 1}.</span>
                          <span className="admin-problem-title">{removeCopyLabel(problem.title)}</span>
                          {problem.difficulty && (
                            <span 
                              className="admin-problem-difficulty"
                              style={{ color: getDifficultyColor(problem.difficulty) }}
                            >
                              [{problem.difficulty}]
                            </span>
                          )}
                        </div>
                        
                        {/* 문제별 제출률 표시 (정답을 맞춘 학생 수 기준) */}
                        <span className="admin-problem-submission-rate">
                          {submissionStats[assignment.id]?.problemStats ? (
                            (() => {
                              const problemStat = submissionStats[assignment.id].problemStats.find(
                                stat => stat.problemId === problem.id
                              );
                              return problemStat ? (
                                <>
                                  제출 현황: {problemStat.correctSubmissions || 0}/{problemStat.totalStudents}
                                </>
                              ) : (
                                `제출 현황: 0/${submissionStats[assignment.id]?.totalStudents || assignment.totalStudents || 0}`
                              );
                            })()
                          ) : (
                            `제출 현황: 0/${submissionStats[assignment.id]?.totalStudents || assignment.totalStudents || 0}`
                          )}
                        </span>
                        
                        <button 
                          className="admin-btn-remove-problem"
                          onClick={() => handleRemoveProblem(assignment.id, problem.id)}
                          title="문제 제거"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="admin-no-problems">
                      <p>등록된 문제가 없습니다.</p>
                      <button 
                        className="admin-btn-add-first-problem"
                        onClick={() => handleAddProblem(assignment)}
                      >
                        첫 번째 문제 추가하기
                      </button>
                    </div>
                  )}
                </div>
              </div>

                  <div className="admin-progress-container">
                    <div className="admin-progress-info">
                      <span className="admin-progress-label">완료율</span>
                      <span className="admin-progress-count">
                        {(() => {
                          const stats = submissionStats[assignment.id];
                          if (!stats || !stats.problemStats || stats.problemStats.length === 0) {
                            return `0 / ${stats?.totalStudents || assignment.totalStudents || 0}명`;
                          }
                          
                          const totalStudents = stats.totalStudents || assignment.totalStudents || 0;
                          const totalProblems = assignment.problems?.length || 0;
                          
                          if (totalStudents === 0 || totalProblems === 0) {
                            return `0 / ${totalStudents}명`;
                          }
                          
                          // 모든 문제를 다 푼 학생 수 계산
                          const completedStudents = stats.problemStats.reduce((min, problemStat) => {
                            return Math.min(min, problemStat.submittedStudents || 0);
                          }, totalStudents);
                          
                          return `${completedStudents} / ${totalStudents}명`;
                        })()}
                      </span>
                    </div>
                    <div className="admin-progress-bar">
                      <div 
                        className="admin-progress-fill"
                        style={{ 
                          width: `${(() => {
                            const stats = submissionStats[assignment.id];
                            if (!stats || !stats.problemStats || stats.problemStats.length === 0) {
                              return 0;
                            }
                            
                            const totalStudents = stats.totalStudents || assignment.totalStudents || 0;
                            const totalProblems = assignment.problems?.length || 0;
                            
                            if (totalStudents === 0 || totalProblems === 0) {
                              return 0;
                            }
                            
                            // 모든 문제를 다 푼 학생 수 계산
                            const completedStudents = stats.problemStats.reduce((min, problemStat) => {
                              return Math.min(min, problemStat.submittedStudents || 0);
                            }, totalStudents);
                            
                            return Math.round((completedStudents / totalStudents) * 100);
                          })()}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredAssignments.length === 0 && (
            <div className="admin-no-assignments">
              <div className="admin-no-assignments-message">
                <span className="admin-no-assignments-icon">📝</span>
                <p>
                  {searchTerm || filterSection !== 'ALL' 
                    ? '검색 조건에 맞는 과제가 없습니다.' 
                    : '아직 생성된 과제가 없습니다.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
        )}

        {/* 과제 추가 모달 */}
        {showAddModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h2>새 과제 추가</h2>
                <button 
                  className="admin-modal-close"
                  onClick={handleCloseModal}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="assignment-form">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label htmlFor="title">과제명 *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="과제명을 입력하세요"
                      required
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label htmlFor="assignmentNumber">과제 번호</label>
                    <input
                      type="text"
                      id="assignmentNumber"
                      name="assignmentNumber"
                      value={formData.assignmentNumber}
                      onChange={handleInputChange}
                      placeholder="예: HW1, Assignment1"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="sectionId">분반 선택 *</label>
                  <select
                    id="sectionId"
                    name="sectionId"
                    value={formData.sectionId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">분반을 선택하세요</option>
                    {sections.map((section) => (
                      <option key={section.sectionId} value={section.sectionId}>
                        {section.courseTitle} (분반 {section.sectionNumber || section.sectionId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="description">과제 설명</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="과제에 대한 상세 설명을 입력하세요"
                    rows="4"
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label htmlFor="startDate">시작일</label>
                    <input
                      type="datetime-local"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label htmlFor="endDate">마감일</label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="admin-form-actions">
                  <button 
                    type="button" 
                    className="admin-btn-secondary"
                    onClick={handleCloseModal}
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="admin-btn-primary"
                  >
                    과제 생성
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 과제 수정 모달 */}
        {showEditModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h2>과제 수정</h2>
                <button 
                  className="admin-modal-close"
                  onClick={handleCloseEditModal}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleUpdateAssignment} className="assignment-form">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label htmlFor="edit-title">과제명 *</label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="과제명을 입력하세요"
                      required
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label htmlFor="edit-assignmentNumber">과제 번호</label>
                    <input
                      type="text"
                      id="edit-assignmentNumber"
                      name="assignmentNumber"
                      value={formData.assignmentNumber}
                      onChange={handleInputChange}
                      placeholder="예: HW1, Assignment1"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="edit-sectionId">분반 선택 *</label>
                  <select
                    id="edit-sectionId"
                    name="sectionId"
                    value={formData.sectionId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">분반을 선택하세요</option>
                    {sections.map((section) => (
                      <option key={section.sectionId} value={section.sectionId}>
                        {section.courseTitle} (분반 {section.sectionNumber || section.sectionId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="edit-description">과제 설명</label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="과제에 대한 상세 설명을 입력하세요"
                    rows="4"
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label htmlFor="edit-startDate">시작일</label>
                    <input
                      type="datetime-local"
                      id="edit-startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label htmlFor="edit-endDate">마감일</label>
                    <input
                      type="datetime-local"
                      id="edit-endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="admin-form-actions">
                  <button 
                    type="button" 
                    className="admin-btn-secondary"
                    onClick={handleCloseEditModal}
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="admin-btn-primary"
                  >
                    과제 수정
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 문제 선택 모달 (현재 수업의 문제들) */}
        {showProblemModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content admin-problem-modal admin-problem-modal-large">
              <div className="admin-modal-header">
                <h2>문제 추가 - {selectedAssignment?.title}</h2>
                <button 
                  className="admin-modal-close"
                  onClick={closeProblemModals}
                >
                  ✕
                </button>
              </div>
              
              <div className="admin-problem-modal-body">
                <div className="admin-problem-search-section">
                    <input
                      type="text"
                      placeholder="문제명으로 검색..."
                      value={problemSearchTerm}
                      onChange={(e) => setProblemSearchTerm(e.target.value)}
                      className="admin-search-input"
                    />
                  </div>

                {filteredProblems.length > 0 && (
                  <div className="admin-problem-selection-header">
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedProblemIds.length === filteredProblems.length && filteredProblems.length > 0}
                        onChange={handleSelectAllProblems}
                      />
                      <span>전체 선택</span>
                    </label>
                    <span className="admin-item-count">
                      {selectedProblemIds.length} / {filteredProblems.length}개 선택됨
                    </span>
                  </div>
                )}

                <div className="admin-available-problems-grid">
                  {filteredProblems.length > 0 ? (
                    filteredProblems.map((problem) => (
                      <div key={problem.id} className="admin-problem-card">
                        <div className="admin-problem-card-header">
                          <input
                            type="checkbox"
                            checked={selectedProblemIds.includes(problem.id)}
                            onChange={() => handleProblemToggle(problem.id)}
                            className="admin-problem-checkbox"
                          />
                        </div>
                        <div className="admin-problem-card-body">
                          <h4 className="admin-problem-card-title">{removeCopyLabel(problem.title)}</h4>
                          <div className="admin-problem-card-meta-row">
                            <span className="admin-problem-card-date">
                              생성일: {new Date(problem.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                    <button 
                              className="admin-btn-view-detail-card"
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
                    ))
                  ) : (
                    <div className="admin-no-available-problems">
                      <p>사용 가능한 문제가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-modal-footer">
                  <div className="admin-problem-action-buttons">
                    <button 
                    type="button"
                      className="admin-btn-copy-problem"
                      onClick={() => {
                      setShowProblemModal(false);
                        setShowCopyProblemModal(true);
                      setSelectedSectionForProblem('');
                      setAssignmentsForProblem([]);
                      setExpandedAssignmentsForProblem({});
                      setAssignmentProblems({});
                      setCopyProblemSearchTerm('');
                      setProblemViewMode('list');
                      }}
                    >
                      기존 문제 가져오기
                    </button>
                    <button 
                    type="button"
                      className="admin-btn-create-new"
                      onClick={handleCreateNewProblem}
                    >
                      새 문제 만들기
                    </button>
                  </div>
                {filteredProblems.length > 0 && selectedProblemIds.length > 0 && (
                  <div className="admin-footer-actions">
                        <button 
                      type="button"
                      className="admin-btn-secondary"
                      onClick={closeProblemModals}
                        >
                      취소
                        </button>
                      <button 
                      type="button"
                      className="admin-btn-primary"
                      onClick={() => handleSelectProblem(selectedProblemIds)}
                      >
                      선택한 문제 추가 ({selectedProblemIds.length}개)
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* 새 문제 생성 모달 */}
        {showCreateProblemModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h2>새 문제 만들기</h2>
                <button 
                  className="admin-modal-close"
                  onClick={closeProblemModals}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreateProblemSubmit} className="admin-problem-form">
                <div className="admin-form-group">
                  <label htmlFor="problemTitle">문제 제목 *</label>
                  <input
                    type="text"
                    id="problemTitle"
                    name="title"
                    value={problemFormData.title}
                    onChange={handleProblemInputChange}
                    placeholder="문제 제목을 입력하세요"
                    required
                  />
                </div>

                <div className="admin-info-box">
                  <p><strong>📄 문제 설명 파일 우선순위:</strong></p>
                  <p>1. 별도 업로드 파일 (최우선) - .md, .txt, .tex 지원</p>
                  <p>2. ZIP 파일 내 problem_statement 폴더의 파일 (.tex → .md → .txt 순)</p>
                  <p>3. 파일이 없으면 빈 설명으로 생성됩니다.</p>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="descriptionFile">문제 설명 파일 <span className="admin-optional">(선택사항)</span></label>
                  <input
                    type="file"
                    id="descriptionFile"
                    name="descriptionFile"
                    onChange={handleProblemInputChange}
                    accept=".md,.txt,.tex"
                    className="admin-file-input"
                  />
                  <small className="admin-file-help">
                    마크다운(.md), 텍스트(.txt), LaTeX(.tex) 형식의 문제 설명 파일을 업로드하세요.
                    <br/>이 파일이 있으면 ZIP 파일 내부 설명보다 우선 적용됩니다.
                    {problemFormData.descriptionFile && (
                      <span className="admin-file-selected">선택됨: {problemFormData.descriptionFile.name}</span>
                    )}
                  </small>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="zipFile">문제 파일 (.zip) *</label>
                  <input
                    type="file"
                    id="zipFile"
                    name="zipFile"
                    onChange={handleProblemInputChange}
                    accept=".zip"
                    className="admin-file-input"
                    required
                  />
                  <small className="admin-file-help">
                    테스트 케이스와 정답이 포함된 ZIP 파일을 업로드하세요. (최대 50MB)
                    <br/>ZIP 내부에 problem_statement 폴더가 있으면 자동으로 설명을 추출합니다.
                    {problemFormData.zipFile && (
                      <span className="admin-file-selected">선택됨: {problemFormData.zipFile.name} ({(problemFormData.zipFile.size / 1024 / 1024).toFixed(2)}MB)</span>
                    )}
                  </small>
                </div>

                <div className="admin-form-actions">
                  <button 
                    type="button" 
                    className="admin-btn-secondary"
                    onClick={closeProblemModals}
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="admin-btn-primary"
                  >
                    문제 생성 및 추가
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 독립적인 새 문제 생성 모달 */}
        {showStandaloneProblemModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h2>새 문제 만들기</h2>
                <button 
                  className="admin-modal-close"
                  onClick={closeStandaloneProblemModal}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleStandaloneProblemSubmit} className="admin-problem-form">
                <div className="admin-form-group">
                  <label htmlFor="standaloneProblemTitle">문제 제목 *</label>
                  <input
                    type="text"
                    id="standaloneProblemTitle"
                    name="title"
                    value={problemFormData.title}
                    onChange={handleProblemInputChange}
                    placeholder="문제 제목을 입력하세요"
                    required
                  />
                </div>

                <div className="admin-info-box">
                  <p><strong>📄 문제 설명 파일 우선순위:</strong></p>
                  <p>1. 별도 업로드 파일 (최우선) - .md, .txt, .tex 지원</p>
                  <p>2. ZIP 파일 내 problem_statement 폴더의 파일 (.tex → .md → .txt 순)</p>
                  <p>3. 파일이 없으면 빈 설명으로 생성됩니다.</p>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="standaloneDescriptionFile">문제 설명 파일 <span className="admin-optional">(선택사항)</span></label>
                  <input
                    type="file"
                    id="standaloneDescriptionFile"
                    name="descriptionFile"
                    onChange={handleProblemInputChange}
                    accept=".md,.txt,.tex"
                    className="admin-file-input"
                  />
                  <small className="admin-file-help">
                    마크다운(.md), 텍스트(.txt), LaTeX(.tex) 형식의 문제 설명 파일을 업로드하세요.
                    <br/>이 파일이 있으면 ZIP 파일 내부 설명보다 우선 적용됩니다.
                    {problemFormData.descriptionFile && (
                      <span className="admin-file-selected">선택됨: {problemFormData.descriptionFile.name}</span>
                    )}
                  </small>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="standaloneZipFile">문제 파일 (.zip) *</label>
                  <input
                    type="file"
                    id="standaloneZipFile"
                    name="zipFile"
                    onChange={handleProblemInputChange}
                    accept=".zip"
                    className="admin-file-input"
                    required
                  />
                  <small className="admin-file-help">
                    테스트 케이스와 정답이 포함된 ZIP 파일을 업로드하세요. (최대 50MB)
                    <br/>ZIP 내부에 problem_statement 폴더가 있으면 자동으로 설명을 추출합니다.
                    {problemFormData.zipFile && (
                      <span className="admin-file-selected">선택됨: {problemFormData.zipFile.name} ({(problemFormData.zipFile.size / 1024 / 1024).toFixed(2)}MB)</span>
                    )}
                  </small>
                </div>

                <div className="admin-info-box">
                  <p><strong>💡 안내:</strong></p>
                  <p>• 이 기능은 문제만 생성합니다</p>
                  <p>• 생성 후 원하는 과제에서 "문제 추가" 버튼으로 추가할 수 있습니다</p>
                  <p>• 여러 과제에 동일한 문제를 재사용할 수 있습니다</p>
                </div>

                <div className="admin-form-actions">
                  <button 
                    type="button" 
                    className="admin-btn-secondary"
                    onClick={closeStandaloneProblemModal}
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="admin-btn-primary"
                  >
                    문제 생성
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 대량 문제 생성 모달 */}
        {showBulkProblemModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content admin-large-modal">
              <div className="admin-modal-header">
                <h2>문제 대량 생성</h2>
                <button 
                  className="admin-modal-close"
                  onClick={closeBulkProblemModal}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleBulkProblemSubmit} className="admin-bulk-problem-form">
                <div className="admin-info-box">
                  <p><strong>📄 문제 설명 파일 우선순위:</strong></p>
                  <p>1. 별도 업로드 파일 (최우선) - .md, .txt, .tex 지원</p>
                  <p>2. ZIP 파일 내 problem_statement 폴더의 파일 (.tex → .md → .txt 순)</p>
                  <p>3. 파일이 없으면 빈 설명으로 생성됩니다.</p>
                  <br/>
                  <p><strong>💡 안내:</strong></p>
                  <p>• 여러 문제를 한번에 생성할 수 있습니다</p>
                  <p>• ZIP 파일은 필수, 설명 파일은 선택사항입니다</p>
                  <p>• 생성 후 원하는 과제에서 "문제 추가" 버튼으로 추가할 수 있습니다</p>
                </div>

                <div className="admin-bulk-problems-container">
                  {bulkProblemData.problems.map((problem, index) => (
                    <div key={index} className="admin-bulk-problem-row">
                      <div className="admin-problem-row-header">
                        <h4>문제 {index + 1}</h4>
                        {bulkProblemData.problems.length > 1 && (
                          <button
                            type="button"
                            className="admin-btn-remove-row"
                            onClick={() => removeProblemRow(index)}
                            title="이 문제 제거"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      
                      <div className="admin-problem-row-content">
                        <div className="admin-form-group">
                          <label>문제 제목 *</label>
                          <input
                            type="text"
                            value={problem.title}
                            onChange={(e) => handleBulkProblemInputChange(index, 'title', e.target.value)}
                            placeholder="문제 제목을 입력하세요"
                            required
                          />
                        </div>

                        <div className="admin-form-row">
                          <div className="admin-form-group">
                            <label>문제 설명 파일 <span className="admin-optional">(선택사항)</span></label>
                            <input
                              type="file"
                              onChange={(e) => handleBulkProblemFileChange(index, 'descriptionFile', e.target.files[0])}
                              accept=".md,.txt,.tex"
                              className="admin-file-input"
                            />
                            <small className="admin-file-help">
                              .md, .txt, .tex 형식 지원. ZIP 파일보다 우선 적용됩니다.
                            </small>
                            {problem.descriptionFile && (
                              <small className="admin-file-selected">
                                선택됨: {problem.descriptionFile.name}
                              </small>
                            )}
                          </div>

                          <div className="admin-form-group">
                            <label>문제 파일 (.zip) *</label>
                            <input
                              type="file"
                              onChange={(e) => handleBulkProblemFileChange(index, 'zipFile', e.target.files[0])}
                              accept=".zip"
                              className="admin-file-input"
                              required
                            />
                            <small className="admin-file-help">
                              테스트 케이스 포함. problem_statement 폴더가 있으면 설명 자동 추출.
                            </small>
                            {problem.zipFile && (
                              <small className="admin-file-selected">
                                선택됨: {problem.zipFile.name} ({(problem.zipFile.size / 1024 / 1024).toFixed(2)}MB)
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="admin-bulk-actions">
                  <button
                    type="button"
                    className="admin-btn-add-row"
                    onClick={addProblemRow}
                  >
                    문제 추가
                  </button>
                </div>

                <div className="admin-form-actions">
                  <button 
                    type="button" 
                    className="admin-btn-secondary"
                    onClick={closeBulkProblemModal}
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="admin-btn-primary"
                  >
                    {bulkProblemData.problems.length}개 문제 생성
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 문제 설명보기 패널 */}
        {selectedProblemDetail && (
          <>
            <div className="admin-detail-overlay" onClick={() => setSelectedProblemDetail(null)}></div>
            <div className="admin-detail-panel" onClick={(e) => e.stopPropagation()}>
              <div className="admin-detail-panel-header">
                <h3>문제 설명</h3>
                <button
                  className="admin-btn-close-detail"
                  onClick={() => setSelectedProblemDetail(null)}
                >
                  ×
                </button>
      </div>
              <div className="admin-detail-panel-content">
                <div className="admin-problem-detail-content">
                  <h4 className="admin-detail-title">{selectedProblemDetail.title}</h4>
                  <div className="admin-detail-meta">
                    {selectedProblemDetail.timeLimit && (
                      <span>시간 제한: {selectedProblemDetail.timeLimit}초</span>
                    )}
                    {selectedProblemDetail.memoryLimit && (
                      <span>메모리 제한: {selectedProblemDetail.memoryLimit}MB</span>
                    )}
                  </div>
                  <div className="admin-detail-body admin-problem-description">
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
                                  <code className="admin-inline-code" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <pre className="admin-code-block">
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
              </div>
            </div>
          </>
        )}
      </div>

        {/* 문제 가져오기 모달 (수업 및 문제 선택) */}
        {showCopyProblemModal && (
          <div className="admin-modal-overlay" onClick={() => {
            setShowCopyProblemModal(false);
            setSelectedSectionForProblem('');
            setAssignmentsForProblem([]);
            setExpandedAssignmentsForProblem({});
            setAssignmentProblems({});
            setSelectedProblemIds([]);
            setCopyProblemSearchTerm('');
            setProblemViewMode('list');
            setSelectedProblemDetail(null);
          }}>
            <div className="admin-modal-content admin-problem-modal admin-problem-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <div className="admin-modal-header-left">
                  <button 
                    className="admin-btn-back"
                    onClick={() => {
                      setShowCopyProblemModal(false);
                      setShowProblemModal(true);
                    }}
                    title="뒤로가기"
                  >
                    ←
                  </button>
                <h2>기존 문제 가져오기 - {selectedAssignment?.title}</h2>
                </div>
                <button 
                  className="admin-modal-close"
                  onClick={() => {
                    setShowCopyProblemModal(false);
                    setSelectedSectionForProblem('');
                    setAssignmentsForProblem([]);
                    setExpandedAssignmentsForProblem({});
                    setAssignmentProblems({});
                    setSelectedProblemIds([]);
                    setCopyProblemSearchTerm('');
                    setProblemViewMode('list');
                    setSelectedProblemDetail(null);
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="admin-problem-modal-body">
                <div className="admin-copy-problem-controls">
                  <div className="section-select-box">
                    <label htmlFor="section-select-copy">수업 선택 *</label>
                    <select
                      id="section-select-copy"
                      value={selectedSectionForProblem}
                      onChange={(e) => handleSectionChangeForProblem(e.target.value)}
                      className="section-select"
                    >
                      <option value="">수업을 선택하세요</option>
                      {sections.map((section) => (
                        <option key={section.sectionId} value={section.sectionId}>
                          {section.courseTitle} ({section.year || '2024'}년 {getSemesterLabel(section.semester)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedSectionForProblem && (
                    <div className="admin-copy-problem-toolbar">
                      <div className="admin-problem-search-box">
                    <input
                      type="text"
                      placeholder="문제명으로 검색..."
                      value={copyProblemSearchTerm}
                      onChange={(e) => setCopyProblemSearchTerm(e.target.value)}
                      className="admin-search-input"
                    />
                </div>

                      <div className="admin-view-mode-tabs">
                        <button
                          className={`admin-tab-button ${problemViewMode === 'list' ? 'admin-active' : ''}`}
                          onClick={() => setProblemViewMode('list')}
                        >
                          목록 보기
                        </button>
                        <button
                          className={`admin-tab-button ${problemViewMode === 'hierarchy' ? 'admin-active' : ''}`}
                          onClick={() => setProblemViewMode('hierarchy')}
                        >
                          과제별 보기
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {loadingAssignmentsForProblem ? (
                  <div className="admin-loading-items">과제를 불러오는 중...</div>
                ) : selectedSectionForProblem && assignmentsForProblem.length === 0 ? (
                  <div className="admin-no-items">선택한 수업에 과제가 없습니다.</div>
                ) : selectedSectionForProblem ? (
                  <>
                    {problemViewMode === 'list' ? (
                      <div className="admin-problem-list-view">
                        {(() => {
                          const allProblems = [];
                          assignmentsForProblem.forEach(assignment => {
                            const problems = assignmentProblems[assignment.id] || [];
                            problems.forEach(problem => {
                              if (!allProblems.find(p => p.id === problem.id)) {
                                allProblems.push(problem);
                              }
                            });
                          });

                          const filteredProblems = copyProblemSearchTerm
                            ? allProblems.filter(problem =>
                      problem.title.toLowerCase().includes(copyProblemSearchTerm.toLowerCase())
                    )
                            : allProblems;

                          const allSelected = filteredProblems.length > 0 && 
                                            filteredProblems.every(p => selectedProblemIds.includes(p.id));

                          return (
                            <>
                              <div className="admin-problem-selection-header">
                                <label className="admin-checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={() => {
                                      if (allSelected) {
                                        setSelectedProblemIds([]);
                                      } else {
                                        setSelectedProblemIds(filteredProblems.map(p => p.id));
                                      }
                                    }}
                                  />
                                  <span>전체 선택</span>
                                </label>
                                <span className="admin-item-count">
                                  {selectedProblemIds.length} / {filteredProblems.length}개 선택됨
                            </span>
                          </div>
                              <div className="admin-available-problems-grid">

                                {filteredProblems.length > 0 ? (
                                  filteredProblems.map((problem) => (
                                    <div key={problem.id} className="admin-problem-card">
                                      <div className="admin-problem-card-header">
                                        <input
                                          type="checkbox"
                                          checked={selectedProblemIds.includes(problem.id)}
                                          onChange={() => handleProblemToggle(problem.id)}
                                          className="admin-problem-checkbox"
                                        />
                                      </div>
                                      <div className="admin-problem-card-body">
                                        <h4 className="admin-problem-card-title">{removeCopyLabel(problem.title)}</h4>
                                        <div className="admin-problem-card-meta-row">
                                          <span className="admin-problem-card-date">
                                            생성일: {new Date(problem.createdAt).toLocaleDateString('ko-KR')}
                                          </span>
                          <button 
                                            className="admin-btn-view-detail-card"
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
                      ))
                  ) : (
                    <div className="admin-no-available-problems">
                                    <p>검색 조건에 맞는 문제가 없습니다.</p>
                    </div>
                  )}
                </div>
                            </>
                          );
                        })()}
              </div>
                    ) : (
                      <div className="admin-problem-hierarchy-view">
                        {selectedProblemIds.length > 0 && (
                          <div className="admin-problem-selection-header">
                            <span className="admin-item-count">
                              {selectedProblemIds.length}개 문제 선택됨
                            </span>
                          </div>
                        )}
                        <div className="assignment-list-large">
                          {assignmentsForProblem.map((assignment) => {
                            const isExpanded = expandedAssignmentsForProblem[assignment.id];
                            let assignmentProblemsList = assignmentProblems[assignment.id] || [];
                            
                            if (copyProblemSearchTerm) {
                              assignmentProblemsList = assignmentProblemsList.filter(problem =>
                                problem.title.toLowerCase().includes(copyProblemSearchTerm.toLowerCase())
                              );
                            }
                            
                            const selectedProblems = assignmentProblemsList.filter(p => selectedProblemIds.includes(p.id));
                            const allSelected = assignmentProblemsList.length > 0 && 
                                              assignmentProblemsList.every(p => selectedProblemIds.includes(p.id));

                            if (copyProblemSearchTerm && assignmentProblemsList.length === 0) {
                              return null;
                            }

                            return (
                              <div key={assignment.id} className={`assignment-item-large ${isExpanded ? 'admin-expanded' : ''}`}>
                                <div className="assignment-item-header-large">
                                  <label className="admin-checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={allSelected}
                                      onChange={() => handleSelectAllProblemsForAssignment(assignment.id)}
                                      disabled={assignmentProblemsList.length === 0}
                                    />
                                    <div className="assignment-info-large">
                                      <span className="assignment-title-large">{assignment.title}</span>
                                      <span className="assignment-meta">
                                        {assignmentProblemsList.length}개 문제
                                      </span>
                                    </div>
                                  </label>
                                  {assignmentProblemsList.length > 0 && (
                <button 
                                      className="admin-btn-expand-assignment-large"
                                      onClick={() => toggleAssignmentForProblem(assignment.id)}
                >
                                      {isExpanded ? '접기 ▲' : '문제 보기 ▼'}
                </button>
                                  )}
              </div>
                                
                                {isExpanded && assignmentProblemsList.length > 0 && (
                                  <div className="admin-problem-selection-box-large">
                                    <div className="admin-problem-selection-header-large">
                                      <label className="admin-checkbox-label">
                                        <input
                                          type="checkbox"
                                          checked={allSelected}
                                          onChange={() => handleSelectAllProblemsForAssignment(assignment.id)}
                                        />
                                        <span>문제 전체 선택</span>
                                      </label>
                                      <span className="admin-item-count">
                                        {selectedProblems.length} / {assignmentProblemsList.length}개
                                      </span>
                                    </div>
                                    <div className="admin-problem-list-large">
                                      {assignmentProblemsList.map((problem, index) => (
                                        <div key={problem.id} className="admin-problem-item-large">
                                          <div className="admin-problem-item-large-header">
                                            <input
                                              type="checkbox"
                                              checked={selectedProblemIds.includes(problem.id)}
                                              onChange={() => handleProblemToggleForAdd(assignment.id, problem.id)}
                                              className="admin-problem-checkbox"
                                            />
                                          </div>
                                          <div className="admin-problem-item-large-body">
                                            <div className="admin-problem-title-row">
                                              <h4 className="admin-problem-title-large">
                                                <span className="admin-problem-number-large">{index + 1}.</span>
                                                {removeCopyLabel(problem.title)}
                                              </h4>
                                              <button
                                                className="admin-btn-view-detail-card"
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
                  </>
                ) : (
                  <div className="admin-no-items">수업을 선택해주세요.</div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => {
                    setShowCopyProblemModal(false);
                    setSelectedSectionForProblem('');
                    setAssignmentsForProblem([]);
                    setExpandedAssignmentsForProblem({});
                    setAssignmentProblems({});
                    setSelectedProblemIds([]);
                    setCopyProblemSearchTerm('');
                    setProblemViewMode('list');
                    setSelectedProblemDetail(null);
                  }}
                >
                  취소
                </button>
                {selectedProblemIds.length > 0 && (
                  <button 
                    type="button"
                    className="admin-btn-primary"
                    onClick={() => {
                      handleSelectProblem(selectedProblemIds);
                      setShowCopyProblemModal(false);
                      setSelectedSectionForProblem('');
                      setAssignmentsForProblem([]);
                      setExpandedAssignmentsForProblem({});
                      setAssignmentProblems({});
                      setSelectedProblemIds([]);
                      setCopyProblemSearchTerm('');
                      setProblemViewMode('list');
                      setSelectedProblemDetail(null);
                    }}
                  >
                    선택한 문제 추가 ({selectedProblemIds.length}개)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 문제 목록 모달 */}
        {showProblemListModal && selectedAssignmentForProblemList && (
          <div className="admin-modal-overlay" onClick={() => {
            setShowProblemListModal(false);
            setSelectedAssignmentForProblemList(null);
            setSelectedProblemForDetail(null);
            setShowProblemDetailModal(false);
          }}>
            <div className="admin-modal-content admin-modal-content-extra-large" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>문제 목록 관리 - {selectedAssignmentForProblemList.title}</h2>
                <button 
                  className="admin-modal-close"
                  onClick={() => {
                    setShowProblemListModal(false);
                    setSelectedAssignmentForProblemList(null);
                    setSelectedProblemForDetail(null);
                    setShowProblemDetailModal(false);
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div className="admin-modal-body">
                {/* 문제 검색 */}
                <div className="admin-filters-section">
                  <div className="admin-search-box">
                    <input
                      type="text"
                      placeholder="문제 ID, 제목으로 검색..."
                      value={problemListSearchTerm}
                      onChange={(e) => setProblemListSearchTerm(e.target.value)}
                      className="admin-search-input"
                    />
                  </div>
                </div>

                {selectedAssignmentForProblemList.problems && selectedAssignmentForProblemList.problems.length > 0 ? (
                  (() => {
                    const filteredProblems = selectedAssignmentForProblemList.problems.filter(problem => {
                      if (!problemListSearchTerm) return true;
                      const searchLower = problemListSearchTerm.toLowerCase();
                      return (
                        problem.id?.toString().includes(searchLower) ||
                        problem.title?.toLowerCase().includes(searchLower)
                      );
                    });
                    
                    return filteredProblems.length > 0 ? (
                      <div className="admin-problems-table-container">
                        <table className="admin-problems-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>제목</th>
                              <th>난이도</th>
                              <th>상태</th>
                              <th>관리</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProblems.map((problem, index) => (
                          <tr key={problem.id || index}>
                            <td>{problem.id}</td>
                            <td className="admin-problem-title-cell">
                              <button
                                className="admin-btn-link"
                                onClick={async () => {
                                  try {
                                    const problemDetail = await APIService.getProblemInfo(problem.id);
                                    setSelectedProblemForDetail({
                                      ...problemDetail,
                                      id: problem.id
                                    });
                                    setShowProblemDetailModal(true);
                                  } catch (error) {
                                    console.error('문제 상세 정보 조회 실패:', error);
                                    alert('문제 상세 정보를 불러오는데 실패했습니다.');
                                  }
                                }}
                              >
                                {removeCopyLabel(problem.title)}
                              </button>
                            </td>
                            <td>{problem.difficulty || 'N/A'}</td>
                            <td>
                              {submissionStats[selectedAssignmentForProblemList.id]?.problemStats ? (
                                (() => {
                                  const problemStat = submissionStats[selectedAssignmentForProblemList.id].problemStats.find(
                                    stat => stat.problemId === problem.id
                                  );
                                  return problemStat ? `${problemStat.solvedCount}/${problemStat.totalStudents}명 완료` : '0/0명';
                                })()
                              ) : '0/0명'}
                            </td>
                            <td>
                              <button
                                className="admin-btn-table-action"
                                onClick={async () => {
                                  try {
                                    const problemDetail = await APIService.getProblemInfo(problem.id);
                                    setSelectedProblemForDetail({
                                      ...problemDetail,
                                      id: problem.id
                                    });
                                    setShowProblemDetailModal(true);
                                  } catch (error) {
                                    console.error('문제 상세 정보 조회 실패:', error);
                                    alert('문제 상세 정보를 불러오는데 실패했습니다.');
                                  }
                                }}
                              >
                                수정
                              </button>
                              <button
                                className="admin-btn-table-action admin-btn-delete"
                                onClick={() => handleRemoveProblem(selectedAssignmentForProblemList.id, problem.id)}
                              >
                                제거
                              </button>
                            </td>
                          </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="admin-no-problems">
                        <p>검색 조건에 맞는 문제가 없습니다.</p>
                      </div>
                    );
                  })()
                ) : (
                  <div className="admin-no-problems">
                    <p>등록된 문제가 없습니다.</p>
                    <button 
                      className="admin-btn-primary"
                      onClick={() => {
                        setShowProblemListModal(false);
                        handleAddProblem(selectedAssignmentForProblemList);
                      }}
                    >
                      첫 번째 문제 추가하기
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 문제 상세 및 수정 모달 */}
        {showProblemDetailModal && selectedProblemForDetail && (
          <div className="admin-modal-overlay" onClick={() => {
            setShowProblemDetailModal(false);
            setSelectedProblemForDetail(null);
          }}>
            <div className="admin-modal-content admin-large-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>문제 상세 - {selectedProblemForDetail.title}</h2>
                <button 
                  className="admin-modal-close"
                  onClick={() => {
                    setShowProblemDetailModal(false);
                    setSelectedProblemForDetail(null);
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div className="admin-modal-body">
                <div className="admin-problem-detail-content">
                  <div className="admin-detail-meta">
                    {selectedProblemForDetail.timeLimit && (
                      <span>시간 제한: {selectedProblemForDetail.timeLimit}초</span>
                    )}
                    {selectedProblemForDetail.memoryLimit && (
                      <span>메모리 제한: {selectedProblemForDetail.memoryLimit}MB</span>
                    )}
                  </div>
                  <div className="admin-detail-body admin-problem-description">
                    {selectedProblemForDetail.description ? (
                      (() => {
                        const description = selectedProblemForDetail.description;
                        const isMarkdown = description.includes('# ') || 
                          description.includes('## ') || 
                          description.includes('```') ||
                          description.includes('**') ||
                          !description.includes('<');
                        
                        if (isMarkdown) {
                          return <ReactMarkdown>{description}</ReactMarkdown>;
                        } else {
                          return <div dangerouslySetInnerHTML={{ __html: description }} />;
                        }
                      })()
                    ) : (
                      <p>문제 설명이 없습니다.</p>
                    )}
                  </div>
                </div>
                
                <div className="admin-modal-actions">
                  <button 
                    className="admin-btn-secondary"
                    onClick={() => {
                      setShowProblemDetailModal(false);
                      setSelectedProblemForDetail(null);
                    }}
                >
                  닫기
                </button>
                  <button 
                    className="admin-btn-primary"
                    onClick={() => {
                      // 문제 수정 페이지로 이동하거나 수정 모달 열기
                      // 여기서는 수정 기능을 추가할 수 있습니다
                      alert('문제 수정 기능은 추후 구현 예정입니다.');
                    }}
                  >
                    수정
                </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </AdminLayout>
  );
};

export default AssignmentManagement;
