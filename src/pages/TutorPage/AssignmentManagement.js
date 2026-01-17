import React, { useState, useEffect } from "react";
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
import "./AssignmentManagement.css";
import "./AssignmentManagementList.css";
import "./AssignmentTable.css";
import "./Pagination.css";
import "../../components/AssignmentModals/AssignmentModals.css";

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
              const problemInfo = await APIService.getProblemInfo(problemId);
              setSelectedProblemDetail(problemInfo.data || problemInfo);
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
        {showCopyProblemModal && (
          <div className="tutor-modal-overlay" onClick={() => {
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
            <div className="tutor-modal-content tutor-problem-modal tutor-problem-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="tutor-modal-header">
                <div className="tutor-modal-header-left">
                  <button 
                    className="tutor-btn-back"
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
                  className="tutor-modal-close"
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
              
              <div className="tutor-problem-modal-body">
                <div className="tutor-copy-problem-controls">
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

              <div className="tutor-modal-footer">
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
          </div>
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
          onSearchChange={(value) => setProblemListSearchTerm(value)}
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
