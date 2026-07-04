# A-122 Phase2 pre-close feature hardening 監査

Date: 2026-06-09
Gate: Phase 2 full review / GATE-A PO accept preparation の準備
Reviewer: Codex TL
Scope: automation、UT database projection、shared/common lens、multi-agent coordination lens を対象にする

**Verdict: routed design hardening 付き PASS。** Phase 2 は full-review PASS / PO accept pending として扱える。ただし、以下の feature-strengthening items は明示 carry として残す必要がある。design surface は存在するため current L4-L6 blockers ではないが、Phase 3/4 implementation と hardening の入力である。

## 1. close 前の automation gaps

| ID | Gap 内容 | 重要性 | Routed ticket |
|---|---|---|---|
| A122-AUTO-01 | `placeholder_deps` dedicated rule が未実装。 | current doctor green を、全 deferred pair artifacts が fail-closed である証明として読んではならない。 | IMP-107 |
| A122-AUTO-02 | Green definition が timestamp-only。 | qualitative review は順序を証明できるが、どの quantitative command profile が green だったかまでは証明できない。 | IMP-108 |
| A122-AUTO-03 | DB collector/rebuild/migration が implementation granularity で計画されていない。 | Phase 4 では初日から `bun:sqlite`、schema versioning、deterministic rebuild、doctor integration が必要になる。 | IMP-110 |
| A122-AUTO-04 | CI evidence が OS/shell/hook 別に normalize されていない。 | Windows PowerShell、Bash、Bun、hook smoke evidence を 1 つの green profile として比較できない。 | IMP-114 |

## 2. UT database projection の確認

現在の DB design は、すでに以下を support できる:

- PLAN / artifact / model run / trace / finding / gate の projection。
- skill recommendation と invocation metrics。
- workflow readiness と guardrail decision queries。
- docs/state/log references の search。

A-122 additions 後の DB projection は、以下を support する design になっている:

- `test_cases`: どの U-* oracle がどの PLAN / FR / artifact を証明するか。
- `test_runs`: どの Bun/vitest/doctor/lint command が green または non-green result を出したか。
- `test_results`: case ごとの pass/fail/skip/todo と duration history。
- `test_artifact_edges`: core trace edges を過負荷にしない test-to-design trace。
- `test_flake_events`: flake と duration regression signals。
- `green_definition_compliance`: review evidence が artifact change に必要な exact command profile を指しているか。

これは PO question への回答である。DB化により、current functional design は「どの tests がこの design を証明するか、最後に pass した時刻、flaky かどうか、正しい green profile 後に review されたか、どの workflow/agent/skill context が evidence を生成したか」を support できる。ただし raw provider transcripts や secrets は保存できない。これらは design 上 DB 外に置く。

## 3. Shared/common lens の確認

| ID | Gap | Routed ticket |
|---|---|---|
| A122-COMMON-01 | relation graph / dependency-drift / regression impact はまだ future 扱いのため、changed imports から required tests/review scope をまだ選べない。 | IMP-111 |
| A122-COMMON-02 | skill catalog / recommender / injector tables は design に存在するが、real inventory と acceptance metrics に接続されていない。 | IMP-112 |
| A122-COMMON-03 | guardrail/security decisions は projection rows として design されているが、implementation では explicit secret/PII redaction と human-required downgrade invariants が必要。 | IMP-115 |
| A122-COMMON-04 | claims/meta-audit artifacts はまだ clean taxonomy になっておらず、A-117/A-118 style audits を first-class work として trace しにくい。 | IMP-116 |

## 4. Multi-agent coordination lens の確認

| ID | Gap | Routed ticket |
|---|---|---|
| A122-MULTI-01 | `ut-tdd team run` は definitions を validate するが、actual delegation lifecycle はまだ実行しない。 | IMP-104 / IMP-113 |
| A122-MULTI-02 | drive recruitment (`resolveDriveStatePartition` / `classifyDrive`) は L7 carry のまま。 | IMP-104 / IMP-113 |
| A122-MULTI-03 | cross-runtime absence fallback は local で確認されるが、member lifecycle と review boundary evidence を持つ full run としては query できない。 | IMP-113 |

## 5. この audit で加えた design changes

- `docs/improvement-backlog.md`: IMP-107 から IMP-116 を追加した。
- `docs/design/harness/L5-detailed-design/physical-data.md`: §9.4 UT evidence history projection を追加した。
- `docs/design/harness/L6-function-design/test-before-review.md`: GreenDefinition schema と DbC を追加した。
- `docs/design/harness/L6-function-design/function-spec.md`: `recordTestRunEvidence`、`evaluateGreenDefinition`、`computeUtHistorySignals` を追加した。

## 6. Close criteria interpretation の判断

PO が carry を受け入れる場合、Phase 2 close は valid のままである。理由は以下:

- gaps は hidden unknowns ではなく explicit tickets になっている。
- L4-L6 design は future DB/automation capability を記述する形で強化済み。
- ここで見つかった gap は、ADR-001 Bun/TypeScript、non-HELIX-runtime dependency、DB-as-projection rule のいずれにも矛盾しない。

Phase 3/4 は IMP-107、IMP-108、IMP-109、IMP-110 から始めるべきである。これらは current qualitative/quantitative bundle を mechanically replayable evidence へ変換するためである。

## 7. Back-propagation closure の記録

A-123 は A-122 lower-layer additions を local L5/L6 carry ではなく `requires_requirement_backprop` として再分類した。UT evidence history、GreenDefinition、DB projection implementation profile、CI/hook/OS evidence matrix は、existing FR-L1 bundles の extensions として requirements v1.2、L1 functional requirements、L3 functional requirements へ back-propagate 済み。今後の lower-L discoveries は、Phase/PLAN completion を claim する前に requirements §6.8.8 に従う必要がある。
