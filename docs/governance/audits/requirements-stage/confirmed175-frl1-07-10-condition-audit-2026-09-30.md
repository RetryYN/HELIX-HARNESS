# confirmed175 FR-L1-07〜10 旧→新条件監査（2026-09-30）

## 範囲と基準

confirmed175から、旧HARNESS L1のFR-L1-07〜10（旧source物理行38〜41）の4 identityだけを抽出した静的条件監査。旧sourceは `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md`、asset `LEGACY-ASSET-6B6C5CB0E481BE01088B`。source file SHA-256は `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`。各行の原文とline SHA-256は併設JSONに記録した。

このPRの比較baseは `942f2e985f3af161ea4027b1691659a436860bc2`。現行対象はPO固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のHARNESS/OS/SECURITY L2と対L11。PO判断記録でこのrevisionの各要求一式が合意され、OS L2-017〜023とSECURITY L2-007〜009を含む明示候補集合が採用されている。各ファイルの固定SHA-256はJSONに記録した。現行candidate contextは product-routing candidate ledger の該当4行を別に読んだ。

旧asset disposition ledgerの `disposition: source_snapshot_preservation`、`product_target: unresolved`、`source_authority_state: confirmed`、`target_authority_state: draft_candidate`、`carry_forward_state: preserved_pending_rehome`を確認した。同ledgerに`successor_requirement_ids`欄はない。4 identityのsuccessor未割当はconfirmed175 full auditのidentity行にある空配列を参照する。従って以下の「関連」は条件の一部を扱う採択pairとの照合であり、formal successor、identity単位closure、実装採用を意味しない。

## 既存FR-L1-07 scope frameとの関係

PR baseに既存の[FR-L1-07 event capture scope frame](fr-l1-07-event-capture-scope-frame-2026-09-29.md)（SHA-256 `ae948bacd04c0b4567f3bb1f3e0d4b0cdb019090ecbdeca0c2d407e7fa3a4ea8`）がある。先行frameはFR-L1-07のA/B/C atom境界、OS-019とのproducer欠落negative oracle案、PO判断境界を詳述する。本監査はFR-L1-07〜10を固定L2/L11 pairの条件ごとに並べ、FR-L1-07については採択済みOS-019に保持されるprovenance/reconstruction条件と、producer捕捉・session観測・forced-stopの未回復条件を要約して範囲を広げた。先行frameのnegative oracle案を現行義務へ採択せず、carry-forward、successor、authority状態も変更しない。

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

## 2026-09-29 PO採択pairによる別revision照合

固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の比較は維持し、後続の採択済みL2/L11を別revisionとして照合した。根拠は[2026-09-29 57-candidate PO decision](../../decisions/po-decision-2026-09-29-57candidates.md)（PR baseでのSHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、decision basis `c18969c73306f6ed4cc4b93249583cd7e5d9ff68`）。decisionはHARNESS-L2-042/対L11（MPR `MPR-RC-HARNESS-L2-042-001`、L2/L11 section SHA `7da6b339…68f34eb` / `3ba00726…df395f9`）とHELIXOS-L2-036/対L11（MPR `MPR-RC-HELIXOS-L2-036-001`、section SHA `82c3fc7c…94cb33b9` / `daec5fce…61bebc3`）を採択している。L2/L11本文には採択前の候補表示が固定bytesとして残るが、この対象revisionの状態はPO decision recordから読む。正確なfile SHAとsection SHAは併設JSONに固定した。

| 旧identity | 後続pair照合と残る境界 |
|---|---|
| FR-L1-07 | 両pairともイベント捕捉完全性・session記録・forced-stop分類を定めず、残差は残る。 |
| FR-L1-08 | HARNESS-042はDesign Refactor route、振る舞い/契約保持、feature追加のepisode分離、意味変更時Backflowを定めるため、そのroute意味を補う。全modeのsignal表・detector・自動routing authorityは依然ない。OS-036は選択済みRetrofit upgradeのpreflight順序だけで、mode選択を定めない。 |
| FR-L1-09 | いずれも旧agent guard、budget/lock oracleの条件を定めない。OS-036の既存SECURITY/Worker境界は一般guardの後継ではない。 |
| FR-L1-10 | OS-036はRetrofit upgradeの計画確定前preflightとapply時のcurrentnessを追加するが、Recovery/Incident/Deployのlock・job queue・rollback・postmortem・cutover rehearsal residualを閉じない。HARNESS-042もRecovery契約を定めない。 |

これはidentity別の後続pairへの部分照合であり、FR identityのsuccessor割当、旧条件の一括被覆、authority変更を生成しない。

## 静的照合

旧sourceの行38〜41とcarry-forward ledgerのline text/SHAを照合し、asset ledgerの同一source digest・preservation処置を確認した。confirmed175 full auditの既存relation、PO固定L2/L11の対象revision digestと各条件行、4件のproduct-routing candidate行を確認した。旧workflow、hook、CLI、runtime、test、CIは実行していない。監査JSONは同じ4件の原文、line SHA、pair refs、現行candidate状態、file SHAを保持する。

## 57件・11件の後続decision全identity screen

R2393-07の追加照合として、2026-09-29の57候補decisionの全57 identity（42採択・11条件付き採択・4保留）と、11候補decisionの全11 identity（表の10採択pairに加え、現revision未採択のHARNESS-L2-049）を、各L2条件と対のL11受入節の組で比較した。decision basisは57件が`c18969c73306f6ed4cc4b93249583cd7e5d9ff68`、11件が`909c8015326f35f8d42ce12e3c388923de411d1f`。decision record自体のPR-base SHA、全identity、採択処置、近接pairのregistration/file SHA/section digestは併設JSON `full_decision_set_screen` に列挙した。これは固定`f6dad2a33e24f000b87d7f09b8d40288257e74cc`比較を置き換えない。

意味上の近接候補として、HARNESS-034の計測契約はFR07の計測・証拠記録に、HARNESS-035とOS-035のPR event intakeはFR07のイベント捕捉に、OS-038/053はFR07/10の証拠追記・失敗隔離に、HARNESS-046とOS-037はFR08の工程/drift報告に、OS-043/046はFR09のWorker event・authority連続性に、OS-036はFR10の限定retrofit preflightに関係する。しかし、5イベント集合とsession hookの分離、signal-to-mode routing、旧agent guard/budget/lock、回復収束とcutover rollbackを定めないため、4 identityとも部分対応・残差ありを維持する。
