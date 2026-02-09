import type React from "react";
import { useState, useEffect } from "react";
import * as S from "./styles";

interface QuizTimerProps {
	endTime: string | Date;
	onTimeUp?: () => void;
}

const QuizTimer: React.FC<QuizTimerProps> = ({ endTime, onTimeUp }) => {
	const [timeRemaining, setTimeRemaining] = useState(0);
	const [isExpired, setIsExpired] = useState(false);

	useEffect(() => {
		if (!endTime) return;

		const calculateTimeRemaining = () => {
			const now = new Date().getTime();
			const end = new Date(endTime).getTime();
			const diff = end - now;

			if (diff <= 0) {
				setTimeRemaining(0);
				setIsExpired(true);
				if (onTimeUp) {
					onTimeUp();
				}
				return;
			}

			setTimeRemaining(diff);
			setIsExpired(false);
		};

		calculateTimeRemaining();
		const interval = setInterval(calculateTimeRemaining, 1000);

		return () => clearInterval(interval);
	}, [endTime, onTimeUp]);

	const formatTime = (ms: number) => {
		const totalSeconds = Math.floor(ms / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		if (hours > 0) {
			return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		}
		return `${minutes}:${String(seconds).padStart(2, "0")}`;
	};

	if (isExpired) {
		return (
			<S.Container $expired>
				<S.Label>시간 종료</S.Label>
				<S.Value>00:00</S.Value>
			</S.Container>
		);
	}

	const minutes = Math.floor(timeRemaining / 60000);
	const isWarning = minutes < 5;

	return (
		<S.Container $warning={isWarning}>
			<S.Label>남은 시간</S.Label>
			<S.Value>{formatTime(timeRemaining)}</S.Value>
		</S.Container>
	);
};

export default QuizTimer;
