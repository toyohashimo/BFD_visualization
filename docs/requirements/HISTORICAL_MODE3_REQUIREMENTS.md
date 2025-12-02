# 過去比較モード - Mode 2 要件定義書

> **モード名**: ファネル分析②（セグメント、ブランド: X=ファネル②×過去比較）  
> **モードID**: `historical_funnel2_segment_brand`  
> **作成日**: 2025-11-30  
> **ステータス**: ✅ 要件確定

---

## 📋 概要

過去比較モードの2番目の実装として、Mode 2（ファネル分析②）を実装する。

**Mode 1の実装資産を最大限活用**し、設定追加のみで実装できる設計を採用する。

---

## 🎯 目的

- **ファネル②（タイムライン項目）**における時系列変化の可視化
- 複数期間のデータを並列比較することで、各ファネル段階のトレンドを把握
- Mode 1で構築した基盤を活用し、効率的に実装

---

## 📊 モード仕様

### 基本情報

| 項目 | 内容 |
|------|------|
| **グローバルモード** | 過去比較モード |
| **モード番号** | 2 |
| **モードID** | `historical_funnel2_segment_brand` |
| **モード名** | ファネル分析②（セグメント、ブランド: X=ファネル②×過去比較） |
| **分析項目** | ファネル② |
| **X軸** | ファネル②の各項目（T1, T2, T3, T4, T5） |
| **データ系列** | データソース（複数時点、最大3） |

### 詳細分析モード - Mode 2との比較

| 項目 | 詳細分析 Mode 2 | 過去比較 Mode 2（新規） |
|------|----------------|---------------------|
| **モード名** | ファネル分析②（セグメント: X=ファネル②×ブランド） | ファネル分析②（セグメント、ブランド: X=ファネル②×過去比較） |
| **分析項目** | セグメント (SA) | セグメント (SA) × ブランド (SA) |
| **X軸** | T1, T2, T3, T4, T5 | T1, T2, T3, T4, T5 |
| **データ系列** | ブランド（複数選択可能） | データソース（複数、最大3） |
| **セグメント選択** | SA | SA（単一選択） |
| **ブランド選択** | MA | SA（単一選択） |
| **凡例表示** | ブランド名 | データソース名 |

### 設定例

```yaml
設定:
  グローバルモード: 過去比較
  分析モード: Mode 2
  セグメント: 全体（SA）
  ブランド: ブランドA（SA）
  データソース:
    - 2025年6月 ✓
    - 2024年6月 ✓
    - 2023年6月 ✓

グラフ出力:
  X軸: T1, T2, T3, T4, T5
  凡例: 2025年6月, 2024年6月, 2023年6月
```

---

## 🏗️ 技術仕様

### 1. データ構造

#### ファネル②の項目定義

Mode 2では**タイムライン項目**を使用:

```typescript
// constants/analysisItems.ts
export const TIMELINE_ITEMS = [
  'T1',  // 6ヶ月以内に購入
  'T2',  // 3ヶ月以内に購入
  'T3',  // 直近1ヶ月以内に購入
  'T4',  // 今後3ヶ月以内に購入検討
  'T5'   // 今後6ヶ月以内に購入検討
];
```

#### ラベル取得

```typescript
// utils/labelGetters.ts
const itemLabels = {
  'T1': '6ヶ月以内に購入',
  'T2': '3ヶ月以内に購入',
  'T3': '直近1ヶ月以内に購入',
  'T4': '今後3ヶ月以内に購入検討',
  'T5': '今後6ヶ月以内に購入検討'
};
```

### 2. 分析モード設定

#### 設定追加 (`constants/analysisConfigs.ts`)

```typescript
export const HISTORICAL_ANALYSIS_MODE_CONFIGS: Record<string, AnalysisModeConfig> = {
  // ✅ Mode 1（既存）
  'historical_funnel1_segment_brand': {
    id: 'historical_funnel1_segment_brand',
    name: 'ファネル分析①（セグメント、ブランド: X=ファネル①×過去比較）',
    axes: {
      items: {
        role: 'X_AXIS',
        itemSet: 'funnel',
        fixedItems: ['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL']
      },
      segments: { role: 'FILTER', allowMultiple: false },
      brands: { role: 'FILTER', allowMultiple: false }
    },
    dataTransform: {
      xAxis: 'items',
      series: 'dataSources',
      filter: 'segments'
    },
    defaultChartType: 'bar'
  },
  
  // 🆕 Mode 2（新規追加）
  'historical_funnel2_segment_brand': {
    id: 'historical_funnel2_segment_brand',
    name: 'ファネル分析②（セグメント、ブランド: X=ファネル②×過去比較）',
    axes: {
      items: {
        role: 'X_AXIS',
        itemSet: 'timeline',  // ← ファネル②
        fixedItems: ['T1', 'T2', 'T3', 'T4', 'T5']  // ← タイムライン項目
      },
      segments: { role: 'FILTER', allowMultiple: false },
      brands: { role: 'FILTER', allowMultiple: false }
    },
    dataTransform: {
      xAxis: 'items',
      series: 'dataSources',  // ← データソースが系列
      filter: 'segments'
    },
    defaultChartType: 'bar'  // 棒グラフがデフォルト
  }
};
```

#### モード表示順序の更新

```typescript
export const HISTORICAL_ANALYSIS_MODE_ORDER = [
  'historical_funnel1_segment_brand',
  'historical_funnel2_segment_brand',  // ← 追加
];
```

### 3. 型定義の追加

#### `src/types/analysis.ts` の更新

```typescript
export type AnalysisMode =
  | ''
  // 詳細分析モード
  | 'segment_x_multi_brand'
  | 'segment_brand_x_funnel2'
  | 'segment_x_multi_brand_funnel2'
  // ... 他の詳細分析モード ...
  
  // 過去比較モード
  | 'historical_funnel1_segment_brand'
  | 'historical_funnel2_segment_brand';  // ← 追加
```

### 4. データ変換ロジック

**重要**: Mode 1で実装した`transformDataForHistoricalChart`関数は**既に汎用的**に実装されているため、**追加の変更は不要**。

```typescript
// utils/dataTransforms.ts
// 既存の関数をそのまま使用可能

export const transformDataForHistoricalChart = (
  dataSources: DataSource[],
  config: AnalysisModeConfig,
  selectedSegment: string,
  selectedBrand: string,
  selectedItem: string,
  labelGetters: Record<AxisType, (key: string) => string>
): ChartDataPoint[] | null => {
  // ...
  
  // itemSet が 'timeline' でも自動的に対応
  const xAxisConfig = config.axes.items;
  if (xAxisConfig.role === 'X_AXIS' && xAxisConfig.fixedItems) {
    xAxisKeys = xAxisConfig.fixedItems;  // ['T1', 'T2', 'T3', 'T4', 'T5']
  }
  
  // 各データソースからタイムラインメトリクスを抽出
  const series = activeSources.map(source => {
    const segmentData = source.data[selectedSegment];
    const brandData = segmentData?.[selectedBrand];
    
    const dataPoints = xAxisKeys.map(key => {
      const value = brandData?.[key as keyof typeof brandData];
      return typeof value === 'number' ? value : 0;
    });
    
    return {
      name: source.name,
      data: dataPoints
    };
  });
  
  // ...
};
```

---

## 📊 UI/UX設計

### サイドバー表示

```
┌─────────────────────────────────┐
│ [詳細分析] [過去比較] ★        │
├─────────────────────────────────┤
│ 📁 データソース管理            │
│   ○ 2025年6月  [編集] [削除]   │
│   ○ 2024年6月  [編集] [削除]   │
│   ○ 2023年6月  [編集] [削除]   │
│   [+ ファイル追加] (3/3)        │
├─────────────────────────────────┤
│ 📊 分析モード                   │
│   ▼ Mode 2: ファネル分析②      │ ← 選択
│      (セグメント、ブランド)      │
├─────────────────────────────────┤
│ 📂 セグメント (SA)              │
│   ▼ 全体                        │
├─────────────────────────────────┤
│ 🏷️ ブランド (SA)                │
│   ▼ ブランドA                   │
└─────────────────────────────────┘
```

### グラフ表示例

**棒グラフ（デフォルト）**

```
100% ┤
 80% ┤ ███ ▓▓▓ ░░░
 60% ┤ ███ ▓▓▓ ░░░
 40% ┤ ███ ▓▓▓ ░░░
 20% ┤ ███ ▓▓▓ ░░░
  0% ┼─────────────────
     T1  T2  T3  T4  T5

凡例: ███ 2025年6月  ▓▓▓ 2024年6月  ░░░ 2023年6月
```

**折れ線グラフ（切り替え可能）**

```
100% ┤     ●────●
 80% ┤   ●          ●
 60% ┤ ●              ●
 40% ┤
 20% ┤
  0% ┼─────────────────
     T1  T2  T3  T4  T5

凡例: ─── 2025年6月  --- 2024年6月  ··· 2023年6月
```

### データテーブル表示例

```
┌────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│データソース│ T1       │ T2       │ T3       │ T4       │ T5       │
│            │6ヶ月以内 │3ヶ月以内 │1ヶ月以内 │今後3ヶ月 │今後6ヶ月 │
├────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 2025年6月  │  45.2%   │  32.1%   │  15.3%   │  28.9%   │  41.7%   │
│ 2024年6月  │  43.8%   │  30.5%   │  14.2%   │  26.3%   │  39.5%   │
│ 2023年6月  │  41.5%   │  28.9%   │  13.1%   │  24.7%   │  37.2%   │
└────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 🔧 実装手順

### Phase 1: 設定追加（5分）

1. `constants/analysisConfigs.ts`に`historical_funnel2_segment_brand`を追加
2. `HISTORICAL_ANALYSIS_MODE_ORDER`に追加
3. `src/types/analysis.ts`の`AnalysisMode`型に追加

### Phase 2: 動作確認（10分）

1. 過去比較モードで Mode 2 を選択
2. セグメントとブランドを選択
3. グラフが正しく表示されることを確認
4. データテーブルが正しく表示されることを確認
5. データソースのON/OFF切り替えが動作することを確認

### Phase 3: テスト（10分）

1. 異なるセグメント・ブランドで動作確認
2. グラフタイプ切り替え（棒→折れ線）
3. データソース追加・削除
4. エラーハンドリング確認

---

## 🧪 テストケース

### 機能テスト

| ID | テストケース | 期待結果 |
|----|-------------|---------|
| HM2-01 | Mode 2を選択 | X軸にT1-T5が表示される |
| HM2-02 | グラフ描画 | 各データソースごとに棒グラフが表示される |
| HM2-03 | データテーブル表示 | 行＝データソース、列＝T1-T5 |
| HM2-04 | データソースOFF | 該当系列がグラフ・テーブルから消える |
| HM2-05 | 折れ線グラフ切り替え | 正しく表示される |

### エッジケース

| ID | テストケース | 期待結果 |
|----|-------------|---------|
| HM2-E01 | T1-T5のデータが存在しないブランド | 値が0または空で表示 |
| HM2-E02 | データソースが1つのみ | 正常に表示される |
| HM2-E03 | セグメント切り替え | グラフが更新される |

### データ整合性

| ID | テストケース | 期待結果 |
|----|-------------|---------|
| HM2-D01 | 3つのデータソースで同じブランド・セグメント | 各期間の値が正しく表示される |
| HM2-D02 | ブランドがデータソースに存在しない | エラーメッセージまたは0表示 |
| HM2-D03 | 数値フォーマット | パーセント表示が正しい |

---

## 📐 データ構造の例

### 入力データ（Excel）

```
セグメント: 全体
ブランド: ブランドA

[2025年6月のデータ]
T1: 45.2
T2: 32.1
T3: 15.3
T4: 28.9
T5: 41.7

[2024年6月のデータ]
T1: 43.8
T2: 30.5
T3: 14.2
T4: 26.3
T5: 39.5
```

### 変換後のチャートデータ

```typescript
const chartData: ChartDataPoint[] = [
  {
    name: 'T1',
    label: '6ヶ月以内に購入',
    '2025年6月': 45.2,
    '2024年6月': 43.8,
    '2023年6月': 41.5
  },
  {
    name: 'T2',
    label: '3ヶ月以内に購入',
    '2025年6月': 32.1,
    '2024年6月': 30.5,
    '2023年6月': 28.9
  },
  {
    name: 'T3',
    label: '直近1ヶ月以内に購入',
    '2025年6月': 15.3,
    '2024年6月': 14.2,
    '2023年6月': 13.1
  },
  {
    name: 'T4',
    label: '今後3ヶ月以内に購入検討',
    '2025年6月': 28.9,
    '2024年6月': 26.3,
    '2023年6月': 24.7
  },
  {
    name: 'T5',
    label: '今後6ヶ月以内に購入検討',
    '2025年6月': 41.7,
    '2024年6月': 39.5,
    '2023年6月': 37.2
  }
];
```

---

## 🎯 Mode 1との差分

### 変更点

| 項目 | Mode 1 | Mode 2 |
|------|--------|--------|
| **モードID** | `historical_funnel1_segment_brand` | `historical_funnel2_segment_brand` |
| **モード名** | ファネル分析① | ファネル分析② |
| **itemSet** | `'funnel'` | `'timeline'` |
| **X軸項目** | FT, FW, FZ, GC, GJ, GL | T1, T2, T3, T4, T5 |
| **項目ラベル** | 認知あり、興味あり... | 6ヶ月以内に購入... |

### 共通点（再利用可能）

- ✅ グローバルモード管理フック
- ✅ マルチデータソース管理フック
- ✅ データ変換関数（`transformDataForHistoricalChart`）
- ✅ UIコンポーネント（`GlobalModeTab`, `DataSourceManager`）
- ✅ グラフコンポーネント（`BarChart`, `LineChart`）
- ✅ データテーブルコンポーネント

---

## 📊 CSV エクスポート形式（Phase 4）

```csv
セグメント,ブランド,データソース,T1,T2,T3,T4,T5
全体,ブランドA,2025年6月,45.2,32.1,15.3,28.9,41.7
全体,ブランドA,2024年6月,43.8,30.5,14.2,26.3,39.5
全体,ブランドA,2023年6月,41.5,28.9,13.1,24.7,37.2
```

---

## ⚠️ 注意事項

### データの整合性

- **セグメント・ブランドの存在確認**: 各データソースに同じセグメント・ブランドが存在することを前提とする
- **欠損値の扱い**: 値が存在しない場合は`0`または空文字として表示

### パフォーマンス

- Mode 1と同様、最大3データソースまで
- メモ化によりグラフの再描画を最小限に

### ユーザビリティ

- Mode 1からMode 2への切り替えは**瞬時**に行われる
- セグメント・ブランドの選択状態は維持される

---

## 🚀 実装スケジュール

| フェーズ | タスク | 所要時間 | 担当 |
|---------|--------|---------|------|
| **Phase 1** | 設定追加 | 5分 | AI |
| **Phase 2** | 動作確認 | 10分 | AI |
| **Phase 3** | テスト | 10分 | AI |
| **Phase 4** | ドキュメント更新 | 5分 | AI |
| **合計** | - | **30分** | - |

---

## 📚 関連ドキュメント

1. `docs/HISTORICAL_COMPARISON_REQUIREMENTS.md` - 過去比較モード全体の要件定義
2. `docs/HISTORICAL_MODE1_IMPLEMENTATION.md` - Mode 1の技術仕様
3. `docs/HISTORICAL_MODE1_IMPLEMENTATION_REPORT.md` - Mode 1の実装報告
4. `docs/HISTORICAL_MODE2_REQUIREMENTS.md` - 本ドキュメント
5. `README.md` - プロジェクト全体のドキュメント

---

## ✅ 完了条件

### 必須条件

- [ ] `historical_funnel2_segment_brand`の設定が追加されている
- [ ] Mode 2が過去比較モードで選択可能
- [ ] X軸にT1-T5が表示される
- [ ] グラフの凡例にデータソース名が表示される
- [ ] データテーブルが正しく表示される
- [ ] グラフタイプ切り替えが動作する

### オプション条件（Phase 4）

- [ ] CSV エクスポートが動作する
- [ ] 画像エクスポートが動作する
- [ ] エラーハンドリングが完備されている

---

## 🎓 Mode 1から得られた知見の活用

### 設計原則

1. **設定駆動型**: モード設定をJSONライクなオブジェクトで管理
2. **汎用化**: データ変換ロジックは`itemSet`に依存しない汎用的な実装
3. **再利用性**: UIコンポーネントはモードに依存しない

### 実装パターン

```typescript
// 既存の実装をそのまま使用
const chartData = transformDataForHistoricalChart(
  dataSources,
  config,  // ← 'timeline'を含む設定を渡すだけ
  selectedSegment,
  selectedBrand,
  selectedItem,
  labelGetters
);
```

### テスト観点

- Mode 1で発見した問題（無限ループ、localStorage容量等）は既に解決済み
- Mode 2は設定追加のみのため、新しいバグは発生しにくい

---

## 📈 今後の展開

### Mode 3-14への展開

Mode 2の実装パターンを、他のすべてのモードに適用可能:

```typescript
// Mode 3: ブランドパワー分析
'historical_brand_power_segment_brand': {
  axes: {
    items: { itemSet: 'brandPower', fixedItems: ['BP1', 'BP2', 'BP3', 'BP4'] }
  },
  defaultChartType: 'radar'
}

// Mode 4: アーキタイプ分析
'historical_archetype_segment_brand': {
  axes: {
    items: { itemSet: 'archetype', fixedItems: ['AT1', 'AT2', 'AT3', ...] }
  },
  defaultChartType: 'radar'
}
```

---

## 💡 まとめ

過去比較モード - Mode 2は、**Mode 1の実装資産を100%活用**し、**設定追加のみ**で実装可能な設計となっています。

**実装の容易さ**:
- 新規コード: 0行
- 設定追加: 約30行
- 実装時間: 約30分

**再利用性**:
- データ変換ロジック: 100%再利用
- UIコンポーネント: 100%再利用
- フック: 100%再利用

**拡張性**:
- Mode 3-14への展開: 同じパターンで実装可能
- 新しいグラフタイプへの対応: 設定変更のみ

---

**文書バージョン**: 1.0  
**作成日**: 2025-11-30  
**最終更新日**: 2025-11-30  
**ステータス**: ✅ レビュー完了  
**承認者**: -

---

## 📞 質問・フィードバック

実装中に問題が発生した場合は、以下を確認してください:

1. `HISTORICAL_MODE1_IMPLEMENTATION_REPORT.md`のトラブルシューティングセクション
2. コンソールエラーの内容
3. データソースの状態（アクティブかどうか）
4. セグメント・ブランドの選択状態

**次のステップ**: Mode 2の実装完了後、`HISTORICAL_MODE2_IMPLEMENTATION_REPORT.md`を作成し、実装の詳細と得られた知見を記録する。

---

