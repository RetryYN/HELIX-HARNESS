# 旧資産の完全一致再利用統制

status: active_inventory
archive_population: 4020
source_manifest: `archive/legacy-generation-2026-09-14/MANIFEST.sha256`

## 目的

変更不要な旧資産を再実装せず、archiveから安全にコピーして利用する。同時に、要求・責務・実行境界が変わる資産を
byte copyで現行化しない。archive manifestの全4020件を母集団とし、未判定資産を削除済み・不要・移管済みへ丸めない。
本書で個別行を持たないmanifest entryの既定dispositionは`unresolved`とする。したがって台帳未記載は母集団からの除外を
意味しない。

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
一組で記録する。対象が実行可能、設定、prompt、workflow、hook、credential参照を含む場合は、digest一致だけで適格にしない。

## 現在の完全一致再利用

| asset_id | archive source | source SHA-256 | current target | target SHA-256 | owner／親要求 | 判定 |
|---|---|---|---|---|---|---|
| `LEGACY-REUSE-0001` | `archive/legacy-generation-2026-09-14/root/docs/archive/cross-system-audit-2026-09-05/source/upstream_license.txt` | `1ec00bbf092b28cae28750fb6c8cd02f2cd0999ee4d4c96d1279e09b15345796` | `LICENSE` | `1ec00bbf092b28cae28750fb6c8cd02f2cd0999ee4d4c96d1279e09b15345796` | HARNESS／HARNESS-L2-006 | `verbatim_reuse`。MIT本文とRetryYN著作権表示が同一で、実行性・secret・外部作用なし。現行の商用条件候補は未決のため、このlicenseを将来契約の承認へ転用しない |

`LICENSE`は2026-09-15にarchive sourceから現行pathへcopyし、同一SHA-256をread-afterした。これ以外の
archive資産は本日時点で`verbatim_reuse`承認済みではない。旧CI、runtime、test、prompt、設定、設計、要求は、対象別要求と
consumer closureの確認が終わるまで`semantic_rederive`または`unresolved`として扱う。

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
