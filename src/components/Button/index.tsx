import type React from "react";
import * as S from "./styles";
import type { ButtonProps } from "./types";

const Button: React.FC<ButtonProps> = ({ children, ...props }) => (
	<S.StyledButton {...props}>{children}</S.StyledButton>
);

export default Button;
