import { useCallback, useMemo, useEffect } from 'react';
import { usePersistence } from './usePersistence';
import { useModeState } from './useModeState';
import { AnalysisMode } from '../types';
import { STORAGE_KEYS, LIMITS, MESSAGES } from '../config/constants';
import { ANALYSIS_MODE_CONFIGS, HISTORICAL_ANALYSIS_MODE_CONFIGS } from '../../constants/analysisConfigs';

/**
 * 分析状態管理フック（モードごとの選択状態保存対応版）
 */
export const useAnalysisState = () => {
  // 現在のモードID（全モード共通）
  const [mode, setModeInternal] = usePersistence<AnalysisMode>(
    STORAGE_KEYS.ANALYSIS_MODE,
    'funnel_segment_brands' // デフォルトモード
  );

  // 現在のモード設定を取得
  const currentModeConfig = useMemo(() => {
    return ANALYSIS_MODE_CONFIGS[mode] || HISTORICAL_ANALYSIS_MODE_CONFIGS[mode];
  }, [mode]);

  // モード固有の選択状態を管理
  const modeState = useModeState(mode, currentModeConfig);

  // モード切り替え処理
  const setMode = useCallback((newMode: AnalysisMode) => {
    console.log(`[Mode Switch] ${mode} → ${newMode}`);

    // 統一ストレージを使用しているため、モード間でデータは自動的に共有される
    // モード固有のバリデーションはuseModeStateで実行される
    setModeInternal(newMode);
  }, [mode, setModeInternal]);

  // 便利なヘルパーメソッド
  // 注: displayStateではなくrawBrands/rawSegmentsを使用（フィルターされていない元の値）
  const addBrand = useCallback((brand: string): boolean => {
    // rawBrandsを使用（displayStateではない）
    const currentBrands = modeState.rawBrands || modeState.brands;
    if (currentBrands.includes(brand)) {
      alert(MESSAGES.ERROR.BRAND_ALREADY_SELECTED);
      return false;
    }
    if (currentBrands.length >= LIMITS.MAX_BRANDS) {
      alert(MESSAGES.ERROR.BRAND_LIMIT_EXCEEDED);
      return false;
    }
    modeState.setBrands([...currentBrands, brand]);
    return true;
  }, [modeState]);

  const removeBrand = useCallback((brand: string) => {
    const currentBrands = modeState.rawBrands || modeState.brands;
    modeState.setBrands(currentBrands.filter(b => b !== brand));
  }, [modeState]);

  const clearBrands = useCallback(() => {
    modeState.setBrands([]);
  }, [modeState]);

  const addSegment = useCallback((segment: string): boolean => {
    const currentSegments = modeState.rawSegments || modeState.segments;
    if (currentSegments.includes(segment)) {
      alert(MESSAGES.ERROR.SEGMENT_ALREADY_SELECTED);
      return false;
    }
    if (currentSegments.length >= LIMITS.MAX_SEGMENTS) {
      alert(MESSAGES.ERROR.SEGMENT_LIMIT_EXCEEDED);
      return false;
    }
    modeState.setSegments([...currentSegments, segment]);
    return true;
  }, [modeState]);

  const removeSegment = useCallback((segment: string) => {
    const currentSegments = modeState.rawSegments || modeState.segments;
    modeState.setSegments(currentSegments.filter(s => s !== segment));
  }, [modeState]);

  const clearSegments = useCallback(() => {
    modeState.setSegments([]);
  }, [modeState]);

  // Computed getter for current sheet (segments[0] acts as data source)
  const currentSheet = useMemo(() => {
    return modeState.segments[0] || '';
  }, [modeState.segments]);

  return {
    // State
    mode,
    selectedBrands: modeState.brands,
    selectedSegments: modeState.segments,
    selectedItem: modeState.item,
    targetBrand: modeState.targetBrand,
    currentSheet, // computed from segments[0], no setter

    // Setters
    setMode,
    setSelectedBrands: modeState.setBrands,
    setSelectedSegments: modeState.setSegments,
    setSelectedItem: modeState.setItem,
    setTargetBrand: modeState.setTargetBrand,
    // setSheet removed - use setSelectedSegments to change data source

    // Helpers
    addBrand,
    removeBrand,
    clearBrands,
    addSegment,
    removeSegment,
    clearSegments,
  };
};

