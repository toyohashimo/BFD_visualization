import { useEffect, useState, useRef } from 'react';

/**
 * 配列の内容が実際に変更されたかを判定するヘルパー関数
 */
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

/**
 * ブランドとセグメントの色インデックス管理フック
 */
export const useColorMapping = (
  selectedBrands: string[],
  selectedSegments: string[]
) => {
  const [brandColorIndices, setBrandColorIndices] = useState<Record<string, number>>({});
  const [segmentColorIndices, setSegmentColorIndices] = useState<Record<string, number>>({});
  
  // 前回の配列を保存
  const prevBrandsRef = useRef<string[]>([]);
  const prevSegmentsRef = useRef<string[]>([]);

  // ブランドの色インデックス管理
  useEffect(() => {
    // 配列の内容が実際に変わっていない場合はスキップ
    if (arraysEqual(prevBrandsRef.current, selectedBrands)) {
      return;
    }
    
    prevBrandsRef.current = selectedBrands;
    
    setBrandColorIndices(prev => {
      const currentBrandsSet = new Set(selectedBrands);
      const next = { ...prev };
      let hasChanges = false;

      // 削除されたブランドのインデックスを削除
      Object.keys(next).forEach(key => {
        if (!currentBrandsSet.has(key)) {
          delete next[key];
          hasChanges = true;
        }
      });

      // 新しく追加されたブランドにインデックスを割り当て
      const usedIndices = new Set(Object.values(next));
      selectedBrands.forEach(brand => {
        if (next[brand] === undefined) {
          let i = 0;
          while (usedIndices.has(i)) i++;
          next[brand] = i;
          usedIndices.add(i);
          hasChanges = true;
        }
      });

      // 変更があった場合のみ新しいオブジェクトを返す
      return hasChanges ? next : prev;
    });
  }, [selectedBrands]);

  // セグメントの色インデックス管理
  useEffect(() => {
    // 配列の内容が実際に変わっていない場合はスキップ
    if (arraysEqual(prevSegmentsRef.current, selectedSegments)) {
      return;
    }
    
    prevSegmentsRef.current = selectedSegments;
    
    setSegmentColorIndices(prev => {
      const currentSegmentsSet = new Set(selectedSegments);
      const next = { ...prev };
      let hasChanges = false;

      Object.keys(next).forEach(key => {
        if (!currentSegmentsSet.has(key)) {
          delete next[key];
          hasChanges = true;
        }
      });

      const usedIndices = new Set(Object.values(next));
      selectedSegments.forEach(seg => {
        if (next[seg] === undefined) {
          let i = 0;
          while (usedIndices.has(i)) i++;
          next[seg] = i;
          usedIndices.add(i);
          hasChanges = true;
        }
      });

      // 変更があった場合のみ新しいオブジェクトを返す
      return hasChanges ? next : prev;
    });
  }, [selectedSegments]);

  return {
    brandColorIndices,
    segmentColorIndices,
  };
};

