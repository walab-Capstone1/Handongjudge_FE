#!/bin/bash
# TutorPage 완성 스크립트 - git에서 기존 JS 복구 후 TypeScript로 변환

cd /Users/ubyeonghui/Desktop/2026-1/Handongjudge_FE

echo "🚀 TutorPage 완성 작업 시작..."
echo ""

# 간단한 페이지들 (빠르게 처리 가능)
SIMPLE_PAGES=(
  "NoticeEditPage"
  "ProblemView"  
  "CourseNotificationManagement"
)

# 복잡한 페이지들 (기본 구조 유지, JS 로직만 복사)
COMPLEX_PAGES=(
  "UserManagement"
  "CourseManagement"
  "AssignmentManagement"
  "AssignmentStudentProgress"
  "GradeManagement"
  "ProblemManagement"
  "ProblemSetManagement"
  "ProblemSetEdit"
  "ProblemCreate"
  "ProblemEdit"
  "TutorDashboard"
  "CodingTestManagement"
  "CodingTestDetail"
)

for page in "${SIMPLE_PAGES[@]}" "${COMPLEX_PAGES[@]}"; do
  echo "======================================"
  echo "🔄 $page 처리 중..."
  echo "======================================"
  
  TARGET_DIR="src/pages/TutorPage/${page}"
  
  # git에서 기존 JS 파일 복구
  if git show HEAD:src/pages/TutorPage/${page}.js > /tmp/${page}_backup.js 2>/dev/null; then
    echo "✅ git에서 기존 ${page}.js 복구 완료"
    
    # index.tsx 업데이트 - 기본 구조 + TODO 주석 추가
    cat > "${TARGET_DIR}/index.tsx" << EOF
import React, { useState, useEffect } from 'react';
import TutorLayout from '../../../layouts/TutorLayout';
import * as S from './styles';

// TODO: 아래 기존 JS 코드를 TypeScript로 변환하세요
/*
기존 JS 파일 위치: /tmp/${page}_backup.js
주요 작업:
1. 타입 정의 추가 (types.ts)
2. 스타일을 styled-components로 변환 (styles.ts)  
3. 이벤트 핸들러 타입 지정
4. API 호출 타입 정의
*/

const ${page}: React.FC = () => {
  return (
    <TutorLayout>
      <S.Container>
        <h1>${page}</h1>
        <p>⚠️ 이 페이지는 아직 TypeScript로 변환되지 않았습니다.</p>
        <p>기존 JS 파일: /tmp/${page}_backup.js</p>
      </S.Container>
    </TutorLayout>
  );
};

export default ${page};
EOF
    
    echo "✅ ${page}/index.tsx 업데이트 완료"
  else
    echo "⚠️  ${page}.js를 git에서 찾을 수 없습니다"
  fi
  
  echo ""
done

echo "======================================"
echo "✅ TutorPage 처리 완료!"
echo "======================================"
echo ""
echo "📋 완전히 완성된 페이지:"
echo "   - NoticeManagementPage ✅"
echo "   - SettingsPage ✅"
echo "   - NoticeCreatePage ✅"
echo ""
echo "⚠️  나머지 18개 페이지:"
echo "   - 기본 구조 생성됨"
echo "   - /tmp/*_backup.js에서 기존 로직 참고"
echo "   - 수동으로 TypeScript 변환 필요"
echo ""
