import { useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'bfd_authenticated';
const AUTH_TIMESTAMP_KEY = 'bfd_auth_timestamp';
const AUTH_PASSWORD = 'branding';
const AUTH_EXPIRY_HOURS = 1; // 認証の有効期限（時間）

/**
 * 認証状態管理フック
 * 
 * 機能:
 * - 認証状態の管理（localStorageで永続化）
 * - キーボード入力による認証
 * - 認証状態のリセット
 * - 1時間ごとの自動認証期限切れ
 * 
 * セキュリティに関する注意:
 * - この認証はクライアントサイドのみで動作するため、ソースコードを見ればキーワードは判明します
 * - 本番環境では、より強固な認証（サーバーサイド認証、JWT等）の使用を推奨します
 * - この実装は簡易的なアクセス制御としての用途を想定しています
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // 初期状態をlocalStorageから読み込み
    const stored = localStorage.getItem(AUTH_KEY);
    const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);
    
    if (stored !== 'true' || !timestamp) {
      return false;
    }

    // タイムスタンプをチェック（1時間以内か）
    const authTime = parseInt(timestamp, 10);
    const now = Date.now();
    const hoursElapsed = (now - authTime) / (1000 * 60 * 60);

    if (hoursElapsed >= AUTH_EXPIRY_HOURS) {
      // 期限切れの場合は認証状態をクリア
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_TIMESTAMP_KEY);
      return false;
    }

    return true;
  });

  const [inputBuffer, setInputBuffer] = useState<string>('');

  // 認証成功時の処理
  const authenticate = useCallback(() => {
    const now = Date.now();
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(AUTH_TIMESTAMP_KEY, now.toString());
    setInputBuffer(''); // 入力バッファをクリア
  }, []);

  // ログアウト処理
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
    setInputBuffer('');
  }, []);

  // 認証期限のチェック（1時間ごと）
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const checkAuthExpiry = () => {
      const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);
      if (!timestamp) {
        logout();
        return;
      }

      const authTime = parseInt(timestamp, 10);
      const now = Date.now();
      const hoursElapsed = (now - authTime) / (1000 * 60 * 60);

      if (hoursElapsed >= AUTH_EXPIRY_HOURS) {
        logout();
      }
    };

    // 初回チェック
    checkAuthExpiry();

    // 1分ごとにチェック（1時間経過を検知するため）
    const interval = setInterval(checkAuthExpiry, 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, logout]);

  // キーボード入力の検知
  useEffect(() => {
    if (isAuthenticated) {
      return; // 既に認証済みの場合は何もしない
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // 特殊キー（Ctrl, Alt, Shift, Meta, Escape, Enter, Tab等）は無視
      if (
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        e.key === 'Escape' ||
        e.key === 'Enter' ||
        e.key === 'Tab' ||
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key.length > 1 // 特殊キー（ArrowUp, F1等）
      ) {
        return;
      }

      // 通常の文字キーのみを処理
      const newBuffer = (inputBuffer + e.key).toLowerCase();
      
      // パスワードが含まれているかチェック
      if (newBuffer.includes(AUTH_PASSWORD)) {
        authenticate();
      } else {
        // バッファを更新（最大20文字まで保持）
        const trimmedBuffer = newBuffer.slice(-20);
        setInputBuffer(trimmedBuffer);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthenticated, inputBuffer, authenticate]);

  return {
    isAuthenticated,
    authenticate,
    logout,
    inputBuffer, // デバッグ用（必要に応じて削除可能）
  };
};

