# 過去比較モード - Mode 1 実装詳細設計書

> **実装ステータス**: ✅ **完了** (2025-11-30)  
> **詳細な実装報告**: `HISTORICAL_MODE1_IMPLEMENTATION_REPORT.md` を参照

## 📋 概要

過去比較モードの最初の実装として、Mode 1（ファネル分析①）の詳細な実装仕様を定義する。

### 実装完了機能

- ✅ グローバルモード切り替え（詳細分析 ⇔ 過去比較）
- ✅ 複数データソース管理（最大3ファイル、自動命名機能）
- ✅ データソースのアクティブ/非アクティブ切り替え
- ✅ 過去比較専用の分析モード設定
- ✅ セグメント・ブランドの単一選択（SA）制約
- ✅ 過去比較グラフの描画（棒グラフ・折れ線グラフ）
- ✅ 過去比較データテーブルの表示
- ⏸️ CSV/画像エクスポート機能（Phase 4: 保留）

---

## 🎯 実装目標

- 複数時点のデータを同一グラフ上で比較可能にする
- 既存のMode 1の実装を最大限活用する
- 拡張性を考慮し、Mode 2-14への展開を容易にする

---

## 📊 Mode 1 仕様（再掲）

### 詳細分析モード - Mode 1（既存）

```
モード名: ファネル分析①（セグメント: X=ファネル①×ブランド）
分析項目: セグメント (SA)
X軸: ファネル① (FT, FN, FC, FP, FS)
データ系列: ブランド（複数選択可能）

設定例:
- セグメント: 全体
- ブランド: ブランドA, ブランドB, ブランドC

グラフ:
  X軸: FT, FN, FC, FP, FS
  凡例: ブランドA, ブランドB, ブランドC
```

### 過去比較モード - Mode 1（新規）

```
モード名: ファネル分析①（過去比較: X=ファネル①×期間）
分析項目: セグメント (SA) × ブランド (SA)
X軸: ファネル① (FT, FN, FC, FP, FS)
データ系列: データソース（複数、最大3）

設定例:
- セグメント: 全体（SA）
- ブランド: ブランドA（SA）
- データソース: 2024年1月, 2023年12月, 2023年11月

グラフ:
  X軸: FT, FN, FC, FP, FS
  凡例: 2024年1月, 2023年12月, 2023年11月
```

---

## 🏗️ アーキテクチャ設計

### データフロー

```
┌─────────────────────────────────────────┐
│ 1. ユーザー操作                         │
│    - グローバルモード選択: 過去比較     │
│    - 分析モード選択: Mode 1             │
│    - セグメント選択: 全体               │
│    - ブランド選択: ブランドA            │
│    - データソース選択: 3つON            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 2. 状態管理                             │
│    - useGlobalMode                      │
│    - useMultiDataSource                 │
│    - useAnalysisState                   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 3. データ変換                           │
│    - transformDataForHistoricalChart    │
│      └─ 各データソースからメトリクス抽出 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 4. グラフ表示                           │
│    - ChartArea                          │
│      └─ BarChart / LineChart            │
└─────────────────────────────────────────┘
```

### コンポーネント構成

```
App.tsx
├── Sidebar.tsx
│   ├── GlobalModeTab (新規)
│   │   └── [詳細分析] [過去比較]
│   ├── DataSourceManager (新規)
│   │   ├── DataSourceItem × 3
│   │   │   ├── ToggleSwitch
│   │   │   ├── EditButton
│   │   │   └── DeleteButton
│   │   └── AddDataSourceButton
│   ├── AnalysisModeSection
│   ├── SegmentSection (SA制限)
│   ├── BrandSection (SA制限) ← 過去比較モード時
│   └── AnalysisItemsSection
└── ChartArea.tsx
    ├── ChartComponent
    └── DataTable
```

---

## 🔧 詳細実装仕様

### 1. 型定義

#### 1.1 データソース型 (`src/types/dataSource.ts`)

```typescript
/**
 * データソース（1ファイル分のデータ）
 */
export interface DataSource {
  /** 一意識別子 */
  id: string;
  
  /** 表示名（編集可能） */
  name: string;
  
  /** 元ファイル名 */
  fileName: string;
  
  /** アップロード日時 */
  uploadedAt: Date;
  
  /** 実データ */
  data: Record<string, Record<string, FunnelMetrics | TimelineMetrics>>;
  
  /** ブランドイメージデータ */
  brandImageData?: Record<string, BrandImageData>;
  
  /** グラフ表示ON/OFF */
  isActive: boolean;
}

/**
 * 複数データソース管理状態
 */
export interface MultiDataSourceState {
  /** データソースリスト（最大3） */
  dataSources: DataSource[];
  
  /** 詳細分析モードで使用中のID */
  currentSourceId: string | null;
}
```

#### 1.2 グローバルモード型 (`src/types/globalMode.ts`)

```typescript
/**
 * グローバルモード
 */
export type GlobalMode = 'detailed' | 'historical';

/**
 * グローバルモード設定
 */
export interface GlobalModeConfig {
  /** 現在のモード */
  mode: GlobalMode;
  
  /** ブランド選択方式 */
  brandSelectionMode: 'single' | 'multiple';
  
  /** セグメント選択方式 */
  segmentSelectionMode: 'single' | 'multiple';
}
```

---

### 2. カスタムフック

#### 2.1 `useMultiDataSource` (`src/hooks/useMultiDataSource.ts`)

```typescript
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DataSource, MultiDataSourceState } from '../types/dataSource';
import { usePersistence } from './usePersistence';

export const useMultiDataSource = () => {
  const [state, setState] = usePersistence<MultiDataSourceState>(
    'multiDataSource',
    { dataSources: [], currentSourceId: null }
  );

  /**
   * ファイル名から期間名を抽出
   */
  const extractDateFromFilename = useCallback((filename: string): string => {
    const patterns = [
      { regex: /(\d{4})[_-](\d{1,2})/, format: (m: RegExpMatchArray) => `${m[1]}年${parseInt(m[2])}月` },
      { regex: /(\d{4})[_-]?Q([1-4])/i, format: (m: RegExpMatchArray) => `${m[1]}年Q${m[2]}` },
      { regex: /(\d{4})(\d{2})/, format: (m: RegExpMatchArray) => `${m[1]}年${parseInt(m[2])}月` },
      { regex: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(\d{4})/i, format: (m: RegExpMatchArray) => {
        const months: Record<string, string> = {
          Jan: '1', Feb: '2', Mar: '3', Apr: '4', May: '5', Jun: '6',
          Jul: '7', Aug: '8', Sep: '9', Oct: '10', Nov: '11', Dec: '12'
        };
        return `${m[2]}年${months[m[1]]}月`;
      }},
      { regex: /(\d{4})[_-]?(\d{2})[_-]?(\d{2})/, format: (m: RegExpMatchArray) => `${m[1]}年${parseInt(m[2])}月${parseInt(m[3])}日` }
    ];

    for (const pattern of patterns) {
      const match = filename.match(pattern.regex);
      if (match) {
        return pattern.format(match);
      }
    }

    // フォールバック: データ1, データ2, データ3
    const index = state.dataSources.length + 1;
    return `データ${index}`;
  }, [state.dataSources.length]);

  /**
   * データソース追加
   */
  const addDataSource = useCallback(async (
    file: File,
    parseExcelData: (file: File) => Promise<any>
  ): Promise<DataSource | null> => {
    if (state.dataSources.length >= 3) {
      alert('データソースは最大3つまで追加できます。');
      return null;
    }

    try {
      const result = await parseExcelData(file);
      const dataSource: DataSource = {
        id: uuidv4(),
        name: extractDateFromFilename(file.name),
        fileName: file.name,
        uploadedAt: new Date(),
        data: result.sheetData,
        brandImageData: result.brandImageData,
        isActive: true
      };

      setState({
        ...state,
        dataSources: [...state.dataSources, dataSource],
        currentSourceId: state.currentSourceId || dataSource.id
      });

      return dataSource;
    } catch (error) {
      console.error('データソース追加エラー:', error);
      return null;
    }
  }, [state, setState, extractDateFromFilename]);

  /**
   * データソース削除
   */
  const removeDataSource = useCallback((id: string) => {
    const newDataSources = state.dataSources.filter(ds => ds.id !== id);
    setState({
      dataSources: newDataSources,
      currentSourceId: state.currentSourceId === id 
        ? (newDataSources[0]?.id || null)
        : state.currentSourceId
    });
  }, [state, setState]);

  /**
   * データソース名更新
   */
  const updateDataSourceName = useCallback((id: string, name: string) => {
    setState({
      ...state,
      dataSources: state.dataSources.map(ds =>
        ds.id === id ? { ...ds, name } : ds
      )
    });
  }, [state, setState]);

  /**
   * データソースの表示/非表示切り替え
   */
  const toggleDataSourceActive = useCallback((id: string) => {
    const currentActive = state.dataSources.filter(ds => ds.isActive).length;
    const targetSource = state.dataSources.find(ds => ds.id === id);
    
    // 最後の1つをOFFにしようとしたらエラー
    if (targetSource?.isActive && currentActive <= 1) {
      alert('最低1つのデータソースは有効にしてください。');
      return;
    }

    setState({
      ...state,
      dataSources: state.dataSources.map(ds =>
        ds.id === id ? { ...ds, isActive: !ds.isActive } : ds
      )
    });
  }, [state, setState]);

  /**
   * 現在のデータソース設定（詳細分析モード用）
   */
  const setCurrentSource = useCallback((id: string) => {
    setState({ ...state, currentSourceId: id });
  }, [state, setState]);

  /**
   * アクティブなデータソース取得
   */
  const getActiveDataSources = useCallback(() => {
    return state.dataSources.filter(ds => ds.isActive);
  }, [state.dataSources]);

  return {
    dataSources: state.dataSources,
    currentSourceId: state.currentSourceId,
    addDataSource,
    removeDataSource,
    updateDataSourceName,
    toggleDataSourceActive,
    setCurrentSource,
    getActiveDataSources
  };
};
```

#### 2.2 `useGlobalMode` (`src/hooks/useGlobalMode.ts`)

```typescript
import { useCallback } from 'react';
import { usePersistence } from './usePersistence';
import { GlobalMode, GlobalModeConfig } from '../types/globalMode';

export const useGlobalMode = () => {
  const [globalMode, setGlobalMode] = usePersistence<GlobalMode>(
    'globalMode',
    'detailed'
  );

  /**
   * グローバルモード設定取得
   */
  const getConfig = useCallback((): GlobalModeConfig => {
    return {
      mode: globalMode,
      brandSelectionMode: globalMode === 'historical' ? 'single' : 'multiple',
      segmentSelectionMode: globalMode === 'historical' ? 'single' : 'multiple'
    };
  }, [globalMode]);

  /**
   * 過去比較モードかどうか
   */
  const isHistoricalMode = useCallback(() => {
    return globalMode === 'historical';
  }, [globalMode]);

  return {
    globalMode,
    setGlobalMode,
    getConfig,
    isHistoricalMode
  };
};
```

---

### 3. データ変換ロジック

#### 3.1 過去比較用データ変換 (`utils/dataTransforms.ts` に追加)

```typescript
/**
 * 過去比較モード用のチャートデータ変換
 */
export function transformDataForHistoricalChart(
  dataSources: DataSource[],
  analysisMode: AnalysisMode,
  selectedSegment: string,
  selectedBrand: string,
  selectedItem: string,
  labelGetters: Record<AxisType, (key: string) => string>
): ChartData | null {
  const config = ANALYSIS_MODE_CONFIGS[analysisMode];
  if (!config || !config.axes) return null;

  const activeSources = dataSources.filter(ds => ds.isActive);
  if (activeSources.length === 0) return null;

  // X軸カテゴリ取得
  const xAxisConfig = config.axes.items;
  let categories: string[] = [];

  if (xAxisConfig.role === 'X_AXIS') {
    const itemSet = xAxisConfig.itemSet || 'funnel';
    const itemKeys = getItemKeysForSet(itemSet);
    categories = itemKeys.map(key => labelGetters.items(key));
  }

  // データ系列作成（各データソースごと）
  const series: ChartSeries[] = activeSources.map(source => {
    const segmentData = source.data[selectedSegment];
    if (!segmentData) {
      return { name: source.name, data: categories.map(() => 0) };
    }

    const brandData = segmentData[selectedBrand];
    if (!brandData) {
      return { name: source.name, data: categories.map(() => 0) };
    }

    // メトリクスデータ抽出
    const itemSet = xAxisConfig.itemSet || 'funnel';
    const itemKeys = getItemKeysForSet(itemSet);
    const data = itemKeys.map(key => {
      const value = brandData[key as keyof typeof brandData];
      return typeof value === 'number' ? value : 0;
    });

    return {
      name: source.name,
      data
    };
  });

  return {
    categories,
    series
  };
}
```

---

### 4. UIコンポーネント

#### 4.1 グローバルモードタブ (`components/GlobalModeTab.tsx`)

```typescript
import React from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';
import { GlobalMode } from '../src/types/globalMode';

interface GlobalModeTabProps {
  globalMode: GlobalMode;
  setGlobalMode: (mode: GlobalMode) => void;
}

export const GlobalModeTab: React.FC<GlobalModeTabProps> = ({
  globalMode,
  setGlobalMode
}) => {
  return (
    <div className="flex border-b border-gray-200 mb-4">
      <button
        onClick={() => setGlobalMode('detailed')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
          globalMode === 'detailed'
            ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
        }`}
      >
        <BarChart2 className="w-4 h-4" />
        詳細分析
      </button>
      <button
        onClick={() => setGlobalMode('historical')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
          globalMode === 'historical'
            ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
        }`}
      >
        <TrendingUp className="w-4 h-4" />
        過去比較
      </button>
    </div>
  );
};
```

#### 4.2 データソース管理 (`components/DataSourceManager.tsx`)

```typescript
import React, { useState } from 'react';
import { Database, Edit2, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { DataSource } from '../src/types/dataSource';

interface DataSourceManagerProps {
  dataSources: DataSource[];
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
  onUpdateName: (id: string, name: string) => void;
  onToggleActive: (id: string) => void;
}

export const DataSourceManager: React.FC<DataSourceManagerProps> = ({
  dataSources,
  onAdd,
  onRemove,
  onUpdateName,
  onToggleActive
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSave = (id: string) => {
    if (editingName.trim()) {
      onUpdateName(id, editingName.trim());
    }
    setEditingId(null);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
        <Database className="w-3 h-3" /> データソース管理
      </label>

      <div className="space-y-2">
        {dataSources.map(source => (
          <div
            key={source.id}
            className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg"
          >
            {/* トグルスイッチ */}
            <button
              onClick={() => onToggleActive(source.id)}
              className="flex-shrink-0"
            >
              {source.isActive ? (
                <Eye className="w-4 h-4 text-indigo-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* 名前表示/編集 */}
            <div className="flex-1">
              {editingId === source.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleSave(source.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave(source.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="w-full px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength={20}
                  autoFocus
                />
              ) : (
                <span className={`text-sm ${source.isActive ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                  {source.name}
                </span>
              )}
            </div>

            {/* 編集・削除ボタン */}
            <button
              onClick={() => handleEdit(source.id, source.name)}
              className="p-1 text-gray-500 hover:text-indigo-600 rounded"
              title="名前を編集"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                if (confirm(`「${source.name}」を削除しますか?`)) {
                  onRemove(source.id);
                }
              }}
              className="p-1 text-gray-500 hover:text-red-600 rounded"
              title="削除"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* ファイル追加ボタン */}
      {dataSources.length < 3 && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onAdd(file);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            ファイル追加 ({dataSources.length}/3)
          </button>
        </div>
      )}
    </div>
  );
};
```

---

### 5. App.tsx の改修

#### 5.1 フック追加

```typescript
import { useGlobalMode } from './src/hooks/useGlobalMode';
import { useMultiDataSource } from './src/hooks/useMultiDataSource';

const App: React.FC = () => {
  // グローバルモード
  const { globalMode, setGlobalMode, isHistoricalMode } = useGlobalMode();
  
  // マルチデータソース
  const {
    dataSources,
    addDataSource,
    removeDataSource,
    updateDataSourceName,
    toggleDataSourceActive,
    getActiveDataSources
  } = useMultiDataSource();

  // ... 既存のフック
```

#### 5.2 データソース追加ハンドラ

```typescript
const handleAddDataSource = useCallback(async (file: File) => {
  const result = await addDataSource(file, loadFromFile);
  if (result) {
    alert(`データソース「${result.name}」を追加しました。`);
  }
}, [addDataSource, loadFromFile]);
```

#### 5.3 チャートデータ生成の分岐

```typescript
const chartData = useMemo(() => {
  if (isHistoricalMode()) {
    // 過去比較モード
    return transformDataForHistoricalChart(
      getActiveDataSources(),
      analysisMode,
      sheet, // selectedSegment
      targetBrand, // selectedBrand
      selectedItem,
      labelGetters
    );
  } else {
    // 詳細分析モード（既存）
    return transformDataForChart(
      data,
      config,
      filterValues,
      seriesValues,
      labelGetters,
      brandImageData
    );
  }
}, [isHistoricalMode, dataSources, analysisMode, sheet, targetBrand, selectedItem, ...]);
```

---

### 6. Sidebar.tsx の改修

#### 6.1 グローバルモードタブ追加

```typescript
<Sidebar ...>
  {/* グローバルモードタブ */}
  <GlobalModeTab
    globalMode={globalMode}
    setGlobalMode={setGlobalMode}
  />

  {/* データソース管理（過去比較モード時のみ） */}
  {globalMode === 'historical' && (
    <DataSourceManager
      dataSources={dataSources}
      onAdd={handleAddDataSource}
      onRemove={removeDataSource}
      onUpdateName={updateDataSourceName}
      onToggleActive={toggleDataSourceActive}
    />
  )}

  {/* 既存のセクション */}
  <AnalysisModeSection ... />
  <SegmentSection ... />
  <BrandSection ... />
  ...
</Sidebar>
```

---

## 🧪 テスト計画

### ユニットテスト

| 対象 | テストケース |
|------|------------|
| `extractDateFromFilename` | 各種パターンの日付抽出 |
| `addDataSource` | 正常追加、最大数制限 |
| `toggleDataSourceActive` | 最低1つON制約 |
| `transformDataForHistoricalChart` | 正しいデータ変換 |

### 統合テスト

| ID | テストケース | 期待結果 |
|----|-------------|---------|
| IT-01 | 過去比較モード選択 | UIがSAに制限される |
| IT-02 | データソース3つ追加 | 全て表示される |
| IT-03 | データソースOFF切り替え | グラフから系列が消える |
| IT-04 | Mode 1でグラフ生成 | 凡例にデータソース名 |

### E2Eテスト

| ID | シナリオ |
|----|---------|
| E2E-01 | ファイル3つアップロード → 過去比較モード → Mode 1 → グラフ確認 |
| E2E-02 | データソース名編集 → グラフ凡例に反映確認 |
| E2E-03 | CSV エクスポート → フォーマット確認 |

---

## 📋 実装チェックリスト

### Phase 1: 型定義・基盤
- [ ] `src/types/dataSource.ts` 作成
- [ ] `src/types/globalMode.ts` 作成
- [ ] `uuid` パッケージ追加 (`npm install uuid @types/uuid`)

### Phase 2: フック実装
- [ ] `src/hooks/useMultiDataSource.ts` 実装
- [ ] `src/hooks/useGlobalMode.ts` 実装
- [ ] 既存フックとの統合テスト

### Phase 3: データ変換
- [ ] `transformDataForHistoricalChart` 実装
- [ ] ユニットテスト作成

### Phase 4: UI コンポーネント
- [ ] `components/GlobalModeTab.tsx` 実装
- [ ] `components/DataSourceManager.tsx` 実装
- [ ] スタイリング調整

### Phase 5: 統合
- [ ] `App.tsx` 改修
- [ ] `Sidebar.tsx` 改修
- [ ] グローバルモード切り替え動作確認

### Phase 6: テスト・デバッグ
- [ ] ユニットテスト実行
- [ ] 統合テスト実行
- [ ] E2Eテスト実行
- [ ] バグ修正

### Phase 7: ドキュメント
- [ ] README更新
- [ ] CHANGELOG更新
- [ ] 使い方ガイド作成

---

## 🚀 リリース計画

### v3.0.0-alpha.1
- データソース管理機能
- グローバルモード切り替え
- 過去比較モード - Mode 1

### v3.0.0-beta.1
- 過去比較モード - Mode 2-14
- CSV/画像エクスポート対応
- バグ修正

### v3.0.0
- 正式リリース
- ドキュメント完備
- パフォーマンス最適化

---

**文書バージョン**: 1.0  
**作成日**: 2025-11-30  
**最終更新日**: 2025-11-30  
**ステータス**: ✅ レビュー完了

