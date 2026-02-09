import type React from "react";
import { useSignupEmailPage } from "./hooks/useSignupEmailPage";
import SignupEmailPageView from "./components/SignupEmailPageView";

const SignupEmailPage: React.FC = () => {
	const d = useSignupEmailPage();
	return <SignupEmailPageView {...d} />;
};

export default SignupEmailPage;
