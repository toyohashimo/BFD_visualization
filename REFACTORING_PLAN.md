# BFD Analytics リファクタリング計画書

**作成日**: 2025-11-29  
**バージョン**: 1.0.0  
**対象リポジトリ**: excel_visualization2

---

## 📋 目次

1. [エグゼクティブサマリー](#1-エグゼクティブサマリー)
2. [現状分析](#2-現状分析)
3. [問題点と改善機会](#3-問題点と改善機会)
4. [リファクタリング戦略](#4-リファクタリング戦略)
5. [フェーズ別実装計画](#5-フェーズ別実装計画)
6. [技術的詳細](#6-技術的詳細)
7. [リスクと対策](#7-リスクと対策)
8. [成功指標](#8-成功指標)

---

## 1. エグゼクティブサマリー

### 1.1 プロジェクト概要

BFD Analyticsは、ブランドファネル分析を行うReactベースのWebアプリケーションです。Excelファイルをアップロードし、12種類の分析モードで多角的なデータ可視化を実現しています。

### 1.2 リファクタリングの目的

- **保守性の向上**: コードの重複削減、関心の分離
- **パフォーマンス最適化**: レンダリング効率の改善
- **拡張性の確保**: 新機能追加の容易化
- **コード品質**: TypeScript型安全性の強化
- **開発者体験**: コードの可読性向上

### 1.3 推奨実施期間

- **フェーズ1**: 2週間（基盤整理）
- **フェーズ2**: 2週間（コンポーネント最適化）
- **フェーズ3**: 2週間（高度な最適化）
- **合計**: 約6週間

---

## 2. 現状分析

### 2.1 コードベース概要

```
総行数: 約8,500行
主要ファイル:
  - App.tsx: 991行（巨大なモノリス）
  - ChartArea.tsx: 685行
  - Sidebar.tsx: 449行
  - dataTransforms.ts: 221行
  - analysisConfigs.ts: 400行
```

### 2.2 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|----------|
| フレームワーク | React | 19.2.0 |
| 言語 | TypeScript | 5.8.2 |
| ビルドツール | Vite | 6.2.0 |
| チャートライブラリ | Recharts | 3.4.1 |
| Excelパーサー | XLSX | 0.18.5 |
| ドラッグ&ドロップ | @dnd-kit/* | latest |
| スタイリング | Tailwind CSS | - |

### 2.3 アーキテクチャ

```
app/
├── App.tsx (メインコンポーネント)
├── components/
│   ├── Sidebar.tsx
│   ├── ChartArea.tsx
│   ├── IconBar.tsx
│   ├── AnalysisItemsSection.tsx
│   ├── BrandsSection.tsx
│   ├── SegmentsSection.tsx
│   └── SortableBrandItem.tsx
├── constants/
│   ├── constants.ts
│   ├── analysisConfigs.ts
│   └── modeConfigs.ts
├── types.ts
└── utils/
    └── dataTransforms.ts
```

### 2.4 強み

✅ **設定駆動型アーキテクチャ**: `ANALYSIS_MODE_CONFIGS`による柔軟なモード管理  
✅ **型安全性**: TypeScriptによる静的型チェック  
✅ **コンポーネント分割**: UIコンポーネントの適切な分離  
✅ **ユーザー体験**: Drag & Drop、画像エクスポート、CSV出力など充実  
✅ **レスポンシブデザイン**: モバイル対応済み  

---

## 3. 問題点と改善機会

### 3.1 コード品質の問題

#### 🔴 重大度: 高

**P1: App.tsxの肥大化（991行）**
```typescript
// 問題のコード例
const App: React.FC = () => {
  // 50個以上のstate定義
  const [data, setData] = useState<SheetData>({}); // Excel読み込み前提
  const [brandImageData, setBrandImageData] = useState<BrandImageData>({});
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(...);
  // ... 以下40個以上のstate
  
  // 300行以上のExcelパース処理
  const parseExcelData = async (arrayBuffer: ArrayBuffer) => {
    // 巨大な処理ロジック
  };
  
  // 巨大なJSXテンプレート（600行）
  return (
    <div className="...">
      {/* 複雑なネスト構造 */}
    </div>
  );
};
```

**影響**:
- 可読性の低下
- テストの困難さ
- パフォーマンス問題（無駄な再レンダリング）
- 新機能追加の困難さ

---

**P2: 重複コード**

```typescript
// 例1: セグメント名の整形処理が複数箇所に散在
// ChartArea.tsx (3箇所)
seg.replace(/[（(]BFDシート[_＿]?[値]?[）)]?.*?St\d+/g, '').trim()

// Sidebar.tsx (2箇所)
seg.replace(/[（(]BFDシート[_＿]?[値]?[）)]?.*?St\d+/g, '').trim()

// SegmentsSection.tsx (2箇所)
seg.replace(/[（(]BFDシート[_＿]?[値]?[）)]?.*?St\d+/g, '').trim()
```

**影響**:
- バグの混入リスク
- 修正時の変更漏れ
- 保守コストの増大

---

**P3: 型安全性の不足**

```typescript
// 問題のコード例
type BrandImageData = Record<string, Record<string, Record<string, number>>>;
// ネストが深すぎて意味が不明確

// any型の使用
activePalette: any[];
```

**影響**:
- 実行時エラーの可能性
- IDEの補完機能が働きにくい
- リファクタリングの困難さ

---

#### 🟡 重大度: 中

**P4: パフォーマンス問題**

```typescript
// 問題のコード例
const chartData = useMemo(
  () => {
    // 複雑な計算処理
  },
  [data, brandImageData, analysisMode, getFilterValue, getSeriesValues, 
   getXAxisValues, getBrandName] // 依存配列が多すぎる
);
```

**影響**:
- 不要な再計算
- UIの遅延
- メモリ使用量の増加

---

**P5: データ変換ロジックの複雑さ**

```typescript
// dataTransforms.ts
export const transformDataForChart = (
  data: SheetData,
  modeConfig: AnalysisModeConfig,
  filterValues: Record<AxisType, string>,
  seriesValues: Record<AxisType, string[]>,
  labelGetters: Record<AxisType, (key: string) => string>,
  brandImageData?: BrandImageData
): ChartDataPoint[] => {
  // 100行以上の複雑な処理
};
```

**影響**:
- テストの困難さ
- デバッグの難しさ
- 新しいモード追加の困難さ

---

**P6: コンポーネント間の密結合**

```typescript
// Sidebarが受け取るpropsが多すぎる（83個）
interface SidebarProps {
  isExcelData: boolean;
  isAnonymized: boolean;
  toggleAnonymization: () => void;
  // ... 80個以上のprops
}
```

**影響**:
- コンポーネントの再利用が困難
- テストの複雑化
- 変更の影響範囲が広い

---

### 3.2 設計上の問題

**D1: 状態管理の分散**
- Appコンポーネントに全ての状態が集中
- localStorage操作がコンポーネント内に散在
- グローバル状態管理ライブラリ未使用

**D2: ビジネスロジックとUIの混在**
- データ変換処理がコンポーネント内に記述
- Excelパース処理がAppコンポーネント内

**D3: エラーハンドリングの不足**
```typescript
// 問題のコード例
try {
  const arrayBuffer = await response.arrayBuffer();
  await parseExcelData(arrayBuffer);
} catch (error) {
  console.error(error); // エラー処理が不十分
  alert('ファイルの読み込みに失敗しました。');
}
```

**D4: テストの欠如**
- ユニットテスト未実装
- E2Eテスト未実装
- コードカバレッジ0%

---

### 3.3 ドキュメントの問題

**DOC1: インラインコメント不足**
- 複雑なロジックの説明が不足
- 型定義の意図が不明確

**DOC2: アーキテクチャドキュメント不足**
- 設計意図が不明確
- 新規メンバーのオンボーディングが困難

---

## 4. リファクタリング戦略

### 4.1 基本方針

1. **段階的リファクタリング**: 機能を維持しながら少しずつ改善
2. **テストファースト**: リファクタリング前に既存機能のテストを作成
3. **型安全性の強化**: TypeScriptの型システムを最大限活用
4. **パフォーマンス計測**: 改善前後のベンチマーク実施
5. **後方互換性**: 既存データとの互換性を維持

### 4.2 アーキテクチャ改善

#### 新しいディレクトリ構造

```
src/
├── components/           # UIコンポーネント
│   ├── common/          # 共通コンポーネント
│   │   ├── Button/
│   │   ├── Select/
│   │   └── Badge/
│   ├── layout/          # レイアウトコンポーネント
│   │   ├── Sidebar/
│   │   ├── IconBar/
│   │   └── Header/
│   ├── chart/           # チャート関連
│   │   ├── ChartContainer/
│   │   ├── ChartLegend/
│   │   └── ChartTable/
│   └── analysis/        # 分析関連
│       ├── AnalysisControls/
│       ├── BrandSelector/
│       └── SegmentSelector/
├── hooks/               # カスタムフック
│   ├── useChartData.ts
│   ├── useExcelParser.ts
│   ├── useAnalysisMode.ts
│   └── usePersistence.ts
├── services/            # ビジネスロジック
│   ├── excelParser/
│   │   ├── parser.ts
│   │   └── validators.ts
│   ├── dataTransform/
│   │   ├── transformer.ts
│   │   └── aggregator.ts
│   └── export/
│       ├── csvExporter.ts
│       └── imageExporter.ts
├── store/               # 状態管理
│   ├── slices/
│   │   ├── analysisSlice.ts
│   │   ├── dataSlice.ts
│   │   └── uiSlice.ts
│   └── index.ts
├── types/               # 型定義
│   ├── analysis.ts
│   ├── data.ts
│   ├── chart.ts
│   └── index.ts
├── utils/               # ユーティリティ
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── config/              # 設定
│   ├── analysisConfigs.ts
│   └── themeConfigs.ts
└── tests/               # テスト
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 5. フェーズ別実装計画

### Phase 1: 基盤整理（2週間）

#### Week 1: 型定義の整理とユーティリティ分離

**目標**: 型安全性の向上と共通ロジックの分離

**タスク**:

1. **型定義の再構築** (3日)
   ```typescript
   // types/data.ts
   export interface BrandMetrics {
     funnel: FunnelMetrics;
     timeline: TimelineMetrics;
     brandPower: BrandPowerMetrics;
     futurePower: FuturePowerMetrics;
   }
   
   export interface BrandData {
     [brandName: string]: BrandMetrics;
   }
   
   export interface SheetData {
     [sheetName: string]: BrandData;
   }
   
   // types/brandImage.ts
   export interface BrandImageValue {
     itemName: string;
     value: number;
   }
   
   export interface BrandImageData {
     [segmentName: string]: {
       [brandName: string]: BrandImageValue[];
     };
   }
   ```

2. **ユーティリティ関数の分離** (2日)
   ```typescript
   // utils/formatters.ts
   export const formatSegmentName = (segmentName: string): string => {
     return segmentName.replace(/[（(]BFDシート[_＿]?[値]?[）)]?.*?St\d+/g, '').trim();
   };
   
   export const formatBrandName = (
     brandName: string, 
     isAnonymized: boolean, 
     brandMap: Record<string, string>
   ): string => {
     return isAnonymized ? (brandMap[brandName] || brandName) : brandName;
   };
   
   export const formatNumber = (value: number, decimals: number = 1): string => {
     return value.toFixed(decimals);
   };
   ```

3. **定数の整理** (1日)
   ```typescript
   // config/constants.ts
   export const LIMITS = {
     MAX_BRANDS: 10,
     MAX_SEGMENTS: 10,
     TOP_BRAND_IMAGE_ITEMS: 30,
     MIN_CHART_HEIGHT: 200,
     MAX_CHART_HEIGHT: 800,
     DEFAULT_CHART_HEIGHT: 400,
   } as const;
   
   export const STORAGE_KEYS = {
     ANALYSIS_MODE: 'funnel_analysis_mode',
     TARGET_BRAND: 'funnel_target_brand',
     SELECTED_BRANDS: 'funnel_selected_brands',
     SELECTED_SEGMENTS: 'funnel_selected_segments',
     SELECTED_ITEM: 'funnel_selected_item',
     CHART_HEIGHT: 'chart_height',
   } as const;
   
   export const REGEX_PATTERNS = {
     SEGMENT_CLEANUP: /[（(]BFDシート[_＿]?[値]?[）)]?.*?St\d+/g,
   } as const;
   ```

4. **バリデーション関数の作成** (1日)
   ```typescript
   // utils/validators.ts
   export const validateExcelStructure = (data: any[][]): boolean => {
     // Excelデータの構造検証
     return data.length >= 4;
   };
   
   export const validateBrandLimit = (count: number): boolean => {
     return count <= LIMITS.MAX_BRANDS;
   };
   ```

---

#### Week 2: サービス層の分離

**目標**: ビジネスロジックをコンポーネントから分離

**タスク**:

1. **Excelパーサーサービスの分離** (3日)
   ```typescript
   // services/excelParser/parser.ts
   export class ExcelParser {
     async parse(arrayBuffer: ArrayBuffer): Promise<ParsedData> {
       const workbook = read(arrayBuffer);
       const sheetData: SheetData = {};
       const brandImageData: BrandImageData = {};
       
       for (const sheetName of workbook.SheetNames) {
         const parsed = this.parseSheet(workbook.Sheets[sheetName], sheetName);
         sheetData[sheetName] = parsed.brands;
         brandImageData[sheetName] = parsed.brandImages;
       }
       
       return { sheetData, brandImageData };
     }
     
     private parseSheet(worksheet: WorkSheet, sheetName: string): ParsedSheet {
       // シート解析ロジック
     }
   }
   ```

2. **データ変換サービスの改善** (2日)
   ```typescript
   // services/dataTransform/transformer.ts
   export class ChartDataTransformer {
     constructor(private config: AnalysisModeConfig) {}
     
     transform(
       data: SheetData,
       filterValues: FilterValues,
       seriesValues: SeriesValues,
       brandImageData?: BrandImageData
     ): ChartDataPoint[] {
       const strategy = this.getTransformStrategy();
       return strategy.transform(data, filterValues, seriesValues, brandImageData);
     }
     
     private getTransformStrategy(): TransformStrategy {
       // Strategy パターンによる変換ロジックの分離
     }
   }
   ```

3. **エクスポートサービスの作成** (2日)
   ```typescript
   // services/export/csvExporter.ts
   export class CSVExporter {
     export(data: ChartDataPoint[], mode: AnalysisMode): string {
       const strategy = this.getExportStrategy(mode);
       return strategy.export(data);
     }
   }
   
   // services/export/imageExporter.ts
   export class ImageExporter {
     async exportToClipboard(element: HTMLElement): Promise<void> {
       const canvas = await html2canvas(element, {
         backgroundColor: '#ffffff',
         scale: 2,
         logging: false
       });
       
       return new Promise((resolve, reject) => {
         canvas.toBlob(async (blob) => {
           if (!blob) return reject(new Error('Failed to create blob'));
           
           try {
             await navigator.clipboard.write([
               new ClipboardItem({ 'image/png': blob })
             ]);
             resolve();
           } catch (err) {
             reject(err);
           }
         });
       });
     }
   }
   ```

---

### Phase 2: コンポーネント最適化（2週間）

#### Week 3: カスタムフックの導入

**目標**: ロジックの再利用性向上と状態管理の改善

**タスク**:

1. **データ管理フック** (3日)
   ```typescript
   // hooks/useChartData.ts
   export const useChartData = (
     analysisMode: AnalysisMode,
     data: SheetData,
     filterValues: FilterValues,
     seriesValues: SeriesValues,
     brandImageData?: BrandImageData
   ) => {
     return useMemo(() => {
       const config = ANALYSIS_MODE_CONFIGS[analysisMode];
       const transformer = new ChartDataTransformer(config);
       return transformer.transform(data, filterValues, seriesValues, brandImageData);
     }, [analysisMode, data, filterValues, seriesValues, brandImageData]);
   };
   
   // hooks/useExcelParser.ts
   export const useExcelParser = () => {
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState<Error | null>(null);
     
     const parse = useCallback(async (file: File) => {
       setIsLoading(true);
       setError(null);
       
       try {
         const arrayBuffer = await file.arrayBuffer();
         const parser = new ExcelParser();
         const result = await parser.parse(arrayBuffer);
         setIsLoading(false);
         return result;
       } catch (err) {
         setError(err as Error);
         setIsLoading(false);
         throw err;
       }
     }, []);
     
     return { parse, isLoading, error };
   };
   ```

2. **状態永続化フック** (2日)
   ```typescript
   // hooks/usePersistence.ts
   export const usePersistence = <T>(
     key: string,
     initialValue: T
   ): [T, (value: T) => void] => {
     const [state, setState] = useState<T>(() => {
       try {
         const item = localStorage.getItem(key);
         return item ? JSON.parse(item) : initialValue;
       } catch {
         return initialValue;
       }
     });
     
     const setValue = useCallback((value: T) => {
       try {
         setState(value);
         localStorage.setItem(key, JSON.stringify(value));
       } catch (error) {
         console.error(`Failed to persist ${key}:`, error);
       }
     }, [key]);
     
     return [state, setValue];
   };
   
   // 使用例
   const [analysisMode, setAnalysisMode] = usePersistence<AnalysisMode>(
     STORAGE_KEYS.ANALYSIS_MODE,
     'segment_x_multi_brand'
   );
   ```

3. **分析モード管理フック** (2日)
   ```typescript
   // hooks/useAnalysisMode.ts
   export const useAnalysisMode = () => {
     const [mode, setMode] = usePersistence<AnalysisMode>(
       STORAGE_KEYS.ANALYSIS_MODE,
       'segment_x_multi_brand'
     );
     
     const config = useMemo(() => ANALYSIS_MODE_CONFIGS[mode], [mode]);
     
     const changeMode = useCallback((newMode: AnalysisMode) => {
       setMode(newMode);
       // モード変更時の副作用処理
     }, [setMode]);
     
     return {
       mode,
       config,
       changeMode,
     };
   };
   ```

---

#### Week 4: コンポーネントの分割と最適化

**目標**: コンポーネントの責務を明確化し、再利用性を向上

**タスク**:

1. **Appコンポーネントの分割** (4日)
   ```typescript
   // App.tsx (リファクタリング後: 150行)
   const App: React.FC = () => {
     const { mode, config, changeMode } = useAnalysisMode();
     const { data, brandImageData, loadData } = useDataManagement();
     const { chartData } = useChartData(mode, data, ...);
     
     return (
       <div className="flex h-screen">
         <IconBar {...iconBarProps} />
         <Sidebar {...sidebarProps} />
         <MainContent {...mainContentProps} />
       </div>
     );
   };
   
   // components/MainContent.tsx (新規)
   const MainContent: React.FC<MainContentProps> = (props) => {
     return (
       <div className="flex-1 flex flex-col">
         <ChartArea {...chartAreaProps} />
       </div>
     );
   };
   ```

2. **共通コンポーネントの作成** (2日)
   ```typescript
   // components/common/Select/Select.tsx
   export const Select: React.FC<SelectProps> = ({
     value,
     options,
     onChange,
     placeholder,
     ...props
   }) => {
     return (
       <div className="relative">
         <select
           value={value}
           onChange={(e) => onChange(e.target.value)}
           className="w-full p-2.5 pr-8 bg-white border rounded-lg..."
           {...props}
         >
           {placeholder && <option value="">{placeholder}</option>}
           {options.map((opt) => (
             <option key={opt.value} value={opt.value}>
               {opt.label}
             </option>
           ))}
         </select>
         <ChevronDown className="absolute right-2 top-3 w-4 h-4" />
       </div>
     );
   };
   
   // components/common/Badge/Badge.tsx
   export const Badge: React.FC<BadgeProps> = ({ children, variant }) => {
     const variants = {
       primary: 'bg-indigo-100 text-indigo-700 border-indigo-200',
       success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
       warning: 'bg-amber-100 text-amber-700 border-amber-200',
     };
     
     return (
       <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${variants[variant]}`}>
         {children}
       </span>
     );
   };
   ```

3. **メモ化の最適化** (1日)
   ```typescript
   // Before: 過剰なメモ化
   const chartData = useMemo(() => { ... }, [dep1, dep2, dep3, dep4, dep5]);
   
   // After: 適切な粒度でのメモ化
   const filterValues = useMemo(() => ({ ... }), [mode, sheet, targetBrand]);
   const seriesValues = useMemo(() => ({ ... }), [mode, selectedBrands, selectedSegments]);
   const chartData = useChartData(mode, data, filterValues, seriesValues, brandImageData);
   ```

---

### Phase 3: 高度な最適化（2週間）

#### Week 5: 状態管理の導入とテスト整備

**目標**: スケーラブルな状態管理とテストカバレッジの確保

**タスク**:

1. **Zustand導入（軽量な状態管理）** (3日)
   ```typescript
   // store/analysisStore.ts
   import create from 'zustand';
   import { persist } from 'zustand/middleware';
   
   interface AnalysisState {
     mode: AnalysisMode;
     selectedBrands: string[];
     selectedSegments: string[];
     selectedItem: string;
     setMode: (mode: AnalysisMode) => void;
     addBrand: (brand: string) => void;
     removeBrand: (brand: string) => void;
     // ...
   }
   
   export const useAnalysisStore = create<AnalysisState>()(
     persist(
       (set) => ({
         mode: 'segment_x_multi_brand',
         selectedBrands: [],
         selectedSegments: [],
         selectedItem: 'FT',
         setMode: (mode) => set({ mode }),
         addBrand: (brand) => set((state) => ({
           selectedBrands: [...state.selectedBrands, brand]
         })),
         // ...
       }),
       {
         name: 'analysis-storage',
       }
     )
   );
   ```

2. **ユニットテストの作成** (3日)
   ```typescript
   // services/excelParser/parser.test.ts
   describe('ExcelParser', () => {
     it('should parse valid Excel file', async () => {
       const parser = new ExcelParser();
       const result = await parser.parse(mockArrayBuffer);
       
       expect(result.sheetData).toBeDefined();
       expect(Object.keys(result.sheetData)).toHaveLength(5);
     });
     
     it('should throw error for invalid Excel structure', async () => {
       const parser = new ExcelParser();
       await expect(parser.parse(invalidArrayBuffer)).rejects.toThrow();
     });
   });
   
   // hooks/useChartData.test.ts
   describe('useChartData', () => {
     it('should transform data correctly', () => {
       const { result } = renderHook(() =>
         useChartData(mockMode, mockData, mockFilters, mockSeries)
       );
       
       expect(result.current).toHaveLength(6);
       expect(result.current[0].name).toBe('認知あり(TOP2)');
     });
   });
   ```

3. **統合テストの作成** (1日)
   ```typescript
   // tests/integration/chartRendering.test.tsx
   describe('Chart Rendering Integration', () => {
     it('should render chart with selected brands', () => {
       render(
         <App />
       );
       
       // ブランドを選択
       const brandSelect = screen.getByLabelText('ブランドを追加');
       fireEvent.change(brandSelect, { target: { value: 'ベルーナ' } });
       
       // チャートが表示されることを確認
       expect(screen.getByText('ベルーナ')).toBeInTheDocument();
       expect(screen.getByRole('img')).toBeInTheDocument();
     });
   });
   ```

---

#### Week 6: パフォーマンス最適化と仕上げ

**目標**: 最終的なパフォーマンス改善とドキュメント整備

**タスク**:

1. **レンダリング最適化** (2日)
   ```typescript
   // コンポーネントのメモ化
   export const ChartArea = React.memo<ChartAreaProps>(
     ({ analysisMode, chartData, ... }) => {
       // ...
     },
     (prevProps, nextProps) => {
       // カスタム比較関数で不要な再レンダリングを防ぐ
       return (
         prevProps.analysisMode === nextProps.analysisMode &&
         shallowEqual(prevProps.chartData, nextProps.chartData)
       );
     }
   );
   
   // 仮想化の導入（長いリストの場合）
   import { VirtualScroller } from 'react-virtual';
   
   const BrandList = () => {
     const parentRef = useRef();
     const rowVirtualizer = useVirtualizer({
       count: brands.length,
       getScrollElement: () => parentRef.current,
       estimateSize: () => 50,
     });
     
     return (
       <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
         {rowVirtualizer.getVirtualItems().map((virtualRow) => (
           <BrandItem key={virtualRow.key} brand={brands[virtualRow.index]} />
         ))}
       </div>
     );
   };
   ```

2. **バンドルサイズ最適化** (1日)
   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             'react-vendor': ['react', 'react-dom'],
             'chart-vendor': ['recharts'],
             'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable'],
           },
         },
       },
       chunkSizeWarningLimit: 1000,
     },
     optimizeDeps: {
       include: ['xlsx', 'html2canvas'],
     },
   });
   ```

3. **エラーバウンダリの追加** (1日)
   ```typescript
   // components/ErrorBoundary.tsx
   export class ErrorBoundary extends React.Component<Props, State> {
     constructor(props: Props) {
       super(props);
       this.state = { hasError: false, error: null };
     }
     
     static getDerivedStateFromError(error: Error) {
       return { hasError: true, error };
     }
     
     componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
       console.error('Error caught by boundary:', error, errorInfo);
       // エラーログサービスに送信
     }
     
     render() {
       if (this.state.hasError) {
         return (
           <div className="error-container">
             <h2>エラーが発生しました</h2>
             <p>{this.state.error?.message}</p>
             <button onClick={() => window.location.reload()}>
               アプリを再読み込み
             </button>
           </div>
         );
       }
       
       return this.props.children;
     }
   }
   ```

4. **ドキュメント整備** (2日)
   - アーキテクチャ図の作成
   - API仕様書の作成
   - コンポーネントカタログの作成（Storybook）
   - オンボーディングガイドの作成

---

## 6. 技術的詳細

### 6.1 推奨ライブラリ追加

```json
{
  "dependencies": {
    "zustand": "^4.5.0",           // 軽量状態管理
    "zod": "^3.22.0",              // スキーマバリデーション
    "react-virtual": "^2.10.4"     // 仮想スクロール（オプション）
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "vitest": "^1.0.4",
    "@vitest/ui": "^1.0.4",
    "jsdom": "^23.0.1",
    "@storybook/react": "^7.6.3",  // コンポーネントカタログ
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.1.1"
  }
}
```

### 6.2 設定ファイル例

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
    },
  },
});
```

```typescript
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}
```

---

## 7. リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| 既存機能の破壊 | 高 | テストカバレッジ80%以上を確保 |
| パフォーマンス劣化 | 中 | ベンチマーク測定とプロファイリング |
| 開発期間の延長 | 中 | 段階的リリース、MVP優先 |
| チーム学習コスト | 低 | ドキュメント整備、ペアプログラミング |

---

## 8. 成功指標

### 8.1 コード品質指標

| 指標 | 現状 | 目標 |
|------|------|------|
| 平均ファイルサイズ | 400行 | 200行以下 |
| Appコンポーネントサイズ | 991行 | 150行以下 |
| TypeScript型カバレッジ | 85% | 95%以上 |
| テストカバレッジ | 0% | 80%以上 |
| Lintエラー | 0 | 0 |

### 8.2 パフォーマンス指標

| 指標 | 現状 | 目標 |
|------|------|------|
| 初回レンダリング時間 | - | 2秒以下 |
| Excelパース時間（10MB） | - | 3秒以下 |
| チャート描画時間 | - | 500ms以下 |
| バンドルサイズ | - | 500KB以下 |

### 8.3 開発者体験指標

| 指標 | 現状 | 目標 |
|------|------|------|
| 新機能追加時間 | - | 2日以下 |
| バグ修正時間 | - | 半日以下 |
| オンボーディング期間 | - | 1週間以下 |

---

## 9. まとめ

このリファクタリング計画により、BFD Analyticsは以下の改善が期待されます：

✅ **保守性**: 991行のモノリスから明確に分離された構造へ  
✅ **拡張性**: 新しい分析モードの追加が容易に  
✅ **品質**: テストカバレッジ80%以上を確保  
✅ **パフォーマンス**: 最適化により快適なUX  
✅ **開発者体験**: 明確なアーキテクチャで開発効率向上  

段階的なアプローチにより、機能を維持しながら確実に改善を進めることができます。

---

**次のステップ**: 
1. このプランのレビューとフィードバック収集
2. Phase 1のキックオフ
3. 週次進捗レビューの実施

**作成者**: AI Assistant  
**レビュー待ち**: プロジェクトオーナー

