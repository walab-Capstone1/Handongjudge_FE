import type {
	ProblemListFormData,
	ProblemListEditFormHandlers,
} from "../types";

export interface SampleInputsSectionProps {
	formData: ProblemListFormData;
	handlers: Pick<
		ProblemListEditFormHandlers,
		"handleSampleInputChange" | "addSampleInput" | "removeSampleInput"
	>;
}

/**
 * 편집 폼 - 예제 입출력 섹션
 */
export default function SampleInputsSection({
	formData,
	handlers,
}: SampleInputsSectionProps) {
	const { handleSampleInputChange, addSampleInput, removeSampleInput } =
		handlers;

	return (
		<fieldset className="problem-create-form-section">
			<legend className="problem-create-label">예제 입출력</legend>
			{formData.sampleInputs.map((sample, idx) => (
				<div
					key={`sample-${idx}-${sample.input.length}-${sample.output.length}`}
					className="problem-create-sample-item"
				>
					<div className="problem-create-sample-header">
						<span>예제 #{idx + 1}</span>
						{formData.sampleInputs.length > 1 && (
							<button
								type="button"
								onClick={() => removeSampleInput(idx)}
								className="problem-create-sample-remove"
							>
								삭제
							</button>
						)}
					</div>
					<div className="problem-create-sample-grid">
						<div>
							<label
								className="problem-create-sample-label"
								htmlFor={`problem-list-modal-sample-input-${idx}`}
							>
								입력
							</label>
							<textarea
								id={`problem-list-modal-sample-input-${idx}`}
								value={sample.input}
								onChange={(e) =>
									handleSampleInputChange(idx, "input", e.target.value)
								}
								className="problem-create-textarea"
								rows={3}
								placeholder="예제 입력"
							/>
						</div>
						<div>
							<label
								className="problem-create-sample-label"
								htmlFor={`problem-list-modal-sample-output-${idx}`}
							>
								출력
							</label>
							<textarea
								id={`problem-list-modal-sample-output-${idx}`}
								value={sample.output}
								onChange={(e) =>
									handleSampleInputChange(idx, "output", e.target.value)
								}
								className="problem-create-textarea"
								rows={3}
								placeholder="예제 출력"
							/>
						</div>
					</div>
				</div>
			))}
			<button
				type="button"
				onClick={addSampleInput}
				className="problem-create-add-btn"
			>
				+ 예제 추가
			</button>
		</fieldset>
	);
}
