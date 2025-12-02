/**
 * ブランド名のマッピングテーブル
 * 
 * キー: 様々な表記ゆれ
 * 値: 統一されたブランド名
 * 
 * このマッピングテーブルは、正規化関数では解決できない
 * 特殊な表記ゆれを解決するために使用されます。
 */

import { normalizeBrandName } from '../utils/brandNormalizer';

/**
 * ブランド名のマッピングテーブル
 * 
 * 新しい表記ゆれが見つかった場合は、このテーブルに追加してください。
 */
export const BRAND_NAME_MAPPING: Record<string, string> = {
  // T-Fal関連
  'T-fal（ティファール）': 'T-Fal（ティファール）',
  'T-Fal（ティファール）': 'T-Fal（ティファール）',
  
  // タイガー関連
  'タイガー［魔法瓶］': 'タイガー[魔法瓶]',
  'タイガー[魔法瓶]': 'タイガー[魔法瓶]',
  
  // Apple関連
  'Apple（アップル）［コンピューター、スマホなど］': 'Apple（アップル）',
  'Apple（アップル）': 'Apple（アップル）',
  
  // JOYSOUND関連
  'JOYSOUND（ジョイサウンド）': 'JOYSOUND',
  'JOYSOUND': 'JOYSOUND',
  
  // コロナ関連
  'コロナ Relala（リララ）': 'コロナ Relala（リララ）',
  'コロナRelala（リララ）': 'コロナ Relala（リララ）',
  
  // サーモス関連
  'THERMOS（サーモス）': 'サーモス',
  'サーモス': 'サーモス',
  
  // その他の例（必要に応じて追加）
  // '表記ゆれ1': '統一された名前1',
  // '表記ゆれ2': '統一された名前2',
};

/**
 * ブランド名をマッピングテーブルで統一する
 * 
 * 1. マッピングテーブルに存在する場合は統一名を返す
 * 2. マッピングがない場合は正規化関数を使用
 * 
 * @param brandName 統一するブランド名
 * @returns 統一されたブランド名
 */
export function mapBrandName(brandName: string): string {
  if (!brandName || typeof brandName !== 'string') {
    return '';
  }

  const trimmedName = brandName.trim();

  // マッピングテーブルに存在する場合は統一名を返す
  if (BRAND_NAME_MAPPING[trimmedName]) {
    return BRAND_NAME_MAPPING[trimmedName];
  }

  // マッピングがない場合は正規化後の名前を返す
  return normalizeBrandName(trimmedName);
}

/**
 * マッピングテーブルに新しいエントリを追加する
 * 
 * @param variant 表記ゆれのバリエーション
 * @param standard 統一されたブランド名
 */
export function addBrandMapping(variant: string, standard: string): void {
  BRAND_NAME_MAPPING[variant.trim()] = standard.trim();
}

/**
 * マッピングテーブルからエントリを削除する
 * 
 * @param variant 削除するバリエーション
 */
export function removeBrandMapping(variant: string): void {
  delete BRAND_NAME_MAPPING[variant.trim()];
}

