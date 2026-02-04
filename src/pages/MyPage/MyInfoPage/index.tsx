import type React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import APIService from "../../../services/APIService";
import * as S from "./styles";
import type { UserProfile, UserStats, GitHubStatus } from "./types";

const MyInfoPage: React.FC = () => {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [stats, setStats] = useState<UserStats | null>(null);
	const [githubStatus, setGithubStatus] = useState<GitHubStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [autoCommitEnabled, setAutoCommitEnabled] = useState(false);

	useEffect(() => {
		fetchMyPageData();
	}, []);

	const fetchMyPageData = async () => {
		try {
			setLoading(true);
			setError(null);

			const [profileResponse, statsResponse] = await Promise.all([
				APIService.getUserProfile(),
				APIService.getUserStats(),
			]);

			setProfile(profileResponse.data || profileResponse);
			setStats(statsResponse.data || statsResponse);

			try {
				const githubResponse = await APIService.getGitHubStatus();
				setGithubStatus(githubResponse.data || githubResponse);
				if (githubResponse.data?.autoCommitEnabled) {
					setAutoCommitEnabled(githubResponse.data.autoCommitEnabled);
				}
			} catch (githubErr) {
				console.warn("GitHub 상태 조회 실패 (무시):", githubErr);
				setGithubStatus({
					isConnected: false,
					githubUsername: undefined,
					githubProfileUrl: undefined,
					autoCommitEnabled: false,
				});
			}
		} catch (err: any) {
			console.error("마이페이지 데이터 조회 실패:", err);
			setError(err.message || "데이터를 불러오는데 실패했습니다.");
		} finally {
			setLoading(false);
		}
	};

	const handleAutoCommitToggle = async () => {
		try {
			const newStatus = !autoCommitEnabled;
			await APIService.toggleAutoCommit(newStatus);
			setAutoCommitEnabled(newStatus);
			alert(
				newStatus
					? "자동 커밋이 활성화되었습니다!"
					: "자동 커밋이 비활성화되었습니다.",
			);
		} catch (err) {
			console.error("자동 커밋 설정 실패:", err);
			alert("설정 변경에 실패했습니다.");
		}
	};

	const formatDate = (dateString: string): string => {
		if (!dateString) return "정보 없음";
		const date = new Date(dateString);
		return date.toLocaleDateString("ko-KR", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (loading) {
		return (
			<MainLayout>
				<S.Container>
					<LoadingSpinner message="마이페이지 정보를 불러오는 중..." />
				</S.Container>
			</MainLayout>
		);
	}

	if (error) {
		return (
			<MainLayout>
				<S.Container>
					<div
						style={{ textAlign: "center", padding: "3rem", color: "#ef4444" }}
					>
						<p>{error}</p>
						<S.Button onClick={fetchMyPageData}>다시 시도</S.Button>
					</div>
				</S.Container>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<S.Container>
				<S.ProfileCard>
					<S.ProfileHeader>
						<S.Avatar>{profile?.name?.charAt(0) || "?"}</S.Avatar>
						<S.ProfileInfo>
							<S.Name>{profile?.name}</S.Name>
							<S.Email>{profile?.email}</S.Email>
							{profile?.studentId && (
								<S.Email>학번: {profile.studentId}</S.Email>
							)}
							<div
								style={{
									marginTop: "0.5rem",
									fontSize: "0.85rem",
									color: "#9ca3af",
								}}
							>
								가입일: {formatDate(profile?.createdAt || "")}
							</div>
						</S.ProfileInfo>
					</S.ProfileHeader>

					{stats && (
						<S.StatsGrid>
							<S.StatItem>
								<S.StatValue>{stats.totalSubmissions}</S.StatValue>
								<S.StatLabel>총 제출 수</S.StatLabel>
							</S.StatItem>
							<S.StatItem>
								<S.StatValue>{stats.solvedProblems}</S.StatValue>
								<S.StatLabel>해결한 문제</S.StatLabel>
							</S.StatItem>
							<S.StatItem>
								<S.StatValue>{stats.successRate}%</S.StatValue>
								<S.StatLabel>정답률</S.StatLabel>
							</S.StatItem>
						</S.StatsGrid>
					)}
				</S.ProfileCard>

				{githubStatus && (
					<S.ProfileCard>
						<h3
							style={{
								fontSize: "1.25rem",
								fontWeight: 700,
								marginBottom: "1rem",
							}}
						>
							GitHub 연동
						</h3>
						{githubStatus.isConnected ? (
							<div>
								<p style={{ marginBottom: "1rem" }}>
									연결된 계정: <strong>{githubStatus.githubUsername}</strong>
								</p>
								<label
									style={{
										display: "flex",
										alignItems: "center",
										gap: "0.5rem",
									}}
								>
									<input
										type="checkbox"
										checked={autoCommitEnabled}
										onChange={handleAutoCommitToggle}
									/>
									자동 커밋 활성화
								</label>
							</div>
						) : (
							<p style={{ color: "#9ca3af" }}>
								GitHub 계정이 연동되어 있지 않습니다.
							</p>
						)}
					</S.ProfileCard>
				)}

				<div style={{ textAlign: "center", marginTop: "2rem" }}>
					<Link to="/mypage/assignments">
						<S.Button>내 과제 보기</S.Button>
					</Link>
				</div>
			</S.Container>
		</MainLayout>
	);
};

export default MyInfoPage;
