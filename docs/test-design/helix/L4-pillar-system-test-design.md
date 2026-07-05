---
title: "HELIX L4 総合テスト設計 — pillar basic design（柱基本設計）"
layer: L4
executed_at_layer: L9
artifact_type: test_design
status: confirmed
created: 2026-06-28
updated: 2026-07-01
owner: QA + AIM
plan: PLAN-L4-51-helix-pillar-basic-design
pair_artifact: docs/design/helix/L4-basic-design/pillar-basic-design.md
related_l4: docs/design/helix/L4-basic-design/pillar-basic-design.md
next_pair_freeze: L4
---

# HELIX L4 総合テスト設計 — pillar basic design（柱基本設計）

> L4 basic design `pillar-basic-design.md` の L9 system test design（システムテスト設計）。
> 実装済みテストの存在ではなく、L4 block（L4 責務ブロック）を system として観測する受入観点を定義する。

## §0 量閉じ

- 対象 L3 要件: 46 件。
- 対象 L4 block（L4 責務ブロック）: 10 件。
- system test（システムテスト）観測: HST 46 件。
- Route-B back-fill L3 要件 8 件は L6 route-B / Reverse back-fill の acceptance（受入）で観測し、本 L4 pillar system test では 46 件に二重計上しない。ただし HB-P1 / HB-P2 / HB-P3 / HB-P7 / HB-AC の境界に接続されることは §1.1 で観測する。
- 孤児: 0。
- L1 §2.8 asset/progress visualization amendment は 2026-07-06 PO 指示で S4 confirmed に戻したが、
  本 HST 46 件の system pass（システム通過判定）にはまだ含めない。再開する場合は対象 PLAN と別 HST を接続する。
- G-SF は confirmed overlay を `confirmed_overlay_frontier_count=0` とし、現行 live frontier を `live_semantic_frontier_count=2` とする。`semantic_feature_frontier_record` が
  `frontier_pending_decision` / `parked_future_version` /
  `approval_gated_cutover` を返す意味単位は、HST system pass の対象外でなければならない。
  L9 system 観測では `completion_claim_allowed=false` を期待値にし、doctor green、selected HST green、
  または先行 first-response artifact をもって revised request 全体の system completion（システム完了）としない。

## §0.1 system verification strategy（システム検証戦略）

L9 system test は system behavior（システム挙動）の観測設計であり、HST-* の pass は実行済み unit/integration
test の集計だけでは閉じない。HELIX では system-level claim（システムレベル主張）を以下で検証する。

- HST-P2 / HST-P7 / HST-NAC の runtime parity（実行環境 parity）は、Claude/Codex direct hook、Codex hosted/API
  preflight-only surface、adapter command のどこで実際に観測したかを evidence path（証跡パス）に持つ。
- HST-P3 / HST-P9 の completion claim（完了主張）は、projection-only telemetry ではなく L7.5 RUN & Debug の
  runtime provenance log に紐づく場合だけ `works` と扱う。
- HST-P6 / HST-P8 の external/GitHub/API 操作は、dry-run plan と action-binding approval の evidence（証跡）
  が無い限り system pass にしない。
- HST-P9 は semantic frontier の分類を relation/projection に残すことを観測し、未承認の
  visualization / version-up / rename cutover を completed system block に丸めない。
- HST-P10 相当の UI / Webview / dashboard claim は、Playwright trace/report または render smoke と
  WCAG 2.2 success-criteria mapping を evidence path に持つ。automated accessibility scan だけで
  UAT/pass とせず、manual accessibility または inclusive-user review の route（経路）を G11 に残す。

## §1 system test trace（システムテスト trace）

| HST-ID | 対応 L3 | 対応 L4 block（L4 責務ブロック） | system 観測 |
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
| HST-P6-04 | HR-FR-P6-04 | HB-P6 | tag bump が migration / rollback / idempotency plan を出し破壊的 apply を止める。PLAN-M-02 rename cutover は full approval evidence と current `cutoverSnapshot` sha256 binding が無い限り `approvalMaterialReady=false` のままになり、plan-only packet では常に `applyAuthorized=false` のままになる |
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
| HST-P9-04 | HR-FR-P9-04 | HB-P9 | message catalog surface が人間向け prose と machine token を分離する |
| HST-P9-05 | HR-FR-P9-05 | HB-P9 | mid-layer coverage が FR の L3-L6 到達と停滞を返す |
| HST-P9-06 | HR-FR-P9-06 | HB-P9 | inventory evidence 欠落の design/add-design freeze を拒否する |
| HST-N3-01 | HR-NFR-P3-01 | HB-P3 | green command と review tier 無しの合格主張を拒否する |
| HST-N3-02 | HR-NFR-P3-02 | HB-P3 | 実装 claim が design/AC/code/test/review finding と対応しない場合 pass しない |
| HST-N3-03 | HR-NFR-P3-03 | HB-P9 | 変更影響 L階層の gate/test/doctor profile 未実行を blocker 化する |
| HST-N3-04 | HR-NFR-P3-04 | HB-P3 | AI 実装が Red evidence / oracle / Green evidence / refactor safety を持つ |
| HST-N5-01 | HR-NFR-P5-01 | HB-P1 | 3 層 injection budget と artifact trail 分離を守る |
| HST-N5-02 | HR-NFR-P5-02 | HB-P1 | anchored iterative handover が Next Action と artifact trail を落とさない |
| HST-N5-03 | HR-NFR-P5-03 | HB-P3 | isolated test profile / parallel worker budget / duration evidence が観測できる |
| HST-N8-01 | HR-NFR-P8-01 | HB-P8 | high-impact operation は action-binding approval なしに適用されない。snapshot-bound approval は current `sha256:` snapshotId を `reviewed_snapshot_binding` に含まない限り pending になる |
| HST-N8-02 | HR-NFR-P8-02 | HB-P8 | prompt/tool injection と exfiltration 誘導が deny/review/redaction に止まる |
| HST-N8-03 | HR-NFR-P8-03 | HB-P8 | agentic AI 昇格が least privilege / rollback / monitoring / risk owner / threat model を要求する |
| HST-NAC-01 | HR-NFR-AC-01 | HB-AC | agent/template/skill/runtime adapter の rule drift を検出する |
| HST-NAC-02 | HR-NFR-AC-02 | HB-AC | hosted API/developer tool surface は preflight evidence なしに通らない |
| HST-NAC-03 | HR-NFR-AC-03 | HB-AC | runtime route が provider API direct call 前提でなく PLAN/CLI/harness DB/dry-run を正本にする |

## §1.1 Route-B boundary observation（Route-B 境界観測）

| Route-B L3 ID | L4 block boundary（L4 ブロック境界） | system 観測 |
|---------------|-------------------|-------------|
| HR-BR-07 | HB-P2 | loop 継続・停止・Recovery 分類が agent-loop の安全側 decision として扱われる |
| HR-BR-12 | HB-P7 | shared memory が harness/project layer と supersede を持ち、per-agent silo へ落ちない |
| HR-NFR-03 | HB-P3 / HB-P7 | worker 自己 pass 禁止と memory secret reject が別々の境界で観測できる |
| HR-BR-07R | HB-P2 | tick runtime が same-runtime verifier 代替へ落ちず stopped/blocker を残す |
| HR-BR-12R | HB-P7 | memory persistence / CLI が shared SSoT と append-only を守る |
| HR-NFR-03R | HB-P1 | job queue claim が二重取得を防ぎ、busy を backoff 可能に扱う |
| HR-BR-13R | HB-P2 / HB-AC | runtime bridge が tick の verifier selection と adapter parity に従う |
| HR-BR-14R | HB-P1 / HB-P2 | loop run entrypoint が scheduler state と tick を結合し、dry-run では dispatch しない |

## §2 G-DESIGN.L4

本 test design（テスト設計）は L4 design と pair であり、`PLAN-L4-51` の G-DESIGN.L4 add-design readiness（追加設計準備）を検査する。
