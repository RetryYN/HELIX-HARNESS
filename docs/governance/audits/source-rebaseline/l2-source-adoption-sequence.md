# 対象別L2 source採否順序

prepared_at: 2026-09-14
status: organization_started_decision_pending

## 目的

本書は、Concept v4.1と対象別L1の承認後に、候補要求源を対象別L2へ採否する順序を定める。
Issue番号、実装済み状態、既存CIの通りやすさ、候補ファイルの作成日を優先順位に使わない。
各系列は個別decisionを持ち、同じ段階にあることを一括承認の根拠にしない。

要求整理の開始時点と全母集団は
[無損失ベースライン](requirements-organization-entry-baseline-2026-09-17.md)へ固定した。
現在は採否適用ではなく、S1の判断材料を順に整える段階である。Concept v4.1と4対象L1は
[2026-09-17 decision record](../../decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md)で承認済みである。
対象別L2／L11が未採否である停止条件は維持する。
S1へ入る前の管理分類登録第1層では、旧Requirement IR 153件すべてについて、HELIX-HARNESS、HELIX-OS、
HELIX-Web、HELIX-Web-OS、製品間接続、分割要の候補を登録し、独立reviewとmain read-afterを完了した。
このproduct routing候補をsuccessor確定または要求承認として扱わない。`L2D-S1-01`は
[人間判断packet](l2d-s1-01-authority-vocabulary-human-decision-packet.md)に判断材料を揃えた。
人間判断まではL2／L11本文へ適用せず、S1–S4の次のdecision unitへ進めない。2026-09-18に追加したS0はこの直列の外にあり、下記S0節の範囲で並行に扱う。
[第1層完了監査](product-routing-completion-and-l2-entry-2026-09-17.md)をこの遷移のread-afterとする。

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

## S0 仮設束縛（Scaffold）

S1–S4の採否が進んでも、正式なL3、設計、実装、CIはすぐには成立しない。その間に要求や設計の成立性を確かめるには仮の物が要り、
仮の物を役割の記録なしに増やすと正式な物と区別できなくなる。このため、仮の物を扱う条件を先に判断する（2026-09-18追加）。
足場が建物の成立まで作業と接続を支えるのと同じく、仮の物が担う役割と置換先を保持し、正式な成立と混同しない。

| Decision unit | source系列 | 対象 | 現在の接続 | 採否で固定する意味 |
|---|---|---|---|---|
| L2D-S0-01 | [`scaffold-binding`](../../candidates/scaffold-binding-requirements.md) | HARNESS／HELIX-OS | 候補起草済み・未承認・L2本文未接続 | 仮の物の使用条件、保持する役割と義務、仮の検証と正式な検証の分離、置換時の無損失確認、撤去。HARNESSの規範とOSの登録・隔離実行・lifecycleへのsplit案 |

S0の採否はScaffoldの正式なschema、runtime、CI、adapterを実装・起動する許可ではない。候補の内容を先に確かめる仮組みは
`scaffold/`名前空間に置き、自身をScaffold Binding `SCF-B-0001`として候補のrevisionへ束縛している。これは仮の物であり、
S0の採否とも正式実装とも別である。`L2D-S0-01`は2026-09-17の
無損失ベースラインと候補31系列の後に追加した新規系列であり、旧要求の母集団件数を変更しない。
`L2D-S0-01`と`L2D-S1-01`は互いの判断を前提にしない。「S1の前」は節の並びとPOが先に判断したい意向を示すもので、
`L2D-S1-01`の判断を止める条件ではない。`L2D-S1-01`の人間判断を待つ間にS0で行えるのは、候補の起草、review、
人間判断packetの準備までである。2026-09-17のベースラインと第1層完了監査が`L2D-S1-01`から始めると案内している点は
S1–S4の直列について引き続き有効であり、今回の差分はその直列の外にS0の1 unitを追加したことだけである。L2／L11本文は`L2D-S1-01`の判断packetがexact digestで
参照しているため、S0の候補追加では変更しない。

## S1 authority・要求変更境界

最初に、後続の採否記録とAI読取りが依存する意味管理を確定する。

| Decision unit | source系列 | 対象 | 現在の接続 | 採否で固定する意味 |
|---|---|---|---|---|
| L2D-S1-01 | `authority-vocabulary` | HARNESS／HELIX-OS | 判断packet準備済み・未承認 | request、approval、decision、通知、技術判断の区別。HARNESSの規範とOSの記録・執行へのsplit案 |
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

S1–S4の29 decision unitと、2026-09-18に追加したS0の1 decision unitすべてについて、判断対象revision、target、親L1、L2 ID、L11条件、採否、未解決事項が記録され、
対象別L2本文と一致したときにsource採否を閉じる。候補31系列の残る1系列`helix-concept-v4`は
上位のConcept／L1人間判断packetで扱うため、本書のS1–S4の29 unitには重複算入しない。S0の`scaffold-binding`は候補31系列の外にある新規系列である。
