# 過去比較モード Mode 6 要件定義書

## 📋 基本情報

**モード番号**: 6  
**モード名**: ブランドイメージ分析（セグメント、ブランドイメージ: X=ブランド×過去比較）  
**モードID**: `historical_brand_image_brands_comparison`  
**作成日**: 2025-12-01  
**ステータス**: 要件定義中  
**優先度**: 高  
**実装パターン**: パターン3（ブランド軸 - Mode 2/4の応用、動的項目対応）  
**予想実装時間**: 30分

---

## 🎯 概要

### 目的
単一セグメント・単一ブランドイメージ項目における、複数ブランドの過去データとの比較を行う分析モード。

### 特徴
- **X軸**: ブランド（複数選択可能）
- **分析項目**: ブランドイメージ（動的項目、TOP30から単一選択）
- **フィルタ**: セグメント（単一選択）+ ブランドイメージ項目（単一選択）
- **データ系列**: 過去データソース（時間軸）

### 既存モードとの違い

| 項目 | Mode 5 | Mode 2 | Mode 4 | **Mode 6（本モード）** |
|------|-------------------|--------|--------|---------------------|
| X軸 | ブランドイメージ項目 | ブランド | ブランド | **ブランド** |
| フィルタ | セグメント+ブランド | セグメント+ファネル項目 | セグメント+タイムライン項目 | **セグメント+ブランドイメージ項目** |
| 分析項目 | ブランドイメージ（動的、TOP30自動表示） | ファネル①（固定: FT〜GL） | ファネル②（固定: T1〜T5） | **ブランドイメージ（動的、TOP30から単一選択）** |
| itemSet | 'brandImage' | 'funnel' | 'timeline' | **'brandImage'** |
| データ系列 | データソース | データソース | データソース | データソース |

### ビジネス価値

1. **ブランドイメージの時系列比較**: 特定のブランドイメージ項目における複数ブランドの過去データとの比較
2. **競合分析の強化**: 複数ブランドの同一イメージ項目での時系列推移を一目で比較
3. **セグメント別のブランドイメージ分析**: 特定セグメントに絞ったブランドイメージの時系列トレンド分析

---

## 🏗️ 技術仕様

### 1. 分析モード設定

```typescript
// constants/analysisConfigs.ts
'historical_brand_image_brands_comparison': {
    id: 'historical_brand_image_brands_comparison',
    name: 'ブランドイメージ分析（セグメント、ブランドイメージ: X=ブランド×過去比較）',
    description: '単一セグメント・単一ブランドイメージ項目における複数ブランドの過去データとの比較',
    axes: {
            items: {
                role: 'FILTER',              // ← フィルタとして機能
                label: 'ブランドイメージ項目', // ← ブランドイメージ項目のラベル
                allowMultiple: false,        // ← 単一選択
                itemSet: 'brandImage',      // ← Mode 5と同じitemSet
                fixedItems: []              // ← ブランドイメージ一覧から選択
            },
        segments: {
            role: 'FILTER',
            label: 'セグメント',
            allowMultiple: false        // 単一選択
        },
        brands: {
            role: 'X_AXIS',             // ← ブランドがX軸
            label: 'ブランド',
            allowMultiple: true         // ← 複数選択可能
        }
    },
    dataTransform: {
        xAxis: 'brands',                // ← ブランドがX軸
        series: 'dataSources',          // ← データソースが系列
        filter: ['segments', 'items']   // ← セグメントと項目でフィルタ
    },
    defaultChartType: 'bar'
}
```

**重要ポイント（Mode 2/4との差分）**:
1. ✅ **itemSet**: `'funnel'` / `'timeline'` → `'brandImage'`
2. ✅ **fixedItems**: 固定項目 → `[]`（動的項目）
3. ✅ **label**: `'ファネル項目'` / `'タイムライン項目'` → `'ブランドイメージ項目'`
4. ✅ その他の設定は**Mode 2/4とほぼ同じ**

---

### 2. 型定義

```typescript
// src/types/analysis.ts
export type AnalysisMode =
  | ''
  // ... 既存のモード ...
  | 'historical_funnel1_brands_comparison'  // Mode 2
  | 'historical_funnel2_brands_comparison'   // Mode 4
  | 'historical_brand_image_brands_comparison'; // ← Mode 6を追加
```

---

### 3. データ変換ロジック

**重要**: Mode 6は**新規データ変換関数が必要**です。

#### 理由
- Mode 2/4の`transformDataForHistoricalBrandsComparison`は固定項目（FT, FW, T1, T2...）を前提としている
- Mode 6は動的項目（ブランドイメージ項目）を扱うため、`brandImageData`へのアクセスが必要

#### 新規データ変換関数

```typescript
// utils/dataTransforms.ts

/**
 * 過去比較モード - ブランドイメージ分析（ブランド軸）用のデータ変換
 * X軸がブランド、系列がデータソース、フィルタがセグメント＋ブランドイメージ項目
 * 
 * @param dataSources - アクティブなデータソース配列
 * @param config - 分析モード設定
 * @param selectedSegment - 選択されたセグメント（単一）
 * @param selectedBrands - 選択されたブランド（複数）
 * @param selectedItem - 選択されたブランドイメージ項目（単一）
 * @param labelGetters - ラベル取得関数
 * @param brandImageData - ブランドイメージデータ（オプション）
 * @returns チャートデータポイント配列
 */
export const transformDataForHistoricalBrandImageBrandsComparison = (
    dataSources: Array<{
        id: string;
        name: string;
        data: SheetData;
        brandImageData?: BrandImageData;
        isActive: boolean;
    }>,
    config: AnalysisModeConfig,
    selectedSegment: string,
    selectedBrands: string[],
    selectedItem: string,
    labelGetters: Record<AxisType, (key: string) => string>,
    brandImageData?: BrandImageData
): ChartDataPoint[] | null => {
    
    // 1. アクティブなデータソースをフィルタ
    const activeSources = dataSources.filter(ds => ds.isActive);
    if (activeSources.length === 0) {
        console.warn('[Historical Mode 6] アクティブなデータソースがありません');
        return null;
    }

    // 2. 必須パラメータのチェック
    if (!selectedSegment) {
        console.warn('[Historical Mode 6] セグメントが選択されていません');
        return null;
    }
    
    if (!selectedItem) {
        console.warn('[Historical Mode 6] ブランドイメージ項目が選択されていません');
        return null;
    }
    
    if (!selectedBrands || selectedBrands.length === 0) {
        console.warn('[Historical Mode 6] ブランドが選択されていません');
        return null;
    }

    // 3. 各ブランドごとにデータポイントを生成
    const chartData: ChartDataPoint[] = selectedBrands.map(brandName => {
        const dataPoint: ChartDataPoint = {
            name: labelGetters.brands(brandName) || brandName
        };

        // 4. 各データソースの値を取得
        activeSources.forEach(source => {
            // ブランドイメージデータの取得
            const sourceBrandImageData = source.brandImageData || brandImageData;
            if (!sourceBrandImageData) {
                console.warn(`[Historical Mode 6] ブランドイメージデータがデータソース "${source.name}" に存在しません`);
                dataPoint[source.name] = 0;
                return;
            }

            const segmentData = sourceBrandImageData[selectedSegment];
            if (!segmentData) {
                console.warn(`[Historical Mode 6] セグメント "${selectedSegment}" がデータソース "${source.name}" に存在しません`);
                dataPoint[source.name] = 0;
                return;
            }

            const brandData = segmentData[brandName];
            if (!brandData) {
                console.warn(`[Historical Mode 6] ブランド "${brandName}" がセグメント "${selectedSegment}" に存在しません（データソース: ${source.name}）`);
                dataPoint[source.name] = 0;
                return;
            }

            // ブランドイメージ項目の値を取得
            const value = brandData[selectedItem] ?? 0;
            dataPoint[source.name] = value;
        });

        return dataPoint;
    });

    return chartData;
};
```

#### App.tsxでの呼び出し

```typescript
// App.tsx の chartData 計算部分

const chartData = useMemo(() => {
  if (globalMode === 'historical') {
    const config = currentModeConfigs[analysisMode];
    if (!config) return null;

    // Mode 6: ブランドイメージ分析（ブランド軸）
    if (analysisMode === 'historical_brand_image_brands_comparison') {
      return transformDataForHistoricalBrandImageBrandsComparison(
        dataSources,
        config,
        selectedSegments[0] || '',
        selectedBrands,               // 複数ブランド
        selectedItems[0] || '',         // 単一ブランドイメージ項目
        { items: getItemLabel, segments: getSegmentLabel, brands: getBrandLabel },
        brandImageData
      );
    }

    // Mode 7: ブランド軸の過去比較（ファネル①）
    if (analysisMode === 'historical_funnel1_brands_comparison') {
      return transformDataForHistoricalBrandsComparison(
        dataSources,
        config,
        selectedSegments[0] || '',
        selectedBrands,
        selectedItems[0] || 'FT',
        { items: getItemLabel, segments: getSegmentLabel, brands: getBrandLabel }
      );
    }

    // Mode 8: ブランド軸の過去比較（ファネル②）
    if (analysisMode === 'historical_funnel2_brands_comparison') {
      return transformDataForHistoricalBrandsComparison(
        dataSources,
        config,
        selectedSegments[0] || '',
        selectedBrands,
        selectedItems[0] || 'T1',
        { items: getItemLabel, segments: getSegmentLabel, brands: getBrandLabel }
      );
    }

    // Mode 5: ブランドイメージ分析（項目軸、動的項目）
    if (config.axes.items?.itemSet === 'brandImage' && config.axes.items?.autoSelect) {
      return transformDataForHistoricalBrandImage(
        dataSources,
        config,
        selectedSegments[0] || '',
        selectedBrands[0] || '',
        { items: getItemLabel, segments: getSegmentLabel, brands: getBrandLabel },
        brandImageData
      );
    }

    // その他の固定項目モード（Mode 1, 2, 4, 6）
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
}, [globalMode, analysisMode, dataSources, selectedSegments, selectedBrands, selectedItems, brandImageData]);
```

---

## 🎨 UI/UX 仕様

### セグメント選択セクション
- **表示**: 常に表示
- **選択モード**: 単一選択（SA）
- **UI**: ドロップダウン
- **必須**: はい

### ブランドイメージ項目選択セクション（新規）
- **表示**: 常に表示
- **選択モード**: 単一選択（SA）
- **UI**: ドロップダウン
- **項目**: 全ブランドイメージ項目（基準データソースから取得）
- **デフォルト**: 最初の項目（アルファベット順）
- **必須**: はい
- **注意**: 基準データソース（先頭のアクティブなデータソース）から全項目を取得し、その中から単一選択

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
│ 分析モード: Mode 6                       │
│  ブランドイメージ分析（ブランド×過去比較） │
├─────────────────────────────────────────┤
│ セグメント選択 [SA]                      │
│  ▼ [全体]                               │
├─────────────────────────────────────────┤
│ ブランドイメージ項目選択 [SA] ← 新規    │
│  ▼ [信頼できる]                         │
│     信頼できる                           │
│     高品質な                             │
│     おしゃれな                           │
│     ...（TOP30項目）                     │
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

### Phase 1: 型定義とモード設定（10分）

1. **型定義の追加**（2分）
   - `src/types/analysis.ts`に`historical_brand_image_brands_comparison`を追加

2. **モード設定の追加**（7分）
   - `constants/analysisConfigs.ts`に設定を追加
   - Mode 2/4をベースに、`itemSet: 'brandImage'`に変更
   - `autoSelect: true`, `autoSelectCount: 30`を設定

3. **モード順序の更新**（1分）
   - `HISTORICAL_ANALYSIS_MODE_ORDER`に追加

### Phase 2: データ変換ロジック（15分）

1. **データ変換関数の実装**（12分）
   - `utils/dataTransforms.ts`に`transformDataForHistoricalBrandImageBrandsComparison`を追加
   - Mode 2の`transformDataForHistoricalBrandsComparison`をベースに、ブランドイメージデータ対応を追加
   - エラーハンドリング

2. **App.tsxの更新**（3分）
   - `chartData`計算部分に分岐を追加

### Phase 3: UI調整（5分）

1. **AnalysisItemsSectionの調整**（3分）
   - ブランドイメージ項目選択UIの表示制御
   - Mode 6の場合は単一選択ドロップダウンを表示
   - TOP30項目の自動選定ロジック

2. **BrandsSectionの調整**（2分）
   - Mode 6の場合は複数選択（MA）に切り替え

### Phase 4: 動作確認（10分）

1. **基本機能の確認**（7分）
   - グラフの表示
   - データテーブルの表示
   - 選択UIの動作
   - TOP30項目の自動選定

2. **エッジケースの確認**（3分）
   - ブランド未選択
   - データソース0件
   - データ欠損時の動作
   - ブランドイメージ項目未選択

### 予想実装時間: **合計40分**

---

## 🧪 テスト観点

### 機能テスト

| ID | テスト項目 | 期待結果 |
|----|----------|---------|
| FT-01 | Mode 6が選択できる | 選択肢に表示され、選択可能 |
| FT-02 | セグメントを単一選択 | ドロップダウンで選択可能 |
| FT-03 | ブランドイメージ項目を単一選択 | ドロップダウンで選択可能（TOP30項目） |
| FT-04 | ブランドを複数選択 | チェックボックスで複数選択可能 |
| FT-05 | グラフが正しく表示される | X軸=ブランド、凡例=データソース |
| FT-06 | データテーブルが正しく表示される | 行=データソース、列=ブランド |
| FT-07 | グラフタイプ切り替え | 棒グラフ⇔折れ線グラフ |
| FT-08 | データソースON/OFF | グラフに反映される |
| FT-09 | TOP30項目の自動選定 | 基準データソースからTOP30項目が選定される |

### エッジケーステスト

| ID | テスト項目 | 期待結果 |
|----|----------|---------|
| ET-01 | ブランド0個選択 | エラーメッセージまたは選択促進 |
| ET-02 | ブランド1個選択 | 警告メッセージ（最小2個） |
| ET-03 | ブランド11個以上選択 | 10個までに制限される |
| ET-04 | データソース0件 | 適切な警告メッセージ |
| ET-05 | データ欠損時 | 値0として表示 |
| ET-06 | セグメント未選択 | エラーメッセージ |
| ET-07 | ブランドイメージ項目未選択 | デフォルトTOP1が選択される |
| ET-08 | ブランドイメージデータなし | 適切な警告メッセージ |

### データ整合性テスト

| ID | テスト項目 | 期待結果 |
|----|----------|---------|
| DT-01 | 各データソースで同一ブランド・セグメント・項目の値が取得される | 正しい値が表示 |
| DT-02 | 複数データソース間で値が正しく比較される | 凡例と値が一致 |
| DT-03 | 選択したブランドイメージ項目の値のみが表示される | 他の項目は表示されない |
| DT-04 | TOP30項目の選定が基準データソースから正しく行われる | 基準データソースのTOP30が表示される |

---

## 🎯 完了条件

### 必須条件（Must）

- [ ] `historical_brand_image_brands_comparison`の設定が追加されている
- [ ] Mode 6が過去比較モードで選択可能
- [ ] セグメント選択が単一選択（SA）で動作
- [ ] ブランドイメージ項目選択が単一選択（SA）で動作（TOP30項目）
- [ ] ブランド選択が複数選択（MA）で動作
- [ ] X軸にブランド名が表示される
- [ ] 凡例にデータソース名が表示される
- [ ] グラフが正しく表示される
- [ ] データテーブルが正しく表示される
- [ ] グラフタイプ切り替えが動作する
- [ ] TOP30項目の自動選定が動作する
- [ ] リンターエラーなし
- [ ] TypeScriptコンパイルエラーなし

### 推奨条件（Should）

- [ ] ブランド選択数の制約（2-10個）が動作
- [ ] デフォルト選択（TOP1項目）が機能
- [ ] エラーメッセージが適切に表示される
- [ ] UI警告が表示される（ブランド未選択時など）

### オプション条件（Nice to have）

- [ ] CSVエクスポートが動作する
- [ ] 画像エクスポートが動作する
- [ ] アニメーション効果
- [ ] レスポンシブデザインの最適化

---

## 🔑 重要な設計判断

### 1. ブランド軸の複数選択

**判断**: ブランドをX軸とし、複数選択可能にする

**理由**:
- 複数ブランドの時系列比較を一目で把握できる
- 競合分析に最適
- Mode 2/4と同じパターンで一貫性を保つ

**影響**:
- UI: チェックボックス方式に変更
- データ変換: ブランドをループして処理

### 2. ブランドイメージ項目の単一選択

**判断**: ブランドイメージ項目を単一選択にする

**理由**:
- X軸がブランドのため、すべてのブランドイメージ項目を同時表示すると情報過多
- 項目ごとに深掘り分析できる
- グラフの可読性を確保

**影響**:
- UI: ドロップダウンまたはラジオボタン
- データ変換: 選択された1項目のみを処理

### 3. 全項目からの選択

**判断**: 基準データソース（先頭のアクティブ）から全ブランドイメージ項目を取得し、その中から単一選択

**理由**:
- ユーザーが任意の項目を選択できる柔軟性を提供
- 過去比較モードでは特定の項目に注目した分析が多い
- TOP30に限定する必要がない

**影響**:
- UI: 全項目をドロップダウンに表示（アルファベット順）
- データ変換: 選択された項目の値を取得

### 4. 新規データ変換関数の作成

**判断**: Mode 2/4の関数をベースに、ブランドイメージデータ対応の新規関数を作成

**理由**:
- Mode 2/4の関数は固定項目（FT, FW, T1, T2...）を前提としている
- ブランドイメージデータへのアクセスが必要
- コードの可読性と保守性を確保

**影響**:
- 新規関数: `transformDataForHistoricalBrandImageBrandsComparison`
- 実装時間: 約15分

### 5. Mode番号の振り直し

**判断**: Mode 6として実装

**理由**:
- ブランドイメージ分析の流れ: Mode 5（項目軸）→ Mode 6（ブランド軸）が自然
- ユーザー体験の向上
- ドキュメントの更新が必要

---

## 🚧 技術的課題と解決策

### 課題1: ブランドイメージ項目の一覧取得

**課題**: 基準データソースから全ブランドイメージ項目を取得する必要がある

**解決策**:
```typescript
// AnalysisItemsSection.tsx
// ブランドイメージ項目の場合は動的に取得
const { itemKeys, itemLabels } = useMemo(() => {
    if (itemSet === 'brandImage' && dataSources && selectedSegment && selectedBrand) {
        const activeSources = dataSources.filter((ds: any) => ds.isActive);
        if (activeSources.length > 0) {
            const referenceSource = activeSources[0];
            const brandImageData = referenceSource.brandImageData;
            if (brandImageData && brandImageData[selectedSegment] && brandImageData[selectedSegment][selectedBrand]) {
                const items = Object.keys(brandImageData[selectedSegment][selectedBrand])
                    .filter(item => item !== 'あてはまるものはない')
                    .sort();
                const labels = items.reduce((acc, item) => {
                    acc[item] = item;
                    return acc;
                }, {});
                return { itemKeys: items, itemLabels: labels };
            }
        }
    }
    return {
        itemKeys: getItemKeysForSet(itemSet),
        itemLabels: getItemLabelsForSet(itemSet)
    };
}, [itemSet, dataSources, selectedSegment, selectedBrand]);
```

### 課題2: 基準データソースの決定

**課題**: 項目一覧の取得に使用する基準データソースを決定する必要がある

**解決策**:
- 先頭のアクティブなデータソースを基準とする
- そのデータソースの`brandImageData`から項目一覧を取得

### 課題3: ブランドイメージデータの取得

**課題**: 各データソースからブランドイメージデータを取得する必要がある

**解決策**:
```typescript
// データ変換関数内
const sourceBrandImageData = source.brandImageData || brandImageData;
```

---

## 📈 期待される効果

### ビジネス価値

1. **ブランドイメージの時系列比較**
   - 特定のブランドイメージ項目における複数ブランドの過去データとの比較
   - 競合分析の強化

2. **意思決定の迅速化**
   - ブランドイメージ項目ごとの深掘り分析が可能
   - データソースの切り替えで異なる時期を瞬時に比較

3. **戦略立案の精度向上**
   - どのブランドがどのブランドイメージ項目で強いか明確化
   - 時系列での変化を捉えて施策効果を測定

### 技術的価値

1. **パターン3の拡張**
   - ブランド軸の過去比較パターンに動的項目対応を追加
   - 今後のMode 10-14への応用可能

2. **アーキテクチャの拡張**
   - 設定駆動型アプローチの柔軟性を証明
   - 動的項目とブランド軸の組み合わせの実現

---

## 📚 関連ドキュメント

### 必読ドキュメント
1. `HISTORICAL_MODE2_REQUIREMENTS.md` - Mode 2の要件定義（パターン3の原型）
2. `HISTORICAL_MODE2_IMPLEMENTATION_REPORT.md` - Mode 2の実装報告
3. `HISTORICAL_MODE4_REQUIREMENTS.md` - Mode 4の要件定義（パターン3の応用）
4. `HISTORICAL_MODE4_IMPLEMENTATION_REPORT.md` - Mode 4の実装報告
5. `HISTORICAL_MODE5_REQUIREMENTS.md` - Mode 5の要件定義（ブランドイメージ分析の原型）

### 参考ドキュメント
6. `constants/analysisConfigs.ts` - 既存モード設定
7. `utils/dataTransforms.ts` - データ変換ロジック
8. `components/AnalysisItemsSection.tsx` - 項目選択UI

---

## 🎯 成功の定義

### 短期目標（実装完了時）
- [ ] Mode 6が設定通りに動作する
- [ ] エラーなしで実装完了
- [ ] 開発サーバーで動作確認済み
- [ ] ドキュメントが完備

### 中期目標（1週間後）
- [ ] 実際のデータで動作確認
- [ ] ユーザーフィードバックの収集
- [ ] 必要に応じた改善

### 長期目標（1ヶ月後）
- [ ] Mode 6を基にMode 10以降への展開
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
- 既存の実装コード（Mode 5, 2, 4）を参照
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

**このドキュメントを基に、約40分で実装を完了できます。**

