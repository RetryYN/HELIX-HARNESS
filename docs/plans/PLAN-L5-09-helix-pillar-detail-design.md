---
plan_id: PLAN-L5-09-helix-pillar-detail-design
title: "PLAN-L5-09 (add-design): HELIX L4 pillar block -> L5 detail design descent"
kind: add-design
layer: L5
drive: agent
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: AIM + TL (Codex)
pair_artifact: docs/test-design/helix/L5-pillar-integration-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL - L4 HB 10 block / HR 43件を L5 detail contract へ漏れなく降下し G-DESIGN.L5 を再確認"
  - role: qa
    slot_label: "QA - L5 detail と L8 integration test design の孤児0・43件被覆を検証"
generates:
  - artifact_path: docs/plans/PLAN-L5-09-helix-pillar-detail-design.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L5-00-master.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L5-detail/pillar-detail-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-pillar-integration-test-design.md
    artifact_type: test_design
dependencies:
  parent: PLAN-L5-00-master
  requires:
    - PLAN-L4-51-helix-pillar-basic-design
    - PLAN-L5-00-master
  blocks: []
  references:
    - docs/design/helix/L4-basic-design/pillar-basic-design.md
    - docs/test-design/helix/L4-pillar-system-test-design.md
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/harness/L5-detailed-design/module-decomposition.md
    - docs/design/harness/L5-detailed-design/internal-processing.md
    - docs/design/harness/L5-detailed-design/if-detail.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
review_evidence:
  - reviewer: codex-tl-audit
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-29"
    tests_green_at: "2026-06-29"
    verdict: approve
    worker_model: gpt-5.5
    reviewer_model: gpt-5.5
    scope: "Codex-only TL tier review for L5 add-design: L4 HB 10 block / HR 43件 -> L5 detail contract / L8 integration test 43件の全件 trace、G-DESIGN.L5 span 更新。cross_agent は利用不可のため intra_runtime fallback として記録。2026-06-29 に green_commands の fake digest を安定証跡JSONの実SHA256へ補正。"
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/vmodel-pair.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-29"
        evidence_path: .ut-tdd/evidence/helix-l5/20260629-l5-09-vmodel-pair.json
        output_digest: "sha256:ebc94739505cdfef0bac824e940df6d9ed25691d21afa0cccb4c01fd67815658"
      - kind: smoke
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L5-09-helix-pillar-detail-design.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-29"
        evidence_path: .ut-tdd/evidence/helix-l5/20260629-l5-09-plan-lint.json
        output_digest: "sha256:e55e94bc80365cc8f0eb801f7a5817721b5cb8d9f8bf8d7d44b070d8893a7ec2"
---

# PLAN-L5-09: HELIX L4 pillar -> L5 detail design descent

## §0 なぜ

`PLAN-L4-51` で HELIX L3 43件は L4 basic design へ降下済みになった。一方、既存 L5 正本は harness
core の 4 sub-doc と内部資産/DB feedback を対象にしており、HELIX pillar 名前空間の `HB-*` 10 block を
L5 detailed contract と L8 integration observation へ降ろしていなかった。

本 PLAN は L5 add-design として、L4 10 block / 43 件を L5 detailed contract と L8 integration test design
へ漏れなく降下する。既存 harness L5 4 sub-doc は破壊的に置換しない。

## §工程表

### Step 1: [直列] L4 / 既存 L5 精読

- 対象: `pillar-basic-design.md`、既存 harness L5 `physical-data/module-decomposition/internal-processing/if-detail`、L8。
- 結果: 既存 L5 surface には HELIX `HB-*` / `HC-*` の直接 trace が無い。L5 master の exit criteria に L5 と L9 を結ぶ誤った V-pair 表記があったが、本文と V-model 正本は `L5↔L8`。

### Step 2: [直列] L5 detail design 作成

- 成果: `docs/design/helix/L5-detail/pillar-detail-design.md`。
- 内容: L5 contract 10 種、L4/L3 43 件の全件降下表、physical data / module boundary / D-CONTRACT / fail-close の L5 設計判断。

### Step 3: [直列] L8 integration test design 作成

- 成果: `docs/test-design/helix/L5-pillar-integration-test-design.md`。
- 内容: `LIT-*` 43 件を L3 43 件へ 1:1 接続。各 L5 contract の integration boundary を Given/When/Then で観測する。

### Step 4: [直列] L5 master 整合

- `PLAN-L5-00-master` に `PLAN-L5-09` を `G-DESIGN.L5` span として追加。
- `G-DESIGN.L5` exit criteria の誤った V-pair 表記を `L5↔L8` へ修正する。

### Step 5: [直列] 機械検証

- `U-VPAIR-009a/b/c/d` で L4 43 件 -> L5 design -> L8 test-design の孤児 0、L5 master span、contract ID 誤記なしを固定。
- `plan lint` / `typecheck` / `lint` / `doctor` で L5 span と pair-freeze を確認する。

## §G-DESIGN.L5 readiness audit

| 要求 / 不変条件 | Evidence | 判定 |
|-----------------|----------|------|
| L4 43 件を 1 件も漏らさず L5 へ降下 | `pillar-detail-design.md` §2、`U-VPAIR-009a` | ready |
| L5 design と L8 integration test design が pair | 両文書 `pair_artifact`、`U-VPAIR-009b` | ready |
| L8 integration test が L3 43 件を 1:1 観測 | `L5-pillar-integration-test-design.md` §1、`U-VPAIR-009c` | ready |
| L5 master が HELIX L5 add-design を span に含む | `PLAN-L5-00-master` roadmap、`U-VPAIR-009d` | ready |
| L5↔L8 が V-pair 正本であり誤った L9 ペア表記を残さない | `PLAN-L5-00-master` exit criteria、`U-VPAIR-009d` | ready |

## §DoD

- [x] L4 43 要件を L5 detail design に全件 trace。
- [x] L5 detail design と L8 integration test design の pair を作成。
- [x] `PLAN-L5-00-master` の `G-DESIGN.L5` span に追加。
- [x] L5 master の誤った V-pair 表記を修正。
- [x] targeted regression test を追加。
