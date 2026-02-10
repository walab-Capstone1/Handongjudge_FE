/**
 * 토큰 매니저
 * Access Token은 localStorage에 저장, Refresh Token은 httpOnly 쿠키에서 처리
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
	private accessToken: string | null;
	private onTokenRefresh: ((data: TokenRefreshData) => void) | null;
	private onTokenExpired: (() => void) | null;

	constructor() {
		this.accessToken = this.getStoredAccessToken();
		this.onTokenRefresh = null;
		this.onTokenExpired = null;
	}

	setCallbacks(
		onTokenRefresh: ((data: TokenRefreshData) => void) | null,
		onTokenExpired: (() => void) | null,
	): void {
		this.onTokenRefresh = onTokenRefresh;
		this.onTokenExpired = onTokenExpired;
	}

	getStoredAccessToken(): string | null {
		try {
			return localStorage.getItem("accessToken");
		} catch (error) {
			console.error("localStorage 접근 오류:", error);
			return null;
		}
	}

	private setStoredAccessToken(token: string | null): void {
		try {
			if (token) {
				localStorage.setItem("accessToken", token);
			} else {
				localStorage.removeItem("accessToken");
			}
		} catch (error) {
			console.error("localStorage 저장 오류:", error);
		}
	}

	setAccessToken(token: string | null): void {
		this.accessToken = token;
		this.setStoredAccessToken(token);
	}

	getAccessToken(): string | null {
		return this.accessToken;
	}

	clearTokens(): void {
		this.accessToken = null;
		this.setStoredAccessToken(null);
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
				process.env.REACT_APP_API_URL ?? "http://10.10.200.10:8080/api";
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

	async restoreAuth(): Promise<{ accessToken: string } | null> {
		const token = this.getStoredAccessToken();
		if (token && !this.isTokenExpired(token)) {
			this.accessToken = token;
			return { accessToken: token };
		}
		return null;
	}
}

const tokenManager = new TokenManager();
export default tokenManager;
