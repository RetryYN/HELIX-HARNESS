---
title: "要求からの作業分解（WBS）台帳の管理層要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
authority_effect: none
created: 2026-09-18
product_targets:
  - HELIX-OS
  - HELIX-HARNESS
derived_from:
  - docs/helix-os/L1-planning/system-intent.md
  - docs/helix-os/L2-requirements/governance-requirements.md
  - docs/governance/candidates/development-ticket-derivation-requirements.md
  - docs/governance/candidates/legacy-rule-derived-requirements.md
related_projection:
  - "GitHub Issue #1805（推進機構が駆動tag・workflow・typed ticketを生成する）"
  - "GitHub Issue #1813（全要求の要否・再配置review program）"
  - "GitHub Issue #1802／#1803（Design Template意味コアと版管理。将来の接続先の作業projection）"
---

# 要求からの作業分解（WBS）台帳の管理層要求候補

## これは何か

要求が採否されたあと、それを「誰が、どの順で、何を検証して、いくらの予算で」進めるかへ落とす構造をWBS（作業分解構造）と呼ぶ。
本書は、そのWBSを**HELIX-OSの管理層が所有する台帳**として扱うための要求候補である。
管理層は台帳の登録・整合・統制を持ち、要求からの分解と開発方式の選定は推進が、分解結果の独立確認は検収が持つ。
この分担は既存候補[要求からの開発ticket導出](development-ticket-derivation-requirements.md)（`DTK-OS-001`「管理が作業分解や駆動tagを先決めせず、登録を要求採用・実行許可・完了にしない」、`DTK-OS-005`、`DTK-OS-007`）と同じである。

本書は要求整理だけを行う。WBSエンジンの実装、schema、DB、GitHub連携を実装・起動しない。

## なぜ要るか

- 要求は既に手で扱える量を超えている。対象別L2要求案37件（HARNESS 9、HELIX-OS 13、HELIX-Web 9、HELIX-Web-OS 6。[上流authority register](../upstream-authority-register-2026-09-14.md)）、旧要求153件の再配置、旧ルール群由来の要求候補57本、その他の候補群がある。採否後に人が作業へ割る運転は続かない。
- 旧HELIXでは、要求から作業へ落とす規則が大量にあった。旧ルール群のうち`RUL-TKT-01`（作業identityの一意性、既存の延長優先）に55件、`RUL-TKT-02`（作業graph・依存・並列直列・scope・予算・contextの境界を先に確定）に132件、`RUL-TKT-03`（差戻し・持ち越し・後続分離の記録）に77件、`RUL-OSP-06`（複数agentの実行計画の検証）に72件の規則atomが対応づいている。規則はあったが、それを担う台帳とエンジンは旧runtimeと一緒に退役し、新世代に無い。
- 台帳が無いまま自走すると、AIが会話ごとに作業を切り直し、同じ作業が別identityで重複し、予算と依存が追えなくなるおそれがある。`RUL-TKT-01`（重複を作らず既存の延長を優先し、置き換えは後継と訂正として記録する）に55件の規則atomがあることは、旧HELIXでその問題に繰り返し対処していたことを示す。

## 責務境界

| 対象 | 所有する責務 | 所有しない責務 |
|---|---|---|
| HELIX-OS 管理 | WBS台帳（作業identity、親要求revision、依存、優先度、予算、期限、停止条件、進捗、差戻し）の登録・整合・統制。要求revisionが変わったときのstale判定 | 要求からの分解、開発方式の選定、作業の実行、分解の妥当性の判定 |
| HELIX-OS 推進 | 採否済み要求と制約から作業graph（個々の作業と、それらを束ねる集約）を生成し、変更の種類と開発styleに合うHARNESS routeを選ぶ | 台帳の直接書換え、自己検収、要求意味の変更 |
| HELIX-OS 検収 | 生成された作業graphを、承認済みHARNESS契約・親要求・依存・許可に照らして独立確認し、不足を推進または上流へ戻す | 分解の生成、要求の採否 |
| HELIX-HARNESS | WBSの形の規範：作業単位がV-pair・受入条件・変更の種類・工程順序をどう持つか（`HARNESS-L2-001`／`002`／`003`、`RUL-FRM-01`／`03`） | 台帳の運転、分解の実行 |

## HELIX-OS 管理層に対する要求

| ID | 要求 | 確認する結果 |
|---|---|---|
| WBS-OS-001 | 採否済み要求のexact revision（digest）だけを入力として、作業graphをWBS台帳へ登録できる | 候補・未承認・staleの要求からは登録できない。登録は台帳への記録であり、要求の採否・承認を生成しない |
| WBS-OS-002 | HARNESSが定める作業単位の形（`WBS-HARNESS-001`）に適合しない作業を台帳に登録できない。作業は安定したidentity、親要求ID（親要求のkind＝unit／connection／compositeは親から引く）、対象product、作業の粒度（task／aggregate）、担当候補を持つ | 形に適合しない作業、親要求を持たない作業、依存が循環する作業、予算の無い作業を登録できない。同じ意味の作業を別identityで二重登録しない（`RUL-TKT-01`） |
| WBS-OS-003 | 親要求のrevisionが変わったとき、影響する作業を`stale`にし、再分解の対象として列挙できる | 古いrevisionの作業が有効なまま進まない |
| WBS-OS-004 | 進捗・差戻し・持ち越し・後続分離を、作業identityと証拠のrevision付きで記録できる（`RUL-TKT-03`） | 検証の失敗が差戻しへ接続され、closeやgreenから完了を生成しない |
| WBS-OS-005 | GitHub Issue／Projectsへ作業graphを投影し、remote番号・状態を原作業へ関連付けられる（`DTK-OS-002`と共通） | Issueの本文・label・closeから親要求・承認・完了を補完しない |
| WBS-OS-006 | 台帳の状態（登録数、stale、予算超過、依存で止まっている作業、担当未定）を機械で集計し、管理の是正先へ返せる | 集計から要求意味・優先度を自動変更しない |

## 推進・検収・HARNESSへの接続要求

| ID | 要求 | 確認する結果 |
|---|---|---|
| WBS-OS-007 | 推進は、採否済み要求・制約・HARNESS契約から作業graphを生成し、変更の種類（新規、追加、修正、refactor、retrofit、reverse、PoC、research）と開発styleに応じたHARNESS routeを作業ごとに選ぶ（`DTK-OS-005`、`RUL-FRM-03`） | 管理が分解を先取りしない。routeの選定理由が作業に残る |
| WBS-OS-008 | 検収は、生成された作業graphを承認済みHARNESS契約・親要求・依存・許可・予算に照らして独立確認し、不合格の作業を推進へ戻す（`DTK-OS-007`、`RUL-OSP-06`） | 推進の自己申告やIssue作成だけで台帳へ入らない |
| WBS-HARNESS-001 | 作業単位が持つべき形（依存、並列・直列、scope、予算上限、期限、V-pair＝対応する検証、受入条件、変更の種類、工程順序、停止・差戻し条件）を規範として定め、OSはそれを台帳のschemaへ写す | HARNESSは台帳を運転せず、OSは規範を改変しない。規範に無い形の作業単位は台帳に入らない |

## 本線との関係

- 既存L2との接続候補：`HELIXOS-L2-001`（要求正本・採否revisionと担当責務）、`HELIXOS-L2-010`（管理・推進・検収の編成）、`HELIXOS-L2-011`（統合順序・検証実行計画の導出と再計画）、`HELIXOS-L2-013`（同じ仕事への関連付けと診断）。HARNESS側は`HARNESS-L2-001`／`002`／`003`。
- 既存候補との関係：`DTK-OS-001`〜`007`と`partial_overlap`。DTKはticketの種類（poc／ui_prototype／feature）と生成規則を扱い、本書は台帳の所有と統制を扱う。統合するかは採否時に判断する。
- 旧ルール群との関係：`RUL-TKT-01`／`02`／`03`、`RUL-OSP-06`に主として対応づいた規則atom計336件（副を含めると686件）が入力である。
- 採否順序：[対象別L2 source採否順序](../audits/source-rebaseline/l2-source-adoption-sequence.md)に独立の判断単位`L2D-S0-02 wbs-ledger`として置く。`L2D-S2-02 execution-ticket`（Worker assignment、scope、budget、evidence、replay）は関連系列であり、同じ判断単位にはしない。

## 最初のパイロット

本要求候補自身を、次の順で流す。要求候補が「管理層に入り、開発方式が選ばれ、要件定義へ降りる」経路を、この1件で通す。

1. 管理層取込：本書を候補として置き、上流authority registerに登録する（本PR）。
2. 開発方式選定：変更の種類は「新規」、正式なL3が止まっている間は`scaffold/`の仮組み（PoC相当）として成立性を確かめる。仮組みはScaffold Bindingに登録し、上流を本書と`RUL-TKT-*`のrevisionに束縛する。`L2D-S0-01 scaffold-binding`が人間判断で承認されるまで、この手順へ進めない。
3. 要件定義：仮組みで確かめた入出力を、`HELIXOS-L2`本文への要求（要求の粒度 unit／connection／composite）として要求PRで接続する。

各段階は別PRで行い、前の段階の合格から次の段階の承認を生成しない。

## 将来の接続（本候補の要求ではない）

作業分解のパターンを外部のrepositoryから学び、設計・分解のtemplateを増やす経路は、既存の置き場へ次のように接続できる。
本候補はこの接続を要求にしない。接続先が採否されたあとに、別の要求候補として扱う。

- 取り込み：Tech Web Crawler（`HELIXOS-L2-012`）が外部の分解事例を「観測事実、出典、版、license、適用条件」付きで返す。リサーチの規範（`RUL-RSH-01`）に従い、成熟度・依存risk・licenseを確かめてから採否する。observationをauthorityへ昇格しない。
- 蓄積：[HARNESS設計template system要求候補](design-template-system-requirements.md)（未承認）の一種として、作業分解のtemplateを版・適用履歴・利用結果付きで持つ（版の管理は`RUL-OSI-02`）。利用結果と指摘から改善候補へ戻す還流は`RUL-OSI-01`が回す。
- 利用：推進が作業graphを生成するとき（`WBS-OS-007`）に、変更の種類とproductに合うtemplateを候補として提示する。
- 境界：licenseと出典が無い外部パターンを取り込まない。学習結果から要求・設計・作業を自動採用しない。

## 現在の停止条件

- 本候補の記載で、HELIX-OS／HARNESSのL2合意や人間承認を成立させない。
- WBSエンジン、台帳schema、DB、GitHub連携を実装・起動しない。仮組みは別PRで、Scaffold Bindingの下でだけ行う。
- 候補・未承認の要求からWBSを生成しない。
- `L2D-S0-01`が承認されるまでパイロットの手順2（仮組み）へ進めない。手順の合格から次の手順の承認を生成しない。

## L11受入候補

全件未実行である。

- 候補状態の要求を入力に登録しようとし、拒否する。（WBS-OS-001）
- 親要求のない作業、依存が循環する作業、予算の無い作業を登録しようとし、拒否する。（WBS-OS-002）
- 同じ意味の作業を別identityで登録しようとし、既存の延長として扱う。（WBS-OS-002）
- 親要求のrevisionを変え、影響する作業が`stale`になり再分解対象として列挙される。（WBS-OS-003）
- 検証の失敗を与え、差戻しが作業identityと証拠のrevision付きで記録される。（WBS-OS-004）
- Issueをcloseし、原作業の完了が生成されない。（WBS-OS-005）
- 管理が作業graphを直接書き込もうとし、拒否する（推進の生成と検収の確認を経ない）。（WBS-OS-007／008）
- 検収の確認を経ない作業graphを台帳へ入れようとし、拒否する。（WBS-OS-008）
- 集計結果（予算超過、stale件数）から要求の優先度や意味を自動で書き換えようとし、拒否する。（WBS-OS-006）
- HARNESSの規範に無い形の作業単位を登録しようとし、拒否する。OSが規範の項目を改変しようとし、拒否する。（WBS-HARNESS-001）
