---
title: "Production Scrum／V設計＋Scrum実装Hybrid"
status: confirmed
authority: docs/governance/helix-harness-requirements_v1.3.md
registry: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
development_styles:
  - PRODUCTION_SCRUM
  - V_DESIGN_SCRUM_IMPLEMENTATION
subroute: SCRUM_REVERSE
subroute_state_machine: SCRUM_REVERSE_SR0_SR4
---

# Production Scrum／V設計＋Scrum実装Hybrid

## 1. 正本境界

Production ScrumとV設計＋Scrum実装Hybridはproductionのdevelopment styleである。
Reverse、Recovery等のworkflow model、Discovery PoCのcase-driven model、専門職drive、PLAN kind、
execution modeとは別axisであり、共通mode／route enumへ畳み込まない。

current identityは次のtyped tupleで保持する。

| target_axis | target_id | 意味 |
|---|---|---|
| `development_style` | `PRODUCTION_SCRUM` | L3 freeze後に要件単位でproduction slice化する |
| `development_style` | `V_DESIGN_SCRUM_IMPLEMENTATION` | L1〜L5 freeze後にL6以降をproduction slice化する |
| `subroute` | `SCRUM_REVERSE` | 各production sliceをSR0〜SR4でL1〜L5へbackfillする |

旧`scrum`、旧`mode`／`model`、旧9-mode、requirements v1.2の`kind=poc`／S0–S4説明は
compatibility input／履歴参照に限る。`scrum`だけでは二つのdevelopment styleとsubrouteを一意に
決められないため、legacy adapterは推測せず`ambiguous`でfail-closeする。legacy identityをcurrent
PLAN、Issue、PR、DB、doctor、CLI、生成文書へ再出力しない。

## 2. development styleの選択

development styleはL3 freezeで明示選択し、signalやbranch名から自動確定しない。

| style | freeze境界 | slice開始 | 不変条件 |
|---|---|---|---|
| `PRODUCTION_SCRUM` | L1〜L3 | L3で確定した要件単位 | 各sliceで正規L4／L5設計、実装、V-pair evidenceを閉じる |
| `V_DESIGN_SCRUM_IMPLEMENTATION` | L1〜L5 | L5で確定した設計単位 | L6以降をslice化してもL1〜L5 freezeを省略・再解釈しない |

Scrumは文書・品質工程の省略機構ではなく、価値slice単位の反復機構である。選択済みstyleは
registry version、registry source digest、axis、IDをIssue、PLAN、PR、DB episode、
current-location、right-arm evidenceへ同じ値で投影する。

Production ScrumのS3 verified incrementはS3 verified evidence（実装・検証証跡）の成立であってterminalではない。
S3で止まるsliceは`status=draft`のまま`outstanding`へ残し、`decision_outcome`を未記録の
`po_decision_pending`として扱い、`merged-plan-status`の完了判定へ丸め込まない。
S4 `decision_outcome=confirmed` 後にだけ、SR4 receiptとForward reentryを成立させる。

## 3. production sliceの実行

各sliceは次の共通線を通る。

```text
frozen requirement / design
  → typed PLAN
  → bounded implementation
  → targeted + regression verification
  → independent exact-HEAD review
  → canonical merge
  → SCRUM_REVERSE
```

PLAN kindは実際のactionに応じて`design`、`impl`、`add-design`、`add-impl`等を選び、
development styleの代用にしない。専門職driveは`BE`、`FE`、`FULLSTACK`、`DB`、`AGENT`を
別fieldで選ぶ。execution modeも`STANDALONE`、`CLAUDE_ONLY`、`CODEX_ONLY`、`HYBRID`を
別fieldで保持する。

production sliceをDiscoveryの`DISCOVERY_POC_S0_S4`へ入れず、`poc/*` branchや
`kind=poc`で識別しない。PoCが必要な不確実性を検出した場合は、現在sliceを成功扱いにせず
`case_driven_model:DISCOVERY_POC`を別episodeとして起動する。

## 4. Scrum Reverse逆接着

Production Scrum／Hybridは各sliceを実装して終わらせない。canonical mergeと実測事実を入力に
`SCRUM_REVERSE`を起動し、次の5段階を順序どおり進める。

| state | 目的 | 必須出力 |
|---|---|---|
| SR0 evidence capture | HEAD、CI、review、runtime／operation事実を採取 | exact evidence inventory |
| SR1 observed contract | 実挙動と外部契約を抽出 | observed contract |
| SR2 V-layer mapping | 事実をL1〜L5と対応V-pairへ写像 | layer／pair map |
| SR3 design/refactor proposal | 要求・要件・設計の不足と差分を提示 | bounded proposal |
| SR4 pair freeze and Forward reentry | 採用差分をfreezeしForwardへ戻す | registry／HEAD／pair束縛receipt |

SR4 receiptなしにsliceをrelease-readyまたはwhole-program completeと扱わない。
Scrum Reverseが作るのは実装の説明書ではなく、次の変更を拘束できる要求、要件、基本設計、詳細設計、
test／verification／measurement contractである。

## 5. terminal条件

sliceのterminal claimには次をすべて要求する。

- slice PLANの受入条件とV-pair evidenceがgreen
- current HEADのCIがterminal success
- authorと独立したruntime／model familyのexact-HEAD reviewがblocker 0
- canonical merge後のmain read-afterがgreen
- `SCRUM_REVERSE_SR0_SR4`が順序どおり完了し、SR4 Forward reentry receiptがfresh
- Issue、PLAN、PR、DB episode、current-location、right-arm evidenceのtyped tuple、HEAD、contract、
  owner、dependency frontierが一致

実装済み、レビュー済み、CI greenの単一signalだけでterminalへ丸めない。証拠またはdependency frontierが
変わればstale化し、legacy greenでcurrent failureを相殺しない。

## 6. Discoveryとの境界

Discovery PoCは不確実性と実現性をS0〜S4で検証するcase-driven modelであり、Production Scrumのphaseではない。
DiscoveryのS4 confirmed後に、L3 freezeで`FULL_L1_L12_V`、`PRODUCTION_SCRUM`、
`V_DESIGN_SCRUM_IMPLEMENTATION`のいずれかを明示選択する。

`helix s4 decision-packet --json`と`s4_decision_record`はDiscoveryのplan-only判断surfaceである。
旧Scrum PLANに残るS3／S4 fieldはcompatibility evidenceとしてだけ読み、current Production Scrum identity、
完了判定、DB projectionへ再出力しない。

## 7. approval境界

style選択、通常のrepo内実装、read/build/test、管理されたGitHub操作はrequirementsとstanding authorizationの
範囲で自律進行する。本番影響、credential access、destructive data operation、外部control plane write、
不可逆cutoverはstyle全体を止めるのではなく、該当actionだけをaction-binding approvalへ束縛する。

## 8. 正本参照

- `docs/governance/helix-harness-requirements_v1.3.md` §4、§4.1、§4.2.1、§10
- `docs/design/helix/L3-requirements/workflow-classification-registry.v1.json`
- `config/workflow-classification-catalog.v1.json`（generated projection）
- `config/drive-route-catalog.json`（compatibility inventory。意味判断へ使用しない）
