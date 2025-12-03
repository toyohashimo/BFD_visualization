import { REGEX_PATTERNS } from '../config/constants';

/**
 * セグメント名をクリーンアップ & マスク処理
 * 例: "全体(BFDシート_値)St4" -> "全体"
 * 
 * DEMOモード(isAnonymized=true)の場合の挙動:
 * - "全体" -> マスクしない
 * - "男性" or "女性" を含む -> マスクしない
 * - 年齢(数字+"歳") を含む -> マスクしない
 * - それ以外 -> "セグメント{index + 1}" (index指定なしの場合は"セグメント")
 */
export const formatSegmentName = (
  segmentName: string,
  isAnonymized: boolean = false,
  index?: number
): string => {
  // まずクリーンアップ
  const cleaned = segmentName.replace(REGEX_PATTERNS.SEGMENT_CLEANUP, '').trim() || segmentName;

  if (!isAnonymized) {
    return cleaned;
  }

  // DEMOモードの例外ルール（マスクしないもの）
  // 1. "全体"
  if (cleaned === '全体') {
    return cleaned;
  }

  // 2. 性別（男性・女性）
  if (cleaned.includes('男性') || cleaned.includes('女性')) {
    return cleaned;
  }

  // 3. 年齢（数字 + 歳）
  if (/\d+歳/.test(cleaned)) {
    return cleaned;
  }

  // 上記以外はマスク
  return typeof index === 'number' ? `セグメント${index + 1}` : 'セグメント';
};

/**
 * ブランド名をフォーマット(匿名化対応)
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

