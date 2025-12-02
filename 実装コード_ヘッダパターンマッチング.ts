/**
 * ExcelParser改良版：ヘッダパターンマッチング実装コード
 * 
 * ⚠️ このファイルは実装前のサンプルコードです。
 * ✅ 実装は完了しており、実際のコードは src/services/excelParser/ExcelParser.ts に反映されています。
 * 
 * このファイルは参考用として残していますが、最新の実装は src/services/excelParser/ExcelParser.ts を参照してください。
 */

// ============================================================================
// 1. 定数の更新（src/config/constants.ts）
// ============================================================================

export const EXCEL_STRUCTURE = {
  HEADER_ROW_INDEX: 2,        // 3行目がヘッダー(0-based: 2)
  CATEGORY_ROW_INDEX: 0,      // 1行目がカテゴリ(0-based: 0) ★追加
  ITEM_ROW_INDEX: 1,          // 2行目が項目名(0-based: 1) ★追加
  DATA_START_INDEX: 3,        // 4行目からデータ(0-based: 3)
  BRAND_NAME_COLUMN: 3,       // D列がブランド名(0-based: 3)
  // BRAND_IMAGE_START_COLUMN: 41,   // 削除
  // BRAND_IMAGE_END_COLUMN: 175,    // 削除
} as const;

/**
 * ブランドイメージ関連定数
 */
export const BRAND_IMAGE = {
  EXCLUDE_KEYWORDS: ['あてはまるものはない'],
  // COLUMN_RANGE を削除し、パターンマッチングに変更
  PATTERNS: {
    CATEGORY_KEYWORDS: ['共通68イメージ', 'ブランドイメージ'],  // 行0のキーワード（将来の拡張用）
    ITEM_KEYWORDS: ['ブランドイメージ'],  // 行1のキーワード
  },
} as const;

// ============================================================================
// 2. ExcelParserクラスの改良（src/services/excelParser/ExcelParser.ts）
// ============================================================================

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
 * ブランドイメージ項目を抽出（パターンマッチング版）
 * 
 * 行1（2行目）に「ブランドイメージ」を含む列を検索し、
 * 対応するヘッダー行（行2）の項目名を取得する
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

  console.log(`[ExcelParser] Extracted ${items.length} brand image items using pattern matching`);
  return items;
}

/**
 * 単一シートをパース（改良版）
 */
private parseSheet(
  worksheet: WorkSheet,
  sheetName: string
): { brands: BrandData; brandImages: Record<string, Record<string, number>> } | null {
  console.log('[ExcelParser] Starting to parse sheet:', sheetName);
  const jsonData = utils.sheet_to_json<any[]>(worksheet, { header: 1 });

  if (!validateExcelStructure(jsonData)) {
    console.warn('[ExcelParser] Invalid Excel structure for sheet:', sheetName);
    return null;
  }

  // ヘッダ情報を取得（3行分）
  const { categoryRow, itemRow, headerRow } = this.getHeaderInfo(jsonData);

  // カラムマッピングを構築（従来通り行2を使用）
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
    console.log('[ExcelParser] Found', brandImageItems.length, 'brand image items');
  }

  for (let i = EXCEL_STRUCTURE.DATA_START_INDEX; i < jsonData.length; i++) {
    const row = jsonData[i];
    const brandName = row[EXCEL_STRUCTURE.BRAND_NAME_COLUMN];

    if (!brandName || typeof brandName !== 'string') continue;

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

  console.log('[ExcelParser] Parsed', Object.keys(brands).length, 'brands from sheet:', sheetName);
  return { brands, brandImages };
}

// ============================================================================
// 3. テストコード例
// ============================================================================

/**
 * テスト用のヘルパー関数
 */
function testBrandImageExtraction() {
  // サンプルデータ
  const categoryRow = [
    null, null, null, null, null, null,
    '現在パワー項目構成要素', '現在パワー項目構成要素', '現在パワー項目構成要素',
    '将来性パワー項目構成要素', '将来性パワー項目構成要素',
    '共通68イメージ', '共通68イメージ', '共通68イメージ', // ブランドイメージのカテゴリ
  ];

  const itemRow = [
    null, null, null, null, null, null,
    '認知あり', '興味あり', 'その他',
    '将来性1', '将来性2',
    'ブランドイメージ', 'ブランドイメージ', 'ブランドイメージ', // ブランドイメージ項目
  ];

  const headerRow = [
    'セグメント', 'N数', 'ランク', 'ブランド名', 'カテゴリ', '認知者数',
    '認知あり(TOP2)', '興味あり(TOP2)', 'その他',
    '将来性1', '将来性2',
    '信頼できる', '親しみやすい', '高級感がある', // 実際のブランドイメージ項目名
  ];

  // パーサーインスタンス（実際の実装では適切に初期化）
  // const parser = new ExcelParser();
  // const items = parser.extractBrandImageItems(categoryRow, itemRow, headerRow);
  
  // 期待される結果:
  // [
  //   { name: '信頼できる', columnIndex: 11 },
  //   { name: '親しみやすい', columnIndex: 12 },
  //   { name: '高級感がある', columnIndex: 13 },
  // ]
}

// ============================================================================
// 4. 移行チェックリスト
// ============================================================================

/**
 * 実装時のチェックリスト
 * 
 * [ ] 1. src/config/constants.ts を更新
 *      - EXCEL_STRUCTURE に CATEGORY_ROW_INDEX と ITEM_ROW_INDEX を追加
 *      - BRAND_IMAGE_START_COLUMN と BRAND_IMAGE_END_COLUMN を削除
 *      - BRAND_IMAGE.COLUMN_RANGE を削除し、PATTERNS を追加
 * 
 * [ ] 2. src/services/excelParser/ExcelParser.ts を更新
 *      - getHeaderInfo メソッドを追加
 *      - extractBrandImageItems メソッドをパターンマッチング版に変更
 *      - parseSheet メソッドを修正して getHeaderInfo を使用
 * 
 * [ ] 3. テスト実行
 *      - 既存のファイル（202406、202506）で動作確認
 *      - ブランドイメージ項目が正しく抽出されることを確認
 *      - 過去比較モードで正しく動作することを確認
 * 
 * [ ] 4. エラーハンドリングの確認
 *      - ブランドイメージ項目が見つからない場合の処理
 *      - ログ出力の確認
 * 
 * [ ] 5. ドキュメント更新
 *      - 実装ガイドの更新
 *      - 変更履歴の記録
 */

