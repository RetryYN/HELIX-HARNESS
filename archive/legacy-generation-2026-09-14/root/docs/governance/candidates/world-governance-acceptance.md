---
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
canonical_layer: L10
canonical_pair: L3
plan: PLAN-L3-92-world-governance
---

# 全体機能統制の受入・運用評価候補

以下は未実行のoracle契約。bindingの存在をruntime成功とは数えない。各ACには後続L8/L7でtargeted／結合testを具体化し、mutation、必要CI、DB replay、独立exact-HEAD review、main read-afterを束縛する。

| AC / test予定ID | 要件 | 正例と反例 |
|---|---|---|
| HWG-AC-01 / U-HWG-001 | R01,R02 | 要求のみ・main実装のみ・入口未接続・運用済み・公開済みを別軸で返す。候補branch、Issue close、binding testだけで昇格しない。 |
| HWG-AC-02 / U-HWG-002 | R01,R03,R08 | 双方向censusで要求欠落・実装orphan・二重primary owner・無根拠edgeを個別検出。未読／部分取得を欠陥なしへ変換するmutationを拒否。 |
| HWG-AC-03 / U-HWG-003 | R03,R04 | 根拠付き多対多の再利用を通す。共通path／類似名／AIスコアだけの自動統合を拒否。 |
| HWG-AC-04 / U-HWG-004 | R04,R05 | 相談を受理し、暫定ID・scope・予算TTL付き探索を許す。同一候補の未許可本実装・公開は拒否。CLI/GitHub/worker各入口の迂回も反例に含める。 |
| HWG-AC-05 / U-HWG-005 | R05,R08 | 同一入力は同じ判定。snapshot／revision／policy変更、競合、再送、取得不能を区別し、dispatch／merge時のstale receipt流用を拒否。DB replayで一致する。 |
| HWG-AC-06 / U-HWG-006 | R07 | 人間待ちの影響閉包だけを停止し、独立が証明されたCI改善等は継続。影響不明の独立扱いと旧承認流用は拒否。 |
| HWG-AC-07 / U-HWG-007 | R02,R06 | 内部利用はowner・理由・再評価条件付きで未公開表示。未検証Sliceのstable混入を拒否し、独立Sliceを全体完成待ちにしない。 |
| HWG-AC-08 / U-HWG-008 | R01,R03,R04,R06 | 新要求から機能・責務・検証・提供先へ往復追跡。split/merge/transfer/retire後も旧revisionと後継・移行証拠を辿れる。 |
| HWG-AC-09 / U-HWG-009 | R05,R08,R09 | shadow→限定enforce→rollbackを実証。既存CI/review/lease/security/release gateを維持し、全旧債務の解消を開始条件にしない。例外はscope/owner/期限を必須とする。 |
| HWG-AC-10 / U-HWG-010 | R07,R08,R09 | HWG policy変更は旧policy＋独立検証で審査。自己承認・自己権限拡張・保護解除を拒否。誤停止・見逃し・p95追加時間・再実行・token費用を実測し、未定義閾値でenforceしない。 |

## L1↔L12の評価

- HWG-OP-01 → BR-01: 固定snapshotの母集合／走査済み／取得不能／未所属を公開し、要求起点と実装起点の照合残差を再現する。未分類0を欠陥0へ変換しない。
- HWG-OP-02 → BR-02: 実作業の新規差分で未束縛越境を検出し、独立作業の継続と必要な人間差分だけの返却を記録する。
- HWG-OP-03 → BR-03: Slice提供資格と未完了を説明し、導入前後の誤停止・待ち時間・p95・再実行費用を比較する。公開は実consumer／更新rollback／操作許可の証拠で判定する。

## 段階出口

1. HWG-P1（authority）: BR/要件/AC/ownerの欠落なし、#1500着手制約改版、必要承認・正本更新・IR収載。文書作成をcore完成としない。
2. HWG-P2（read-only）: 既存ownerの最小snapshot契約でAC01/02/03/05/08を検証、未取得を可視化。性能baseline・enforce許容値を確定。
3. HWG-P3（shadow／限定enforce）: AC04/06/09/10と自己dogfood、scope別解除条件・観測・rollbackを成立させる。全旧債務完了を依存にしない。
4. HWG-P4（全域接続）: 許可された母集合の全入口・提供対応を照合、AC07と全AC再実行。未解決を残件として保持し、外部配布検収は別ownerへ戻す。

各phaseは責務単位のPLAN/PRを持ち、依存閉包と入出力契約を具体化してから開始する。現時点で実装test実行・core完成・公開の証拠はない。
