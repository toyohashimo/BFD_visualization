# 過去比較モード Mode 4 要件定義書

## 📋 基本情報

**モード番号**: 4  
**モード名**: ファネル分析②（セグメント、ファネル②: X=ブランド×過去比較）  
**モードID**: `historical_funnel2_brands_comparison`  
**作成日**: 2025-12-01  
**ステータス**: 要件定義完了 ✅  
**優先度**: 高  
**実装パターン**: パターン3（ブランド軸 - Mode 2の応用）  
**予想実装時間**: 15分

---

## 🎯 概要

### 目的
単一セグメント・固定タイムライン項目における、複数ブランドの過去データとの比較を行う分析モード。

### 特徴
- **X軸**: ブランド（複数選択可能）
- **分析項目**: ファネル②（タイムライン：固定5項目 T1, T2, T3, T4, T5）
- **フィルタ**: セグメント（単一選択）+ タイムライン項目（単一選択）
- **データ系列**: 過去データソース（時間軸）

### 既存モードとの違い

| 項目 | Mode 2（実装済み） | **Mode 4（本モード）** |
|------|-------------------|---------------------|
| X軸 | ブランド | **ブランド** |
| フィルタ | セグメント+ファネル項目 | **セグメント+タイムライン項目** |
| 分析項目選択 | ファネル①（FT〜GL） | **ファネル②（T1〜T5）** |
| itemSet | 'funnel' | **'timeline'** |
| fixedItems | ['FT', 'FW', ...] | **['T1', 'T2', ...]** |
| データ系列 | データソース | データソース |

### ビジネス価値

1. **時系列利用状況の比較**: 複数ブランドの直近利用状況（T1〜T5）を時系列で比較
2. **過去比較による変化検出**: 同一ブランドの時系列項目の推移を把握
3. **セグメント別の時系列分析**: 特定セグメントに絞った時系列トレンド分析

---

## 🏗️ 技術仕様

### 1. 分析モード設定

```typescript
// constants/analysisConfigs.ts
'historical_funnel2_brands_comparison': {
    id: 'historical_funnel2_brands_comparison',
    name: 'ファネル分析②（セグメント、ファネル②: X=ブランド×過去比較）',
    description: '単一セグメント・単一タイムライン項目における複数ブランドの過去データとの比較',
    axes: {
        items: {
            role: 'FILTER',              // ← フィルタとして機能
            label: 'タイムライン項目',   // ← Mode 2から変更
            allowMultiple: false,        // ← 単一選択
            itemSet: 'timeline',         // ← Mode 2から変更（funnel → timeline）
            fixedItems: ['T1', 'T2', 'T3', 'T4', 'T5']  // ← Mode 2から変更
        },
        segments: {
            role: 'FILTER',
            label: 'セグメント',
            allowMultiple: false
        },
        brands: {
            role: 'X_AXIS',
            label: 'ブランド',
            allowMultiple: true          // ← 複数選択可能
        }
    },
    dataTransform: {
        xAxis: 'brands',                 // ← ブランドがX軸
        series: 'dataSources',           // ← データソースが系列
        filter: 'segments'               // ← セグメントでフィルタ
    },
    defaultChartType: 'bar'
}
```

**重要ポイント（Mode 2との差分）**:
1. ✅ **itemSet**: `'funnel'` → `'timeline'`
2. ✅ **fixedItems**: `['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL']` → `['T1', 'T2', 'T3', 'T4', 'T5']`
3. ✅ **label**: `'ファネル項目'` → `'タイムライン項目'`
4. ✅ その他の設定は**Mode 2と完全に同じ**

---

### 2. 型定義

```typescript
// src/types/analysis.ts
export type AnalysisMode =
  | ''
  // ... 既存のモード ...
  | 'historical_funnel1_brands_comparison'  // Mode 2
  | 'historical_funnel2_brands_comparison'; // ← Mode 4を追加
```

---

### 3. データ変換ロジック

**重要**: Mode 4は**Mode 2と同じデータ変換関数を使用**します。

```typescript
// App.tsx
if (analysisMode === 'historical_funnel2_brands_comparison') {
  return transformDataForHistoricalBrandsComparison(
    activeSources,
    config,
    sheet,              // selectedSegment
    selectedBrands,     // 複数ブランド
    selectedItem || 'T1', // デフォルトはT1（直近1年以内）← Mode 2から変更
    labelGetters
  );
}
```

**変更点**:
- デフォルト値のみ `'FT'` → `'T1'` に変更
- データ変換関数は**追加不要**（`transformDataForHistoricalBrandsComparison`を共通利用）

---

### 4. UI表示

#### 4.1 モード選択順序

```typescript
// constants/analysisConfigs.ts
export const HISTORICAL_ANALYSIS_MODE_ORDER = [
    'historical_funnel1_segment_brand',
    'historical_funnel1_brands_comparison',  // Mode 2
    'historical_funnel2_brands_comparison',  // ← Mode 4を追加
    'historical_funnel2_segment_brand',
    // ...
];
```

#### 4.2 サイドバー表示

Mode 8選択時のサイドバー構成：

```
┌─────────────────────────────┐
│ 🗂️ データソース管理         │ ← 複数データソース選択可能
│   ✅ sample_202406.xlsx     │
│   ✅ sample_202506.xlsx     │
├─────────────────────────────┤
│ 📊 分析モード選択            │
│   ファネル分析②（...×過去比較）│ ← Mode 4選択中
├─────────────────────────────┤
│ 🎯 セグメント選択 [SA]       │ ← 単一選択
│   ⚪ 全体                    │
├─────────────────────────────┤
│ 📋 タイムライン項目選択 [SA] │ ← ★新規表示
│   ⚪ T1: 直近1年以内         │ ← デフォルト選択
│   ⚪ T2: 直近半年以内        │
│   ⚪ T3: 直近3ヶ月以内       │
│   ⚪ T4: 直近1ヶ月以内       │
│   ⚪ T5: 本日                │
├─────────────────────────────┤
│ 🏷️ ブランド選択 [MA]         │ ← 複数選択可能
│   ✅ スターバックス          │
│   ✅ タリーズ                │
│   ✅ ドトール                │
└─────────────────────────────┘
```

#### 4.3 グラフエリア上部表示

```
セグメント: 全体    タイムライン項目: T1: 直近1年以内
```

**重要**: Mode 2で実装した**複数フィルタ表示機能**がそのまま使える。

---

## 📊 実装計画

### Phase 1: 設定追加（5分）

#### タスク
1. ✅ `src/types/analysis.ts` に型定義を追加
2. ✅ `constants/analysisConfigs.ts` に設定を追加
   - Mode 2の設定をコピー
   - `id`, `name`, `description` を変更
   - `itemSet` を `'timeline'` に変更
   - `fixedItems` を `['T1', 'T2', 'T3', 'T4', 'T5']` に変更
   - `label` を `'タイムライン項目'` に変更
3. ✅ `HISTORICAL_ANALYSIS_MODE_ORDER` に追加

#### 実装コード（コピー&ペーストのみ）

```typescript
// 1. src/types/analysis.ts に1行追加
| 'historical_funnel2_brands_comparison'

// 2. constants/analysisConfigs.ts に設定を追加
'historical_funnel2_brands_comparison': {
    id: 'historical_funnel2_brands_comparison',
    name: 'ファネル分析②（セグメント、ファネル②: X=ブランド×過去比較）',
    description: '単一セグメント・単一タイムライン項目における複数ブランドの過去データとの比較',
    axes: {
        items: {
            role: 'FILTER',
            label: 'タイムライン項目',  // 変更点
            allowMultiple: false,
            itemSet: 'timeline',        // 変更点
            fixedItems: ['T1', 'T2', 'T3', 'T4', 'T5']  // 変更点
        },
        segments: {
            role: 'FILTER',
            label: 'セグメント',
            allowMultiple: false
        },
        brands: {
            role: 'X_AXIS',
            label: 'ブランド',
            allowMultiple: true
        }
    },
    dataTransform: {
        xAxis: 'brands',
        series: 'dataSources',
        filter: 'segments'
    },
    defaultChartType: 'bar'
}

// 3. HISTORICAL_ANALYSIS_MODE_ORDER に追加
'historical_funnel2_brands_comparison',
```

---

### Phase 2: データ変換統合（3分）

#### タスク
1. ✅ `App.tsx` にモード判定を追加
2. ✅ デフォルト値を `'T1'` に設定

#### 実装コード

```typescript
// App.tsx
const chartData = useMemo(() => {
  // ... ラベル変換関数の定義 ...

  if (isHistoricalMode()) {
    const activeSources = getActiveDataSources();
    if (activeSources.length === 0) return null;

    // Mode 7: ブランド軸の過去比較（ファネル①）
    if (analysisMode === 'historical_funnel1_brands_comparison') {
      return transformDataForHistoricalBrandsComparison(
        activeSources,
        config,
        sheet,
        selectedBrands,
        selectedItem || 'FT',
        labelGetters
      );
    }

    // Mode 8: ブランド軸の過去比較（ファネル②）← 追加
    if (analysisMode === 'historical_funnel2_brands_comparison') {
      return transformDataForHistoricalBrandsComparison(
        activeSources,
        config,
        sheet,
        selectedBrands,
        selectedItem || 'T1',  // ← デフォルトを'T1'に変更
        labelGetters
      );
    }

    // その他のモード...
  }
  // ...
}, [globalMode, analysisMode, dataSources, selectedSegments, selectedBrands, selectedItem]);
```

---

### Phase 3: 動作確認（5分）

#### チェック項目
1. ✅ TypeScriptコンパイルエラーなし
2. ✅ リンターエラーなし
3. ✅ 開発サーバー起動確認
4. ✅ Mode 4が選択可能
5. ✅ セグメント選択（SA）が動作
6. ✅ タイムライン項目選択（SA）が表示・動作
7. ✅ ブランド選択（MA）が動作
8. ✅ グラフが正しく表示される
9. ✅ データテーブルが正しく表示される
10. ✅ 左上フィルタが2つ表示される（セグメント + タイムライン項目）

---

### Phase 4: ドキュメント更新（2分）

#### タスク
1. ✅ `README_DOCS.md` を更新（Mode 8の追加を記録）
2. ✅ 実装報告書を作成（本ドキュメントと統合）

---

## 📝 実装チェックリスト

### ✅ Phase 1: 設定（5分）

- [ ] `src/types/analysis.ts` に `'historical_funnel2_brands_comparison'` を追加
- [ ] `constants/analysisConfigs.ts` に設定を追加
  - [ ] `id` を設定: `'historical_funnel2_brands_comparison'`
  - [ ] `name` を設定: `'ファネル分析②（セグメント、ファネル②: X=ブランド×過去比較）'`
  - [ ] `description` を設定
  - [ ] `axes.items.itemSet` を `'timeline'` に設定
  - [ ] `axes.items.fixedItems` を `['T1', 'T2', 'T3', 'T4', 'T5']` に設定
  - [ ] `axes.items.label` を `'タイムライン項目'` に設定
  - [ ] `axes.segments.role` を `'FILTER'` に設定
  - [ ] `axes.brands.role` を `'X_AXIS'` に設定
  - [ ] `axes.brands.allowMultiple` を `true` に設定
  - [ ] `dataTransform.xAxis` を `'brands'` に設定
  - [ ] `dataTransform.series` を `'dataSources'` に設定
- [ ] `HISTORICAL_ANALYSIS_MODE_ORDER` に `'historical_funnel2_brands_comparison'` を追加

### ✅ Phase 2: 統合（3分）

- [ ] `App.tsx` にモード判定を追加
- [ ] `transformDataForHistoricalBrandsComparison` を呼び出し
- [ ] デフォルト値を `'T1'` に設定

### ✅ Phase 3: 動作確認（5分）

- [ ] TypeScriptコンパイルエラーなし
- [ ] リンターエラーなし
- [ ] 開発サーバーで起動確認
- [ ] Mode 4が選択可能
- [ ] セグメント選択（SA）動作確認
- [ ] タイムライン項目選択（SA）動作確認
- [ ] ブランド選択（MA）動作確認
- [ ] グラフ表示確認
- [ ] データテーブル表示確認
- [ ] 左上フィルタ表示確認（2つ表示されるか）

### ✅ Phase 4: ドキュメント（2分）

- [ ] `README_DOCS.md` 更新
- [ ] 実装報告書作成

---

## 🧪 テストシナリオ

### シナリオ1: 基本動作確認

1. **データ準備**
   - sample_202406.xlsx をロード
   - sample_202506.xlsx をロード
   - 両方のデータソースをアクティブ化

2. **モード選択**
   - 過去比較モードタブを選択
   - Mode 8を選択
   - セグメント「全体」を選択
   - タイムライン項目「T1: 直近1年以内」を選択（デフォルト）
   - ブランド「スターバックス」「タリーズ」「ドトール」を選択

3. **期待結果**
   - グラフのX軸にブランド名が表示される
   - 各ブランドに対して2つのバー（2つのデータソース）が表示される
   - 左上に「セグメント: 全体」「タイムライン項目: T1: 直近1年以内」が表示される
   - データテーブルに正しい値が表示される

### シナリオ2: 項目切り替え確認

1. **初期状態**: シナリオ1の状態

2. **操作**
   - タイムライン項目を「T2: 直近半年以内」に変更

3. **期待結果**
   - グラフが再描画される
   - 左上の表示が「タイムライン項目: T2: 直近半年以内」に変わる
   - データの値が変更される

### シナリオ3: ブランド追加・削除確認

1. **初期状態**: シナリオ1の状態

2. **操作**
   - 「コメダ」を追加選択
   - 「ドトール」の選択を解除

3. **期待結果**
   - グラフに「コメダ」が追加される
   - 「ドトール」がグラフから削除される
   - X軸のブランド数が変更される

---

## 📊 データフロー

```
[Excel Files]
    ↓
[DataSource Management]
    ↓ アクティブなデータソースを選択
[Historical Mode 4]
    ↓
[User Selections]
 - セグメント: 全体 (FILTER)
 - タイムライン項目: T1 (FILTER)
 - ブランド: [スタバ, タリーズ, ドトール] (X_AXIS)
    ↓
[transformDataForHistoricalBrandsComparison]
 - 各ブランドに対してデータポイントを生成
 - 各データソースの値を取得
 - データ構造: source.data[segment][brand][item]
    ↓
[ChartDataPoint[]]
 - { name: 'スタバ', '202406': 80, '202506': 85 }
 - { name: 'タリーズ', '202406': 75, '202506': 78 }
 - { name: 'ドトール', '202406': 70, '202506': 72 }
    ↓
[Chart Rendering]
 - X軸: ブランド名
 - 系列: データソース名（202406, 202506）
 - フィルタ表示: セグメント + タイムライン項目
```

---

## 🔍 Mode 2との差分まとめ

| 項目 | Mode 2 | Mode 4 |
|------|--------|--------|
| **モードID** | `historical_funnel1_brands_comparison` | `historical_funnel2_brands_comparison` |
| **モード名** | ファネル分析① | ファネル分析② |
| **itemSet** | `'funnel'` | `'timeline'` |
| **fixedItems** | `['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL']` | `['T1', 'T2', 'T3', 'T4', 'T5']` |
| **項目ラベル** | `'ファネル項目'` | `'タイムライン項目'` |
| **デフォルト値** | `'FT'` | `'T1'` |
| **データ変換関数** | `transformDataForHistoricalBrandsComparison` | **同じ関数を使用** ✅ |
| **UI構成** | セグメント + ファネル項目 + ブランド | セグメント + タイムライン項目 + ブランド |
| **実装パターン** | パターン3（新規） | パターン3（Mode 2の応用） |

---

## 💡 実装のポイント

### 1. Mode 2の資産を最大活用

- ✅ データ変換関数は**新規作成不要**
- ✅ UI表示ロジックは**修正不要**
- ✅ BrandsSectionの複数選択対応は**既存の実装が使える**
- ✅ 複数フィルタ表示機能は**既存の実装が使える**

### 2. 変更箇所は最小限

- ✅ 型定義: 1行追加
- ✅ モード設定: Mode 2をコピーして3箇所変更
- ✅ App.tsx: 9行追加（分岐処理）
- ✅ モード選択順序: 1行追加

### 3. 実装時間を短縮

- ✅ 予想実装時間: **15分**
- ✅ Mode 2の実装時間（62分）の**24%**
- ✅ 設定駆動型アプローチの効果を実証

---

## 🎓 得られる知見

### 技術的知見

1. **汎用データ変換関数の威力**
   - itemSetに依存しない設計により、関数の再利用が可能
   - Mode 2, 4, 6... すべてで同じ関数を使用できる

2. **設定駆動型の柔軟性**
   - 設定の3箇所変更だけで新モードが追加可能
   - コードの変更が最小限で済む

3. **role ベースUIの自動化**
   - role に基づいてUIが自動的に適応
   - 特殊ケースの処理が不要

### 設計的知見

1. **パターン3の確立**
   - Mode 2で確立したパターン3がMode 4でも有効
   - 今後のMode 6以降でも同じパターンを適用可能

2. **段階的な機能追加**
   - Mode 2で基盤を構築
   - Mode 4では設定変更のみ
   - 効率的な開発プロセス

---

## 📚 関連ドキュメント

### 必読ドキュメント
1. `HISTORICAL_MODE2_REQUIREMENTS.md` - Mode 2の要件定義（パターン3の原型）
2. `HISTORICAL_MODE2_COMPLETE_GUIDE.md` - Mode 2の完全実装ガイド
3. `HISTORICAL_MODE2_IMPLEMENTATION_REPORT.md` - Mode 2の実装報告

### 参考ドキュメント
4. `constants/analysisConfigs.ts` - 設定の実例
5. `utils/dataTransforms.ts` - データ変換ロジック（transformDataForHistoricalBrandsComparison）
6. `components/ChartArea.tsx` - 複数フィルタ表示の実装

---

## 🚀 次のステップ

### Mode 8実装後の展開

**Mode 6以降の実装**:
- すべてMode 4と同じパターン
- 各モード約15分で実装可能
- 予想総実装時間: 約2時間

### Mode 6以降の実装順序（推奨）

1. **Mode 6**: ブランドイメージ分析×ブランド軸（動的項目）
2. **Mode 10以降**: ブランドパワー①×ブランド軸（BP1-BP4）
3. **Mode 11以降**: ブランドパワー②×ブランド軸（FP1-FP6）
4. **Mode 12以降**: アーキタイプ×ブランド軸（12原型）

---

## ✅ まとめ

Mode 8の実装により、以下を達成できます：

### 完了事項

1. ✅ **パターン3の応用を実証**
   - Mode 2の資産を最大活用
   - 実装時間15分（Mode 2の24%）

2. ✅ **設定駆動型の威力を証明**
   - 3箇所の設定変更のみ
   - 新規コード追加はほぼ不要

3. ✅ **Mode 6以降への道筋を確立**
   - すべて同じパターンで実装可能
   - 効率的な開発プロセス

### ビジネス価値

1. ✅ **時系列利用状況の分析**
   - 複数ブランドの直近利用状況を比較
   - 過去データとの推移を可視化

2. ✅ **セグメント別の時系列トレンド**
   - 特定セグメントに絞った分析
   - データ駆動型の意思決定支援

---

**Document Version**: 1.0  
**Created**: 2025-12-01  
**Author**: AI Assistant  
**Status**: ✅ 要件定義完了  
**Next Action**: 実装フェーズへ移行

---

**このドキュメントに従えば、Mode 4の実装が15分で完了します。**

