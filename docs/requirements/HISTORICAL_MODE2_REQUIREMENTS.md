# 過去比較モード Mode 2 要件定義書

## 📋 基本情報

**モード番号**: 2  
**モード名**: ファネル分析①（セグメント、ファネル①: X=ブランド×過去比較）  
**モードID**: `historical_funnel1_brands_comparison`  
**作成日**: 2025-12-01  
**ステータス**: 要件定義中  
**優先度**: 高  
**実装パターン**: パターン3（ブランド軸 - 新規パターン）

---

## 🎯 概要

### 目的
単一セグメント・固定ファネル項目における、複数ブランドの過去データとの比較を行う分析モード。

### 特徴
- **X軸**: ブランド（複数選択可能）
- **分析項目**: ファネル①（固定: FT, FW, FZ, GC, GJ, GL）
- **フィルタ**: セグメント（単一選択）
- **データ系列**: 過去データソース（時間軸）

### 既存モードとの違い

| 項目 | Mode 1 | Mode 3 | **Mode 2（新規）** |
|------|--------|--------|-------------------|
| X軸 | ファネル項目 | タイムライン項目 | **ブランド** |
| フィルタ | セグメント+ブランド | セグメント+ブランド | **セグメント** |
| 分析項目選択 | 固定（全表示） | 固定（全表示） | **単一選択（FT〜GL）** |
| データ系列 | データソース | データソース | データソース |

---

## 🏗️ 技術仕様

### 分析モード設定

```typescript
// constants/analysisConfigs.ts
export const HISTORICAL_ANALYSIS_MODE_CONFIGS = {
  // ... 既存のMode 1-6 ...
  
  'historical_funnel1_brands_comparison': {
    id: 'historical_funnel1_brands_comparison',
    name: 'ファネル分析①（セグメント、ファネル①: X=ブランド×過去比較）',
    description: '単一セグメント・単一ファネル項目における複数ブランドの過去データとの比較',
    axes: {
      items: {
        role: 'FILTER',              // ← 重要: FILTERに変更
        label: 'ファネル項目',
        allowMultiple: false,         // 単一選択
        itemSet: 'funnel',
        fixedItems: ['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL'],
        defaultValue: 'FT'           // デフォルトは認知
      },
      segments: {
        role: 'FILTER',
        label: 'セグメント',
        allowMultiple: false          // 単一選択
      },
      brands: {
        role: 'X_AXIS',              // ← 重要: X_AXISに変更
        label: 'ブランド',
        allowMultiple: true,          // ← 重要: 複数選択可能
        min: 2,
        max: 10                       // 最大10ブランド
      }
    },
    dataTransform: {
      xAxis: 'brands',               // ← 重要: brandsがX軸
      series: 'dataSources',         // データソースが系列
      filter: ['segments', 'items']  // セグメントと項目でフィルタ
    },
    defaultChartType: 'bar',
    supportedChartTypes: ['bar', 'line'],
    chartOptions: {
      showLegend: true,
      legendPosition: 'top',
      yAxisLabel: '割合（%）',
      stackedBar: false
    }
  }
};
```

### モード選択順序の更新

```typescript
export const HISTORICAL_ANALYSIS_MODE_ORDER = [
  'historical_funnel1_segment_brand',        // Mode 1
  'historical_funnel1_brands_comparison',    // Mode 2
  'historical_funnel2_segment_brand',        // Mode 3
  'historical_funnel2_brands_comparison',    // Mode 4
  'historical_brand_image_segment_brand',    // Mode 5
  'historical_brand_image_brands_comparison', // Mode 6
  'historical_brand_power_segment_brand',    // Mode 7
  'historical_future_power_segment_brand',   // Mode 8
  'historical_archetype_segment_brand'       // Mode 9
  // ... Mode 6-14は今後実装
];
```

### 型定義の追加

```typescript
// src/types/analysis.ts
export type AnalysisMode =
  | ''
  // 詳細分析モード
  | 'segment_x_multi_brand'
  // ... その他の詳細分析モード ...
  // 過去比較モード
  | 'historical_funnel1_segment_brand'
  | 'historical_funnel2_segment_brand'
  | 'historical_brand_image_segment_brand'
  | 'historical_brand_power_segment_brand'
  | 'historical_future_power_segment_brand'
  | 'historical_funnel1_brands_comparison';  // ← 追加
```

---

## 🔄 データ変換ロジック

### 新規データ変換関数

```typescript
// utils/dataTransforms.ts

/**
 * 過去比較モード - ファネル分析①（ブランド軸）用のデータ変換
 * X軸がブランド、系列がデータソース、フィルタがセグメント＋ファネル項目
 * 
 * @param dataSources - アクティブなデータソース配列
 * @param config - 分析モード設定
 * @param selectedSegment - 選択されたセグメント（単一）
 * @param selectedBrands - 選択されたブランド（複数）
 * @param selectedItem - 選択されたファネル項目（単一: FT, FW, etc.）
 * @param labelGetters - ラベル取得関数
 * @returns チャートデータポイント配列
 */
export const transformDataForHistoricalBrandsComparison = (
  dataSources: DataSource[],
  config: AnalysisModeConfig,
  selectedSegment: string,
  selectedBrands: string[],
  selectedItem: string,
  labelGetters: Record<AxisType, (key: string) => string>
): ChartDataPoint[] | null => {
  
  // 1. アクティブなデータソースをフィルタ
  const activeSources = dataSources.filter(ds => ds.isActive);
  if (activeSources.length === 0) {
    console.warn('[Historical Mode 2] アクティブなデータソースがありません');
    return null;
  }

  // 2. 必須パラメータのチェック
  if (!selectedSegment) {
    console.warn('[Historical Mode 2] セグメントが選択されていません');
    return null;
  }
  
  if (!selectedItem) {
    console.warn('[Historical Mode 2] ファネル項目が選択されていません');
    return null;
  }
  
  if (!selectedBrands || selectedBrands.length === 0) {
    console.warn('[Historical Mode 2] ブランドが選択されていません');
    return null;
  }

  // 3. 各ブランドごとにデータポイントを生成
  const chartData: ChartDataPoint[] = selectedBrands.map(brandName => {
    const dataPoint: ChartDataPoint = {
      name: labelGetters.brands(brandName) || brandName
    };

    // 4. 各データソースの値を取得
    activeSources.forEach(source => {
      const segmentData = source.data[selectedSegment];
      if (!segmentData) {
        dataPoint[source.name] = 0;
        return;
      }

      const brandData = segmentData.brands.find(b => b.name === brandName);
      if (!brandData) {
        dataPoint[source.name] = 0;
        return;
      }

      // ファネル項目の値を取得（FT, FW, FZ, GC, GJ, GL）
      const value = brandData[selectedItem as keyof typeof brandData];
      dataPoint[source.name] = typeof value === 'number' ? value : 0;
    });

    return dataPoint;
  });

  return chartData;
};
```

### App.tsxでの呼び出し

```typescript
// App.tsx の chartData 計算部分

const chartData = useMemo(() => {
  if (globalMode === 'historical') {
    const config = currentModeConfigs[analysisMode];
    if (!config) return null;

    // Mode 2: ブランド軸の過去比較
    if (analysisMode === 'historical_funnel1_brands_comparison') {
      return transformDataForHistoricalBrandsComparison(
        dataSources,
        config,
        selectedSegments[0] || '',
        selectedBrands,               // 複数ブランド
        selectedItems[0] || 'FT',     // 単一ファネル項目
        { items: getItemLabel, segments: getSegmentLabel, brands: getBrandLabel }
      );
    }

    // Mode 3: ブランドイメージ分析（動的項目）
    if (config.axes.items?.itemSet === 'brandImage' && config.axes.items?.autoSelect) {
      return transformDataForHistoricalBrandImage(
        dataSources,
        config,
        selectedSegments[0] || '',
        selectedBrands[0] || '',
        { items: getItemLabel, segments: getSegmentLabel, brands: getBrandLabel }
      );
    }

    // その他の固定項目モード（Mode 1, 2, 4, 5）
    return transformDataForHistoricalChart(
      dataSources,
      config,
      selectedSegments[0] || '',
      selectedBrands[0] || '',
      selectedItems[0] || '',
      { items: getItemLabel, segments: getSegmentLabel, brands: getBrandLabel }
    );
  }

  // 詳細分析モードの処理
  // ...
}, [globalMode, analysisMode, dataSources, selectedSegments, selectedBrands, selectedItems]);
```

---

## 🎨 UI/UX 仕様

### セグメント選択セクション
- **表示**: 常に表示
- **選択モード**: 単一選択（SA）
- **UI**: ドロップダウン
- **必須**: はい

### ファネル項目選択セクション（新規）
- **表示**: 常に表示
- **選択モード**: 単一選択（SA）
- **UI**: ドロップダウンまたはラジオボタン
- **項目**: FT, FW, FZ, GC, GJ, GL
- **デフォルト**: FT（認知あり）
- **必須**: はい

### ブランド選択セクション
- **表示**: 常に表示
- **選択モード**: 複数選択（MA）
- **UI**: チェックボックス
- **最小選択数**: 2
- **最大選択数**: 10
- **必須**: はい

### グラフ表示
```
X軸: ブランド名
  - ブランドA, ブランドB, ブランドC, ...
Y軸: 割合（%）
  - 0〜100の範囲
凡例: データソース名
  - 2025年6月, 2024年6月, 2023年6月, ...
```

### UIレイアウト例

```
┌─────────────────────────────────────────┐
│ 📊 過去比較モード                        │
├─────────────────────────────────────────┤
│ データソース管理                          │
│  ☑ 2025年6月 [編集] [削除]              │
│  ☑ 2024年6月 [編集] [削除]              │
│  ☑ 2023年6月 [編集] [削除]              │
│  [+ ファイル追加 (3/3)]                  │
├─────────────────────────────────────────┤
│ 分析モード: Mode 2                       │
│  ファネル分析①（ブランド×過去比較）       │
├─────────────────────────────────────────┤
│ セグメント選択 [SA]                      │
│  ▼ [全体]                               │
├─────────────────────────────────────────┤
│ ファネル項目選択 [SA] ← 新規            │
│  ▼ [FT: 認知あり(TOP2)]                 │
│     FT: 認知あり(TOP2)                   │
│     FW: 興味あり(TOP2)                   │
│     FZ: 好意的                          │
│     GC: 購入意向あり(TOP2)               │
│     GJ: 購入経験あり                     │
│     GL: リピート意向(TOP2)               │
├─────────────────────────────────────────┤
│ ブランド選択 [MA]                        │
│  ☑ ブランドA                            │
│  ☑ ブランドB                            │
│  ☑ ブランドC                            │
│  ☐ ブランドD                            │
│  ☐ ブランドE                            │
└─────────────────────────────────────────┘

グラフエリア:
┌─────────────────────────────────────────┐
│ ■ 2025年6月  ■ 2024年6月  ■ 2023年6月   │
├─────────────────────────────────────────┤
│ 100%│                                    │
│  80%│  ┃     ┃     ┃                    │
│  60%│  ┃  ┃  ┃  ┃  ┃                    │
│  40%│  ┃  ┃  ┃  ┃  ┃                    │
│  20%│  ┃  ┃  ┃  ┃  ┃                    │
│   0%└──────────────────────              │
│     ブランドA B  C                       │
└─────────────────────────────────────────┘
```

---

## 📊 データテーブル仕様

### 行列構造
- **行**: データソース名（時間軸）
- **列**: ブランド名

### テーブル例

| データソース | ブランドA | ブランドB | ブランドC |
|-------------|-----------|-----------|-----------|
| 2025年6月   | 65.2%     | 58.3%     | 42.1%     |
| 2024年6月   | 62.8%     | 55.7%     | 40.5%     |
| 2023年6月   | 60.5%     | 53.2%     | 38.9%     |

---

## 🔄 実装手順

### Phase 1: 型定義とモード設定（15分）

1. **型定義の追加**（3分）
   - `src/types/analysis.ts`に`historical_funnel1_brands_comparison`を追加

2. **モード設定の追加**（10分）
   - `constants/analysisConfigs.ts`に設定を追加
   - 新しいパターン（ブランドがX軸）の設定を定義

3. **モード順序の更新**（2分）
   - `HISTORICAL_ANALYSIS_MODE_ORDER`に追加

### Phase 2: データ変換ロジック（30分）

1. **データ変換関数の実装**（25分）
   - `utils/dataTransforms.ts`に`transformDataForHistoricalBrandsComparison`を追加
   - ブランド軸の変換ロジックを実装
   - エラーハンドリング

2. **App.tsxの更新**（5分）
   - `chartData`計算部分に分岐を追加

### Phase 3: UI調整（20分）

1. **AnalysisItemsSectionの調整**（15分）
   - ファネル項目選択UIの表示制御
   - Mode 2の場合は単一選択ドロップダウンを表示

2. **BrandsSectionの調整**（5分）
   - Mode 2の場合は複数選択（MA）に切り替え

### Phase 4: 動作確認（15分）

1. **基本機能の確認**（10分）
   - グラフの表示
   - データテーブルの表示
   - 選択UIの動作

2. **エッジケースの確認**（5分）
   - ブランド未選択
   - データソース0件
   - データ欠損時の動作

### 予想実装時間: **合計80分**

---

## 🧪 テスト観点

### 機能テスト

| ID | テスト項目 | 期待結果 |
|----|----------|---------|
| FT-01 | Mode 2が選択できる | 選択肢に表示され、選択可能 |
| FT-02 | セグメントを単一選択 | ドロップダウンで選択可能 |
| FT-03 | ファネル項目を単一選択 | ドロップダウンで選択可能 |
| FT-04 | ブランドを複数選択 | チェックボックスで複数選択可能 |
| FT-05 | グラフが正しく表示される | X軸=ブランド、凡例=データソース |
| FT-06 | データテーブルが正しく表示される | 行=データソース、列=ブランド |
| FT-07 | グラフタイプ切り替え | 棒グラフ⇔折れ線グラフ |
| FT-08 | データソースON/OFF | グラフに反映される |

### エッジケーステスト

| ID | テスト項目 | 期待結果 |
|----|----------|---------|
| ET-01 | ブランド0個選択 | エラーメッセージまたは選択促進 |
| ET-02 | ブランド1個選択 | 警告メッセージ（最小2個） |
| ET-03 | ブランド11個以上選択 | 10個までに制限される |
| ET-04 | データソース0件 | 適切な警告メッセージ |
| ET-05 | データ欠損時 | 値0として表示 |
| ET-06 | セグメント未選択 | エラーメッセージ |
| ET-07 | ファネル項目未選択 | デフォルトFTが選択される |

### データ整合性テスト

| ID | テスト項目 | 期待結果 |
|----|----------|---------|
| DT-01 | 各データソースで同一ブランド・セグメント・項目の値が取得される | 正しい値が表示 |
| DT-02 | 複数データソース間で値が正しく比較される | 凡例と値が一致 |
| DT-03 | 選択したファネル項目の値のみが表示される | 他の項目は表示されない |

---

## 🎯 完了条件

### 必須条件（Must）

- [ ] `historical_funnel1_brands_comparison`の設定が追加されている
- [ ] Mode 2が過去比較モードで選択可能
- [ ] セグメント選択が単一選択（SA）で動作
- [ ] ファネル項目選択が単一選択（SA）で動作
- [ ] ブランド選択が複数選択（MA）で動作
- [ ] X軸にブランド名が表示される
- [ ] 凡例にデータソース名が表示される
- [ ] グラフが正しく表示される
- [ ] データテーブルが正しく表示される
- [ ] グラフタイプ切り替えが動作する
- [ ] リンターエラーなし
- [ ] TypeScriptコンパイルエラーなし

### 推奨条件（Should）

- [ ] ブランド選択数の制約（2-10個）が動作
- [ ] デフォルト選択（FT）が機能
- [ ] エラーメッセージが適切に表示される
- [ ] UI警告が表示される（ブランド未選択時など）

### オプション条件（Nice to have）

- [ ] CSVエクスポートが動作する（Phase 4で対応予定）
- [ ] 画像エクスポートが動作する（Phase 4で対応予定）
- [ ] アニメーション効果
- [ ] レスポンシブデザインの最適化

---

## 🔑 重要な設計判断

### 1. ブランド軸の複数選択

**判断**: ブランドをX軸とし、複数選択可能にする

**理由**:
- 複数ブランドの時系列比較を一目で把握できる
- 競合分析に最適
- 他のモード（Mode 1-6）ではブランドは単一選択のため、差別化できる

**影響**:
- UI: チェックボックス方式に変更
- データ変換: ブランドをループして処理

### 2. ファネル項目の単一選択

**判断**: ファネル項目を単一選択にする

**理由**:
- X軸がブランドのため、すべてのファネル項目を同時表示すると情報過多
- 項目ごとに深掘り分析できる
- グラフの可読性を確保

**影響**:
- UI: ドロップダウンまたはラジオボタン
- データ変換: 選択された1項目のみを処理

### 3. Mode番号の振り直し

**判断**: Mode 2として実装

**理由**:
- ファネル分析の流れ: Mode 1（項目軸）→ Mode 2（ブランド軸）が自然
- ユーザー体験の向上

### 4. データ系列はデータソース固定

**判断**: データ系列は必ずデータソース（時間軸）にする

**理由**:
- 過去比較モードの本質は時系列比較
- すべての過去比較モードで統一
- ユーザーの混乱を防ぐ

**影響**:
- `series: 'dataSources'`は固定
- 凡例は必ずデータソース名

---

## 🚧 技術的課題と解決策

### 課題1: 既存コンポーネントの制約

**課題**: BrandsSectionは過去比較モードでは単一選択を想定

**解決策**:
```typescript
// components/BrandsSection.tsx
const isHistoricalMode = globalMode === 'historical';
const config = currentModeConfigs[analysisMode];

// Mode 2の場合は複数選択を許可
const allowMultiple = isHistoricalMode && 
  analysisMode === 'historical_funnel1_brands_comparison' 
  ? true 
  : config.allowMultiple;

const badge = allowMultiple ? 'MA' : 'SA';
```

### 課題2: AnalysisItemsSectionの表示制御

**課題**: Mode 2では項目選択UIを表示する必要がある

**解決策**:
```typescript
// components/AnalysisItemsSection.tsx
const shouldShowItemSelection = useMemo(() => {
  if (globalMode !== 'historical') return true;
  
  // Mode 2の場合は項目選択を表示
  return analysisMode === 'historical_funnel1_brands_comparison';
}, [globalMode, analysisMode]);

if (!shouldShowItemSelection) return null;
```

### 課題3: データ変換のパフォーマンス

**課題**: 10ブランド × 3データソースの組み合わせで遅延の可能性

**解決策**:
- `useMemo`でメモ化
- データ変換関数を最適化
- 不要な再計算を防ぐ

---

## 📈 期待される効果

### ビジネス価値

1. **競合分析の強化**
   - 複数ブランドの時系列推移を一目で比較
   - 認知→購入の各ファネル段階でのポジション把握

2. **意思決定の迅速化**
   - ファネル項目ごとの深掘り分析が可能
   - データソースの切り替えで異なる時期を瞬時に比較

3. **戦略立案の精度向上**
   - どのブランドがどのファネル段階で強いか明確化
   - 時系列での変化を捉えて施策効果を測定

### 技術的価値

1. **新パターンの確立**
   - ブランド軸の過去比較パターンを確立
   - 今後のMode 8-14への応用可能

2. **アーキテクチャの拡張**
   - 設定駆動型アプローチの柔軟性を証明
   - UI/UXの動的切り替えのノウハウ獲得

---

## 📚 関連ドキュメント

### 必読ドキュメント
1. `HISTORICAL_MODE1_IMPLEMENTATION_REPORT.md` - Mode 1の基盤構築
2. `HISTORICAL_MODE2_IMPLEMENTATION_REPORT.md` - 設定駆動型の実証
3. `HISTORICAL_MODES_MASTER_GUIDE.md` - 実装パターンの完全ガイド

### 参考ドキュメント
4. `HISTORICAL_COMPARISON_REQUIREMENTS.md` - 過去比較モード全体の要件
5. `constants/analysisConfigs.ts` - 既存モード設定
6. `utils/dataTransforms.ts` - データ変換ロジック

---

## 🎯 成功の定義

### 短期目標（実装完了時）
- [ ] Mode 2が設定通りに動作する
- [ ] エラーなしで実装完了
- [ ] 開発サーバーで動作確認済み
- [ ] ドキュメントが完備

### 中期目標（1週間後）
- [ ] 実際のデータで動作確認
- [ ] ユーザーフィードバックの収集
- [ ] 必要に応じた改善

### 長期目標（1ヶ月後）
- [ ] Mode 2を基にMode 4/6への展開
- [ ] 過去比較モード全14モード完成

---

## ✅ レビューチェックリスト

### 要件定義レビュー
- [ ] 目的が明確に記述されている
- [ ] 技術仕様が具体的
- [ ] UI/UX仕様が詳細
- [ ] テスト観点が網羅的
- [ ] 完了条件が明確

### 技術レビュー
- [ ] 型定義が正確
- [ ] データ変換ロジックが正しい
- [ ] エラーハンドリングが適切
- [ ] パフォーマンスが考慮されている

### ドキュメントレビュー
- [ ] 読みやすい構成
- [ ] 図表が適切に使用されている
- [ ] コード例が正確
- [ ] 関連ドキュメントへのリンクが適切

---

## 📞 問い合わせ先

### 技術的な質問
- 既存の実装コード（Mode 1-5）を参照
- `HISTORICAL_MODES_MASTER_GUIDE.md`を確認

### 要件に関する質問
- 本ドキュメント内の「重要な設計判断」セクションを確認
- 不明点は実装前に明確化

---

**Document Version**: 1.0  
**Created**: 2025-12-01  
**Author**: AI Assistant  
**Status**: ✅ 要件定義完了  
**Next Step**: 実装開始

---

**このドキュメントを基に、約80分で実装を完了できます。**

