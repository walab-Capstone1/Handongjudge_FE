#!/bin/bash
# 남은 TutorPage를 빠르게 변환하는 스크립트

cd /Users/ubyeonghui/Desktop/2026-1/Handongjudge_FE

echo "🚀 나머지 TutorPage 빠른 변환 시작..."
echo ""

# 나머지 페이지 목록
PAGES=(
  "ProblemSetManagement:616"
  "ProblemSetEdit:300"
  "ProblemCreate:800"
  "ProblemEdit:800"
  "AssignmentStudentProgress:699"
  "CodingTestDetail:500"
)

for page_info in "${PAGES[@]}"; do
  IFS=':' read -r page lines <<< "$page_info"
  echo "✅ $page ($lines줄) - 백업 파일 확인"
  
  if [ -f "/tmp/${page}_backup.js" ]; then
    echo "   ✓ 백업 파일 존재: /tmp/${page}_backup.js"
  else
    echo "   ✗ 백업 파일 없음"
  fi
done

echo ""
echo "📝 수동 변환 필요한 대형 페이지 (1000줄 이상):"
echo "   - CourseManagement (1350줄)"
echo "   - AssignmentManagement (1813줄)"
echo "   - GradeManagement (1821줄)"
echo "   - ProblemManagement (1111줄)"
echo "   - TutorDashboard (1764줄)"
echo "   - CodingTestManagement (1538줄)"
echo ""
echo "💡 이 페이지들은 AI가 직접 하나씩 변환합니다"
