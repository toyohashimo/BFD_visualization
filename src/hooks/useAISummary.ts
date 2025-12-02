import { useState, useCallback } from 'react';
import { ChartDataPoint } from '../types';
import { generateAISummary, AISummaryRequest } from '../services/aiSummaryService';
import { useAISettings } from './useAISettings';

export interface AISummaryContext {
  globalMode: 'detailed' | 'historical';
  analysisMode: string;
  chartType: string;
  sheet: string;
  targetBrand: string;
  selectedBrands: string[];
  selectedSegments: string[];
  selectedItem: string;
  dataSources?: Array<{ name: string; isActive: boolean }>;
  isAnonymized?: boolean; // DEMOモード判定
}

export interface AISummaryMetadata {
  itemLabels: Record<string, string>;
  brandNames: Record<string, string>;
}

export interface UseAISummaryReturn {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
  generateSummary: () => Promise<void>;
  clearSummary: () => void;
}

/**
 * AIサマリー生成フック
 */
export const useAISummary = (
  chartData: ChartDataPoint[],
  context: AISummaryContext,
  metadata: AISummaryMetadata
): UseAISummaryReturn => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useAISettings();

  const generateSummary = useCallback(async () => {
    console.log('=== useAISummary: サマリー生成開始 ===');
    
    if (!chartData || chartData.length === 0) {
      console.warn('useAISummary: チャートデータがありません');
      setError('チャートデータがありません。');
      return;
    }

    if (!settings.apiKey) {
      console.warn('useAISummary: APIキーが設定されていません');
      setError('Gemini APIキーが設定されていません。設定画面からAPIキーを入力してください。');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: AISummaryRequest = {
        chartData,
        context,
        metadata,
      };

      console.log('useAISummary: リクエスト送信', {
        chartDataLength: chartData.length,
        context,
        metadata,
      });

      const result = await generateAISummary(request, settings);
      
      console.log('useAISummary: サマリー生成成功', {
        summaryLength: result.length,
        summaryPreview: result.substring(0, 100) + '...',
      });
      
      setSummary(result);
    } catch (err: any) {
      console.error('useAISummary: サマリー生成エラー', err);
      setError(err.message || 'サマリーの生成に失敗しました。');
      setSummary(null);
    } finally {
      setIsLoading(false);
      console.log('=== useAISummary: サマリー生成完了 ===');
    }
  }, [chartData, context, metadata, settings]);

  const clearSummary = useCallback(() => {
    setSummary(null);
    setError(null);
  }, []);

  return {
    summary,
    isLoading,
    error,
    generateSummary,
    clearSummary,
  };
};

