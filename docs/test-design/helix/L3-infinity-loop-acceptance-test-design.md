---
title: "HELIX L3 受入テスト設計 — Infinity Loop"
layer: L3
executed_at_layer: L10
legacy_executed_at_layer: L12
canonical_layer_scheme: L1-L12
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL / PO承認必須
plan: PLAN-L1-07-infinity-loop-platform-requirements
pair_artifact: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
next_pair_freeze: L3
---

# HELIX L3 受入テスト設計 — Infinity Loop

## §0 共通合否契約

各HATは対応する3 ACと配下HIA assertionを全て実行し、正常系だけでなくnegative mutationが期待failure codeで
拒否された場合だけpassする。command、exit code、stdout/stderr digest、artifact/DB query digest、HEAD、runtime、
config、snapshot、実行時刻、worker/verifier分離を必須とする。HST greenやdoctor greenだけでcanonical L10総合テスト合格としない。

## §1 受入scenario

| HAT | L3/AC | supporting HST | 受入scenario | observable / 必須evidence | negative / boundary |
|---|---|---|---|---|---|
| HAT-HIL-01 | HR-FR-HIL-01 / HAC-HIL-01a, HAC-HIL-01b, HAC-HIL-01c | HST-HIL-001 | 各source入力をIssue契約へ取り込む | intake/contract revision/idempotency/trust receipt | duplicate、異payload、injection |
| HAT-HIL-02 | HR-FR-HIL-02 / HAC-HIL-02a, HAC-HIL-02b, HAC-HIL-02c | HST-HIL-001 | state machineをcausality付きで一周する | transition、closure query、checkpoint digest | illegal transition、orphan、budget境界 |
| HAT-HIL-03 | HR-FR-HIL-03 / HAC-HIL-03a, HAC-HIL-03b, HAC-HIL-03c | HST-HIL-004, HST-HIL-005 | PR監査からfinding promotionまで実行 | delivery/head、audit job、promotion lineage | duplicate/stale、partial promotion |
| HAT-HIL-04 | HR-FR-HIL-04 / HAC-HIL-04a, HAC-HIL-04b, HAC-HIL-04c | HST-HIL-002, HST-HIL-018 | ReverseとRedesign re-entryを実行 | R0–R4、coverage、stale/re-freeze | hollow/skip、誤layer、bypass |
| HAT-HIL-05 | HR-FR-HIL-05 / HAC-HIL-05a, HAC-HIL-05b, HAC-HIL-05c | HST-HIL-019, HST-HIL-021, HST-HIL-023 | directive custody、Scope、Closureを判定 | custody、authority graph、approval/closure receipt | AI終端、cycle、不要拡張、欠落receipt |
| HAT-HIL-06 | HR-FR-HIL-06 / HAC-HIL-06a, HAC-HIL-06b, HAC-HIL-06c | HST-HIL-003, HST-HIL-022 | 三段CIとquarantineを実行 | SHA/tree lineage、check/log、expiry | stage bypass、別SHA、overbroad quarantine |
| HAT-HIL-07 | HR-FR-HIL-07 / HAC-HIL-07a, HAC-HIL-07b, HAC-HIL-07c | HST-HIL-015, HST-HIL-016 | memory compactionとlearning promotionを実行 | input/output digest、shadow metric、review/rollback | raw/secret、self-promotion、regression |
| HAT-HIL-08 | HR-FR-HIL-08 / HAC-HIL-08a, HAC-HIL-08b, HAC-HIL-08c | HST-HIL-006 | registryからteam/lifecycleを完走 | registry/team digest、lease/fence/checkpoint/verify | manual drift、self-verify、late write |
| HAT-HIL-09 | HR-FR-HIL-09 / HAC-HIL-09a, HAC-HIL-09b, HAC-HIL-09c | HST-HIL-011, HST-HIL-020 | 三sourceをsnapshot/atom/coverageへ処理 | manifests、atom spans、decision/edge/stale receipt | branch/child欠落、aggregate-only、pending |
| HAT-HIL-10 | HR-FR-HIL-10 / HAC-HIL-10a, HAC-HIL-10b, HAC-HIL-10c | HST-HIL-008, HST-HIL-009 | engine/detectorを同一snapshotへ再実行 | version/config/input/output、artifact/finding、rerun digest | unknown、混同、nondeterminism、partial |
| HAT-HIL-11 | HR-FR-HIL-11 / HAC-HIL-11a, HAC-HIL-11b, HAC-HIL-11c | HST-HIL-010 | product dataをfull/incremental投影 | connector、lineage、watermark、redaction/query | drift、cursor逆行、PII、stale current |
| HAT-HIL-12 | HR-FR-HIL-12 / HAC-HIL-12a, HAC-HIL-12b, HAC-HIL-12c | HST-HIL-007 | NodeからPython workerを実行 | protocol/version/sequence/terminal/transaction | invalid/oversize/timeout/crash/late/direct write |
| HAT-HIL-13 | HR-FR-HIL-13 / HAC-HIL-13a, HAC-HIL-13b, HAC-HIL-13c | HST-HIL-013 | Bun-less Linuxでinstallからdistributionまで完走 | environment、Node lock、CLI/build/test/package、zero finding | Bun API/command/lock/CI残存、部分claim |
| HAT-HIL-14 | HR-FR-HIL-14 / HAC-HIL-14a, HAC-HIL-14b, HAC-HIL-14c | HST-HIL-014, HST-HIL-017 | 3 OS contractとsupply chainを検証 | OS matrix、offline digest、SBOM/secret/license | adapter leak、process/lock、unlock/policy違反 |
| HAT-HIL-15 | HR-FR-HIL-15 / HAC-HIL-15a, HAC-HIL-15b, HAC-HIL-15c | HST-HIL-012, HST-HIL-024 | no-UIまたはprototype routeを完了 | applicability、artifact/state、walkthrough/delta/agreement | implicit skip、static-only、stale receipt |
| HAT-HIL-16 | HR-FR-HIL-16 / HAC-HIL-16a, HAC-HIL-16b, HAC-HIL-16c | HST-HIL-025, HST-HIL-026 | design refactorとdomain namingをrouting | semantic signature、consumer/oracle、role/name、rollback | lexical-only、根拠なし抽象化、誤route |
| HAT-HIL-17 | HR-FR-HIL-17 / HAC-HIL-17a, HAC-HIL-17b, HAC-HIL-17c | HST-HIL-027, HST-HIL-028, HST-HIL-029 | requirement翻訳、template義務、revisionをactive化 | source/authority/oracle、template/obligation/change/review | aggregate/TBD/N/A、self-promotion、stale |
| HAT-HIL-18 | HR-FR-HIL-18 / HAC-HIL-18a, HAC-HIL-18b, HAC-HIL-18c | HST-HIL-030, HST-HIL-031, HST-HIL-032, HST-HIL-033 | canonical L1–L12 ledger、層外L0 anchor、上下/左右pairとrefactorを検証 | registry、snapshot、addition/pair/oracle/refactor receipt | 片edge、stale、未実行oracle、pair破壊 |
| HAT-HIL-19 | HR-FR-HIL-19 / HAC-HIL-19a, HAC-HIL-19b, HAC-HIL-19c | HOT-HIL-48, HOT-HIL-49 | Authoring Admissionと原子的Canonical化を検証 | decision、revision、transaction、rollback、identity receipt | 過剰確認、無権限、partial、stale、oracle消失 |
| HAT-HIL-20 | HR-FR-HIL-20 / HAC-HIL-20a, HAC-HIL-20b, HAC-HIL-20c | HOT-HIL-50, HOT-HIL-51 | 設計契約portfolioをForward/Scrumへ接続 | coverage、example、phase snapshot、S4/backprop receipt | 固定冊数、negative欠落、別正本、早期昇格 |
| HAT-HIL-21 | HR-FR-HIL-21 / HAC-HIL-21a, HAC-HIL-21b, HAC-HIL-21c | HOT-HIL-52, HOT-HIL-53 | 判断packと専門agentを生成・muster | pack、shadow、agent contract、guard/lifecycle receipt | self-promotion、過剰agent、未許可、自己検証 |
| HAT-HIL-22 | HR-FR-HIL-22 / HAC-HIL-22a, HAC-HIL-22b, HAC-HIL-22c | HOT-HIL-54, HOT-HIL-55 | worker bench、実task scorecard、effort routingを検証 | fixture/rubric、blind score、実効cost、route receipt | smoke-only、重大failure相殺、単価/effort固定 |
| HAT-HIL-23 | HR-FR-HIL-23 / HAC-HIL-23a, HAC-HIL-23b, HAC-HIL-23c | HOT-HIL-56 | 第三者workerの隔離委譲を検証 | sandbox、egress、payload、FS diff、audit receipt | 機密漏洩、allowlist外通信、bypass残置、未検証proposal |
| HAT-HIL-24 | HR-FR-HIL-24 / HAC-HIL-24a, HAC-HIL-24b, HAC-HIL-24c | HOT-HIL-57 | marketplace型配布indexを検証 | source/generated index digest、party分類、cutover approval | 手編集、party混在、未承認切替 |

## §2 量閉じとfreeze条件

- HAT: 24件、対応L3 FR: 24/24、対応AC: 72/72。
- L2 primary trace: 153/153（物理pathはlegacy L1）。うち既存141件はL9 atomic assertion caseへ到達し、追加12件はHOT-HIL-56/57を正本oracleとしてL9降下待ちである。
- 実行状態: 全件未実装。fixture、command、exit、digest、DB queryが揃うまでacceptしない。
- G3 freezeはPO承認、別runtime review、semantic frontier record、canonical L3/L10 pair lint greenを必要とする。
