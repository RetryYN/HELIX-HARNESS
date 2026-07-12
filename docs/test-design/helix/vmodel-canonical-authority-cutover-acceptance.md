---
title: "ZIP L1-L12 canonical authority cutover 受入・検証設計"
layer: L11
kind: acceptance-test-design
status: draft
created: 2026-07-13
updated: 2026-07-13
owner: QA
plan: PLAN-L3-14-vmodel-canonical-authority-cutover
pair_artifact: docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md
---

# ZIP L1-L12 canonical authority cutover 受入・検証設計

| AC-ID | 対応要件 | 受入oracle |
|---|---|---|
| AC-VMCUT-001 | HR-FR-VMCUT-01 | Core Reads、設計、typed declaration、DB/viewが同じauthority epochを示し、二重canonicalを0件にする |
| AC-VMCUT-002 | HR-FR-VMCUT-01 | pinned ZIP hash/inventoryが一致し、ZIP Python/Excel/buildをruntime正本として実行しない |
| AC-VMCUT-003 | HR-FR-VMCUT-02 | 全L0-L14 tokenにexact L1-L12 remapがあり、未分類・多対多曖昧を0件にする |
| AC-VMCUT-004 | HR-FR-VMCUT-02 | 旧入力をcompat期限内は受理し、canonical outputはL1-L12のみ生成する |
| AC-VMCUT-005 | HR-FR-VMCUT-03 | 新規独立L6機能設計をdetectorが拒否し、既存L6はL5契約/legacy projectionへ追跡可能にする |
| AC-VMCUT-006 | HR-FR-VMCUT-04 | dry-run snapshotから旧authorityへ復元でき、DB row、docs、template、viewのdigestがrollback前後で一致する |
| AC-VMCUT-007 | HR-FR-VMCUT-04 | compatibility削除前に旧token利用件数0、consumer smoke green、rollback rehearsal証跡を要求する |
| AC-VMCUT-008 | HR-FR-VMCUT-05 | AGENTS/CLAUDE/Core Reads/schema/detector/templateのepoch driftを1箇所ずつ注入し全てfail-closeする |
| AC-VMCUT-009 | HR-FR-VMCUT-05 | archive/runtime-state誤参照、独立L6再生成、view側値生成をnegative fixtureで検出する |
| AC-VMCUT-010 | 全要件 | L8 unit、L9 integration、L10 system、L11 acceptance、L12 operation evidenceが同じrequirement IDへ閉じる |

## 検証段階

1. L3 freeze時は文書間authority、exact remap、受入IDの完全性をlintする。
2. L4-L6でschema/DB/adapter migration設計とL8-L10 oracleをpair-freezeする。
3. L7実装後、旧/new入力のdual-readとcanonical-only writeをintegration testする。
4. cutover dry-runで全consumer surface、snapshot、rollbackを検証する。
5. PO承認後のcutover epochだけをterminal候補とし、承認前はapplyしない。

## 残余リスク

既存L0-L14 artifactの量が大きく、単純件数greenではsemantic remapの正しさを証明できない。各artifactのtyped ID、
pair relation、runtime evidenceを照合し、未分類を0件にするまでcompatibility削除を許可しない。

