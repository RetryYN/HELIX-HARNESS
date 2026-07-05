---
plan_id: PLAN-L4-51-helix-pillar-basic-design
title: "PLAN-L4-51 (add-design): HELIX L3 pillar FR/NFR -> L4 basic design descent"
kind: add-design
layer: L4
drive: agent
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: AIM + TL (Codex)
pair_artifact: docs/test-design/helix/L4-pillar-system-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL - L3 HR-FR/HR-NFR 43件を L4 basic design へ漏れなく降下し G-DESIGN.L4 を再確認"
  - role: qa
    slot_label: "QA - L4 design と L9 system test design の孤児0・43件被覆を検証"
generates:
  - artifact_path: docs/plans/PLAN-L4-51-helix-pillar-basic-design.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L4-00-master.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L4-50-orchestration-memory-hybrid.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L4-pillar-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/external-if.md
    artifact_type: design_doc
dependencies:
  parent: PLAN-L4-00-master
  requires:
    - PLAN-L3-06-helix-pillar-descent
    - PLAN-L4-00-master
  blocks: []
  references:
    - docs/design/helix/L3-requirements/pillar-functional-requirements.md
    - docs/test-design/helix/L3-pillar-acceptance-test-design.md
    - docs/design/harness/L4-basic-design/data.md
    - docs/design/harness/L4-basic-design/architecture.md
    - docs/design/harness/L4-basic-design/function.md
    - docs/design/harness/L4-basic-design/external-if.md
    - docs/plans/PLAN-L4-50-orchestration-memory-hybrid.md
    - docs/plans/PLAN-L6-50-helix-orchestration-memory.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
review_evidence:
  - reviewer: codex-tl-audit
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-28"
    tests_green_at: "2026-06-28"
    verdict: approve
    worker_model: gpt-5.5
    reviewer_model: gpt-5.5
    scope: "Codex-only TL tier review for L4 add-design: L3 HR-FR/HR-NFR 43件 -> L4 design/test-design 43件の全件 trace、superseded PLAN-L4-50 の historical record 扱い、G-DESIGN.L4 span 更新。cross_agent は利用不可のため intra_runtime fallback として記録。"
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/vmodel-pair.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-28"
        evidence_path: tests/vmodel-pair.test.ts
        output_digest: "sha256:e09dec550cb920ef2998eb286243542bf8a2043b5db5045d88ea049c1e65c272"
      - kind: smoke
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L4-51-helix-pillar-basic-design.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-28"
        evidence_path: .helix/evidence/green-command/20260630-plan-lint-l4-51.json
        output_digest: "sha256:c087e8f29733864a6b7627dd4cc0be3ffee886f479181599316203c8103711d2"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-28"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-28"
        evidence_path: biome.json
        output_digest: "sha256:b70d2d1403c671399680ca5c783e86591fde85e10dc57c45be2c8806f0549cf7"
---

# PLAN-L4-51: HELIX L3 pillar から L4 基本設計への降下（HELIX L3 pillar -> L4 basic design descent）

## §0 なぜ

`PLAN-L3-06` で HELIX L1 pillar は L3 `HR-FR-*` / `HR-NFR-*` / `HAC-*` に降下して `confirmed`
になった。一方、既存 L4 正本は harness 既存 `FR-*` / `FR-L1-*` を対象にしており、HELIX 名前空間の
43 件は L4 設計面（design surface）に 0 件しか出ていなかった。

本 PLAN は L4 add-design として、L3 43 件を L4 基本設計（basic design）の構成ブロック（building block）、
data/projection、外部境界（external boundary）、system-test 観測へ漏れなく降下する。既存 harness L4
4 sub-doc は破壊的に置換しないが、`FR 26 件` が harness core only であること、HELIX 43 件が別
namespace で L4 閉包済みであること、P6/P8/AC の外部境界・projection carry が既存 L4 本体から読めるように修正する。

## §工程表

### Step 1: [直列] L3 / 既存 L4 精読

- 対象: `pillar-functional-requirements.md`、既存 harness L4 `data/architecture/function/external-if`、`PLAN-L4-50`。
- 結果: 既存 L4 surface には `HR-FR/HR-NFR` 43 件の直接 trace が無かった。`PLAN-L4-50` は L6-50 に superseded 済みの historical record だったため、archive で閉じず `status: confirmed` のまま後継 trace を読む対象とした。

### Step 2: [直列] L4 基本設計（basic design）作成 + 既存 L4 本体修正

- 成果: `docs/design/helix/L4-basic-design/pillar-basic-design.md`。
- 内容: L4 block 10 種、L3 43 件の全件降下表、projection / external-if / security / DDD/TDD / API 非前提の L4 設計判断。
- 既存 L4 修正: `function.md` に core 26 件と HELIX 43 件の責務境界（scope boundary）/ overlay を追加、`architecture.md` に provider API/SDK への core 依存なし（no provider API/SDK core dependency）の overlay を追加、`data.md` に approval/research/security/glossary/metric/contract の projection carry を追加、`external-if.md` に external research / sandbox / release / hosted API の boundary を追加。

### Step 3: [直列] L9 システムテスト設計（system test design）作成

- 成果: `docs/test-design/helix/L4-pillar-system-test-design.md`。
- 内容: L4 43 件のシステムテスト（system test）観測を L3 43 件へ 1:1 接続。coverage-only 完了主張ではなく、各 block の system 観測を定義。

### Step 4: [直列] L4 master と superseded PLAN の整合

- `PLAN-L4-00-master` に `PLAN-L4-51` を `G-DESIGN.L4` span として追加。
- `PLAN-L4-50-orchestration-memory-hybrid` は L6-50 が supersedes 済みの historical record なので、`confirmed` のまま後継 trace と誤起票記録を保持する。

### Step 5: [直列] 機械検証

- `U-VPAIR-007a/b/c/d/e/f` で L3 43 件 -> L4 design -> L9 test-design の孤児 0、既存 L4 本体修正、L4 block ID 誤記なし、historical record 状態を固定。
- `plan lint` / `typecheck` / `lint` / `doctor` で L4 span と pair-freeze を確認する。

### Step 6: [直列] Route-B back-fill 境界監査（2026-06-29 追補）

- L3 back-fill 8 件は pillar 43 件へ二重計上しないが、L4 責務から外すわけではないため、受け先 block を
  意味単位で再監査した。
- 修正: job queue は `HB-P1`、hybrid 自己評価禁止は `HB-P3`、memory は `HB-P7`、runtime bridge は
  `HB-P2` / `HB-AC`、loop entrypoint は `HB-P1` / `HB-P2` に接続する。旧表現の
  `HB-P2 / HB-P7 / HB-AC` だけでは不十分だったため、`pillar-basic-design.md` §2.1 と
  `L4-pillar-system-test-design.md` §1.1 に明示した。

## §G-DESIGN.L4 準備状況監査（readiness audit）

| 要求 / 不変条件 | 証跡（Evidence） | 判定 |
|-----------------|----------|------|
| L3 43 件を 1 件も漏らさず L4 へ降下 | `pillar-basic-design.md` §2、`U-VPAIR-007a` | 準備済み |
| L4 design と L9 system test design が pair | 両文書 `pair_artifact`、`U-VPAIR-007b` | 準備済み |
| L4 system test が L3 43 件を 1:1 観測 | `L4-pillar-system-test-design.md` §1、`U-VPAIR-007c` | 準備済み |
| P2/P7 の既存 L4-50 を archive で隠さない | `PLAN-L4-50` は confirmed historical record として保持し、L6-50 supersedes back-reference を維持 | 準備済み |
| API/SDK 常駐前提へ退行しない | `HB-AC` / `HB-P2` / `HB-P8` block、`HR-NFR-AC-03` | 準備済み |
| L2 skip / template workflow を L4 surface に持つ | `HB-P1`、`HR-FR-P1-04` | 準備済み |
| context budget, test speed/load, implementation accuracy, L-layer regression, metrics/improvement, security filter を L4 block に持つ | `HNFR-P5` は `HB-P1` / `HB-P3` に降下し、他は `HB-P3` / `HB-P4` / `HB-P8` / `HB-P9` に降下 | 準備済み |
| 既存 `function.md` の 26 件表記が HELIX 43 件未反映に見えない | `function.md` §0/§1.3、`U-VPAIR-007d` | 準備済み |
| 既存 `architecture.md` が HELIX overlay と API/SDK 非依存を読める | `architecture.md` §3.1.1、`U-VPAIR-007d` | 準備済み |
| 既存 `data.md` が approval/research/security/glossary/metric/contract concern を落とさない | `data.md` §8.2、`U-VPAIR-007d` | 準備済み |
| 既存 `external-if.md` が external research/sandbox/release/hosted API 境界を持つ | `external-if.md` §1-§4、`U-VPAIR-007d` | 準備済み |
| Route-B back-fill 8 件を L4 責務から落とさず、かつ pillar 43 件へ二重計上しない | `pillar-basic-design.md` §2.1、`L4-pillar-system-test-design.md` §1.1、`U-VPAIR-005j` | 準備済み |

## §完了条件（DoD）

- [x] L3 43 要件を L4 design に全件 trace。
- [x] L4 design と L9 test-design の pair を作成。
- [x] `PLAN-L4-00-master` の `G-DESIGN.L4` span に追加。
- [x] superseded 済み L4-50 を archive で閉じず、live draft と後継 trace で扱う。
- [x] 既存 L4 `function` / `architecture` / `data` / `external-if` の scope/carry/boundary を修正。
- [x] targeted regression test を追加。
- [x] Route-B back-fill 8 件の L4 block boundary を HB-P1 / HB-P2 / HB-P3 / HB-P7 / HB-AC に明示し、二重計上しない境界を test-design にも追加。
