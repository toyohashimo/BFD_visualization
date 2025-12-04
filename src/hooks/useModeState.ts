import { useCallback, useMemo, useEffect } from 'react';
import { usePersistence } from './usePersistence';
import { AnalysisModeConfig } from '../types';

/**
 * モードごとの選択状態を保持する型
 */
export interface ModeState {
    brands: string[];
    segments: string[];
    item: string;
    targetBrand: string;
    sheet: string;
}

/**
 * モード固有のストレージキーを生成
 */
const getModeStateKey = (modeId: string, field: keyof ModeState): string => {
    return `mode_state:${modeId}:${field}`;
};

/**
 * モードの制約に基づいて選択状態をバリデーション
 */
const validateModeState = (
    state: ModeState,
    config: AnalysisModeConfig
): ModeState => {
    const validated = { ...state };

    // ブランドの制約チェック
    if (config.axes.brands) {
        if (config.axes.brands.role === 'FILTER') {
            // FILTERの場合: 既存のtargetBrandを優先、なければbrandsから取得
            validated.targetBrand = state.targetBrand || state.brands[0] || '';
            validated.brands = [];
        } else if (config.axes.brands.allowMultiple === false) {
            // 単一選択のみ許可の場合: 最初の1つだけ残す
            validated.brands = state.brands.slice(0, 1);
            validated.targetBrand = '';
        } else {
            // 複数選択許可の場合: そのまま
            validated.targetBrand = '';
        }
    }

    // セグメントの制約チェック
    if (config.axes.segments) {
        if (config.axes.segments.role === 'FILTER') {
            // FILTERの場合: 既存のsheetを優先、なければsegmentsから取得
            validated.sheet = state.sheet || state.segments[0] || '';
            validated.segments = [];
        } else if (config.axes.segments.allowMultiple === false) {
            // 単一選択のみ許可の場合: 最初の1つだけ残す
            validated.segments = state.segments.slice(0, 1);
            validated.sheet = '';
        } else {
            // 複数選択許可の場合（SERIES役割など）: segmentsはそのまま、sheetは既存値を保持
            // モード切り替え時にsheetが設定されていれば保持
            // （空の場合は空のまま）
        }
    }

    // 分析項目の制約チェック
    if (config.axes.items) {
        const itemsConfig = config.axes.items;

        // FILTERロールで、itemSetが異なる場合はリセット
        if (itemsConfig.role === 'FILTER' && itemsConfig.itemSet) {
            const currentItemSet = itemsConfig.itemSet;
            const isTimelineItem = ['T1', 'T2', 'T3', 'T4', 'T5'].includes(state.item);
            const isFunnelItem = ['FT', 'FW', 'FZ', 'GC', 'GJ', 'GL'].includes(state.item);
            const isBrandPowerItem = ['BP1', 'BP2', 'BP3', 'BP4'].includes(state.item);
            const isFuturePowerItem = ['FP1', 'FP2', 'FP3', 'FP4', 'FP5', 'FP6'].includes(state.item);

            // itemSetに合わない場合はデフォルト値にリセット
            if (currentItemSet === 'timeline' && !isTimelineItem) {
                validated.item = 'T1';
            } else if (currentItemSet === 'funnel' && !isFunnelItem) {
                validated.item = 'FT';
            } else if (currentItemSet === 'brandPower' && !isBrandPowerItem) {
                validated.item = 'BP1';
            } else if (currentItemSet === 'futurePower' && !isFuturePowerItem) {
                validated.item = 'FP1';
            } else if (currentItemSet === 'brandImage') {
                // ブランドイメージの場合は特別処理（autoSelectなので空文字列）
                validated.item = '';
            }
        }
    }

    return validated;
};

/**
 * 既存のグローバル選択状態を現在のモードに移行
 * 一度だけ実行される
 */
const migrateOldStorage = (modeId: string) => {
    const migrationKey = `mode_state_migrated:${modeId}`;

    // すでに移行済みの場合はスキップ
    if (localStorage.getItem(migrationKey)) {
        return;
    }

    console.log(`[Migration] Migrating old storage for mode: ${modeId}`);

    // 旧キーから読み込み
    try {
        const oldBrands = localStorage.getItem('funnel_selected_brands');
        const oldSegments = localStorage.getItem('funnel_selected_segments');
        const oldItem = localStorage.getItem('funnel_selected_item');
        const oldTargetBrand = localStorage.getItem('funnel_target_brand');
        const oldSheet = localStorage.getItem('funnel_selected_sheet');

        let migrated = false;

        // 新キーに保存（既存の新キーがない場合のみ）
        if (oldBrands && !localStorage.getItem(getModeStateKey(modeId, 'brands'))) {
            localStorage.setItem(getModeStateKey(modeId, 'brands'), oldBrands);
            migrated = true;
        }

        if (oldSegments && !localStorage.getItem(getModeStateKey(modeId, 'segments'))) {
            localStorage.setItem(getModeStateKey(modeId, 'segments'), oldSegments);
            migrated = true;
        }

        if (oldItem && !localStorage.getItem(getModeStateKey(modeId, 'item'))) {
            localStorage.setItem(getModeStateKey(modeId, 'item'), JSON.stringify(oldItem));
            migrated = true;
        }

        if (oldTargetBrand && !localStorage.getItem(getModeStateKey(modeId, 'targetBrand'))) {
            localStorage.setItem(getModeStateKey(modeId, 'targetBrand'), JSON.stringify(oldTargetBrand));
            migrated = true;
        }

        if (oldSheet && !localStorage.getItem(getModeStateKey(modeId, 'sheet'))) {
            localStorage.setItem(getModeStateKey(modeId, 'sheet'), JSON.stringify(oldSheet));
            migrated = true;
        }

        if (migrated) {
            console.log(`[Migration] Successfully migrated data for mode: ${modeId}`);
        }

        // 移行済みフラグを設定
        localStorage.setItem(migrationKey, 'true');
    } catch (error) {
        console.error(`[Migration] Failed to migrate data for mode: ${modeId}`, error);
    }
};

/**
 * モードごとの選択状態を管理するフック
 * 
 * @param modeId 分析モードID
 * @param config 分析モード設定
 * @returns モードごとの選択状態とセッター関数
 */
export const useModeState = (
    modeId: string,
    config: AnalysisModeConfig
) => {
    // 初回のみマイグレーション実行
    useEffect(() => {
        migrateOldStorage(modeId);
    }, [modeId]);

    // モード固有のストレージから読み込み
    const [rawBrands, setRawBrands] = usePersistence<string[]>(
        getModeStateKey(modeId, 'brands'),
        []
    );

    const [rawSegments, setRawSegments] = usePersistence<string[]>(
        getModeStateKey(modeId, 'segments'),
        []
    );

    const [rawItem, setRawItem] = usePersistence<string>(
        getModeStateKey(modeId, 'item'),
        ''
    );

    const [rawTargetBrand, setRawTargetBrand] = usePersistence<string>(
        getModeStateKey(modeId, 'targetBrand'),
        ''
    );

    const [rawSheet, setRawSheet] = usePersistence<string>(
        getModeStateKey(modeId, 'sheet'),
        ''
    );

    // 現在の状態をバリデーション
    const validatedState = useMemo(() => {
        return validateModeState(
            {
                brands: rawBrands,
                segments: rawSegments,
                item: rawItem,
                targetBrand: rawTargetBrand,
                sheet: rawSheet,
            },
            config
        );
    }, [rawBrands, rawSegments, rawItem, rawTargetBrand, rawSheet, config]);

    // バリデーション結果をストレージに書き戻す
    // （rawデータとvalidatedデータが異なる場合のみ）
    useEffect(() => {
        if (JSON.stringify(rawBrands) !== JSON.stringify(validatedState.brands)) {
            setRawBrands(validatedState.brands);
        }
        if (JSON.stringify(rawSegments) !== JSON.stringify(validatedState.segments)) {
            setRawSegments(validatedState.segments);
        }
        if (rawItem !== validatedState.item) {
            setRawItem(validatedState.item);
        }
        if (rawTargetBrand !== validatedState.targetBrand) {
            setRawTargetBrand(validatedState.targetBrand);
        }
        if (rawSheet !== validatedState.sheet) {
            setRawSheet(validatedState.sheet);
        }
    }, [validatedState, rawBrands, rawSegments, rawItem, rawTargetBrand, rawSheet, setRawBrands, setRawSegments, setRawItem, setRawTargetBrand, setRawSheet]);

    // バリデーション結果を適用するラッパー関数
    const setBrands = useCallback((brands: string[]) => {
        setRawBrands(brands);
    }, [setRawBrands]);

    const setSegments = useCallback((segments: string[]) => {
        setRawSegments(segments);
    }, [setRawSegments]);

    const setItem = useCallback((item: string) => {
        setRawItem(item);
    }, [setRawItem]);

    const setTargetBrand = useCallback((targetBrand: string) => {
        setRawTargetBrand(targetBrand);
    }, [setRawTargetBrand]);

    const setSheet = useCallback((sheet: string) => {
        setRawSheet(sheet);
    }, [setRawSheet]);

    return {
        // バリデーション済みの状態を返す
        brands: validatedState.brands,
        segments: validatedState.segments,
        item: validatedState.item,
        targetBrand: validatedState.targetBrand,
        sheet: validatedState.sheet,

        // セッター関数
        setBrands,
        setSegments,
        setItem,
        setTargetBrand,
        setSheet,
    };
};
