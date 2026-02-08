import type React from "react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import {
	ProblemPreviewWrapper,
	ProblemPreviewEmpty,
	ProblemPreviewTitle,
	ProblemPreviewDescription,
	ProblemPreviewSection,
	ProblemPreviewH2,
	ProblemPreviewH3,
	ProblemPreviewContentText,
	ProblemPreviewParagraph,
	ProblemPreviewCodeBlock,
} from "./problemCreateStyles";

export interface SampleInput {
	input?: string;
	output?: string;
}

interface ProblemPreviewProps {
	title?: string;
	description?: string;
	inputFormat?: string;
	outputFormat?: string;
	sampleInputs?: SampleInput[];
}

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
		sampleInputs?.some((s) => s.input || s.output);

	if (!hasContent) {
		return <ProblemPreviewEmpty>문제 설명을 입력하세요</ProblemPreviewEmpty>;
	}

	return (
		<ProblemPreviewWrapper>
			{title && <ProblemPreviewTitle>{title}</ProblemPreviewTitle>}
			{description && (
				<ProblemPreviewDescription>
					<ReactMarkdown
						components={{
							h1: ({ node, ...props }) => (
								<h1 className="problem-preview-h1" {...props} />
							),
							h2: ({ node, ...props }) => <ProblemPreviewH2 {...props} />,
							h3: ({ node, ...props }) => <ProblemPreviewH3 {...props} />,
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
								children?: ReactNode;
							}) =>
								inline ? (
									<code className="problem-preview-inline-code" {...props}>
										{children}
									</code>
								) : (
									<ProblemPreviewCodeBlock>
										<code className={className} {...props}>
											{children}
										</code>
									</ProblemPreviewCodeBlock>
								),
							p: ({ node, ...props }) => <ProblemPreviewParagraph {...props} />,
						}}
					>
						{description}
					</ReactMarkdown>
				</ProblemPreviewDescription>
			)}
			{inputFormat && (
				<ProblemPreviewSection>
					<ProblemPreviewH2>입력 형식</ProblemPreviewH2>
					<ProblemPreviewContentText>
						{inputFormat.split("\n").map((line, idx) => (
							<ProblemPreviewParagraph
								key={`input-${idx}-${line.slice(0, 20)}`}
							>
								{line || "\u00A0"}
							</ProblemPreviewParagraph>
						))}
					</ProblemPreviewContentText>
				</ProblemPreviewSection>
			)}
			{outputFormat && (
				<ProblemPreviewSection>
					<ProblemPreviewH2>출력 형식</ProblemPreviewH2>
					<ProblemPreviewContentText>
						{outputFormat.split("\n").map((line, idx) => (
							<ProblemPreviewParagraph
								key={`output-${idx}-${line.slice(0, 20)}`}
							>
								{line || "\u00A0"}
							</ProblemPreviewParagraph>
						))}
					</ProblemPreviewContentText>
				</ProblemPreviewSection>
			)}
			{sampleInputs?.some((s) => s.input || s.output) &&
				sampleInputs.map((sample, idx) => {
					if (!sample.input && !sample.output) return null;
					return (
						<ProblemPreviewSection
							key={`sample-${idx}-${sample.input?.slice(0, 10) ?? ""}-${sample.output?.slice(0, 10) ?? ""}`}
						>
							<ProblemPreviewH3>예제 입력 {idx + 1}</ProblemPreviewH3>
							<ProblemPreviewCodeBlock>
								<code>{sample.input ?? ""}</code>
							</ProblemPreviewCodeBlock>
							<ProblemPreviewH3>예제 출력 {idx + 1}</ProblemPreviewH3>
							<ProblemPreviewCodeBlock>
								<code>{sample.output ?? ""}</code>
							</ProblemPreviewCodeBlock>
						</ProblemPreviewSection>
					);
				})}
		</ProblemPreviewWrapper>
	);
};

export default ProblemPreview;
