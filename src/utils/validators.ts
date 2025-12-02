import { LIMITS } from '../config/constants';

/**
 * Excelデータ構造の検証
 */
export const validateExcelStructure = (data: any[][]): boolean => {
  if (!Array.isArray(data)) return false;
  if (data.length < 4) return false; // 最低4行必要(ヘッダー含む)
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

