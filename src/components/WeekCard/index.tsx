import type React from "react";
import * as S from "./styles";
import type { WeekCardProps } from "./types";

const WeekCard: React.FC<WeekCardProps> = ({ week }) => {
	const getLevelIcon = (level: string): string => {
		switch (level) {
			case "높음":
				return "↗️";
			case "보통":
				return "→";
			case "낮음":
				return "↘️";
			default:
				return "→";
		}
	};

	const getDeadlineText = (frequency: string): string => {
		switch (frequency) {
			case "높음":
				return "D-3";
			case "보통":
				return "D-7";
			case "낮음":
				return "D-14";
			default:
				return "D-7";
		}
	};

	return (
		<S.CardLink to={`/assignments/${week.title.replace(" ", "")}/detail`}>
			<S.Card>
				<S.Header>
					<S.Title>{week.title}</S.Title>
					<S.ExpandIcon>▶</S.ExpandIcon>
				</S.Header>

				<S.Description>{week.description}</S.Description>

				<S.Metrics>
					<S.Metric>
						<S.MetricLabel>과제 기한</S.MetricLabel>
						<S.MetricValue $type="deadline">
							{getDeadlineText(week.frequency)}
						</S.MetricValue>
					</S.Metric>

					<S.Metric>
						<S.MetricLabel>평균 점수</S.MetricLabel>
						<S.MetricValue>
							{getLevelIcon(week.avgScore)} {week.avgScore}
						</S.MetricValue>
					</S.Metric>

					<S.Metric>
						<S.MetricLabel>문제 세트</S.MetricLabel>
						<S.MetricValue>{week.problemSet}</S.MetricValue>
					</S.Metric>
				</S.Metrics>
			</S.Card>
		</S.CardLink>
	);
};

export default WeekCard;
