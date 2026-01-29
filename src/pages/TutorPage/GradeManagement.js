import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import SectionNavigation from "../../components/SectionNavigation";
import APIService from "../../services/APIService";
import { FaFileExport, FaChartBar, FaEdit, FaCode, FaClock, FaCheckCircle, FaTimesCircle, FaDownload, FaWeight } from "react-icons/fa";
import "./GradeManagement.css";

const GradeManagement = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  
  // 상태 관리
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGrade, setEditingGrade] = useState(null); // { userId, problemId }
  const [gradeInputs, setGradeInputs] = useState({}); // { `${userId}-${problemId}`: score }
  const [comments, setComments] = useState({}); // { `${userId}-${problemId}`: comment }
  const [viewMode, setViewMode] = useState('course'); // 'assignment' | 'quiz' | 'course'
  const [courseGrades, setCourseGrades] = useState(null);
  const [courseLoading, setCourseLoading] = useState(false);
  
  // 모달 상태
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsInputs, setPointsInputs] = useState({}); // { problemId: points }
  const [pointsSaving, setPointsSaving] = useState(false);
  const [assignmentProblems, setAssignmentProblems] = useState([]); // 과제의 모든 문제 목록
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [allAssignmentProblems, setAllAssignmentProblems] = useState([]); // 수업 전체 보기용: { assignmentId, assignmentTitle, problems: [...] }

  useEffect(() => {
    fetchData();
  }, [sectionId]);

  useEffect(() => {
    if (selectedAssignment && sectionId) {
      fetchGrades();
    } else if (selectedQuiz && sectionId) {
      fetchQuizGrades();
    }
  }, [selectedAssignment, selectedQuiz, sectionId]);
  
  const fetchQuizGrades = async () => {
    if (!selectedQuiz || !sectionId) return;
    
    try {
      setLoading(true);
      // 퀴즈 성적 조회
      const response = await APIService.getQuizGrades(sectionId, selectedQuiz.id);
      const gradesData = response?.data || response || [];
      setGrades(gradesData);
      
      // 기존 점수와 코멘트를 입력 상태로 초기화
      const initialInputs = {};
      const initialComments = {};
      gradesData.forEach(student => {
        student.problemGrades?.forEach(problem => {
          const key = `${student.userId}-${problem.problemId}`;
          if (problem.score !== null && problem.score !== undefined) {
            initialInputs[key] = problem.score;
          }
        });
      });
      setGradeInputs(initialInputs);
      setComments(initialComments);
      
      setLoading(false);
    } catch (error) {
      console.error('퀴즈 성적 조회 실패:', error);
      setGrades([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'course' && sectionId && (assignments.length > 0 || quizzes.length > 0)) {
      fetchCourseGrades();
    }
  }, [viewMode, sectionId, assignments, quizzes]);

  // 퀴즈별 보기 모드일 때 첫 번째 퀴즈 자동 선택
  useEffect(() => {
    if (viewMode === 'quiz' && quizzes.length > 0 && !selectedQuiz) {
      setSelectedQuiz(quizzes[0]);
    }
  }, [viewMode, quizzes, selectedQuiz]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 분반 정보 조회
      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || dashboardResponse || [];
      setSections(sectionsData);
      
      // 현재 분반 정보 설정
      if (sectionId) {
        const currentSectionData = sectionsData.find(section => 
          section.sectionId === parseInt(sectionId)
        );
        setCurrentSection(currentSectionData);
        
        // 해당 분반의 과제 목록 조회
        try {
          const assignmentsResponse = await APIService.getAssignmentsBySection(sectionId);
          const assignmentsData = assignmentsResponse?.data || assignmentsResponse || [];
          setAssignments(assignmentsData);
          
          // 첫 번째 과제를 기본 선택
          if (assignmentsData.length > 0 && !selectedAssignment) {
            setSelectedAssignment(assignmentsData[0]);
          }
        } catch (error) {
          console.error('과제 목록 조회 실패:', error);
          setAssignments([]);
        }
        
        // 해당 분반의 퀴즈 목록 조회
        try {
          const quizzesResponse = await APIService.getQuizzesBySection(sectionId);
          const quizzesData = quizzesResponse?.data || quizzesResponse || [];
          setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
        } catch (error) {
          console.error('퀴즈 목록 조회 실패:', error);
          setQuizzes([]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      setSections([]);
      setAssignments([]);
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    if (!selectedAssignment || !sectionId) return;
    
    try {
      setLoading(true);
      const response = await APIService.getAssignmentGrades(sectionId, selectedAssignment.id);
      const gradesData = response?.data || response || [];
      setGrades(gradesData);
      
      // 기존 점수와 코멘트를 입력 상태로 초기화
      const initialInputs = {};
      const initialComments = {};
      gradesData.forEach(student => {
        student.problemGrades?.forEach(problem => {
          const key = `${student.userId}-${problem.problemId}`;
          if (problem.score !== null && problem.score !== undefined) {
            initialInputs[key] = problem.score;
          }
          // 코멘트는 백엔드에서 제공하지 않을 수 있으므로 나중에 추가
        });
      });
      setGradeInputs(initialInputs);
      setComments(initialComments);
      
      setLoading(false);
    } catch (error) {
      console.error('성적 조회 실패:', error);
      setGrades([]);
      setLoading(false);
    }
  };

  const fetchCourseGrades = async () => {
    if (!sectionId || (assignments.length === 0 && quizzes.length === 0)) return;

    try {
      setCourseLoading(true);

      // 과제 성적 조회
      const assignmentGradeResults = await Promise.all(
        assignments.map(async (assignment) => {
          try {
            const response = await APIService.getAssignmentGrades(sectionId, assignment.id);
            const gradesData = response?.data || response || [];
            return { type: 'assignment', item: assignment, grades: gradesData };
          } catch (error) {
            console.error('수업 전체 성적 조회 중 과제별 조회 실패:', assignment.id, error);
            return { type: 'assignment', item: assignment, grades: [] };
          }
        })
      );

      // 퀴즈 성적 조회 (퀴즈는 제출 정보를 기반으로 처리)
      const quizResults = await Promise.all(
        quizzes.map(async (quiz) => {
          try {
            // 퀴즈 성적 조회
            const gradesResponse = await APIService.getQuizGrades(sectionId, quiz.id);
            const quizGrades = gradesResponse?.data || gradesResponse || [];
            
            // 퀴즈 문제 목록은 성적 데이터에서 추출
            const problems = quizGrades.length > 0 && quizGrades[0]?.problemGrades
              ? quizGrades[0].problemGrades.map(pg => ({
                  problemId: pg.problemId,
                  problemTitle: pg.problemTitle,
                  points: pg.points || 1
                }))
              : [];
            
            return { 
              type: 'quiz', 
              item: quiz, 
              problems: problems,
              grades: Array.isArray(quizGrades) ? quizGrades : []
            };
          } catch (error) {
            console.error('수업 전체 성적 조회 중 퀴즈별 조회 실패:', quiz.id, error);
            return { type: 'quiz', item: quiz, problems: [], grades: [] };
          }
        })
      );

      const studentMap = new Map();
      const courseItems = [];

      // 과제 처리
      assignmentGradeResults.forEach(({ item: assignment, grades: assignmentGrades }) => {
        if (!assignmentGrades.length || !assignmentGrades[0]?.problemGrades) {
          return;
        }

        const problems = assignmentGrades[0].problemGrades.map((problem) => ({
          problemId: problem.problemId,
          problemTitle: problem.problemTitle,
          points: problem.points,
        }));

        const totalPoints =
          assignmentGrades[0].totalPoints ||
          problems.reduce((sum, p) => sum + (p.points || 0), 0);

        courseItems.push({
          type: 'assignment',
          id: assignment.id,
          title: assignment.title,
          problems,
          totalPoints,
        });

        assignmentGrades.forEach((student) => {
          if (!studentMap.has(student.userId)) {
            studentMap.set(student.userId, {
              userId: student.userId,
              studentName: student.studentName,
              studentId: student.studentId,
              assignments: {},
              quizzes: {},
            });
          }

          const studentEntry = studentMap.get(student.userId);
          const problemsMap = {};

          student.problemGrades?.forEach((pg) => {
            problemsMap[pg.problemId] = pg;
          });

          const totalScore = student.totalScore || 0;
          const assignmentTotalPoints = student.totalPoints || totalPoints || 0;
          const ratio =
            assignmentTotalPoints > 0
              ? ((totalScore / assignmentTotalPoints) * 100).toFixed(1)
              : '0.0';

          studentEntry.assignments[assignment.id] = {
            totalScore,
            totalPoints: assignmentTotalPoints,
            ratio,
            problems: problemsMap,
          };
        });
      });

      // 퀴즈 처리
      quizResults.forEach(({ item: quiz, problems, grades: quizGrades }) => {
        if (problems.length === 0) return;

        const totalPoints = problems.length; // 퀴즈는 기본적으로 문제당 1점

        courseItems.push({
          type: 'quiz',
          id: quiz.id,
          title: quiz.title,
          problems: problems.map((p) => ({
            problemId: p.problemId || p.id,
            problemTitle: p.problemTitle || p.title,
            points: p.points || 1, // 퀴즈는 기본 1점
          })),
          totalPoints,
        });

        // 퀴즈 성적 처리
        if (quizGrades && quizGrades.length > 0) {
          quizGrades.forEach((student) => {
            if (!studentMap.has(student.userId)) {
              studentMap.set(student.userId, {
                userId: student.userId,
                studentName: student.studentName,
                studentId: student.studentId,
                assignments: {},
                quizzes: {},
              });
            }

            const studentEntry = studentMap.get(student.userId);
            const problemsMap = {};

            student.problemGrades?.forEach((pg) => {
              problemsMap[pg.problemId] = pg;
            });

            const totalScore = student.totalScore || 0;
            const quizTotalPoints = student.totalPoints || totalPoints || 0;
            const ratio =
              quizTotalPoints > 0
                ? ((totalScore / quizTotalPoints) * 100).toFixed(1)
                : '0.0';

            studentEntry.quizzes[quiz.id] = {
              totalScore,
              totalPoints: quizTotalPoints,
              ratio,
              problems: problemsMap,
            };
          });
        }
      });

      setCourseGrades({
        items: courseItems,
        students: Array.from(studentMap.values()),
      });
    } catch (error) {
      console.error('수업 전체 성적 조회 실패:', error);
      setCourseGrades(null);
    } finally {
      setCourseLoading(false);
    }
  };

  const handleSaveGrade = async (userId, problemId, score, comment) => {
    if (!selectedAssignment || !sectionId) return;
    
    try {
      const gradeData = {
        userId: userId,
        problemId: problemId,
        score: score !== null && score !== '' ? parseInt(score) : null,
        comment: comment || null
      };
      
      await APIService.saveGrade(sectionId, selectedAssignment.id, gradeData);
      
      // 성적 목록 새로고침
      await fetchGrades();
      
      // 편집 상태 해제
      setEditingGrade(null);
      
      alert('성적이 저장되었습니다.');
    } catch (error) {
      console.error('성적 저장 실패:', error);
      alert(error.message || '성적 저장에 실패했습니다.');
    }
  };

  const handleViewCode = async (userId, problemId) => {
    if (!selectedAssignment || !sectionId) return;
    
    try {
      const codeResponse = await APIService.getStudentAcceptedCode(
        sectionId,
        selectedAssignment.id,
        userId,
        problemId
      );
      setSelectedCode(codeResponse);
      setShowCodeModal(true);
    } catch (error) {
      console.error('코드 조회 실패:', error);
      alert('코드를 불러올 수 없습니다.');
    }
  };

  // CSV 내보내기
  const handleExportCSV = () => {
    // 수업 전체 보기 모드인 경우
    if (viewMode === 'course' && courseGrades && courseGrades.items && courseGrades.items.length > 0 && filteredCourseStudents.length > 0) {
      // CSV 헤더 생성
      const headers = ['학생명', '학번'];
      
      // 각 과제/퀴즈별로 문제 헤더 추가
      courseGrades.items.forEach(item => {
        item.problems.forEach(problem => {
          headers.push(`${item.title} - ${problem.problemTitle} (${problem.points}점)`);
        });
        // 각 과제/퀴즈별 총점 헤더 추가
        headers.push(`${item.title} 총점`);
      });
      
      // 전체 총점 헤더 추가
      headers.push('전체 총점', '전체 비율(%)');

      // CSV 데이터 생성
      const rows = [headers.join(',')];
      
      filteredCourseStudents.forEach(student => {
        const row = [
          `"${student.studentName || ''}"`,
          `"${student.studentId || ''}"`
        ];
        
        let totalAllScore = 0;
        let totalAllPoints = 0;
        
        // 각 과제/퀴즈별 점수 추가
        courseGrades.items.forEach(item => {
          let itemTotalScore = 0;
          let itemTotalPoints = 0;
          
          if (item.type === 'assignment') {
            const assignmentData = student.assignments?.[item.id];
            item.problems.forEach(problem => {
              const problemGrade = assignmentData?.problems?.[problem.problemId];
              const score = problemGrade && problemGrade.score !== null && problemGrade.score !== undefined
                ? problemGrade.score
                : '';
              row.push(score);
              if (score !== '' && score !== null) {
                itemTotalScore += parseInt(score);
              }
              itemTotalPoints += problem.points;
            });
            // 과제별 총점 추가
            if (assignmentData) {
              row.push(`${assignmentData.totalScore} / ${assignmentData.totalPoints}`);
              totalAllScore += assignmentData.totalScore;
              totalAllPoints += assignmentData.totalPoints;
            } else {
              row.push('-');
            }
          } else if (item.type === 'quiz') {
            const quizData = student.quizzes?.[item.id];
            item.problems.forEach(problem => {
              const problemGrade = quizData?.problems?.[problem.problemId];
              const score = problemGrade && problemGrade.score !== null && problemGrade.score !== undefined
                ? problemGrade.score
                : '';
              row.push(score);
              if (score !== '' && score !== null) {
                itemTotalScore += parseInt(score);
              }
              itemTotalPoints += problem.points;
            });
            // 퀴즈별 총점 추가
            if (quizData) {
              row.push(`${quizData.totalScore} / ${quizData.totalPoints}`);
              totalAllScore += quizData.totalScore;
              totalAllPoints += quizData.totalPoints;
            } else {
              row.push('-');
            }
          }
        });
        
        // 전체 총점과 비율 추가
        const totalRatio = totalAllPoints > 0 ? ((totalAllScore / totalAllPoints) * 100).toFixed(1) : '0.0';
        row.push(`${totalAllScore} / ${totalAllPoints}`, totalRatio);
        
        rows.push(row.join(','));
      });

      // CSV 파일 생성 및 다운로드
      const csvContent = rows.join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const fileName = currentSection 
        ? `${currentSection.courseTitle}_${currentSection.sectionNumber}분반_전체성적_${new Date().toISOString().split('T')[0]}.csv`
        : `전체성적_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 퀴즈별 보기 모드인 경우
    if (viewMode === 'quiz' && selectedQuiz && grades.length > 0) {
      // CSV 헤더 생성
      const headers = ['학생명', '학번'];
      if (grades[0]?.problemGrades) {
        grades[0].problemGrades.forEach(problem => {
          headers.push(`${problem.problemTitle} (${problem.points}점)`);
        });
      }
      headers.push('총점', '비율(%)');

      // CSV 데이터 생성
      const rows = [headers.join(',')];
      
      filteredGrades.forEach(student => {
        const row = [
          `"${student.studentName || ''}"`,
          `"${student.studentId || ''}"`
        ];
        
        student.problemGrades?.forEach(problem => {
          const score = problem.score !== null && problem.score !== undefined 
            ? problem.score 
            : '';
          row.push(score);
        });
        
        const totalScore = student.totalScore || 0;
        const totalPoints = student.totalPoints || 0;
        const ratio = totalPoints > 0 ? ((totalScore / totalPoints) * 100).toFixed(1) : 0;
        
        row.push(totalScore, ratio);
        rows.push(row.join(','));
      });

      // CSV 파일 생성 및 다운로드
      const csvContent = rows.join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedQuiz.title}_성적_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 과제별 보기 모드인 경우
    if (!selectedAssignment || grades.length === 0) {
      alert('내보낼 성적 데이터가 없습니다.');
      return;
    }

    // CSV 헤더 생성
    const headers = ['학생명', '학번'];
    if (grades[0]?.problemGrades) {
      grades[0].problemGrades.forEach(problem => {
        headers.push(`${problem.problemTitle} (${problem.points}점)`);
      });
    }
    headers.push('총점', '비율(%)');

    // CSV 데이터 생성
    const rows = [headers.join(',')];
    
    filteredGrades.forEach(student => {
      const row = [
        `"${student.studentName || ''}"`,
        `"${student.studentId || ''}"`
      ];
      
      student.problemGrades?.forEach(problem => {
        const score = problem.score !== null && problem.score !== undefined 
          ? problem.score 
          : '';
        row.push(score);
      });
      
      const totalScore = student.totalScore || 0;
      const totalPoints = student.totalPoints || 0;
      const ratio = totalPoints > 0 ? ((totalScore / totalPoints) * 100).toFixed(1) : 0;
      
      row.push(totalScore, ratio);
      rows.push(row.join(','));
    });

    // CSV 파일 생성 및 다운로드
    const csvContent = rows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedAssignment.title}_성적_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 일괄 점수 입력
  const [bulkInputs, setBulkInputs] = useState({}); // { problemId: score }
  const [bulkSaving, setBulkSaving] = useState(false);

  const handleBulkSave = async () => {
    if (!selectedAssignment || !sectionId || Object.keys(bulkInputs).length === 0) {
      alert('입력할 점수가 없습니다.');
      return;
    }

    try {
      setBulkSaving(true);
      
      // 일괄 입력 데이터 구성
      const bulkData = {
        grades: []
      };

      // 각 학생별로 각 문제에 대해 점수 입력
      filteredGrades.forEach(student => {
        student.problemGrades?.forEach(problem => {
          const problemId = problem.problemId;
          if (bulkInputs[problemId] !== undefined && bulkInputs[problemId] !== '') {
            bulkData.grades.push({
              userId: student.userId,
              problemId: problemId,
              score: parseInt(bulkInputs[problemId])
            });
          }
        });
      });

      if (bulkData.grades.length === 0) {
        alert('입력할 점수가 없습니다.');
        setBulkSaving(false);
        return;
      }

      await APIService.saveBulkGrades(sectionId, selectedAssignment.id, bulkData);
      
      // 성적 목록 새로고침
      await fetchGrades();
      
      // 일괄 입력 모달 닫기 및 입력값 초기화
      setShowBulkModal(false);
      setBulkInputs({});
      
      alert(`${bulkData.grades.length}개의 성적이 저장되었습니다.`);
    } catch (error) {
      console.error('일괄 성적 저장 실패:', error);
      alert(error.message || '일괄 성적 저장에 실패했습니다.');
    } finally {
      setBulkSaving(false);
    }
  };

  // 배점 설정 모달 열기 - 과제의 모든 문제 가져오기
  useEffect(() => {
    const fetchAssignmentProblemsForPoints = async () => {
      if (showPointsModal && sectionId) {
        try {
          setLoadingProblems(true);
          
          if (viewMode === 'course' && assignments.length > 0) {
            // 수업 전체 보기: 모든 과제의 문제 가져오기
            const allProblemsData = await Promise.all(
              assignments.map(async (assignment) => {
                try {
                  const problemsResponse = await APIService.getAssignmentProblems(sectionId, assignment.id);
                  const problemsData = problemsResponse?.data || problemsResponse || {};
                  const problems = problemsData.problems || problemsData || [];
                  const problemsArray = Array.isArray(problems) ? problems : [];
                  
                  return {
                    assignmentId: assignment.id,
                    assignmentTitle: assignment.title,
                    problems: problemsArray.map(problem => ({
                      ...problem,
                      assignmentId: assignment.id,
                      assignmentTitle: assignment.title
                    }))
                  };
                } catch (error) {
                  console.error(`과제 ${assignment.id}의 문제 조회 실패:`, error);
                  return {
                    assignmentId: assignment.id,
                    assignmentTitle: assignment.title,
                    problems: []
                  };
                }
              })
            );
            
            setAllAssignmentProblems(allProblemsData);
            
            // 현재 배점을 입력 상태로 초기화 (과제별로 구분)
            const initialPoints = {};
            allProblemsData.forEach(({ problems }) => {
              problems.forEach(problem => {
                const problemId = problem.id || problem.problemId;
                if (problemId) {
                  // 문제 ID와 과제 ID를 조합한 키 사용
                  const key = `${problem.assignmentId}-${problemId}`;
                  initialPoints[key] = (problem.points && problem.points > 0) ? problem.points : 1;
                }
              });
            });
            
            setPointsInputs(initialPoints);
            setAssignmentProblems([]); // 단일 과제 모드용은 비움
          } else if (selectedAssignment) {
            // 과제별 보기: 선택된 과제의 문제만 가져오기
            const problemsResponse = await APIService.getAssignmentProblems(sectionId, selectedAssignment.id);
            const problemsData = problemsResponse?.data || problemsResponse || {};
            const problems = problemsData.problems || problemsData || [];
            const problemsArray = Array.isArray(problems) ? problems : [];
            setAssignmentProblems(problemsArray);
            setAllAssignmentProblems([]); // 수업 전체 모드용은 비움

            // 현재 배점을 입력 상태로 초기화
            const initialPoints = {};
            problemsArray.forEach(problem => {
              const problemId = problem.id || problem.problemId;
              if (problemId) {
                initialPoints[problemId] = (problem.points && problem.points > 0) ? problem.points : 1;
              }
            });
            
            setPointsInputs(initialPoints);
          }
        } catch (error) {
          console.error('과제 문제 조회 실패:', error);
          setAssignmentProblems([]);
          setAllAssignmentProblems([]);
        } finally {
          setLoadingProblems(false);
        }
      }
    };

    fetchAssignmentProblemsForPoints();
  }, [showPointsModal, selectedAssignment, sectionId, viewMode, assignments]);

  // 배점 일괄 저장
  const handleSavePoints = async () => {
    if (!sectionId) {
      alert('분반 정보가 없습니다.');
      return;
    }

    try {
      setPointsSaving(true);
      
      if (viewMode === 'course' && allAssignmentProblems.length > 0) {
        // 수업 전체 보기: 각 과제별로 배점 저장
        let savedCount = 0;
        let errorCount = 0;
        
        for (const { assignmentId, problems } of allAssignmentProblems) {
          if (problems.length === 0) continue;
          
          const problemPoints = {};
          problems.forEach(problem => {
            const problemId = problem.id || problem.problemId;
            if (!problemId) return;
            
            // 입력된 배점이 있으면 사용, 없으면 기본값 1
            const key = `${assignmentId}-${problemId}`;
            const inputPoints = pointsInputs[key];
            let finalPoints = 1;
            
            if (inputPoints !== undefined && inputPoints !== '' && inputPoints !== null) {
              const parsedPoints = parseInt(inputPoints);
              if (!isNaN(parsedPoints) && parsedPoints >= 0) {
                finalPoints = parsedPoints > 0 ? parsedPoints : 1;
              }
            } else {
              const existingPoints = problem.points;
              finalPoints = (existingPoints && existingPoints > 0) ? existingPoints : 1;
            }
            
            problemPoints[parseInt(problemId)] = finalPoints;
          });
          
          if (Object.keys(problemPoints).length > 0) {
            try {
              await APIService.setBulkProblemPoints(sectionId, assignmentId, problemPoints);
              savedCount++;
            } catch (error) {
              console.error(`과제 ${assignmentId} 배점 저장 실패:`, error);
              errorCount++;
            }
          }
        }
        
        if (savedCount > 0) {
          // 성적 목록 새로고침
          if (viewMode === 'course') {
            await fetchCourseGrades();
          } else {
            await fetchGrades();
          }
          
          alert(`${savedCount}개 과제의 배점이 저장되었습니다.${errorCount > 0 ? ` (${errorCount}개 실패)` : ''}`);
        } else {
          alert('저장할 배점이 없습니다.');
        }
      } else if (selectedAssignment && assignmentProblems.length > 0) {
        // 과제별 보기: 선택된 과제의 배점만 저장
        const problemPoints = {};
        assignmentProblems.forEach(problem => {
          const problemId = problem.id || problem.problemId;
          if (!problemId) return;
          
          const inputPoints = pointsInputs[problemId];
          let finalPoints = 1;
          
          if (inputPoints !== undefined && inputPoints !== '' && inputPoints !== null) {
            const parsedPoints = parseInt(inputPoints);
            if (!isNaN(parsedPoints) && parsedPoints >= 0) {
              finalPoints = parsedPoints > 0 ? parsedPoints : 1;
            }
          } else {
            const existingPoints = problem.points;
            finalPoints = (existingPoints && existingPoints > 0) ? existingPoints : 1;
          }
          
          problemPoints[parseInt(problemId)] = finalPoints;
        });

        if (Object.keys(problemPoints).length === 0) {
          alert('유효한 배점을 입력해주세요.');
          setPointsSaving(false);
          return;
        }

        await APIService.setBulkProblemPoints(sectionId, selectedAssignment.id, problemPoints);
        
        // 성적 목록 새로고침
        await fetchGrades();
        
        alert('배점이 저장되었습니다.');
      } else {
        alert('설정할 배점이 없습니다.');
        setPointsSaving(false);
        return;
      }
      
      // 배점 설정 모달 닫기
      setShowPointsModal(false);
      setPointsInputs({});
      setAssignmentProblems([]);
      setAllAssignmentProblems([]);
    } catch (error) {
      console.error('배점 저장 실패:', error);
      alert(error.message || '배점 저장에 실패했습니다.');
    } finally {
      setPointsSaving(false);
    }
  };

  // 통계 계산
  const stats = useMemo(() => {
    if (!grades.length || !grades[0]?.problemGrades) {
      return null;
    }

    const problemStats = grades[0].problemGrades.map(problem => {
      const scores = grades
        .map(student => {
          const pg = student.problemGrades?.find(p => p.problemId === problem.problemId);
          return pg?.score !== null && pg?.score !== undefined ? pg.score : null;
        })
        .filter(score => score !== null);
      
      const validScores = scores.filter(s => s !== null);
      const avg = validScores.length > 0 
        ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
        : 0;
      const max = validScores.length > 0 ? Math.max(...validScores) : 0;
      const min = validScores.length > 0 ? Math.min(...validScores) : 0;
      
      return {
        problemId: problem.problemId,
        problemTitle: problem.problemTitle,
        points: problem.points,
        avg: parseFloat(avg),
        max,
        min,
        submittedCount: grades.filter(student => {
          const pg = student.problemGrades?.find(p => p.problemId === problem.problemId);
          return pg?.submitted || false;
        }).length,
        totalCount: grades.length
      };
    });

    // 전체 통계
    const totalScores = grades.map(s => s.totalScore || 0);
    const totalPoints = grades[0]?.totalPoints || 0;
    const overallAvg = totalScores.length > 0 
      ? (totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(1)
      : 0;
    const overallMax = totalScores.length > 0 ? Math.max(...totalScores) : 0;
    const overallMin = totalScores.length > 0 ? Math.min(...totalScores) : 0;

    return {
      problemStats,
      overall: {
        avg: parseFloat(overallAvg),
        max: overallMax,
        min: overallMin,
        totalPoints,
        totalStudents: grades.length
      }
    };
  }, [grades]);

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = 
      grade.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredCourseStudents = courseGrades
    ? courseGrades.students.filter((student) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          student.studentName?.toLowerCase().includes(lowerSearch) ||
          student.studentId?.toLowerCase().includes(lowerSearch)
        );
      })
    : [];

  if (loading && !grades.length) {
    return (
      <TutorLayout selectedSection={currentSection}>
        <div className="grade-management">
          <div className="grade-loading-container">
            <div className="grade-loading-spinner"></div>
            <p>성적 데이터를 불러오는 중...</p>
          </div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout selectedSection={currentSection}>
      {/* 분반별 페이지인 경우 통합 네비게이션 표시 */}
      {sectionId && currentSection && (
        <SectionNavigation 
          sectionId={sectionId}
          sectionName={`${currentSection.courseTitle} - ${currentSection.sectionNumber}분반`}
          enrollmentCode={currentSection.enrollmentCode}
          title="성적 관리"
          showSearch={false}
        />
      )}
      
      <div className="grade-management">
        {/* 헤더 섹션 */}
        <div className="grade-page-header">
          <div className="grade-header-left">
            <div className="grade-search-box">
              <input
                type="text"
                className="tutor-search-input"
                placeholder="이름, 학번으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {sectionId && (assignments.length > 0 || quizzes.length > 0) && (viewMode === 'assignment' || viewMode === 'quiz') && (
              <div className="grade-filter-group">
                <label className="grade-filter-label" htmlFor="grade-item-select">
                  {viewMode === 'assignment' ? '과제 선택' : '퀴즈 선택'}
                </label>
                <select
                  id="grade-item-select"
                  value={viewMode === 'assignment' ? (selectedAssignment?.id || '') : (selectedQuiz?.id || '')}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (viewMode === 'assignment') {
                      const assignment = assignments.find(a => a.id === parseInt(value));
                      setSelectedAssignment(assignment);
                      setSelectedQuiz(null);
                    } else {
                      const quiz = quizzes.find(q => q.id === parseInt(value));
                      setSelectedQuiz(quiz);
                      setSelectedAssignment(null);
                    }
                  }}
                  className="grade-assignment-select"
                >
                  <option value="">전체 {viewMode === 'assignment' ? '과제' : '퀴즈'}</option>
                  {viewMode === 'assignment' 
                    ? assignments.map(assignment => (
                        <option key={assignment.id} value={assignment.id}>
                          {assignment.title}
                        </option>
                      ))
                    : quizzes.map(quiz => (
                        <option key={quiz.id} value={quiz.id}>
                          {quiz.title}
                        </option>
                      ))
                  }
                </select>
              </div>
            )}
          </div>
          <div className="grade-header-right">
            <div className="grade-view-mode-tabs">
              <button
                type="button"
                className={`grade-tab-button ${viewMode === 'assignment' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('assignment');
                  setSelectedQuiz(null);
                }}
              >
                과제별 보기
              </button>
              <button
                type="button"
                className={`grade-tab-button ${viewMode === 'quiz' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('quiz');
                  setSelectedAssignment(null);
                  // 퀴즈 목록이 있고 선택된 퀴즈가 없으면 첫 번째 퀴즈 선택
                  if (quizzes.length > 0 && !selectedQuiz) {
                    setSelectedQuiz(quizzes[0]);
                  }
                }}
              >
                퀴즈별 보기
              </button>
              <button
                type="button"
                className={`grade-tab-button ${viewMode === 'course' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('course');
                  setSelectedAssignment(null);
                  setSelectedQuiz(null);
                }}
              >
                수업 전체 보기
              </button>
            </div>
            {(selectedAssignment || selectedQuiz || (viewMode === 'course' && (assignments.length > 0 || quizzes.length > 0))) && (
              <>
                <button
                  className="grade-btn-secondary"
                  onClick={() => setShowPointsModal(true)}
                >
                  <FaWeight /> 배점 설정
                </button>
                <button
                  className="grade-btn-secondary"
                  onClick={() => setShowBulkModal(true)}
                >
                  <FaEdit /> 일괄 입력
                </button>
                <button
                  className="grade-btn-secondary"
                  onClick={() => setShowStatsModal(true)}
                >
                  <FaChartBar /> 통계
                </button>
                <button
                  className="grade-btn-primary"
                  onClick={handleExportCSV}
                >
                  <FaFileExport /> 내보내기
                </button>
              </>
            )}
          </div>
        </div>

        {/* 성적 테이블 */}
        {viewMode === 'course' ? (
          <div className="grade-table-container grade-course-table-container">
            {courseLoading ? (
              <div className="grade-loading-container">
                <div className="grade-loading-spinner"></div>
                <p>수업 전체 성적 데이터를 불러오는 중...</p>
              </div>
            ) : courseGrades && courseGrades.items && courseGrades.items.length > 0 && filteredCourseStudents.length > 0 ? (
              <table className="grade-table grade-course-table">
                <thead>
                  <tr>
                    <th rowSpan="2">학생</th>
                    <th rowSpan="2">학번</th>
                    {courseGrades.items.map((item) => (
                      <th
                        key={`${item.type}-${item.id}`}
                        className={`grade-course-assignment-header ${item.type === 'quiz' ? 'grade-course-quiz-header' : ''}`}
                        colSpan={item.problems.length + 1}
                      >
                        <div className="grade-item-title">
                          {item.type === 'quiz' && <span className="grade-item-type-badge">퀴즈</span>}
                          {item.title}
                        </div>
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {courseGrades.items.map((item) => (
                      <React.Fragment key={`${item.type}-${item.id}-problems`}>
                        {item.problems.map((problem) => (
                          <th
                            key={`${item.type}-${item.id}-${problem.problemId}`}
                            className="grade-problem-header grade-course-problem-header"
                          >
                            <div className="grade-problem-title">{problem.problemTitle}</div>
                            <div className="grade-problem-points">({problem.points}점)</div>
                          </th>
                        ))}
                        <th
                          key={`${item.type}-${item.id}-total`}
                          className="grade-course-assignment-total-header"
                        >
                          총점
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCourseStudents.map((student) => (
                    <tr key={student.userId}>
                      <td className="grade-student-name">{student.studentName}</td>
                      <td className="grade-student-id">{student.studentId}</td>
                      {courseGrades.items.map((item) => {
                        if (item.type === 'assignment') {
                          const assignmentData = student.assignments?.[item.id];
                          return (
                            <React.Fragment key={`${student.userId}-assignment-${item.id}`}>
                              {item.problems.map((problem) => {
                                const problemGrade = assignmentData?.problems?.[problem.problemId];
                                const score =
                                  problemGrade && problemGrade.score !== null && problemGrade.score !== undefined
                                    ? problemGrade.score
                                    : null;
                                return (
                                  <td
                                    key={`${student.userId}-assignment-${item.id}-${problem.problemId}`}
                                    className="grade-problem-cell grade-course-problem-cell"
                                  >
                                    {score !== null ? `${score} / ${problem.points}` : '-'}
                                  </td>
                                );
                              })}
                              <td className="grade-total-cell grade-course-assignment-total-cell">
                                {assignmentData ? (
                                  <strong>
                                    {assignmentData.totalScore} / {assignmentData.totalPoints}
                                  </strong>
                                ) : (
                                  '-'
                                )}
                              </td>
                            </React.Fragment>
                          );
                        } else if (item.type === 'quiz') {
                          const quizData = student.quizzes?.[item.id];
                          return (
                            <React.Fragment key={`${student.userId}-quiz-${item.id}`}>
                              {item.problems.map((problem) => {
                                const problemGrade = quizData?.problems?.[problem.problemId];
                                const score =
                                  problemGrade && problemGrade.score !== null && problemGrade.score !== undefined
                                    ? problemGrade.score
                                    : null;
                                return (
                                  <td
                                    key={`${student.userId}-quiz-${item.id}-${problem.problemId}`}
                                    className="grade-problem-cell grade-course-problem-cell"
                                  >
                                    {score !== null ? `${score} / ${problem.points}` : '-'}
                                  </td>
                                );
                              })}
                              <td className="grade-total-cell grade-course-assignment-total-cell">
                                {quizData ? (
                                  <strong>
                                    {quizData.totalScore} / {quizData.totalPoints}
                                  </strong>
                                ) : (
                                  '-'
                                )}
                              </td>
                            </React.Fragment>
                          );
                        }
                        return null;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="grade-no-data">
                <p>수업 전체 성적 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        ) : selectedQuiz && viewMode === 'quiz' && grades.length > 0 ? (
          <div className="grade-table-container">
            <table className="grade-table">
              <thead>
                <tr>
                  <th>학생</th>
                  <th>학번</th>
                  {grades[0]?.problemGrades?.map(problem => (
                    <th key={problem.problemId} className="grade-problem-header">
                      <div className="grade-problem-title">{problem.problemTitle}</div>
                      <div className="grade-problem-points">({problem.points}점)</div>
                    </th>
                  ))}
                  <th>총점</th>
                  <th>비율</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((student) => {
                  const totalScore = student.totalScore || 0;
                  const totalPoints = student.totalPoints || 0;
                  const ratio = totalPoints > 0 ? ((totalScore / totalPoints) * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={student.userId}>
                      <td className="grade-student-name">{student.studentName}</td>
                      <td className="grade-student-id">{student.studentId}</td>
                      {student.problemGrades?.map((problem) => {
                        return (
                          <td key={problem.problemId} className="grade-problem-cell">
                            <div className="grade-score-display">
                              <div className="grade-score-value">
                                {problem.score !== null && problem.score !== undefined 
                                  ? `${problem.score} / ${problem.points}` 
                                  : '-'}
                              </div>
                              {problem.submitted && (
                                <div className="grade-submission-info">
                                  <span className={`grade-submission-status ${problem.isOnTime ? 'on-time' : 'late'}`}>
                                    {problem.isOnTime ? (
                                      <>
                                        <FaCheckCircle /> 제시간
                                      </>
                                    ) : (
                                      <>
                                        <FaTimesCircle /> 지연
                                      </>
                                    )}
                                  </span>
                                  {problem.submittedAt && (
                                    <span className="grade-submission-time">
                                      <FaClock /> {new Date(problem.submittedAt).toLocaleString('ko-KR')}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="grade-total-cell">
                        <strong>{totalScore} / {totalPoints}</strong>
                      </td>
                      <td className="grade-ratio-cell">
                        <strong>{ratio}%</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : selectedQuiz && viewMode === 'quiz' ? (
          <div className="grade-table-container">
            <div className="grade-no-data">
              <p>등록된 성적이 없습니다.</p>
            </div>
          </div>
        ) : selectedAssignment && grades.length > 0 ? (
          <div className="grade-table-container">
            <table className="grade-table">
              <thead>
                <tr>
                  <th>학생</th>
                  <th>학번</th>
                  {grades[0]?.problemGrades?.map(problem => (
                    <th key={problem.problemId} className="grade-problem-header">
                      <div className="grade-problem-title">{problem.problemTitle}</div>
                      <div className="grade-problem-points">({problem.points}점)</div>
                    </th>
                  ))}
                  <th>총점</th>
                  <th>비율</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((student) => {
                  const totalScore = student.totalScore || 0;
                  const totalPoints = student.totalPoints || 0;
                  const ratio = totalPoints > 0 ? ((totalScore / totalPoints) * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={student.userId}>
                      <td className="grade-student-name">{student.studentName}</td>
                      <td className="grade-student-id">{student.studentId}</td>
                      {student.problemGrades?.map((problem) => {
                        const key = `${student.userId}-${problem.problemId}`;
                        const isEditing = editingGrade?.userId === student.userId && 
                                         editingGrade?.problemId === problem.problemId;
                        const currentScore = gradeInputs[key] !== undefined 
                          ? gradeInputs[key] 
                          : (problem.score !== null && problem.score !== undefined ? problem.score : '');
                        const currentComment = comments[key] || '';
                        
                        return (
                          <td key={problem.problemId} className="grade-problem-cell">
                            {isEditing ? (
                              <div className="grade-edit-form">
                                <input
                                  type="number"
                                  min="0"
                                  max={problem.points}
                                  value={currentScore}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? '' : parseInt(e.target.value);
                                    setGradeInputs(prev => ({
                                      ...prev,
                                      [key]: value
                                    }));
                                  }}
                                  className="grade-score-input"
                                  placeholder="점수"
                                />
                                <div className="grade-edit-actions">
                                  <button
                                    className="grade-btn-save"
                                    onClick={() => handleSaveGrade(
                                      student.userId,
                                      problem.problemId,
                                      currentScore,
                                      currentComment
                                    )}
                                  >
                                    저장
                                  </button>
                                  <button
                                    className="grade-btn-cancel"
                                    onClick={() => {
                                      setEditingGrade(null);
                                      // 입력값 초기화
                                      setGradeInputs(prev => {
                                        const newInputs = { ...prev };
                                        delete newInputs[key];
                                        return newInputs;
                                      });
                                    }}
                                  >
                                    취소
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="grade-score-display">
                                <div className="grade-score-value">
                                  {problem.score !== null && problem.score !== undefined 
                                    ? `${problem.score} / ${problem.points}` 
                                    : '-'}
                                </div>
                                <div className="grade-score-actions">
                                  <button
                                    className="grade-btn-edit"
                                    onClick={() => {
                                      setEditingGrade({ userId: student.userId, problemId: problem.problemId });
                                      setGradeInputs(prev => ({
                                        ...prev,
                                        [key]: problem.score !== null && problem.score !== undefined 
                                          ? problem.score 
                                          : ''
                                      }));
                                    }}
                                    title="점수 입력/수정"
                                  >
                                    <FaEdit />
                                  </button>
                                  {problem.submitted && (
                                    <button
                                      className="grade-btn-code"
                                      onClick={() => handleViewCode(student.userId, problem.problemId)}
                                      title="코드 조회"
                                    >
                                      <FaCode />
                                    </button>
                                  )}
                                </div>
                                {problem.submitted && (
                                  <div className="grade-submission-info">
                                    <span className={`grade-submission-status ${problem.isOnTime ? 'on-time' : 'late'}`}>
                                      {problem.isOnTime ? (
                                        <>
                                          <FaCheckCircle /> 제시간
                                        </>
                                      ) : (
                                        <>
                                          <FaTimesCircle /> 지연
                                        </>
                                      )}
                                    </span>
                                    {problem.submittedAt && (
                                      <span className="grade-submission-time">
                                        <FaClock /> {new Date(problem.submittedAt).toLocaleString('ko-KR')}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="grade-total-cell">
                        <strong>{totalScore} / {totalPoints}</strong>
                      </td>
                      <td className="grade-ratio-cell">
                        <strong>{ratio}%</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : selectedAssignment ? (
          <div className="grade-no-data">
            <p>등록된 성적이 없습니다.</p>
          </div>
        ) : (
          <div className="grade-no-data">
            <p>과제를 선택하여 성적을 확인하세요.</p>
          </div>
        )}

        {/* 코드 조회 모달 */}
        {showCodeModal && selectedCode && (
          <div className="grade-modal-overlay" onClick={() => setShowCodeModal(false)}>
            <div className="grade-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="grade-modal-header">
                <h2>제출 코드</h2>
                <button
                  className="grade-modal-close"
                  onClick={() => setShowCodeModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="grade-modal-body">
                <pre className="grade-code-display">
                  <code>{selectedCode.code || selectedCode.codeString || '코드를 불러올 수 없습니다.'}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 일괄 입력 모달 */}
        {showBulkModal && selectedAssignment && grades.length > 0 && (
          <div className="grade-modal-overlay" onClick={() => {
            setShowBulkModal(false);
            setBulkInputs({});
          }}>
            <div className="grade-modal-content grade-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="grade-modal-header">
                <h2>일괄 점수 입력</h2>
                <button
                  className="grade-modal-close"
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkInputs({});
                  }}
                >
                  ×
                </button>
              </div>
              <div className="grade-modal-body">
                <div className="grade-bulk-info">
                  <p>문제별로 모든 학생에게 동일한 점수를 일괄 입력할 수 있습니다.</p>
                </div>
                <div className="grade-bulk-inputs">
                  {grades[0]?.problemGrades?.map(problem => (
                    <div key={problem.problemId} className="grade-bulk-input-row">
                      <label className="grade-bulk-label">
                        {problem.problemTitle} (배점: {problem.points}점)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={problem.points}
                        value={bulkInputs[problem.problemId] || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? '' : parseInt(e.target.value);
                          setBulkInputs(prev => ({
                            ...prev,
                            [problem.problemId]: value
                          }));
                        }}
                        className="grade-bulk-input"
                        placeholder="점수 입력"
                      />
                    </div>
                  ))}
                </div>
                <div className="grade-modal-actions">
                  <button
                    className="grade-btn-cancel"
                    onClick={() => {
                      setShowBulkModal(false);
                      setBulkInputs({});
                    }}
                  >
                    취소
                  </button>
                  <button
                    className="grade-btn-submit"
                    onClick={handleBulkSave}
                    disabled={bulkSaving || Object.keys(bulkInputs).length === 0}
                  >
                    {bulkSaving ? '저장 중...' : '일괄 저장'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 통계 모달 */}
        {showStatsModal && stats && (
          <div className="grade-modal-overlay" onClick={() => setShowStatsModal(false)}>
            <div className="grade-modal-content grade-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="grade-modal-header">
                <h2>성적 통계</h2>
                <button
                  className="grade-modal-close"
                  onClick={() => setShowStatsModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="grade-modal-body">
                {/* 전체 통계 */}
                <div className="grade-stats-section">
                  <h3 className="grade-stats-title">전체 통계</h3>
                  <div className="grade-stats-grid">
                    <div className="grade-stat-card">
                      <div className="grade-stat-label">평균 점수</div>
                      <div className="grade-stat-value">{stats.overall.avg} / {stats.overall.totalPoints}</div>
                    </div>
                    <div className="grade-stat-card">
                      <div className="grade-stat-label">최고 점수</div>
                      <div className="grade-stat-value">{stats.overall.max} / {stats.overall.totalPoints}</div>
                    </div>
                    <div className="grade-stat-card">
                      <div className="grade-stat-label">최저 점수</div>
                      <div className="grade-stat-value">{stats.overall.min} / {stats.overall.totalPoints}</div>
                    </div>
                    <div className="grade-stat-card">
                      <div className="grade-stat-label">학생 수</div>
                      <div className="grade-stat-value">{stats.overall.totalStudents}명</div>
                    </div>
                  </div>
                </div>

                {/* 문제별 통계 */}
                <div className="grade-stats-section">
                  <h3 className="grade-stats-title">문제별 통계</h3>
                  <div className="grade-problem-stats-table">
                    <table className="grade-stats-table">
                      <thead>
                        <tr>
                          <th>문제</th>
                          <th>배점</th>
                          <th>평균</th>
                          <th>최고</th>
                          <th>최저</th>
                          <th>제출률</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.problemStats.map(stat => {
                          const submissionRate = stat.totalCount > 0 
                            ? ((stat.submittedCount / stat.totalCount) * 100).toFixed(1)
                            : 0;
                          return (
                            <tr key={stat.problemId}>
                              <td className="grade-stat-problem-title">{stat.problemTitle}</td>
                              <td>{stat.points}점</td>
                              <td>{stat.avg.toFixed(1)}</td>
                              <td>{stat.max}</td>
                              <td>{stat.min}</td>
                              <td>
                                <div className="grade-submission-rate">
                                  <span>{submissionRate}%</span>
                                  <div className="grade-progress-bar">
                                    <div 
                                      className="grade-progress-fill"
                                      style={{ width: `${submissionRate}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 배점 설정 모달 */}
        {showPointsModal && (selectedAssignment || (viewMode === 'course' && assignments.length > 0)) && (
          <div className="grade-modal-overlay" onClick={() => {
            setShowPointsModal(false);
            setPointsInputs({});
            setAssignmentProblems([]);
            setAllAssignmentProblems([]);
          }}>
            <div className="grade-modal-content grade-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="grade-modal-header">
                <h2>{viewMode === 'course' ? '수업 전체 배점 설정' : '배점 설정'}</h2>
                <button
                  className="grade-modal-close"
                  onClick={() => {
                    setShowPointsModal(false);
                    setPointsInputs({});
                    setAssignmentProblems([]);
                    setAllAssignmentProblems([]);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="grade-modal-body">
                <div className="grade-bulk-info">
                  <p>{viewMode === 'course' 
                    ? '수업의 모든 과제 문제별 배점을 설정할 수 있습니다. 배점을 변경하면 성적 계산에 반영됩니다.' 
                    : '과제의 각 문제별 배점을 설정할 수 있습니다. 배점을 변경하면 성적 계산에 반영됩니다.'}</p>
                </div>
                {loadingProblems ? (
                  <div className="grade-loading-container">
                    <div className="grade-loading-spinner"></div>
                    <p>문제 목록을 불러오는 중...</p>
                  </div>
                ) : viewMode === 'course' && allAssignmentProblems.length > 0 ? (
                  <>
                    {/* 수업 전체 보기: 과제별로 그룹화 */}
                    {allAssignmentProblems.map(({ assignmentId, assignmentTitle, problems }) => {
                      if (problems.length === 0) return null;
                      
                      const assignmentTotal = problems.reduce((sum, problem) => {
                        const problemId = problem.id || problem.problemId;
                        const key = `${assignmentId}-${problemId}`;
                        const defaultPoints = (problem.points && problem.points > 0) ? problem.points : 1;
                        const currentPoints = pointsInputs[key] !== undefined 
                          ? (pointsInputs[key] || 0)
                          : defaultPoints;
                        return sum + (currentPoints || 0);
                      }, 0);
                      
                      return (
                        <div key={assignmentId} className="grade-assignment-group">
                          <div className="grade-assignment-group-header">
                            <h3 className="grade-assignment-group-title">{assignmentTitle}</h3>
                            <div className="grade-assignment-group-total">총점: {assignmentTotal}점</div>
                          </div>
                          <div className="grade-bulk-inputs">
                            {problems.map(problem => {
                              const problemId = problem.id || problem.problemId;
                              const problemTitle = problem.title || problem.problemTitle || '제목 없음';
                              const defaultPoints = (problem.points && problem.points > 0) ? problem.points : 1;
                              const key = `${assignmentId}-${problemId}`;
                              const currentPoints = pointsInputs[key] !== undefined 
                                ? (pointsInputs[key] || 0)
                                : defaultPoints;
                              
                              return (
                                <div key={key} className="grade-bulk-input-row">
                                  <label className="grade-bulk-label">
                                    {problemTitle}
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={currentPoints}
                                    onChange={(e) => {
                                      const value = e.target.value === '' ? '' : parseInt(e.target.value);
                                      setPointsInputs(prev => ({
                                        ...prev,
                                        [key]: value
                                      }));
                                    }}
                                    className="grade-bulk-input"
                                    placeholder="배점 입력"
                                  />
                                  <span className="grade-points-unit">점</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : assignmentProblems.length > 0 ? (
                  <>
                    {/* 과제별 보기: 단일 과제의 문제 */}
                    <div className="grade-bulk-inputs">
                      {assignmentProblems.map(problem => {
                        const problemId = problem.id || problem.problemId;
                        const problemTitle = problem.title || problem.problemTitle || '제목 없음';
                        const defaultPoints = (problem.points && problem.points > 0) ? problem.points : 1;
                        const currentPoints = pointsInputs[problemId] !== undefined 
                          ? (pointsInputs[problemId] || 0)
                          : defaultPoints;
                        
                        return (
                          <div key={problemId} className="grade-bulk-input-row">
                            <label className="grade-bulk-label">
                              {problemTitle}
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={currentPoints}
                              onChange={(e) => {
                                const value = e.target.value === '' ? '' : parseInt(e.target.value);
                                setPointsInputs(prev => ({
                                  ...prev,
                                  [problemId]: value
                                }));
                              }}
                              className="grade-bulk-input"
                              placeholder="배점 입력"
                            />
                            <span className="grade-points-unit">점</span>
                          </div>
                        );
                      })}
                    </div>
                    {/* 과제 총점 표시 */}
                    <div className="grade-total-points-summary">
                      <div className="grade-total-points-label">과제 총점:</div>
                      <div className="grade-total-points-value">
                        {assignmentProblems.reduce((sum, problem) => {
                          const problemId = problem.id || problem.problemId;
                          const defaultPoints = (problem.points && problem.points > 0) ? problem.points : 1;
                          const currentPoints = pointsInputs[problemId] !== undefined 
                            ? (pointsInputs[problemId] || 0)
                            : defaultPoints;
                          return sum + (currentPoints || 0);
                        }, 0)}점
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grade-no-data">
                    <p>과제에 등록된 문제가 없습니다.</p>
                  </div>
                )}
                <div className="grade-modal-actions">
                  <button
                    className="grade-btn-cancel"
                    onClick={() => {
                      setShowPointsModal(false);
                      setPointsInputs({});
                      setAssignmentProblems([]);
                      setAllAssignmentProblems([]);
                    }}
                  >
                    취소
                  </button>
                  <button
                    className="grade-btn-submit"
                    onClick={handleSavePoints}
                    disabled={pointsSaving || (viewMode === 'course' ? allAssignmentProblems.length === 0 : assignmentProblems.length === 0)}
                  >
                    {pointsSaving ? '저장 중...' : '배점 저장'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TutorLayout>
  );
};

export default GradeManagement;
