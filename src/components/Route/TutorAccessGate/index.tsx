import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import APIService from "../../../services/APIService";

interface TutorAccessGateProps {
	children: React.ReactNode;
}

/**
 * 튜터/관리 페이지 접근 시 관리할 수업이 있는지 확인.
 * 학생(관리 수업 없음)이면 alert 후 /courses로 리다이렉트하고 화면은 렌더하지 않음.
 */
const TutorAccessGate: React.FC<TutorAccessGateProps> = ({ children }) => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [allowed, setAllowed] = useState(false);
	const deniedHandledRef = useRef(false);

	useEffect(() => {
		let cancelled = false;

		const check = async () => {
			try {
				const res = await APIService.getManagingSections();
				const data = res?.data ?? res;
				const list = Array.isArray(data) ? data : [];
				if (cancelled) return;
				if (list.length === 0) {
					if (!deniedHandledRef.current) {
						deniedHandledRef.current = true;
						alert("학생은 들어갈 수 없습니다.");
						navigate("/courses", { replace: true });
					}
					setAllowed(false);
				} else {
					setAllowed(true);
				}
			} catch {
				if (cancelled) return;
				if (!deniedHandledRef.current) {
					deniedHandledRef.current = true;
					alert("학생은 들어갈 수 없습니다.");
					navigate("/courses", { replace: true });
				}
				setAllowed(false);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		check();
		return () => {
			cancelled = true;
		};
	}, [navigate]);

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
					fontSize: "1rem",
				}}
			>
				접근 권한 확인 중...
			</div>
		);
	}

	if (!allowed) {
		return null;
	}

	return <>{children}</>;
};

export default TutorAccessGate;
