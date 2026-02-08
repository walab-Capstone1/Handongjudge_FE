import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaPalette, FaHighlighter } from "react-icons/fa";
import TutorLayout from "../../../layouts/TutorLayout";
import APIService from "../../../services/APIService";
import ProblemPreview from "./ProblemPreview";
import * as S from "./styles";
import type {
	ProblemFormData,
	ParsedTestcase,
	SampleInput,
	TestcaseItem,
} from "./types";

const initialFormData: ProblemFormData = {
	title: "",
	description: "",
	descriptionText: "",
	inputFormat: "",
	outputFormat: "",
	tags: [],
	difficulty: "1",
	timeLimit: "",
	memoryLimit: "",
	sampleInputs: [{ input: "", output: "" }],
	testcases: [],
};

function parseTags(source: unknown): string[] {
	if (!source) return [];
	if (Array.isArray(source)) {
		return source.map((t) => t && String(t).trim()).filter(Boolean);
	}
	if (typeof source === "string") {
		try {
			const parsed = JSON.parse(source);
			if (Array.isArray(parsed)) {
				return parsed
					.map((t: unknown) => t && String(t).trim())
					.filter(Boolean);
			}
			if (parsed && String(parsed).trim()) return [String(parsed).trim()];
		} catch {
			if (source.trim()) return [source.trim()];
		}
	}
	return [];
}

function extractTextFromRTF(rtfContent: string): string {
	if (rtfContent.trim().startsWith("{\\rtf")) {
		return rtfContent
			.replace(/\\[a-z]+\d*\s?/gi, "")
			.replace(/\{[^}]*\}/g, "")
			.replace(/\\[{}]/g, "")
			.trim()
			.replace(/\s+/g, " ")
			.trim();
	}
	return rtfContent;
}

type ProblemEditLocationState = {
	fromAssignmentProblemList?: boolean;
	sectionId?: string;
	assignmentId?: number;
} | null;

const ProblemEdit: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { problemId } = useParams<{ problemId: string }>();
	const locationState = location.state as ProblemEditLocationState;

	const getBackNavigation = () => {
		if (
			locationState?.fromAssignmentProblemList &&
			locationState?.sectionId != null &&
			locationState?.assignmentId != null
		) {
			return {
				path: `/tutor/assignments/section/${locationState.sectionId}`,
				state: { openProblemListForAssignmentId: locationState.assignmentId },
			};
		}
		return { path: "/tutor/problems", state: undefined };
	};
	const [zipFile, setZipFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const descriptionRef = useRef<HTMLDivElement>(null);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [formData, setFormData] = useState<ProblemFormData>(initialFormData);
	const [currentTag, setCurrentTag] = useState("");
	const [originalTimeLimit, setOriginalTimeLimit] = useState("");
	const [originalMemoryLimit, setOriginalMemoryLimit] = useState("");
	const [enableFullEdit, setEnableFullEdit] = useState(false);
	const [parsedTestCases, setParsedTestCases] = useState<ParsedTestcase[]>([]);
	const [showParsedTestCases, setShowParsedTestCases] = useState(false);

	useEffect(() => {
		if (problemId) fetchProblem();
	}, [problemId]);

	useEffect(() => {
		if (
			descriptionRef.current &&
			formData.description &&
			isInitialLoad &&
			!loading
		) {
			const isHTML = /<[^>]+>/.test(formData.description);
			if (isHTML) {
				descriptionRef.current.innerHTML = formData.description;
			} else {
				descriptionRef.current.textContent =
					formData.descriptionText || formData.description;
			}
			setIsInitialLoad(false);
		}
	}, [formData.description, formData.descriptionText, loading, isInitialLoad]);

	useEffect(() => {
		if (enableFullEdit && descriptionRef.current && formData.description) {
			const isHTML = /<[^>]+>/.test(formData.description);
			if (isHTML) {
				descriptionRef.current.innerHTML = formData.description;
			} else {
				descriptionRef.current.textContent =
					formData.descriptionText || formData.description;
			}
		}
	}, [enableFullEdit, formData.description, formData.descriptionText]);

	const fetchProblem = async () => {
		if (!problemId) return;
		try {
			setLoading(true);
			setIsInitialLoad(true);
			const response = await APIService.getProblemInfo(problemId);
			const problem = response?.data ?? response;

			let parsedData: {
				description?: string;
				title?: string;
				timeLimit?: number;
				memoryLimit?: number;
				tags?: string | string[];
				difficulty?: string | number;
				testCases?: ParsedTestcase[];
				testcases?: ParsedTestcase[];
			} | null = null;
			try {
				parsedData = await APIService.parseProblemZip(problemId);
			} catch (err) {
				console.warn("ZIP 파싱 실패 (계속 진행):", err);
			}

			const description = parsedData?.description ?? problem?.description ?? "";
			const descriptionText =
				description.replace(/<[^>]*>/g, "") || description;

			let timeLimit = "";
			if (parsedData?.timeLimit != null) {
				timeLimit = String(parsedData.timeLimit);
			} else if (
				problem?.timeLimit != null &&
				problem?.timeLimit !== undefined
			) {
				const v = Number(problem.timeLimit);
				if (!Number.isNaN(v) && v > 0) timeLimit = String(v);
			}

			let memoryLimit = "";
			if (parsedData?.memoryLimit != null) {
				memoryLimit = String(parsedData.memoryLimit);
			} else if (
				problem?.memoryLimit != null &&
				problem?.memoryLimit !== undefined
			) {
				const v = Number(problem.memoryLimit);
				if (!Number.isNaN(v) && v > 0) memoryLimit = String(v);
			}

			setOriginalTimeLimit(timeLimit);
			setOriginalMemoryLimit(memoryLimit);

			const tags = parsedData?.tags
				? parseTags(parsedData.tags)
				: parseTags(problem?.tags);

			const testCases = parsedData?.testCases ?? parsedData?.testcases ?? [];
			setParsedTestCases(testCases);

			let sampleInputs: SampleInput[] = [{ input: "", output: "" }];
			if (testCases.length > 0) {
				const samples = testCases.filter((tc) => tc.type === "sample");
				if (samples.length > 0) {
					sampleInputs = samples.map((tc) => ({
						input: tc.input ?? "",
						output: tc.output ?? "",
					}));
				}
			}

			setFormData({
				title: parsedData?.title ?? problem?.title ?? "",
				description,
				descriptionText,
				inputFormat: "",
				outputFormat: "",
				tags,
				difficulty:
					parsedData?.difficulty != null
						? String(parsedData.difficulty)
						: problem?.difficulty != null
							? String(problem.difficulty)
							: "1",
				timeLimit,
				memoryLimit,
				sampleInputs,
				testcases: [],
			});
			setEnableFullEdit(false);

			setTimeout(() => {
				if (descriptionRef.current) {
					const isHTML = /<[^>]+>/.test(description);
					if (isHTML) {
						descriptionRef.current.innerHTML = description;
					} else {
						descriptionRef.current.textContent = descriptionText;
					}
					setIsInitialLoad(false);
				}
			}, 200);
		} catch (err) {
			console.error("문제 조회 실패:", err);
			setError("문제를 불러오는 중 오류가 발생했습니다.");
		} finally {
			setLoading(false);
		}
	};

	const handleZipFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.name.endsWith(".zip")) {
			setError("ZIP 파일만 업로드 가능합니다.");
			return;
		}
		setZipFile(file);
		setError(null);
		try {
			const fd = new FormData();
			fd.append("zipFile", file);
			const parsedData = await APIService.parseZipFile(fd);
			if (parsedData) {
				if (parsedData.title) {
					setFormData((prev) => ({ ...prev, title: parsedData.title }));
				}
				if (
					parsedData.timeLimit != null &&
					parsedData.timeLimit !== undefined
				) {
					const tl = String(parsedData.timeLimit);
					setFormData((prev) => ({ ...prev, timeLimit: tl }));
					setOriginalTimeLimit(tl);
				}
				if (
					parsedData.memoryLimit != null &&
					parsedData.memoryLimit !== undefined
				) {
					const ml = String(parsedData.memoryLimit);
					setFormData((prev) => ({ ...prev, memoryLimit: ml }));
					setOriginalMemoryLimit(ml);
				}
				if (parsedData.description) {
					const htmlDesc = parsedData.description
						.replace(/\n/g, "<br>")
						.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
						.replace(/\*(.*?)\*/g, "<em>$1</em>");
					const descText = parsedData.description.replace(/<[^>]*>/g, "");
					setFormData((prev) => ({
						...prev,
						description: htmlDesc,
						descriptionText: descText,
					}));
					if (enableFullEdit && descriptionRef.current) {
						descriptionRef.current.innerHTML = htmlDesc;
					}
				}
				const testCases = parsedData.testCases ?? parsedData.testcases ?? [];
				if (testCases.length > 0) {
					const sampleTestCases = testCases.filter(
						(tc: ParsedTestcase) => tc.type === "sample",
					);
					if (sampleTestCases.length > 0) {
						setFormData((prev) => ({
							...prev,
							sampleInputs: sampleTestCases.map((tc: ParsedTestcase) => ({
								input: tc.input ?? "",
								output: tc.output ?? "",
							})),
						}));
					}
				}
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "알 수 없는 오류";
			setError(`ZIP 파일 파싱 중 오류가 발생했습니다: ${message}`);
		}
		e.target.value = "";
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleTagAdd = () => {
		const tag = currentTag.trim();
		if (tag && !formData.tags.includes(tag)) {
			setFormData((prev) => ({
				...prev,
				tags: [...prev.tags, tag],
			}));
			setCurrentTag("");
		}
	};

	const handleTagKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleTagAdd();
		}
	};

	const handleTagRemove = (tagToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((t) => t !== tagToRemove),
		}));
	};

	const handleSampleInputChange = (
		index: number,
		field: "input" | "output",
		value: string,
	) => {
		const newSamples = [...formData.sampleInputs];
		if (newSamples[index])
			newSamples[index] = { ...newSamples[index], [field]: value };
		setFormData((prev) => ({ ...prev, sampleInputs: newSamples }));
	};

	const addSampleInput = () => {
		setFormData((prev) => ({
			...prev,
			sampleInputs: [...prev.sampleInputs, { input: "", output: "" }],
		}));
	};

	const removeSampleInput = (index: number) => {
		if (formData.sampleInputs.length > 1) {
			setFormData((prev) => ({
				...prev,
				sampleInputs: prev.sampleInputs.filter((_, i) => i !== index),
			}));
		}
	};

	const handleTestcaseAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		const existingNames = new Set<string>();
		for (const tc of formData.testcases) {
			if (tc.name) existingNames.add(tc.name);
		}
		for (const tc of parsedTestCases) {
			if (tc.name) existingNames.add(tc.name);
		}

		const fileMap = new Map<
			string,
			{ inputFile: File | null; outputFile: File | null }
		>();
		for (const file of files) {
			const fileName = file.name;
			const baseName = fileName.replace(/\.(in|ans|out)$/i, "");
			const isInput = fileName.toLowerCase().endsWith(".in");
			const isOutput =
				fileName.toLowerCase().endsWith(".ans") ||
				fileName.toLowerCase().endsWith(".out");
			if (!isInput && !isOutput) continue;
			if (!fileMap.has(baseName)) {
				fileMap.set(baseName, { inputFile: null, outputFile: null });
			}
			const pair = fileMap.get(baseName);
			if (pair) {
				if (isInput) pair.inputFile = file;
				else if (isOutput) pair.outputFile = file;
			}
		}

		const newTestCases: TestcaseItem[] = [];
		for (const [baseName, pair] of fileMap.entries()) {
			if (existingNames.has(baseName)) {
				alert(
					`파일명 "${baseName}"이(가) 이미 존재합니다. 다른 이름을 사용해주세요.`,
				);
				continue;
			}
			let inputContent = "";
			let outputContent = "";
			try {
				if (pair.inputFile) {
					inputContent = extractTextFromRTF(await pair.inputFile.text());
				}
				if (pair.outputFile) {
					outputContent = extractTextFromRTF(await pair.outputFile.text());
				}
			} catch (err) {
				console.error("파일 읽기 실패:", err);
			}
			if (inputContent || outputContent) {
				newTestCases.push({
					file: pair.inputFile ?? pair.outputFile ?? undefined,
					name: baseName,
					input: inputContent,
					output: outputContent,
					type: "secret",
					isNew: true,
				});
				existingNames.add(baseName);
			}
		}
		setFormData((prev) => ({
			...prev,
			testcases: [...prev.testcases, ...newTestCases],
		}));
		e.target.value = "";
	};

	const handleTestcaseRemove = (index: number) => {
		setFormData((prev) => ({
			...prev,
			testcases: prev.testcases.filter((_, i) => i !== index),
		}));
	};

	const handleTestcaseChange = (
		index: number,
		field: keyof TestcaseItem,
		value: string,
	) => {
		setFormData((prev) => {
			const newTestcases = [...prev.testcases];
			if (newTestcases[index]) {
				newTestcases[index] = {
					...newTestcases[index],
					[field]: value,
				};
			}
			return { ...prev, testcases: newTestcases };
		});
	};

	const validateTestCases = (): { name: string; missing: string }[] => {
		const all: (ParsedTestcase | TestcaseItem)[] = [
			...formData.testcases,
			...parsedTestCases,
		];
		const incomplete: { name: string; missing: string }[] = [];
		all.forEach((tc, idx) => {
			const hasInput = !!tc.input?.trim();
			const hasOutput = !!tc.output?.trim();
			if (!hasInput || !hasOutput) {
				incomplete.push({
					name: tc.name ?? `테스트케이스 ${idx + 1}`,
					missing: !hasInput ? "입력" : "출력",
				});
			}
		});
		return incomplete;
	};

	const getFullDescription = () => ({
		title: formData.title,
		description: formData.description ?? "",
		inputFormat: formData.inputFormat,
		outputFormat: formData.outputFormat,
		sampleInputs: formData.sampleInputs,
	});

	const getFullDescriptionForBackend = (): string => {
		let full = formData.descriptionText ?? "";
		if (formData.inputFormat) {
			full += `\n\n## 입력 형식\n${formData.inputFormat}`;
		}
		if (formData.outputFormat) {
			full += `\n\n## 출력 형식\n${formData.outputFormat}`;
		}
		if (formData.sampleInputs.some((s) => s.input || s.output)) {
			full += "\n\n## 예제";
			formData.sampleInputs.forEach((sample, idx) => {
				if (sample.input || sample.output) {
					full += `\n\n### 예제 입력 ${idx + 1}\n\`\`\`\n${sample.input}\n\`\`\``;
					full += `\n\n### 예제 출력 ${idx + 1}\n\`\`\`\n${sample.output}\n\`\`\``;
				}
			});
		}
		return full;
	};

	const applyFormat = (command: string, value?: string | null) => {
		if (descriptionRef.current) {
			descriptionRef.current.focus();
			document.execCommand(command, false, value ?? undefined);
		}
	};

	const insertTextAtCursor = (text: string) => {
		if (descriptionRef.current) {
			descriptionRef.current.focus();
			document.execCommand("insertText", false, text);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!problemId) return;
		setSubmitting(true);
		setError(null);
		try {
			if (enableFullEdit) {
				const incomplete = validateTestCases();
				if (incomplete.length > 0) {
					const message = incomplete
						.map((tc) => `- ${tc.name}: ${tc.missing} 파일이 없습니다`)
						.join("\n");
					if (
						!window.confirm(
							`다음 테스트케이스에 입력/출력 쌍이 완성되지 않았습니다:\n\n${message}\n\n그래도 제출하시겠습니까?`,
						)
					) {
						setSubmitting(false);
						return;
					}
				}
			}

			const submitFormData = new FormData();
			submitFormData.append("title", formData.title);
			submitFormData.append("tags", JSON.stringify(formData.tags));
			submitFormData.append("difficulty", formData.difficulty);
			submitFormData.append(
				"metadataUpdated",
				enableFullEdit ? "false" : "true",
			);

			if (enableFullEdit) {
				submitFormData.append("description", getFullDescriptionForBackend());
				submitFormData.append("inputFormat", formData.inputFormat);
				submitFormData.append("outputFormat", formData.outputFormat);
				const timeLimit = formData.timeLimit || originalTimeLimit || "1";
				const memoryLimit =
					formData.memoryLimit || originalMemoryLimit || "256";
				submitFormData.append("timeLimit", timeLimit);
				submitFormData.append("memoryLimit", memoryLimit);
				submitFormData.append(
					"sampleInputs",
					JSON.stringify(formData.sampleInputs),
				);

				let testcaseIndex = 0;
				for (const testcase of parsedTestCases) {
					const baseName = testcase.name ?? `testcase_${testcaseIndex}`;
					if (testcase.input) {
						const inputBlob = new Blob([testcase.input], {
							type: "text/plain",
						});
						submitFormData.append(
							`testcase_${testcaseIndex}`,
							new File([inputBlob], `${baseName}.in`, {
								type: "text/plain",
							}),
						);
						testcaseIndex++;
					}
					if (testcase.output) {
						const outputBlob = new Blob([testcase.output], {
							type: "text/plain",
						});
						submitFormData.append(
							`testcase_${testcaseIndex}`,
							new File([outputBlob], `${baseName}.ans`, {
								type: "text/plain",
							}),
						);
						testcaseIndex++;
					}
				}
				for (const testcase of formData.testcases) {
					const baseName = testcase.name ?? `testcase_${testcaseIndex}`;
					if (testcase.input) {
						const inputBlob = new Blob([testcase.input], {
							type: "text/plain",
						});
						submitFormData.append(
							`testcase_${testcaseIndex}`,
							new File([inputBlob], `${baseName}.in`, {
								type: "text/plain",
							}),
						);
						testcaseIndex++;
					}
					if (testcase.output) {
						const outputBlob = new Blob([testcase.output], {
							type: "text/plain",
						});
						submitFormData.append(
							`testcase_${testcaseIndex}`,
							new File([outputBlob], `${baseName}.ans`, {
								type: "text/plain",
							}),
						);
						testcaseIndex++;
					}
				}
			}

			await APIService.updateProblem(problemId, submitFormData);
			alert("문제가 성공적으로 수정되었습니다.");
			const back = getBackNavigation();
			navigate(back.path, { state: back.state });
		} catch (err) {
			console.error("문제 수정 실패:", err);
			setError("문제 수정 중 오류가 발생했습니다.");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<TutorLayout>
				<S.ProblemEditGlobalStyle />
				<S.Container className="problem-edit">
					<S.LoadingContainer>
						<S.LoadingSpinner />
					</S.LoadingContainer>
				</S.Container>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout>
			<S.ProblemEditGlobalStyle />
			<S.Container className="problem-edit">
				<S.PageHeader>
					<S.PageTitle>문제 수정</S.PageTitle>
					<S.BackButton
						type="button"
						onClick={() => {
							const back = getBackNavigation();
							navigate(back.path, { state: back.state });
						}}
						title="뒤로가기"
					>
						← 뒤로가기
					</S.BackButton>
				</S.PageHeader>

				{error && <S.ErrorMessage>{error}</S.ErrorMessage>}

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
							<strong style={{ color: "#856404" }}>
								⚠️ 메타데이터 수정 모드
							</strong>
							<p
								style={{
									margin: "8px 0 0 0",
									color: "#856404",
									fontSize: "14px",
								}}
							>
								현재 제목, 난이도, 태그만 수정 가능합니다. 다른 필드를
								수정하려면 &apos;문제 변환&apos; 버튼을 클릭하세요.
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
						<strong style={{ color: "#0c5460" }}>
							⚠️ 문제 변환 모드 활성화
						</strong>
						<p
							style={{
								margin: "8px 0 0 0",
								color: "#0c5460",
								fontSize: "14px",
							}}
						>
							모든 필드를 수정할 수 있습니다. 변경사항은 Domjudge까지 변환하는
							전체 업데이트를 수행하며, 새로운 문제로 취급됩니다.
						</p>
					</div>
				)}

				<S.Form onSubmit={handleSubmit}>
					<S.Step>
						<S.FormGrid>
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
												<S.TagRemove
													type="button"
													onClick={() => handleTagRemove(tag)}
												>
													×
												</S.TagRemove>
											</S.Tag>
										))}
									</S.Tags>
								</S.FormSection>
							</S.FormRow>

							<S.FormRow>
								<S.FormSection>
									<S.Label htmlFor="problem-edit-timeLimit">
										시간 제한 (초)
									</S.Label>
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
									<S.Label htmlFor="problem-edit-memoryLimit">
										메모리 제한 (MB)
									</S.Label>
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

							{/* 문제 설명 */}
							<S.DescriptionSection>
								<S.Label htmlFor="problem-edit-description">
									문제 설명 {enableFullEdit ? "*" : ""}
								</S.Label>
								{!enableFullEdit && (
									<S.DescriptionEditor>
										<S.EditorWrapper
											id="problem-edit-description"
											style={{ background: "#f5f5f5" }}
										>
											<div
												style={{
													padding: "12px",
													minHeight: "300px",
													whiteSpace: "pre-wrap",
													color: "#666",
													overflow: "auto",
												}}
											>
												{formData.descriptionText ||
													formData.description ||
													"(문제 설명 없음)"}
											</div>
										</S.EditorWrapper>
										<S.Preview>
											<S.PreviewHeader>미리보기</S.PreviewHeader>
											<S.PreviewContent>
												<ProblemPreview {...getFullDescription()} />
											</S.PreviewContent>
										</S.Preview>
									</S.DescriptionEditor>
								)}
								{enableFullEdit && (
									<S.DescriptionEditor>
										<S.EditorWrapper>
											<S.EditorToolbar>
												<button
													type="button"
													onClick={() => applyFormat("bold")}
													title="Bold"
												>
													<strong>B</strong>
												</button>
												<button
													type="button"
													onClick={() => applyFormat("italic")}
													title="Italic"
												>
													<em>I</em>
												</button>
												<button
													type="button"
													onClick={() => applyFormat("underline")}
													title="Underline"
												>
													<u>U</u>
												</button>
												<S.ToolbarDivider />
												<button
													type="button"
													onClick={() => applyFormat("insertUnorderedList")}
													title="Bullet List"
												>
													•
												</button>
												<button
													type="button"
													onClick={() => applyFormat("insertOrderedList")}
													title="Numbered List"
												>
													1.
												</button>
												<S.ToolbarDivider />
												<button
													type="button"
													onClick={() =>
														applyFormat("formatBlock", "blockquote")
													}
													title="Quote"
												>
													&quot;
												</button>
												<button
													type="button"
													onClick={() => insertTextAtCursor("```\n코드\n```")}
													title="Code Block"
												>
													&lt;&gt;
												</button>
												<S.ToolbarDivider />
												<S.ColorWrapper>
													<S.ColorLabel
														htmlFor="textColorPicker"
														title="텍스트 색상"
													>
														<FaPalette />
													</S.ColorLabel>
													<S.ColorPicker
														type="color"
														id="textColorPicker"
														onChange={(e) =>
															applyFormat("foreColor", e.target.value)
														}
													/>
												</S.ColorWrapper>
												<S.ColorWrapper>
													<S.ColorLabel
														htmlFor="bgColorPicker"
														title="배경 색상"
													>
														<FaHighlighter />
													</S.ColorLabel>
													<S.ColorPicker
														type="color"
														id="bgColorPicker"
														onChange={(e) =>
															applyFormat("backColor", e.target.value)
														}
													/>
												</S.ColorWrapper>
											</S.EditorToolbar>
											<S.TextEditor
												ref={descriptionRef}
												id="problem-edit-description"
												contentEditable
												role="textbox"
												tabIndex={0}
												data-placeholder="문제 설명을 입력하세요"
												onPaste={(e) => {
													e.preventDefault();
													const paste = (
														e.clipboardData ||
														(
															window as unknown as {
																clipboardData?: DataTransfer;
															}
														).clipboardData
													)?.getData("text");
													const selection = window.getSelection();
													if (!selection?.rangeCount) return;
													const range = selection.getRangeAt(0);
													range.deleteContents();
													const textNode = document.createTextNode(paste ?? "");
													range.insertNode(textNode);
													range.collapse(false);
													const htmlContent =
														descriptionRef.current?.innerHTML ?? "";
													const textContent =
														descriptionRef.current?.textContent ??
														descriptionRef.current?.innerText ??
														"";
													setFormData((prev) => ({
														...prev,
														description: htmlContent,
														descriptionText: textContent,
													}));
												}}
												onInput={() => {
													const htmlContent =
														descriptionRef.current?.innerHTML ?? "";
													const textContent =
														descriptionRef.current?.textContent ??
														descriptionRef.current?.innerText ??
														"";
													setFormData((prev) => ({
														...prev,
														description: htmlContent,
														descriptionText: textContent,
													}));
												}}
												onBlur={() => {
													const htmlContent =
														descriptionRef.current?.innerHTML ?? "";
													const textContent =
														descriptionRef.current?.textContent ??
														descriptionRef.current?.innerText ??
														"";
													setFormData((prev) => ({
														...prev,
														description: htmlContent,
														descriptionText: textContent,
													}));
												}}
												onKeyDown={(e) => {
													if (
														(e.ctrlKey || e.metaKey) &&
														e.key === "z" &&
														!e.shiftKey
													) {
														e.preventDefault();
														document.execCommand("undo", false);
													}
													if (
														(e.ctrlKey || e.metaKey) &&
														e.key === "z" &&
														e.shiftKey
													) {
														e.preventDefault();
														document.execCommand("redo", false);
													}
													if ((e.ctrlKey || e.metaKey) && e.key === "y") {
														e.preventDefault();
														document.execCommand("redo", false);
													}
												}}
												suppressContentEditableWarning
											/>
										</S.EditorWrapper>
										<S.Preview>
											<S.PreviewHeader>미리보기</S.PreviewHeader>
											<S.PreviewContent>
												<ProblemPreview {...getFullDescription()} />
											</S.PreviewContent>
										</S.Preview>
									</S.DescriptionEditor>
								)}
							</S.DescriptionSection>

							{/* 입력/출력 형식 */}
							<S.FormRow>
								<S.FormSection>
									<S.Label htmlFor="problem-edit-inputFormat">
										입력 형식
									</S.Label>
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
									<S.Label htmlFor="problem-edit-outputFormat">
										출력 형식
									</S.Label>
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

							{/* 예제 입출력 */}
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
														<S.SampleLabel
															htmlFor={`problem-edit-sample-input-${idx}`}
														>
															입력
														</S.SampleLabel>
														<S.Textarea
															id={`problem-edit-sample-input-${idx}`}
															value={sample.input}
															onChange={(e) =>
																handleSampleInputChange(
																	idx,
																	"input",
																	e.target.value,
																)
															}
															rows={3}
															placeholder="예제 입력"
														/>
													</div>
													<div>
														<S.SampleLabel
															htmlFor={`problem-edit-sample-output-${idx}`}
														>
															출력
														</S.SampleLabel>
														<S.Textarea
															id={`problem-edit-sample-output-${idx}`}
															value={sample.output}
															onChange={(e) =>
																handleSampleInputChange(
																	idx,
																	"output",
																	e.target.value,
																)
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

							{/* 테스트케이스 */}
							{enableFullEdit && (
								<S.Fieldset aria-labelledby="problem-edit-testcase-label">
									<S.Legend id="problem-edit-testcase-label">
										테스트케이스 파일
									</S.Legend>
									<S.FileUploadWrapper>
										<S.FileInput
											type="file"
											id="testcaseInput"
											multiple
											accept=".in,.ans"
											onChange={handleTestcaseAdd}
										/>
										<S.FileLabelInline htmlFor="testcaseInput">
											추가
										</S.FileLabelInline>
										<S.HelpText
											style={{
												display: "block",
												marginTop: "4px",
												fontSize: "12px",
												color: "#666",
											}}
										>
											테스트케이스 입력(.in) 및 출력(.ans) 파일 (예: 01.in,
											01.ans)
										</S.HelpText>
									</S.FileUploadWrapper>
									{formData.testcases.length > 0 && (
										<S.TestcaseList>
											{formData.testcases.map((testcase, idx) => (
												<S.TestcaseItemCompact
													key={testcase.name ?? `testcase-new-${idx}`}
												>
													<S.TestcaseHeaderCompact>
														<S.TestcaseHeaderLeft>
															<S.TestcaseName>
																{testcase.name ?? `테스트케이스 ${idx + 1}`}
															</S.TestcaseName>
															<S.TestcaseTypeSelect
																value={testcase.type ?? "secret"}
																onChange={(e) =>
																	handleTestcaseChange(
																		idx,
																		"type",
																		e.target.value,
																	)
																}
															>
																<option value="sample">샘플</option>
																<option value="secret">비밀</option>
															</S.TestcaseTypeSelect>
															<S.TestcaseTypeBadge>
																{testcase.type === "sample" ? "샘플" : "비밀"}
															</S.TestcaseTypeBadge>
														</S.TestcaseHeaderLeft>
														<S.TestcaseRemoveBtn
															type="button"
															onClick={() => handleTestcaseRemove(idx)}
														>
															삭제
														</S.TestcaseRemoveBtn>
													</S.TestcaseHeaderCompact>
													<S.TestcaseBodyCompact>
														{testcase.input && (
															<S.TestcaseContentItem>
																<S.TestcaseContentLabel>
																	입력
																</S.TestcaseContentLabel>
																<S.TestcaseContentText>
																	{testcase.input}
																</S.TestcaseContentText>
															</S.TestcaseContentItem>
														)}
														{testcase.output && (
															<S.TestcaseContentItem>
																<S.TestcaseContentLabel>
																	출력
																</S.TestcaseContentLabel>
																<S.TestcaseContentText>
																	{testcase.output}
																</S.TestcaseContentText>
															</S.TestcaseContentItem>
														)}
													</S.TestcaseBodyCompact>
												</S.TestcaseItemCompact>
											))}
										</S.TestcaseList>
									)}
									{parsedTestCases.length > 0 && (
										<S.ParsedSection style={{ marginTop: "16px" }}>
											<S.ParsedToggle
												type="button"
												onClick={() =>
													setShowParsedTestCases(!showParsedTestCases)
												}
											>
												<span>{showParsedTestCases ? "▼" : "▶"}</span>
												<span>
													기존 테스트케이스 ({parsedTestCases.length}
													개) - 조회 전용
												</span>
											</S.ParsedToggle>
											{showParsedTestCases && (
												<S.ParsedList>
													{parsedTestCases.map((testCase, idx) => (
														<S.TestcaseItemCompact
															key={testCase.name ?? `parsed-tc-${idx}`}
														>
															<S.TestcaseHeaderCompact>
																<S.TestcaseHeaderLeft>
																	<S.TestcaseName>
																		{testCase.name ?? `테스트케이스 ${idx + 1}`}
																	</S.TestcaseName>
																	<S.TestcaseTypeBadge>
																		{testCase.type === "sample"
																			? "샘플"
																			: "비밀"}
																	</S.TestcaseTypeBadge>
																</S.TestcaseHeaderLeft>
															</S.TestcaseHeaderCompact>
															<S.TestcaseBodyCompact>
																{testCase.input && (
																	<S.TestcaseContentItem>
																		<S.TestcaseContentLabel>
																			입력
																		</S.TestcaseContentLabel>
																		<S.TestcaseContentText>
																			{testCase.input}
																		</S.TestcaseContentText>
																	</S.TestcaseContentItem>
																)}
																{testCase.output && (
																	<S.TestcaseContentItem>
																		<S.TestcaseContentLabel>
																			출력
																		</S.TestcaseContentLabel>
																		<S.TestcaseContentText>
																			{testCase.output}
																		</S.TestcaseContentText>
																	</S.TestcaseContentItem>
																)}
															</S.TestcaseBodyCompact>
														</S.TestcaseItemCompact>
													))}
												</S.ParsedList>
											)}
										</S.ParsedSection>
									)}
								</S.Fieldset>
							)}

							{!enableFullEdit && parsedTestCases.length > 0 && (
								<S.Fieldset aria-labelledby="problem-edit-parsed-label">
									<S.Legend id="problem-edit-parsed-label">
										테스트케이스 조회
									</S.Legend>
									<S.ParsedSection style={{ marginTop: "8px" }}>
										<S.ParsedToggle
											type="button"
											onClick={() =>
												setShowParsedTestCases(!showParsedTestCases)
											}
										>
											<span>{showParsedTestCases ? "▼" : "▶"}</span>
											<span>
												테스트케이스 ({parsedTestCases.length}개) - 조회 전용
											</span>
										</S.ParsedToggle>
										{showParsedTestCases && (
											<S.ParsedList>
												{parsedTestCases.map((testCase, idx) => (
													<S.TestcaseItemCompact
														key={testCase.name ?? `parsed-view-${idx}`}
													>
														<S.TestcaseHeaderCompact>
															<S.TestcaseHeaderLeft>
																<S.TestcaseName>
																	{testCase.name ?? `테스트케이스 ${idx + 1}`}
																</S.TestcaseName>
																<S.TestcaseTypeBadge>
																	{testCase.type === "sample" ? "샘플" : "비밀"}
																</S.TestcaseTypeBadge>
															</S.TestcaseHeaderLeft>
														</S.TestcaseHeaderCompact>
														<S.TestcaseBodyCompact>
															{testCase.input && (
																<S.TestcaseContentItem>
																	<S.TestcaseContentLabel>
																		입력
																	</S.TestcaseContentLabel>
																	<S.TestcaseContentText>
																		{testCase.input}
																	</S.TestcaseContentText>
																</S.TestcaseContentItem>
															)}
															{testCase.output && (
																<S.TestcaseContentItem>
																	<S.TestcaseContentLabel>
																		출력
																	</S.TestcaseContentLabel>
																	<S.TestcaseContentText>
																		{testCase.output}
																	</S.TestcaseContentText>
																</S.TestcaseContentItem>
															)}
														</S.TestcaseBodyCompact>
													</S.TestcaseItemCompact>
												))}
											</S.ParsedList>
										)}
									</S.ParsedSection>
								</S.Fieldset>
							)}
						</S.FormGrid>

						<S.Actions>
							<S.BackButton
								type="button"
								onClick={() => {
									const back = getBackNavigation();
									navigate(back.path, { state: back.state });
								}}
								disabled={submitting}
								title="뒤로가기"
							>
								← 뒤로가기
							</S.BackButton>
							<S.SubmitButton type="submit" disabled={submitting}>
								{submitting ? "수정 중..." : "수정 완료"}
							</S.SubmitButton>
						</S.Actions>
					</S.Step>
				</S.Form>
			</S.Container>
		</TutorLayout>
	);
};

export default ProblemEdit;
