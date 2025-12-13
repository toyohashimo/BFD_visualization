/**
 * 軸ヘルパーユーティリティ
 * 
 * 分析モード設定に基づいて、フィルター値、系列値、X軸値を取得するヘルパー関数群
 */

import {
    AxisType,
    AnalysisMode,
    FUNNEL_LABELS,
    TIMELINE_LABELS,
    BRAND_POWER_LABELS,
    FUTURE_POWER_LABELS,
    ARCHETYPE_LABELS,
} from '../types';

type AnalysisModeConfig = {
    axes?: {
        [key in AxisType]?: {
            role: 'FILTER' | 'SERIES' | 'X_AXIS';
            allowMultiple?: boolean;
        };
    };
};

/**
 * フィルター値を取得
 */
export const getFilterValue = (
    analysisMode: AnalysisMode | null,
    config: AnalysisModeConfig | undefined,
    currentSheet: string,
    targetBrand: string,
    selectedItem: string
): string => {
    if (!analysisMode || !config || !config.axes) return '';

    for (const axisType of ['segments', 'brands', 'items'] as AxisType[]) {
        const axisConfig = config.axes[axisType];
        if (axisConfig?.role === 'FILTER') {
            switch (axisType) {
                case 'segments': return currentSheet;
                case 'brands': return targetBrand;
                case 'items': return selectedItem;
            }
        }
    }

    return '';
};

/**
 * 系列値を取得
 */
export const getSeriesValues = (
    analysisMode: AnalysisMode | null,
    config: AnalysisModeConfig | undefined,
    selectedBrands: string[],
    selectedSegments: string[]
): string[] => {
    if (!analysisMode || !config || !config.axes) return [];

    for (const axisType of ['brands', 'segments', 'items'] as AxisType[]) {
        const axisConfig = config.axes[axisType];
        if (axisConfig?.role === 'SERIES') {
            switch (axisType) {
                case 'brands': return selectedBrands;
                case 'segments': return selectedSegments;
                case 'items': return [];
            }
        }
    }

    return [];
};

/**
 * X軸値を取得
 */
export const getXAxisValues = (
    analysisMode: AnalysisMode | null,
    config: AnalysisModeConfig | undefined,
    selectedBrands: string[],
    selectedSegments: string[]
): string[] => {
    if (!analysisMode || !config || !config.axes) return [];

    for (const axisType of ['brands', 'segments', 'items'] as AxisType[]) {
        const axisConfig = config.axes[axisType];
        if (axisConfig?.role === 'X_AXIS') {
            switch (axisType) {
                case 'brands': return selectedBrands;
                case 'segments': return selectedSegments;
                case 'items': return [];
            }
        }
    }

    return [];
};

/**
 * ラベル取得関数オブジェクトを生成
 */
export const createLabelGetters = (
    getBrandName: (name: string) => string
): Record<AxisType, (key: string) => string> => {
    return {
        items: (key: string) => {
            if (key in FUNNEL_LABELS) return FUNNEL_LABELS[key as keyof typeof FUNNEL_LABELS];
            if (key in TIMELINE_LABELS) return TIMELINE_LABELS[key as keyof typeof TIMELINE_LABELS];
            if (key in BRAND_POWER_LABELS) return BRAND_POWER_LABELS[key as keyof typeof BRAND_POWER_LABELS];
            if (key in FUTURE_POWER_LABELS) return FUTURE_POWER_LABELS[key as keyof typeof FUTURE_POWER_LABELS];
            if (key in ARCHETYPE_LABELS) return ARCHETYPE_LABELS[key as keyof typeof ARCHETYPE_LABELS];
            return key;
        },
        segments: (key: string) => key.replace(/[（(]BFDシート[_＿]?[値]?[）)]?.*?St\d+/g, '').trim(),
        brands: (key: string) => getBrandName(key)
    };
};
