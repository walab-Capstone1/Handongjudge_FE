import { FaGraduationCap, FaPencilAlt, FaCog, FaPlus } from "react-icons/fa";
import Silk from "../Silk";
import Header from "../../../../components/Layout/Header";
import Footer from "../../../../components/Layout/Footer";
import type { IndexPageHookReturn } from "../hooks/useIndexPage";
import * as S from "../styles";

export default function IndexPageView(d: IndexPageHookReturn) {
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
						<S.HeroButton onClick={d.handleGoToClassroom}>
							내 강의실로 가기
							<FaGraduationCap />
						</S.HeroButton>
					</S.HeroContentWrapper>
				</S.HeroSection>

				<S.TabNavigation>
					<S.Tab
						active={d.activeTab === "lectures"}
						onClick={d.handleLecturesClick}
					>
						<FaGraduationCap />
						수강 강의
					</S.Tab>
					<S.Tab
						active={d.activeTab === "management"}
						onClick={d.handleManagementClick}
					>
						<FaPencilAlt />
						강의 관리
					</S.Tab>
					<S.Tab
						active={d.activeTab === "system"}
						onClick={d.handleSystemManagementClick}
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
						{d.isSuperAdmin && (
							<S.PanelActionButton
								onClick={() => d.navigate("/super-admin/system-notices")}
								title="공지사항 관리"
							>
								<FaPlus />
							</S.PanelActionButton>
						)}
					</S.PanelHeader>
					<S.PanelList>
						{d.loading ? (
							<S.PanelItem>
								<S.ItemText>로딩 중...</S.ItemText>
							</S.PanelItem>
						) : d.systemNotices.length === 0 ? (
							<S.PanelItem>
								<S.ItemText>등록된 공지사항이 없습니다.</S.ItemText>
							</S.PanelItem>
						) : (
							d.systemNotices.map((notice) => (
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
						{d.isSuperAdmin && (
							<S.PanelActionButton
								onClick={() => d.navigate("/super-admin/system-guides")}
								title="이용안내 관리"
							>
								<FaPlus />
							</S.PanelActionButton>
						)}
					</S.PanelHeader>
					<S.PanelList>
						{d.loading ? (
							<S.PanelItem>
								<S.ItemText>로딩 중...</S.ItemText>
							</S.PanelItem>
						) : d.systemGuides.length === 0 ? (
							<S.PanelItem>
								<S.ItemText>등록된 이용안내가 없습니다.</S.ItemText>
							</S.PanelItem>
						) : (
							d.systemGuides.map((guide) => (
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
}
