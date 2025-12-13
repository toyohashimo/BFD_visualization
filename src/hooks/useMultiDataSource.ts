/**
 * マルチデータソース管理フック
 * 
 * 過去比較モードで使用する複数データソース（最大3ファイル）の管理
 */

import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DataSource, MultiDataSourceState } from '../types/dataSource';
import { useUnifiedStorage, DataSourceMetadata } from './useUnifiedStorage';
import { extractDateFromFilename } from '../utils/filenameParser';

/**
 * データソース管理フック
 * 過去比較モード専用（詳細分析モードとは独立）
 */
export const useMultiDataSource = () => {
  // 統一LocalStorage管理（メタデータのみ永続化）
  const { historicalFiles, setHistoricalFiles } = useUnifiedStorage();

  // 実データはメモリ上のみ（LocalStorageには保存しない）
  // 過去比較モード専用の状態
  const [state, setState] = useState<MultiDataSourceState>({
    dataSources: [],
    currentSourceId: null
  });

  // 注意: 実データ（data, brandImageData）はメモリ上でのみ管理し、LocalStorageには保存しません
  // メタデータ（id, name, fileName, uploadedAt, isActive）はLocalStorageに保存されます
  // リロード時には実データはクリアされますが、メタデータは復元されます



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
        name: extractDateFromFilename(file.name, state.dataSources.length + 1),
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

          // メタデータをLocalStorageに保存
          const metadata: DataSourceMetadata[] = newDataSources.map(ds => ({
            id: ds.id,
            name: ds.name,
            fileName: ds.fileName,
            uploadedAt: ds.uploadedAt.toISOString(),
            isActive: ds.isActive
          }));
          setHistoricalFiles(metadata);

          // 最初のデータソース追加時、セグメント・ブランドを自動選択
          if (newDataSources.length === 1 && dataSource.data) {
            const sheets = Object.keys(dataSource.data);
            if (sheets.length > 0) {
              // セグメント（シート）の自動選択: 最初の3つ
              const top3Segments = sheets.slice(0, 3);

              // ブランドの自動選択: 最初のシートから最初の3つ
              const firstSheet = sheets[0];
              const brands = Object.keys(dataSource.data[firstSheet] || {});
              const top3Brands = brands.slice(0, 3);

              // unifiedStorageを使用してモード制約をバイパス
              if (top3Segments.length > 0) {
                // グローバルスコープからunifiedStorageにアクセスする必要があるため、
                // ここでは初期化を呼び出し側（Sidebar.tsx）で行う
              }
            }
          }

          resolve(dataSource);
          return newState;
        });
      });
    } catch (error) {
      console.error('データソース追加エラー:', error);
      alert('ファイルの読み込みに失敗しました。');
      return null;
    }
  }, [setHistoricalFiles]);

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

    // メタデータをLocalStorageに保存
    const metadata: DataSourceMetadata[] = newDataSources.map(ds => ({
      id: ds.id,
      name: ds.name,
      fileName: ds.fileName,
      uploadedAt: ds.uploadedAt.toISOString(),
      isActive: ds.isActive
    }));
    setHistoricalFiles(metadata);
  }, [state, setHistoricalFiles]);

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

    // メタデータをLocalStorageに保存
    const metadata: DataSourceMetadata[] = newState.dataSources.map(ds => ({
      id: ds.id,
      name: ds.name,
      fileName: ds.fileName,
      uploadedAt: ds.uploadedAt.toISOString(),
      isActive: ds.isActive
    }));
    setHistoricalFiles(metadata);
  }, [state, setHistoricalFiles]);

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

    // メタデータをLocalStorageに保存
    const metadata: DataSourceMetadata[] = newState.dataSources.map(ds => ({
      id: ds.id,
      name: ds.name,
      fileName: ds.fileName,
      uploadedAt: ds.uploadedAt.toISOString(),
      isActive: ds.isActive
    }));
    setHistoricalFiles(metadata);
  }, [state, setHistoricalFiles]);

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

    // メタデータをLocalStorageからクリア
    setHistoricalFiles([]);
  }, [setHistoricalFiles]);

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

