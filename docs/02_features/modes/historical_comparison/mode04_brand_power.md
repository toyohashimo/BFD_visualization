# 過去比較モード Mode 3 要件定義書

## 📋 概要

**実装日**: 2025-11-30  
**実装対象**: 過去比較モード - ブランドイメージ分析（Mode 3）  
**ステータス**: 📝 要件定義完了

本ドキュメントは、過去比較モードの3番目の実装であるMode 3（ブランドイメージ分析）の要件定義をまとめたものです。

---

## 🎯 モード概要

### 基本情報

|| 項目 | 内容 |
||------|------|
|| **グローバルモード** | 過去比較モード |
|| **モード番号** | 3 |
|| **モードID** | `historical_brand_image_segment_brand` |
|| **モード名** | ブランドイメージ分析（セグメント、ブランド: X=ブランドイメージ×過去比較） |
|| **Description** | 単一セグメント・単一ブランドにおける過去データとの比較（ブランドイメージ項目） |

### 分析軸の構成

| 軸 | 役割 | 値 | 選択方式 | 備考 |
|----|------|-----|---------|------|
| **分析項目** | X_AXIS | ブランドイメージ | 自動選定（TOP30） | 基準データソースから選定 |
| **セグメント** | FILTER | セグメント名 | SA（単一選択） | ドロップダウン |
| **ブランド** | FILTER | ブランド名 | SA（単一選択） | ドロップダウン |
| **データ系列** | SERIES | データソース（期間） | 複数（最大3） | 時系列比較 |

---

## 🔄 詳細分析モード（モード7）との違い

### 比較表

| 項目 | 詳細分析モード（Mode 7） | 過去比較モード（Mode 3） |
|------|------------------------|------------------------|
| **グローバルモード** | 詳細分析 | 過去比較 |
| **モード名** | ブランドイメージ分析（セグメント: X=ブランドイメージ×ブランド） | ブランドイメージ分析（セグメント、ブランド: X=ブランドイメージ×過去比較） |
| **比較対象** | 複数ブランド間 | 複数時点（過去データ） |
| **セグメント選択** | SA（単一） | SA（単一） |
| **ブランド選択** | MA（複数） | SA（単一） |
| **データ系列** | 複数ブランド | 複数データソース（期間） |
| **X軸項目選定基準** | 先頭ブランドのTOP30 | 先頭データソースのTOP30 |
| **凡例表示** | ブランド名 | データソース名（例：2025年6月） |

### 具体例

**詳細分析モード - Mode 7**
```
セグメント: 全体（SA）
ブランド: ブランドA、ブランドB、ブランドC（MA）
X軸: ブランドAのTOP30イメージ項目
データ系列: ブランドA、ブランドB、ブランドC
```

**過去比較モード - Mode 3**
```
セグメント: 全体（SA）
ブランド: ブランドA（SA）
X軸: 2025年6月データのブランドAのTOP30イメージ項目
データ系列: 2025年6月、2024年6月、2023年6月
```

---

## 📊 ブランドイメージ項目の特性

### データソース

- **総数**: 133項目
- **Excel列範囲**: AP列～FS列（列インデックス41～174）
- **項目例**: 「信頼できる」「高品質な」「革新的な」「伝統的な」など
- **除外項目**: 「あてはまるものはない」は自動的に除外

### TOP30選定ロジック（過去比較モード固有）

#### 基準データソースの決定

**過去比較モード特有の処理**:
1. **アクティブなデータソースをフィルタ**: `isActive === true`のデータソースのみ
2. **基準データソースの決定**: アクティブなデータソースの**先頭（最初）**を基準とする
3. **数値降順ソート**: 基準データソースの指定セグメント・ブランドの全イメージ項目を数値の高い順にソート
4. **TOP30抽出**: 上位30項目を抽出
5. **他データソースへの適用**: 抽出した30項目を、他のアクティブなデータソースにも適用

#### 選定フロー

```typescript
function selectTop30ImagesForHistoricalMode(
  dataSources: DataSource[],     // 複数のデータソース
  selectedSegment: string,        // 選択されたセグメント
  selectedBrand: string          // 選択されたブランド
): string[] {
  // 1. アクティブなデータソースをフィルタ
  const activeSources = dataSources.filter(ds => ds.isActive);
  if (activeSources.length === 0) return [];
  
  // 2. 基準データソース（先頭）を取得
  const referenceSource = activeSources[0];
  
  // 3. 基準データソースから該当データを取得
  const segmentData = referenceSource.data[selectedSegment];
  if (!segmentData) return [];
  
  const brandData = segmentData.brands.find(b => b.name === selectedBrand);
  if (!brandData || !brandData.imageMetrics) return [];
  
  // 4. イメージ項目を数値降順でソート
  const sortedItems = Object.entries(brandData.imageMetrics)
    .filter(([itemName]) => itemName !== 'あてはまるものはない')  // 除外
    .sort((a, b) => b[1] - a[1])  // 降順ソート
    .slice(0, 30)  // 上位30項目
    .map(entry => entry[0]);
  
  // 5. TOP30項目のリストを返す
  return sortedItems;
}
```

### データソース順序の重要性

- **基準データソースの変更**: `DataSourceManager`でデータソースの並び順を変更すると、基準データソースが変わり、TOP30項目も変わる可能性がある
- **UI警告表示**: 基準データソースを明示する警告バッジを表示（例：「基準: 2025年6月」）

---

## 🏗️ 技術仕様

### 1. 型定義（`src/types/analysis.ts`）

```typescript
export type AnalysisMode =
  | ''
  // 詳細分析モード
  | 'segment_x_multi_brand'
  // ... 他のモード ...
  | 'brand_image_segment_brands'  // Mode 7（詳細分析）
  // 過去比較モード
  | 'historical_funnel1_segment_brand'
  | 'historical_funnel2_segment_brand'
  | 'historical_brand_image_segment_brand';  // ← Mode 3（新規追加）
```

### 2. モード設定（`constants/analysisConfigs.ts`）

```typescript
export const HISTORICAL_ANALYSIS_MODE_CONFIGS: Record<string, AnalysisModeConfig> = {
  // 既存モード
  'historical_funnel1_segment_brand': { /* ... */ },
  'historical_funnel2_segment_brand': { /* ... */ },
  
  // Mode 3（新規追加）
  'historical_brand_image_segment_brand': {
    id: 'historical_brand_image_segment_brand',
    name: 'ブランドイメージ分析（セグメント、ブランド: X=ブランドイメージ×過去比較）',
    description: '単一セグメント・単一ブランドにおける過去データとの比較（ブランドイメージ項目）',
    axes: {
      items: {
        role: 'X_AXIS',
        label: '分析項目',
        allowMultiple: false,
        itemSet: 'brandImage',       // ← ブランドイメージ項目セット
        fixedItems: [],              // ← 動的に決定されるため空
        autoSelect: true,            // ← 自動選定を有効化
        autoSelectCount: 30          // ← TOP30を選定
      },
      segments: {
        role: 'FILTER',
        label: 'データシート',
        allowMultiple: false
      },
      brands: {
        role: 'FILTER',
        label: 'ブランド',
        allowMultiple: false
      }
    },
    dataTransform: {
      xAxis: 'items',
      series: 'dataSources',         // ← データソースが系列
      filter: 'segments'
    },
    defaultChartType: 'bar'
  }
};

// モード選択順序への追加
export const HISTORICAL_ANALYSIS_MODE_ORDER = [
  'historical_funnel1_segment_brand',
  'historical_funnel2_segment_brand',
  'historical_brand_image_segment_brand'  // ← 追加
  // 今後Mode 4-14を追加予定
];
```

### 3. データ変換ロジック（`utils/dataTransforms.ts`）

#### 既存関数の拡張

**注意点**: Mode 1・2で実装された`transformDataForHistoricalChart`は**固定項目**（FT, FW, FZ...やT1, T2, T3...）を前提としているため、**ブランドイメージ項目のような動的項目には対応していません**。

#### 新規関数の追加

```typescript
/**
 * 過去比較モード - ブランドイメージ分析用のデータ変換
 * TOP30項目を基準データソースから自動選定して、各データソースのデータを変換
 */
export const transformDataForHistoricalBrandImage = (
  dataSources: DataSource[],
  config: AnalysisModeConfig,
  selectedSegment: string,
  selectedBrand: string,
  labelGetters: Record<AxisType, (key: string) => string>
): ChartDataPoint[] | null => {
  
  // 1. アクティブなデータソースをフィルタ
  const activeSources = dataSources.filter(ds => ds.isActive);
  if (activeSources.length === 0) {
    console.warn('[Historical Brand Image] アクティブなデータソースがありません');
    return null;
  }
  
  // 2. セグメント・ブランドのバリデーション
  if (!selectedSegment || !selectedBrand) {
    console.warn('[Historical Brand Image] セグメントまたはブランドが選択されていません');
    return null;
  }
  
  // 3. 基準データソースからTOP30項目を選定
  const referenceSource = activeSources[0];
  const segmentData = referenceSource.data[selectedSegment];
  if (!segmentData) {
    console.warn(`[Historical Brand Image] セグメント '${selectedSegment}' が見つかりません`);
    return null;
  }
  
  const brandData = segmentData.brands.find(b => b.name === selectedBrand);
  if (!brandData || !brandData.imageMetrics) {
    console.warn(`[Historical Brand Image] ブランド '${selectedBrand}' またはimageMetricsが見つかりません`);
    return null;
  }
  
  // 4. TOP30項目の選定
  const top30Items = Object.entries(brandData.imageMetrics)
    .filter(([itemName]) => itemName !== 'あてはまるものはない')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(entry => entry[0]);
  
  if (top30Items.length === 0) {
    console.warn('[Historical Brand Image] TOP30項目が選定できませんでした');
    return null;
  }
  
  // 5. 各項目ごとにデータポイントを生成
  const chartData: ChartDataPoint[] = top30Items.map(itemName => {
    const dataPoint: ChartDataPoint = {
      name: itemName  // X軸のラベル
    };
    
    // 6. 各データソースの値を取得
    activeSources.forEach(source => {
      const sourceSegmentData = source.data[selectedSegment];
      if (!sourceSegmentData) {
        dataPoint[source.name] = 0;
        return;
      }
      
      const sourceBrandData = sourceSegmentData.brands.find(b => b.name === selectedBrand);
      if (!sourceBrandData || !sourceBrandData.imageMetrics) {
        dataPoint[source.name] = 0;
        return;
      }
      
      // 項目の値を取得（存在しない場合は0）
      const value = sourceBrandData.imageMetrics[itemName] ?? 0;
      dataPoint[source.name] = value;
    });
    
    return dataPoint;
  });
  
  return chartData;
};
```

### 4. 呼び出し側の実装（`App.tsx`）

```typescript
// グローバルモードに応じてデータ変換関数を切り替え
const chartData = useMemo(() => {
  if (globalMode === 'historical') {
    // 過去比較モード
    const config = currentModeConfigs[analysisMode];
    if (!config) return null;
    
    // ブランドイメージ分析の場合は専用関数を使用
    if (config.axes.items?.itemSet === 'brandImage' && config.axes.items?.autoSelect) {
      return transformDataForHistoricalBrandImage(
        dataSources,
        config,
        selectedSegments[0] || '',
        selectedBrands[0] || '',
        { items: getItemLabel, segments: getSegmentLabel, brands: getBrandLabel }
      );
    }
    
    // その他の固定項目モード（Mode 1, 2など）
    return transformDataForHistoricalChart(
      dataSources,
      config,
      selectedSegments[0] || '',
      selectedBrands[0] || '',
      '',  // selectedItem（使用しない）
      { items: getItemLabel, segments: getSegmentLabel, brands: getBrandLabel }
    );
  } else {
    // 詳細分析モード（既存ロジック）
    return transformDataForChart(/* ... */);
  }
}, [globalMode, analysisMode, dataSources, selectedSegments, selectedBrands, /* ... */]);
```

---

## 🎨 UI/UX 仕様

### 1. サイドバー構成（過去比較モード - Mode 3選択時）

```
┌─────────────────────────────────┐
│ [詳細分析] [過去比較] ★        │
├─────────────────────────────────┤
│ 📁 データソース管理            │
│   ⚠️ 基準: 2025年6月            │ ← 基準データソース警告
│   ○ 2025年6月  [編集] [削除]   │
│   ○ 2024年6月  [編集] [削除]   │
│   ○ 2023年6月  [編集] [削除]   │
│   [+ ファイル追加] (3/3)        │
├─────────────────────────────────┤
│ 📊 分析モード                   │
│   ▼ Mode 3: ブランドイメージ… │
├─────────────────────────────────┤
│ 📈 分析項目                     │
│   【固定】 TOP30自動選定        │ ← 選択不要（自動）
├─────────────────────────────────┤
│ 📂 セグメント 【SA】            │
│   ▼ 全体                        │
├─────────────────────────────────┤
│ 🏷️ ブランド 【SA】              │
│   ▼ ブランドA                   │
├─────────────────────────────────┤
│ 🎨 グラフ設定                   │
│   [棒グラフ] [折れ線] [レーダー]│
└─────────────────────────────────┘
```

### 2. 基準データソースの警告表示

#### 表示位置
- `DataSourceManager`コンポーネントの上部
- データソースリストの直前

#### 表示形式
```tsx
<div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2 text-sm">
  ⚠️ <strong>基準:</strong> {activeSources[0].name}
  <span className="text-gray-600 ml-2">
    （TOP30項目の選定基準となるデータソース）
  </span>
</div>
```

#### 表示条件
- 過去比較モード選択時
- `analysisMode === 'historical_brand_image_segment_brand'`
- アクティブなデータソースが1つ以上ある場合

### 3. X軸ラベルの表示

#### 縦方向表示（90度回転）

**理由**: 30項目を表示するため、横方向では重なってしまう

**Recharts設定例**:
```tsx
<XAxis
  dataKey="name"
  angle={-90}
  textAnchor="end"
  height={150}  // X軸の高さを確保
  interval={0}   // すべてのラベルを表示
  tick={{ fontSize: 10 }}
/>
```

### 4. グラフ出力例

#### 棒グラフ（デフォルト）

```
100% ┤
 80% ┤ ███ ▓▓▓ ░░░
 60% ┤ ███ ▓▓▓ ░░░
 40% ┤ ███ ▓▓▓ ░░░
 20% ┤ ███ ▓▓▓ ░░░
  0% ┼────────────────────────────
     信 高 革 伝 安 品 お 使 ……（30項目）
     頼 品 新 統 心 質 し い
     で 質 的 的 で が ゃ や
     き な な な き い れ す
     る               い
     
凡例: ███ 2025年6月  ▓▓▓ 2024年6月  ░░░ 2023年6月
```

#### レーダーチャート（切り替え可能）

```
       信頼できる
           /\
          /  \
         /    \
        /      \
  高品質な――――――――革新的な
        \      /
         \    /
          \  /
           \/
       伝統的な
       
各軸: TOP30項目
各線: 2025年6月、2024年6月、2023年6月
```

---

## 📊 データテーブル出力例

### テーブル構造

```
┌─────────────┬──────┬──────┬──────┬──────┬──────┬─────┐
│             │信頼で│高品質│革新的│伝統的│安心で│… │
│             │きる  │な    │な    │な    │きる  │(30)│
├─────────────┼──────┼──────┼──────┼──────┼──────┼─────┤
│ 2025年6月   │ 45.2 │ 42.1 │ 38.5 │ 35.9 │ 34.2 │ … │
│ 2024年6月   │ 43.8 │ 40.5 │ 36.7 │ 34.1 │ 32.8 │ … │
│ 2023年6月   │ 42.1 │ 39.2 │ 35.4 │ 33.5 │ 31.5 │ … │
└─────────────┴──────┴──────┴──────┴──────┴──────┴─────┘
```

### ポイント

- **行（縦）**: データソース名（期間）
- **列（横）**: ブランドイメージ項目（TOP30）
- **値**: パーセンテージ（1桁小数）

---

## 📝 CSV エクスポート形式

### フォーマット

```csv
セグメント,ブランド,データソース,信頼できる,高品質な,革新的な,伝統的な,安心できる,...
全体,ブランドA,2025年6月,45.2,42.1,38.5,35.9,34.2,...
全体,ブランドA,2024年6月,43.8,40.5,36.7,34.1,32.8,...
全体,ブランドA,2023年6月,42.1,39.2,35.4,33.5,31.5,...
```

### ヘッダー行

1. `セグメント`: 固定
2. `ブランド`: 固定
3. `データソース`: 固定
4. 以降: TOP30項目名（動的）

---

## 🧪 テストケース

### 機能テスト

| ID | テストケース | 期待結果 |
|----|-------------|---------|
| HBI-01 | Mode 3を選択 | モード名が表示される |
| HBI-02 | セグメント選択（SA） | ドロップダウンで単一選択 |
| HBI-03 | ブランド選択（SA） | ドロップダウンで単一選択 |
| HBI-04 | グラフ生成 | X軸にTOP30項目、凡例にデータソース名 |
| HBI-05 | データテーブル生成 | 行にデータソース、列にTOP30項目 |
| HBI-06 | CSV エクスポート | 正しいフォーマットでエクスポート |
| HBI-07 | グラフタイプ切り替え | 棒グラフ↔レーダーチャート |

### TOP30選定テスト

| ID | テストケース | 期待結果 |
|----|-------------|---------|
| HBI-11 | 基準データソース（先頭）からTOP30選定 | 数値降順で30項目抽出 |
| HBI-12 | 「あてはまるものはない」除外 | TOP30に含まれない |
| HBI-13 | イメージ項目が30未満の場合 | すべての項目を表示 |
| HBI-14 | データソース順序変更 | 基準データソースが変わり、TOP30が再選定される |

### エラーハンドリング

| ID | テストケース | 期待結果 |
|----|-------------|---------|
| HBI-21 | データソース0件 | エラーメッセージ表示 |
| HBI-22 | セグメント未選択 | エラーメッセージ表示 |
| HBI-23 | ブランド未選択 | エラーメッセージ表示 |
| HBI-24 | imageMetrics未定義 | エラーメッセージ表示 |
| HBI-25 | 全データソースOFF | エラーメッセージ表示 |

---

## 🚀 実装手順（Mode 1・2の実績を活用）

### Phase 1: 設定追加（約5分）

#### 1.1 型定義の更新
- `src/types/analysis.ts`
- `'historical_brand_image_segment_brand'`を追加

#### 1.2 モード設定の追加
- `constants/analysisConfigs.ts`
- `HISTORICAL_ANALYSIS_MODE_CONFIGS`に追加
- `HISTORICAL_ANALYSIS_MODE_ORDER`に追加

### Phase 2: データ変換ロジック追加（約15分）

#### 2.1 新規関数の追加
- `utils/dataTransforms.ts`
- `transformDataForHistoricalBrandImage`関数を追加

#### 2.2 呼び出し側の実装
- `App.tsx`
- グローバルモード分岐に`itemSet === 'brandImage'`の条件追加

### Phase 3: UI調整（約10分）

#### 3.1 基準データソース警告の追加
- `components/DataSourceManager.tsx`
- 過去比較モード + ブランドイメージ分析の場合に警告表示

#### 3.2 X軸ラベルの縦方向表示
- `components/ChartArea.tsx`
- `angle={-90}`の設定追加（既存のMode 7と同様）

### Phase 4: テスト（約10分）

#### 4.1 動作確認
- 開発サーバーで動作確認
- リンターエラーチェック
- TypeScriptコンパイルエラーチェック

#### 4.2 実データでのテスト
- 3ファイル読み込み
- TOP30選定の確認
- グラフ・テーブルの表示確認

---

## 📈 実装時間見積もり

| フェーズ | 予定時間 | 備考 |
|---------|---------|------|
| Phase 1: 設定追加 | 5分 | Mode 2と同様 |
| Phase 2: データ変換ロジック | 15分 | 新規関数作成のため |
| Phase 3: UI調整 | 10分 | 警告表示とX軸調整 |
| Phase 4: テスト | 10分 | 動作確認 |
| **合計** | **40分** | Mode 2（5分）より時間がかかる |

**理由**: ブランドイメージ項目の動的選定ロジックが新規実装のため

---

## ⚠️ 注意事項

### 1. Mode 1・2との違い

| 項目 | Mode 1・2 | Mode 3 |
|------|----------|--------|
| **X軸項目** | 固定（FT, FW, FZ...やT1, T2...） | 動的（TOP30自動選定） |
| **データ変換関数** | `transformDataForHistoricalChart` | `transformDataForHistoricalBrandImage` |
| **項目数** | 5-6項目 | 30項目 |
| **X軸ラベル** | 横方向 | 縦方向（90度回転） |

### 2. ブランドイメージデータの必須性

- **`brandImageData`が必須**: 各データソースに`brandImageData`が存在する必要がある
- **エラーハンドリング**: `brandImageData`が存在しない場合は、エラーメッセージを表示

### 3. 基準データソースの明示

- **UI警告**: 基準データソースを明示する警告バッジを必ず表示
- **ユーザー教育**: データソースの順序が重要であることをユーザーに伝える

### 4. パフォーマンス

- **項目数が多い**: 30項目 × 複数データソース × 複数セグメント・ブランド
- **メモ化**: `useMemo`で計算結果をキャッシュ
- **再計算の最小化**: 依存配列を適切に設定

---

## 🔄 Mode 7（詳細分析）との互換性

### 共通機能

- ✅ ブランドイメージ項目の扱い
- ✅ TOP30選定ロジック（基準が異なるだけ）
- ✅ X軸ラベルの縦方向表示
- ✅ レーダーチャート対応

### 差異

| 項目 | Mode 7（詳細分析） | Mode 3（過去比較） |
|------|-------------------|-------------------|
| **基準** | 先頭ブランド | 先頭データソース |
| **データ系列** | 複数ブランド | 複数データソース |
| **セグメント選択** | SA | SA |
| **ブランド選択** | MA | SA |

### コード再利用

- **TOP30選定ロジック**: 基本的な選定ロジックは共通化可能
- **X軸ラベル設定**: Recharts設定は共通

---

## 📚 関連ドキュメント

1. `docs/HISTORICAL_COMPARISON_REQUIREMENTS.md` - 過去比較モード全体の要件定義
2. `docs/HISTORICAL_MODE1_IMPLEMENTATION_REPORT.md` - Mode 1の実装報告
3. `docs/HISTORICAL_MODE2_IMPLEMENTATION_REPORT.md` - Mode 2の実装報告
4. `docs/mode7_brand_image_segment_brands_requirements.md` - Mode 7（詳細分析）の要件定義
5. `docs/HISTORICAL_MODE3_REQUIREMENTS.md` - 本ドキュメント

---

## ✅ 完了条件

### 必須条件

- [ ] `historical_brand_image_segment_brand`の設定が追加されている
- [ ] `transformDataForHistoricalBrandImage`関数が実装されている
- [ ] Mode 3が過去比較モードで選択可能
- [ ] X軸にTOP30項目が表示される（縦方向）
- [ ] グラフの凡例にデータソース名が表示される
- [ ] データテーブルが正しく表示される
- [ ] 基準データソースの警告が表示される
- [ ] グラフタイプ切り替えが動作する（棒↔レーダー）
- [ ] リンターエラーなし
- [ ] TypeScriptコンパイルエラーなし

### オプション条件（Phase 4で対応予定）

- ⏸️ CSV エクスポートが動作する
- ⏸️ 画像エクスポートが動作する

---

## 🎓 Mode 1・2からの学び

### 適用可能なパターン

1. ✅ **設定駆動型アプローチ**: 設定追加のみで基本機能が動作
2. ✅ **グローバルモード分岐**: `globalMode === 'historical'`の分岐
3. ✅ **データソース管理**: `useMultiDataSource`フックの再利用
4. ✅ **UI制約**: セグメント・ブランドのSA制約
5. ✅ **凡例表示**: データソース名の表示

### 追加対応が必要な点

1. ❗ **動的項目選定**: 固定項目ではなく、TOP30を動的に選定
2. ❗ **新規データ変換関数**: `transformDataForHistoricalBrandImage`
3. ❗ **基準データソース警告**: 新規UI要素
4. ❗ **X軸ラベル縦方向**: 既存のMode 7と同様の設定

---

## 🎉 まとめ

過去比較モード Mode 3は、ブランドイメージ分析を時系列で比較する機能です。

### 主な特徴

1. ✅ **動的なTOP30選定**: 基準データソースから自動的に上位30項目を抽出
2. ✅ **時系列比較**: 複数時点でのブランドイメージの変化を可視化
3. ✅ **Mode 1・2の資産活用**: 設定駆動型アプローチの継承
4. ✅ **Mode 7との互換性**: ブランドイメージ項目の扱いは共通

### 実装の効率化

- **Mode 1・2の成功パターンを最大限活用**
- **設定追加で基本機能が動作**
- **新規実装は動的項目選定ロジックのみ**

### 予想実装時間

- **約40分**（Mode 2の5分より長いが、Mode 1の基盤があるため短縮）

このMode 3の実装により、過去比較モードにおけるブランドイメージ分析が可能になります。

---

**Document Version**: 1.0  
**Created**: 2025-11-30  
**Status**: ✅ 要件定義完了  
**Next Step**: 実装開始


