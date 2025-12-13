import React, { useState, useRef, useCallback } from 'react';
import {
    BarChart2,
    Activity,
    Layout,
    Upload,
    FileSpreadsheet,
    Trash2,
    Eye,
    EyeOff,
    Palette,
    ChevronDown,
    ChevronUp,
    Camera,
    Download
} from 'lucide-react';
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
import { AnalysisItemsSection } from './AnalysisItemsSection';
import { SegmentsSection } from './SegmentsSection';
import { BrandsSection } from './BrandsSection';
import { GlobalModeTab } from './GlobalModeTab';
import { DataSourceManager } from './DataSourceManager';
import { SheetData, AnalysisMode, ChartType, FunnelMetrics, TimelineMetrics, GlobalMode, DataSource } from '../src/types';
import { METRIC_LABELS } from '../types';
import { COLOR_THEMES } from '../constants';
import {
    ANALYSIS_MODE_CONFIGS,
    ANALYSIS_MODE_ORDER,
    HISTORICAL_ANALYSIS_MODE_CONFIGS,
    HISTORICAL_ANALYSIS_MODE_ORDER
} from '../constants/analysisConfigs';

interface SidebarProps {
    // グローバルモード（過去比較機能用）
    globalMode: GlobalMode;
    setGlobalMode: (mode: GlobalMode) => void;
    hasData: boolean;
    dataSources: DataSource[];
    onAddDataSource: (file: File) => Promise<void>;
    onRemoveDataSource: (id: string) => void;
    onUpdateDataSourceName: (id: string, name: string) => void;
    onToggleDataSourceActive: (id: string) => void;
    onResetAllDataSources?: () => void;

    // 既存のprops
    isExcelData: boolean;
    currentFileName: string; // 詳細分析モード用のファイル名
    isAnonymized: boolean;
    toggleAnonymization: () => void;
    isUploading: boolean;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileDrop: (file: File) => void;
    onClearData: () => void; // データリセット用
    analysisMode: AnalysisMode;
    setAnalysisMode: (mode: AnalysisMode) => void;
    currentSheet: string;
    setSelectedSegments: (segments: string[]) => void;
    data: SheetData;
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
    selectedItem: keyof FunnelMetrics | keyof TimelineMetrics;
    setSelectedItem: (item: keyof FunnelMetrics | keyof TimelineMetrics) => void;
    chartType: ChartType;
    setChartType: (type: ChartType) => void;
    showDataLabels: boolean;
    setShowDataLabels: (show: boolean) => void;
    useAutoScale: boolean;
    setUseAutoScale: (use: boolean) => void;
    yAxisMax: number | '';
    setYAxisMax: (max: number | '') => void;
    currentTheme: string;
    setCurrentTheme: (theme: string) => void;
    activePalette: any[];
    handleClearAll: () => void;
    handleAddBrand: (brand: string) => void;
    availableBrands: string[];
    selectedBrands: string[];
    handleAddSegment: (segment: string) => void;
    availableSegments: string[];
    selectedSegments: string[];
    sensors: SensorDescriptor<SensorOptions>[];
    handleDragEnd: (event: DragEndEvent) => void;
    brandColorIndices: Record<string, number>;
    segmentColorIndices: Record<string, number>;
    handleRemoveBrand: (brand: string) => void;
    handleRemoveSegment: (segment: string) => void;
    handleClearAllBrands: () => void;
    handleClearAllSegments: () => void;
    handleCopyImage: (target: 'chart' | 'combined') => void;
    handleExportCSV: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    // グローバルモード
    globalMode,
    setGlobalMode,
    hasData,
    dataSources,
    onAddDataSource,
    onRemoveDataSource,
    onUpdateDataSourceName,
    onToggleDataSourceActive,
    onResetAllDataSources,

    // 既存のprops
    isExcelData,
    currentFileName,
    isAnonymized,
    toggleAnonymization,
    isUploading,
    brandImageData,
    onFileSelect,
    onFileDrop,
    onClearData,
    analysisMode,
    setAnalysisMode,
    currentSheet,
    setSelectedSegments,
    data,
    targetBrand,
    setTargetBrand,
    allUniqueBrands,
    getBrandName,
    brandAvailability,
    selectedItem,
    setSelectedItem,
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
    handleClearAll,
    handleAddBrand,
    availableBrands,
    selectedBrands,
    handleAddSegment,
    availableSegments,
    selectedSegments,
    sensors,
    handleDragEnd,
    brandColorIndices,
    segmentColorIndices,
    handleRemoveBrand,
    handleRemoveSegment,
    handleClearAllBrands,
    handleClearAllSegments,
    handleCopyImage,
    handleExportCSV
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [isThemeAccordionOpen, setIsThemeAccordionOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileDrop(e.dataTransfer.files[0]);
        }
    }, [onFileDrop]);

    const onTriggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    /**
     * グローバルモードに応じて使用する分析モード設定を取得
     */
    const currentModeConfigs = globalMode === 'historical'
        ? HISTORICAL_ANALYSIS_MODE_CONFIGS
        : ANALYSIS_MODE_CONFIGS;

    const currentModeOrder = globalMode === 'historical'
        ? HISTORICAL_ANALYSIS_MODE_ORDER
        : ANALYSIS_MODE_ORDER;

    // Hidden command: Shift+double-click on title to load sample_202506.xlsx
    // 過去比較モード時はShift+double-clickで3つのサンプルファイルを自動読み込み
    const handleTitleDoubleClick = async (e: React.MouseEvent) => {
        if (e.shiftKey) {
            e.stopPropagation(); // Prevent the anonymization toggle

            // 過去比較モード時は3つのサンプルファイルを読み込み
            if (globalMode === 'historical') {
                try {
                    const sampleFiles = [
                        'sample_202304.xlsx',
                        'sample_202406.xlsx',
                        'sample_202506.xlsx'
                    ];

                    // 注意: 既存のデータソースをクリアせず、追加読み込み

                    let successCount = 0;
                    let failedFiles: string[] = [];

                    // 3つのファイルを順次読み込み
                    let firstResult: any = null;
                    for (const fileName of sampleFiles) {
                        try {
                            console.log(`読み込み中: ${fileName}`);
                            const response = await fetch(`/${fileName}`);

                            if (!response.ok) {
                                console.warn(`${fileName}が見つかりませんでした (Status: ${response.status})`);
                                failedFiles.push(fileName);
                                continue;
                            }

                            const blob = await response.blob();
                            console.log(`${fileName} のサイズ: ${blob.size} bytes`);

                            const file = new File([blob], fileName, {
                                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            });

                            const result = await onAddDataSource(file);
                            if (result && !firstResult) {
                                firstResult = result;
                            }
                            successCount++;
                            console.log(`✓ ${fileName} を読み込みました`);
                        } catch (fileError) {
                            console.error(`${fileName} の読み込みエラー:`, fileError);
                            failedFiles.push(fileName);
                        }
                    }

                    // 結果を表示
                    if (successCount > 0) {
                        console.log(`✓ ${successCount}個のサンプルファイルを追加しました`);
                        if (failedFiles.length > 0) {
                            console.warn(`⚠ 読み込み失敗: ${failedFiles.join(', ')}`);
                        }
                    } else {
                        alert('サンプルファイルの読み込みに失敗しました。\\nファイルが存在するか確認してください。');
                    }
                } catch (error) {
                    console.error('サンプルファイルの読み込みに失敗:', error);
                    alert('サンプルファイルの読み込みに失敗しました');
                }
            } else if (globalMode === 'detailed') {
                // 詳細分析モード時は1つのサンプルファイルを読み込み
                try {
                    const response = await fetch('/sample_202506.xlsx');
                    if (!response.ok) {
                        alert('sample_202506.xlsxが見つかりませんでした');
                        return;
                    }
                    const blob = await response.blob();
                    const file = new File([blob], 'sample_202506.xlsx', {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
                    await onFileDrop(file);
                    console.log('Sample data loaded via hidden command');
                } catch (error) {
                    console.error('Failed to load sample_202506.xlsx:', error);
                    alert('sample_202506.xlsxの読み込みに失敗しました');
                }
            }
        }
    };

    const handleTitleClick = () => {
        toggleAnonymization();
    };

    return (
        <div className="flex flex-col h-full">
            <div
                className="p-5 border-b border-indigo-100 bg-indigo-50 cursor-default select-none"
                onClick={handleTitleClick}
                onDoubleClick={handleTitleDoubleClick}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart2 className="w-6 h-6 text-indigo-600" />
                        <h1 className="text-xl font-bold text-indigo-900">BFD Analytics</h1>
                    </div>
                    <div className={`text-indigo-400 transition-opacity ${isExcelData ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 hidden'}`}>
                        {isAnonymized ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-xs text-indigo-600 font-medium">Advanced Analytics Tool</p>
                    <div className="flex gap-1">
                        {isExcelData && <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">EXCEL</span>}
                        {isAnonymized && <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full font-bold">DEMO</span>}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {/* グローバルモード切り替えタブ */}
                <GlobalModeTab
                    globalMode={globalMode}
                    setGlobalMode={setGlobalMode}
                />

                {/* データソース管理（過去比較モード時のみ表示） */}
                {globalMode === 'historical' && (
                    <DataSourceManager
                        dataSources={dataSources}
                        onAdd={onAddDataSource}
                        onRemove={onRemoveDataSource}
                        onUpdateName={onUpdateDataSourceName}
                        onToggleActive={onToggleDataSourceActive}
                        onResetAll={onResetAllDataSources}
                        isLoading={isUploading}
                        analysisMode={analysisMode}
                    />
                )}

                {/* 詳細分析モード時のファイルアップロード/データソース表示 */}
                {globalMode === 'detailed' && (
                    !isExcelData || !currentFileName ? (
                        // ファイル未読み込み時: アップロードゾーン
                        <div
                            className={`border-2 border-dashed rounded-xl p-2 text-center cursor-pointer transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={onTriggerFileUpload}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".xlsx,.xls,.csv"
                                onChange={onFileSelect}
                            />
                            <div className="flex items-center justify-center gap-3 text-gray-500 py-1">
                                <div className="bg-white p-1.5 rounded-full shadow-sm flex-shrink-0">
                                    {isUploading ? <Activity className="w-4 h-4 animate-spin text-indigo-600" /> : <Upload className="w-4 h-4 text-indigo-600" />}
                                </div>
                                <div className="text-xs flex flex-col items-start">
                                    <span className="font-medium text-gray-700">Excelファイルをドロップ</span>
                                    <span className="text-[10px] text-gray-400">3行目ヘッダー形式</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // ファイル読み込み後: データソース表示
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <FileSpreadsheet className="w-3 h-3" /> データソース
                            </label>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {/* ファイルアイコン */}
                                <div className="flex-shrink-0 p-1.5 bg-white rounded-lg shadow-sm">
                                    <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                                </div>

                                {/* ファイル名 */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-800 truncate" title={currentFileName}>
                                        {currentFileName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        読み込み済み
                                    </div>
                                </div>

                                {/* 削除ボタン */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`「${currentFileName}」を削除しますか？\n\n全てのデータがクリアされます。`)) {
                                            onClearData();
                                        }
                                    }}
                                    className="flex-shrink-0 p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded transition-colors"
                                    title="データをクリア"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <Activity className="w-3 h-3" /> 分析モード
                    </label>
                    <div className="relative">
                        <select
                            value={analysisMode}
                            onChange={(e) => {
                                const newMode = e.target.value as AnalysisMode;
                                setAnalysisMode(newMode);
                                const config = currentModeConfigs[newMode];
                                if (config?.defaultChartType) {
                                    setChartType(config.defaultChartType);
                                }
                            }}
                            disabled={
                                globalMode === 'detailed'
                                    ? !isExcelData
                                    : dataSources.length === 0
                            }
                            className={`w-full p-2.5 pr-8 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm appearance-none ${(globalMode === 'detailed' && !isExcelData) || (globalMode === 'historical' && dataSources.length === 0)
                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white border-gray-200 cursor-pointer'
                                }`}
                        >
                            {currentModeOrder.map((modeId, index) => (
                                <option
                                    key={modeId}
                                    value={modeId}
                                >
                                    {index + 1}. {currentModeConfigs[modeId].name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 my-4" />


                <AnalysisItemsSection
                    globalMode={globalMode}
                    analysisMode={analysisMode}
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                    isExcelData={isExcelData}
                    dataSources={dataSources}
                    selectedSegment={currentSheet}
                    selectedBrand={selectedBrands && selectedBrands[0]}
                    data={data}
                    brandImageData={brandImageData}
                />



                <div className="border-t border-gray-200 my-4" />

                <SegmentsSection
                    globalMode={globalMode}
                    analysisMode={analysisMode}
                    currentSheet={currentSheet}
                    setSelectedSegments={setSelectedSegments}
                    data={data}
                    selectedSegments={selectedSegments}
                    availableSegments={availableSegments}
                    handleAddSegment={handleAddSegment}
                    handleRemoveSegment={handleRemoveSegment}
                    handleClearAllSegments={handleClearAllSegments}
                    segmentColorIndices={segmentColorIndices}
                    activePalette={activePalette}
                    sensors={sensors}
                    handleDragEnd={handleDragEnd}
                    isAnonymized={isAnonymized}
                />

                <div className="border-t border-gray-200 my-4" />

                <BrandsSection
                    globalMode={globalMode}
                    analysisMode={analysisMode}
                    targetBrand={targetBrand}
                    setTargetBrand={setTargetBrand}
                    allUniqueBrands={allUniqueBrands}
                    getBrandName={getBrandName}
                    brandAvailability={brandAvailability}
                    selectedBrands={selectedBrands}
                    availableBrands={availableBrands}
                    handleAddBrand={handleAddBrand}
                    handleRemoveBrand={handleRemoveBrand}
                    handleClearAllBrands={handleClearAllBrands}
                    brandColorIndices={brandColorIndices}
                    activePalette={activePalette}
                    sensors={sensors}
                    handleDragEnd={handleDragEnd}
                />

                <div className="border-t border-gray-200 my-4" />

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <Layout className="w-3 h-3" /> グラフタイプ
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setChartType('bar')}
                            className={`p-2 text-xs font-medium rounded-lg border transition-all ${chartType === 'bar' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                        >
                            集合縦棒
                        </button>
                        <button
                            onClick={() => setChartType('horizontalBar')}
                            className={`p-2 text-xs font-medium rounded-lg border transition-all ${chartType === 'horizontalBar' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                        >
                            横棒
                        </button>
                        <button
                            onClick={() => setChartType('line')}
                            className={`p-2 text-xs font-medium rounded-lg border transition-all ${chartType === 'line' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                        >
                            折れ線
                        </button>
                        <button
                            onClick={() => setChartType('radar')}
                            className={`p-2 text-xs font-medium rounded-lg border transition-all ${chartType === 'radar' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                        >
                            レーダー
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer select-none flex items-center gap-1">
                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${showDataLabels ? 'bg-indigo-600' : 'bg-gray-300'}`} onClick={() => setShowDataLabels(!showDataLabels)}>
                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${showDataLabels ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span>データラベルを表示</span>
                    </label>
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer select-none flex items-center gap-1">
                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${useAutoScale ? 'bg-indigo-600' : 'bg-gray-300'}`} onClick={() => setUseAutoScale(!useAutoScale)}>
                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${useAutoScale ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span>Y軸オートスケール</span>
                    </label>
                    <div className="flex items-center gap-1">
                        <span className={`text-xs ${useAutoScale ? 'text-gray-300' : 'text-gray-500'}`}>最大値:</span>
                        <input
                            type="number"
                            value={yAxisMax}
                            onChange={(e) => setYAxisMax(e.target.value === '' ? '' : Number(e.target.value))}
                            disabled={useAutoScale}
                            className={`w-16 p-1 text-xs border rounded text-right outline-none transition-colors ${useAutoScale
                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white border-gray-300 focus:ring-1 focus:ring-indigo-500'
                                }`}
                            placeholder={useAutoScale ? "-" : "Auto"}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <Palette className="w-3 h-3" /> カラーテーマ
                    </label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setIsThemeAccordionOpen(!isThemeAccordionOpen)}
                            className="w-full p-2 bg-white flex items-center justify-between text-sm hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                    {activePalette.slice(0, 3).map((c: any, i: number) => (
                                        <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c.hex }} />
                                    ))}
                                </div>
                                <span className="text-gray-700">{COLOR_THEMES[currentTheme].name}</span>
                            </div>
                            {isThemeAccordionOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>
                        {isThemeAccordionOpen && (
                            <div className="bg-gray-50 p-2 space-y-1 border-t border-gray-100">
                                {Object.values(COLOR_THEMES).map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => {
                                            setCurrentTheme(theme.id);
                                            setIsThemeAccordionOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-2 p-2 rounded text-xs transition-colors ${currentTheme === theme.id ? 'bg-white shadow-sm text-indigo-700 font-medium' : 'hover:bg-white hover:shadow-sm text-gray-600'}`}
                                    >
                                        <div className="flex gap-0.5">
                                            {theme.palette.slice(0, 3).map((c, i) => (
                                                <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c.hex }} />
                                            ))}
                                        </div>
                                        {theme.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-200 my-4" />

                <div className="flex gap-2">
                    <button onClick={() => handleCopyImage('chart')} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2">
                        <Camera className="w-4 h-4" /> グラフ
                    </button>
                    <button onClick={() => handleCopyImage('combined')} className="flex-1 py-2.5 bg-[#008d9d] hover:bg-[#007a8a] text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2">
                        <Camera className="w-4 h-4" /> グラフ＋データ
                    </button>
                </div>

                <button
                    onClick={handleExportCSV}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-2"
                >
                    <Download className="w-4 h-4" /> CSV出力
                </button>
            </div>
        </div>
    );
};
