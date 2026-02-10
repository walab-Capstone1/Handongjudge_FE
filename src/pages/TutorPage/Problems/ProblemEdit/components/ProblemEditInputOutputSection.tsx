import type React from "react";
import * as S from "../styles";
import type { ProblemEditHookReturn } from "../hooks/useProblemEdit";

type ProblemEditInputOutputSectionProps = Pick<
	ProblemEditHookReturn,
	"formData" | "enableFullEdit" | "handleInputChange"
>;

const ProblemEditInputOutputSection: React.FC<
	ProblemEditInputOutputSectionProps
> = ({ formData, enableFullEdit, handleInputChange }) => (
	<S.FormRow>
		<S.FormSection>
			<S.Label htmlFor="problem-edit-inputFormat">입력 형식</S.Label>
			{!enableFullEdit ? (
				<div
					style={{
						padding: "12px",
						backgroundColor: "#f5f5f5",
						borderRadius: "4px",
						minHeight: "80px",
						whiteSpace: "pre-wrap",
						color: "#666",
					}}
				>
					{formData.inputFormat || "(입력 형식 없음)"}
				</div>
			) : (
				<S.Textarea
					id="problem-edit-inputFormat"
					name="inputFormat"
					value={formData.inputFormat}
					onChange={handleInputChange}
					rows={4}
					placeholder="입력 형식을 설명하세요"
				/>
			)}
		</S.FormSection>
		<S.FormSection>
			<S.Label htmlFor="problem-edit-outputFormat">출력 형식</S.Label>
			{!enableFullEdit ? (
				<div
					style={{
						padding: "12px",
						backgroundColor: "#f5f5f5",
						borderRadius: "4px",
						minHeight: "80px",
						whiteSpace: "pre-wrap",
						color: "#666",
					}}
				>
					{formData.outputFormat || "(출력 형식 없음)"}
				</div>
			) : (
				<S.Textarea
					id="problem-edit-outputFormat"
					name="outputFormat"
					value={formData.outputFormat}
					onChange={handleInputChange}
					rows={4}
					placeholder="출력 형식을 설명하세요"
				/>
			)}
		</S.FormSection>
	</S.FormRow>
);

export default ProblemEditInputOutputSection;
