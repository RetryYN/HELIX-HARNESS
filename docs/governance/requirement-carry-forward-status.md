# 旧要求carry-forward管理状況

status: active_management_view
as_of: source-specific（旧routing queueは2026-09-15、四製品routing候補は2026-09-17）
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
| archive隔離前に変更された基準source revision | 333 path | 0 | N/A | 0 | 0 |

現時点ではsuccessor割当済みは0件である。37件の対象別L2はrouting containerであり、この表のsuccessorへ自動算入しない。
要求の再配置が始まっていないことを、要求削減や移管完了として表示しない。
v1.3の521行は`preserved_pending_atomization`であり、表の`preserved_pending_rehome`列へ混在させない。
旧candidate 92文書の4,755行も`historical_candidate`／`draft_candidate`／`preserved_pending_atomization`であり、sourceで採用済みだった要求や棄却済み実現方式へ混在させない。
333 pathは要求数でも`preserved_pending_rehome`状態の件数でもなく、監査基準commitとarchive隔離直前commitでblobが異なるsource revision集合である。
両revisionの意味同値は未確認であり、[機械台帳](pre-isolation-revision-delta-source-holding.jsonl)から前revisionを落とさない。

## 製品・工程・旧実装の判断入口（2026-09-24時点）

| 対象 | 現在値 | この値が示す範囲 |
|---|---:|---|
| 旧Requirement IRの製品候補 | 153 / 153（100%） | 87件が単一製品、65件が分割、1件が製品間接続の候補 |
| confirmed文書の原文IDの製品候補 | 175 / 175（100%） | 139件が単一製品、36件がHARNESS／OS分割の候補 |
| 旧IRから分解した要求unitの直接工程候補 | 188 / 218（86.2%） | 残る30件は直接PHCAP機構の根拠を原文から特定できず未解決 |
| 要求unit単位の旧実装・縮退判定 | 0 / 218（0%） | 全件の直接asset意味linkとconsumer closureが未確認 |

IR 153件とconfirmed原文ID 175件には部分的な意味重複があり、328件の独立要求として合算しない。製品候補は[IR台帳](legacy-ir-product-routing-bootstrap.jsonl)と[confirmed原文ID台帳](legacy-confirmed-identity-product-routing-candidates.jsonl)、工程・実装状態は[218 unitのcrosswalk](legacy-requirement-implementation-crosswalk-bootstrap.jsonl)に記録する。工程候補の188件も正式な工程採否ではない。旧phase能力の`degraded_*`／`not_reimplemented_formally`は要求unit固有の縮退・未実装を証明しない。

旧資産4,020件は所在と静的種別を[候補台帳](legacy-asset-phase-product-classification-bootstrap.jsonl)に保全済みで、全件の再利用適性や要求単位の実装成立は未判定である。POの[判断時期の決定](decisions/legacy-asset-review-timing-2026-09-23.md)に従い、先に要求の要否と製品scopeを決め、L3要件定義で選んだ関係資産だけを必要な根拠まで調べる。未選定資産の全件調査は要求判断の前提にしない。

製品候補分類だけでPOのscope判断は成立しない。個別identityでは、原文・revision・今回の判断に影響するrelationを揃えた時点でPOへ送る。[個別要求判断の調査停止境界](decisions/rdp-identity-evidence-boundary-2026-09-23.md)は全14 source holdingの未処理を個別判断の一律停止条件にしない。既に判断された[HIL-BR-02の製品scope](decisions/hil-br-02-product-scope-2026-09-23.md)はこの入口の一例であり、要求採否・successor割当・実装承認を意味しない。

## IR 153件のrouting候補

### 現行のproduct responsibility候補

2026-09-17監査時点の[四製品routing bootstrap台帳](legacy-ir-product-routing-bootstrap.jsonl)は、全153件を
四製品について評価した候補projectionである。

| routing候補 | 件数 |
|---|---:|
| 単一製品候補（HELIX-OS 67、HELIX-HARNESS 20） | 87 |
| HELIX-HARNESS／HELIX-OS分割候補 | 65 |
| 製品間connection候補 | 1 |
| 候補targetあり | 153 |

このrouting候補は要求採否・successor割当・意味変更・承認を成立させない。台帳上、全153件は
`authority_effect: none`、`meaning_change_applied: false`、`successor_assignment_status: unassigned`である。

### 旧crosswalk queueの履歴値

次の値は[旧対象routing queue](legacy-ir-target-routing-queue.jsonl)が保持するcrosswalk由来のrouting snapshotであり、
現行の四製品routing候補ではない。

| 旧queueのrouting値 | 件数 |
|---|---:|
| HELIX-OS候補 | 84 |
| HELIX-HARNESS／HELIX-OS分割候補 | 51 |
| 対象未解決 | 18 |
| 上記のうち意味変更・照合を人間へ提示する候補 | 23 |

旧queueは既存crosswalkの記述をfield分離したものであり、現行bootstrap台帳への置換やsuccessor割当、意味変更、
承認を成立させない。23件は`meaning_change_applied: false`、全153件は`successor_assignment_status: unassigned`のまま保持する。
対象未解決18件は、[判断packet](legacy-ir-unresolved-routing-decision-packet.md)でruntime・技術制約の層別17件と
Domain Object規律の適用範囲1件へ整理した。これは判断内容を明確にするものであり、配置や意味変更を確定しない。
[再配置wave台帳](legacy-ir-rehome-wave-register.md)は153件を業務価値→機能→非機能→技術制約の順に11 partitionへ分ける。
partitionは要求identityごとの後続PRを並べるqueue単位であり、successorや承認状態ではない。
W1は[業務価値要求33件の原文付きqueue](legacy-ir-w1-business-rehome-queue.md)へ展開済みで、
OS候補18、HARNESS／OS分割候補14、対象未解決1、意味変更判断候補8（適用0）である。
[W1人間判断候補の意味分解](legacy-ir-w1-human-decision-candidates.md)は、この8件について保持する意味、責務上の整理箇所、後続PRで示す判断を分けている。削除・縮退・統合・降格は提案していない。
[W2機能要求69件のqueue](legacy-ir-w2-functional-rehome-queue.md)は、HELIX-OS候補43件、HARNESS／OS分割候補23件、対象未解決3件を原文・digest付きで展開している。意味変更・照合候補8件は未適用、successorは全件未割当である。
[W3非機能要求40件](legacy-ir-w3-nonfunctional-rehome-queue.md)と[W4技術制約11件](legacy-ir-w4-technical-constraint-rehome-queue.md)も原文・digest付きで展開済みである。W3はOS候補22、HARNESS／OS分割14、対象未解決4、判断候補5、W4はOS候補1、対象未解決10、判断候補2で、意味変更適用・successor割当はいずれも0件である。[W2〜W4人間判断候補の意味分解](legacy-ir-w2-w4-human-decision-candidates.md)は、この15件の原文と整理論点を提示する。W1の8件と合わせた23件すべてについて、削除・縮退・統合・降格を行わず、人間判断もまだ要求していない。

## revision別statusの保持

22要求文書のarchive隔離直前revisionは`confirmed` 17件、`draft` 3件、`proposed` 1件、`placeholder` 1件である。
監査基準revisionは`screen-mock-boundary.md`が`confirmed`のため、`confirmed` 18件、`draft` 2件、`proposed` 1件、
`placeholder` 1件である。両revisionを別sourceとして保持し、後の`draft`で前の`confirmed`を上書きしない。

## 機械台帳

- [HARNESS工程source clause carry-forward](harness-workflow-source-clause-carry-forward.jsonl) — 非網羅追加索引source 108件、target draft 108件、successor 0件、decision 0件。本索引に無いことは非継承を意味しない
- [IR要求carry-forward](legacy-requirement-carry-forward.jsonl) — `51ae96d3fd27cc4aaa6e445c27ff0c6f175199cae09efe4e1566b73c1e8019b0`
- [confirmed文書identity carry-forward](legacy-confirmed-requirement-identity-carry-forward.jsonl) — `eadb6052cdc64c344e63bef4ed8c88f69b06fc6127f71f6d57b059f7cfbd18ed`
- [IR↔文書relation](legacy-ir-document-source-relation.jsonl) — `f7e713248c84ea53d50c96583f41fc827e0acf48ee98e13bc3967e78df12588f`
- [要求文書carry-forward](legacy-requirement-document-carry-forward.jsonl) — `bb4d12f3cfc9c1daefa064ede8bcc21943dd10df05098f423158fb5a08512490`
- [旧v1.3委任文書・意味relation closureのfile-blob holding](delegated-requirement-document-source-holding.jsonl) — `23d1df9c24b579c78c5836390d4c62c345e483eca42a9452742fad28d1e787fd`。114 file blob＋行保持3文書でclosure 117文書、atom化0、successor 0、decision 0
- [委任文書の参照候補holding](delegated-requirement-document-reference-holding.jsonl) — `627a764420d54dd13df0b340605c25b9f977d36a31954ead35a94cccba0e54f7`。frontmatter・本文参照788 edge、参照先241文書、分類待ちtarget 124文書、decision 0
- [Scrum Reverse source line台帳](scrum-reverse-source-line-carry-forward.jsonl) — `72428f6becffa5d931d2ea26f96408dec7e6e04a8b47869220a8c2f66070f1e9`。closure内3文書のうちfile blob台帳へ重複登録しない3文書を、原文300行と行digestで保持
- [archive隔離前revision差分](pre-isolation-revision-delta-source-holding.jsonl) — `d61a36db8e053d9006d11a09d1c60fd86413f32daa4a766aaeae2bc849130180`
- [IR対象routing queue](legacy-ir-target-routing-queue.jsonl) — 対象revisionのGit blobで固定する

## 判定規則

- successorを割り当てるには、対象product、successor ID、保持atom、未被覆atomを記録する。
- 一つの原要求を複数へ分割できるが、successorの合成で原意味を被覆できなければ`pending`を残す。
- 同名IDや意味類似を自動統合しない。重複候補として人間へ提示する。
- 意味変更、縮退、retireは対象revision付きの人間decisionがある行だけに適用する。
- Issue close、PR merge、CI、実装欠落、旧owner・旧技術との衝突から要求状態を変更しない。

## 未完了

- [semantic line全量保全inventory](legacy-requirement-semantic-line-inventory.md)に登録した未分類2,058行・[721 review unit](legacy-requirement-atomization-review-queue.jsonl)の要求atom化。source spanの全量登録と無損失な処理分割は完了したが、要求／制約／受入／根拠／例／navigationの分類とatom境界は未確定。
- `screen-mock-boundary.md`の監査基準`confirmed` revisionはfile blobのみ保持され、semantic line台帳とqueueには未登録である。隔離直前`draft` revisionだけで被覆済みにせず、基準revisionも行atom化して両revisionを照合する。
- [file-blob保全inventory](delegated-requirement-document-source-inventory.md)の意味relation closure 117文書を、対象文書ごとの要求整理PRで無損失atom化して管理層へ再登録する。file blobを一要求atomとして扱わない。
- [参照候補holding](delegated-requirement-document-reference-inventory.md)の分類待ちtarget 124文書を、要求意味、工程履歴、process、migration provenance、supporting sourceへ確認する。分類前に参照edgeまたはtarget blobを除外しない。
- 153 IRと175 source-qualified identityの意味重複候補の比較。
- [補助source 655 item](legacy-requirement-supplementary-source-inventory.md)と153 IR／175 identity／対象別L2・L11のrelation mapping。
- [旧candidate 92文書・4,755行](legacy-candidate-source-inventory.md)のatom化と、要求意味／受入／根拠／旧実現方式の分類。
- 各原要求のHARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSへのsuccessor割当。
- successorとL11受入の被覆確認、人間による意味変更・縮退候補の判断。
