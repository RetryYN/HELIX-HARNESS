---
title: "HELIX Infinity Loop 要求authority binding台帳"
status: draft-reviewed-by-codex
created: 2026-07-19
updated: 2026-07-19
owner: PO / TL
canonical_layer_scheme: L1-L12
requirements: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
system_requirements: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
source_ledger: docs/governance/infinity-loop-source-capability-ledger.md
---

# HELIX Infinity Loop 要求authority binding台帳

## 判定契約

各L2要求はprimary ownerであるL3 system FRのauthority setへexactly 1回bindする。authority rootは
PO chat/directive、accepted ADR、active harness memory、custody済みresearch/source atomのいずれかとする。
外部code由来でない要求へsource capability atomを強制しない。各setのsourceがstale、missing、又はauthority
競合になった場合、そのset配下の要求definitionを一括stale化する。

本台帳の`current`は出典とauthority rootが特定済みであることだけを表し、PO承認、L2/L11・L3/L10 pair、
template applicability review、design obligation discharge、freezeを意味しない。

## Authority集合

| authority set | primary L3 FR | authority roots | 判定 |
|---|---|---|---|
| RAS-HIL-01 | HR-FR-HIL-01 | HC-CHAT-010、HC-CHAT-031、source capability ledger | current |
| RAS-HIL-02 | HR-FR-HIL-02 | HC-CHAT-006、HC-CHAT-023、L0 charter | current |
| RAS-HIL-03 | HR-FR-HIL-03 | HC-CHAT-007/008、GitHub自走PO決定 | current |
| RAS-HIL-04 | HR-FR-HIL-04 | HC-CHAT-011..014 | current |
| RAS-HIL-05 | HR-FR-HIL-05 | HC-CHAT-021/022、L0 charter安全境界 | current |
| RAS-HIL-06 | HR-FR-HIL-06 | HC-CHAT-005/015 | current |
| RAS-HIL-07 | HR-FR-HIL-07 | HC-CHAT-016/020 | current |
| RAS-HIL-08 | HR-FR-HIL-08 | HC-CHAT-017/018 | current |
| RAS-HIL-09 | HR-FR-HIL-09 | HC-CHAT-024..026/030..032、sealed source authority receipts | current |
| RAS-HIL-10 | HR-FR-HIL-10 | HC-CHAT-019/024 | current |
| RAS-HIL-11 | HR-FR-HIL-11 | HC-CHAT-001 | current |
| RAS-HIL-12 | HR-FR-HIL-12 | HC-CHAT-002、ADR-009/010 | current |
| RAS-HIL-13 | HR-FR-HIL-13 | HC-CHAT-003、ADR-009 | current |
| RAS-HIL-14 | HR-FR-HIL-14 | HC-CHAT-004、ADR-009 | current |
| RAS-HIL-15 | HR-FR-HIL-15 | HC-CHAT-028/029 | current |
| RAS-HIL-16 | HR-FR-HIL-16 | HC-CHAT-034..036 | current |
| RAS-HIL-17 | HR-FR-HIL-17 | HC-CHAT-037..039 | current |
| RAS-HIL-18 | HR-FR-HIL-18 | HC-CHAT-040、L12 canonical directive、memory `l12-layer-scheme-canonical` | current |
| RAS-HIL-19 | HR-FR-HIL-19 | autonomous-authoring-admission-transaction-directive_v0.1.md | current |
| RAS-HIL-20 | HR-FR-HIL-20 | memory `infinity-loop-requirements-141-consistency-2026-07-19`、L12 canonical directive | current |
| RAS-HIL-21 | HR-FR-HIL-21 | memory `infinity-loop-requirements-141-consistency-2026-07-19`、judgment-core | current |
| RAS-HIL-22 | HR-FR-HIL-22 | memory `worker-bench-scorecard-plan-2026-07-19` / `effort-policy-low-default-escalate-model`、harness improvement research | current |
| RAS-HIL-23 | HR-FR-HIL-23 | worker-runtime-security-requirements-instruction-2026-07-19.md、memory `requirements-reflection-gap-2026-07-19` | current |
| RAS-HIL-24 | HR-FR-HIL-24 | harness-improvement-from-grok-kimi-oss-2026-07-19.md §2/改善指示7、memory `requirements-reflection-gap-2026-07-19` | current |

## 閉鎖条件

1. L3 primary partitionがL2要求153件を重複0・未割当0で覆う。
2. 全24 authority setが存在し、各L3 FRがexactly 1 setを持つ。
3. definition ledgerの全153行がprimary L3 FRから導出した同一authority setを持つ。
4. authority setだけでfreezeを主張せず、assertion、template、design obligation、pair、独立reviewを別々に閉じる。
