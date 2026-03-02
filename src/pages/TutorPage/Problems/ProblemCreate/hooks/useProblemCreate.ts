import { useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type { ProblemFormData, SampleInput, ParsedTestcase } from "../types";

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

function convertMarkdownHeadingsToHtml(html: string): string {
	if (!html) return html;
	const lines = html.split(/\n/);
	const convertedLines = lines.map((line) => {
		if (line.match(/<[^>]+>/)) return line;
		const trimmedLine = line.trim();
		const headingMatch = trimmedLine.match(/^(#{1,6})\s*(.+)$/);
		if (headingMatch) {
			const hashCount = headingMatch[1].length;
			const titleText = headingMatch[2].trim();
			const headingLevel = Math.min(Math.max(hashCount, 1), 6);
			return `<h${headingLevel}>${titleText}</h${headingLevel}>`;
		}
		return line;
	});
	return convertedLines.join("\n");
}

/** 과제 관리에서 "새 문제 만들기"로 진입했을 때 location.state 타입 */
interface FromAssignmentState {
	fromAssignmentId?: number;
	sectionId?: string;
}

export function useProblemCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const locationState = location.state as FromAssignmentState | null;
	const descriptionRef = useRef<HTMLDivElement>(null);

	const [zipFile, setZipFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [parsedTestCases, setParsedTestCases] = useState<ParsedTestcase[]>([]);
	const [showParsedTestCases, setShowParsedTestCases] = useState(false);
	const [formData, setFormData] = useState<ProblemFormData>(initialFormData);
	const [currentTag, setCurrentTag] = useState("");
	const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

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
			setLoading(true);
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
						setFormData((prev) => ({
							...prev,
							timeLimit: String(parsedData.timeLimit),
						}));
					}
					if (
						parsedData.memoryLimit != null &&
						parsedData.memoryLimit !== undefined
					) {
						setFormData((prev) => ({
							...prev,
							memoryLimit: String(parsedData.memoryLimit),
						}));
					}
					if (parsedData.description) {
						const processedDescription = convertMarkdownHeadingsToHtml(
							parsedData.description,
						);
						const hasHtmlTags = /<[a-z][\s\S]*>/i.test(processedDescription);
						let htmlDescription: string;
						if (hasHtmlTags) {
							htmlDescription = processedDescription;
						} else {
							htmlDescription = processedDescription
								.replace(/\n/g, "<br>")
								.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
								.replace(/\*(.*?)\*/g, "<em>$1</em>");
						}
						setFormData((prev) => ({
							...prev,
							description: htmlDescription,
							descriptionText: parsedData.description,
						}));
						if (descriptionRef.current) {
							descriptionRef.current.innerHTML = htmlDescription;
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
						setParsedTestCases(testCases);
					} else {
						setParsedTestCases([]);
					}
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : "알 수 없는 오류";
				setError(`ZIP 파일 파싱 중 오류가 발생했습니다: ${message}`);
			} finally {
				setLoading(false);
			}
		},
		[],
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
			tags: prev.tags.filter((tag) => tag !== tagToRemove),
		}));
	}, []);

	const handleSampleInputChange = useCallback(
		(index: number, field: "input" | "output", value: string) => {
			const newSamples = [...formData.sampleInputs];
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

	const removeSampleInput = useCallback((index: number) => {
		setFormData((prev) => {
			if (prev.sampleInputs.length <= 1) return prev;
			return {
				...prev,
				sampleInputs: prev.sampleInputs.filter((_, i) => i !== index),
			};
		});
	}, []);

	const handleTestcaseAdd = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files ? Array.from(e.target.files) : [];
			setFormData((prev) => ({
				...prev,
				testcases: [...prev.testcases, ...files],
			}));
		},
		[],
	);

	const handleTestcaseRemove = useCallback((index: number) => {
		setFormData((prev) => ({
			...prev,
			testcases: prev.testcases.filter((_, i) => i !== index),
		}));
	}, []);

	/** 커서 위치에 텍스트를 삽입하고 description 상태를 동기화합니다. */
	const insertMarkdownText = useCallback((text: string) => {
		const el = descriptionRef.current;
		if (!el) return;
		el.focus();
		document.execCommand("insertText", false, text);
		const plain = el.innerText || el.textContent || "";
		setFormData((prev) => ({ ...prev, description: plain, descriptionText: plain }));
	}, []);

	/**
	 * 선택된 텍스트를 마크다운 인라인 문법으로 감쌉니다.
	 * 선택 없으면 문법 기호만 삽입합니다.
	 */
	const wrapWithMarkdown = useCallback((syntax: string) => {
		const el = descriptionRef.current;
		if (!el) return;
		el.focus();
		const selection = window.getSelection();
		if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
			const selectedText = selection.getRangeAt(0).toString();
			document.execCommand("insertText", false, `${syntax}${selectedText}${syntax}`);
		} else {
			document.execCommand("insertText", false, `${syntax}${syntax}`);
		}
		const plain = el.innerText || el.textContent || "";
		setFormData((prev) => ({ ...prev, description: plain, descriptionText: plain }));
	}, []);

	/**
	 * 현재 줄 앞에 마크다운 제목 문법(#, ## 등)을 삽입합니다.
	 * HeadingSelect의 value("h1"~"h6" | "p")를 받습니다.
	 */
	const insertMarkdownHeading = useCallback((headingValue: string) => {
		const el = descriptionRef.current;
		if (!el) return;
		el.focus();
		const levelMap: Record<string, string> = {
			h1: "# ", h2: "## ", h3: "### ", h4: "#### ", h5: "##### ", h6: "###### ", p: "",
		};
		const prefix = levelMap[headingValue] ?? "";
		if (prefix) {
			document.execCommand("insertText", false, prefix);
		}
		const plain = el.innerText || el.textContent || "";
		setFormData((prev) => ({ ...prev, description: plain, descriptionText: plain }));
	}, []);

	const getFullDescription = useCallback(
		() => ({
			title: formData.title,
			// description은 항상 순수 마크다운 텍스트로 저장됩니다
			description: formData.description || "",
			inputFormat: formData.inputFormat,
			outputFormat: formData.outputFormat,
			sampleInputs: formData.sampleInputs,
		}),
		[formData],
	);

	const getFullDescriptionForBackend = useCallback((): string => {
		let full = formData.descriptionText || "";
		if (formData.inputFormat) {
			full += "\n\n## 입력 형식\n" + formData.inputFormat;
		}
		if (formData.outputFormat) {
			full += "\n\n## 출력 형식\n" + formData.outputFormat;
		}
		// 예제는 내용이 있을 때만 추가합니다 (빈 값이면 "## 예제" 섹션 자체를 생략)
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

	const clearFieldError = useCallback((name: string) => {
		setFieldErrors((prev) => ({ ...prev, [name]: false }));
	}, []);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			const errs: Record<string, boolean> = {};
			if (!formData.title?.trim()) errs.title = true;
			if (!formData.timeLimit?.trim()) errs.timeLimit = true;
			if (!formData.memoryLimit?.trim()) errs.memoryLimit = true;
			const hasDescription =
				(formData.description?.trim() || formData.descriptionText?.trim()) ?? "";
			if (!hasDescription) errs.description = true;
			setFieldErrors(errs);
			if (Object.keys(errs).length > 0) return;

			setLoading(true);
			setError(null);
			try {
				const submitFormData = new FormData();
				submitFormData.append("title", formData.title);
				submitFormData.append("description", getFullDescriptionForBackend());
				submitFormData.append("inputFormat", formData.inputFormat);
				submitFormData.append("outputFormat", formData.outputFormat);
				submitFormData.append("tags", JSON.stringify(formData.tags));
				submitFormData.append("difficulty", formData.difficulty?.trim() || "1");
				submitFormData.append("timeLimit", formData.timeLimit || "0");
				submitFormData.append("memoryLimit", formData.memoryLimit || "0");
				submitFormData.append(
					"sampleInputs",
					JSON.stringify(formData.sampleInputs),
				);

				let testcaseIndex = 0;
				parsedTestCases.forEach((testcase) => {
					const baseName = testcase.name ?? `testcase_${testcaseIndex}`;
					if (testcase.input) {
						const inputBlob = new Blob([testcase.input], {
							type: "text/plain",
						});
						const inputFile = new File([inputBlob], `${baseName}.in`, {
							type: "text/plain",
						});
						submitFormData.append(`testcase_${testcaseIndex}`, inputFile);
						testcaseIndex++;
					}
					if (testcase.output) {
						const outputBlob = new Blob([testcase.output], {
							type: "text/plain",
						});
						const outputFile = new File([outputBlob], `${baseName}.ans`, {
							type: "text/plain",
						});
						submitFormData.append(`testcase_${testcaseIndex}`, outputFile);
						testcaseIndex++;
					}
				});
				formData.testcases.forEach((file) => {
					submitFormData.append(`testcase_${testcaseIndex}`, file);
					testcaseIndex++;
				});

				const createResult = await APIService.createProblem(submitFormData);
				const newProblemId =
					typeof createResult === "number"
						? createResult
						: (createResult?.id ?? createResult?.data);

				const fromAssignmentId = locationState?.fromAssignmentId;
				const sectionId = locationState?.sectionId;

				if (
					fromAssignmentId != null &&
					sectionId &&
					newProblemId != null &&
					!Number.isNaN(Number(newProblemId))
				) {
					await APIService.addProblemToAssignment(
						fromAssignmentId,
						Number(newProblemId),
					);
					alert(
						"문제가 생성되어 해당 과제에 추가되었습니다. 과제 관리 페이지로 이동합니다.",
					);
					navigate(`/tutor/assignments/section/${sectionId}`, {
						replace: true,
					});
				} else {
					alert("문제가 성공적으로 생성되었습니다.");
					navigate("/tutor/problems");
				}
			} catch (err) {
				console.error("문제 생성 실패:", err);
				setError("문제 생성 중 오류가 발생했습니다.");
			} finally {
				setLoading(false);
			}
		},
		[
			formData,
			parsedTestCases,
			getFullDescriptionForBackend,
			navigate,
			locationState,
		],
	);

	const clearZipFile = useCallback(() => {
		setZipFile(null);
		setParsedTestCases([]);
		const el = document.getElementById("zipFileInput") as HTMLInputElement;
		if (el) el.value = "";
	}, []);

	return {
		navigate,
		descriptionRef,
		zipFile,
		setZipFile,
		loading,
		error,
		parsedTestCases,
		showParsedTestCases,
		setShowParsedTestCases,
		formData,
		setFormData,
		currentTag,
		setCurrentTag,
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
		insertMarkdownText,
		wrapWithMarkdown,
		insertMarkdownHeading,
		getFullDescription,
		handleSubmit,
		clearZipFile,
		fieldErrors,
		clearFieldError,
	};
}

export type ProblemCreateHookReturn = ReturnType<typeof useProblemCreate>;
