---
plan_id: PLAN-RECOVERY-40-kimi-admission-lane-closure-digest
title: "PLAN-RECOVERY-40 (recovery): Kimi 独立レビュー lane の admission 束縛を lane closure digest へ是正 (issue #390)"
kind: recovery
layer: cross
drive: be
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-09 PO 指示「自走しろ」。PLAN-RECOVERY-39 の受け入れ試験 green 後に通し稽古を試みたところ、admission が main 上で原理的に成立しないことを実測で確認した。`admission_implementation_head` が 40 桁 git sha で利用時に `git rev-parse HEAD` との完全一致を要求するが、本 repository は merge commit 方式のため lane PR の head sha は merge 後の main HEAD と決して一致しない（実測: PR #481 head 27a15fa0 / merge commit 5c77ba27）。さらに lane と無関係な merge のたびに失効する"
status: completed
created: 2026-08-09
updated: 2026-08-09
owner: AIM (Claude) / TL
github_issue_id: 390
behavior_contract_id: KIMI-REVIEW-FALLBACK-001
responsibility_owner: independent-review-fallback-router
parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md
pair_artifact: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
supersedes: []
review_evidence:
  - reviewer: "Claude primary runtime (実測 bench + negative mutation oracle)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T06:40:00Z"
    tests_green_at: "2026-08-09T06:35:00Z"
    verdict: approve
    worker_model: kimi-cli-v0.29.2
    reviewer_model: claude-opus-5
    scope: "admission の同一性束縛を repository の commit id から lane 実装の material closure digest へ是正した。closure = lane source 固定集合 7 file と provider material（Kimi CLI binary digest、model）の sorted manifest。bench 5/5 pass（clean_approve / seeded_blocker は bubblewrap 隔離下の実 Kimi 起動）、negative mutation 6/6 kill（既存 4 件 + 新規 closure_member_drift / closure_member_removed）。新規 2 件は closure digest 束縛が名目でないこと、すなわち member の内容変更と member 削除がどちらも実際に失効を起こすことを示す。HEAD 束縛の撤去は緩和ではなく是正であり、緩むのは lane と無関係な範囲だけである。24 時間上限、Claude review による bootstrap アンカー、bench case exact set、proposal-only、risk 上限 low/medium は不変。TOCTOU 対策として review 完了後にも closure digest を再実測する。"
    green_commands:
      - { kind: smoke, command: "npx --no-install tsx tests/tools/kimi-review-admission/run-admission-bench.ts docs/research/assets/kimi-review-lane-admission-2026-08-09", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T06:20:00Z", evidence_path: docs/research/assets/kimi-review-lane-admission-2026-08-09/summary.json, output_digest: "sha256:52e9958f3faf0a19ab1149ea88da408d6c9d1542305db86d4b73e93f0036d348", result: "bench case 5/5 pass, negative mutation 6/6 killed, lane_closure_digest=sha256:2240ebb8411da111a3a76c106c58478ff8245dd740e119530738fc5bb588e4c5" }
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/independent-review-fallback.test.ts tests/kimi-review-admission-bench.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T06:30:00Z", evidence_path: tests/kimi-review-admission-bench.test.ts, output_digest: "sha256:8d7b23f5ccef80e74570e8aeca626d626ca298161f35a3c55f8072bc8233dbb2", result: "2 files / 28 tests passed" }
      - { kind: typecheck, command: "npm run typecheck", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T06:32:00Z", evidence_path: tsconfig.json, output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc", result: "exit 0" }
      - { kind: lint, command: "npx --no-install biome check src tests", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T06:33:00Z", evidence_path: biome.json, output_digest: "sha256:265873c812569c2685bdf6e68b14f13f34f25e96c299235a8807d308b9d9a6a2", result: "0 error" }
      - { kind: doctor, command: "npx --no-install tsx src/cli.ts doctor", runner: node, scope: gate, exit_code: 0, completed_at: "2026-08-09T06:35:00Z", evidence_path: docs/plans/PLAN-RECOVERY-40-kimi-admission-lane-closure-digest.md, output_digest: "sha256:b1c6ef042a4ed62f33e99f952502b5719c6d85a979ec81096ab67bef208bd5e3", result: "本PLAN由来のviolation 0" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-012a, test_path: tests/kimi-review-admission-bench.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-012b, test_path: tests/kimi-review-admission-bench.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-012c, test_path: tests/kimi-review-admission-bench.test.ts }
agent_slots:
  - role: aim
    slot_label: "AIM — admission が main 上で成立しない構造欠陥の特定と是正方針の決定"
  - role: se
    slot_label: "SE — lane closure digest の実装と admission 経路の差し替え"
  - role: qa
    slot_label: "QA — closure 束縛の完全性を示す negative mutation の設計と kill 確認"
generates:
  - artifact_path: docs/plans/PLAN-RECOVERY-40-kimi-admission-lane-closure-digest.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/review-lane-closure.ts
    artifact_type: source_module
  - artifact_path: src/runtime/independent-review-fallback.ts
    artifact_type: source_module
  - artifact_path: src/cli/commands/review-fallback.ts
    artifact_type: source_module
  - artifact_path: tests/kimi-review-admission-bench.test.ts
    artifact_type: test_code
  - artifact_path: tests/independent-review-fallback.test.ts
    artifact_type: test_code
  - artifact_path: tests/tools/kimi-review-admission/run-admission-bench.ts
    artifact_type: test_code
  - artifact_path: tests/tools/kimi-review-admission/admission-evidence.ts
    artifact_type: test_code
  - artifact_path: docs/design/helix/L6-function-design/independent-review-fallback.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/research/kimi-admission-lane-closure-digest-2026-08-09.md
    artifact_type: markdown_doc
dependencies:
  parent: null
---

# PLAN-RECOVERY-40 — admission 束縛を lane closure digest へ是正

## 1. 背景

PLAN-RECOVERY-39 で admission bench を実装し 5/5 pass・4/4 kill を実測したが、その受け入れ試験を
使って実際に lane を通す段（通し稽古）で、admission が main 上で原理的に成立しないことが分かった。

`admission_implementation_head` は 40 桁 git sha であり、利用時に
`validateKimiReviewFallbackAdmissionForImplementation` が作業リポジトリの `git rev-parse HEAD` と
完全一致を要求していた。本 repository は merge commit 方式なので、受け入れ試験を実施した lane PR の
head sha は merge 後の main HEAD と決して一致しない（実測: PR #481 head `27a15fa0` /
merge commit `5c77ba27`）。加えて、lane と何の関係もない merge が起きるだけでも失効した。

担保したかったのは「受け入れ試験を通した実装＝実際に動く実装」の同一性であるのに、担保対象が
**実装ではなく repository 全体の commit id** になっていたのが誤りである。

## 2. 是正

同一性の担保対象を lane 実装そのものの material closure digest に置き換える
（`src/runtime/review-lane-closure.ts`）。

closure = 次の sorted manifest の digest。

- lane source 固定集合（`REVIEW_LANE_CLOSURE_PATHS` の 7 file）の `(path, sha256(bytes))`
- provider material: Kimi CLI 実行 binary 全体の digest、model 名

member path の一覧自体が manifest に含まれるため、member を削って digest を素通りさせることは
できない。member が 1 件でも読めない場合は fail-close する。provider material は CLI を起動せず
binary digest で捉える（version 文字列は起動しないと得られず、同一 version 内の差し替えも
捕まえられない）。

`admission_implementation_head` は provenance として receipt に残すが、gate には使わない。

## 3. 維持するもの（緩和していないこと）

- 24 時間の有効期間上限（build / validate 双方）
- Claude review receipt による bootstrap アンカー（Kimi の自己 admit 禁止）
- bench case 5 件の exact set と期待結果の一致
- proposal-only、write/commit/merge 権限なし、admitted risk = low/medium
- Kimi 起動前の clean worktree / CI green / DB converged 検査、および review 後の再検査

HEAD 束縛の撤去は緩和ではなく是正である。緩むのは **lane と無関係な範囲だけ**であり、lane closure が
1 byte でも変われば従来どおり失効する。むしろ provider binary の差し替えという、旧 HEAD 束縛では
捕まえられなかった drift を新たに捕まえる。

## 4. TOCTOU

closure digest は Kimi 起動前だけでなく review 完了後にも再実測し、開始時の値と一致しなければ
receipt を発行しない。開始時の照合だけでは review 実行中の差し替えに窓が残る。

## 5. 受入条件（falsifiable）

| # | 条件 | 検証 |
|---|---|---|
| AC-1 | closure digest が一致すれば、receipt の implementation_head と作業リポジトリ HEAD が異なっていても admission は有効 | U-IRF-012a |
| AC-2 | bench evidence と negative oracle evidence の closure digest 不一致は admission を発行させない | U-IRF-012b |
| AC-3 | closure member の内容変更・member 削除はどちらも digest を動かし利用を拒否する | U-IRF-012c、bench mutation `closure_member_drift` / `closure_member_removed` |
| AC-4 | 実 Kimi 起動を含む bench が case 5/5 pass、mutation 6/6 kill で通る | `docs/research/assets/kimi-review-lane-admission-2026-08-09/summary.json` |

AC-3 の prose 主張の機械的代替は上記 negative mutation であり、文章ではない。

## 6. 残リスク

- closure に載っていない file の変更は admission を失効させない。closure member 一覧の追加・削除は
  lane の security 境界の変更として扱い、本 PLAN 以降も勝手に縮小しない。
- Claude review receipt の bootstrap は依然として必要である。lane 実装 1 バージョンにつき 1 回で
  足りるが、その 1 回が発生しなければ lane は使えないままである。この可用性は本 PLAN の対象外で、
  通し稽古で別途測る。
