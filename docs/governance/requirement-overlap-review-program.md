# 要求間の責務・機能重複review program

status: batch_1_answer_recorded_review_pending
program_id: RDP-002
parent_program: RDP-001
owner: HELIX-OS management
authority_effect: none

## 目的

[全要求の要否・再配置review program](requirement-disposition-review-program.md)の子作業として、旧要求と新世代の
routing containerに現れる責務・機能の重複候補を発見し、同一、包含、部分重複、接続、共通能力、実装方式だけの一致、
同名異義を区別する。重複候補の発見を要求削除や統合済みの根拠にせず、原要求identityと意味atomを保持して人間判断へ送る。

## 重複候補の分類

| relation候補 | 確認すること | 禁止する短絡 |
|---|---|---|
| `exact_semantic_duplicate` | actor、目的、入力、出力、正常系、failure、回復、制約、受入、適用範囲が同じか | 文言類似や同名だけで同一にする |
| `partial_overlap` | 共通atomと各要求だけが持つatomを分けられるか | 共通部分だけを残して固有条件を落とす |
| `responsibility_split` | 一つの旧要求にHARNESSの工程contractとHELIX-OSの実行・管理責務が混在するか | 片側だけへ押し込み、他方の意味を消す |
| `shared_capability` | 複数productが同じ能力を別の利用結果・境界で必要とするか | 共通実装を理由に要求identityを一つにする |
| `connection_requirement` | 二つ以上のunit間の受渡し・順序・整合・failureが独立要求になるか | unitの成立から接続成立を推定する |
| `implementation_overlap` | 旧DB、CLI、hook、CI、Worker等の実装だけが共通か | 旧実装の共有から要求ownerを決める |
| `terminology_collision` | 同じ語が別のauthority、状態、責務を表していないか | 同名を同一意味として統合する |
| `no_material_overlap` | 比較後に意味上の重複がないか | 比較前に別物または重複と断定する |
| `unresolved` | source、atom境界、対象product、受入の何が不足しているか | 不明を不要・重複済みへ補完する |

## 初期review対象

次は重複確定ではなく、優先して比較するclusterである。

1. HARNESSのnormative workflow contractと、HELIX-OS推進のtag／mapping／workflow instance生成。
2. HARNESS要求エンジンの意味抽出・差分・分類出力と、HELIX-OS管理の原登録・分類projection・改善還流。
3. HARNESSのFeature Ticket意味contractと、HELIX-OS推進のticket発行・GitHub projection。
4. HARNESSの検証義務・merge条件と、HELIX-OSのCI生成・実行・監視・再開。
5. HARNESSの外部提供条件と、HELIX-OSのpackage管理・導入・更新・release準備。
6. HELIX-Webの利用者向けdashboard要求と、HELIX-Web-OSのservice state・evidence projection。
7. Requirement IR 153件、confirmed identity 175件、補助source、旧candidate、workflow索引、37件の対象別routing container間の同一・包含・派生関係。
8. 旧`harness.db`／HELIX-DBに束ねられていたstate、event、trace、feedback、search、automation readinessと、新世代HELIX-OS要求の対応。

この一覧に無いclusterを非対象にしない。新しい重複候補はsource-qualified identityとatomを保持して追加する。

初期waveでは、製品責務分類第1層で`split_required`または`cross_product_connection`となった旧Requirement IR 66件を、
[cluster台帳](requirement-overlap-candidate-clusters.jsonl)の20 clusterへ重複0・欠落0で割り当てた。
[人間質問batch](requirement-overlap-question-batches.md)のうち最初の4回は、初期66件の責務境界候補を確認する。これは
初期66件だけの
比較waveであり、残るholdingを重複なしと判定しない。

Issue #1847のScaffold Bindingは、GitHub本文を要求正本にせず
[ローカルsource holding](github-issue-1847-scaffold-source-holding.json)へexact保存した。そのcore binding、Scaffold CI、
replacement／retireを別clusterにし、Web dashboard接続と旧HELIX-DB実装重複を加えた5件を
[補助cluster台帳](requirement-overlap-supplementary-candidates.jsonl)へ置く。質問は合計25件、5問×5回とする。

## cluster record

各clusterは少なくとも次を持つ。

```yaml
overlap_cluster:
  cluster_id: stable-id
  source_requirement_refs: []
  source_atom_refs: []
  compared_revisions: []
  candidate_relation: exact_semantic_duplicate | partial_overlap | responsibility_split | shared_capability | connection_requirement | implementation_overlap | terminology_collision | no_material_overlap | unresolved
  common_atoms: []
  distinct_atoms_by_source: {}
  candidate_product_targets: []
  candidate_successor_requirements: []
  acceptance_differences: []
  consumer_differences: []
  unaccounted_atom_refs: []
  human_decision_ref: null
  authority_effect: none
```

fieldと永続化schemaは、要求分類と管理登録のL3で確定する。現在は文書と原台帳を用い、旧DB schemaを流用しない。

## Issue化と判断境界

- 本programのGitHub Issueは重複候補clusterと未決を共有するprojectionであり、統合・削除のdecisionではない。
- 一つのclusterが複数の独立判断を含む場合は、local cluster recordを先に分けてから子Issueを一件ずつ作る。
- 重複を解消する要求PRは一つの要求identityを扱い、他要求はrelationと影響参照に限定する。
- 統合案でも原identityを消さず、各原atomのsuccessor位置を記録する。固有atomを別の生存中仮登録へ残せない場合は停止する。
- 意味変更、縮退、archive限定、retireは、対象revision付きの人間decisionがある場合だけ確定する。
- GitHub Issueのclose、同一実装、旧owner、未実装、名称類似、AI判定から重複解消を生成しない。

## 完了条件

- 発見した全clusterに比較revision、relation、共通atom、固有atom、対象product、受入差分、consumer差分がある。
- 完全重複と判断する場合も全原identityからsuccessorへのtraceが残り、未計上atomが0である。
- 責務分割ではHARNESSの工程意味とHELIX-OSの管理・推進・実行意味が別successorへ無損失に接続される。
- unitの共通性とconnection／composite固有条件が分離され、一方の完了を他方へ自動伝播しない。
- 未決clusterは`unresolved`として残り、親の要否整理を完了表示しない。

## 現在の停止条件

Concept v4.1と4対象L1は承認済みだが、対象別L2／L11は未採否である。product routingは旧Requirement IR 153件について
候補登録済みで、multi-product候補66件を初期20 cluster、補助sourceを5 clusterへ整理した。現在はDraft PRの独立review後、
人間へ一度に5問ずつ確認しており、Batch 1の5件は[人間回答record](decisions/requirement-overlap-batch-1-boundary-answer-2026-09-17.md)へ
5件とも推奨案Aとして記録した。残る20問への回答前に最終relation、successor統合、要求削除を決定せず、
記録済み回答も個別要求の採否へ読み替えない。
全25問の回答、無損失照合、再review、main read-afterまでIssue #1814をcloseしない。L3、実装、DB、CI、archiveの
物理削除へ進まない。
