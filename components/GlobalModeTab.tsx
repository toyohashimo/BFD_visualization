/**
 * グローバルモード切り替えタブ
 * 
 * 詳細分析モードと過去比較モードを切り替えるタブUI
 */

import React from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';
import { GlobalMode, GLOBAL_MODE_LABELS } from '../src/types/globalMode';

interface GlobalModeTabProps {
  /** 現在のグローバルモード */
  globalMode: GlobalMode;
  
  /** グローバルモード変更ハンドラ */
  setGlobalMode: (mode: GlobalMode) => void;
}

/**
 * グローバルモードタブコンポーネント
 */
export const GlobalModeTab: React.FC<GlobalModeTabProps> = ({
  globalMode,
  setGlobalMode
}) => {
  return (
    <div className="flex border-b border-gray-200 mb-4">
      {/* 詳細分析タブ */}
      <button
        onClick={() => setGlobalMode('detailed')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
          globalMode === 'detailed'
            ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
        }`}
        title={GLOBAL_MODE_LABELS.detailed}
      >
        <BarChart2 className="w-4 h-4" />
        {GLOBAL_MODE_LABELS.detailed}
      </button>

      {/* 過去比較タブ */}
      <button
        onClick={() => setGlobalMode('historical')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
          globalMode === 'historical'
            ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
        }`}
        title={GLOBAL_MODE_LABELS.historical}
      >
        <TrendingUp className="w-4 h-4" />
        {GLOBAL_MODE_LABELS.historical}
      </button>
    </div>
  );
};

