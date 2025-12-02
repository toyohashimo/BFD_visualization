import { useState, useCallback } from 'react';
import { SheetData, BrandImageData, ParsedData } from '../types';
import { useExcelParser } from './useExcelParser';

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
    loadFromArrayBuffer,
    reset,
    hasData,
  };
};

