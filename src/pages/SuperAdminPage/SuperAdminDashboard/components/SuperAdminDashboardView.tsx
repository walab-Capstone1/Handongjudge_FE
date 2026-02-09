import {
	FaUsers,
	FaFileAlt,
	FaCode,
	FaBullhorn,
	FaBookOpen,
	FaUniversity,
	FaList,
} from "react-icons/fa";
import Header from "../../../../components/Layout/Header";
import LoadingSpinner from "../../../../components/UI/LoadingSpinner";
import type { SuperAdminDashboardHookReturn } from "../hooks/useSuperAdminDashboard";
import * as S from "../styles";
import type { QuickAction } from "../types";

const quickActions: QuickAction[] = [
	{
		title: "시스템 공지사항",
		icon: <FaBullhorn />,
		path: "/super-admin/system-notices",
		description: "전체 시스템 공지사항 관리",
	},
	{
		title: "시스템 가이드",
		icon: <FaBookOpen />,
		path: "/super-admin/system-guides",
		description: "시스템 사용 가이드 관리",
	},
	{
		title: "사용자 관리",
		icon: <FaUsers />,
		path: "/super-admin/users",
		description: "전체 사용자 조회 및 관리",
	},
	{
		title: "강좌 관리",
		icon: <FaUniversity />,
		path: "/super-admin/courses",
		description: "모든 강좌 및 분반 관리",
	},
	{
		title: "문제 관리",
		icon: <FaCode />,
		path: "/super-admin/problems",
		description: "전체 문제 풀 관리",
	},
	{
		title: "제출 내역",
		icon: <FaList />,
		path: "/super-admin/submissions",
		description: "모든 제출 내역 조회",
	},
];

export default function SuperAdminDashboardView(
	d: SuperAdminDashboardHookReturn,
) {
	if (d.loading) {
		return (
			<>
				<Header onUserNameClick={() => {}} />
				<LoadingSpinner message="대시보드를 불러오는 중..." />
			</>
		);
	}

	return (
		<>
			<Header onUserNameClick={() => {}} />
			<S.Container>
				<S.Title>시스템 관리자 대시보드</S.Title>
				<S.StatsGrid>
					<S.StatCard>
						<S.StatIcon>
							<FaUsers />
						</S.StatIcon>
						<S.StatContent>
							<S.StatLabel>총 사용자</S.StatLabel>
							<S.StatValue>{d.stats.totalUsers.toLocaleString()}</S.StatValue>
						</S.StatContent>
					</S.StatCard>
					<S.StatCard>
						<S.StatIcon>
							<FaUniversity />
						</S.StatIcon>
						<S.StatContent>
							<S.StatLabel>총 분반</S.StatLabel>
							<S.StatValue>
								{d.stats.totalSections.toLocaleString()}
							</S.StatValue>
						</S.StatContent>
					</S.StatCard>
					<S.StatCard>
						<S.StatIcon>
							<FaFileAlt />
						</S.StatIcon>
						<S.StatContent>
							<S.StatLabel>총 과제</S.StatLabel>
							<S.StatValue>
								{d.stats.totalAssignments.toLocaleString()}
							</S.StatValue>
						</S.StatContent>
					</S.StatCard>
					<S.StatCard>
						<S.StatIcon>
							<FaCode />
						</S.StatIcon>
						<S.StatContent>
							<S.StatLabel>총 문제</S.StatLabel>
							<S.StatValue>
								{d.stats.totalProblems.toLocaleString()}
							</S.StatValue>
						</S.StatContent>
					</S.StatCard>
					<S.StatCard>
						<S.StatIcon>
							<FaBullhorn />
						</S.StatIcon>
						<S.StatContent>
							<S.StatLabel>시스템 공지</S.StatLabel>
							<S.StatValue>
								{d.stats.totalSystemNotices.toLocaleString()}
							</S.StatValue>
						</S.StatContent>
					</S.StatCard>
					<S.StatCard>
						<S.StatIcon>
							<FaBookOpen />
						</S.StatIcon>
						<S.StatContent>
							<S.StatLabel>시스템 가이드</S.StatLabel>
							<S.StatValue>
								{d.stats.totalSystemGuides.toLocaleString()}
							</S.StatValue>
						</S.StatContent>
					</S.StatCard>
				</S.StatsGrid>
				<h2
					style={{
						fontSize: "1.5rem",
						fontWeight: 700,
						color: "#1f2937",
						marginBottom: "1.5rem",
					}}
				>
					빠른 작업
				</h2>
				<S.ActionsGrid>
					{quickActions.map((action, index) => (
						<S.ActionCard key={index} onClick={() => d.navigate(action.path)}>
							<S.ActionIcon>{action.icon}</S.ActionIcon>
							<S.ActionTitle>{action.title}</S.ActionTitle>
							<S.ActionDescription>{action.description}</S.ActionDescription>
						</S.ActionCard>
					))}
				</S.ActionsGrid>
			</S.Container>
		</>
	);
}
