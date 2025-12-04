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

    // 現在のモードのデータを新しいモードに引き継ぐ
    // （新しいモードに既存データがない場合のみ）
    const getModeStateKey = (modeId: string, field: string) => `mode_state:${modeId}:${field}`;

    // 新しいモードのストレージをチェック
    const newModeBrands = localStorage.getItem(getModeStateKey(newMode, 'brands'));
    const newModeSegments = localStorage.getItem(getModeStateKey(newMode, 'segments'));

    // 新しいモードに既存データがない場合、現在のモードのデータをコピー
    if (!newModeBrands && modeState.brands.length > 0) {
      localStorage.setItem(getModeStateKey(newMode, 'brands'), JSON.stringify(modeState.brands));
      console.log(`[Mode Switch] Copied brands to new mode: ${modeState.brands}`);
    }

    if (!newModeSegments && modeState.segments.length > 0) {
      localStorage.setItem(getModeStateKey(newMode, 'segments'), JSON.stringify(modeState.segments));
      console.log(`[Mode Switch] Copied segments to new mode: ${modeState.segments}`);
    }

    // targetBrandとsheetもコピー
    if (modeState.targetBrand) {
      const newModeTargetBrand = localStorage.getItem(getModeStateKey(newMode, 'targetBrand'));
      if (!newModeTargetBrand) {
        localStorage.setItem(getModeStateKey(newMode, 'targetBrand'), JSON.stringify(modeState.targetBrand));
      }
    }

    if (modeState.sheet) {
      const newModeSheet = localStorage.getItem(getModeStateKey(newMode, 'sheet'));
      if (!newModeSheet) {
        localStorage.setItem(getModeStateKey(newMode, 'sheet'), JSON.stringify(modeState.sheet));
      }
    }

    // usePersistenceとuseModeStateが自動的に保存・復元を行う
    setModeInternal(newMode);
  }, [mode, modeState, setModeInternal]);

  // 便利なヘルパーメソッド
  const addBrand = useCallback((brand: string): boolean => {
    if (modeState.brands.includes(brand)) {
      alert(MESSAGES.ERROR.BRAND_ALREADY_SELECTED);
      return false;
    }
    if (modeState.brands.length >= LIMITS.MAX_BRANDS) {
      alert(MESSAGES.ERROR.BRAND_LIMIT_EXCEEDED);
      return false;
    }
    modeState.setBrands([...modeState.brands, brand]);
    return true;
  }, [modeState]);

  const removeBrand = useCallback((brand: string) => {
    modeState.setBrands(modeState.brands.filter(b => b !== brand));
  }, [modeState]);

  const clearBrands = useCallback(() => {
    modeState.setBrands([]);
  }, [modeState]);

  const addSegment = useCallback((segment: string): boolean => {
    if (modeState.segments.includes(segment)) {
      alert(MESSAGES.ERROR.SEGMENT_ALREADY_SELECTED);
      return false;
    }
    if (modeState.segments.length >= LIMITS.MAX_SEGMENTS) {
      alert(MESSAGES.ERROR.SEGMENT_LIMIT_EXCEEDED);
      return false;
    }
    modeState.setSegments([...modeState.segments, segment]);
    return true;
  }, [modeState]);

  const removeSegment = useCallback((segment: string) => {
    modeState.setSegments(modeState.segments.filter(s => s !== segment));
  }, [modeState]);

  const clearSegments = useCallback(() => {
    modeState.setSegments([]);
  }, [modeState]);

  return {
    // State
    mode,
    selectedBrands: modeState.brands,
    selectedSegments: modeState.segments,
    selectedItem: modeState.item,
    targetBrand: modeState.targetBrand,
    sheet: modeState.sheet,

    // Setters
    setMode,
    setSelectedBrands: modeState.setBrands,
    setSelectedSegments: modeState.setSegments,
    setSelectedItem: modeState.setItem,
    setTargetBrand: modeState.setTargetBrand,
    setSheet: modeState.setSheet,

    // Helpers
    addBrand,
    removeBrand,
    clearBrands,
    addSegment,
    removeSegment,
    clearSegments,
  };
};

