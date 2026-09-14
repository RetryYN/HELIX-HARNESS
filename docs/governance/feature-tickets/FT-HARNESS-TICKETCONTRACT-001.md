---
feature_ticket_id: FT-HARNESS-TICKETCONTRACT-001
title: "HARNESS typed development ticket contract"
product_target: HELIX-HARNESS
state: proposed_upstream_waiting
priority_order: 7
created: 2026-09-15
authority_effect: work_projection_only
github_projection:
  issue: 1804
  url: https://github.com/RetryYN/HELIX-HARNESS/issues/1804
  projected_source_commit: 741eddb855d9b24ac6645c4485e7d24b8123c95f
  read_after_state: OPEN
parent_requirements:
  - HARNESS-L2-002
  - HARNESS-L2-003
  - HARNESS-L2-008
  - HARNESS-L2-009
depends_on:
  - FT-HARNESS-REQENG-001
  - FT-HARNESS-DESIGNTPL-001
blocks:
  - FT-OS-TICKETISSUER-001
---

# FT-HARNESS-TICKETCONTRACT-001: HARNESS typed development ticket contract

## 目的

要求から`poc`、`ui_prototype`、`feature`を別作業契約として導出し、各結果を要求・Design Template・設計へ
backflowするHARNESS contractを具体化する。

## 出口候補

- 三ticket kindの必須field、lifecycle、状態遷移、pair、acceptance、negative oracle。
- PoC仮説、prototype反応、feature成果を要求合意・製品完成から分離する規則。
- architecture責務から技術候補を出し、PoC比較で採否・失効・rollbackを決める契約。
- ticket結果から要求エンジンとDesign Templateへ戻るtyped backflow。
- 推進が生成したworkflowに必要なlayer／pair、成果物、oracle、human gate、停止・差戻し・backflow、許可操作が揃うことを判定するHARNESS contract。
- HARNESSがnormative workflow vocabulary、意味、trigger、適用条件、route内順序、joinを所有し、推進がoperational tag、mapping、composition、個別workflow instanceを生成する境界。

現在はticket発行のみ。schema、runtime、Issue automation、PoC、prototype、実装、CIを起動しない。
