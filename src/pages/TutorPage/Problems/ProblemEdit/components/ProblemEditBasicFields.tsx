import type React from "react";
import * as S from "../styles";
import type { ProblemEditHookReturn } from "../hooks/useProblemEdit";

type ProblemEditBasicFieldsProps = Pick<
	ProblemEditHookReturn,
	| "formData"
	| "currentTag"
	| "setCurrentTag"
	| "zipFile"
	| "enableFullEdit"
	| "handleInputChange"
	| "handleTagAdd"
	| "handleTagKeyPress"
	| "handleTagRemove"
	| "handleZipFileChange"
>;

const ProblemEditBasicFields: React.FC<ProblemEditBasicFieldsProps> = ({
	formData,
	currentTag,
	setCurrentTag,
	zipFile,
	enableFullEdit,
	handleInputChange,
	handleTagAdd,
	handleTagKeyPress,
	handleTagRemove,
	handleZipFileChange,
}) => (
	<>
		<S.FormSection>
			<S.Label htmlFor="problem-edit-title">문제 제목 *</S.Label>
			<S.Input
				id="problem-edit-title"
				type="text"
				name="title"
				value={formData.title}
				onChange={handleInputChange}
				required
				placeholder="문제 제목을 입력하세요"
			/>
		</S.FormSection>

		<S.FormRow>
			<S.FormSection>
				<S.Label htmlFor="problem-edit-difficulty">난이도 *</S.Label>
				<S.Select
					id="problem-edit-difficulty"
					name="difficulty"
					value={formData.difficulty}
					onChange={handleInputChange}
					required
				>
					<option value="1">Level 1</option>
					<option value="2">Level 2</option>
					<option value="3">Level 3</option>
				</S.Select>
			</S.FormSection>
			<S.FormSection>
				<S.Label htmlFor="problem-edit-tag">태그</S.Label>
				<S.TagInputWrapper>
					<S.Input
						id="problem-edit-tag"
						type="text"
						value={currentTag}
						onChange={(e) => setCurrentTag(e.target.value)}
						onKeyDown={handleTagKeyPress}
						placeholder="태그 입력 후 Enter"
					/>
					<S.TagAddButton type="button" onClick={handleTagAdd}>
						추가
					</S.TagAddButton>
				</S.TagInputWrapper>
				<S.Tags>
					{formData.tags.map((tag) => (
						<S.Tag key={tag}>
							{tag}
							<S.TagRemove type="button" onClick={() => handleTagRemove(tag)}>
								×
							</S.TagRemove>
						</S.Tag>
					))}
				</S.Tags>
			</S.FormSection>
		</S.FormRow>

		<S.FormRow>
			<S.FormSection>
				<S.Label htmlFor="problem-edit-timeLimit">시간 제한 (초)</S.Label>
				<S.Input
					id="problem-edit-timeLimit"
					type="number"
					name="timeLimit"
					value={formData.timeLimit}
					onChange={handleInputChange}
					min={0}
					step={0.1}
					placeholder="예: 2.0"
					disabled={!enableFullEdit}
					style={{
						backgroundColor: enableFullEdit ? "white" : "#f5f5f5",
						cursor: enableFullEdit ? "text" : "not-allowed",
						opacity: enableFullEdit ? 1 : 0.7,
					}}
				/>
			</S.FormSection>
			<S.FormSection>
				<S.Label htmlFor="problem-edit-memoryLimit">메모리 제한 (MB)</S.Label>
				<S.Input
					id="problem-edit-memoryLimit"
					type="number"
					name="memoryLimit"
					value={formData.memoryLimit}
					onChange={handleInputChange}
					min={0}
					placeholder="예: 256"
					disabled={!enableFullEdit}
					style={{
						backgroundColor: enableFullEdit ? "white" : "#f5f5f5",
						cursor: enableFullEdit ? "text" : "not-allowed",
						opacity: enableFullEdit ? 1 : 0.7,
					}}
				/>
			</S.FormSection>
		</S.FormRow>

		<S.FormSection>
			<S.Label htmlFor="zipFileInput">ZIP 파일 (선택사항)</S.Label>
			<S.FileUploadWrapper>
				<S.FileInput
					type="file"
					id="zipFileInput"
					accept=".zip"
					onChange={handleZipFileChange}
					disabled={!enableFullEdit}
				/>
				<S.FileLabelInline
					htmlFor="zipFileInput"
					style={{
						cursor: enableFullEdit ? "pointer" : "not-allowed",
						opacity: enableFullEdit ? 1 : 0.7,
					}}
				>
					{zipFile ? `✓ ${zipFile.name}` : "ZIP 파일 선택"}
				</S.FileLabelInline>
				<S.HelpText>
					새 ZIP 파일을 업로드하면 기존 ZIP을 대체합니다 (선택사항)
				</S.HelpText>
			</S.FileUploadWrapper>
		</S.FormSection>
	</>
);

export default ProblemEditBasicFields;
