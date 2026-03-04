import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type { BulkParseItemResult, EditableProblem } from "../types";
import { toProblemCreateRequest } from "../utils";

export function useProblemImport() {
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [zipFile, setZipFile] = useState<File | null>(null);
	const [parseResults, setParseResults] = useState<BulkParseItemResult[]>([]);
	const [editableProblems, setEditableProblems] = useState<EditableProblem[]>([]);
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const [approvedSet, setApprovedSet] = useState<Set<number>>(new Set());
	const [isParsing, setIsParsing] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [parseError, setParseError] = useState<string | null>(null);
	const [uploadResultModal, setUploadResultModal] = useState<{
		success: boolean;
		message: string;
	} | null>(null);

	const selectFile = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			if (!file.name.endsWith(".zip")) {
				setParseError("ZIP 파일만 업로드 가능합니다.");
				return;
			}
			setParseError(null);
			setZipFile(file);
			setIsParsing(true);
			try {
				const fd = new FormData();
				fd.append("zipFile", file);
				const results: BulkParseItemResult[] = await APIService.parseBulkZip(fd);
				setParseResults(results);

				const editables: EditableProblem[] = [];
				results.forEach((r, i) => {
					if (r.success && r.parseResult) {
						editables.push(
							toProblemCreateRequest(r.parseResult, i, r.filename),
						);
					}
				});
				setEditableProblems(editables);
				setSelectedIndex(editables.length > 0 ? 0 : -1); // 0 = first in list
				setApprovedSet(new Set());
			} catch (err: unknown) {
				setParseError(
					err instanceof Error ? err.message : "ZIP 파싱에 실패했습니다.",
				);
			} finally {
				setIsParsing(false);
				e.target.value = "";
			}
		},
		[],
	);

	const updateProblem = useCallback(
		(listIndex: number, updates: Partial<EditableProblem>) => {
			setEditableProblems((prev) =>
				prev.map((p, i) => (i === listIndex ? { ...p, ...updates } : p)),
			);
		},
		[],
	);

	const toggleApproved = useCallback((listIndex: number) => {
		setApprovedSet((prev) => {
			const next = new Set(prev);
			if (next.has(listIndex)) next.delete(listIndex);
			else next.add(listIndex);
			return next;
		});
	}, []);

	const approveAll = useCallback(() => {
		setApprovedSet(new Set(editableProblems.map((_, i) => i)));
	}, [editableProblems]);

	const selectedProblem =
		selectedIndex >= 0 && selectedIndex < editableProblems.length
			? editableProblems[selectedIndex]
			: undefined;

	const uploadApproved = useCallback(async () => {
		const approved = editableProblems.filter((_, i) => approvedSet.has(i));
		if (approved.length === 0) {
			setUploadResultModal({
				success: false,
				message: "승인된 문제가 없습니다. 체크박스로 승인할 문제를 선택하세요.",
			});
			return;
		}

		setIsUploading(true);
		setUploadResultModal(null);
		try {
			const payload = approved.map(({ _index, _filename, ...rest }) => rest as any);
			const res = await APIService.bulkCreateProblems(payload);
			const count = res?.successCount ?? res?.createdIds?.length ?? approved.length;
			setUploadResultModal({
				success: true,
				message: `${count}개 문제가 성공적으로 등록되었습니다.`,
			});
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "업로드에 실패했습니다.";
			setUploadResultModal({ success: false, message: msg });
		} finally {
			setIsUploading(false);
		}
	}, [editableProblems, approvedSet]);

	const closeResultModal = useCallback(() => {
		setUploadResultModal(null);
	}, []);

	const goBack = useCallback(() => {
		navigate("/tutor/problems");
	}, [navigate]);

	return {
		fileInputRef,
		zipFile,
		parseResults,
		editableProblems,
		selectedIndex,
		setSelectedIndex,
		selectedProblem,
		approvedSet,
		toggleApproved,
		approveAll,
		updateProblem,
		isParsing,
		isUploading,
		parseError,
		uploadResultModal,
		selectFile,
		handleFileChange,
		uploadApproved,
		closeResultModal,
		goBack,
	};
}
