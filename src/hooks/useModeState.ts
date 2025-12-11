import { useCallback, useMemo, useEffect, useRef } from 'react';
import { useUnifiedStorage } from './useUnifiedStorage';
import { AnalysisModeConfig } from '../types';

/**
 * モードごとの選択状態を保持する型
 * Note: segments[0]がデータソース（シート）として機能します
 */
export interface ModeState {
    brands: string[];
    segments: string[];
    item: string;
    targetBrand: string;  // 動的生成（brands[0]から）
}

/**
 * モード固有のストレージキーを生成（レガシーマイグレーション用）
 */
const getModeStateKey = (modeId: string, field: string): string => {
    return `mode_state:${modeId}:${field}`;
};

/**
 * モードの制約に基づいて選択状態を「表示用」にバリデーション
 * 注意: この関数はlocalStorageを変更しません（表示フィルターのみ）
 */
const getDisplayState = (
    state: Omit<ModeState, 'targetBrand'>,
    config: AnalysisModeConfig
): Omit<ModeState, 'targetBrand'> => {
    const display = { ...state };

    // ブランドの表示制約
    if (config.axes.brands) {
        if (config.axes.brands.role === 'FILTER') {
            // FILTERの場合: 最初の1つのみ表示（localStorageは変更しない）
            display.brands = state.brands.length > 0 ? [state.brands[0]] : [];
        } else if (config.axes.brands.allowMultiple === false) {
            // SAの場合: 最初の1つのみ表示
            display.brands = state.brands.slice(0, 1);
        }
        // MAの場合: 全て表示
    }

    // セグメントの表示制約
    if (config.axes.segments) {
        if (config.axes.segments.role === 'FILTER') {
            // FILTERの場合: segments[0]をデータソースとして使用
            // 表示用には空配列にはせず、[0]のみ残す
            display.segments = state.segments.length > 0 ? [state.segments[0]] : [];
        } else if (config.axes.segments.allowMultiple === false) {
            // SAの場合: 最初の1つのみ表示
            display.segments = state.segments.slice(0, 1);
        }
        // MAの場合: 全て表示
    }

    // 分析項目の制約チェック
    if (config.axes.items) {
        const itemsConfig = config.axes.items;

        if (itemsConfig.role === 'FILTER' && itemsConfig.itemSet) {
            const currentItemSet = itemsConfig.itemSet;
            const isTimelineItem = ['T1', 'T2', 'T3', 'T4', 'T5'].includes(state.item);
            const isFunnelItem = ['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL'].includes(state.item);
            const isBrandPowerItem = ['BP1', 'BP2', 'BP3', 'BP4'].includes(state.item);
            const isFuturePowerItem = ['FP1', 'FP2', 'FP3', 'FP4', 'FP5', 'FP6'].includes(state.item);

            // itemSetに合わない場合はデフォルト値にリセット
            if (currentItemSet === 'timeline' && !isTimelineItem) {
                display.item = 'T1';
            } else if (currentItemSet === 'funnel' && !isFunnelItem) {
                display.item = 'FT';
            } else if (currentItemSet === 'brandPower' && !isBrandPowerItem) {
                display.item = 'BP1';
            } else if (currentItemSet === 'futurePower' && !isFuturePowerItem) {
                display.item = 'FP1';
            } else if (currentItemSet === 'brandImage') {
                display.item = '';
            }
        }
    }

    return display;
};

/**
 * 既存のモード固有ストレージから統一ストレージへの移行
 * 一度だけ実行される
 */
const migrateToUnifiedStorage = () => {
    const migrationKey = 'unified_storage_migrated';

    if (localStorage.getItem(migrationKey)) {
        return;
    }

    console.log('[Migration] Starting migration from mode-specific to unified storage...');

    try {
        const allBrandsData: string[][] = [];
        const allSegmentsData: string[][] = [];
        let mostRecentSheet = '';
        let mostRecentItem = '';

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.includes('mode_state:')) continue;

            if (key.includes(':brands')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '[]');
                    if (Array.isArray(data) && data.length > 0) {
                        allBrandsData.push(data);
                    }
                } catch (e) {
                    console.warn(`[Migration] Failed to parse brands from ${key}`, e);
                }
            } else if (key.includes(':segments')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '[]');
                    if (Array.isArray(data) && data.length > 0) {
                        allSegmentsData.push(data);
                    }
                } catch (e) {
                    console.warn(`[Migration] Failed to parse segments from ${key}`, e);
                }
            } else if (key.includes(':sheet') && !mostRecentSheet) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '""');
                    if (data) mostRecentSheet = data;
                } catch (e) {
                    const data = localStorage.getItem(key);
                    if (data) mostRecentSheet = data;
                }
            } else if (key.includes(':item') && !mostRecentItem) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '""');
                    if (data) mostRecentItem = data;
                } catch (e) {
                    const data = localStorage.getItem(key);
                    if (data) mostRecentItem = data;
                }
            }
        }

        const maxBrands = allBrandsData.reduce((max, current) =>
            current.length > max.length ? current : max, []).slice(0, 15);
        const maxSegments = allSegmentsData.reduce((max, current) =>
            current.length > max.length ? current : max, []).slice(0, 15);

        if (maxBrands.length > 0) {
            localStorage.setItem('unified_brands', JSON.stringify(maxBrands));
            console.log(`[Migration] Migrated ${maxBrands.length} brands`);
        }
        if (maxSegments.length > 0) {
            localStorage.setItem('unified_segments', JSON.stringify(maxSegments));
            console.log(`[Migration] Migrated ${maxSegments.length} segments`);
        }
        // unified_sheet is deprecated - no longer migrating
        if (mostRecentItem) {
            localStorage.setItem('unified_item', JSON.stringify(mostRecentItem));
            console.log(`[Migration] Migrated item: ${mostRecentItem}`);
        }

        localStorage.setItem(migrationKey, 'true');
        console.log('[Migration] Migration completed successfully');
    } catch (error) {
        console.error('[Migration] Failed to migrate storage:', error);
    }
};

/**
 * モードごとの選択状態を管理するフック（統一ストレージ版）
 * 
 * @param modeId 分析モードID（レガシー互換性のため保持）
 * @param config 分析モード設定
 * @returns モードごとの選択状態とセッター関数
 */
export const useModeState = (
    modeId: string,
    config: AnalysisModeConfig
) => {
    // 初回のみマイグレーション実行
    useEffect(() => {
        migrateToUnifiedStorage();
    }, []);

    // 統一ストレージから読み込み
    const unifiedStorage = useUnifiedStorage();

    // 最新の値を参照するためのref（useCallback内で使用）
    const brandsRef = useRef(unifiedStorage.brands);
    const segmentsRef = useRef(unifiedStorage.segments);

    useEffect(() => {
        brandsRef.current = unifiedStorage.brands;
        segmentsRef.current = unifiedStorage.segments;
    }, [unifiedStorage.brands, unifiedStorage.segments]);

    // 表示用の状態（モード制約を適用、localStorageは変更しない）
    const displayState = useMemo(() => {
        return getDisplayState(
            {
                brands: unifiedStorage.brands,
                segments: unifiedStorage.segments,
                item: unifiedStorage.item,
            },
            config
        );
    }, [unifiedStorage.brands, unifiedStorage.segments, unifiedStorage.item, config]);

    // targetBrandを動的に生成
    const targetBrand = useMemo(() => {
        if (config.axes.brands?.role === 'FILTER') {
            return displayState.brands[0] || '';
        }
        return '';
    }, [displayState.brands, config.axes.brands]);

    // モード制約を考慮したセッター関数
    const setBrands = useCallback((newBrands: string[]) => {
        if (config.axes.brands?.allowMultiple === false) {
            // SA（単一選択）の場合: brands[0]のみ置き換え、残りは保持
            const currentBrands = brandsRef.current;
            const updatedBrands = [newBrands[0], ...currentBrands.slice(1)].filter(Boolean);
            unifiedStorage.setBrands(updatedBrands);
        } else {
            // MA（複数選択）の場合: そのまま設定
            unifiedStorage.setBrands(newBrands);
        }
    }, [config.axes.brands?.allowMultiple, unifiedStorage.setBrands]);

    const setSegments = useCallback((newSegments: string[]) => {
        if (config.axes.segments?.allowMultiple === false) {
            // SA（単一選択）の場合: segments[0]のみ置き換え、残りは保持
            const currentSegments = segmentsRef.current;
            const updatedSegments = [newSegments[0], ...currentSegments.slice(1)].filter(Boolean);
            unifiedStorage.setSegments(updatedSegments);
        } else {
            // MA（複数選択）の場合: そのまま設定
            unifiedStorage.setSegments(newSegments);
        }
    }, [config.axes.segments?.allowMultiple, unifiedStorage.setSegments]);

    const setItem = useCallback((item: string) => {
        unifiedStorage.setItem(item);
    }, [unifiedStorage.setItem]);

    const setTargetBrand = useCallback((brand: string) => {
        // targetBrandの設定はbrands[0]の設定
        setBrands([brand]);
    }, [setBrands]);

    // setSheet is deprecated - use setSegments([sheet, ...]) to change data source

    return {
        // 表示用の状態を返す（モード制約適用済み）
        brands: displayState.brands,
        segments: displayState.segments,
        item: displayState.item,
        targetBrand,

        // 生の値（ヘルパーメソッド用）
        rawBrands: unifiedStorage.brands,
        rawSegments: unifiedStorage.segments,

        // セッター関数（モード制約を考慮）
        setBrands,
        setSegments,
        setItem,
        setTargetBrand,
    };
};
