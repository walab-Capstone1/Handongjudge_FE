import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import APIService from "../../../../services/APIService";
import type { EnrollResponse } from "../types";

export function useEnrollPage() {
	const { enrollmentCode } = useParams<{ enrollmentCode: string }>();
	const navigate = useNavigate();
	const { isAuthenticated, loading: authLoading } = useAuth();
	const [enrollLoading, setEnrollLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!authLoading && !isAuthenticated && enrollmentCode) {
			sessionStorage.setItem("pendingEnrollmentCode", enrollmentCode);
			navigate("/login", {
				state: {
					redirectTo: `/enroll/${enrollmentCode}`,
					message: "수업 참가를 위해 로그인이 필요합니다.",
				},
			});
		}
	}, [authLoading, isAuthenticated, enrollmentCode, navigate]);

	const handleEnroll = useCallback(async () => {
		if (!enrollmentCode) return;
		try {
			setEnrollLoading(true);
			setError(null);
			const response: EnrollResponse =
				await APIService.enrollByCode(enrollmentCode);
			if (response.success) {
				alert(`${response.courseTitle} 수강 신청이 완료되었습니다!`);
				navigate("/courses");
			} else {
				setError(response.message || "수강 신청에 실패했습니다.");
			}
		} catch (err: unknown) {
			console.error("수강 신청 실패:", err);
			setError(
				err instanceof Error ? err.message : "수강 신청에 실패했습니다.",
			);
		} finally {
			setEnrollLoading(false);
		}
	}, [enrollmentCode, navigate]);

	return {
		enrollmentCode,
		authLoading,
		isAuthenticated,
		enrollLoading,
		error,
		navigate,
		handleEnroll,
	};
}

export type EnrollPageHookReturn = ReturnType<typeof useEnrollPage>;
