import html2canvas from 'html2canvas';
import { useCallback } from 'react';
import { MESSAGES } from '../config/constants';

/**
 * 画像エクスポートフック
 */
export const useImageExport = () => {
  const copyImage = useCallback(async (element: HTMLElement | null, isChart: boolean = true) => {
    if (!element) return;

    // AIサマリーボタンを一時的に非表示
    const aiSummaryButtons = element.querySelectorAll('.ai-summary-button');
    const originalStyles: Array<{ element: HTMLElement; display: string }> = [];
    
    aiSummaryButtons.forEach((button) => {
      const htmlButton = button as HTMLElement;
      originalStyles.push({
        element: htmlButton,
        display: htmlButton.style.display
      });
      htmlButton.style.display = 'none';
    });

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });

      return new Promise<void>((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert(isChart ? MESSAGES.SUCCESS.CHART_IMAGE_COPIED : MESSAGES.SUCCESS.COMBINED_IMAGE_COPIED);
            resolve();
          } catch (err) {
            console.error(err);
            alert(MESSAGES.WARNING.CLIPBOARD_COPY_FAILED);
            reject(err);
          } finally {
            // AIサマリーボタンを元に戻す
            originalStyles.forEach(({ element, display }) => {
              element.style.display = display;
            });
          }
        });
      });
    } catch (err) {
      console.error('Error capturing image:', err);
      alert(MESSAGES.WARNING.IMAGE_CAPTURE_FAILED);
      // エラー時もボタンを元に戻す
      originalStyles.forEach(({ element, display }) => {
        element.style.display = display;
      });
      throw err;
    }
  }, []);

  return {
    copyImage,
  };
};

