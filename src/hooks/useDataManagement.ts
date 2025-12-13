import { useState, useCallback } from 'react';
import { SheetData, BrandImageData, ParsedData } from '../types';
import { useExcelParser } from './useExcelParser';
import { DataSourceMetadata } from './useUnifiedStorage';
import { extractDateFromFilename } from '../utils/filenameParser';
import { v4 as uuidv4 } from 'uuid';

// 初期値（空のオブジェクト）
const EMPTY_DATA: SheetData = {};

/**
 * データ管理フック
 */
export const useDataManagement = () => {
  const [data, setData] = useState<SheetData>(EMPTY_DATA);
  const [brandImageData, setBrandImageData] = useState<BrandImageData>({});
  const [isExcelData, setIsExcelData] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const { parse, parseFromArrayBuffer, isLoading, error } = useExcelParser();

  const loadFromFile = useCallback(async (file: File) => {
    try {
      const result = await parse(file);
      setData(result.sheetData);
      setBrandImageData(result.brandImageData);
      setIsExcelData(true);
      setCurrentFileName(file.name);
      return result;
    } catch (err) {
      throw err;
    }
  }, [parse]);

  const loadFromArrayBuffer = useCallback(async (arrayBuffer: ArrayBuffer) => {
    try {
      const result = await parseFromArrayBuffer(arrayBuffer);
      setData(result.sheetData);
      setBrandImageData(result.brandImageData);
      setIsExcelData(true);
      // ArrayBufferからの読み込みではファイル名を保持しない
      return result;
    } catch (err) {
      throw err;
    }
  }, [parseFromArrayBuffer]);

  /**
   * 統一メタデータ更新付きファイル読み込み
   * 詳細分析モードでファイル読み込み時にunified_historical_files[0]を更新するために使用
   */
  const loadFromFileWithMetadata = useCallback(async (
    file: File,
    onMetadataUpdate: (metadata: DataSourceMetadata) => void
  ) => {
    try {
      const result = await parse(file);
      setData(result.sheetData);
      setBrandImageData(result.brandImageData);
      setIsExcelData(true);
      setCurrentFileName(file.name);

      // メタデータを生成して通知
      const metadata: DataSourceMetadata = {
        id: uuidv4(),
        name: extractDateFromFilename(file.name, 1),
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        isActive: true
      };
      onMetadataUpdate(metadata);

      return result;
    } catch (err) {
      throw err;
    }
  }, [parse]);

  /**
   * 直接データ設定（モード切り替え時の引き継ぎ用）
   * 過去比較モードから詳細分析モードに切り替える際に使用
   */
  const setDataDirect = useCallback((
    newData: SheetData,
    newBrandImageData: BrandImageData,
    fileName: string
  ) => {
    setData(newData);
    setBrandImageData(newBrandImageData);
    setIsExcelData(true);
    setCurrentFileName(fileName);
  }, []);

  const reset = useCallback(() => {
    setData(EMPTY_DATA);
    setBrandImageData({});
    setIsExcelData(false);
    setCurrentFileName('');
  }, []);

  // データが空かどうかをチェック
  const hasData = Object.keys(data).length > 0;

  return {
    data,
    brandImageData,
    isExcelData,
    currentFileName,
    isLoading,
    error,
    loadFromFile,
    loadFromFileWithMetadata,
    loadFromArrayBuffer,
    setDataDirect,
    reset,
    hasData,
  };
};

