# 旧要求carry-forward管理状況

status: active_management_view
as_of: 2026-09-15
authority: machine ledgers linked below

要求意味の元状態、対象別文書の承認状態、再配置状態、管理層仮登録状態、GitHubを含む作業状態は[上流authority状態モデル](authority-state-model.md)の五軸で分ける。

## 現在値

| 管理集合 | 総数 | successor割当済み | `preserved_pending_rehome` | 意味変更 | retire |
|---|---:|---:|---:|---:|---:|
| Requirement IR | 153 | 0 | 153 | 0 | 0 |
| confirmed文書の明示identity | 175 | 0 | 175 | 0 | 0 |
| v1.3非空source line | 521 | 0 | 0 | 0 | 0 |
| IR補助item（acceptance／refinement／system contract／system test） | 134 | 0 | 134 | 0 | 0 |
| 旧candidate要求源の非空source line | 4,755 | 0 | 0 | 0 | 0 |
| archive隔離前に変更された基準source revision | 333 path | 0 | 333 | 0 | 0 |

現時点ではsuccessor割当済みは0件である。37件の対象別L2はrouting containerであり、この表のsuccessorへ自動算入しない。
要求の再配置が始まっていないことを、要求削減や移管完了として表示しない。
v1.3の521行は`preserved_pending_atomization`であり、表の`preserved_pending_rehome`列へ混在させない。
旧candidate 92文書の4,755行も`historical_candidate`／`draft_candidate`／`preserved_pending_atomization`であり、sourceで採用済みだった要求や棄却済み実現方式へ混在させない。
333 pathは要求数ではなく、監査基準commitとarchive隔離直前commitでblobが異なるsource revision集合である。
両revisionの意味同値は未確認であり、[機械台帳](pre-isolation-revision-delta-source-holding.jsonl)から前revisionを落とさない。

## IR 153件の対象routing候補

| routing状態 | 件数 |
|---|---:|
| HELIX-OS候補 | 84 |
| HELIX-HARNESS／HELIX-OS分割候補 | 51 |
| 対象未解決 | 18 |
| 上記のうち意味変更・照合を人間へ提示する候補 | 23 |

[対象routing queue](legacy-ir-target-routing-queue.jsonl)は既存crosswalkの記述をfield分離したものであり、
successor割当、意味変更、承認を成立させない。23件は`meaning_change_applied: false`、全153件は
`successor_assignment_status: unassigned`のまま保持する。
対象未解決18件は、[判断packet](legacy-ir-unresolved-routing-decision-packet.md)でruntime・技術制約の層別17件と
Domain Object規律の適用範囲1件へ整理した。これは判断内容を明確にするものであり、配置や意味変更を確定しない。
[再配置wave台帳](legacy-ir-rehome-wave-register.md)は153件を業務価値→機能→非機能→技術制約の順に11 partitionへ分ける。
partitionは要求identityごとの後続PRを並べるqueue単位であり、successorや承認状態ではない。
W1は[業務価値要求33件の原文付きqueue](legacy-ir-w1-business-rehome-queue.md)へ展開済みで、
OS候補18、HARNESS／OS分割候補14、対象未解決1、意味変更判断候補8（適用0）である。
[W1人間判断候補の意味分解](legacy-ir-w1-human-decision-candidates.md)は、この8件について保持する意味、責務上の整理箇所、後続PRで示す判断を分けている。削除・縮退・統合・降格は提案していない。
[W2機能要求69件のqueue](legacy-ir-w2-functional-rehome-queue.md)は、HELIX-OS候補43件、HARNESS／OS分割候補23件、対象未解決3件を原文・digest付きで展開している。意味変更・照合候補8件は未適用、successorは全件未割当である。
[W3非機能要求40件](legacy-ir-w3-nonfunctional-rehome-queue.md)と[W4技術制約11件](legacy-ir-w4-technical-constraint-rehome-queue.md)も原文・digest付きで展開済みである。W3はOS候補22、HARNESS／OS分割14、対象未解決4、判断候補5、W4はOS候補1、対象未解決10、判断候補2で、意味変更適用・successor割当はいずれも0件である。[W2〜W4人間判断候補の意味分解](legacy-ir-w2-w4-human-decision-candidates.md)は、この15件の原文と整理論点を提示する。W1の8件と合わせた23件すべてについて、削除・縮退・統合・降格を行わず、人間判断もまだ要求していない。

## 元statusの保持

22要求文書は`confirmed` 17件、`draft` 3件、`proposed` 1件、`placeholder` 1件である。`confirmed`は採用済みのまま保持し、新世代化を理由にcandidateへ降格しない。

## 機械台帳

- [HARNESS工程source clause carry-forward](harness-workflow-source-clause-carry-forward.jsonl) — 非網羅追加索引source 108件、target draft 108件、successor 0件、decision 0件。本索引に無いことは非継承を意味しない
- [IR要求carry-forward](legacy-requirement-carry-forward.jsonl) — `51ae96d3fd27cc4aaa6e445c27ff0c6f175199cae09efe4e1566b73c1e8019b0`
- [confirmed文書identity carry-forward](legacy-confirmed-requirement-identity-carry-forward.jsonl) — `eadb6052cdc64c344e63bef4ed8c88f69b06fc6127f71f6d57b059f7cfbd18ed`
- [IR↔文書relation](legacy-ir-document-source-relation.jsonl) — `f7e713248c84ea53d50c96583f41fc827e0acf48ee98e13bc3967e78df12588f`
- [要求文書carry-forward](legacy-requirement-document-carry-forward.jsonl) — `bb4d12f3cfc9c1daefa064ede8bcc21943dd10df05098f423158fb5a08512490`
- [archive隔離前revision差分](pre-isolation-revision-delta-source-holding.jsonl) — `863854f766c7d5bc318b30dbc3a19e8086e5916c9cebb934684d92db3565d852`
- [IR対象routing queue](legacy-ir-target-routing-queue.jsonl) — 対象revisionのGit blobで固定する

## 判定規則

- successorを割り当てるには、対象product、successor ID、保持atom、未被覆atomを記録する。
- 一つの原要求を複数へ分割できるが、successorの合成で原意味を被覆できなければ`pending`を残す。
- 同名IDや意味類似を自動統合しない。重複候補として人間へ提示する。
- 意味変更、縮退、retireは対象revision付きの人間decisionがある行だけに適用する。
- Issue close、PR merge、CI、実装欠落、旧owner・旧技術との衝突から要求状態を変更しない。

## 未完了

- [semantic line全量保全inventory](legacy-requirement-semantic-line-inventory.md)に登録した未分類2,058行・[721 review unit](legacy-requirement-atomization-review-queue.jsonl)の要求atom化。source spanの全量登録と無損失な処理分割は完了したが、要求／制約／受入／根拠／例／navigationの分類とatom境界は未確定。
- 153 IRと175 source-qualified identityの意味重複候補の比較。
- [補助source 655 item](legacy-requirement-supplementary-source-inventory.md)と153 IR／175 identity／対象別L2・L11のrelation mapping。
- [旧candidate 92文書・4,755行](legacy-candidate-source-inventory.md)のatom化と、要求意味／受入／根拠／旧実現方式の分類。
- 各原要求のHARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSへのsuccessor割当。
- successorとL11受入の被覆確認、人間による意味変更・縮退候補の判断。
