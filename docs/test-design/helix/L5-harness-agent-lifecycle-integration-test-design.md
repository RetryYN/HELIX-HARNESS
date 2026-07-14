---
title: "HELIX L8 結合テスト設計 — harness agent lifecycle"
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-08
related_hst:
  - HST-HIL-006
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/design/helix/L5-detail/harness-agent-lifecycle.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-08
  - HAC-HIL-08a
  - HAC-HIL-08b
  - HAC-HIL-08c
---

# HELIX L8 結合テスト設計 — harness agent lifecycle

## §0 共通oracle

全caseは固定clock/ID、fixture registry、Claude/Codex fake adapter、isolated harness.db、controllable lease ownerを使い、
外部AI runtime、GitHub、networkを起動しない。registry/policy/generator version、task identity、layer、drive、task kind、pattern、
contract/team/context/adapter/event/checkpoint/result digest、lease/fenceを固定する。各caseは`HST-HIL-006`のexact assertionへ対応し、未実装である。

| ID | 前提／操作 | 期待結果／evidence | HAC | HST exact case | canonical failure | 対応するL5箇所 |
|---|---|---|---|---|---|---|
| `IT-AGLC-001` | eligible contractからmusterし、lease/run/checkpoint/completed/verification_pending/verified/releasedを順に実行 | 同一team digest、active lease最大1、valid receipt、released projectionをeventから再生成 | `HAC-HIL-08a`, `HAC-HIL-08c` | `HST-CASE-006-01` | `なし（正常系）` | `§4`, `§5`, `§6`, `§7` |
| `IT-AGLC-002` | registryとsealed expected receiptを残してClaude/Codex adapterを削除し再生成。別laneでcandidateを一byte変更 | 正常laneはexpected/candidate digest同一。mutation laneはResult failure、adapter publish/runtime execution 0 | `HAC-HIL-08a` | `HST-CASE-006-02`, `HST-CASE-006-21` | `なし（正常系）`; `HIL_AGENT_REGISTRY_NOT_REGENERABLE` | `§2`, `§3` |
| `IT-AGLC-003` | claim-blind verifier packetへauthor claim、chat自己評価、worker reasoningを個別混入 | 各入力でagent起動0、redacted finding、許可spec/artifact/oracleだけのpacketは通過 | `HAC-HIL-08b` | `HST-CASE-006-03` | `HIL_AGENT_BLIND_CONTEXT_LEAK` | `§1`, `§4` |
| `IT-AGLC-004` | 同instanceへ2 ownerが同時claim | CAS winnerだけactive、loser lease/event/instance増分0 | `HAC-HIL-08b` | `HST-CASE-006-04` | `HIL_AGENT_LEASE_ALREADY_ACTIVE` | `§5`, `§7` |
| `IT-AGLC-005` | expiry後tool、reassign後旧completion、旧agent tool/completion/resumeを実行 | 全旧操作のauthoritative増分0、各exact token、current owner/fence不変 | `HAC-HIL-08b`, `HAC-HIL-08c` | `HST-CASE-006-05`, `HST-CASE-006-06`, `HST-CASE-006-22` | `HIL_AGENT_LEASE_EXPIRED`; `HIL_AGENT_FENCING_REJECTED`; `HIL_AGENT_FENCING_VIOLATION` | `§5`, `§7` |
| `IT-AGLC-006` | durable checkpoint後crashし、staged/破損checkpointを混在させ新ownerでresume | current fenceの最大durableだけから再開、破損checkpointはresume 0 | `HAC-HIL-08c` | `HST-CASE-006-07` | `HIL_AGENT_CHECKPOINT_INVALID` | `§5`, `§7` |
| `IT-AGLC-007` | failed→verified、verification_pending→release、全stateの合法/違法順序を実行 | 違法遷移/releaseはstate増分0、合法graphだけ再生成可能 | `HAC-HIL-08b` | `HST-CASE-006-08`, `HST-CASE-006-09`, `HST-CASE-006-16` | `HIL_AGENT_STATE_TRANSITION_INVALID`; `HIL_AGENT_RELEASE_UNVERIFIED`; `HIL_AGENT_LIFECYCLE_INVALID` | `§5`, `§6` |
| `IT-AGLC-008` | worker/verifierを同一provider family、Codex worker=final verifierへ設定 | receipt採用、accept、releaseすべて0。別provider/roleだけ通過 | `HAC-HIL-08b` | `HST-CASE-006-10`, `HST-CASE-006-20` | `HIL_AGENT_VERIFIER_NOT_INDEPENDENT`; `HIL_ROLE_SEPARATION_VIOLATION` | `§4`, `§6` |
| `IT-AGLC-009` | retired contractをruntime cache/alias/旧teamからreclaim | eligible candidate/lease 0、retired event不変 | `HAC-HIL-08c` | `HST-CASE-006-11` | `HIL_AGENT_RETIRED_RECLAIM` | `§2`, `§6` |
| `IT-AGLC-010` | quarantined contractをapprovalなしで復帰し、承認済みsuperseding revisionも登録 | 同version復帰0、承認済み新versionだけeligible、履歴保持 | `HAC-HIL-08c` | `HST-CASE-006-12` | `HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED` | `§2`, `§6` |
| `IT-AGLC-011` | instance eventに欠番、重複operation、previous digest不一致を個別投入 | current projection更新0、正常event chainは同state/digestへ再生成 | `HAC-HIL-08a`, `HAC-HIL-08c` | `HST-CASE-006-13` | `HIL_AGENT_EVENT_SEQUENCE_INVALID` | `§5`, `§7` |
| `IT-AGLC-012` | 候補0、複数候補の二段resolve/self verify回避、同一inputのexpected musterに対するmember順/team digest mutationを別laneで実行 | 候補0と二段違反はready 0。mutationはcomparator Result failure、muster ready/lease/runtime execution 0 | `HAC-HIL-08a`, `HAC-HIL-08b` | `HST-CASE-006-14`, `HST-CASE-006-15`, `HST-CASE-006-19` | `HIL_AGENT_MUSTER_NO_ELIGIBLE`; `HIL_AGENT_MUSTER_NONDETERMINISTIC`; `HIL_MUSTER_RESOLUTION_INVALID` | `§2`, `§4` |
| `IT-AGLC-013` | contract必須field、schema/version、capability、policy、digestを一つずつ欠落/改変 | registry eligible/muster 0、全field errorを列挙 | `HAC-HIL-08b` | `HST-CASE-006-17` | `HIL_AGENT_CONTRACT_INCOMPLETE` | `§2`, `§8` |
| `IT-AGLC-014` | generated adapter手編集、marker削除、registry外adapter、別source digestを個別投入 | runtime execution 0、manual内容をregistryへ逆輸入せずdrift evidence | `HAC-HIL-08b` | `HST-CASE-006-18` | `HIL_AGENT_ADAPTER_DRIFT` | `§3`, `§8` |

| `IT-AGLC-015` | lease acquisitionのlease row/instance fence/event/projection/receiptと、checkpoint/result/verify/release/quarantine/retireの各appendへfault、旧fence、expired lease、stale head、同operation同digest／異digestを投入 | fault/fence/CAS失敗は当該transaction全write 0。同operation同digestはreceipt一件、異digestはconflict。immutable evidence reconcile後もlease/instance/event/projection/record headsが一致し、新lease/fenceを推測しない | `HAC-HIL-08b`, `HAC-HIL-08c` | supporting lifecycle transaction oracle | supporting | `§5`, `§6`, `§7` |

## §1 合否

### 主exact tuple oracle

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | 主IT結線 |
|---|---|---|---|---|
| `HST-CASE-006-01` | `mustered` | `verified` | `なし（正常系）` | `IT-AGLC-001` |
| `HST-CASE-006-02` | `adapter_missing` | `adapter_current` | `なし（正常系）` | `IT-AGLC-002` |
| `HST-CASE-006-03` | `selected` | `selected` | `HIL_AGENT_BLIND_CONTEXT_LEAK` | `IT-AGLC-003` |
| `HST-CASE-006-04` | `mustered` | `leased` | `HIL_AGENT_LEASE_ALREADY_ACTIVE` | `IT-AGLC-004` |
| `HST-CASE-006-05` | `running` | `running` | `HIL_AGENT_LEASE_EXPIRED` | `IT-AGLC-005` |
| `HST-CASE-006-06` | `running` | `running` | `HIL_AGENT_FENCING_REJECTED` | `IT-AGLC-005` |
| `HST-CASE-006-07` | `failed` | `failed` | `HIL_AGENT_CHECKPOINT_INVALID` | `IT-AGLC-006` |
| `HST-CASE-006-08` | `failed` | `failed` | `HIL_AGENT_STATE_TRANSITION_INVALID` | `IT-AGLC-007` |
| `HST-CASE-006-09` | `verification_pending` | `verification_pending` | `HIL_AGENT_RELEASE_UNVERIFIED` | `IT-AGLC-007` |
| `HST-CASE-006-10` | `planned` | `planned` | `HIL_AGENT_VERIFIER_NOT_INDEPENDENT` | `IT-AGLC-008` |
| `HST-CASE-006-11` | `retired` | `retired` | `HIL_AGENT_RETIRED_RECLAIM` | `IT-AGLC-009` |
| `HST-CASE-006-12` | `quarantined` | `quarantined` | `HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED` | `IT-AGLC-010` |
| `HST-CASE-006-13` | `running` | `running` | `HIL_AGENT_EVENT_SEQUENCE_INVALID` | `IT-AGLC-011` |
| `HST-CASE-006-14` | `planned` | `planned` | `HIL_AGENT_MUSTER_NO_ELIGIBLE` | `IT-AGLC-012` |
| `HST-CASE-006-15` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_MUSTER_NONDETERMINISTIC` | `IT-AGLC-012` |
| `HST-CASE-006-16` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_LIFECYCLE_INVALID` | `IT-AGLC-007` |
| `HST-CASE-006-17` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_CONTRACT_INCOMPLETE` | `IT-AGLC-013` |
| `HST-CASE-006-18` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_ADAPTER_DRIFT` | `IT-AGLC-014` |
| `HST-CASE-006-19` | `assertion_input_ready` | `assertion_pass` | `HIL_MUSTER_RESOLUTION_INVALID` | `IT-AGLC-012` |
| `HST-CASE-006-20` | `assertion_input_ready` | `assertion_pass` | `HIL_ROLE_SEPARATION_VIOLATION` | `IT-AGLC-008` |
| `HST-CASE-006-21` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_REGISTRY_NOT_REGENERABLE` | `IT-AGLC-002` |
| `HST-CASE-006-22` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_FENCING_VIOLATION` | `IT-AGLC-005` |

`IT-AGLC-001`から`IT-AGLC-014`の14件すべてで、対応する22 HST case、HAC、canonical failure、state transition、
DB/event/adapter/team/context/checkpoint/result digest、lease/fence、authoritative増分を直接assertする。正常caseのfailureは
`なし（正常系）`とし、別tokenを捏造しない。agentの自然言語応答、mock call countだけ、runtime自己申告で代替しない。
