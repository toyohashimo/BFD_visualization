# モード11 - ブランドパワー分析②（将来性パワー）要件定義書

## 最終更新
2025-11-29

---

## 1. 概要

### 1.1 モード名
**モード11**: ブランドパワー分析②（セグメント: X=将来性パワー×ブランド）

### 1.2 モードID
`future_power_segment_brands`

### 1.3 目的
特定のセグメント内で、複数のブランドの**将来性パワー指標（FP1-FP6）**を比較し、ブランドの将来的な成長ポテンシャルを評価する。

### 1.4 参照モード
**モード9**（`brand_power_segment_brands`）: ブランドパワー分析①（現在パワー）

### 1.5 モード9との差分
| 項目 | モード9（現在パワー） | モード11（将来性パワー） |
|------|---------------------|------------------------|
| **分析指標数** | 4項目（BP1～BP4） | 6項目（FP1～FP6） |
| **Excel取得元** | AF～AI列（4列） | AJ～AO列（6列） |
| **指標の内容** | 現在の状態を測定（詳細認知、知覚品質、ロイヤリティ、話題性） | 将来性を測定（目的意識、社会との向き合い、顧客理解力、双方向コミュニケーション、技術開発力、自己実現サポート） |
| **分析項目表記** | 「現在パワー」 | 「将来性パワー」 |
| **デフォルトチャート** | レーダーチャート | レーダーチャート |

---

## 2. 将来性パワー指標（FP1-FP6）

### FP1: 目的意識
- **定義**: ブランドが明確なビジョンや目的を持っているか
- **評価内容**: ブランドの存在意義、社会的使命の明確さ
- **マーケティング的意義**: ブランドアイデンティティの核心を測定

### FP2: 社会との向き合い
- **定義**: 社会課題への取り組み姿勢
- **評価内容**: サステナビリティ、社会貢献活動への積極性
- **マーケティング的意義**: 社会的価値への共感を測定

### FP3: 顧客理解力
- **定義**: 顧客ニーズの理解度
- **評価内容**: 顧客志向、ニーズへの適応力
- **マーケティング的意義**: 顧客中心主義の浸透度を測定

### FP4: 双方向コミュニケーション
- **定義**: 顧客との対話姿勢
- **評価内容**: コミュニティ形成、顧客の声への対応
- **マーケティング的意義**: 顧客エンゲージメントの質を測定

### FP5: 技術開発力
- **定義**: イノベーション創出力
- **評価内容**: 新技術開発、製品革新への取り組み
- **マーケティング的意義**: 競争優位性の源泉を測定

### FP6: 自己実現サポート
- **定義**: 顧客の成長支援度
- **評価内容**: 顧客の自己実現や成長をサポートする姿勢
- **マーケティング的意義**: 顧客との長期的な関係構築力を測定

---

## 3. 分析モード詳細

### 3.1 主な用途
- ブランドの将来性を6次元で評価
- 長期的なブランド戦略の方向性確認
- 将来的な成長ポテンシャルの可視化
- サステナビリティ・イノベーション関連の強み・弱みの把握
- 次世代顧客に向けたブランド力の評価

### 3.2 分析軸の構成
- **X軸**: 将来性パワー指標（固定6項目：FP1～FP6）
- **データ系列**: 選択した複数のブランド
- **フィルタ**: セグメント（単一選択）

### 3.3 UI要素
- **分析項目セクション**: 【固定】バッジ表示、UI非表示（6指標は固定のため）
- **セグメントセクション**: 【SA】バッジ表示、ドロップダウン選択
- **ブランドセクション**: 【MA】バッジ表示、複数選択リスト + ドラッグ＆ドロップ

### 3.4 デフォルトチャートタイプ
**レーダーチャート**

**理由**:
- 6指標の総合的なバランスを一目で把握できる
- 複数ブランドの比較が容易
- 将来性の方向性を視覚的に理解しやすい

---

## 4. データ要件

### 4.1 Excelファイルのフォーマット

#### 必要な列
| 列 | 列番号（0-based） | Excel列 | ヘッダー名 | 内部キー | 説明 |
|----|-----------------|---------|-----------|---------|------|
| ブランド名 | 3 | D | (任意) | - | ブランド識別子 |
| 目的意識 | 35 | AJ | 目的意識 | FP1 | 将来性パワー指標1 |
| 社会との向き合い | 36 | AK | 社会との向き合い | FP2 | 将来性パワー指標2 |
| 顧客理解力 | 37 | AL | 顧客理解力 | FP3 | 将来性パワー指標3 |
| 双方向コミュニケーション | 38 | AM | 双方向コミュニケーション | FP4 | 将来性パワー指標4 |
| 技術開発力 | 39 | AN | 技術開発力 | FP5 | 将来性パワー指標5 |
| 自己実現サポート | 40 | AO | 自己実現サポート | FP6 | 将来性パワー指標6 |

#### データ形式
- **ヘッダー行**: 3行目
- **データ開始**: 4行目以降
- **データ型**: 数値（パーセンテージ）
- **欠損値処理**: 「-」または空白は自動的に0として処理

### 4.2 Excel列インデックスの対応表
```
A列 = 0
B列 = 1
C列 = 2
D列 = 3  ← ブランド名
...
AF列 = 31 (BP1: 詳細認知)
AG列 = 32 (BP2: 知覚品質)
AH列 = 33 (BP3: ロイヤリティ)
AI列 = 34 (BP4: 話題性)
AJ列 = 35 (FP1: 目的意識) ★
AK列 = 36 (FP2: 社会との向き合い) ★
AL列 = 37 (FP3: 顧客理解力) ★
AM列 = 38 (FP4: 双方向コミュニケーション) ★
AN列 = 39 (FP5: 技術開発力) ★
AO列 = 40 (FP6: 自己実現サポート) ★
```

---

## 5. 技術仕様

### 5.1 型定義（types.ts への追加）

```typescript
// Future Power Metrics for Future Brand Power Analysis
export interface FuturePowerMetrics {
  FP1: number;  // 目的意識
  FP2: number;  // 社会との向き合い
  FP3: number;  // 顧客理解力
  FP4: number;  // 双方向コミュニケーション
  FP5: number;  // 技術開発力
  FP6: number;  // 自己実現サポート
}

// Combined metrics type (funnel, timeline, brand power, and future power)
export type AllMetrics = FunnelMetrics & TimelineMetrics & BrandPowerMetrics & FuturePowerMetrics;

export const FUTURE_POWER_LABELS: { [key in keyof FuturePowerMetrics]: string } = {
  FP1: '目的意識',
  FP2: '社会との向き合い',
  FP3: '顧客理解力',
  FP4: '双方向コミュニケーション',
  FP5: '技術開発力',
  FP6: '自己実現サポート'
};

export const FUTURE_POWER_KEYS: (keyof FuturePowerMetrics)[] = ['FP1', 'FP2', 'FP3', 'FP4', 'FP5', 'FP6'];

// Add to AnalysisMode type
export type AnalysisMode =
  | 'funnel_segment_brands'
  | 'funnel_brand_segments'
  | 'funnel_item_segments_brands'
  | 'timeline_brand_segments'
  | 'timeline_segment_brands'
  | 'timeline_item_segments_brands'
  | 'brand_image_segment_brands'
  | 'brand_image_brand_segments'
  | 'brand_power_segment_brands'
  | 'brand_power_brand_segments'
  | 'future_power_segment_brands';  // 追加

// Update helper function
export function getItemKeysForSet(itemSet?: ItemSet): string[] {
  if (itemSet === 'timeline') return TIMELINE_KEYS;
  if (itemSet === 'brandPower') return BRAND_POWER_KEYS;
  if (itemSet === 'futurePower') return FUTURE_POWER_KEYS;  // 追加
  return METRIC_KEYS; // default to funnel
}

export function getItemLabelsForSet(itemSet?: ItemSet): Record<string, string> {
  if (itemSet === 'timeline') return TIMELINE_LABELS;
  if (itemSet === 'brandPower') return BRAND_POWER_LABELS;
  if (itemSet === 'futurePower') return FUTURE_POWER_LABELS;  // 追加
  return METRIC_LABELS; // default to funnel
}

// Update ItemSet type
export type ItemSet = 'funnel' | 'funnel2' | 'timeline' | 'brandImage' | 'brandPower' | 'futurePower' | 'custom';
```

### 5.2 モード設定（constants/analysisConfigs.ts への追加）

```typescript
'future_power_segment_brands': {
  id: 'future_power_segment_brands',
  name: 'ブランドパワー分析②（セグメント: X=将来性パワー×ブランド）',
  description: '単一セグメントにおける複数ブランドの将来性パワー指標を比較',
  axes: {
    items: {
      role: 'X_AXIS',
      label: '分析項目',
      allowMultiple: false,
      itemSet: 'futurePower',
      fixedItems: ['FP1', 'FP2', 'FP3', 'FP4', 'FP5', 'FP6']
    },
    segments: {
      role: 'FILTER',
      label: 'データシート',
      allowMultiple: false
    },
    brands: {
      role: 'SERIES',
      label: 'ブランド比較',
      allowMultiple: true
    }
  },
  dataTransform: {
    xAxis: 'items',
    series: 'brands',
    filter: 'segments'
  },
  defaultChartType: 'radar'
}
```

### 5.3 データパース処理（App.tsx への追加）

```typescript
// Column map for future power metrics
const futurePowerColMap: { [key in keyof FuturePowerMetrics]?: number } = {};
const futurePowerLabels: { [key in keyof FuturePowerMetrics]: string } = {
  FP1: '目的意識',
  FP2: '社会との向き合い',
  FP3: '顧客理解力',
  FP4: '双方向コミュニケーション',
  FP5: '技術開発力',
  FP6: '自己実現サポート'
};

// Map headers to columns (in header parsing loop)
(Object.keys(futurePowerLabels) as (keyof FuturePowerMetrics)[]).forEach(key => {
  if (headerStr === futurePowerLabels[key]) {
    futurePowerColMap[key] = idx;
  }
});

// Initialize metrics in data row processing
const metrics: AllMetrics = {
  FT: 0, FW: 0, FZ: 0, GC: 0, GJ: 0, GL: 0,
  T1: 0, T2: 0, T3: 0, T4: 0, T5: 0,
  BP1: 0, BP2: 0, BP3: 0, BP4: 0,
  FP1: 0, FP2: 0, FP3: 0, FP4: 0, FP5: 0, FP6: 0
};

// Read future power metrics
(Object.keys(futurePowerLabels) as (keyof FuturePowerMetrics)[]).forEach(key => {
  const colIdx = futurePowerColMap[key];
  if (colIdx !== undefined) {
    let val = row[colIdx];
    if (val === '-' || val === undefined || val === null) val = 0;
    metrics[key] = typeof val === 'number' ? val : parseFloat(val) || 0;
  }
});
```

---

## 6. 実装ステップ

### Phase 1: 型定義の拡張
1. `types.ts` に `FuturePowerMetrics` インターフェースを追加
2. `AllMetrics` 型を更新（FuturePowerMetrics を含める）
3. `FUTURE_POWER_LABELS` と `FUTURE_POWER_KEYS` を追加
4. `ItemSet` 型に `'futurePower'` を追加
5. `AnalysisMode` 型に `'future_power_segment_brands'` を追加
6. ヘルパー関数 `getItemKeysForSet` と `getItemLabelsForSet` を更新

### Phase 2: モード設定の追加
1. `constants/analysisConfigs.ts` に新モード設定を追加
2. `ANALYSIS_MODE_ORDER` 配列に `'future_power_segment_brands'` を追加

### Phase 3: データパース処理の追加
1. `App.tsx` の `parseExcelData` 関数を更新
   - `futurePowerColMap` の定義を追加
   - `futurePowerLabels` の定義を追加
   - ヘッダー解析ループに将来性パワー指標の検出ロジックを追加
   - データ行処理で将来性パワーメトリクスの読み込みを追加
2. `AllMetrics` の初期化に FP1～FP6 を含める

### Phase 4: 状態管理の更新
1. `App.tsx` の `analysisMode` の初期値チェックに新モードを追加
2. LocalStorage の読み込み処理に新モードを追加

### Phase 5: テストとドキュメント
1. サンプルExcelファイルに将来性パワーデータが含まれているか確認
2. 動作確認
   - データ読み込み
   - レーダーチャート表示
   - 複数ブランド比較
3. ドキュメント更新
   - README.md にモード11の説明を追加
   - CHANGELOG.md に変更履歴を記載

---

## 7. 使用例

### シナリオ1: 将来性評価による戦略立案

**目的**: 「全体」セグメントで自社ブランドの将来的な成長ポテンシャルを評価

**手順**:
1. モード11「ブランドパワー分析②（将来性パワー）」を選択
2. セグメント「全体」を選択
3. 自社ブランドと競合ブランドを選択
4. レーダーチャートで6指標のバランスを確認

**分析ポイント**:
- 将来性の観点でどの指標が強いか？
- 競合と比較して弱い指標はどれか？
- サステナビリティや顧客エンゲージメントの評価はどうか？

### シナリオ2: 現在パワーと将来性パワーの比較

**目的**: ブランドの「現在の強さ」と「将来性」のギャップを可視化

**手順**:
1. モード9で現在パワー（BP1～BP4）を確認
2. モード11で将来性パワー（FP1～FP6）を確認
3. 両方のレーダーチャート形状を比較

**分析ポイント**:
- 現在は強いが将来性に課題があるか？
- 将来性は高いが現在の認知が低いか？
- バランスの取れた成長戦略が必要か？

---

## 8. 注意事項

### 8.1 データの解釈
1. **6指標の総合的なバランスが重要**
   - すべての指標が高いのが理想だが、優先順位を明確にする
   - 極端に弱い指標がある場合は重点的に対策が必要

2. **現在パワーとの違い**
   - 現在パワー（BP1～BP4）は「今の状態」を測定
   - 将来性パワー（FP1～FP6）は「将来の可能性」を測定
   - 両方を組み合わせた評価が効果的

3. **時間軸の考慮**
   - 将来性パワーは長期的な視点での評価
   - 短期的な施策効果は現在パワーで測定

### 8.2 レーダーチャートの読み方
- **大きな形**: 総合的に将来性が高い
- **いびつな形**: 特定の指標に偏りがある
- **均整の取れた形**: バランスの良い将来性

---

## 9. 今後の拡張可能性

### 追加検討事項
1. **モード12候補: ブランド×複数セグメント（将来性パワー）**
   - 1つのブランドを複数セグメント間で比較
   - セグメント別の将来性評価

2. **現在パワーと将来性パワーの統合ビュー**
   - 両方の指標を同時に表示する複合モード
   - 2軸のマトリクスビューでの評価

3. **時系列での将来性パワー推移**
   - 過去データとの比較機能
   - 将来性の変化をトラッキング

---

## 10. まとめ

モード11「ブランドパワー分析②（将来性パワー）」は、ブランドの将来的な成長ポテンシャルを6つの重要な指標で評価するモードです。

### 主な特徴
- **6次元評価**: 目的意識、社会との向き合い、顧客理解力、双方向コミュニケーション、技術開発力、自己実現サポート
- **レーダーチャート**: 総合的なバランスを視覚的に把握
- **長期視点**: 将来的な競争力の源泉を評価
- **モード9との補完関係**: 現在と将来の両方を評価可能

### モード9との使い分け
| 観点 | モード9（現在パワー） | モード11（将来性パワー） |
|------|---------------------|------------------------|
| **評価対象** | 今のブランド力 | 将来の成長ポテンシャル |
| **施策の時間軸** | 短期～中期 | 中期～長期 |
| **重視する側面** | 認知・品質・忠誠度 | イノベーション・社会性・顧客関係 |
| **主な用途** | 現状把握、競合比較 | 戦略立案、将来予測 |

このモードを活用することで、ブランド戦略において「現在の強さ」だけでなく「将来への備え」も評価できるようになります。

