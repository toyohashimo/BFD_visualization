import { useSensors, useSensor, PointerSensor, KeyboardSensor, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCallback } from 'react';

/**
 * ドラッグ&ドロップ機能フック
 */
export const useDragAndDrop = (
  selectedBrands: string[],
  selectedSegments: string[],
  setSelectedBrands: (brands: string[]) => void,
  setSelectedSegments: (segments: string[]) => void
) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // ドラッグしているのがブランドかセグメントかを判定
      const isBrand = selectedBrands.includes(active.id as string);
      const isSegment = selectedSegments.includes(active.id as string);

      if (isBrand) {
        setSelectedBrands(
          arrayMove(
            selectedBrands,
            selectedBrands.indexOf(active.id as string),
            selectedBrands.indexOf(over.id as string)
          )
        );
      } else if (isSegment) {
        setSelectedSegments(
          arrayMove(
            selectedSegments,
            selectedSegments.indexOf(active.id as string),
            selectedSegments.indexOf(over.id as string)
          )
        );
      }
    }
  }, [selectedBrands, selectedSegments, setSelectedBrands, setSelectedSegments]);

  return {
    sensors,
    handleDragEnd,
  };
};

