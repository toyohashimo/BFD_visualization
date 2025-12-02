import pandas as pd
import sys
import json

def read_excel_file(file_path):
    """Excelファイルを読み取り、内容を表示する"""
    try:
        # Excelファイルを読み込む
        excel_file = pd.ExcelFile(file_path)
        
        # シート名の一覧を取得
        sheet_names = excel_file.sheet_names
        print(f"シート数: {len(sheet_names)}")
        print(f"シート名: {sheet_names}")
        print("\n" + "="*80 + "\n")
        
        # 各シートの内容を読み取る
        result = {}
        for sheet_name in sheet_names:
            print(f"【シート名: {sheet_name}】")
            print("-" * 80)
            
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # データフレームの基本情報
            print(f"行数: {len(df)}, 列数: {len(df.columns)}")
            print(f"列名: {list(df.columns)[:10]}...")  # 最初の10列のみ表示
            print("\n最初の5行（最初の10列のみ）:")
            print(df.head(5).iloc[:, :10].to_string())
            print("\nデータ型（最初の10列）:")
            print(df.dtypes.head(10))
            print("\n" + "="*80 + "\n")
            
            # 結果を辞書に保存
            result[sheet_name] = {
                'rows': len(df),
                'columns': len(df.columns),
                'column_names': list(df.columns),
                'data': df.head(20).to_dict('records'),  # 最初の20行を保存
                'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()}
            }
        
        return result
        
    except Exception as e:
        print(f"エラーが発生しました: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    file_path = "public/sample_202406.xlsx"
    result = read_excel_file(file_path)
    
    if result:
        # JSON形式で結果を保存（必要に応じて）
        output_file = "excel_content_202406.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2, default=str)
        print(f"\n結果を {output_file} に保存しました。")

