# 新世代のWorker capacityと旧Three Lane候補の対応

確認日: 2026-09-14

## 目的

`three-lane-capacity-profile-{requests,requirements,acceptance,recognition}.md`の旧利用要求1件、旧要件6件、
旧受入6件、L12認識候補を、新世代のHELIX-OS Worker capacity統制へ再分類する。旧候補はCodex／Cursor／Claude、
固定3社、8-slot、既存CI、Merge Train、PR、DBを前提とするため、provider名・件数・実装方式・承認状態を継承しない。

## 再分類

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| 3L-BR-010 | 作成・検証・統合capacityを分け、下流能力に応じてWIPを調整し、accepted outcomeで評価する | HELIXOS-L2-004／005／007 | 三社、provider名、定常3／2、burst 5、8-slotを恒久要求にしない | semantic_atom_candidate |
| 3L-R-26 | 登録上限、許可WIP、実行中、review待ち、統合待ちを別状態にする | HELIXOS-L2-004／007 | 旧field名、pool registry、8-slot上限を固定しない | schema_rederivation_required |
| 3L-R-27 | 作成・検証・統制用capacityを分け、独立検証能力を枯らさない | HARNESS-L2-005、HELIXOS-L2-004 | Codex／Cursor／Claude profile、control reserve値、PR単位reviewを固定しない | split_reapproval_required |
| 3L-R-28 | review・検証・統合・競合・予算・手戻りからbackpressureを決める | HELIXOS-L2-004／008／009 | 既存CI、Merge Train、旧queue／budget schemaを継承しない | operational_rederivation_required |
| 3L-R-29 | 並列度を段階的に拡張し、品質・費用・復旧結果で戻せるようにする | HELIXOS-L2-004／005／009 | Cursor 1→2→3、4→5 burst、Claude第3枠等の旧数値を採用しない | measurement_rederivation_required |
| 3L-R-30 | generationごとに独立review担当と差戻しlineageを追跡する | HARNESS-L2-005、HELIXOS-L2-004／007 | PR、review lease exactly once、旧assignment schemaを固定しない | split_reapproval_required |
| 3L-R-31 | 対象revision変更後に証拠を再評価し、staleな検証を流用しない | HARNESS-L2-005、HELIXOS-L2-004／007 | main同期、Merge Train、exact-HEAD PR receiptを唯一方式にしない | verification_rederivation_required |
| 3L-AC-028..033 | capacity混同、盲目的dispatch、無根拠拡張、重複review、stale証拠を拒否する | HELIXOS L11／L10候補、HARNESS L11 | 固定provider／数値、旧CI／PR／DB fixtureをoracleにしない | oracle_rederivation_required |
| L12認識候補 | throughput、時間、費用、差戻し、再実行、人間介入、backpressureを観測する | HELIXOS L12候補 | 旧provider拡張episodeやDB read-afterを新世代baselineにしない | observation_rederivation_required |

## 新世代のcapacity境界

1. HARNESSは、作成側と検証側の独立性、対象revision変更時の再検証、合否証拠の条件を所有する。
2. HELIX-OSは、利用可能Worker、割当可能数、active WIP、各待ち行列、予算、期限、競合、再作業、停止・縮退を管理する。
3. provider、model、account、runner、reviewerの具体数は交換可能なresource profileとし、恒久的な上流要求にしない。
4. pool登録数や最大値をactive WIP、稼働実績、accepted throughputとして表示しない。
5. 拡張は対象・期間・上限・停止条件・費用・品質・復旧を持つ有期candidateとし、条件消失時に縮退する。

## 次工程

HELIX-OS L1／L2でWorker capacityの利用者価値と操作境界を承認した後、新しいresource profile、admission、
backpressure、evidence schemaをL3／L10へ降ろす。具体providerと数値は運用profileで別途承認する。
要求整理が閉じるまで旧三社lane、既存CI、Merge Train、PR／DB capacity projectionを実行しない。
