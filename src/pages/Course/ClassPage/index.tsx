import type React from "react";
import { useClassPage } from "./hooks/useClassPage";
import ClassPageView from "./components/ClassPageView";

const ClassPage: React.FC = () => {
	const d = useClassPage();
	return <ClassPageView {...d} />;
};

export default ClassPage;
