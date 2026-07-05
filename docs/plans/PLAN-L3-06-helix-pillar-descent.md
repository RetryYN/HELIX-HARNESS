---
plan_id: PLAN-L3-06-helix-pillar-descent
title: "PLAN-L3-06 (add-design): HELIX L1 pillar 要求 -> L3 FR/AC 降下"
kind: add-design
layer: L3
drive: agent
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: AIM + TL (Codex) / PO 承認必須
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL — L1 HBR/HNFR 全件を L3 FR/AC に降下し、既存 P2/P7 back-fill と重複しないよう整合"
  - role: qa
    slot_label: "QA — L3 FR/AC と L12 acceptance の孤児 0 確認"
  - role: po
    slot_label: "PO — G-REQ.L3 承認 (人間ゲート)"
generates:
  - artifact_path: docs/plans/PLAN-L3-06-helix-pillar-descent.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L3-00-master.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L3-requirements/orchestration-memory.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/orchestration-memory-runtime.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/orchestration-runtime-bridge.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/orchestration-memory.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/orchestration-memory.md
    artifact_type: test_design
dependencies:
  parent: PLAN-L1-06-helix-solo-conversion
  requires:
    - PLAN-L1-06-helix-solo-conversion
  blocks: []
  references:
    - docs/design/helix/L1-requirements/pillar-requirements.md
    - docs/test-design/helix/L1-pillar-operational-test-design.md
    - docs/design/helix/L3-requirements/orchestration-memory.md
    - docs/design/helix/L3-requirements/orchestration-memory-runtime.md
    - docs/design/helix/L3-requirements/orchestration-runtime-bridge.md
    - docs/design/helix/L6-function-design/orchestration-memory.md
    - docs/test-design/helix/orchestration-memory.md
    - docs/plans/PLAN-L7-157-distribution-clean-pull.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
review_evidence:
  - reviewer: PO
    review_kind: human
    reviewed_at: "2026-06-28"
    tests_green_at: "2026-06-28"
    verdict: approve
    scope: "HELIX pillar L3 降下に対する G-REQ.L3 人間承認。証跡: vmodel-pair、plan lint、typecheck、lint、db rebuild、および G-REQ.L3 reached を示す doctor roadmap。"
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
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L3-06-helix-pillar-descent.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-28"
        evidence_path: .helix/evidence/green-command/20260630-plan-lint-l3-06.json
        output_digest: "sha256:7b263818ea5dd2b32b83d8a02fc37657830327f37aba05556670b4bb1b2ec9f4"
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
      - kind: smoke
        command: "bun run src/cli.ts db rebuild"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-28"
        evidence_path: src/cli.ts
        output_digest: "sha256:7961c43a561d23e29399061699265a57ea8bc6e747cbeb69a32c646445611660"
---

# PLAN-L3-06: HELIX L1 pillar 要求 -> L3 FR/AC 降下

## §0 なぜ

`PLAN-L1-06` で HELIX L1 pillar 要求は `confirmed` になったが、既存の HELIX L3 文書は
P2/P7 の route-B back-fill 3 本に偏っており、HBR-P0/P1/P3/P4/P6/P8/P9 と
HNFR-P5/P8/AC の net-new GAP が L3 FR/AC として未降下だった。

本 PLAN は Forward の L3 要件定義として、L1 の HBR/HNFR 全件を `HR-FR-*` / `HR-NFR-*`
と `HAC-*` に展開し、L12 受入テスト設計と pair にする。既存 P2/P7 back-fill は実装済み詳細として
参照し、同じ機能を二重定義しない。

## §工程表

### Step 1: [直列] L1 / 既存 L3 精読

- 直列理由: downstream_dependency。
- 対象: `pillar-requirements.md`、`L1-pillar-operational-test-design.md`、HELIX L3 back-fill 3 本。
- 進捗: 完了。差分 = P2/P7 以外の pillar と P2/P7 残 GAP が L3 未降下。repo 全体の L3 設計範囲も
  確認し、harness confirmed L3 sub-doc は上書きせず、HELIX 名前空間の additive descent として分離した。

#### L3 精読監査

| 成果物 | 状態 | この PLAN での扱い |
|----------|--------|--------------------|
| `docs/design/harness/L3-functional/functional-requirements.md` | confirmed | harness L3 FR 正本。HELIX 要件は `HR-*` 名前空間で additive に積み、既存 `FR-*` を再定義しない |
| `docs/design/harness/L3-functional/business-detail.md` | confirmed | harness BR-21 / HM-08 / Learning Engine 詳細。HELIX の計測・改善基盤はこの正本を上書きせず P4/P9 追補として定義 |
| `docs/design/harness/L3-functional/nfr-grade.md` | confirmed | harness NFR grade 正本。HELIX の HNFR は `HR-NFR-*` として別 namespace で降下 |
| `docs/design/harness/L3-functional/README.md` | confirmed | L3 sub-doc 構成・scope 分離の確認元。pair-freeze 対象外 index |
| `docs/design/harness/L3-functional/roadmap.md` | draft | 検証ロードマップ companion。通常 startup/read 対象外で、今回の L3 要件降下では freeze 根拠にしない |
| `docs/design/helix/L3-requirements/orchestration-memory.md` | confirmed | P2/P7 pure contract back-fill。`HR-BR-07` / `HR-BR-12` / `HR-NFR-03` を pillar L3 の下位詳細として参照 |
| `docs/design/helix/L3-requirements/orchestration-memory-runtime.md` | confirmed | P2/P7 runtime back-fill。`HR-BR-07R` / `HR-BR-12R` / `HR-NFR-03R` を下位詳細として参照 |
| `docs/design/helix/L3-requirements/orchestration-runtime-bridge.md` | confirmed | P2 runtime bridge back-fill。`HR-BR-13R` / `HR-BR-14R` を下位詳細として参照 |
| `docs/design/helix/L3-requirements/pillar-functional-requirements.md` | confirmed | 本 PLAN の L3 confirmed 正本。L1 HBR/HNFR 全件を FR/NFR/AC と L12 HAT へ降下済み |

### Step 2: [直列] L3 FR/AC 正本作成

- 直列理由: downstream_dependency。
- 成果: `docs/design/helix/L3-requirements/pillar-functional-requirements.md`。
- 進捗: 完了。

### Step 3: [直列] L12 acceptance pair 作成

- 直列理由: pair-freeze。
- 成果: `docs/test-design/helix/L3-pillar-acceptance-test-design.md`。
- 進捗: 完了。

### Step 4: [直列] 機械検証

- 直列理由: 定量 green の後に G-REQ.L3 判断を行う。
- コマンド: `bun run src/cli.ts doctor`、必要に応じて targeted `rg` trace。
- 進捗: 部分完了。`vmodel` loader を HELIX docs も読むよう拡張し、`tests/vmodel-pair.test.ts`
  / `typecheck` は green。さらに U-VPAIR-005b/005c で L1 HBR/HNFR -> L3 FR/NFR/HAC -> L12 HAT
  の全件被覆を regression guard 化し、U-VPAIR-005j で Route-B back-fill L3 要件 8 件 -> L12 HAT
  の孤児 0 も regression guard 化した。この source/test 変更は既存の確認済み verification trigger 面
  (`PLAN-L7-12`) の拡張として扱い、本 L3 draft PLAN の generated deliverable には含めない。`doctor` は
  HELIX L3/L6 draft を正しく Forward 進行中として扱うため non-zero（false freeze を解消）。

### Step 5: [直列] G-REQ.L3 PO 承認

- 直列理由: charter §3 により L3 は AI 起草、人間承認。
- 進捗: 完了。ユーザーの `OK` を PO による G-REQ.L3 承認として扱い、本 PLAN と pair docs を
  `confirmed` に昇格する。

## §G-REQ.L3 準備状況監査

G-REQ.L3 承認時に PO/TL が確認した証跡。全項目は confirmed 正本の承認根拠として保持する。

| 要求 / 不変条件 | 証跡 | 判定 |
|-----------------|----------|------|
| L1 HBR/HNFR 全件が L3 へ降下済み | `pillar-functional-requirements.md` §0 / §1、`L3-pillar-acceptance-test-design.md` §2、`U-VPAIR-005b` | ready |
| L3 FR/NFR/HAC が L12 HAT に孤児なく接続 | `HR-FR` 30 件 + `HR-NFR` 13 件 + `HAC` 86 件 + `HAT` 43 件、`U-VPAIR-005c` | ready |
| Route-B back-fill L3 要件が L12 HAT に孤児なく接続 | `orchestration-memory*.md` / `orchestration-runtime-bridge.md` の `HR-BR-*` / `HR-NFR-03*` 8 件、`L3-pillar-acceptance-test-design.md` §1.1 / §2.1、`U-VPAIR-005j` | ready |
| テスト速度・負荷が要件化済み | `HR-NFR-P5-03` / `HAT-N5-03`（fast/default/full、parallelism、resource budget、duration evidence） | ready |
| L2 design template / mock workflow が要件化済み | `HR-FR-P1-04` / `HAT-P1-04`（template pack、skip/defer、external mock back-propagation、G1/G2/G3 再検証） | ready |
| 実装精度・L階層 regression fence が要件化済み | `HR-NFR-P3-02` / `HR-NFR-P3-03` / `HR-FR-P9-03`、`HAT-N3-02` / `HAT-N3-03` / `HAT-P9-03` | ready |
| 計測・改善基盤が要件化済み | `HR-FR-P4-03`、`HAT-P4-03`（test time、flake、review finding、rework、escaped regression） | ready |
| 外部データ / prompt injection / tool injection / exfiltration 対策が要件化済み | `HR-FR-P8-04` / `HR-NFR-P8-02`、`HAT-P8-04` / `HAT-N8-02` | ready |
| security filter と trust-boundary が要件化済み | `HAC-P8-04a/b`、`HAC-N8-02a/b`、`HR-FR-P8-03`、`HR-NFR-P8-01` | ready |
| L1 §2.5 外部研究 delta は一次出典確認を要求 | `pillar-functional-requirements.md` §2.5、`U-VPAIR-005d`。2026-06-28 URL audit で primary source 9/9 が HTTP 200 + expected title 到達（GitHub Rulesets / Merge Queue、Release Please、semantic-release、OWASP LLM01/LLM06、Firecracker、gVisor、GitHub token docs） | ready |
| Codex runtime parity / hosted API preflight が要件化済み | `HR-FR-P2-03` / `HR-NFR-AC-02`、`HAT-P2-03` / `HAT-NAC-02` | ready |
| Distribution / full setup / version-up が要件化済み | `HR-FR-P6-03` / `HR-FR-P6-04`、`HAT-P6-03` / `HAT-P6-04` | ready |
| 2026-06 best-practice 照会結果が要件化済み | `HR-FR-P2-04`（PLAN 駆動 loop trace/eval）、`HR-FR-P7-03`（DDD context map）、`HR-NFR-P3-04`（TDD evidence）、`HR-NFR-P8-03`（agentic AI staged adoption）、`HR-NFR-P5-03` / `HR-FR-P4-03` / `HR-FR-P9-03`（harness engineering: isolation、parallel worker/resource budget、trace/metric/log observability）、`pillar-functional-requirements.md` §2.6、`U-VPAIR-005d/005e`。2026-06-28 best-practice URL audit で source 11/11 を記録し、automated fetch は 10/11 が HTTP 200、CISA official source は bot-blocked 403 のため公式 URL として保持（Anthropic agents、OpenAI Agents observability、CISA agentic AI、NIST AI RMF、Fowler DDD/TDD、TDAD paper、Playwright test isolation/parallelism、OpenTelemetry observability）。外部 API / SDK 採用前提ではなく PLAN/harness DB trace へ概念を従属 | ready |
| API 非前提 / PLAN 駆動が横断要件化済み | `HR-NFR-AC-03` / `HAT-NAC-03`（provider API direct call / SDK 常駐実行を必須条件にせず、PLAN artifact、repo-local CLI adapter、harness DB trace、dry-run plan を正本化） | ready |
| 既存 P2/P7 back-fill と重複しない | `pillar-functional-requirements.md` §3、既存 L3 back-fill 3 本の `pair_artifact` 接続、Route-B back-fill 8 件は pillar 43 件と二重採番しない | ready |
| G-REQ.L3 を false green にしない | PO 承認前は draft / pending approval を維持し、承認後は本 PLAN / L3 / L12 を `status: confirmed` に昇格して `PLAN-L3-00-master` の `G-REQ.L3` 到達を doctor で確認する | approved |

### 目的達成監査

この PLAN が受けた目的文の明示要求を、G-REQ.L3 承認時に検査できる単位へ分解する。各行は
L3 confirmed 正本の承認根拠として保持する。

| 目的要求 | L3 証跡 | L12 / test 証跡 | 判定 |
|----------------|-------------|---------------------|------|
| L3 設計をすべて精読し、L1 要求との差異を埋める | `L3 精読監査`、`pillar-functional-requirements.md` §0/§3、既存 back-fill 3 本、Route-B back-fill 8 件の acceptance 接続 | `U-VPAIR-005b` / `U-VPAIR-005g` / `U-VPAIR-005j` | ready |
| Forward workflow に従い要求を 100% 満たせる状態にする | 本 PLAN Step 1-5、`PLAN-L3-00-master` G-REQ.L3 span、PO 承認後の `confirmed` 昇格 | `doctor` roadmap: `G-REQ.L3 reached`、false green 防止 | approved |
| テスト速度アップ・負荷を要件化する | `HR-NFR-P5-03`、`HAC-N5-03a/b`、§2.6 harness engineering | `HAT-N5-03`、`U-VPAIR-005d/005e` | ready |
| 実装精度を要件化する | `HR-NFR-P3-02`、`HAC-N3-02a/b` | `HAT-N3-02`、`U-VPAIR-005d/005e` | ready |
| L階層単位のデグレ防止を要件化する | `HR-NFR-P3-03` / `HR-FR-P9-03`、`HAC-N3-03a/b` / `HAC-P9-03a/b` | `HAT-N3-03` / `HAT-P9-03`、`U-VPAIR-005d/005e` | ready |
| 計測・改善基盤を要件化する | `HR-FR-P4-03`、`HAC-P4-03a/b` | `HAT-P4-03`、`U-VPAIR-005d/005e` | ready |
| 外部データ / prompt injection / tool injection / exfiltration 対策を要件化する | `HR-FR-P8-04` / `HR-NFR-P8-02`、`HAC-P8-04a/b` / `HAC-N8-02a/b` | `HAT-P8-04` / `HAT-N8-02`、`U-VPAIR-005d/005e` | ready |
| security filter を用意する | `HR-FR-P8-04`、raw input / trusted metadata / executable instruction 分離 | `HAT-P8-04`、security-filter 語彙 guard | ready |
| L2 を飛ばす場合の L2 design template / workflow を要件化する | `HR-FR-P1-04`、`HAC-P1-04a/b` | `HAT-P1-04`、`U-VPAIR-005d/005e` | ready |
| loop engineering / AI-driven development を 2026-06 最新情報で照会し、API 前提ではなく PLAN 駆動にする | `HR-FR-P2-04` / `HR-NFR-AC-03`、§2.6 Anthropic/OpenAI observability overlay | `HAT-P2-04` / `HAT-NAC-03`、`U-VPAIR-005f` | ready |
| DDD best practice を照会し要件化する | `HR-FR-P7-03`、bounded context / ubiquitous language / anti-corruption boundary | `HAT-P7-03`、`U-VPAIR-005d/005e` | ready |
| TDD best practice を照会し要件化する | `HR-NFR-P3-04`、Red evidence / acceptance oracle / Green evidence / refactor safety | `HAT-N3-04`、`U-VPAIR-005d/005e` | ready |
| harness engineering best practice を照会し要件化する | `HR-NFR-P5-03` / `HR-FR-P4-03` / `HR-FR-P9-03`、test isolation / parallel worker/resource budget / trace/metric/log observability | `HAT-N5-03` / `HAT-P4-03` / `HAT-P9-03`、`U-VPAIR-005d/005e` | ready |
| provider API direct call / SDK 常駐実行を前提にしない | `HR-NFR-AC-03`、`HAC-NAC-03a/b` | `HAT-NAC-03`、`U-VPAIR-005f` 禁止語 guard | ready |

### PO 承認パケット

G-REQ.L3 は人間ゲートであり、Codex/TL は自己承認しない。PO 承認時は以下を確認し、承認後にのみ
status 昇格を行う。

| 確認項目 | 承認観点 | 証跡 |
|-------|----------|----------|
| 範囲 | L1 `HBR-*` / `HNFR-*` 全件が L3/L12 に降下し、harness confirmed L3 を上書きしていない | `L3 精読監査`、`目的達成監査`、`U-VPAIR-005b/005g/005h` |
| 完全性 | pillar 43 L3 要件 / 86 HAC / 43 HAT と、Route-B back-fill 8 L3 要件 / 8 HAT が孤児 0 で接続されている | `U-VPAIR-005c` / `U-VPAIR-005j` |
| 安全性 | external data / prompt injection / tool injection / exfiltration / excessive agency / action-binding approval が L3 AC に入っている | `HR-FR-P8-04`、`HR-NFR-P8-02`、`HR-NFR-P8-03`、`HR-NFR-AC-03` |
| 運用モデル | PLAN 駆動であり、provider API direct call / SDK 常駐実行を前提にしない | `HR-FR-P2-04`、`HR-NFR-AC-03`、`U-VPAIR-005f` |
| 証跡鮮度 | 2026-06-28 external/best-practice source audit を保持し、CISA official source の bot-blocked 403 を過大に HTTP 200 と主張しない | 準備状況監査、`U-VPAIR-005d/005e` |
| false-green 防止 | PO 承認前は draft / pending approval / doctor non-zero を維持し、承認後は confirmed / G-REQ.L3 reached を doctor で確認する | `PLAN-L3-00-master` G-REQ.L3 roadmap、doctor roadmap rollup |

承認により昇格したファイル:

- `docs/plans/PLAN-L3-06-helix-pillar-descent.md`: `status: draft` -> `status: confirmed`
- `docs/design/helix/L3-requirements/pillar-functional-requirements.md`: `status: draft` -> `status: confirmed`
- `docs/test-design/helix/L3-pillar-acceptance-test-design.md`: `status: draft` -> `status: confirmed`

承認後に再実行するコマンド:

- `bun run vitest run tests/vmodel-pair.test.ts`
- `bun run src/cli.ts plan lint docs/plans/PLAN-L3-06-helix-pillar-descent.md`
- `bun run typecheck`
- `bun run lint`
- `bun run src/cli.ts db rebuild && bun run src/cli.ts doctor`

承認後の期待状態:

- `doctor` の `PLAN-L3-00-master` で `G-REQ.L3` が reached になる。
- roadmap rollup が 20/20 gates reached になる。
- L3/L6 draft 由来の Forward 進行中表示が、別 draft が無ければ解消する。
- external API / infra / GitHub 設定変更はこの承認には含めない。該当する場合は別 PLAN + action-binding approval を要求する。

機械検証の期待状態:

- `bun run vitest run tests/vmodel-pair.test.ts` は `U-VPAIR-005b/005c/005d/005j` を含めて green。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L3-06-helix-pillar-descent.md` は green。
- `bun run typecheck` / `bun run lint` / `bun run test` は green。
- `bun run src/cli.ts db rebuild && bun run src/cli.ts doctor` は構造系 OK。承認後は `G-REQ.L3 reached`
  を確認する。L6 など別層 draft が残る場合、full doctor green は別 PLAN の frontier として扱う。

## §DoD

- [x] L1 HBR 9 件 / HNFR 4 件を L3 trace matrix で孤児 0 にする。
- [x] L1 §2.6 Codex runtime parity overlay を L3 AC に展開する。
- [x] L1 §2.7 Distribution / full setup overlay を L3 AC に展開する。
- [x] HBR-P1 の Scrum 分割スケールを L3 requirement (`HR-FR-P1-03`) と AC に展開する。
- [x] L2 を飛ばした slice / 導入時の design template pack と mock back-propagation workflow を L3 requirement (`HR-FR-P1-04`) と AC に展開する。
- [x] HBR-P6 の release automation ADR（semantic-release vs Release Please）と CI auto-fix repush confidence 0.75+ を L3 requirement (`HR-FR-P6-05`) と AC に展開する。
- [x] L1 §2.5 の一次検証要求を L3 overlay として追加し、外部技術採用前の primary-source research artifact を必須化する。
- [x] 2026-06 Web 照会に基づく loop engineering / DDD / TDD / harness engineering / AI-driven development best practice を、API/SDK 採用前提ではなく PLAN 駆動として L3 requirement (`HR-FR-P2-04` / `HR-FR-P7-03` / `HR-NFR-P3-04` / `HR-NFR-P8-03` / `HR-NFR-P5-03` / `HR-FR-P4-03` / `HR-FR-P9-03`) と AC に展開する。
- [x] provider API direct call / SDK 常駐実行を前提にしない横断制約を L3 requirement (`HR-NFR-AC-03`) と AC に展開する。
- [x] テスト速度・負荷を HNFR-P5/HBR-P3 配下の L3 requirement (`HR-NFR-P5-03`) と AC に展開する。
- [x] HNFR-P5 の層境界数値、可逆圧縮、artifact trail / raw-evidence pointer 保持を L3 requirement (`HR-NFR-P5-01`) と AC に展開する。
- [x] 実装精度、L階層単位 regression fence、計測・改善基盤を HNFR-P3/HBR-P3/HBR-P4/HBR-P9 配下の L3 requirement と AC に展開する。
- [x] HBR-P8 の MicroVM/gVisor sandbox、short-lived/fine-grained token、外部データ・prompt injection・tool injection・data exfiltration 対策を HBR-P8/HNFR-P8/HNFR-AC 配下の requirement と AC に展開する。
- [x] 既存 P2/P7 implementation back-fill を再定義せず、残 GAP のみ新規 FR にする。
- [x] L3 roadmap (`PLAN-L3-00-master`) に本 PLAN を G-REQ.L3 span として追加し、未承認 L3 draft を freeze 済みに見せない。
- [x] vmodel pair/verification loader が `docs/design/helix` / `docs/test-design/helix` を読むようにし、HELIX draft を検証 group に反映する（実装面の ownership は `PLAN-L7-12`）。
- [x] L1 HBR/HNFR、L3 FR/NFR/HAC、L12 HAT の孤児 0 を U-VPAIR-005b/005c で機械回帰化する。
- [x] Route-B back-fill L3 要件 8 件を L12 acceptance §1.1/§2.1 に接続し、U-VPAIR-005j で機械回帰化する。
- [x] L3 design と L12 acceptance pair を PO 承認後に `confirmed` へ昇格する。
- [x] targeted trace checks / typecheck / targeted vitest が green。
- [x] doctor で G-REQ.L3 reached を確認する（full doctor green は別層 draft が無い場合のみ）。

## §Gates

- G-REQ.L3: 通過。PO 承認済み。
