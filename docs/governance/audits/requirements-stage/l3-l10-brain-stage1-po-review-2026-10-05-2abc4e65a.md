# HELIX-BRAIN Stage 1 L3/L10確認資料

対象本文revision: `2abc4e65aa69f67235eef7c32db7640b3aa17859`。状態：ローカル草稿・独立レビュー前・PO未承認。

対象は採択済み要求007（出所・根拠）、008（知識の版・状態）、028（知識packの互換適用）の3親だけです。由来と評価範囲から採用状態を辿り、製品が参照したexact版を保持し、共通packとBRAIN知識の版を別々に照合できる条件を具体化しました。LABO評価、OS登録、BRAIN独立検証・採否は別状態です。

候補値は、由来8項目の個別照合、列挙5状態の識別、誤昇格・暗黙置換・互換range外の誤受理0です。固定親の列挙fieldと明示否定を根拠に、各欠落・不一致を個別変異で観測する設計です。実績数、判定人数、保存期間の新しい必須値は加えていません。range内外の正常・否定例には宣言済み合成fixtureを用い、試験値を製品規則として採択しません。

L2の意味・範囲・担当・版を変えていません。旧HIL/MLP、distribution/SKAPP、WCCの対応箇所を比較し、由来・版の追跡と失敗類型のみ再導出しました。旧schema、runtime、閾値は移しません。独立business成果は固定親から導かれず、重複ACは作っていません。

6文書285行、3 FR・6 AC・22機能case・6 NFR候補を収録しています。未見正常例も同じACで照合します。文書の静的確認を行いましたが、実環境測定と独立レビューは未実施です。通常のL3承認前にClaudeのexact HEADレビューを行い、その結果と一緒にPOへ渡します。

静的監査: [l3-l10-brain-stage1-static-validation-2026-10-05-2abc4e65a.json](l3-l10-brain-stage1-static-validation-2026-10-05-2abc4e65a.json)（SHA-256 `5f9341c1a49701d3d84db7d6810413d407ba83c6ae43251e373b21dccda32700`）。

| 文書 | SHA-256 |
|---|---|
| `docs/helix-brain/L3-requirements/functional-requirements.md` | `80bd25cd2c9d9ded959fcf2c78b3c8fba2113dbb91ff6786c1e0190a3b47214e` |
| `docs/helix-brain/L3-requirements/business-requirements.md` | `98c768a580ea16fffb5c11dfaa6508c91e7dba6d6d55f8d097f540ff9092c264` |
| `docs/helix-brain/L3-requirements/nfr-grade.md` | `09878ecf16d69b3cabc1b1a7abf75acb4f40e905bc890d62de34401a996e2f8f` |
| `docs/helix-brain/L10-verification/functional-verification.md` | `73dbeab07048ed864c6f8e4c61aa09ba02d55ac7a19101acad4a498a15471607` |
| `docs/helix-brain/L10-verification/business-verification.md` | `bcbfcc99fb77b228ed8a0736b2a7ab13cb53642f8bc7535d1f0a4ae13832a148` |
| `docs/helix-brain/L10-verification/nfr-verification.md` | `57f38355aac100d99d06751cb7c26d88cc11d69d79f116c17a4619809d8ad0be` |
