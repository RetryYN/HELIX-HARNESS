---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "CI System Synthesis要件"
layer: L3
kind: add-design
status: confirmed
created: 2026-08-29
updated: 2026-08-29
owner: PO / Codex TL
plan: PLAN-L3-73-ci-system-synthesis
parent_design: docs/design/helix/L3-requirements/system-synthesis-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/ci-system-synthesis-acceptance.md
next_pair_freeze: L10
refines:
  - SYN-R-07
  - SYN-R-08
  - GH-NFR-009
  - GH-NFR-010
  - GH-NFR-011
---

# CI System Synthesis要件

## §0 authority境界

CI System Synthesisは、work authorityとsemantic impactから必要なverification obligationを導出し、
その完全性を保ったまま実行DAGを最適化するSystem Synthesis capabilityである。新しいworkflow route、
execution mode、test authority、DB authorityではない。現行Impact CI、Lite selector、Module Registry、
full regression shard、GitHub aggregate admissionを下位adapterとして再利用する。

高速化はrequired verificationの削除、timeout緩和、risk downgrade、main／nightlyへの無記録先送りでは成立しない。
LLMはplan候補と説明を提案できるが、required obligation、N/A、full fallback解除を確定しない。

## CIS-FR-001 CI execution telemetry

#### CIS-R-01 実行identity

job、step、test、setup、artifact transferをstable verification identity、candidate/base HEAD、run／attempt、runner、
toolchain、開始／終了へ束縛する。名称変更やshard移動で履歴identityを作り直さない。

#### CIS-R-02 costと結果

queue、wall time、runner time、CPU／memory class、cache、retry、timeout、cancel、flake、first detecting oracleを
別fieldで保持する。rerun successで元failureを消さず、raw logを意味authorityにしない。

#### CIS-R-03 telemetry境界

receiptはsecret、credential、PII、任意log本文を保持せず、repo authorityとGitHub run metadataから再構築可能な
projectionに限定する。欠落、時間逆転、wrong HEAD、未知runnerを明示DEGRADEDまたはfail-closeする。

## CIS-FR-002 CI Responsibility Registry

#### CIS-R-04 証明責務identity

verification capabilityはstable ID、owner、oracle、environment、cost class、risk class、parallelism、artifact入出力、
freshness、applicabilityを持つ。pathやtest filenameだけを意味主キーにしない。

#### CIS-R-05 semantic impact graph

Issue／PLAN／changed artifactからrequirement、design、contract、Module、Bundle、V-pair、runtime、DB、distribution、
securityのaffected nodeを導出する。名称類似やLLM推測でedgeを補わない。

#### CIS-R-06 責務class

`local`、`boundary`、`global_invariant`、`release_only`を別classとして保持する。unknown identity、orphan、循環、
owner欠落、重複ownerはfail-closeし、legacy greenでcurrent obligation欠落を相殺しない。

## CIS-FR-003 Verification Plan composition

#### CIS-R-07 plan exact partition

同一work authority、candidate/base HEAD、registry digestから、local、boundary、global、deferredのexact partitionと
execution dependencyを決定的に生成し、plan digestへ束縛する。

#### CIS-R-08 full fallback

changed testは必ず含める。unknown／high-risk、selector／registry／security／schema／migration／rollback／lockfileの
変更はfullへfail-closeし、別greenや平均scoreでrequired oracleを相殺しない。

#### CIS-R-09 compatibility境界

現行Impact CIのtargeted／full／reuse receiptはinput-only adapterで一方向変換する。current outputはpath-only test listを
primary identityにせず、typed Verification Planを返す。

## CIS-FR-004 Critical-path scheduling

#### CIS-R-10 obligation不変

schedulerはrequired obligationを変更せず、順序、並列度、runner、artifact reuseだけを決定する。cost最小化を
verification coverageより優先しない。

#### CIS-R-11 resourceとartifact境界

p50／p95、variance、flake、queue、runner OS、resource budget、exclusive state、artifact localityを入力にする。
stateful resourceはlease／fenceなしに並列化せず、artifactはHEAD、lockfile、toolchain、platform、digestへ束縛する。

#### CIS-R-12 fallbackとbounded cancellation

cost model不明、telemetry stale、quota不足時は安全な既定DAGへfallbackする。局所failure時は未開始heavy jobをboundedに
cancelできるが、terminal obligationをsuccessとして捏造しない。

## CIS-FR-005 Deferred obligation recovery

#### CIS-R-13 exactly-once回収

PRで延期可能なobligationはmain、nightly、release candidateのexactly one profileへ割当し、origin PR、candidate HEAD、
obligation ID、最初のterminal runへ接続する。receipt成立まで未完として保持する。

#### CIS-R-14 selector改善backprop

後段failureはorigin selector decision、registry edge、first detecting oracleへbackpropし、Reverse／Redesign／
Performance Refactor候補を作る。観測からcurrent authorityを直接変更しない。

#### CIS-R-15 safety measurement

wall-clock、runner-minute、failure feedback latencyだけでなく、escaped defect、mutation detection、flake、deferred expiryを
同時に測る。安全性を低下させた時間短縮を完了と認めない。

## §1 実装owner

- #1204: CIS-FR-001
- #1205: CIS-FR-002
- #1206: CIS-FR-003
- #1207: CIS-FR-004
- #1208: CIS-FR-005

#1002はLite／Windows adapter、#1084はModule／Bundle adapterとして接続する。#188との動的配車接続は後続edgeであり、
本capabilityのregistry、plan、scheduler基盤を停止させるhard dependencyにしない。

## §2 非対象

- required test削除、timeout緩和、risk downgradeによる見かけ上の高速化。
- self-hosted runner導入。
- #188 routing／allocation本体、#819 resident lane、release publish／cutover。
