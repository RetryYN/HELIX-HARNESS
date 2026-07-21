---
title: "L1〜L12 Vモデル＋Scrum 再ベースライン受入テスト設計"
layer: L3
executed_at_layer: L12
artifact_type: test_design
status: confirmed
created: 2026-07-18
updated: 2026-07-18
owner: QA
pair_artifact: docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md
---

# L1〜L12 Vモデル＋Scrum 再ベースライン受入テスト設計

- pair: `docs/governance/helix-harness-requirements_v1.3.md`
- status: confirmed
- execution layer: L10/L11/L12

| AC | 検証 |
|---|---|
| L12R-AC-001 | Core Reads先頭のrequirements authorityがv1.3である |
| L12R-AC-002 | canonical tableにL1〜L12がexactly once、L0/L13/L14が存在しない |
| L12R-AC-003 | V pairがL1⇔L12、L2⇔L11、L3⇔L10、L4⇔L9、L5⇔L8、L6⇔L7の6組 |
| L12R-AC-004 | Full V=layer/pair先行、Production Scrum=feedback/価値slice先行、PoC=非productionのexactly-one分類 |
| L12R-AC-005 | unknown/複合/route判定不能が安全既定値としてFull Vへfail-closeし、Scrumの品質tierを下げない |
| L12R-AC-006 | UI案件はprototype receipt、非UI案件は理由付きN/A receiptなしにL3 freeze不可 |
| L12R-AC-007 | Scrum sliceがL1〜L12のpair、TDD、Reverse、AC、migration、rollback、security、release、operation evidenceを持つ |
| L12R-AC-008 | legacy L0〜L14 artifactがexact mappingされcanonical outputを汚染しない |
| L12R-AC-009 | GitHub要件、charter、Core Readsが同じroute/layer定義を参照する |
| L12R-AC-010 | 旧v1.2/conceptの先頭にcompatibility降格が明示され、current authorityを主張しない |
| L12R-AC-011 | VモデルとProduction Scrumが同格のdelivery engineとして選択でき、両方で二主体review、trace、DB追従、release evidenceが必須になる |
| L12R-AC-012 | Scrum ReverseがScrumの縮退・格下げではなく、実測知見をcanonical V設計資産へ同期する接続契約として検証される |

完了判定は文字列置換件数ではなく、authoring authority、schema enum、PLAN lint、DB projection、template、tag、current-locationが同一cutover epochを指すことを後続実装検証で証明する。現時点では要件凍結を検証し、runtime cutover完了を主張しない。
