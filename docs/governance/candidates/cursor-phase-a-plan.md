---
title: "Cursor Phase A 境界設計の未採番PLAN候補"
status: draft_candidate
authority_status: noncanonical
owner_issue: 1293
plan_id: null
plan_id_reservation: unavailable
candidate_kind: add-design
candidate_layer: L4
canonical_vmodel: L1-L12
candidate_pair: L9
completion_claim_allowed: false
runtime_activation_allowed: false
created: 2026-09-08
source_head: cf85c603986b87905514d2d3ebcdd1fde1aaa2b2
parent_design: docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md
pair_artifact: docs/governance/candidates/cursor-phase-a-l9-integration-oracles.md
engineering_discipline_required: true
behavior_contract_id: 3L-FR-005
responsibility_owner: cursor-cloud-execution
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: not_applicable
no_code_decision: reuse
ddd_modeling_decision: none
contract_preconditions: "既存#1293と承認済みL3 sourceを参照し、IR未着地・PLAN未予約を区別する"
contract_postconditions: "assignmentから独立review返却までの境界・不足・L9反例を非正本候補として対応付ける"
contract_invariants: "runtime／IR／schema／gate／DB正本を変更せず、新Feature・別Issue・別承認engineを作らない"
contract_failures: "未予約を仮採番で埋めない。未知の外部強制力は未成立として残す"
tdd_red_required: false
tdd_red_waiver_reason: "非正本文書だけの候補整理。実行oracleとRed/GreenはL5/L8以降の義務であり本候補の完了証拠にしない"
complexity_effect: justified_positive
complexity_justification: "既存契約を再利用する3文書のみ。runtime、依存、永続state、CI追加は0"
removal_trigger: "正規ID予約とIR main read-after後、同じ内容を正規PLAN／L4／L9へ昇格して候補を廃止する"
review_evidence: []
generates:
  - { artifact_path: docs/governance/candidates/cursor-phase-a-plan.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/cursor-phase-a-l4-boundary.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/candidates/cursor-phase-a-l9-integration-oracles.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/governance/candidates/README.md, artifact_type: markdown_doc }
---

# 未採番PLAN候補（#1293、noncanonical draft）

## 位置付けと予約不足

本書は登録済みPLANではない。候補配置は既存の `docs/governance/candidates/` に合わせ、
`docs/plans/`、design catalog、Requirement IR、DBへ登録しない。`plan_id: null` は欠落を可視化する値であり、
正式schemaを拡張するものではない。責務名も本候補の整理用で、registryへの追加ではない。

本候補の正本昇格時は、次を一つのpromotion checklistとして実施する。候補文書を残したまま
canonical文書を複製して二重authorityにしない。

1. 正規PLAN IDとcanonical L4/L9 pathを予約する。
2. `docs/design/design-catalog.yaml`へcanonical L4/L9だけを登録する。
3. PLANの`generates`を候補3 pathから、正規PLAN・canonical L4・canonical L9・catalog追従pathへ置換する。
4. candidate READMEの状態をretired/supersededへ更新し、この3候補を削除する。
5. main read-afterでcatalog、pair、PLAN、IRの単一authorityを確認する。

先行read-only棚卸し（2026-09-08、出力digest
`sha256:126ac23cb57704977fabb0dd180238045306f9fc90d125742c7f537e65c4b123`）を再利用する。
旧#1293 treeはHEAD `ec4e8120f275fbf041a8f0b3f7169346f3dbe045`、clean、未push実装なしという観測であり、
writer不在保証ではない。今回の編集権限は親が発行した専用branch `docs/1293-cursor-phase-a-boundary` だけにある。

既存承認は `docs/plans/PLAN-L3-78-three-lane-cloud-governance-authority.md` の
`L3-PO-1358-002` を参照する。candidate／PLAN未承認待ちへ戻さず、再承認を要求しない。
基準HEADの `requirements-ir/refinement_contracts.json` にはthree-lane familyがない。
#1650のPR HEAD `f6154de00a0e775ccce74eda274c116e7b358053` にある8 Feature／25 R／27 ACは
main成立の代用にしない。親が行うIR main read-afterを待つ。

ID予約の再利用先は `src/runtime/open-branch-plan-identity-reservation.ts`、
`src/runtime/forward-plan-authoring-transaction.ts`、`src/runtime/forward-reverse-terminal-reservation.ts`。
既存 `helix plan author-forward` はL7 add-impl＋Reverse用であり、このL4候補へそのまま転用しない。
専用treeに `.helix/state/open-branch-plan-reservations.json` とallocator receiptはなく、
current main／open PR／active writerのfresh予約証跡も未提供である。
ローカル最大番号＋1やIssue番号をPLAN番号に流用せず、正規L4予約経路・証跡を親へ不足として返す。

ただし、汎用L4 allocatorの完成を着手条件にはしない。既存のL7専用transactionにL4を
偽装して渡すことと、未実装の汎用採番器を新設して待つことの両方を避ける。
[後続#1256](https://github.com/RetryYN/HELIX-HARNESS/issues/1256)は予約projectionの
GitHub／assignment接続を所有し、自動採番を非対象としている。#860への依存もそのadapterの
依存であり、本候補の設計作業全体へ伝播させない。
次に確認するのは、既存運用でのL4番号衝突確認・担当間の予約記録・正規PLANへの登録方法である。
この確認がない間は未採番候補を維持するが、sourceに基づく境界設計・独立設計reviewは先行できる。
予約snapshotやleaseを補作せず、canonical移管前に実際に採用した方法と確認対象HEADを記録する。

この区別は2026-09-08に既存コードと#1256を照合した結果であり、新しい採番権限の付与ではない。
`open-branch-plan-identity-reservation.ts`は衝突判定のprojectionであってID発行器ではなく、
`forward-reverse-terminal-reservation.ts`のL7制約を弱める必要もない。

## 最小成果物と除外

[L4境界](cursor-phase-a-l4-boundary.md)と[L9統合oracle](cursor-phase-a-l9-integration-oracles.md)の1対だけを用意する。
3L-FR-005「HELIX policyの強制」と、その3L-R-12〜14／23〜25が定める
policy束縛・cloud強制・外部read-after・single writer・起動前identity・段階移行を主対象とし、
3L-FR-002のscope／authority／review返却、3L-FR-003の予算入力を接続条件として参照する。
8 Feature全体、#860全体、monthly budget engine、Bench、7日／cycle実証を所有しない。
#1643／#1634／#1650のCI・独立検収・統合、親の正本移管検証も対象外とする。

no-code-firstはreuseで止める。対案のCursor専用queue／DB／承認engineは既存責務を重複させるため採らない。
最初の限定実案件は1件で検証するが、正本のWIP=2や条件付きburst policyを変更する意味ではない。

## 進行と検証

| 段階 | この候補で用意するもの | 未成立のまま残す条件 |
|---|---|---|
| L4/L9 | 再利用契約、不足port、failure recovery、Given/When/Then | IR main read-after、正規ID予約、独立設計review、pair-freeze |
| L5/L8 | 後続への入力境界のみ | 具体的な外部強制機構、型・失敗コード・時計・冪等性・永続化先・receipt真正性の契約 |
| L6/L7 | 実装しない | Red→最小Green→Refactor、競合／遅延writeの実consumer検証 |

この文書変更はfrontmatter、pair相互参照、既存path／symbol、L9行の構造、禁止語彙、
変更pathの限定、`git diff --check`、`helix guard commitlint` のsubjectとcommit rangeで検証する。
構造greenをPLAN lint、pair-freeze、runtime oracle、実cloud成功、独立検収のgreenへ昇格しない。
実行するL9 oracleはこの時点で0件である。

#860はAssignment／lease authorityとPhase Aに必要な最小の原子的排他primitiveを所有する。
#1293はそのprimitiveをCursor Cloudの実consumerへ接続し、最初の限定実案件でE2E実証する。
Phase Bの汎用lease/fenceも#860のowner範囲として維持する。Phase Aでも原子的排他・遅延write不能・
予算/TTL・前後照合が必須であり、それらが不足する対象だけを起動不可とする。
課金・credential利用・外部API前提の確定は既存の人間確認境界を維持し、本候補は実行許可を発行しない。
