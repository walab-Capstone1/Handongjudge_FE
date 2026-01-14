import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseSidebar from '../components/CourseSidebar';
import CourseHeader from '../components/CourseHeader';
import { useRecoilValue } from 'recoil';
import { authState } from '../recoil/atoms';
import APIService from '../services/APIService';
import './QuestionDetailPage.css';

const QuestionDetailPage = () => {
  const { sectionId, questionId } = useParams();
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [comments, setComments] = useState([]);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchQuestionDetail();
    fetchComments();
  }, [questionId]);

  const fetchQuestionDetail = async () => {
    try {
      setLoading(true);
      
      const data = await APIService.getQuestionDetail(questionId);
      setQuestion(data.data);

      // 섹션 정보 조회
      const sectionData = await APIService.getSectionInfo(sectionId);
      setSectionInfo(sectionData.data || sectionData);
    } catch (err) {
      console.error('Error fetching question:', err);
      alert('질문을 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await APIService.getComments(questionId);
      setComments(data.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleLikeQuestion = async () => {
    try {
      await APIService.likeQuestion(questionId);
      // 질문 정보 다시 가져오기
      fetchQuestionDetail();
    } catch (err) {
      console.error('Error liking question:', err);
      alert('추천 중 오류가 발생했습니다');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await APIService.likeComment(commentId);
      // 댓글 목록 다시 가져오기
      fetchComments();
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!commentContent.trim()) {
      alert('댓글 내용을 입력해주세요');
      return;
    }

    try {
      setSubmittingComment(true);
      await APIService.createComment(questionId, commentContent, commentAnonymous);
      setCommentContent('');
      setCommentAnonymous(false);
      fetchComments();
      fetchQuestionDetail(); // 댓글 수 업데이트
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('댓글 작성 중 오류가 발생했습니다');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAcceptComment = async (commentId) => {
    if (!window.confirm('이 댓글을 채택하시겠습니까?')) return;

    try {
      await APIService.acceptComment(commentId);
      alert('댓글이 채택되었습니다!');
      fetchComments();
      fetchQuestionDetail();
    } catch (err) {
      console.error('Error accepting comment:', err);
      alert('채택 중 오류가 발생했습니다');
    }
  };

  const handleUnacceptComment = async (commentId) => {
    if (!window.confirm('이 댓글의 채택을 해제하시겠습니까?')) return;

    try {
      await APIService.unacceptComment(commentId);
      alert('채택이 해제되었습니다!');
      fetchComments();
      fetchQuestionDetail();
    } catch (err) {
      console.error('Error unaccepting comment:', err);
      alert('채택 해제 중 오류가 발생했습니다');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('정말 이 댓글을 삭제하시겠습니까?')) return;

    try {
      await APIService.deleteComment(commentId);
      alert('댓글이 삭제되었습니다');
      fetchComments();
      fetchQuestionDetail(); // 댓글 수 업데이트
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('댓글 삭제 중 오류가 발생했습니다');
    }
  };

  // 교수 여부 확인 (섹션 정보의 instructorId 또는 instructor.id 확인)
  const isInstructor = sectionInfo && auth?.user?.id && (
    auth.user.id === sectionInfo.instructorId || 
    auth.user.id === sectionInfo.instructor?.id ||
    auth.user.role === 'ADMIN' ||
    auth.user.role === 'SUPER_ADMIN'
  );
  
  // 채택/해제 권한 확인 (질문 작성자 또는 교수)
  const canManageAccept = question && (question.isAuthor || isInstructor);

  const handleResolveQuestion = async () => {
    try {
      await APIService.resolveQuestion(questionId);
      fetchQuestionDetail();
    } catch (err) {
      console.error('Error resolving question:', err);
      alert('상태 변경 중 오류가 발생했습니다');
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('정말 이 질문을 삭제하시겠습니까?')) return;

    try {
      await APIService.deleteQuestion(questionId);
      alert('질문이 삭제되었습니다');
      navigate(`/sections/${sectionId}/community`);
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('삭제 중 오류가 발생했습니다');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="question-detail-container">
        <CourseSidebar sectionId={sectionId} currentMenu="community" />
        <div className="question-detail-content">
          <CourseHeader 
            courseName={sectionInfo ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber}분반` : '로딩 중...'}
          />
          <div className="question-detail-body">
            <div className="loading">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="question-detail-container">
        <CourseSidebar sectionId={sectionId} currentMenu="community" />
        <div className="question-detail-content">
          <CourseHeader 
            courseName={sectionInfo ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber}분반` : '오류'}
          />
          <div className="question-detail-body">
            <div className="error">질문을 찾을 수 없습니다</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="question-detail-container">
      <CourseSidebar sectionId={sectionId} currentMenu="community" />
      <div className="question-detail-content">
        <CourseHeader 
          courseName={sectionInfo ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber}분반` : '질문 상세'}
        />
        <div className="question-detail-body">
          {/* 질문 카드 */}
          <div className="question-detail-card">
            {/* 헤더 */}
            <div className="question-detail-header">
              <div className="question-badges">
                {question.isPinned && (
                  <span className="badge badge-pinned">고정</span>
                )}
                <span className={`badge badge-status ${question.status.toLowerCase()}`}>
                  {question.status === 'RESOLVED' ? '해결됨' : '미해결'}
                </span>
                {question.isAnonymous && (
                  <span className="badge badge-anonymous">익명</span>
                )}
                {!question.isPublic && (
                  <span className="badge badge-private">비공개</span>
                )}
              </div>

              <div className="question-header-actions">
                {question.isAuthor && (
                  <>
                    <button 
                      className="btn-edit"
                      onClick={() => navigate(`/sections/${sectionId}/community/${questionId}/edit`)}
                    >
                      수정
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={handleDeleteQuestion}
                    >
                      삭제
                    </button>
                    <button 
                      className="btn-resolve"
                      onClick={handleResolveQuestion}
                    >
                      {question.status === 'RESOLVED' ? '미해결로 변경' : '해결됨으로 변경'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 제목 */}
            <h1 className="question-title">{question.title}</h1>

            {/* 메타 정보 */}
            <div className="question-meta">
              <span className="author">{question.authorDisplayName}</span>
              <span className="separator">·</span>
              <span className="date">{formatDate(question.createdAt)}</span>
              <span className="separator">·</span>
              <span className="views">조회 {question.viewCount}</span>
              
              {question.assignmentTitle && (
                <>
                  <span className="separator">·</span>
                  <span className="tag">{question.assignmentTitle}</span>
                </>
              )}
              {question.problemTitle && (
                <>
                  <span className="separator">·</span>
                  <span className="tag">{question.problemTitle}</span>
                </>
              )}
            </div>

            {/* 내용 */}
            <div className="question-content">
              <pre>{question.content}</pre>
            </div>

            {/* 액션 */}
            <div className="question-actions">
              <button 
                className={`action-btn ${question.isLikedByCurrentUser ? 'active' : ''}`}
                onClick={handleLikeQuestion}
              >
                <span className="text">추천</span>
                <span className="count">{question.likeCount}</span>
              </button>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="comments-section">
            <h2 className="comments-title">
              댓글 {comments.length}개
            </h2>

            {/* 댓글 작성 */}
            <form className="comment-form" onSubmit={handleSubmitComment}>
              <textarea
                className="comment-textarea"
                placeholder="댓글을 작성하세요..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows={4}
              />
              <div className="comment-form-footer">
                <label className="comment-option">
                  <input
                    type="checkbox"
                    checked={commentAnonymous}
                    onChange={(e) => setCommentAnonymous(e.target.checked)}
                  />
                  <span>익명으로 작성</span>
                </label>
                <button 
                  type="submit" 
                  className="btn-submit-comment"
                  disabled={submittingComment}
                >
                  {submittingComment ? '작성 중...' : '댓글 작성'}
                </button>
              </div>
            </form>

            {/* 댓글 목록 */}
            <div className="comments-list">
              {comments.length === 0 ? (
                <div className="empty-comments">
                  <p>아직 댓글이 없습니다</p>
                  <p>첫 번째 댓글을 작성해보세요!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <div 
                    key={comment.id} 
                    className={`comment-card ${comment.isAccepted ? 'accepted' : ''}`}
                  >
                    <div className="comment-header">
                      <div className="comment-author-info">
                        <span className="comment-author">
                          {comment.authorDisplayName}
                        </span>
                        {comment.isInstructorAnswer && (
                          <span className="badge-instructor">교수</span>
                        )}
                        {comment.isAccepted && (
                          <span className="badge-accepted">채택됨</span>
                        )}
                      </div>
                      <span className="comment-date">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    <div className="comment-content">
                      <pre>{comment.content}</pre>
                    </div>

                    <div className="comment-actions">
                      <button
                        className={`action-btn-small ${comment.isLikedByCurrentUser ? 'active' : ''}`}
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <span className="text">추천</span>
                        <span className="count">{comment.likeCount}</span>
                      </button>

                      {comment.isAuthor && (
                        <button
                          className="btn-delete-comment"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteComment(comment.id);
                          }}
                        >
                          삭제
                        </button>
                      )}

                      {canManageAccept && (
                        <>
                          {!comment.isAccepted ? (
                            <button
                              className="btn-accept"
                              onClick={() => handleAcceptComment(comment.id)}
                            >
                              채택하기
                            </button>
                          ) : (
                            <button
                              className="btn-unaccept"
                              onClick={() => handleUnacceptComment(comment.id)}
                            >
                              채택 해제
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 목록으로 버튼 */}
          <div className="back-to-list">
            <button 
              className="btn-back"
              onClick={() => navigate(`/sections/${sectionId}/community`)}
            >
              ← 목록으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;

