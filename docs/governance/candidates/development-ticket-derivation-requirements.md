---
title: "要求からの開発ticket導出要求候補"
status: draft_candidate
authority_status: awaiting_human_approval
created: 2026-09-15
product_owner: HELIX-HARNESS
operational_owner: HELIX-OS
---

# 要求からの開発ticket導出要求候補

## 目的

旧開発コアのV-model、仮説検証、prototype合意、証拠、差戻しという意味を保持し、新世代の製品・責務・技術境界へ
合わせて実行単位を再構成する。要求、PoC、UI prototype、Feature実装を一つの状態へ混在させず、別ticketとして接続する。

## HARNESS要求候補

| ID | 要求 | 確認する結果 |
|---|---|---|
| DTK-HARNESS-001 | 要求候補または合意要求から推進がtyped ticketを生成するときに、解消すべき不確実性、次の成果、ticket identityを区別するcontractを定める | HARNESS自身がticketを生成せず、要求本文、Issue、実装作業を同じidentityにしない |
| DTK-HARNESS-002 | `poc` ticketは技術・成立性仮説、対象要求、timebox、許可scope、入力、判定基準、expected evidence、終了条件、backflow先を持つ | PoC成功をproduction要求採用・製品完成・恒久技術選定へ自動昇格しない |
| DTK-HARNESS-003 | `ui_prototype` ticketは対象要求・actor・task・surface、prototype revision、確認する操作・状態・failure、利用者反応、合意／未解決、backflow先を持つ | 画像作成、画面表示、AI評価だけで要求合意にしない |
| DTK-HARNESS-004 | `feature` ticketは採用済み親要求、対象kind、設計義務、pair、acceptance、scope、依存、許可、停止、証拠を持つ | 未承認要求やPoC仮説をproduction実装へ降ろさない |
| DTK-HARNESS-005 | ticket結果を要求エンジンへ戻し、要求候補の訂正・採否、追加質問、設計template再選定、stale範囲を提示する | ticket closeやartifact存在から要求意味・合意・受入を逆生成しない |
| DTK-HARNESS-006 | 技術選定は承認済み要求と新世代architecture責務から導き、PoCで適合性、risk、運用、移行、rollbackを比較する | 旧実装言語・framework・runtimeを思想の保持と混同しない |
| DTK-HARNESS-007 | 推進側が生成するworkflowを検証できるよう、対象要求とHARNESS版に必要なlayer／pair、成果物、oracle、human gate、停止・差戻し・backflowの充足contractを提供する | HARNESSがticket tagや個別workflowを生成せず、推進方式が変わっても落としてはならない工程義務を確認できる |

## HELIX-OS要求候補

| ID | 要求 | 確認する結果 |
|---|---|---|
| DTK-OS-001 | 管理は目的、親要求revision、優先度、制約、許可、予算、期限、適用HARNESS版を推進へ渡し、推進が生成したlocal ticketとworkflowを登録・統制する | 管理が作業分解や駆動tagを先決めせず、登録を要求採用・実行許可・完了にしない |
| DTK-OS-002 | local ticketをGitHub Issue等へprojectionし、remote番号・状態・commentを原ticketへ関連付ける | Issue本文・label・closeから親要求、承認、完了を補完しない |
| DTK-OS-003 | PoC／prototype／featureの実行・成果・反応・finding・期限切れ・取消を別stateで管理し、正しい要求・template・設計へbackflowする | PoC成功やprototype合意を無関係なfeatureへ伝播しない |
| DTK-OS-004 | architectureで分けたsemantic／transactional責務ごとに技術候補、評価条件、PoC結果、採否、失効を管理する | 人気、旧採用、単一benchmarkだけで技術を固定しない |
| DTK-OS-005 | 推進は管理から受けた目的・要求・制約とHARNESS contractを解釈し、triggerに合うHARNESS routeを選び、operational tag、versioned mapping、composition、workflow instance生成規則でPoC／UI prototype／Feature ticketとworkflowを生成する | 管理指示を一枚の作業へ丸めず、同じ入力・HARNESS版・生成規則から同じticket graphとworkflow digestを得る |
| DTK-OS-006 | operational tag、HARNESS normative vocabularyへのmapping、composition、workflow instance生成規則を推進がversion管理し、開発style、work kind、変更種別、risk、surfaceを必要に応じて合成する | HARNESSが所有する語彙の意味・trigger・route内順序を再定義せず、旧9-modeや`signal → mode`を単一enumとして再導入せず、PoCとScrum等の異なる軸を排他的にしない |
| DTK-OS-007 | 検収は推進が生成したticket graphとworkflowを承認済みHARNESS contract、親要求、依存、許可に照らして独立確認し、不足を推進または上流へ戻す | 推進の自己申告、tag、Issue作成だけでworkflowを適格としない |

## ticket共通identity候補

```yaml
ticket_id: stable-local-id
ticket_kind: poc | ui_prototype | feature
drive_tags:
  delivery_style: full_v | production_scrum | hybrid | unresolved
  work_kind: feature | poc | ui_prototype
  change_kind: exact-approved-tag
  risk: exact-approved-tag
  surface: exact-approved-tag
product_target: exact-id
parent_requirement_ids: []
parent_requirement_revision: exact-revision
causal_ids: []
question_or_outcome: explicit-text
scope: {include: [], exclude: []}
dependencies: []
required_pairs: []
acceptance_ids: []
allowed_actions: []
forbidden_actions: []
timebox_or_deadline: explicit
stop_conditions: []
backflow_target: exact-owner-and-layer
evidence_required: []
state: proposed | ready | active | evidence_ready | accepted | rejected | expired | superseded
```

具体schemaはL3で確定する。GitHub Issue番号をlocal ticket IDや親要求IDにしない。
上記tag値は推進側の意味例であり、L2で最終enumを固定しない。`delivery_style`と`work_kind`を別軸にし、例えばHybrid内のPoCを
表現できるようにする。推進がticket発行時に生成するworkflow instanceは、必要layer／pair、成果物、oracle、human gate、
停止・差戻し・backflow、許可操作を持つ。管理は生成結果を登録し、tag変更は新revisionと再生成候補として推進へ戻す。
active workflowをその場で書き換えない。
