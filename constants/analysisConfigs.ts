import { AnalysisModeConfig } from '../types';

/**
 * Analysis Mode Configurations
 * 設定駆動型アプローチによる分析モード定義
 */
export const ANALYSIS_MODE_CONFIGS: Record<string, AnalysisModeConfig> = {
    'funnel_segment_brands': {
        id: 'funnel_segment_brands',
        name: 'ファネル分析①（セグメント: X=ファネル①×ブランド）',
        description: '単一セグメントにおける複数ブランドのファネル指標を比較',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'funnel',
                fixedItems: ['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL']
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false
            },
            brands: {
                role: 'SERIES',
                label: 'ブランド',
                allowMultiple: true
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'brands',
            filter: 'segments'
        },
        defaultChartType: 'bar'
    },

    'funnel_brand_segments': {
        id: 'funnel_brand_segments',
        name: 'ファネル分析①（ブランド: X=ファネル①×セグメント）',
        description: '単一ブランドにおける複数セグメントのファネル指標を比較',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'funnel',
                fixedItems: ['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL']
            },
            segments: {
                role: 'SERIES',
                label: 'セグメント',
                allowMultiple: true
            },
            brands: {
                role: 'FILTER',
                label: 'ブランド',
                allowMultiple: false
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'segments',
            filter: 'brands'
        },
        defaultChartType: 'bar'
    },

    'funnel_item_segments_brands': {
        id: 'funnel_item_segments_brands',
        name: 'ファネル分析①（ファネル①: X=ブランド×セグメント）',
        description: '単一分析項目における複数ブランド・セグメントの比較',
        axes: {
            items: {
                role: 'FILTER',
                label: '項目',
                allowMultiple: false,
                itemSet: 'funnel'
            },
            segments: {
                role: 'SERIES',
                label: 'セグメント',
                allowMultiple: true
            },
            brands: {
                role: 'X_AXIS',
                label: 'ブランド',
                allowMultiple: true
            }
        },
        dataTransform: {
            xAxis: 'brands',
            series: 'segments',
            filter: 'items'
        },
        defaultChartType: 'bar'
    },

    'timeline_segment_brands': {
        id: 'timeline_segment_brands',
        name: 'ファネル分析②（セグメント: X=ファネル②×ブランド）',
        description: '単一セグメントにおける複数ブランドの時系列指標を比較',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'timeline',
                fixedItems: ['T1', 'T2', 'T3', 'T4', 'T5']
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false
            },
            brands: {
                role: 'SERIES',
                label: 'ブランド',
                allowMultiple: true
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'brands',
            filter: 'segments'
        },
        defaultChartType: 'bar'
    },

    'timeline_brand_segments': {
        id: 'timeline_brand_segments',
        name: 'ファネル分析②（ブランド: X=ファネル②×セグメント）',
        description: '単一ブランドにおける複数セグメントの時系列指標を比較',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'timeline',
                fixedItems: ['T1', 'T2', 'T3', 'T4', 'T5']
            },
            segments: {
                role: 'SERIES',
                label: 'セグメント',
                allowMultiple: true
            },
            brands: {
                role: 'FILTER',
                label: 'ブランド',
                allowMultiple: false
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'segments',
            filter: 'brands'
        },
        defaultChartType: 'bar'
    },

    'timeline_item_segments_brands': {
        id: 'timeline_item_segments_brands',
        name: 'ファネル分析②（ファネル②: X=ブランド×セグメント）',
        description: '単一分析項目における複数ブランド・セグメントの比較（時系列）',
        axes: {
            items: {
                role: 'FILTER',
                label: '項目',
                allowMultiple: false,
                itemSet: 'timeline'
            },
            segments: {
                role: 'SERIES',
                label: 'セグメント',
                allowMultiple: true
            },
            brands: {
                role: 'X_AXIS',
                label: 'ブランド',
                allowMultiple: true
            }
        },
        dataTransform: {
            xAxis: 'brands',
            series: 'segments',
            filter: 'items'
        },
        defaultChartType: 'bar'
    },

    'brand_image_segment_brands': {
        id: 'brand_image_segment_brands',
        name: 'ブランドイメージ分析（セグメント: X=ブランドイメージ×ブランド）',
        description: '単一セグメントにおける複数ブランドのブランドイメージ指標を比較',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'brandImage',
                fixedItems: [],  // 動的に決定されるため空
                autoSelect: true,
                autoSelectCount: 30
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false
            },
            brands: {
                role: 'SERIES',
                label: 'ブランド',
                allowMultiple: true
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'brands',
            filter: 'segments'
        },
        defaultChartType: 'bar'
    },

    'brand_image_brand_segments': {
        id: 'brand_image_brand_segments',
        name: 'ブランドイメージ分析（ブランド: X=ブランドイメージ×セグメント）',
        description: '単一ブランドにおける複数セグメントのブランドイメージ指標を比較',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'brandImage',
                fixedItems: [],  // 動的に決定されるため空
                autoSelect: true,
                autoSelectCount: 30
            },
            segments: {
                role: 'SERIES',
                label: 'セグメント',
                allowMultiple: true
            },
            brands: {
                role: 'FILTER',
                label: 'ブランド',
                allowMultiple: false
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'segments',
            filter: 'brands'
        },
        defaultChartType: 'bar'
    },

    'brand_power_segment_brands': {
        id: 'brand_power_segment_brands',
        name: 'ブランドパワー分析①（セグメント: X=現在パワー×ブランド）',
        description: '単一セグメントにおける複数ブランドのブランドパワー指標を比較',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'brandPower',
                fixedItems: ['BP1', 'BP2', 'BP3', 'BP4']
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false
            },
            brands: {
                role: 'SERIES',
                label: 'ブランド',
                allowMultiple: true
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'brands',
            filter: 'segments'
        },
        defaultChartType: 'radar'
    },

    'brand_power_brand_segments': {
        id: 'brand_power_brand_segments',
        name: 'ブランドパワー分析①（ブランド: X=現在パワー×セグメント）',
        description: '単一ブランドにおける複数セグメントのブランドパワー指標を比較',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'brandPower',
                fixedItems: ['BP1', 'BP2', 'BP3', 'BP4']
            },
            segments: {
                role: 'SERIES',
                label: 'セグメント',
                allowMultiple: true
            },
            brands: {
                role: 'FILTER',
                label: 'ブランド',
                allowMultiple: false
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'segments',
            filter: 'brands'
        },
        defaultChartType: 'radar'
    },

    'future_power_segment_brands': {
        id: 'future_power_segment_brands',
        name: 'ブランドパワー分析②（セグメント: X=将来性パワー×ブランド）',
        description: '単一セグメントにおける複数ブランドの将来性パワー指標を比較',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'futurePower',
                fixedItems: ['FP1', 'FP2', 'FP3', 'FP4', 'FP5', 'FP6']
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false
            },
            brands: {
                role: 'SERIES',
                label: 'ブランド',
                allowMultiple: true
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'brands',
            filter: 'segments'
        },
        defaultChartType: 'radar'
    },

    'future_power_brand_segments': {
        id: 'future_power_brand_segments',
        name: 'ブランドパワー分析②（ブランド: X=将来性パワー×セグメント）',
        description: '単一ブランドにおける複数セグメントの将来性パワー指標を比較',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'futurePower',
                fixedItems: ['FP1', 'FP2', 'FP3', 'FP4', 'FP5', 'FP6']
            },
            segments: {
                role: 'SERIES',
                label: 'セグメント',
                allowMultiple: true
            },
            brands: {
                role: 'FILTER',
                label: 'ブランド',
                allowMultiple: false
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'segments',
            filter: 'brands'
        },
        defaultChartType: 'radar'
    },

    'archetype_segment_brands': {
        id: 'archetype_segment_brands',
        name: 'アーキタイプ分析（セグメント: X=アーキタイプ×ブランド）',
        description: '単一セグメントにおける複数ブランドのアーキタイプ指標を比較',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'archetype',
                fixedItems: [
                    'creator', 'ruler', 'sage', 'explorer',
                    'innocent', 'outlaw', 'magician', 'hero',
                    'lover', 'jester', 'regular', 'caregiver'
                ]
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false
            },
            brands: {
                role: 'SERIES',
                label: 'ブランド',
                allowMultiple: true
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'brands',
            filter: 'segments'
        },
        defaultChartType: 'radar'
    },

    'archetype_brand_segments': {
        id: 'archetype_brand_segments',
        name: 'アーキタイプ分析（ブランド: X=アーキタイプ×セグメント）',
        description: '単一ブランドにおける複数セグメントのアーキタイプ指標を比較',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'archetype',
                fixedItems: [
                    'creator', 'ruler', 'sage', 'explorer',
                    'innocent', 'outlaw', 'magician', 'hero',
                    'lover', 'jester', 'regular', 'caregiver'
                ]
            },
            segments: {
                role: 'SERIES',
                label: 'セグメント',
                allowMultiple: true
            },
            brands: {
                role: 'FILTER',
                label: 'ブランド',
                allowMultiple: false
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'segments',
            filter: 'brands'
        },
        defaultChartType: 'radar'
    },

    'brand_image_item_segments_brands': {
        id: 'brand_image_item_segments_brands',
        name: 'ブランドイメージ分析（ブランドイメージ: X=ブランド×セグメント）',
        description: '単一ブランドイメージ項目における複数ブランド・セグメントの比較',
        axes: {
            items: {
                role: 'FILTER',
                label: '項目',
                allowMultiple: false,
                itemSet: 'brandImage',
                fixedItems: []  // ブランドイメージ項目は動的に取得（データソースの2行目が「ブランドイメージ」の項目）
            },
            segments: {
                role: 'SERIES',
                label: 'セグメント',
                allowMultiple: true
            },
            brands: {
                role: 'X_AXIS',
                label: 'ブランド',
                allowMultiple: true
            }
        },
        dataTransform: {
            xAxis: 'brands',
            series: 'segments',
            filter: 'items'
        },
        defaultChartType: 'bar'
    },

    'brand_power_item_segments_brands': {
        id: 'brand_power_item_segments_brands',
        name: 'ブランドパワー分析①（現在パワー: X=ブランド×セグメント）',
        description: '単一現在パワー項目における複数ブランド・セグメントの比較',
        axes: {
            items: {
                role: 'FILTER',
                label: '項目',
                allowMultiple: false,
                itemSet: 'brandPower',
                fixedItems: ['BP1', 'BP2', 'BP3', 'BP4']
            },
            segments: {
                role: 'SERIES',
                label: 'セグメント',
                allowMultiple: true
            },
            brands: {
                role: 'X_AXIS',
                label: 'ブランド',
                allowMultiple: true
            }
        },
        dataTransform: {
            xAxis: 'brands',
            series: 'segments',
            filter: 'items'
        },
        defaultChartType: 'bar'
    },

    'future_power_item_segments_brands': {
        id: 'future_power_item_segments_brands',
        name: 'ブランドパワー分析②（将来性パワー: X=ブランド×セグメント）',
        description: '単一将来性パワー項目における複数ブランド・セグメントの比較',
        axes: {
            items: {
                role: 'FILTER',
                label: '項目',
                allowMultiple: false,
                itemSet: 'futurePower',
                fixedItems: ['FP1', 'FP2', 'FP3', 'FP4', 'FP5', 'FP6']
            },
            segments: {
                role: 'SERIES',
                label: 'セグメント',
                allowMultiple: true
            },
            brands: {
                role: 'X_AXIS',
                label: 'ブランド',
                allowMultiple: true
            }
        },
        dataTransform: {
            xAxis: 'brands',
            series: 'segments',
            filter: 'items'
        },
        defaultChartType: 'bar'
    },

    'archetype_item_segments_brands': {
        id: 'archetype_item_segments_brands',
        name: 'アーキタイプ分析（アーキタイプ: X=ブランド×セグメント）',
        description: '単一アーキタイプ項目における複数ブランド・セグメントの比較',
        axes: {
            items: {
                role: 'FILTER',
                label: '項目',
                allowMultiple: false,
                itemSet: 'archetype',
                fixedItems: [
                    'creator', 'ruler', 'sage', 'explorer',
                    'innocent', 'outlaw', 'magician', 'hero',
                    'lover', 'jester', 'regular', 'caregiver'
                ]
            },
            segments: {
                role: 'SERIES',
                label: 'セグメント',
                allowMultiple: true
            },
            brands: {
                role: 'X_AXIS',
                label: 'ブランド',
                allowMultiple: true
            }
        },
        dataTransform: {
            xAxis: 'brands',
            series: 'segments',
            filter: 'items'
        },
        defaultChartType: 'radar'
    }
};

/**
 * Mode selection order for dropdown
 */
export const ANALYSIS_MODE_ORDER = [
    'funnel_segment_brands',
    'funnel_brand_segments',
    'funnel_item_segments_brands',
    'timeline_segment_brands',
    'timeline_brand_segments',
    'timeline_item_segments_brands',
    'brand_image_segment_brands',
    'brand_image_brand_segments',
    'brand_image_item_segments_brands',
    'brand_power_segment_brands',
    'brand_power_brand_segments',
    'brand_power_item_segments_brands',
    'future_power_segment_brands',
    'future_power_brand_segments',
    'future_power_item_segments_brands',
    'archetype_segment_brands',
    'archetype_brand_segments',
    'archetype_item_segments_brands'
];

/**
 * Historical Comparison Mode Configurations
 * 過去比較モード専用の分析モード定義
 */
export const HISTORICAL_ANALYSIS_MODE_CONFIGS: Record<string, AnalysisModeConfig> = {
    'historical_funnel1_segment_brand': {
        id: 'historical_funnel1_segment_brand',
        name: 'ファネル分析①（セグメント、ブランド: X=ファネル①×過去比較）',
        description: '単一セグメント・単一ブランドにおける過去データとの比較',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'funnel',
                fixedItems: ['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL']
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false  // 過去比較モードでは単一選択のみ
            },
            brands: {
                role: 'FILTER',
                label: 'ブランド',
                allowMultiple: false  // 過去比較モードでは単一選択のみ
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'dataSources',  // データソースが系列になる
            filter: 'segments'
        },
        defaultChartType: 'bar'
    },

    'historical_funnel2_segment_brand': {
        id: 'historical_funnel2_segment_brand',
        name: 'ファネル分析②（セグメント、ブランド: X=ファネル②×過去比較）',
        description: '単一セグメント・単一ブランドにおける過去データとの比較（タイムライン項目）',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'timeline',
                fixedItems: ['T1', 'T2', 'T3', 'T4', 'T5']
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false  // 過去比較モードでは単一選択のみ
            },
            brands: {
                role: 'FILTER',
                label: 'ブランド',
                allowMultiple: false  // 過去比較モードでは単一選択のみ
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'dataSources',  // データソースが系列になる
            filter: 'segments'
        },
        defaultChartType: 'bar'
    },

    'historical_brand_image_segment_brand': {
        id: 'historical_brand_image_segment_brand',
        name: 'ブランドイメージ分析（セグメント、ブランド: X=ブランドイメージ×過去比較）',
        description: '単一セグメント・単一ブランドにおける過去データとの比較（ブランドイメージ項目）',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'brandImage',
                fixedItems: [],  // 動的に決定されるため空
                autoSelect: true,
                autoSelectCount: 30
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false  // 過去比較モードでは単一選択のみ
            },
            brands: {
                role: 'FILTER',
                label: 'ブランド',
                allowMultiple: false  // 過去比較モードでは単一選択のみ
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'dataSources',  // データソースが系列になる
            filter: 'segments'
        },
        defaultChartType: 'bar'
    },

    'historical_brand_power_segment_brand': {
        id: 'historical_brand_power_segment_brand',
        name: 'ブランドパワー分析①（セグメント、ブランド: X=現在パワー×過去比較）',
        description: '単一セグメント・単一ブランドにおける過去データとの比較（ブランドパワー）',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'brandPower',
                fixedItems: ['BP1', 'BP2', 'BP3', 'BP4']
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false  // 過去比較モードでは単一選択のみ
            },
            brands: {
                role: 'FILTER',
                label: 'ブランド',
                allowMultiple: false  // 過去比較モードでは単一選択のみ
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'dataSources',  // データソースが系列になる
            filter: 'segments'
        },
        defaultChartType: 'radar'  // レーダーチャートがデフォルト
    },

    'historical_future_power_segment_brand': {
        id: 'historical_future_power_segment_brand',
        name: 'ブランドパワー分析②（セグメント、ブランド: X=将来性パワー×過去比較）',
        description: '単一セグメント・単一ブランドにおける過去データとの比較（将来性パワー）',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'futurePower',
                fixedItems: ['FP1', 'FP2', 'FP3', 'FP4', 'FP5', 'FP6']
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false  // 過去比較モードでは単一選択のみ
            },
            brands: {
                role: 'FILTER',
                label: 'ブランド',
                allowMultiple: false  // 過去比較モードでは単一選択のみ
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'dataSources',  // データソースが系列になる
            filter: 'segments'
        },
        defaultChartType: 'radar'  // レーダーチャートがデフォルト
    },

    'historical_archetype_segment_brand': {
        id: 'historical_archetype_segment_brand',
        name: 'アーキタイプ分析（セグメント、ブランド: X=アーキタイプ×過去比較）',
        description: '単一セグメント・単一ブランドにおける過去データとの比較（アーキタイプ）',
        axes: {
            items: {
                role: 'X_AXIS',
                label: '項目',
                allowMultiple: false,
                itemSet: 'archetype',
                fixedItems: [
                    'creator', 'ruler', 'sage', 'explorer',
                    'innocent', 'outlaw', 'magician', 'hero',
                    'lover', 'jester', 'regular', 'caregiver'
                ]
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false  // 過去比較モードでは単一選択のみ
            },
            brands: {
                role: 'FILTER',
                label: 'ブランド',
                allowMultiple: false  // 過去比較モードでは単一選択のみ
            }
        },
        dataTransform: {
            xAxis: 'items',
            series: 'dataSources',  // データソースが系列になる
            filter: 'segments'
        },
        defaultChartType: 'radar'  // レーダーチャートがデフォルト
    },

    'historical_funnel1_brands_comparison': {
        id: 'historical_funnel1_brands_comparison',
        name: 'ファネル分析①（セグメント、ファネル①: X=ブランド×過去比較）',
        description: '単一セグメント・単一ファネル項目における複数ブランドの過去データとの比較',
        axes: {
            items: {
                role: 'FILTER',
                label: 'ファネル項目',
                allowMultiple: false,  // 単一選択
                itemSet: 'funnel',
                fixedItems: ['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL']
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false  // 単一選択
            },
            brands: {
                role: 'X_AXIS',
                label: 'ブランド',
                allowMultiple: true  // 複数選択可能（Mode 7の重要な特徴）
            }
        },
        dataTransform: {
            xAxis: 'brands',  // ブランドがX軸
            series: 'dataSources',  // データソースが系列
            filter: 'segments'  // セグメントと項目でフィルタ
        },
        defaultChartType: 'bar'
    },

    'historical_funnel2_brands_comparison': {
        id: 'historical_funnel2_brands_comparison',
        name: 'ファネル分析②（セグメント、ファネル②: X=ブランド×過去比較）',
        description: '単一セグメント・単一タイムライン項目における複数ブランドの過去データとの比較',
        axes: {
            items: {
                role: 'FILTER',
                label: 'タイムライン項目',
                allowMultiple: false,  // 単一選択
                itemSet: 'timeline',
                fixedItems: ['T1', 'T2', 'T3', 'T4', 'T5']
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false  // 単一選択
            },
            brands: {
                role: 'X_AXIS',
                label: 'ブランド',
                allowMultiple: true  // 複数選択可能
            }
        },
        dataTransform: {
            xAxis: 'brands',  // ブランドがX軸
            series: 'dataSources',  // データソースが系列
            filter: 'segments'  // セグメントと項目でフィルタ
        },
        defaultChartType: 'bar'
    },

    'historical_brand_image_brands_comparison': {
        id: 'historical_brand_image_brands_comparison',
        name: 'ブランドイメージ分析（セグメント、ブランドイメージ: X=ブランド×過去比較）',
        description: '単一セグメント・単一ブランドイメージ項目における複数ブランドの過去データとの比較',
        axes: {
            items: {
                role: 'FILTER',
                label: 'ブランドイメージ項目',
                allowMultiple: false,  // 単一選択
                itemSet: 'brandImage',
                fixedItems: []  // ブランドイメージ一覧から選択
            },
            segments: {
                role: 'FILTER',
                label: 'セグメント',
                allowMultiple: false  // 単一選択
            },
            brands: {
                role: 'X_AXIS',
                label: 'ブランド',
                allowMultiple: true  // 複数選択可能
            }
        },
        dataTransform: {
            xAxis: 'brands',  // ブランドがX軸
            series: 'dataSources',  // データソースが系列
            filter: 'segments'  // セグメントと項目でフィルタ
        },
        defaultChartType: 'bar'
    }
};

/**
 * Historical mode selection order for dropdown
 */
export const HISTORICAL_ANALYSIS_MODE_ORDER = [
    'historical_funnel1_segment_brand',           // Mode 1
    'historical_funnel1_brands_comparison',       // Mode 2
    'historical_funnel2_segment_brand',           // Mode 3
    'historical_funnel2_brands_comparison',       // Mode 4
    'historical_brand_image_segment_brand',       // Mode 5
    'historical_brand_image_brands_comparison',   // Mode 6
    'historical_brand_power_segment_brand',        // Mode 7
    'historical_future_power_segment_brand',      // Mode 8
    'historical_archetype_segment_brand'          // Mode 9
    // 今後Mode 10-14を追加予定
];