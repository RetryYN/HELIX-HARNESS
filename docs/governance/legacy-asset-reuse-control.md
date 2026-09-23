# 旧資産の完全一致再利用統制

status: draft_inventory
archive_population: 4020
source_manifest: `archive/legacy-generation-2026-09-14/MANIFEST.sha256`
asset_ledger: `docs/governance/legacy-asset-disposition.jsonl`
decision_log_contract: `docs/governance/legacy-asset-decision-log.md`
decision_log_data: `docs/governance/legacy-asset-decisions.jsonl`
copy_read_after_data: `docs/governance/legacy-asset-copy-read-after.jsonl`

## 目的

変更不要な旧資産を再実装せず、archiveから安全にコピーして利用する。同時に、要求・責務・実行境界が変わる資産を
byte copyで現行化しない。archive manifestの全4020件を母集団とし、未判定資産を削除済み・不要・移管済みへ丸めない。
manifest entryは必ず資産明細台帳の個別行を持ち、初期dispositionを`unresolved`とする。台帳未記載は母集団からの除外では
なく、閉包違反として処理を停止する。

この全件対応はarchiveカタログの完全性であり、要求の意味判定やRDPの入力母集団ではない。要求の再構成では、対象となる
旧source・crosswalk・参照先を`asset_id`または`source_path`で必要に応じて照会し、関連する資産を見落とさずに静的確認する。
関連資産の未確認・未分類は`unresolved`として扱う。要求判断の前提として、全4,020件を意味・製品・consumer・実装の観点で
事前分類する必要はない。個別資産の再利用を検討するときは、選択した資産について本書と判断ログ契約に従い採否を決める。

全entryは[資産明細台帳](legacy-asset-disposition.jsonl)にも1件1行で展開する。`asset_id`はsource pathのSHA-256先頭20桁から
決定的に生成し、path変更と採否変更を同じ操作にしない。初期値は`revision=1`、`asset_class=Historical`、
`product_target=unresolved`、`disposition=unresolved`である。明細台帳は機械照会用であり、AIの全文startup readにしない。
個別採否では行の`revision`を進め、source path／digestを保持し、`decision_record_ref`でappend-only判断記録へ接続する。
明細台帳の欠落、重複、manifestとのdigest不一致、revisionの非単調更新があればcopyや意味移管を停止する。

各行は、親要求とpair、製品owner、approval revision、target path／digest、意味・interfaceの不変理由、consumer、権利、
実行性、secret、外部作用、判断者・時点、copy実施者・時点、read-after記録の欄を持つ。未確認値は空欄または
`unreviewed`として保持し、推測で埋めない。`reuse_exclusion_class`が非nullの行へ`verbatim_reuse`を設定してはならない。
このclassはpath規則による一次停止分類であり、旧runtimeからの参照閉包や内容分類の完了を表さない。nullは「未分類」であり、
copy許可ではない。内容監査でclassを確定し、その変更前後をappend-only判断ログへ記録するまで個別採否を停止する。

一次初期化はactive時に実行・判断へ作用したことをpathだけで判別できるsurfaceと、そのarchive内template／evidenceを対象にする。具体的には`.claude`、
`.codex`、`.cursor`、`.helix`、`.github/workflows`／`scripts`／work item template、`src`、`scripts`、`config`、`tests`、
`docs/test-design`、`docs/templates/github`、`docs/templates/adapter`、`docs/plans`、path内`evidence`／
`gate-evidence-manifests`、root AI instruction／build・test設定、実行可能拡張子を非nullへする。これは参照閉包ではないため、
`docs/governance`／`docs/design`内registry、`docs/skills`、`docs/process`等にはnullが残り得る。null行は内容監査前に
`verbatim_reuse`候補へ進めない。用途を混在させず、AI instructionとbuild／test設定は別classにする。個別判断の記録形式と追記規則は
[判断ログ契約](legacy-asset-decision-log.md)を正本とする。

## archive内規則との優先関係

archive内READMEのcopy禁止は、旧世代snapshot自身が定めた既定規則として保持する。現行側で完全一致再利用を判断する
場合は本書を上位の統制とする。`verbatim_reuse`の例外は個別登録、親要求、承認revisionを持つ非実行資産に限る。要求欠落防止の`source_snapshot_preservation`は承認revision前でも非実行・read-only・非authorityの物理保全copyだけを許し、配置判断を`pending_human_confirmation`に保つ。
旧CI／workflow、runtime／CLI、hook、adapter、AI instruction／prompt、実行設定は例外にできない。archive内READMEは
historical evidenceとして改変しない。

## disposition

| disposition | 意味 | 現行pathへのcopy |
|---|---|---|
| `source_snapshot_preservation` | 要求を欠落なく再整理するための非実行・read-only・非authority source snapshot。新世代実装やoracleとして再利用しない | 必須。source／target digest一致とcopy read-afterを記録する |
| `verbatim_reuse` | 同じ意味・責務・interface・権利・security・consumer・実行境界で同一byteを使用する | 必須。source／target digest一致を確認する |
| `semantic_rederive` | 意味だけを採択し、新世代の要求・設計・oracle・実装へ降ろし直す | 禁止 |
| `replace` | 新世代で別の資産へ置換する | 禁止 |
| `retire` | consumer切替後に退役する | 禁止 |
| `archive_only` | 履歴・証拠としてのみ保全する | 禁止 |
| `reject` | 根拠付きで不採用とする | 禁止 |
| `unresolved` | 内容・consumer・権利・採否の確認が残る | 禁止 |

## 完全一致再利用の必須記録

`asset_id`、行revision、archive内source path、source SHA-256、現行target path、target SHA-256、製品owner、親要求ID、
採否revision、判断記録、意味・interfaceの不変理由、consumer、実行性、権利、secret、外部作用、copy実施者・時点、
read-after結果を一組で記録する。旧CI／workflow、runtime／CLI、hook、adapter、AI instruction／prompt、実行設定、
旧test／fixture／oracle、旧runtime state／evidenceは完全一致再利用の対象外であり、他の記録が揃っても現行pathへcopyしない。
credential参照、実行可能性、外部作用が判明した他資産も、安全境界と個別要求が確定するまで`unresolved`とする。

## 現在の完全一致再利用

承認済み`verbatim_reuse`は0件である。要求source 29件だけは、POの要求保全指示をproposal根拠とする`source_snapshot_preservation`としてcopy read-afterを記録し、個別配置判断は`pending_human_confirmation`に保つ。誤ってPO判断済みとしたrevision 2判断行は削除せず、revision 3の訂正行で取り消した。これは完全一致再利用、要求採用、新世代authorityへの昇格ではない。残る3,991件は`unresolved`である。

現行`LICENSE`とarchive内の監査用写し
`archive/legacy-generation-2026-09-14/root/docs/archive/cross-system-audit-2026-09-05/source/upstream_license.txt`は
SHA-256 `1ec00bbf092b28cae28750fb6c8cd02f2cd0999ee4d4c96d1279e09b15345796`で一致する。ただし`LICENSE`は隔離対象
manifestのentryではなく、Git履歴上もarchiveから作成されたことを証明できないため、copy実績や`verbatim_reuse`として
登録しない。これは「隔離対象外の現行fileとarchive内の写しが同内容」という観測だけであり、license変更や将来契約の
承認を生成しない。

## 資産カタログの完全性

archive manifest全4,020件が資産明細台帳の個別行とdispositionへ対応することを、資産カタログの完全性として維持する。
未判定行を含むこの対応関係は、個別資産の意味・製品・consumer・実装分析が全件完了したことを意味しない。また、要求移管の
完了条件やRDPの要求分母ではない。

## 要求sourceの閉包と個別資産判断

要求を保持しているかは、現行L2件数ではなく、[要否・再配置review program](requirement-disposition-review-program.md)が定める
生存中のsource holdingと、そこから展開する要求atomの閉包で判定する。archive内資産の全件semantic atom化を先行条件にしない。
要求の再構成で参照すべき旧source・crosswalk・consumer関係が判明した場合は、上記のとおり台帳から該当資産を照会して読む。
該当sourceの未確認・未分類は`unresolved`として保持し、既知の関連sourceを参照しないまま要求意味を確定しない。

この要求source閉包とは別に、個別資産を再利用する判断では次を満たす。

1. `semantic_rederive`は親要求、pair、replacement、consumer切替を持つ。
2. `verbatim_reuse`は本書の必須記録とcopy後read-afterを持つ。
3. `retire`／`reject`は失われる利用者価値とconsumerがない根拠を持つ。

現在は主要要求源の分類と対象別L2への接続が進んでいるが、RDPの生存中source holding全体のatom閉包は未完である。
したがって、要求原文は失われていないが、要求移管完了はまだ主張しない。
