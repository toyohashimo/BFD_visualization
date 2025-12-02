import React from 'react';
import { FileSpreadsheet, ChevronDown, Trash2 } from 'lucide-react';
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
import { AnalysisMode, SheetData, GlobalMode } from '../types';
import { 
    ANALYSIS_MODE_CONFIGS, 
    HISTORICAL_ANALYSIS_MODE_CONFIGS 
} from '../constants/analysisConfigs';

interface SegmentsSectionProps {
    globalMode: GlobalMode;
    analysisMode: AnalysisMode;
    sheet: string;
    setSheet: (sheet: string) => void;
    data: SheetData;
    selectedSegments: string[];
    availableSegments: string[];
    handleAddSegment: (segment: string) => void;
    handleRemoveSegment: (segment: string) => void;
    handleClearAllSegments: () => void;
    segmentColorIndices: Record<string, number>;
    activePalette: any[];
    sensors: SensorDescriptor<SensorOptions>[];
    handleDragEnd: (event: DragEndEvent) => void;
}

export const SegmentsSection: React.FC<SegmentsSectionProps> = ({
    globalMode,
    analysisMode,
    sheet,
    setSheet,
    data,
    selectedSegments,
    availableSegments,
    handleAddSegment,
    handleRemoveSegment,
    handleClearAllSegments,
    segmentColorIndices,
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
    const segmentsConfig = config.axes.segments;
    const itemsConfig = config.axes.items;

    // 過去比較モード時は強制的にSA（単一選択）
    const allowMultiple = globalMode === 'historical' ? false : segmentsConfig.allowMultiple;
    const badge = allowMultiple ? 'MA' : 'SA';

    // Check if brand image mode (auto-select mode)
    const isBrandImageMode = itemsConfig.autoSelect === true;

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1">
                    <FileSpreadsheet className="w-3 h-3" /> セグメント
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full font-bold">
                    {badge}
                </span>
            </label>
            {!allowMultiple ? (
                <div className="relative">
                    <select
                        value={sheet}
                        onChange={(e) => setSheet(e.target.value)}
                        className="w-full p-2.5 pr-8 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm appearance-none cursor-pointer"
                    >
                        {availableSegments.map(s => (
                            <option key={s} value={s}>{s.replace(/[（(]BFDシート[_＿]?[値]?[）)]?.*?St\d+/g, '').trim()}</option>
                        ))}
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
                                    handleAddSegment(e.target.value);
                                    e.target.value = '';
                                }}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm appearance-none cursor-pointer"
                            >
                                <option value="">セグメントを追加...</option>
                                {availableSegments
                                    .filter(s => !selectedSegments.includes(s))
                                    .map(seg => (
                                        <option key={seg} value={seg}>{seg.replace(/[（(]BFDシート[_＿]?[値]?[）)]?.*?St\d+/g, '').trim()}</option>
                                    ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                        {selectedSegments.length > 0 && (
                            <button
                                onClick={handleClearAllSegments}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                                title="全てクリア"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="space-y-2 min-h-[60px] mt-2">
                        {isBrandImageMode && selectedSegments.length > 0 && (
                            <div className="flex items-start gap-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg mb-2">
                                <span className="text-amber-600 font-bold text-sm mt-0.5">⚠</span>
                                <p className="text-xs text-amber-800">
                                    先頭のセグメントが基準となります
                                </p>
                            </div>
                        )}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={selectedSegments}
                                strategy={verticalListSortingStrategy}
                            >
                                {selectedSegments.map((seg, index) => {
                                    const colorIndex = segmentColorIndices[seg] ?? index;
                                    const color = activePalette[colorIndex % activePalette.length].hex;
                                    return (
                                        <SortableBrandItem
                                            key={seg}
                                            id={seg}
                                            color={color}
                                            name={seg.replace(/[（(]BFDシート[_＿]?[値]?[）)]?.*?St\d+/g, '').trim()}
                                            onRemove={handleRemoveSegment}
                                        />
                                    );
                                })}
                            </SortableContext>
                        </DndContext>
                        {selectedSegments.length === 0 && (
                            <div className="text-center py-4 text-gray-400 text-xs bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                セグメントが選択されていません
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
