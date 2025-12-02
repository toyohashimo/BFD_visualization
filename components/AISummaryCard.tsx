import React, { useState } from 'react';
import { Sparkles, Copy, Check, ChevronDown, ChevronUp, X } from 'lucide-react';

interface AISummaryCardProps {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({
  summary,
  isLoading,
  error,
  onClear,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summary) return;
    
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!summary && !isLoading && !error) {
    return null;
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-indigo-900">AIサマリー</h3>
        </div>
        <div className="flex items-center gap-2">
          {summary && (
            <>
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-indigo-100 rounded-lg transition-colors"
                title="コピー"
                aria-label="コピー"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-indigo-600" />
                )}
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-indigo-100 rounded-lg transition-colors"
                title={isExpanded ? '折りたたむ' : '展開する'}
                aria-label={isExpanded ? '折りたたむ' : '展開する'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-indigo-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            </>
          )}
          {(summary || error) && (
            <button
              onClick={onClear}
              className="p-1.5 hover:bg-indigo-100 rounded-lg transition-colors"
              title="閉じる"
              aria-label="閉じる"
            >
              <X className="w-4 h-4 text-indigo-600" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex items-center gap-3 py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-indigo-700">AIがサマリーを生成中...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {summary && isExpanded && (
        <div className="prose prose-sm max-w-none">
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {summary && !isExpanded && (
        <p className="text-xs text-indigo-600 cursor-pointer" onClick={() => setIsExpanded(true)}>
          クリックして展開...
        </p>
      )}
    </div>
  );
};

