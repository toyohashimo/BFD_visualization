# 過去比較モード Mode 1 実装完了報告書

## 📋 概要

**実装期間**: 2025年11月30日  
**実装対象**: 過去比較モード - ファネル分析①（Mode 1）  
**ステータス**: ✅ 完了

本ドキュメントは、過去比較モードの最初の実装であるMode 1の実装過程、遭遇した問題、解決策、および次のモード実装への知見をまとめたものです。

---

## 🎯 実装目標の達成状況

### 完了した機能

- ✅ グローバルモード切り替え（詳細分析 ⇔ 過去比較）
- ✅ 複数データソース管理（最大3ファイル）
- ✅ データソース自動命名（ファイル名から年月抽出）
- ✅ データソースのアクティブ/非アクティブ切り替え
- ✅ 過去比較モード専用の分析モード設定
- ✅ セグメント・ブランドの単一選択（SA）制約
- ✅ 過去比較グラフの描画（棒グラフ・折れ線グラフ対応）
- ✅ 過去比較データテーブルの表示

### 保留機能

- ⏸️ CSV/画像エクスポート機能（Phase 4）
- ⏸️ Mode 2-14の実装

---

## 🏗️ アーキテクチャ設計

### 1. グローバルモード管理

#### 型定義 (`src/types/globalMode.ts`)

```typescript
export type GlobalMode = 'detailed' | 'historical';

export type GlobalModeConfig = {
  mode: GlobalMode;
  brandSelectionMode: 'single' | 'multiple';
  segmentSelectionMode: 'single' | 'multiple';
};
```

#### フック (`src/hooks/useGlobalMode.ts`)

- `globalMode`: 現在のグローバルモード状態
- `setGlobalMode`: モード切り替え関数
- `getConfig()`: モードに応じた設定を返す
- `isHistoricalMode()`: 過去比較モードかどうかの判定

**重要な実装ポイント**:
- `localStorage`で永続化
- モード切り替え時に適切なデフォルト分析モードに自動遷移

### 2. マルチデータソース管理

#### 型定義 (`src/types/dataSource.ts`)

```typescript
export type DataSource = {
  id: string;           // UUID
  name: string;         // 表示名（例：「2025年6月」）
  fileName: string;     // 元のファイル名
  uploadedAt: Date;     // アップロード日時
  data: ParsedData;     // パースされたExcelデータ
  brandImageData?: Record<string, BrandImageData>;
  isActive: boolean;    // グラフ・テーブルに表示するか
};
```

#### フック (`src/hooks/useMultiDataSource.ts`)

主要な機能:
- `addDataSource(file)`: ファイルからデータソースを追加
- `addDirectDataSource(name, data)`: データを直接追加（モード切り替え時に使用）
- `removeDataSource(id)`: データソース削除
- `updateDataSourceName(id, newName)`: 名前変更
- `toggleDataSourceActive(id)`: アクティブ/非アクティブ切り替え
- `getActiveDataSources()`: アクティブなデータソースのみ取得

**重要な実装ポイント**:
- **メタデータのみを`localStorage`に保存**: 実際のデータは`useRef`でメモリ保持
  - 理由: `localStorage`の容量制限（QuotaExceededError）を回避
- **自動命名機能**: 正規表現でファイル名から年月を抽出
  ```typescript
  // 例: "BFD_202506.xlsx" → "2025年6月"
  // 例: "BFD_202406.xlsx" → "2024年6月"
  ```

### 3. 過去比較専用の分析モード設定

#### 設定定義 (`constants/analysisConfigs.ts`)

```typescript
export const HISTORICAL_ANALYSIS_MODE_CONFIGS: Record<string, AnalysisModeConfig> = {
  'historical_funnel1_segment_brand': {
    id: 'historical_funnel1_segment_brand',
    name: 'ファネル分析①（セグメント、ブランド: X=ファネル①×過去比較）',
    axes: {
      items: {
        role: 'X_AXIS',
        itemSet: 'funnel',
        fixedItems: ['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL']
      },
      segments: {
        role: 'FILTER',
        allowMultiple: false  // 過去比較では単一選択のみ
      },
      brands: {
        role: 'FILTER',
        allowMultiple: false  // 過去比較では単一選択のみ
      }
    },
    dataTransform: {
      xAxis: 'items',
      series: 'dataSources',  // データソースが系列になる
      filter: 'segments'
    }
  }
};
```

**重要な設計判断**:
- 過去比較モードと詳細分析モードは**完全に別の設定セット**を持つ
- `series: 'dataSources'`により、グラフの系列が時間軸（データソース）になる

### 4. データ変換ロジック

#### 関数 (`utils/dataTransforms.ts`)

```typescript
export const transformDataForHistoricalChart = (
  dataSources: DataSource[],
  config: AnalysisModeConfig,
  selectedSegment: string,
  selectedBrand: string,
  selectedItem: string,
  labelGetters: Record<AxisType, (key: string) => string>
): ChartDataPoint[] | null
```

**処理フロー**:
1. アクティブなデータソースをフィルタ
2. X軸の項目キー（FT, FW, FZ, etc.）を取得
3. 各項目ごとにデータポイントを生成:
   ```typescript
   {
     name: '認知あり(TOP2)',
     '2025年6月': 14.9,
     '2024年6月': 13.8,
     '2023年6月': 14.9
   }
   ```

**重要なポイント**:
- セグメントとブランドは**単一固定値**
- データソース名がプロパティキーになる
- 値が存在しない場合は`0`を返す

---

## 🐛 遭遇した問題と解決策

### 問題1: `localStorage`の容量超過

**エラー**: `QuotaExceededError: Failed to execute 'setItem' on 'Storage'`

**原因**: 
複数のExcelファイル（各70ブランド × 47セグメント）の全データを`localStorage`に保存しようとした

**解決策**:
```typescript
// メタデータのみを永続化
export type PersistedDataSourceMetadata = Omit<DataSource, 'data' | 'brandImageData'>;

// 実際のデータはメモリに保持
const dataSourcesRef = useRef<DataSource[]>([]);
```

**教訓**: 大容量データは`localStorage`に保存せず、セッション中のみメモリに保持

---

### 問題2: 無限ループの発生

**エラー**: `Maximum update depth exceeded`

**原因**:
```typescript
// 毎回新しいオブジェクトが生成され、useEffectが無限に実行される
const currentModeConfigs = globalMode === 'historical' 
  ? HISTORICAL_ANALYSIS_MODE_CONFIGS 
  : ANALYSIS_MODE_CONFIGS;
```

**解決策**:
```typescript
// useMemoでメモ化
const currentModeConfigs = useMemo(() => {
  return globalMode === 'historical' 
    ? HISTORICAL_ANALYSIS_MODE_CONFIGS 
    : ANALYSIS_MODE_CONFIGS;
}, [globalMode]);
```

**教訓**: オブジェクトや配列をuseEffectの依存配列に含める場合は必ずメモ化

---

### 問題3: グラフが表示されない

**原因**: `ChartArea`で`seriesItems`が空配列になっていた

```typescript
// 詳細分析モード用のロジックだけだった
const seriesItems = useMemo(() => {
  const config = currentModeConfigs[analysisMode];
  const seriesAxis = config.dataTransform.series;
  switch (seriesAxis) {
    case 'brands': return selectedBrands;
    case 'segments': return selectedSegments;
  }
}, [analysisMode, selectedBrands, selectedSegments]);
```

**解決策**:
```typescript
const seriesItems = useMemo(() => {
  // 過去比較モード時はデータソース名を使用
  if (globalMode === 'historical') {
    return dataSources.filter(ds => ds.isActive).map(ds => ds.name);
  }
  
  // 詳細分析モードは既存のロジック
  const config = currentModeConfigs[analysisMode];
  const seriesAxis = config.dataTransform.series;
  // ...
}, [globalMode, dataSources, ...]);
```

**教訓**: グローバルモードによって異なるロジックが必要な箇所を事前に洗い出す

---

### 問題4: データテーブルの行列が逆

**現象**: 項目が行、データソースが列で表示されていた

**修正前**:
```
項目           | 2025年6月 | 2024年6月
-------------- | --------- | ---------
認知あり(TOP2)  | 14.9      | 13.8
```

**修正後（正しい）**:
```
データソース | 認知あり | 興味あり | ...
------------ | -------- | -------- | ---
2025年6月    | 14.9     | 2.9      | ...
2024年6月    | 13.8     | 2.0      | ...
```

**教訓**: グラフとテーブルで構造を統一する（系列=行、X軸=列）

---

## 🔑 重要な設計判断

### 1. グローバルモードに応じた設定の切り替え

すべての主要コンポーネントで`currentModeConfigs`を使用:

```typescript
const currentModeConfigs = useMemo(() => {
  return globalMode === 'historical' 
    ? HISTORICAL_ANALYSIS_MODE_CONFIGS 
    : ANALYSIS_MODE_CONFIGS;
}, [globalMode]);

const config = currentModeConfigs[analysisMode];
```

**影響を受けるコンポーネント**:
- `App.tsx`
- `Sidebar.tsx`
- `ChartArea.tsx`
- `SegmentsSection.tsx`
- `BrandsSection.tsx`
- `AnalysisItemsSection.tsx`

### 2. モード切り替え時の自動データソース追加

```typescript
const handleGlobalModeChange = useCallback((newMode: GlobalMode) => {
  if (newMode === 'historical' && globalMode === 'detailed') {
    // 詳細分析→過去比較: 現在のデータを最初のデータソースとして追加
    if (hasValidData && dataSources.length === 0) {
      addDirectDataSource('現在のデータ', data, brandImageData);
    }
    setAnalysisMode('historical_funnel1_segment_brand');
  } else if (newMode === 'detailed' && globalMode === 'historical') {
    // 過去比較→詳細分析: デフォルトモードに戻す
    setAnalysisMode('segment_x_multi_brand');
  }
  setGlobalMode(newMode);
}, [globalMode, hasValidData, data, dataSources]);
```

### 3. 選択制約の強制

過去比較モードでは、設定に関わらずセグメントとブランドを単一選択（SA）に:

```typescript
// SegmentsSection.tsx & BrandsSection.tsx
const allowMultiple = globalMode === 'historical' ? false : config.allowMultiple;
const badge = globalMode === 'historical' ? 'SA' : (config.allowMultiple ? 'MA' : 'SA');
```

---

## 📊 コンポーネント構造

```
App.tsx
├── useGlobalMode()
├── useMultiDataSource()
└── Sidebar
    ├── GlobalModeTab
    │   └── [詳細分析] [過去比較]
    ├── DataSourceManager (過去比較モードのみ)
    │   ├── データソース一覧
    │   │   ├── 2025年6月 👁️ 編集 削除
    │   │   └── 2024年6月 👁️ 編集 削除
    │   └── [+ ファイル追加 (2/3)]
    ├── 分析モード選択
    │   └── Mode 1-14（モードに応じて切り替え）
    ├── SegmentsSection (SA固定)
    └── BrandsSection (SA固定)
└── ChartArea
    ├── グラフ
    │   └── 系列: データソース名
    └── データテーブル
        ├── 行: データソース
        └── 列: X軸項目
```

---

## 🎨 UI/UX の特徴

### 1. グローバルモードタブ

- 常にアクセス可能（データ読み込み前から操作可能）
- アクティブなタブはインディゴ色でハイライト

### 2. データソース管理

- **目のアイコン**: アクティブ/非アクティブの切り替え
- **鉛筆アイコン**: 名前編集（インライン編集）
- **ゴミ箱アイコン**: 削除
- **追加制限**: 最大3ファイル（"2/3"のように表示）

### 3. 自動命名の例

| ファイル名 | 自動生成される名前 |
|------------|-------------------|
| BFD_202506.xlsx | 2025年6月 |
| BFD_202406.xlsx | 2024年6月 |
| report_2024_12.xlsx | 2024年12月 |
| sample.xlsx | sample |

### 4. バッジ表示

- 過去比較モード時は常に `SA`（Single Analysis）を表示
- 選択肢がドロップダウンに変更される

---

## 📝 ファイル変更一覧

### 新規作成ファイル

1. `src/types/dataSource.ts` - データソース型定義
2. `src/types/globalMode.ts` - グローバルモード型定義
3. `src/hooks/useMultiDataSource.ts` - データソース管理フック
4. `src/hooks/useGlobalMode.ts` - グローバルモード管理フック
5. `components/GlobalModeTab.tsx` - モード切り替えタブ
6. `components/DataSourceManager.tsx` - データソース管理UI
7. `docs/HISTORICAL_MODE1_IMPLEMENTATION_REPORT.md` - 本ドキュメント

### 修正ファイル

1. `src/types/index.ts` - 新しい型のエクスポート
2. `src/types/analysis.ts` - `historical_funnel1_segment_brand`を追加
3. `constants/analysisConfigs.ts` - 過去比較モード設定を追加
4. `utils/dataTransforms.ts` - `transformDataForHistoricalChart`を追加
5. `App.tsx` - グローバルモード統合、データ変換ロジック分岐
6. `components/Sidebar.tsx` - グローバルモードUI統合
7. `components/ChartArea.tsx` - 過去比較モード対応
8. `components/SegmentsSection.tsx` - 過去比較時SA制約
9. `components/BrandsSection.tsx` - 過去比較時SA制約
10. `components/AnalysisItemsSection.tsx` - グローバルモード対応

---

## 🚀 次のモード実装への知見

### Mode 2-14 実装時のチェックリスト

#### 1. 分析モード設定の追加

```typescript
// constants/analysisConfigs.ts
export const HISTORICAL_ANALYSIS_MODE_CONFIGS = {
  // 既存
  'historical_funnel1_segment_brand': { /* ... */ },
  
  // Mode 2を追加
  'historical_funnel2_segment_brand': {
    id: 'historical_funnel2_segment_brand',
    name: 'ファネル分析②（セグメント、ブランド: X=ファネル②×過去比較）',
    axes: {
      items: {
        role: 'X_AXIS',
        itemSet: 'timeline',  // ← ここを変更
        fixedItems: ['T1', 'T2', 'T3', 'T4', 'T5']  // ← ここを変更
      },
      segments: { role: 'FILTER', allowMultiple: false },
      brands: { role: 'FILTER', allowMultiple: false }
    },
    dataTransform: {
      xAxis: 'items',
      series: 'dataSources',
      filter: 'segments'
    }
  }
};

// ORDERに追加
export const HISTORICAL_ANALYSIS_MODE_ORDER = [
  'historical_funnel1_segment_brand',
  'historical_funnel2_segment_brand',  // ← 追加
];
```

#### 2. 型定義に追加

```typescript
// src/types/analysis.ts
export type AnalysisMode =
  | ''
  // 詳細分析モード
  | 'segment_x_multi_brand'
  // ...
  // 過去比較モード
  | 'historical_funnel1_segment_brand'
  | 'historical_funnel2_segment_brand';  // ← 追加
```

#### 3. データ変換ロジックの確認

`transformDataForHistoricalChart`は**既に汎用的**に実装されているため、
`itemSet`が異なるだけであれば追加の変更は不要:

```typescript
// itemSet: 'timeline' でも自動的に対応
const xAxisConfig = config.axes.items;
if (xAxisConfig.role === 'X_AXIS' && xAxisConfig.fixedItems) {
  xAxisKeys = xAxisConfig.fixedItems;  // T1, T2, T3, T4, T5
}
```

#### 4. 特殊なモード（レーダーチャート等）

**ブランドパワー分析やアーキタイプ分析**の場合:

```typescript
// constants/analysisConfigs.ts
'historical_brand_power_segment_brand': {
  // ...
  axes: {
    items: {
      role: 'X_AXIS',
      itemSet: 'brandPower',
      fixedItems: ['BP1', 'BP2', 'BP3', 'BP4']
    },
    // ...
  },
  defaultChartType: 'radar'  // ← レーダーチャート
}
```

`ChartArea.tsx`は既に`chartType`プロパティでレーダーチャートに対応済み。

#### 5. ブランドイメージ分析の特殊対応

**注意**: ブランドイメージ分析（Mode 7-8）は`autoSelect: true`のため、
過去比較モードでの実装には追加の検討が必要:

- X軸の項目が動的（TOP30等）
- 過去比較で項目セットをどう統一するか？

**推奨アプローチ**:
1. 各データソースで共通する項目のみ表示
2. または、最新データの項目セットに統一

---

## 🔄 実装パターンの再利用

### パターン1: グローバルモード分岐

```typescript
// どのコンポーネントでも使える汎用パターン
const currentModeConfigs = useMemo(() => {
  return globalMode === 'historical' 
    ? HISTORICAL_ANALYSIS_MODE_CONFIGS 
    : ANALYSIS_MODE_CONFIGS;
}, [globalMode]);

const config = currentModeConfigs[analysisMode];
if (!config) return null;

// 以降は config を使用
```

### パターン2: 過去比較時の系列取得

```typescript
// ChartArea, DataTable等で使用
const seriesItems = useMemo(() => {
  if (globalMode === 'historical') {
    return dataSources.filter(ds => ds.isActive).map(ds => ds.name);
  }
  
  // 詳細分析モードのロジック
  const config = currentModeConfigs[analysisMode];
  const seriesAxis = config.dataTransform.series;
  switch (seriesAxis) {
    case 'brands': return selectedBrands;
    case 'segments': return selectedSegments;
    default: return [];
  }
}, [globalMode, dataSources, analysisMode, selectedBrands, selectedSegments]);
```

### パターン3: 単一選択の強制

```typescript
// SegmentsSection, BrandsSection で使用
const isHistoricalMode = globalMode === 'historical';
const allowMultiple = isHistoricalMode ? false : config.allowMultiple;
const badge = isHistoricalMode ? 'SA' : (config.allowMultiple ? 'MA' : 'SA');
```

---

## ⚠️ 注意事項とベストプラクティス

### 1. `localStorage`の使用

❌ **NG**:
```typescript
localStorage.setItem('data', JSON.stringify(largeDataObject));
```

✅ **OK**:
```typescript
// メタデータのみ保存
const metadata = { id, name, fileName, uploadedAt, isActive };
localStorage.setItem('metadata', JSON.stringify(metadata));

// 実データはメモリに
const dataRef = useRef(largeDataObject);
```

### 2. オブジェクトのメモ化

❌ **NG**:
```typescript
const config = someCondition ? configA : configB;

useEffect(() => {
  // 毎回実行される（configが毎回新しいオブジェクト）
}, [config]);
```

✅ **OK**:
```typescript
const config = useMemo(() => {
  return someCondition ? configA : configB;
}, [someCondition]);

useEffect(() => {
  // someConditionが変わった時のみ実行される
}, [config]);
```

### 3. グローバルモードのチェック

❌ **NG**:
```typescript
if (analysisMode.startsWith('historical_')) {
  // 文字列パターンマッチは脆弱
}
```

✅ **OK**:
```typescript
if (globalMode === 'historical') {
  // 明示的なモードチェック
}
```

---

## 📈 パフォーマンスの考慮事項

### 1. データソースの数

- **現在の制限**: 最大3ファイル
- **理由**: 
  - UIの視認性（凡例が多すぎると見づらい）
  - メモリ使用量（3ファイル × 70ブランド × 47セグメント）
  - グラフの描画速度

### 2. メモ化の重要性

すべての計算済みデータは`useMemo`でメモ化:
- `chartData`
- `seriesItems`
- `currentModeConfigs`
- `yAxisDomain`

### 3. 再レンダリングの最小化

`useCallback`でコールバック関数をメモ化:
- `getFilterValue`
- `getSeriesValues`
- `getXAxisValues`
- `handleGlobalModeChange`

---

## 🧪 テスト観点

### 機能テスト

- [x] ファイル読み込み（1-3ファイル）
- [x] 自動命名の動作確認
- [x] データソースの編集・削除
- [x] アクティブ/非アクティブ切り替え
- [x] グラフの正しい描画
- [x] データテーブルの正しい表示
- [x] モード切り替えの動作
- [x] セグメント・ブランドのSA制約

### エッジケーステスト

- [x] データソース0件時の表示
- [x] 全データソースを非アクティブにした場合
- [x] 異なる時期のデータ（セグメント・ブランドの差異）
- [x] ファイル名から年月が抽出できない場合
- [ ] 非常に大きなファイル（70ブランド以上）

### ブラウザ互換性

- [x] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## 📚 関連ドキュメント

1. `docs/HISTORICAL_COMPARISON_REQUIREMENTS.md` - 要件定義
2. `docs/HISTORICAL_MODE1_IMPLEMENTATION.md` - 技術仕様
3. `docs/HISTORICAL_COMPARISON_SUMMARY.md` - プロジェクト概要
4. `README.md` - プロジェクト全体のドキュメント

---

## 🎓 学んだ教訓

### 技術的な教訓

1. **データ永続化の戦略**: 大容量データは`localStorage`に保存しない
2. **メモ化の重要性**: useEffectの無限ループを防ぐために必須
3. **型安全性**: TypeScriptの型システムを活用して早期にエラーを検出
4. **段階的な実装**: まずMode 1で基盤を固め、その後Mode 2-14に展開

### 設計的な教訓

1. **設定駆動型アプローチ**: モード設定を外部化することで拡張性を確保
2. **関心の分離**: UI、ロジック、データ管理を明確に分離
3. **再利用可能なパターン**: 共通のパターンを抽出して他のモードに適用可能に

### プロジェクト管理的な教訓

1. **段階的な検証**: 各フェーズで動作確認を行い、問題を早期発見
2. **詳細なドキュメント化**: 実装の経緯と判断を記録することで次の開発を効率化
3. **ユーザーフィードバック**: 実際の使用感を確認しながら調整

---

## 🚧 既知の制約と今後の改善点

### 制約

1. **データソース間のデータ構造の差異**
   - 現在: セグメントやブランドが完全一致することを前提
   - 改善案: データの正規化や欠損値の補完

2. **メモリ使用量**
   - 現在: 全データをメモリに保持
   - 改善案: 使用していないデータソースは遅延ロード

3. **エクスポート機能**
   - 現在: 未実装（Phase 4）
   - 必要な対応: CSV/画像エクスポートの過去比較モード対応

### 今後の拡張性

1. **データソース数の増加**
   - UIの改善（スクロール、ページング）
   - 凡例の最適化

2. **データソースの比較機能**
   - 差分の可視化
   - 変化率の表示

3. **データソースのグループ化**
   - 四半期ごと、年ごとなど

---

## ✅ 完了チェックリスト

- [x] 型定義の作成
- [x] フックの実装
- [x] UIコンポーネントの実装
- [x] グローバルモード切り替えの統合
- [x] データ変換ロジックの実装
- [x] グラフ表示の調整
- [x] データテーブル表示の調整
- [x] エラーハンドリング
- [x] LocalStorage容量問題の解決
- [x] 無限ループ問題の解決
- [x] ドキュメントの作成
- [ ] CSV/画像エクスポート対応（Phase 4）
- [ ] Mode 2-14の実装（今後）

---

## 📞 サポート情報

### トラブルシューティング

**Q: グラフが表示されない**
- データソースがアクティブになっているか確認
- セグメントとブランドが正しく選択されているか確認
- コンソールエラーを確認

**Q: データソースが追加できない**
- すでに3ファイル追加されていないか確認
- ファイル形式が`.xlsx`か確認

**Q: `localStorage`エラーが発生する**
- ブラウザのストレージをクリア
- シークレットモードで試す

---

## 🎉 まとめ

過去比較モードMode 1の実装により、以下を達成しました：

1. ✅ **複数時点のデータ比較機能**の実装
2. ✅ **堅牢なアーキテクチャ**の構築（Mode 2-14への展開可能）
3. ✅ **ユーザーフレンドリーなUI**の提供
4. ✅ **技術的課題の解決**（localStorage容量、無限ループ等）

このMode 1の実装が基盤となり、Mode 2-14の実装は設定追加のみで対応可能な状態になっています。

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-30  
**Author**: AI Assistant  
**Status**: Final

