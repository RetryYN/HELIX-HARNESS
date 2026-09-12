---
canonical_vmodel: L1-L12
canonical_layer: L4
canonical_pair: L9
title: "Resident Lane Assignment管理境界 基本設計"
layer: L4
kind: add-design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: Codex / TL
plan: PLAN-L7-860-resident-lane-assignment-kernel
parent_design: docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md
pair_artifact: docs/test-design/helix/L9-resident-lane-assignment-boundary-integration-test-design.md
---

# Resident Lane Assignment管理境界 基本設計

## 目的

L3のSlice 2を、管理層のAssignment authorityとproduct V-modelのscope契約を混ぜずに実装可能な境界へ降ろす。
管理層はwriterの所有・有効性・遷移を扱い、IssueまたはPLANが持つ要求・設計・受入条件の意味を変更しない。

## コンポーネント境界

| 境界 | 所有する責務 | 所有しない責務 |
|---|---|---|
| Assignment pure kernel | exact schema、active exact set、重複、期限、branch、HEAD、fence、review return、takeover判定 | GitHub読書き、DB、branch作成、dispatch |
| Event adapter（後続atom） | Assignment payloadを既存append-only journalへ接続しreplayする | 第二journal、第二lease、意味契約の変更 |
| Active writer query（後続atom） | current assignment exact setを#1256へ渡す | PLAN reservation競合規則の再実装 |
| Work-ticket relation（#1771） | required role/capabilityとAssignment参照の照合 | Assignment lifecycle、lease/fence更新 |

## 不変条件

- `scope_ref`はGitHub IssueまたはPLANのexactly oneであり、本文は複製しない。
- 一branch一writer、一scope一active branchを既定とし、子Issueは別scopeとして明示する。
- `changes requested`は元worker・同branch・同candidate HEAD・同fenceへだけ戻す。
- takeoverは旧lease終端、remote HEAD一致、handover receipt、新lease ID、単調増加fenceを要求する。
- provider session、通知本文、queue row、Project表示をAssignment authorityへ昇格させない。
- event保存の再利用とevent契約の対応済み主張を区別し、RLO-AC-024..026がgreenになるまでmulti-HEAD統合完了としない。

## 原子的な実装順

1. pure schema/projection/review-return/takeover。
2. version付きpayloadとhistorical HEAD/current writer admission分離。
3. event reducer/queryとrestart replay。
4. #1256 active writer provider。
5. GitHub read-after、branch発行、dispatch effect。

本sliceは1だけを実装する。2以降を暗黙に満たしたとは扱わない。
