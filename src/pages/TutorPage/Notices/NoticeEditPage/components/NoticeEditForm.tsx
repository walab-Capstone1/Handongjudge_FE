import type { FC } from "react";
import TipTapEditor from "../../../../../components/Editor/TipTapEditor";
import * as S from "../../NoticeCreatePage/styles";
import type { NoticeFormData } from "../types";

interface NoticeEditFormProps {
	formData: NoticeFormData;
	setFormData: React.Dispatch<React.SetStateAction<NoticeFormData>>;
	editorReady: boolean;
	saving: boolean;
	onSubmit: (e: React.FormEvent) => void;
	onBack: () => void;
}

const NoticeEditForm: FC<NoticeEditFormProps> = ({
	formData,
	setFormData,
	editorReady,
	saving,
	onSubmit,
	onBack,
}) => (
	<S.Form onSubmit={onSubmit}>
		<S.FormGroup>
			<S.Label>
				제목 <span className="required">*</span>
			</S.Label>
			<S.Input
				type="text"
				placeholder="공지사항 제목을 입력하세요"
				value={formData.title}
				onChange={(e) =>
					setFormData((prev) => ({ ...prev, title: e.target.value }))
				}
				maxLength={200}
			/>
			<S.CharCount>{formData.title.length}/200</S.CharCount>
		</S.FormGroup>
		<S.FormGroup>
			<S.Label>
				내용 <span className="required">*</span>
			</S.Label>
			{editorReady ? (
				<TipTapEditor
					content={formData.content || ""}
					onChange={(html) =>
						setFormData((prev) => ({ ...prev, content: html }))
					}
					placeholder="공지사항 내용을 자세히 작성해주세요"
				/>
			) : (
				<div
					style={{
						minHeight: "200px",
						padding: "1rem",
						border: "1px solid #e5e7eb",
						borderRadius: "8px",
						background: "#f9fafb",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "#64748b",
					}}
				>
					로딩 중...
				</div>
			)}
		</S.FormGroup>
		<S.FormActions>
			<S.CancelButton type="button" onClick={onBack}>
				취소
			</S.CancelButton>
			<S.SubmitButton type="submit" disabled={saving}>
				{saving ? "수정 중..." : "수정 완료"}
			</S.SubmitButton>
		</S.FormActions>
	</S.Form>
);

export default NoticeEditForm;
