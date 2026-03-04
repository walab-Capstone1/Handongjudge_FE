import { useProblemImport } from "./hooks/useProblemImport";
import ProblemImportView from "./components/ProblemImportView";

const ProblemImport = () => {
	const hook = useProblemImport();
	return <ProblemImportView {...hook} />;
};

export default ProblemImport;
