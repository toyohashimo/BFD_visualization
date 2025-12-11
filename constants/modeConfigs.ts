import { ModeConfig, METRIC_KEYS } from '../types';

// Funnel metrics (認知 → 興味関心 → 好意 → 購入意向 → 購入経験 → リピート意向)
export const FUNNEL_METRICS = METRIC_KEYS;

// Funnel2 metrics - 将来の拡張用
// TODO: 実際のファネル2項目に置き換える
export const FUNNEL2_METRICS = METRIC_KEYS;

/**
 * Mode Configuration
 * 各分析モードの設定を定義
 */
export const MODE_CONFIGS: Record<string, ModeConfig> = {
    // Mode 1: ファネル分析（セグメント×複数ブランド）
    'funnel_segment_brands': {
        metrics: {
            type: 'fixed',
            values: FUNNEL_METRICS,
            required: true
        },
        segment: {
            type: 'single',
            required: true
        },
        brands: {
            type: 'multiple',
            required: true,
            min: 1,
            max: 15
        }
    },

    // Mode 2: ファネル分析（ブランド×複数セグメント）
    'funnel_brand_segments': {
        metrics: {
            type: 'fixed',
            values: FUNNEL_METRICS,
            required: true
        },
        segment: {
            type: 'multiple',
            required: true,
            min: 1,
            max: 15
        },
        brands: {
            type: 'single',
            required: true
        }
    },

    // Mode 3: ファネル分析（項目×複数ブランド）
    'funnel_item_segments_brands': {
        metrics: {
            type: 'single',
            options: METRIC_KEYS,
            required: true
        },
        segment: {
            type: 'multiple',
            required: true,
            min: 1,
            max: 15
        },
        brands: {
            type: 'multiple',
            required: true,
            min: 1,
            max: 15
        }
    },

    // Mode 4: ファネル2分析（セグメント×複数ブランド）
    'funnel2_segment_brands': {
        metrics: {
            type: 'fixed',
            values: FUNNEL2_METRICS,
            required: true
        },
        segment: {
            type: 'single',
            required: true
        },
        brands: {
            type: 'multiple',
            required: true,
            min: 1,
            max: 15
        }
    }
};

/**
 * Mode display names for UI
 */
export const MODE_DISPLAY_NAMES: Record<string, string> = {
    'funnel_segment_brands': '1. ファネル分析（セグメント×複数ブランド）',
    'funnel_brand_segments': '2. ファネル分析（ブランド×複数セグメント）',
    'funnel_item_segments_brands': '3. ファネル分析（項目×複数ブランド）',
    'funnel2_segment_brands': '4. ファネル2分析（セグメント×複数ブランド）'
};

/**
 * Migrate old analysis mode names to new ones
 */
export const migrateAnalysisMode = (saved: string | null): string => {
    const migration: Record<string, string> = {
        'segment_x_multi_brand': 'funnel_segment_brands',
        'brand_x_multi_segment': 'funnel_brand_segments',
        'item_x_multi_brand': 'funnel_item_segments_brands'
    };

    if (saved && migration[saved]) {
        return migration[saved];
    }

    return saved || 'funnel_segment_brands';
};
