import React from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import type { ProblemPreviewProps, SampleInput } from "./types";
import * as S from "./styles";

// react-markdown v10: 'inline' prop 제거됨 → Context로 블록/인라인 코드 구분
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
		return <code className={className}>{children}</code>;
	}
	return <S.PreviewInlineCode>{children}</S.PreviewInlineCode>;
}

const NBSP = "\u00A0";

function prepareMarkdown(text: string): string {
	return text
		.split(/(```[\s\S]*?```)/g)
		.map((part, i) => {
			if (i % 2 === 1) return part;
			return part
				.replace(/\n{2,}/g, (match) => {
					const extra = match.length - 2;
					if (extra === 0) return "\n\n";
					return "\n\n" + `${NBSP}\n\n`.repeat(extra);
				})
				.replace(/(?<!\n)\n(?!\n)/g, "  \n");
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
	hr: ({ node: _n, ...props }) => <hr {...props} />,
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
		sampleInputs?.some((s: SampleInput) => s.input || s.output);

	if (!hasContent) {
		return <S.PreviewEmpty>문제 설명을 입력하세요</S.PreviewEmpty>;
	}

	return (
		<S.PreviewWrapper>
	
	{description && (
		<S.PreviewDescription>
			<ReactMarkdown components={mdComponents} rehypePlugins={[rehypeRaw]}>
				{prepareMarkdown(description)}
			</ReactMarkdown>
		</S.PreviewDescription>
	)}

			{inputFormat && (
				<S.PreviewSection>
					<S.PreviewH2>입력 형식</S.PreviewH2>
					<S.PreviewContentText>
						{inputFormat.split("\n").map((line, idx) => (
							<S.PreviewParagraph key={`input-${idx}-${line}`}>
								{line || "\u00A0"}
							</S.PreviewParagraph>
						))}
					</S.PreviewContentText>
				</S.PreviewSection>
			)}

			{outputFormat && (
				<S.PreviewSection>
					<S.PreviewH2>출력 형식</S.PreviewH2>
					<S.PreviewContentText>
						{outputFormat.split("\n").map((line, idx) => (
							<S.PreviewParagraph key={`output-${idx}-${line}`}>
								{line || "\u00A0"}
							</S.PreviewParagraph>
						))}
					</S.PreviewContentText>
				</S.PreviewSection>
			)}

			{sampleInputs?.some((s) => s.input || s.output) && (
				<S.PreviewSection>
					<S.PreviewH2>예제</S.PreviewH2>
					{sampleInputs.map((sample, idx) => {
						if (!sample.input && !sample.output) return null;
						return (
							<S.PreviewExample
								key={`sample-${idx}-${sample.input}-${sample.output}`}
							>
								<S.PreviewH3>예제 입력 {idx + 1}</S.PreviewH3>
								<S.PreviewCodeBlock>
									<code>{sample.input || ""}</code>
								</S.PreviewCodeBlock>
								<S.PreviewH3>예제 출력 {idx + 1}</S.PreviewH3>
								<S.PreviewCodeBlock>
									<code>{sample.output || ""}</code>
								</S.PreviewCodeBlock>
							</S.PreviewExample>
						);
					})}
				</S.PreviewSection>
			)}
		</S.PreviewWrapper>
	);
};

export default ProblemPreview;
