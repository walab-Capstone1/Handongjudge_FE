import type React from "react";
import ReactMarkdown from "react-markdown";
import * as S from "./styles";

interface Problem {
	description?: string;
	timeLimit?: number;
	memoryLimit?: number;
}

interface ProblemDescriptionProps {
	currentProblem: Problem;
	problemDescription?: string;
}

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
	currentProblem,
	problemDescription = "",
}) => {
	const description = currentProblem.description || problemDescription;
	const isMarkdown =
		description &&
		(description.includes("# ") ||
			description.includes("## ") ||
			description.includes("```") ||
			description.includes("**") ||
			description.includes("* ") ||
			!description.includes("<"));

	return (
		<S.DescriptionArea>
			<S.DescriptionHeader>
				<span>문제 설명</span>

				{(currentProblem.timeLimit || currentProblem.memoryLimit) && (
					<S.ProblemLimitsHeader>
						{currentProblem.timeLimit && (
							<S.LimitBadge $type="time">
								시간 제한: {currentProblem.timeLimit}초
							</S.LimitBadge>
						)}
						{currentProblem.memoryLimit && (
							<S.LimitBadge $type="memory">
								메모리 제한: {currentProblem.memoryLimit}MB
							</S.LimitBadge>
						)}
					</S.ProblemLimitsHeader>
				)}
			</S.DescriptionHeader>

			<S.DescriptionContent>
				{isMarkdown ? (
					<ReactMarkdown
						components={{
							code({ node, inline, className, children, ...props }: any) {
								return inline ? (
									<code className="inline-code" {...props}>
										{children}
									</code>
								) : (
									<pre className="code-block">
										<code className={className} {...props}>
											{children}
										</code>
									</pre>
								);
							},
							table({ children, ...props }) {
								return (
									<div className="table-wrapper">
										<table {...props}>{children}</table>
									</div>
								);
							},
						}}
					>
						{description}
					</ReactMarkdown>
				) : (
					<div dangerouslySetInnerHTML={{ __html: description }} />
				)}
			</S.DescriptionContent>
		</S.DescriptionArea>
	);
};

export default ProblemDescription;
