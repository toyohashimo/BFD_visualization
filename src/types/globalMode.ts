/**
 * グローバルモード型定義
 * 
 * アプリケーション全体に適用される分析モード
 */

/**
 * グローバルモード
 * - detailed: 詳細分析モード（既存、ブランド/セグメント間比較）
 * - historical: 過去比較モード（新規、時系列データ比較）
 */
export type GlobalMode = 'detailed' | 'historical';

/**
 * 選択方式
 * - single: 単一選択（SA）
 * - multiple: 複数選択（MA）
 */
export type SelectionMode = 'single' | 'multiple';

/**
 * グローバルモード設定
 */
export interface GlobalModeConfig {
  /** 現在のグローバルモード */
  mode: GlobalMode;
  
  /** ブランド選択方式 */
  brandSelectionMode: SelectionMode;
  
  /** セグメント選択方式 */
  segmentSelectionMode: SelectionMode;
}

/**
 * グローバルモード表示名
 */
export const GLOBAL_MODE_LABELS: Record<GlobalMode, string> = {
  detailed: '詳細分析',
  historical: '過去比較'
};

/**
 * グローバルモード説明
 */
export const GLOBAL_MODE_DESCRIPTIONS: Record<GlobalMode, string> = {
  detailed: '単一時点での複数ブランド/セグメント比較',
  historical: '単一ブランド/セグメントの複数時点比較'
};

