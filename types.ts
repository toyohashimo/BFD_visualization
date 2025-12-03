
export interface FunnelMetrics {
  FT: number;
  FW: number;
  FZ: number;
  GC: number;
  GJ: number;
  GL: number;
}

// Timeline Metrics for Funnel Analysis ② (ファネル項目②)
export interface TimelineMetrics {
  T1: number;  // 直近1ヶ月以内に購入・利用した
  T2: number;  // 過去2～3ヶ月以内に購入・利用した
  T3: number;  // 過去4ヶ月～半年未満に購入・利用した
  T4: number;  // 半年～1年未満に購入・利用した
  T5: number;  // 1年以上前に購入・利用した
}

// Brand Power Metrics for Brand Power Analysis
export interface BrandPowerMetrics {
  BP1: number;  // 詳細認知
  BP2: number;  // 知覚品質
  BP3: number;  // ロイヤリティ
  BP4: number;  // 話題性
}

// Future Power Metrics for Future Brand Power Analysis
export interface FuturePowerMetrics {
  FP1: number;  // 目的意識
  FP2: number;  // 社会との向き合い
  FP3: number;  // 顧客理解力
  FP4: number;  // 双方向コミュニケーション
  FP5: number;  // 技術開発力
  FP6: number;  // 自己実現サポート
}

// Archetype Metrics for Archetype Analysis
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

// Combined metrics type (funnel, timeline, brand power, future power, and archetype)
export type AllMetrics = FunnelMetrics & TimelineMetrics & BrandPowerMetrics & FuturePowerMetrics & {
  archetypeMetrics?: ArchetypeMetrics;
};

export interface BrandData {
  [brandName: string]: AllMetrics;
}

export interface SheetData {
  [sheetName: string]: BrandData;
}

export type ChartType = 'bar' | 'line' | 'radar' | 'horizontalBar';

// Generalized Analysis Mode System Types
export type AxisRole = 'X_AXIS' | 'SERIES' | 'FILTER' | 'FIXED';

export type ItemSet = 'funnel' | 'funnel2' | 'timeline' | 'brandImage' | 'brandPower' | 'futurePower' | 'archetype' | 'custom';

export type AxisType = 'items' | 'segments' | 'brands';

export interface AxisConfig {
  role: AxisRole;
  label: string;           // UI display label
  allowMultiple: boolean;  // Allow multiple selection
  itemSet?: ItemSet;       // For items axis, which item set to use
  fixedItems?: string[];   // For fixed values, the list of items
  autoSelect?: boolean;    // For auto-select mode (e.g., brand image TOP30)
  autoSelectCount?: number; // Number of items to auto-select
}

export interface AnalysisModeConfig {
  id: string;
  name: string;
  description: string;
  axes: {
    items: AxisConfig;
    segments: AxisConfig;
    brands: AxisConfig;
  };
  dataTransform: {
    xAxis: AxisType;
    series: AxisType;
    filter: AxisType;
  };
  defaultChartType?: ChartType;
}

export type AnalysisMode =
  | ''
  | 'funnel_segment_brands'
  | 'funnel_brand_segments'
  | 'funnel_item_segments_brands'
  | 'timeline_brand_segments'
  | 'timeline_segment_brands'
  | 'timeline_item_segments_brands'
  | 'brand_image_segment_brands'
  | 'brand_image_brand_segments'
  | 'brand_power_segment_brands'
  | 'brand_power_brand_segments'
  | 'future_power_segment_brands'
  | 'future_power_brand_segments'
  | 'archetype_segment_brands'
  | 'archetype_brand_segments';

export interface ChartDataPoint {
  name: string; // The metric label (e.g., "認知あり")
  [brandName: string]: string | number;
}

export const METRIC_LABELS: { [key in keyof FunnelMetrics]: string } = {
  FT: '認知あり(TOP2)',
  FW: '興味あり(TOP2)',
  FZ: '好意あり(TOP2)',
  GC: '購入・利用意向あり(TOP2)',
  GJ: '購入・利用経験あり(TOP5)',
  GL: 'リピート意向あり(TOP2)'
};

export const METRIC_KEYS: (keyof FunnelMetrics)[] = ['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL'];

export const TIMELINE_LABELS: { [key in keyof TimelineMetrics]: string } = {
  T1: '直近1ヶ月以内に購入・利用した',
  T2: '過去2～3ヶ月以内に購入・利用した',
  T3: '過去4ヶ月～半年未満に購入・利用した',
  T4: '半年～1年未満に購入・利用した',
  T5: '1年以上前に購入・利用した'
};

export const TIMELINE_KEYS: (keyof TimelineMetrics)[] = ['T1', 'T2', 'T3', 'T4', 'T5'];

export const BRAND_POWER_LABELS: { [key in keyof BrandPowerMetrics]: string } = {
  BP1: '詳細認知',
  BP2: '知覚品質',
  BP3: 'ロイヤリティ',
  BP4: '話題性'
};

export const BRAND_POWER_KEYS: (keyof BrandPowerMetrics)[] = ['BP1', 'BP2', 'BP3', 'BP4'];

export const FUTURE_POWER_LABELS: { [key in keyof FuturePowerMetrics]: string } = {
  FP1: '目的意識',
  FP2: '社会との向き合い',
  FP3: '顧客理解力',
  FP4: '双方向コミュニケーション',
  FP5: '技術開発力',
  FP6: '自己実現サポート'
};

export const FUTURE_POWER_KEYS: (keyof FuturePowerMetrics)[] = ['FP1', 'FP2', 'FP3', 'FP4', 'FP5', 'FP6'];

export const ARCHETYPE_LABELS: { [key in keyof ArchetypeMetrics]: string } = {
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
  caregiver: '援助者'
};

export const ARCHETYPE_KEYS: (keyof ArchetypeMetrics)[] = [
  'creator', 'ruler', 'sage', 'explorer',
  'innocent', 'outlaw', 'magician', 'hero',
  'lover', 'jester', 'regular', 'caregiver'
];

// Helper functions to get items based on itemSet
export function getItemKeysForSet(itemSet?: ItemSet): string[] {
  if (itemSet === 'timeline') return TIMELINE_KEYS;
  if (itemSet === 'brandPower') return BRAND_POWER_KEYS;
  if (itemSet === 'futurePower') return FUTURE_POWER_KEYS;
  if (itemSet === 'archetype') return ARCHETYPE_KEYS;
  return METRIC_KEYS; // default to funnel
}

export function getItemLabelsForSet(itemSet?: ItemSet): Record<string, string> {
  if (itemSet === 'timeline') return TIMELINE_LABELS;
  if (itemSet === 'brandPower') return BRAND_POWER_LABELS;
  if (itemSet === 'futurePower') return FUTURE_POWER_LABELS;
  if (itemSet === 'archetype') return ARCHETYPE_LABELS;
  return METRIC_LABELS; // default to funnel
}

// Brand Image Item interface
export interface BrandImageItem {
  name: string;
  columnIndex: number;
  value?: number; // Optional value for sorting
}
