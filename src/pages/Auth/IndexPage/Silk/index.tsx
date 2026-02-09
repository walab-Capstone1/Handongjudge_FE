/* eslint-disable react/no-unknown-property */
// @ts-nocheck - @react-three/fiber의 mesh/planeGeometry/shaderMaterial JSX 타입
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type React from "react";
import { forwardRef, useRef, useMemo, useLayoutEffect, useEffect } from "react";
import * as THREE from "three";
import type { SilkProps } from "./types";

const hexToNormalizedRGB = (hex: string): [number, number, number] => {
	const clean = hex.replace("#", "");
	return [
		Number.parseInt(clean.slice(0, 2), 16) / 255,
		Number.parseInt(clean.slice(2, 4), 16) / 255,
		Number.parseInt(clean.slice(4, 6), 16) / 255,
	];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

type SilkPlaneProps = {
	uniforms: {
		uSpeed: { value: number };
		uScale: { value: number };
		uNoiseIntensity: { value: number };
		uColor: { value: THREE.Color };
		uRotation: { value: number };
		uTime: { value: number };
	};
};

const SilkPlane = forwardRef<THREE.Mesh, SilkPlaneProps>(function SilkPlane(
	{ uniforms },
	ref,
) {
	const { viewport } = useThree();

	useLayoutEffect(() => {
		if (ref && typeof ref !== "function" && ref.current) {
			ref.current.scale.set(viewport.width, viewport.height, 1);
		}
	}, [ref, viewport]);

	useFrame((_state, delta) => {
		if (
			ref &&
			typeof ref !== "function" &&
			ref.current &&
			ref.current.material &&
			(ref.current.material as THREE.ShaderMaterial).uniforms
		) {
			const uniformsObj = (ref.current.material as THREE.ShaderMaterial)
				.uniforms as { uSpeed?: { value: number }; uTime?: { value: number } };
			if (uniformsObj.uSpeed?.value !== undefined && uniformsObj.uTime) {
				uniformsObj.uTime.value += delta * uniformsObj.uSpeed.value;
			}
		}
	});

	return (
		<mesh ref={ref}>
			<planeGeometry args={[1, 1, 1, 1]} />
			<shaderMaterial
				uniforms={uniforms}
				vertexShader={vertexShader}
				fragmentShader={fragmentShader}
			/>
		</mesh>
	);
});
SilkPlane.displayName = "SilkPlane";

const Silk: React.FC<SilkProps> = ({
	speed = 5,
	scale = 1,
	color = "#7B7481",
	noiseIntensity = 1.5,
	rotation = 0,
}) => {
	const meshRef = useRef<THREE.Mesh>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const uniforms = useMemo(
		() => ({
			uSpeed: { value: speed },
			uScale: { value: scale },
			uNoiseIntensity: { value: noiseIntensity },
			uColor: { value: new THREE.Color(...hexToNormalizedRGB(color)) },
			uRotation: { value: rotation },
			uTime: { value: 0 },
		}),
		[speed, scale, noiseIntensity, color, rotation],
	);

	useEffect(() => {
		const handleResize = () => {
			if (containerRef.current) {
				containerRef.current.getBoundingClientRect();
			}
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div
			ref={containerRef}
			style={{
				width: "100%",
				height: "100%",
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
			}}
		>
			<Canvas
				dpr={[1, 2]}
				frameloop="always"
				style={{ width: "100%", height: "100%", display: "block" }}
				gl={{ antialias: true }}
				camera={{ position: [0, 0, 1] }}
			>
				<SilkPlane ref={meshRef} uniforms={uniforms} />
			</Canvas>
		</div>
	);
};

export default Silk;
