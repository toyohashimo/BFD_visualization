# アーキタイプ分析機能 要件定義書

## 最終更新
2025-11-29

---

## 1. 概要

### 1.1 機能名
**アーキタイプ分析機能**（Archetype Analysis）

### 1.2 目的
ブランドイメージ項目から12タイプのアーキタイプ値を算出し、ブランドの性格や特性を可視化する。

### 1.3 アーキタイプとは
アーキタイプは、ブランドのパーソナリティを12の原型（Archetype）に分類する手法です。各アーキタイプは特定のブランドイメージ項目の平均値として計算されます。

### 1.4 活用シーン
- ブランドパーソナリティの定量的評価
- ブランドアイデンティティの可視化
- 競合ブランドとのパーソナリティ比較
- セグメント別のブランド認識の違いの把握
- リブランディング戦略の方向性決定

---

## 2. 12タイプのアーキタイプ定義

### 2.1 アーキタイプ一覧

| No. | アーキタイプ名 | 英名 | 特性 |
|-----|--------------|------|------|
| 1 | 創造者 | Creator | 新しい価値を創造する |
| 2 | 統治者 | Ruler | 分野をけん引する |
| 3 | 賢者 | Sage | 知性と専門性 |
| 4 | 探検家 | Explorer | 個性とチャレンジ精神 |
| 5 | 幼子 | Innocent | 誠実さとピュアさ |
| 6 | 無法者 | Outlaw | 革新と大胆さ |
| 7 | 魔術師 | Magician | 革新と夢 |
| 8 | 英雄 | Hero | 期待と力強さ |
| 9 | 恋人 | Lover | 感性と魅力 |
| 10 | 道化師 | Jester | 楽しさと活気 |
| 11 | 仲間 | Regular Guy/Gal | 親しみやすさ |
| 12 | 援助者 | Caregiver | 安心と信頼 |

### 2.2 各アーキタイプの構成項目

#### 1. 創造者（Creator）
- 新しい価値を提案する
- 先見性のある
- 独創性がある
- 知的な
- 信念・ポリシーのある

#### 2. 統治者（Ruler）
- その分野をけん引している
- 社会的責任感のある
- 伝統的な
- 一流である

**注**: 統治者は4項目（他のアーキタイプは5項目）

#### 3. 賢者（Sage）
- 進歩的な
- 先見性のある
- 商品、サービスの質がよい
- 知的な
- 専門性がある

#### 4. 探検家（Explorer）
- 個性的な
- 人々をワクワクさせる
- チャレンジ精神のある
- 信念・ポリシーのある
- 大胆な

#### 5. 幼子（Innocent）
- 誠実な
- 親切な
- わかりやすい
- シンプルな
- ピュアな

#### 6. 無法者（Outlaw）
- 革新的な
- たくましい・力強い
- チャレンジ精神のある
- 大胆な

**注**: 無法者は4項目

#### 7. 魔術師（Magician）
- 現代的な
- 革新的な
- 人々をワクワクさせる
- 夢のある
- 知的な

#### 8. 英雄（Hero）
- 期待されている
- 革新的な
- 人々をワクワクさせる
- 力をもらえる
- 高性能な

#### 9. 恋人（Lover）
- 感性に訴える
- 華やかな
- 魅力的な

**注**: 恋人は3項目

#### 10. 道化師（Jester）
- 楽しい
- 革新的な
- 人々をワクワクさせる
- 活気がある
- 大胆な

#### 11. 仲間（Regular Guy/Gal）
- 気楽に接することができる
- 社交的な
- 親切な
- 庶民的な

**注**: 仲間は4項目

#### 12. 援助者（Caregiver）
- 生活をよりよくしてくれる
- 安心・信頼できる
- 誠実な
- 親切な
- 消費者のことを考えている

---

## 3. データソースと計算方法

### 3.1 データソース

#### 3.1.1 Excel列範囲
- **使用範囲**: AP列～DE列（列インデックス41～108）
- **項目数**: 前半68項目（ブランドイメージ項目全133項目の前半部分）
- **元データ**: モード7、8で使用するブランドイメージ項目（AP列～FS列、列インデックス41～174）の前半部分

#### 3.1.2 Excel列インデックスの対応表
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
...
FS列 = 174 (ブランドイメージ項目134)
```

**計算方法の参考**:
- 1文字列: A=0, B=1, ..., Z=25
- 2文字列: 最初の文字×26 + 2文字目 + 26
  - AP = (0+1)×26 + 15 = 41
  - DE = (3+1)×26 + 4 = 108
  - FS = (5+1)×26 + 18 = 174

### 3.2 計算式

#### 3.2.1 基本計算式
各アーキタイプの値は、対応するイメージ項目の**平均値**として算出されます。

```
アーキタイプ値 = Σ(対応項目の値) / 対応項目数
```

#### 3.2.2 計算例

**例: 創造者（Creator）の計算**

あるブランドのあるセグメントにおいて：
- 新しい価値を提案する = 2.5
- 先見性のある = 1.5
- 独創性がある = 1.6
- 知的な = 0.3
- 信念・ポリシーのある = 0.9

```
創造者 = (2.5 + 1.5 + 1.6 + 0.3 + 0.9) / 5
      = 6.8 / 5
      = 1.36
```

### 3.3 欠損値の処理
- **「-」または空白**: 0として扱う
- **未定義項目**: 0として扱う
- **項目が存在しない場合**: そのアーキタイプは計算不可（0または除外）

---

## 4. データ構造

### 4.1 型定義（types.ts への追加）

```typescript
/**
 * アーキタイプの種類
 */
export type ArchetypeType = 
  | 'creator'      // 創造者
  | 'ruler'        // 統治者
  | 'sage'         // 賢者
  | 'explorer'     // 探検家
  | 'innocent'     // 幼子
  | 'outlaw'       // 無法者
  | 'magician'     // 魔術師
  | 'hero'         // 英雄
  | 'lover'        // 恋人
  | 'jester'       // 道化師
  | 'regular'      // 仲間
  | 'caregiver';   // 援助者

/**
 * アーキタイプメトリクス
 */
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

/**
 * アーキタイプの定義情報
 */
export interface ArchetypeDefinition {
  id: ArchetypeType;
  name: string;
  englishName: string;
  items: string[];  // 対応するブランドイメージ項目名
  description: string;
}

/**
 * ItemSet にアーキタイプを追加
 */
export type ItemSet = 
  | 'funnel' 
  | 'funnel2' 
  | 'timeline' 
  | 'brandImage'
  | 'brandPower' 
  | 'futurePower' 
  | 'archetype'  // 追加
  | 'custom';
```

### 4.2 メトリクスデータへの追加（metrics.ts への追加）

```typescript
import { ArchetypeMetrics } from './data';

/**
 * 全メトリクス（アーキタイプを追加）
 */
export interface AllMetrics {
  // 既存のメトリクス
  FT: number;
  FW: number;
  FZ: number;
  GC: number;
  GJ: number;
  GL: number;
  
  // 時系列メトリクス
  T1?: number;
  T2?: number;
  T3?: number;
  T4?: number;
  T5?: number;
  
  // ブランドイメージメトリクス
  imageMetrics?: Record<string, number>;
  
  // ブランドパワーメトリクス
  BP1?: number;
  BP2?: number;
  BP3?: number;
  BP4?: number;
  
  // 将来性パワーメトリクス
  FP1?: number;
  FP2?: number;
  FP3?: number;
  FP4?: number;
  FP5?: number;
  FP6?: number;
  
  // アーキタイプメトリクス（追加）
  archetypeMetrics?: ArchetypeMetrics;
}
```

---

## 5. アーキタイプ定義設定

### 5.1 定数定義（constants/archetypeConfigs.ts）

新しいファイル `constants/archetypeConfigs.ts` を作成します。

```typescript
import { ArchetypeDefinition } from '../types/data';

/**
 * アーキタイプ定義
 */
export const ARCHETYPE_DEFINITIONS: Record<string, ArchetypeDefinition> = {
  creator: {
    id: 'creator',
    name: '創造者',
    englishName: 'Creator',
    items: [
      '新しい価値を提案する',
      '先見性のある',
      '独創性がある',
      '知的な',
      '信念・ポリシーのある'
    ],
    description: '新しい価値を創造し、革新的なアイデアを提供する'
  },
  ruler: {
    id: 'ruler',
    name: '統治者',
    englishName: 'Ruler',
    items: [
      'その分野をけん引している',
      '社会的責任感のある',
      '伝統的な',
      '一流である'
    ],
    description: 'その分野をリードし、権威と信頼を持つ'
  },
  sage: {
    id: 'sage',
    name: '賢者',
    englishName: 'Sage',
    items: [
      '進歩的な',
      '先見性のある',
      '商品、サービスの質がよい',
      '知的な',
      '専門性がある'
    ],
    description: '知識と専門性を持ち、真実を追求する'
  },
  explorer: {
    id: 'explorer',
    name: '探検家',
    englishName: 'Explorer',
    items: [
      '個性的な',
      '人々をワクワクさせる',
      'チャレンジ精神のある',
      '信念・ポリシーのある',
      '大胆な'
    ],
    description: '新しい体験を求め、自由と冒険を重視する'
  },
  innocent: {
    id: 'innocent',
    name: '幼子',
    englishName: 'Innocent',
    items: [
      '誠実な',
      '親切な',
      'わかりやすい',
      'シンプルな',
      'ピュアな'
    ],
    description: '純粋で誠実、シンプルさと信頼を大切にする'
  },
  outlaw: {
    id: 'outlaw',
    name: '無法者',
    englishName: 'Outlaw',
    items: [
      '革新的な',
      'たくましい・力強い',
      'チャレンジ精神のある',
      '大胆な'
    ],
    description: '既存の枠を破り、革新的な変化をもたらす'
  },
  magician: {
    id: 'magician',
    name: '魔術師',
    englishName: 'Magician',
    items: [
      '現代的な',
      '革新的な',
      '人々をワクワクさせる',
      '夢のある',
      '知的な'
    ],
    description: '夢を現実にし、特別な体験を創造する'
  },
  hero: {
    id: 'hero',
    name: '英雄',
    englishName: 'Hero',
    items: [
      '期待されている',
      '革新的な',
      '人々をワクワクさせる',
      '力をもらえる',
      '高性能な'
    ],
    description: '困難を乗り越え、勇気と力を与える'
  },
  lover: {
    id: 'lover',
    name: '恋人',
    englishName: 'Lover',
    items: [
      '感性に訴える',
      '華やかな',
      '魅力的な'
    ],
    description: '美と魅力を追求し、感性に訴える'
  },
  jester: {
    id: 'jester',
    name: '道化師',
    englishName: 'Jester',
    items: [
      '楽しい',
      '革新的な',
      '人々をワクワクさせる',
      '活気がある',
      '大胆な'
    ],
    description: '楽しさと喜びをもたらし、人生を楽しむ'
  },
  regular: {
    id: 'regular',
    name: '仲間',
    englishName: 'Regular Guy/Gal',
    items: [
      '気楽に接することができる',
      '社交的な',
      '親切な',
      '庶民的な'
    ],
    description: '親しみやすく、身近な存在として共感を得る'
  },
  caregiver: {
    id: 'caregiver',
    name: '援助者',
    englishName: 'Caregiver',
    items: [
      '生活をよりよくしてくれる',
      '安心・信頼できる',
      '誠実な',
      '親切な',
      '消費者のことを考えている'
    ],
    description: '他者をケアし、安心と信頼を提供する'
  }
};

/**
 * アーキタイプの表示順序
 */
export const ARCHETYPE_ORDER: ArchetypeType[] = [
  'creator',
  'ruler',
  'sage',
  'explorer',
  'innocent',
  'outlaw',
  'magician',
  'hero',
  'lover',
  'jester',
  'regular',
  'caregiver'
];

/**
 * アーキタイプの表示名マッピング
 */
export const ARCHETYPE_DISPLAY_NAMES: Record<string, string> = {
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
```

---

## 6. アーキタイプ計算ロジック

### 6.1 計算関数（utils/archetypeCalculator.ts）

新しいファイル `utils/archetypeCalculator.ts` を作成します。

```typescript
import { ArchetypeMetrics } from '../types/data';
import { ARCHETYPE_DEFINITIONS } from '../constants/archetypeConfigs';

/**
 * ブランドイメージメトリクスからアーキタイプメトリクスを計算
 * @param imageMetrics ブランドイメージメトリクス
 * @returns アーキタイプメトリクス
 */
export function calculateArchetypeMetrics(
  imageMetrics: Record<string, number>
): ArchetypeMetrics {
  const archetypeMetrics: ArchetypeMetrics = {
    creator: 0,
    ruler: 0,
    sage: 0,
    explorer: 0,
    innocent: 0,
    outlaw: 0,
    magician: 0,
    hero: 0,
    lover: 0,
    jester: 0,
    regular: 0,
    caregiver: 0
  };

  // 各アーキタイプの計算
  Object.keys(ARCHETYPE_DEFINITIONS).forEach(archetypeKey => {
    const definition = ARCHETYPE_DEFINITIONS[archetypeKey];
    const values: number[] = [];

    // 対応する項目の値を収集
    definition.items.forEach(itemName => {
      const value = imageMetrics[itemName];
      if (value !== undefined && value !== null) {
        values.push(value);
      }
    });

    // 平均値を計算
    if (values.length > 0) {
      const sum = values.reduce((acc, val) => acc + val, 0);
      archetypeMetrics[archetypeKey as keyof ArchetypeMetrics] = sum / values.length;
    }
  });

  return archetypeMetrics;
}

/**
 * アーキタイプメトリクスをパーセンテージ表示用にフォーマット
 * @param value アーキタイプ値
 * @returns フォーマット済み文字列
 */
export function formatArchetypeValue(value: number): string {
  return value.toFixed(2);
}
```

### 6.2 Excelパース処理への統合（ExcelParser.ts への追加）

```typescript
// アーキタイプメトリクスの計算を追加
import { calculateArchetypeMetrics } from '../../utils/archetypeCalculator';

// parseExcelData 関数内で、各ブランドデータにアーキタイプメトリクスを追加
const brandMetrics: AllMetrics = {
  FT: ftVal,
  FW: fwVal,
  FZ: fzVal,
  GC: gcVal,
  GJ: gjVal,
  GL: glVal,
  // ... その他のメトリクス
  imageMetrics: imageMetrics,
  // アーキタイプメトリクスを計算して追加
  archetypeMetrics: calculateArchetypeMetrics(imageMetrics)
};
```

---

## 7. 分析モードの追加

アーキタイプ分析用に、以下の新しいモードを追加します。

### 7.1 モード13: アーキタイプ分析（セグメント×複数ブランド）

#### モードID
`archetype_segment_brands`

#### 概要
単一セグメント内で複数ブランドの12タイプのアーキタイプ値を比較

#### 設定（constants/analysisConfigs.ts への追加）

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

### 7.2 モード14: アーキタイプ分析（ブランド×複数セグメント）

#### モードID
`archetype_brand_segments`

#### 概要
単一ブランドにおける複数セグメント間の12タイプのアーキタイプ値を比較

#### 設定（constants/analysisConfigs.ts への追加）

```typescript
'archetype_brand_segments': {
  id: 'archetype_brand_segments',
  name: 'アーキタイプ分析（ブランド: X=アーキタイプ×セグメント）',
  description: '単一ブランドにおける複数セグメントのアーキタイプ指標を比較',
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
      role: 'SERIES',
      label: 'セグメント',
      allowMultiple: true
    },
    brands: {
      role: 'FILTER',
      label: 'ブランド',
      allowMultiple: false
    }
  },
  dataTransform: {
    xAxis: 'items',
    series: 'segments',
    filter: 'brands'
  },
  defaultChartType: 'radar'
}
```

---

## 8. チャート設定

### 8.1 デフォルトチャートタイプ
**レーダーチャート（Radar Chart）**

**理由**:
- 12項目の全体的なバランスを視覚的に把握しやすい
- ブランドパーソナリティの形状として直感的に理解しやすい
- 複数ブランド/セグメントの比較が容易

### 8.2 X軸ラベル
- **表示**: 日本語名（「創造者」「統治者」など）
- **順序**: ARCHETYPE_ORDER に従う

### 8.3 その他のチャートタイプ
- 集合縦棒グラフ
- 集合横棒グラフ
- 折れ線グラフ

---

## 9. 使用例

### 9.1 シナリオ1: ブランドパーソナリティの評価

**目的**: 自社ブランドのパーソナリティを12タイプで評価

**手順**:
1. モード13「アーキタイプ分析（セグメント×複数ブランド）」を選択
2. セグメント「全体」を選択
3. ブランド「自社ブランド」を選択
4. レーダーチャートで12タイプの強さを確認

**分析ポイント**:
- どのアーキタイプが強いか？
- ブランドの特徴的なパーソナリティは何か？
- 弱いアーキタイプは何か？

### 9.2 シナリオ2: 競合ブランドとのパーソナリティ比較

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

### 9.3 シナリオ3: セグメント別のブランド認識の違い

**目的**: 世代別にブランドパーソナリティの認識の違いを把握

**手順**:
1. モード14「アーキタイプ分析（ブランド×複数セグメント）」を選択
2. ブランド「自社ブランド」を選択
3. セグメント「20代」「30代」「40代」「50代」を選択
4. レーダーチャートで比較

**分析ポイント**:
- 世代によってパーソナリティの認識は異なるか？
- どの世代でどのアーキタイプが強いか？
- ターゲットセグメントでの認識は期待通りか？

---

## 10. ビジネス価値

### 10.1 戦略的活用
1. **ブランドポジショニング**: 自社ブランドの立ち位置を明確化
2. **差別化戦略**: 競合との違いを可視化し、差別化ポイントを特定
3. **コミュニケーション戦略**: 強化すべきパーソナリティを特定
4. **リブランディング**: 目指すべきパーソナリティと現状のギャップを把握

### 10.2 セグメント戦略
1. **ターゲット選定**: どのセグメントでブランドが強いかを把握
2. **セグメント別コミュニケーション**: セグメントごとの認識の違いに応じた戦略
3. **新規セグメント開拓**: 弱いセグメントでの認識向上施策

### 10.3 他の分析との組み合わせ
- **ファネル分析**: 認知～購入の各段階とパーソナリティの関係
- **ブランドイメージ分析**: 詳細なイメージ項目とアーキタイプの関係
- **ブランドパワー分析**: パワーとパーソナリティの関係

---

## 11. 実装上の注意点

### 11.1 データの整合性
- ブランドイメージ項目（AP列～DE列）が正しく読み込まれているか確認
- 項目名が定義と一致しているか確認（完全一致が必要）
- 欠損値が適切に処理されているか確認

### 11.2 計算精度
- 平均値計算時の小数点処理
- 0除算のエラーハンドリング
- 項目が存在しない場合の処理

### 11.3 表示の最適化
- レーダーチャートのスケール調整
- 複数系列の色分け
- ラベルの可読性確保

### 11.4 パフォーマンス
- アーキタイプ計算は各ブランド・セグメントごとに実行
- Excel読み込み時に一度だけ計算し、キャッシュする
- 大量データでのパフォーマンス最適化

---

## 12. 検証とテスト

### 12.1 計算精度の検証
- 手計算との照合
- サンプルデータでの検証
- 境界値テスト（0、最大値など）

### 12.2 UI/UXの検証
- レーダーチャートの見やすさ
- 複数ブランド選択時の視認性
- ラベルの重なり確認

### 12.3 エラーハンドリング
- 項目が存在しない場合
- データが不完全な場合
- 計算不可能な場合

---

## 13. 今後の拡張性

### 13.1 カスタムアーキタイプ
- ユーザー定義のアーキタイプ追加機能
- 項目の組み合わせのカスタマイズ

### 13.2 アーキタイプスコアの保存
- アーキタイプスコアのエクスポート機能
- 時系列でのアーキタイプ変化の追跡

### 13.3 高度な分析
- アーキタイプ同士の相関分析
- クラスター分析によるブランドグループ化
- アーキタイプと売上・市場シェアの関係分析

---

## 14. まとめ

### 14.1 主な特徴
- **12タイプのアーキタイプ**: 包括的なブランドパーソナリティ評価
- **自動計算**: ブランドイメージ項目から自動的に算出
- **視覚的な比較**: レーダーチャートで直感的に理解
- **多角的な分析**: ブランド比較、セグメント比較の両方に対応

### 14.2 期待される効果
- ブランドパーソナリティの定量的評価
- 競合との差別化ポイントの明確化
- セグメント別の認識の違いの把握
- リブランディング戦略の方向性決定

### 14.3 実装の優先度
**高**: 
- アーキタイプ定義の実装
- 計算ロジックの実装
- モード13（セグメント×ブランド）の実装

**中**: 
- モード14（ブランド×セグメント）の実装
- チャート表示の最適化

**低**: 
- カスタムアーキタイプ機能
- 高度な分析機能

---

**文書ステータス**: 要件定義完了  
**作成日**: 2025-11-29  
**バージョン**: 1.0

