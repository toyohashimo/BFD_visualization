import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from 'recharts';
import { SheetData, AnalysisMode, ChartType, ChartDataPoint, FunnelMetrics, TimelineMetrics, AllMetrics, GlobalMode, DataSource, getItemKeysForSet, getItemLabelsForSet } from '../src/types';
import { formatSegmentName } from '../src/utils/formatters';
import {
    ANALYSIS_MODE_CONFIGS,
    HISTORICAL_ANALYSIS_MODE_CONFIGS
} from '../constants/analysisConfigs';
import { AISummaryButton } from './AISummaryButton';
import { AISummaryCard } from './AISummaryCard';
import { useAISummary, AISummaryContext, AISummaryMetadata } from '../src/hooks/useAISummary';

interface ChartAreaProps {
    globalMode: GlobalMode;
    analysisMode: AnalysisMode;
    sheet: string;
    targetBrand: string;
    selectedBrands: string[];
    selectedSegments: string[];
    dataSources: DataSource[]; // 過去比較モード用
    chartData: ChartDataPoint[];
    chartType: ChartType;
    showDataLabels: boolean;
    useAutoScale: boolean;
    activePalette: any[];
    brandColorIndices: Record<string, number>;
    segmentColorIndices: Record<string, number>;
    getBrandName: (name: string) => string;
    combinedRef: React.RefObject<HTMLDivElement>;
    chartRef: React.RefObject<HTMLDivElement>;
    data: SheetData;
    selectedItem: keyof FunnelMetrics | keyof TimelineMetrics;
    yAxisMax: number | '';
    isAnonymized: boolean; // DEMOモード判定用
    isDebugMode?: boolean; // デバッグモード判定用（APIキー設定済み）
}

export const ChartArea: React.FC<ChartAreaProps> = ({
    globalMode,
    analysisMode,
    sheet,
    targetBrand,
    selectedBrands,
    selectedSegments,
    dataSources,
    chartData,
    chartType,
    showDataLabels,
    useAutoScale,
    activePalette,
    brandColorIndices,
    segmentColorIndices,
    getBrandName,
    combinedRef,
    chartRef,
    data,
    selectedItem,
    yAxisMax,
    isAnonymized,
    isDebugMode = false, // デフォルトはfalse
}) => {
    // データがない場合は早期リターン
    if (!chartData || chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                    <div className="text-gray-400 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">データがありません</h3>
                    <p className="text-sm text-gray-500">データソースを追加してください</p>
                </div>
            </div>
        );
    }

    // グローバルモードに応じた分析モード設定
    const currentModeConfigs = useMemo(() => {
        return globalMode === 'historical'
            ? HISTORICAL_ANALYSIS_MODE_CONFIGS
            : ANALYSIS_MODE_CONFIGS;
    }, [globalMode]);

    // Chart height state with localStorage persistence
    const [chartHeight, setChartHeight] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('chart_height');
            return saved ? parseInt(saved, 10) : 400;
        } catch {
            return 400;
        }
    });

    // Resize state
    const [isResizing, setIsResizing] = useState(false);
    const resizeStartY = useRef<number>(0);
    const resizeStartHeight = useRef<number>(0);

    // Persist chart height to localStorage
    useEffect(() => {
        localStorage.setItem('chart_height', chartHeight.toString());
    }, [chartHeight]);

    // Mouse event handlers for resizing
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        resizeStartY.current = e.clientY;
        resizeStartHeight.current = chartHeight;
    }, [chartHeight]);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - resizeStartY.current;
            const newHeight = Math.max(200, Math.min(800, resizeStartHeight.current + deltaY));
            setChartHeight(newHeight);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // Configuration-driven series determination
    const seriesItems = useMemo(() => {
        // 過去比較モードの場合は、アクティブなデータソースの名前をseries として使用
        if (globalMode === 'historical') {
            return dataSources.filter(ds => ds.isActive).map(ds => ds.name);
        }

        // 詳細分析モードの場合は既存のロジック
        const config = currentModeConfigs[analysisMode];
        if (!config) return [];
        const seriesAxis = config.dataTransform.series;

        switch (seriesAxis) {
            case 'brands': return selectedBrands;
            case 'segments': return selectedSegments;
            case 'items': return []; // Items are not typically used as series
            default: return [];
        }
    }, [globalMode, analysisMode, selectedBrands, selectedSegments, dataSources, currentModeConfigs]);

    // Check if brand image mode (for vertical X-axis labels)
    const isBrandImageMode = useMemo(() => {
        const config = currentModeConfigs[analysisMode];
        if (!config) return false;
        return config.axes.items?.autoSelect === true;
    }, [analysisMode, currentModeConfigs]);

    // Calculate Y-axis domain for auto-scaling
    const yAxisDomain = useMemo(() => {
        if (!useAutoScale) {
            if (yAxisMax !== '' && typeof yAxisMax === 'number') {
                return [0, yAxisMax];
            }
            return [0, 100];
        }

        // Find the maximum value in chartData
        let maxValue = 0;
        chartData.forEach(dataPoint => {
            Object.keys(dataPoint).forEach(key => {
                if (key !== 'name' && typeof dataPoint[key] === 'number') {
                    maxValue = Math.max(maxValue, dataPoint[key] as number);
                }
            });
        });

        // Add some padding (10%) to the max value for better visualization
        const paddedMax = maxValue * 1.1;

        // Round up to a nice number
        const roundedMax = Math.ceil(paddedMax / 10) * 10;

        return [0, Math.max(roundedMax, 10)]; // At least 10 for minimum scale
    }, [useAutoScale, chartData, yAxisMax]);

    const getSeriesColorIndex = useCallback((item: string, index: number): number => {
        const config = currentModeConfigs[analysisMode];
        if (!config) return index;
        const seriesAxis = config.dataTransform.series;

        if (seriesAxis === 'brands') {
            return brandColorIndices[item] ?? index;
        } else if (seriesAxis === 'segments') {
            return segmentColorIndices[item] ?? index;
        }
        return index;
    }, [analysisMode, brandColorIndices, segmentColorIndices, currentModeConfigs]);

    const getSeriesDisplayName = useCallback((item: string, index?: number): string => {
        const config = currentModeConfigs[analysisMode];
        if (!config) return item;
        const seriesAxis = config.dataTransform.series;

        if (seriesAxis === 'brands') {
            return getBrandName(item);
        } else if (seriesAxis === 'segments') {
            return formatSegmentName(item, isAnonymized, index);
        }
        return item;
    }, [analysisMode, getBrandName, currentModeConfigs, isAnonymized]);

    // Manual Legend Payload
    const legendPayload = useMemo(() => {
        return seriesItems.map((item, index) => {
            const colorIndex = getSeriesColorIndex(item, index);
            const colorObj = activePalette[colorIndex % activePalette.length];
            const displayName = getSeriesDisplayName(item, index);
            return {
                id: displayName,
                value: displayName,
                type: chartType === 'line' ? 'circle' : chartType === 'radar' ? 'star' : 'rect',
                color: chartType === 'line' ? colorObj.border : colorObj.bg,
            };
        });
    }, [seriesItems, getSeriesColorIndex, activePalette, chartType, getSeriesDisplayName]);

    // Custom Legend Renderer
    const renderCustomLegend = useCallback(() => {
        return (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-4">
                {legendPayload.map((entry: any, index: number) => (
                    <div key={`legend-item-${index}`} className="flex items-center gap-1.5">
                        <div
                            className={`w-3 h-3 flex-shrink-0 ${chartType === 'line' || chartType === 'radar' ? 'rounded-full' : 'rounded-[2px]'}`}
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs text-gray-600 font-medium">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }, [chartType, legendPayload]);

    // Custom Tooltip Sorter
    const tooltipItemSorter = useCallback((item: any) => {
        const displayName = item.name;
        const index = seriesItems.findIndex((seriesItem, idx) =>
            getSeriesDisplayName(seriesItem, idx) === displayName
        );
        return index === -1 ? 999 : index;
    }, [seriesItems, getSeriesDisplayName]);

    // Configuration-driven chart label
    const chartFilters = useMemo(() => {
        const config = currentModeConfigs[analysisMode];
        if (!config) return [];

        const filters: Array<{ label: string; value: string }> = [];

        // Mode 2/4/6では複数のフィルタ（セグメント + 項目）がある場合があるため、
        // role: 'FILTER' の軸をすべて収集
        const axes = config.axes;

        // セグメントがフィルタの場合
        if (axes.segments.role === 'FILTER') {
            filters.push({
                label: axes.segments.label,
                value: formatSegmentName(sheet, isAnonymized)
            });
        }

        // ブランドがフィルタの場合
        if (axes.brands.role === 'FILTER') {
            filters.push({
                label: axes.brands.label,
                value: getBrandName(targetBrand)
            });
        }

        // 項目がフィルタの場合
        if (axes.items.role === 'FILTER') {
            const itemSet = axes.items.itemSet || 'funnel';
            const itemLabels = getItemLabelsForSet(itemSet);
            filters.push({
                label: axes.items.label,
                value: itemLabels[selectedItem] || selectedItem
            });
        }

        return filters;
    }, [analysisMode, sheet, targetBrand, selectedItem, getBrandName, currentModeConfigs]);

    // 後方互換性のため、最初のフィルタをchartLabel/chartValueとして保持
    const { chartLabel, chartValue } = useMemo(() => {
        if (chartFilters.length > 0) {
            return { chartLabel: chartFilters[0].label, chartValue: chartFilters[0].value };
        }
        return { chartLabel: '', chartValue: '' };
    }, [chartFilters]);

    // AIサマリー用のメタデータを準備
    const aiMetadata: AISummaryMetadata = useMemo(() => {
        const config = currentModeConfigs[analysisMode];
        const itemSet = config?.axes.items?.itemSet || 'funnel';
        const itemLabels = getItemLabelsForSet(itemSet);

        // ブランド名マップを作成
        const brandNames: Record<string, string> = {};
        [...selectedBrands, targetBrand].forEach(brand => {
            if (brand) {
                brandNames[brand] = getBrandName(brand);
            }
        });

        return {
            itemLabels,
            brandNames,
        };
    }, [analysisMode, selectedBrands, targetBrand, getBrandName, currentModeConfigs]);

    // AIサマリー用のコンテキスト
    const aiContext: AISummaryContext = useMemo(() => ({
        globalMode,
        analysisMode,
        chartType,
        sheet,
        targetBrand,
        selectedBrands,
        selectedSegments,
        selectedItem: selectedItem || '',
        dataSources: globalMode === 'historical' ? dataSources.map(ds => ({
            name: ds.name,
            isActive: ds.isActive,
        })) : undefined,
        isAnonymized, // DEMOモード判定を追加
    }), [globalMode, analysisMode, chartType, sheet, targetBrand, selectedBrands, selectedSegments, selectedItem, dataSources, isAnonymized]);

    // AIサマリーフック
    const { summary, isLoading, error, generateSummary, clearSummary } = useAISummary(
        chartData,
        aiContext,
        aiMetadata
    );

    return (
        <div ref={combinedRef} className="w-full px-0 md:px-4 space-y-6 bg-white">
            {/* Chart Section */}
            <div ref={chartRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 relative">
                {/* AIサマリーボタン（右上に配置、デバッグモード時のみ） */}
                {chartData.length > 0 && isDebugMode && (
                    <AISummaryButton
                        onClick={generateSummary}
                        isLoading={isLoading}
                        disabled={chartData.length === 0}
                    />
                )}
                <div className="mb-6 flex items-center justify-between px-2">
                    <div className="flex items-center gap-4 flex-wrap">
                        {chartFilters.map((filter, index) => (
                            <h2 key={index} className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="text-gray-400 font-normal text-sm">{filter.label}:</span>
                                {filter.value}
                            </h2>
                        ))}
                    </div>
                </div>
                <div className="h-[400px] w-full bg-white" style={{ height: `${chartHeight}px` }}>
                    {chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            データが選択されていません
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'radar' ? (
                                <RadarChart key={seriesItems.join(',')} outerRadius={isBrandImageMode ? "60%" : "70%"} data={chartData} margin={{ bottom: 20 }} startAngle={90} endAngle={-270}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis
                                        dataKey="name"
                                        tick={{
                                            fill: '#4b5563',
                                            fontSize: isBrandImageMode ? 9 : 12,
                                            fontWeight: 500
                                        }}
                                    />
                                    <PolarRadiusAxis angle={90} domain={yAxisDomain} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    {seriesItems.map((item, index) => {
                                        const colorIndex = getSeriesColorIndex(item, index);
                                        const colorObj = activePalette[colorIndex % activePalette.length];
                                        const displayName = getSeriesDisplayName(item);
                                        return (
                                            <Radar
                                                key={item}
                                                name={displayName}
                                                dataKey={displayName}
                                                stroke={colorObj.border}
                                                fill={colorObj.bg}
                                                fillOpacity={0.5}
                                            />
                                        );
                                    })}
                                    <Tooltip
                                        itemSorter={tooltipItemSorter}
                                        formatter={(value: number) => Number(value).toFixed(1)}
                                    />
                                </RadarChart>
                            ) : chartType === 'line' ? (
                                <LineChart key={seriesItems.join(',')} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: isBrandImageMode ? 140 : 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        interval={isBrandImageMode ? 0 : 'preserveStartEnd'}
                                        tick={{
                                            fill: '#6b7280',
                                            fontSize: isBrandImageMode ? 10 : 12,
                                            angle: isBrandImageMode ? -90 : 0,
                                            textAnchor: isBrandImageMode ? 'end' : 'middle'
                                        }}
                                        dy={10}
                                        height={isBrandImageMode ? 140 : 30}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                                        domain={yAxisDomain}
                                    />
                                    <Tooltip
                                        itemSorter={tooltipItemSorter}
                                        formatter={(value: number) => Number(value).toFixed(1)}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ stroke: '#d1d5db', strokeWidth: 1 }}
                                    />
                                    {seriesItems.map((item, index) => {
                                        const colorIndex = getSeriesColorIndex(item, index);
                                        const colorObj = activePalette[colorIndex % activePalette.length];
                                        const displayName = getSeriesDisplayName(item);
                                        return (
                                            <Line
                                                key={item}
                                                type="monotone"
                                                dataKey={displayName}
                                                stroke={colorObj.border}
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
                                                activeDot={{ r: 6 }}
                                                label={showDataLabels ? { position: 'top', formatter: (val: any) => Number(val).toFixed(1), fill: '#6b7280', fontSize: 14 } : false}
                                            />
                                        );
                                    })}
                                </LineChart>
                            ) : chartType === 'horizontalBar' ? (
                                <BarChart key={seriesItems.join(',')} layout="vertical" data={chartData} margin={{ top: 20, right: 30, left: isBrandImageMode ? 150 : 50, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                    <XAxis type="number" domain={yAxisDomain} hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={isBrandImageMode ? 130 : 120}
                                        tick={{ fontSize: isBrandImageMode ? 9 : 11, fill: '#4b5563' }}
                                        interval={0}
                                    />
                                    <Tooltip
                                        itemSorter={tooltipItemSorter}
                                        cursor={{ fill: '#f9fafb' }}
                                        formatter={(value: number) => Number(value).toFixed(1)}
                                    />
                                    {seriesItems.map((item, index) => {
                                        const colorIndex = getSeriesColorIndex(item, index);
                                        const colorObj = activePalette[colorIndex % activePalette.length];
                                        const displayName = getSeriesDisplayName(item);
                                        return (
                                            <Bar
                                                key={item}
                                                dataKey={displayName}
                                                fill={colorObj.bg}
                                                radius={[0, 4, 4, 0]}
                                                barSize={20}
                                                label={showDataLabels ? { position: 'right', formatter: (val: any) => Number(val).toFixed(1), fill: '#6b7280', fontSize: 14 } : false}
                                            />
                                        );
                                    })}
                                </BarChart>
                            ) : (
                                <BarChart key={seriesItems.join(',')} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: isBrandImageMode ? 140 : 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        interval={isBrandImageMode ? 0 : 'preserveStartEnd'}
                                        tick={{
                                            fill: '#6b7280',
                                            fontSize: isBrandImageMode ? 10 : 12,
                                            angle: isBrandImageMode ? -90 : 0,
                                            textAnchor: isBrandImageMode ? 'end' : 'middle'
                                        }}
                                        dy={10}
                                        height={isBrandImageMode ? 140 : 30}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                                        domain={yAxisDomain}
                                    />
                                    <Tooltip
                                        itemSorter={tooltipItemSorter}
                                        formatter={(value: number) => Number(value).toFixed(1)}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ fill: '#f9fafb' }}
                                    />
                                    {seriesItems.map((item, index) => {
                                        const colorIndex = getSeriesColorIndex(item, index);
                                        const colorObj = activePalette[colorIndex % activePalette.length];
                                        const displayName = getSeriesDisplayName(item);
                                        return (
                                            <Bar
                                                key={item}
                                                dataKey={displayName}
                                                fill={colorObj.bg}
                                                radius={[4, 4, 0, 0]}
                                                label={showDataLabels ? (props: any) => {
                                                    const { x, y, width, value } = props;
                                                    return (
                                                        <text x={x + width / 2} y={y} dy={-6} fill="#6b7280" fontSize={14} textAnchor="middle">
                                                            {Number(value).toFixed(1)}
                                                        </text>
                                                    );
                                                } : false}
                                            />
                                        );
                                    })}
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    )}
                </div>
                {/* Legend Section - Positioned Below Chart */}
                <div className="mt-4 pb-2">
                    {renderCustomLegend()}
                </div>
                {/* Resize Handle */}
                <div
                    className={`h-2 w-full cursor-ns-resize flex items-center justify-center group ${isResizing ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                    onMouseDown={handleResizeStart}
                >
                    <div className={`h-1 w-16 rounded-full ${isResizing ? 'bg-indigo-500' : 'bg-gray-400 group-hover:bg-gray-500'}`} />
                </div>
            </div>

            {/* AIサマリーカード */}
            {(summary || isLoading || error) && (
                <AISummaryCard
                    summary={summary}
                    isLoading={isLoading}
                    error={error}
                    onClear={clearSummary}
                />
            )}

            {/* Data Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="py-3 px-6 bg-gray-50/50 flex justify-between items-center border-b border-gray-100">
                    <div />
                    <span className="text-xs text-gray-500 font-medium">単位 (%)</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-white border-b border-gray-100">
                                {(() => {
                                    // 過去比較モードの場合
                                    if (globalMode === 'historical') {
                                        // 表頭：X軸項目（ファネル分析①の項目など）
                                        return (
                                            <>
                                                <th className="py-4 px-6 font-medium text-gray-500">データソース</th>
                                                {chartData.map((dataPoint, index) => (
                                                    <th key={index} className="py-4 px-6 font-medium text-gray-500 text-center">
                                                        {dataPoint.name}
                                                    </th>
                                                ))}
                                            </>
                                        );
                                    }

                                    // 詳細分析モード（既存のロジック）
                                    const config = currentModeConfigs[analysisMode];
                                    if (!config) return null;
                                    const xAxis = config.dataTransform.xAxis;
                                    const isAutoSelectMode = config.axes.items?.autoSelect === true;

                                    if (isAutoSelectMode) {
                                        // Brand Image Mode - Check which mode
                                        const top5Items = chartData.slice(0, 5);
                                        if (config.id === 'brand_image_segment_brands') {
                                            // Mode 7: Brands as rows
                                            return (
                                                <>
                                                    <th className="py-4 px-6 font-medium text-gray-500">ブランド</th>
                                                    {top5Items.map((item, idx) => (
                                                        <th key={idx} className="py-4 px-6 font-medium text-gray-500 text-center">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-xs">{item.name}</span>
                                                            </div>
                                                        </th>
                                                    ))}
                                                </>
                                            );
                                        } else {
                                            // Mode 8: Segments as rows
                                            return (
                                                <>
                                                    <th className="py-4 px-6 font-medium text-gray-500">セグメント</th>
                                                    {top5Items.map((item, idx) => (
                                                        <th key={idx} className="py-4 px-6 font-medium text-gray-500 text-center">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-xs">{item.name}</span>
                                                            </div>
                                                        </th>
                                                    ))}
                                                </>
                                            );
                                        }
                                    } else if (xAxis === 'brands') {
                                        // Mode 3, 6: Brands on X-axis
                                        return (
                                            <>
                                                <th className="py-4 px-6 font-medium text-gray-500">セグメント</th>
                                                {selectedBrands.map(brand => (
                                                    <th key={brand} className="py-4 px-6 font-medium text-gray-500 text-center">
                                                        {getBrandName(brand)}
                                                    </th>
                                                ))}
                                            </>
                                        );
                                    } else {
                                        // Mode 1, 2, 4, 5: Items on X-axis
                                        const seriesAxis = config.dataTransform.series;
                                        const itemSet = config.axes.items.itemSet || 'funnel';
                                        const itemKeys = getItemKeysForSet(itemSet);
                                        const itemLabels = getItemLabelsForSet(itemSet);

                                        return (
                                            <>
                                                <th className="py-4 px-6 font-medium text-gray-500">
                                                    {seriesAxis === 'brands' ? 'ブランド' : 'セグメント'}
                                                </th>
                                                {itemKeys.map(key => {
                                                    const label = itemLabels[key];
                                                    const hasParentheses = label.includes('(');
                                                    return (
                                                        <th key={key} className="py-4 px-6 font-medium text-gray-500 text-center">
                                                            <div className="flex flex-col">
                                                                <span>{hasParentheses ? label.split('(')[0] : label}</span>
                                                                {hasParentheses && (
                                                                    <span className="text-xs text-gray-400 mt-0.5">
                                                                        ({label.split('(')[1]?.replace(')', '') || ''})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </th>
                                                    );
                                                })}
                                            </>
                                        );
                                    }
                                })()}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(() => {
                                // 過去比較モードの場合
                                if (globalMode === 'historical') {
                                    const activeDataSources = dataSources.filter(ds => ds.isActive);
                                    // 各データソースを行として表示
                                    return activeDataSources.map((ds, dsIndex) => {
                                        const colorIndex = dsIndex % activePalette.length;
                                        const color = activePalette[colorIndex].hex;

                                        return (
                                            <tr key={ds.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6 font-medium text-gray-700 flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                                    {ds.name}
                                                </td>
                                                {chartData.map((dataPoint, index) => {
                                                    const value = dataPoint[ds.name];
                                                    return (
                                                        <td key={index} className="py-4 px-6 text-center text-gray-600">
                                                            {value !== undefined ? Number(value).toFixed(1) : '-'}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    });
                                }

                                // 詳細分析モード（既存のロジック）
                                const config = currentModeConfigs[analysisMode];
                                if (!config) return null;
                                const xAxis = config.dataTransform.xAxis;
                                const isAutoSelectMode = config.axes.items?.autoSelect === true;

                                if (isAutoSelectMode) {
                                    // Brand Image Mode - Check which mode
                                    const top5Items = chartData.slice(0, 5);

                                    if (config.id === 'brand_image_segment_brands') {
                                        // Mode 7: Brands as rows, TOP 5 items as columns
                                        return selectedBrands.map((brand, brandIndex) => {
                                            const colorIndex = brandColorIndices[brand] ?? brandIndex;
                                            const color = activePalette[colorIndex % activePalette.length].hex;
                                            const displayName = getBrandName(brand);

                                            return (
                                                <tr key={brand} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-6 font-medium text-gray-700 flex items-center gap-3">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                                        {displayName}
                                                    </td>
                                                    {top5Items.map((item, idx) => {
                                                        const value = item[displayName];
                                                        return (
                                                            <td key={idx} className="py-4 px-6 text-center text-gray-600">
                                                                {value !== undefined ? Number(value).toFixed(1) : '-'}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        });
                                    } else {
                                        // Mode 8: Segments as rows, TOP 5 items as columns
                                        return selectedSegments.map((seg, segIndex) => {
                                            const colorIndex = segmentColorIndices[seg] ?? segIndex;
                                            const color = activePalette[colorIndex % activePalette.length].hex;
                                            const displayName = formatSegmentName(seg, isAnonymized, segIndex);

                                            return (
                                                <tr key={seg} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-6 font-medium text-gray-700 flex items-center gap-3">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                                        {displayName}
                                                    </td>
                                                    {top5Items.map((item, idx) => {
                                                        const value = item[displayName];
                                                        return (
                                                            <td key={idx} className="py-4 px-6 text-center text-gray-600">
                                                                {value !== undefined ? Number(value).toFixed(1) : '-'}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        });
                                    }
                                } else if (xAxis === 'brands') {
                                    // Mode 3, 6: Segment (rows) × Brand (columns) cross table
                                    return selectedSegments.map((seg, segIndex) => {
                                        const displaySegName = formatSegmentName(seg, isAnonymized, segIndex);
                                        const colorIndex = segmentColorIndices[seg] ?? segIndex;
                                        const color = activePalette[colorIndex % activePalette.length].hex;

                                        return (
                                            <tr key={seg} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6 font-medium text-gray-700 flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                                    {displaySegName}
                                                </td>
                                                {selectedBrands.map(brand => {
                                                    const dataRow = data[seg]?.[brand];
                                                    return (
                                                        <td key={`${seg}-${brand}`} className="py-4 px-6 text-center text-gray-600">
                                                            {dataRow && dataRow[selectedItem as keyof AllMetrics] !== undefined
                                                                ? dataRow[selectedItem as keyof AllMetrics].toFixed(1)
                                                                : '-'}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    });
                                } else {
                                    // Mode 1, 2, 4, 5: Standard table with items as columns
                                    const seriesAxis = config.dataTransform.series;
                                    const itemSet = config.axes.items.itemSet || 'funnel';
                                    const itemKeys = getItemKeysForSet(itemSet);

                                    return (seriesAxis === 'brands' ? selectedBrands : selectedSegments).map((item, index) => {
                                        const isBrand = seriesAxis === 'brands';
                                        const dataRow = isBrand ? data[sheet][item] : data[item]?.[targetBrand];
                                        const colorIndex = isBrand ? (brandColorIndices[item] ?? index) : (segmentColorIndices[item] ?? index);
                                        const color = activePalette[colorIndex % activePalette.length].hex;
                                        const displayName = isBrand ? getBrandName(item) : item.replace(/[（(]BFDシート[_＿]?[値]?[）)]?.*?St\d+/g, '').trim();

                                        if (!dataRow) return null;

                                        return (
                                            <tr key={item} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6 font-medium text-gray-700 flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                                    {displayName}
                                                </td>
                                                {itemKeys.map(key => {
                                                    // For archetype metrics, access nested property
                                                    let value;
                                                    if (itemSet === 'archetype' && dataRow.archetypeMetrics) {
                                                        value = dataRow.archetypeMetrics[key as keyof typeof dataRow.archetypeMetrics];
                                                    } else {
                                                        value = dataRow[key as keyof AllMetrics];
                                                    }

                                                    return (
                                                        <td key={key} className="py-4 px-6 text-center text-gray-600">
                                                            {value !== undefined ? Number(value).toFixed(1) : '-'}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    });
                                }
                            })()}
                        </tbody>
                    </table>
                    {(() => {
                        const config = currentModeConfigs[analysisMode];
                        if (!config) return null;

                        // 過去比較モードの場合は、chartDataの有無で判定
                        if (globalMode === 'historical') {
                            // chartDataが存在すれば警告を表示しない
                            if (chartData && chartData.length > 0) return null;

                            // データソースがない場合の警告
                            if (dataSources.length === 0) {
                                return (
                                    <div className="py-12 text-center text-gray-400 text-sm">
                                        データがありません。左側のメニューからデータソースを追加してください。
                                    </div>
                                );
                            }
                            return null;
                        }

                        // 詳細分析モードの場合（既存ロジック）
                        const xAxis = config.dataTransform.xAxis;
                        const seriesAxis = config.dataTransform.series;

                        const hasData = xAxis === 'brands'
                            ? selectedBrands.length > 0 && selectedSegments.length > 0
                            : seriesAxis === 'brands'
                                ? selectedBrands.length > 0
                                : selectedSegments.length > 0;

                        if (hasData) return null;

                        const message = xAxis === 'brands'
                            ? 'データがありません。左側のメニューからブランドとセグメントを追加してください。'
                            : seriesAxis === 'brands'
                                ? 'データがありません。左側のメニューからブランドを追加してください。'
                                : 'データがありません。左側のメニューからセグメントを追加してください。';

                        return (
                            <div className="py-12 text-center text-gray-400 text-sm">
                                {message}
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};
