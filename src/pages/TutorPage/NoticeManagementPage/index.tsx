import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import APIService from "../../../services/APIService";
import type { Notice, Section } from "./types";
import {
	getSectionNameWithoutSection,
	getUniqueSections,
} from "./utils/sectionUtils";
import * as S from "./styles";

const NoticeManagementPage: React.FC = () => {
	const { sectionId } = useParams<{ sectionId?: string }>();
	const navigate = useNavigate();

	const [notices, setNotices] = useState<Notice[]>([]);
	const [sections, setSections] = useState<Section[]>([]);
	const [currentSection, setCurrentSection] = useState<Section | null>(null);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterSection, setFilterSection] = useState("ALL");
	const [openMoreMenu, setOpenMoreMenu] = useState<string | number | null>(
		null,
	);

	useEffect(() => {
		fetchNotices();
		fetchSections();
	}, [sectionId]);

	const fetchNotices = async () => {
		try {
			setLoading(true);
			console.log("🔍 공지사항 조회 시작...", { sectionId });

			let response;
			if (sectionId) {
				response = await APIService.getSectionNotices(sectionId);
				console.log("📋 분반별 공지사항 API 응답:", response);
			} else {
				response = await APIService.getInstructorNotices();
				console.log("📋 전체 공지사항 API 응답:", response);
			}

			const noticesData = response?.data || response || [];
			console.log("📋 최종 공지사항 데이터:", noticesData);

			setNotices(noticesData);
			setLoading(false);
		} catch (error) {
			console.error("❌ 공지사항 조회 실패:", error);
			setNotices([]);
			setLoading(false);
		}
	};

	const fetchSections = async () => {
		try {
			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = dashboardResponse?.data || [];
			setSections(sectionsData);

			if (sectionId) {
				const currentSectionData = sectionsData.find(
					(section: Section) =>
						section.sectionId === Number.parseInt(sectionId),
				);
				setCurrentSection(currentSectionData || null);
			}
		} catch (error) {
			console.error("분반 정보 조회 실패:", error);
			setSections([]);
		}
	};

	const handleCreateNotice = () => {
		if (sectionId) {
			navigate(`/tutor/notices/section/${sectionId}/create`);
		} else {
			navigate("/tutor/notices/create");
		}
	};

	const handleEditNotice = (notice: Notice) => {
		const noticeSectionId = sectionId || notice.sectionId;
		if (noticeSectionId) {
			navigate(`/tutor/notices/section/${noticeSectionId}/${notice.id}/edit`);
		} else {
			navigate(`/tutor/notices/${notice.id}/edit`);
		}
	};

	const handleDeleteNotice = async (noticeId: string | number) => {
		if (window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
			try {
				await APIService.deleteNotice(noticeId);
				fetchNotices();
				alert("공지사항이 삭제되었습니다.");
			} catch (error) {
				console.error("공지사항 삭제 실패:", error);
				alert("공지사항 삭제에 실패했습니다.");
			}
		}
	};

	const handleToggleActive = async (
		noticeId: string | number,
		currentActive: boolean,
	) => {
		try {
			const newActive = !currentActive;
			await APIService.toggleNoticeActive(noticeId, newActive);
			fetchNotices();
		} catch (error) {
			console.error("공지사항 활성화 상태 변경 실패:", error);
			alert("공지사항 활성화 상태 변경에 실패했습니다.");
		}
	};

	const handleCopyEnrollmentLink = () => {
		if (currentSection?.enrollmentCode) {
			const enrollmentLink = `${window.location.origin}/enroll/${currentSection.enrollmentCode}`;
			navigator.clipboard
				.writeText(enrollmentLink)
				.then(() => {
					alert("수업 참가 링크가 복사되었습니다!");
				})
				.catch((err) => {
					console.error("복사 실패:", err);
					alert("링크 복사에 실패했습니다.");
				});
		}
	};

	const filteredNotices = notices.filter((notice) => {
		const matchesSearch =
			notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
			notice.sectionName.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesSection =
			filterSection === "ALL" || notice.sectionId.toString() === filterSection;
		return matchesSearch && matchesSection;
	});

	const uniqueSections = getUniqueSections(notices);

	if (loading) {
		return (
			<TutorLayout>
				<S.Container>
					<S.LoadingContainer>
						<S.LoadingSpinner />
						<p>공지사항을 불러오는 중...</p>
					</S.LoadingContainer>
				</S.Container>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={currentSection}>
			<S.Container>
				{/* 분반별 페이지인 경우 헤더 디자인 */}
				{sectionId && currentSection && (
					<S.PageHeader>
						<S.HeaderLeft>
							<S.PageTitle>{currentSection.courseTitle}</S.PageTitle>
						</S.HeaderLeft>
						<S.HeaderRight>
							{currentSection.enrollmentCode && (
								<S.LinkCopyButton
									onClick={handleCopyEnrollmentLink}
									title="수업 참가 링크 복사"
								>
									🔗 수업 링크 복사
								</S.LinkCopyButton>
							)}
							<S.PrimaryButton onClick={handleCreateNotice}>
								새 공지사항 작성
							</S.PrimaryButton>
						</S.HeaderRight>
					</S.PageHeader>
				)}

				{/* 전체 페이지인 경우 기존 헤더 유지 */}
				{!sectionId && (
					<S.PageHeader>
						<S.HeaderLeft>
							<S.PageTitle>전체 공지사항 관리</S.PageTitle>
							<S.SearchBox>
								<S.SearchInput
									type="text"
									placeholder="제목, 내용, 분반으로 검색..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</S.SearchBox>
						</S.HeaderLeft>
						<S.HeaderRight>
							<S.FilterDropdown>
								<S.FilterSelect
									value={filterSection}
									onChange={(e) => setFilterSection(e.target.value)}
								>
									<option value="ALL">모든 수업</option>
									{uniqueSections.map((section: any) => (
										<option key={section.id} value={section.id}>
											{section.name}
										</option>
									))}
								</S.FilterSelect>
							</S.FilterDropdown>
							<S.HeaderActions>
								<S.PrimaryButton onClick={handleCreateNotice}>
									새 공지사항 작성
								</S.PrimaryButton>
							</S.HeaderActions>
						</S.HeaderRight>
					</S.PageHeader>
				)}

				<S.TableContainer>
					<S.Table>
						<S.Thead>
							<tr>
								<S.Th width="40%" align="left">
									제목
								</S.Th>
								<S.Th width="20%" align="left">
									수업
								</S.Th>
								<S.Th width="20%" align="right">
									작성일
								</S.Th>
								<S.Th width="20%" align="right">
									관리
								</S.Th>
							</tr>
						</S.Thead>
						<S.Tbody>
							{filteredNotices.length === 0 ? (
								<tr>
									<S.EmptyMessage colSpan={4}>
										{notices.length === 0
											? "작성된 공지사항이 없습니다."
											: "검색 조건에 맞는 공지사항이 없습니다."}
									</S.EmptyMessage>
								</tr>
							) : (
								filteredNotices.map((notice) => (
									<S.Tr key={notice.id} disabled={notice.active === false}>
										<S.Td width="40%" align="left">
											<div>
												<S.NoticeTitle>
													{notice.title}
													{notice.isNew && <S.NewBadge>NEW</S.NewBadge>}
												</S.NoticeTitle>
												{notice.content && (
													<S.NoticeDescription>
														{notice.content}
													</S.NoticeDescription>
												)}
											</div>
										</S.Td>
										<S.Td width="20%" align="left">
											{getSectionNameWithoutSection(notice.sectionName)}
										</S.Td>
										<S.Td width="20%" align="right">
											{new Date(notice.createdAt).toLocaleDateString("ko-KR", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</S.Td>
										<S.Td width="20%" align="right">
											<S.ActionsInline>
												<S.PrimaryActions>
													<S.TableButton
														variant="edit"
														onClick={() => handleEditNotice(notice)}
														title="수정"
													>
														수정
													</S.TableButton>
												</S.PrimaryActions>
												<S.SecondaryActions>
													<S.SecondaryActionsLayer>
														<S.TableButton
															variant="secondary"
															onClick={(e) => {
																e.stopPropagation();
																handleToggleActive(notice.id, notice.active);
															}}
															title={notice.active ? "비활성화" : "활성화"}
														>
															{notice.active ? "비활성화" : "활성화"}
														</S.TableButton>
														<S.MoreMenu>
															<S.TableButton
																variant="secondary"
																onClick={(e) => {
																	e.stopPropagation();
																	setOpenMoreMenu(
																		openMoreMenu === notice.id
																			? null
																			: notice.id,
																	);
																}}
																title="더보기"
															>
																⋯
															</S.TableButton>
															{openMoreMenu === notice.id && (
																<S.MoreDropdown>
																	<S.MoreDropdownButton
																		variant="delete"
																		onClick={(e) => {
																			e.stopPropagation();
																			handleDeleteNotice(notice.id);
																			setOpenMoreMenu(null);
																		}}
																	>
																		삭제
																	</S.MoreDropdownButton>
																</S.MoreDropdown>
															)}
														</S.MoreMenu>
													</S.SecondaryActionsLayer>
												</S.SecondaryActions>
											</S.ActionsInline>
										</S.Td>
									</S.Tr>
								))
							)}
						</S.Tbody>
					</S.Table>
				</S.TableContainer>
			</S.Container>
		</TutorLayout>
	);
};

export default NoticeManagementPage;
