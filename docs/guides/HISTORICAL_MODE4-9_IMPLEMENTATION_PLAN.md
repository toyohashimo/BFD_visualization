# 過去比較モード Mode 4-14 実装計画書

## 📋 概要

**作成日**: 2025-11-30  
**ベース**: Mode 1-3 実装完了  
**対象**: Mode 4-14（残り11モード）  
**予想実装時間**: 約2時間

本ドキュメントは、Mode 4-14の詳細な実装計画を提供します。

---

## 🎯 実装対象モード一覧

| No. | モードID | モード名 | パターン | 実装時間 | 状態 |
|-----|---------|---------|---------|---------|------|
| 4 | `historical_brand_power_segment_brand` | ブランドパワー分析①（セグメント、ブランド） | パターン1 | 5分 | 📝 計画中 |
| 5 | `historical_brand_power_brand_segment` | ブランドパワー分析①（ブランド、セグメント） | パターン1 | 5分 | 📝 計画中 |
| 6 | `historical_future_power_segment_brand` | ブランドパワー分析②（セグメント、ブランド） | パターン1 | 5分 | 📝 計画中 |
| 7 | `historical_future_power_brand_segment` | ブランドパワー分析②（ブランド、セグメント） | パターン1 | 5分 | 📝 計画中 |
| 8 | `historical_archetype_segment_brand` | アーキタイプ分析（セグメント、ブランド） | パターン1 | 5分 | 📝 計画中 |
| 9 | `historical_archetype_brand_segment` | アーキタイプ分析（ブランド、セグメント） | パターン1 | 5分 | 📝 計画中 |
| 10-11 | ※検討中 | ブランドイメージ分析（詳細分析モードからの移植） | パターン2 | 30分 | 📝 計画中 |

**合計予想時間**: 約90分（1.5時間）

---

## 📊 フェーズ別実装計画

### フェーズ1: ブランドパワー分析①（Mode 4-5）

#### Mode 4: `historical_brand_power_segment_brand`

**実装時間**: 5分  
**パターン**: パターン1（固定項目）

##### 設定内容

```typescript
'historical_brand_power_segment_brand': {
    id: 'historical_brand_power_segment_brand',
    name: 'ブランドパワー分析①（セグメント、ブランド: X=現在パワー×過去比較）',
    description: '単一セグメント・単一ブランドにおける過去データとの比較（ブランドパワー）',
    axes: {
        items: {
            role: 'X_AXIS',
            label: '項目',
            allowMultiple: false,
            itemSet: 'brandPower',
            fixedItems: ['BP1', 'BP2', 'BP3', 'BP4']
        },
        segments: {
            role: 'FILTER',
            label: 'セグメント',
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
        series: 'dataSources',
        filter: 'segments'
    },
    defaultChartType: 'radar'  // レーダーチャート
}
```

##### 実装手順

1. `src/types/analysis.ts`に型追加（1分）
2. `constants/analysisConfigs.ts`に設定追加（3分）
3. `HISTORICAL_ANALYSIS_MODE_ORDER`に追加（1分）
4. リンターチェック
5. 動作確認

##### 特記事項

- **レーダーチャート**: `defaultChartType: 'radar'`
- **固定項目4つ**: BP1, BP2, BP3, BP4
- **既存関数使用**: `transformDataForHistoricalChart`

#### Mode 5: `historical_brand_power_brand_segment`

**実装時間**: 5分  
**パターン**: パターン1（固定項目）

##### 設定内容

```typescript
'historical_brand_power_brand_segment': {
    id: 'historical_brand_power_brand_segment',
    name: 'ブランドパワー分析①（ブランド、セグメント: X=現在パワー×過去比較）',
    description: '単一ブランド・単一セグメントにおける過去データとの比較（ブランドパワー）',
    axes: {
        items: {
            role: 'X_AXIS',
            label: '項目',
            allowMultiple: false,
            itemSet: 'brandPower',
            fixedItems: ['BP1', 'BP2', 'BP3', 'BP4']
        },
        segments: {
            role: 'FILTER',
            label: 'セグメント',
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
        series: 'dataSources',
        filter: 'brands'  // ← filterが異なる
    },
    defaultChartType: 'radar'
}
```

##### Mode 4との違い

| 項目 | Mode 4 | Mode 5 |
|------|--------|--------|
| **filter** | 'segments' | 'brands' |
| **分析視点** | セグメント固定 | ブランド固定 |

##### 注意点

⚠️ **重要**: 過去比較モードでは、セグメントもブランドも**単一選択（SA）**のため、Mode 4とMode 5の実質的な違いは小さい可能性があります。

**検討事項**: Mode 5が本当に必要かどうか、詳細分析モードのMode 10と比較して決定する必要があります。

---

### フェーズ2: ブランドパワー分析②（Mode 6-7）

#### Mode 6: `historical_future_power_segment_brand`

**実装時間**: 5分  
**パターン**: パターン1（固定項目）

##### 設定内容

```typescript
'historical_future_power_segment_brand': {
    id: 'historical_future_power_segment_brand',
    name: 'ブランドパワー分析②（セグメント、ブランド: X=将来性パワー×過去比較）',
    description: '単一セグメント・単一ブランドにおける過去データとの比較（将来性パワー）',
    axes: {
        items: {
            role: 'X_AXIS',
            label: '項目',
            allowMultiple: false,
            itemSet: 'futurePower',
            fixedItems: ['FP1', 'FP2', 'FP3', 'FP4', 'FP5', 'FP6']  // 6項目
        },
        segments: {
            role: 'FILTER',
            label: 'セグメント',
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
        series: 'dataSources',
        filter: 'segments'
    },
    defaultChartType: 'radar'
}
```

##### Mode 4との違い

| 項目 | Mode 4 | Mode 6 |
|------|--------|--------|
| **itemSet** | 'brandPower' | 'futurePower' |
| **fixedItems** | 4項目 | **6項目** |

#### Mode 7: `historical_future_power_brand_segment`

**実装時間**: 5分  
**パターン**: パターン1（固定項目）

Mode 6と同じ構造で、`filter: 'brands'`に変更。

---

### フェーズ3: アーキタイプ分析（Mode 8-9）

#### Mode 8: `historical_archetype_segment_brand`

**実装時間**: 5分  
**パターン**: パターン1（固定項目）

##### 設定内容

```typescript
'historical_archetype_segment_brand': {
    id: 'historical_archetype_segment_brand',
    name: 'アーキタイプ分析（セグメント、ブランド: X=アーキタイプ×過去比較）',
    description: '単一セグメント・単一ブランドにおける過去データとの比較（アーキタイプ）',
    axes: {
        items: {
            role: 'X_AXIS',
            label: '項目',
            allowMultiple: false,
            itemSet: 'archetype',
            fixedItems: [
                'creator', 'ruler', 'sage', 'explorer',
                'innocent', 'outlaw', 'magician', 'hero',
                'lover', 'jester', 'regular', 'caregiver'
            ]  // 12項目
        },
        segments: {
            role: 'FILTER',
            label: 'セグメント',
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
        series: 'dataSources',
        filter: 'segments'
    },
    defaultChartType: 'radar'
}
```

##### 特記事項

- **項目数が多い**: 12項目
- **レーダーチャート**: 12角形のレーダーチャート
- **アーキタイプメトリクス**: `brandData.archetypeMetrics`を使用

##### 既存実装の確認

`utils/dataTransforms.ts`の`transformDataForHistoricalChart`は、既にアーキタイプに対応済み:

```typescript
// アーキタイプの場合は特殊処理
if (xAxisConfig.itemSet === 'archetype' && brandData.archetypeMetrics) {
    point[source.name] = brandData.archetypeMetrics[key as keyof typeof brandData.archetypeMetrics] ?? 0;
} else {
    const value = brandData[key as keyof AllMetrics];
    point[source.name] = typeof value === 'number' ? value : 0;
}
```

✅ **追加実装不要**: そのまま動作します。

#### Mode 9: `historical_archetype_brand_segment`

**実装時間**: 5分  
**パターン**: パターン1（固定項目）

Mode 8と同じ構造で、`filter: 'brands'`に変更。

---

### フェーズ4: ブランドイメージ分析（Mode 10-11）※検討中

#### 背景

詳細分析モードには以下のブランドイメージ分析モードがあります:

- Mode 7: `brand_image_segment_brands`（セグメント固定、複数ブランド比較）
- Mode 8: `brand_analysis_segment_comparison`（ブランド固定、複数セグメント比較）

過去比較モードでは、**セグメントもブランドも単一選択（SA）**のため:

#### Mode 10: `historical_brand_image_segment_brands`（✅ 実装済み = Mode 3）

すでにMode 3として実装済みです。

#### Mode 11: `historical_brand_image_brand_segments`（検討中）

**問題**: 過去比較モードではセグメントもブランドも**SA（単一選択）**のため、Mode 10とMode 11の違いが不明確。

**提案**: Mode 11は**不要**と判断し、実装をスキップする。

**理由**:
1. セグメントもブランドも単一選択のため、フィルタ軸の違いが意味を持たない
2. データ系列は常に「データソース（時系列）」
3. ユーザーに混乱を与える可能性

**決定**: プロジェクト要件を確認後、必要に応じて実装

---

## 🔧 実装の詳細手順（パターン1）

### ステップバイステップガイド

#### ステップ1: 型定義の追加（1分）

```typescript
// src/types/analysis.ts
export type AnalysisMode =
  | ''
  // ... 既存のモード ...
  // 過去比較モード
  | 'historical_funnel1_segment_brand'
  | 'historical_funnel2_segment_brand'
  | 'historical_brand_image_segment_brand'
  | 'historical_brand_power_segment_brand'      // ← Mode 4
  | 'historical_brand_power_brand_segment'      // ← Mode 5
  | 'historical_future_power_segment_brand'     // ← Mode 6
  | 'historical_future_power_brand_segment'     // ← Mode 7
  | 'historical_archetype_segment_brand'        // ← Mode 8
  | 'historical_archetype_brand_segment';       // ← Mode 9
```

#### ステップ2: モード設定の追加（3分）

```typescript
// constants/analysisConfigs.ts
export const HISTORICAL_ANALYSIS_MODE_CONFIGS: Record<string, AnalysisModeConfig> = {
    // 既存モード...
    
    // Mode 4-9を追加（上記の設定内容を参照）
};
```

#### ステップ3: モード選択順序の更新（1分）

```typescript
export const HISTORICAL_ANALYSIS_MODE_ORDER = [
    'historical_funnel1_segment_brand',
    'historical_funnel2_segment_brand',
    'historical_brand_image_segment_brand',
    'historical_brand_power_segment_brand',      // ← Mode 4
    'historical_brand_power_brand_segment',      // ← Mode 5
    'historical_future_power_segment_brand',     // ← Mode 6
    'historical_future_power_brand_segment',     // ← Mode 7
    'historical_archetype_segment_brand',        // ← Mode 8
    'historical_archetype_brand_segment'         // ← Mode 9
];
```

#### ステップ4: リンターチェック

```bash
# 各ステップでリンターチェック
npm run lint
# または
read_lints(["src/types/analysis.ts", "constants/analysisConfigs.ts"])
```

#### ステップ5: 開発サーバーで確認

```bash
npm run dev
```

ブラウザで確認:
1. 過去比較モードに切り替え
2. 新しいモードが選択肢に表示されるか
3. セグメント・ブランドを選択
4. グラフが表示されるか
5. レーダーチャートの場合、形状が正しいか

---

## 📊 実装順序の推奨

### 推奨順序1: フェーズ別実装

```
Phase 1: Mode 4-5（ブランドパワー①）         10分
  ↓
Phase 2: Mode 6-7（ブランドパワー②）         10分
  ↓
Phase 3: Mode 8-9（アーキタイプ）            10分
  ↓
Phase 4: テスト・ドキュメント更新             10分
```

**合計**: 約40分

### 推奨順序2: 一括実装

```
Step 1: 型定義を一括追加（5分）
  ↓
Step 2: モード設定を一括追加（15分）
  ↓
Step 3: モード選択順序を一括追加（2分）
  ↓
Step 4: リンターチェック（3分）
  ↓
Step 5: 開発サーバー確認（5分）
  ↓
Step 6: ブラウザで動作確認（10分）
```

**合計**: 約40分

**推奨**: 推奨順序2（一括実装）の方が効率的

---

## ✅ テストケース

### 基本機能テスト

| ID | テストケース | 期待結果 |
|----|-------------|---------|
| T-01 | Mode 4を選択 | モード名が表示される |
| T-02 | セグメント選択（SA） | ドロップダウンで単一選択 |
| T-03 | ブランド選択（SA） | ドロップダウンで単一選択 |
| T-04 | グラフ生成（Mode 4） | レーダーチャート表示、4項目 |
| T-05 | グラフ生成（Mode 6） | レーダーチャート表示、6項目 |
| T-06 | グラフ生成（Mode 8） | レーダーチャート表示、12項目 |
| T-07 | データテーブル生成 | 行にデータソース、列に項目 |
| T-08 | データソースON/OFF | グラフから該当系列削除 |

### レーダーチャート特有のテスト

| ID | テストケース | 期待結果 |
|----|-------------|---------|
| T-11 | レーダーチャート形状 | 正しい多角形 |
| T-12 | レーダーチャート角度 | 各項目が均等配置 |
| T-13 | レーダーチャート凡例 | データソース名表示 |
| T-14 | 棒グラフ↔レーダー切り替え | 正しく切り替わる |

### エラーハンドリング

| ID | テストケース | 期待結果 |
|----|-------------|---------|
| T-21 | データソース0件 | エラーメッセージ表示 |
| T-22 | セグメント未選択 | エラーメッセージ表示 |
| T-23 | ブランド未選択 | エラーメッセージ表示 |
| T-24 | 全データソースOFF | エラーメッセージ表示 |

---

## 🐛 予想される問題と解決策

### 問題1: レーダーチャートの表示が崩れる

#### 症状
- レーダーチャートの形状が不正
- 項目が重なって表示される

#### 原因
- 項目数が多い（Mode 8: 12項目）

#### 解決策
```typescript
// ChartArea.tsx
// レーダーチャートの場合、ラベルのフォントサイズを調整
<RadarChart ...>
  <PolarAngleAxis 
    dataKey="name" 
    tick={{ fontSize: 10 }}  // ← フォントサイズを小さく
  />
</RadarChart>
```

### 問題2: アーキタイプメトリクスが取得できない

#### 症状
- Mode 8-9でグラフが表示されない
- コンソールに`archetypeMetrics`がundefinedのエラー

#### 原因
- データに`archetypeMetrics`が含まれていない

#### 解決策

`utils/dataTransforms.ts`の`transformDataForHistoricalChart`は既に対応済み:

```typescript
// アーキタイプの場合は特殊処理
if (xAxisConfig.itemSet === 'archetype' && brandData.archetypeMetrics) {
    point[source.name] = brandData.archetypeMetrics[key as keyof typeof brandData.archetypeMetrics] ?? 0;
}
```

✅ **追加実装不要**

### 問題3: Mode 5とMode 4の違いが分からない

#### 症状
- ユーザーがMode 4とMode 5の違いを理解できない

#### 原因
- 過去比較モードではセグメントもブランドも単一選択のため、違いが不明確

#### 解決策

**オプション1**: Mode 5を削除する

**オプション2**: モード名を明確にする
```typescript
name: 'ブランドパワー分析①（セグメント基準: X=現在パワー×過去比較）',
name: 'ブランドパワー分析①（ブランド基準: X=現在パワー×過去比較）',
```

**推奨**: 実装後、実際の動作を確認してから判断

---

## 📚 参考情報

### 詳細分析モードの対応表

| 過去比較モード | 詳細分析モード | 変更点 |
|--------------|--------------|-------|
| Mode 4 | Mode 9 `brand_power_segment_brands` | ブランドがMA→SA |
| Mode 5 | Mode 10 `brand_power_brand_segments` | セグメントがMA→SA |
| Mode 6 | Mode 11 `future_power_segment_brands` | ブランドがMA→SA |
| Mode 7 | Mode 12 `future_power_brand_segments` | セグメントがMA→SA |
| Mode 8 | Mode 13 `archetype_segment_brands` | ブランドがMA→SA |
| Mode 9 | Mode 14 `archetype_brand_segments` | セグメントがMA→SA |

### itemSetとfixedItemsの対応表

| itemSet | fixedItems | 項目数 | ラベル定義 |
|---------|-----------|-------|----------|
| `funnel` | FT, FW, FZ, GC, GJ, GL | 6 | `FUNNEL_LABELS` |
| `timeline` | T1, T2, T3, T4, T5 | 5 | `TIMELINE_LABELS` |
| `brandPower` | BP1, BP2, BP3, BP4 | 4 | `BRAND_POWER_LABELS` |
| `futurePower` | FP1, FP2, FP3, FP4, FP5, FP6 | 6 | `FUTURE_POWER_LABELS` |
| `archetype` | creator, ruler, sage, ... | 12 | `ARCHETYPE_LABELS` |
| `brandImage` | （動的） | 30 | （項目名そのまま） |

---

## 🎯 完了条件

### Mode 4-9 実装完了の定義

#### 必須条件

- [ ] すべてのモードが`src/types/analysis.ts`に追加されている
- [ ] すべてのモードが`constants/analysisConfigs.ts`に設定されている
- [ ] すべてのモードが`HISTORICAL_ANALYSIS_MODE_ORDER`に追加されている
- [ ] リンターエラー: 0件
- [ ] TypeScriptコンパイルエラー: 0件
- [ ] 開発サーバーが正常起動する

#### 動作確認

- [ ] すべてのモードが選択可能
- [ ] セグメント・ブランド選択がSA制約で動作
- [ ] グラフが正しく表示される（レーダーチャート含む）
- [ ] データテーブルが正しく表示される
- [ ] データソースON/OFF切り替えが動作する
- [ ] グラフタイプ切り替えが動作する

#### ドキュメント

- [ ] 実装完了報告書の作成（`HISTORICAL_MODE4-9_IMPLEMENTATION_REPORT.md`）
- [ ] README.mdの更新（実装済みモード一覧）

---

## 📊 実装スケジュール

### タイムライン

```
Day 1: Mode 4-9 一括実装
  ├─ 00:00-00:05  型定義追加
  ├─ 00:05-00:20  モード設定追加
  ├─ 00:20-00:22  モード選択順序追加
  ├─ 00:22-00:25  リンターチェック
  ├─ 00:25-00:30  開発サーバー起動確認
  └─ 00:30-00:40  ブラウザで動作確認

Day 1: ドキュメント作成
  ├─ 00:40-00:50  実装完了報告書作成
  └─ 00:50-01:00  README.md更新

合計: 約1時間
```

---

## 🎉 期待される成果

### 実装完了時の状態

```
過去比較モード: 9モード実装済み
├─ Mode 1: ファネル分析① ✅
├─ Mode 2: ファネル分析② ✅
├─ Mode 3: ブランドイメージ分析 ✅
├─ Mode 4: ブランドパワー分析①（セグメント、ブランド） 📝
├─ Mode 5: ブランドパワー分析①（ブランド、セグメント） 📝
├─ Mode 6: ブランドパワー分析②（セグメント、ブランド） 📝
├─ Mode 7: ブランドパワー分析②（ブランド、セグメント） 📝
├─ Mode 8: アーキタイプ分析（セグメント、ブランド） 📝
└─ Mode 9: アーキタイプ分析（ブランド、セグメント） 📝
```

### プロジェクトへの影響

- ✅ 過去比較モードの**90%完成**
- ✅ レーダーチャート対応完了
- ✅ すべての主要分析軸をカバー
- ✅ ユーザーに豊富な分析オプションを提供

---

## 💡 実装のコツ

### 効率的な実装方法

1. **コピー&ペーストを活用**
   - Mode 2の設定をコピー
   - `itemSet`と`fixedItems`を変更
   - `defaultChartType`を変更（レーダーの場合）

2. **一括編集を活用**
   - VSCodeのマルチカーソル
   - 一度に複数行を編集

3. **段階的にテスト**
   - 2-3モード追加 → リンターチェック
   - を繰り返す

4. **ドキュメントを参照**
   - `HISTORICAL_MODES_IMPLEMENTATION_GUIDE.md`
   - Mode 1-3の実装報告書

---

## 🚀 次のステップ

### 実装後のアクション

1. **テストの実施**
   - すべてのモードで動作確認
   - エッジケースのテスト

2. **ドキュメントの更新**
   - 実装完了報告書の作成
   - README.mdの更新

3. **ユーザーフィードバックの収集**
   - 実際の使用感を確認
   - 改善点の洗い出し

4. **Phase 4（エクスポート機能）の実装**
   - CSV エクスポート対応
   - 画像エクスポート対応

---

**Document Version**: 1.0  
**Created**: 2025-11-30  
**Status**: 📝 計画書  
**Next Action**: Mode 4-9 実装開始


