---
title: "HELIX L5 詳細設計 — harness agent lifecycle"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-08
related_hst:
  - HST-HIL-006
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
pair_artifact: docs/test-design/helix/L5-harness-agent-lifecycle-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-08
  - HAC-HIL-08a
  - HAC-HIL-08b
  - HAC-HIL-08c
  - HIL-BR-09
  - HIL-BR-18
  - HIL-FR-11
  - HIL-FR-12
  - HIL-FR-13
  - HIL-FR-32
  - HIL-NFR-10
  - HIL-NFR-18
---

# HELIX L5 詳細設計 — harness agent lifecycle

## §0 適用境界と設計判断

本書は、HARNESS所有のversioned agent contractを唯一の正本とし、task、layer、drive、task kind、verification patternから
実行teamを決定し、`muster -> lease -> run -> checkpoint -> verify -> release -> quarantine/retire`をfencing付きで管理する。
Claude Code/Codexのruntime-local agent定義、team YAML、promptは生成projectionであり、正本ではない。runtime-local定義を
手作業で追加・変更してもregistryへ逆輸入せず、driftまたは未登録agentとして実行を拒否する。

旧UT HARNESSのpinned sourceから、HARNESS所有registry、runtime-neutral contract、生成adapter、
`task_kind -> verification pattern -> eligible agent`の二段招集、blind context遮断を採取候補として評価する。ただし旧`.ut-tdd/` path、
Bun前提、手書きruntime agent、legacy allowlistの恒久利用は採用しない。現行の
`agent-ssot-runtime-projection.ts`、team schema/launch policy、agent slots、job queueは部分的な実装候補であり、
本sliceのlease/fence、durable checkpoint、verification receipt、quarantine/retireを満たすまでは完了証拠にしない。

`HST-HIL-016`はlearning promotionの正本であり、本sliceへ配線しない。本sliceのsystem assertionはL3/L9で確定した
`HST-HIL-006`の22 caseだけである。

### §0.1 HU-CAP-005採取provenance

採取元は`HU-CAP-005`、ref `origin/work/l6-81-agent-registry-design`、commit
`ffb13d6c87b3903fbef89d4632b04b1267ecd772`、tree `dff1970a4be6e18957e938cbf3ffbc1f12bb8a65`へ固定する。
main比の固有binary delta digestは`sha256:d858def2d0bf410a7ea60b9146d465f2181b415efa3d6a0666163df5fe1d8ff1`で、
固有delta fileは次の1件だけである。

| source file | symbol／span | behavior disposition | HELIXでの扱い |
|---|---|---|---|
| `docs/plans/PLAN-L6-81-vmodel-specialist-agent-registry.md` | `§7.1 registry schema`, L133-L158 | harden（強化） | runtime-neutral contractのfield群を採用候補とし、旧path/model直書きは不採用 |
| 同上 | `§7.2 生成（射影）contract`, L160-L169 | harden（強化） | HARNESS正本からClaude/Codexへ生成し、expected receipt照合を追加。legacy allowlistは不採用 |
| 同上 | `§7.3 guard拡張contract`, L171-L178 | harden（強化） | blind context遮断を採用し、registry不在fallbackは不採用 |
| 同上 | `§7.4 SessionStart digest`, L180-L184 | pending（未採取） | 本sliceのlifecycle契約へ未結線。確定採取・coverageへ算入しない |
| 同上 | `§7.5-L7 oracle／§7.6実装分割`, L186-L205 | reference-only（参照のみ） | 旧PLAN番号・旧oracleを移植せず、本sliceのHST/HACへ再設計 |
| 同上 | `§8.1-§8.4 検証patternとmuster`, L207-L261 | harden（強化） | 二段musterとblind/cross-family分離を採用候補とし、Result comparatorを追加 |
| 同上 | `AC`, L263-L278 | reference-only（参照のみ） | 旧ACを完了証拠にせず、本書のfreeze条件で再検証 |

`infinity-loop-source-capability-ledger.md`のHU-CAP-005はsymbol ledger待ちである。本表はHDS-HIL-08内のpinned採取判断であり、
上位ledgerの未完了を閉じない。`pending`、span未記載、digest不一致、pinned tree外のbehaviorは確定採取やcoverageへ算入しない。

## §1 componentとauthority

| component | 責務 | authority | 禁止 |
|---|---|---|---|
| `AgentContractRegistry` | versioned contract、status、supersession、digest、compatibilityを管理 | HARNESS registry event | runtime-local定義の正本化、同ID/version異digest |
| `RuntimeProjectionCompiler` | 同一contract snapshotからClaude/Codex adapterとmanifestを決定的生成 | generated projection | runtime固有fieldのcontract逆流、clock依存digest |
| `RuntimeProjectionReceiptComparator` | 再生成結果をexpected input/source/generator/runtime/digest receiptと比較 | comparison receipt | candidate自己申告だけの成功 |
| `RuntimeProjectionDriftGate` | 欠落、改変、余剰、source digest不一致を検出 | registry＋projection manifest | manual driftの黙認・自動採用 |
| `EligibilityResolver` | layer、drive、task kind、pattern、role、provider、skills、path policy、statusを全件照合 | registry snapshot | 名前類似・自由推論による選抜 |
| `DeterministicMusterResolver` | task kindからpattern、patternからmemberを二段解決しteam digestを作る | muster event | task kindからagent直引き、LLM自由選択 |
| `MusterRerunComparator` | 同一input receiptと再実行team/member/context digestを比較 | comparison receipt | mutation後teamの実行 |
| `BlindPacketBuilder` | verifierへ許可されたspec、artifact、oracleだけを渡す | context packet digest | author claim、chat自己評価、worker private context |
| `AgentLifecycleController` | instance state、event sequence、operation idempotencyを制御 | lifecycle event | 不正遷移、terminal state再利用 |
| `AgentLeasePort` | active lease最大1、heartbeat、expiry、revoke、単調fenceをCAS管理 | lease event | 二重claim、旧fence操作 |
| `DurableCheckpointStore` | schema付きcheckpointとartifact manifestをsealしresume地点を決定 | durable checkpoint | partial/staged checkpointからresume |
| `VerificationReceiptGate` | workerと独立したverifierのoracle/evidence receiptを検証 | verification receipt | self verify、未検証release |
| `AgentLifecycleProjection` | append-only eventからcurrent stateを再生成 | harness.db projection | projectionの直接編集 |

## §2 version管理されたagent contract

contractはrepository管理下のruntime-neutral YAML/JSONとして登録し、少なくとも次を必須とする。物理rootは実装PLANで
確定するが、`.claude/agents`、`.codex/agents`、`.helix/state`を正本rootにしてはならない。

```ts
interface HarnessAgentContractV1 {
  schema_version: "helix-agent-contract.v1";
  agent_id: string;
  contract_version: string;
  supersedes: string | null;
  capability_class: string;
  applicable_layers: string[];
  applicable_drives: string[];
  task_kinds: string[];
  verification_patterns: string[];
  role_archetype: "worker" | "verifier" | "consult";
  provider_policy_id: string;
  model_policy_id: string;
  context_pack_id: string;
  required_skills: string[];
  required_reads: string[];
  generates: string[];
  forbidden_paths: string[];
  blind_policy: "none" | "claim-blind" | "spec-blind";
  compatibility: string[];
  status: "registered" | "eligible" | "quarantined" | "retired";
  source_digest: string;
}
```

`agent_id + contract_version`はuniqueで、同じ組へ異digestを登録しない。更新は旧versionを書換えず`supersedes`で連鎖する。
`registered`は検証前、`eligible`だけがmuster可能である。`quarantined`は同versionをeligibleへ戻さず、承認receiptを持つ
superseding revisionを新規登録する。`retired`は不可逆で、同versionのreclaimを許さない。

## §3 runtime projectionとdrift gate

compilerは固定registry snapshot、runtime capability matrix、model/provider policy versionからruntime別projectionを作り、
source/generated digest、target path、generator versionをmanifestへ記録する。同一入力なら削除後の再生成を含めbyte-identicalである。
時刻、filesystem列挙順、session IDを生成内容やdigestへ混入させない。

再生成はcandidate bundleを作るだけで成功にしない。事前にsealしたexpected receiptのinput/source/generator/runtime/digestとcandidateを
全field比較し、一致時だけadapterを実行可能にする。同じinputで一byte、順序、generator version、target setのいずれかが変われば
`HIL_AGENT_REGISTRY_NOT_REGENERABLE`を返し、runtime executionを0にする。expected receiptがない再生成もfail-closeする。

projectionが手編集された場合、既存ファイルを証拠として保全しても実行可能とはみなさない。欠落は再生成し、改変、marker欠落、
registry外残留、別source digestは`HIL_AGENT_ADAPTER_DRIFT`でfail-closeする。registryを失った状態でprojectionだけからcontractを
復元する経路は作らない。registryが残りadapterが消えた場合は同一digestへ再生成できなければ
`HIL_AGENT_REGISTRY_NOT_REGENERABLE`とする。

## §4 eligibilityと決定的muster

入力はcanonical task identity、plan/Issue、layer、drive、task kind、required verification、execution mode、provider availability、
registry/policy snapshot digestへ正規化する。解決順は次で固定する。

1. task kindからversioned presetでverification pattern集合を得る。
2. `eligible` contractだけをlayer、drive、task kind、pattern、capability、role、compatibility、skill/read/path policyで絞る。
3. workerとverifier候補を分離し、同一provider/model familyによる最終verifyとself approvalを除外する。
4. capability specificity、role、provider policy rank、stable `agent_id`、contract versionでstable sortする。
5. member index、blind packet digest、team digestを作り`agent_musters`へappendする。

LLMの名称解釈、候補列挙順、runtime側の利用可能agent名で順位を変えない。muster解決後はexpected receiptの
task/registry/policy/pattern/member/context/team digestと再実行candidateを比較し、同じ固定入力からteam/runtime projectionが変われば
`HIL_AGENT_MUSTER_NONDETERMINISTIC`、二段解決やrole制約を破れば`HIL_MUSTER_RESOLUTION_INVALID`、候補0なら
`HIL_AGENT_MUSTER_NO_ELIGIBLE`とする。比較failure時はmusterをready/leasedへ進めずexecutionを0にする。workerとfinal verifierが同一provider familyなら
`HIL_AGENT_VERIFIER_NOT_INDEPENDENT`、Codex worker自身が最終verify/approveする構成は
`HIL_ROLE_SEPARATION_VIOLATION`で停止する。

blind verifier packetは凍結spec、対象artifact、oracle、許可read set、redacted evidenceだけを持つ。author claim、意図、自己評価、
chat private context、worker reasoningが一件でも混入した場合は`HIL_AGENT_BLIND_CONTEXT_LEAK`で起動前に拒否する。

## §5 lifecycleとlease、fence、checkpoint

許可stateは次だけである。

```text
mustered -> leased -> running <-> checkpointed -> completed
                                                  -> verification_pending -> verified -> released
running/checkpointed -> failed | cancelled
任意の非retired state -> quarantined
released/quarantined -> retired
```

`failed/cancelled`はverifiedへ遷移せず、retryは新instance/attemptを作る。`quarantined/retired`から通常stateへ戻さない。
不正順序は`HIL_AGENT_STATE_TRANSITION_INVALID`、lifecycle全体の生成・順序違反は`HIL_AGENT_LIFECYCLE_INVALID`である。

instanceのclaimはtransaction内でactive lease 0件を確認し、単調増加するfence tokenを発行する。heartbeat、checkpoint、artifact publish、
completionはactive lease、owner、expiry、fenceをCASする。active leaseがあれば`HIL_AGENT_LEASE_ALREADY_ACTIVE`、expiry後の操作は
`HIL_AGENT_LEASE_EXPIRED`、reassign後の旧completionは`HIL_AGENT_FENCING_REJECTED`、旧agentによるtool/completionとresumeの複合違反は
`HIL_AGENT_FENCING_VIOLATION`とする。

checkpointはschema、instance、sequence、fence、contract/input/context digest、state digest、artifact manifest digestをsealする。
`staged`はresume候補ではなく、検証済み`durable`の最大sequenceだけから再開する。破損、digest mismatch、別fence、欠番は
`HIL_AGENT_CHECKPOINT_INVALID`で拒否する。contract/input drift時は旧checkpointを流用せず、新instanceを作る。

## §6 検証、release、quarantine、retire

completionはartifactをstagedにするだけで、release authorityを持たない。独立verifierはoracle/input/result/evidence digest、provider family、
worker/verifier identity、判定をreceiptへ記録する。validな`pass` receiptがないreleaseは
`HIL_AGENT_RELEASE_UNVERIFIED`で副作用0とする。receiptのresult digestがcurrent artifactと異なる場合はstaleである。

quarantine releaseは同version復帰ではない。原因修正、承認者、approval/action digest、再検証receiptを持つsuperseding contractを作る。
無承認の復帰は`HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED`。retired contract/versionのclaimは
`HIL_AGENT_RETIRED_RECLAIM`とし、aliasやruntime cacheからも復活させない。

## §7 harness.db台帳と再生成projection

| table | key／主要field | 不変条件 |
|---|---|---|
| `agent_contract_versions` | agent/version、supersedes、digests、applicability、blind/model/context policy、source path、status | agent/version unique、eligibleだけmuster |
| `agent_musters` | plan/Issueとoperation/idempotency、layer/drive/task kind、pattern/team digest、state | operation/idempotency unique |
| `agent_muster_members` | muster/versionとmember index、archetype、provider family、blind packet digest、state | member index unique |
| `agent_instances` | member/version/attemptとtask/causality digest、current fence/lease/checkpoint、result/failure、state | attempt unique、projection-only current |
| `agent_leases` | instance、owner session/run、fence、acquired/heartbeat/expires/release reason、state | active最大1、fence unique/monotonic |
| `agent_instance_events` | instance sequence、operation、from/to、fence、context/result/previous/event digest、failure | append-only、sequence/operation unique、hash chain連続 |
| `agent_checkpoints` | instance sequence、fence/schema/context/state/artifact manifest digest/path、state | durable最大sequenceだけresume |
| `agent_result_artifacts` | instanceとrelative path/digest、fence、kind、state | path/digest unique、stale fence accepted 0 |
| `agent_verification_receipts` | worker/verifierとresult/verifier、provider、oracle/input/result/evidence digest、decision/state | result/verifier unique、self verify 0 |

current lifecycleはevent chainから再生成できなければならない。sequence gap、重複operation、previous digest mismatchは
`HIL_AGENT_EVENT_SEQUENCE_INVALID`でprojection更新0とする。chatやruntime transcriptはcontractやstateの代用にせず、必要な判断だけを
redacted digest付きeventとして記録する。

### §7.1 lifecycle mutationの不可分transaction

lease取得以外のcheckpoint、result acceptance、verification、release、quarantine、retireは
`AgentLifecycleCommitBundleV1`へ正規化する。bundleはinstance/current fence/lease、operation/payload digest、
expected event/projection/checkpoint/result heads、transition event/projectionと対象recordを持つ。Node `AgentLifecycleStore`は
bundle全体を一つのtransactionでCAS commitし、旧fence、expired lease、head mismatchはwrite 0とする。

同operation・同digestは同receiptを返すno-op、異digestはconflictである。event/projection/checkpoint/result/verify/release/
dispositionの各append faultで全writeをrollbackする。reconcileはimmutable event、artifact、verification evidenceからだけ
projection/recordを復元し、lease、verification pass、release、retire判断を推測生成しない。

## §8 failure契約

| failure token | 条件 | 副作用 |
|---|---|---|
| `HIL_AGENT_BLIND_CONTEXT_LEAK` | blind packetへ作成側文脈混入 | agent起動0 |
| `HIL_AGENT_LEASE_ALREADY_ACTIVE` | active lease中の二重claim | 新lease 0 |
| `HIL_AGENT_LEASE_EXPIRED` | expiry後のheartbeat/tool/checkpoint/completion | authoritative増分0 |
| `HIL_AGENT_FENCING_REJECTED` | reassignment後の旧fence completion | result受理0 |
| `HIL_AGENT_CHECKPOINT_INVALID` | checkpoint破損、欠番、digest/fence不一致 | resume 0 |
| `HIL_AGENT_STATE_TRANSITION_INVALID` | 許可graph外のstate遷移 | state増分0 |
| `HIL_AGENT_RELEASE_UNVERIFIED` | valid pass receiptなしrelease | release 0 |
| `HIL_AGENT_VERIFIER_NOT_INDEPENDENT` | worker/verifierが同一provider family | verification採用0 |
| `HIL_AGENT_RETIRED_RECLAIM` | retired contract/instanceのclaim | lease 0 |
| `HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED` | approvalなしquarantine復帰 | eligible増分0 |
| `HIL_AGENT_EVENT_SEQUENCE_INVALID` | event欠番、重複、hash chain不整合 | projection更新0 |
| `HIL_AGENT_MUSTER_NO_ELIGIBLE` | 全constraintを満たすcontractがない | muster ready 0 |
| `HIL_AGENT_MUSTER_NONDETERMINISTIC` | 同一入力でteam/projection digest変化 | execution 0 |
| `HIL_AGENT_LIFECYCLE_INVALID` | lifecycle生成または全体順序が不正 | instance公開0 |
| `HIL_AGENT_CONTRACT_INCOMPLETE` | contract必須field、version、policy、digest不正 | registry eligible 0 |
| `HIL_AGENT_ADAPTER_DRIFT` | generated adapter改変、余剰、marker/source不整合 | runtime execution 0 |
| `HIL_MUSTER_RESOLUTION_INVALID` | 二段解決、stable rank、role制約違反 | muster ready 0 |
| `HIL_ROLE_SEPARATION_VIOLATION` | workerがfinal verify/approve | accept/release 0 |
| `HIL_AGENT_REGISTRY_NOT_REGENERABLE` | registryから同一adapterを再生成不能 | runtime execution 0 |
| `HIL_AGENT_FENCING_VIOLATION` | 旧agentのtool/completion/resume複合違反 | authoritative増分0 |

## §9 L8 oracleへのexact trace

| L5責務 | HAC | HST exact case | L8 oracle | canonical failure |
|---|---|---|---|---|
| 正常lifecycle | `HAC-HIL-08a`, `HAC-HIL-08c` | `HST-CASE-006-01` | `IT-AGLC-001` | `なし（正常系）` |
| adapter再生成 | `HAC-HIL-08a` | `HST-CASE-006-02`, `HST-CASE-006-21` | `IT-AGLC-002` | `なし（正常系）`; `HIL_AGENT_REGISTRY_NOT_REGENERABLE` |
| blind context遮断 | `HAC-HIL-08b` | `HST-CASE-006-03` | `IT-AGLC-003` | `HIL_AGENT_BLIND_CONTEXT_LEAK` |
| 単一lease | `HAC-HIL-08b` | `HST-CASE-006-04` | `IT-AGLC-004` | `HIL_AGENT_LEASE_ALREADY_ACTIVE` |
| expiry/reassign fence | `HAC-HIL-08b`, `HAC-HIL-08c` | `HST-CASE-006-05`, `HST-CASE-006-06`, `HST-CASE-006-22` | `IT-AGLC-005` | `HIL_AGENT_LEASE_EXPIRED`; `HIL_AGENT_FENCING_REJECTED`; `HIL_AGENT_FENCING_VIOLATION` |
| durable checkpoint再開 | `HAC-HIL-08c` | `HST-CASE-006-07` | `IT-AGLC-006` | `HIL_AGENT_CHECKPOINT_INVALID` |
| state/release gate | `HAC-HIL-08b` | `HST-CASE-006-08`, `HST-CASE-006-09`, `HST-CASE-006-16` | `IT-AGLC-007` | `HIL_AGENT_STATE_TRANSITION_INVALID`; `HIL_AGENT_RELEASE_UNVERIFIED`; `HIL_AGENT_LIFECYCLE_INVALID` |
| verify独立性 | `HAC-HIL-08b` | `HST-CASE-006-10`, `HST-CASE-006-20` | `IT-AGLC-008` | `HIL_AGENT_VERIFIER_NOT_INDEPENDENT`; `HIL_ROLE_SEPARATION_VIOLATION` |
| retire不可逆 | `HAC-HIL-08c` | `HST-CASE-006-11` | `IT-AGLC-009` | `HIL_AGENT_RETIRED_RECLAIM` |
| quarantine supersession | `HAC-HIL-08c` | `HST-CASE-006-12` | `IT-AGLC-010` | `HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED`  `IT-AGLC-010` |
| event projection再生成 | `HAC-HIL-08a`, `HAC-HIL-08c` | `HST-CASE-006-13` | `IT-AGLC-011` | `HIL_AGENT_EVENT_SEQUENCE_INVALID`  `IT-AGLC-011` |
| eligibility/決定的muster | `HAC-HIL-08a`, `HAC-HIL-08b` | `HST-CASE-006-14`, `HST-CASE-006-15`, `HST-CASE-006-19` | `IT-AGLC-012` | `HIL_AGENT_MUSTER_NO_ELIGIBLE`; `HIL_AGENT_MUSTER_NONDETERMINISTIC`; `HIL_MUSTER_RESOLUTION_INVALID`  `IT-AGLC-012` |
| contract完全性 | `HAC-HIL-08b` | `HST-CASE-006-17` | `IT-AGLC-013` | `HIL_AGENT_CONTRACT_INCOMPLETE`  `IT-AGLC-013` |
| adapter drift | `HAC-HIL-08b` | `HST-CASE-006-18` | `IT-AGLC-014` | `HIL_AGENT_ADAPTER_DRIFT`  `IT-AGLC-014` |

## §10 freeze条件

L6 muster memberは`AgentMusterMemberV1`、reconcile evidenceは`AgentLifecycleImmutableEvidenceV1`、event replayはL4基本設計 §2.3の共有semantic shape `ProjectionDigestV1`に固定する。

### §9.1 canonical exact tuple台帳

| HST case識別子 | `pre_state` | `expected_state` | 正本failure | 主IT結線 |
|---|---|---|---|---|
| `HST-CASE-006-01` | `mustered` | `verified` | `なし（正常系）`  | `IT-AGLC-001` |
| `HST-CASE-006-02` | `adapter_missing` | `adapter_current` | `なし（正常系）`  | `IT-AGLC-002` |
| `HST-CASE-006-03` | `selected` | `selected` | `HIL_AGENT_BLIND_CONTEXT_LEAK`  | `IT-AGLC-003` |
| `HST-CASE-006-04` | `mustered` | `leased` | `HIL_AGENT_LEASE_ALREADY_ACTIVE`  | `IT-AGLC-004` |
| `HST-CASE-006-05` | `running` | `running` | `HIL_AGENT_LEASE_EXPIRED`  | `IT-AGLC-005` |
| `HST-CASE-006-06` | `running` | `running` | `HIL_AGENT_FENCING_REJECTED`  | `IT-AGLC-005` |
| `HST-CASE-006-07` | `failed` | `failed` | `HIL_AGENT_CHECKPOINT_INVALID`  | `IT-AGLC-006` |
| `HST-CASE-006-08` | `failed` | `failed` | `HIL_AGENT_STATE_TRANSITION_INVALID`  | `IT-AGLC-007` |
| `HST-CASE-006-09` | `verification_pending` | `verification_pending` | `HIL_AGENT_RELEASE_UNVERIFIED`  | `IT-AGLC-007` |
| `HST-CASE-006-10` | `planned` | `planned` | `HIL_AGENT_VERIFIER_NOT_INDEPENDENT`  | `IT-AGLC-008` |
| `HST-CASE-006-11` | `retired` | `retired` | `HIL_AGENT_RETIRED_RECLAIM`  | `IT-AGLC-009` |
| `HST-CASE-006-12` | `quarantined` | `quarantined` | `HIL_AGENT_QUARANTINE_RELEASE_UNAUTHORIZED`  | `IT-AGLC-010` |
| `HST-CASE-006-13` | `running` | `running` | `HIL_AGENT_EVENT_SEQUENCE_INVALID`  | `IT-AGLC-011` |
| `HST-CASE-006-14` | `planned` | `planned` | `HIL_AGENT_MUSTER_NO_ELIGIBLE`  | `IT-AGLC-012` |
| `HST-CASE-006-15` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_MUSTER_NONDETERMINISTIC`  | `IT-AGLC-012` |
| `HST-CASE-006-16` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_LIFECYCLE_INVALID`  | `IT-AGLC-007` |
| `HST-CASE-006-17` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_CONTRACT_INCOMPLETE`  | `IT-AGLC-013` |
| `HST-CASE-006-18` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_ADAPTER_DRIFT`  | `IT-AGLC-014` |
| `HST-CASE-006-19` | `assertion_input_ready` | `assertion_pass` | `HIL_MUSTER_RESOLUTION_INVALID`  | `IT-AGLC-012` |
| `HST-CASE-006-20` | `assertion_input_ready` | `assertion_pass` | `HIL_ROLE_SEPARATION_VIOLATION`  | `IT-AGLC-008` |
| `HST-CASE-006-21` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_REGISTRY_NOT_REGENERABLE`  | `IT-AGLC-002` |
| `HST-CASE-006-22` | `assertion_input_ready` | `assertion_pass` | `HIL_AGENT_FENCING_VIOLATION`  | `IT-AGLC-005` |

L5/L8 pairは`IT-AGLC-001`から`IT-AGLC-014`の14件、`HST-HIL-006`全22 case、全canonical failure、
同一入力のteam/projection digest、lease/fence CAS、checkpoint再開、event projection rebuild、worker/verifier独立性、
quarantine/retireの不可逆性、別runtime reviewが揃うまでdraftとする。agentが応答した事実、runtime adapterの存在、
agent-slotsのrunning/completed記録だけをfreeze証拠にしない。
