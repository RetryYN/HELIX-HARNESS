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
    scope: "Codex-only TL tier review for L5 add-design: L4 HB 10 block / HR 43件 -> L5 detail contract / L8 integration test 43件の全件 trace、G-DESIGN.L5 span 更新。cross_agent は利用不可のため intra_runtime fallback として記録。2026-06-29 に green_commands の fake digest を安定証跡JSONの実SHA256へ補正し、同日に意味設計監査で HC-* ごとの input/projection/output/fail-close/L6 carry と旧 HELIX source read-only audit 境界を追補。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/vmodel-pair.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-29"
        evidence_path: .helix/evidence/helix-l5/20260629-l5-09-vmodel-pair.json
        output_digest: "sha256:06763bf61f3a91c4cb257a16b265843cbd702e241eb791928161e4da6641562c"
      - kind: smoke
        command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L5-09-helix-pillar-detail-design.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-29"
        evidence_path: .helix/evidence/helix-l5/20260629-l5-09-plan-lint.json
        output_digest: "sha256:d1e8dabefa4d8231880c699ed9482a067698004afbfad788a987c230cb1c965f"
---

# PLAN-L5-09: HELIX L4 pillar から L5 詳細設計への降下（HELIX L4 pillar -> L5 detail design descent）

## §0 なぜ

`PLAN-L4-51` で HELIX L3 43件は L4 基本設計（basic design）へ降下済みになった。一方、既存 L5 正本は
harness core の 4 sub-doc と内部資産/DB feedback を対象にしており、HELIX pillar 名前空間の `HB-*`
10 block を L5 詳細契約（detailed contract）と L8 結合観測（integration observation）へ降ろしていなかった。

本 PLAN は L5 add-design として、L4 10 block / 43 件を L5 詳細契約（detailed contract）と
L8 結合テスト設計（integration test design）へ漏れなく降下する。既存 harness L5 4 sub-doc は破壊的に置換しない。

## §工程表

### Step 1: [直列] L4 / 既存 L5 精読

- 対象: `pillar-basic-design.md`、既存 harness L5 `physical-data/module-decomposition/internal-processing/if-detail`、L8。
- 結果: 既存 L5 surface には HELIX `HB-*` / `HC-*` の直接 trace が無い。L5 master の終了基準（exit criteria）に L5 と L9 を結ぶ誤った V-pair 表記があったが、本文と V-model 正本は `L5↔L8`。

### Step 2: [直列] L5 詳細設計（detail design）作成

- 成果: `docs/design/helix/L5-detail/pillar-detail-design.md`。
- 内容: L5 contract 10 種、L4/L3 43 件の全件降下表、物理データ（physical data）/ module boundary / D-CONTRACT / fail-close の L5 設計判断。

### Step 3: [直列] L8 結合テスト設計（integration test design）作成

- 成果: `docs/test-design/helix/L5-pillar-integration-test-design.md`。
- 内容: `LIT-*` 46 件を L3 46 件へ 1:1 接続。各 L5 contract の結合境界（integration boundary）を Given/When/Then で観測する。

### Step 4: [直列] L5 master 整合

- `PLAN-L5-00-master` に `PLAN-L5-09` を `G-DESIGN.L5` span として追加。
- `G-DESIGN.L5` exit criteria の誤った V-pair 表記を `L5↔L8` へ修正する。

### Step 5: [直列] 機械検証

- `U-VPAIR-009a/b/c/d` で L4 43 件 -> L5 design -> L8 test-design の孤児 0、L5 master span、contract ID 誤記なしを固定。
- `plan lint` / `typecheck` / `lint` / `doctor` で L5 span と pair-freeze を確認する。

### Step 6: [直列] 意味設計監査 (2026-06-29 追補)

- 上位要求・機能一覧・L3/L4/L5/L8 を再読し、L5 が件数 trace に留まっていないかを確認する。
- 旧 HELIX source (`RetryYN/ai-dev-kit-vscode` commit `1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23`) を read-only 監査し、Forward 返却、DB 収束、Recovery guard、asset/catalog 接続の設計素材を L5 contract へ翻案する。
- `pillar-detail-design.md` に `HC-*` ごとの input / projection boundary / output / fail-close / L6 carry を追加し、`L5-pillar-integration-test-design.md` に integration observation contract を追加する。

### Step 7: [直列] Route-B back-fill contract 境界監査（2026-06-29 追補）

- L3 back-fill 8 件は pillar 43 件へ二重計上しないが、L5 contract の責務から外すわけではないため、
  受け先 contract を意味単位で再監査した。
- 修正: job queue は `HC-P1`、loop/tick は `HC-P2`、hybrid 自己評価禁止は `HC-P3`、memory は
  `HC-P7`、runtime bridge/preflight は `HC-AC` に接続する。旧表現の `HC-P2 / HC-P7 / HC-AC`
  だけでは不十分だったため、`pillar-detail-design.md` §2.1 と `L5-pillar-integration-test-design.md`
  §1.1 に明示した。

## §G-DESIGN.L5 準備状況監査（readiness audit）

| 要求 / 不変条件 | 証跡（Evidence） | 判定 |
|-----------------|----------|------|
| L4 43 件を 1 件も漏らさず L5 へ降下 | `pillar-detail-design.md` §2、`U-VPAIR-009a` | 準備済み |
| L5 design と L8 integration test design が pair | 両文書 `pair_artifact`、`U-VPAIR-009b` | 準備済み |
| L8 integration test が L3 43 件を 1:1 観測 | `L5-pillar-integration-test-design.md` §1、`U-VPAIR-009c` | 準備済み |
| L5 master が HELIX L5 add-design を span に含む | `PLAN-L5-00-master` roadmap、`U-VPAIR-009d` | 準備済み |
| L5↔L8 が V-pair 正本であり誤った L9 ペア表記を残さない | `PLAN-L5-00-master` exit criteria、`U-VPAIR-009d` | 準備済み |
| L5 が単なる ID trace ではなく contract input/projection/output/fail-close/L6 carry を持つ | `pillar-detail-design.md` §3、`U-VPAIR-009a` | 準備済み |
| 旧 HELIX source は read-only 設計素材として anti-corruption 境界つきで反映 | `pillar-detail-design.md` §4、`L5-pillar-integration-test-design.md` §4、`U-VPAIR-009a/c` | 準備済み |
| Route-B back-fill 8 件を L5 contract から落とさず、かつ pillar 43 件へ二重計上しない | `pillar-detail-design.md` §2.1、`L5-pillar-integration-test-design.md` §1.1、`U-VPAIR-005j` | 準備済み |

## §完了条件（DoD）

- [x] L4 43 要件を L5 detail design に全件 trace。
- [x] L5 detail design と L8 integration test design の pair を作成。
- [x] `PLAN-L5-00-master` の `G-DESIGN.L5` span に追加。
- [x] L5 master の誤った V-pair 表記を修正。
- [x] targeted regression test を追加。
- [x] 意味設計監査で `HC-*` contract matrix と旧 HELIX source anti-corruption 境界を追補。
- [x] Route-B back-fill 8 件の L5 contract boundary を HC-P1 / HC-P2 / HC-P3 / HC-P7 / HC-AC に明示し、二重計上しない境界を test-design にも追加。
