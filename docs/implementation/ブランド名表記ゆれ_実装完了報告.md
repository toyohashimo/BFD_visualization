# ブランド名表記ゆれ解決策 - 実装完了報告

## 実装日
2025年1月

## 実装内容

ハイブリッドアプローチによるブランド名表記ゆれ解決策を実装しました。

### 1. 実装したファイル

#### 新規作成ファイル

1. **`src/utils/brandNormalizer.ts`**
   - ブランド名正規化関数
   - `normalizeBrandName()`: 基本的な表記ゆれを正規化
   - `extractBrandCore()`: コア部分を抽出
   - `areBrandsSame()`: 2つのブランド名が同一か判定
   - `findMatchingBrand()`: リストから一致するブランドを検索

2. **`src/config/brandMapping.ts`**
   - マッピングテーブル設定
   - 既知の表記ゆれを統一名にマッピング
   - `mapBrandName()`: マッピングテーブルと正規化関数を組み合わせて統一

#### 修正ファイル

3. **`src/services/excelParser/ExcelParser.ts`**
   - Excel読み込み時にブランド名を正規化・統一
   - `parseSheet()`メソッド内で`mapBrandName()`を使用

4. **`utils/dataTransforms.ts`**
   - 過去比較モードでのファジーマッチング機能を追加
   - `getBrandDataWithFuzzyMatch()`関数を追加
   - 以下の関数でファジーマッチングを使用:
     - `transformDataForHistoricalChart()`
     - `transformDataForHistoricalBrandImage()`
     - `transformDataForHistoricalBrandsComparison()`
     - `transformDataForHistoricalBrandImageBrandsComparison()`

### 2. 実装の流れ

#### Phase 1: Excel読み込み時の正規化
1. Excelファイルを読み込む際、ブランド名を`mapBrandName()`で正規化
2. マッピングテーブルに存在する場合は統一名を使用
3. 存在しない場合は正規化関数で基本的な表記を統一

#### Phase 2: 過去比較モードでのファジーマッチング
1. データ取得時に`getBrandDataWithFuzzyMatch()`を使用
2. 完全一致を試す
3. 一致しない場合は`findMatchingBrand()`でファジーマッチング
4. コア部分の一致も確認

### 3. 対応できる表記ゆれのパターン

#### 自動対応（正規化関数）
- 全角括弧 → 半角括弧: `（` → `(`, `）` → `)`
- 全角角括弧 → 半角角括弧: `［` → `[`, `］` → `]`
- 連続スペースの統一
- 前後のスペース削除

#### マッピングテーブルで対応
- 大文字小文字の違い: `T-fal` → `T-Fal`
- 説明部分の有無: `Apple（アップル）［コンピューター、スマホなど］` → `Apple（アップル）`
- 読み仮名の有無: `JOYSOUND（ジョイサウンド）` → `JOYSOUND`

### 4. 使用例

#### マッピングテーブルの追加

新しい表記ゆれが見つかった場合は、`src/config/brandMapping.ts`に追加:

```typescript
export const BRAND_NAME_MAPPING: Record<string, string> = {
  // 既存のマッピング
  'T-fal（ティファール）': 'T-Fal（ティファール）',
  
  // 新しいマッピングを追加
  '新しい表記ゆれ': '統一されたブランド名',
};
```

#### 正規化関数の使用

```typescript
import { normalizeBrandName, areBrandsSame } from '../src/utils/brandNormalizer';

// 正規化
const normalized = normalizeBrandName("Apple（アップル）"); 
// → "Apple(アップル)"

// 同一判定
const isSame = areBrandsSame("T-Fal（ティファール）", "T-fal（ティファール）"); 
// → true
```

### 5. テスト方法

1. **単体テスト**: 正規化関数の動作確認
2. **統合テスト**: 実際のExcelファイルを使用してテスト
   - 表記ゆれがある複数のExcelファイルを読み込む
   - 過去比較モードで同じブランドを選択
   - データが正しくマッチングされているか確認

### 6. 注意事項

1. **後方互換性**: 既存のデータとの互換性を保つため、正規化は慎重に行う
2. **マッピングテーブルのメンテナンス**: 新しい表記ゆれが見つかった場合は、マッピングテーブルを更新する必要がある
3. **パフォーマンス**: 大量のブランドがある場合でも、正規化処理はExcel読み込み時に一度だけ実行されるため、パフォーマンスへの影響は最小限

### 7. 今後の拡張案

1. **ユーザー設定によるマッピング**: UIからマッピングを追加・編集できる機能
2. **自動学習**: 過去のマッチング結果から自動的にマッピングを学習
3. **類似度スコアの表示**: マッチングの信頼度をユーザーに表示

## 実装完了チェックリスト

- [x] ブランド名正規化関数の実装
- [x] マッピングテーブルの作成
- [x] ExcelParserでの正規化適用
- [x] 過去比較モードでのファジーマッチング実装
- [x] リンターエラーの確認
- [x] 型定義の確認

## 関連ドキュメント

- `docs/ブランド名表記ゆれ解決策.md` - 解決策の提案書
- `docs/ブランド名表記ゆれ_実装ガイド.md` - 実装手順のガイド

