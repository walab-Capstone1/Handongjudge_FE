import type React from "react";
import * as S from "../styles";
import type { ProblemEditHookReturn } from "../hooks/useProblemEdit";

type ProblemEditSampleInputsSectionProps = Pick<
	ProblemEditHookReturn,
	| "formData"
	| "enableFullEdit"
	| "handleSampleInputChange"
	| "addSampleInput"
	| "removeSampleInput"
>;

const ProblemEditSampleInputsSection: React.FC<
	ProblemEditSampleInputsSectionProps
> = ({
	formData,
	enableFullEdit,
	handleSampleInputChange,
	addSampleInput,
	removeSampleInput,
}) => (
	<S.Fieldset aria-labelledby="problem-edit-sample-label">
		<S.Legend id="problem-edit-sample-label">예제 입출력</S.Legend>
		{!enableFullEdit ? (
			<div
				style={{
					padding: "12px",
					backgroundColor: "#f5f5f5",
					borderRadius: "4px",
					color: "#666",
				}}
			>
				{formData.sampleInputs?.some((s) => s.input || s.output)
					? formData.sampleInputs.map((sample, idx) => {
							if (!sample.input && !sample.output) return null;
							return (
								<div
									key={`preview-sample-${idx}-${sample.input ?? ""}-${sample.output ?? ""}`}
									style={{
										marginBottom: "16px",
									}}
								>
									<strong>예제 #{idx + 1}</strong>
									<div
										style={{
											marginTop: "8px",
										}}
									>
										<div>
											<strong>입력:</strong>
										</div>
										<pre
											style={{
												backgroundColor: "white",
												padding: "8px",
												borderRadius: "4px",
												marginTop: "4px",
											}}
										>
											{sample.input || "(없음)"}
										</pre>
										<div
											style={{
												marginTop: "8px",
											}}
										>
											<strong>출력:</strong>
										</div>
										<pre
											style={{
												backgroundColor: "white",
												padding: "8px",
												borderRadius: "4px",
												marginTop: "4px",
											}}
										>
											{sample.output || "(없음)"}
										</pre>
									</div>
								</div>
							);
						})
					: "(예제 입출력 없음)"}
			</div>
		) : (
			<>
				{formData.sampleInputs.map((sample, idx) => (
					<S.SampleItem
						key={`sample-${idx}-${sample.input?.slice(0, 10) ?? ""}-${sample.output?.slice(0, 10) ?? ""}`}
					>
						<S.SampleHeader>
							<span>예제 #{idx + 1}</span>
							{formData.sampleInputs.length > 1 && (
								<S.SampleRemove
									type="button"
									onClick={() => removeSampleInput(idx)}
								>
									삭제
								</S.SampleRemove>
							)}
						</S.SampleHeader>
						<S.SampleGrid>
							<div>
								<S.SampleLabel htmlFor={`problem-edit-sample-input-${idx}`}>
									입력
								</S.SampleLabel>
								<S.Textarea
									id={`problem-edit-sample-input-${idx}`}
									value={sample.input}
									onChange={(e) =>
										handleSampleInputChange(idx, "input", e.target.value)
									}
									rows={3}
									placeholder="예제 입력"
								/>
							</div>
							<div>
								<S.SampleLabel htmlFor={`problem-edit-sample-output-${idx}`}>
									출력
								</S.SampleLabel>
								<S.Textarea
									id={`problem-edit-sample-output-${idx}`}
									value={sample.output}
									onChange={(e) =>
										handleSampleInputChange(idx, "output", e.target.value)
									}
									rows={3}
									placeholder="예제 출력"
								/>
							</div>
						</S.SampleGrid>
					</S.SampleItem>
				))}
				<S.AddButton type="button" onClick={addSampleInput}>
					+ 예제 추가
				</S.AddButton>
			</>
		)}
	</S.Fieldset>
);

export default ProblemEditSampleInputsSection;
