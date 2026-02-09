import type React from "react";
import { useSignUpPageSocial } from "./hooks/useSignUpPageSocial";
import SignUpPageSocialView from "./components/SignUpPageSocialView";

const SignUpPageSocial: React.FC = () => {
	const d = useSignUpPageSocial();
	return <SignUpPageSocialView {...d} />;
};

export default SignUpPageSocial;
