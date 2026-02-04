import type React from "react";
import Navbar from "../../components/Navbar";
import * as S from "./styles";

interface MainLayoutProps {
	children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
	<S.LayoutContainer>
		<Navbar />
		<S.MainContent>{children}</S.MainContent>
	</S.LayoutContainer>
);

export default MainLayout;
