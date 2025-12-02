import { AllMetrics } from './metrics';

/**
 * ブランドデータ(1ブランドの全メトリクス)
 */
export interface BrandData {
  [brandName: string]: AllMetrics;
}

/**
 * シートデータ(1シートの全ブランドデータ)
 */
export interface SheetData {
  [sheetName: string]: BrandData;
}

/**
 * ブランドイメージの単一項目
 */
export interface BrandImageItem {
  name: string;
  columnIndex: number;
  value?: number;
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

