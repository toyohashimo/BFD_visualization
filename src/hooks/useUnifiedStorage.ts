import { useCallback } from 'react';
import { usePersistence } from './usePersistence';

/**
 * 統一LocalStorage管理のための定数
 */
const UNIFIED_STORAGE_KEYS = {
    BRANDS: 'unified_brands',
    SEGMENTS: 'unified_segments',
    ITEM: 'unified_item',
} as const;

/**
 * 最大選択数の制限
 */
const MAX_SELECTIONS = 15;

/**
 * 統一ストレージの状態型
 */
export interface UnifiedStorageState {
    brands: string[];        // 最大15個（生ブランド名）
    segments: string[];      // 最大15個（生シート名）
    item: string;
}

/**
 * 選択項目数バリデーション
 */
const validateSelections = (items: string[], maxCount: number = MAX_SELECTIONS): string[] => {
    if (items.length > maxCount) {
        console.warn(`Selection limit exceeded. Only first ${maxCount} items will be saved.`);
        return items.slice(0, maxCount);
    }
    return items;
};

/**
 * 統一LocalStorage管理フック
 * 
 * 詳細分析モードと過去比較モードで共通の選択状態を管理します。
 * 最大15個までのブランド/セグメント選択をサポートします。
 * 
 * Note: segments[0]がデータソース（シート）として機能します。
 */
export const useUnifiedStorage = () => {
    // 統一キーでのpersistence
    const [rawBrands, setRawBrands] = usePersistence<string[]>(
        UNIFIED_STORAGE_KEYS.BRANDS,
        []
    );

    const [rawSegments, setRawSegments] = usePersistence<string[]>(
        UNIFIED_STORAGE_KEYS.SEGMENTS,
        []
    );

    const [rawItem, setRawItem] = usePersistence<string>(
        UNIFIED_STORAGE_KEYS.ITEM,
        ''
    );

    // バリデーション付きセッター
    const setBrands = useCallback((brands: string[]) => {
        const validated = validateSelections(brands, MAX_SELECTIONS);
        setRawBrands(validated);
    }, [setRawBrands]);

    const setSegments = useCallback((segments: string[]) => {
        const validated = validateSelections(segments, MAX_SELECTIONS);
        setRawSegments(validated);
    }, [setRawSegments]);

    const setItem = useCallback((item: string) => {
        setRawItem(item);
    }, [setRawItem]);

    return {
        // State
        brands: rawBrands,
        segments: rawSegments,
        item: rawItem,

        // Setters
        setBrands,
        setSegments,
        setItem,
    };
};
