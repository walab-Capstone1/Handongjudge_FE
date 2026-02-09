import type React from "react";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertProps {
	type?: AlertType;
	message?: string;
	onClose?: () => void;
	children?: React.ReactNode;
}
