import type { FC } from "react";
import { useCodingTestDetail } from "./hooks/useCodingTestDetail";
import CodingTestDetailView from "./components/CodingTestDetailView";

const CodingTestDetail: FC = () => {
	const d = useCodingTestDetail();
	return <CodingTestDetailView {...d} />;
};

export default CodingTestDetail;
