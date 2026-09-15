# HARNESS工程要求source被覆監査

status: source_preserved_target_unapproved
machine_ledger: `harness-workflow-source-clause-carry-forward.jsonl`
scope: development style、Forward本線、Discovery／PoC、Research、UI prototype、Scrum Reverse、specialist route、旧workflow routeと各trigger・合流・差戻し条件の非網羅追加索引

## 目的

HARNESSの工程を一つの直線へ要約して旧要求を落とさないため、要求sourceにある工程identityとtrigger行を原文・行番号・file／line digest付きで固定する。本監査は旧要求全体の代替でも網羅分母でもなく、工程順序に直接関係する108 clauseの追加索引である。全要求の分母は既存の要求source台帳群を維持し、本索引に無いことを非継承・削除・対象外の根拠にしてはならない。

## 現在値

| 集合 | 件数 | source状態 | 新世代target | successor | 人間decision |
|---|---:|---|---|---:|---:|
| HARNESS工程source clause | 108 | source metadataをそのまま記録 | `draft_candidate` 108 | 0 | 0 |

108件は次を覆う。

- Forward本線、選択style、Reverse／Redesign先行条件。
- development styleとProduction Scrumの同格性・V-pair closure。
- Discovery／PoCの4 trigger、S0–S4、S4人間判断、選択style／L3への合流。
- Researchの3 trigger、research memo＋ADR、L4への合流、成立性実験時のPoC切替。
- Screen Applicability、prototype builder、walkthrough、要求back-propagation、agreement、skip、再entry。
- Scrum Reverseの5 checkpoint、SR0–SR4、4 entity／state、release-ready、finding routing、SRV-FR-101〜112／SRV-AC-101〜112。
- Design Refactor／Performance Refactorの分岐・不変条件・baseline・非混載条件。
- Reverse、Incident、Add-feature、Refactor、Retrofit、Recovery、version-up、selected-style change intakeのtriggerと合流。
- Reverse closureを使う共通合流原則とAdd-feature／version-up例外。
- 要求・設計変更時のprototype agreement stale化と再freeze。

SRV-FR／SRV-ACのsourceは非実行archive内の`docs/design/helix/L3-requirements/scrum-reverse-entity-model.md`で、資産台帳`LEGACY-ASSET-873BE1F8C64356A2FA0F`に固定されている。本索引はその24行をhistorical `draft` sourceとして可視化するだけで、旧L3をcurrent authorityへ昇格させない。対象別L2／L11への採否とsource snapshot化は後続の一要求identity PRで決める。

## 読み方

`current_projection_refs`は現行候補文書が意味を参照する場所であり、successor割当や移管完了ではない。108件はすべて`preserved_pending_rehome`で、後続の一要求identityごとのPRにおいて保持atom、対象product、successor、L11、未被覆atom、人間decisionを確定する。近い文面を理由に統合せず、全体要求台帳から削除しない。

GitHub上流文書の導出順、HARNESS製品のroute、HELIX-OS推進が生成するworkflow instanceを別軸として読む。`premise organization`等のcandidate語彙を、このsource集合へ自動算入しない。
