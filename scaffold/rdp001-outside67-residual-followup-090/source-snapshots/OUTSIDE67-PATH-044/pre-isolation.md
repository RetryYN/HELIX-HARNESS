# 新世代の構造改善判断と旧Refactoring Trigger候補の対応

確認日: 2026-09-14

## 目的

`refactoring-trigger-admission-{requirements,acceptance}.md`の旧要件6件、旧受入12件を、HARNESSの変更・検証条件と
HELIX-OSの観測・候補・採否統制へ再分類する。旧候補はUIL、System Synthesis、Universal Workflow、RF0..RF6、
current 9 scope、既存CIを前提に承認されたcandidateであり、新世代へ承認状態や実装方式を継承しない。

旧候補には独立したL1利用要求がない。新世代では利用者価値と対象をL1／L2で確定してからL3 trigger契約を導出する。
本表は要求源の照合であり、候補生成、admission、Issue／PLAN生成、runtime write、CIを実行しない。

## 要件の再分類

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| RTG-R-01 | 観測から改善候補を導く規則を版・出典・baseline・window・閾値・反証・期限へ束縛する | HARNESS-L2-004／005、HELIXOS-L2-005／007 | UIL、旧event／finding、既存registry、runtime hardcode検査を固定しない | split_reapproval_required |
| RTG-R-02 | invariant違反、再発、傾向、環境変化等を別triggerとして扱い、単一metricで採択しない | HELIXOS-L2-005／007 | 旧trigger enum、release／provider event、scheduled scan、CI costを必須集合にしない | classification_rederivation_required |
| RTG-R-03 | 候補、finding、根拠、scope、意味保存、必要検証、期限を束縛し、意味変更・故障・外部変化を分ける | HARNESS-L2-004／005、HELIXOS-L2-002／003／005 | RF0、旧route、UIL／System Synthesis、Universal Workflowを継承しない | workflow_rederivation_required |
| RTG-R-04 | primary responsibilityを一意にし、関連影響とauthority未確定を分ける | HELIXOS-L2-001／002／003 | current 9 scope、旧owner、Issue #1170、`authority_pending` enumを固定しない | authority_scope_rewrite |
| RTG-R-05 | 対象集合、評価revision、source、policy、findingを記録し、未評価とfindingなしを分ける | HELIXOS-L2-002／005／007 | 旧coverage receipt、current scope、既存scannerを継承しない | semantic_atom_candidate |
| RTG-R-06 | 観測、候補、採否、有効化を分け、見逃し・誤検出・重複・手戻り・費用を比較する | HELIXOS-L2-005／007 | 旧UIL到達、shadow admission、Issue／PLAN、RF0実行、既存CIを段階条件にしない | measurement_rederivation_required |

## 受入候補の再分類

| 旧ID | 保持候補の反例 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| RTG-AC-001／002 | 同じ入力・policyから同じ判断を返し、stale・window・sample・期限を個別に判定する | HELIXOS L10候補 | 旧event exact set、baseline、policy schemaを固定しない | oracle_rederivation_required |
| RTG-AC-003／004 | triggerを区別し、単一metricや定期scanだけで実質findingを生成しない | HELIXOS L11／L10候補 | 旧trigger enum、LOC、Issue数、AI評価を固定oracleにしない | oracle_atom_candidate |
| RTG-AC-005／006 | scope・根拠・意味保存を確認し、unknownや非refactorを誤分類しない | HARNESS L11、HELIXOS L11／L10候補 | `code_clean`、REDESIGN／RECOVERY等の旧routeを継承しない | split_oracle_reapproval |
| RTG-AC-007／008 | owner不明・複数primary・authority未確定を採択済みにしない | HELIXOS L11／L10候補 | current 9 scopeと旧pending判定をoracleにしない | authority_oracle_rewrite |
| RTG-AC-009／010 | source欠落・partial・staleと、評価済みfindingなし・no actionを区別する | HELIXOS L11／L10候補 | 旧receipt schemaやscanner coverageを継承しない | oracle_atom_candidate |
| RTG-AC-011／012 | 観測だけから実行・Issue・PLAN・authority writeへ進めず、複数効果を比較する | HELIXOS L11／L10／L12候補 | UIL、RF0、旧CI cost、既存before／afterを新世代baselineにしない | lifecycle_oracle_rewrite |

## 新世代の構造改善境界

1. HARNESSは、意味保存の判定、変更分類、影響する上流・設計・V-pair、必要検証、差戻し条件を定める。
2. HELIX-OSは、観測、finding、改善候補、scope、重複、採否、割当、結果、効果、失効を管理する。
3. 構造改善候補は要求や設計の意味変更を実行しない。意味変更は対象製品の最上流へ別の変更候補として戻す。
4. metric、AI評価、file size、Issue数、定期scan、旧CI結果の一つだけで改善を採択・実行しない。
5. 旧実装とpolicyはarchive sourceとして意味と反例を保全し、新世代runtimeへ再接続しない。

## 次工程

Concept v4.1と対象別L1で構造改善の利用者価値を定め、HARNESS／HELIX-OS L2／L11へ個別採否する。
新しいscope、trigger、状態、効果指標はその後にL3／L10／L12へ降ろす。要求整理が閉じるまで旧UIL、RF0、
既存scanner、Issue／PLAN自動生成、既存CIを実行しない。
