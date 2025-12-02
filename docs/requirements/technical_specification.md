# 技術仕様書 - BFD Analytics

## 1. システム概要

BFD Analyticsは、ReactとViteを使用して構築されたシングルページアプリケーション (SPA) である。Excelデータをクライアントサイドで解析し、Rechartsライブラリを用いて動的にグラフ描画を行う。

**バージョン**: 3.0.1-beta  
**最終更新**: 2025-12-01

### 主な特徴
- 設定駆動型アーキテクチャによる高い拡張性
- 14個の分析モード対応（詳細分析）
- 6個の過去比較モード対応（ファネル①②、ブランドイメージ、ブランドパワー①②、アーキタイプ）
- グローバルモード切り替え機能（詳細分析 ⇔ 過去比較）
- 複数データソース管理機能（最大3ファイル）
- コンポーネント分割による保守性の向上
- TypeScriptによる型安全性の確保

## 2. 技術スタック

### 2.1 フロントエンド
- **フレームワーク**: React 19.2.0
- **ビルドツール**: Vite 6.2.0
- **言語**: TypeScript 5.8.2
- **スタイリング**: Tailwind CSS (Utility-first CSS)

### 2.2 主要ライブラリ

| ライブラリ | バージョン | 用途 |
|:---|:---|:---|
| recharts | 3.4.1 | グラフ描画（SVGベースのコンポーネント指向チャートライブラリ） |
| xlsx | 0.18.5 | Excel解析（ブラウザ上でExcelをJSONに変換） |
| @dnd-kit/core | latest | ドラッグ＆ドロップ（モダンで軽量なDnDライブラリ） |
| @dnd-kit/sortable | latest | リストの並べ替え機能 |
| @dnd-kit/utilities | latest | DnDユーティリティ |
| html2canvas | 1.4.1 | 画像生成（DOM要素をCanvasにレンダリング） |
| lucide-react | 0.554.0 | アイコン（軽量で一貫性のあるSVGアイコンセット） |

## 3. ディレクトリ構造

```
src/
├── App.tsx                      # メインアプリケーション（状態管理、UI統合）
├── index.tsx                    # エントリーポイント
├── types.ts                     # 型定義（SheetData, AllMetrics, AnalysisMode等）
├── constants.ts                 # 定数定義（初期データ、カラーテーマ、指標キー）
│
├── src/
│   ├── types/                   # 型定義（モジュール化）
│   │   ├── analysis.ts          # 分析モード型
│   │   ├── data.ts              # データ構造型
│   │   ├── globalMode.ts        # グローバルモード型（NEW）
│   │   ├── dataSource.ts        # データソース型（NEW）
│   │   └── index.ts             # エクスポート
│   ├── hooks/                   # カスタムフック
│   │   ├── useGlobalMode.ts     # グローバルモード管理（NEW）
│   │   ├── useMultiDataSource.ts # 複数データソース管理（NEW）
│   │   ├── useDataManagement.ts
│   │   ├── useAnalysisState.ts
│   │   ├── useChartConfiguration.ts
│   │   └── ...
│   └── ...
│
├── components/                  # UIコンポーネント
│   ├── IconBar.tsx              # アイコンバー（サイドバー開閉、クイックアクセス）
│   ├── GlobalModeTab.tsx        # グローバルモード切り替えタブ（NEW）
│   ├── DataSourceManager.tsx    # データソース管理UI（NEW）
│   ├── Sidebar.tsx              # サイドバー（メインコンテナ）
│   ├── AnalysisItemsSection.tsx # 分析項目セクション
│   ├── SegmentsSection.tsx      # セグメントセクション
│   ├── BrandsSection.tsx        # ブランドセクション
│   ├── ChartArea.tsx            # グラフ＋テーブル表示エリア
│   └── SortableBrandItem.tsx    # ドラッグ可能リストアイテム
│
├── constants/                   # 設定ファイル
│   ├── analysisConfigs.ts       # 【重要】分析モード設定（設定駆動型の核）
│   │                            # - 詳細分析モード14種
│   │                            # - 過去比較モード6種（NEW）
│   └── modeConfigs.ts           # モード関連補助設定
│
└── utils/                       # ユーティリティ関数
    └── dataTransforms.ts        # データ変換ロジック（汎用化済み）
                                 # - transformDataForChart（詳細分析用）
                                 # - transformDataForHistoricalChart（過去比較用・NEW）
                                 # - transformDataForHistoricalBrandImage（NEW）

docs/
├── requirements_definition.md   # 要件定義書
├── specification.md             # 仕様書
├── technical_specification.md   # 本ドキュメント
├── sample_excel_structure.md    # Excelフォーマット説明
├── HISTORICAL_COMPARISON_REQUIREMENTS.md  # 過去比較要件（NEW）
├── HISTORICAL_MODES_MASTER_GUIDE.md       # マスターガイド（NEW）
└── HISTORICAL_MODE*.md                    # 各モード実装報告書（NEW）

public/
├── sample_202506.xlsx           # サンプルデータ（最新）
├── sample_202406.xlsx           # サンプルデータ（2024年度）
└── sample_202304.xlsx           # サンプルデータ（2023年度）
```

## 4. データ構造

### 4.1 主要インターフェース (`types.ts` 準拠)

```typescript
// ファネル指標データ
export interface FunnelMetrics {
  FT: number; // 認知あり(TOP2)
  FW: number; // 興味あり(TOP2)
  FZ: number; // 好意あり(TOP2)
  GC: number; // 購入・利用意向あり(TOP2)
  GJ: number; // 購入・利用経験あり(TOP5)
  GL: number; // リピート意向あり(TOP2)
}

// 時系列指標データ
export interface TimelineMetrics {
  T1: number; // 直近1ヶ月以内に購入・利用した
  T2: number; // 過去2～3ヶ月以内に購入・利用した
  T3: number; // 過去4ヶ月～半年未満に購入・利用した
  T4: number; // 半年～1年未満に購入・利用した
  T5: number; // 1年以上前に購入・利用した
}

// ブランドパワー指標データ
export interface BrandPowerMetrics {
  BP1: number; // 好きなブランド (複数回答)
  BP2: number; // 現在のパワー
  BP3: number; // 5年前のパワー
  BP4: number; // なんとなくのパワー
}

// 全指標（ファネル + 時系列 + ブランドパワー）
export type AllMetrics = FunnelMetrics & TimelineMetrics & BrandPowerMetrics;

// ブランドごとのデータ構造
export interface BrandData {
  [brandName: string]: AllMetrics;
}

// シート（セグメント）ごとのデータ構造
export interface SheetData {
  [sheetName: string]: BrandData;
}

// 分析モードの型（14モード + 6過去比較モード）
export type AnalysisMode = 
  // 詳細分析モード（14種）
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
  | 'archetype_segment_brands'
  | 'archetype_brand_segments'
  // 過去比較モード（6種）
  | 'historical_funnel1_segment_brand'
  | 'historical_funnel2_segment_brand'
  | 'historical_brand_image_segment_brand'
  | 'historical_brand_power_segment_brand'
  | 'historical_future_power_segment_brand'
  | 'historical_archetype_segment_brand';
```

### 4.2 Excelデータ仕様

- **入力形式**: `.xlsx`, `.xls`, `.csv`
- **パースロジック**:
  - `SheetJS` の `sheet_to_json` (header: 1) を使用して2次元配列として取得
  - **カテゴリ行**: 1行目 (index 0) - 各列のカテゴリ名
  - **項目名行**: 2行目 (index 1) - 各列の項目名（ブランドイメージ項目の抽出に使用）
  - **ヘッダー行**: 3行目 (index 2) をヘッダーとして認識 - 各列の詳細項目名
  - **ブランド名**: D列 (index 3) をブランド名として認識
  - **指標カラム**: ヘッダー文字列と内部キーのマッピングを行い、動的にカラムインデックスを特定
  - **ブランドイメージ項目**: パターンマッチング方式で抽出（行1に「ブランドイメージ」を含む列を検索）
  - **ブランドパワー指標**: AF列～AI列（BP1-BP4）

詳細は [`sample_excel_structure.md`](sample_excel_structure.md) を参照。

## 5. アーキテクチャ設計

### 5.1 設定駆動型アプローチ

本アプリケーションの最大の特徴は、**設定駆動型アーキテクチャ**である。各分析モードの振る舞いを設定オブジェクトとして定義することで、コードの重複を排除し、拡張性を大幅に向上させている。

#### 設計思想

従来のアプローチでは、各モードごとに条件分岐が散在し、新しいモードを追加するたびに複数のファイルを修正する必要があった。設定駆動型では：

1. **設定の集約**: すべてのモード設定を `constants/analysisConfigs.ts` に集約
2. **共通ロジック**: データ変換や表示ロジックを汎用化
3. **宣言的UI**: 設定に基づいてUIを動的に生成

これにより、**新しいモードの追加は設定オブジェクトの追加のみで実現可能**。

#### 過去比較モードの実装成果

過去比較モード（Mode 1-6）の実装により、この設計思想の有効性が実証された：

- **Mode 1（基盤構築）**: 約3日（約1,000行の新規実装）
- **Mode 2-6（設定追加）**: 平均3-10分/モード（設定のみ、30-40行）
- **再利用率**: 95-100%
- **エラー率**: 0%

### 5.2 グローバルモード管理

アプリケーション全体に適用されるモード（詳細分析 vs 過去比較）を管理する仕組み。

#### GlobalMode型

```typescript
// グローバルモード
export type GlobalMode = 'detailed' | 'historical';

// グローバルモード設定
export interface GlobalModeConfig {
  mode: GlobalMode;
  brandSelectionMode: SelectionMode;  // 'single' | 'multiple'
  segmentSelectionMode: SelectionMode;
}
```

#### 特徴

- **詳細分析モード**: 複数ブランド/セグメントの横断比較
- **過去比較モード**: 時系列データの推移分析（単一ブランド/セグメント + 複数データソース）

### 5.3 複数データソース管理

過去比較モード専用の機能。最大3つのExcelファイルを同時に読み込み、時系列比較を行う。

#### DataSource型

```typescript
export interface DataSource {
  id: string;
  name: string;              // 表示名（例: "2025年6月"）
  fileName: string;          // ファイル名
  uploadedAt: Date;
  data: SheetData;           // Excelデータ
  brandImageData?: Record<string, Record<string, Record<string, number>>>;
  isActive: boolean;         // 表示/非表示
}

export interface MultiDataSourceState {
  dataSources: DataSource[];
  currentSourceId: string | null;
}
```

#### 主要機能

- **自動命名**: ファイル名から期間を抽出（例: `BFD_202506.xlsx` → `2025年6月`）
- **ON/OFF切り替え**: データソースごとに表示/非表示を切り替え
- **名前編集**: データソース名を手動で変更可能（最大20文字）
- **一括削除**: 全データソースをワンクリックでクリア

### 5.4 分析モード設定 (`constants/analysisConfigs.ts`)

各分析モードは以下の構造で定義される：

```typescript
export interface AnalysisModeConfig {
  id: string;
  name: string;
  description: string;
  axes: {
    items: AxisConfig;
    segments: AxisConfig;
    brands: AxisConfig;
  };
  dataTransform: {
    xAxis: AxisType;
    series: AxisType | 'dataSources';  // 過去比較では'dataSources'
    filter: AxisType;
  };
  defaultChartType?: ChartType;  // デフォルトのグラフタイプ
}

export interface AxisConfig {
  role: 'X_AXIS' | 'SERIES' | 'FILTER';
  label: string;
  allowMultiple: boolean;
  itemSet?: 'funnel' | 'timeline' | 'brandImage' | 'brandPower' | 'futurePower' | 'archetype';
  fixedItems?: string[];
  autoSelect?: boolean;         // ブランドイメージのTOP30自動選定用
  autoSelectCount?: number;     // 自動選定する項目数
}
```

#### 役割 (Role) の説明

| 役割 | 説明 | UI動作 |
|:---|:---|:---|
| `X_AXIS` | グラフのX軸として表示 | 固定項目セットの場合は非表示 |
| `SERIES` | データ系列として表示 | 複数選択可能（ドラッグ&ドロップリスト） |
| `FILTER` | データの絞り込み条件 | 単一選択（ドロップダウン） |

#### 設定例: モード1（セグメント×複数ブランド）

```typescript
'segment_x_multi_brand': {
  id: 'segment_x_multi_brand',
  name: 'ファネル分析（セグメント×複数ブランド）',
  description: '単一セグメントにおける複数ブランドのファネル指標を比較',
  axes: {
    items: {
      role: 'X_AXIS',
      label: '分析項目',
      allowMultiple: false,
      itemSet: 'funnel',
      fixedItems: ['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL']
    },
    segments: {
      role: 'FILTER',
      label: 'セグメント',
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
  }
}
```

この設定により：
- **項目**: ファネル指標6つを固定表示（UI非表示）
- **セグメント**: 単一選択ドロップダウン
- **ブランド**: 複数選択リスト（ドラッグ&ドロップ可）

## 6. コンポーネント設計

### 6.1 `App.tsx` - メインアプリケーション

アプリケーション全体の状態管理とレイアウトを行うコンポーネント。

#### 主要な状態 (State)

```typescript
// グローバルモード管理（NEW）
const {
  globalMode,
  setGlobalMode,
  isHistoricalMode,
} = useGlobalMode();

// マルチデータソース管理（NEW）
const {
  dataSources,
  addDataSource,
  removeDataSource,
  updateDataSourceName,
  toggleDataSourceActive,
  getActiveDataSources,
  clearAllDataSources,
} = useMultiDataSource();

// データ管理（詳細分析モード用）
const {
  data,
  brandImageData,
  isExcelData,
  currentFileName,
  isLoading: isDataLoading,
  loadFromFile,
  reset: resetData,
} = useDataManagement();

// 分析モード（グローバルモードに応じて動的に切り替え）
const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(...);

// フィルタ値（各モードで単一選択される値）
const [sheet, setSheet] = useState<string>(...);        // セグメント（単一）
const [targetBrand, setTargetBrand] = useState<string>(...); // ブランド（単一）
const [selectedItem, setSelectedItem] = useState<string>(...); // 項目（単一）

// 系列値（詳細分析モードで複数選択される値）
const [selectedBrands, setSelectedBrands] = useState<string[]>([]);   // ブランド（複数）
const [selectedSegments, setSelectedSegments] = useState<string[]>([]); // セグメント（複数）

// 表示設定
const [chartType, setChartType] = useState<ChartType>('bar');
const [showDataLabels, setShowDataLabels] = useState(true);
const [currentTheme, setCurrentTheme] = useState<string>('default');
const [isAnonymized, setIsAnonymized] = useState(true);

// カラーインデックス管理（一貫した配色を保証）
const [brandColorIndices, setBrandColorIndices] = useState<Record<string, number>>({});
const [segmentColorIndices, setSegmentColorIndices] = useState<Record<string, number>>({});
```

#### 汎用化されたヘルパー関数

```typescript
// フィルタ値の取得
const getFilterValue = (axisType: AxisType): string => {
  const config = ANALYSIS_MODE_CONFIGS[analysisMode];
  const role = config.axes[axisType].role;
  
  if (role === 'FILTER') {
    switch (axisType) {
      case 'segments': return sheet;
      case 'brands': return targetBrand;
      case 'items': return selectedItem;
    }
  }
  return '';
};

// 系列値の取得
const getSeriesValues = (axisType: AxisType): string[] => {
  const config = ANALYSIS_MODE_CONFIGS[analysisMode];
  const role = config.axes[axisType].role;
  
  if (role === 'SERIES') {
    switch (axisType) {
      case 'brands': return selectedBrands;
      case 'segments': return selectedSegments;
    }
  }
  return [];
};
```

#### チャートデータ生成

```typescript
// チャートデータ生成
const chartData = useMemo(() => {
  const config = currentModeConfigs[analysisMode];
  if (!config || !config.axes) return null;

  const labelGetters: Record<AxisType, (key: string) => string> = {
    items: (key: string) => {
      if (key in FUNNEL_LABELS) return FUNNEL_LABELS[key as keyof typeof FUNNEL_LABELS];
      if (key in TIMELINE_LABELS) return TIMELINE_LABELS[key as keyof typeof TIMELINE_LABELS];
      if (key in BRAND_POWER_LABELS) return BRAND_POWER_LABELS[key as keyof typeof BRAND_POWER_LABELS];
      if (key in FUTURE_POWER_LABELS) return FUTURE_POWER_LABELS[key as keyof typeof FUTURE_POWER_LABELS];
      if (key in ARCHETYPE_LABELS) return ARCHETYPE_LABELS[key as keyof typeof ARCHETYPE_LABELS];
      return key;
    },
    segments: (key: string) => key.replace(/[（(]BFDシート[_＿]?[値]?[）)]?.*?St\d+/g, '').trim(),
    brands: (key: string) => getBrandName(key)
  };

  // 過去比較モードの場合
  if (isHistoricalMode()) {
    const activeSources = getActiveDataSources();
    if (activeSources.length === 0) return null;

    // ブランドイメージ分析の場合は専用関数を使用
    if (config.axes.items?.itemSet === 'brandImage' && config.axes.items?.autoSelect) {
      return transformDataForHistoricalBrandImage(
        activeSources,
        config,
        sheet, // selectedSegment
        targetBrand, // selectedBrand
        labelGetters,
        brandImageData
      );
    }

    // その他の固定項目モード（Mode 1, 2, 4, 5, 6）
    return transformDataForHistoricalChart(
      activeSources,
      config,
      sheet, // selectedSegment
      targetBrand, // selectedBrand
      selectedItem,
      labelGetters
    );
  }

  // 詳細分析モードの場合（既存）
  const filterValues: Record<AxisType, string> = {
    items: getFilterValue('items'),
    segments: getFilterValue('segments'),
    brands: getFilterValue('brands')
  };

  const seriesValues: Record<AxisType, string[]> = {
    items: getSeriesValues('items').length > 0 ? getSeriesValues('items') : getXAxisValues('items'),
    segments: getSeriesValues('segments').length > 0 ? getSeriesValues('segments') : getXAxisValues('segments'),
    brands: getSeriesValues('brands').length > 0 ? getSeriesValues('brands') : getXAxisValues('brands')
  };

  return transformDataForChart(data, config, filterValues, seriesValues, labelGetters, brandImageData);
}, [
  data,
  brandImageData,
  analysisMode,
  globalMode,
  dataSources,
  sheet,
  targetBrand,
  selectedItem,
  // ... その他の依存
]);
```

このロジックにより、グローバルモードに応じて適切なデータ変換関数が自動的に選択される。

### 8.3 処理フロー

#### `AnalysisItemsSection.tsx` (48行)
- 分析項目の選択UIを担当
- モードに応じて【固定】または【SA】として表示
- ファネル指標または時系列指標のドロップダウン

#### `SegmentsSection.tsx` (138行)
- セグメントの選択・管理UIを担当
- 【SA】: 単一選択ドロップダウン
- 【MA】: 複数選択リスト + ドラッグ&ドロップ

#### `BrandsSection.tsx` (138行)
- ブランドの選択・管理UIを担当
- 【SA】: 単一選択ドロップダウン
- 【MA】: 複数選択リスト + ドラッグ&ドロップ

### 6.4 `IconBar.tsx` - アイコンバー（クイックアクセス）

常に画面左端に表示されるアイコンバー。サイドバー開閉と頻繁に使う機能へのクイックアクセスを提供。

#### 主な機能

**1. サイドバー開閉トグル**
- 常に一番上に表示（サイドバー開閉でアイコン位置が変わらない）
- 開いている時: `<` (ChevronLeft) アイコン
- 閉じている時: `>` (ChevronRight) アイコン

**2. グラフタイプ切り替え（4種）**
- 集合縦棒（BarChart2）
- 横棒（BarChart3）
- 折れ線（LineChart）
- レーダー（Radar）
- 選択中のグラフタイプはハイライト表示

**3. スクリーンショット（2種）**
- グラフのみ（Camera）
- グラフ＋データ（Image）

**4. ツールチップ**
- 各アイコンにホバーすると機能名を表示

#### デザイン思想

- **常時表示**: サイドバーを閉じても主要機能にアクセス可能
- **一貫性**: トグルボタンの位置が常に同じでUI/UXが安定
- **重複配置**: サイドバー内にも同じ機能があり、ユーザーの好みで選択可能

### 6.5 `SortableBrandItem.tsx` - ドラッグ可能アイテム

`@dnd-kit` を使用した、並べ替え可能なリストアイテム。

- **Props**: `id`, `color`, `name`, `onRemove`
- **機能**: ドラッグハンドルによる並べ替え操作、削除ボタンによるアイテム削除

### 6.6 `ChartArea.tsx` - グラフ＋テーブル表示

グラフとデータテーブルの描画を担当。

- Rechartsコンポーネント（BarChart, LineChart, RadarChart等）を使用
- チャートタイプに応じた条件分岐
- ツールチップ、データラベル、凡例の制御

## 7. データ変換ロジック (`utils/dataTransforms.ts`)

### 7.1 詳細分析モード用変換関数

```typescript
export const transformDataForChart = (
  data: SheetData,
  config: AnalysisModeConfig,
  filterValues: Record<AxisType, string>,
  seriesValues: Record<AxisType, string[]>,
  labelGetters: Record<AxisType, (key: string) => string>,
  brandImageData?: Record<string, Record<string, Record<string, number>>>
): ChartDataPoint[] => {
  const { xAxis, series, filter } = config.dataTransform;
  
  // X軸のアイテムリストを取得
  const xAxisItems = getXAxisItems(config, xAxis, data, filterValues);
  
  // 各X軸アイテムに対してデータポイントを作成
  return xAxisItems.map(xItem => {
    const point: ChartDataPoint = { 
      name: labelGetters[xAxis](xItem)
    };
    
    // 各系列に対してデータを追加
    const seriesItems = seriesValues[series];
    seriesItems.forEach(seriesItem => {
      const value = extractValue(
        data, xAxis, xItem, series, seriesItem, 
        filter, filterValues[filter], config, brandImageData
      );
      
      if (value !== undefined) {
        point[labelGetters[series](seriesItem)] = value;
      }
    });
    
    return point;
  });
};
```

### 7.2 過去比較モード用変換関数

#### 固定項目モード（Mode 1, 2, 4, 5, 6）

```typescript
export const transformDataForHistoricalChart = (
  dataSources: DataSource[],
  config: AnalysisModeConfig,
  selectedSegment: string,
  selectedBrand: string,
  selectedItem: string,
  labelGetters: Record<AxisType, (key: string) => string>
): ChartDataPoint[] => {
  const { xAxis } = config.dataTransform;
  const axisConfig = config.axes.items;
  
  // X軸項目（固定）
  const xAxisItems = axisConfig.fixedItems || [];
  
  // 各X軸項目に対してデータポイントを作成
  return xAxisItems.map(item => {
    const point: ChartDataPoint = {
      name: labelGetters.items(item)
    };
    
    // 各データソースに対して値を取得
    dataSources.forEach(ds => {
      const value = ds.data?.[selectedSegment]?.[selectedBrand]?.[item as keyof AllMetrics];
      if (value !== undefined) {
        point[ds.name] = value;
      }
    });
    
    return point;
  });
};
```

#### ブランドイメージモード（Mode 3）

```typescript
export const transformDataForHistoricalBrandImage = (
  dataSources: DataSource[],
  config: AnalysisModeConfig,
  selectedSegment: string,
  selectedBrand: string,
  labelGetters: Record<AxisType, (key: string) => string>,
  brandImageData?: Record<string, Record<string, Record<string, number>>>
): ChartDataPoint[] => {
  // 基準データソース（最初のアクティブなデータソース）のTOP30を取得
  const referenceSource = dataSources[0];
  if (!referenceSource?.brandImageData) return [];
  
  const imageData = referenceSource.brandImageData[selectedSegment]?.[selectedBrand];
  if (!imageData) return [];
  
  // TOP30項目を選定
  const sortedItems = Object.entries(imageData)
    .filter(([key]) => key !== 'あてはまるものはない')
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30);
  
  // 各項目に対してデータポイントを作成
  return sortedItems.map(([item]) => {
    const point: ChartDataPoint = { name: item };
    
    // 各データソースから値を取得
    dataSources.forEach(ds => {
      const value = ds.brandImageData?.[selectedSegment]?.[selectedBrand]?.[item];
      if (value !== undefined) {
        point[ds.name] = value;
      }
    });
    
    return point;
  });
};
```

### 7.3 データ抽出ロジック

```typescript
const extractValue = (
  data: SheetData,
  xAxis: AxisType, xValue: string,
  series: AxisType, seriesValue: string,
  filter: AxisType, filterValue: string,
  config: AnalysisModeConfig
): number | undefined => {
  // 3つの軸の値から適切なデータパスを構築
  const values = {
    items: xAxis === 'items' ? xValue : 
           (series === 'items' ? seriesValue : filterValue),
    segments: xAxis === 'segments' ? xValue : 
              (series === 'segments' ? seriesValue : filterValue),
    brands: xAxis === 'brands' ? xValue : 
            (series === 'brands' ? seriesValue : filterValue)
  };
  
  // データ構造: data[segment][brand][metricKey]
  const sheetData = data[values.segments];
  if (!sheetData) return undefined;
  
  const brandData = sheetData[values.brands];
  if (!brandData) return undefined;
  
  return brandData[values.items as keyof AllMetrics];
};
```

この汎用的なロジックにより、**詳細分析の全14モードが同じコードで処理される**。過去比較モードも、Mode 1-2, 4-6は共通ロジック、Mode 3は専用ロジックで実装されている。

## 8. コンポーネント設計

### 8.1 新規追加コンポーネント（過去比較モード）

#### `GlobalModeTab.tsx` - グローバルモード切り替え

サイドバー上部に配置される、詳細分析 ⇔ 過去比較の切り替えタブ。

**Props**:
- `globalMode`: 現在のグローバルモード
- `setGlobalMode`: モード切り替え関数

**デザイン**:
- タブ型UI（2つのボタン）
- 選択中のタブは背景色でハイライト
- トランジション効果あり

#### `DataSourceManager.tsx` - データソース管理UI

過去比較モード専用のデータソース管理インターフェース。

**Props**:
- `dataSources`: データソースの配列
- `onAddDataSource`: データソース追加ハンドラ
- `onRemoveDataSource`: データソース削除ハンドラ
- `onUpdateDataSourceName`: 名前変更ハンドラ
- `onToggleDataSourceActive`: ON/OFF切り替えハンドラ
- `onResetAll`: 一括削除ハンドラ

**機能**:
- ファイルアップロード（ドラッグ&ドロップ対応）
- データソースリスト（最大3つ）
- 各データソースの名前編集（インライン編集）
- ON/OFFトグルスイッチ
- 削除ボタン
- 一括リセットボタン
- 基準データソース警告（Mode 3用）

### 8.2 `App.tsx` - メインアプリケーション

### 8.1 ファイルアップロードフロー

```
User Action: ファイルドロップ/選択
  ↓
handleFileInput / handleDrop
  ↓
file.arrayBuffer()
  ↓
parseExcelData(arrayBuffer)
  ↓
xlsx.read(arrayBuffer)
  ↓
各シートをループ:
  - カテゴリ行（1行目）、項目名行（2行目）、ヘッダー行（3行目）を取得
  - ヘッダー行（3行目）から項目マッピング
  - ブランドイメージ項目はパターンマッチングで抽出（行1に「ブランドイメージ」を含む列を検索）
  - D列（4列目）からブランド名取得
  - 4行目以降からデータ読み込み
  ↓
setData(newSheetData)
  ↓
setIsExcelData(true)
```

### 8.2 データ変換フロー（グラフ描画用）

```
App.tsx (useMemo):
  分析モード選択
  セグメント/ブランド/項目選択
    ↓
  ANALYSIS_MODE_CONFIGS[mode]から設定取得
    ↓
  getFilterValue(), getSeriesValues()でフィルタ・系列値を構築
    ↓
  transformDataForChart(data, config, filterValues, seriesValues, labelGetters)
    ↓
  ChartDataPoint[] 生成
    ↓
  chartData (state更新)
    ↓
ChartArea.tsx:
  Recharts コンポーネントでレンダリング
```

### 8.3 CSVエクスポートフロー

```
handleExportCSV()
  ↓
現在のモードと選択に基づいてCSV文字列生成
  ↓
BOM (\ufeff) を付与（Excel文字化け防止）
  ↓
Blob生成 → URL.createObjectURL
  ↓
プログラム的にダウンロード実行
```

### 8.4 デモモード（匿名化）詳細仕様

#### 起動条件とUI操作
- **有効化条件**: `isExcelData` が `true` の場合のみ利用可能
- **トリガー**: サイドバーヘッダー領域（"BFD Analytics" ロゴ）をクリックでトグル
- **視覚的フィードバック**:
  - ON時: 「DEMO」バッジ表示、`EyeOff` アイコン
  - OFF時: バッジ非表示、`Eye` アイコン

#### 内部ロジック

```typescript
// マッピング生成
const brandMap = useMemo(() => {
  const map: Record<string, string> = {};
  allUniqueBrands.forEach((brand, index) => {
    map[brand] = `ブランド${index + 1}`;
  });
  return map;
}, [allUniqueBrands]);

// 名称解決
const getBrandName = (originalName: string) => {
  return isAnonymized ? (brandMap[originalName] || originalName) : originalName;
};
```

#### 適用範囲
- グラフの軸ラベル、ツールチップ、凡例
- サイドバーのブランド選択リスト
- メインヘッダーの表示
- **CSV出力**（重要: デモモードONでエクスポートしたCSVも匿名化される）

## 9. 非機能要件の実装

### 9.1 パフォーマンス最適化

- **React.useMemo**: 重い計算（`chartData`, `brandMap`など）をメモ化
- **React.useCallback**: イベントハンドラの再生成を防止
- **React.useEffect**: 副作用を適切に分離し、依存配列を最適化

### 9.2 セキュリティ

- **ローカル処理**: すべてのデータ処理はブラウザ内で完結
- **外部送信なし**: データがサーバーに送信されることはない

### 9.3 ユーザビリティ

- **レスポンシブデザイン**: Tailwind CSSによるモバイル対応
- **エラーハンドリング**: 不正フォーマットのファイルに対する適切なエラーメッセージ
- **状態の永続化**: `localStorage` による設定の保存

## 10. 今後の拡張性

### 10.1 新しい分析モードの追加方法

1. `types.ts` に新しい `AnalysisMode` を追加
2. `constants/analysisConfigs.ts` に設定オブジェクトを追加

```typescript
'new_mode_id': {
  id: 'new_mode_id',
  name: '新しいモード名',
  description: '説明',
  axes: {
    items: { role: 'X_AXIS', ... },
    segments: { role: 'FILTER', ... },
    brands: { role: 'SERIES', ... }
  },
  dataTransform: {
    xAxis: 'items',
    series: 'brands',
    filter: 'segments'
  }
}
```

3. 必要に応じて `App.tsx` に状態変数を追加
4. その他のコードは**変更不要**（自動的に対応）

### 10.2 新しい指標セットの追加

1. `types.ts` に新しいメトリクス型を定義
2. `constants.ts` にラベルとキーを追加
3. `analysisConfigs.ts` で `itemSet` を指定
4. Excelパースロジック（`App.tsx` の `parseExcelData`）を拡張

### 10.3 新しいグラフタイプの追加

1. `types.ts` の `ChartType` に追加
2. `ChartArea.tsx` にRechartsコンポーネントを追加
3. `Sidebar.tsx` のグラフタイプ選択UIに追加

## 11. テスト戦略

### 11.1 手動テスト（現状）

各モードでの動作確認：
- データ読み込み
- モード切替
- セグメント/ブランド選択
- グラフ表示
- CSV出力
- 画像コピー

### 11.2 将来的なテスト（推奨）

- **ユニットテスト**: `transformDataForChart` 関数のテスト
- **設定バリデーション**: `analysisConfigs.ts` の整合性チェック
- **E2Eテスト**: Playwrightなどを使用した統合テスト

## 12. 開発環境

### 12.1 必要なツール
- Node.js v18以上
- npm または yarn
- モダンブラウザ（Chrome, Edge, Firefox, Safari）

### 12.2 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

### 12.3 推奨エディタ設定
- VSCode + TypeScript拡張
- ESLint + Prettier
- Tailwind CSS IntelliSense

## 13. まとめ

BFD Analyticsは、設定駆動型アーキテクチャにより高い拡張性と保守性を実現したアプリケーションである。

### 主な技術的成果
- **コード削減**: サイドバーコンポーネント 600行 → 40行（93%削減）
- **拡張性**: 新しいモードを設定追加のみで実装可能
- **保守性**: コンポーネント分割により責務が明確化
- **型安全性**: TypeScriptによる堅牢な型定義

### アーキテクチャの利点
- 条件分岐の削減により、バグの混入リスクが低い
- 設定オブジェクトが自己文書化の役割を果たす
- 共通ロジックにより、一貫した動作を保証
- 将来的なテスト追加が容易

この設計思想により、今後も機能拡張やメンテナンスを効率的に行うことができる。
