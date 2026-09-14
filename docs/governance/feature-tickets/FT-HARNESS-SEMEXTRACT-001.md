---
feature_ticket_id: FT-HARNESS-SEMEXTRACT-001
title: "旧実装semantic atomのPython core抽出"
product_target: HELIX-HARNESS
state: proposed_upstream_waiting
priority_order: 2
created: 2026-09-15
authority_effect: work_projection_only
github_projection:
  issue: 1801
  url: https://github.com/RetryYN/HELIX-HARNESS/issues/1801
  projected_source_commit: 741eddb855d9b24ac6645c4485e7d24b8123c95f
  read_after_state: OPEN
parent_requirements:
  - HARNESS-L2-008
  - HARNESS-L2-009
policy_source: docs/governance/candidates/semantic-density-python-extraction-policy.md
depends_on: []
delivery_sequence_predecessor:
  - FT-OS-REQREG-001
blocks:
  - FT-HARNESS-REQENG-001
  - FT-HARNESS-DESIGNTPL-001
---

# FT-HARNESS-SEMEXTRACT-001: 旧実装semantic atomのPython core抽出

## 目的

旧Requirement Engine、requirement authority／discovery／trace／impact、Design Template、semantic utilityを
behavior atomへ分解し、意味密度と外部作用からPython coreへ取り込む対象を決める。旧moduleのbulk portや旧runtime復活は行わない。

## 成果候補

- 対象assetとbehavior atomのexact inventory。
- semantic-dominant／transactional-dominant／mixed／historical-onlyの判定と根拠。
- 新世代親要求、product、requirement kind、input／output、invariant、failure、oracleへのcrosswalk。
- Pythonへ再導出するatom、外部作用境界で再構成するeffect、棄却する旧結合のexact set。境界技術はL3で選定する。
- fixture provenance、data／license／security／resource境界。

## 停止条件

- HARNESS-L2-008／009または意味密度方針が未承認。
- file単位の一括copy、旧CI parity、旧authority復活を出口にしている。
- semantic atomからDB、Git、GitHub、credential、repository依存を分離できない。
- 新要求のoracle、failure、unknown扱いが未定義。

現在はticket発行だけを行う。archive codeのcopy、Python実装、Node接続、旧test／CI実行は行わない。

FT-OS-REQREG-001を先行させるのはHELIX内部のdelivery sequenceである。semantic atom抽出とHARNESS製品契約は
OS登録入口へ機能依存せず、別consumerで利用できる形を維持する。
