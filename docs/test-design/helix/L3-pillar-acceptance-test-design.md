---
title: "HELIX L3 受入テスト設計 — pillar FR/AC"
layer: L3
executed_at_layer: L12
artifact_type: test_design
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: AIM + TL (Codex) / PO approval required
plan: PLAN-L3-06-helix-pillar-descent
pair_artifact: docs/design/helix/L3-requirements/
related_l3: docs/design/helix/L3-requirements/pillar-functional-requirements.md
next_pair_freeze: L3
---

# HELIX L3 受入テスト設計 — pillar FR/AC

> L3 要件 `pillar-functional-requirements.md` の L12 受入テスト設計。status は `confirmed`。
> 本書は acceptance の名前・観測条件を確定する正本であり、実装済みテストの存在を主張しない。

## §0 量閉じ

- 対象 L3 要件: HR-FR 30 件 + HR-NFR 13 件 = 43 件。
- 対象 AC: HAC 86 件。
- 受入テスト: HAT 43 件。各 HAT は対応 FR/NFR の 2 AC を束ね、正常/異常または通常/境界を観測する。
- Route-B back-fill L3 要件: `HR-BR-*` / `HR-NFR-03*` 8 件。P2/P7 の先行実装由来で、pillar 43 件とは別枠で §1.1 に受入観測を持つ。
- 孤児: 0。詳細は §2 / §2.1 trace。

## §0.1 HELIX 検証戦略

本書は L12 受入テスト設計であり、HAT-* は「何を受け入れるか」を固定する **テスト戦略**である。
HELIX ではこれに加え、受入 claim を閉じる **検証戦略**を要求する。

- HAT が runtime behavior を観測する場合、合格根拠は実 command / adapter / hook / session 由来の evidence
  でなければならない。DB projection、計画表、coverage 数値だけでは `works` claim を閉じない。
- P2/P7/HNFR-AC の Claude/Codex runtime parity は、direct hook が効く surface と hosted/API preflight-only
  surface を分け、どちらの evidence で受け入れるかを記録する。
- P3/P9 の実装精度・DB 収束は、L7.5 RUN & Debug で捕捉した runtime provenance を L12 受入 evidence
  に接続する。projection-only telemetry は未検証として扱う。

## §1 受入テスト

| HAT-ID | 対応 L3 | 対応 AC | 受入観測 | 機械検証候補 |
|--------|---------|---------|----------|--------------|
| HAT-P0-01 | HR-FR-P0-01 | HAC-P0-01a/b | 全 workflow PLAN が Forward 返却先または明示隔離を持つ | forward_return lint / plan-governance |
| HAT-P0-02 | HR-FR-P0-02 | HAC-P0-02a/b | cap/lock 到達時に停止理由と handover が残り二重実行しない | orchestration tests / handover lint |
| HAT-P1-01 | HR-FR-P1-01 | HAC-P1-01a/b | resume 3 条件 + job + budget + fresh-session が連動する | loop-runner / handover tests |
| HAT-P1-02 | HR-FR-P1-02 | HAC-P1-02a/b | version_target と tag bump dry-run が migration/rollback を出す | version-up tests / plan lint |
| HAT-P1-03 | HR-FR-P1-03 | HAC-P1-03a/b | 大きい要求が Scrum/PoC/sprint slice に分割され、各 slice が Forward 返却先と next_action を持つ | scrum/work-breakdown / handover tests |
| HAT-P1-04 | HR-FR-P1-04 | HAC-P1-04a/b | L2 を飛ばした slice でも template pack と mock back-propagation workflow が生成される | L2-template / back-propagation tests |
| HAT-P2-01 | HR-FR-P2-01 | HAC-P2-01a/b | tool contract registry が未登録 surface を許可しない | tool-contract tests |
| HAT-P2-02 | HR-FR-P2-02 | HAC-P2-02a/b | loop effort/budget 超過で自己継続しない | orchestration budget tests |
| HAT-P2-03 | HR-FR-P2-03 | HAC-P2-03a/b | Codex `apply_patch` / `write_file` / `exec_command` / `local_shell` adapter map、direct hook parity、hosted API preflight が区別される | codex-hook-adapter / preflight tests |
| HAT-P2-04 | HR-FR-P2-04 | HAC-P2-04a/b | API/SDK 呼び出し前提ではなく PLAN 駆動で、simple workflow 既定、multi-agent 昇格理由、harness DB loop trace span、eval outcome が残る | agent-loop tracing / eval tests |
| HAT-P3-01 | HR-FR-P3-01 | HAC-P3-01a/b | pair 欠落と coverage-only 完了主張を拒否する | pair-freeze / review-evidence tests |
| HAT-P3-02 | HR-FR-P3-02 | HAC-P3-02a/b | 外部 claim は source attribution + 別 verifier を要求する | external-grounding tests |
| HAT-P4-01 | HR-FR-P4-01 | HAC-P4-01a/b | detector event が repair candidate へ変換され、高リスクは approval 待ちになる | repair-routing tests |
| HAT-P4-02 | HR-FR-P4-02 | HAC-P4-02a/b | repair recipe が memory/backlog へ残り、頻出時に promote 候補になる | memory + improvement-backlog tests |
| HAT-P4-03 | HR-FR-P4-03 | HAC-P4-03a/b | 実装精度・レビュー・テスト時間・flake・再作業 metric と trace/metric/log observability が改善候補へ変換される | metric collector / improvement routing tests |
| HAT-P6-01 | HR-FR-P6-01 | HAC-P6-01a/b | raw push/merge が required checks と bypass audit により制御される | GitHub rules dry-run tests + primary-source artifact |
| HAT-P6-02 | HR-FR-P6-02 | HAC-P6-02a/b | PR review と CI auto-fix が worker≠verifier と confidence cap を守る | PR workflow tests |
| HAT-P6-03 | HR-FR-P6-03 | HAC-P6-03a/b | fresh/brownfield setup が `.ut-tdd` / `.helix` state、doctor baseline、baseline plan、import report、`skip_sub_doc` を非破壊に出す | setup/distribution tests |
| HAT-P6-04 | HR-FR-P6-04 | HAC-P6-04a/b | tag bump が migration/rollback/idempotency plan を出し破壊的 apply を止める | version-up dry-run tests |
| HAT-P6-05 | HR-FR-P6-05 | HAC-P6-05a/b | release automation が一次出典つき ADR で選ばれ、CI auto-fix repush が confidence 0.75 と iteration cap を守る | release ADR / CI auto-fix tests |
| HAT-P7-01 | HR-FR-P7-01 | HAC-P7-01a/b | Claude/Codex が同じ memory/handover provider を bounded recall する | memory surface / session-start tests |
| HAT-P7-02 | HR-FR-P7-02 | HAC-P7-02a/b | Glossary SSoT が用語 rename/synonym drift を検出する | glossary lint tests |
| HAT-P7-03 | HR-FR-P7-03 | HAC-P7-03a/b | DDD context map が bounded context、ubiquitous language、owner、published language、anti-corruption boundary を検査する | context-map / relation-graph tests |
| HAT-P8-01 | HR-FR-P8-01 | HAC-P8-01a/b | external research artifact が source/span を持ち未検証採用を防ぐ | research-grounding tests |
| HAT-P8-02 | HR-FR-P8-02 | HAC-P8-02a/b | skillify candidate は license/safety review なしに registry 入りしない | skillify tests |
| HAT-P8-03 | HR-FR-P8-03 | HAC-P8-03a/b | external code/API は一次出典で検証済みの MicroVM/gVisor sandbox と token policy に従い無制限実行しない | sandbox/token-policy tests |
| HAT-P8-04 | HR-FR-P8-04 | HAC-P8-04a/b | 外部 text が raw/metadata/trusted extraction/instruction に分離され、命令として直結しない | security-filter tests |
| HAT-P9-01 | HR-FR-P9-01 | HAC-P9-01a/b | DB 未収束 artifact/setup baseline を完了扱いにしない | projection/doctor tests |
| HAT-P9-02 | HR-FR-P9-02 | HAC-P9-02a/b | relation graph / contract ledger が impact query と breaking classification を返す | relation-graph tests |
| HAT-P9-03 | HR-FR-P9-03 | HAC-P9-03a/b | L階層 baseline、span、metric trend、regression query が未実行 gate/悪化 metric/owner を返す | layer-regression projection tests |
| HAT-N3-01 | HR-NFR-P3-01 | HAC-N3-01a/b | green command と review tier 無しの合格主張を拒否する | review-evidence tests |
| HAT-N3-02 | HR-NFR-P3-02 | HAC-N3-02a/b | 実装 claim が design/AC/code/test/review finding と対応しない場合に pass しない | implementation-accuracy trace tests |
| HAT-N3-03 | HR-NFR-P3-03 | HAC-N3-03a/b | 変更影響 L階層の gate/test/doctor profile 未実行や悪化 metric を blocker 化する | layer regression fence tests |
| HAT-N3-04 | HR-NFR-P3-04 | HAC-N3-04a/b | AI 実装が Red evidence / acceptance oracle / Green evidence / refactor safety または代替 oracle を持つ | TDD evidence / oracle trace tests |
| HAT-N5-01 | HR-NFR-P5-01 | HAC-N5-01a/b | 層境界数値つき 3 層 injection budget と可逆圧縮用 artifact trail / raw-evidence pointer 分離を守る | injection/handover tests |
| HAT-N5-02 | HR-NFR-P5-02 | HAC-N5-02a/b | anchored iterative handover が Next Action/blocker を落とさない | handover quality tests |
| HAT-N5-03 | HR-NFR-P5-03 | HAC-N5-03a/b | isolated test profile、parallel worker/resource budget、実行時間 evidence により通常 loop が不要な full suite を強制しない | verification-profile / test runtime metrics |
| HAT-N8-01 | HR-NFR-P8-01 | HAC-N8-01a/b | high-impact operation は action-binding approval なしに適用されない | approval-boundary tests |
| HAT-N8-02 | HR-NFR-P8-02 | HAC-N8-02a/b | prompt injection / tool injection / exfiltration 誘導が audit され deny/review に止まる | prompt-injection filter tests |
| HAT-N8-03 | HR-NFR-P8-03 | HAC-N8-03a/b | agentic AI 昇格が task scope、least privilege、rollback、monitoring、risk owner、threat model 更新を要求する | agentic-risk gate tests |
| HAT-NAC-01 | HR-NFR-AC-01 | HAC-NAC-01a/b | runtime adapter/agent/skill/template の rule drift を検出する | rule-drift/catalog tests |
| HAT-NAC-02 | HR-NFR-AC-02 | HAC-NAC-02a/b | hosted API/developer tool surface は preflight evidence なしに通らない | hosted-surface preflight tests |
| HAT-NAC-03 | HR-NFR-AC-03 | HAC-NAC-03a/b | AI runtime が provider API 直叩き前提ではなく PLAN artifact / CLI adapter / harness DB trace / dry-run plan を正本にする | runtime-route / approval-boundary tests |

## §1.1 Route-B back-fill acceptance

`orchestration-memory*.md` の L3 back-fill は本書を pair artifact として参照するため、pillar 43 件とは別に
受入観測を固定する。これらは L4/L5 pillar overlay へ二重採番せず、L6 `orchestration-memory.md` と
L7 実装済み oracle を通じて trace する。

| HAT-ID | 対応 L3 back-fill | 受入観測 | 機械検証候補 |
|--------|-------------------|----------|--------------|
| HAT-ORB-07 | HR-BR-07 | `canResume` / `evaluateStop` / `classifyRecovery` が loop 継続・停止・Recovery 分類を安全側に決定する | U-ORCH-001 / U-ORCH-002 / U-ORCH-005 |
| HAT-ORB-12 | HR-BR-12 | 2 層 memory が append-only / supersede / harness-only surface のセマンティクスを持つ | U-MEM-001 / U-MEM-002 / U-MEM-003 |
| HAT-ONFR-03 | HR-NFR-03 | hybrid では worker と verifier が別 runtime になり、single-runtime fallback は明示 blockedReason を持つ | U-ORCH-003 / U-MEM-001 |
| HAT-ORB-07R | HR-BR-07R | `tick` が resume 偽で dispatch せず、cross runtime 不在時に worker 自己評価で pass しない | U-ORCH-004 |
| HAT-ORB-12R | HR-BR-12R | `.ut-tdd/memory/<layer>.jsonl` が共有 SSoT として読み書きされ、secret body は保存されない | memory-store / CLI memory tests |
| HAT-ONFR-03R | HR-NFR-03R | job queue claim が `BEGIN IMMEDIATE` により二重取得を防ぎ、busy は backoff 可能な null になる | U-ORCH-006 |
| HAT-ORB-13R | HR-BR-13R | `nodeTickDeps` が tick の provider 選定を再実装せず、既存 adapter 実行面と verdict 解釈へ接続する | U-ORCH-BRIDGE-01 |
| HAT-ORB-14R | HR-BR-14R | `ut-tdd loop run` が loop-store から state を読み、`--once` / `--dry-run` / iteration 永続を正しく扱う | U-ORCH-BRIDGE-02 |

## §2 trace

| L1 | L3 | L12 |
|----|----|-----|
| HBR-P0 | HR-FR-P0-01 / HR-FR-P0-02 | HAT-P0-01 / HAT-P0-02 |
| HBR-P1 | HR-FR-P1-01 / HR-FR-P1-02 / HR-FR-P1-03 / HR-FR-P1-04 | HAT-P1-01 / HAT-P1-02 / HAT-P1-03 / HAT-P1-04 |
| HBR-P2 | HR-FR-P2-01 / HR-FR-P2-02 / HR-FR-P2-03 / HR-FR-P2-04 | HAT-P2-01 / HAT-P2-02 / HAT-P2-03 / HAT-P2-04 |
| HBR-P3 / HNFR-P3 | HR-FR-P3-01 / HR-FR-P3-02 / HR-NFR-P3-01 / HR-NFR-P3-02 / HR-NFR-P3-03 / HR-NFR-P3-04 | HAT-P3-01 / HAT-P3-02 / HAT-N3-01 / HAT-N3-02 / HAT-N3-03 / HAT-N3-04 |
| HBR-P4 | HR-FR-P4-01 / HR-FR-P4-02 / HR-FR-P4-03 | HAT-P4-01 / HAT-P4-02 / HAT-P4-03 |
| HBR-P6 | HR-FR-P6-01 / HR-FR-P6-02 / HR-FR-P6-03 / HR-FR-P6-04 / HR-FR-P6-05 | HAT-P6-01 / HAT-P6-02 / HAT-P6-03 / HAT-P6-04 / HAT-P6-05 |
| HBR-P7 | HR-FR-P7-01 / HR-FR-P7-02 / HR-FR-P7-03 | HAT-P7-01 / HAT-P7-02 / HAT-P7-03 |
| HBR-P8 / HNFR-P8 | HR-FR-P8-01 / HR-FR-P8-02 / HR-FR-P8-03 / HR-FR-P8-04 / HR-NFR-P8-01 / HR-NFR-P8-02 / HR-NFR-P8-03 | HAT-P8-01 / HAT-P8-02 / HAT-P8-03 / HAT-P8-04 / HAT-N8-01 / HAT-N8-02 / HAT-N8-03 |
| HBR-P9 | HR-FR-P9-01 / HR-FR-P9-02 / HR-FR-P9-03 | HAT-P9-01 / HAT-P9-02 / HAT-P9-03 |
| HNFR-P5 | HR-NFR-P5-01 / HR-NFR-P5-02 / HR-NFR-P5-03 | HAT-N5-01 / HAT-N5-02 / HAT-N5-03 |
| HNFR-AC | HR-NFR-AC-01 / HR-NFR-AC-02 / HR-NFR-AC-03 | HAT-NAC-01 / HAT-NAC-02 / HAT-NAC-03 |

## §2.1 Route-B back-fill trace

| L3 back-fill doc | L3 IDs | L12 |
|------------------|--------|-----|
| orchestration-memory.md | HR-BR-07 / HR-BR-12 / HR-NFR-03 | HAT-ORB-07 / HAT-ORB-12 / HAT-ONFR-03 |
| orchestration-memory-runtime.md | HR-BR-07R / HR-BR-12R / HR-NFR-03R | HAT-ORB-07R / HAT-ORB-12R / HAT-ONFR-03R |
| orchestration-runtime-bridge.md | HR-BR-13R / HR-BR-14R | HAT-ORB-13R / HAT-ORB-14R |

## §3 G-REQ.L3

本書と pair の L3 要件文書は PO 承認を経て `confirmed` に昇格済み。
