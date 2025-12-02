import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AISummaryButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const AISummaryButton: React.FC<AISummaryButtonProps> = ({
  onClick,
  isLoading,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ai-summary-button
        absolute top-4 right-4 z-10
        flex items-center gap-2
        px-4 py-2.5
        bg-indigo-600 text-white
        rounded-lg shadow-lg
        hover:bg-indigo-700
        disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-all duration-200
        group
      `}
      title="AIサマリーを生成"
      aria-label="AIサマリーを生成"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">生成中...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AIサマリー</span>
        </>
      )}
    </button>
  );
};

