import type { FC } from "react";
import * as S from "../styles";
import type { AssignmentFormData } from "../types";

interface AssignmentCreateFormProps {
	formData: AssignmentFormData;
	onInputChange: (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => void;
	loading: boolean;
	onSubmit: (e: React.FormEvent) => void;
	onBack: () => void;
}

const AssignmentCreateForm: FC<AssignmentCreateFormProps> = ({
	formData,
	onInputChange,
	loading,
	onSubmit,
	onBack,
}) => (
	<S.Form onSubmit={onSubmit}>
		<S.FormRow>
			<S.FormGroup>
				<S.Label htmlFor="title">
					과제명 <span className="required">*</span>
				</S.Label>
				<S.Input
					type="text"
					id="title"
					name="title"
					placeholder="과제명을 입력하세요"
					value={formData.title}
					onChange={onInputChange}
					required
				/>
			</S.FormGroup>
			<S.FormGroup>
				<S.Label htmlFor="assignmentNumber">과제 번호</S.Label>
				<S.Input
					type="text"
					id="assignmentNumber"
					name="assignmentNumber"
					placeholder="예: HW1, Assignment1"
					value={formData.assignmentNumber}
					onChange={onInputChange}
				/>
			</S.FormGroup>
		</S.FormRow>
		<S.FormGroup>
			<S.Label htmlFor="description">과제 설명</S.Label>
			<S.Textarea
				id="description"
				name="description"
				placeholder="과제에 대한 상세 설명을 입력하세요"
				rows={4}
				value={formData.description}
				onChange={onInputChange}
			/>
		</S.FormGroup>
		<S.FormRow>
			<S.FormGroup>
				<S.Label htmlFor="startDate">시작일</S.Label>
				<S.Input
					type="datetime-local"
					id="startDate"
					name="startDate"
					value={formData.startDate}
					onChange={onInputChange}
				/>
			</S.FormGroup>
			<S.FormGroup>
				<S.Label htmlFor="endDate">마감일</S.Label>
				<S.Input
					type="datetime-local"
					id="endDate"
					name="endDate"
					value={formData.endDate}
					onChange={onInputChange}
				/>
			</S.FormGroup>
		</S.FormRow>
		<S.FormActions>
			<S.CancelButton type="button" onClick={onBack}>
				취소
			</S.CancelButton>
			<S.SubmitButton type="submit" disabled={loading}>
				{loading ? "생성 중..." : "과제 생성"}
			</S.SubmitButton>
		</S.FormActions>
	</S.Form>
);

export default AssignmentCreateForm;
