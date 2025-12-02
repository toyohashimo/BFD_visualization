# ブランド名表記ゆれ解決策

## 問題の概要

複数のExcelファイル間でブランド名の表記が異なる場合、過去比較モードで正しくデータをマッチングできません。

### 表記ゆれの例

| ブランド | 202506 | 202406 | 202304 |
|---------|--------|--------|--------|
| T-Fal | `T-Fal（ティファール）` | `T-fal（ティファール）` | `T-Fal（ティファール）` |
| タイガー | `タイガー[魔法瓶]` | `タイガー[魔法瓶]` | `タイガー［魔法瓶］` |
| Apple | `Apple（アップル）` | `Apple（アップル）` | `Apple（アップル）［コンピューター、スマホなど］` |
| JOYSOUND | `JOYSOUND` | `JOYSOUND` | `JOYSOUND（ジョイサウンド）` |
| コロナ | `コロナ Relala（リララ）` | `コロナ Relala（リララ）` | - |

### 表記ゆれのパターン

1. **大文字小文字の違い**: `T-Fal` vs `T-fal`
2. **括弧の種類の違い**: `[魔法瓶]` vs `［魔法瓶］`（全角・半角）
3. **説明の有無**: `Apple（アップル）` vs `Apple（アップル）［コンピューター、スマホなど］`
4. **読み仮名の有無**: `JOYSOUND` vs `JOYSOUND（ジョイサウンド）`
5. **スペースの有無**: `コロナ Relala` vs `コロナRelala`
6. **全角半角の違い**: `（` vs `(`

## 解決策のアプローチ

### アプローチ1: ブランド名正規化関数（推奨）

ブランド名を正規化する関数を作成し、Excel読み込み時に統一する。

**メリット**:
- 自動的に表記を統一できる
- コードがシンプル
- パフォーマンスが良い

**デメリット**:
- 複雑な表記ゆれには対応できない場合がある

**実装方針**:
1. 正規化関数を作成（`src/utils/brandNormalizer.ts`）
2. ExcelParserでブランド名を正規化して保存
3. 過去比較モードでのマッチング時に正規化を使用

### アプローチ2: マッピングテーブル

表記ゆれのマッピングテーブルを作成し、統一された名前に変換する。

**メリット**:
- 複雑な表記ゆれにも対応可能
- ユーザーがカスタマイズ可能

**デメリット**:
- マッピングテーブルのメンテナンスが必要
- 新しいブランドが追加されるたびに更新が必要

**実装方針**:
1. マッピングテーブルファイルを作成（`src/config/brandMapping.ts`）
2. ExcelParserでマッピングを適用
3. マッピングが見つからない場合は正規化関数を使用

### アプローチ3: ファジーマッチング

類似度アルゴリズムを使用して、異なる表記を同一ブランドとして認識する。

**メリット**:
- 未知の表記ゆれにも対応可能
- 自動的にマッチングできる

**デメリット**:
- パフォーマンスが悪い可能性がある
- 誤マッチのリスクがある
- 実装が複雑

**実装方針**:
1. 文字列類似度アルゴリズム（Levenshtein距離など）を実装
2. 過去比較モードでのデータ取得時にファジーマッチングを使用
3. 閾値を設定して誤マッチを防止

### アプローチ4: ハイブリッド（推奨）

正規化関数 + マッピングテーブルの組み合わせ。

**実装方針**:
1. まず正規化関数で基本的な表記を統一
2. マッピングテーブルで特殊な表記ゆれを解決
3. マッピングが見つからない場合は正規化後の名前を使用

## 推奨実装: ハイブリッドアプローチ

### 1. ブランド名正規化関数の作成

```typescript
// src/utils/brandNormalizer.ts

/**
 * ブランド名を正規化する
 * 
 * 正規化のルール:
 * 1. 全角括弧を半角に統一: （）→ ()
 * 2. 全角角括弧を半角に統一: ［］→ []
 * 3. 連続するスペースを1つに統一
 * 4. 前後のスペースを削除
 * 5. 説明部分（［...］）を削除（オプション）
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
 */
export function extractBrandCore(brandName: string): string {
  if (!brandName || typeof brandName !== 'string') {
    return '';
  }

  let core = brandName.trim();

  // 括弧内の内容を削除: （...）や[...]
  core = core.replace(/[（(].*?[）)]/g, '');
  core = core.replace(/[［\[]/g, '[').replace(/[］\]]/g, ']');
  core = core.replace(/\[.*?\]/g, '');

  // 前後のスペースを削除
  core = core.trim();

  return core;
}

/**
 * 2つのブランド名が同一かどうかを判定
 */
export function areBrandsSame(name1: string, name2: string): boolean {
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
```

### 2. マッピングテーブルの作成

```typescript
// src/config/brandMapping.ts

/**
 * ブランド名のマッピングテーブル
 * 
 * キー: 様々な表記ゆれ
 * 値: 統一されたブランド名
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
  
  // その他の例
  'THERMOS（サーモス）': 'サーモス',
  'サーモス': 'サーモス',
};

/**
 * ブランド名をマッピングテーブルで統一する
 */
export function mapBrandName(brandName: string): string {
  if (!brandName || typeof brandName !== 'string') {
    return '';
  }

  // マッピングテーブルに存在する場合は統一名を返す
  if (BRAND_NAME_MAPPING[brandName]) {
    return BRAND_NAME_MAPPING[brandName];
  }

  // マッピングがない場合は正規化後の名前を返す
  return normalizeBrandName(brandName);
}
```

### 3. ExcelParserでの適用

```typescript
// src/services/excelParser/ExcelParser.ts

import { normalizeBrandName, mapBrandName } from '../../utils/brandNormalizer';
import { BRAND_NAME_MAPPING } from '../../config/brandMapping';

// parseSheetメソッド内でブランド名を正規化
for (let i = EXCEL_STRUCTURE.DATA_START_INDEX; i < jsonData.length; i++) {
  const row = jsonData[i];
  let brandName = row[EXCEL_STRUCTURE.BRAND_NAME_COLUMN];

  if (!brandName || typeof brandName !== 'string') continue;

  // ブランド名を正規化
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
```

### 4. 過去比較モードでのマッチング改善

```typescript
// utils/dataTransforms.ts

import { normalizeBrandName, areBrandsSame } from '../src/utils/brandNormalizer';

/**
 * ブランド名でデータを取得（表記ゆれ対応）
 */
function getBrandDataWithFuzzyMatch(
  segmentData: Record<string, any>,
  brandName: string
): any | undefined {
  // 完全一致を試す
  if (segmentData[brandName]) {
    return segmentData[brandName];
  }

  // 正規化後の名前で検索
  const normalizedBrandName = normalizeBrandName(brandName, true);
  for (const [key, value] of Object.entries(segmentData)) {
    if (areBrandsSame(key, brandName)) {
      return value;
    }
  }

  return undefined;
}

// transformDataForHistoricalChart内で使用
const brandData = getBrandDataWithFuzzyMatch(segmentData, selectedBrand);
```

## 実装の優先順位

1. **Phase 1: 基本正規化関数の実装**
   - `normalizeBrandName`関数の作成
   - ExcelParserでの適用

2. **Phase 2: マッピングテーブルの追加**
   - 既知の表記ゆれをマッピングテーブルに追加
   - `mapBrandName`関数の実装

3. **Phase 3: 過去比較モードでの改善**
   - ファジーマッチング機能の追加
   - エラーハンドリングの改善

## 注意事項

1. **後方互換性**: 既存のデータとの互換性を保つため、正規化は慎重に行う
2. **パフォーマンス**: 大量のブランドがある場合、正規化処理のパフォーマンスに注意
3. **マッピングテーブルのメンテナンス**: 新しい表記ゆれが見つかった場合は、マッピングテーブルを更新する必要がある
4. **ユーザー確認**: 自動マッチングが正しく動作しているか、ユーザーが確認できる仕組みがあると良い

## 参考: 表記ゆれのパターン分析

提供されたデータから見つかった表記ゆれのパターン:

1. **大文字小文字**: 5件（T-Fal, Apple等）
2. **括弧の種類**: 3件（［］vs []）
3. **説明の有無**: 2件（Apple等）
4. **読み仮名の有無**: 1件（JOYSOUND）
5. **スペース**: 1件（コロナ Relala）

合計: 約12件の表記ゆれが確認されました。

