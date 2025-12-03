/**
 * 分析モードの型定義
 */
export type AnalysisMode =
  | ''
  // 詳細分析モード（既存）
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
  | 'archetype_brand_segments'
  // 過去比較モード（新規）
  | 'historical_funnel1_segment_brand'
  | 'historical_funnel2_segment_brand'
  | 'historical_brand_image_segment_brand'
  | 'historical_brand_power_segment_brand'
  | 'historical_future_power_segment_brand'
  | 'historical_archetype_segment_brand'
  | 'historical_funnel1_brands_comparison'       // Mode 2
  | 'historical_funnel2_brands_comparison'        // Mode 4
  | 'historical_brand_image_brands_comparison';   // Mode 6

/**
 * 軸の役割
 */
export type AxisRole = 'X_AXIS' | 'SERIES' | 'FILTER' | 'FIXED';

/**
 * 項目セット
 */
export type ItemSet = 'funnel' | 'funnel2' | 'timeline' | 'brandImage' | 'brandPower' | 'futurePower' | 'archetype' | 'custom';

/**
 * 軸のタイプ
 */
export type AxisType = 'items' | 'segments' | 'brands';

/**
 * 軸の設定
 */
export interface AxisConfig {
  role: AxisRole;
  label: string;
  allowMultiple: boolean;
  itemSet?: ItemSet;
  fixedItems?: string[];
  autoSelect?: boolean;
  autoSelectCount?: number;
}

/**
 * 分析モードの設定
 */
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

/**
 * チャートタイプ
 */
export type ChartType = 'bar' | 'line' | 'radar' | 'horizontalBar';

/**
 * チャートデータポイント
 */
export interface ChartDataPoint {
  name: string;
  [brandName: string]: string | number;
}

