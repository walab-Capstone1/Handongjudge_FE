import * as GS from "../styles";
import type { QuizSubmissionLogTarget } from "../types";

type Props = {
	submitted?: boolean;
	onOpen: (ctx: QuizSubmissionLogTarget) => void;
	ctx: QuizSubmissionLogTarget;
};

export default function QuizSubmissionLogButton({
	submitted,
	onOpen,
	ctx,
}: Props) {
	if (!submitted) return null;
	return (
		<GS.BtnSubmissionLog
			type="button"
			title="코딩테스트 제출 이력 전체 보기"
			onClick={() => onOpen(ctx)}
		>
			log
		</GS.BtnSubmissionLog>
	);
}
