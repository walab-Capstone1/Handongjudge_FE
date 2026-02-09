import type React from "react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import APIService from "../../../../../../services/APIService";
import type {
	ProblemListModalProps,
	ProblemListFormData,
	ProblemListTestcaseItem,
	IncompleteTestCaseItem,
	ProblemListEditFormHandlers,
} from "../types";
import ProblemListEditView from "./ProblemListEditView";
import ProblemListEditForm from "./ProblemListEditForm";
import ProblemListView from "./ProblemListView";

const initialFormData: ProblemListFormData = {
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

/**
 * 문제 목록 모달 - 상태/핸들러 + 편집 뷰 또는 목록 뷰 렌더
 */
const ProblemListModal: React.FC<ProblemListModalProps> = ({
	isOpen,
	selectedAssignment,
	submissionStats,
	searchTerm,
	onClose,
	onAddProblem,
	onRemoveProblem,
	onProblemDetail,
	onSearchChange,
	onProblemViewDetail,
	onProblemUpdated,
	onEditProblemNavigate,
}) => {
	const [editingProblemId, setEditingProblemId] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [zipFile, setZipFile] = useState<File | null>(null);
	const descriptionRef = useRef<HTMLDivElement>(null);
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	const [formData, setFormData] =
		useState<ProblemListFormData>(initialFormData);
	const [currentTag, setCurrentTag] = useState("");
	const [originalTimeLimit, setOriginalTimeLimit] = useState("");
	const [originalMemoryLimit, setOriginalMemoryLimit] = useState("");
	const [enableFullEdit, setEnableFullEdit] = useState(false);
	const [parsedTestCases, setParsedTestCases] = useState<
		ProblemListTestcaseItem[]
	>([]);
	const [showParsedTestCases, setShowParsedTestCases] = useState(false);

	useEffect(() => {
		if (editingProblemId) {
			fetchProblemForEdit(editingProblemId);
		}
	}, [editingProblemId]);

	useEffect(() => {
		if (
			editingProblemId &&
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
	}, [
		formData.description,
		formData.descriptionText,
		loading,
		isInitialLoad,
		editingProblemId,
	]);

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

	const fetchProblemForEdit = async (problemId: number) => {
		try {
			setLoading(true);
			setIsInitialLoad(true);
			setError(null);

			const response = await APIService.getProblemInfo(problemId);
			const problem = response?.data ?? response;

			let parsedData: {
				description?: string;
				timeLimit?: number;
				memoryLimit?: number;
				tags?: string | string[];
				title?: string;
				difficulty?: string | number;
				testCases?: ProblemListTestcaseItem[];
				testcases?: ProblemListTestcaseItem[];
			} | null = null;
			try {
				parsedData = await APIService.parseProblemZip(problemId);
			} catch (err) {
				console.warn("ZIP 파일 파싱 실패:", err);
			}

			const description =
				parsedData?.description ?? (problem?.description as string) ?? "";
			const descriptionText =
				description.replace(/<[^>]*>/g, "") || description;

			let timeLimit = "";
			if (parsedData?.timeLimit != null) {
				timeLimit = String(parsedData.timeLimit);
			} else if (problem?.timeLimit != null) {
				const timeLimitValue = Number(problem.timeLimit);
				if (!Number.isNaN(timeLimitValue) && timeLimitValue > 0) {
					timeLimit = String(timeLimitValue);
				}
			}

			let memoryLimit = "";
			if (parsedData?.memoryLimit != null) {
				memoryLimit = String(parsedData.memoryLimit);
			} else if (problem?.memoryLimit != null) {
				const memoryLimitValue = Number(problem.memoryLimit);
				if (!Number.isNaN(memoryLimitValue) && memoryLimitValue > 0) {
					memoryLimit = String(memoryLimitValue);
				}
			}

			setOriginalTimeLimit(timeLimit);
			setOriginalMemoryLimit(memoryLimit);

			let tags: string[] = [];
			if (parsedData?.tags) {
				if (typeof parsedData.tags === "string") {
					try {
						const parsedTags = JSON.parse(parsedData.tags);
						tags = Array.isArray(parsedTags)
							? parsedTags.map((t: string) => t?.trim()).filter(Boolean)
							: [parsedData.tags.trim()];
					} catch {
						if (parsedData.tags?.trim()) tags = [parsedData.tags.trim()];
					}
				} else if (Array.isArray(parsedData.tags)) {
					tags = parsedData.tags.map((t) => t?.trim()).filter(Boolean);
				}
			} else if (problem?.tags) {
				if (Array.isArray(problem.tags)) {
					tags = (problem.tags as string[])
						.map((t) => t?.trim())
						.filter(Boolean);
				} else if (typeof problem.tags === "string") {
					try {
						const parsedTags = JSON.parse(problem.tags);
						tags = Array.isArray(parsedTags)
							? parsedTags.map((t: string) => t?.trim()).filter(Boolean)
							: [problem.tags.trim()];
					} catch {
						if (problem.tags?.trim()) tags = [problem.tags.trim()];
					}
				}
			}

			let sampleInputs = [{ input: "", output: "" }];
			if (parsedData) {
				const testCases = parsedData.testCases ?? parsedData.testcases ?? [];
				setParsedTestCases(testCases);
				const sampleTestCases = testCases.filter((tc) => tc.type === "sample");
				if (sampleTestCases.length > 0) {
					sampleInputs = sampleTestCases.map((tc) => ({
						input: tc.input ?? "",
						output: tc.output ?? "",
					}));
				}
			} else {
				setParsedTestCases([]);
			}

			setFormData({
				title: parsedData?.title ?? (problem?.title as string) ?? "",
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

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleTagAdd = () => {
		if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
			setFormData((prev) => ({
				...prev,
				tags: [...prev.tags, currentTag.trim()],
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
			tags: prev.tags.filter((tag) => tag !== tagToRemove),
		}));
	};

	const handleSampleInputChange = (
		index: number,
		field: "input" | "output",
		value: string,
	) => {
		const newSamples = [...formData.sampleInputs];
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

	const extractTextFromRTF = (rtfContent: string): string => {
		if (rtfContent.trim().startsWith("{\\rtf")) {
			let text = rtfContent
				.replace(/\\[a-z]+\d*\s?/gi, "")
				.replace(/\{[^}]*\}/g, "")
				.replace(/\\[{}]/g, "")
				.trim();
			text = text.replace(/\s+/g, " ").trim();
			return text;
		}
		return rtfContent;
	};

	const handleTestcaseAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		const newTestCases: ProblemListTestcaseItem[] = [];
		const existingNames = new Set<string>();
		for (const tc of formData.testcases) {
			if (tc.name) existingNames.add(tc.name);
		}
		for (const tc of parsedTestCases) {
			if (tc.name) existingNames.add(tc.name);
		}

		type FilePair = { inputFile: File | null; outputFile: File | null };
		const fileMap = new Map<string, FilePair>();

		for (const file of files) {
			try {
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
			} catch (err) {
				console.error("파일 처리 실패:", err);
			}
		}

		for (const [baseName, pair] of fileMap.entries()) {
			if (existingNames.has(baseName)) {
				alert(
					`파일명 "${baseName}"이(가) 이미 존재합니다.\n\n기존 테스트케이스와 중복되거나 이미 추가된 파일명입니다. 다른 이름을 사용해주세요.`,
				);
				continue;
			}
			try {
				let inputContent = "";
				let outputContent = "";
				if (pair.inputFile) {
					const rawInput = await pair.inputFile.text();
					inputContent = extractTextFromRTF(rawInput);
				}
				if (pair.outputFile) {
					const rawOutput = await pair.outputFile.text();
					outputContent = extractTextFromRTF(rawOutput);
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
			} catch (err) {
				console.error("파일 읽기 실패:", err);
				newTestCases.push({
					file: pair.inputFile ?? pair.outputFile ?? undefined,
					name: baseName,
					input: "",
					output: "",
					type: "secret",
					isNew: true,
				});
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
		field: string,
		value: string,
	) => {
		setFormData((prev) => {
			const newTestcases = [...prev.testcases];
			if (newTestcases[index]) {
				newTestcases[index] = { ...newTestcases[index], [field]: value };
			}
			return { ...prev, testcases: newTestcases };
		});
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
	};

	const applyFormat = (command: string, value?: string | null) => {
		if (descriptionRef.current) {
			descriptionRef.current.focus();
			document.execCommand(command, false, value ?? undefined);
		}
	};

	const insertText = (text: string) => {
		if (descriptionRef.current) {
			descriptionRef.current.focus();
			document.execCommand("insertText", false, text);
		}
	};

	const getFullDescription = () => ({
		title: formData.title,
		description: formData.description || "",
		inputFormat: formData.inputFormat,
		outputFormat: formData.outputFormat,
		sampleInputs: formData.sampleInputs,
	});

	const getFullDescriptionForBackend = () => {
		let full = formData.descriptionText || "";
		if (formData.inputFormat)
			full += `\n\n## 입력 형식\n${formData.inputFormat}`;
		if (formData.outputFormat)
			full += `\n\n## 출력 형식\n${formData.outputFormat}`;
		if (formData.sampleInputs.some((s) => s.input || s.output)) {
			full += "\n\n## 예제";
			for (let idx = 0; idx < formData.sampleInputs.length; idx++) {
				const sample = formData.sampleInputs[idx];
				if (sample.input || sample.output) {
					full += `\n\n### 예제 입력 ${idx + 1}\n\`\`\`\n${sample.input}\n\`\`\``;
					full += `\n\n### 예제 출력 ${idx + 1}\n\`\`\`\n${sample.output}\n\`\`\``;
				}
			}
		}
		return full;
	};

	const validateTestCases = (): IncompleteTestCaseItem[] => {
		const allTestCases = [...formData.testcases, ...parsedTestCases];
		const incompleteTestCases: IncompleteTestCaseItem[] = [];
		for (let idx = 0; idx < allTestCases.length; idx++) {
			const tc = allTestCases[idx];
			const hasInput = tc.input && tc.input.trim().length > 0;
			const hasOutput = tc.output && tc.output.trim().length > 0;
			if (!hasInput || !hasOutput) {
				incompleteTestCases.push({
					name: tc.name ?? `테스트케이스 ${idx + 1}`,
					missing: !hasInput ? "입력" : "출력",
				});
			}
		}
		return incompleteTestCases;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedAssignment || editingProblemId == null) return;
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

			if (enableFullEdit) {
				const submitFormData = new FormData();
				submitFormData.append("title", formData.title);
				submitFormData.append("tags", JSON.stringify(formData.tags));
				submitFormData.append("difficulty", formData.difficulty);
				submitFormData.append("description", getFullDescriptionForBackend());
				submitFormData.append("inputFormat", formData.inputFormat);
				submitFormData.append("outputFormat", formData.outputFormat);
				submitFormData.append(
					"timeLimit",
					formData.timeLimit || originalTimeLimit || "1",
				);
				submitFormData.append(
					"memoryLimit",
					formData.memoryLimit || originalMemoryLimit || "256",
				);
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
				}

				for (const testcase of formData.testcases) {
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
				}

				const newProblemResponse =
					await APIService.createProblem(submitFormData);
				const newProblemId = newProblemResponse?.data ?? newProblemResponse;

				await APIService.addProblemToAssignment(
					selectedAssignment.id,
					newProblemId,
				);
				await APIService.removeProblemFromAssignment(
					selectedAssignment.id,
					editingProblemId,
				);
				alert("문제가 성공적으로 변환되었습니다.");
			} else {
				const submitFormData = new FormData();
				submitFormData.append("title", formData.title);
				submitFormData.append("tags", JSON.stringify(formData.tags));
				submitFormData.append("difficulty", formData.difficulty);
				submitFormData.append("metadataUpdated", "true");
				await APIService.updateProblem(editingProblemId, submitFormData);
				alert("문제가 성공적으로 수정되었습니다.");
			}

			setEditingProblemId(null);
			setEnableFullEdit(false);
			setZipFile(null);
			onProblemUpdated?.();
		} catch (err) {
			console.error("문제 수정 실패:", err);
			setError(
				`문제 수정 중 오류가 발생했습니다: ${err instanceof Error ? err.message : "알 수 없는 오류"}`,
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleCancelEdit = () => {
		setEditingProblemId(null);
		setEnableFullEdit(false);
		setZipFile(null);
		setError(null);
		setFormData(initialFormData);
	};

	if (!isOpen || !selectedAssignment) return null;

	const filteredProblems =
		selectedAssignment.problems?.filter((problem) => {
			if (!searchTerm) return true;
			const searchLower = searchTerm.toLowerCase();
			return (
				problem.id?.toString().includes(searchLower) ||
				(problem.title?.toString().toLowerCase().includes(searchLower) ?? false)
			);
		}) ?? [];

	const editFormHandlers: ProblemListEditFormHandlers = {
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
		handleZipFileChange,
		applyFormat,
		insertText,
		getFullDescription,
	};

	if (editingProblemId) {
		return createPortal(
			<ProblemListEditView
				title={formData.title}
				error={error}
				loading={loading}
				onCancel={handleCancelEdit}
			>
				<ProblemListEditForm
					formData={formData}
					setFormData={setFormData}
					currentTag={currentTag}
					setCurrentTag={setCurrentTag}
					enableFullEdit={enableFullEdit}
					setEnableFullEdit={setEnableFullEdit}
					descriptionRef={descriptionRef}
					zipFile={zipFile}
					parsedTestCases={parsedTestCases}
					showParsedTestCases={showParsedTestCases}
					setShowParsedTestCases={setShowParsedTestCases}
					handlers={editFormHandlers}
					onSubmit={handleSubmit}
					onCancel={handleCancelEdit}
					submitting={submitting}
				/>
			</ProblemListEditView>,
			document.body,
		);
	}

	return createPortal(
		<ProblemListView
			selectedAssignment={selectedAssignment}
			submissionStats={submissionStats}
			searchTerm={searchTerm}
			filteredProblems={filteredProblems}
			onClose={onClose}
			onAddProblem={onAddProblem}
			onRemoveProblem={onRemoveProblem}
			onProblemDetail={onProblemDetail}
			onProblemViewDetail={onProblemViewDetail}
			onSearchChange={onSearchChange}
			onEditProblem={
				onEditProblemNavigate ?? ((problemId) => setEditingProblemId(problemId))
			}
		/>,
		document.body,
	);
};

export default ProblemListModal;
