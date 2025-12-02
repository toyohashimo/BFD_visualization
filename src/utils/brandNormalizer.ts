/**
 * ブランド名の正規化ユーティリティ
 * 
 * 複数のExcelファイル間でブランド名の表記ゆれを解決するための関数群
 */

/**
 * ブランド名を正規化する
 * 
 * 正規化のルール:
 * 1. 全角括弧を半角に統一: （）→ ()
 * 2. 全角角括弧を半角に統一: ［］→ []
 * 3. 連続するスペースを1つに統一
 * 4. 前後のスペースを削除
 * 5. 説明部分（［...］）を削除（オプション）
 * 
 * @param brandName 正規化するブランド名
 * @param removeDescription 説明部分を削除するかどうか（デフォルト: false）
 * @returns 正規化されたブランド名
 * 
 * @example
 * normalizeBrandName("Apple（アップル）") // "Apple(アップル)"
 * normalizeBrandName("タイガー［魔法瓶］") // "タイガー[魔法瓶]"
 * normalizeBrandName("Apple（アップル）［コンピューター、スマホなど］", true) // "Apple(アップル)"
 */
export function normalizeBrandName(brandName: string, removeDescription = false): string {
  if (!brandName || typeof brandName !== 'string') {
    return '';
  }

  let normalized = brandName.trim();

  // 全角括弧を半角に統一
  normalized = normalized.replace(/（/g, '(').replace(/）/g, ')');
  normalized = normalized.replace(/［/g, '[').replace(/］/g, ']');

  // 説明部分を削除（オプション）
  if (removeDescription) {
    // ［...］の形式の説明を削除
    normalized = normalized.replace(/\[[^\]]+\]/g, '');
  }

  // 連続するスペースを1つに統一
  normalized = normalized.replace(/\s+/g, ' ');

  // 前後のスペースを削除
  normalized = normalized.trim();

  return normalized;
}

/**
 * ブランド名のコア部分を抽出（括弧内の読み仮名や説明を除く）
 * 
 * 例:
 * - "Apple（アップル）" → "Apple"
 * - "T-Fal（ティファール）" → "T-Fal"
 * - "タイガー[魔法瓶]" → "タイガー"
 * 
 * @param brandName ブランド名
 * @returns コア部分のみのブランド名
 */
export function extractBrandCore(brandName: string): string {
  if (!brandName || typeof brandName !== 'string') {
    return '';
  }

  let core = brandName.trim();

  // 全角括弧を半角に統一
  core = core.replace(/[（(]/g, '(').replace(/[）)]/g, ')');
  core = core.replace(/[［\[]/g, '[').replace(/[］\]]/g, ']');

  // 括弧内の内容を削除: （...）や[...]
  core = core.replace(/\([^)]*\)/g, '');
  core = core.replace(/\[[^\]]*\]/g, '');

  // 前後のスペースを削除
  core = core.trim();

  return core;
}

/**
 * 2つのブランド名が同一かどうかを判定
 * 
 * 判定ロジック:
 * 1. 正規化後の完全一致を確認
 * 2. コア部分の一致を確認
 * 
 * @param name1 ブランド名1
 * @param name2 ブランド名2
 * @returns 同一ブランドかどうか
 * 
 * @example
 * areBrandsSame("T-Fal（ティファール）", "T-fal（ティファール）") // true
 * areBrandsSame("Apple（アップル）", "Apple（アップル）［コンピューター、スマホなど］") // true
 */
export function areBrandsSame(name1: string, name2: string): boolean {
  if (!name1 || !name2) {
    return false;
  }

  const normalized1 = normalizeBrandName(name1, true);
  const normalized2 = normalizeBrandName(name2, true);
  
  // 完全一致
  if (normalized1 === normalized2) {
    return true;
  }

  // コア部分が一致
  const core1 = extractBrandCore(normalized1);
  const core2 = extractBrandCore(normalized2);
  
  if (core1 && core2 && core1 === core2) {
    return true;
  }

  return false;
}

/**
 * ブランド名のリストから、指定されたブランド名に一致するものを検索
 * 
 * @param brandName 検索するブランド名
 * @param brandList ブランド名のリスト
 * @returns 一致するブランド名（見つからない場合はnull）
 */
export function findMatchingBrand(
  brandName: string,
  brandList: string[]
): string | null {
  if (!brandName || !brandList || brandList.length === 0) {
    return null;
  }

  // 完全一致を確認
  if (brandList.includes(brandName)) {
    return brandName;
  }

  // 正規化後の完全一致を確認
  const normalizedBrandName = normalizeBrandName(brandName, true);
  for (const brand of brandList) {
    if (normalizeBrandName(brand, true) === normalizedBrandName) {
      return brand;
    }
  }

  // コア部分の一致を確認
  const coreBrandName = extractBrandCore(brandName);
  for (const brand of brandList) {
    if (areBrandsSame(brand, brandName)) {
      return brand;
    }
  }

  return null;
}

