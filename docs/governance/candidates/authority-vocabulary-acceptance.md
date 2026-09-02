---
canonical_vmodel: L1-L12
candidate_layer: L10
canonical_pair: L3
title: "authority語彙分離受入設計"
layer: L10
kind: redesign
status: draft_candidate
created: 2026-09-02
updated: 2026-09-02
owner: QA / Codex TL
plan: PLAN-L3-82-authority-vocabulary-separation
parent_design: docs/governance/candidates/authority-vocabulary-requirements.md
pair_artifact: docs/governance/candidates/authority-vocabulary-requirements.md
---

# authority語彙分離受入設計

| AC | Requirement | 合格条件 | Negative oracle |
|---|---|---|---|
| `AVS-AC-001` | AVS-R-01 | 会話入力をexactly-one分類する | 0件／複数分類を拒否 |
| `AVS-AC-001A` | AVS-R-01A | directive候補が実行意図・対象・許可scopeを持つ | 命令形、叱責、強い口調だけのdirective化を拒否 |
| `AVS-AC-002` | AVS-R-02 | 相談・叱責・質問・仮説をauthorityへ昇格しない | 「取り込んで」「なぜ」「遅い」をapproval／decisionにしない |
| `AVS-AC-003` | AVS-R-03 | directive受領後も正本・安全・受入を検査する | `指示だから`で矛盾や危険操作を通さない |
| `AVS-AC-003A` | AVS-R-03A | directive準拠と技術rationaleを別field・別証拠で保持する | `POが言った`だけの設計、review、完了claimを拒否 |
| `AVS-AC-003B` | AVS-R-03B | authority矛盾をsurfaceし、可逆な適合案またはexact escalationを返す | 思考停止、盲目的実行、全件人間判断への丸投げを拒否 |
| `AVS-AC-003C` | AVS-R-03C | AIが独立した手段選択・代替比較・反証・risk評価・検収を残す | 逐語実行や検討打切りを忠実性としてpassしない |
| `AVS-AC-004` | AVS-R-04 | accepted decisionがADR系pointerと必須fieldを持つ | Issue comment／memoryだけのdecisionを拒否 |
| `AVS-AC-005` | AVS-R-05 | 5 identityを別schema／出力で保持する | selectionやdispositionをdecisionへ畳み込まない |
| `AVS-AC-006` | AVS-R-06 | approvalが対象・scope・revision・actorへexact binding | AI解釈や同名actorだけでhuman approvalを生成しない |
| `AVS-AC-007` | AVS-R-07 | legacy値をexact adapterで一方向変換する | 曖昧な`decision`を推測変換しない |
| `AVS-AC-008` | AVS-R-08 | current全surfaceがtyped identityを返す | generic decision identityの再出力をdoctorで拒否 |
| `AVS-AC-009` | AVS-R-09 | current出力がdecision／approval／request_directiveをexact identityで返す | `PO判断`／`PO決定`／`PO指示`へ再集約しない |
| `AVS-AC-010` | AVS-R-10 | memoryがTTL coordination＋pointerに限定される | project requirement／design／profile本文を拒否 |
| `AVS-AC-011` | AVS-R-11 | invalid／superseded memoryがcurrent guidanceから消える | replacement済み本文のSessionStart再浮上を拒否 |
| `AVS-AC-012` | AVS-R-12 | Claude/Codex rulesとadapterが同一marker／digest | 片側だけの規則変更をrule-driftで拒否 |
| `AVS-AC-013` | AVS-R-13 | human provenanceをtyped sourceで照合する | actor名やAI要約からhuman attributionを作らない |
| `AVS-AC-014` | AVS-R-14 | historical tokenはcurrentへ逆流しない | historical greenでcanonical failureを相殺しない |
| `AVS-AC-015` | AVS-R-15 | long-term knowledgeがLearning admissionを通る | memory本文を直接Skill正本へ昇格しない |
| `AVS-AC-016` | AVS-R-16 | canonical signalがREDESIGNへexactに解決され、PLAN entryへ投影される | signal未定義、wrong-axis、decision-required、legacy `po_directive`再出力を拒否 |

20 oracleを独立failure classとして保持し、単一happy pathで相殺しない。
