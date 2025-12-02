# DEMO Mode Restriction Feature

## Overview
Added functionality to restrict analysis modes 3-8 when Excel data is not loaded (DEMO mode).

## Implementation Details

### Modified File
- `components/Sidebar.tsx` (lines 233-252)

### Logic
```typescript
{ANALYSIS_MODE_ORDER.map((modeId, index) => {
    // モード3以降（index >= 2）はExcelデータがない場合に無効化
    const isDisabled = !isExcelData && index >= 2;
    return (
        <option 
            key={modeId} 
            value={modeId}
            disabled={isDisabled}
            style={isDisabled ? { color: '#9ca3af' } : undefined}
        >
            {index + 1}. {ANALYSIS_MODE_CONFIGS[modeId].name}
        </option>
    );
})}
```

### Key Points
- **Trigger Condition**: `!isExcelData && index >= 2`
  - `index >= 2` corresponds to modes 3-8 (array indices 2-7)
  - `!isExcelData` indicates DEMO mode (no Excel file loaded)
- **UI Effect**:
  - `disabled` attribute prevents selection
  - Gray color styling (`#9ca3af`) provides visual feedback
- **Auto-Enable**: All modes become available when Excel file is uploaded

## Rationale
- Modes 3-8 require more complex data that may not be properly represented in DEMO data
- This restriction ensures stable application behavior in DEMO mode
- Improves user experience by preventing  selection of potentially problematic modes

## Testing
Verified in both DEMO and EXCEL modes:
- ✅ DEMO mode: Modes 1-2 selectable, modes 3-8 grayed out
- ✅ EXCEL mode: All modes 1-8 selectable
- ✅ Screenshot evidence captured and saved to artifacts directory
