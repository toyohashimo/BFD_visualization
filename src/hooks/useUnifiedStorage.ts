import { useCallback } from 'react';
import { usePersistence } from './usePersistence';

/**
 * データソースメタデータ型（過去分析モード用）
 * 実データは含めず、メタ情報のみ
 */
export interface DataSourceMetadata {
    id: string;
    name: string;           // 表示名（編集可能）
    fileName: string;       // 元ファイル名
    uploadedAt: string;     // ISO 8601形式
    isActive: boolean;      // 表示ON/OFF
}

/**
 * 統一LocalStorage管理のための定数
 */
const UNIFIED_STORAGE_KEYS = {
    BRANDS: 'unified_brands',
    SEGMENTS: 'unified_segments',
    ITEM: 'unified_item',
    HISTORICAL_FILES: 'unified_historical_files',
} as const;

/**
 * 最大選択数の制限
 */
const MAX_SELECTIONS = 15;
const MAX_HISTORICAL_FILES = 5;

/**
 * 統一ストレージの状態型
 */
export interface UnifiedStorageState {
    brands: string[];                   // 最大15個（生ブランド名）
    segments: string[];                 // 最大15個（生シート名）
    item: string;
    historicalFiles: DataSourceMetadata[];  // 最大5個（過去分析モード用）
}

/**
 * 選択項目数バリデーション（ジェネリック版）
 */
const validateSelections = <T>(items: T[], maxCount: number = MAX_SELECTIONS): T[] => {
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

    const [rawHistoricalFiles, setRawHistoricalFiles] = usePersistence<DataSourceMetadata[]>(
        UNIFIED_STORAGE_KEYS.HISTORICAL_FILES,
        []
    );

    // 重複排除ユーティリティ関数
    const removeDuplicates = <T,>(array: T[]): T[] => {
        const seen = new Set<T>();
        return array.filter(item => {
            if (seen.has(item)) {
                return false;
            }
            seen.add(item);
            return true;
        });
    };

    // バリデーション付きセッター（重複自動排除）
    const setBrands = useCallback((brands: string[]) => {
        const uniqueBrands = removeDuplicates(brands);
        if (brands.length !== uniqueBrands.length) {
            console.log('[useUnifiedStorage] ブランド重複検出・排除:', brands, '→', uniqueBrands);
        }
        const validated = validateSelections(uniqueBrands, MAX_SELECTIONS);
        setRawBrands(validated);
    }, [setRawBrands]);

    const setSegments = useCallback((segments: string[]) => {
        const uniqueSegments = removeDuplicates(segments);
        if (segments.length !== uniqueSegments.length) {
            console.log('[useUnifiedStorage] セグメント重複検出・排除:', segments, '→', uniqueSegments);
        }
        const validated = validateSelections(uniqueSegments, MAX_SELECTIONS);
        setRawSegments(validated);
    }, [setRawSegments]);

    const setItem = useCallback((item: string) => {
        setRawItem(item);
    }, [setRawItem]);

    const setHistoricalFiles = useCallback((files: DataSourceMetadata[]) => {
        const validated = validateSelections(files, MAX_HISTORICAL_FILES);
        setRawHistoricalFiles(validated);
    }, [setRawHistoricalFiles]);

    return {
        // State
        brands: rawBrands,
        segments: rawSegments,
        item: rawItem,
        historicalFiles: rawHistoricalFiles,

        // Setters
        setBrands,
        setSegments,
        setItem,
        setHistoricalFiles,
    };
};
