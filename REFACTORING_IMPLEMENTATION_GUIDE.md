# リファクタリング実装ガイド

このドキュメントは、リファクタリング計画の具体的な実装手順とコード例を提供します。

---

## 目次

1. [Phase 1: 基盤整理 - 詳細実装](#phase-1-基盤整理---詳細実装)
2. [Phase 2: コンポーネント最適化 - 詳細実装](#phase-2-コンポーネント最適化---詳細実装)
3. [Phase 3: 高度な最適化 - 詳細実装](#phase-3-高度な最適化---詳細実装)
4. [マイグレーションガイド](#マイグレーションガイド)

---

## Phase 1: 基盤整理 - 詳細実装

### Step 1.1: 型定義の再構築

#### 作業: types/ディレクトリの作成

```bash
mkdir -p src/types
```

#### ファイル: src/types/metrics.ts

```typescript
/**
 * ファネルメトリクス（認知→購入のファネル分析用）
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
 * タイムラインメトリクス（購入時期の分析用）
 */
export interface TimelineMetrics {
  T1: number;  // 直近1ヶ月以内に購入・利用した
  T2: number;  // 過去2～3ヶ月以内に購入・利用した
  T3: number;  // 過去4ヶ月～半年未満に購入・利用した
  T4: number;  // 半年～1年未満に購入・利用した
  T5: number;  // 1年以上前に購入・利用した
}

/**
 * ブランドパワーメトリクス（現在の強み分析用）
 */
export interface BrandPowerMetrics {
  BP1: number;  // 詳細認知
  BP2: number;  // 知覚品質
  BP3: number;  // ロイヤリティ
  BP4: number;  // 話題性
}

/**
 * 将来性パワーメトリクス（将来の成長性分析用）
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
 * 全メトリクスの統合型
 */
export type AllMetrics = FunnelMetrics & TimelineMetrics & BrandPowerMetrics & FuturePowerMetrics;

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

export const TIMELINE_LABELS: Record<keyof TimelineMetrics, string> = {
  T1: '直近1ヶ月以内に購入・利用した',
  T2: '過去2～3ヶ月以内に購入・利用した',
  T3: '過去4ヶ月～半年未満に購入・利用した',
  T4: '半年～1年未満に購入・利用した',
  T5: '1年以上前に購入・利用した',
} as const;

export const BRAND_POWER_LABELS: Record<keyof BrandPowerMetrics, string> = {
  BP1: '詳細認知',
  BP2: '知覚品質',
  BP3: 'ロイヤリティ',
  BP4: '話題性',
} as const;

export const FUTURE_POWER_LABELS: Record<keyof FuturePowerMetrics, string> = {
  FP1: '目的意識',
  FP2: '社会との向き合い',
  FP3: '顧客理解力',
  FP4: '双方向コミュニケーション',
  FP5: '技術開発力',
  FP6: '自己実現サポート',
} as const;
```

---

#### ファイル: src/types/data.ts

```typescript
import { AllMetrics } from './metrics';

/**
 * ブランドデータ（1ブランドの全メトリクス）
 */
export interface BrandData {
  [brandName: string]: AllMetrics;
}

/**
 * シートデータ（1シートの全ブランドデータ）
 */
export interface SheetData {
  [sheetName: string]: BrandData;
}

/**
 * ブランドイメージの単一値
 */
export interface BrandImageValue {
  itemName: string;
  value: number;
  columnIndex: number;
}

/**
 * ブランドイメージデータ
 * 構造: [セグメント名][ブランド名][項目名] = 数値
 */
export interface BrandImageData {
  [segmentName: string]: {
    [brandName: string]: Record<string, number>;
  };
}

/**
 * Excelパース結果
 */
export interface ParsedData {
  sheetData: SheetData;
  brandImageData: BrandImageData;
}
```

---

#### ファイル: src/types/analysis.ts

```typescript
/**
 * 分析モードの型定義
 */
export type AnalysisMode =
  | 'segment_x_multi_brand'
  | 'brand_x_multi_segment'
  | 'item_x_multi_brand'
  | 'timeline_brand_multi_segment'
  | 'timeline_segment_multi_brand'
  | 'timeline_item_multi_brand'
  | 'brand_image_segment_brands'
  | 'brand_analysis_segment_comparison'
  | 'brand_power_segment_brands'
  | 'brand_power_brand_segments'
  | 'future_power_segment_brands'
  | 'future_power_brand_segments';

/**
 * 軸の役割
 */
export type AxisRole = 'X_AXIS' | 'SERIES' | 'FILTER' | 'FIXED';

/**
 * 項目セット
 */
export type ItemSet = 'funnel' | 'timeline' | 'brandImage' | 'brandPower' | 'futurePower';

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
```

---

### Step 1.2: ユーティリティ関数の分離

#### ファイル: src/utils/formatters.ts

```typescript
import { REGEX_PATTERNS } from '../config/constants';

/**
 * セグメント名をクリーンアップ
 * 例: "全体（BFDシート_値）St4" -> "全体"
 */
export const formatSegmentName = (segmentName: string): string => {
  return segmentName.replace(REGEX_PATTERNS.SEGMENT_CLEANUP, '').trim();
};

/**
 * ブランド名をフォーマット（匿名化対応）
 */
export const formatBrandName = (
  brandName: string,
  isAnonymized: boolean,
  brandMap: Record<string, string>
): string => {
  if (!isAnonymized) return brandName;
  return brandMap[brandName] || brandName;
};

/**
 * 数値を指定された小数点以下桁数でフォーマット
 */
export const formatNumber = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals);
};

/**
 * パーセンテージ表示用フォーマット
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${formatNumber(value, decimals)}%`;
};

/**
 * 大きい数値をカンマ区切りでフォーマット
 */
export const formatWithCommas = (value: number): string => {
  return value.toLocaleString('ja-JP');
};
```

---

#### ファイル: src/utils/validators.ts

```typescript
import { LIMITS } from '../config/constants';

/**
 * Excelデータ構造の検証
 */
export const validateExcelStructure = (data: any[][]): boolean => {
  if (!Array.isArray(data)) return false;
  if (data.length < 4) return false; // 最低4行必要（ヘッダー含む）
  return true;
};

/**
 * ブランド数の検証
 */
export const validateBrandLimit = (count: number): boolean => {
  return count > 0 && count <= LIMITS.MAX_BRANDS;
};

/**
 * セグメント数の検証
 */
export const validateSegmentLimit = (count: number): boolean => {
  return count > 0 && count <= LIMITS.MAX_SEGMENTS;
};

/**
 * 数値の範囲検証
 */
export const validateNumberRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * 空文字列チェック
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};
```

---

#### ファイル: src/config/constants.ts

```typescript
/**
 * アプリケーション全体で使用する定数
 */

export const LIMITS = {
  MAX_BRANDS: 10,
  MAX_SEGMENTS: 10,
  TOP_BRAND_IMAGE_ITEMS: 30,
  MIN_CHART_HEIGHT: 200,
  MAX_CHART_HEIGHT: 800,
  DEFAULT_CHART_HEIGHT: 400,
} as const;

export const STORAGE_KEYS = {
  ANALYSIS_MODE: 'funnel_analysis_mode',
  TARGET_BRAND: 'funnel_target_brand',
  SELECTED_BRANDS: 'funnel_selected_brands',
  SELECTED_SEGMENTS: 'funnel_selected_segments',
  SELECTED_ITEM: 'funnel_selected_item',
  CHART_HEIGHT: 'chart_height',
} as const;

export const REGEX_PATTERNS = {
  SEGMENT_CLEANUP: /[（(]BFDシート[_＿]?[値]?[）)]?.*?St\d+/g,
} as const;

export const EXCEL_STRUCTURE = {
  HEADER_ROW_INDEX: 2,        // 3行目がヘッダー（0-based: 2）
  DATA_START_INDEX: 3,        // 4行目からデータ（0-based: 3）
  BRAND_NAME_COLUMN: 3,       // D列がブランド名（0-based: 3）
  BRAND_IMAGE_START_COLUMN: 41,   // AP列（0-based: 41）
  BRAND_IMAGE_END_COLUMN: 175,    // FS列の次（0-based: 175）
} as const;

export const MESSAGES = {
  ERROR: {
    FILE_LOAD_FAILED: 'ファイルの読み込みに失敗しました。',
    INVALID_EXCEL_FORMAT: '有効なデータが見つかりませんでした。\n指定のフォーマット（3行目がヘッダー、4行目以降データ、D列ブランド名）を確認してください。',
    BRAND_LIMIT_EXCEEDED: '最大10ブランドまで比較できます',
    SEGMENT_LIMIT_EXCEEDED: '最大10セグメントまで比較できます',
    BRAND_ALREADY_SELECTED: 'このブランドは既に追加されています',
    SEGMENT_ALREADY_SELECTED: 'このセグメントは既に追加されています',
    NO_DATA_TO_EXPORT: 'エクスポートするデータがありません',
  },
  SUCCESS: {
    IMAGE_COPIED: 'クリップボードにコピーしました',
    DATA_LOADED: 'データを読み込みました',
  },
} as const;
```

---

### Step 1.3: サービス層の分離

#### ファイル: src/services/excelParser/ExcelParser.ts

```typescript
import { read, utils, WorkSheet } from 'xlsx';
import { ParsedData, SheetData, BrandData, BrandImageData, AllMetrics } from '../../types';
import { EXCEL_STRUCTURE, MESSAGES } from '../../config/constants';
import { validateExcelStructure } from '../../utils/validators';

/**
 * Excelファイルパーサー
 */
export class ExcelParser {
  /**
   * ArrayBufferをパースして構造化データに変換
   */
  async parse(arrayBuffer: ArrayBuffer): Promise<ParsedData> {
    try {
      const workbook = read(arrayBuffer);
      const sheetData: SheetData = {};
      const brandImageData: BrandImageData = {};

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const parsed = this.parseSheet(worksheet, sheetName);

        if (parsed) {
          sheetData[sheetName] = parsed.brands;
          brandImageData[sheetName] = parsed.brandImages;
        }
      }

      if (Object.keys(sheetData).length === 0) {
        throw new Error(MESSAGES.ERROR.INVALID_EXCEL_FORMAT);
      }

      return { sheetData, brandImageData };
    } catch (error) {
      console.error('Excel parse error:', error);
      throw error;
    }
  }

  /**
   * 単一シートをパース
   */
  private parseSheet(
    worksheet: WorkSheet,
    sheetName: string
  ): { brands: BrandData; brandImages: Record<string, Record<string, number>> } | null {
    const jsonData = utils.sheet_to_json<any[]>(worksheet, { header: 1 });

    if (!validateExcelStructure(jsonData)) {
      return null;
    }

    const headers = jsonData[EXCEL_STRUCTURE.HEADER_ROW_INDEX];
    const columnMapping = this.buildColumnMapping(headers);

    // 少なくとも1つのファネルメトリクスが必要
    if (!columnMapping.funnel.FT) {
      return null;
    }

    const brands: BrandData = {};
    const brandImages: Record<string, Record<string, number>> = {};
    const brandImageItems = this.extractBrandImageItems(headers);

    for (let i = EXCEL_STRUCTURE.DATA_START_INDEX; i < jsonData.length; i++) {
      const row = jsonData[i];
      const brandName = row[EXCEL_STRUCTURE.BRAND_NAME_COLUMN];

      if (!brandName || typeof brandName !== 'string') continue;

      // メトリクスの読み込み
      const metrics = this.extractMetrics(row, columnMapping);
      brands[brandName] = metrics;

      // ブランドイメージの読み込み
      brandImages[brandName] = this.extractBrandImageValues(row, brandImageItems);
    }

    return { brands, brandImages };
  }

  /**
   * ヘッダー行からカラムマッピングを構築
   */
  private buildColumnMapping(headers: any[]): ColumnMapping {
    const funnel: Partial<Record<keyof import('../../types').FunnelMetrics, number>> = {};
    const timeline: Partial<Record<keyof import('../../types').TimelineMetrics, number>> = {};
    const brandPower: Partial<Record<keyof import('../../types').BrandPowerMetrics, number>> = {};
    const futurePower: Partial<Record<keyof import('../../types').FuturePowerMetrics, number>> = {};

    const labelMappings = {
      funnel: {
        FT: '認知あり(TOP2)',
        FW: '興味あり(TOP2)',
        FZ: '好意あり(TOP2)',
        GC: '購入・利用意向あり(TOP2)',
        GJ: '購入・利用経験あり(TOP5)',
        GL: 'リピート意向あり(TOP2)',
      },
      timeline: {
        T1: '直近1ヶ月以内に購入・利用した',
        T2: '過去2～3ヶ月以内に購入・利用した',
        T3: '過去4ヶ月～半年未満に購入・利用した',
        T4: '半年～1年未満に購入・利用した',
        T5: '1年以上前に購入・利用した',
      },
      brandPower: {
        BP1: '詳細認知',
        BP2: '知覚品質',
        BP3: 'ロイヤリティ',
        BP4: '話題性',
      },
      futurePower: {
        FP1: '目的意識',
        FP2: '社会との向き合い',
        FP3: '顧客理解力',
        FP4: '双方向コミュニケーション',
        FP5: '技術開発力',
        FP6: '自己実現サポート',
      },
    };

    headers.forEach((header: any, idx: number) => {
      if (!header || typeof header !== 'string') return;
      const headerStr = header.trim().replace(/\r?\n/g, '');

      // ファネルメトリクス
      Object.entries(labelMappings.funnel).forEach(([key, label]) => {
        if (headerStr === label) funnel[key as keyof typeof funnel] = idx;
      });

      // タイムラインメトリクス
      Object.entries(labelMappings.timeline).forEach(([key, label]) => {
        if (headerStr === label) timeline[key as keyof typeof timeline] = idx;
      });

      // ブランドパワーメトリクス
      Object.entries(labelMappings.brandPower).forEach(([key, label]) => {
        if (headerStr === label) brandPower[key as keyof typeof brandPower] = idx;
      });

      // 将来性パワーメトリクス
      Object.entries(labelMappings.futurePower).forEach(([key, label]) => {
        if (headerStr === label) futurePower[key as keyof typeof futurePower] = idx;
      });
    });

    return { funnel, timeline, brandPower, futurePower };
  }

  /**
   * 行からメトリクスを抽出
   */
  private extractMetrics(row: any[], mapping: ColumnMapping): AllMetrics {
    const metrics: Partial<AllMetrics> = {
      FT: 0, FW: 0, FZ: 0, GC: 0, GJ: 0, GL: 0,
      T1: 0, T2: 0, T3: 0, T4: 0, T5: 0,
      BP1: 0, BP2: 0, BP3: 0, BP4: 0,
      FP1: 0, FP2: 0, FP3: 0, FP4: 0, FP5: 0, FP6: 0,
    };

    // ファネルメトリクス
    Object.entries(mapping.funnel).forEach(([key, colIdx]) => {
      if (colIdx !== undefined) {
        metrics[key as keyof AllMetrics] = this.parseValue(row[colIdx]);
      }
    });

    // タイムラインメトリクス
    Object.entries(mapping.timeline).forEach(([key, colIdx]) => {
      if (colIdx !== undefined) {
        metrics[key as keyof AllMetrics] = this.parseValue(row[colIdx]);
      }
    });

    // ブランドパワーメトリクス
    Object.entries(mapping.brandPower).forEach(([key, colIdx]) => {
      if (colIdx !== undefined) {
        metrics[key as keyof AllMetrics] = this.parseValue(row[colIdx]);
      }
    });

    // 将来性パワーメトリクス
    Object.entries(mapping.futurePower).forEach(([key, colIdx]) => {
      if (colIdx !== undefined) {
        metrics[key as keyof AllMetrics] = this.parseValue(row[colIdx]);
      }
    });

    return metrics as AllMetrics;
  }

  /**
   * セルの値をパース
   */
  private parseValue(value: any): number {
    if (value === '-' || value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * ブランドイメージ項目を抽出
   */
  private extractBrandImageItems(headers: any[]): BrandImageItem[] {
    const items: BrandImageItem[] = [];
    const excludeKeywords = ['あてはまるものはない'];

    for (
      let colIdx = EXCEL_STRUCTURE.BRAND_IMAGE_START_COLUMN;
      colIdx < EXCEL_STRUCTURE.BRAND_IMAGE_END_COLUMN;
      colIdx++
    ) {
      const itemName = headers[colIdx];
      if (!itemName || typeof itemName !== 'string') continue;

      const shouldExclude = excludeKeywords.some((keyword) => itemName.includes(keyword));
      if (shouldExclude) continue;

      items.push({
        name: itemName.trim(),
        columnIndex: colIdx,
      });
    }

    return items;
  }

  /**
   * 行からブランドイメージ値を抽出
   */
  private extractBrandImageValues(
    row: any[],
    items: BrandImageItem[]
  ): Record<string, number> {
    const values: Record<string, number> = {};

    items.forEach((item) => {
      values[item.name] = this.parseValue(row[item.columnIndex]);
    });

    return values;
  }
}

/**
 * カラムマッピングの型定義
 */
interface ColumnMapping {
  funnel: Partial<Record<keyof import('../../types').FunnelMetrics, number>>;
  timeline: Partial<Record<keyof import('../../types').TimelineMetrics, number>>;
  brandPower: Partial<Record<keyof import('../../types').BrandPowerMetrics, number>>;
  futurePower: Partial<Record<keyof import('../../types').FuturePowerMetrics, number>>;
}

interface BrandImageItem {
  name: string;
  columnIndex: number;
}
```

---

## Phase 2: コンポーネント最適化 - 詳細実装

### Step 2.1: カスタムフックの作成

#### ファイル: src/hooks/useExcelParser.ts

```typescript
import { useState, useCallback } from 'react';
import { ParsedData } from '../types';
import { ExcelParser } from '../services/excelParser/ExcelParser';

export const useExcelParser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const parse = useCallback(async (file: File): Promise<ParsedData> => {
    setIsLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const parser = new ExcelParser();
      const result = await parser.parse(arrayBuffer);
      setIsLoading(false);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  return {
    parse,
    isLoading,
    error,
  };
};
```

---

#### ファイル: src/hooks/usePersistence.ts

```typescript
import { useState, useCallback, useEffect } from 'react';

/**
 * LocalStorageとの同期を行うカスタムフック
 */
export const usePersistence = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  // 初期化時にlocalStorageから読み込み
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // 値を設定してlocalStorageに保存
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // 関数の場合は前の値を渡して実行
        const valueToStore = value instanceof Function ? value(state) : value;
        setState(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Failed to persist ${key} to localStorage:`, error);
      }
    },
    [key, state]
  );

  return [state, setValue];
};

/**
 * 使用例:
 * const [selectedBrands, setSelectedBrands] = usePersistence<string[]>(
 *   STORAGE_KEYS.SELECTED_BRANDS,
 *   ['ベルーナ']
 * );
 */
```

---

#### ファイル: src/hooks/useChartData.ts

```typescript
import { useMemo } from 'react';
import { AnalysisMode, SheetData, BrandImageData, ChartDataPoint } from '../types';
import { ANALYSIS_MODE_CONFIGS } from '../config/analysisConfigs';
import { ChartDataTransformer } from '../services/dataTransform/ChartDataTransformer';

interface FilterValues {
  items: string;
  segments: string;
  brands: string;
}

interface SeriesValues {
  items: string[];
  segments: string[];
  brands: string[];
}

export const useChartData = (
  analysisMode: AnalysisMode,
  data: SheetData,
  filterValues: FilterValues,
  seriesValues: SeriesValues,
  brandImageData?: BrandImageData
): ChartDataPoint[] => {
  return useMemo(() => {
    const config = ANALYSIS_MODE_CONFIGS[analysisMode];
    const transformer = new ChartDataTransformer(config);

    return transformer.transform(
      data,
      filterValues,
      seriesValues,
      brandImageData
    );
  }, [analysisMode, data, filterValues, seriesValues, brandImageData]);
};
```

---

### Step 2.2: Appコンポーネントのリファクタリング

#### ファイル: src/App.tsx (リファクタリング後)

```typescript
import React, { useState } from 'react';
import { IconBar } from './components/layout/IconBar';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useAnalysisMode } from './hooks/useAnalysisMode';
import { useDataManagement } from './hooks/useDataManagement';
import { useChartConfiguration } from './hooks/useChartConfiguration';

/**
 * メインアプリケーションコンポーネント
 * 
 * リファクタリング後: 991行 → 約150行
 */
const App: React.FC = () => {
  // 状態管理をカスタムフックに委譲
  const { mode, config, changeMode } = useAnalysisMode();
  const { data, brandImageData, loadData, isLoading } = useDataManagement();
  const { chartType, setChartType, ...chartConfig } = useChartConfiguration();

  // UI状態
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-white text-gray-800 font-sans overflow-hidden">
        {/* デスクトップ用アイコンバー */}
        <div className="hidden md:block">
          <IconBar
            chartType={chartType}
            setChartType={setChartType}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        </div>

        {/* デスクトップ用サイドバー */}
        <div
          className={`hidden md:block ${
            sidebarCollapsed ? 'w-0' : 'w-80'
          } bg-white shadow-xl z-20 flex-shrink-0 border-r border-gray-200 h-full overflow-hidden transition-all duration-300`}
        >
          {!sidebarCollapsed && (
            <Sidebar
              analysisMode={mode}
              onModeChange={changeMode}
              onDataLoad={loadData}
              isLoading={isLoading}
              chartType={chartType}
              onChartTypeChange={setChartType}
              {...chartConfig}
            />
          )}
        </div>

        {/* モバイル用オーバーレイとサイドバー */}
        {showMobileMenu && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
            <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 md:hidden">
              <Sidebar
                analysisMode={mode}
                onModeChange={changeMode}
                onDataLoad={loadData}
                isLoading={isLoading}
                chartType={chartType}
                onChartTypeChange={setChartType}
                {...chartConfig}
              />
            </div>
          </>
        )}

        {/* メインコンテンツ */}
        <MainContent
          analysisMode={mode}
          data={data}
          brandImageData={brandImageData}
          chartType={chartType}
          {...chartConfig}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
```

---

## Phase 3: 高度な最適化 - 詳細実装

### Step 3.1: 状態管理ライブラリの導入（Zustand）

#### ファイル: src/store/analysisStore.ts

```typescript
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { AnalysisMode } from '../types';
import { STORAGE_KEYS, LIMITS } from '../config/constants';

interface AnalysisState {
  // 分析モード
  mode: AnalysisMode;
  setMode: (mode: AnalysisMode) => void;

  // ブランド選択
  selectedBrands: string[];
  addBrand: (brand: string) => boolean;
  removeBrand: (brand: string) => void;
  clearBrands: () => void;
  reorderBrands: (oldIndex: number, newIndex: number) => void;

  // セグメント選択
  selectedSegments: string[];
  addSegment: (segment: string) => boolean;
  removeSegment: (segment: string) => void;
  clearSegments: () => void;
  reorderSegments: (oldIndex: number, newIndex: number) => void;

  // 項目選択
  selectedItem: string;
  setSelectedItem: (item: string) => void;

  // ターゲットブランド（単一選択モード用）
  targetBrand: string;
  setTargetBrand: (brand: string) => void;

  // シート選択（単一選択モード用）
  selectedSheet: string;
  setSelectedSheet: (sheet: string) => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      // 初期状態
      mode: 'segment_x_multi_brand',
      selectedBrands: [],
      selectedSegments: [],
      selectedItem: 'FT',
      targetBrand: '',
      selectedSheet: '',

      // アクション
      setMode: (mode) => set({ mode }),

      addBrand: (brand) => {
        let success = false;
        set((state) => {
          if (state.selectedBrands.includes(brand)) {
            return state; // 既に追加されている
          }
          if (state.selectedBrands.length >= LIMITS.MAX_BRANDS) {
            return state; // 上限に達している
          }
          success = true;
          return {
            selectedBrands: [...state.selectedBrands, brand],
          };
        });
        return success;
      },

      removeBrand: (brand) =>
        set((state) => ({
          selectedBrands: state.selectedBrands.filter((b) => b !== brand),
        })),

      clearBrands: () => set({ selectedBrands: [] }),

      reorderBrands: (oldIndex, newIndex) =>
        set((state) => {
          const brands = [...state.selectedBrands];
          const [removed] = brands.splice(oldIndex, 1);
          brands.splice(newIndex, 0, removed);
          return { selectedBrands: brands };
        }),

      addSegment: (segment) => {
        let success = false;
        set((state) => {
          if (state.selectedSegments.includes(segment)) {
            return state;
          }
          if (state.selectedSegments.length >= LIMITS.MAX_SEGMENTS) {
            return state;
          }
          success = true;
          return {
            selectedSegments: [...state.selectedSegments, segment],
          };
        });
        return success;
      },

      removeSegment: (segment) =>
        set((state) => ({
          selectedSegments: state.selectedSegments.filter((s) => s !== segment),
        })),

      clearSegments: () => set({ selectedSegments: [] }),

      reorderSegments: (oldIndex, newIndex) =>
        set((state) => {
          const segments = [...state.selectedSegments];
          const [removed] = segments.splice(oldIndex, 1);
          segments.splice(newIndex, 0, removed);
          return { selectedSegments: segments };
        }),

      setSelectedItem: (item) => set({ selectedItem: item }),
      setTargetBrand: (brand) => set({ targetBrand: brand }),
      setSelectedSheet: (sheet) => set({ selectedSheet: sheet }),
    }),
    {
      name: 'analysis-storage',
      partialize: (state) => ({
        mode: state.mode,
        selectedBrands: state.selectedBrands,
        selectedSegments: state.selectedSegments,
        selectedItem: state.selectedItem,
        targetBrand: state.targetBrand,
        selectedSheet: state.selectedSheet,
      }),
    }
  )
);
```

---

### Step 3.2: テストの作成

#### ファイル: src/services/excelParser/ExcelParser.test.ts

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ExcelParser } from './ExcelParser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('ExcelParser', () => {
  let parser: ExcelParser;

  beforeEach(() => {
    parser = new ExcelParser();
  });

  describe('parse', () => {
    it('should parse valid Excel file successfully', async () => {
      // テスト用のExcelファイルを読み込み
      const filePath = join(__dirname, '../../../public/sample_202506.xlsx');
      const buffer = readFileSync(filePath);
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );

      const result = await parser.parse(arrayBuffer);

      expect(result.sheetData).toBeDefined();
      expect(Object.keys(result.sheetData)).toHaveLength(5);
      expect(result.brandImageData).toBeDefined();
    });

    it('should throw error for invalid Excel structure', async () => {
      // 無効なデータ
      const invalidBuffer = new ArrayBuffer(0);

      await expect(parser.parse(invalidBuffer)).rejects.toThrow();
    });
  });
});
```

---

#### ファイル: src/hooks/useChartData.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useChartData } from './useChartData';
import { AnalysisMode, SheetData } from '../types';

describe('useChartData', () => {
  const mockData: SheetData = {
    '全体': {
      'ベルーナ': {
        FT: 62.0, FW: 3.4, FZ: 4.1, GC: 4.2, GJ: 21.5, GL: 3.2,
        T1: 0, T2: 0, T3: 0, T4: 0, T5: 0,
        BP1: 0, BP2: 0, BP3: 0, BP4: 0,
        FP1: 0, FP2: 0, FP3: 0, FP4: 0, FP5: 0, FP6: 0,
      },
    },
  };

  it('should transform data correctly for segment_x_multi_brand mode', () => {
    const { result } = renderHook(() =>
      useChartData(
        'segment_x_multi_brand' as AnalysisMode,
        mockData,
        { items: '', segments: '全体', brands: '' },
        { items: [], segments: [], brands: ['ベルーナ'] }
      )
    );

    expect(result.current).toHaveLength(6);
    expect(result.current[0].name).toBe('認知あり(TOP2)');
    expect(result.current[0]['ベルーナ']).toBe(62.0);
  });
});
```

---

## マイグレーションガイド

### 段階的マイグレーション手順

#### ステップ1: 並行運用の準備

```typescript
// 旧コードを残しつつ新コードを追加
// src/App.tsx
import { OldApp } from './AppOld'; // 既存コードを別ファイルに移動
import { NewApp } from './AppNew'; // 新しいコード

const USE_NEW_APP = process.env.VITE_USE_NEW_APP === 'true';

export default USE_NEW_APP ? NewApp : OldApp;
```

#### ステップ2: 機能ごとの段階的移行

```
Week 1: ユーティリティ関数の移行
  - formatters.tsの作成と移行
  - validators.tsの作成と移行
  - テストの作成

Week 2: サービス層の移行
  - ExcelParserの移行
  - テストの作成
  - 既存コードとの統合テスト

Week 3: カスタムフックの移行
  - usePersistence の作成
  - useExcelParser の作成
  - 既存コンポーネントからの段階的移行

Week 4-6: コンポーネントの移行
  - 1つずつコンポーネントを新構造に移行
  - 各移行後に機能テスト実施
```

#### ステップ3: 切り替えとクリーンアップ

```bash
# 環境変数で新旧切り替え
VITE_USE_NEW_APP=true npm run dev

# 問題なければ旧コードを削除
rm src/AppOld.tsx
```

---

## チェックリスト

### Phase 1 完了基準
- [ ] 型定義がsrc/types/に整理されている
- [ ] ユーティリティ関数が分離され、テスト済み
- [ ] 定数がsrc/config/constants.tsに集約されている
- [ ] ExcelParserがサービスとして分離され、テスト済み

### Phase 2 完了基準
- [ ] カスタムフックが作成され、テスト済み
- [ ] Appコンポーネントが150行以下に削減されている
- [ ] コンポーネントのprops数が20個以下
- [ ] 共通コンポーネントが作成されている

### Phase 3 完了基準
- [ ] 状態管理ライブラリが導入されている
- [ ] テストカバレッジが80%以上
- [ ] パフォーマンステスト実施済み
- [ ] ドキュメントが整備されている

---

**このガイドを参考に、段階的かつ確実にリファクタリングを進めてください。**

