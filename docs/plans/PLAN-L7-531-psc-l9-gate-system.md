---
plan_id: PLAN-L7-531-psc-l9-gate-system
title: "PLAN-L7-531 (add-impl): semantic contract 層 — L9 実 gate system assertion（SA-PSC-03a）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-09 デザインハーネスを進めること（#230 の未ブロック範囲）"
created: 2026-08-09
updated: 2026-08-09
owner: Claude / TL
github_issue_id: 230
engineering_discipline_required: true
behavior_contract_id: U-PSC-007
responsibility_owner: semantic-contract-revalidator
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: none
contract_preconditions: "PLAN-L7-524/525/526/527 confirmed（pure 関数群・store・intake receipt・静的 gate が着地済み）。L4 §3 の SA-PSC-01/02/04 は Python 意味コアの実 spawn を要求するが repository に Python 実装は 0 件で、L5 python-worker-runtime.md §0 が HDS-HIL-14 supply-chain gate 未着地を理由に実装・active 化を自ら禁じている。SA-PSC-03 のうち browser evidence 偽装は検知の受け皿（commit bundle の evidence 面と gate）が未実装"
contract_postconditions: "SA-PSC-03 を SA-PSC-03a（drift + 別 authoring DB / reverse write、実装する）と SA-PSC-03b（browser evidence 偽装、未実装ブロック）へ分割し L4 §3 と L9 テスト設計の双方へ反映する。SA-PSC-03a は実 repo の実 doc を source に、実 commit 経路と実 doctor gate 経路を通し、違反ごとに harness.db の semantic 全テーブル行数が不変であることまで観測する"
contract_invariants: "production code を変更しない（no_code_decision=no_change。生成物は test 1 本と設計 doc 2 本と本 PLAN）。L8（U-PSC-003/004/006）の再実行にしない — 差別化は **実 doc digest と partial write 0 の全テーブル観測の 2 点**である。実 doctor gate の real-repo 実行は U-PSC-006 が既に担っており、本スライスで重複させない（SA-PSC-03a の authoring 境界面は U-PSC-006 を citation する）。ブロック中の SA-PSC-01/02/04/03b を『実装済み』として扱わず、解除条件を設計側に残す"
contract_failures: "envelope digest 再計算の欠落、sidecar 束縛検査（PSC_CONTRACT_UNBOUND）の欠落、stale head の commit 成立（CAS 2 層の同時無効化）を SA-PSC-03a で fail-close する。実 gate が入力 0 件でも green になる空洞化は U-PSC-006 が担う"
tdd_red_required: true
red_at: "2026-08-09T12:13:47Z"
green_at: "2026-08-09T12:14:52Z"
mutation_oracle_evidence: "red_at は初回実行が PSC_COMMIT_FAULT で落ちた時刻（store factory の trustedNow 未指定）、green_at はその是正後。mutation による有効性実証はさらに後（12:16 以降）である。tests/psc-gate-system.test.ts が mutation を kill することを実測。現行 test の独立 kill は 2 件: (1) envelope digest の再計算を外す、(2) sidecar 束縛検査 PSC_CONTRACT_UNBOUND を外す、(3) loadSemanticBoundaryInputs を空集合にする（起草時の 2 本目 test に対する実測。当該 test は L8 の U-PSC-006 と重複していたため review round1 で削除しており、**現行の本 test では該当 mutation を検知しない**。authoring 境界の kill は U-PSC-006 が担う）。CAS は **単層 mutation が survive** する: pre-lock チェックのみ除去 / in-lock WHERE のみ除去はいずれも他方が同一条件を捕まえるため kill されず、両層同時除去で kill される。これは多重防御であり欠陥ではない（in-lock 層は L8 の U-PSC-004 が rival writer 注入で独立に担保する）。SA-PSC-03a が担保するのは『どちらか一方でも生きていれば stale head が commit されない』こと。**この非対称を隠さず記録する**"
complexity_effect: net_neutral
complexity_justification: "production code 変更 0。test 1 本の追加と、既存 L4/L9 設計の SA 分割記述のみ"
removal_trigger: "HDS-HIL-14 supply-chain freeze が解除されて SA-PSC-01/02/04 が実装され、SA-PSC-03a が end-to-end assertion へ吸収された時"
parent_design: docs/design/helix/L6-function-design/semantic-contract-revalidator.md
pair_artifact: docs/test-design/helix/L8-semantic-contract-revalidator-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/semantic-contract-revalidator.md, oracle_id: U-PSC-007, test_path: tests/psc-gate-system.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — SA-PSC-01〜04 のうち実装可能な範囲とブロック範囲の切り分け" }
  - { role: se, slot_label: "SE — 実 doc・実 gate・実 sqlite を通す system assertion" }
  - { role: qa, slot_label: "QA — partial write 0 の観測点設計と mutation 実測" }
  - { role: tl, slot_label: "TL — L8 の再実行にしない境界と、ブロック記録の妥当性" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-531-psc-l9-gate-system.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/python-semantic-core-node-boundary.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-semantic-contract-revalidator-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L4-python-semantic-core-node-boundary-system-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/psc-gate-system.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L4-53-python-semantic-core-node-boundary.md
  requires:
    - docs/plans/PLAN-L7-527-psc-gate-wiring.md
  references:
    - docs/design/helix/L5-detail/python-worker-runtime.md
  blocks: []
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T12:36:15Z"
    tests_green_at: "2026-08-09T12:36:15Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLI は #177 の cross-runtime advisory で使用済みのため、本スライスは規定代替の intra_runtime_subagent（claude-sonnet-5, read-only）が 2 ラウンドでレビューした。round1 request_changes（Critical 0 / Important 2 / Minor 2）: **overclaim の指摘**。起草時に差別化点として挙げた『実 doctor gate を実 repo に対して走らせる』は新規ではなく、U-PSC-006（tests/semantic-boundary.test.ts:198 の実 repo regression fence）が既に analyzeSemanticBoundary と checkSemanticBoundary を実 repo で実行し、違反注入で fence の実効性まで実証していた。是正: 重複していた 2 本目の test を削除し（未使用 import も除去）、差別化の主張を 3 点から 2 点（実 doc digest / partial write 0 の全テーブル観測）へ訂正、SA-PSC-03a の authoring 境界面は U-PSC-006 を citation する形へ改め、L4 / L9 / L8 の 3 doc と本 PLAN すべてに訂正の跡を残した。削除した test でのみ観測できていた mutation kill（gate 入力の空集合化）も『現行では検知せず U-PSC-006 が担う』と明記した。round2 approve（Critical 0 / Important 0 / Minor 1）。Minor の L8 doc 見出し語の不整合は本 commit で解消した。**ブロック判断の評価**: reviewer は SA-PSC-01/02/04/03b のブロックが逃げでないことを独立検証した（`.py` 0 件、CI に Python toolchain 無し、HDS-HIL-14 freeze 宣言が本 PLAN より前の commit で既存、SemanticCommitBundleV1 に evidence 面が無い）。ただし『#230 の本丸である Python 意味コア↔Node 境界の end-to-end は今回何も着地しておらず、着地したのは Node 単体で完結する範囲のみ』という残存スコープを ship 判断者が認識すべき、との評価も付いている。reviewer は CAS 単層 mutation の survive と L8 側での kill を自ら再現し、本 PLAN の非対称記述と一致することを実測した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/psc-gate-system.test.ts tests/semantic-boundary.test.ts tests/semantic-commit-store.test.ts tests/ddd-tdd-rules.test.ts tests/design-coverage.test.ts tests/design-language.test.ts tests/impl-plan-trace.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/digest.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T12:36:15Z", evidence_path: tests/psc-gate-system.test.ts, output_digest: "sha256:2c3226cdb7f338fc4db152544508b04fb394ca7ed0f90b7aca814d3a2a79f4a3", result: "9 files / 85 tests green、skip 0" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T12:36:15Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（出力なし）" }
      - { kind: lint, command: "npx --no-install biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T12:36:15Z", evidence_path: biome.json, output_digest: "sha256:0316c1eb493d2c5ed70b8ec76d3fba15e3ad7d701a0280676e264a75ffe893b3", result: "exit 0（error 0。warning は本 diff 外由来で純増 0）" }
---

# PLAN-L7-531: L9 実 gate system assertion（SA-PSC-03a）

## §1 目的と、やらないことの確定

#230 の残りは L9 SA-PSC-01〜04 だった。着手前に inventory を取ったところ、**大半が実装不能**で
あることが判明した。本 PLAN は実装可能な範囲だけを切り出して着地させ、残りをブロックとして
設計側に明示する。

| SA | 状態 | 根拠 |
|---|---|---|
| SA-PSC-01 | ブロック | 実 hybrid document を **Python 意味コアへ通す**ことを要求。repository に `.py` は 0 件、CI に Python toolchain も無い |
| SA-PSC-02 | ブロック | **Python プロセスの実 spawn** の env / argv / cwd / network を検査する assertion。spawn 対象が存在しない |
| SA-PSC-03a | **本 PLAN で実装** | drift 4 種 + 別 authoring DB / reverse write。Node 側の実装が揃っている |
| SA-PSC-03b | ブロック | browser evidence 偽装の検知。`SemanticCommitBundleV1` に evidence 面が無く、`src/semantic/` に関連実装も無い |
| SA-PSC-04 | ブロック | 実 211-file inventory を **Python 意味コアが** intake receipt へ固定する経路。同上 |

ブロックの根拠は L5 `docs/design/helix/L5-detail/python-worker-runtime.md` §0（該当行 51）の
自己宣言である。同節は、Python の version・interpreter provenance・package と lock・worker root と
entrypoint・wheel と sdist・SBOM と license がいずれも未 freeze であるとしたうえで、対応する
Forward PLAN、pair-freeze、Node minimum、HDS-HIL-14 supply-chain gate が揃わない限り
実装も active 化も行わないと宣言している。

これは package を増やすかどうかの話ではなく、**interpreter provenance と SBOM を含む
supply-chain の凍結判断**であるため、AI 側で決めずに PO の disposition を要する
（`docs/governance/infinity-loop-design-slice-registry.md` 上も HDS-HIL-14 は「未凍結・未実装」）。

## §1.1 oracle ID の採番

harness の PLAN schema は oracle ID に `U-` / `IT-` 接頭辞のみを許す（`PLAN_SPECIFIC_ORACLE_ID_PATTERN`）。
そのため機械側の束縛は **U-PSC-007** とし、L9 設計側が SA-PSC-03a の citation として
`tests/psc-gate-system.test.ts` を指す二段構えにする。SA-UDP / SA-PSC 系の実装が現時点で 0 件
である一因はこの採番規約であり、本 PLAN では規約を変えずに従う。

## §2 SA-PSC-03a が L8 の再実行でない理由（および重複していた点の訂正）

新規に足す観測は 2 点である。

1. **実 repository の実 doc**（ディスクから読んだ実 digest）を source にする。
2. 違反 1 件ごとに **`harness.db` の semantic 全テーブル行数が不変**であることを観測する。
   head だけを見ると result 行だけ残る partial write を見逃す。

**訂正**: 起草時は「実 doctor gate を実 repo に対して走らせる」ことも差別化点として挙げ、
そのための test を本書へ書いていた。しかし `tests/semantic-boundary.test.ts`（U-PSC-006）が
既に実 repo に対して `analyzeSemanticBoundary` と `checkSemanticBoundary` を実行し、
**違反注入で fence の実効性まで実証している**。重複であり overclaim だったため、当該 test を
削除し、SA-PSC-03a の authoring 境界面は U-PSC-006 を citation する形へ改めた
（review round1 の指摘）。

## §3 工程表

### Step 1: inventory（SA-PSC-01〜04 の実装可能性を実コードで確認）[直列]

根拠: downstream_dependency（実装不能な assertion を書くと実装不在のまま green になる）。

### Step 2: SA-PSC-03 の分割を L4 §3 と L9 テスト設計へ反映 [直列]

根拠: shared_state（fail-close 対象の全列挙は L4 §3 が正本であり、片側だけ変えると乖離する）。

### Step 3: SA-PSC-03a の実装と mutation 実測 [直列]

根拠: downstream_dependency（分割後の範囲が確定してからでないと oracle の境界が決まらない）。

### Step 4: review → commit → PR → CI → merge → Issue evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一 owner 収束）。

## §3.1 実装計画

production code は変更しない。`tests/psc-gate-system.test.ts` を新設し、実 doc
（`docs/design/helix/L4-basic-design/python-semantic-core-node-boundary.md`）の実 digest を
source として `buildSemanticCommit` → `commitSemanticResult` → 実 sqlite を通す。
drift 4 種（source / sidecar / schema / digest）は build 段で、HEAD drift は commit 段で
fail-close することと、各ケースで `readSemanticCommitStatus` の counts が全て 0 のまま
であることを観測する。別 authoring DB / reverse write は既存の U-PSC-006（`tests/semantic-boundary.test.ts` の
実 repo regression fence）が押さえており、本 PLAN では重複実装しない。

## §4 CAS mutation の非対称（隠さず記録する）

CAS は pre-lock チェック（`semantic-commit-store.ts` の `currentHead?.semantic_head !==
bundle.before_semantic_head`）と in-lock `WHERE ... AND semantic_head = ?` の 2 層で守られている。
片方だけを外す mutation は他方が同一条件を捕まえるため **survive** し、両層同時に外すと kill
される。これは欠陥ではなく多重防御であり、in-lock 層は L8 の U-PSC-004（rival writer 注入）が
独立に担保する。SA-PSC-03a が担保しているのは「どちらか一方でも生きていれば stale head が
commit されない」ことである。単層 survive を伏せて「全 mutation kill」と書かない。

## §5 本 PLAN の非対象

- SA-PSC-01 / SA-PSC-02 / SA-PSC-04（HDS-HIL-14 supply-chain freeze の解除が前提）
- SA-PSC-03b（browser evidence 検知の受け皿の実装）
- Python 意味コアそのものの実装
