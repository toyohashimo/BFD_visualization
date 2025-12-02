import { REGEX_PATTERNS } from '../config/constants';

/**
 * セグメント名をクリーンアップ
 * 例: "全体(BFDシート_値)St4" -> "全体"
 */
export const formatSegmentName = (segmentName: string): string => {
  return segmentName.replace(REGEX_PATTERNS.SEGMENT_CLEANUP, '').trim();
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

