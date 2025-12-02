# モード13 - アーキタイプ分析（セグメント×ブランド）要件定義書

## 最終更新
2025-11-29

---

## 1. 概要

### 1.1 モード名
**モード13**: アーキタイプ分析（セグメント: X=アーキタイプ×ブランド）

### 1.2 モードID
`archetype_segment_brands`

### 1.3 目的
特定のセグメント内で、複数のブランドの**アーキタイプ指標（12タイプ）**を比較し、ブランドのパーソナリティ特性を評価する。

### 1.4 参照モード
**モード11**（`future_power_segment_brands`）: ブランドパワー分析②（将来性パワー）

### 1.5 モード11との差分
| 項目 | モード11（将来性パワー） | モード13（アーキタイプ） |
|------|---------------------|------------------------|
| **分析指標数** | 6項目（FP1～FP6） | 12項目（12タイプのアーキタイプ） |
| **データ取得元** | AJ～AO列（直接取得） | AP～DE列（68項目から計算） |
| **指標の内容** | 将来性を測定する6指標 | ブランドパーソナリティを12タイプで評価 |
| **計算方法** | Excelから直接読み込み | ブランドイメージ項目の平均値から算出 |
| **分析項目表記** | 「将来性パワー」 | 「アーキタイプ」 |
| **デフォルトチャート** | レーダーチャート | レーダーチャート |

---

## 2. アーキタイプ指標（12タイプ）

### 2.1 アーキタイプ一覧

| No. | アーキタイプ名 | 英名 | 構成項目数 | 特性 |
|-----|--------------|------|-----------|------|
| 1 | 創造者 | Creator | 5 | 新しい価値を創造する |
| 2 | 統治者 | Ruler | 4 | 分野をけん引する |
| 3 | 賢者 | Sage | 5 | 知性と専門性 |
| 4 | 探検家 | Explorer | 5 | 個性とチャレンジ精神 |
| 5 | 幼子 | Innocent | 5 | 誠実さとピュアさ |
| 6 | 無法者 | Outlaw | 4 | 革新と大胆さ |
| 7 | 魔術師 | Magician | 5 | 革新と夢 |
| 8 | 英雄 | Hero | 5 | 期待と力強さ |
| 9 | 恋人 | Lover | 3 | 感性と魅力 |
| 10 | 道化師 | Jester | 5 | 楽しさと活気 |
| 11 | 仲間 | Regular Guy/Gal | 4 | 親しみやすさ |
| 12 | 援助者 | Caregiver | 5 | 安心と信頼 |

### 2.2 計算方法

各アーキタイプの値は、対応するブランドイメージ項目の**平均値**として算出されます。

```
アーキタイプ値 = Σ(対応項目の値) / 対応項目数
```

**例: 創造者（Creator）の計算**

あるブランドのあるセグメントにおいて：
- 新しい価値を提案する = 2.5
- 先見性のある = 1.5
- 独創性がある = 1.6
- 知的な = 0.3
- 信念・ポリシーのある = 0.9

```
創造者 = (2.5 + 1.5 + 1.6 + 0.3 + 0.9) / 5 = 1.36
```

---

## 3. 分析モード詳細

### 3.1 主な用途
- ブランドパーソナリティの12次元評価
- 競合ブランドとのパーソナリティ比較
- ブランドの特徴的な性格の可視化
- ブランドポジショニングの明確化
- リブランディング戦略の方向性決定

### 3.2 分析軸の構成
- **X軸**: アーキタイプ指標（固定12項目：創造者、統治者、賢者、探検家、幼子、無法者、魔術師、英雄、恋人、道化師、仲間、援助者）
- **データ系列**: 選択した複数のブランド
- **フィルタ**: セグメント（単一選択）

### 3.3 UI要素
- **分析項目セクション**: 【固定】バッジ表示、UI非表示（12指標は固定のため）
- **セグメントセクション**: 【SA】バッジ表示、ドロップダウン選択
- **ブランドセクション**: 【MA】バッジ表示、複数選択リスト + ドラッグ＆ドロップ

### 3.4 デフォルトチャートタイプ
**レーダーチャート**

**理由**:
- 12指標の総合的なバランスを一目で把握できる
- 複数ブランドのパーソナリティ比較が容易
- ブランドの特徴的な形状として直感的に理解しやすい

---

## 4. データ要件

### 4.1 Excelファイルのフォーマット

#### 必要な列
- **データソース**: AP列～DE列（列インデックス41～108）
- **項目数**: 68項目（ブランドイメージ項目の前半部分）
- **計算方法**: アーキタイプ定義に基づき、該当する項目の平均値を算出

#### Excel列インデックスの対応表
```
A列 = 0
B列 = 1
C列 = 2
D列 = 3  ← ブランド名
...
AP列 = 41 (ブランドイメージ項目1) ★ アーキタイプ計算範囲開始
AQ列 = 42 (ブランドイメージ項目2) ★
...
DE列 = 108 (ブランドイメージ項目68) ★ アーキタイプ計算範囲終了
```

#### データ形式
- **ヘッダー行**: 3行目
- **データ開始**: 4行目以降
- **データ型**: 数値（パーセンテージ）
- **欠損値処理**: 「-」または空白は自動的に0として処理

---

## 5. 技術仕様

### 5.1 型定義（types.ts への追加）

```typescript
// Archetype Metrics for Archetype Analysis
export interface ArchetypeMetrics {
  creator: number;      // 創造者
  ruler: number;        // 統治者
  sage: number;         // 賢者
  explorer: number;     // 探検家
  innocent: number;     // 幼子
  outlaw: number;       // 無法者
  magician: number;     // 魔術師
  hero: number;         // 英雄
  lover: number;        // 恋人
  jester: number;       // 道化師
  regular: number;      // 仲間
  caregiver: number;    // 援助者
}

// Combined metrics type
export type AllMetrics = FunnelMetrics & TimelineMetrics & BrandPowerMetrics & FuturePowerMetrics & {
  archetypeMetrics?: ArchetypeMetrics;
};

export const ARCHETYPE_LABELS: { [key in keyof ArchetypeMetrics]: string } = {
  creator: '創造者',
  ruler: '統治者',
  sage: '賢者',
  explorer: '探検家',
  innocent: '幼子',
  outlaw: '無法者',
  magician: '魔術師',
  hero: '英雄',
  lover: '恋人',
  jester: '道化師',
  regular: '仲間',
  caregiver: '援助者'
};

export const ARCHETYPE_KEYS: (keyof ArchetypeMetrics)[] = [
  'creator', 'ruler', 'sage', 'explorer',
  'innocent', 'outlaw', 'magician', 'hero',
  'lover', 'jester', 'regular', 'caregiver'
];

// Update ItemSet type
export type ItemSet = 'funnel' | 'funnel2' | 'timeline' | 'brandImage' | 'brandPower' | 'futurePower' | 'archetype' | 'custom';

// Add to AnalysisMode type
export type AnalysisMode =
  | 'segment_x_multi_brand'
  | 'brand_x_multi_segment'
  | 'item_x_multi_brand'
  | 'timeline_brand_multi_segment'
  | 'timeline_segment_multi_brand'
  | 'timeline_item_multi_brand'
  | 'brand_image_segment_brands'
  | 'brand_analysis_segment_comparison'
  | 'brand_power_segment_brands'
  | 'brand_power_brand_segments'
  | 'future_power_segment_brands'
  | 'future_power_brand_segments'
  | 'archetype_segment_brands';  // 追加
```

### 5.2 モード設定（constants/analysisConfigs.ts への追加）

```typescript
'archetype_segment_brands': {
  id: 'archetype_segment_brands',
  name: 'アーキタイプ分析（セグメント: X=アーキタイプ×ブランド）',
  description: '単一セグメントにおける複数ブランドのアーキタイプ指標を比較',
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
      ]
    },
    segments: {
      role: 'FILTER',
      label: 'セグメント',
      allowMultiple: false
    },
    brands: {
      role: 'SERIES',
      label: 'ブランド',
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

### 5.3 アーキタイプ計算処理（utils/archetypeCalculator.ts）

```typescript
import { ArchetypeMetrics } from '../types/metrics';
import { ARCHETYPE_DEFINITIONS } from '../constants/archetypeConfigs';

/**
 * ブランドイメージメトリクスからアーキタイプメトリクスを計算
 */
export function calculateArchetypeMetrics(
  imageMetrics: Record<string, number>
): ArchetypeMetrics {
  const archetypeMetrics: ArchetypeMetrics = {
    creator: 0, ruler: 0, sage: 0, explorer: 0,
    innocent: 0, outlaw: 0, magician: 0, hero: 0,
    lover: 0, jester: 0, regular: 0, caregiver: 0
  };

  Object.keys(ARCHETYPE_DEFINITIONS).forEach(archetypeKey => {
    const definition = ARCHETYPE_DEFINITIONS[archetypeKey];
    const values: number[] = [];

    definition.items.forEach(itemName => {
      const value = imageMetrics[itemName];
      if (value !== undefined && value !== null && !isNaN(value)) {
        values.push(value);
      }
    });

    if (values.length > 0) {
      const sum = values.reduce((acc, val) => acc + val, 0);
      archetypeMetrics[archetypeKey as keyof ArchetypeMetrics] = sum / values.length;
    }
  });

  return archetypeMetrics;
}
```

### 5.4 データパース処理への統合（ExcelParser.ts）

```typescript
import { calculateArchetypeMetrics } from '../../utils/archetypeCalculator';

// parseSheet() メソッド内
for (let i = EXCEL_STRUCTURE.DATA_START_INDEX; i < jsonData.length; i++) {
  const row = jsonData[i];
  const brandName = row[EXCEL_STRUCTURE.BRAND_NAME_COLUMN];

  if (!brandName || typeof brandName !== 'string') continue;

  // メトリクスの読み込み
  const metrics = this.extractMetrics(row, columnMapping);

  // ブランドイメージの読み込み
  const imageValues = this.extractBrandImageValues(row, brandImageItems);
  brandImages[brandName] = imageValues;

  // アーキタイプメトリクスの計算
  const archetypeMetrics = calculateArchetypeMetrics(imageValues);
  metrics.archetypeMetrics = archetypeMetrics;

  brands[brandName] = metrics;
}
```

---

## 6. 使用例

### シナリオ1: ブランドパーソナリティの評価

**目的**: 「全体」セグメントで自社ブランドのパーソナリティを評価

**手順**:
1. モード13「アーキタイプ分析（セグメント×ブランド）」を選択
2. セグメント「全体」を選択
3. 自社ブランドを選択
4. レーダーチャートで12タイプのバランスを確認

**分析ポイント**:
- どのアーキタイプが強いか？
- ブランドの特徴的なパーソナリティは何か？
- 弱いアーキタイプは何か？

### シナリオ2: 競合ブランドとのパーソナリティ比較

**目的**: 自社ブランドと競合のパーソナリティの違いを把握

**手順**:
1. モード13を選択
2. セグメント「全体」を選択
3. ブランド「自社ブランド」「競合A」「競合B」を選択
4. レーダーチャートで比較

**分析ポイント**:
- 競合とのパーソナリティの違いは？
- 差別化できているアーキタイプは？
- 競合に負けているアーキタイプは？

---

## 7. まとめ

### 7.1 主な特徴
- **12タイプのアーキタイプ**: 包括的なブランドパーソナリティ評価
- **自動計算**: ブランドイメージ項目から自動的に算出
- **視覚的な比較**: レーダーチャートで直感的に理解
- **競合比較**: 複数ブランドの同時比較が可能

### 7.2 モード11との違い
| 観点 | モード11（将来性パワー） | モード13（アーキタイプ） |
|------|---------------------|------------------------|
| **評価対象** | 将来の成長ポテンシャル | ブランドパーソナリティ |
| **指標数** | 6項目 | 12タイプ |
| **データ源** | 直接読み込み | ブランドイメージから計算 |
| **主な用途** | 戦略立案、将来予測 | ポジショニング、差別化戦略 |

---

**文書ステータス**: 要件定義完了  
**作成日**: 2025-11-29  
**バージョン**: 1.0  
**次のステップ**: 実装完了、動作確認

