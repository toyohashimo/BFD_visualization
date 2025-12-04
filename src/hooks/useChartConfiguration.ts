import { useState, useMemo, useCallback } from 'react';
import { usePersistence } from './usePersistence';
import { ChartType } from '../types';
import { COLOR_THEMES } from '../../constants';
import { STORAGE_KEYS } from '../config/constants';

/**
 * チャート設定フック
 */
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

  const [isAnonymized, setIsAnonymized] = usePersistence<boolean>(
    STORAGE_KEYS.IS_ANONYMIZED,
    true
  );

  const activePalette = useMemo(
    () => COLOR_THEMES[currentTheme].palette,
    [currentTheme]
  );

  const toggleAnonymization = useCallback(() => {
    if (!isExcelData) return;
    setIsAnonymized(prev => !prev);
  }, [isExcelData]);

  // 強制的に匿名化をONにする（データソースがなくなった時の初期化用）
  const forceAnonymization = useCallback(() => {
    setIsAnonymized(true);
  }, []);

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
    forceAnonymization,
  };
};

