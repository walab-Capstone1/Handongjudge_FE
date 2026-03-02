import type React from "react";
import { useProblemCreate } from "./hooks/useProblemCreate";
import ProblemCreateView from "./components/ProblemCreateView";

export { default as ProblemPreview } from "./components/ProblemPreview";
export type { ProblemPreviewProps } from "./components/ProblemPreview";

const ProblemCreate: React.FC = () => {
	const d = useProblemCreate();
	return <ProblemCreateView {...d} />;
};
export default ProblemCreate;
