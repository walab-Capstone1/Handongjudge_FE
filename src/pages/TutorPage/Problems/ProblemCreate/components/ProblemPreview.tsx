import React from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import * as S from "../styles";
import type { SampleInput } from "../types";

export interface ProblemPreviewProps {
	title: string;
	description: string;
	inputFormat: string;
	outputFormat: string;
	sampleInputs: SampleInput[];
}

// react-markdown v10에서는 'inline' prop이 제거됨.
// Context를 이용해 <pre> 안에 있는 <code>인지(블록) 아닌지(인라인)를 구별합니다.
const InsidePreContext = React.createContext(false);

function MarkdownPre({ children }: { children?: React.ReactNode }) {
	return (
		<InsidePreContext.Provider value={true}>
			<S.PreviewCodeBlock>{children}</S.PreviewCodeBlock>
		</InsidePreContext.Provider>
	);
}

function MarkdownCode({
	children,
	className,
}: {
	children?: React.ReactNode;
	className?: string;
}) {
	const insidePre = React.useContext(InsidePreContext);
	if (insidePre) {
		// 블록 코드 — <pre> 내부의 <code>는 그대로 렌더링 (PreviewCodeBlock이 스타일 담당)
		return <code className={className}>{children}</code>;
	}
	// 인라인 코드
	return <S.PreviewInlineCode>{children}</S.PreviewInlineCode>;
}

/**
 * contentEditable에서 Enter로 입력한 단일 줄바꿈(\n)을
 * 마크다운 문단 구분(\n\n)으로 변환합니다.
 * 코드 블록(``` ... ```) 내부는 건드리지 않습니다.
 */
/**
 * 코드 블록 밖에서:
 *  - \n 1번  → "  \n"  (마크다운 hard break = <br>)
 *  - \n 2번  → 단락 분리 (그대로)
 *  - \n 3번+ → 단락 분리 + 빈 줄(\u00A0 단락)을 여분만큼 삽입
 *              → 에디터의 빈 줄 수와 미리보기가 비슷하게 맞춰집니다.
 * 코드 블록(``` ... ```) 내부는 건드리지 않습니다.
 */
const NBSP = "\u00A0"; // non-breaking space

function prepareMarkdown(text: string): string {
	return text
		.split(/(```[\s\S]*?```)/g)
		.map((part, i) => {
			if (i % 2 === 1) return part; // 코드 블록 내부 → 그대로
			return (
				part
					// Step 1: 연속 2개 이상 \n 처리
					//   - \n\n     → 그대로 (단락 분리)
					//   - \n\n\n   → \n\n + NBSP 단락
					//   - \n\n\n\n → \n\n + NBSP 단락 × 2 ...
					.replace(/\n{2,}/g, (match) => {
						const extra = match.length - 2;
						if (extra === 0) return "\n\n";
						return "\n\n" + `${NBSP}\n\n`.repeat(extra);
					})
					// Step 2: 남은 단일 \n → hard break (  \n)
					.replace(/(?<!\n)\n(?!\n)/g, "  \n")
			);
		})
		.join("");
}

const mdComponents: Components = {
	pre: MarkdownPre,
	code: MarkdownCode,
	h1: ({ node: _n, ...props }) => <S.PreviewH1 {...props} />,
	h2: ({ node: _n, ...props }) => <S.PreviewH2 {...props} />,
	h3: ({ node: _n, ...props }) => <S.PreviewH3 {...props} />,
	p:  ({ node: _n, ...props }) => <S.PreviewParagraph {...props} />,
};

const ProblemPreview: React.FC<ProblemPreviewProps> = ({
	title,
	description,
	inputFormat,
	outputFormat,
	sampleInputs,
}) => {
	const hasContent =
		description ||
		inputFormat ||
		outputFormat ||
		(sampleInputs && sampleInputs.some((s) => s.input || s.output));

	if (!hasContent) {
		return <S.PreviewEmpty>문제 설명을 입력하세요</S.PreviewEmpty>;
	}

	return (
		<div>
	
		{description && (
		<S.PreviewSection>
			<ReactMarkdown components={mdComponents} rehypePlugins={[rehypeRaw]}>
				{prepareMarkdown(description)}
			</ReactMarkdown>
		</S.PreviewSection>
	)}

	{inputFormat && (
		<S.PreviewSection>
			<S.PreviewH2>입력</S.PreviewH2>
			<ReactMarkdown components={mdComponents} rehypePlugins={[rehypeRaw]}>
				{prepareMarkdown(inputFormat)}
			</ReactMarkdown>
		</S.PreviewSection>
	)}

	{outputFormat && (
		<S.PreviewSection>
			<S.PreviewH2>출력</S.PreviewH2>
			<ReactMarkdown components={mdComponents} rehypePlugins={[rehypeRaw]}>
				{prepareMarkdown(outputFormat)}
			</ReactMarkdown>
		</S.PreviewSection>
	)}

			{sampleInputs && sampleInputs.some((s) => s.input || s.output) && (
				<S.PreviewSection>
					<S.PreviewH2>예제</S.PreviewH2>
				{sampleInputs.map((sample, index) => {
					if (!sample.input && !sample.output) return null;
					return (
					<div key={index}>
						{sample.input && (
								<div>
									<S.PreviewH3>입력 {index + 1}</S.PreviewH3>
									<S.PreviewCodeBlock>
										<code>{sample.input}</code>
									</S.PreviewCodeBlock>
								</div>
							)}
							{sample.output && (
								<div>
									<S.PreviewH3>출력 {index + 1}</S.PreviewH3>
									<S.PreviewCodeBlock>
										<code>{sample.output}</code>
									</S.PreviewCodeBlock>
								</div>
							)}
					</div>
				);
				})}
			</S.PreviewSection>
			)}
		</div>
	);
};

export default ProblemPreview;
