import type { FC } from "react";
import TipTapEditor from "../../../../../components/Editor/TipTapEditor";
import * as S from "../styles";
import type { NoticeFormData } from "../types";

interface NoticeCreateFormProps {
	formData: NoticeFormData;
	setFormData: React.Dispatch<React.SetStateAction<NoticeFormData>>;
	mounted: boolean;
	loading: boolean;
	onSubmit: (e: React.FormEvent) => void;
	onBack: () => void;
}

const NoticeCreateForm: FC<NoticeCreateFormProps> = ({
	formData,
	setFormData,
	mounted,
	loading,
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
			{mounted && (
				<TipTapEditor
					content={formData.content || ""}
					onChange={(html) =>
						setFormData((prev) => ({ ...prev, content: html }))
					}
					placeholder="공지사항 내용을 자세히 작성해주세요"
				/>
			)}
		</S.FormGroup>
		<S.FormActions>
			<S.CancelButton type="button" onClick={onBack}>
				취소
			</S.CancelButton>
			<S.SubmitButton type="submit" disabled={loading}>
				{loading ? "작성 중..." : "작성 완료"}
			</S.SubmitButton>
		</S.FormActions>
	</S.Form>
);

export default NoticeCreateForm;
