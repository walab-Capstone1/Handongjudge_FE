import type React from "react";
import { useState, useEffect } from "react";
import TutorLayout from "../../../layouts/TutorLayout";
import APIService from "../../../services/APIService";
import { useAuth } from "../../../hooks/useAuth";
import * as S from "./styles";
import type { Settings } from "./types";

const SettingsPage: React.FC = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [settings, setSettings] = useState<Settings>({
		profile: {
			name: user?.name || "",
			email: user?.email || "",
		},
		notifications: {
			emailNotifications: true,
			assignmentReminders: true,
			submissionAlerts: true,
		},
		preferences: {
			theme: "light",
			language: "ko",
		},
	});

	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		// TODO: 백엔드에서 설정 불러오기
		// fetchSettings();
	}, []);

	const handleSave = async () => {
		try {
			setIsSaving(true);
			// TODO: 백엔드 API 연동
			// await APIService.updateSettings(settings);
			alert("설정이 저장되었습니다.");
		} catch (error) {
			console.error("설정 저장 실패:", error);
			alert("설정 저장에 실패했습니다.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleChange = <K extends keyof Settings>(
		section: K,
		key: keyof Settings[K],
		value: any,
	) => {
		setSettings((prev) => ({
			...prev,
			[section]: {
				...prev[section],
				[key]: value,
			},
		}));
	};

	if (loading) {
		return (
			<TutorLayout>
				<div style={{ padding: "2rem", textAlign: "center" }}>
					<p>로딩 중...</p>
				</div>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout>
			<S.Page>
				<div className="tutor-page-header">
					<h1 className="tutor-page-title">시스템 설정</h1>
				</div>

				<S.Content>
					{/* 프로필 설정 */}
					<S.Section>
						<S.SectionTitle>프로필 설정</S.SectionTitle>
						<S.Form>
							<S.FormGroup>
								<S.Label htmlFor="profile-name">이름</S.Label>
								<S.Input
									id="profile-name"
									type="text"
									value={settings.profile.name}
									onChange={(e) =>
										handleChange("profile", "name", e.target.value)
									}
									disabled
								/>
								<S.HelpText>이름 변경은 관리자에게 문의하세요.</S.HelpText>
							</S.FormGroup>
							<S.FormGroup>
								<S.Label htmlFor="profile-email">이메일</S.Label>
								<S.Input
									id="profile-email"
									type="email"
									value={settings.profile.email}
									onChange={(e) =>
										handleChange("profile", "email", e.target.value)
									}
									disabled
								/>
								<S.HelpText>이메일 변경은 관리자에게 문의하세요.</S.HelpText>
							</S.FormGroup>
						</S.Form>
					</S.Section>

					{/* 알림 설정 */}
					<S.Section>
						<S.SectionTitle>알림 설정</S.SectionTitle>
						<S.Form>
							<S.CheckboxGroup>
								<S.CheckboxLabel>
									<input
										type="checkbox"
										checked={settings.notifications.emailNotifications}
										onChange={(e) =>
											handleChange(
												"notifications",
												"emailNotifications",
												e.target.checked,
											)
										}
									/>
									<span>이메일 알림 받기</span>
								</S.CheckboxLabel>
							</S.CheckboxGroup>
							<S.CheckboxGroup>
								<S.CheckboxLabel>
									<input
										type="checkbox"
										checked={settings.notifications.assignmentReminders}
										onChange={(e) =>
											handleChange(
												"notifications",
												"assignmentReminders",
												e.target.checked,
											)
										}
									/>
									<span>과제 마감 알림</span>
								</S.CheckboxLabel>
							</S.CheckboxGroup>
							<S.CheckboxGroup>
								<S.CheckboxLabel>
									<input
										type="checkbox"
										checked={settings.notifications.submissionAlerts}
										onChange={(e) =>
											handleChange(
												"notifications",
												"submissionAlerts",
												e.target.checked,
											)
										}
									/>
									<span>제출 알림</span>
								</S.CheckboxLabel>
							</S.CheckboxGroup>
						</S.Form>
					</S.Section>

					{/* 환경 설정 */}
					<S.Section>
						<S.SectionTitle>환경 설정</S.SectionTitle>
						<S.Form>
							<S.FormGroup>
								<S.Label htmlFor="theme">테마</S.Label>
								<S.Select
									id="theme"
									value={settings.preferences.theme}
									onChange={(e) =>
										handleChange(
											"preferences",
											"theme",
											e.target.value as Settings["preferences"]["theme"],
										)
									}
								>
									<option value="light">라이트</option>
									<option value="dark">다크</option>
									<option value="auto">시스템 설정 따르기</option>
								</S.Select>
							</S.FormGroup>
							<S.FormGroup>
								<S.Label htmlFor="language">언어</S.Label>
								<S.Select
									id="language"
									value={settings.preferences.language}
									onChange={(e) =>
										handleChange(
											"preferences",
											"language",
											e.target.value as Settings["preferences"]["language"],
										)
									}
								>
									<option value="ko">한국어</option>
									<option value="en">English</option>
								</S.Select>
							</S.FormGroup>
						</S.Form>
					</S.Section>

					{/* DOMjudge 연동 상태 */}
					<S.Section>
						<S.SectionTitle>DOMjudge 연동 상태</S.SectionTitle>
						<S.InfoBox>
							<p>DOMjudge 연동 설정은 시스템 관리자에게 문의하세요.</p>
							<S.Status>
								<S.StatusIndicator />
								<span>연동 중</span>
							</S.Status>
						</S.InfoBox>
					</S.Section>

					{/* 저장 버튼 */}
					<S.Actions>
						<S.SaveButton onClick={handleSave} disabled={isSaving}>
							{isSaving ? "저장 중..." : "설정 저장"}
						</S.SaveButton>
					</S.Actions>
				</S.Content>
			</S.Page>
		</TutorLayout>
	);
};

export default SettingsPage;
