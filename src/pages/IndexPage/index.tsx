import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap, FaPencilAlt, FaCog, FaPlus } from "react-icons/fa";
import Silk from "./Silk";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
import type { SystemNotice, SystemGuide, TabType } from "./types";
import * as S from "./styles";

const IndexPage: React.FC = () => {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuth();
	const [activeTab, setActiveTab] = useState<TabType>("lectures");
	const [systemNotices, setSystemNotices] = useState<SystemNotice[]>([]);
	const [systemGuides, setSystemGuides] = useState<SystemGuide[]>([]);
	const [loading, setLoading] = useState(true);

	const userName = user?.name || user?.username || user?.email || "";
	const isSuperAdmin = user?.role === "SUPER_ADMIN";

	const fetchSystemData = useCallback(async () => {
		try {
			setLoading(true);
			const [noticesResponse, guidesResponse] = await Promise.all([
				APIService.getActiveSystemNotices().catch(() => []),
				APIService.getActiveSystemGuides().catch(() => []),
			]);

			setSystemNotices(
				Array.isArray(noticesResponse) ? noticesResponse.slice(0, 5) : [],
			);
			setSystemGuides(
				Array.isArray(guidesResponse) ? guidesResponse.slice(0, 5) : [],
			);
		} catch (error) {
			console.error("시스템 데이터 조회 실패:", error);
			setSystemNotices([]);
			setSystemGuides([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSystemData();
	}, [fetchSystemData]);

	const handleGoToClassroom = () => {
		if (!isAuthenticated) {
			navigate("/login", { state: { redirectTo: "/dashboard" } });
			return;
		}
		navigate("/dashboard");
	};

	const handleLecturesClick = () => {
		if (!isAuthenticated) {
			navigate("/login", { state: { redirectTo: "/dashboard" } });
			return;
		}
		navigate("/dashboard");
	};

	const handleManagementClick = () => {
		if (!isAuthenticated) {
			navigate("/login", { state: { redirectTo: "/tutor" } });
			return;
		}
		navigate("/tutor");
	};

	const handleSystemManagementClick = () => {
		if (!isAuthenticated) {
			navigate("/login", { state: { redirectTo: "/super-admin" } });
			return;
		}
		if (isSuperAdmin) {
			navigate("/super-admin");
		} else {
			setActiveTab("system");
		}
	};

	return (
		<S.IndexContainer>
			<Header onUserNameClick={() => {}} />

			<S.HeroAndTabSection>
				<S.HeroBackground>
					<Silk
						speed={1}
						scale={1.5}
						color="#6e74c4"
						noiseIntensity={1.5}
						rotation={0}
					/>
				</S.HeroBackground>
				<S.HeroSection>
					<S.HeroContentWrapper>
						<S.HeroContent>
							<S.HeroTitle>Code Sturdy</S.HeroTitle>
							<S.HeroDescription>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sit
								amet risus nisi, integer firibus faucibus pours. Maecenas
								pharetra eropuest
							</S.HeroDescription>
						</S.HeroContent>
						<S.HeroButton onClick={handleGoToClassroom}>
							내 강의실로 가기
							<FaGraduationCap />
						</S.HeroButton>
					</S.HeroContentWrapper>
				</S.HeroSection>

				<S.TabNavigation>
					<S.Tab
						active={activeTab === "lectures"}
						onClick={handleLecturesClick}
					>
						<FaGraduationCap />
						수강 강의
					</S.Tab>
					<S.Tab
						active={activeTab === "management"}
						onClick={handleManagementClick}
					>
						<FaPencilAlt />
						강의 관리
					</S.Tab>
					<S.Tab
						active={activeTab === "system"}
						onClick={handleSystemManagementClick}
					>
						<FaCog />
						시스템 관리
					</S.Tab>
				</S.TabNavigation>
			</S.HeroAndTabSection>

			<S.MainContent>
				<S.ContentPanel>
					<S.PanelHeader>
						<S.PanelTitle>공지사항 - Notice</S.PanelTitle>
						{isSuperAdmin && (
							<S.PanelActionButton
								onClick={() => navigate("/super-admin/system-notices")}
								title="공지사항 관리"
							>
								<FaPlus />
							</S.PanelActionButton>
						)}
					</S.PanelHeader>
					<S.PanelList>
						{loading ? (
							<S.PanelItem>
								<S.ItemText>로딩 중...</S.ItemText>
							</S.PanelItem>
						) : systemNotices.length === 0 ? (
							<S.PanelItem>
								<S.ItemText>등록된 공지사항이 없습니다.</S.ItemText>
							</S.PanelItem>
						) : (
							systemNotices.map((notice) => (
								<S.PanelItem key={notice.id}>
									<S.ItemText>{notice.title}</S.ItemText>
									<S.ItemDate>
										{new Date(notice.createdAt).toLocaleDateString("ko-KR")}
									</S.ItemDate>
								</S.PanelItem>
							))
						)}
					</S.PanelList>
				</S.ContentPanel>

				<S.ContentPanel>
					<S.PanelHeader>
						<S.PanelTitle>이용안내 - Guide</S.PanelTitle>
						{isSuperAdmin && (
							<S.PanelActionButton
								onClick={() => navigate("/super-admin/system-guides")}
								title="이용안내 관리"
							>
								<FaPlus />
							</S.PanelActionButton>
						)}
					</S.PanelHeader>
					<S.PanelList>
						{loading ? (
							<S.PanelItem>
								<S.ItemText>로딩 중...</S.ItemText>
							</S.PanelItem>
						) : systemGuides.length === 0 ? (
							<S.PanelItem>
								<S.ItemText>등록된 이용안내가 없습니다.</S.ItemText>
							</S.PanelItem>
						) : (
							systemGuides.map((guide) => (
								<S.PanelItem key={guide.id}>
									<S.ItemText>{guide.title}</S.ItemText>
									<S.ItemDate>
										{new Date(guide.createdAt).toLocaleDateString("ko-KR")}
									</S.ItemDate>
								</S.PanelItem>
							))
						)}
					</S.PanelList>
				</S.ContentPanel>
			</S.MainContent>

			<Footer />
		</S.IndexContainer>
	);
};

export default IndexPage;
