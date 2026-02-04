#!/usr/bin/env node
/**
 * 자동 페이지 마이그레이션 스크립트
 *
 * 사용법: node scripts/migrate-page.js <PageName>
 * 예시: node scripts/migrate-page.js EnrollPage
 */

const fs = require("fs");
const path = require("path");

const pageName = process.argv[2];

if (!pageName) {
	console.error("❌ 페이지 이름을 입력하세요.");
	console.log("사용법: node scripts/migrate-page.js <PageName>");
	process.exit(1);
}

const srcDir = path.join(__dirname, "..", "src", "pages");
const pageJsPath = path.join(srcDir, `${pageName}.js`);
const pageCssPath = path.join(srcDir, `${pageName}.css`);

// 1. 페이지 파일 확인
if (!fs.existsSync(pageJsPath)) {
	console.error(`❌ ${pageJsPath} 파일을 찾을 수 없습니다.`);
	process.exit(1);
}

console.log(`\n🚀 ${pageName} 마이그레이션 시작...\n`);

// 2. 폴더 생성
const pageFolderPath = path.join(srcDir, `${pageName}Page`);
if (!fs.existsSync(pageFolderPath)) {
	fs.mkdirSync(pageFolderPath, { recursive: true });
	console.log(`✅ 폴더 생성: ${pageFolderPath}`);
}

["components", "utils"].forEach((folder) => {
	const folderPath = path.join(pageFolderPath, folder);
	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, { recursive: true });
		console.log(`✅ 서브폴더 생성: ${folderPath}`);
	}
});

// 3. JS 파일 읽기
const jsContent = fs.readFileSync(pageJsPath, "utf-8");
const hasCss = fs.existsSync(pageCssPath);

// 4. styled-components 사용 여부 확인
const usesStyledComponents =
	jsContent.includes("styled-components") || jsContent.includes("styled.");

// 5. types.ts 생성
const typesContent = `// ${pageName} 타입 정의
export interface ${pageName}Props {
  // Props 정의
}

// 필요한 다른 타입들을 여기에 추가
`;

fs.writeFileSync(path.join(pageFolderPath, "types.ts"), typesContent);
console.log(`✅ types.ts 생성`);

// 6. styles.ts 생성 (CSS가 있거나 styled-components를 사용하지 않는 경우)
if (hasCss || !usesStyledComponents) {
	let cssContent = "";
	if (hasCss) {
		cssContent = fs.readFileSync(pageCssPath, "utf-8");
	}

	const stylesContent = `import styled from 'styled-components';

// 기존 CSS를 styled-components로 변환
// TODO: 아래 스타일을 실제 CSS에 맞게 수정하세요

export const Container = styled.div\`
  // 스타일 추가
\`;

${cssContent ? `/* 기존 CSS 참고:\n${cssContent}\n*/` : ""}
`;

	fs.writeFileSync(path.join(pageFolderPath, "styles.ts"), stylesContent);
	console.log(`✅ styles.ts 생성 ${hasCss ? "(기존 CSS 포함)" : ""}`);
}

// 7. index.tsx 생성
let tsxContent = jsContent
	.replace(/\.css['"]/g, ".ts'") // CSS import를 styles.ts로 변경
	.replace(/from ['"]react['"]/g, "from 'react'")
	.replace(/export default (\w+);?/, "export default $1;")
	.replace(/const (\w+) = \(\) => \{/, "const $1: React.FC = () => {")
	.replace(
		/const (\w+) = \(\{[^}]+\}\) => \{/,
		"const $1: React.FC<$1Props> = (props) => {",
	);

// import 경로 수정
tsxContent = tsxContent.replace(/from ['"]\.\.\//g, "from '../../");
tsxContent = tsxContent.replace(/from ['"]\.\//g, "from './");

// styled-components import 추가 (필요한 경우)
if (!usesStyledComponents && hasCss) {
	tsxContent = `import * as S from './styles';\n` + tsxContent;
}

fs.writeFileSync(path.join(pageFolderPath, "index.tsx"), tsxContent);
console.log(`✅ index.tsx 생성`);

// 8. 완료 메시지
console.log(`\n✅ ${pageName} 마이그레이션 완료!`);
console.log(`\n📁 생성된 파일:`);
console.log(`   ${pageFolderPath}/`);
console.log(`   ├── index.tsx`);
console.log(`   ├── types.ts`);
console.log(`   ├── styles.ts`);
console.log(`   ├── components/`);
console.log(`   └── utils/`);
console.log(`\n⚠️  다음 작업이 필요합니다:`);
console.log(`   1. index.tsx의 타입 에러 수정`);
console.log(`   2. styles.ts에서 CSS를 styled-components로 변환`);
console.log(`   3. App.js에서 import 경로 업데이트`);
console.log(`   4. 기존 ${pageName}.js, ${pageName}.css 파일 삭제 (검증 후)`);
console.log(`\n🔗 App.js 업데이트 예시:`);
console.log(`   import ${pageName} from "./pages/${pageName}Page";\n`);
