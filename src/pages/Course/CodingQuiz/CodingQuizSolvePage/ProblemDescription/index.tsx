import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";
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

// react-markdown v10에서 'inline' prop 제거됨 → Context로 블록/인라인 코드 구분
const InsidePreContext = React.createContext(false);

function DescPre({ children }: { children?: React.ReactNode }) {
	return (
		<InsidePreContext.Provider value={true}>
			<pre className="code-block">{children}</pre>
		</InsidePreContext.Provider>
	);
}

function DescCode({
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
	return <code className="inline-code">{children}</code>;
}

// 코드 블록 밖에서:
//  - \n 1번  → "  \n"  (마크다운 hard break = <br>)
//  - \n 2번  → 단락 분리
//  - \n 3번+ → 단락 분리 + 빈 줄(\u00A0) 삽입
const NBSP = "\u00A0";

function prepareMarkdown(text: string): string {
	return text
		.split(/(```[\s\S]*?```)/g)
		.map((part, i) => {
			if (i % 2 === 1) return part; // 코드 블록 내부 → 그대로
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
	pre: DescPre,
	code: DescCode,
	table({ children, ...props }) {
		return (
			<div className="table-wrapper">
				<table {...props}>{children}</table>
			</div>
		);
	},
};

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
	currentProblem,
	problemDescription = "",
}) => {
	const description = currentProblem.description || problemDescription;

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
				{description ? (
					<ReactMarkdown
						components={mdComponents}
						rehypePlugins={[rehypeRaw]}
					>
						{prepareMarkdown(description)}
					</ReactMarkdown>
				) : (
					<p>문제 설명이 없습니다.</p>
				)}
			</S.DescriptionContent>
		</S.DescriptionArea>
	);
};

export default ProblemDescription;
