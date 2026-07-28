---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "管理・統合セル＋ペア開発セルN 要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-29
updated: 2026-07-29
owner: PM / TL / PO承認必須
plan: PLAN-L3-43-management-integration-cell-model
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/management-integration-cell-acceptance.md
next_pair_freeze: L10
---

# 管理・統合セル＋ペア開発セルN 要件定義

## §0 authorityと軸の分離

本書は、HELIXの実行組織を`management_integration_cell` 1組と
`paired_development_cell` N組へ分離するL3要件である。これはdevelopment style、case-driven model、
specialist process、runtime modeのいずれでもなく、それらを実行する**組織・統合軸**である。

- development styleはV-model、Production Scrum、V設計＋Scrum実装Hybridの同列3種とする。
- Discovery／PoC等はScrum非内包のcase-driven modelとして必要時だけ発動する。
- Design HARNESS等は対象責務に追加するspecialist processであり、cell topologyへ混ぜない。
- `standalone`／`claude-only`／`codex-only`／`hybrid`はruntime availabilityであり、cell topologyを
  development styleへ変換しない。

VS Code 3ウィンドウは最小実証profileにすぎない。ウィンドウ数、provider名、model名、IDE名を
概念正本にしない。

closed PR #90だけに存在した`WCC-FR-13`〜`WCC-FR-15`はcurrent mainの要件ではなく、本書のID、
本文、traceへ再利用しない。本書の唯一のbehavior contractは`MIC-FR-001`である。

## §1 振る舞い契約

### MIC-FR-001 管理・統合セルとペア開発セルの排他統合

HELIXは、1組の管理・統合セルと、capacity内のN組のペア開発セルを同時稼働できなければならない。
管理・統合セルはPM roleとTL roleを分離し、各ペア開発セルはwriterと独立reviewerを分離する。

#### MIC-R-01 PMによる割当

PMはrepo-owned工程表と`harness.db`のdependency frontierから、依存、changed path、共有正本、
DB projection、authority ownerが競合しないREADY taskだけを抽出する。各taskへtyped task packetと
single-writer leaseをexactly once割り当て、実行中も次のREADY taskを計画する。

#### MIC-R-02 TLの統合権限

TLはmain、統合順序、merge queue、共有正本、combined CI、DB convergence、final merge authorityを
所有する。ペア開発セルはmainへ直接mergeしてはならない。TLはlane-ready receiptを受理した候補だけを
直列mergeし、先行merge後に残存laneのbase drift、CI、review、DB receiptを再判定する。

#### MIC-R-03 ペア開発セル

各ペア開発セルではwriterが実装、test、PR更新を行い、別identity、別session、独立contextのreviewerが
candidate exact HEADをread-onlyで検証する。blockerが0になった場合だけlane-ready receiptを
管理・統合セルへ返す。reviewerはwriter lease、Ready化、merge authorityを取得しない。

#### MIC-R-04 セル束縛の完全一致

各作業セルは次のexact setへ束縛する。

```yaml
required_cell_binding:
  - lane_id
  - issue_id
  - behavior_contract_id
  - responsibility_owner
  - base_head
  - candidate_head
  - writer_lease
  - target_reviewer
  - effective_rule_packet_digest
  - allowed_paths
  - forbidden_paths
  - lane_ready_receipt
```

field欠落、stale HEAD、lease競合、scope外path、target reviewer不一致をlane-readyへ進めない。

#### MIC-R-05 conflict exclusionと通知

同一Issue、behavior contract、responsibility owner、共有正本、DB projection、authority owner、
または競合changed pathを持つtaskへ複数writer leaseを発行しない。通知はlane ID、target runtime、
target reviewer、candidate HEADへ束縛し、別laneの取得、重複配送、ack後の再配送をfail-closeする。

#### MIC-R-06 capacityと再割当

最小実証は管理・統合セル1組＋ペア開発セル2組とする。Nへの水平拡張でも同じtask packet、lease、
receipt、merge queue契約を再利用し、bounded queue、backpressure、lease expiry/recoveryを維持する。
merge後はread-after-writeとfrontier再計算を終えてから、空いたセルへ次のREADY taskを割り当てる。

#### MIC-R-07 工程表／GitHub Projects projection

repo-owned工程表と`harness.db`を計画・状態authorityとし、GitHub Issue／PR／Projectsは
`GOP-FR-01`〜`GOP-FR-10`に従うread-side projectionとする。typed desired-state packetで投影し、
apply後のread-backでidentityとstateを照合する。

Projectsには最低限、Issue／PLAN、parent、development style、case-driven model、drive route、
behavior contract、responsibility owner、dependency frontier、lane ID、cell state、writer lease ownerを
表示する。さらにbase/candidate HEAD、target reviewer、CI／DB／review state、merge順序、
terminal disposition、projection snapshot／driftも表示する。

Projectの列移動、field編集、Issue close、green表示だけで、lease移譲、lane-ready、工程完了を確定しない。
stale HEAD、orphan item、duplicate assignment、unknown field option、rate-limit中断はbounded retryまたは
Recoveryへ送り、完了へ進めない。

## §2 状態遷移

```text
canonical工程表 / harness.db
  → dependency frontier / READY queue
  → PM assignment / writer lease
  → paired development cell / candidate PR
  → exact-HEAD independent review / lane-ready receipt
  → TL merge queue / combined CI / DB convergence
  → serial main merge
  → 工程表とProjectsのread-after-write projection
  → frontier再計算 / 次task dispatch
```

順序の省略、未来receiptの先書き、GitHub表示からの逆流、writerによる自己mergeを拒否する。

## §3 非対象

- scheduler、lease、notification、Projects API、DB schemaのL4〜L7実装。
- 新しいdevelopment style、case-driven model、specialist process、runtime modeの追加。
- 特定provider、model、IDE、VS Code window数の固定。
- closed PR #90または旧layer定義のauthority復活。
