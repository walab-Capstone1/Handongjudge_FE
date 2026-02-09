import type { FC } from "react";
import TutorLayout from "../../../../layouts/TutorLayout";
import { useSettingsPage } from "./hooks/useSettingsPage";
import * as S from "./styles";
import SettingsContent from "./components/SettingsContent";

const SettingsPage: FC = () => {
	const { loading, settings, isSaving, handleSave, handleChange } =
		useSettingsPage();

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
				<SettingsContent
					settings={settings}
					isSaving={isSaving}
					onChange={handleChange}
					onSave={handleSave}
				/>
			</S.Page>
		</TutorLayout>
	);
};

export default SettingsPage;
