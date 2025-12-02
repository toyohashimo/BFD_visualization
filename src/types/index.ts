/**
 * 型定義のエントリーポイント
 */

// Metrics
export type {
  FunnelMetrics,
  TimelineMetrics,
  BrandPowerMetrics,
  FuturePowerMetrics,
  ArchetypeMetrics,
  AllMetrics,
} from './metrics';

export {
  FUNNEL_LABELS,
  FUNNEL_KEYS,
  TIMELINE_LABELS,
  TIMELINE_KEYS,
  BRAND_POWER_LABELS,
  BRAND_POWER_KEYS,
  FUTURE_POWER_LABELS,
  FUTURE_POWER_KEYS,
  ARCHETYPE_LABELS,
  ARCHETYPE_KEYS,
} from './metrics';

// Data
export type {
  BrandData,
  SheetData,
  BrandImageItem,
  BrandImageData,
  ParsedData,
} from './data';

// Analysis
export type {
  AnalysisMode,
  AxisRole,
  ItemSet,
  AxisType,
  AxisConfig,
  AnalysisModeConfig,
  ChartType,
  ChartDataPoint,
} from './analysis';

// DataSource (過去比較モード用)
export type {
  DataSource,
  DataStructure,
  MultiDataSourceState,
  AddDataSourceResult,
  AnyMetrics,
} from './dataSource';

// GlobalMode
export type {
  GlobalMode,
  SelectionMode,
  GlobalModeConfig,
} from './globalMode';

export {
  GLOBAL_MODE_LABELS,
  GLOBAL_MODE_DESCRIPTIONS,
} from './globalMode';

// Helper functions for item sets
import {
  FUNNEL_KEYS,
  FUNNEL_LABELS,
  TIMELINE_KEYS,
  TIMELINE_LABELS,
  BRAND_POWER_KEYS,
  BRAND_POWER_LABELS,
  FUTURE_POWER_KEYS,
  FUTURE_POWER_LABELS,
  ARCHETYPE_KEYS,
  ARCHETYPE_LABELS,
} from './metrics';
import type { ItemSet } from './analysis';

/**
 * 指定されたitemSetに対応するキーの配列を取得
 */
export function getItemKeysForSet(itemSet?: ItemSet): string[] {
  if (itemSet === 'timeline') return TIMELINE_KEYS;
  if (itemSet === 'brandPower') return BRAND_POWER_KEYS;
  if (itemSet === 'futurePower') return FUTURE_POWER_KEYS;
  if (itemSet === 'archetype') return ARCHETYPE_KEYS;
  return FUNNEL_KEYS; // default to funnel
}

/**
 * 指定されたitemSetに対応するラベルマップを取得
 */
export function getItemLabelsForSet(itemSet?: ItemSet): Record<string, string> {
  if (itemSet === 'timeline') return TIMELINE_LABELS;
  if (itemSet === 'brandPower') return BRAND_POWER_LABELS;
  if (itemSet === 'futurePower') return FUTURE_POWER_LABELS;
  if (itemSet === 'archetype') return ARCHETYPE_LABELS;
  return FUNNEL_LABELS; // default to funnel
}

