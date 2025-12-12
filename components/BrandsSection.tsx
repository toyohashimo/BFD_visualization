import React from 'react';
import { Activity, ChevronDown, Trash2 } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    DragEndEvent,
    SensorDescriptor,
    SensorOptions
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { SortableBrandItem } from './SortableBrandItem';
import { AnalysisMode, GlobalMode } from '../src/types';
import {
    ANALYSIS_MODE_CONFIGS,
    HISTORICAL_ANALYSIS_MODE_CONFIGS
} from '../constants/analysisConfigs';

interface BrandsSectionProps {
    globalMode: GlobalMode;
    analysisMode: AnalysisMode;
    targetBrand: string;
    setTargetBrand: (brand: string) => void;
    allUniqueBrands: string[];
    getBrandName: (name: string) => string;
    brandAvailability?: Array<{
        brand: string;
        fileCount: number;
        totalFiles: number;
        availableInFiles: string[];
    }>;
    selectedBrands: string[];
    availableBrands: string[];
    handleAddBrand: (brand: string) => void;
    handleRemoveBrand: (brand: string) => void;
    handleClearAllBrands: () => void;
    brandColorIndices: Record<string, number>;
    activePalette: any[];
    sensors: SensorDescriptor<SensorOptions>[];
    handleDragEnd: (event: DragEndEvent) => void;
}

export const BrandsSection: React.FC<BrandsSectionProps> = ({
    globalMode,
    analysisMode,
    targetBrand,
    setTargetBrand,
    allUniqueBrands,
    getBrandName,
    brandAvailability,
    selectedBrands,
    availableBrands,
    handleAddBrand,
    handleRemoveBrand,
    handleClearAllBrands,
    brandColorIndices,
    activePalette,
    sensors,
    handleDragEnd
}) => {
    // analysisModeが空の場合は何も表示しない
    if (!analysisMode) {
        return null;
    }

    const currentModeConfigs = globalMode === 'historical'
        ? HISTORICAL_ANALYSIS_MODE_CONFIGS
        : ANALYSIS_MODE_CONFIGS;

    const config = currentModeConfigs[analysisMode];
    if (!config) {
        return null;
    }
    const brandsConfig = config.axes.brands;
    const itemsConfig = config.axes.items;

    // 過去比較モード時は基本的にSA（単一選択）だが、Mode 2/4/6は例外（複数選択）
    const isMode2Or4Or6 = analysisMode === 'historical_funnel1_brands_comparison'
        || analysisMode === 'historical_funnel2_brands_comparison'
        || analysisMode === 'historical_brand_image_brands_comparison';
    const allowMultiple = globalMode === 'historical'
        ? (isMode2Or4Or6 ? true : false)  // Mode 2/4/6のみ複数選択を許可
        : brandsConfig.allowMultiple;
    const badge = allowMultiple ? 'MA' : 'SA';

    // Check if brand image mode (auto-select mode)
    const isBrandImageMode = itemsConfig.autoSelect === true;

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" /> ブランド
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full font-bold">
                    {badge}
                </span>
            </label>
            {!allowMultiple ? (
                <div className="relative">
                    <select
                        value={selectedBrands[0] || ''}
                        onChange={(e) => {
                            if (e.target.value) {
                                // setTargetBrand を使って更新
                                // これは内部的に setBrands([value]) を呼ぶ
                                setTargetBrand(e.target.value);
                            }
                        }}
                        className="w-full p-2.5 pr-8 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm appearance-none cursor-pointer"
                    >
                        {allUniqueBrands.length === 0 && <option value="">ブランドを選択...</option>}
                        {allUniqueBrands.map(b => {
                            const availability = brandAvailability?.find(a => a.brand === b);
                            const hasPartialData = availability && availability.fileCount < availability.totalFiles;

                            return (
                                <option key={b} value={b}>
                                    {getBrandName(b)}
                                    {hasPartialData && ` ⚠ (${availability.fileCount}/${availability.totalFiles})`}
                                </option>
                            );
                        })}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <select
                                onChange={(e) => {
                                    handleAddBrand(e.target.value);
                                    e.target.value = '';
                                }}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm appearance-none cursor-pointer"
                            >
                                <option value="">ブランドを追加...</option>
                                {(analysisMode === 'funnel_segment_brands' ? availableBrands : allUniqueBrands)
                                    .filter(b => !selectedBrands.includes(b))
                                    .map(brand => (
                                        <option key={brand} value={brand}>{getBrandName(brand)}</option>
                                    ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                        {selectedBrands.length > 0 && (
                            <button
                                onClick={handleClearAllBrands}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                                title="全てクリア"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="space-y-2 min-h-[60px] mt-2">
                        {isBrandImageMode && selectedBrands.length > 0 && (
                            <div className="flex items-start gap-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg mb-2">
                                <span className="text-amber-600 font-bold text-sm mt-0.5">⚠</span>
                                <p className="text-xs text-amber-800">
                                    先頭のブランドが基準となります
                                </p>
                            </div>
                        )}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={selectedBrands}
                                strategy={verticalListSortingStrategy}
                            >
                                {selectedBrands.map((brand, index) => {
                                    const colorIndex = brandColorIndices[brand] ?? index;
                                    const color = activePalette[colorIndex % activePalette.length].hex;
                                    return (
                                        <SortableBrandItem
                                            key={brand}
                                            id={brand}
                                            color={color}
                                            name={getBrandName(brand)}
                                            onRemove={handleRemoveBrand}
                                        />
                                    );
                                })}
                            </SortableContext>
                        </DndContext>
                        {selectedBrands.length === 0 && (
                            <div className="text-center py-4 text-gray-400 text-xs bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                ブランドが選択されていません
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
