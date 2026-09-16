# 対象別L2 source採否順序

prepared_at: 2026-09-14
status: organization_started_decision_pending

## 目的

本書は、Concept v4.1と対象別L1の承認後に、候補要求源を対象別L2へ採否する順序を定める。
Issue番号、実装済み状態、既存CIの通りやすさ、候補ファイルの作成日を優先順位に使わない。
各系列は個別decisionを持ち、同じ段階にあることを一括承認の根拠にしない。

要求整理の開始時点と全母集団は
[無損失ベースライン](requirements-organization-entry-baseline-2026-09-17.md)へ固定した。
現在は採否適用ではなく、S1の判断材料を順に整える段階である。Concept／L1未承認の停止条件は維持する。
S1へ入る前に、要求意味の採否を伴わない管理分類登録の第1層として、各identity／atomの対象製品候補を
HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS、製品間接続、分割要、未解決へ分類する。
このproduct routing候補をsuccessor確定または要求承認として扱わない。

## 採否単位の共通入力

各decisionは次を揃える。

- source系列とexact revision、authority状態。
- 親Concept、対象別L1、対象別L2 ID。
- 保持する利用価値・制約・negative case。
- 変更・棄却する旧owner、旧identity、旧実現手段と理由。
- prototypeまたは非UI適用性、L11利用結果、未解決事項。
- `adopt`、`amend`、`split`、`defer`、`reject`の判断とactor、scope、revision。

`L2接続済み`は採択済みを意味しない。`再採否待ち`も候補の存在確認が不足している意味ではなく、
新しい親revisionに対する人間判断が残る状態である。

## S1 authority・要求変更境界

最初に、後続の採否記録とAI読取りが依存する意味管理を確定する。

| Decision unit | source系列 | 対象 | 現在の接続 | 採否で固定する意味 |
|---|---|---|---|---|
| L2D-S1-01 | `authority-vocabulary` | HELIX-OS | L2接続済み | request、approval、decision、通知、技術判断の区別 |
| L2D-S1-02 | `requirement-formation-scoped-admission` | HARNESS／HELIX-OS | L2接続済み | 根拠付き要求形成、scopeを限定した再確定 |
| L2D-S1-03 | `design-grounding-human-convergence` | HARNESS／HELIX-OS | L2接続済み | 客観根拠、人間反応、未解決finding、収束の区別 |
| L2D-S1-04 | `requirements-authority-materialization` | HELIX-OS | 再採否待ち | repo-owned意味authority、一方向projection、状態分離。旧JSON-only／Issue admissionは棄却 |
| L2D-S1-05 | `instruction-path-change-resilience` | HELIX-OS | 再採否待ち | source provenance、版固定、stale、provider差。旧adapterは棄却 |
| L2D-S1-06 | `world-governance` | HELIX-OS | 再採否待ち | 全source棚卸し、状態分離、影響限定。旧owner／DB／CIは棄却 |
| L2D-S1-07 | `ai-readable-authority-requirements` | HARNESS／HELIX-OS | L2接続済み | 承認上流からのAI文書生成、責務分離、stale拒否 |

S1が閉じるまで、候補の採否結果を現行AGENTS／CLAUDE、Requirement IR、DB、GitHubへ適用しない。

## S2 工程・実行・証拠の中核

S1のauthorityと状態語彙を参照して、HARNESSの工程条件とOS実行統制を分ける。

| Decision unit | source系列 | 対象 | 現在の接続 | 採否で固定する意味 |
|---|---|---|---|---|
| L2D-S2-01 | `next-generation-ci-requirements` | HARNESS／HELIX-OS | L2接続済み | verification obligationとCI profile運転の分離。実装は行わない |
| L2D-S2-02 | `execution-ticket` | HELIX-OS | L2接続済み | Worker assignment、scope、budget、evidence、replay |
| L2D-S2-03 | `conversation-lifetime-reconstruction` | HELIX-OS | L2接続済み | 外部authorityからの再構成、累積制約、停止 |
| L2D-S2-04 | `harness-memory-coordination-boundary` | HELIX-OS | L2接続済み | memoryを有期限通知とpointerへ限定 |
| L2D-S2-05 | `producer-provenance-separation` | HELIX-OS | L2接続済み | producer、committer、publisher、reviewerの分離 |
| L2D-S2-06 | `three-lane-capacity-profile` | HARNESS／HELIX-OS | 再採否待ち | 独立検証とcapacity／WIP／backpressure。provider固定値は棄却 |
| L2D-S2-07 | `scrum-operation-typed-projection` | HARNESS／HELIX-OS | 再採否待ち | 工程条件と管理projection。旧7 operation／DB／CIは棄却 |
| L2D-S2-08 | `management-scrum-product-forward` | HARNESS／HELIX-OS | 再採否待ち | 管理観測を製品Forwardへ戻す条件。Issue-firstは棄却 |

S2の採否はCI、Worker、runtimeを起動する許可ではない。L3／L10から実現方式を再導出する。

## S3 改善・修復・運用品質

中核契約を前提に、追加機構の利用価値と操作authorityを個別に判断する。

| Decision unit | source系列 | 対象 | 現在の接続 | 採否で固定する意味 |
|---|---|---|---|---|
| L2D-S3-01 | `agentic-audit-future-state-delta` | HELIX-OS | L2接続済み | 監査結果、future差分、model比較を改善候補へ戻す |
| L2D-S3-02 | `responsibility-centric-learning` | HELIX-OS | L2接続済み | 責務単位の学習、段階昇格、失効、authority非奪取 |
| L2D-S3-03 | `mechanism-adequacy` | HELIX-OS | 再採否待ち | unknown、反証、効果観測。旧UIL／Learning／CIは棄却 |
| L2D-S3-04 | `rule-derivation` | HARNESS／HELIX-OS | 再採否待ち | 工程境界と規則生成・適用・診断を分離 |
| L2D-S3-05 | `bugbot-bounded-repair` | HARNESS／HELIX-OS | 再採否待ち | 修復後検証、限定authority、停止。旧包括write権限は棄却 |
| L2D-S3-06 | `refactoring-trigger-admission` | HARNESS／HELIX-OS | 再採否待ち | 意味保存条件と改善候補管理。新L1価値の判断を要する |
| L2D-S3-07 | `infrastructure-operations-quality` | HARNESS／HELIX-OS／個別製品 | 再採否待ち | 工程上の品質、OS運用、製品固有SLOを分離 |
| L2D-S3-08 | `security-engagement-authority` | HARNESS／HELIX-OS／個別製品 | 再採否待ち | 製品security要求、検証工程、特権操作authorityを分離 |

security、credential、production、外部API操作は、この採否だけでは許可されない。

## S4 提供構成・契約・将来候補

対象別要求と中核統制が決まった後に、提供物と長期候補を判断する。

| Decision unit | source系列 | 対象 | 現在の接続 | 採否で固定する意味 |
|---|---|---|---|---|
| L2D-S4-01 | `functional-release-slice` | HARNESS／HELIX-OS | 再採否待ち | 提供構成・検証閉包と配布・復旧運転。旧構成identityは棄却 |
| L2D-S4-02 | `concept-vision-package-intake` | HELIX全体／対象別製品 | 再採否待ち | Concept、HARNESS提供、OS運転、個別製品Visionへ分離 |
| L2D-S4-03 | `helix-commercial-license` | HARNESS／HELIX-OS／個別製品 | 再採否待ち | 製品別許諾と配布統制。条文・権利・価格は法務判断待ち |
| L2D-S4-04 | `development-investment-stage-directives` | HARNESS／HELIX-OS／個別製品 | 再採否待ち | INV-001..072の意味候補。旧P0..P4と実装順は棄却 |
| L2D-S4-05 | `ci-event-concurrency-generation` | HELIX-OS | 再採否待ち | generation、非干渉、replayの意味。特定GitHub event／旧receiptは棄却 |
| L2D-S4-06 | `legacy-asset-retirement-requirements` | HARNESS／HELIX-OS | L2接続済み | 意味移管・検証条件と、consumer切断・非実行archive・復元防止・物理削除承認を分離 |

S4の完了前にpackage identity、価格、契約、release、配布、旧資産archive切替を実施しない。

## 完了条件

29 decision unitすべてについて、判断対象revision、target、親L1、L2 ID、L11条件、採否、未解決事項が記録され、
対象別L2本文と一致したときにsource採否を閉じる。候補31系列の残る1系列`helix-concept-v4`は
上位のConcept／L1人間判断packetで扱うため、本書の29 unitには重複算入しない。
