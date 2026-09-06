---
title: "Action-binding承認準備判定"
layer: L6
artifact_type: design_doc
status: confirmed
created: 2026-09-06
updated: 2026-09-06
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-1431-action-binding-approval-readiness.md
pair_artifact: docs/test-design/helix/L8-action-binding-approval-readiness-unit-test-design.md
behavior_contract_id: HR-NFR-P8-01
responsibility_owner: action-binding-approval-readiness
---

# Action-binding承認準備判定

## 責務

`HR-NFR-P8-01` の高影響操作境界を、自由文の存在ではなくtyped recordの実値として検査する。
本機能は承認を発明・実行せず、承認材料を `concrete` / `pending` / `invalid` に分類する。

## 契約

- `approved_actor`、`approved_tool`、`approved_target`、`approved_params` は共通の
  `isConcreteApprovalBindingValue` で検査する。
- 空値、`TBD`、`TODO`、`N/A`、`-`、`pending`、`unspecified`、山括弧placeholder、
  future/unapproved obligationは `concrete` にしない。
- `any`、`all`、wildcard、`admin`、`root`、`global`、`full access/control`、
  repository/environment全体を示す値はleast-privilege bindingとして受理しない。
- 「証跡」「説明」「サンプル」という一般語だけで高影響operationのapproval requirementを
  消してはならない。明示的なnon-execution文脈だけを説明専用として除外する。
- 同じ行の隣接文に分かれたtarget、execution timing、approval obligationを一つの文脈として判定する。
  無関係なfrontmatter行を跨いで合成しない。
- version-upまたはcutoverがcurrent snapshotを要求する場合、期待snapshot入力が無ければ
  `pending` とし、比較をsilent skipしない。
- packetは常にplan-onlyであり、本判定のgreenをaction実行許可へ読み替えない。

## 失敗条件

placeholder、過大scope、wrong snapshot、snapshot検証入力欠落、明示された高影響approval requirementの
見落としを個別reasonでfail-closeする。pending recordは未承認状態として保持し、実行可能へ昇格させない。

## Oracle

- U-ABR-001: placeholderをpendingとして拒否する。
- U-ABR-002: 過大なactor/tool/target/paramsをinvalidとして拒否する。
- U-ABR-003: 一般語「証跡」でapproval requirementを相殺しない。
- U-ABR-004: 同一行の隣接文から高影響approval requirementを検出する。
- U-ABR-005: cutover snapshot入力欠落をpendingとして可視化する。
- U-ABR-006: 明示的なnon-execution説明を実行要求へ誤分類しない。
