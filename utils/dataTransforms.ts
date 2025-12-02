import {
    METRIC_LABELS,
    METRIC_KEYS,
    TIMELINE_LABELS,
    TIMELINE_KEYS,
    ChartDataPoint,
    SheetData,
    FunnelMetrics,
    AllMetrics,
    AnalysisModeConfig,
    AxisType,
    BrandImageItem,
    DataSource
} from '../types';
import { findMatchingBrand } from '../src/utils/brandNormalizer';

// Brand Image Data type
type BrandImageData = Record<string, Record<string, Record<string, number>>>;

/**
 * ブランド名でデータを取得（表記ゆれ対応）
 * 
 * @param segmentData セグメントデータ
 * @param brandName 検索するブランド名
 * @returns ブランドデータ（見つからない場合はundefined）
 */
function getBrandDataWithFuzzyMatch(
  segmentData: Record<string, any>,
  brandName: string
): any | undefined {
  if (!segmentData || !brandName) {
    return undefined;
  }

  // 完全一致を試す
  if (segmentData[brandName]) {
    return segmentData[brandName];
  }

  // ファジーマッチングで検索
  const brandList = Object.keys(segmentData);
  const matchedBrand = findMatchingBrand(brandName, brandList);
  
  if (matchedBrand) {
    return segmentData[matchedBrand];
  }

  return undefined;
}

/**
 * Get X-axis items based on mode configuration
 */
const getXAxisItems = (
    config: AnalysisModeConfig,
    xAxis: AxisType,
    data: SheetData,
    filterValues: Record<AxisType, string>,
    seriesValues: Record<AxisType, string[]>
): string[] => {
    const axisConfig = config.axes[xAxis];

    if (axisConfig.fixedItems) {
        // Fixed item set (e.g., funnel metrics)
        return axisConfig.fixedItems;
    }

    // Dynamically retrieve items
    switch (xAxis) {
        case 'segments':
            return Object.keys(data);
        case 'brands':
            // For item_x_multi_brand mode, use the selected brands from seriesValues
            return seriesValues.brands.length > 0 ? seriesValues.brands : [];
        case 'items':
            // Items are currently not expected to be dynamic
            return [];
    }
};

/**
 * Extract value from data based on axis values
 */
const extractValue = (
    data: SheetData,
    xAxis: AxisType,
    xValue: string,
    series: AxisType,
    seriesValue: string,
    filter: AxisType,
    filterValue: string,
    config: AnalysisModeConfig
): number | undefined => {
    // Build the complete set of values for items, segments, and brands
    const values: Record<AxisType, string> = {
        items: xAxis === 'items' ? xValue : (series === 'items' ? seriesValue : filterValue),
        segments: xAxis === 'segments' ? xValue : (series === 'segments' ? seriesValue : filterValue),
        brands: xAxis === 'brands' ? xValue : (series === 'brands' ? seriesValue : filterValue)
    };

    // Data structure: data[segment][brand][metricKey]
    const sheetData = data[values.segments];
    if (!sheetData) return undefined;

    const brandData = sheetData[values.brands];
    if (!brandData) return undefined;

    // Check if this is an archetype metric
    if (config.axes.items?.itemSet === 'archetype') {
        // Access nested archetypeMetrics
        if (brandData.archetypeMetrics) {
            return brandData.archetypeMetrics[values.items as keyof typeof brandData.archetypeMetrics];
        }
        return undefined;
    }

    // For other metrics, access directly
    const value = brandData[values.items as keyof AllMetrics];
    return typeof value === 'number' ? value : undefined;
};

/**
 * Select TOP 30 brand image items based on reference brand
 */
const selectTop30BrandImageItems = (
    brandImageData: BrandImageData,
    segment: string,
    referenceBrand: string
): string[] => {
    const sheetData = brandImageData[segment];
    if (!sheetData) return [];

    const brandData = sheetData[referenceBrand];
    if (!brandData) return [];

    // Convert to array and sort by value descending
    const items = Object.entries(brandData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Return top 30 item names
    return items.slice(0, 30).map(item => item.name);
};

/**
 * Transform data for chart based on mode configuration
 */
export const transformDataForChart = (
    data: SheetData,
    modeConfig: AnalysisModeConfig,
    filterValues: Record<AxisType, string>,
    seriesValues: Record<AxisType, string[]>,
    labelGetters: Record<AxisType, (key: string) => string>,
    brandImageData?: BrandImageData
): ChartDataPoint[] => {
    const { xAxis, series, filter } = modeConfig.dataTransform;

    // For brand image mode, calculate TOP 30 items dynamically
    let xAxisItems: string[];
    if (modeConfig.axes.items?.autoSelect && brandImageData) {
        // Brand image mode: select TOP 30
        if (modeConfig.id === 'brand_image_segment_brands') {
            // Mode 7: Segment filter, Brand series
            const segment = filterValues.segments;
            const referenceBrand = seriesValues.brands[0]; // First selected brand is reference
            if (segment && referenceBrand) {
                xAxisItems = selectTop30BrandImageItems(brandImageData, segment, referenceBrand);
            } else {
                xAxisItems = [];
            }
        } else if (modeConfig.id === 'brand_analysis_segment_comparison') {
            // Mode 8: Brand filter, Segment series
            const brand = filterValues.brands;
            const referenceSegment = seriesValues.segments[0]; // First selected segment is reference
            if (brand && referenceSegment) {
                xAxisItems = selectTop30BrandImageItems(brandImageData, referenceSegment, brand);
            } else {
                xAxisItems = [];
            }
        } else {
            xAxisItems = [];
        }
    } else {
        // Normal mode
        xAxisItems = getXAxisItems(modeConfig, xAxis, data, filterValues, seriesValues);
    }

    // Create data point for each X-axis item
    return xAxisItems.map(xItem => {
        const point: ChartDataPoint = {
            name: labelGetters[xAxis](xItem)
        };

        // Add data for each series item
        const seriesItems = seriesValues[series];
        seriesItems.forEach(seriesItem => {
            let value: number | undefined;

            // For brand image mode, get value from brandImageData
            if (modeConfig.axes.items?.autoSelect && brandImageData) {
                if (modeConfig.id === 'brand_image_segment_brands') {
                    // Mode 7: Segment filter, Brand series
                    const segment = filterValues.segments;
                    const sheetData = brandImageData[segment];
                    if (sheetData && sheetData[seriesItem]) {
                        value = sheetData[seriesItem][xItem];
                    }
                } else if (modeConfig.id === 'brand_analysis_segment_comparison') {
                    // Mode 8: Brand filter, Segment series
                    const brand = filterValues.brands;
                    const sheetData = brandImageData[seriesItem]; // seriesItem is segment name
                    if (sheetData && sheetData[brand]) {
                        value = sheetData[brand][xItem];
                    }
                }
            } else {
                // Normal mode
                value = extractValue(
                    data,
                    xAxis, xItem,
                    series, seriesItem,
                    filter, filterValues[filter],
                    modeConfig
                );
            }

            if (value !== undefined) {
                point[labelGetters[series](seriesItem)] = value;
            }
        });

        return point;
    });
};

/**
 * Legacy function for backward compatibility
 * Will be removed after migration is complete
 */
export const transformDataForChartLegacy = (
    data: SheetData,
    mode: 'segment_x_multi_brand' | 'brand_x_multi_segment',
    primarySelection: string,
    secondarySelections: string[],
    getLabel: (key: string) => string
): ChartDataPoint[] => {
    return METRIC_KEYS.map((key) => {
        const point: ChartDataPoint = { name: METRIC_LABELS[key] };
        secondarySelections.forEach((secItem) => {
            let metrics: FunnelMetrics | undefined;

            if (mode === 'segment_x_multi_brand') {
                metrics = data[primarySelection]?.[secItem];
            } else {
                metrics = data[secItem]?.[primarySelection];
            }

            if (metrics) {
                point[getLabel(secItem)] = metrics[key];
            }
        });
        return point;
    });
};

/**
 * 過去比較モード用のチャートデータ変換
 * 
 * 複数データソース（時系列データ）を単一のチャートデータに変換
 * 
 * @param dataSources アクティブなデータソース配列
 * @param analysisMode 分析モード
 * @param selectedSegment 選択されたセグメント（SA）
 * @param selectedBrand 選択されたブランド（SA）
 * @param selectedItem 選択された分析項目
 * @param labelGetters ラベル変換関数
 * @returns チャートデータ（categories, series）
 */
export const transformDataForHistoricalChart = (
    dataSources: Array<{
        id: string;
        name: string;
        data: SheetData;
        isActive: boolean;
    }>,
    config: AnalysisModeConfig,
    selectedSegment: string,
    selectedBrand: string,
    selectedItem: string,
    labelGetters: Record<AxisType, (key: string) => string>
): ChartDataPoint[] | null => {
    if (!config || !config.axes) return null;

    const activeSources = dataSources.filter(ds => ds.isActive);
    if (activeSources.length === 0) return null;

    // X軸カテゴリ取得
    const xAxisConfig = config.axes.items;
    let xAxisKeys: string[] = [];

    if (xAxisConfig.role === 'X_AXIS' && xAxisConfig.fixedItems) {
        xAxisKeys = xAxisConfig.fixedItems;
    } else {
        console.warn('過去比較モードではX軸は固定項目である必要があります');
        return null;
    }

    // データポイント生成
    return xAxisKeys.map(key => {
        const point: ChartDataPoint = { name: labelGetters.items(key) };

        // 各データソースごとにデータ抽出
        activeSources.forEach(source => {
            const segmentData = source.data[selectedSegment];
            if (!segmentData) {
                point[source.name] = 0;
                return;
            }

            // ファジーマッチングを使用してブランドデータを取得
            const brandData = getBrandDataWithFuzzyMatch(segmentData, selectedBrand);
            if (!brandData) {
                point[source.name] = 0;
                return;
            }

            // メトリクス値取得
            // アーキタイプの場合は特殊処理
            if (xAxisConfig.itemSet === 'archetype' && brandData.archetypeMetrics) {
                point[source.name] = brandData.archetypeMetrics[key as keyof typeof brandData.archetypeMetrics] ?? 0;
            } else {
                const value = brandData[key as keyof AllMetrics];
                point[source.name] = typeof value === 'number' ? value : 0;
            }
        });

        return point;
    });
};

/**
 * 過去比較モード - ブランドイメージ分析用のデータ変換
 * TOP30項目を基準データソースから自動選定して、各データソースのデータを変換
 * 
 * @param dataSources アクティブなデータソース配列
 * @param config 分析モード設定
 * @param selectedSegment 選択されたセグメント（SA）
 * @param selectedBrand 選択されたブランド（SA）
 * @param labelGetters ラベル変換関数
 * @param brandImageData ブランドイメージデータ
 * @returns チャートデータ
 */
export const transformDataForHistoricalBrandImage = (
    dataSources: Array<{
        id: string;
        name: string;
        data: SheetData;
        brandImageData?: BrandImageData;
        isActive: boolean;
    }>,
    config: AnalysisModeConfig,
    selectedSegment: string,
    selectedBrand: string,
    labelGetters: Record<AxisType, (key: string) => string>,
    brandImageData?: BrandImageData
): ChartDataPoint[] | null => {
    
    // 1. アクティブなデータソースをフィルタ
    const activeSources = dataSources.filter(ds => ds.isActive);
    if (activeSources.length === 0) {
        console.warn('[Historical Brand Image] アクティブなデータソースがありません');
        return null;
    }
    
    // 2. セグメント・ブランドのバリデーション
    if (!selectedSegment || !selectedBrand) {
        console.warn('[Historical Brand Image] セグメントまたはブランドが選択されていません');
        return null;
    }
    
    // 3. 基準データソース（先頭）からTOP30項目を選定
    const referenceSource = activeSources[0];
    const referenceBrandImageData = referenceSource.brandImageData || brandImageData;
    
    if (!referenceBrandImageData) {
        console.warn('[Historical Brand Image] ブランドイメージデータが見つかりません');
        return null;
    }
    
    const segmentData = referenceBrandImageData[selectedSegment];
    if (!segmentData) {
        console.warn(`[Historical Brand Image] セグメント '${selectedSegment}' が見つかりません`);
        return null;
    }
    
    // ファジーマッチングを使用してブランドデータを取得
    const brandList = Object.keys(segmentData);
    const matchedBrand = findMatchingBrand(selectedBrand, brandList);
    
    if (!matchedBrand) {
        console.warn(`[Historical Brand Image] ブランド '${selectedBrand}' が見つかりません`);
        return null;
    }
    
    const brandData = segmentData[matchedBrand];
    if (!brandData) {
        console.warn(`[Historical Brand Image] ブランド '${matchedBrand}' のデータが見つかりません`);
        return null;
    }
    
    // 4. TOP30項目の選定
    const top30Items = Object.entries(brandData)
        .filter(([itemName]) => itemName !== 'あてはまるものはない')
        .sort((a, b) => b[1] - a[1])  // 降順ソート
        .slice(0, 30)
        .map(entry => entry[0]);
    
    if (top30Items.length === 0) {
        console.warn('[Historical Brand Image] TOP30項目が選定できませんでした');
        return null;
    }
    
    // 5. 各項目ごとにデータポイントを生成
    const chartData: ChartDataPoint[] = top30Items.map(itemName => {
        const dataPoint: ChartDataPoint = {
            name: itemName  // X軸のラベル
        };
        
        // 6. 各データソースの値を取得
        activeSources.forEach(source => {
            const sourceBrandImageData = source.brandImageData || brandImageData;
            if (!sourceBrandImageData) {
                dataPoint[source.name] = 0;
                return;
            }
            
            const sourceSegmentData = sourceBrandImageData[selectedSegment];
            if (!sourceSegmentData) {
                dataPoint[source.name] = 0;
                return;
            }
            
            // ファジーマッチングを使用してブランドデータを取得
            const sourceBrandData = getBrandDataWithFuzzyMatch(sourceSegmentData, selectedBrand);
            if (!sourceBrandData) {
                dataPoint[source.name] = 0;
                return;
            }
            
            // 項目の値を取得（存在しない場合は0）
            const value = sourceBrandData[itemName] ?? 0;
            dataPoint[source.name] = value;
        });
        
        return dataPoint;
    });
    
    return chartData;
};

/**
 * 過去比較モード - ファネル分析①（ブランド軸）用のデータ変換
 * X軸がブランド、系列がデータソース、フィルタがセグメント＋ファネル項目
 * 
 * @param dataSources - アクティブなデータソース配列
 * @param config - 分析モード設定
 * @param selectedSegment - 選択されたセグメント（単一）
 * @param selectedBrands - 選択されたブランド（複数）
 * @param selectedItem - 選択されたファネル項目（単一: FT, FW, etc.）
 * @param labelGetters - ラベル取得関数
 * @returns チャートデータポイント配列
 */
export const transformDataForHistoricalBrandsComparison = (
    dataSources: DataSource[],
    config: AnalysisModeConfig,
    selectedSegment: string,
    selectedBrands: string[],
    selectedItem: string,
    labelGetters: Record<AxisType, (key: string) => string>
): ChartDataPoint[] | null => {
    
    // 1. アクティブなデータソースをフィルタ
    const activeSources = dataSources.filter(ds => ds.isActive);
    if (activeSources.length === 0) {
        console.warn('[Historical Mode 2] アクティブなデータソースがありません');
        return null;
    }

    // 2. 必須パラメータのチェック
    if (!selectedSegment) {
        console.warn('[Historical Mode 2] セグメントが選択されていません');
        return null;
    }
    
    if (!selectedItem) {
        console.warn('[Historical Mode 2] ファネル項目が選択されていません');
        return null;
    }
    
    if (!selectedBrands || selectedBrands.length === 0) {
        console.warn('[Historical Mode 2] ブランドが選択されていません');
        return null;
    }

    console.log('[Historical Mode 2] データ変換開始', {
        dataSources: activeSources.map(ds => ds.name),
        segment: selectedSegment,
        brands: selectedBrands,
        item: selectedItem
    });

    // 3. 各ブランドごとにデータポイントを生成
    const chartData: ChartDataPoint[] = selectedBrands.map(brandName => {
        const dataPoint: ChartDataPoint = {
            name: labelGetters.brands(brandName) || brandName
        };

        // 4. 各データソースの値を取得
        activeSources.forEach(source => {
            const segmentData = source.data[selectedSegment];
            if (!segmentData) {
                console.warn(`[Historical Mode 2] セグメント "${selectedSegment}" がデータソース "${source.name}" に存在しません`);
                dataPoint[source.name] = 0;
                return;
            }

            // ファジーマッチングを使用してブランドデータを取得
            const brandData = getBrandDataWithFuzzyMatch(segmentData, brandName);
            if (!brandData) {
                console.warn(`[Historical Mode 2] ブランド "${brandName}" がセグメント "${selectedSegment}" に存在しません（データソース: ${source.name}）`);
                dataPoint[source.name] = 0;
                return;
            }

            // ファネル項目の値を取得（FT, FW, FZ, GC, GJ, GL）
            const value = brandData[selectedItem as keyof typeof brandData];
            dataPoint[source.name] = typeof value === 'number' ? value : 0;
        });

        return dataPoint;
    });

    console.log('[Historical Mode 2] データ変換完了', {
        dataPoints: chartData.length,
        sample: chartData[0]
    });

    return chartData;
};

/**
 * 過去比較モード - ブランドイメージ分析（ブランド軸）用のデータ変換
 * X軸がブランド、系列がデータソース、フィルタがセグメント＋ブランドイメージ項目
 * 
 * @param dataSources - アクティブなデータソース配列
 * @param config - 分析モード設定
 * @param selectedSegment - 選択されたセグメント（単一）
 * @param selectedBrands - 選択されたブランド（複数）
 * @param selectedItem - 選択されたブランドイメージ項目（単一）
 * @param labelGetters - ラベル取得関数
 * @param brandImageData - ブランドイメージデータ（オプション）
 * @returns チャートデータポイント配列
 */
export const transformDataForHistoricalBrandImageBrandsComparison = (
    dataSources: Array<{
        id: string;
        name: string;
        data: SheetData;
        brandImageData?: BrandImageData;
        isActive: boolean;
    }>,
    config: AnalysisModeConfig,
    selectedSegment: string,
    selectedBrands: string[],
    selectedItem: string,
    labelGetters: Record<AxisType, (key: string) => string>,
    brandImageData?: BrandImageData
): ChartDataPoint[] | null => {
    
    // 1. アクティブなデータソースをフィルタ
    const activeSources = dataSources.filter(ds => ds.isActive);
    if (activeSources.length === 0) {
        console.warn('[Historical Mode 6] アクティブなデータソースがありません');
        return null;
    }

    // 2. 必須パラメータのチェック
    if (!selectedSegment) {
        console.warn('[Historical Mode 6] セグメントが選択されていません');
        return null;
    }
    
    if (!selectedItem) {
        console.warn('[Historical Mode 6] ブランドイメージ項目が選択されていません');
        return null;
    }
    
    if (!selectedBrands || selectedBrands.length === 0) {
        console.warn('[Historical Mode 6] ブランドが選択されていません');
        return null;
    }

    console.log('[Historical Mode 6] データ変換開始', {
        dataSources: activeSources.map(ds => ds.name),
        segment: selectedSegment,
        brands: selectedBrands,
        item: selectedItem
    });

    // 3. 各ブランドごとにデータポイントを生成
    const chartData: ChartDataPoint[] = selectedBrands.map(brandName => {
        const dataPoint: ChartDataPoint = {
            name: labelGetters.brands(brandName) || brandName
        };

        // 4. 各データソースの値を取得
        activeSources.forEach(source => {
            // ブランドイメージデータの取得
            const sourceBrandImageData = source.brandImageData || brandImageData;
            if (!sourceBrandImageData) {
                console.warn(`[Historical Mode 6] ブランドイメージデータがデータソース "${source.name}" に存在しません`);
                dataPoint[source.name] = 0;
                return;
            }

            const segmentData = sourceBrandImageData[selectedSegment];
            if (!segmentData) {
                console.warn(`[Historical Mode 6] セグメント "${selectedSegment}" がデータソース "${source.name}" に存在しません`);
                dataPoint[source.name] = 0;
                return;
            }

            // ファジーマッチングを使用してブランドデータを取得
            const brandData = getBrandDataWithFuzzyMatch(segmentData, brandName);
            if (!brandData) {
                console.warn(`[Historical Mode 6] ブランド "${brandName}" がセグメント "${selectedSegment}" に存在しません（データソース: ${source.name}）`);
                dataPoint[source.name] = 0;
                return;
            }

            // ブランドイメージ項目の値を取得
            const value = brandData[selectedItem] ?? 0;
            dataPoint[source.name] = value;
        });

        return dataPoint;
    });

    console.log('[Historical Mode 6] データ変換完了', {
        dataPoints: chartData.length,
        sample: chartData[0]
    });

    return chartData;
};