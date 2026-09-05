---
status: draft_candidate
authority_status: approved_pending_canonical_promotion
approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1552#issuecomment-5550657800"
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
version: 0.2
owner: UIL-04
plan: PLAN-L3-89-mechanism-adequacy-authority
parent_design: docs/governance/candidates/mechanism-adequacy-requests.md
pair_artifact: docs/governance/candidates/mechanism-adequacy-acceptance.md
---

# 既存機構の充足性評価：要件拡張候補

現行UIL-R-04/05への拡張候補。独立システム、新route、DB正本、scheduler、承認・完了gateは作らない。
本書のMA識別子は候補内のtrace用であり、現行Requirement IRへ承認済みIDとして投影しない。
「充足性評価」はepisodeの技術的評価であり、人間の承認やADRの半永続的判断とは区別する。

上位目的との対応（[企画候補](mechanism-adequacy-vision.md)と同一集合）：MA-BR-01→MA-R-01/02/03、MA-BR-02→MA-R-04/05/07、MA-BR-03→MA-R-06、MA-BR-04→MA-R-07。これは候補内のtraceであり、L1の承認を代替しない。

## MA-R-01 実績と能力の照合

qualified findingから要求・責務・不変条件・設計・実装revision・有効設定・呼出経路・Attempt・CI・review・運用結果をstable IDで接続する。
既存registryから、機構の適用条件、観測情報、状態、操作、保証、限界と証拠を導出する。別の手入力機構台帳を作らない。
宣言、実装済み、未接続、未検収、実稼働を区別し、失敗以外の継続的無駄・目標差も対象にする。AIの感想や生ログだけでは適格化しない。

## MA-R-02 六分類と独立した軸

評価結果は以下の六分類。これを既存UIL-R-04のfinding_class、candidate scope、system change class、capability expansion、workflow routeと混ぜない。finding_classは観測された問題の種類、充足性評価は既存能力で満たせるかの評価であり、一対一変換を仮定しない。

| 仮識別子 | 意味 |
|---|---|
| implementation_or_integration_gap | 実装・接続不備 |
| existing_method_applicable | 既存方式の適用で解決 |
| recomposition_required | 既存部品の再構成が必要 |
| mechanism_design_required | 限定範囲で新機構の設計が必要 |
| insufficient_evidence | 証拠不足 |
| requirement_or_constraint_reentry | 要求・制約の再検討 |

未実装、設定不備、検索漏れ、修正失敗回数、再発頻度、予算・期限切れだけで新機構必要へ昇格しない。
既存方式の組合せ、外部既存技術の導入・転用も対象範囲内で比較する。調査未完は証拠不足、制約矛盾は要求再検討とする。
初期対象はCI性能、観測世代、繰返しRecovery。既存P0、CI高速化、Cursorの先行実用接続を本候補へ依存させない。

## MA-R-03 限定された反証可能性

方式ごとに適用可否、実適用証拠、期待結果、観測結果、残存未充足条件を分ける。
新機構必要には、要求・環境・変更範囲・確認済み機構集合を固定し、不足する情報／状態／操作／保証を最小反例で説明する。
識別不能な二事例に異なる処理が必要、許可操作では必須状態へ到達不能、目標と保証の両立不能等を対象とする。
形式検証の成立範囲と未検証仮説を分離し、相関を因果、有限失敗を普遍的不可能、「世界初」の証明へ昇格しない。
既存解・反証・新証拠で撤回／再分類可能とし、旧receiptを改変せず後続eventと理由で置き換える。

## MA-R-04 設計候補と既存工程への引渡し

要求・制約・関連設計・実績差分・照合方式・最小反例をAIへ渡す。
設計候補は不足能力、成立条件、最小構造変更、再利用部品、検証方法、期待効果、副作用、移行・rollbackを持つ。
状態表現、責務境界、データ構造、制御方式、アルゴリズムを提案できるが、保証や評価基準の緩和を意味保存改善にしない。
要求変更はRequirement Re-entry、意味保存再構成は既存Refactoring、新能力はADD_FEATURE等へUIL-06の既存契約で接続する。
結果からrouteを一対一に即決しない。UIL-05の効果・副作用評価と既存admissionを通す。評価・候補生成は実装、merge、publishの許可ではない。

## MA-R-05 証拠と再構築

MechanismAdequacyAssessmentV1は仮称。finding/candidate参照、要求・設計・機構revision/digest、scope、確認済み集合と未調査範囲、方式別適用結果、未充足条件、反例・反証、理由、未知事項、期限、検証義務を保持する。
UniversalImprovementCandidateV1へ参照接続し、別正本や現行candidate schemaの無断変更はしない。
入力・policy・検証済み証拠が同一なら評価を再生成できる。AI仮説そのものの再生成一致は要求せず、採用した出力とmodel/session/context/output digestを固定して機械評価と分離する。
DBは既存journalから再構築するprojectionのみ。順序差・重複eventを扱い、欠落edge、wrong HEAD、stale証拠、世代・環境混載を拒否する。

## MA-R-06 低コスト・停止条件

通常ログ収集・正規化・既知照合の追加LLM呼出しは0。AIは未解決差分に限定し、同じ入力・policy・証拠では再起動しない。
AIなしでも観測、既知評価、保留、配車統制を維持する。再分類が必要な未知事項を成功へ補完しない。
追加probeは識別したい仮説と停止条件を先に固定し、時間・資源・費用・回数をboundedにする。打切りは証拠不足とし、不可能判定へ変換しない。
probeは既存policyの対象・操作・認可期限に従い、scope外・禁止操作・失効認可を実行前に拒否する。評価候補を新しい操作許可として扱わない。
性能等の残る不確実性だけを比較実験へ回し、再試行・却下候補の無限再生成を抑止する。対象の保留で無関係な作業を止めない。

## MA-R-07 効果と学習

before/after、品質、費用、副作用、再発を同一適用条件で測る。予測・実測・欠測およびbaseline/candidate/post-mainを区別する。
評価誤りを含む経験、適用条件、反例、昇格証拠は既存Learningへ渡す。過去事例は評価時点revisionで再生し、後日判明した正解を入力へ漏らさない。
新機構の件数でなく誤昇格、見逃し、診断費用、手戻り、再発を評価する。

## 非対象

HELIXWeb、専用UI/API、マルチテナント、利用者データ集約は今回の依存・受入・Release条件および後続必須義務に含めない。専用基盤・空実装・予約schemaを追加しない。既存Learningの出所・利用制限・cross-project検証契約は維持する。

## 主担当と接続先

UIL-04 #1248が評価と候補参照のowner。UIL-05は効果／副作用、UIL-06は既存配車。
System Synthesis #1033/#1036/#1039は意味接続と構造案、Learning #1384/#1035は経験・昇格、#1409は監査提案、#1344は観測世代、既存Bench/bounded probeは測定を所有する。
#1037のFUTURE parkingは維持する。関連Issue全体を一括hard dependencyにせず、利用する契約のcanonical revisionを各sliceでrequiresに束縛する。
