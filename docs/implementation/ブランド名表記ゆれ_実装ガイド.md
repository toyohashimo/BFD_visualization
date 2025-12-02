# ブランド名表記ゆれ解決策 - 実装ガイド

## 概要

このガイドでは、ブランド名の表記ゆれを解決するための実装手順を説明します。

## 実装手順

### Step 1: ExcelParserでのブランド名正規化

`src/services/excelParser/ExcelParser.ts`の`parseSheet`メソッドを修正します。

#### 変更前

```typescript
for (let i = EXCEL_STRUCTURE.DATA_START_INDEX; i < jsonData.length; i++) {
  const row = jsonData[i];
  const brandName = row[EXCEL_STRUCTURE.BRAND_NAME_COLUMN];

  if (!brandName || typeof brandName !== 'string') continue;

  // メトリクスの読み込み
  const metrics = this.extractMetrics(row, columnMapping);
  // ...
  brands[brandName] = metrics;
}
```

#### 変更後

```typescript
import { mapBrandName } from '../../config/brandMapping';

// parseSheetメソッド内
for (let i = EXCEL_STRUCTURE.DATA_START_INDEX; i < jsonData.length; i++) {
  const row = jsonData[i];
  let brandName = row[EXCEL_STRUCTURE.BRAND_NAME_COLUMN];

  if (!brandName || typeof brandName !== 'string') continue;

  // ブランド名を正規化・統一
  brandName = mapBrandName(brandName.trim());

  // メトリクスの読み込み
  const metrics = this.extractMetrics(row, columnMapping);
  // ...
  brands[brandName] = metrics;
}
```

### Step 2: 過去比較モードでのファジーマッチング

`utils/dataTransforms.ts`にファジーマッチング関数を追加します。

#### 追加する関数

```typescript
import { findMatchingBrand } from '../src/utils/brandNormalizer';

/**
 * ブランド名でデータを取得（表記ゆれ対応）
 * 
 * @param segmentData セグメントデータ
 * @param brandName 検索するブランド名
 * @returns ブランドデータ（見つからない場合はundefined）
 */
function getBrandDataWithFuzzyMatch(
  segmentData: Record<string, any>,
  brandName: string
): any | undefined {
  // 完全一致を試す
  if (segmentData[brandName]) {
    return segmentData[brandName];
  }

  // ファジーマッチングで検索
  const brandList = Object.keys(segmentData);
  const matchedBrand = findMatchingBrand(brandName, brandList);
  
  if (matchedBrand) {
    return segmentData[matchedBrand];
  }

  return undefined;
}
```

#### transformDataForHistoricalChartの修正

```typescript
export const transformDataForHistoricalChart = (
  // ... パラメータ
): ChartDataPoint[] | null => {
  // ...
  
  // 各データソースごとにデータ抽出
  activeSources.forEach(source => {
    const segmentData = source.data[selectedSegment];
    if (!segmentData) {
      point[source.name] = 0;
      return;
    }

    // ファジーマッチングを使用
    const brandData = getBrandDataWithFuzzyMatch(segmentData, selectedBrand);
    if (!brandData) {
      point[source.name] = 0;
      return;
    }

    // メトリクス値取得
    // ...
  });
  
  // ...
};
```

#### transformDataForHistoricalBrandImageの修正

```typescript
export const transformDataForHistoricalBrandImage = (
  // ... パラメータ
): ChartDataPoint[] | null => {
  // ...
  
  // 基準データソースからTOP30項目を選定
  const referenceSource = activeSources[0];
  const referenceBrandImageData = referenceSource.brandImageData || brandImageData;
  
  if (!referenceBrandImageData) {
    return null;
  }
  
  const segmentData = referenceBrandImageData[selectedSegment];
  if (!segmentData) {
    return null;
  }

  // ファジーマッチングを使用
  const brandList = Object.keys(segmentData);
  const matchedBrand = findMatchingBrand(selectedBrand, brandList);
  
  if (!matchedBrand) {
    console.warn(`[Historical Brand Image] ブランド '${selectedBrand}' が見つかりません`);
    return null;
  }
  
  const brandData = segmentData[matchedBrand];
  
  // TOP30項目の選定
  // ...
  
  // 各データソースの値を取得
  activeSources.forEach(source => {
    const sourceBrandImageData = source.brandImageData || brandImageData;
    if (!sourceBrandImageData) {
      dataPoint[source.name] = 0;
      return;
    }
    
    const sourceSegmentData = sourceBrandImageData[selectedSegment];
    if (!sourceSegmentData) {
      dataPoint[source.name] = 0;
      return;
    }
    
    // ファジーマッチングを使用
    const sourceMatchedBrand = findMatchingBrand(selectedBrand, Object.keys(sourceSegmentData));
    if (!sourceMatchedBrand) {
      dataPoint[source.name] = 0;
      return;
    }
    
    const sourceBrandData = sourceSegmentData[sourceMatchedBrand];
    const value = sourceBrandData[itemName] ?? 0;
    dataPoint[source.name] = value;
  });
  
  // ...
};
```

### Step 3: マッピングテーブルの更新

新しい表記ゆれが見つかった場合は、`src/config/brandMapping.ts`の`BRAND_NAME_MAPPING`に追加します。

```typescript
export const BRAND_NAME_MAPPING: Record<string, string> = {
  // 既存のマッピング
  // ...
  
  // 新しいマッピングを追加
  '新しい表記ゆれ': '統一されたブランド名',
};
```

## テスト方法

### 1. 単体テスト

正規化関数の動作を確認します。

```typescript
import { normalizeBrandName, areBrandsSame, findMatchingBrand } from '../src/utils/brandNormalizer';

// テストケース1: 全角括弧の正規化
console.log(normalizeBrandName("Apple（アップル）")); 
// 期待値: "Apple(アップル)"

// テストケース2: 同一ブランドの判定
console.log(areBrandsSame("T-Fal（ティファール）", "T-fal（ティファール）")); 
// 期待値: true

// テストケース3: ファジーマッチング
const brandList = ["T-Fal（ティファール）", "Apple（アップル）"];
console.log(findMatchingBrand("T-fal（ティファール）", brandList)); 
// 期待値: "T-Fal（ティファール）"
```

### 2. 統合テスト

実際のExcelファイルを使用してテストします。

1. 表記ゆれがある複数のExcelファイルを読み込む
2. 過去比較モードで同じブランドを選択
3. データが正しくマッチングされているか確認

## トラブルシューティング

### 問題1: マッチングが失敗する

**原因**: マッピングテーブルに該当するエントリがない

**解決策**: 
1. 正規化関数で解決できるか確認
2. 解決できない場合は、マッピングテーブルに追加

### 問題2: 誤マッチが発生する

**原因**: ファジーマッチングの閾値が低すぎる

**解決策**: 
1. `areBrandsSame`関数の判定ロジックを厳密にする
2. マッピングテーブルを優先的に使用する

### 問題3: パフォーマンスが悪い

**原因**: 大量のブランドがある場合、ファジーマッチングが遅い

**解決策**: 
1. 正規化処理をExcel読み込み時に一度だけ実行
2. マッピングテーブルを優先的に使用

## 今後の拡張

1. **ユーザー設定によるマッピング**: UIからマッピングを追加・編集できる機能
2. **自動学習**: 過去のマッチング結果から自動的にマッピングを学習
3. **類似度スコアの表示**: マッチングの信頼度をユーザーに表示

## 注意事項

1. **後方互換性**: 既存のデータとの互換性を保つため、正規化は慎重に行う
2. **データの整合性**: 正規化後のブランド名が一貫していることを確認
3. **マッピングテーブルのメンテナンス**: 定期的にマッピングテーブルを見直す

