import React from 'react';
import { useAuth } from '../src/hooks/useAuth';

/**
 * ログイン画面コンポーネント
 * 
 * 機能:
 * - 「BFD」という文字を中央に表示（グレー色）
 * - キーボード入力で「branding」と入力すると認証される
 * - 入力中の文字列を点（•）でマスクして表示
 * - シンプルでミニマルなデザイン
 */
export const LoginScreen: React.FC = () => {
  const { inputBuffer } = useAuth();

  // 入力中の文字数を計算
  const inputLength = inputBuffer.length;

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-white">
      <div className="text-center">
        <h1 className="text-8xl md:text-9xl font-bold text-gray-400 tracking-wider">
          BFD
        </h1>
        
        {/* 入力中の文字列を視覚的に表示（点でマスク） */}
        {/* 固定の高さを確保してBFDの位置がずれないようにする */}
        <div className="mt-8 h-6 flex flex-col items-center justify-center">
          {inputLength > 0 && (
            <p className="text-xs text-gray-400 font-mono tracking-wider">
              {Array(inputLength).fill('•').join('')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

