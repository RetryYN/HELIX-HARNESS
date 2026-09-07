---
plan_id: PLAN-L3-1642-bugbot-bounded-repair
title: "逸脱検出・限定修復の要求候補取り込み"
kind: add-design
layer: L3
drive: agent
status: draft
completion_claim_allowed: false
l3_human_approval:
  schema_version: helix-l3-human-approval.v1
  approval_kind: human_po
  decision: approve
  approver: RetryYN
  approved_at: "2026-09-07T20:06:38Z"
  plan_id: PLAN-L3-1642-bugbot-bounded-repair
  approval_record_id: L3-PO-1642-001
  approval_source: human_gate_record
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1642#issuecomment-5575191622"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:HELIX-bugbotの要求を取り込みCIとCursorに並行して先行する"
created: 2026-09-08
updated: 2026-09-08
owner: Codex / TL
github_issue_id: 1642
behavior_contract_id: BUGBOT-BOUNDED-REPAIR-001
responsibility_owner: requirements-authority-materialization
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "上流候補の整理自体を本PLANで所有する。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "原稿、既存GH-FR-007/011/014、Rule導出と変更伝播を照合する"
contract_postconditions: "BBRのL1/L3/L10候補と原稿の項目対応を保持する"
contract_invariants: "生成と実行権の分離、意味正本の再利用、修復ごとの契約・独立検証・実consumer検証が成立した範囲のみ有効化し、要求承認のみで包括的書込みを許可しない"
contract_failures: "未提供別紙の確認済み扱い、scope拡張、承認捏造、義務欠落を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "文書候補のみ。実装の独立oracleとmutationは後続PLANで実証する。"
complexity_effect: net_negative
complexity_justification: "既存Authoring/Recoveryを再利用し、定型手修正と重複基盤を減らす。"
removal_trigger: "canonical昇格・IR admission後に候補を正規移管"
parent_design: docs/governance/candidates/bugbot-bounded-repair-requests.md
pair_artifact: docs/governance/candidates/bugbot-bounded-repair-acceptance.md
dependencies:
  parent: docs/governance/candidates/bugbot-bounded-repair-requests.md
  requires: []
  references:
    - issue:1639
    - issue:93
    - issue:192
    - issue:397
    - issue:1293
    - issue:1500
    - issue:1595
    - issue:1608
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-1642-bugbot-bounded-repair.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/bugbot-bounded-repair-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/bugbot-bounded-repair-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/bugbot-bounded-repair-acceptance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: tl, slot_label: "TL — 既存責務と追加差分を分離" }
  - { role: qa, slot_label: "QA — 原稿対応と禁止反例を検証" }
review_evidence: []
---

# 逸脱検出・限定修復

本PLANは要求候補と明示承認の束縛を所有する。L1/L3/L10の要求承認は取得済みであり、
canonical promotion・Requirement IR admission・実装・限定実証へ進める。同一要求の再承認待ちには戻さない。
A/Bは別PLAN・別受入・別完了で追跡し、正本化・該当IR admission・独立検証を省略しない。
要求承認だけで新しい自動書込みを包括的に許可しない。対象修復ごとの契約・独立検証・実consumer検証が
すべて成立した修復ID/版・対象・write-setの範囲だけを有効化する。

## 承認対象と残る検収

`L3-PO-1642-001`は候補HEAD `98cdc24c12e47057b1a7d6d3b156a96bf5ef4d8d`の
L1/L3/L10各文書のraw digestと、人間が今回明示した有効化条件へ束縛されている。
本差分は条件をBBR-R03／BBR-AC03へ転記する。承認前のdigestを事後的に差し替えない。
`approved_at`はGitHub記録の作成時刻であり、人間メッセージの厳密な送信時刻ではない。
修復ごとの通常検収を一律の人間再承認へ変換せず、未定義の意味・権限拡張だけ正規改訂へ返す。
canonical昇格・IR admission・実装・実consumer受入は未完了であり、statusを完了へ変更しない。

原稿bytesは[commit固定の保全台帳](https://github.com/RetryYN/HELIX-HARNESS/blob/a2325edb8425f4e84421ef2fd1f07c6c6d668dd7/docs/governance/candidates/bugbot-intake-source.md)のBase64復号で再現する。正規化なしのSHA-256:
`c97b9dd32b8327696d77ae3f86cebeae0e3a2545766d3e4bb2c0f484e6a4828a`。
原文の項目対応・保全read-after・候補移管の検査後にroot原稿を退役する。
原稿共有先#1639とBの追跡先#1642を区別する。Issue追記後の本文全体へ原稿hashを適用しない。
別紙02/03/05は未提供であり、別紙03の18シナリオ照合は残義務である。
