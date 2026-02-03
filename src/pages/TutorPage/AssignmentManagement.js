import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import SectionNavigation from "../../components/SectionNavigation";
import APIService from "../../services/APIService";
import { removeCopyLabel } from "../../utils/problemUtils";
import ReactMarkdown from "react-markdown";
import { useAssignments } from "../../hooks/useAssignments";
import { useSubmissionStats } from "../../hooks/useSubmissionStats";
import { useAssignmentProblems } from "../../hooks/useAssignmentProblems";
import { getDifficultyColor, getSemesterLabel, getSubmissionRate } from "../../utils/assignmentUtils";
import AssignmentAddModal from "../../components/AssignmentModals/AssignmentAddModal";
import AssignmentEditModal from "../../components/AssignmentModals/AssignmentEditModal";
import AssignmentTableView from "../../components/AssignmentViews/AssignmentTableView";
import AssignmentListView from "../../components/AssignmentViews/AssignmentListView";
import ProblemSelectModal from "../../components/ProblemModals/ProblemSelectModal";
import ProblemCreateModal from "../../components/ProblemModals/ProblemCreateModal";
import StandaloneProblemCreateModal from "../../components/ProblemModals/StandaloneProblemCreateModal";
import BulkProblemCreateModal from "../../components/ProblemModals/BulkProblemCreateModal";
import ProblemListModal from "../../components/ProblemModals/ProblemListModal";
import ProblemDetailModal from "../../components/ProblemModals/ProblemDetailModal";

const AssignmentManagement = () => {
  const { sectionId } = useParams(); // URL에서 분반 고유 ID 가져오기
  const navigate = useNavigate();
  
  // 커스텀 훅 사용
  const { assignments, setAssignments, sections, currentSection, loading, refetch: refetchAssignments } = useAssignments(sectionId);
  const { submissionStats, refetch: refetchSubmissionStats } = useSubmissionStats(assignments, sectionId);
  const {
    availableProblems,
    setAvailableProblems,
    copyableProblems,
    setCopyableProblems,
    assignmentsForProblem,
    setAssignmentsForProblem,
    assignmentProblems,
    setAssignmentProblems,
    expandedAssignmentsForProblem,
    setExpandedAssignmentsForProblem,
    loadingAssignmentsForProblem,
    fetchAvailableProblems,
    fetchCopyableProblems,
    handleSectionChangeForProblem,
    toggleAssignmentForProblem
  } = useAssignmentProblems();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [showCreateProblemModal, setShowCreateProblemModal] = useState(false);
  const [showStandaloneProblemModal, setShowStandaloneProblemModal] = useState(false);
  const [showBulkProblemModal, setShowBulkProblemModal] = useState(false);
  const [showCopyProblemModal, setShowCopyProblemModal] = useState(false);
  const [copyProblemSearchTerm, setCopyProblemSearchTerm] = useState('');
  const [selectedSectionForProblem, setSelectedSectionForProblem] = useState('');
  const [currentProblemPage, setCurrentProblemPage] = useState(1);
  const PROBLEMS_PER_PAGE = 10;
  const [selectedProblemIds, setSelectedProblemIds] = useState([]);
  const [selectedProblemDetail, setSelectedProblemDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('ALL');
  const [problemViewMode, setProblemViewMode] = useState('list'); // 'list' or 'hierarchy'
  const [selectedAssignment, setSelectedAssignment] = useState(null);
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
  const [expandedAssignments, setExpandedAssignments] = useState({});
  const [showProblemListModal, setShowProblemListModal] = useState(false);
  const [selectedAssignmentForProblemList, setSelectedAssignmentForProblemList] = useState(null);
  const [selectedProblemForDetail, setSelectedProblemForDetail] = useState(null);
  const [showProblemDetailModal, setShowProblemDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [problemListSearchTerm, setProblemListSearchTerm] = useState('');
  const [openMoreMenu, setOpenMoreMenu] = useState(null);
  const ASSIGNMENTS_PER_PAGE = 10;

  // 커스텀 훅이 자동으로 데이터를 가져옴

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMoreMenu !== null && !event.target.closest('.tutor-more-menu')) {
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

  // 커스텀 훅이 자동으로 fetchAssignments와 fetchSubmissionStats를 처리함

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
      refetchAssignments(); // 목록 새로고침
    } catch (error) {
      console.error('과제 생성 실패:', error);
      alert('과제 생성에 실패했습니다.');
    }
  };

  const handleEdit = (assignment) => {
    console.log('과제 수정:', assignment);
    setSelectedAssignment(assignment);
    
    // 기존 데이터로 폼 초기화
    // sectionId는 자동으로 설정 (현재 URL의 sectionId 또는 assignment.sectionId 사용)
    const currentSectionId = sectionId || assignment.sectionId || '';
    setFormData({
      title: assignment.title || '',
      description: assignment.description || '',
      sectionId: currentSectionId, // 자동으로 설정
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
      refetchAssignments(); // 목록 새로고침
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
        refetchAssignments(); // 목록 새로고침
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
      refetchAssignments(); // 목록 새로고침
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

  const handleSectionChangeForProblemWrapper = async (sectionId) => {
    setSelectedSectionForProblem(sectionId);
    setSelectedProblemIds([]);
    setCopyProblemSearchTerm('');
    await handleSectionChangeForProblem(sectionId);
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

  // fetchAvailableProblems와 fetchCopyableProblems는 커스텀 훅에서 제공됨

  const handleCopyProblem = async (problemId, newTitle = null) => {
    try {
      const newProblemId = await APIService.copyProblem(problemId, newTitle);
      alert('문제가 성공적으로 복사되었습니다.');
      setShowCopyProblemModal(false);
      
      // 복사된 문제를 현재 과제에 추가
      if (selectedAssignment) {
        await APIService.addProblemToAssignment(selectedAssignment.id, newProblemId);
        alert('복사된 문제가 과제에 추가되었습니다.');
        refetchAssignments();
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
      refetchAssignments(); // 목록 새로고침
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
        refetchAssignments(); // 목록 새로고침
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
      refetchAssignments(); // 목록 새로고침
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

  // 유틸리티 함수는 assignmentUtils.js에서 import됨

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

  // getSubmissionRate는 assignmentUtils.js에서 import됨

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
      <TutorLayout selectedSection={currentSection}>
        <div className="tutor-loading-container">
          <div className="tutor-loading-spinner"></div>
          <p>과제 데이터를 불러오는 중...</p>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout selectedSection={currentSection}>
      <style dangerouslySetInnerHTML={{__html: `
/* AssignmentManagement.css - Tutor 스타일과 일치하는 과제 관리 페이지 */
.assignment-management { padding: 0; }
.assignment-management .tutor-loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 1rem; background-color: white; }
.assignment-management .tutor-loading-spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.assignment-management .tutor-page-header { display: flex; align-items: center; justify-content: space-between; padding: 1.75rem 2rem; background: #667eea; color: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2); margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1.25rem; }
.assignment-management .tutor-header-left { display: flex; align-items: center; gap: 1.5rem; flex: 1; min-width: 0; }
.assignment-management .tutor-header-right { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.assignment-management .tutor-page-title { font-size: 1.875rem; font-weight: 700; color: white; margin: 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.assignment-management .tutor-header-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.assignment-management .tutor-filters-section { display: flex; align-items: center; gap: 1rem; padding: 1.5rem 2rem; background: white; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); margin-bottom: 2rem; flex-wrap: wrap; }
.assignment-management .tutor-search-box { position: relative; flex: 1; min-width: 250px; max-width: 400px; }
.assignment-management .tutor-search-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; transition: all 0.2s ease; background: white; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-search-input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); background: white; }
body.section-modal-open .assignment-management .tutor-search-input:focus { outline: none !important; border-color: #e1e8ed !important; box-shadow: none !important; background: white !important; }
.assignment-management .section-filter { padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; background: white; color: #1e293b; cursor: pointer; transition: all 0.2s ease; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; min-width: 140px; }
.assignment-management .section-filter:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
.assignment-management .section-filter:hover { border-color: #9ca3af; }
.assignment-management .tutor-btn-primary { display: flex; align-items: center; gap: 0.5rem; background: white; color: #667eea; border: 2px solid #667eea; padding: 0.875rem 1.75rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; font-size: 0.95rem; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; white-space: nowrap; }
.assignment-management .tutor-btn-primary:hover { background: #667eea; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
.assignment-management .tutor-btn-secondary { background: white; color: #667eea; border: 2px solid #667eea; padding: 0.875rem 1.5rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 0.95rem; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; white-space: nowrap; }
.assignment-management .tutor-btn-secondary:hover { background: #f8f9ff; border-color: #5568d3; color: #5568d3; transform: translateY(-2px); }
.assignment-management .tutor-btn-secondary.tutor-btn-primary-color { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
.assignment-management .tutor-btn-secondary.tutor-btn-primary-color:hover { background: linear-gradient(135deg, #5568d3 0%, #6a3d8c 100%); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
.assignment-management .tutor-assignments-table-container { background: white; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden; }
.assignment-management .tutor-assignments-table { width: 100%; border-collapse: collapse; }
.assignment-management .tutor-assignments-table thead { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.assignment-management .tutor-assignments-table th { padding: 1rem 1.5rem; text-align: left; font-weight: 600; font-size: 0.95rem; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-assignments-table tbody tr { border-bottom: 1px solid #e5e7eb; transition: background-color 0.2s ease; }
.assignment-management .tutor-assignments-table tbody tr:hover { background-color: #f8f9ff; }
.assignment-management .tutor-assignments-table tbody tr.tutor-disabled { opacity: 0.65; background-color: #f9fafb; }
.assignment-management .tutor-assignments-table td { padding: 1.25rem 1.5rem; font-size: 0.9rem; color: #374151; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-assignment-title-cell { min-width: 200px; }
.assignment-management .tutor-assignment-title { font-weight: 600; color: #1e293b; font-size: 1rem; margin-bottom: 0.25rem; }
.assignment-management .tutor-assignment-description { color: #64748b; font-size: 0.85rem; margin-top: 0.25rem; line-height: 1.4; }
.assignment-management .tutor-assignment-meta-cell { color: #64748b; font-size: 0.9rem; }
.assignment-management .tutor-assignment-actions-cell { width: 1%; white-space: nowrap; }
.assignment-management .tutor-assignment-actions-inline { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
.assignment-management .tutor-btn-table-action { padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: white; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; color: #667eea; }
.assignment-management .tutor-btn-table-action:hover { background: #667eea; color: white; border-color: #667eea; transform: translateY(-1px); }
.assignment-management .tutor-btn-table-action.tutor-btn-edit { color: #667eea; border-color: #667eea; }
.assignment-management .tutor-btn-table-action.tutor-btn-edit:hover { background: #667eea; color: white; }
.assignment-management .tutor-btn-table-action.tutor-btn-more { background: #f3f4f6; border-color: #e5e7eb; color: #64748b; padding: 0.5rem 0.75rem; font-size: 1.2rem; line-height: 1; }
.assignment-management .tutor-btn-table-action.tutor-btn-more:hover { background: #e5e7eb; color: #374151; }
.assignment-management .tutor-more-menu { position: relative; }
.assignment-management .tutor-more-dropdown { position: absolute; top: 100%; right: 0; margin-top: 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); z-index: 100; min-width: 120px; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; }
.assignment-management .tutor-btn-text-small { padding: 0.5rem 0.75rem; border: none; background: transparent; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; text-align: left; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; color: #374151; }
.assignment-management .tutor-btn-text-small:hover { background: #f3f4f6; }
.assignment-management .tutor-btn-text-small.tutor-delete { color: #ef4444; }
.assignment-management .tutor-btn-text-small.tutor-delete:hover { background: #fee2e2; color: #dc2626; }
.assignment-management .tutor-table-empty { text-align: center; padding: 3rem; color: #64748b; font-size: 1rem; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-assignments-list { display: flex; flex-direction: column; gap: 1.5rem; }
.assignment-management .tutor-assignment-list-item { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); }
.assignment-management .tutor-assignment-list-item:hover { box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15); border-color: #667eea; transform: translateY(-2px); }
.assignment-management .tutor-assignment-list-item.tutor-disabled { opacity: 0.65; background: #f9fafb; }
.assignment-management .tutor-assignment-list-main { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; }
.assignment-management .tutor-assignment-list-info { flex: 1; min-width: 0; }
.assignment-management .tutor-assignment-list-title-section { margin-bottom: 1rem; }
.assignment-management .tutor-assignment-list-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-assignment-list-description { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin: 0; }
.assignment-management .tutor-assignment-list-meta { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.assignment-management .tutor-assignment-meta-item { display: flex; flex-direction: column; gap: 0.25rem; }
.assignment-management .tutor-meta-label { font-size: 0.8rem; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.assignment-management .tutor-meta-value { font-size: 1rem; font-weight: 600; color: #1e293b; }
.assignment-management .tutor-assignment-list-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-start; }
.assignment-management .tutor-btn-list-action { padding: 0.75rem 1.25rem; border: 1px solid #e5e7eb; background: white; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; color: #667eea; }
.assignment-management .tutor-btn-list-action:hover { background: #667eea; color: white; border-color: #667eea; transform: translateY(-1px); }
.assignment-management .tutor-pagination { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; background: white; border-radius: 12px; border: 1px solid #e5e7eb; margin-top: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.assignment-management .tutor-pagination-info { font-size: 0.9rem; color: #64748b; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-pagination-controls { display: flex; align-items: center; gap: 0.5rem; }
.assignment-management .tutor-btn-pagination { padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: white; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; color: #374151; }
.assignment-management .tutor-btn-pagination:hover:not(:disabled) { background: #667eea; color: white; border-color: #667eea; }
.assignment-management .tutor-btn-pagination:disabled { opacity: 0.5; cursor: not-allowed; }
.assignment-management .tutor-pagination-pages { display: flex; gap: 0.25rem; }
.assignment-management .tutor-btn-pagination-page { padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; background: white; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; color: #374151; min-width: 40px; }
.assignment-management .tutor-btn-pagination-page:hover { background: #f3f4f6; border-color: #cbd5e1; }
.assignment-management .tutor-btn-pagination-page.active { background: #667eea; color: white; border-color: #667eea; }
.assignment-management .assignment-management-copy-problem-modal-overlay { position: fixed; top: 65px; left: 280px; right: calc(100vw / 3); bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: flex-start; justify-content: center; z-index: 10000; animation: assignment-management-copy-problem-fadeIn 0.2s ease; padding-top: 2rem; overflow-y: auto; box-sizing: border-box; transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), right 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.tutor-layout.sidebar-collapsed .assignment-management .assignment-management-copy-problem-modal-overlay { left: 60px; right: calc(100vw / 3); }
@keyframes assignment-management-copy-problem-fadeIn { from { opacity: 0; } to { opacity: 1; } }
.assignment-management .tutor-modal-overlay { position: fixed; top: 65px; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: flex-start; justify-content: center; z-index: 10000; animation: fadeIn 0.2s ease; padding-top: 2rem; overflow-y: auto; box-sizing: border-box; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.assignment-management .tutor-modal-content { background: white; border-radius: 16px; width: 90%; max-width: 600px; max-height: calc(90vh - 65px); overflow: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); animation: slideInUp 0.3s ease; margin-top: 0; }
@keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.assignment-management .tutor-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.75rem 2rem; border-bottom: 1px solid #e5e7eb; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.assignment-management .tutor-modal-header h2, .assignment-management .tutor-modal-title { margin: 0; font-size: 1.5rem; font-weight: 700; color: white; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-modal-close { background: rgba(255, 255, 255, 0.2); border: none; font-size: 1.75rem; color: white; cursor: pointer; padding: 0; width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s ease; }
.assignment-management .tutor-modal-close:hover { background: rgba(255, 255, 255, 0.3); transform: rotate(90deg); }
.assignment-management .assignment-form, .assignment-management .tutor-modal-body { padding: 2rem; }
.assignment-management .tutor-form-group { margin-bottom: 1.5rem; }
.assignment-management .tutor-form-group label, .assignment-management .tutor-form-label { display: block; margin-bottom: 0.625rem; font-weight: 600; color: #374151; font-size: 0.95rem; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-form-input, .assignment-management .tutor-form-textarea, .assignment-management .tutor-form-select { width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; transition: all 0.2s ease; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; box-sizing: border-box; }
.assignment-management .tutor-form-input:focus, .assignment-management .tutor-form-textarea:focus, .assignment-management .tutor-form-select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
body.section-modal-open .assignment-management .tutor-form-input:focus, body.section-modal-open .assignment-management .tutor-form-textarea:focus, body.section-modal-open .assignment-management .tutor-form-select:focus { outline: none !important; border-color: #e1e8ed !important; box-shadow: none !important; background: white !important; }
.assignment-management .tutor-form-textarea { resize: vertical; min-height: 100px; }
.assignment-management .tutor-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.assignment-management .tutor-form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; }
.assignment-management .tutor-btn-cancel { background: #f3f4f6; color: #6b7280; border: none; padding: 0.875rem 1.75rem; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-btn-cancel:hover { background: #e5e7eb; }
.assignment-management .tutor-btn-submit { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 0.875rem 1.75rem; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-btn-submit:hover:not(:disabled) { background: linear-gradient(135deg, #5568d3 0%, #6a3d8c 100%); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
.assignment-management .tutor-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.assignment-management .tutor-problem-search-section { display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: stretch; flex-wrap: nowrap; }
.assignment-management .tutor-problem-search-section .tutor-search-box { flex: 1; min-width: 0; display: flex; align-items: center; }
.assignment-management .tutor-problem-search-section .tutor-search-input { width: 100%; padding: 0.6rem 1rem; border: 2px solid #e9ecef; border-radius: 8px; font-size: 0.9rem; background: white; transition: all 0.3s ease; }
.assignment-management .tutor-problem-search-section .tutor-search-input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
body.section-modal-open .assignment-management .tutor-problem-search-section .tutor-search-input:focus { outline: none !important; border-color: #e1e8ed !important; box-shadow: none !important; background: white !important; }
.assignment-management .tutor-problem-search-box { flex: 1; max-width: calc(100% - 200px); min-width: 200px; }
.assignment-management .tutor-problem-search-box .tutor-search-input { width: 99%; padding: 0.6rem 0.9rem; border: 2px solid #e9ecef; border-radius: 8px; font-size: 0.9rem; background: white; transition: all 0.3s ease; }
.assignment-management .tutor-problem-search-box .tutor-search-input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
body.section-modal-open .assignment-management .tutor-problem-search-box .tutor-search-input:focus { outline: none !important; border-color: #e1e8ed !important; box-shadow: none !important; background: white !important; }
.assignment-management .tutor-btn-create-new { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; flex-shrink: 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-btn-create-new:hover { background: linear-gradient(135deg, #5a6fd8, #6a4190); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
.assignment-management .tutor-available-problems { display: flex; flex-direction: column; gap: 0.75rem; overflow-y: auto; max-height: calc(70vh - 150px); padding-right: 0.5rem; }
.assignment-management .tutor-available-problem-item { display: grid; grid-template-columns: 1fr auto; align-items: center; padding: 1rem 1.25rem; background: #f8f9fa; border-radius: 10px; border: 2px solid #e9ecef; transition: all 0.3s ease; gap: 1rem; }
.assignment-management .tutor-available-problem-item:hover { border-color: #667eea; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1); background: white; }
.assignment-management .tutor-available-problem-item .tutor-problem-info { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; overflow: hidden; }
.assignment-management .tutor-available-problem-item .tutor-problem-title { font-size: 1rem; font-weight: 600; color: #2d3436; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-available-problem-item .tutor-problem-created { font-size: 0.8rem; color: #95a5a6; margin: 0; }
.assignment-management .tutor-btn-select-problem { background: #667eea; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; flex-shrink: 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-btn-select-problem:hover { background: #5568d3; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
.assignment-management .tutor-no-available-problems { text-align: center; padding: 3rem; color: #636e72; display: flex; flex-direction: column; gap: 1rem; align-items: center; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-available-problems-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; flex: 1; overflow-y: auto; }
.assignment-management .tutor-problem-card { background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem; padding-top: 0.5rem; transition: all 0.2s ease; display: flex; flex-direction: column; gap: 0.5rem; position: relative; }
.assignment-management .tutor-problem-card:hover { border-color: #667eea; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15); }
.assignment-management .tutor-problem-card-header { position: absolute; top: 0.5rem; right: 1rem; display: flex; justify-content: flex-end; margin: 0; padding: 0; z-index: 1; }
.assignment-management .tutor-problem-checkbox { width: 1.3rem; height: 1.3rem; cursor: pointer; accent-color: #667eea; }
.assignment-management .tutor-problem-card-body { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0; padding-top: 0; }
.assignment-management .tutor-problem-card-title { font-weight: 600; color: #1e293b; font-size: 0.95rem; line-height: 1.4; margin: 0; padding: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-problem-card-date { font-size: 0.8rem; color: #64748b; }
.assignment-management .tutor-problem-card-meta-row { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; }
.assignment-management .tutor-btn-view-detail-card { padding: 0.4rem 0.8rem; background: #f3f4f6; color: #667eea; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; flex-shrink: 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-btn-view-detail-card:hover { background: #667eea; color: white; border-color: #667eea; transform: translateY(-1px); }
.assignment-management .tutor-modal-content-large, .assignment-management .tutor-problem-modal-large { max-width: 95vw !important; width: 95vw !important; min-width: 800px; max-height: 90vh; display: flex; flex-direction: column; }
.assignment-management .tutor-problem-modal-body { padding: 1.5rem; padding-bottom: 1.5rem; flex: 1; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; gap: 1rem; min-height: 0; background: white; }
.assignment-management .tutor-problem-modal-body .tutor-problem-search-section { flex-shrink: 0; margin-bottom: 0; display: flex; flex-direction: column; gap: 0; max-width: 500px; }
.assignment-management .tutor-problem-modal-body .tutor-problem-search-section .tutor-search-input { width: 100%; padding: 0.75rem 1rem; border: 2px solid #e9ecef; border-radius: 8px; font-size: 0.95rem; background: white; transition: all 0.3s ease; }
.assignment-management .tutor-problem-modal-body .tutor-problem-search-section .tutor-search-input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
body.section-modal-open .assignment-management .tutor-problem-modal-body .tutor-problem-search-section .tutor-search-input:focus { outline: none !important; border-color: #e1e8ed !important; box-shadow: none !important; background: white !important; }
.assignment-management .tutor-view-mode-tabs { display: flex; gap: 0.25rem; background: #f1f5f9; padding: 0.15rem; border-radius: 8px; flex-shrink: 0; height: fit-content; align-items: center; }
.assignment-management .tutor-tab-button { flex: 1; padding: 0.4rem 0.8rem; background: transparent; border: none; border-radius: 6px; font-size: 0.85rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; line-height: 1.2; margin-bottom: 0px; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-tab-button:hover { background: #e2e8f0; color: #475569; }
.assignment-management .tutor-tab-button.tutor-active { background: white; color: #667eea; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
.assignment-management .tutor-problem-list-view, .assignment-management .tutor-problem-hierarchy-view { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; min-height: 0; margin-top: 0; padding-top: 0; padding-bottom: 0; margin-bottom: 0; }
.assignment-management .assignment-list-large { display: flex; flex-direction: column; gap: 1rem; }
.assignment-management .assignment-item-large { background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; transition: all 0.2s ease; }
.assignment-management .assignment-item-large:hover { border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
.assignment-management .assignment-item-header-large { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f9fafb; }
.assignment-management .assignment-item-header-large .tutor-checkbox-label { display: flex; align-items: center; gap: 0.75rem; flex: 1; cursor: pointer; }
.assignment-management .assignment-item-header-large .tutor-checkbox-label input[type="checkbox"] { width: 1.2rem; height: 1.2rem; cursor: pointer; accent-color: #667eea; }
.assignment-management .assignment-info-large { display: flex; flex-direction: column; gap: 0.25rem; }
.assignment-management .assignment-title-large { font-weight: 600; color: #1e293b; font-size: 1rem; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .assignment-meta { font-size: 0.85rem; color: #64748b; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-btn-expand-assignment-large { padding: 0.5rem 1rem; background: transparent; color: #667eea; border: 1px solid #667eea; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-btn-expand-assignment-large:hover { background: #667eea; color: white; }
.assignment-management .tutor-problem-selection-box-large { padding: 1rem; background: white; border-top: 1px solid #e5e7eb; }
.assignment-management .tutor-problem-selection-header-large { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.75rem; }
.assignment-management .tutor-problem-selection-header-large .tutor-checkbox-label { display: flex; align-items: center; gap: 0.75rem; font-weight: 600; color: #374151; cursor: pointer; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-problem-selection-header-large .tutor-checkbox-label input[type="checkbox"] { width: 1.1rem; height: 1.1rem; cursor: pointer; accent-color: #667eea; }
.assignment-management .tutor-problem-selection-header-large .tutor-item-count { font-weight: 600; color: #667eea; font-size: 0.85rem; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-problem-list-large { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; padding-bottom: 1rem; }
.assignment-management .tutor-problem-item-large { background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem; padding-top: 0.5rem; transition: all 0.2s ease; display: flex; flex-direction: column; gap: 0.5rem; position: relative; overflow: hidden; }
.assignment-management .tutor-problem-item-large:hover { border-color: #667eea; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15); }
.assignment-management .tutor-problem-item-large-header { position: absolute; top: 0.5rem; right: 1rem; display: flex; justify-content: flex-end; z-index: 1; }
.assignment-management .tutor-problem-item-large-header .tutor-problem-checkbox { width: 1.3rem; height: 1.3rem; cursor: pointer; accent-color: #667eea; }
.assignment-management .tutor-problem-item-large-body { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0; padding-top: 0; padding-right: 3rem; padding-left: 0; min-width: 0; width: 100%; box-sizing: border-box; }
.assignment-management .tutor-problem-title-row { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; width: 100%; min-width: 0; box-sizing: border-box; }
.assignment-management .tutor-problem-title-large { font-weight: 600; color: #1e293b; font-size: 0.95rem; line-height: 1.4; margin: 0; padding: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-problem-number-large { font-weight: 600; color: #667eea; font-size: 0.95rem; margin-right: 0.5rem; }
.assignment-management .tutor-problem-item-large-actions { display: flex; justify-content: center; margin-top: 0.25rem; }
.assignment-management .tutor-btn-view-problem { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
.assignment-management .tutor-file-input { width: 100%; padding: 0.8rem; border: 2px dashed #e9ecef; border-radius: 8px; background: #f8f9fa; cursor: pointer; transition: all 0.3s ease; }
.assignment-management .tutor-file-input:hover { border-color: #667eea; background: #f0f4ff; }
.assignment-management .tutor-file-help { display: block; color: #636e72; font-size: 0.8rem; margin-top: 0.5rem; line-height: 1.4; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-file-selected { color: #28a745; font-weight: 600; display: inline-block; margin-left: 8px; }
.assignment-management .tutor-optional { color: #999; font-weight: normal; font-size: 0.9rem; }
.assignment-management .tutor-info-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
.assignment-management .tutor-info-box p { margin: 0.25rem 0; font-size: 0.9rem; color: #495057; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-info-box p:first-child { margin-bottom: 0.5rem; }
.assignment-management .tutor-large-modal { max-width: 900px; width: 90vw; max-height: 90vh; overflow-y: auto; }
.assignment-management .tutor-bulk-problems-container { max-height: 400px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
.assignment-management .tutor-bulk-problem-row { border: 1px solid #dee2e6; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; background: #f8f9fa; }
.assignment-management .tutor-bulk-problem-row:last-child { margin-bottom: 0; }
.assignment-management .tutor-problem-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #dee2e6; }
.assignment-management .tutor-problem-row-header h4 { margin: 0; color: #495057; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-btn-remove-row { background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; }
.assignment-management .tutor-btn-remove-row:hover { background: #c82333; }
.assignment-management .tutor-problem-row-content .tutor-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
.assignment-management .tutor-bulk-actions { text-align: center; margin: 1rem 0; }
.assignment-management .tutor-btn-add-row { background: #28a745; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: background-color 0.2s ease; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-btn-add-row:hover { background: #218838; }
.assignment-management .tutor-no-assignments { text-align: center; padding: 4rem 2rem; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); }
.assignment-management .tutor-no-assignments-message { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; color: #636e72; }
.assignment-management .tutor-no-assignments-message p { margin: 0; font-size: 1.2rem; font-weight: 500; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-no-assignments-icon { font-size: 4rem; opacity: 0.5; }
.assignment-management .tutor-loading-items, .assignment-management .tutor-no-items { text-align: center; padding: 2rem 1rem; color: #64748b; font-size: 1rem; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
@media (max-width: 1024px) { .assignment-management .tutor-page-header { flex-direction: column; align-items: stretch; padding: 1.5rem; } .assignment-management .tutor-header-left { flex-direction: column; align-items: flex-start; gap: 1rem; } .assignment-management .tutor-header-right { width: 100%; } .assignment-management .tutor-filters-section { flex-direction: column; align-items: stretch; padding: 1.25rem; gap: 0.75rem; } .assignment-management .tutor-search-box { max-width: 100%; min-width: auto; } .assignment-management .section-filter { width: 100%; min-width: auto; } .assignment-management .tutor-pagination { flex-direction: column; align-items: stretch; } .assignment-management .tutor-problem-modal-large { min-width: auto; width: 95vw !important; } }
@media (max-width: 768px) { .assignment-management .tutor-page-header { padding: 1.25rem; } .assignment-management .tutor-page-title { font-size: 1.5rem; } .assignment-management .tutor-header-actions { width: 100%; flex-direction: column; } .assignment-management .tutor-btn-primary, .assignment-management .tutor-btn-secondary { width: 100%; justify-content: center; } .assignment-management .tutor-assignments-table { font-size: 0.85rem; } .assignment-management .tutor-assignments-table th, .assignment-management .tutor-assignments-table td { padding: 0.75rem 1rem; } .assignment-management .tutor-form-row { grid-template-columns: 1fr; } .assignment-management .tutor-problem-row-content .tutor-form-row { grid-template-columns: 1fr; } .assignment-management .tutor-modal-content { width: 95%; margin: 1rem; } .assignment-management .tutor-modal-header, .assignment-management .assignment-form, .assignment-management .tutor-modal-body { padding: 1.5rem; } .assignment-management .tutor-form-actions { flex-direction: column; } .assignment-management .tutor-available-problems-grid, .assignment-management .tutor-problem-list-large { grid-template-columns: 1fr; } }
/* AssignmentManagementList.css */
.assignment-management .tutor-assignments-list { display: flex; flex-direction: column; gap: 0.75rem; }
.assignment-management .tutor-assignment-list-item { background: white; border-radius: 8px; padding: 1rem 1.25rem; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; position: relative; }
.assignment-management .tutor-assignment-list-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: #10b981; border-radius: 8px 0 0 8px; opacity: 0; transition: opacity 0.2s ease; }
.assignment-management .tutor-assignment-list-item:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); border-color: #cbd5e1; }
.assignment-management .tutor-assignment-list-item:hover::before { opacity: 1; }
.assignment-management .tutor-assignment-list-item.tutor-disabled { background: #f9fafb; opacity: 0.65; border-left: 3px solid #d1d5db; }
.assignment-management .tutor-assignment-list-item.tutor-disabled::before { display: none; }
.assignment-management .tutor-assignment-list-main { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.25rem; }
.assignment-management .tutor-assignment-list-info { flex: 1; min-width: 0; }
.assignment-management .tutor-assignment-list-title-section { margin-bottom: 0.75rem; }
.assignment-management .tutor-assignment-list-title { font-size: 1rem; font-weight: 600; color: #1e293b; margin: 0 0 0.375rem 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-assignment-list-description { font-size: 0.875rem; color: #64748b; margin: 0; line-height: 1.5; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-assignment-list-meta { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.assignment-management .tutor-assignment-meta-item { display: flex; flex-direction: column; gap: 0.25rem; }
.assignment-management .tutor-meta-label { font-size: 0.6875rem; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-meta-value { font-size: 0.875rem; color: #1e293b; font-weight: 600; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-assignment-list-actions { display: flex; gap: 0.5rem; align-items: center; flex-shrink: 0; }
.assignment-management .tutor-btn-list-action { padding: 0.5rem 0.875rem; background: #f3f4f6; color: #6b7280; border: none; border-radius: 6px; font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-btn-list-action:hover { background: #e5e7eb; color: #374151; }
.assignment-management .tutor-btn-list-action.tutor-btn-more { padding: 0.5rem 0.625rem; font-size: 1.125rem; line-height: 1; min-width: 32px; }
.assignment-management .tutor-assignment-list-item.tutor-expanded { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); border-color: #cbd5e1; }
.assignment-management .assignment-expanded-content { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
.assignment-management .tutor-clickable { cursor: pointer; }
.assignment-management .tutor-clickable:hover { background: #f8fafc; }
.assignment-management .tutor-arrow-icon { font-size: 1.125rem; color: #94a3b8; font-weight: 600; }
.assignment-management .tutor-assignment-list-item .tutor-more-menu { position: relative; display: inline-block; }
.assignment-management .tutor-assignment-list-item .tutor-more-dropdown { position: absolute; top: 100%; right: 0; margin-top: 0.375rem; background: white; border: 1px solid #e5e7eb; border-radius: 6px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); z-index: 1000; min-width: 110px; display: flex; flex-direction: column; overflow: hidden; padding: 0.25rem; }
.assignment-management .tutor-assignment-list-item .tutor-more-dropdown .tutor-btn-text-small { padding: 0.625rem 0.875rem; background: white; border: none; text-align: left; font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: background 0.2s ease; white-space: nowrap; width: 100%; border-radius: 4px; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-assignment-list-item .tutor-more-dropdown .tutor-btn-text-small:hover { background: #f3f4f6; }
.assignment-management .tutor-assignment-list-item .tutor-more-dropdown .tutor-btn-text-small.tutor-delete { color: #ef4444; }
.assignment-management .tutor-assignment-list-item .tutor-more-dropdown .tutor-btn-text-small.tutor-delete:hover { background: #fee2e2; color: #dc2626; }
/* AssignmentTable.css */
.assignment-management .tutor-assignments-table-container { background: white; border-radius: 8px; overflow: visible; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); border: 1px solid #e5e7eb; position: relative; }
.assignment-management .tutor-assignments-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.assignment-management .tutor-assignments-table thead { background: #f8fafc; }
.assignment-management .tutor-assignments-table th { padding: 0.75rem 1rem; text-align: left; font-weight: 600; font-size: 0.8125rem; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; overflow: hidden; text-overflow: ellipsis; }
.assignment-management .tutor-assignments-table th.tutor-assignment-title-cell { width: 32%; text-align: left; padding-left: calc(1rem - 3px); border-left: 3px solid transparent; }
.assignment-management .tutor-assignments-table th.tutor-assignment-due-date-cell { width: 14%; text-align: right; }
.assignment-management .tutor-assignments-table th.tutor-assignment-problem-count-cell { width: 10%; text-align: right; }
.assignment-management .tutor-assignments-table th.tutor-assignment-submission-cell { width: 14%; text-align: right; }
.assignment-management .tutor-assignments-table th.tutor-assignment-actions-cell { width: 30%; text-align: right; padding-right: 1rem; }
.assignment-management .tutor-assignments-table tbody tr { border-bottom: 1px solid #f1f5f9; transition: background 0.2s ease; position: relative; overflow: visible; }
.assignment-management .tutor-assignments-table tbody tr:hover { background: #f8fafc; }
.assignment-management .tutor-assignments-table tbody tr.tutor-disabled { background: #f9fafb; opacity: 0.65; position: relative; }
.assignment-management .tutor-assignments-table tbody tr.tutor-disabled td:first-child { border-left: 3px solid #d1d5db; padding-left: calc(1rem - 3px); }
.assignment-management .tutor-assignments-table tbody tr:not(.tutor-disabled) td:first-child { border-left: 3px solid transparent; padding-left: calc(1rem - 3px); transition: border-color 0.2s ease; }
.assignment-management .tutor-assignments-table tbody tr:not(.tutor-disabled):hover td:first-child { border-left-color: #667eea; }
.assignment-management .tutor-assignments-table tbody tr.tutor-clickable { cursor: pointer; }
.assignment-management .tutor-assignments-table tbody tr.tutor-clickable:hover { background: #f1f5f9; }
.assignment-management .tutor-assignments-table td { padding: 0.875rem 1rem; vertical-align: middle; overflow: visible; text-overflow: ellipsis; position: relative; }
.assignment-management .tutor-assignments-table td.tutor-assignment-title-cell { width: 32%; max-width: 0; text-align: left; min-width: 0; position: relative; }
.assignment-management .tutor-assignments-table td.tutor-assignment-due-date-cell { width: 14%; max-width: 0; text-align: right; }
.assignment-management .tutor-assignments-table td.tutor-assignment-problem-count-cell { width: 10%; max-width: 0; text-align: right; }
.assignment-management .tutor-assignments-table td.tutor-assignment-submission-cell { width: 14%; max-width: 0; text-align: right; }
.assignment-management .tutor-assignments-table td.tutor-assignment-actions-cell { width: 30%; max-width: 0; text-align: right; padding-right: 1rem; }
.assignment-management .tutor-assignment-title { font-size: 0.9375rem; font-weight: 600; color: #1e293b; margin-bottom: 0.25rem; }
.assignment-management .tutor-assignment-description { font-size: 0.8125rem; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.assignment-management .tutor-assignment-due-date-cell, .assignment-management .tutor-assignment-problem-count-cell, .assignment-management .tutor-assignment-submission-cell { font-size: 0.875rem; color: #475569; font-weight: 500; white-space: nowrap; text-align: right; }
.assignment-management .tutor-assignment-actions-cell { white-space: nowrap; text-align: right; max-width: 100%; overflow: visible; position: relative; }
.assignment-management .tutor-assignment-actions-inline { display: flex; gap: 0.5rem; align-items: center; justify-content: flex-end; flex-wrap: nowrap; min-width: 0; }
.assignment-management .tutor-assignment-secondary-actions .tutor-more-menu { position: relative; display: inline-block; z-index: 100; }
.assignment-management .tutor-assignment-secondary-actions .tutor-more-dropdown { position: absolute; top: 100%; right: 0; margin-top: 0.375rem; background: white; border: 1px solid #e5e7eb; border-radius: 6px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); z-index: 10000 !important; min-width: auto; width: auto; display: flex; flex-direction: column; overflow: hidden; padding: 0.125rem; }
.assignment-management .tutor-assignment-secondary-actions .tutor-more-dropdown .tutor-btn-text-small { padding: 0.375rem 0.625rem; background: white; border: none; text-align: left; font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: background 0.2s ease; white-space: nowrap; width: auto; border-radius: 4px; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.assignment-management .tutor-assignment-secondary-actions .tutor-more-dropdown .tutor-btn-text-small:hover { background: #f3f4f6; }
.assignment-management .tutor-assignment-secondary-actions .tutor-more-dropdown .tutor-btn-text-small.tutor-delete { color: #ef4444; }
.assignment-management .tutor-assignment-secondary-actions .tutor-more-dropdown .tutor-btn-text-small.tutor-delete:hover { background: #fee2e2; color: #dc2626; }
.assignment-management .tutor-assignment-primary-actions { display: flex; gap: 0.375rem; align-items: center; }
.assignment-management .tutor-assignment-secondary-actions { position: relative; display: flex; align-items: center; }
.assignment-management .tutor-secondary-actions-layer { display: flex; gap: 0.375rem; align-items: center; padding: 0.25rem; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; position: relative; }
.assignment-management .tutor-secondary-actions-layer::before { content: ''; position: absolute; left: -0.5rem; top: 50%; transform: translateY(-50%); width: 1px; height: 70%; background: #d1d5db; }
.assignment-management .tutor-btn-secondary-action { background: #f3f4f6 !important; color: #6b7280 !important; border: 1px solid #e5e7eb !important; }
.assignment-management .tutor-btn-secondary-action:hover { background: #e5e7eb !important; color: #374151 !important; border-color: #d1d5db !important; }
.assignment-management .tutor-btn-secondary-action.tutor-btn-delete, .assignment-management .tutor-more-menu button.tutor-btn-secondary-action { color: #ef4444 !important; border-color: #fee2e2 !important; }
.assignment-management .tutor-btn-secondary-action.tutor-btn-delete:hover, .assignment-management .tutor-more-menu button.tutor-btn-secondary-action:hover { background: #fee2e2 !important; color: #dc2626 !important; border-color: #ef4444 !important; }
.assignment-management .tutor-btn-table-action { padding: 0.5rem 0.625rem; background: #f3f4f6; color: #6b7280; border: none; border-radius: 6px; font-size: 0.75rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; flex-shrink: 0; min-width: fit-content; }
.assignment-management .tutor-btn-table-action:hover { background: #e5e7eb; color: #374151; }
.assignment-management .tutor-btn-table-action.tutor-btn-edit { background: white; color: #667eea; border: 1px solid #667eea; padding: 0.5rem 0.875rem; }
.assignment-management .tutor-btn-table-action.tutor-btn-edit:hover { background: #667eea; color: white; border-color: #667eea; }
.assignment-management .tutor-btn-table-action.tutor-btn-delete { color: #ef4444; }
.assignment-management .tutor-btn-table-action.tutor-btn-delete:hover { background: #fee2e2; color: #dc2626; }
.assignment-management .tutor-table-empty { text-align: center; padding: 2.5rem 1.5rem; color: #94a3b8; font-size: 0.875rem; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
.tutor-problems-table-container { margin-top: 1rem; }
.tutor-problems-table { width: 100%; border-collapse: collapse; }
.tutor-problems-table thead { background: #f8fafc; }
.tutor-problems-table th { padding: 0.875rem 1rem; text-align: left; font-weight: 600; font-size: 0.875rem; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
.tutor-problems-table tbody tr { border-bottom: 1px solid #e2e8f0; transition: background 0.2s ease; }
.tutor-problems-table tbody tr:hover { background: #f8fafc; }
.tutor-problems-table td { padding: 1rem; vertical-align: middle; font-size: 0.95rem; color: #1e293b; }
.tutor-problem-title-cell { min-width: 200px; }
.tutor-btn-link { background: none; border: none; color: #667eea; font-size: 0.95rem; font-weight: 500; cursor: pointer; padding: 0; text-align: left; transition: color 0.2s ease; }
.tutor-btn-link:hover { color: #5568d3; text-decoration: underline; }
@media (max-width: 1200px) { .assignment-management .tutor-assignments-table { font-size: 0.875rem; } .assignment-management .tutor-assignments-table th.tutor-assignment-title-cell, .assignment-management .tutor-assignments-table td.tutor-assignment-title-cell { width: 28%; } .assignment-management .tutor-assignments-table th.tutor-assignment-due-date-cell, .assignment-management .tutor-assignments-table td.tutor-assignment-due-date-cell, .assignment-management .tutor-assignments-table th.tutor-assignment-problem-count-cell, .assignment-management .tutor-assignments-table td.tutor-assignment-problem-count-cell, .assignment-management .tutor-assignments-table th.tutor-assignment-submission-cell, .assignment-management .tutor-assignments-table td.tutor-assignment-submission-cell { width: 12%; } .assignment-management .tutor-assignments-table th.tutor-assignment-actions-cell, .assignment-management .tutor-assignments-table td.tutor-assignment-actions-cell { width: 32%; } .assignment-management .tutor-btn-table-action { padding: 0.5rem 0.5rem; font-size: 0.6875rem; } }
@media (max-width: 768px) { .assignment-management .tutor-assignments-table-container { overflow-x: auto; } .assignment-management .tutor-assignments-table { min-width: 800px; table-layout: auto; } .assignment-management .tutor-assignment-actions-inline { flex-wrap: wrap; gap: 0.25rem; } .assignment-management .tutor-btn-table-action { padding: 0.375rem 0.5rem; font-size: 0.6875rem; } }
/* Pagination.css */
.tutor-pagination { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-top: 1px solid #e2e8f0; background: #f8fafc; }
.tutor-pagination-info { font-size: 0.875rem; color: #64748b; font-weight: 500; }
.tutor-pagination-controls { display: flex; align-items: center; gap: 0.5rem; }
.tutor-btn-pagination { padding: 0.5rem 1rem; background: white; color: #475569; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
.tutor-btn-pagination:hover:not(:disabled) { background: #f1f5f9; border-color: #cbd5e1; color: #334155; }
.tutor-btn-pagination:disabled { opacity: 0.5; cursor: not-allowed; }
.tutor-pagination-pages { display: flex; gap: 0.25rem; }
.tutor-btn-pagination-page { padding: 0.5rem 0.75rem; background: white; color: #475569; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; min-width: 2.5rem; }
.tutor-btn-pagination-page:hover { background: #f1f5f9; border-color: #cbd5e1; color: #334155; }
.tutor-btn-pagination-page.active { background: #667eea; color: white; border-color: #667eea; }
.tutor-btn-pagination-page.active:hover { background: #5568d3; border-color: #5568d3; }
/* AssignmentModals.css - 나머지 스타일은 매우 길어서 별도 파일로 유지하거나 필요시 추가 */
`}} />
      <div className="assignment-management">
      {/* 분반별 페이지인 경우 통합 네비게이션 표시 */}
      {sectionId && currentSection && (
        <>
          <div className="tutor-page-header">
            <h1 className="tutor-page-title">과제 관리</h1>
            <div className="tutor-header-actions">
              <button 
                className="tutor-btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                과제 추가하기
              </button>
            </div>
          </div>
          
          <div className="tutor-filters-section">
            <div className="tutor-search-box">
              <input
                type="text"
                placeholder="과제명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="tutor-search-input"
              />
            </div>
          </div>
        </>
      )}
      
      {/* 전체 페이지인 경우 기존 헤더 유지 */}
      {!sectionId && (
        <>
          <div className="tutor-page-header">
            <div className="tutor-header-left">
              <h1 className="tutor-page-title">전체 과제 관리</h1>
              {/* 분반별 페이지가 아닌 경우에만 검색창 표시 */}
              {!sectionId && (
                <div className="tutor-search-box">
                  <input
                    type="text"
                    placeholder="과제명, 설명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="tutor-search-input"
                  />
                </div>
              )}
            </div>
            <div className="tutor-header-right">
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
              <div className="tutor-header-actions">
                <button 
                  className="tutor-btn-secondary"
                  onClick={handleStandaloneProblemCreate}
                  title="단일 문제를 생성합니다"
                >
                  <span>📝</span>
                  새 문제 만들기
                </button>
                <button 
                  className="tutor-btn-secondary"
                  onClick={handleBulkProblemCreate}
                  title="여러 문제를 한번에 생성합니다"
                >
                  문제 대량 생성
                </button>
                <button 
                  className="tutor-btn-secondary tutor-btn-primary-color"
                  onClick={handleAddAssignment}
                >
                  새 과제 만들기
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {sectionId ? (
        <AssignmentTableView
          paginatedAssignments={paginatedAssignments}
          submissionStats={submissionStats}
          openMoreMenu={openMoreMenu}
          onToggleMoreMenu={(id) => setOpenMoreMenu(openMoreMenu === id ? null : id)}
          onProblemListManage={(assignment) => {
            setSelectedAssignmentForProblemList(assignment);
            setShowProblemListModal(true);
            setProblemListSearchTerm('');
          }}
          onAddProblem={handleAddProblem}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
          paginationProps={{
            currentPage,
            totalPages,
            startIndex,
            endIndex,
            totalItems: filteredAssignments.length,
            onPageChange: setCurrentPage
          }}
        />
        ) : (
          <AssignmentListView
            filteredAssignments={filteredAssignments}
            submissionStats={submissionStats}
            expandedAssignments={expandedAssignments}
            searchTerm={searchTerm}
            filterSection={filterSection}
            openMoreMenu={openMoreMenu}
            onToggleAssignment={toggleAssignment}
            onToggleMoreMenu={(id) => setOpenMoreMenu(openMoreMenu === id ? null : id)}
            onAddProblem={handleAddProblem}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
            onRemoveProblem={handleRemoveProblem}
          />
        )}

        {/* 과제 추가 모달 */}

        {/* 과제 추가 모달 */}
        <AssignmentAddModal
          isOpen={showAddModal}
          formData={formData}
          sections={sections}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
        />

        {/* 과제 수정 모달 */}
        <AssignmentEditModal
          isOpen={showEditModal}
          formData={formData}
          selectedAssignment={selectedAssignment}
          sections={sections}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateAssignment}
          onInputChange={handleInputChange}
        />

        {/* 문제 선택 모달 (현재 수업의 문제들) */}
        <ProblemSelectModal
          isOpen={showProblemModal}
          selectedAssignment={selectedAssignment}
          filteredProblems={filteredProblems}
          selectedProblemIds={selectedProblemIds}
          problemSearchTerm={problemSearchTerm}
          onClose={closeProblemModals}
          onProblemToggle={handleProblemToggle}
          onSelectAll={handleSelectAllProblems}
          onSearchChange={(value) => setProblemSearchTerm(value)}
          onSelectProblems={handleSelectProblem}
          onCopyProblem={() => {
            setShowProblemModal(false);
            setShowCopyProblemModal(true);
            setSelectedSectionForProblem('');
            handleSectionChangeForProblem(null);
            setCopyProblemSearchTerm('');
            setProblemViewMode('list');
          }}
          onCreateNew={handleCreateNewProblem}
          onProblemDetail={async (problemId) => {
            try {
              const problemDetail = await APIService.getProblemInfo(problemId);
              setSelectedProblemForDetail({
                ...problemDetail,
                id: problemId
              });
              setShowProblemDetailModal(true);
            } catch (error) {
              console.error('문제 정보 조회 실패:', error);
              alert('문제 정보를 불러오는데 실패했습니다.');
            }
          }}
        />

        {/* 새 문제 생성 모달 */}
        <ProblemCreateModal
          isOpen={showCreateProblemModal}
          formData={problemFormData}
          onClose={closeProblemModals}
          onSubmit={handleCreateProblemSubmit}
          onInputChange={handleProblemInputChange}
        />

        {/* 독립적인 새 문제 생성 모달 */}
        <StandaloneProblemCreateModal
          isOpen={showStandaloneProblemModal}
          formData={problemFormData}
          onClose={closeStandaloneProblemModal}
          onSubmit={handleStandaloneProblemSubmit}
          onInputChange={handleProblemInputChange}
        />

        {/* 대량 문제 생성 모달 */}
        <BulkProblemCreateModal
          isOpen={showBulkProblemModal}
          bulkProblemData={bulkProblemData}
          onClose={closeBulkProblemModal}
          onSubmit={handleBulkProblemSubmit}
          onInputChange={handleBulkProblemInputChange}
          onFileChange={handleBulkProblemFileChange}
          onAddRow={addProblemRow}
          onRemoveRow={removeProblemRow}
        />

        {/* 문제 설명보기 패널 */}
        {selectedProblemDetail && (
          <>
            <div className="tutor-detail-overlay" onClick={() => setSelectedProblemDetail(null)}></div>
            <div className="tutor-detail-panel" onClick={(e) => e.stopPropagation()}>
              <div className="tutor-detail-panel-header">
                <h3>문제 설명</h3>
                <button
                  className="tutor-btn-close-detail"
                  onClick={() => setSelectedProblemDetail(null)}
                >
                  ×
                </button>
      </div>
              <div className="tutor-detail-panel-content">
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
              </div>
            </div>
          </>
        )}
      </div>

        {/* 문제 가져오기 모달 (수업 및 문제 선택) */}
        {showCopyProblemModal && createPortal(
          <div className="assignment-management-copy-problem-modal-overlay" onClick={() => {
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
            <div className="assignment-management-copy-problem-modal-content assignment-management-tutor-problem-modal assignment-management-tutor-problem-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="assignment-management-copy-problem-modal-header">
                <div className="assignment-management-copy-problem-modal-header-left">
                  <button 
                    className="assignment-management-tutor-btn-back"
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
                  className="assignment-management-copy-problem-modal-close"
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
              
              <div className="assignment-management-copy-problem-modal-body">
                <div className="tutor-copy-problem-controls">
                  <div className="section-select-box">
                    <label htmlFor="section-select-copy">수업 선택 *</label>
                    <select
                      id="section-select-copy"
                      value={selectedSectionForProblem}
                      onChange={(e) => {
                        const sectionId = e.target.value;
                        setSelectedSectionForProblem(sectionId);
                        setSelectedProblemIds([]);
                        setCopyProblemSearchTerm('');
                        if (sectionId) {
                          handleSectionChangeForProblem(sectionId);
                        } else {
                          setAssignmentsForProblem([]);
                          setExpandedAssignmentsForProblem({});
                          setAssignmentProblems({});
                        }
                      }}
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
                    <div className="tutor-copy-problem-toolbar">
                      <div className="tutor-problem-search-box">
                    <input
                      type="text"
                      placeholder="문제명으로 검색..."
                      value={copyProblemSearchTerm}
                      onChange={(e) => setCopyProblemSearchTerm(e.target.value)}
                      className="tutor-search-input"
                    />
                </div>

                      <div className="tutor-view-mode-tabs">
                        <button
                          className={`tutor-tab-button ${problemViewMode === 'list' ? 'tutor-active' : ''}`}
                          onClick={() => setProblemViewMode('list')}
                        >
                          목록 보기
                        </button>
                        <button
                          className={`tutor-tab-button ${problemViewMode === 'hierarchy' ? 'tutor-active' : ''}`}
                          onClick={() => setProblemViewMode('hierarchy')}
                        >
                          과제별 보기
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {loadingAssignmentsForProblem ? (
                  <div className="tutor-loading-items">과제를 불러오는 중...</div>
                ) : selectedSectionForProblem && assignmentsForProblem.length === 0 ? (
                  <div className="tutor-no-items">선택한 수업에 과제가 없습니다.</div>
                ) : selectedSectionForProblem ? (
                  <>
                    {problemViewMode === 'list' ? (
                      <div className="tutor-problem-list-view">
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
                              <div className="tutor-problem-selection-header">
                                <label className="tutor-checkbox-label">
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
                                <span className="tutor-item-count">
                                  {selectedProblemIds.length} / {filteredProblems.length}개 선택됨
                            </span>
                          </div>
                              <div className="tutor-available-problems-grid">

                                {filteredProblems.length > 0 ? (
                                  filteredProblems.map((problem) => (
                                    <div key={problem.id} className="tutor-problem-card">
                                      <div className="tutor-problem-card-header">
                                        <input
                                          type="checkbox"
                                          checked={selectedProblemIds.includes(problem.id)}
                                          onChange={() => handleProblemToggle(problem.id)}
                                          className="tutor-problem-checkbox"
                                        />
                                      </div>
                                      <div className="tutor-problem-card-body">
                                        <h4 className="tutor-problem-card-title">{removeCopyLabel(problem.title)}</h4>
                                        <div className="tutor-problem-card-meta-row">
                                          <span className="tutor-problem-card-date">
                                            생성일: {new Date(problem.createdAt).toLocaleDateString('ko-KR')}
                                          </span>
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
                      ))
                  ) : (
                    <div className="tutor-no-available-problems">
                                    <p>검색 조건에 맞는 문제가 없습니다.</p>
                    </div>
                  )}
                </div>
                            </>
                          );
                        })()}
              </div>
                    ) : (
                      <div className="tutor-problem-hierarchy-view">
                        {selectedProblemIds.length > 0 && (
                          <div className="tutor-problem-selection-header">
                            <span className="tutor-item-count">
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
                              <div key={assignment.id} className={`assignment-item-large ${isExpanded ? 'tutor-expanded' : ''}`}>
                                <div className="assignment-item-header-large">
                                  <label className="tutor-checkbox-label">
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
                                      className="tutor-btn-expand-assignment-large"
                                      onClick={() => toggleAssignmentForProblem(assignment.id)}
                >
                                      {isExpanded ? '접기 ▲' : '문제 보기 ▼'}
                </button>
                                  )}
              </div>
                                
                                {isExpanded && assignmentProblemsList.length > 0 && (
                                  <div className="tutor-problem-selection-box-large">
                                    <div className="tutor-problem-selection-header-large">
                                      <label className="tutor-checkbox-label">
                                        <input
                                          type="checkbox"
                                          checked={allSelected}
                                          onChange={() => handleSelectAllProblemsForAssignment(assignment.id)}
                                        />
                                        <span>문제 전체 선택</span>
                                      </label>
                                      <span className="tutor-item-count">
                                        {selectedProblems.length} / {assignmentProblemsList.length}개
                                      </span>
                                    </div>
                                    <div className="tutor-problem-list-large">
                                      {assignmentProblemsList.map((problem, index) => (
                                        <div key={problem.id} className="tutor-problem-item-large">
                                          <div className="tutor-problem-item-large-header">
                                            <input
                                              type="checkbox"
                                              checked={selectedProblemIds.includes(problem.id)}
                                              onChange={() => handleProblemToggleForAdd(assignment.id, problem.id)}
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
                  </>
                ) : (
                  <div className="tutor-no-items">수업을 선택해주세요.</div>
                )}
              </div>

              <div className="assignment-management-copy-problem-modal-footer">
                <button 
                  type="button"
                  className="tutor-btn-secondary"
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
                    className="tutor-btn-primary"
                    onClick={() => {
                      handleSelectProblem(selectedProblemIds);
                      setShowCopyProblemModal(false);
                      setSelectedSectionForProblem('');
                      handleSectionChangeForProblem(null);
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
          </div>,
          document.body
        )}

        {/* 문제 목록 모달 */}
        <ProblemListModal
          isOpen={showProblemListModal}
          selectedAssignment={selectedAssignmentForProblemList}
          submissionStats={submissionStats}
          searchTerm={problemListSearchTerm}
          onClose={() => {
            setShowProblemListModal(false);
            setSelectedAssignmentForProblemList(null);
            setSelectedProblemForDetail(null);
            setShowProblemDetailModal(false);
          }}
          onAddProblem={handleAddProblem}
          onRemoveProblem={handleRemoveProblem}
          onProblemDetail={async (problemId) => {
            try {
              const problemDetail = await APIService.getProblemInfo(problemId);
              setSelectedProblemForDetail({
                ...problemDetail,
                id: problemId
              });
              setShowProblemDetailModal(true);
            } catch (error) {
              console.error('문제 상세 정보 조회 실패:', error);
              alert('문제 상세 정보를 불러오는데 실패했습니다.');
            }
          }}
          onProblemViewDetail={async (problemId) => {
            try {
              const problemDetail = await APIService.getProblemInfo(problemId);
              setSelectedProblemForDetail({
                ...problemDetail,
                id: problemId
              });
              setShowProblemDetailModal(true);
            } catch (error) {
              console.error('문제 정보 조회 실패:', error);
              alert('문제 정보를 불러오는데 실패했습니다.');
            }
          }}
          onSearchChange={(value) => setProblemListSearchTerm(value)}
          onProblemUpdated={() => {
            refetchAssignments();
            refetchSubmissionStats();
          }}
        />

        {/* 문제 상세 및 수정 모달 */}
        <ProblemDetailModal
          isOpen={showProblemDetailModal}
          problemDetail={selectedProblemForDetail}
          onClose={() => {
            setShowProblemDetailModal(false);
            setSelectedProblemForDetail(null);
          }}
        />
     
    </TutorLayout>
  );
};

export default AssignmentManagement;
