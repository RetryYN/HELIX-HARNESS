# PHCAP-02 要求原登録：初期台帳と採択済み要求の状態差分

監査日: 2026-09-28。対象は手順5の旧→新デグレ照合におけるPHCAP-02の**要求authorityと能力実体の区別**である。本書は初期台帳の固定時点を改変せず、後続の判断が生じた差分を記録する。要求採択を実装、受入実行、旧資産のretire、phase全体の回復へ変換しない。

## 旧条件と初期台帳

[初期inventory JSON](../../phase-capability-inventory.json)（file SHA-256 `16deda553e0d5c1d0b8b037c68301bc4f80967305d64b7e4b99f3178b040bfe4`、130–178行）の`PHCAP-02.gaps`は「正式L2/L11、L3/L10、永続化・再開契約が未成立」と記す。同じ[Markdown台帳](../../phase-capability-inventory.md)（file SHA-256 `2a49a7eb85b4a7397c325b84cf38984603a37014a415c4921363592208aa05dc`、40行）は`candidate_with_partial_current_registry`・`degraded_to_candidate_and_static_registry`と要約する。両者は2026-09-20のinitial_inventoryと固定current evidence snapshotを表し、後日のPO判断を取り込んだ現在状態ではない。

旧PHCAP-02代表の[requirement discovery event projection](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/requirement-discovery-event-projection.md)（`LEGACY-ASSET-3DED4B36AC6A8AD9A68C`、file SHA-256 `58daba2ec78e51651a7d4e46d1b900115273c55ba7a0dd772dee221caaf18ce4`、16–23・27–50行）は原eventからnoncanonical projectionを再構成する境界である。[既存の条件別監査](phcap18-condition-recovery-audit-2026-09-28.md)の02行はこの代表条件と旧testを部分回復・consumer未閉包として扱う。

追加確認した旧[Design Registry requirement family authority](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/design-registry-requirement-family-authority.md)（file SHA-256 `4f75f1fb5d285daaa582b2e4cbc016d8679d9e2364f60cc152dac3f5dece71ae`、55–58・69・80行）の`HR-FR-DHR-012`／`HR-AC-DHR-012`は、恒久family認識と暫定catalog loader・`screens`／`screen_trace` adapterを分離し、旧#257到達後に残留adapterを拒否する限定的なlifecycle fenceである。旧[negative test](../../../../archive/legacy-generation-2026-09-14/root/tests/requirement-intake-lifecycle.test.ts)（`LEGACY-ASSET-4DF51DE06C57917FEA9C`、file SHA-256 `0b2feae2467127f58e550241bc802d36b4b6487a772e2ccd610c07bc915ec817`、30–80行）は読んだだけで実行していない。旧#257のexact symbol inventoryとscreen adapter撤去を、現在のPHCAP-02全体の要件や完了oracleに読み替えない。

## 現在の判断と判定

| 条件 | 現在の根拠 | PHCAP-02への判定 |
|---|---|---|
| 原event・sourceと要求authorityの登録 | [OSのPO判断](../../decisions/helix-os-requirements-po-decision-2026-09-28.md)27–33・46–59行は固定L2/L11本文と`HELIXOS-L2-015/019`を採用した。[OS L2](../../../helix-os/L2-requirements/governance-requirements.md)642–650・682–690行、[対L11](../../../helix-os/L11-acceptance/governance-acceptance.md)324–329・352–357行は、原event保持、source/revision/digest、訂正、projectionとauthorityの分離、重複・stale・拒否・未実行の識別、失敗時の再構築を要求する。 | 初期`gaps`の「正式L2/L11未成立」は**現在の要求authorityについては失効**。ただし旧event projection実装の移植・動作同等性やPHCAP-02全条件の被覆は証明しない。 |
| 要求形成との接続 | [HARNESSのPO判断](../../decisions/helix-harness-requirements-po-decision-2026-09-28.md)25–31・42行は固定L2/L11と`HARNESS-L2-013`を採用した。[HARNESS L2](../../../helix-harness/L2-requirements/product-requirements.md)371–377行と[対L11](../../../helix-harness/L11-acceptance/product-acceptance.md)208行は、指示・根拠から要求対を形成し、人の承認待ちに渡す。 | 原登録の管理主体はOS、要求形成はHARNESSである。HARNESSの候補出力をOSのauthorityや実行許可に昇格させない。 |
| 旧lifecycle fenceと下流能力 | 旧`HR-FR/AC-DHR-012`はscreen adapterの固有cutoverであり、現行015/019の受入は旧#257のadapter撤去を要求していない。OS判断56–59行は旧未解決atomを維持し、L3/実装を許可しない。 | 旧fenceは直接の現行successor・consumer closureを未確認とする。PHCAP-02固有のL3/L10、永続化・再開の実装と受入実行も未成立。 |

したがって現在の短い判定は、**採択済みL2/L11要求には対応条項があるが、phase能力は部分回復のまま**である。initial_inventoryの`current.status`・旧`implemented_with_tests`・`transition_assessment`を、要求採択だけで実装完了へ書き換えない。次の条件別照合では旧原文の未被覆条件と旧consumerの所在を別に検証する。今回の差分から新要求、旧adapter実行、旧test/CI合格、POの新しい選択肢は生成しない。
