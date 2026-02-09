import type { FC } from "react";
import * as S from "../styles";
import type { Settings } from "../types";

interface SettingsContentProps {
	settings: Settings;
	isSaving: boolean;
	onChange: <K extends keyof Settings>(
		section: K,
		key: keyof Settings[K],
		value: Settings[K][keyof Settings[K]],
	) => void;
	onSave: () => void;
}

const SettingsContent: FC<SettingsContentProps> = ({
	settings,
	isSaving,
	onChange,
	onSave,
}) => (
	<S.Content>
		<S.Section>
			<S.SectionTitle>프로필 설정</S.SectionTitle>
			<S.Form>
				<S.FormGroup>
					<S.Label htmlFor="profile-name">이름</S.Label>
					<S.Input
						id="profile-name"
						type="text"
						value={settings.profile.name}
						onChange={(e) => onChange("profile", "name", e.target.value)}
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
						onChange={(e) => onChange("profile", "email", e.target.value)}
						disabled
					/>
					<S.HelpText>이메일 변경은 관리자에게 문의하세요.</S.HelpText>
				</S.FormGroup>
			</S.Form>
		</S.Section>
		<S.Section>
			<S.SectionTitle>알림 설정</S.SectionTitle>
			<S.Form>
				<S.CheckboxGroup>
					<S.CheckboxLabel>
						<input
							type="checkbox"
							checked={settings.notifications.emailNotifications}
							onChange={(e) =>
								onChange(
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
								onChange(
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
								onChange("notifications", "submissionAlerts", e.target.checked)
							}
						/>
						<span>제출 알림</span>
					</S.CheckboxLabel>
				</S.CheckboxGroup>
			</S.Form>
		</S.Section>
		<S.Section>
			<S.SectionTitle>환경 설정</S.SectionTitle>
			<S.Form>
				<S.FormGroup>
					<S.Label htmlFor="theme">테마</S.Label>
					<S.Select
						id="theme"
						value={settings.preferences.theme}
						onChange={(e) =>
							onChange(
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
							onChange(
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
		<S.Actions>
			<S.SaveButton onClick={onSave} disabled={isSaving}>
				{isSaving ? "저장 중..." : "설정 저장"}
			</S.SaveButton>
		</S.Actions>
	</S.Content>
);
export default SettingsContent;
