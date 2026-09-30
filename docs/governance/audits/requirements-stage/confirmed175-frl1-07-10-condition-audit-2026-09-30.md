# confirmed175 FR-L1-07〜10 旧→新条件監査（2026-09-30）

## 範囲と基準

confirmed175から、旧HARNESS L1のFR-L1-07〜10（旧source物理行38〜41）の4 identityだけを抽出した静的条件監査。旧sourceは `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md`、asset `LEGACY-ASSET-6B6C5CB0E481BE01088B`。source file SHA-256は `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`。各行の原文とline SHA-256は併設JSONに記録した。

現行対象はPO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のHARNESS/OS/SECURITY L2と対L11。PO判断記録でこのrevisionの各要求一式が合意され、OS L2-017〜023とSECURITY L2-007〜009を含む明示候補集合が採用されている。各ファイルの固定SHA-256はJSONに記録した。現行candidate contextは product-routing candidate ledger の該当4行を別に読んだ。

旧asset ledger上の処置は `source_snapshot_preservation`、target authorityは `draft_candidate`、carry stateは `preserved_pending_rehome`。4 identityはいずれも `successor_requirement_ids: []` のままである。従って以下の「関連」は条件の一部を扱う採択pairとの照合であり、formal successor、identity単位closure、実装採用を意味しない。

## 条件別照合

| 旧identity / 行 | 旧条件の焦点 | 関係する採択済みL2/L11 pair | 照合結果 |
|---|---|---|---|
| FR-L1-07 / 38 | 5種類のproject実行eventからstateを自動登録。別系統でsession hookをfail-open記録しPLAN digest化。forced-stop推定と人間起票条件。 | HELIXOS-L2-019 / L11-019 | event/source revision/provenance、訂正履歴、重複・stale・拒否・未実行の識別、失敗時再構築と未完義務保持は関連条件として確認。5 eventの自動登録と手動漏れ排除、fail-open session logging/digest、forced-stop heuristicと人間起票条件はこのpairにない。**部分対応**。 |
| FR-L1-08 / 39 | drift・劣化・暴走・障害をRecovery・Incident・Reverse・Refactorへ自動routingし、drive判定も入力にする。 | HELIXOS-L2-017 / L11-017、HELIXOS-L2-022 / L11-022、HARNESS-L2-003 / L11-003、HARNESS-L2-004 / L11-004 | ticket/workflow、観測から候補・判断・ticket・変更/検証・再観測への還流、工程条件・変更影響・差戻しは関連する。一方、triggerからmodeへの完全表とoracle、FR-L1-41 drive判定、自動発動authority、routing失敗・unknown時の具体結果は固定pairにない。**部分対応**。 |
| FR-L1-09 / 40 | agent_mandatory監査、budget上限、gate fail-close、lockによる逸脱警告・停止・audit log。 | HELIXOS-L2-018 / L11-018、HELIXSECURITY-L2-007 / L11-007、HELIXSECURITY-L2-008 / L11-008、HELIXSECURITY-L2-009 / L11-009 | OS pairのassignment/attempt/budget/scope、停止・隔離・handoff、SECURITY pairの実行制約、操作別authority、revoke/quarantine伝播は関連条件として確認。agent_mandatory auditの意味、budgetの正確な計上/上限oracle、旧lockのscope/lifecycleを同値に定めるpairはない。**部分対応**。 |
| FR-L1-10 / 41 | 再開point・認識訂正履歴・cutover rollback。Recovery PLANの7節、hotfix postmortem/Branch Protection、lock/job queue/rollback/cutover rehearsalの適用条件。 | HELIXOS-L2-019 / L11-019、HELIXOS-L2-023 / L11-023、HELIXSECURITY-L2-009 / L11-009、HARNESS-L2-003 / L11-003、HARNESS-L2-004 / L11-004 | checkpoint/訂正履歴/continuity、handoff、停止伝播、再開/backflow/影響条件は関連する。7節Recovery PLAN oracle、cutover_orchestrator rollback、hotfix branch-protection binding、release-hardening適用条件は固定pairにない。**部分対応**。 |

## 現行candidate contextと境界

product-routing candidate ledgerは、FR-L1-07をOS単独候補、FR-L1-08をHARNESS/OS分割候補、FR-L1-09をOS単独候補、FR-L1-10をHARNESS/OS分割候補としている。各行に `successor_assignment_status: unassigned`、`authority_effect: none` が記録されている。旧hook列挙/fail-open・fail-close binding、detectorと自動発動authority、旧guard方式、旧orchestrator/rollback/branch-protection bindingは未解決または採用対象外と記録されており、本監査でも追加確定していない。

全4行の監査判定は部分対応で、残条件あり。旧identityの意味変更・retire等のauthorityは既存の人間decision境界に従う。PO固定L2/L11の合意、candidate routing、旧sourceの保全からformal successor・旧要求closure・実装/実行受入を生成しない。`authority_effect: none`。

## 静的照合

旧sourceの行38〜41とcarry-forward ledgerのline text/SHAを照合し、asset ledgerの同一source digest・preservation処置を確認した。confirmed175 full auditの既存relation、PO固定L2/L11の対象revision digestと各条件行、4件のproduct-routing candidate行を確認した。旧workflow、hook、CLI、runtime、test、CIは実行していない。監査JSONは同じ4件の原文、line SHA、pair refs、現行candidate状態、file SHAを保持する。
