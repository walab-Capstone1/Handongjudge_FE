import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import APIService from "../../../services/APIService";
import EmptyState from "../../../components/EmptyState";
import LoadingSpinner from "../../../components/LoadingSpinner";
import * as S from "./styles";
import type { ProblemSet, Problem, CreateProblemSetData } from "./types";

const ProblemSetManagement: React.FC = () => {
  const navigate = useNavigate();
  const [problemSets, setProblemSets] = useState<ProblemSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showProblemSelectModal, setShowProblemSelectModal] = useState(false);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [problemSearchTerm, setProblemSearchTerm] = useState('');
  const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const PROBLEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchProblemSets();
    if (showProblemSelectModal) {
      fetchAllProblems();
    }
  }, [showProblemSelectModal]);

  const fetchProblemSets = async () => {
    try {
      setLoading(true);
      const response = await APIService.getProblemSets();
      setProblemSets(Array.isArray(response) ? response : (response?.data || []));
    } catch (error) {
      console.error('문제집 목록 조회 실패:', error);
      setProblemSets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProblems = async () => {
    try {
      const response = await APIService.getAllProblems();
      let problemsData: Problem[] = [];
      if (Array.isArray(response)) {
        problemsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        problemsData = response.data;
      } else if (response?.data && !Array.isArray(response.data)) {
        problemsData = [response.data];
      } else if (response && typeof response === 'object') {
        problemsData = Object.values(response);
      }
      setAllProblems(problemsData);
    } catch (error) {
      console.error('문제 목록 조회 실패:', error);
      setAllProblems([]);
    }
  };

  const handleNextToProblemSelect = () => {
    if (!newSetTitle.trim()) {
      alert('문제집 제목을 입력해주세요.');
      return;
    }
    setShowCreateModal(false);
    setCurrentStep(2);
    setShowProblemSelectModal(true);
    fetchAllProblems();
  };

  const handleSkipProblemSelect = async () => {
    await handleCreateSetWithProblems([]);
  };

  const handleCreateSetWithProblems = async (problemIds: number[] | null = null) => {
    const finalProblemIds = problemIds !== null ? problemIds : selectedProblemIds;

    try {
      setIsCreating(true);
      
      const createData: CreateProblemSetData = {
        title: newSetTitle.trim(),
        description: newSetDescription.trim() || null,
        tags: '[]'
      };
      
      const response = await APIService.createProblemSet(createData);
      const problemSetId = response?.data?.id || response?.id || response;
      
      if (finalProblemIds && finalProblemIds.length > 0) {
        for (let i = 0; i < finalProblemIds.length; i++) {
          try {
            await APIService.addProblemToSet(problemSetId, finalProblemIds[i], i);
          } catch (error) {
            console.error(`문제 ${finalProblemIds[i]} 추가 실패:`, error);
          }
        }
      }
      
      setShowCreateModal(false);
      setShowProblemSelectModal(false);
      setCurrentStep(1);
      setNewSetTitle('');
      setNewSetDescription('');
      setSelectedProblemIds([]);
      setProblemSearchTerm('');
      setCurrentPage(1);
      fetchProblemSets();
    } catch (error) {
      console.error("문제집 생성 실패:", error);
      const msg =
        error instanceof Error ? error.message : "알 수 없는 오류";
      alert(`문제집 생성에 실패했습니다: ${msg}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleProblemToggle = (problemId: number) => {
    setSelectedProblemIds((prev) => {
      if (prev.includes(problemId)) {
        return prev.filter((id) => id !== problemId);
      }
      return [...prev, problemId];
    });
  };

  const handleSelectAllProblems = () => {
    const filtered = getFilteredProblems();
    const allSelected = filtered.length > 0 && 
      filtered.every(p => selectedProblemIds.includes(p.id));
    
    if (allSelected) {
      const filteredIds = filtered.map(p => p.id);
      setSelectedProblemIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedProblemIds(prev => {
        const newIds = filtered.map(p => p.id);
        const combined = [...new Set([...prev, ...newIds])];
        return combined;
      });
    }
  };

  const getFilteredProblems = (): Problem[] => {
    let filtered = allProblems;
    if (problemSearchTerm) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(problemSearchTerm.toLowerCase()) ||
        p.id?.toString().includes(problemSearchTerm)
      );
    }
    return filtered;
  };

  const getPaginatedProblems = (): Problem[] => {
    const filtered = getFilteredProblems();
    const startIndex = (currentPage - 1) * PROBLEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + PROBLEMS_PER_PAGE);
  };

  const getTotalPages = (): number => {
    return Math.ceil(getFilteredProblems().length / PROBLEMS_PER_PAGE);
  };

  const getDifficultyLabel = (difficulty?: string): string => {
    const labels: Record<string, string> = {
      '1': '쉬움',
      '2': '보통',
      '3': '어려움'
    };
    return labels[difficulty || ''] || (difficulty || '');
  };

  const getDifficultyColor = (difficulty?: string): string => {
    const colors: Record<string, string> = {
      '1': '#10b981',
      '2': '#f59e0b',
      '3': '#ef4444'
    };
    return colors[difficulty || ''] || '#6b7280';
  };

  const handleDeleteSet = async (problemSet: ProblemSet) => {
    if (!window.confirm(`정말로 "${problemSet.title}" 문제집을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      await APIService.deleteProblemSet(problemSet.id);
      fetchProblemSets();
    } catch (error) {
      console.error("문제집 삭제 실패:", error);
      const msg =
        error instanceof Error ? error.message : "알 수 없는 오류";
      alert(`문제집 삭제에 실패했습니다: ${msg}`);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const filteredSets = problemSets.filter(set => 
    set.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <TutorLayout>
        <LoadingSpinner message="문제집 목록을 불러오는 중..." />
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <S.Container>
        <S.TitleHeader>
          <S.TitleLeft>
            <S.Title>문제집 관리</S.Title>
            <S.TitleStats>
              <S.StatBadge>총 {problemSets.length}개 문제집</S.StatBadge>
            </S.TitleStats>
          </S.TitleLeft>
          <S.CreateButton 
            onClick={() => {
              setCurrentStep(1);
              setShowCreateModal(true);
              setShowProblemSelectModal(false);
            }}
          >
            + 새 문제집 만들기
          </S.CreateButton>
        </S.TitleHeader>

        <S.FiltersSection>
          <S.SearchBox>
            <S.SearchInput
              type="text"
              placeholder="문제집명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </S.SearchBox>
        </S.FiltersSection>

        <S.TableContainer>
          {filteredSets.length > 0 ? (
            <S.Table>
              <thead>
                <tr>
                  <S.Th>문제집 제목</S.Th>
                  <S.Th $alignRight>문제 수</S.Th>
                  <S.Th $alignRight>생성일</S.Th>
                  <S.Th $alignRight>관리</S.Th>
                </tr>
              </thead>
              <tbody>
                {filteredSets.map((set) => (
                  <tr key={set.id}>
                    <S.Td>
                      <S.TitleWrapper
                        onClick={() => navigate(`/tutor/problems/sets/${set.id}/edit`)}
                      >
                        <S.TitleContent>
                          <S.TitleText>{set.title}</S.TitleText>
                          {set.description && (
                            <S.Description>{set.description}</S.Description>
                          )}
                        </S.TitleContent>
                      </S.TitleWrapper>
                    </S.Td>
                    <S.Td $alignRight>{set.problemCount || 0}개</S.Td>
                    <S.Td $alignRight>{formatDate(set.createdAt)}</S.Td>
                    <S.Td $alignRight>
                      <S.ActionsCell>
                        <S.ActionButton
                          type="button"
                          className="delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSet(set);
                          }}
                        >
                          삭제
                        </S.ActionButton>
                      </S.ActionsCell>
                    </S.Td>
                  </tr>
                ))}
              </tbody>
            </S.Table>
          ) : (
            <EmptyState
              title="등록된 문제집이 없습니다"
              message="새로운 문제집을 만들어보세요"
              actionLabel="새 문제집 만들기"
              onAction={() => setShowCreateModal(true)}
            />
          )}
        </S.TableContainer>

        {showCreateModal && currentStep === 1 && (
          <S.ModalOverlay
            onClick={() => {
              if (!isCreating) {
                setShowCreateModal(false);
                setNewSetTitle("");
                setNewSetDescription("");
              }
            }}
          >
            <S.ModalContent onClick={(e) => e.stopPropagation()}>
              <S.ModalHeader>
                <h2>새 문제집 만들기</h2>
                <S.ModalClose
                  type="button"
                  onClick={() => {
                    if (!isCreating) {
                      setShowCreateModal(false);
                      setNewSetTitle("");
                      setNewSetDescription("");
                    }
                  }}
                  disabled={isCreating}
                >
                  ×
                </S.ModalClose>
              </S.ModalHeader>
              <S.ModalBody>
                <S.FormGroup>
                  <S.Label htmlFor="set-title">문제집 제목 *</S.Label>
                  <S.Input
                    id="set-title"
                    type="text"
                    value={newSetTitle}
                    onChange={(e) => setNewSetTitle(e.target.value)}
                    placeholder="문제집 제목을 입력하세요"
                    disabled={isCreating}
                  />
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label htmlFor="set-description">설명 (선택)</S.Label>
                  <S.Textarea
                    id="set-description"
                    value={newSetDescription}
                    onChange={(e) => setNewSetDescription(e.target.value)}
                    placeholder="문제집에 대한 설명을 입력하세요"
                    rows={4}
                    disabled={isCreating}
                  />
                </S.FormGroup>
              </S.ModalBody>
              <S.ModalFooter>
                <S.CancelButton
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSetTitle("");
                    setNewSetDescription("");
                  }}
                  disabled={isCreating}
                >
                  취소
                </S.CancelButton>
                <S.SubmitButton
                  type="button"
                  onClick={handleNextToProblemSelect}
                  disabled={isCreating || !newSetTitle.trim()}
                >
                  다음
                </S.SubmitButton>
              </S.ModalFooter>
            </S.ModalContent>
          </S.ModalOverlay>
        )}

        {showProblemSelectModal && currentStep === 2 && (
          <S.ModalOverlay
            onClick={() => {
              if (!isCreating) {
                setShowProblemSelectModal(false);
                setCurrentStep(1);
                setSelectedProblemIds([]);
                setProblemSearchTerm("");
                setCurrentPage(1);
              }
            }}
          >
            <S.ModalContent $wide onClick={(e) => e.stopPropagation()}>
              <S.ModalHeader>
                <h2>문제 선택 - {newSetTitle}</h2>
                <S.ModalClose
                  type="button"
                  onClick={() => {
                    if (!isCreating) {
                      setShowProblemSelectModal(false);
                      setCurrentStep(1);
                      setSelectedProblemIds([]);
                      setProblemSearchTerm("");
                      setCurrentPage(1);
                    }
                  }}
                  disabled={isCreating}
                >
                  ×
                </S.ModalClose>
              </S.ModalHeader>

              <S.ModalBody>
                <S.ProblemFilterSection>
                  <S.ProblemSearchInput
                    type="text"
                    placeholder="문제명 또는 ID로 검색..."
                    value={problemSearchTerm}
                    onChange={(e) => {
                      setProblemSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </S.ProblemFilterSection>

                {getFilteredProblems().length > 0 ? (
                  <>
                    <S.ProblemModalActions>
                      <S.SelectAllButton
                        type="button"
                        onClick={handleSelectAllProblems}
                      >
                        {getFilteredProblems().length > 0 &&
                        getFilteredProblems().every((p) =>
                          selectedProblemIds.includes(p.id),
                        )
                          ? "전체 해제"
                          : "전체 선택"}
                      </S.SelectAllButton>
                      <S.SelectedCount>
                        {selectedProblemIds.length}개 선택됨
                      </S.SelectedCount>
                      <S.FilterCount>
                        총 {getFilteredProblems().length}개 문제
                      </S.FilterCount>
                    </S.ProblemModalActions>

                    <S.ProblemList>
                      {getPaginatedProblems().map((problem) => {
                        const isSelected =
                          selectedProblemIds.includes(problem.id);
                        const diffColor = getDifficultyColor(problem.difficulty);
                        return (
                          <S.ProblemItem
                            key={problem.id}
                            $selected={isSelected}
                            onClick={() => handleProblemToggle(problem.id)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleProblemToggle(problem.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <S.ProblemItemInfo>
                              <S.ProblemItemTitleRow>
                                <S.ProblemIdBadge>#{problem.id}</S.ProblemIdBadge>
                                <S.ProblemItemTitle>{problem.title}</S.ProblemItemTitle>
                              </S.ProblemItemTitleRow>
                              <S.ProblemItemMeta>
                                <S.DifficultyBadge
                                  $bg={`${diffColor}20`}
                                  $color={diffColor}
                                >
                                  {getDifficultyLabel(problem.difficulty)}
                                </S.DifficultyBadge>
                              </S.ProblemItemMeta>
                            </S.ProblemItemInfo>
                          </S.ProblemItem>
                        );
                      })}
                    </S.ProblemList>

                    {getTotalPages() > 1 && (
                      <S.PaginationRow>
                        <S.PaginationBtn
                          type="button"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          이전
                        </S.PaginationBtn>
                        <S.PaginationInfo>
                          {currentPage} / {getTotalPages()}
                        </S.PaginationInfo>
                        <S.PaginationBtn
                          type="button"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(getTotalPages(), prev + 1),
                            )
                          }
                          disabled={currentPage === getTotalPages()}
                        >
                          다음
                        </S.PaginationBtn>
                      </S.PaginationRow>
                    )}
                  </>
                ) : (
                  <S.ProblemListEmpty>
                    {problemSearchTerm
                      ? "검색 결과가 없습니다."
                      : "사용 가능한 문제가 없습니다."}
                  </S.ProblemListEmpty>
                )}
              </S.ModalBody>

              <S.ModalFooter>
                <S.CancelButton
                  type="button"
                  onClick={() => {
                    setShowProblemSelectModal(false);
                    setCurrentStep(1);
                    setShowCreateModal(true);
                  }}
                  disabled={isCreating}
                >
                  이전
                </S.CancelButton>
                <S.CancelButton
                  type="button"
                  onClick={handleSkipProblemSelect}
                  disabled={isCreating}
                >
                  건너뛰기
                </S.CancelButton>
                <S.CancelButton
                  type="button"
                  onClick={() => {
                    setShowProblemSelectModal(false);
                    setCurrentStep(1);
                    setSelectedProblemIds([]);
                    setProblemSearchTerm("");
                    setCurrentPage(1);
                  }}
                  disabled={isCreating}
                >
                  취소
                </S.CancelButton>
                <S.SubmitButton
                  type="button"
                  onClick={() => handleCreateSetWithProblems()}
                  disabled={isCreating}
                >
                  {isCreating
                    ? "생성 중..."
                    : `생성${selectedProblemIds.length > 0 ? ` (${selectedProblemIds.length}개 문제)` : ""}`}
                </S.SubmitButton>
              </S.ModalFooter>
            </S.ModalContent>
          </S.ModalOverlay>
        )}
      </S.Container>
    </TutorLayout>
  );
};

export default ProblemSetManagement;
