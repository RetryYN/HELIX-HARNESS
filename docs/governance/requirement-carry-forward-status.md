# 旧要求carry-forward管理状況

status: active_management_view
as_of: 2026-09-15
authority: machine ledgers linked below

## 現在値

| 管理集合 | 総数 | successor割当済み | `preserved_pending_rehome` | 意味変更 | retire |
|---|---:|---:|---:|---:|---:|
| Requirement IR | 153 | 0 | 153 | 0 | 0 |
| confirmed文書の明示identity | 175 | 0 | 175 | 0 | 0 |

現時点ではsuccessor割当済みは0件である。37件の対象別L2はrouting containerであり、この表のsuccessorへ自動算入しない。
要求の再配置が始まっていないことを、要求削減や移管完了として表示しない。

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
partitionは後続要求PRの作業単位であり、successorや承認状態ではない。

## 元statusの保持

22要求文書は`confirmed` 17件、`draft` 3件、`proposed` 1件、`placeholder` 1件である。`confirmed`は採用済みのまま保持し、新世代化を理由にcandidateへ降格しない。

## 機械台帳

- [IR要求carry-forward](legacy-requirement-carry-forward.jsonl) — `51ae96d3fd27cc4aaa6e445c27ff0c6f175199cae09efe4e1566b73c1e8019b0`
- [confirmed文書identity carry-forward](legacy-confirmed-requirement-identity-carry-forward.jsonl) — `eadb6052cdc64c344e63bef4ed8c88f69b06fc6127f71f6d57b059f7cfbd18ed`
- [IR↔文書relation](legacy-ir-document-source-relation.jsonl) — `f7e713248c84ea53d50c96583f41fc827e0acf48ee98e13bc3967e78df12588f`
- [要求文書carry-forward](legacy-requirement-document-carry-forward.jsonl) — `acf3bf6ceb4bab0a6a0d63e0b9d1abb3b033302c7fc8ddbe20123d48732e0af3`
- [IR対象routing queue](legacy-ir-target-routing-queue.jsonl) — 対象revisionのGit blobで固定する

## 判定規則

- successorを割り当てるには、対象product、successor ID、保持atom、未被覆atomを記録する。
- 一つの原要求を複数へ分割できるが、successorの合成で原意味を被覆できなければ`pending`を残す。
- 同名IDや意味類似を自動統合しない。重複候補として人間へ提示する。
- 意味変更、縮退、retireは対象revision付きの人間decisionがある行だけに適用する。
- Issue close、PR merge、CI、実装欠落、旧owner・旧技術との衝突から要求状態を変更しない。

## 未完了

- confirmed文書内の明示IDを持たない段落条件・技術要求節のatom台帳化。
- 153 IRと175 source-qualified identityの意味重複候補の比較。
- 各原要求のHARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSへのsuccessor割当。
- successorとL11受入の被覆確認、人間による意味変更・縮退候補の判断。
