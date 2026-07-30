---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "Requirement Discovery Loop・L3 JSON authority要件"
layer: L3
kind: add-design
status: draft
freeze_blocking: true
created: 2026-07-30
updated: 2026-07-30
owner: PO / TL
plan: PLAN-L3-53-requirement-discovery-json-authority
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
pair_artifact: docs/test-design/helix/requirement-discovery-json-authority-acceptance.md
next_pair_freeze: L10
refines:
  - HR-FR-HIL-15
  - HR-FR-HIL-17
  - HR-FR-HIL-19
  - HR-FR-HIL-20
---

# Requirement Discovery Loop・L3 JSON authority要件

## §0 authority境界

本契約は既存Requirement Engineを置換せず、次のrefinementとして追加する。

| 既存owner | 再利用する責務 |
|---|---|
| `HR-FR-HIL-15` | surface適用判定、prototype、walkthrough、人間agreement |
| `HR-FR-HIL-17` | 要求翻訳、原子化、異議、設計義務、定義revision |
| `HR-FR-HIL-19` | Proposal → Candidate → Canonical、意味差分、原子的admission、rollback |
| `HR-FR-HIL-20` | 必要十分なdesign portfolio、選択済みstyleへのbinding、発見deltaのback-propagation |
| AI Vision Design HARNESS | Experience／UI／Frontend契約、prototype、反応、UX証拠 |

L1は人間向けMarkdownを正本とする。L2はappend-only discovery eventとcandidate projectionを持つが
canonical requirementではない。L3で初めてstrict JSON IRを機械正本とし、G1/G3人間承認後だけfreezeする。
別Requirement Engine、別台帳、別layer、別authoring DBを追加しない。

## §1 refinement要件

| ID | refinement要件 | 既存owner | AC |
|---|---|---|---|
| `RDJ-FR-001` | L1 initiative intakeは目的、価値、actor、context、scope/non-goal、制約、仮説、3軸候補を保持し、未確定値をAIが補完せずL2質問へ送る | `HR-FR-HIL-17` | `RDJ-AC-001` |
| `RDJ-FR-002` | L2は質問、回答、prototype、reaction、candidate split/merge/reject/accept、contradiction、defer、agreement、compile/backflowをappend-only eventとして保持し、current candidateを決定論再構築する | `HR-FR-HIL-17` | `RDJ-AC-002` |
| `RDJ-FR-003` | 次質問は影響度×不確実性×下流変更cost×人間専決度で選び、重複質問と理由なしの回答矛盾を拒否する | `HR-FR-HIL-17` | `RDJ-AC-003` |
| `RDJ-FR-004` | `screen/cli/api/event/batch/notification/external_service/none`を共通surfaceとし、requirement→action→state transition→success/cancel/failure/timeout/recovery→AC→oracleを結ぶ。`none`は理由と再評価条件を要求する | `HR-FR-HIL-15` | `RDJ-AC-004` |
| `RDJ-FR-005` | prototype reactionは自由文と構造化decisionを分離し、表示要求をunderlying need、actor/task/constraint、state/failure/recovery、candidate、AC、prototype revisionへ還元する | `HR-FR-HIL-15` | `RDJ-AC-005` |
| `RDJ-FR-006` | 暗黙要件matrixはsecurity/privacy/permission/課金/法務を含む不足をderived candidateへ戻し、AIによる無断canonical化を拒否する。高影響判断は人間へ送る | `HR-FR-HIL-17` | `RDJ-AC-006` |
| `RDJ-FR-007` | L2収束はactor/task、正常/取消/failure/timeout、P0/P1 surface、矛盾/defer、owner/re-entry、暗黙matrix、直近2 iteration、human prototype agreementの全条件で判定し、score単独判定を拒否する | `HR-FR-HIL-15` | `RDJ-AC-007` |
| `RDJ-FR-008` | L3 CompilerはL1/L2全evidenceからrequirements、24 system contract、surface、action、state、AC/HAT、measurement、trace、downstream、freeze portfolioをstrict JSONへcompileし、`compile_ready/backflow_required/human_decision_required/rejected`をexactly one返す | `HR-FR-HIL-17` | `RDJ-AC-008` |
| `RDJ-FR-009` | JSON IRはstable ID単位に分割し、revision、semantic digest、owner、statusを必須化し、unknown enum、extra property、range-only identityを拒否する | `HR-FR-HIL-19` | `RDJ-AC-009` |
| `RDJ-FR-010` | Markdown・matrix・HTML等はJSONからのgenerated viewとし、直接編集をproposal eventへ戻す。cutoverはJSON canonical、generated view、DB projection、全consumerを一つのtransactionで切り替えdual authorityを作らない | `HR-FR-HIL-19` | `RDJ-AC-010` |
| `RDJ-FR-011` | 現行153/24/72/24をshadow移行しsemantic parityを検査する。既知12要求は`HR-FR-HIL-23`／`HR-FR-HIL-24`へexact配線し、GitHub 5責務へ配線しない | `HR-FR-HIL-17` | `RDJ-AC-011` |
| `RDJ-FR-012` | 3 production styleはL1〜L3 discovery/compile/freezeを共通必須とし、Discovery／PoCはS4前canonical化しないcase軸、Design HARNESSはprototypeを支援するspecialist軸として維持する | `HR-FR-HIL-20` | `RDJ-AC-012` |

## §2 lifecycleと承認

L2 candidate lifecycleは
`hypothesis → elicited → prototyped → observed → accepted → specified → frozen`とし、
`rejected/deferred/challenged/superseded/stale`をside/terminal状態とする。`accepted`は要求意図の人間受入、
`specified`はL3 compile完了、`frozen`はG1/G3人間承認後だけ許可する。AIの沈黙承認は禁止する。

PR-1は契約だけを定義し、schema/runtime/migration/cutoverを実装済みと主張しない。

## §3 PR-1..6完了責務の分割

| slice | 完了責務 |
|---|---|
| PR-1 / #283 | 本L3/L10契約、既存owner mapping、G1/G3 hold |
| PR-2 / #284 | event schema、candidate lifecycle、質問、反応、agreement、projection、L2収束 |
| PR-3 / #285 | 153/24/72/24 shadow JSON、12要求owner/downstream修正、typed downstream status |
| PR-4 / #286 | 生成view、round-trip意味一致、DB shadow再構築2回 |
| PR-5 / #287 | JSON正本cutover、consumer移行、直接編集拒否 |
| PR-6 / #288 | JSON snapshot freeze packet、full CI、DB、AI-B、merge tree、PO承認候補 |

指示書の完了項目はこのpartitionへexactly oneで属し、PR-6が集合差分0を検査する。
