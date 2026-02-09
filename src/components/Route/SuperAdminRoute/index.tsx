import type React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import type { SuperAdminRouteProps } from "./types";

const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
	const { user, isAuthenticated, loading } = useAuth();

	if (loading) {
		return <div>Loading...</div>;
	}

	const isSuperAdmin = user?.role === "SUPER_ADMIN";

	if (!isAuthenticated || !isSuperAdmin) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};

export default SuperAdminRoute;
