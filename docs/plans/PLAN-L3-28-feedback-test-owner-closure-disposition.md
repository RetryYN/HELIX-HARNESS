---
plan_id: PLAN-L3-28-feedback-test-owner-closure-disposition
title: "PLAN-L3-28 (add-design): closure test owner 21件のsuccessor backprop disposition"
kind: add-design
layer: L3
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-23 missing-test-plan-idをcase単位でexactly-one dispositionする"
created: 2026-07-23
updated: 2026-07-23
owner: Codex / TL
github_issue_id: 74
parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — test source digest、case分母、semantic predecessorを監査"
  - role: qa
    slot_label: "QA — 21 caseのexactly-one dispositionとdrift拒否を検証"
review_evidence:
  - reviewer: "Claude Code / claude-fable-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-23T05:42:15Z"
    tests_green_at: "2026-07-23T05:41:16Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-fable-5
    scope: "PR #101 final HEAD 091997835c036085c4e3010688be004353b64c5d の6 file・21 case exactly-one successor_backprop disposition sliceのみをconfirmする。GitHub Actions run 29981824436、clean隔離DB rebuild 2回一致（tables=90、rows=48174、stale=0、orphan=0）を同一HEADへ束縛した。これはL5/L8 oracle、L6/L7 ownership、DB空plan_id解消、requirements G1/G3 freezeまたはL4着手承認ではない。final receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/101#issuecomment-5054892517"
    green_commands:
      - kind: unit_test
        command: "npm test"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-07-23T05:41:16Z"
        evidence_path: tests/feedback-test-owner-closure-disposition.test.ts
        output_digest: "sha256:d0dc23f638645268e9ba6a5640ce11288baa915a13e2c1d7a348e0a46cc63955"
generates:
  - artifact_path: docs/plans/PLAN-L3-28-feedback-test-owner-closure-disposition.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/feedback-test-owner-disposition-closure.json
    artifact_type: config
  - artifact_path: tests/feedback-test-owner-closure-disposition.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-27-github-trace-authority-hygiene.md
  requires:
    - docs/plans/PLAN-L7-434-closure-evidence-materialization.md
    - docs/plans/PLAN-L7-435-closure-authority-backfill.md
  references:
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
  blocks: []
---

# PLAN-L3-28: closure test owner 21件のsuccessor backprop disposition

## §0 目的

Issue #74の`missing-test-plan-id`のうちclosure領域6 file・21 caseを、過去のgreenや既存oracleへ
偽装接着せず、G3後のadditive L5/L8 backpropとL6/L7 ownership bindingを実施する本PLANへ
exactly-one dispositionする。

## §1 判断

- 6 fileは`PLAN-L7-434`または`PLAN-L7-435`の実装commitと意味責務へ追跡できる。
- ただし既存`verification_bindings`とL8 oracle tableは各test pathを宣言していない。
- completed/confirmed PLANへpathだけを追記すると`generated_test_unbound`または
  `oracle_test_citation_mismatch`になるため、現時点でimplementedへ昇格しない。
- source digestとcase分母をmanifestへ固定し、G3後に新しいadditive pairで正規backpropする。

## §工程表

### Step 1: disposition固定 [直列]

- 6 test fileのSHA-256、21 case、semantic predecessor、required closureをmanifestへ記録する。
- 各fileを1行だけ登録し、file内caseは同じdispositionを継承する。

### Step 2: drift検証 [直列]

- manifest schema、path重複、source digest、case数、総数21をtargeted testで検証する。
- test内容が変わった場合はdigest mismatchでfail-closeし、case単位の再監査を要求する。

### Step 3: G3後backprop obligationの引継ぎ [直列]

- L5/L8で固有oracleとtest citationを追加設計する後続obligationをmanifestへ固定し、
  freeze packet successorで集約する。
- L6/L7のadditive PLANで`generates`、`verification_bindings`、test title citationを同時に閉じる
  後続obligationをmanifestの`required_closure`として保持する。
- DB rebuildで対象21件の空`plan_id`が0になるまでは、test ownership closure完了を主張しない。

## §closure boundary

本PLANが閉じるのは、6 file・21 caseのcurrent sourceを再照合し、各fileをexactly-one
`successor_backprop` dispositionへ束縛するL3判断までである。L5/L8 oracle設計、L6/L7 ownership binding、
DB空`plan_id`の解消は本PLANの完了条件へ混載せず、manifestとfreeze packet successorが追跡する
downstream obligationとする。
したがって本PLANの`confirmed`はtest ownership実装済みまたはG1/G3 freeze済みを意味しない。

## §受入条件

- AC-1: 6 file・21 caseがexactly-one `successor_backprop` dispositionを持つ。
- AC-2: 全fileのdigestとcase数がcurrent sourceへ一致する。
- AC-3: semantic predecessorを実装完了ownerへ読み替えず、必要なL5/L8・L6/L7 backpropを明記する。
- AC-4: G3承認前に既存L7 PLAN、L8 oracle、対象6 fileのbehavior test codeを変更しない。本PLAN固有の
  disposition drift testはPLAN closure semanticsの検証に限って更新できる。
- AC-5: PLAN closureとdownstream ownership closureを分離し、後者を実装済みと表示しない。
