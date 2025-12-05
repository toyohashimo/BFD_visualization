import { useCallback } from 'react';
import {
  ChartDataPoint,
  AnalysisMode,
  SheetData,
  FunnelMetrics,
  AnalysisModeConfig,
  AxisType,
  GlobalMode,
  DataSource,
  BrandImageData
} from '../types';
import { MESSAGES } from '../config/constants';
import { formatSegmentName } from '../utils/formatters'
import {
  ANALYSIS_MODE_CONFIGS,
  HISTORICAL_ANALYSIS_MODE_CONFIGS,
  ANALYSIS_MODE_ORDER,
  HISTORICAL_ANALYSIS_MODE_ORDER
} from '../../constants/analysisConfigs';
import {
  FUNNEL_LABELS,
  TIMELINE_LABELS,
  BRAND_POWER_LABELS,
  FUTURE_POWER_LABELS,
  ARCHETYPE_LABELS
} from '../types';

/**
 * CSVエクスポートフック (完全リファクタリング版)
 */
export const useCSVExport = (
  data: SheetData,
  analysisMode: AnalysisMode,
  sheet: string,
  targetBrand: string,
  selectedBrands: string[],
  selectedSegments: string[],
  selectedItem: keyof FunnelMetrics | string,
  getBrandName: (brand: string) => string,
  globalMode: GlobalMode,
  dataSources?: DataSource[],
  brandImageData?: BrandImageData
) => {

  /**
   * モード番号を取得
   */
  const getModeNumber = (mode: AnalysisMode): number => {
    if (globalMode === 'historical') {
      return HISTORICAL_ANALYSIS_MODE_ORDER.indexOf(mode) + 1;
    } else {
      return ANALYSIS_MODE_ORDER.indexOf(mode) + 1;
    }
  };

  /**
   * 軸のラベル文字列を取得
   */
  const getItemLabel = (itemKey: string): string => {
    if (itemKey in FUNNEL_LABELS) return FUNNEL_LABELS[itemKey as keyof typeof FUNNEL_LABELS];
    if (itemKey in TIMELINE_LABELS) return TIMELINE_LABELS[itemKey as keyof typeof TIMELINE_LABELS];
    if (itemKey in BRAND_POWER_LABELS) return BRAND_POWER_LABELS[itemKey as keyof typeof BRAND_POWER_LABELS];
    if (itemKey in FUTURE_POWER_LABELS) return FUTURE_POWER_LABELS[itemKey as keyof typeof FUTURE_POWER_LABELS];
    if (itemKey in ARCHETYPE_LABELS) return ARCHETYPE_LABELS[itemKey as keyof typeof ARCHETYPE_LABELS];
    return itemKey;
  };

  /**
   * メタデータセクションを生成
   */
  const generateMetadataSection = (
    config: AnalysisModeConfig,
    modeNumber: number,
    xAxisItems: string[],
    seriesItems: string[],
    filterItems: string[]
  ): string => {
    const now = new Date();
    const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
    const timestamp = jstDate.toISOString().slice(0, 19).replace('T', ' ');

    let metadata = '\ufeff出力日時,' + timestamp + '\n';
    metadata += 'モード,' + modeNumber + '. ' + config.name + '\n';
    metadata += 'X軸,' + xAxisItems.join('、') + '\n';
    metadata += 'データ系列,' + seriesItems.join('、') + '\n';
    metadata += 'フィルタ,' + filterItems.join('、') + '\n';
    metadata += '\n'; // 空行

    return metadata;
  };

  /**
   * バリデーション
   */
  const validateParams = (config: AnalysisModeConfig): boolean => {
    // segments FILTER check
    if (config.axes.segments?.role === 'FILTER' && !sheet) {
      alert(MESSAGES.ERROR.NO_SEGMENTS_SELECTED);
      return false;
    }

    // brands FILTER check
    if (config.axes.brands?.role === 'FILTER' && !targetBrand) {
      alert(MESSAGES.ERROR.NO_BRANDS_SELECTED);
      return false;
    }

    // items FILTER check
    if (config.axes.items?.role === 'FILTER' && !selectedItem) {
      alert('エクスポートする項目を選択してください');
      return false;
    }

    // segments SERIES/X_AXIS check
    if ((config.axes.segments?.role === 'SERIES' || config.axes.segments?.role === 'X_AXIS')
      && selectedSegments.length === 0) {
      alert(MESSAGES.ERROR.NO_SEGMENTS_SELECTED);
      return false;
    }

    // brands SERIES/X_AXIS check
    if ((config.axes.brands?.role === 'SERIES' || config.axes.brands?.role === 'X_AXIS')
      && selectedBrands.length === 0) {
      alert(MESSAGES.ERROR.NO_BRANDS_SELECTED);
      return false;
    }

    return true;
  };

  /**
   * Brand Imageデータ取得
   */
  const getBrandImageValue = (segment: string, brand: string, item: string): number => {
    if (!brandImageData || !brandImageData[segment] || !brandImageData[segment][brand]) {
      return 0;
    }
    const brandData = brandImageData[segment][brand];
    return brandData[item] || 0;
  };

  /**
   * データセクションを生成 - 詳細分析モード
   */
  const generateDetailedModeDataSection = (config: AnalysisModeConfig): string => {
    const { xAxis, series, filter } = config.dataTransform;

    let csvContent = '';

    // X軸項目の取得
    let xAxisKeys: string[] = [];
    let xAxisLabels: string[] = [];

    if (xAxis === 'items') {
      // Brand Imageモードの場合は動的に項目を取得
      if (config.axes.items?.itemSet === 'brandImage' && config.axes.items?.autoSelect) {
        // Brand Image項目をbrandImageDataから取得
        if (brandImageData && brandImageData[sheet]) {
          const firstBrand = selectedBrands[0] || Object.keys(brandImageData[sheet])[0];
          if (firstBrand && brandImageData[sheet][firstBrand]) {
            const itemsRecord = brandImageData[sheet][firstBrand];
            // Record<string, number>からキーを取得してソート（値の降順）
            const sortedKeys = Object.entries(itemsRecord)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 30)
              .map(([key]) => key);
            xAxisKeys = sortedKeys;
            xAxisLabels = sortedKeys;
          }
        }
      } else {
        xAxisKeys = config.axes.items?.fixedItems || [];
        xAxisLabels = xAxisKeys.map(k => getItemLabel(k));
      }
    } else if (xAxis === 'brands') {
      xAxisKeys = selectedBrands;
      xAxisLabels = selectedBrands.map(b => getBrandName(b));
    } else if (xAxis === 'segments') {
      xAxisKeys = selectedSegments;
      xAxisLabels = selectedSegments.map(s => formatSegmentName(s));
    }

    // データ系列の取得
    let seriesKeys: string[] = [];
    let seriesLabels: string[] = [];

    if (series === 'brands') {
      seriesKeys = selectedBrands;
      seriesLabels = selectedBrands.map(b => getBrandName(b));
    } else if (series === 'segments') {
      seriesKeys = selectedSegments;
      seriesLabels = selectedSegments.map(s => formatSegmentName(s));
    }

    // ヘッダー行（転置後：表頭＝X軸項目）
    csvContent += series === 'brands' ? 'ブランド' : 'セグメント';
    xAxisLabels.forEach(label => {
      csvContent += `,"${label}"`;
    });
    csvContent += '\n';

    // データ行（転置後：行＝系列）
    seriesKeys.forEach((seriesKey, seriesIdx) => {
      csvContent += `"${seriesLabels[seriesIdx]}"`;

      xAxisKeys.forEach(xKey => {
        let value = 0;

        // データ取得ロジック
        if (filter === 'segments') {
          // segments がFILTER
          const sheetData = data[sheet];
          if (xAxis === 'items' && series === 'brands') {
            // Mode 1, 4, 7, 9, 11, 13: *_segment_brands pattern
            if (config.axes.items?.itemSet === 'brandImage') {
              // Brand Image mode
              value = getBrandImageValue(sheet, seriesKey, xKey);
            } else {
              // Funnel, Timeline, Brand Power, Future Power, Archetype modes
              value = sheetData?.[seriesKey]?.[xKey as keyof FunnelMetrics] || 0;
            }
          }
        } else if (filter === 'brands') {
          // brands がFILTER
          if (xAxis === 'items' && series === 'segments') {
            // Mode 2, 5, 8, 10, 12, 14: *_brand_segments pattern
            if (config.axes.items?.itemSet === 'brandImage') {
              // Brand Image mode
              value = getBrandImageValue(seriesKey, targetBrand, xKey);
            } else {
              value = data[seriesKey]?.[targetBrand]?.[xKey as keyof FunnelMetrics] || 0;
            }
          }
        } else if (filter === 'items') {
          // items がFILTER
          if (xAxis === 'brands' && series === 'segments') {
            // Mode 3, 6: *_item_segments_brands pattern
            value = data[seriesKey]?.[xKey]?.[selectedItem as keyof FunnelMetrics] || 0;
          }
        }

        csvContent += ',' + value;
      });

      csvContent += '\n';
    });

    return csvContent;
  };

  /**
   * データセクションを生成 - 過去比較モード
   */
  const generateHistoricalModeDataSection = (config: AnalysisModeConfig): string => {
    const { xAxis, filter } = config.dataTransform;
    const activeSources = dataSources?.filter(ds => ds.isActive) || [];

    if (activeSources.length === 0) {
      return '';
    }

    let csvContent = '';

    // X軸項目の取得
    let xAxisKeys: string[] = [];
    let xAxisLabels: string[] = [];

    if (xAxis === 'items') {
      if (config.axes.items?.itemSet === 'brandImage' && config.axes.items?.autoSelect) {
        // Brand Image mode
        if (brandImageData && activeSources[0].data && activeSources[0].data[sheet]) {
          const firstBrand = targetBrand || Object.keys(activeSources[0].data[sheet])[0];
          if (brandImageData[sheet] && brandImageData[sheet][firstBrand]) {
            const itemsRecord = brandImageData[sheet][firstBrand];
            // Record<string, number>からキーを取得してソート（値の降順）
            const sortedKeys = Object.entries(itemsRecord)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 30)
              .map(([key]) => key);
            xAxisKeys = sortedKeys;
            xAxisLabels = sortedKeys;
          }
        }
      } else {
        xAxisKeys = config.axes.items?.fixedItems || [];
        xAxisLabels = xAxisKeys.map(k => getItemLabel(k));
      }
    } else if (xAxis === 'brands') {
      xAxisKeys = selectedBrands;
      xAxisLabels = selectedBrands.map(b => getBrandName(b));
    }

    // データ系列 = データソース
    const seriesKeys = activeSources.map(ds => ds.id);
    const seriesLabels = activeSources.map(ds => ds.name);

    // ヘッダー行（転置後：表頭＝X軸項目）
    csvContent += 'データソース';
    xAxisLabels.forEach(label => {
      csvContent += `,"${label}"`;
    });
    csvContent += '\n';

    // データ行（転置後：行＝データソース）
    activeSources.forEach(source => {
      csvContent += `"${source.name}"`;

      xAxisKeys.forEach(xKey => {
        let value = 0;

        if (!source.data || !source.data[sheet]) {
          csvContent += ',0';
          return;
        }

        // データ取得ロジック
        if (xAxis === 'items') {
          // Mode 1, 3, 5, 7, 8, 9: X軸が項目
          const brandData = source.data[sheet][targetBrand];
          if (brandData) {
            if (config.axes.items?.itemSet === 'brandImage') {
              // Historical Brand Image mode
              value = getBrandImageValue(sheet, targetBrand, xKey);
            } else {
              value = brandData[xKey as keyof FunnelMetrics] || 0;
            }
          }
        } else if (xAxis === 'brands') {
          // Mode 2, 4, 6: X軸がブランド
          const brandData = source.data[sheet][xKey];
          if (brandData) {
            if (selectedItem) {
              value = brandData[selectedItem as keyof FunnelMetrics] || 0;
            }
          }
        }

        csvContent += ',' + value;
      });

      csvContent += '\n';
    });

    return csvContent;
  };

  /**
   * メインのエクスポート関数
   */
  const exportCSV = useCallback(() => {
    // 1. データ存在チェック
    if (!data || Object.keys(data).length === 0) {
      alert(MESSAGES.ERROR.NO_DATA_TO_EXPORT);
      return;
    }

    // 2. モード設定取得
    const config = globalMode === 'historical'
      ? HISTORICAL_ANALYSIS_MODE_CONFIGS[analysisMode]
      : ANALYSIS_MODE_CONFIGS[analysisMode];

    if (!config) {
      alert('不明な分析モードです');
      return;
    }

    // 3. バリデーション
    if (!validateParams(config)) {
      return;
    }

    // 4. モード番号取得
    const modeNumber = getModeNumber(analysisMode);

    // 5. メタデータ用の値を準備
    const { xAxis, series, filter } = config.dataTransform;

    // X軸項目
    let xAxisItems: string[] = [];
    if (xAxis === 'items') {
      const keys = config.axes.items?.fixedItems || [];
      xAxisItems = keys.map(k => getItemLabel(k));
    } else if (xAxis === 'brands') {
      xAxisItems = selectedBrands.map(b => getBrandName(b));
    } else if (xAxis === 'segments') {
      xAxisItems = selectedSegments.map(s => formatSegmentName(s));
    }

    // データ系列
    let seriesItems: string[] = [];
    if (globalMode === 'historical') {
      // 過去比較モード: データソースが系列になる
      seriesItems = dataSources?.filter(ds => ds.isActive).map(ds => ds.name) || [];
    } else if (series === 'brands') {
      seriesItems = selectedBrands.map(b => getBrandName(b));
    } else if (series === 'segments') {
      seriesItems = selectedSegments.map(s => formatSegmentName(s));
    }

    // フィルタ
    let filterItems: string[] = [];
    if (filter === 'segments') {
      filterItems = [formatSegmentName(sheet)];
    } else if (filter === 'brands') {
      filterItems = [getBrandName(targetBrand)];
    } else if (filter === 'items') {
      filterItems = [getItemLabel(selectedItem)];
    }

    // 6. メタデータセクション生成
    const metadata = generateMetadataSection(config, modeNumber, xAxisItems, seriesItems, filterItems);

    // 7. データセクション生成
    let dataSection = '';
    if (globalMode === 'historical') {
      dataSection = generateHistoricalModeDataSection(config);
    } else {
      dataSection = generateDetailedModeDataSection(config);
    }

    // 8. CSV出力
    const csvContent = metadata + dataSection;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const now = new Date();
    const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
    const timestamp = jstDate.toISOString().slice(0, 19).replace(/[:-]/g, '');
    link.setAttribute('download', `analysis_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [
    data,
    analysisMode,
    globalMode,
    selectedBrands,
    selectedSegments,
    targetBrand,
    selectedItem,
    sheet,
    getBrandName,
    dataSources,
    brandImageData
  ]);

  return {
    exportCSV,
  };
};
