import type React from "react";
import * as S from "./styles";

export interface ActiveToggleProps {
	/** 현재 활성 여부 (true = ON/초록, false = OFF/빨강) */
	active: boolean;
	/** 토글 클릭 시 호출. 새 값은 !active 로 전달하지 않고, 부모에서 기존 API 호출 시 사용 */
	onToggle: () => void;
	/** 토글 안에 활성/비활성 텍스트 표시 여부 */
	showLabel?: boolean;
	/** 비활성화 (로딩 등) */
	disabled?: boolean;
	/** 접근성용 title */
	title?: string;
	/** 추가 className */
	className?: string;
}

/**
 * 활성/비활성 상태용 토글.
 * - active=true: 초록 배경, 노브 오른쪽, 활성 텍스트(선택)
 * - active=false: 빨강 배경, 노브 왼쪽, 비활성 텍스트(선택)
 */
const ActiveToggle: React.FC<ActiveToggleProps> = ({
	active,
	onToggle,
	showLabel = true,
	disabled = false,
	title,
	className,
}) => {
	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
		e.stopPropagation();
		if (!disabled) onToggle();
	};

	const label = active ? "활성" : "비활성";
	const a11yTitle = title ?? (active ? "비활성화하려면 클릭" : "활성화하려면 클릭");

	return (
		<S.ToggleTrack
			type="button"
			$active={active}
			onClick={handleClick}
			disabled={disabled}
			title={a11yTitle}
			aria-checked={active}
			aria-label={a11yTitle}
			className={className}
		>
			{showLabel && <S.ToggleLabel>{label}</S.ToggleLabel>}
			<S.ToggleKnob $active={active} />
		</S.ToggleTrack>
	);
};

export default ActiveToggle;
