import type React from "react";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CourseCard from "../../components/CourseCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
import type { Section, CourseCardData, TabType, SortType } from "./types";
import {
	transformSectionData,
	extractEnrollmentCode,
} from "./utils/sectionUtils";
import * as S from "./styles";

const ClassPage: React.FC = () => {
	const { user, isAuthenticated } = useAuth();
	const [enrolledSections, setEnrolledSections] = useState<Section[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<TabType>("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState<SortType>("recent");
	const [enrollmentCode, setEnrollmentCode] = useState("");
	const [enrollLoading, setEnrollLoading] = useState(false);
	const [showEnrollModal, setShowEnrollModal] = useState(false);

	const userName = user?.name || user?.username || user?.email || "사용자 이름";

	useEffect(() => {
		const fetchEnrolledSections = async () => {
			if (!isAuthenticated) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);

				const response = await APIService.getUserEnrolledSections();
				console.log("수강 중인 코스 응답:", response);
				setEnrolledSections(response.data || response);
			} catch (err: any) {
				console.error("수강 중인 section 조회 실패:", err);
				setError(err.message || "수강 중인 강의를 불러오는데 실패했습니다.");
			} finally {
				setLoading(false);
			}
		};

		fetchEnrolledSections();
	}, [isAuthenticated]);

	const handleStatusUpdate = async () => {
		try {
			const response = await APIService.getUserEnrolledSections();
			setEnrolledSections(response.data || response);
		} catch (err) {
			console.error("대시보드 새로고침 실패:", err);
		}
	};

	const getFilteredSections = (): CourseCardData[] => {
		let filtered = enrolledSections.map(transformSectionData);

		if (activeTab === "in-progress") {
			filtered = filtered.filter((section) => section.active !== false);
		} else if (activeTab === "completed") {
			filtered = filtered.filter((section) => section.active === false);
		}

		if (searchTerm) {
			filtered = filtered.filter(
				(section) =>
					section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					section.courseName.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}

		if (sortBy === "recent") {
			filtered.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);
		} else if (sortBy === "name") {
			filtered.sort((a, b) => a.title.localeCompare(b.title));
		}

		return filtered;
	};

	const getStats = () => {
		const all = enrolledSections.length;
		const inProgress = enrolledSections.filter(
			(s) => s.active !== false,
		).length;
		const completed = enrolledSections.filter((s) => s.active === false).length;
		return { all, inProgress, completed };
	};

	const handleEnrollByCode = async () => {
		if (!enrollmentCode.trim()) {
			alert("참가 코드를 입력하세요.");
			return;
		}

		const code = extractEnrollmentCode(enrollmentCode);

		if (!code) {
			alert("유효한 참가 코드나 링크를 입력하세요.");
			return;
		}

		try {
			setEnrollLoading(true);
			const resp = await APIService.enrollByCode(code);
			if (resp && resp.success) {
				alert(`${resp.courseTitle} 수강 신청이 완료되었습니다!`);
				setEnrollmentCode("");
				const refreshed = await APIService.getUserEnrolledSections();
				setEnrolledSections(refreshed.data || refreshed);
			} else {
				alert(resp?.message || "수강 신청에 실패했습니다.");
			}
		} catch (e: any) {
			alert(e.message || "수강 신청 중 오류가 발생했습니다.");
		} finally {
			setEnrollLoading(false);
		}
	};

	const stats = getStats();
	const filteredSections = getFilteredSections();

	if (loading) {
		return (
			<S.ClassPageContainer>
				<Header onUserNameClick={() => {}} />
				<S.LoadingContainer>
					<LoadingSpinner />
					<p>수강 중인 강의를 불러오는 중...</p>
				</S.LoadingContainer>
				<Footer />
			</S.ClassPageContainer>
		);
	}

	if (error) {
		return (
			<S.ClassPageContainer>
				<Header onUserNameClick={() => {}} />
				<S.ErrorContainer>
					<S.ErrorMessage>{error}</S.ErrorMessage>
					<S.RetryButton onClick={() => window.location.reload()}>
						다시 시도
					</S.RetryButton>
				</S.ErrorContainer>
				<Footer />
			</S.ClassPageContainer>
		);
	}

	return (
		<S.ClassPageContainer>
			<Header onUserNameClick={() => {}} />

			<S.ContentSection>
				<S.PageTitle>수강 중인 코스</S.PageTitle>

				<S.TabNavigation>
					<S.Tab
						active={activeTab === "all"}
						onClick={() => setActiveTab("all")}
					>
						전체 ({stats.all})
					</S.Tab>
					<S.Tab
						active={activeTab === "in-progress"}
						onClick={() => setActiveTab("in-progress")}
					>
						수강 중 ({stats.inProgress})
					</S.Tab>
					<S.Tab
						active={activeTab === "completed"}
						onClick={() => setActiveTab("completed")}
					>
						수강 종료 ({stats.completed})
					</S.Tab>
					<S.EnrollButton onClick={() => setShowEnrollModal(true)}>
						수업 참가
					</S.EnrollButton>
				</S.TabNavigation>

				<S.SearchAndSort>
					<S.SearchBar>
						<S.SearchInput
							type="text"
							placeholder="강의명 검색"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<S.SearchIcon>🔍</S.SearchIcon>
					</S.SearchBar>
					<S.SortSelect
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as SortType)}
					>
						<option value="recent">최근 개설일 순</option>
						<option value="name">강의명 순</option>
					</S.SortSelect>
				</S.SearchAndSort>

				{filteredSections.length === 0 ? (
					<S.EmptyState>
						<p>수강 중인 강의가 없습니다.</p>
					</S.EmptyState>
				) : (
					<S.CoursesGrid>
						{filteredSections.map((course) => (
							<CourseCard
								key={course.id}
								course={course}
								onStatusUpdate={handleStatusUpdate}
								onEnroll={() => {}}
							/>
						))}
					</S.CoursesGrid>
				)}
			</S.ContentSection>

			{showEnrollModal && (
				<S.ModalOverlay onClick={() => setShowEnrollModal(false)}>
					<S.ModalContent onClick={(e) => e.stopPropagation()}>
						<S.ModalHeader>
							<h2>수업 참가</h2>
							<S.CloseButton onClick={() => setShowEnrollModal(false)}>
								×
							</S.CloseButton>
						</S.ModalHeader>
						<S.ModalBody>
							<label>참가 코드 또는 링크</label>
							<input
								type="text"
								className="enroll-input"
								placeholder={`예: ABCD1234 또는 ${window.location.origin}/enroll/ABCD1234`}
								value={enrollmentCode}
								onChange={(e) => setEnrollmentCode(e.target.value)}
							/>
							<p className="enroll-help-text">
								참가 코드만 입력하거나 전체 링크를 붙여넣으세요.
							</p>
						</S.ModalBody>
						<S.ModalActions>
							<S.CancelButton onClick={() => setShowEnrollModal(false)}>
								취소
							</S.CancelButton>
							<S.EnrollSubmitButton
								onClick={async () => {
									await handleEnrollByCode();
									setShowEnrollModal(false);
								}}
								disabled={enrollLoading}
							>
								{enrollLoading ? "처리 중..." : "참가하기"}
							</S.EnrollSubmitButton>
						</S.ModalActions>
					</S.ModalContent>
				</S.ModalOverlay>
			)}

			<Footer />
		</S.ClassPageContainer>
	);
};

export default ClassPage;
