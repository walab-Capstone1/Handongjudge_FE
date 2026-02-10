import type React from "react";
import ReactMarkdown from "react-markdown";
import type { ProblemPreviewProps, SampleInput } from "./types";
import * as S from "./styles";

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
			{title && <S.PreviewTitle>{title}</S.PreviewTitle>}
			{description && (
				<>
					{typeof description === "string" && /<[^>]+>/.test(description) ? (
						<div dangerouslySetInnerHTML={{ __html: description }} />
					) : (
						<S.PreviewDescription>
							<ReactMarkdown
								components={{
									h1: ({ node, ...props }) => <S.PreviewH1 {...props} />,
									h2: ({ node, ...props }) => <S.PreviewH2 {...props} />,
									h3: ({ node, ...props }) => <S.PreviewH3 {...props} />,
									code: ({
										node,
										inline,
										className,
										children,
										...props
									}: {
										node?: unknown;
										inline?: boolean;
										className?: string;
										children?: React.ReactNode;
									}) =>
										inline ? (
											<S.PreviewInlineCode {...props}>
												{children}
											</S.PreviewInlineCode>
										) : (
											<S.PreviewCodeBlock>
												<code {...props}>{children}</code>
											</S.PreviewCodeBlock>
										),
									p: ({ node, ...props }) => <S.PreviewParagraph {...props} />,
									hr: ({ node, ...props }) => <hr {...props} />,
								}}
							>
								{description}
							</ReactMarkdown>
						</S.PreviewDescription>
					)}
				</>
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
