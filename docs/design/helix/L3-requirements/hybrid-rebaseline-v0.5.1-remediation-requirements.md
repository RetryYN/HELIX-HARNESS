---
title: "REBASELINE v0.5.1 是正要件"
layer: L3
kind: add-design
status: proposed
created: 2026-07-18
updated: 2026-07-18
owner: TL
pair_artifact: docs/test-design/helix/hybrid-rebaseline-v0.5.1-remediation-acceptance.md
---

# REBASELINE v0.5.1 是正要件

- status: proposed
- 入力: v0.5.0 再監査 `wf_452d88b3-fd2`
- 分母正本: `docs/governance/generated/v051-remediation-finding-ledger.yaml`
- 注意: 旧59件 delta は ADR-009 前提のため、そのまま正本化せず ADR-010 authority epoch で再裁定する。

## 必須要件

1. 36件をglobal unique IDで保持し、severity変更・棄却・未検証を消さない。
2. 各findingを requirement → AC → test/oracle → evidence → decision → target fileへ双方向traceする。
3. critical 2/2、major 23/23はtarget diffとmachine oracle PASSを伴う`resolved`のみ終端とする。
4. minor 11件は独立検証後、`resolved`、`deferred_with_po_risk_acceptance`、`rejected_with_counterevidence`のいずれかへdispositionする。検証前に「確定」「解消」と表示しない。
5. ADR-009↔ADR-010、Core Reads、AGENTS/CLAUDE、package、decision ledgerの権威関係を一つのauthority epochで一致させる。旧語彙はallowlist外0件とする。
6. archive filename、sha256、bytes、member countを単一SSoTから投影し、README/MANIFEST/report/CHECKSUMSの版・REQ/AC/edge数を実体から生成する。
7. requirementsのverification集合とtraceability edge集合を一致させ、orphan AC=0、dangling edge=0、ADR-010 edgeあり、canonical L1〜L12とS0〜S4のroute bindingありとする。package内L0〜L14はexact compatibility mappingを別途検証する。
8. 全example/templateをpositive/negative fixtureで検証し、意図的invalidは実際にvalidationが失敗しなければならない。
9. resolved fields/status整合をSQLite CHECK/triggerで拒否実証する。アプリ側検査だけで合格にしない。
10. source freshness条件(a)(b)(c)を全fixture化し、UT pinを単一観測SHAへ収束する。
11. 全参照列挙logが無い場合、full adoption validatorはFAILする。`enumeration_log_present=false`でPASSしてはならない。
12. fresh packageに対する独立再監査で新規critical/major=0を実証する。

## 完了式

`C=2/2 ∧ M=23/23 ∧ m_disposition=11/11 ∧ orphan=0 ∧ dangling=0 ∧ validators=green ∧ freshness=pass ∧ new(C+M)=0`

この式を満たすまで v0.5.1 を「承認可能」「要件定義完遂」と表示してはならない。
