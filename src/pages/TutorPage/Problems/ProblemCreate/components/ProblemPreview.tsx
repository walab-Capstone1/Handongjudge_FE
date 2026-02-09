import type React from "react";
import * as S from "../styles";
import type { SampleInput } from "../types";

export interface ProblemPreviewProps {
	title: string;
	description: string;
	inputFormat: string;
	outputFormat: string;
	sampleInputs: SampleInput[];
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
		(sampleInputs && sampleInputs.some((s) => s.input || s.output));

	if (!hasContent) {
		return <S.PreviewEmpty>문제 설명을 입력하세요</S.PreviewEmpty>;
	}

	return (
		<S.PreviewWrapper>
			{title && <S.PreviewTitle>{title}</S.PreviewTitle>}
			{description && (
				<S.PreviewDescription
					dangerouslySetInnerHTML={{ __html: description }}
				/>
			)}
			{inputFormat && (
				<S.PreviewSection>
					<S.PreviewH2>입력 형식</S.PreviewH2>
					<S.PreviewContentText>
						{inputFormat.split("\n").map((line, idx) => (
							<S.PreviewParagraph key={idx}>
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
							<S.PreviewParagraph key={idx}>
								{line || "\u00A0"}
							</S.PreviewParagraph>
						))}
					</S.PreviewContentText>
				</S.PreviewSection>
			)}
			{sampleInputs && sampleInputs.some((s) => s.input || s.output) && (
				<S.PreviewSection>
					<S.PreviewH2>예제</S.PreviewH2>
					{sampleInputs.map((sample, idx) => {
						if (!sample.input && !sample.output) return null;
						return (
							<S.PreviewExample key={idx}>
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
export { ProblemPreview };
