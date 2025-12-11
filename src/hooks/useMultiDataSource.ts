/**
 * マルチデータソース管理フック
 * 
 * 過去比較モードで使用する複数データソース（最大3ファイル）の管理
 */

import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DataSource, MultiDataSourceState } from '../types/dataSource';

/**
 * LocalStorage用の軽量メタデータ型
 * 実データは含めず、メタ情報のみ
 */
interface DataSourceMetadata {
  id: string;
  name: string;
  fileName: string;
  uploadedAt: string; // Date -> string
  isActive: boolean;
}

interface MetadataState {
  metadata: DataSourceMetadata[];
  currentSourceId: string | null;
}

/**
 * データソース管理フック
 * 過去比較モード専用（詳細分析モードとは独立）
 */
export const useMultiDataSource = () => {
  // 実データはメモリ上のみ（LocalStorageには保存しない）
  // 過去比較モード専用の状態
  const [state, setState] = useState<MultiDataSourceState>({
    dataSources: [],
    currentSourceId: null
  });

  // 注意: データソースはメモリ上でのみ管理し、LocalStorageには保存しません
  // リロード時にはデータソースはクリアされます（実データが大きすぎるため）
  // この状態は過去比較モード専用です

  /**
   * ファイル名から期間名を抽出
   * 
   * 以下のパターンをサポート:
   * - YYYY_MM, YYYY-MM → "YYYY年M月"
   * - YYYY_Q1-Q4 → "YYYY年Q1-Q4"
   * - YYYYMM → "YYYY年M月"
   * - MonYYYY → "YYYY年M月"
   * - YYYY_MM_DD → "YYYY年M月D日"
   */
  const extractDateFromFilename = useCallback((filename: string): string => {
    // 拡張子を削除
    const nameWithoutExt = filename.replace(/\.(xlsx|xls|csv)$/i, '');

    const patterns: Array<{
      regex: RegExp;
      format: (match: RegExpMatchArray) => string;
    }> = [
        // YYYY_MM, YYYY-MM
        {
          regex: /(\d{4})[_-](\d{1,2})(?![_-]?\d)/,
          format: (m) => `${m[1]}年${parseInt(m[2])}月`
        },
        // YYYY_Q1-Q4, YYYYQ1-Q4
        {
          regex: /(\d{4})[_-]?Q([1-4])/i,
          format: (m) => `${m[1]}年Q${m[2]}`
        },
        // MonYYYY (Jan, Feb, etc.)
        {
          regex: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[_-]?(\d{4})/i,
          format: (m) => {
            const months: Record<string, string> = {
              jan: '1', feb: '2', mar: '3', apr: '4', may: '5', jun: '6',
              jul: '7', aug: '8', sep: '9', oct: '10', nov: '11', dec: '12'
            };
            return `${m[2]}年${months[m[1].toLowerCase()]}月`;
          }
        },
        // YYYY_MM_DD, YYYY-MM-DD
        {
          regex: /(\d{4})[_-](\d{2})[_-](\d{2})/,
          format: (m) => `${m[1]}年${parseInt(m[2])}月${parseInt(m[3])}日`
        },
        // YYYYMM (最後にチェック - より具体的なパターンを先に)
        {
          regex: /(\d{4})(\d{2})(?!\d)/,
          format: (m) => `${m[1]}年${parseInt(m[2])}月`
        }
      ];

    for (const pattern of patterns) {
      const match = nameWithoutExt.match(pattern.regex);
      if (match) {
        return pattern.format(match);
      }
    }

    // パターンマッチしない場合: データ1, データ2, データ3
    const index = state.dataSources.length + 1;
    return `データ${index}`;
  }, [state.dataSources.length]);

  /**
   * データソース追加
   * 
   * @param file アップロードするファイル
   * @param parseExcelData Excelパース関数
   * @returns 追加されたデータソース（失敗時はnull）
   */
  const addDataSource = useCallback(async (
    file: File,
    parseExcelData: (buffer: ArrayBuffer) => Promise<any>
  ): Promise<DataSource | null> => {
    try {
      // ファイルを読み込み
      const buffer = await file.arrayBuffer();
      const result = await parseExcelData(buffer);

      if (!result || !result.sheetData) {
        alert('ファイルの解析に失敗しました。');
        return null;
      }

      // データソースオブジェクト作成
      const dataSource: DataSource = {
        id: uuidv4(),
        name: extractDateFromFilename(file.name),
        fileName: file.name,
        uploadedAt: new Date(),
        data: result.sheetData,
        brandImageData: result.brandImageData,
        isActive: true
      };

      // 状態更新（関数形式を使用して最新の状態を取得）
      return new Promise<DataSource | null>((resolve) => {
        setState((prevState) => {
          // 最大5つまでの制限
          if (prevState.dataSources.length >= 5) {
            alert('データソースは最大5つまで追加できます。');
            resolve(null);
            return prevState;
          }

          const newDataSources = [...prevState.dataSources, dataSource];
          const newState = {
            dataSources: newDataSources,
            currentSourceId: prevState.currentSourceId || dataSource.id
          };

          resolve(dataSource);
          return newState;
        });
      });
    } catch (error) {
      console.error('データソース追加エラー:', error);
      alert('ファイルの読み込みに失敗しました。');
      return null;
    }
  }, [extractDateFromFilename]);

  /**
   * データソース削除
   * 
   * @param id 削除するデータソースのID
   */
  const removeDataSource = useCallback((id: string) => {
    const newDataSources = state.dataSources.filter(ds => ds.id !== id);

    // 現在選択中のソースを削除した場合、最初のソースに切り替え
    const newCurrentSourceId = state.currentSourceId === id
      ? (newDataSources[0]?.id || null)
      : state.currentSourceId;

    const newState = {
      dataSources: newDataSources,
      currentSourceId: newCurrentSourceId
    };
    setState(newState);
  }, [state]);

  /**
   * データソース名更新
   * 
   * @param id 更新するデータソースのID
   * @param name 新しい名前（最大20文字）
   */
  const updateDataSourceName = useCallback((id: string, name: string) => {
    // 文字数制限
    const trimmedName = name.trim().substring(0, 20);

    if (!trimmedName) {
      alert('データソース名は1文字以上入力してください。');
      return;
    }

    const newState = {
      ...state,
      dataSources: state.dataSources.map(ds =>
        ds.id === id ? { ...ds, name: trimmedName } : ds
      )
    };
    setState(newState);
  }, [state]);

  /**
   * データソースの表示/非表示切り替え
   * 
   * @param id 切り替えるデータソースのID
   */
  const toggleDataSourceActive = useCallback((id: string) => {
    const targetSource = state.dataSources.find(ds => ds.id === id);
    if (!targetSource) return;

    // 現在アクティブなデータソース数をカウント
    const currentActiveCount = state.dataSources.filter(ds => ds.isActive).length;

    // 最後の1つをOFFにしようとした場合はエラー
    if (targetSource.isActive && currentActiveCount <= 1) {
      alert('最低1つのデータソースは有効にしてください。');
      return;
    }

    // トグル実行
    const newState = {
      ...state,
      dataSources: state.dataSources.map(ds =>
        ds.id === id ? { ...ds, isActive: !ds.isActive } : ds
      )
    };
    setState(newState);
  }, [state]);

  /**
   * 現在のデータソース設定（詳細分析モード用）
   * 
   * @param id 使用するデータソースのID
   */
  const setCurrentSource = useCallback((id: string) => {
    if (!state.dataSources.find(ds => ds.id === id)) {
      console.warn(`データソースID ${id} が見つかりません`);
      return;
    }
    const newState = { ...state, currentSourceId: id };
    setState(newState);
  }, [state]);

  /**
   * アクティブなデータソース取得
   * 
   * @returns アクティブなデータソースの配列
   */
  const getActiveDataSources = useCallback((): DataSource[] => {
    return state.dataSources.filter(ds => ds.isActive);
  }, [state.dataSources]);

  /**
   * 現在のデータソース取得（詳細分析モード用）
   * 
   * @returns 現在選択中のデータソース（存在しない場合はnull）
   */
  const getCurrentSource = useCallback((): DataSource | null => {
    if (!state.currentSourceId) return null;
    return state.dataSources.find(ds => ds.id === state.currentSourceId) || null;
  }, [state.dataSources, state.currentSourceId]);

  /**
   * データソースを直接追加（ファイル読み込みなし）
   * グローバルモード切り替え時に使用
   * 
   * @param dataSource 追加するデータソース
   */
  const addDirectDataSource = useCallback((dataSource: DataSource) => {
    if (state.dataSources.length >= 5) {
      console.warn('データソースは最大5つまで');
      return;
    }

    const newDataSources = [...state.dataSources, dataSource];
    const newState = {
      dataSources: newDataSources,
      currentSourceId: state.currentSourceId || dataSource.id
    };
    setState(newState);
  }, [state]);

  /**
   * 全データソースクリア
   */
  const clearAllDataSources = useCallback(() => {
    const newState = {
      dataSources: [],
      currentSourceId: null
    };
    setState(newState);
  }, []);

  return {
    // 状態
    dataSources: state.dataSources,
    currentSourceId: state.currentSourceId,

    // メソッド
    addDataSource,
    addDirectDataSource,
    removeDataSource,
    updateDataSourceName,
    toggleDataSourceActive,
    setCurrentSource,
    getActiveDataSources,
    getCurrentSource,
    clearAllDataSources,
  };
};

