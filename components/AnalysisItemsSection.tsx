import React, { useMemo } from 'react';
import { BarChart2, ChevronDown } from 'lucide-react';

import { AnalysisMode, FunnelMetrics, TimelineMetrics, GlobalMode, getItemKeysForSet, getItemLabelsForSet, SheetData, BrandImageData } from '../src/types';
import {
    ANALYSIS_MODE_CONFIGS,
    HISTORICAL_ANALYSIS_MODE_CONFIGS
} from '../constants/analysisConfigs';

interface AnalysisItemsSectionProps {
    globalMode: GlobalMode;
    analysisMode: AnalysisMode;
    selectedItem: keyof FunnelMetrics | keyof TimelineMetrics;
    setSelectedItem: (item: keyof FunnelMetrics | keyof TimelineMetrics) => void;
    isExcelData: boolean;
    dataSources?: any[];  // 過去比較モード用
    selectedSegment?: string;  // ブランドイメージ項目取得用
    selectedBrand?: string;  // ブランドイメージ項目取得用（参照ブランド）
    data?: SheetData;  // 詳細分析モード用（データから項目を取得）
    brandImageData?: BrandImageData;  // 詳細分析モード用（ブランドイメージデータ）
}

export const AnalysisItemsSection: React.FC<AnalysisItemsSectionProps> = ({
    globalMode,
    analysisMode,
    selectedItem,
    setSelectedItem,
    isExcelData,
    dataSources,
    selectedSegment,
    selectedBrand,
    data,
    brandImageData
}) => {
    // Excelデータがない場合、またはanalysisModeが空の場合は何も表示しない
    if (!isExcelData || !analysisMode) {
        return null;
    }

    const currentModeConfigs = globalMode === 'historical'
        ? HISTORICAL_ANALYSIS_MODE_CONFIGS
        : ANALYSIS_MODE_CONFIGS;

    const config = currentModeConfigs[analysisMode];
    if (!config) {
        return null;
    }

    const itemsConfig = config.axes.items;

    // Check if auto-select mode (e.g., brand image)
    const isAutoSelect = itemsConfig.autoSelect === true;

    // Items are selectable if role is FILTER (even though allowMultiple is false)
    const isSelectable = itemsConfig.role === 'FILTER' && !isAutoSelect;
    const badge = isAutoSelect ? '自動選定' : (!isSelectable ? '固定' : 'SA');

    // Get item set and corresponding keys/labels
    const itemSet = itemsConfig.itemSet || 'funnel';

    // ブランドイメージ項目の場合は動的に取得
    const { itemKeys, itemLabels } = useMemo(() => {
        if (itemSet === 'brandImage') {
            // 過去比較モードの場合
            if (globalMode === 'historical' && dataSources && selectedSegment && selectedBrand) {
                const activeSources = dataSources.filter((ds: any) => ds.isActive);
                if (activeSources.length > 0) {
                    const referenceSource = activeSources[0];
                    const historicalBrandImageData = referenceSource.brandImageData;
                    if (historicalBrandImageData && historicalBrandImageData[selectedSegment] && historicalBrandImageData[selectedSegment][selectedBrand]) {
                        const items = Object.keys(historicalBrandImageData[selectedSegment][selectedBrand])
                            .filter(item => item !== 'あてはまるものはない')
                            .sort();
                        const labels = items.reduce((acc: Record<string, string>, item: string) => {
                            acc[item] = item;
                            return acc;
                        }, {});

                        // 自動選択: selectedItemが無効な場合は最初の項目を選択
                        if (items.length > 0 && !items.includes(selectedItem as string)) {
                            setTimeout(() => setSelectedItem(items[0] as keyof FunnelMetrics | keyof TimelineMetrics), 0);
                        }

                        return { itemKeys: items, itemLabels: labels };
                    }
                }
            }

            // 詳細分析モードの場合: brandImageDataから項目を取得
            if (globalMode === 'detailed' && brandImageData && selectedSegment && selectedBrand) {
                if (brandImageData[selectedSegment] && brandImageData[selectedSegment][selectedBrand]) {
                    const items = Object.keys(brandImageData[selectedSegment][selectedBrand])
                        .filter(item => item !== 'あてはまるものはない')
                        .sort();
                    const labels = items.reduce((acc: Record<string, string>, item: string) => {
                        acc[item] = item;
                        return acc;
                    }, {});

                    // 自動選択: selectedItemが無効な場合は最初の項目を選択
                    if (items.length > 0 && !items.includes(selectedItem as string)) {
                        setTimeout(() => setSelectedItem(items[0] as keyof FunnelMetrics | keyof TimelineMetrics), 0);
                    }

                    return { itemKeys: items, itemLabels: labels };
                }
            }
        }
        // 通常のitemSet（funnel, timeline, etc.）の場合
        return {
            itemKeys: getItemKeysForSet(itemSet),
            itemLabels: getItemLabelsForSet(itemSet)
        };
    }, [itemSet, globalMode, dataSources, brandImageData, selectedSegment, selectedBrand, selectedItem, setSelectedItem]);

    // Display name for fixed or auto-select items
    const fixedDisplayName =
        itemSet === 'timeline' ? 'ファネル分析②' :
            itemSet === 'brandPower' ? '現在パワー' :
                itemSet === 'futurePower' ? '将来性パワー' :
                    itemSet === 'archetype' ? 'アーキタイプ' :
                        'ファネル分析①';
    const autoSelectDisplayName = `ブランドイメージ項目（TOP${itemsConfig.autoSelectCount || 30}）`;

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1">
                    <BarChart2 className="w-3 h-3" /> 分析項目
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full font-bold">
                    {badge}
                </span>
            </label>
            {isSelectable ? (
                <div className="relative">
                    <select
                        value={selectedItem}
                        onChange={(e) => setSelectedItem(e.target.value as keyof FunnelMetrics | keyof TimelineMetrics)}
                        className="w-full p-2.5 pr-8 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm appearance-none cursor-pointer"
                    >
                        {itemKeys.map(key => (
                            <option key={key} value={key}>{itemLabels[key]}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
            ) : isAutoSelect ? (
                <div className="space-y-1.5">
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 font-medium">
                        {autoSelectDisplayName}
                    </div>
                    <p className="text-xs text-gray-500 px-1">
                        ※ 選択ブランドの先頭ブランドの上位{itemsConfig.autoSelectCount || 30}項目を自動表示
                    </p>
                </div>
            ) : (
                <div className="p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600">
                    {fixedDisplayName}
                </div>
            )}
        </div>
    );
};
