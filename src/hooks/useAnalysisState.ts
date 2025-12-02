import { useCallback, useMemo } from 'react';
import { usePersistence } from './usePersistence';
import { AnalysisMode } from '../types';
import { STORAGE_KEYS, LIMITS, MESSAGES } from '../config/constants';

/**
 * 分析状態管理フック
 */
export const useAnalysisState = () => {
  const [mode, setMode] = usePersistence<AnalysisMode>(
    STORAGE_KEYS.ANALYSIS_MODE,
    'segment_x_multi_brand' // デフォルトモード
  );

  const [selectedBrands, setSelectedBrands] = usePersistence<string[]>(
    STORAGE_KEYS.SELECTED_BRANDS,
    [],
    true // 再読み込み時に選択状態を解除
  );

  const [selectedSegments, setSelectedSegments] = usePersistence<string[]>(
    STORAGE_KEYS.SELECTED_SEGMENTS,
    [],
    true // 再読み込み時に選択状態を解除
  );

  const [selectedItem, setSelectedItem] = usePersistence<string>(
    STORAGE_KEYS.SELECTED_ITEM,
    ''
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
  const addBrand = useCallback((brand: string): boolean => {
    if (selectedBrands.includes(brand)) {
      alert(MESSAGES.ERROR.BRAND_ALREADY_SELECTED);
      return false;
    }
    if (selectedBrands.length >= LIMITS.MAX_BRANDS) {
      alert(MESSAGES.ERROR.BRAND_LIMIT_EXCEEDED);
      return false;
    }
    setSelectedBrands([...selectedBrands, brand]);
    return true;
  }, [selectedBrands, setSelectedBrands]);

  const removeBrand = useCallback((brand: string) => {
    setSelectedBrands(selectedBrands.filter(b => b !== brand));
  }, [selectedBrands, setSelectedBrands]);

  const clearBrands = useCallback(() => {
    setSelectedBrands([]);
  }, [setSelectedBrands]);

  const addSegment = useCallback((segment: string): boolean => {
    if (selectedSegments.includes(segment)) {
      alert(MESSAGES.ERROR.SEGMENT_ALREADY_SELECTED);
      return false;
    }
    if (selectedSegments.length >= LIMITS.MAX_SEGMENTS) {
      alert(MESSAGES.ERROR.SEGMENT_LIMIT_EXCEEDED);
      return false;
    }
    setSelectedSegments([...selectedSegments, segment]);
    return true;
  }, [selectedSegments, setSelectedSegments]);

  const removeSegment = useCallback((segment: string) => {
    setSelectedSegments(selectedSegments.filter(s => s !== segment));
  }, [selectedSegments, setSelectedSegments]);

  const clearSegments = useCallback(() => {
    setSelectedSegments([]);
  }, [setSelectedSegments]);

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
    clearBrands,
    addSegment,
    removeSegment,
    clearSegments,
  };
};

