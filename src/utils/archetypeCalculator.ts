import { ArchetypeMetrics } from '../types/metrics';
import { ARCHETYPE_DEFINITIONS } from '../constants/archetypeConfigs';

/**
 * ブランドイメージメトリクスからアーキタイプメトリクスを計算
 * 
 * @param imageMetrics ブランドイメージメトリクス（項目名→数値のマップ）
 * @returns アーキタイプメトリクス（12タイプのアーキタイプ値）
 * 
 * 計算方法：
 * 各アーキタイプの値 = 対応するイメージ項目の平均値
 * 
 * 例：創造者（Creator）
 * - 新しい価値を提案する = 2.5
 * - 先見性のある = 1.5
 * - 独創性がある = 1.6
 * - 知的な = 0.3
 * - 信念・ポリシーのある = 0.9
 * → 創造者 = (2.5 + 1.5 + 1.6 + 0.3 + 0.9) / 5 = 1.36
 */
export function calculateArchetypeMetrics(
  imageMetrics: Record<string, number>
): ArchetypeMetrics {
  const archetypeMetrics: ArchetypeMetrics = {
    creator: 0,
    ruler: 0,
    sage: 0,
    explorer: 0,
    innocent: 0,
    outlaw: 0,
    magician: 0,
    hero: 0,
    lover: 0,
    jester: 0,
    regular: 0,
    caregiver: 0
  };

  // 各アーキタイプの計算
  Object.keys(ARCHETYPE_DEFINITIONS).forEach(archetypeKey => {
    const definition = ARCHETYPE_DEFINITIONS[archetypeKey];
    const values: number[] = [];

    // 対応する項目の値を収集
    definition.items.forEach(itemName => {
      const value = imageMetrics[itemName];
      if (value !== undefined && value !== null && !isNaN(value)) {
        values.push(value);
      }
    });

    // 平均値を計算
    if (values.length > 0) {
      const sum = values.reduce((acc, val) => acc + val, 0);
      archetypeMetrics[archetypeKey as keyof ArchetypeMetrics] = sum / values.length;
    }
  });

  return archetypeMetrics;
}

/**
 * アーキタイプメトリクスをパーセンテージ表示用にフォーマット
 * 
 * @param value アーキタイプ値
 * @returns フォーマット済み文字列（小数点2桁）
 */
export function formatArchetypeValue(value: number): string {
  return value.toFixed(2);
}

/**
 * アーキタイプメトリクスを検証
 * 
 * @param archetypeMetrics アーキタイプメトリクス
 * @returns 有効かどうか
 */
export function validateArchetypeMetrics(archetypeMetrics: ArchetypeMetrics): boolean {
  // すべての値が有効な数値であるかチェック
  return Object.values(archetypeMetrics).every(value => 
    typeof value === 'number' && !isNaN(value) && isFinite(value)
  );
}

