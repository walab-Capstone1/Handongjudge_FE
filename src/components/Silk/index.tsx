import type React from "react";

// Silk 컴포넌트는 react-three-fiber 타입 이슈로 인해 임시로 빈 컴포넌트로 대체
interface SilkProps {
	speed?: number;
	scale?: number;
	color?: string;
	noiseIntensity?: number;
	rotation?: number;
}

const Silk: React.FC<SilkProps> = () => {
	return null;
};

export default Silk;
