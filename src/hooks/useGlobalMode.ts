/**
 * グローバルモード管理フック
 * 
 * アプリケーション全体に適用される分析モード（詳細分析 vs 過去比較）の管理
 */

import { useCallback } from 'react';
import { usePersistence } from './usePersistence';
import { GlobalMode, GlobalModeConfig, SelectionMode } from '../types/globalMode';

/**
 * グローバルモード管理フック
 */
export const useGlobalMode = () => {
  const [globalMode, setGlobalMode] = usePersistence<GlobalMode>(
    'globalMode',
    'detailed' // デフォルトは詳細分析モード
  );

  /**
   * グローバルモード設定取得
   * 
   * @returns グローバルモード設定（選択方式を含む）
   */
  const getConfig = useCallback((): GlobalModeConfig => {
    return {
      mode: globalMode,
      brandSelectionMode: globalMode === 'historical' ? 'single' : 'multiple',
      segmentSelectionMode: globalMode === 'historical' ? 'single' : 'multiple'
    };
  }, [globalMode]);

  /**
   * 過去比較モードかどうか
   * 
   * @returns 過去比較モードの場合true
   */
  const isHistoricalMode = useCallback((): boolean => {
    return globalMode === 'historical';
  }, [globalMode]);

  /**
   * 詳細分析モードかどうか
   * 
   * @returns 詳細分析モードの場合true
   */
  const isDetailedMode = useCallback((): boolean => {
    return globalMode === 'detailed';
  }, [globalMode]);

  /**
   * ブランド選択方式取得
   * 
   * @returns 'single' | 'multiple'
   */
  const getBrandSelectionMode = useCallback((): SelectionMode => {
    return globalMode === 'historical' ? 'single' : 'multiple';
  }, [globalMode]);

  /**
   * セグメント選択方式取得
   * 
   * @returns 'single' | 'multiple'
   */
  const getSegmentSelectionMode = useCallback((): SelectionMode => {
    return globalMode === 'historical' ? 'single' : 'multiple';
  }, [globalMode]);

  return {
    // 状態
    globalMode,
    
    // セッター
    setGlobalMode,
    
    // メソッド
    getConfig,
    isHistoricalMode,
    isDetailedMode,
    getBrandSelectionMode,
    getSegmentSelectionMode,
  };
};

