export interface CodeStorageRecord {
	id: string;
	sessionId: string;
	problemId: number;
	sectionId: number;
	language: string;
	code: string;
	timestamp: number;
	savedAt: string;
}

interface IDBRequestEventTarget extends EventTarget {
	result?: IDBDatabase;
	error?: DOMException;
}

interface IDBOpenDBRequestEvent extends Event {
	target: IDBRequestEventTarget & { result?: IDBDatabase };
}

class IndexedDBManager {
	private dbName = "CodeSturdyDB";
	private dbVersion = 1;
	private storeName = "codeStorage";
	private db: IDBDatabase | null = null;

	isSupported(): boolean {
		if (typeof window === "undefined" || !window.indexedDB) {
			console.warn("IndexedDB is not supported in this browser");
			return false;
		}
		return true;
	}

	async init(): Promise<IDBDatabase> {
		if (!this.isSupported()) {
			throw new Error("IndexedDB is not supported");
		}

		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);

			request.onerror = () => {
				console.error("IndexedDB 열기 실패:", request.error);
				reject(new Error("Failed to open IndexedDB"));
			};

			request.onsuccess = () => {
				this.db = request.result ?? null;
				if (this.db) {
					console.log("IndexedDB 초기화 완료");
					resolve(this.db);
				} else {
					reject(new Error("Failed to open IndexedDB"));
				}
			};

			request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
				const db = (event.target as IDBOpenDBRequest).result;
				if (!db) return;
				if (!db.objectStoreNames.contains(this.storeName)) {
					const store = db.createObjectStore(this.storeName, { keyPath: "id" });
					store.createIndex("sessionId", "sessionId", { unique: false });
					store.createIndex("problemId", "problemId", { unique: false });
					store.createIndex("timestamp", "timestamp", { unique: false });
					console.log("IndexedDB 객체 저장소 생성 완료");
				}
			};
		});
	}

	generateSessionId(): string {
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 15);
		const sessionId = `session_${timestamp}_${random}`;
		sessionStorage.setItem("judgeSessionId", sessionId);
		return sessionId;
	}

	getSessionId(): string {
		let sessionId = sessionStorage.getItem("judgeSessionId");
		if (!sessionId) {
			sessionId = this.generateSessionId();
		}
		return sessionId;
	}

	async saveSessionCode(
		problemId: number | string,
		sectionId: number | string,
		language: string,
		code: string,
	): Promise<CodeStorageRecord> {
		if (!this.db) await this.init();

		const sessionId = this.getSessionId();
		const pid =
			typeof problemId === "string"
				? Number.parseInt(problemId, 10)
				: problemId;
		const sid =
			typeof sectionId === "string"
				? Number.parseInt(sectionId, 10)
				: sectionId;
		const data: CodeStorageRecord = {
			id: `${sessionId}_${pid}_${sid}_${language}`,
			sessionId,
			problemId: pid,
			sectionId: sid,
			language,
			code,
			timestamp: Date.now(),
			savedAt: new Date().toISOString(),
		};

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("DB not initialized"));
				return;
			}
			const transaction = this.db.transaction([this.storeName], "readwrite");
			const store = transaction.objectStore(this.storeName);
			const request = store.put(data);

			request.onsuccess = () => {
				console.log("세션 코드 저장 완료:", data.id);
				resolve(data);
			};

			request.onerror = () => {
				console.error("세션 코드 저장 실패:", request.error);
				reject(new Error("Failed to save session code"));
			};
		});
	}

	async getSessionCode(
		problemId: number | string,
		sectionId: number | string,
		language: string,
	): Promise<CodeStorageRecord | null> {
		if (!this.db) await this.init();

		const sessionId = this.getSessionId();
		const pid =
			typeof problemId === "string"
				? Number.parseInt(problemId, 10)
				: problemId;
		const sid =
			typeof sectionId === "string"
				? Number.parseInt(sectionId, 10)
				: sectionId;
		const id = `${sessionId}_${pid}_${sid}_${language}`;

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("DB not initialized"));
				return;
			}
			const transaction = this.db.transaction([this.storeName], "readonly");
			const store = transaction.objectStore(this.storeName);
			const request = store.get(id);

			request.onsuccess = () => {
				const result = request.result as CodeStorageRecord | undefined;
				if (result) {
					console.log("세션 코드 조회 성공:", result.id);
					resolve(result);
				} else {
					console.log("세션 코드 없음:", id);
					resolve(null);
				}
			};

			request.onerror = () => {
				console.error("세션 코드 조회 실패:", request.error);
				reject(new Error("Failed to get session code"));
			};
		});
	}

	async getAllSessionCodes(): Promise<CodeStorageRecord[]> {
		if (!this.db) await this.init();

		const sessionId = this.getSessionId();

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("DB not initialized"));
				return;
			}
			const transaction = this.db.transaction([this.storeName], "readonly");
			const store = transaction.objectStore(this.storeName);
			const index = store.index("sessionId");
			const request = index.getAll(sessionId);

			request.onsuccess = () => {
				const result = (request.result ?? []) as CodeStorageRecord[];
				console.log(`세션 ${sessionId}의 모든 코드 조회:`, result.length);
				resolve(result);
			};

			request.onerror = () => {
				console.error("세션 코드 전체 조회 실패:", request.error);
				reject(new Error("Failed to get all session codes"));
			};
		});
	}

	async deleteSessionCode(
		problemId: number | string,
		sectionId: number | string,
		language: string,
	): Promise<boolean> {
		if (!this.db) await this.init();

		const sessionId = this.getSessionId();
		const pid =
			typeof problemId === "string"
				? Number.parseInt(problemId, 10)
				: problemId;
		const sid =
			typeof sectionId === "string"
				? Number.parseInt(sectionId, 10)
				: sectionId;
		const id = `${sessionId}_${pid}_${sid}_${language}`;

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("DB not initialized"));
				return;
			}
			const transaction = this.db.transaction([this.storeName], "readwrite");
			const store = transaction.objectStore(this.storeName);
			const request = store.delete(id);

			request.onsuccess = () => {
				console.log("세션 코드 삭제 완료:", id);
				resolve(true);
			};

			request.onerror = () => {
				console.error("세션 코드 삭제 실패:", request.error);
				reject(new Error("Failed to delete session code"));
			};
		});
	}

	async clearCurrentSession(): Promise<number> {
		if (!this.db) await this.init();

		const sessionId = this.getSessionId();

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("DB not initialized"));
				return;
			}
			const transaction = this.db.transaction([this.storeName], "readwrite");
			const store = transaction.objectStore(this.storeName);
			const index = store.index("sessionId");
			const request = index.openCursor(IDBKeyRange.only(sessionId));

			let deletedCount = 0;

			request.onsuccess = (event: Event) => {
				const cursor = (event.target as IDBRequest).result;
				if (cursor) {
					cursor.delete();
					deletedCount++;
					cursor.continue();
				} else {
					console.log(`세션 ${sessionId} 정리 완료 - ${deletedCount}개 삭제`);
					resolve(deletedCount);
				}
			};

			request.onerror = () => {
				console.error("세션 정리 실패:", request.error);
				reject(new Error("Failed to clear session"));
			};
		});
	}

	async cleanupOldData(): Promise<number> {
		if (!this.db) await this.init();

		const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("DB not initialized"));
				return;
			}
			const transaction = this.db.transaction([this.storeName], "readwrite");
			const store = transaction.objectStore(this.storeName);
			const index = store.index("timestamp");
			const request = index.openCursor(IDBKeyRange.upperBound(weekAgo));

			let deletedCount = 0;

			request.onsuccess = (event: Event) => {
				const cursor = (event.target as IDBRequest).result;
				if (cursor) {
					cursor.delete();
					deletedCount++;
					cursor.continue();
				} else {
					console.log(`오래된 데이터 정리 완료 - ${deletedCount}개 삭제`);
					resolve(deletedCount);
				}
			};

			request.onerror = () => {
				console.error("데이터 정리 실패:", request.error);
				reject(new Error("Failed to cleanup old data"));
			};
		});
	}

	close(): void {
		if (this.db) {
			this.db.close();
			this.db = null;
			console.log("IndexedDB 연결 해제");
		}
	}

	async deleteDatabase(): Promise<boolean> {
		this.close();

		return new Promise((resolve, reject) => {
			const deleteRequest = indexedDB.deleteDatabase(this.dbName);

			deleteRequest.onsuccess = () => {
				console.log("IndexedDB 삭제 완료");
				resolve(true);
			};

			deleteRequest.onerror = () => {
				console.error("IndexedDB 삭제 실패");
				reject(new Error("Failed to delete database"));
			};
		});
	}
}

const indexedDBManager = new IndexedDBManager();
export default indexedDBManager;
