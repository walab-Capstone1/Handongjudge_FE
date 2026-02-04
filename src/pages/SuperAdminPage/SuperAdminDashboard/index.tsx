import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import APIService from "../../../services/APIService";
import Header from "../../../components/Header";
import LoadingSpinner from "../../../components/LoadingSpinner";
import {
	FaUsers,
	FaBook,
	FaFileAlt,
	FaCode,
	FaBullhorn,
	FaBookOpen,
	FaUniversity,
	FaList,
} from "react-icons/fa";
import * as S from "./styles";
import type { AdminStats, QuickAction } from "./types";

const SuperAdminDashboard: React.FC = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [stats, setStats] = useState<AdminStats>({
		totalUsers: 0,
		totalSections: 0,
		totalAssignments: 0,
		totalProblems: 0,
		totalSystemNotices: 0,
		totalSystemGuides: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			setLoading(true);
			const response = await APIService.getSuperAdminStats();
			const statsData = response?.data?.data || response?.data || response;

			if (statsData) {
				setStats({
					totalUsers: statsData.totalUsers || 0,
					totalSections: statsData.totalSections || 0,
					totalAssignments: statsData.totalAssignments || 0,
					totalProblems: statsData.totalProblems || 0,
					totalSystemNotices: statsData.totalSystemNotices || 0,
					totalSystemGuides: statsData.totalSystemGuides || 0,
				});
			}
		} catch (error) {
			console.error("통계 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	};

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

	if (loading) {
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
							<S.StatValue>{stats.totalUsers.toLocaleString()}</S.StatValue>
						</S.StatContent>
					</S.StatCard>

					<S.StatCard>
						<S.StatIcon>
							<FaUniversity />
						</S.StatIcon>
						<S.StatContent>
							<S.StatLabel>총 분반</S.StatLabel>
							<S.StatValue>{stats.totalSections.toLocaleString()}</S.StatValue>
						</S.StatContent>
					</S.StatCard>

					<S.StatCard>
						<S.StatIcon>
							<FaFileAlt />
						</S.StatIcon>
						<S.StatContent>
							<S.StatLabel>총 과제</S.StatLabel>
							<S.StatValue>
								{stats.totalAssignments.toLocaleString()}
							</S.StatValue>
						</S.StatContent>
					</S.StatCard>

					<S.StatCard>
						<S.StatIcon>
							<FaCode />
						</S.StatIcon>
						<S.StatContent>
							<S.StatLabel>총 문제</S.StatLabel>
							<S.StatValue>{stats.totalProblems.toLocaleString()}</S.StatValue>
						</S.StatContent>
					</S.StatCard>

					<S.StatCard>
						<S.StatIcon>
							<FaBullhorn />
						</S.StatIcon>
						<S.StatContent>
							<S.StatLabel>시스템 공지</S.StatLabel>
							<S.StatValue>
								{stats.totalSystemNotices.toLocaleString()}
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
								{stats.totalSystemGuides.toLocaleString()}
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
						<S.ActionCard key={index} onClick={() => navigate(action.path)}>
							<S.ActionIcon>{action.icon}</S.ActionIcon>
							<S.ActionTitle>{action.title}</S.ActionTitle>
							<S.ActionDescription>{action.description}</S.ActionDescription>
						</S.ActionCard>
					))}
				</S.ActionsGrid>
			</S.Container>
		</>
	);
};

export default SuperAdminDashboard;
