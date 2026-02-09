import type React from "react";
import { useAuthCallback } from "./hooks/useAuthCallback";
import AuthCallbackView from "./components/AuthCallbackView";

const AuthCallback: React.FC = () => {
	const d = useAuthCallback();
	return <AuthCallbackView {...d} />;
};

export default AuthCallback;
