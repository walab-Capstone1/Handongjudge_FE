import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { CodingTest } from "../types";

export function useCodingTestDetail() {
	const navigate = useNavigate();
	const { testId } = useParams<{ testId: string }>();
	const [codingTest, setCodingTest] = useState<CodingTest | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchCodingTest = useCallback(async () => {
		if (!testId) return;
		try {
			setLoading(true);
			// TODO: 올바른 API 메서드로 수정 필요
			setCodingTest(null);
		} catch (error) {
			console.error("코딩 테스트 조회 실패:", error);
			alert("코딩 테스트를 불러오는데 실패했습니다.");
		} finally {
			setLoading(false);
		}
	}, [testId]);

	useEffect(() => {
		if (testId) fetchCodingTest();
	}, [testId, fetchCodingTest]);

	const formatDate = useCallback((dateString: string): string => {
		return new Date(dateString).toLocaleString("ko-KR");
	}, []);

	return { navigate, codingTest, loading, formatDate };
}

export type CodingTestDetailHookReturn = ReturnType<typeof useCodingTestDetail>;
