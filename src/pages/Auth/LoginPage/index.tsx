import type React from "react";
import { useLoginPage } from "./hooks/useLoginPage";
import LoginPageView from "./components/LoginPageView";

const LoginPage: React.FC = () => {
	const d = useLoginPage();
	return <LoginPageView {...d} />;
};

export default LoginPage;
