/**
 * ファネルメトリクス(認知→購入のファネル分析用)
 */
export interface FunnelMetrics {
  FT: number;  // 認知あり(TOP2)
  FW: number;  // 興味あり(TOP2)
  FZ: number;  // 好意あり(TOP2)
  GC: number;  // 購入・利用意向あり(TOP2)
  GJ: number;  // 購入・利用経験あり(TOP5)
  GL: number;  // リピート意向あり(TOP2)
}

/**
 * タイムラインメトリクス(購入時期の分析用)
 */
export interface TimelineMetrics {
  T1: number;  // 直近1ヶ月以内に購入・利用した
  T2: number;  // 過去2～3ヶ月以内に購入・利用した
  T3: number;  // 過去4ヶ月～半年未満に購入・利用した
  T4: number;  // 半年～1年未満に購入・利用した
  T5: number;  // 1年以上前に購入・利用した
}

/**
 * ブランドパワーメトリクス(現在の強み分析用)
 */
export interface BrandPowerMetrics {
  BP1: number;  // 詳細認知
  BP2: number;  // 知覚品質
  BP3: number;  // ロイヤリティ
  BP4: number;  // 話題性
}

/**
 * 将来性パワーメトリクス(将来の成長性分析用)
 */
export interface FuturePowerMetrics {
  FP1: number;  // 目的意識
  FP2: number;  // 社会との向き合い
  FP3: number;  // 顧客理解力
  FP4: number;  // 双方向コミュニケーション
  FP5: number;  // 技術開発力
  FP6: number;  // 自己実現サポート
}

/**
 * アーキタイプメトリクス(ブランドパーソナリティ分析用)
 * ブランドイメージ項目から算出される12タイプのアーキタイプ値
 */
export interface ArchetypeMetrics {
  creator: number;      // 創造者
  ruler: number;        // 統治者
  sage: number;         // 賢者
  explorer: number;     // 探検家
  innocent: number;     // 幼子
  outlaw: number;       // 無法者
  magician: number;     // 魔術師
  hero: number;         // 英雄
  lover: number;        // 恋人
  jester: number;       // 道化師
  regular: number;      // 仲間
  caregiver: number;    // 援助者
}

/**
 * 全メトリクスの統合型
 */
export type AllMetrics = FunnelMetrics & TimelineMetrics & BrandPowerMetrics & FuturePowerMetrics & {
  archetypeMetrics?: ArchetypeMetrics;
  n_count?: number;         // N数 (B列)
  awareness_count?: number; // 認知者数 (F列)
};

/**
 * メトリクスのラベルマップ
 */
export const FUNNEL_LABELS: Record<keyof FunnelMetrics, string> = {
  FT: '認知あり(TOP2)',
  FW: '興味あり(TOP2)',
  FZ: '好意あり(TOP2)',
  GC: '購入・利用意向あり(TOP2)',
  GJ: '購入・利用経験あり(TOP5)',
  GL: 'リピート意向あり(TOP2)',
} as const;

export const FUNNEL_KEYS: (keyof FunnelMetrics)[] = ['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL'];

export const TIMELINE_LABELS: Record<keyof TimelineMetrics, string> = {
  T1: '直近1ヶ月以内に購入・利用した',
  T2: '過去2～3ヶ月以内に購入・利用した',
  T3: '過去4ヶ月～半年未満に購入・利用した',
  T4: '半年～1年未満に購入・利用した',
  T5: '1年以上前に購入・利用した',
} as const;

export const TIMELINE_KEYS: (keyof TimelineMetrics)[] = ['T1', 'T2', 'T3', 'T4', 'T5'];

export const BRAND_POWER_LABELS: Record<keyof BrandPowerMetrics, string> = {
  BP1: '詳細認知',
  BP2: '知覚品質',
  BP3: 'ロイヤリティ',
  BP4: '話題性',
} as const;

export const BRAND_POWER_KEYS: (keyof BrandPowerMetrics)[] = ['BP1', 'BP2', 'BP3', 'BP4'];

export const FUTURE_POWER_LABELS: Record<keyof FuturePowerMetrics, string> = {
  FP1: '目的意識',
  FP2: '社会との向き合い',
  FP3: '顧客理解力',
  FP4: '双方向コミュニケーション',
  FP5: '技術開発力',
  FP6: '自己実現サポート',
} as const;

export const FUTURE_POWER_KEYS: (keyof FuturePowerMetrics)[] = ['FP1', 'FP2', 'FP3', 'FP4', 'FP5', 'FP6'];

export const ARCHETYPE_LABELS: Record<keyof ArchetypeMetrics, string> = {
  creator: '創造者',
  ruler: '統治者',
  sage: '賢者',
  explorer: '探検家',
  innocent: '幼子',
  outlaw: '無法者',
  magician: '魔術師',
  hero: '英雄',
  lover: '恋人',
  jester: '道化師',
  regular: '仲間',
  caregiver: '援助者',
} as const;

export const ARCHETYPE_KEYS: (keyof ArchetypeMetrics)[] = [
  'creator', 'ruler', 'sage', 'explorer',
  'innocent', 'outlaw', 'magician', 'hero',
  'lover', 'jester', 'regular', 'caregiver'
];

