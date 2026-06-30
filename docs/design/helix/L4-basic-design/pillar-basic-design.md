---
title: "HELIX L4 基本設計 — pillar FR/NFR basic design"
layer: L4
kind: add-design
status: confirmed
created: 2026-06-28
updated: 2026-07-01
owner: AIM + TL (Codex)
plan: PLAN-L4-51-helix-pillar-basic-design
pair_artifact: docs/test-design/helix/L4-pillar-system-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l3: docs/design/helix/L3-requirements/pillar-functional-requirements.md
next_pair_freeze: L9
---

# HELIX L4 基本設計 — pillar FR/NFR basic design

> 本書は L3 `pillar-functional-requirements.md` の `HR-FR-*` 30 件と `HR-NFR-*` 13 件を L4
> 基本設計へ降下する add-design 正本である。既存 harness L4 (`data/architecture/function/external-if`)
> は上書きせず、HELIX 名前空間の pillar 横断 block を追加する。

## §0 量閉じ

- 入力 L3: `HR-FR` 30 件 + `HR-NFR` 13 件 = 43 件。
- L4 block: 10 件 (`HB-P0` / `HB-P1` / `HB-P2` / `HB-P3` / `HB-P4` / `HB-P6` / `HB-P7` / `HB-P8` / `HB-P9` / `HB-AC`)。
- L9 system test design: `HST-*` 43 件。
- Route-B back-fill L3 要件 8 件は本 pillar overlay の 43 件へ二重計上しない。P2/P7 の実装由来契約は L6 route-B / Reverse back-fill で扱い、本書では HB-P1 / HB-P2 / HB-P3 / HB-P7 / HB-AC の既存 block 境界へ受ける。
- 孤児: 0。詳細は §2 trace。
- L1 §2.8 asset/progress visualization amendment は本 L4 10 block / 43 要件の confirmed 範囲外である。
  `PLAN-DISCOVERY-10` S4 confirmed 後に VSCode Tree View / Webview / deterministic graph / drill-down の
  L4 UI-data boundary として別途 Forward 合流させる。
- G-SF `semantic_feature_frontier_record` の分類は L4 block boundary でも維持する。
  `frontier_pending_decision` は L4 UI-data boundary を未 confirmed として扱い、
  `parked_future_version` は current system block の完了に数えず、`approval_gated_cutover` は
  blast-radius / dry-run / rollback / monitoring の設計までで apply 可能 block にしない。
  中間層でこの分類を落とした場合、L3 で正しく分けた要求修正を L4 が汎用 block に吸収してしまうため、
  G-DESIGN.L4 の完了根拠にしない。

## §1 L4 building block

| Block | 主責務 | Data / projection | External boundary | Invariant |
|-------|--------|-------------------|-------------------|-----------|
| HB-P0 forward-convergence | 駆動 workflow の出口を Forward 正本へ戻し、runaway を止める | `workflow_runs` / `gate_runs` / handover stop reason | なし | `forward_return` 無しの完了を許可しない |
| HB-P1 continuous-autonomy | resume 3 条件、job queue、version-up、Scrum/PoC slice、L2 skip template を束ねる | `jobs` / `workflow_runs` / `version_target` ledger | tag/release は dry-run plan まで | budget / idempotency / rollback 無しに自動継続しない |
| HB-P2 agent-loop-contract | agent->tool contract、loop effort、Codex adapter parity、PLAN-driven trace span を扱う | `model_runs` / `guardrail_decisions` / loop trace span | Claude/Codex CLI/hosted tool surface | provider API/SDK 常駐前提にしない |
| HB-P3 verification-governance | pair closure、external-truth grounding、green evidence、実装精度、TDD evidence を守る | `trace_edges` / `test_runs` / `review_evidence` | 外部 source URL は research artifact 経由 | coverage-only / self-verification 単独 pass を禁止 |
| HB-P4 repair-learning | detector event を repair candidate へ変換し、成功 recipe と metric を改善へ送る | `findings` / `quality_signals` / `feedback_events` / metric trends | なし | 高リスク repair は action-binding approval |
| HB-P6 github-distribution | GitHub rulesets、PR review、CI auto-fix、setup、tag bump、release automation | setup baseline / release ledger / import report | GitHub / GitHub Actions | raw push / destructive setup / ruleset apply は approval 必須 |
| HB-P7 shared-knowledge | 共有 memory、Glossary SSoT、DDD context map を維持する | `.ut-tdd/memory` / glossary / context-map / relation graph | Claude/Codex は同じ provider handover を読む | per-agent silo / 用語 drift を許可しない |
| HB-P8 external-security | external research、skillify、sandbox、security filter、prompt/tool injection 対策 | research artifact / security event / token policy / audit | Web/docs/OSS/GitHub/API/sandbox | raw external text を instruction として扱わない |
| HB-P9 db-convergence | DB 未収束を未完了として扱い、relation graph / contract ledger / layer regression を提供 | harness.db projections / contract ledger / baseline snapshots | なし | projection 未収束を green にしない |
| HB-AC adapter-consistency | Claude/Codex/agent/template/skill/runtime adapter の rule drift と hosted API preflight を扱う | rule-drift results / preflight audit / dry-run plan | hosted API/developer tools | repo hook 非強制 surface は preflight evidence 必須 |

## §2 L3 -> L4 trace

| L3 ID | L4 block | L4 design decision | L9 test |
|-------|----------|--------------------|---------|
| HR-FR-P0-01 | HB-P0 | 全 workflow PLAN は Forward 返却先、`gap-only`、または `version_target` を L4 contract として持つ | HST-P0-01 |
| HR-FR-P0-02 | HB-P0 | budget / iteration / lock / Recovery escalation を単一 stop contract に束ねる | HST-P0-02 |
| HR-FR-P1-01 | HB-P1 | resume 3 条件、job availability、budget、fresh-session handover を scheduler block に集約する | HST-P1-01 |
| HR-FR-P1-02 | HB-P1 | version target / release tag / migration / rollback を version-up lifecycle block に置く | HST-P1-02 |
| HR-FR-P1-03 | HB-P1 | large request は Scrum / PoC / sprint slice と Forward return を持つ work-breakdown block で扱う | HST-P1-03 |
| HR-FR-P1-04 | HB-P1 | L2 skip 時も screen-list / screen-flow / screen-detail / ui-element / business-flow / wireframe template pack と back-propagation workflow を emit する | HST-P1-04 |
| HR-FR-P2-01 | HB-P2 | tool contract registry を agent-loop boundary に置き、未登録 surface を fail-close/deferred にする | HST-P2-01 |
| HR-FR-P2-02 | HB-P2 | plan size / role / iteration / tool use の effort budget を loop state に持つ | HST-P2-02 |
| HR-FR-P2-03 | HB-AC | Codex `apply_patch` / `write_file` / `exec_command` / `local_shell` を Claude guard intent に map し、hosted API は preflight 必須にする | HST-P2-03 |
| HR-FR-P2-04 | HB-P2 | PLAN / tool / handoff / guardrail / eval outcome を harness DB trace span として記録し、simple workflow から始める | HST-P2-04 |
| HR-FR-P3-01 | HB-P3 | pair_closure と片肺禁止を L3-L7 gate invariant とし、coverage-only pass を拒否する | HST-P3-01 |
| HR-FR-P3-02 | HB-P3 | external-truth claim は URL / version / checked span と別 verifier を要求する | HST-P3-02 |
| HR-FR-P4-01 | HB-P4 | detector event を repair candidate / route / owner / rollback へ変換する | HST-P4-01 |
| HR-FR-P4-02 | HB-P4 | successful repair recipe を memory / backlog / promote candidate へ送る | HST-P4-02 |
| HR-FR-P4-03 | HB-P4 | implementation accuracy / review finding / rework / test duration / flake / regression を metric event として収集する | HST-P4-03 |
| HR-FR-P6-01 | HB-P6 | GitHub Rulesets / required checks / Merge Queue を gated push block に置く | HST-P6-01 |
| HR-FR-P6-02 | HB-P6 | PR review と CI auto-fix-repush は worker!=verifier、confidence cap、iteration cap を持つ | HST-P6-02 |
| HR-FR-P6-03 | HB-P6 | fresh/brownfield setup は hooks / adapters / state / memory / handover / GitHub plan / doctor baseline を非破壊に emit する | HST-P6-03 |
| HR-FR-P6-04 | HB-P6 | tag bump は current/target detection、migration、compatibility warning、rollback point、idempotency evidence を持つ | HST-P6-04 |
| HR-FR-P6-05 | HB-P6 | semantic-release vs Release Please は ADR で選び、CI auto-fix repush は confidence >=0.75 に制限する | HST-P6-05 |
| HR-FR-P7-01 | HB-P7 | Claude/Codex SessionStart は同じ `.ut-tdd/memory` と provider handover から bounded recall する | HST-P7-01 |
| HR-FR-P7-02 | HB-P7 | Glossary SSoT を memory / DDD context / docs 用語に接続する | HST-P7-02 |
| HR-FR-P7-03 | HB-P7 | DDD context map は bounded context / ubiquitous language / published language / anti-corruption boundary を持つ | HST-P7-03 |
| HR-FR-P8-01 | HB-P8 | external research は source attribution と span-level verification を持つ artifact へ保存する | HST-P8-01 |
| HR-FR-P8-02 | HB-P8 | skillify candidate は license / safety / scope review 後に skill registry へ入る | HST-P8-02 |
| HR-FR-P8-03 | HB-P8 | external code/API/GitHub 操作は MicroVM/gVisor sandbox と short-lived/fine-grained token policy に従う | HST-P8-03 |
| HR-FR-P8-04 | HB-P8 | security filter は raw input / trusted metadata / executable instruction を分離する | HST-P8-04 |
| HR-FR-P9-01 | HB-P9 | DB 未収束 artifact は complete 扱いせず plan/status/trace/doctor で blocker 表示する | HST-P9-01 |
| HR-FR-P9-02 | HB-P9 | relation graph と contract ledger は doc/code/test/PR/check/state の impact query を返す | HST-P9-02 |
| HR-FR-P9-03 | HB-P9 | L0-L14 baseline snapshot / gate result / metric trend / regression owner を harness DB に収束する | HST-P9-03 |
| HR-NFR-P3-01 | HB-P3 | green command evidence / review tier / external-truth grounding を合格主張の必須要素にする | HST-N3-01 |
| HR-NFR-P3-02 | HB-P3 | design requirement / acceptance / code-test evidence / review finding の対応で実装精度を測る | HST-N3-02 |
| HR-NFR-P3-03 | HB-P9 | 変更影響層の gate/test/doctor profile 未実行を layer regression blocker にする | HST-N3-03 |
| HR-NFR-P3-04 | HB-P3 | AI 実装は Red evidence / expected failure / acceptance oracle / Green evidence / refactor safety を持つ | HST-N3-04 |
| HR-NFR-P5-01 | HB-P1 | 直近逐語 / rolling summary / stable constraints の 3 層 injection budget と artifact trail を分離する | HST-N5-01 |
| HR-NFR-P5-02 | HB-P1 | anchored iterative handover は固定 section へ差分追記し Next Action / artifact trail を落とさない | HST-N5-02 |
| HR-NFR-P5-03 | HB-P3 | fast/default/full profile、parallel worker/resource budget、duration evidence で不要な full suite を避ける | HST-N5-03 |
| HR-NFR-P8-01 | HB-P8 | auth/authz/payment/PII/secret/license/schema migration/destructive/external infra は action-binding approval 必須にする | HST-N8-01 |
| HR-NFR-P8-02 | HB-P8 | prompt injection / tool injection / exfiltration 誘導を classify し deny/review/redaction へ送る | HST-N8-02 |
| HR-NFR-P8-03 | HB-P8 | agentic AI は task-scoped permission、least privilege、rollback、monitoring、risk owner、threat model を持つまで昇格しない | HST-N8-03 |
| HR-NFR-AC-01 | HB-AC | rule-drift を agent/template/skill/runtime adapter 全体へ一般化する | HST-NAC-01 |
| HR-NFR-AC-02 | HB-AC | hosted API/developer tool surface は repo hook 非強制を明示し preflight audit を必須にする | HST-NAC-02 |
| HR-NFR-AC-03 | HB-AC | AI runtime は provider API direct call / SDK 常駐実行を前提にせず、PLAN artifact / repo-local CLI adapter / harness DB trace / dry-run plan を正本にする | HST-NAC-03 |

## §2.1 Route-B back-fill boundary

Route-B back-fill 8 件は §2 の 43 件へ二重採番しない。ただし L4 block の責務から外すのではなく、
下表の block 境界で受け、詳細な関数契約は L6 route-B / Reverse back-fill に委ねる。

| Route-B L3 ID | 意味境界 | L4 block boundary | L4 で固定する設計判断 |
|---------------|----------|-------------------|------------------------|
| HR-BR-07 | loop-engineering 決定ロジック | HB-P2 | loop 継続・停止・Recovery 分類は agent-loop の決定境界であり、数値だけの自動継続にしない |
| HR-BR-12 | 2 層共有メモリのセマンティクス | HB-P7 | shared knowledge は harness/project 層、supersede、bounded recall を持ち、per-agent silo を正本にしない |
| HR-NFR-03 | hybrid 自己評価禁止 + memory secret reject | HB-P3 / HB-P7 | verification governance は worker 自己 pass を拒否し、knowledge boundary は secret body を保存しない |
| HR-BR-07R | tick runtime | HB-P2 | runtime tick は `canResume` / `evaluateStop` / verifier selection を再利用し、自己評価代替を許さない |
| HR-BR-12R | memory persistence + CLI | HB-P7 | `.ut-tdd/memory/<layer>.jsonl` を共有 SSoT とし、append-only / secret reject を維持する |
| HR-NFR-03R | job-queue 競合排他 | HB-P1 | continuous autonomy の job claim は二重取得を防ぎ、busy は backoff 可能にする |
| HR-BR-13R | tick の実 runtime bridge | HB-P2 / HB-AC | bridge は verifier 選定を再実装せず、adapter parity / preflight 境界に従う |
| HR-BR-14R | loop run entrypoint | HB-P1 / HB-P2 | loop CLI は scheduler/loop state から tick を駆動し、dry-run と iteration 永続を分離する |

## §3 横断設計

- **data/projection**: 新規永続 state を安易に増やさず、既存 harness.db projection (`plan_registry`,
  `workflow_runs`, `model_runs`, `trace_edges`, `coverage`, `findings`, `feedback_events`) に block ごとの
  evidence を収束させる。必要な新テーブルは L5 physical-data / D-CONTRACT で確定する。
- **external-if**: AI runtime は CLI adapter / hook / dry-run plan を正本とし、provider API direct call や SDK
  常駐実行を L4 の前提にしない。GitHub / external API / infra は emit-only / dry-run を既定にし、
  action-binding approval なしに適用しない。
- **security filter**: HB-P8 は external text を raw / metadata / instruction に分離し、prompt injection,
  tool injection, exfiltration, excessive agency を audit event へ送る。
- **DDD/TDD**: HB-P7 は bounded context と ubiquitous language を relation graph へ接続し、HB-P3 は Red evidence
  / acceptance oracle / Green evidence / refactor safety を L4 invariant とする。
- **performance / load**: HB-P3 は test profile と parallel worker/resource budget を持ち、L7 通常 loop が不要な
  full suite を強制しない。

## §4 L4-50 との関係

`PLAN-L4-50-orchestration-memory-hybrid` は P2/P7 の一部を L4 として起票した historical draft だが、
`PLAN-L6-50-helix-orchestration-memory` が `supersedes` し、P2/P7 の機能設計は L6 route-B と Reverse
back-fill で確定済みである。本書では P2/P7 を §2.1 のとおり HB-P1 / HB-P2 / HB-P3 / HB-P7 / HB-AC の
L4 block 境界へ再接地し、L4-50 自体は archived historical artifact として閉じる。

## §5 carry

- L5: block ごとの table/schema/API/DbC 詳細、approval ledger、external source ledger、contract ledger。PLAN-L5-09 で降下済み。
- L6: function contracts、security-filter parser、context-map checker、job/loop scheduler、setup/release dry-run planner。
- L7: implementation は L6 freeze 後に PLAN-driven add-impl として扱う。
