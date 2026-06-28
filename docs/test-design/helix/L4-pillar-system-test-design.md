---
title: "HELIX L4 総合テスト設計 — pillar basic design"
layer: L4
executed_at_layer: L9
artifact_type: test_design
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: QA + AIM
plan: PLAN-L4-51-helix-pillar-basic-design
pair_artifact: docs/design/helix/L4-basic-design/pillar-basic-design.md
related_l4: docs/design/helix/L4-basic-design/pillar-basic-design.md
next_pair_freeze: L4
---

# HELIX L4 総合テスト設計 — pillar basic design

> L4 basic design `pillar-basic-design.md` の L9 system test design。実装済みテストの存在ではなく、
> L4 block を system として観測する受入観点を定義する。

## §0 量閉じ

- 対象 L3 要件: 43 件。
- 対象 L4 block: 10 件。
- system test 観測: HST 43 件。
- 孤児: 0。

## §1 system test trace

| HST-ID | 対応 L3 | 対応 L4 block | system 観測 |
|--------|---------|---------------|-------------|
| HST-P0-01 | HR-FR-P0-01 | HB-P0 | workflow PLAN が Forward return / gap-only / version_target のいずれかを持つ |
| HST-P0-02 | HR-FR-P0-02 | HB-P0 | cap/lock 到達時に stop reason と handover が残り二重実行しない |
| HST-P1-01 | HR-FR-P1-01 | HB-P1 | resume 3 条件 + job + budget + fresh-session が連動する |
| HST-P1-02 | HR-FR-P1-02 | HB-P1 | version-up dry-run が migration / rollback / idempotency evidence を出す |
| HST-P1-03 | HR-FR-P1-03 | HB-P1 | large request が Scrum/PoC/sprint slice と Forward return を持つ |
| HST-P1-04 | HR-FR-P1-04 | HB-P1 | L2 skip 時も template pack と back-propagation workflow が出る |
| HST-P2-01 | HR-FR-P2-01 | HB-P2 | tool contract registry が未登録 surface を fail-close/deferred にする |
| HST-P2-02 | HR-FR-P2-02 | HB-P2 | effort budget 超過で loop が自己継続しない |
| HST-P2-03 | HR-FR-P2-03 | HB-AC | Codex adapter map と hosted API preflight が区別される |
| HST-P2-04 | HR-FR-P2-04 | HB-P2 | PLAN-driven trace span と eval outcome が残り、API/SDK 前提にならない |
| HST-P3-01 | HR-FR-P3-01 | HB-P3 | pair 欠落と coverage-only 完了主張を拒否する |
| HST-P3-02 | HR-FR-P3-02 | HB-P3 | external claim が source attribution と別 verifier を要求する |
| HST-P4-01 | HR-FR-P4-01 | HB-P4 | detector event が repair candidate / rollback / owner へ変換される |
| HST-P4-02 | HR-FR-P4-02 | HB-P4 | repair recipe が memory/backlog/promote candidate へ残る |
| HST-P4-03 | HR-FR-P4-03 | HB-P4 | implementation accuracy / review / test runtime / flake / regression metric が improvement 候補になる |
| HST-P6-01 | HR-FR-P6-01 | HB-P6 | raw push/merge が required checks / rulesets / merge queue により制御される |
| HST-P6-02 | HR-FR-P6-02 | HB-P6 | PR review と CI auto-fix が worker!=verifier と confidence cap を守る |
| HST-P6-03 | HR-FR-P6-03 | HB-P6 | fresh/brownfield setup が非破壊 baseline と import report を出す |
| HST-P6-04 | HR-FR-P6-04 | HB-P6 | tag bump が migration / rollback / idempotency plan を出し破壊的 apply を止める |
| HST-P6-05 | HR-FR-P6-05 | HB-P6 | release automation 選定 ADR と CI auto-fix confidence 0.75 cap が観測できる |
| HST-P7-01 | HR-FR-P7-01 | HB-P7 | Claude/Codex が同じ memory/handover provider から bounded recall する |
| HST-P7-02 | HR-FR-P7-02 | HB-P7 | Glossary SSoT が用語 rename/synonym drift を検出する |
| HST-P7-03 | HR-FR-P7-03 | HB-P7 | DDD context map が bounded context と anti-corruption boundary を検査する |
| HST-P8-01 | HR-FR-P8-01 | HB-P8 | research artifact が source/span を持ち未検証採用を防ぐ |
| HST-P8-02 | HR-FR-P8-02 | HB-P8 | skillify candidate は license/safety/scope review 後だけ registry 入りする |
| HST-P8-03 | HR-FR-P8-03 | HB-P8 | external code/API/GitHub 操作が sandbox と token policy に従う |
| HST-P8-04 | HR-FR-P8-04 | HB-P8 | security filter が raw/metadata/instruction を分離する |
| HST-P9-01 | HR-FR-P9-01 | HB-P9 | DB 未収束 artifact/setup baseline を完了扱いにしない |
| HST-P9-02 | HR-FR-P9-02 | HB-P9 | relation graph / contract ledger が impact query と breaking classification を返す |
| HST-P9-03 | HR-FR-P9-03 | HB-P9 | layer baseline / metric trend / regression owner が比較できる |
| HST-N3-01 | HR-NFR-P3-01 | HB-P3 | green command と review tier 無しの合格主張を拒否する |
| HST-N3-02 | HR-NFR-P3-02 | HB-P3 | 実装 claim が design/AC/code/test/review finding と対応しない場合 pass しない |
| HST-N3-03 | HR-NFR-P3-03 | HB-P9 | 変更影響 L階層の gate/test/doctor profile 未実行を blocker 化する |
| HST-N3-04 | HR-NFR-P3-04 | HB-P3 | AI 実装が Red evidence / oracle / Green evidence / refactor safety を持つ |
| HST-N5-01 | HR-NFR-P5-01 | HB-P1 | 3 層 injection budget と artifact trail 分離を守る |
| HST-N5-02 | HR-NFR-P5-02 | HB-P1 | anchored iterative handover が Next Action と artifact trail を落とさない |
| HST-N5-03 | HR-NFR-P5-03 | HB-P3 | isolated test profile / parallel worker budget / duration evidence が観測できる |
| HST-N8-01 | HR-NFR-P8-01 | HB-P8 | high-impact operation は action-binding approval なしに適用されない |
| HST-N8-02 | HR-NFR-P8-02 | HB-P8 | prompt/tool injection と exfiltration 誘導が deny/review/redaction に止まる |
| HST-N8-03 | HR-NFR-P8-03 | HB-P8 | agentic AI 昇格が least privilege / rollback / monitoring / risk owner / threat model を要求する |
| HST-NAC-01 | HR-NFR-AC-01 | HB-AC | agent/template/skill/runtime adapter の rule drift を検出する |
| HST-NAC-02 | HR-NFR-AC-02 | HB-AC | hosted API/developer tool surface は preflight evidence なしに通らない |
| HST-NAC-03 | HR-NFR-AC-03 | HB-AC | runtime route が provider API direct call 前提でなく PLAN/CLI/harness DB/dry-run を正本にする |

## §2 G-DESIGN.L4

本 test design は L4 design と pair であり、`PLAN-L4-51` の G-DESIGN.L4 add-design readiness を検査する。
