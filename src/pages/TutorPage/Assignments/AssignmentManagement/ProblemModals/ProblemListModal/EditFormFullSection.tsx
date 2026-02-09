import type { RefObject, Dispatch, SetStateAction } from "react";
import type {
	ProblemListFormData,
	ProblemListTestcaseItem,
	ProblemListEditFormHandlers,
} from "../types";
import DescriptionEditorSection from "./DescriptionEditorSection";
import SampleInputsSection from "./SampleInputsSection";
import TestcasesSection from "./TestcasesSection";

export interface EditFormFullSectionProps {
	formData: ProblemListFormData;
	setFormData: Dispatch<SetStateAction<ProblemListFormData>>;
	descriptionRef: RefObject<HTMLDivElement | null>;
	zipFile: File | null;
	parsedTestCases: ProblemListTestcaseItem[];
	showParsedTestCases: boolean;
	setShowParsedTestCases: (v: boolean) => void;
	handlers: ProblemListEditFormHandlers;
}

/**
 * 편집 폼 - 변환 모드 전용 필드 (시간/메모리, ZIP, 설명, 입출력 형식, 예제, 테스트케이스)
 */
export default function EditFormFullSection({
	formData,
	setFormData,
	descriptionRef,
	zipFile,
	parsedTestCases,
	showParsedTestCases,
	setShowParsedTestCases,
	handlers,
}: EditFormFullSectionProps) {
	return (
		<>
			<div className="problem-create-form-row">
				<div className="problem-create-form-section">
					<label
						className="problem-create-label"
						htmlFor="problem-list-modal-timeLimit"
					>
						시간 제한 (초)
					</label>
					<input
						id="problem-list-modal-timeLimit"
						type="number"
						name="timeLimit"
						value={formData.timeLimit}
						onChange={handlers.handleInputChange}
						className="problem-create-input"
						min={0}
						step="0.1"
						placeholder="예: 2.0"
					/>
				</div>

				<div className="problem-create-form-section">
					<label
						className="problem-create-label"
						htmlFor="problem-list-modal-memoryLimit"
					>
						메모리 제한 (MB)
					</label>
					<input
						id="problem-list-modal-memoryLimit"
						type="number"
						name="memoryLimit"
						value={formData.memoryLimit}
						onChange={handlers.handleInputChange}
						className="problem-create-input"
						min={0}
						placeholder="예: 256"
					/>
				</div>
			</div>

			<div className="problem-create-form-section">
				<label className="problem-create-label" htmlFor="zipFileInput">
					ZIP 파일 (파싱용)
				</label>
				<div className="problem-create-file-upload-wrapper">
					<input
						type="file"
						id="zipFileInput"
						accept=".zip"
						onChange={handlers.handleZipFileChange}
						className="problem-create-file-input"
					/>
					<label
						htmlFor="zipFileInput"
						className="problem-create-file-label-inline"
					>
						{zipFile ? `✓ ${zipFile.name}` : "ZIP 파일 선택"}
					</label>
					<span className="problem-create-help-text">
						ZIP 파일을 업로드하면 내용을 파싱하여 폼에 자동으로 채워집니다. 실제
						저장 시에는 파싱된 필드만 전송됩니다.
					</span>
				</div>
			</div>

			<DescriptionEditorSection
				descriptionRef={descriptionRef}
				formData={formData}
				setFormData={setFormData}
				handlers={{
					applyFormat: handlers.applyFormat,
					insertText: handlers.insertText,
					getFullDescription: handlers.getFullDescription,
				}}
			/>

			<div className="problem-create-form-row">
				<div className="problem-create-form-section">
					<label
						className="problem-create-label"
						htmlFor="problem-list-modal-inputFormat"
					>
						입력 형식
					</label>
					<textarea
						id="problem-list-modal-inputFormat"
						name="inputFormat"
						value={formData.inputFormat}
						onChange={handlers.handleInputChange}
						className="problem-create-textarea"
						rows={4}
						placeholder="입력 형식을 설명하세요"
					/>
				</div>

				<div className="problem-create-form-section">
					<label
						className="problem-create-label"
						htmlFor="problem-list-modal-outputFormat"
					>
						출력 형식
					</label>
					<textarea
						id="problem-list-modal-outputFormat"
						name="outputFormat"
						value={formData.outputFormat}
						onChange={handlers.handleInputChange}
						className="problem-create-textarea"
						rows={4}
						placeholder="출력 형식을 설명하세요"
					/>
				</div>
			</div>

			<SampleInputsSection formData={formData} handlers={handlers} />

			<TestcasesSection
				formData={formData}
				enableFullEdit
				parsedTestCases={parsedTestCases}
				showParsedTestCases={showParsedTestCases}
				setShowParsedTestCases={setShowParsedTestCases}
				handlers={handlers}
			/>
		</>
	);
}
