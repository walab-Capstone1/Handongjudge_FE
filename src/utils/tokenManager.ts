/**
 * 토큰 매니저
 * - Access Token: 메모리(변수)에만 저장 → XSS로 탈취 불가
 * - Refresh Token: HttpOnly 쿠키에서 처리 (JS에서 접근 불가)
 *
 * 페이지 새로고침 시 메모리가 초기화되지만, restoreAuth()가
 * Refresh Token 쿠키를 이용해 Access Token을 자동 재발급합니다.
 */

interface JwtPayload {
	exp?: number;
	[key: string]: unknown;
}

export interface TokenRefreshData {
	accessToken?: string;
	[key: string]: unknown;
}

class TokenManager {
	private accessToken: string | null = null;
	private onTokenRefresh: ((data: TokenRefreshData) => void) | null = null;
	private onTokenExpired: (() => void) | null = null;

	setCallbacks(
		onTokenRefresh: ((data: TokenRefreshData) => void) | null,
		onTokenExpired: (() => void) | null,
	): void {
		this.onTokenRefresh = onTokenRefresh;
		this.onTokenExpired = onTokenExpired;
	}

	setAccessToken(token: string | null): void {
		this.accessToken = token;
	}

	getAccessToken(): string | null {
		return this.accessToken;
	}

	clearTokens(): void {
		this.accessToken = null;
	}

	isTokenValid(): boolean {
		return Boolean(this.accessToken && !this.isTokenExpired(this.accessToken));
	}

	isTokenExpired(token: string | null): boolean {
		if (!token) return true;
		try {
			const payload = this.decodeJWT(token);
			if (!payload?.exp) return true;
			const currentTime = Math.floor(Date.now() / 1000);
			return payload.exp < currentTime;
		} catch {
			return true;
		}
	}

	private decodeJWT(token: string): JwtPayload | null {
		try {
			const base64Url = token.split(".")[1];
			const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
			const jsonPayload = decodeURIComponent(
				atob(base64)
					.split("")
					.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
					.join(""),
			);
			return JSON.parse(jsonPayload) as JwtPayload;
		} catch {
			return null;
		}
	}

	async refreshToken(): Promise<TokenRefreshData> {
		try {
			const apiUrl =
				process.env.REACT_APP_API_URL ?? "https://hcl.walab.info/api";
			const response = await fetch(`${apiUrl}/auth/refresh`, {
				method: "POST",
				credentials: "include", // Refresh Token 쿠키 자동 전송
				headers: { "Content-Type": "application/json" },
			});

			if (response.ok) {
				const data = (await response.json()) as TokenRefreshData;
				if (data.accessToken) this.setAccessToken(data.accessToken);
				this.onTokenRefresh?.(data);
				return data;
			}
			throw new Error("토큰 갱신 실패");
		} catch (error) {
			console.error("토큰 갱신 오류:", error);
			this.handleTokenExpired();
			throw error;
		}
	}

	handleTokenExpired(): void {
		this.clearTokens();
		this.onTokenExpired?.();
	}

	/**
	 * 앱 초기화 시 인증 복원
	 * 메모리에 토큰이 없으면 Refresh Token 쿠키로 자동 재발급 시도
	 */
	async restoreAuth(): Promise<{ accessToken: string } | null> {
		// 메모리에 유효한 토큰이 있으면 그대로 사용
		if (this.accessToken && !this.isTokenExpired(this.accessToken)) {
			return { accessToken: this.accessToken };
		}

		// 메모리 토큰이 없거나 만료됨 → Refresh Token 쿠키로 재발급 시도
		try {
			const refreshed = await this.refreshToken();
			if (refreshed.accessToken) {
				return { accessToken: refreshed.accessToken };
			}
		} catch {
			// Refresh Token도 만료됨 → 로그인 필요
		}
		return null;
	}
}

const tokenManager = new TokenManager();
export default tokenManager;
