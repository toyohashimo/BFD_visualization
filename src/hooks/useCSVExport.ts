import { useCallback } from 'react';
import { ChartDataPoint, AnalysisMode, SheetData, FunnelMetrics } from '../types';
import { MESSAGES } from '../config/constants';
import { formatSegmentName } from '../utils/formatters';

/**
 * CSVエクスポートフック
 */
export const useCSVExport = (
  data: SheetData,
  analysisMode: AnalysisMode,
  sheet: string,
  targetBrand: string,
  selectedBrands: string[],
  selectedSegments: string[],
  selectedItem: keyof FunnelMetrics | string,
  getBrandName: (brand: string) => string
) => {
  const exportCSV = useCallback(() => {
    if (!data || Object.keys(data).length === 0) {
      alert(MESSAGES.ERROR.NO_DATA_TO_EXPORT);
      return;
    }

    // チェック処理
    if (analysisMode === 'segment_x_multi_brand' || analysisMode === 'item_x_multi_brand') {
      if (selectedBrands.length === 0) {
        alert(MESSAGES.ERROR.NO_BRANDS_SELECTED);
        return;
      }
      if (selectedSegments.length === 0) {
        alert(MESSAGES.ERROR.NO_SEGMENTS_SELECTED);
        return;
      }
    } else {
      if (selectedSegments.length === 0) {
        alert(MESSAGES.ERROR.NO_SEGMENTS_SELECTED);
        return;
      }
    }

    let csvContent = '\ufeff';

    // Mode 3: item_x_multi_brand
    if (analysisMode === 'item_x_multi_brand') {
      csvContent += '名称';
      selectedSegments.forEach(seg => {
        const displaySegName = formatSegmentName(seg);
        csvContent += `,\"${displaySegName}\"`;
      });
      csvContent += '\n';

      selectedBrands.forEach(brand => {
        const displayBrandName = getBrandName(brand);
        csvContent += `\"${displayBrandName}\"`;

        selectedSegments.forEach(seg => {
          const d = data[seg]?.[brand];
          if (d) {
            csvContent += `,${d[selectedItem as keyof FunnelMetrics]}`;
          } else {
            csvContent += ',0';
          }
        });
        csvContent += '\n';
      });
    }
    // Mode 1: segment_x_multi_brand
    else if (analysisMode === 'segment_x_multi_brand') {
      csvContent +=
        '名称,認知あり(TOP2),興味あり(TOP2),好意あり(TOP2),購入・利用意向あり(TOP2),購入・利用経験あり(TOP5),リピート意向あり(TOP2)\n';

      const sheetData = data[sheet];
      selectedBrands.forEach((brand) => {
        const d = sheetData[brand];
        const displayBrandName = getBrandName(brand);
        if (d) {
          csvContent += `\"${displayBrandName}\",${d.FT},${d.FW},${d.FZ},${d.GC},${d.GJ},${d.GL}\n`;
        }
      });
    }
    // Mode 2 & 4: brand_x_multi_segment
    else {
      csvContent +=
        '名称,認知あり(TOP2),興味あり(TOP2),好意あり(TOP2),購入・利用意向あり(TOP2),購入・利用経験あり(TOP5),リピート意向あり(TOP2)\n';

      selectedSegments.forEach((seg) => {
        const d = data[seg]?.[targetBrand];
        const displaySegName = formatSegmentName(seg);
        if (d) {
          csvContent += `\"${displaySegName}\",${d.FT},${d.FW},${d.FZ},${d.GC},${d.GJ},${d.GL}\n`;
        }
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    link.setAttribute('download', `funnel_analysis_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data, analysisMode, selectedBrands, selectedSegments, targetBrand, selectedItem, sheet, getBrandName]);

  return {
    exportCSV,
  };
};

