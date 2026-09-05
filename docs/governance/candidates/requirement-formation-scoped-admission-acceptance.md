---
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
version: 0.1
owner: Requirement Discovery / Authoring Admission
plan: PLAN-L3-90-requirement-formation-scoped-admission
parent_design: docs/governance/candidates/requirement-formation-scoped-admission-requirements.md
pair_artifact: docs/governance/candidates/requirement-formation-scoped-admission-requirements.md
---

# 受入候補

以下はoracle仕様であり未実行。テスト成功やruntime完成の証拠ではない。

| AC | 対象 | 正例／独立反例 |
|---|---|---|
| RFA-AC-01 | RFA-RF-01 | 既知/仮説/未知/矛盾/古い情報と義務を分離。AI解釈を原意へ昇格しない |
| RFA-AC-02 | RFA-RF-02 | 本文/実物/版/適用条件/反例で充足。大量URL・版違い・未解決反例だけのreadyを拒否 |
| RFA-AC-03 | RFA-RF-02, RFA-RF-03 | 画面/動画と実現性/選好を別検証。静止画で動作済み、PoC成功で採用済みを拒否 |
| RFA-AC-04 | RFA-RF-03 | 同hypothesis revisionで比較・採否へtrace。別版反応・意図不明・外部source命令化を拒否 |
| RFA-AC-05 | RFA-RF-04 | freeze前の限定探索は許可内で進む。本実装/本番writeへの越境を実行前に拒否 |
| RFA-AC-06 | RFA-RF-04 | 有効証拠再利用と予算上限停止。打切りの完了/不存在偽装・無限再試行を拒否 |
| RFA-AC-07 | RFA-RC-01, RFA-RC-02 | 委任内技術差分の重複承認0。可逆性/AI熟練だけの許可、相談/叱責/対象不明GOの承認化を拒否 |
| RFA-AC-08 | RFA-RC-01, RFA-RC-03 | 新価値/受入緩和/予算・権限拡張を対象だけ返す。policy自己拡張・見た目分類だけの許可を拒否 |
| RFA-AC-09 | RFA-RC-03 | 六outcomeを根拠付きexactly-oneで返す。証拠不足と認可不足、競合と違反の混同を拒否 |
| RFA-AC-10 | RFA-RC-04 | 新revisionへpolicy適用receiptを発行。偽造・期限切れ・撤回済み根拠、旧承認無条件流用を拒否 |
| RFA-AC-11 | RFA-RC-04 | 意味不変表記で不要revision0、コード変更にはexact-HEAD検証。LLM宣言/CIだけの意味保存判定を拒否 |
| RFA-AC-12 | RFA-RC-05 | 3判定を独立評価し必要pairのみ再freeze。影響scopeのstale writerを拒否、無関係scope継続を実測 |
| RFA-AC-13 | RFA-RC-05 | 競合revision・partial JSON更新・異digest retryを拒否。同一retry冪等、rollback/取消で再評価 |
| RFA-AC-14 | RFA-RC-05 | 共有不変条件の影響不明を診断/隔離。無影響への補完を拒否 |
| RFA-AC-15 | RFA-GH-01 | 階層と形成/許可状態を別projection。label/単語/READY leafだけの許可を拒否 |
| RFA-AC-16 | RFA-GH-02 | dispatch/実行/ready/mergeが同authority/HEAD/scopeを照合。docs path免除・探索mergeの実装許可化・required skipを拒否 |
| RFA-AC-17 | RFA-GH-03 | Issue/PLAN＋Assignment経路とTicket経路で同条件。未移行scopeの全体停止・未検証fallbackを拒否 |
| RFA-AC-18 | RFA-RF-01..04, RFA-RC-01..05, RFA-GH-01..03 | 限定調査→候補→独立検証→scope再freeze→IR→許可作業→main read-after→L12までE2E。候補保存だけの完了主張を拒否 |

L1との効果対応は[運用検証候補](requirement-formation-scoped-admission-recognition.md)へ渡す。
