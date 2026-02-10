import type React from "react";
import * as S from "../styles";
import type { ProblemEditHookReturn } from "../hooks/useProblemEdit";

type ProblemEditBannersProps = Pick<
	ProblemEditHookReturn,
	"enableFullEdit" | "setEnableFullEdit"
>;

const ProblemEditBanners: React.FC<ProblemEditBannersProps> = ({
	enableFullEdit,
	setEnableFullEdit,
}) => (
	<>
		{!enableFullEdit && (
			<div
				style={{
					marginBottom: "20px",
					padding: "16px",
					backgroundColor: "#fff3cd",
					border: "1px solid #ffc107",
					borderRadius: "8px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<div>
					<strong style={{ color: "#856404" }}>⚠️ 메타데이터 수정 모드</strong>
					<p
						style={{
							margin: "8px 0 0 0",
							color: "#856404",
							fontSize: "14px",
						}}
					>
						현재 제목, 난이도, 태그만 수정 가능합니다. 다른 필드를 수정하려면
						&apos;문제 변환&apos; 버튼을 클릭하세요.
						<br />
						<span
							style={{
								fontSize: "13px",
								fontStyle: "italic",
							}}
						>
							(문제 변환 시 Domjudge까지 변환하는 전체 업데이트가 수행되며,
							새로운 문제로 취급됩니다)
						</span>
					</p>
				</div>
				<S.ConvertButton
					type="button"
					onClick={() => {
						if (
							window.confirm(
								"문제 변환 모드를 활성화하시겠습니까?\n\n이 모드에서는 문제 설명, 시간/메모리 제한, 테스트케이스 등을 수정할 수 있습니다.\n\n⚠️ 주의: 이러한 변경사항은 Domjudge까지 변환하는 전체 업데이트를 수행하며, 새로운 문제로 취급됩니다.",
							)
						) {
							setEnableFullEdit(true);
						}
					}}
				>
					문제 변환
				</S.ConvertButton>
			</div>
		)}

		{enableFullEdit && (
			<div
				style={{
					marginBottom: "20px",
					padding: "16px",
					backgroundColor: "#d1ecf1",
					border: "1px solid #0c5460",
					borderRadius: "8px",
				}}
			>
				<strong style={{ color: "#0c5460" }}>⚠️ 문제 변환 모드 활성화</strong>
				<p
					style={{
						margin: "8px 0 0 0",
						color: "#0c5460",
						fontSize: "14px",
					}}
				>
					모든 필드를 수정할 수 있습니다. 변경사항은 Domjudge까지 변환하는 전체
					업데이트를 수행하며, 새로운 문제로 취급됩니다.
				</p>
			</div>
		)}
	</>
);

export default ProblemEditBanners;
