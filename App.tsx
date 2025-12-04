import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { BarChart2, Menu, Upload, Activity, Settings } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// 新しい型定義をインポート
import {
  ChartType,
  AnalysisMode,
  AxisType,
  FUNNEL_LABELS,
  FUNNEL_KEYS,
  TIMELINE_LABELS,
  BRAND_POWER_LABELS,
  FUTURE_POWER_LABELS,
  ARCHETYPE_LABELS,
  GlobalMode,
  DataSource,
} from './src/types';

// 既存の定数とコンポーネントをインポート
import {
  ANALYSIS_MODE_CONFIGS,
  HISTORICAL_ANALYSIS_MODE_CONFIGS,
  HISTORICAL_ANALYSIS_MODE_ORDER
} from './constants/analysisConfigs';
import { Sidebar } from './components/Sidebar';
import { ChartArea } from './components/ChartArea';
import { IconBar } from './components/IconBar';
import { GlobalModeTab } from './components/GlobalModeTab';
import { DataSourceManager } from './components/DataSourceManager';
import { SettingsModal } from './components/SettingsModal';
import { transformDataForChart, transformDataForHistoricalChart, transformDataForHistoricalBrandImage, transformDataForHistoricalBrandsComparison, transformDataForHistoricalBrandImageBrandsComparison } from './utils/dataTransforms';

// 新しいフックをインポート
import { useDataManagement } from './src/hooks/useDataManagement';
import { useAnalysisState } from './src/hooks/useAnalysisState';
import { useChartConfiguration } from './src/hooks/useChartConfiguration';
import { useColorMapping } from './src/hooks/useColorMapping';
import { useDragAndDrop } from './src/hooks/useDragAndDrop';
import { useImageExport } from './src/hooks/useImageExport';
import { useCSVExport } from './src/hooks/useCSVExport';
import { useMultiDataSource } from './src/hooks/useMultiDataSource';
import { useGlobalMode } from './src/hooks/useGlobalMode';
import { useExcelParser } from './src/hooks/useExcelParser';
import { useAISettings } from './src/hooks/useAISettings';

/**
 * メインアプリケーションコンポーネント (リファクタリング後)
 * 
 * 責務:
 * - アプリケーション全体の構造定義
 * - カスタムフックによる状態管理の統合
 * - 各サブコンポーネントへのprops受け渡し
 * 
 * リファクタリング: 991行 → 約200行
 */
const App: React.FC = () => {
  // グローバルモード管理
  const {
    globalMode,
    setGlobalMode,
    isHistoricalMode,
  } = useGlobalMode();

  // グローバルモードに応じた分析モード設定（メモ化して無限ループを防ぐ）
  const currentModeConfigs = useMemo(() => {
    return globalMode === 'historical'
      ? HISTORICAL_ANALYSIS_MODE_CONFIGS
      : ANALYSIS_MODE_CONFIGS;
  }, [globalMode]);

  // マルチデータソース管理（過去比較モード用）
  const {
    dataSources,
    addDataSource,
    addDirectDataSource,
    removeDataSource,
    updateDataSourceName,
    toggleDataSourceActive,
    getActiveDataSources,
    getCurrentSource,
    clearAllDataSources,
  } = useMultiDataSource();

  // データ管理 (Excel読み込み、パース)
  const {
    data,
    brandImageData,
    isExcelData,
    currentFileName,
    isLoading: isDataLoading,
    loadFromFile,
    loadFromArrayBuffer,
    reset: resetData,
    hasData: hasDataFromHook,
  } = useDataManagement();

  // 過去比較モード専用のExcelパーサー（useDataManagementの状態に影響しない）
  const historicalParser = useExcelParser();

  // データの有効性チェック
  const hasValidData = useMemo(() => {
    if (globalMode === 'historical') {
      // 過去比較モード: dataSourcesにデータがあるかチェック
      return dataSources.length > 0 && dataSources.some(ds => ds.data && Object.keys(ds.data).length > 0);
    } else {
      // 詳細分析モード: dataにデータがあるかチェック
      return Object.keys(data).length > 0;
    }
  }, [data, dataSources, globalMode]);

  // 分析状態 (モード、選択項目)
  const {
    mode: analysisMode,
    selectedBrands,
    selectedSegments,
    selectedItem,
    targetBrand,
    sheet,
    setMode: setAnalysisMode,
    setSelectedBrands,
    setSelectedSegments,
    setSelectedItem,
    setTargetBrand,
    setSheet,
    addBrand: handleAddBrand,
    removeBrand: handleRemoveBrand,
    clearBrands: handleClearAllBrands,
    addSegment: handleAddSegment,
    removeSegment: handleRemoveSegment,
    clearSegments: handleClearAllSegments,
  } = useAnalysisState();

  // データが無い場合、モード1にリセット
  useEffect(() => {
    const defaultMode = globalMode === 'historical' ? 'historical_funnel1_segment_brand' : 'funnel_segment_brands';
    if (!hasValidData && analysisMode !== defaultMode) {
      setAnalysisMode(defaultMode);
    }
  }, [hasValidData, analysisMode, setAnalysisMode, globalMode]);

  // analysisModeが無効な場合、デフォルトモードにフォールバック
  useEffect(() => {
    if (analysisMode && !currentModeConfigs[analysisMode]) {
      console.warn(`Invalid analysis mode: ${analysisMode}, falling back to default`);
      const defaultMode = globalMode === 'historical' ? 'historical_funnel1_segment_brand' : 'funnel_segment_brands';
      setAnalysisMode(defaultMode);
    }
  }, [analysisMode, setAnalysisMode, currentModeConfigs, globalMode]);

  // sheetの初期化
  useEffect(() => {
    if (hasValidData && !sheet) {
      const firstSheet = Object.keys(data)[0];
      if (firstSheet) {
        setSheet(firstSheet);
      }
    }
  }, [hasValidData, sheet, data, setSheet]);

  // チャート設定（過去比較モードではdataSourcesの有無で判定）
  const effectiveIsExcelData = globalMode === 'historical'
    ? dataSources.length > 0
    : isExcelData;
  const chartConfig = useChartConfiguration(effectiveIsExcelData);

  // analysisModeが変更された時に、defaultChartTypeがあればチャートタイプを設定
  // ただし、ユーザーが手動で変更した場合は上書きしないように、各モードで一度だけ設定する
  const lastModeRef = useRef<AnalysisMode | null>(null);
  useEffect(() => {
    if (analysisMode && analysisMode !== lastModeRef.current) {
      const config = currentModeConfigs[analysisMode];
      if (config && config.defaultChartType) {
        chartConfig.setChartType(config.defaultChartType);
      }
      lastModeRef.current = analysisMode;
    }
  }, [analysisMode, chartConfig.setChartType, currentModeConfigs]);

  // モード切り替え時のデフォルト選択設定
  useEffect(() => {
    if (!hasValidData || !analysisMode) return;

    const config = currentModeConfigs[analysisMode];
    if (!config || !config.axes) return;

    // ブランドのデフォルト選択
    if (config.axes.brands) {
      const brandsRole = config.axes.brands.role;
      const allowMulti = config.axes.brands.allowMultiple !== false;

      // 利用可能なブランドリストを取得
      const availableBrands = Object.keys(data[sheet] || {});

      if (brandsRole === 'FILTER') {
        // FILTER役割: targetBrandが空ならデフォルト設定
        if (!targetBrand && availableBrands.length > 0) {
          setTargetBrand(availableBrands[0]);
        }
      } else {
        // SERIES/X_AXIS役割: selectedBrandsが空ならデフォルト設定
        if (selectedBrands.length === 0 && availableBrands.length > 0) {
          if (allowMulti) {
            // 複数選択可能: 1～3番目のブランド
            setSelectedBrands(availableBrands.slice(0, Math.min(3, availableBrands.length)));
          } else {
            // 単一選択のみ: 1番目のブランド
            setSelectedBrands([availableBrands[0]]);
          }
        }
      }
    }

    // セグメントのデフォルト選択
    if (config.axes.segments) {
      const segmentsRole = config.axes.segments.role;
      const allowMulti = config.axes.segments.allowMultiple !== false;

      // 利用可能なセグメントリストを取得
      const availableSegments = Object.keys(data);
      const defaultSegments = [
        availableSegments.find(s => s.includes('全体')) || availableSegments[0],
        availableSegments.find(s => s.includes('男性')),
        availableSegments.find(s => s.includes('女性'))
      ].filter(Boolean) as string[];

      if (segmentsRole === 'FILTER') {
        // FILTER役割: sheetが空ならデフォルト設定
        if (!sheet && defaultSegments.length > 0) {
          setSheet(defaultSegments[0]); // 「全体」を優先
        }
      } else {
        // SERIES/X_AXIS役割: selectedSegmentsが空ならデフォルト設定
        if (selectedSegments.length === 0 && defaultSegments.length > 0) {
          if (allowMulti) {
            // 複数選択可能: 全体、男性、女性
            setSelectedSegments(defaultSegments);
          } else {
            // 単一選択のみ: 全体
            setSelectedSegments([defaultSegments[0]]);
          }
        }
      }
    }
  }, [analysisMode, hasValidData, data, sheet, targetBrand, selectedBrands, selectedSegments,
    setTargetBrand, setSelectedBrands, setSheet, setSelectedSegments, currentModeConfigs]);

  // 色マッピング
  const { brandColorIndices, segmentColorIndices } = useColorMapping(
    selectedBrands,
    selectedSegments
  );

  // ドラッグ&ドロップ
  const { sensors, handleDragEnd } = useDragAndDrop(
    selectedBrands,
    selectedSegments,
    setSelectedBrands,
    setSelectedSegments
  );

  // AI設定管理（デバッグモード用）
  const { settings, saveSettings, toggleDebugMode, getEffectiveApiKey } = useAISettings();

  // デバッグモード: APIキー自動設定（開発環境のみ）
  const handleSetDebugApiKey = useCallback((apiKey: string) => {
    // setTimeoutで次のティックに遅延させて、レンダリング中のstate更新を回避
    setTimeout(() => {
      saveSettings({ ...settings, apiKey });
      console.log('[App] Debug API key configured via IconBar');
    }, 0);
  }, [settings, saveSettings]);

  // UI状態
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // refs
  const chartRef = useRef<HTMLDivElement>(null);
  const combinedRef = useRef<HTMLDivElement>(null);

  // 画像エクスポート
  const { copyImage } = useImageExport();

  // データ管理のヘルパー
  const allUniqueBrands = useMemo(() => {
    if (globalMode === 'historical') {
      // 過去比較モード: dataSourcesから全ブランドを抽出
      const brands = new Set<string>();
      dataSources.forEach(ds => {
        if (ds.data) {
          Object.values(ds.data).forEach(sheetData => {
            Object.keys(sheetData).forEach(b => brands.add(b));
          });
        }
      });
      return Array.from(brands);
    } else {
      // 詳細分析モード: dataから全ブランドを抽出
      const brands = new Set<string>();
      Object.values(data).forEach(sheetData => {
        Object.keys(sheetData).forEach(b => brands.add(b));
      });
      return Array.from(brands);
    }
  }, [data, dataSources, globalMode]);

  const availableBrands = useMemo(() => {
    if (globalMode === 'historical') {
      // 過去比較モード: dataSourcesから選択されたシートのブランドを抽出
      const brands = new Set<string>();
      dataSources.forEach(ds => {
        if (ds.data && ds.data[sheet]) {
          Object.keys(ds.data[sheet]).forEach(b => brands.add(b));
        }
      });
      return Array.from(brands);
    } else {
      // 詳細分析モード: dataから選択されたシートのブランドを抽出
      return Object.keys(data[sheet] || {});
    }
  }, [data, sheet, dataSources, globalMode]);

  const availableSegments = useMemo(() => {
    if (globalMode === 'historical') {
      // 過去比較モード: dataSourcesから全シート名を抽出（重複を除く）
      const segments = new Set<string>();
      dataSources.forEach(ds => {
        if (ds.data) {
          Object.keys(ds.data).forEach(seg => segments.add(seg));
        }
      });
      return Array.from(segments);
    } else {
      // 詳細分析モード: dataから全シート名を抽出
      return Object.keys(data);
    }
  }, [data, dataSources, globalMode]);

  // ブランドマップ (匿名化用)
  const brandMap = useMemo(() => {
    const map: Record<string, string> = {};
    allUniqueBrands.forEach((brand, index) => {
      map[brand] = `ブランド${index + 1}`;
    });
    return map;
  }, [allUniqueBrands]);

  const getBrandName = useCallback((originalName: string) => {
    if (!chartConfig.isAnonymized) return originalName;
    // When anonymized, only return mapped name if it exists, otherwise empty string
    // This prevents real brand names from appearing during data loading
    return brandMap[originalName] || '';
  }, [chartConfig.isAnonymized, brandMap]);

  // モード1が自動選択された際に、ブランドとセグメントが未選択の場合は最初のものを自動選択
  useEffect(() => {
    if (hasValidData && analysisMode === 'funnel_segment_brands') {
      // セグメントが未選択の場合、最初のセグメントを選択
      if (!sheet && availableSegments.length > 0) {
        setSheet(availableSegments[0]);
      }
      // ブランドが未選択の場合、最初のブランドを選択
      if (selectedBrands.length === 0 && availableBrands.length > 0) {
        setSelectedBrands([availableBrands[0]]);
      }
    }
  }, [hasValidData, analysisMode, sheet, availableSegments, selectedBrands, availableBrands, setSheet, setSelectedBrands]);

  // CSV エクスポート
  const { exportCSV } = useCSVExport(
    data,
    analysisMode,
    sheet,
    targetBrand,
    selectedBrands,
    selectedSegments,
    selectedItem,
    getBrandName
  );

  // targetBrandの初期化
  useEffect(() => {
    if (!targetBrand && allUniqueBrands.length > 0) {
      setTargetBrand(allUniqueBrands[0]);
    }
  }, [allUniqueBrands, targetBrand, setTargetBrand]);


  // Helper functions
  const getFilterValue = useCallback((axisType: AxisType): string => {
    if (!analysisMode) return '';
    const config = currentModeConfigs[analysisMode];
    if (!config || !config.axes || !config.axes[axisType]) return '';
    const role = config.axes[axisType].role;

    if (role === 'FILTER') {
      switch (axisType) {
        case 'segments': return sheet;
        case 'brands': return targetBrand;
        case 'items': return selectedItem;
      }
    }
    return '';
  }, [analysisMode, sheet, targetBrand, selectedItem, currentModeConfigs]);

  const getSeriesValues = useCallback((axisType: AxisType): string[] => {
    if (!analysisMode) return [];
    const config = currentModeConfigs[analysisMode];
    if (!config || !config.axes || !config.axes[axisType]) return [];
    const role = config.axes[axisType].role;

    if (role === 'SERIES') {
      switch (axisType) {
        case 'brands': return selectedBrands;
        case 'segments': return selectedSegments;
        case 'items': return [];
      }
    }
    return [];
  }, [analysisMode, selectedBrands, selectedSegments, currentModeConfigs]);

  const getXAxisValues = useCallback((axisType: AxisType): string[] => {
    if (!analysisMode) return [];
    const config = currentModeConfigs[analysisMode];
    if (!config || !config.axes || !config.axes[axisType]) return [];
    const role = config.axes[axisType].role;

    if (role === 'X_AXIS') {
      switch (axisType) {
        case 'brands': return selectedBrands;
        case 'segments': return selectedSegments;
        case 'items': return [];
      }
    }
    return [];
  }, [analysisMode, selectedBrands, selectedSegments, currentModeConfigs]);

  // チャートデータ生成
  const chartData = useMemo(() => {
    // analysisMode が有効でない場合は早期リターン
    if (!analysisMode) return null;

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

      // Mode 2: ブランド軸の過去比較（ファネル①）（X軸=ブランド、系列=データソース）
      if (analysisMode === 'historical_funnel1_brands_comparison') {
        return transformDataForHistoricalBrandsComparison(
          activeSources,
          config,
          sheet, // selectedSegment
          selectedBrands, // 複数ブランド
          selectedItem || 'FT', // デフォルトはFT（認知）
          labelGetters
        );
      }

      // Mode 4: ブランド軸の過去比較（ファネル②）（X軸=ブランド、系列=データソース）
      if (analysisMode === 'historical_funnel2_brands_comparison') {
        return transformDataForHistoricalBrandsComparison(
          activeSources,
          config,
          sheet, // selectedSegment
          selectedBrands, // 複数ブランド
          selectedItem || 'T1', // デフォルトはT1（直近1年以内）
          labelGetters
        );
      }

      // Mode 6: ブランドイメージ分析（ブランド軸）（X軸=ブランド、系列=データソース）
      if (analysisMode === 'historical_brand_image_brands_comparison') {
        return transformDataForHistoricalBrandImageBrandsComparison(
          activeSources,
          config,
          sheet, // selectedSegment
          selectedBrands, // 複数ブランド
          selectedItem || '', // ブランドイメージ項目（TOP1がデフォルト）
          labelGetters,
          brandImageData
        );
      }

      // Mode 5: ブランドイメージ分析（項目軸）の場合は専用関数を使用
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

      // その他の固定項目モード（Mode 1, 2など）
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
    getFilterValue,
    getSeriesValues,
    getXAxisValues,
    getBrandName,
    isHistoricalMode,
    getActiveDataSources
  ]);

  // ファイルアップロード処理
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadFromFile(file).then((result) => {
        if (result) {
          const firstSheet = Object.keys(result.sheetData)[0];
          if (firstSheet) {
            setSheet(firstSheet);
            const brands = Object.keys(result.sheetData[firstSheet]).slice(0, 3);
            setSelectedBrands(brands);
          }
        }
      }).catch((error) => {
        console.error(error);
        alert('ファイルの読み込みに失敗しました。');
      });
    }
  };

  // メインエリア用のファイルドロップ処理
  const handleMainAreaDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadFromFile(e.dataTransfer.files[0]).then((result) => {
        if (result) {
          const firstSheet = Object.keys(result.sheetData)[0];
          if (firstSheet) {
            setSheet(firstSheet);
            const brands = Object.keys(result.sheetData[firstSheet]).slice(0, 3);
            setSelectedBrands(brands);
          }
        }
      }).catch((error) => {
        console.error(error);
        alert('ファイルの読み込みに失敗しました。');
      });
    }
  }, [loadFromFile, setSheet, setSelectedBrands]);

  const handleMainAreaDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleMainAreaClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClearAll = () => {
    if (analysisMode === 'funnel_segment_brands') {
      handleClearAllBrands();
    } else {
      handleClearAllSegments();
    }
  };

  // データソース追加ハンドラ（過去比較モード用）
  const handleAddDataSource = useCallback(async (file: File) => {
    // 過去比較モード専用のパーサーを使用（useDataManagementの状態に影響しない）
    const parseArrayBuffer = async (buffer: ArrayBuffer) => {
      return await historicalParser.parseFromArrayBuffer(buffer);
    };

    const result = await addDataSource(file, parseArrayBuffer);
    if (result) {
      console.log(`データソース「${result.name}」を追加しました`);

      // 最初のデータソース追加時、シートとブランドを自動選択
      if (result.data && Object.keys(result.data).length > 0) {
        const firstSheet = Object.keys(result.data)[0];
        if (firstSheet && !sheet) {
          setSheet(firstSheet);
        }

        // ブランドが未選択の場合、最初のブランドを選択
        if (selectedBrands.length === 0 && result.data[firstSheet]) {
          const firstBrand = Object.keys(result.data[firstSheet])[0];
          if (firstBrand) {
            setSelectedBrands([firstBrand]);
          }
        }
      }
    }
  }, [addDataSource, historicalParser.parseFromArrayBuffer, sheet, selectedBrands, setSheet, setSelectedBrands]);

  // 詳細分析モード：データクリア時の処理
  // 注意：このuseEffectは詳細分析モード専用で、過去比較モードの状態には影響しない
  useEffect(() => {
    // 厳密な条件：現在詳細分析モードで、かつデータがない場合のみリセット
    if (globalMode !== 'detailed') return;
    if (hasDataFromHook) return;

    // DEMOモードをONに（共有状態だが、詳細分析モードのみで使用）
    chartConfig.forceAnonymization();

    // 注意：セグメント・ブランドのクリアは両モードで共有されるため、
    // ここではDEMOモードの切り替えのみを行う
    // セグメント・ブランドは各モードで個別に管理されるべき
  }, [globalMode, hasDataFromHook, chartConfig.forceAnonymization]);

  // 過去比較モード：データソースが0個になった時の処理
  // 注意：このuseEffectは過去比較モード専用で、詳細分析モードの状態には影響しない
  useEffect(() => {
    // 厳密な条件：現在過去比較モードで、かつデータソースが0個の場合のみリセット
    if (globalMode !== 'historical') return;
    if (dataSources.length > 0) return;

    // DEMOモードをONに（共有状態だが、過去比較モードのみで使用）
    chartConfig.forceAnonymization();

    // 注意：セグメント・ブランドのクリアは両モードで共有されるため、
    // ここではDEMOモードの切り替えのみを行う
  }, [globalMode, dataSources.length, chartConfig.forceAnonymization]);

  // リロード時の警告（データがリセットされることを通知）
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 過去比較モードでデータソースが存在する場合
      if (globalMode === 'historical' && dataSources.length > 0) {
        e.preventDefault();
        e.returnValue = ''; // Chromeでは空文字列が必要
        return ''; // 一部のブラウザでは戻り値が必要
      }

      // 詳細分析モードでデータが存在する場合
      if (globalMode === 'detailed' && hasValidData) {
        e.preventDefault();
        e.returnValue = ''; // Chromeでは空文字列が必要
        return ''; // 一部のブラウザでは戻り値が必要
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [globalMode, dataSources.length, hasValidData]);

  // グローバルモード切り替え時の処理
  const handleGlobalModeChange = useCallback((newMode: GlobalMode) => {
    // 詳細分析→過去比較に切り替えた場合
    if (newMode === 'historical' && globalMode === 'detailed') {
      // 過去比較モードのデフォルト分析モードに切り替え
      setAnalysisMode('historical_funnel1_segment_brand');
    } else if (newMode === 'detailed' && globalMode === 'historical') {
      // 過去比較→詳細分析に切り替えた場合
      // 詳細分析モードのデフォルト分析モードに切り替え
      setAnalysisMode('funnel_segment_brands');
    }

    setGlobalMode(newMode);
  }, [globalMode, setGlobalMode, setAnalysisMode]);

  return (
    <div className="flex h-screen bg-white text-gray-800 font-sans overflow-hidden">
      {/* Desktop Icon Bar */}
      <div className="hidden md:block">
        <IconBar
          chartType={chartConfig.chartType}
          setChartType={chartConfig.setChartType}
          handleCopyImage={(target) => copyImage(target === 'chart' ? chartRef.current : combinedRef.current, target === 'chart')}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          onOpenSettings={() => setShowSettingsModal(true)}
          onSetDebugApiKey={handleSetDebugApiKey}
          isDebugMode={settings.isDebugMode}
          onToggleDebugMode={toggleDebugMode}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden md:block ${sidebarCollapsed ? 'w-0' : 'w-80'} bg-white shadow-xl z-20 flex-shrink-0 border-r border-gray-200 h-full overflow-hidden transition-all duration-300`}>
        {!sidebarCollapsed && (
          <Sidebar
            globalMode={globalMode}
            setGlobalMode={handleGlobalModeChange}
            hasData={hasValidData}
            dataSources={dataSources}
            onAddDataSource={handleAddDataSource}
            onRemoveDataSource={removeDataSource}
            onUpdateDataSourceName={updateDataSourceName}
            onToggleDataSourceActive={toggleDataSourceActive}
            onResetAllDataSources={clearAllDataSources}
            isExcelData={globalMode === 'historical' ? dataSources.length > 0 : isExcelData}
            currentFileName={currentFileName}
            isAnonymized={chartConfig.isAnonymized}
            toggleAnonymization={chartConfig.toggleAnonymization}
            isUploading={isDataLoading}
            onFileSelect={handleFileInput}
            onFileDrop={(file) => {
              loadFromFile(file).then((result) => {
                if (result) {
                  const firstSheet = Object.keys(result.sheetData)[0];
                  if (firstSheet) {
                    setSheet(firstSheet);
                    const brands = Object.keys(result.sheetData[firstSheet]).slice(0, 3);
                    setSelectedBrands(brands);
                  }
                }
              });
            }}
            onClearData={resetData}
            analysisMode={analysisMode}
            setAnalysisMode={setAnalysisMode}
            sheet={sheet}
            setSheet={setSheet}
            data={data}
            targetBrand={targetBrand}
            setTargetBrand={setTargetBrand}
            allUniqueBrands={allUniqueBrands}
            getBrandName={getBrandName}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            chartType={chartConfig.chartType}
            setChartType={chartConfig.setChartType}
            showDataLabels={chartConfig.showDataLabels}
            setShowDataLabels={chartConfig.setShowDataLabels}
            useAutoScale={chartConfig.useAutoScale}
            setUseAutoScale={chartConfig.setUseAutoScale}
            currentTheme={chartConfig.currentTheme}
            setCurrentTheme={chartConfig.setCurrentTheme}
            activePalette={chartConfig.activePalette}
            handleClearAll={handleClearAll}
            handleAddBrand={handleAddBrand}
            availableBrands={availableBrands}
            selectedBrands={selectedBrands}
            handleAddSegment={handleAddSegment}
            availableSegments={availableSegments}
            selectedSegments={selectedSegments}
            sensors={sensors}
            handleDragEnd={handleDragEnd}
            brandColorIndices={brandColorIndices}
            segmentColorIndices={segmentColorIndices}
            handleRemoveBrand={handleRemoveBrand}
            handleRemoveSegment={handleRemoveSegment}
            handleClearAllBrands={handleClearAllBrands}
            handleClearAllSegments={handleClearAllSegments}
            handleCopyImage={(target) => copyImage(target === 'chart' ? chartRef.current : combinedRef.current, target === 'chart')}
            handleExportCSV={exportCSV}
            yAxisMax={chartConfig.yAxisMax}
            setYAxisMax={chartConfig.setYAxisMax}
          />
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowMobileMenu(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 md:hidden ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          globalMode={globalMode}
          setGlobalMode={handleGlobalModeChange}
          hasData={hasValidData}
          dataSources={dataSources}
          onAddDataSource={handleAddDataSource}
          onRemoveDataSource={removeDataSource}
          onUpdateDataSourceName={updateDataSourceName}
          onToggleDataSourceActive={toggleDataSourceActive}
          onResetAllDataSources={clearAllDataSources}
          isExcelData={isExcelData}
          currentFileName={currentFileName}
          isAnonymized={chartConfig.isAnonymized}
          toggleAnonymization={chartConfig.toggleAnonymization}
          isUploading={isDataLoading}
          onFileSelect={handleFileInput}
          onFileDrop={(file) => {
            loadFromFile(file).then((result) => {
              if (result) {
                const firstSheet = Object.keys(result.sheetData)[0];
                if (firstSheet) {
                  setSheet(firstSheet);
                  const brands = Object.keys(result.sheetData[firstSheet]).slice(0, 3);
                  setSelectedBrands(brands);
                }
              }
            });
          }}
          onClearData={resetData}
          analysisMode={analysisMode}
          setAnalysisMode={setAnalysisMode}
          sheet={sheet}
          setSheet={setSheet}
          data={data}
          targetBrand={targetBrand}
          setTargetBrand={setTargetBrand}
          allUniqueBrands={allUniqueBrands}
          getBrandName={getBrandName}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          chartType={chartConfig.chartType}
          setChartType={chartConfig.setChartType}
          showDataLabels={chartConfig.showDataLabels}
          setShowDataLabels={chartConfig.setShowDataLabels}
          useAutoScale={chartConfig.useAutoScale}
          setUseAutoScale={chartConfig.setUseAutoScale}
          currentTheme={chartConfig.currentTheme}
          setCurrentTheme={chartConfig.setCurrentTheme}
          activePalette={chartConfig.activePalette}
          handleClearAll={handleClearAll}
          handleAddBrand={handleAddBrand}
          availableBrands={availableBrands}
          selectedBrands={selectedBrands}
          handleAddSegment={handleAddSegment}
          availableSegments={availableSegments}
          selectedSegments={selectedSegments}
          sensors={sensors}
          handleDragEnd={handleDragEnd}
          brandColorIndices={brandColorIndices}
          segmentColorIndices={segmentColorIndices}
          handleRemoveBrand={handleRemoveBrand}
          handleRemoveSegment={handleRemoveSegment}
          handleClearAllBrands={handleClearAllBrands}
          handleClearAllSegments={handleClearAllSegments}
          handleCopyImage={(target) => copyImage(target === 'chart' ? chartRef.current : combinedRef.current, target === 'chart')}
          handleExportCSV={exportCSV}
          yAxisMax={chartConfig.yAxisMax}
          setYAxisMax={chartConfig.setYAxisMax}
        />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-indigo-600" />
          <span className="font-bold text-indigo-900">BFD Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            onDoubleClick={(e) => {
              if (e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();

                // デバッグモードをトグル（localStorageを直接操作）
                const currentDebugMode = localStorage.getItem('ai_summary_debug_mode') === 'true';
                const newDebugMode = !currentDebugMode;
                localStorage.setItem('ai_summary_debug_mode', newDebugMode.toString());

                // 他のコンポーネントに通知
                window.dispatchEvent(new Event('ai_settings_changed'));

                console.log(`[Debug Mode] ${newDebugMode ? 'ON' : 'OFF'}`);

                // 環境変数（デフォルトAPIキー）を反映させるためにページをリロード
                setTimeout(() => {
                  window.location.reload();
                }, 100);
              }
            }}
            className={`p-2 rounded-lg transition-all ${getEffectiveApiKey()
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
            title={settings.apiKey ? "設定（カスタムAPIキー）" : settings.isDebugMode ? "設定（DEBUGモード）" : "設定"}
            aria-label="設定"
          >
            <Settings className={`w-6 h-6 transition-transform ${getEffectiveApiKey() ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={() => setShowMobileMenu(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative md:pt-0 pt-16">
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {!hasValidData ? (
            // データが無い場合: ファイルアップロードを促す画面
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-2xl">
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
                  onDragEnter={handleMainAreaDrag}
                  onDragLeave={handleMainAreaDrag}
                  onDragOver={handleMainAreaDrag}
                  onDrop={handleMainAreaDrop}
                  onClick={handleMainAreaClick}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileInput}
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-full shadow-lg">
                      {isDataLoading ? (
                        <Activity className="w-12 h-12 animate-spin text-indigo-600" />
                      ) : (
                        <Upload className="w-12 h-12 text-indigo-600" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-800">
                        {isDataLoading ? 'データを読み込み中...' : 'Excelファイルをアップロード'}
                      </h2>
                      <p className="text-gray-600">
                        ファイルをドラッグ&ドロップするか、クリックして選択してください
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        対応形式: .xlsx, .xls, .csv（3行目ヘッダー形式）
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : !sheet ? (
            // データはあるがsheetが設定されていない場合: ローディング画面
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600">データを読み込み中...</p>
              </div>
            </div>
          ) : (
            // データとsheetが揃っている場合: チャート表示
            <ChartArea
              globalMode={globalMode}
              analysisMode={analysisMode}
              sheet={sheet}
              targetBrand={targetBrand}
              selectedBrands={selectedBrands}
              selectedSegments={selectedSegments}
              dataSources={dataSources}
              chartData={chartData || []}
              chartType={chartConfig.chartType}
              showDataLabels={chartConfig.showDataLabels}
              useAutoScale={chartConfig.useAutoScale}
              activePalette={chartConfig.activePalette}
              brandColorIndices={brandColorIndices}
              segmentColorIndices={segmentColorIndices}
              getBrandName={getBrandName}
              combinedRef={combinedRef}
              chartRef={chartRef}
              data={data}
              selectedItem={selectedItem}
              yAxisMax={chartConfig.yAxisMax}
              isAnonymized={chartConfig.isAnonymized}
              isDebugMode={settings.isDebugMode}
            />
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};

export default App;

