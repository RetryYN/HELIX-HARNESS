---
plan_id: PLAN-REVERSE-225-approval-snapshot-binding
title: "PLAN-REVERSE-225 (reverse): 承認スナップショット連結"
kind: reverse
layer: cross
workflow_phase: R4
drive: agent
status: confirmed
confirmed_reverse_type: code
forward_routing: L5
promotion_strategy: reuse-with-hardening
created: 2026-07-01
updated: 2026-07-01
owner: Codex
agent_slots:
  - role: tl
    slot_label: "TL - reverse stale approval material"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-225-approval-snapshot-binding.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-225-approval-snapshot-binding.md
---

# PLAN-REVERSE-225: 承認スナップショット連結

## R0 証跡収集

`version-up activation-packet` と `rename plan` はどちらも plan-only かつ
approval-gated だったが、承認資料を現在の packet に結び付ける単一の snapshot binding ID は
公開されていなかった。packet には reapproval triggers が列挙されていたが、operator は scope、
evidence、blast radius を手作業で照合する必要があった。

補助ガイドとしての `README` には、実装済みの HELIX project workflow が `helix setup project` と
`identifierTransition`、`consumerReadiness`、`postSetupWorkflow` で構成されているにもかかわらず、
新規 consumer を legacy setup shortcuts へ誘導する古い記述が残っていた。ただし `README` は
gate、証跡、完了条件の surface には含めない。

## R1 観測された契約

- Version-up activation は stale な HEAD/scope/source/evidence のまま進めてはならない。
- L14 rename/cutover は stale な blast radius や stale な backup / provenance evidence のまま
  進めてはならない。
- PLAN-M-02 approval の前の setup は current な `helix` / `.helix` を使う必要があり、
  `helix setup project` と `.helix` は future targets のまま残す。

## R2 現状設計

各 surface は non-destructive だったが、reviewed material を結び付ける digest-level binding が
不足していた。補助ガイドの `README` は gate surface ではないが、より古い setup shortcuts を指すことで、
意図した setup route を弱める読者向け debt になっていた。

## R3 意図仮説

Approval packets は stable かつ non-secret な snapshot IDs を公開し、後続の approval records が
review 済みの exact packet に結び付けられるようにすべきである。Setup documentation は code と tests が
すでに期待している同じ packetized workflow へ user を誘導するが、`README` は gate 判定に使わない。

## R4 ギャップとルーティング

L6/L7 add-impl へ route する。

- L6/process design: activation/cutover snapshot binding を approval ではなく stale approval prevention として定義する。
- L7 code: activation と rename packets に snapshot IDs を追加する。
- L7 tests: digest shape と blast-radius drift behavior を assert する。
- `README`: gate / evidence / completion surface から除外し、補助ガイドとして legacy setup shortcut の誤誘導だけを是正する。
