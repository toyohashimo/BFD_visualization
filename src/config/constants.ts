/**
 * アプリケーション全体で使用する定数
 */

/**
 * 制限値
 */
export const LIMITS = {
  MAX_BRANDS: 15,
  MAX_SEGMENTS: 15,
  TOP_BRAND_IMAGE_ITEMS: 30,
  MIN_CHART_HEIGHT: 200,
  MAX_CHART_HEIGHT: 800,
  DEFAULT_CHART_HEIGHT: 400,
} as const;

/**
 * LocalStorageキー
 */
export const STORAGE_KEYS = {
  ANALYSIS_MODE: 'funnel_analysis_mode',
  TARGET_BRAND: 'funnel_target_brand',
  SELECTED_BRANDS: 'funnel_selected_brands',
  SELECTED_SEGMENTS: 'funnel_selected_segments',
  SELECTED_ITEM: 'funnel_selected_item',
  CHART_HEIGHT: 'chart_height',
  CHART_TYPE: 'chart_type',
  COLOR_THEME: 'color_theme',
  SELECTED_SHEET: 'funnel_selected_sheet',
  IS_ANONYMIZED: 'chart_is_anonymized',
} as const;

/**
 * 正規表現パターン
 */
export const REGEX_PATTERNS = {
  SEGMENT_CLEANUP: /[（(]BFDシート[_＿]?[値]?[）)]?.*?St\d+/g,
} as const;

/**
 * Excel構造定数
 */
export const EXCEL_STRUCTURE = {
  HEADER_ROW_INDEX: 2,        // 3行目がヘッダー(0-based: 2)
  CATEGORY_ROW_INDEX: 0,      // 1行目がカテゴリ(0-based: 0)
  ITEM_ROW_INDEX: 1,          // 2行目が項目名(0-based: 1)
  DATA_START_INDEX: 3,        // 4行目からデータ(0-based: 3)
  BRAND_NAME_COLUMN: 3,       // D列がブランド名(0-based: 3)
} as const;

/**
 * メッセージ定数
 */
export const MESSAGES = {
  ERROR: {
    FILE_LOAD_FAILED: 'ファイルの読み込みに失敗しました。',
    INVALID_EXCEL_FORMAT: '有効なデータが見つかりませんでした。\n指定のフォーマット(3行目がヘッダー、4行目以降データ、D列ブランド名)を確認してください。',
    BRAND_LIMIT_EXCEEDED: '最大15ブランドまで比較できます',
    SEGMENT_LIMIT_EXCEEDED: '最大15セグメントまで比較できます',
    BRAND_ALREADY_SELECTED: 'このブランドは既に追加されています',
    SEGMENT_ALREADY_SELECTED: 'このセグメントは既に追加されています',
    NO_DATA_TO_EXPORT: 'エクスポートするデータがありません',
    NO_BRANDS_SELECTED: 'エクスポートするブランドを選択してください',
    NO_SEGMENTS_SELECTED: 'エクスポートするセグメントを選択してください',
  },
  SUCCESS: {
    IMAGE_COPIED: 'クリップボードにコピーしました',
    DATA_LOADED: 'データを読み込みました',
    CHART_IMAGE_COPIED: 'グラフ画像をクリップボードにコピーしました',
    COMBINED_IMAGE_COPIED: 'グラフ+データ画像をクリップボードにコピーしました',
  },
  WARNING: {
    CLIPBOARD_COPY_FAILED: 'クリップボードへのコピーに失敗しました',
    IMAGE_CAPTURE_FAILED: '画像のキャプチャに失敗しました',
  },
} as const;

/**
 * ブランドイメージ関連定数
 */
export const BRAND_IMAGE = {
  EXCLUDE_KEYWORDS: ['あてはまるものはない'],
  PATTERNS: {
    ITEM_KEYWORDS: ['ブランドイメージ'],  // 行1（項目名行）のキーワード
  },
} as const;

