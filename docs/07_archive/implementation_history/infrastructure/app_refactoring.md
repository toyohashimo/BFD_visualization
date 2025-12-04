# App.tsx 肥大化対策 - 詳細実装計画

## 現状分析: App.tsx (991行)

### 責務の混在（Single Responsibility Principle違反）

現在のApp.tsxは以下の責務を全て担っています：

1. **データ管理** - Excel読み込み、パース、保存
2. **状態管理** - 50個以上のstate管理
3. **UI制御** - レイアウト、表示/非表示
4. **ビジネスロジック** - データ変換、フィルタリング
5. **永続化** - localStorage操作
6. **イベント処理** - ファイルアップロード、D&D、クリック
7. **レンダリング** - 複雑なJSXテンプレート

---

## リファクタリング戦略: 7つの分割

```
App.tsx (991行)
    ↓
├── App.tsx (150行) ..................... メイン統合
├── hooks/ (250行) ....................... カスタムフック
│   ├── useAnalysisState.ts (60行)
│   ├── useDataManagement.ts (80行)
│   ├── useChartConfiguration.ts (50行)
│   └── usePersistence.ts (60行)
├── services/ (300行) .................... ビジネスロジック
│   ├── ExcelParser.ts (150行)
│   ├── DataExporter.ts (80行)
│   └── ImageExporter.ts (70行)
├── components/ (200行) .................. UIコンポーネント
│   ├── MainContent.tsx (100行)
│   └── MobileHeader.tsx (100行)
└── utils/ (91行) ........................ ユーティリティ
    ├── formatters.ts (40行)
    └── validators.ts (51行)

合計: 991行 → 991行（分散により保守性向上）
App.tsx: 991行 → 150行（84%削減）
```

---

## Step-by-Step 分割計画

### Step 1: カスタムフック抽出（Day 1-2）

#### 1.1 データ管理フック

**抽出前（App.tsx内）:**
```typescript
const [data, setData] = useState<SheetData>({});
const [brandImageData, setBrandImageData] = useState<BrandImageData>({});
const [isExcelData, setIsExcelData] = useState(false);
const [isUploading, setIsUploading] = useState(false);

const parseExcelData = async (arrayBuffer: ArrayBuffer) => {
  // 217行の巨大関数
};

const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  // ファイル処理
};
```

**抽出後（hooks/useDataManagement.ts）:**
```typescript
// hooks/useDataManagement.ts
import { useState, useCallback } from 'react';
import { ExcelParser } from '../services/excelParser/ExcelParser';
import { SheetData, BrandImageData } from '../types';

export const useDataManagement = () => {
  const [data, setData] = useState<SheetData>({});
  const [brandImageData, setBrandImageData] = useState<BrandImageData>({});
  const [isExcelData, setIsExcelData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadFromFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const parser = new ExcelParser();
      const result = await parser.parse(arrayBuffer);
      
      setData(result.sheetData);
      setBrandImageData(result.brandImageData);
      setIsExcelData(true);
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFromUrl = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const arrayBuffer = await response.arrayBuffer();
      const parser = new ExcelParser();
      const result = await parser.parse(arrayBuffer);
      
      setData(result.sheetData);
      setBrandImageData(result.brandImageData);
      setIsExcelData(true);
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData({});
    setBrandImageData({});
    setIsExcelData(false);
    setError(null);
  }, []);

  return {
    data,
    brandImageData,
    isExcelData,
    isLoading,
    error,
    loadFromFile,
    loadFromUrl,
    reset,
  };
};
```

**App.tsx での使用:**
```typescript
// App.tsx
const { 
  data, 
  brandImageData, 
  isExcelData, 
  isLoading, 
  loadFromFile, 
  loadFromUrl 
} = useDataManagement();

// 991行 → 6行（985行削減）
```

---

#### 1.2 分析状態管理フック

**抽出前（App.tsx内）:**
```typescript
const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(() => {
  // localStorage読み込みロジック
});

const [sheet, setSheet] = useState<string>('');
const [targetBrand, setTargetBrand] = useState<string>(() => {
  // localStorage読み込みロジック
});
const [selectedSegments, setSelectedSegments] = useState<string[]>(() => {
  // localStorage読み込みロジック
});
const [selectedItem, setSelectedItem] = useState<keyof FunnelMetrics>(() => {
  // localStorage読み込みロジック
});
const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
  // localStorage読み込みロジック
});

// 各種useEffect（localStorage同期）
useEffect(() => {
  localStorage.setItem('funnel_analysis_mode', analysisMode);
}, [analysisMode]);

useEffect(() => {
  localStorage.setItem('funnel_selected_segments', JSON.stringify(selectedSegments));
}, [selectedSegments]);

// ... 他多数
```

**抽出後（hooks/useAnalysisState.ts）:**
```typescript
// hooks/useAnalysisState.ts
import { usePersistence } from './usePersistence';
import { AnalysisMode } from '../types';
import { STORAGE_KEYS } from '../config/constants';

export const useAnalysisState = () => {
  const [mode, setMode] = usePersistence<AnalysisMode>(
    STORAGE_KEYS.ANALYSIS_MODE,
    'segment_x_multi_brand'
  );

  const [selectedBrands, setSelectedBrands] = usePersistence<string[]>(
    STORAGE_KEYS.SELECTED_BRANDS,
    []
  );

  const [selectedSegments, setSelectedSegments] = usePersistence<string[]>(
    STORAGE_KEYS.SELECTED_SEGMENTS,
    []
  );

  const [selectedItem, setSelectedItem] = usePersistence<string>(
    STORAGE_KEYS.SELECTED_ITEM,
    'FT'
  );

  const [targetBrand, setTargetBrand] = usePersistence<string>(
    STORAGE_KEYS.TARGET_BRAND,
    ''
  );

  const [sheet, setSheet] = usePersistence<string>(
    STORAGE_KEYS.SELECTED_SHEET,
    ''
  );

  // 便利なヘルパーメソッド
  const addBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) return false;
    if (selectedBrands.length >= 10) return false;
    setSelectedBrands([...selectedBrands, brand]);
    return true;
  };

  const removeBrand = (brand: string) => {
    setSelectedBrands(selectedBrands.filter(b => b !== brand));
  };

  const addSegment = (segment: string) => {
    if (selectedSegments.includes(segment)) return false;
    if (selectedSegments.length >= 10) return false;
    setSelectedSegments([...selectedSegments, segment]);
    return true;
  };

  const removeSegment = (segment: string) => {
    setSelectedSegments(selectedSegments.filter(s => s !== segment));
  };

  return {
    // State
    mode,
    selectedBrands,
    selectedSegments,
    selectedItem,
    targetBrand,
    sheet,
    
    // Setters
    setMode,
    setSelectedBrands,
    setSelectedSegments,
    setSelectedItem,
    setTargetBrand,
    setSheet,
    
    // Helpers
    addBrand,
    removeBrand,
    addSegment,
    removeSegment,
  };
};
```

**App.tsx での使用:**
```typescript
// App.tsx
const {
  mode,
  selectedBrands,
  selectedSegments,
  selectedItem,
  targetBrand,
  sheet,
  setMode,
  addBrand,
  removeBrand,
  addSegment,
  removeSegment,
  // ... 他
} = useAnalysisState();

// 約120行 → 20行（100行削減）
```

---

#### 1.3 チャート設定フック

**抽出前（App.tsx内）:**
```typescript
const [chartType, setChartType] = useState<ChartType>('bar');
const [showDataLabels, setShowDataLabels] = useState<boolean>(true);
const [useAutoScale, setUseAutoScale] = useState<boolean>(true);
const [yAxisMax, setYAxisMax] = useState<number | ''>('');
const [currentTheme, setCurrentTheme] = useState<string>('default');
const [isAnonymized, setIsAnonymized] = useState(true);

const activePalette = useMemo(() => 
  COLOR_THEMES[currentTheme].palette, 
  [currentTheme]
);

const toggleAnonymization = () => {
  if (!isExcelData) return;
  setIsAnonymized(prev => !prev);
};
```

**抽出後（hooks/useChartConfiguration.ts）:**
```typescript
// hooks/useChartConfiguration.ts
import { useState, useMemo, useCallback } from 'react';
import { usePersistence } from './usePersistence';
import { ChartType } from '../types';
import { COLOR_THEMES } from '../config/themeConfigs';
import { STORAGE_KEYS } from '../config/constants';

export const useChartConfiguration = (isExcelData: boolean) => {
  const [chartType, setChartType] = usePersistence<ChartType>(
    STORAGE_KEYS.CHART_TYPE,
    'bar'
  );

  const [showDataLabels, setShowDataLabels] = useState(true);
  const [useAutoScale, setUseAutoScale] = useState(true);
  const [yAxisMax, setYAxisMax] = useState<number | ''>('');
  
  const [currentTheme, setCurrentTheme] = usePersistence<string>(
    STORAGE_KEYS.COLOR_THEME,
    'default'
  );

  const [isAnonymized, setIsAnonymized] = useState(true);

  const activePalette = useMemo(
    () => COLOR_THEMES[currentTheme].palette,
    [currentTheme]
  );

  const toggleAnonymization = useCallback(() => {
    if (!isExcelData) return;
    setIsAnonymized(prev => !prev);
  }, [isExcelData]);

  return {
    chartType,
    setChartType,
    showDataLabels,
    setShowDataLabels,
    useAutoScale,
    setUseAutoScale,
    yAxisMax,
    setYAxisMax,
    currentTheme,
    setCurrentTheme,
    activePalette,
    isAnonymized,
    toggleAnonymization,
  };
};
```

**App.tsx での使用:**
```typescript
// App.tsx
const chartConfig = useChartConfiguration(isExcelData);

// 約30行 → 1行（29行削減）
```

---

### Step 2: イベントハンドラー分離（Day 3）

#### 2.1 エクスポート処理をサービス化

**抽出前（App.tsx内）:**
```typescript
const handleCopyImage = async (target: 'chart' | 'combined') => {
  // 60行の処理
};

const handleExportCSV = useCallback(() => {
  // 90行の処理
}, [data, analysisMode, selectedBrands, ...]);
```

**抽出後（services/export/）:**
```typescript
// services/export/ImageExporter.ts
export class ImageExporter {
  async exportToClipboard(element: HTMLElement): Promise<void> {
    // 実装
  }
}

// services/export/CSVExporter.ts
export class CSVExporter {
  export(data: ChartDataPoint[], mode: AnalysisMode): string {
    // 実装
  }
}

// hooks/useExport.ts
export const useExport = () => {
  const imageExporter = useMemo(() => new ImageExporter(), []);
  const csvExporter = useMemo(() => new CSVExporter(), []);
  
  const copyImage = useCallback(async (ref: HTMLElement) => {
    await imageExporter.exportToClipboard(ref);
  }, [imageExporter]);
  
  const downloadCSV = useCallback((data: ChartDataPoint[], mode: AnalysisMode) => {
    const csv = csvExporter.export(data, mode);
    // ダウンロード処理
  }, [csvExporter]);
  
  return { copyImage, downloadCSV };
};
```

**App.tsx での使用:**
```typescript
// App.tsx
const { copyImage, downloadCSV } = useExport();

// 150行 → 1行（149行削減）
```

---

### Step 3: コンポーネント分割（Day 4）

#### 3.1 MainContent コンポーネント

**抽出前（App.tsx内のJSX）:**
```typescript
return (
  <div className="flex h-screen">
    {/* IconBar */}
    {/* Sidebar */}
    {/* Mobile Header */}
    {/* Main Content - 230行の複雑なJSX */}
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        <ChartArea {...props} />
      </div>
    </div>
  </div>
);
```

**抽出後:**
```typescript
// components/layout/MainContent.tsx
export const MainContent: React.FC<MainContentProps> = ({
  analysisMode,
  data,
  chartData,
  chartConfig,
  ...props
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative md:pt-0 pt-16">
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        <ChartArea
          analysisMode={analysisMode}
          chartData={chartData}
          {...chartConfig}
          {...props}
        />
      </div>
    </div>
  );
};

// components/layout/MobileHeader.tsx
export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onMenuClick
}) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b">
      {/* モバイルヘッダー */}
    </div>
  );
};
```

**App.tsx での使用:**
```typescript
// App.tsx
return (
  <ErrorBoundary>
    <div className="flex h-screen">
      <IconBar {...iconBarProps} />
      <SidebarContainer {...sidebarProps} />
      <MobileHeader onMenuClick={() => setShowMobileMenu(true)} />
      <MainContent
        analysisMode={mode}
        data={data}
        chartData={chartData}
        {...chartConfig}
      />
    </div>
  </ErrorBoundary>
);

// 230行 → 15行（215行削減）
```

---

## 最終的なApp.tsx（150行）

```typescript
// App.tsx (リファクタリング後: 150行)
import React, { useState } from 'react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { IconBar } from './components/layout/IconBar';
import { SidebarContainer } from './components/layout/SidebarContainer';
import { MobileHeader } from './components/layout/MobileHeader';
import { MainContent } from './components/layout/MainContent';

// カスタムフック
import { useDataManagement } from './hooks/useDataManagement';
import { useAnalysisState } from './hooks/useAnalysisState';
import { useChartConfiguration } from './hooks/useChartConfiguration';
import { useChartData } from './hooks/useChartData';
import { useExport } from './hooks/useExport';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useColorMapping } from './hooks/useColorMapping';

/**
 * メインアプリケーションコンポーネント
 * 
 * 責務:
 * - アプリケーション全体の構造定義
 * - カスタムフックによる状態管理の統合
 * - 各サブコンポーネントへのprops受け渡し
 */
const App: React.FC = () => {
  // データ管理（Excel読み込み、パース）
  const {
    data,
    brandImageData,
    isExcelData,
    isLoading: isDataLoading,
    loadFromFile,
    loadFromUrl,
  } = useDataManagement();

  // 分析状態（モード、選択項目）
  const {
    mode,
    selectedBrands,
    selectedSegments,
    selectedItem,
    targetBrand,
    sheet,
    setMode,
    addBrand,
    removeBrand,
    addSegment,
    removeSegment,
    setSelectedItem,
    setTargetBrand,
    setSheet,
  } = useAnalysisState();

  // チャート設定（グラフタイプ、表示オプション）
  const chartConfig = useChartConfiguration(isExcelData);

  // チャートデータ生成
  const chartData = useChartData(
    mode,
    data,
    { items: selectedItem, segments: sheet, brands: targetBrand },
    { items: [], segments: selectedSegments, brands: selectedBrands },
    brandImageData
  );

  // エクスポート機能
  const { copyImage, downloadCSV } = useExport();

  // ドラッグ&ドロップ
  const { sensors, handleDragEnd } = useDragAndDrop(
    selectedBrands,
    selectedSegments,
    (items) => /* update brands */,
    (items) => /* update segments */
  );

  // 色マッピング
  const { brandColorIndices, segmentColorIndices } = useColorMapping(
    selectedBrands,
    selectedSegments
  );

  // UI状態（ローカル）
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // refs
  const chartRef = useRef<HTMLDivElement>(null);
  const combinedRef = useRef<HTMLDivElement>(null);

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-white text-gray-800 font-sans overflow-hidden">
        {/* デスクトップ用アイコンバー */}
        <div className="hidden md:block">
          <IconBar
            chartType={chartConfig.chartType}
            setChartType={chartConfig.setChartType}
            onCopyImage={() => copyImage(chartRef.current!)}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        </div>

        {/* デスクトップ用サイドバー */}
        <SidebarContainer
          collapsed={sidebarCollapsed}
          analysisMode={mode}
          onModeChange={setMode}
          onFileLoad={loadFromFile}
          onUrlLoad={loadFromUrl}
          isLoading={isDataLoading}
          chartConfig={chartConfig}
          analysisState={{
            selectedBrands,
            selectedSegments,
            selectedItem,
            targetBrand,
            sheet,
          }}
          onAnalysisStateChange={{
            addBrand,
            removeBrand,
            addSegment,
            removeSegment,
            setSelectedItem,
            setTargetBrand,
            setSheet,
          }}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          colorIndices={{ brands: brandColorIndices, segments: segmentColorIndices }}
          onExport={{
            copyImage: () => copyImage(combinedRef.current!),
            downloadCSV: () => downloadCSV(chartData, mode),
          }}
        />

        {/* モバイルUI */}
        <MobileHeader
          onMenuClick={() => setShowMobileMenu(true)}
        />

        {/* モバイル用サイドバーオーバーレイ */}
        {showMobileMenu && (
          <MobileSidebarOverlay
            onClose={() => setShowMobileMenu(false)}
            {.../* 同じprops */}
          />
        )}

        {/* メインコンテンツ */}
        <MainContent
          ref={combinedRef}
          chartRef={chartRef}
          analysisMode={mode}
          data={data}
          chartData={chartData}
          chartConfig={chartConfig}
          analysisState={{
            selectedBrands,
            selectedSegments,
            selectedItem,
            targetBrand,
            sheet,
          }}
          colorIndices={{ brands: brandColorIndices, segments: segmentColorIndices }}
          getBrandName={(brand) => 
            chartConfig.isAnonymized ? brandMap[brand] : brand
          }
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
```

---

## 削減効果まとめ

| 項目 | 削減前 | 削減後 | 削減量 | 削減率 |
|------|--------|--------|--------|--------|
| **合計行数** | 991行 | 150行 | -841行 | **-84.9%** |
| import | 41行 | 20行 | -21行 | -51.2% |
| state定義 | 50行 | 10行 | -40行 | -80.0% |
| useEffect | 200行 | 0行 | -200行 | -100% |
| ハンドラー | 150行 | 10行 | -140行 | -93.3% |
| parseExcelData | 217行 | 0行 | -217行 | -100% |
| useMemo/useCallback | 100行 | 20行 | -80行 | -80.0% |
| JSX | 230行 | 90行 | -140行 | -60.9% |

---

## 段階的移行スケジュール

### Week 4: Day 1-2
- ✅ `useDataManagement` フック作成
- ✅ `useAnalysisState` フック作成
- ✅ `usePersistence` フック作成
- 🧪 ユニットテスト作成

### Week 4: Day 3
- ✅ `useChartConfiguration` フック作成
- ✅ `ExcelParser` サービス作成
- ✅ `ImageExporter`, `CSVExporter` サービス作成
- 🧪 統合テスト作成

### Week 4: Day 4
- ✅ `MainContent` コンポーネント作成
- ✅ `MobileHeader` コンポーネント作成
- ✅ `SidebarContainer` コンポーネント作成
- 🧪 E2Eテスト作成

### Week 4: Day 5
- ✅ App.tsx への統合
- ✅ 機能テスト（全モード）
- ✅ パフォーマンステスト
- ✅ 旧コードの削除

---

## 成功基準

### 定量的指標
- ✅ App.tsx が 150行以下
- ✅ 各カスタムフックが 100行以下
- ✅ テストカバレッジ 80%以上
- ✅ ESLint エラー 0件

### 定性的指標
- ✅ 単一責任の原則を遵守
- ✅ 各モジュールが独立してテスト可能
- ✅ 新機能追加が容易
- ✅ コードレビューが容易

---

**この計画により、App.tsxの肥大化問題を完全に解決します！**

