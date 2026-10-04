# HARNESS Stage 1 L3/L10確認資料（2026-10-05）

本文revision `84a36807c112b038ed7374de1de94b513ce08691`。3採択親010/011/023、6文書231行。独立review前・L3未承認・L10未実行。local準備段階です。

能力を交換・更新できるパックとして識別し、画面や作業環境へ依存せず宣言契約で呼び出し、利用条件ごとに必要な依存を判定する要件案です。パックの版と上位構成の版を分け、単体の成功から上位の成立を生成しません。未選択の入力元は未観測とし、安全条件を省略しません。有効な既決権限を再利用し、通常作業の追加人間承認を作りません。

同じ入力・版の成果物差分0、対象外パックの変更0、同じキーの追加効果0、期限切れの成功0、依存判定の再評価差分0を技術候補として検証します。期限の等号扱いは既存契約を優先し、未定義なら比較案を合成入力で評価します。D1〜D12は依存の状態・暗黙fallback拒否・明示再選択を区別する有限の検証候補で、実装方式を決めません。必要な技術値はL3で根拠付き候補へ起草し、parameterごとのPO確認はしません。

固定L2/L11の意味・範囲・担当・版を保持しました。旧L3のFR+ACと3区分を起点に、旧の具体的gate・CLI・runtime・数値は現行へ継承しません。旧FRSは隣接根拠でありauthorityではありません。

|正本|SHA-256|
|---|---|
|`docs/helix-harness/L3-requirements/functional-requirements.md`|`4c585e5581fadc2d79f2dcdc07656d8b3d9741dad9de8a46733f474fc4565ab4`|
|`docs/helix-harness/L3-requirements/business-requirements.md`|`b4747c9ee35dfa3b230e4c71dee7657397f2cb6241f48f8eea56aa56cf93a88e`|
|`docs/helix-harness/L3-requirements/nfr-grade.md`|`d2b92f8826a151e9cdec766b61772c2ff7c3b35cfaa1437e4ab83bcb938618e2`|
|`docs/helix-harness/L10-verification/functional-verification.md`|`39fa4ca31a4920e2540170525f5258a15b4cb9c6aa29939f20ef51a57818b227`|
|`docs/helix-harness/L10-verification/business-verification.md`|`f90f65b9544a1fdab5bf469e099027b5871773e9e95cdd85f5ce76262af676ff`|
|`docs/helix-harness/L10-verification/nfr-verification.md`|`230afe80078871bd88f8846137fcf9164cc2f506b82236fdc653f59a3d6575b7`|

3親の固定source全条件と個別AC/CASEの独立照合、旧sourceの対応分類・監査の全項目照合が残ります。#2564の旧reviewから合格を継承せず、新PRのexact HEADへ依頼します。POへは独立review結果後に判断を提示します。
