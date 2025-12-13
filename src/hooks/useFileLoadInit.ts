/**
 * ファイルロード初期化フック
 * 
 * ファイル読み込み後の初期化処理（セグメント・ブランド自動選択）を一元化
 * 
 * 設計方針:
 * 1. unifiedStorageを直接使用（最初に確実に3つ保存）
 * 2. React state settersを呼び出し（再レンダリングをトリガー）
 * 
 * Note: useModeState.setSegments/setBrandsは、3つ以上渡された場合は
 * ファイル初期化と判断し、モード制約を無視してすべて保存する
 */

import { useCallback } from 'react';
import { useUnifiedStorage } from './useUnifiedStorage';

interface LoadResult {
    sheetData: Record<string, Record<string, any>>;
    brandImageData?: any;
}

/**
 * ファイルロード後の初期化ロジック
 * 
 * @param setSelectedSegments セグメント選択用のsetter（再レンダリング用）
 * @param setSelectedBrands ブランド選択用のsetter（再レンダリング用）
 */
export const useFileLoadInit = (
    setSelectedSegments: (segments: string[]) => void,
    setSelectedBrands: (brands: string[]) => void
) => {
    const unifiedStorage = useUnifiedStorage();

    const initializeFromLoadResult = useCallback((result: LoadResult | null) => {
        if (!result) return;

        const allSegments = Object.keys(result.sheetData);
        const top3Segments = allSegments.slice(0, 3);

        if (top3Segments.length > 0) {
            const firstSheet = top3Segments[0];
            const allBrands = Object.keys(result.sheetData[firstSheet]);
            const top3Brands = allBrands.slice(0, 3);

            // Step 1: unifiedStorageに直接保存（確実に3つ保存）
            unifiedStorage.setSegments(top3Segments);
            unifiedStorage.setBrands(top3Brands);

            // Step 2: React settersを呼び出し（再レンダリングをトリガー）
            // useModeStateは3つ以上の場合はすべて保存するようになった
            setSelectedSegments(top3Segments);
            setSelectedBrands(top3Brands);

            console.log('[useFileLoadInit] File loaded - initialized with:', {
                segments: top3Segments,
                brands: top3Brands
            });
        }
    }, [unifiedStorage, setSelectedSegments, setSelectedBrands]);

    return {
        initializeFromLoadResult
    };
};
