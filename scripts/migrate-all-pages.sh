#!/bin/bash
# 모든 페이지 자동 마이그레이션 스크립트

echo "🚀 전체 페이지 마이그레이션 시작..."
echo ""

# 마이그레이션할 페이지 목록
PAGES=(
  "EnrollPage"
  "MainPage"
  "QuestionPage"
  "SectionDetailPage"
  "NoticeDetailPage"
  "CourseNoticesPage"
  "CourseNoticeDetailPage"
  "CourseNotificationsPage"
  "CourseCommunityPage"
  "QuestionCreatePage"
  "QuestionDetailPage"
  "QuestionEditPage"
  "CodingQuizPage"
  "CodingQuizSolvePage"
  "CourseAssignmentsPage"
  "CourseDashboardPage"
)

# 각 페이지 마이그레이션
for page in "${PAGES[@]}"; do
  echo "======================================"
  echo "🔄 $page 처리 중..."
  echo "======================================"
  node scripts/migrate-page.js "$page"
  echo ""
  sleep 0.5
done

echo "✅ 모든 페이지 마이그레이션 완료!"
echo ""
echo "⚠️  다음 단계:"
echo "   1. 각 페이지의 index.tsx 타입 에러 수정"
echo "   2. styles.ts의 스타일 확인 및 수정"
echo "   3. App.js에서 import 경로 업데이트"
echo "   4. npm start로 빌드 확인"
echo "   5. 기존 .js, .css 파일 삭제"
