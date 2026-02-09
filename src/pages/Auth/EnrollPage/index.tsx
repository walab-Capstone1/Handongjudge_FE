import type React from "react";
import { useEnrollPage } from "./hooks/useEnrollPage";
import EnrollPageView from "./components/EnrollPageView";

const EnrollPage: React.FC = () => {
	const d = useEnrollPage();
	return <EnrollPageView {...d} />;
};

export default EnrollPage;
