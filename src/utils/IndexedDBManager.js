class IndexedDBManager {
  constructor() {
    this.dbName = 'CodeSturdyDB';
    this.dbVersion = 1;
    this.storeName = 'codeStorage';
    this.db = null;
  }

  // 브라우저 호환성 체크
  isSupported() {
    if (!window.indexedDB) {
      console.warn('IndexedDB is not supported in this browser');
      return false;
    }
    return true;
  }

  // 데이터베이스 초기화
  async init() {
    if (!this.isSupported()) {
      throw new Error('IndexedDB is not supported');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB 열기 실패:', request.error);
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB 초기화 완료');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // codeStorage 객체 저장소 생성
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          
          // 인덱스 생성
          store.createIndex('sessionId', 'sessionId', { unique: false });
          store.createIndex('problemId', 'problemId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          
          console.log('IndexedDB 객체 저장소 생성 완료');
        }
      };
    });
  }

  // 고유한 세션 ID 생성
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const sessionId = `session_${timestamp}_${random}`;
    
    // sessionStorage에 저장 (탭이 닫히면 사라짐)
    sessionStorage.setItem('judgeSessionId', sessionId);
    
    return sessionId;
  }

  // 현재 세션 ID 조회
  getSessionId() {
    let sessionId = sessionStorage.getItem('judgeSessionId');
    if (!sessionId) {
      sessionId = this.generateSessionId();
    }
    return sessionId;
  }

  // 세션 코드 저장
  async saveSessionCode(problemId, sectionId, language, code) {
    if (!this.db) await this.init();

    const sessionId = this.getSessionId();
    const data = {
      id: `${sessionId}_${problemId}_${sectionId}_${language}`,
      sessionId,
      problemId: parseInt(problemId),
      sectionId: parseInt(sectionId),
      language,
      code,
      timestamp: Date.now(),
      savedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(data);

      request.onsuccess = () => {
        console.log('세션 코드 저장 완료:', data.id);
        resolve(data);
      };

      request.onerror = () => {
        console.error('세션 코드 저장 실패:', request.error);
        reject(new Error('Failed to save session code'));
      };
    });
  }

  // 세션 코드 조회
  async getSessionCode(problemId, sectionId, language) {
    if (!this.db) await this.init();

    const sessionId = this.getSessionId();
    const id = `${sessionId}_${problemId}_${sectionId}_${language}`;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          console.log('세션 코드 조회 성공:', result.id);
          resolve(result);
        } else {
          console.log('세션 코드 없음:', id);
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('세션 코드 조회 실패:', request.error);
        reject(new Error('Failed to get session code'));
      };
    });
  }

  // 현재 세션의 모든 코드 조회
  async getAllSessionCodes() {
    if (!this.db) await this.init();

    const sessionId = this.getSessionId();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('sessionId');
      const request = index.getAll(sessionId);

      request.onsuccess = () => {
        console.log(`세션 ${sessionId}의 모든 코드 조회:`, request.result.length);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('세션 코드 전체 조회 실패:', request.error);
        reject(new Error('Failed to get all session codes'));
      };
    });
  }

  // 특정 세션 코드 삭제
  async deleteSessionCode(problemId, sectionId, language) {
    if (!this.db) await this.init();

    const sessionId = this.getSessionId();
    const id = `${sessionId}_${problemId}_${sectionId}_${language}`;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('세션 코드 삭제 완료:', id);
        resolve(true);
      };

      request.onerror = () => {
        console.error('세션 코드 삭제 실패:', request.error);
        reject(new Error('Failed to delete session code'));
      };
    });
  }

  // 현재 세션의 모든 데이터 삭제
  async clearCurrentSession() {
    if (!this.db) await this.init();

    const sessionId = this.getSessionId();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('sessionId');
      const request = index.openCursor(IDBKeyRange.only(sessionId));

      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
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
        console.error('세션 정리 실패:', request.error);
        reject(new Error('Failed to clear session'));
      };
    });
  }

  // 오래된 데이터 정리 (7일 이상 된 데이터)
  async cleanupOldData() {
    if (!this.db) await this.init();

    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7일 전

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(weekAgo));

      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
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
        console.error('데이터 정리 실패:', request.error);
        reject(new Error('Failed to cleanup old data'));
      };
    });
  }

  // 데이터베이스 연결 해제
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('IndexedDB 연결 해제');
    }
  }

  // 전체 데이터베이스 삭제 (개발용)
  async deleteDatabase() {
    this.close();
    
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(this.dbName);
      
      deleteRequest.onsuccess = () => {
        console.log('IndexedDB 삭제 완료');
        resolve(true);
      };
      
      deleteRequest.onerror = () => {
        console.error('IndexedDB 삭제 실패');
        reject(new Error('Failed to delete database'));
      };
    });
  }
}

// 싱글톤 인스턴스 생성
const indexedDBManager = new IndexedDBManager();

export default indexedDBManager;
