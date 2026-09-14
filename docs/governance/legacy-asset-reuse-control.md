# 旧資産の完全一致再利用統制

status: draft_inventory
archive_population: 4020
source_manifest: `archive/legacy-generation-2026-09-14/MANIFEST.sha256`
asset_ledger: `docs/governance/legacy-asset-disposition.jsonl`

## 目的

変更不要な旧資産を再実装せず、archiveから安全にコピーして利用する。同時に、要求・責務・実行境界が変わる資産を
byte copyで現行化しない。archive manifestの全4020件を母集団とし、未判定資産を削除済み・不要・移管済みへ丸めない。
manifest entryは必ず資産明細台帳の個別行を持ち、初期dispositionを`unresolved`とする。台帳未記載は母集団からの除外では
なく、閉包違反として処理を停止する。

全entryは[資産明細台帳](legacy-asset-disposition.jsonl)にも1件1行で展開する。`asset_id`はsource pathのSHA-256先頭20桁から
決定的に生成し、path変更と採否変更を同じ操作にしない。初期値は`asset_class=Historical`、
`product_target=unresolved`、`disposition=unresolved`である。個別採否では該当行を新revisionとして更新し、source pathと
source digestを保持する。明細台帳の欠落、重複、manifestとのdigest不一致があればcopyや意味移管を停止する。

## archive内規則との優先関係

archive内READMEのcopy禁止は、旧世代snapshot自身が定めた既定規則として保持する。現行側で完全一致再利用を判断する
場合は本書を上位の統制とするが、例外にできるのは本書へ個別登録され、親要求と承認revisionを持つ非実行資産だけである。
旧CI／workflow、runtime／CLI、hook、adapter、AI instruction／prompt、実行設定は例外にできない。archive内READMEは
historical evidenceとして改変しない。

## disposition

| disposition | 意味 | 現行pathへのcopy |
|---|---|---|
| `verbatim_reuse` | 同じ意味・責務・interface・権利・security・consumer・実行境界で同一byteを使用する | 必須。source／target digest一致を確認する |
| `semantic_rederive` | 意味だけを採択し、新世代の要求・設計・oracle・実装へ降ろし直す | 禁止 |
| `replace` | 新世代で別の資産へ置換する | 禁止 |
| `retire` | consumer切替後に退役する | 禁止 |
| `archive_only` | 履歴・証拠としてのみ保全する | 禁止 |
| `reject` | 根拠付きで不採用とする | 禁止 |
| `unresolved` | 内容・consumer・権利・採否の確認が残る | 禁止 |

## 完全一致再利用の必須記録

`asset_id`、archive内source path、source SHA-256、現行target path、target SHA-256、製品owner、親要求ID、
採否revision、意味・interfaceの不変理由、consumer、実行性、権利、secret、外部作用、copy実施者・時点、read-after結果を
一組で記録する。旧CI／workflow、runtime／CLI、hook、adapter、AI instruction／prompt、実行設定は完全一致再利用の
対象外であり、他の記録が揃っても現行pathへcopyしない。credential参照、実行可能性、外部作用が判明した他資産も、
安全境界と個別要求が確定するまで`unresolved`とする。

## 現在の完全一致再利用

承認済み`verbatim_reuse`は0件である。manifest entry 4020件は資産明細台帳へ全件展開済みであり、現在の
`disposition`はすべて`unresolved`である。

現行`LICENSE`とarchive内の監査用写し
`archive/legacy-generation-2026-09-14/root/docs/archive/cross-system-audit-2026-09-05/source/upstream_license.txt`は
SHA-256 `1ec00bbf092b28cae28750fb6c8cd02f2cd0999ee4d4c96d1279e09b15345796`で一致する。ただし`LICENSE`は隔離対象
manifestのentryではなく、Git履歴上もarchiveから作成されたことを証明できないため、copy実績や`verbatim_reuse`として
登録しない。これは「隔離対象外の現行fileとarchive内の写しが同内容」という観測だけであり、license変更や将来契約の
承認を生成しない。

## 要求欠落を防ぐ閉包

要求を保持しているかの判定は、現行L2件数ではなく次の閉包で行う。

1. manifest全4020件が資産台帳のdispositionへ対応する。
2. Concept、要求、候補、IR、設計、test、runtimeに含まれるbehavior atomが、対象別L2／L11、明示的不採用判断、
   または`unresolved`へ一度だけ接続される。
3. `semantic_rederive`は親要求、pair、replacement、consumer切替を持つ。
4. `verbatim_reuse`は本書の必須記録とcopy後read-afterを持つ。
5. `retire`／`reject`は失われる利用者価値とconsumerがない根拠を持つ。

現在は主要要求源の分類と対象別L2への接続が進んでいるが、全4020件のatom閉包は未完である。したがって、要求原文は
失われていないが、要求移管完了はまだ主張しない。
