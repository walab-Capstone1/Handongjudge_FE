import type React from "react";
import * as S from "./styles";

interface AuthLayoutProps {
	children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => (
	<S.LayoutContainer>
		<S.ContentBox>{children}</S.ContentBox>
	</S.LayoutContainer>
);

export default AuthLayout;
