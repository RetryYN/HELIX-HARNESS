# HIL-FR-52/53・HOT-HIL-49 原子的確定と意味revision identityの限定監査

---
audit_id: HIL-FR52-53-ATOMIC-IDENTITY-AUDIT-2026-09-29
audit_status: bounded_static_audit
authority_effect: none
reviewed_main: 106567dba436ad9044935907418a65125be9bed4
scope: old HIL-FR-52/HIL-FR-53 and HOT-HIL-49; current HARNESS/OS L2/L11 and recorded PO revisions
excluded: legacy runtime execution; full FR51/FR52/FR53 closure; implementation or adoption claim
---

## 結論

旧HIL-FR-52とFR-53は一続きの「旧DB更新機能」ではない。FR-52は意味正本と追跡・projectionの**論理的な原子的確定と失敗時の非公開**、FR-53はpathや名前に依存しない**意味資産のidentity/revisionと履歴関係の維持**である。旧文面の`harness.db`は旧設計上のprojection名としてのみ扱う。現行DB、schema、runtimeの存在・再利用を意味しない。

現行OSには要求正本更新の広いL11案があり、stale base拒否、同一operation再送の二重revision防止、保存/projection失敗時の部分公開拒否を含む。従ってFR-52全体が欠落したとは言えない。一方、HOT-HIL-49の明示条件である**同じcommand identityに異payloadを再送する負例**と、複数の正本・追跡・projection各境界で失敗させたとき、いずれも部分更新をcurrentにしないことを示す一つの対応oracleは、確認した現行の採択対象から特定できなかった。

FR-53はHARNESS-L2-008/004に意味形成、identity、変更影響の一般条件がある。しかし、旧FR-53の全操作（rename/move/split/merge/supersede）でimmutable asset ID、authority、oracle、typed edgeを保持する受入caseは確認できなかった。HARNESS-L2-048は命名/safe rename候補に限定され、FR-53 line全体はsource holdingに明示的に未割当である。

## 原文とexact source

| 旧条件 | 出典と原文のdigest | 旧要件の意味 |
|---|---|---|
| HIL-FR-52 | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、[`infinity-loop-platform-requirements.md:142`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md#L142)。file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、line SHA-256 `c159d3113bc2719dd5f8492468407706c2d79978942aa8f0cf96bccc6936fda8`。 | Markdown、asset revision、event ledger、trace、impact、stale propagation、旧`harness.db` projection、receiptを一操作で原子的に更新。部分成功をcanonicalとして公開せず、command冪等性とbase revision CASを適用。 |
| HIL-FR-53 | 同上 `:143`。line SHA-256 `03477c17a85c420a3f9fab3ba48d8cc905cbc8dc6bb7160b51d9fd52a5bc9c89`。 | path/name非依存のimmutable asset ID、意味変更ごとの新revision。rename/move/split/merge/supersede後も履歴・authority・oracle・typed edgeを保持。 |
| HOT-HIL-49 | `LEGACY-ASSET-AFE91778057B7E76BEEC`、[`L1-infinity-loop-operational-test-design.md:76`](../../../../archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md#L76)。file SHA-256 `4f8f67664e360dcb8b40f9c834953d026c9bf3b359a79a64e68fa2296689e576`、line SHA-256 `fe4a8d1f7752a6d2cea666b009d17b5982c8368a04c117a93cef521c938c5ce3`。 | Markdown/DB/receipt各段へのfault、rename/split/merge、stale baseを与え、部分currentゼロ、同一command冪等、異payload conflict、identity/authority/oracle/typed edge保持を証明。 |

旧sourceは設計要求とtest-designである。これらの文言を確認するため旧test/runtime/`harness.db`を実行していない。

## 現行責務・authorityとの照合

| 現行境界 | 確認できた範囲 | この監査で扱わないこと |
|---|---|---|
| HELIX-HARNESS意味責務 | 採択済みHARNESS-L2-008は要求候補の意味差分・形成、人の合意境界、unit/connection/composite identityを扱う。L11には単体/接続/構成体の義務、identity、Backflow、影響伝播などの例がある（[L2](../../../../docs/helix-harness/L2-requirements/product-requirements.md)、[L11](../../../../docs/helix-harness/L11-acceptance/product-acceptance.md)）。採択対象は2026-09-28の[HARNESS判断記録](../../decisions/helix-harness-requirements-po-decision-2026-09-28.md)が固定した`f6dad2a...`のL2/L11と明示候補集合。 | unit/connection/composite identityを、path非依存の全資産identityやsplit/merge lineageと同一視しない。 |
| HARNESS-L2-048 | [`product-requirements.md:1055-1064`](../../../../docs/helix-harness/L2-requirements/product-requirements.md#L1055)は未採択のO9命名/safe rename候補。直接入力は選択spanであり、FR-53 line 143を含む15 full linesと残余をsource holdingへ残すと明記する。holding receiptの[`O9-HOLD…L0143`](../../../../docs/governance/audits/requirement-registration/ops-o9-naming-source-holding-lines-2026-09-29.jsonl)は`candidate_input:false`、`source_preserved_unassigned`。 | この候補をFR-53の後継、または全rename/split/merge lifecycleの被覆とは数えない。 |
| HELIX-OS authority/運転 | 採択済みOS-L2-001/002/007/009の範囲には正本・revision、event/provenance、durable projection、継続・復旧の責務がある。OS L2の「要求正本を更新する管理条件」([L2:515-527](../../../../docs/helix-os/L2-requirements/governance-requirements.md#L515))は更新範囲・policy/scope、原子的確定、stale base、再実行、旧版保護を記述する。L11の「要求正本更新の受入」([L11:241-253](../../../../docs/helix-os/L11-acceptance/governance-acceptance.md#L241))は保存/projection失敗、同一operation再送、競合base、source-to-receipt追跡を列挙する。OS L2/L11の固定baselineは[OS判断記録](../../decisions/helix-os-requirements-po-decision-2026-09-28.md)の`f6dad2a...`対象bytes。 | OSに要求意味の採否やHARNESS canonicalization/admissionを移さない。一般要求更新条件を、FR-52の各artifact境界の個別証明済み結果とはみなさない。 |
| HELIXOS-L2-038 | `MPR-RC-HELIXOS-L2-038-001`は2026-09-29判断表([57候補判断:61](../../decisions/po-decision-2026-09-29-57candidates.md#L61))で採択。ただし本文はlayer-ledger契約に従うwriter/snapshot/proposal appendを対象とし、HARNESSのlayer意味を決めず、FR-46/47運転・保存の限定再導出である。 | ledger writer候補の異payload conflict/冪等条件を、要求canonicalizationの全artifact transactionへ一般化しない。 |

Decision recordが与えるのは列挙したexact revisionへの合意であり、後続候補や旧FR-52/53の自動採択ではない。OSの要求更新L11にはFR-52と強く重なる条件が現に存在するため、本所見は「原子的更新要求が無い」ではなく、HOT-HIL-49との具体的なcase対応が明示されないことに限定する。

## 残るoracleの弱さ

| 観点 | 現在の最も近い条件 | 未確認の反例・弱さ |
|---|---|---|
| FR-52：異payload conflict | OS L11は同じoperationの再送による二重revision防止と競合base拒否を要求する。OS-L2-038-001も同一proposal/correlation IDのpayload/base不一致をconflictとするが、対象はlayer-ledger append。 | canonical更新の同一command IDへ**異なるsemantic payload**を与えたとき、先行のcanonical state/receiptを変えずconflictに止めるnegative fixtureが、採択済み対象の受入文に見当たらない。 |
| FR-52：全境界の原子性 | OS L11は保存/projection失敗時の部分的な新旧混在を現行正本として提示しない条件を持つ。 | 旧HOT-HIL-49が指定するMarkdown・revision・event/trace/impact/stale・projection・receiptを責務別に故障させ、各失敗で「currentの部分更新0」「失敗位置/復旧先/未完義務あり」を示す網羅的な受入対応表はない。旧DBを現行schemaと仮定する必要はなく、現行のartifact境界へ写像して試験できる。 |
| FR-53：identity lineage | HARNESS L2/L11には要求identity、oracle identity維持、Backflow/impactの一般条件がある。 | rename/moveでは同一immutable asset IDの維持、split/merge/supersedeではsourceとsuccessorのtyped relation・意味revision・authority/oracle履歴のいずれかを欠落させたnegative caseが特定できない。FR-53原文自体は048のsource holdingに未割当。 |

## 最小の候補化範囲と判断要否

次の要求整理ではFR-52とFR-53を一つのDB transaction要求にまとめず、HARNESSの意味責務とOSの記録/投影責務に分けた対L2/L11候補として照合する。既存の意味を保つ場合の最小範囲は次のとおり。

1. **FR-52 acceptance補完**：現行正本更新のartifact/owner境界（HARNESSのcanonical意味、OSのevent/projection/receipt等）とbase revisionを固定する。各境界のfault case、同一command+同一payloadの冪等、同一command+異payloadのconflict、stale base拒否を個別に与え、どの経路でも部分currentを0にする。成功receiptは対象revision、変更前後、更新されたrelationと失敗/rollback履歴へ辿る。`harness.db`を現行技術名として採用しない。
2. **FR-53 acceptance補完**：asset IDと意味revisionをpath/locationから分離する。rename/moveでidentityを維持し、split/merge/supersedeで親子/置換の型付き履歴を残す。authority、oracle、source、下流影響のどれかを落としたfixtureを不成立にし、意味の変更や上流authorityが必要な変更は既存ownerへ戻す。

この監査と候補起草でPOへの追加質問は不要。既存PO判断を変えず、旧条件の保持と受入oracleを具体化するだけなら、その候補化を進められる。**人が決めるべきなのは**、改訂でasset identityの意味やsplit/merge時の意味所有を変える場合、またはHARNESS/OSのauthority・所有境界を変更する場合である。その場合は、該当旧原文、選択肢、推奨、影響要求を添えた対象revision付き判断に限定し、旧実装の有無を根拠にしない。

推奨は、FR-52のatomicityを「旧DBを復活させる」ことではなく現行の論理artifact群の不完全公開防止として保持し、FR-53は不変identityと変更関係を別の意味契約として保持すること。候補を置いただけでPO採択、実装許可、受入実行、要求ステージ完了とはしない。

## 検証範囲と未完了

- 旧source、L2/L11、PO判断、source-holding/receiptとの参照を静的に照合した。旧test、旧CLI、旧runtime、旧DBは起動していない。
- この文書は限定監査であり、HIL-FR-51、FR-52/53の全条件、HIL-NFR-31/32、legacy IR/source全量、実装consumer、稼働中の原子性、全旧要求の無損失closureを証明しない。
- 本文・要求登録receipt・候補PRは追加していない。`authority_effect: none`。
