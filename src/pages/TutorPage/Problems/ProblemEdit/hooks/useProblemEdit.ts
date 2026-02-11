import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import { parseTags, extractTextFromRTF } from "../utils/problemEditUtils";
import type {
	ProblemFormData,
	ParsedTestcase,
	SampleInput,
	TestcaseItem,
} from "../types";

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

export type ProblemEditLocationState = {
	fromAssignmentProblemList?: boolean;
	sectionId?: string;
	assignmentId?: number;
} | null;

export function useProblemEdit() {
	const navigate = useNavigate();
	const location = useLocation();
	const { problemId } = useParams<{ problemId: string }>();
	const locationState = location.state as ProblemEditLocationState;

	const getBackNavigation = useCallback(() => {
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
	}, [locationState]);

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

	const fetchProblem = useCallback(async () => {
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
	}, [problemId]);

	useEffect(() => {
		if (problemId) fetchProblem();
	}, [problemId, fetchProblem]);

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

	const handleZipFileChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
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
		},
		[enableFullEdit],
	);

	const handleInputChange = useCallback(
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
			>,
		) => {
			const { name, value } = e.target;
			setFormData((prev) => ({ ...prev, [name]: value }));
		},
		[],
	);

	const handleTagAdd = useCallback(() => {
		const tag = currentTag.trim();
		if (tag && !formData.tags.includes(tag)) {
			setFormData((prev) => ({
				...prev,
				tags: [...prev.tags, tag],
			}));
			setCurrentTag("");
		}
	}, [currentTag, formData.tags]);

	const handleTagKeyPress = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				handleTagAdd();
			}
		},
		[handleTagAdd],
	);

	const handleTagRemove = useCallback((tagToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((t) => t !== tagToRemove),
		}));
	}, []);

	const handleSampleInputChange = useCallback(
		(index: number, field: "input" | "output", value: string) => {
			const newSamples = [...formData.sampleInputs];
			if (newSamples[index])
				newSamples[index] = { ...newSamples[index], [field]: value };
			setFormData((prev) => ({ ...prev, sampleInputs: newSamples }));
		},
		[formData.sampleInputs],
	);

	const addSampleInput = useCallback(() => {
		setFormData((prev) => ({
			...prev,
			sampleInputs: [...prev.sampleInputs, { input: "", output: "" }],
		}));
	}, []);

	const removeSampleInput = useCallback(
		(index: number) => {
			if (formData.sampleInputs.length > 1) {
				setFormData((prev) => ({
					...prev,
					sampleInputs: prev.sampleInputs.filter((_, i) => i !== index),
				}));
			}
		},
		[formData.sampleInputs.length],
	);

	const handleTestcaseAdd = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
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
		},
		[formData.testcases, parsedTestCases],
	);

	const handleTestcaseRemove = useCallback((index: number) => {
		setFormData((prev) => ({
			...prev,
			testcases: prev.testcases.filter((_, i) => i !== index),
		}));
	}, []);

	const handleTestcaseChange = useCallback(
		(index: number, field: keyof TestcaseItem, value: string) => {
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
		},
		[],
	);

	const validateTestCases = useCallback((): {
		name: string;
		missing: string;
	}[] => {
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
	}, [formData.testcases, parsedTestCases]);

	const getFullDescription = useCallback(
		() => ({
			title: formData.title,
			description: formData.description ?? "",
			inputFormat: formData.inputFormat,
			outputFormat: formData.outputFormat,
			sampleInputs: formData.sampleInputs,
		}),
		[formData],
	);

	const getFullDescriptionForBackend = useCallback((): string => {
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
	}, [formData]);

	const applyFormat = useCallback((command: string, value?: string | null) => {
		if (descriptionRef.current) {
			descriptionRef.current.focus();
			document.execCommand(command, false, value ?? undefined);
		}
	}, []);

	const insertTextAtCursor = useCallback((text: string) => {
		if (descriptionRef.current) {
			descriptionRef.current.focus();
			document.execCommand("insertText", false, text);
		}
	}, []);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
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
				submitFormData.append("difficulty", formData.difficulty?.trim() || "1");
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
		},
		[
			problemId,
			enableFullEdit,
			validateTestCases,
			formData,
			originalTimeLimit,
			originalMemoryLimit,
			parsedTestCases,
			getFullDescriptionForBackend,
			getBackNavigation,
			navigate,
		],
	);

	return {
		problemId,
		zipFile,
		loading,
		submitting,
		error,
		descriptionRef,
		formData,
		setFormData,
		currentTag,
		setCurrentTag,
		originalTimeLimit,
		originalMemoryLimit,
		enableFullEdit,
		setEnableFullEdit,
		parsedTestCases,
		showParsedTestCases,
		setShowParsedTestCases,
		getBackNavigation,
		navigate,
		handleZipFileChange,
		handleInputChange,
		handleTagAdd,
		handleTagKeyPress,
		handleTagRemove,
		handleSampleInputChange,
		addSampleInput,
		removeSampleInput,
		handleTestcaseAdd,
		handleTestcaseRemove,
		handleTestcaseChange,
		getFullDescription,
		applyFormat,
		insertTextAtCursor,
		handleSubmit,
	};
}

export type ProblemEditHookReturn = ReturnType<typeof useProblemEdit>;
