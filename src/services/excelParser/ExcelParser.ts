import { read, utils, WorkSheet } from 'xlsx';
import {
  ParsedData,
  SheetData,
  BrandData,
  BrandImageData,
  AllMetrics,
  BrandImageItem,
  FUNNEL_KEYS,
  FUNNEL_LABELS,
  TIMELINE_KEYS,
  TIMELINE_LABELS,
  BRAND_POWER_KEYS,
  BRAND_POWER_LABELS,
  FUTURE_POWER_KEYS,
  FUTURE_POWER_LABELS,
} from '../../types';
import { EXCEL_STRUCTURE, MESSAGES, BRAND_IMAGE } from '../../config/constants';
import { validateExcelStructure } from '../../utils/validators';
import { calculateArchetypeMetrics } from '../../utils/archetypeCalculator';
import { mapBrandName } from '../../config/brandMapping';

/**
 * カラムマッピングの型定義
 */
interface ColumnMapping {
  funnel: Partial<Record<string, number>>;
  timeline: Partial<Record<string, number>>;
  brandPower: Partial<Record<string, number>>;
  futurePower: Partial<Record<string, number>>;
}

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
   * ヘッダ情報を取得（3行分）
   */
  private getHeaderInfo(jsonData: any[]): {
    categoryRow: any[];  // 行0（カテゴリ）
    itemRow: any[];       // 行1（項目名）
    headerRow: any[];     // 行2（ヘッダー）
  } {
    return {
      categoryRow: jsonData[EXCEL_STRUCTURE.CATEGORY_ROW_INDEX] || [],
      itemRow: jsonData[EXCEL_STRUCTURE.ITEM_ROW_INDEX] || [],
      headerRow: jsonData[EXCEL_STRUCTURE.HEADER_ROW_INDEX] || [],
    };
  }

  /**
   * 単一シートをパース
   */
  private parseSheet(
    worksheet: WorkSheet,
    sheetName: string
  ): { brands: BrandData; brandImages: Record<string, Record<string, number>> } | null {
    // console.log('[ExcelParser] Starting to parse sheet:', sheetName);
    const jsonData = utils.sheet_to_json<any[]>(worksheet, { header: 1 });

    if (!validateExcelStructure(jsonData)) {
      console.warn('[ExcelParser] Invalid Excel structure for sheet:', sheetName);
      return null;
    }

    // ヘッダ情報を取得（3行分）
    const { categoryRow, itemRow, headerRow } = this.getHeaderInfo(jsonData);
    const columnMapping = this.buildColumnMapping(headerRow);

    // 少なくとも1つのファネルメトリクスが必要
    if (columnMapping.funnel.FT === undefined) {
      console.warn('[ExcelParser] No funnel metrics found in sheet:', sheetName);
      return null;
    }

    const brands: BrandData = {};
    const brandImages: Record<string, Record<string, number>> = {};
    
    // ブランドイメージ項目を抽出（パターンマッチング版）
    const brandImageItems = this.extractBrandImageItems(
      categoryRow,
      itemRow,
      headerRow
    );
    
    if (brandImageItems.length === 0) {
      console.warn('[ExcelParser] No brand image items found in sheet:', sheetName);
    } else {
      // console.log('[ExcelParser] Found', brandImageItems.length, 'brand image items');
    }

    for (let i = EXCEL_STRUCTURE.DATA_START_INDEX; i < jsonData.length; i++) {
      const row = jsonData[i];
      let brandName = row[EXCEL_STRUCTURE.BRAND_NAME_COLUMN];

      if (!brandName || typeof brandName !== 'string') continue;

      // ブランド名を正規化・統一（表記ゆれ対応）
      brandName = mapBrandName(brandName.trim());

      // メトリクスの読み込み
      const metrics = this.extractMetrics(row, columnMapping);

      // ブランドイメージの読み込み
      const imageValues = this.extractBrandImageValues(row, brandImageItems);
      brandImages[brandName] = imageValues;

      // アーキタイプメトリクスの計算
      const archetypeMetrics = calculateArchetypeMetrics(imageValues);
      metrics.archetypeMetrics = archetypeMetrics;

      brands[brandName] = metrics;
    }

    // console.log('[ExcelParser] Parsed', Object.keys(brands).length, 'brands from sheet:', sheetName);
    return { brands, brandImages };
  }

  /**
   * ヘッダー行からカラムマッピングを構築
   */
  private buildColumnMapping(headers: any[]): ColumnMapping {
    const funnel: Partial<Record<string, number>> = {};
    const timeline: Partial<Record<string, number>> = {};
    const brandPower: Partial<Record<string, number>> = {};
    const futurePower: Partial<Record<string, number>> = {};

    headers.forEach((header: any, idx: number) => {
      if (!header || typeof header !== 'string') return;
      const headerStr = header.trim().replace(/\r?\n/g, '');

      // ファネルメトリクス
      FUNNEL_KEYS.forEach(key => {
        if (headerStr === FUNNEL_LABELS[key]) {
          funnel[key] = idx;
        }
      });

      // タイムラインメトリクス
      TIMELINE_KEYS.forEach(key => {
        if (headerStr === TIMELINE_LABELS[key]) {
          timeline[key] = idx;
        }
      });

      // ブランドパワーメトリクス
      BRAND_POWER_KEYS.forEach(key => {
        if (headerStr === BRAND_POWER_LABELS[key]) {
          brandPower[key] = idx;
        }
      });

      // 将来性パワーメトリクス
      FUTURE_POWER_KEYS.forEach(key => {
        if (headerStr === FUTURE_POWER_LABELS[key]) {
          futurePower[key] = idx;
        }
      });
    });

    return { funnel, timeline, brandPower, futurePower };
  }

  /**
   * 行からメトリクスを抽出
   */
  private extractMetrics(row: any[], mapping: ColumnMapping): AllMetrics {
    const metrics: AllMetrics = {
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

    return metrics;
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
   * ブランドイメージ項目を抽出（パターンマッチング版）
   */
  private extractBrandImageItems(
    categoryRow: any[],
    itemRow: any[],
    headerRow: any[]
  ): BrandImageItem[] {
    const items: BrandImageItem[] = [];

    // 行1（2行目）に「ブランドイメージ」を含む列を検索
    itemRow.forEach((itemName: any, colIdx: number) => {
      if (!itemName || typeof itemName !== 'string') return;

      const itemStr = itemName.trim();
      
      // 「ブランドイメージ」を含むかチェック
      const isBrandImage = BRAND_IMAGE.PATTERNS.ITEM_KEYWORDS.some(keyword =>
        itemStr.includes(keyword)
      );

      if (!isBrandImage) return;

      // 除外キーワードチェック
      const shouldExclude = BRAND_IMAGE.EXCLUDE_KEYWORDS.some((keyword) =>
        itemStr.includes(keyword)
      );
      if (shouldExclude) return;

      // ヘッダー行（行2）から実際の項目名を取得
      const headerName = headerRow[colIdx];
      if (!headerName || typeof headerName !== 'string') {
        // ヘッダー名がない場合は、項目名を使用
        items.push({
          name: itemStr,
          columnIndex: colIdx,
        });
        return;
      }

      items.push({
        name: headerName.trim(),
        columnIndex: colIdx,
      });
    });

    // console.log(`[ExcelParser] Extracted ${items.length} brand image items using pattern matching`);
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

