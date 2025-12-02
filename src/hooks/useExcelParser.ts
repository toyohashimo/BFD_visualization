import { useState, useCallback } from 'react';
import { ParsedData } from '../types';
import { ExcelParser } from '../services/excelParser/ExcelParser';
import { MESSAGES } from '../config/constants';

/**
 * Excelパーサーフック
 */
export const useExcelParser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const parse = useCallback(async (file: File): Promise<ParsedData> => {
    setIsLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const parser = new ExcelParser();
      const result = await parser.parse(arrayBuffer);
      setIsLoading(false);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const parseFromArrayBuffer = useCallback(async (arrayBuffer: ArrayBuffer): Promise<ParsedData> => {
    setIsLoading(true);
    setError(null);

    try {
      const parser = new ExcelParser();
      const result = await parser.parse(arrayBuffer);
      setIsLoading(false);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  return {
    parse,
    parseFromArrayBuffer,
    isLoading,
    error,
  };
};

