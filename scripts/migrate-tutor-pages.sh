#!/bin/bash
# TutorPage 일괄 마이그레이션 스크립트

echo "🚀 TutorPage 일괄 마이그레이션 시작..."
echo ""

cd /Users/ubyeonghui/Desktop/2026-1/Handongjudge_FE

# TutorPage 파일 목록
TUTOR_PAGES=(
  "TutorDashboard"
  "CourseManagement"
  "AssignmentManagement"
  "AssignmentStudentProgress"
  "UserManagement"
  "GradeManagement"
  "NoticeCreatePage"
  "NoticeEditPage"
  "CourseNotificationManagement"
  "ProblemManagement"
  "ProblemSetManagement"
  "ProblemSetEdit"
  "ProblemCreate"
  "ProblemEdit"
  "ProblemView"
  "SettingsPage"
  "CodingTestManagement"
  "CodingTestDetail"
  "ProblemCreateNew"
  "ProblemEditOld"
  "ProblemEditSimple"
)

for page in "${TUTOR_PAGES[@]}"; do
  echo "======================================"
  echo "🔄 $page 처리 중..."
  echo "======================================"
  
  SOURCE_JS="src/pages/TutorPage/${page}.js"
  SOURCE_CSS="src/pages/TutorPage/${page}.css"
  TARGET_DIR="src/pages/TutorPage/${page}"
  
  # 소스 파일이 존재하는지 확인
  if [ ! -f "$SOURCE_JS" ]; then
    echo "⚠️  ${page}.js 파일이 없습니다. 건너뜁니다."
    continue
  fi
  
  # 폴더 생성
  mkdir -p "${TARGET_DIR}/utils"
  mkdir -p "${TARGET_DIR}/components"
  
  # types.ts 생성
  cat > "${TARGET_DIR}/types.ts" << 'EOF'
// TODO: 실제 타입 정의 추가
export interface PageProps {}
EOF
  
  # styles.ts 생성
  if [ -f "$SOURCE_CSS" ]; then
    echo "import styled from 'styled-components';" > "${TARGET_DIR}/styles.ts"
    echo "" >> "${TARGET_DIR}/styles.ts"
    echo "// TODO: CSS를 styled-components로 변환" >> "${TARGET_DIR}/styles.ts"
    echo "" >> "${TARGET_DIR}/styles.ts"
    echo "export const Container = styled.div\`" >> "${TARGET_DIR}/styles.ts"
    echo "  // 스타일 추가" >> "${TARGET_DIR}/styles.ts"
    echo "\`;" >> "${TARGET_DIR}/styles.ts"
    echo "" >> "${TARGET_DIR}/styles.ts"
    echo "/* 기존 CSS:" >> "${TARGET_DIR}/styles.ts"
    cat "$SOURCE_CSS" >> "${TARGET_DIR}/styles.ts"
    echo "*/" >> "${TARGET_DIR}/styles.ts"
  else
    echo "import styled from 'styled-components';" > "${TARGET_DIR}/styles.ts"
    echo "" >> "${TARGET_DIR}/styles.ts"
    echo "export const Container = styled.div\`" >> "${TARGET_DIR}/styles.ts"
    echo "  // 스타일 추가" >> "${TARGET_DIR}/styles.ts"
    echo "\`;" >> "${TARGET_DIR}/styles.ts"
  fi
  
  # index.tsx 기본 템플릿 생성
  cat > "${TARGET_DIR}/index.tsx" << EOF
import React from 'react';
import * as S from './styles';
import { PageProps } from './types';

// TODO: 기존 ${page}.js의 로직을 TypeScript로 변환
const ${page}: React.FC<PageProps> = (props) => {
  return (
    <S.Container>
      <h1>${page}</h1>
      <p>TODO: 기존 로직 이전 필요</p>
    </S.Container>
  );
};

export default ${page};
EOF
  
  echo "✅ ${page} 기본 구조 생성 완료"
  echo ""
  
done

echo "======================================"
echo "✅ TutorPage 마이그레이션 완료!"
echo "======================================"
echo ""
echo "⚠️  다음 작업이 필요합니다:"
echo "   1. 각 페이지의 기존 JS 로직을 index.tsx로 이전"
echo "   2. types.ts에 실제 타입 정의 추가"
echo "   3. styles.ts의 CSS를 styled-components로 변환"
echo "   4. App.js에서 import 경로 업데이트"
echo "   5. 기존 .js, .css 파일 삭제 (검증 후)"
echo ""
