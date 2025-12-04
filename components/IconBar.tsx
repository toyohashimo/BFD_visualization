import React from 'react';
import {
    BarChart2,
    BarChart3,
    LineChart,
    Radar,
    Camera,
    Image as ImageIcon,
    ChevronRight,
    ChevronLeft,
    Settings
} from 'lucide-react';
import { ChartType } from '../types';

interface IconBarProps {
    chartType: ChartType;
    setChartType: (type: ChartType) => void;
    handleCopyImage: (target: 'chart' | 'combined') => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    onOpenSettings: () => void;
    onSetDebugApiKey?: (apiKey: string) => void; // デバッグモード用（非推奨、後方互換性のため残す）
    onToggleDebugMode?: () => void; // デバッグモードトグル
    isDebugMode?: boolean; // デバッグモード有効判定
}

export const IconBar: React.FC<IconBarProps> = ({
    chartType,
    setChartType,
    handleCopyImage,
    sidebarCollapsed,
    setSidebarCollapsed,
    onOpenSettings,
    onSetDebugApiKey,
    onToggleDebugMode,
    isDebugMode = false, // デフォルトはfalse
}) => {
    const chartTypes: Array<{ type: ChartType; icon: React.ReactNode; label: string }> = [
        { type: 'bar', icon: <BarChart2 className="w-5 h-5" />, label: '集合縦棒' },
        { type: 'horizontalBar', icon: <BarChart3 className="w-5 h-5" />, label: '横棒' },
        { type: 'line', icon: <LineChart className="w-5 h-5" />, label: '折れ線' },
        { type: 'radar', icon: <Radar className="w-5 h-5" />, label: 'レーダー' }
    ];

    const screenshotButtons: Array<{ target: 'chart' | 'combined'; icon: React.ReactNode; label: string }> = [
        { target: 'chart', icon: <Camera className="w-5 h-5" />, label: 'グラフ' },
        { target: 'combined', icon: <ImageIcon className="w-5 h-5" />, label: 'グラフ＋データ' }
    ];

    // デバッグモード: Shift+ダブルクリックでデバッグモードをトグル（開発環境のみ）
    const handleDebugClick = (e: React.MouseEvent) => {
        if (!e.shiftKey) return;

        // 開発環境でのみデバッグモード有効
        if (!import.meta.env.DEV) {
            console.warn('[Debug Mode] Only available in development');
            return;
        }

        // デバッグモードをトグル
        if (onToggleDebugMode) {
            onToggleDebugMode();
            console.log('[Debug Mode] Toggled:', !isDebugMode ? 'ON' : 'OFF');
        } else {
            console.warn('[Debug Mode] onToggleDebugMode callback not provided');
        }
    };

    return (
        <div className="flex-shrink-0 w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-2">
            {/* Toggle Sidebar Button - Always shown */}
            <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-3 rounded-lg hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 transition-all group mb-2"
                title={sidebarCollapsed ? "サイドバーを開く" : "サイドバーを閉じる"}
            >
                {sidebarCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                ) : (
                    <ChevronLeft className="w-5 h-5" />
                )}
            </button>

            <div className="w-full border-t border-gray-300 mb-2" />

            {/* Chart Type Icons */}
            <div className="flex flex-col gap-2 mb-4">
                {chartTypes.map(({ type, icon, label }) => (
                    <button
                        key={type}
                        onClick={() => setChartType(type)}
                        className={`p-3 rounded-lg transition-all group relative ${chartType === type
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                            }`}
                        title={label}
                    >
                        {icon}
                        {/* Tooltip */}
                        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            {label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="w-full border-t border-gray-300 mb-2" />

            {/* Screenshot Icons */}
            <div className="flex flex-col gap-2 mb-4">
                {screenshotButtons.map(({ target, icon, label }) => (
                    <button
                        key={target}
                        onClick={() => handleCopyImage(target)}
                        className="p-3 rounded-lg hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 transition-all group relative"
                        title={label}
                    >
                        {icon}
                        {/* Tooltip */}
                        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            {label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="w-full border-t border-gray-300 mb-2 mt-auto" />

            {/* Settings Button - Bottom */}
            <button
                onClick={onOpenSettings}
                className={`p-3 rounded-lg transition-all group relative ${isDebugMode
                    ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                title={isDebugMode ? "設定（デバッグモード有効）" : "設定"}
            >
                <Settings className={`w-5 h-5 transition-transform ${isDebugMode ? 'rotate-180' : ''}`} />
                {/* Tooltip */}
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {isDebugMode ? "設定（デバッグモード有効）" : "設定"}
                </span>
            </button>

            {/* デバッグモード隠しエリア（Shift+ダブルクリック、開発環境のみ） */}
            <div
                onDoubleClick={handleDebugClick}
                className="w-full h-8 cursor-default"
                title={import.meta.env.DEV ? "Shift+ダブルクリックでデバッグモード" : ""}
            />
        </div>
    );
};
