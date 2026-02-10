import type React from "react";
import { useIndexPage } from "./hooks/useIndexPage";
import IndexPageView from "./components/IndexPageView";

const IndexPage: React.FC = () => {
	const d = useIndexPage();
	return <IndexPageView {...d} />;
};

export default IndexPage;
