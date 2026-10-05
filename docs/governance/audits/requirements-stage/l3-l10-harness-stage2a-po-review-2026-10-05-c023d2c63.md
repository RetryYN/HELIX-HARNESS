# HARNESS Stage 2a L3/L10確認資料（2026-10-05）

本文revision `c023d2c6394e0cf21b35c2be84a7e09b53430630`。採択親HARNESS-L2-022一件、6正本文書への74行追補。未承認・未実行。

コアの共通契約として、Integrated、Verified、Acceptedを段階別の証拠で区別する案です。下位の証明で上位の証明を代用せず、L11内容判定と同じrevision/scopeへの利用者受入記録を別々に確認します。外部成果物にも同じ契約を適用し、証明できた段階だけを持ち込みます。

HARNESSは照合と戻し先の契約を持ち、HELIX内の実行・ticket・検収はOS、利用者環境では利用者手段が担います。④やOSを利用者の必須依存にしません。意味を保つ不一致は同じ段階でRefactorし、意味変更が必要なら所有する左側へ戻します。

必要trace coverage 100%・未解消必須不一致0を技術候補として測定します。FR/ACとCASEは多対多の対応を許します。旧L3要件・対検証を起点に項目別の再利用・再導出・置換を記録し、旧pair番号の食い違いと固定親外の判断を明示しました。

|正本|SHA-256|
|---|---|
|`docs/helix-harness/L3-requirements/functional-requirements.md`|`429ab6bdbea2a73c6986fd4187bff5533aac027caec83ce2bb20bf3992cd5ca8`|
|`docs/helix-harness/L3-requirements/business-requirements.md`|`7a9ada36f834ec3a6ae81eeae8ec0fa46d08fc08f98a55a6ea0adccbb0e582db`|
|`docs/helix-harness/L3-requirements/nfr-grade.md`|`a628c1b1c90515a64a3142a3ddfb156095812fe4cca1874ff5a1c3061b1e698a`|
|`docs/helix-harness/L10-verification/functional-verification.md`|`1078ab4687a8adcb6e70b088a11159e01b7c894303740cfdde966273eee2604d`|
|`docs/helix-harness/L10-verification/business-verification.md`|`ba10272edfc8d62c47d9e699a8bb47a8a3ac2a3a3da40c1ecbdc2c16139ffa2e`|
|`docs/helix-harness/L10-verification/nfr-verification.md`|`11563daab34d432cf592ccfc6ac2568ae210a8ae2c416a25c539335fb52bb7ed`|

静的記録は [l3-l10-harness-stage2a-static-validation-2026-10-05-c023d2c63.json](l3-l10-harness-stage2a-static-validation-2026-10-05-c023d2c63.json)。17 source pins・6 prefixを再照合済み。Stage1の未承認本文をauthorityにせず、今回の起草・静的検収から承認を生成しません。独立レビュー結果を添えて、この本文revisionのL3承認へ渡します。
