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
	// 동시에 여러 곳에서 refresh를 호출해도 실제 요청은 1번만 → Rotation 충돌 방지
	private refreshPromise: Promise<TokenRefreshData> | null = null;

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

	/**
	 * Refresh Token 쿠키로 Access Token을 갱신.
	 * 동시에 여러 곳에서 호출되어도 실제 요청은 1번만 발생(뮤텍스).
	 * 실패 시 그냥 throw만 함 → 호출자(APIService/restoreAuth)가 직접 처리.
	 */
	async refreshToken(): Promise<TokenRefreshData> {
		// 이미 진행 중인 refresh가 있으면 같은 promise를 반환
		if (this.refreshPromise) {
			return this.refreshPromise;
		}

		this.refreshPromise = this._doRefreshToken();
		try {
			return await this.refreshPromise;
		} finally {
			this.refreshPromise = null;
		}
	}

	private async _doRefreshToken(): Promise<TokenRefreshData> {
		const apiUrl =
			process.env.REACT_APP_API_URL ?? "https://hcl.walab.info/api";
		const response = await fetch(`${apiUrl}/auth/refresh`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		});

		if (response.ok) {
			const data = (await response.json()) as TokenRefreshData;
			if (data.accessToken) this.setAccessToken(data.accessToken);
			this.onTokenRefresh?.(data);
			return data;
		}
		// refresh 실패 시 그냥 throw → 호출자가 handleTokenExpired 여부를 결정
		const errorData = await response.json().catch(() => ({})) as { message?: string };
		throw new Error(errorData.message ?? "토큰 갱신 실패");
	}

	handleTokenExpired(): void {
		this.clearTokens();
		this.onTokenExpired?.();
	}

	/**
	 * 앱 초기화 시 인증 복원.
	 * 메모리에 토큰이 없으면 Refresh Token 쿠키로 자동 재발급 시도.
	 * 실패(처음 방문, 쿠키 없음, 만료 등)는 조용히 null 반환 → alert 없음.
	 */
	async restoreAuth(): Promise<{ accessToken: string } | null> {
		if (this.accessToken && !this.isTokenExpired(this.accessToken)) {
			return { accessToken: this.accessToken };
		}

		try {
			const refreshed = await this.refreshToken();
			if (refreshed.accessToken) {
				return { accessToken: refreshed.accessToken };
			}
		} catch {
			// 비로그인 상태이거나 쿠키 만료 → 조용히 비인증 처리
		}
		return null;
	}
}

const tokenManager = new TokenManager();
export default tokenManager;
