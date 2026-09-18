---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: fa4ac4b7a3e9e4f70e0dc4d83926036bc38b60b1920256405e48a51e0151834c
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OPS-02
group: サービス⑦運用保守
product: HARNESS／OS
atoms_primary: 11
atoms_secondary: 1
issue_projection: #1857
---

# RUL-OPS-02（サービス⑦運用保守／HARNESS／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

体制の立上げと変化を定める。参加者の受入れと権限付与、退場時の失効と引継ぎ、当番と監視の導入条件、成熟度に応じた統制の段階導入、採用の順序、保険と規制。

## 主として対応づいた規則（11件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RB04-237` | 受入担当者は新メンバーへGitHub・Slack・password manager・AI toolのaccessを用意し、規則読了・小PR・TL/QAとの1on1を設定する。 | process_gate | prose | n/a | 旧人的onboarding | `RUL-OPS-01` | docs/governance/ai-dev-team-operations_v1.1.md:1147-1161 | B04／gpt-6-astra |
| `RB04-238` | 退場担当者は組織・chat・password共有・AI toolのaccessを解除し、管理credentialをrotationしてCODEOWNERSと引継ぎ文書を更新する。 | safety_security | prose | n/a | 旧人的offboarding | `RUL-OPS-01` | docs/governance/ai-dev-team-operations_v1.1.md:1163-1177 | B04／gpt-6-astra |
| `RB04-266` | 監視toolはaccess増加時にAPM、本番URL保有時に稼働監視、24時間体制が必要な時にon-callを追加する。 | tooling_runtime | prose | n/a | Datadog/Mackerel/Uptime Robot/PagerDuty | — | docs/governance/ai-dev-team-concept_v1.1.md:372-378 | B04／gpt-6-astra |
| `RB04-277` | 立上げ担当者は採用や本格開発の前に基盤と運用flowを整え、基盤完成後にsolo運用から開始する。 | process_gate | prose | n/a | 旧Phase 0/1/3 | — | docs/governance/ai-dev-team-concept_v1.1.md:597-603; docs/governance/ai-dev-team-concept_v1.1.md:665-667; docs/governance/ai-dev-team-concept_v1.1.md:695-695 | B04／gpt-6-astra |
| `RB04-283` | 運用が安定したらcoverage計測/gate・AI review・CodeQLを段階追加し、本番運用開始時にerror追跡を導入する。 | process_gate | prose／ci | n/a | 旧Phase 2、Codecov/CodeQL/Sentry | — | docs/governance/ai-dev-team-concept_v1.1.md:679-691 | B04／gpt-6-astra |
| `RB04-284` | 採用担当者は採用前に責任・評価指標・報告先を確定し、規則と運用手順をonboarding資料として準備し、基盤を確認可能な状態で迎える。 | lane_delegation | prose | n/a | 旧人間採用workflow | — | docs/governance/ai-dev-team-concept_v1.1.md:693-703 | B04／gpt-6-astra |
| `RB04-285` | 採用は技術mentor、TL、QA/AI実装・保守、UI/UXの順を指針とし、判断量・並列AI数・顧客向け本格化に応じて増員する。 | lane_delegation | prose | n/a | 旧人間採用順序 | — | docs/governance/ai-dev-team-concept_v1.1.md:701-701; docs/governance/ai-dev-team-concept_v1.1.md:719-727 | B04／gpt-6-astra |
| `RB04-287` | 立上げ担当者はPhase 0の完璧さを求めず、AGENTS.md整備には最初の30日で必ず着手する。 | process_gate | prose | n/a | 30日、旧Phase 0 | — | docs/governance/ai-dev-team-concept_v1.1.md:729-729 | B04／gpt-6-astra |
| `RB04-288` | 文書整備者は標準fileに加え、Issue template・CODEOWNERS・CONTRIBUTING・ADR・architecture・runbook・incident手順・changelogを表の優先度に従って整備する。 | process_gate | prose | n/a | 旧整備file一覧と星優先度 | `RUL-OSM-09`、`RUL-OPS-01` | docs/governance/ai-dev-team-concept_v1.1.md:762-780 | B04／gpt-6-astra |
| `RE01-160` | 旧Phase 0Bの受入者は認証・管理権限・scopeとteam matrixの確認を含む追加条件、および全14項目とpre-pushの成功を確認してから完了とする。 | process_gate | gate | fail_close | Phase 0B team運用受入 | `RUL-FRM-02` | docs/governance/helix-harness-requirements_v1.2.md:2475-2509 | E01／claude-opus |
| `RE01-176` | solo運用者はチーム儀式・velocity・複数人roleを必須化せず、backlog slice、DoR/DoD、review、retro、releaseで運用する。 | behavior_discipline | prose | n/a | solo Scrum運用 | `RUL-FRM-03` | docs/governance/helix-harness-requirements_v1.3.md:90-90 | E01／claude-opus |

## 副として対応づいた規則（1件）

`RB04-259`
