# 課題
jestで単体テストを書こう 課題4

## 課題4-1
- issue4_functions.tsに関数を作成しました（Pythonで書いたものをAIにTypeScriptへ変換してもらいました）
- getEarthquakeData()はparseCoordinates()に依存しています

## 課題4-2
jestに関するクイズ
- jest.useFakeTimers()は何のために使用されますか？
  - 指定した時間が経過した後に動く関数の実際のタイマーを、偽のタイマーに置き換えるため
- toHaveBeenCalledWith()とtoHaveBeenCalled()の違いは何ですか？
  - toHaveBeenCalledWith()、、、モック関数が指定した引数で呼び出されたことを確認する
  - toHaveBeenCalled()、、、モック関数が呼び出されたことだけを確認する
- Jest実行時、NODE_ENVの値はどうなりますか？
  - testになる