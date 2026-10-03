# OUTSIDE67 current reader locator closure（2026-10-04）

## 目的と範囲

L3-D0で移動済みのOUTSIDE67研究束について、現在のsource holdingに残った2つのevidence locatorを`scaffold/research/`へ追随させ、registerのcurrent SHAを参照する研究用Bindingを閉じた。対象は`MPR-SH-OUTSIDE67-002`の訂正追補`MPR-SH-OUTSIDE67-003`（register line 1076）と、current register SHAを読む19件のBindingである。要求atom、意味分類、採否、担当、製品、phase authority、実装許可、formal successorは生成しない。

## 起点と現在の参照

既存の配置判断・移動対応は[2026-10-03 scaffold/research layout audit](../requirements-stage/scaffold-research-layout-move-2026-10-03.json)に記録されている。旧source holdingは67件の`path_revision_pair`を保全し、source集合 `docs/governance/legacy-migration/pre-isolation/pre-isolation-outside-holding-67-source-holding.jsonl`（digest `sha256:d703c9bc47f95143f6b010eebf7fead4e14402c1be26ef716b2e16f0bd2cec54`、count 67）とcoverage receipt `docs/governance/audits/source-rebaseline/pre-isolation-outside-holding-67-coverage-receipt-2026-09-22.md`を参照する。物理移動先は`scaffold/research/pre-isolation-outside-holding-67-migration/`。README SHA-256 `24137779f3461483174a8060a07a8462e522e82a92d0240ffcbe73bfe4ecd288`、read-after SHA-256 `05e0ccf553268696d58478920d1402b305a4d6042dc2f2f95687b847e7755df0`。

既存配置auditが記録したregister SHA `f791d0570911125141cf7f882780926f73b4122ccec2703cc6709cb2225fde06` は移動時点のhistorical captureで、今回追記より前である。したがって旧監査はその時点の記録として不変に保ち、現在のregister bytesの説明と区別する。current base `fb9de1195e614f55364e4e5c46f510fb0b274e61` のregister SHA `520216521f09b7a9bc77a8c9b9a7d7a836f9ff457bfebcbd6560f17700eee5de`（3,365,111 bytes）をprefixとして保ち、`MPR-SH-OUTSIDE67-003`を1行追記した。現在のregister SHAは`afa5554face189bd0048fc0f569d08745e553f59f226687c59055bfc6edbdef7`（3,367,544 bytes）。append-only checkerはPASSした。

## 意味とBindingの保持

新行は`-002`をsupersedeする。更新fieldはID・supersedes、actor/time、evidence_refsの2 path、訂正理由に限り、source集合、digest/count/scope、状態、担当・disposition、authority等の意味fieldは同一である。新行も`registered_source_holding`／`authority_effect: none`を保ち、採択やsuccessorを主張しない。47 live source holdingのsource set、receipt、evidence_refs計191件のローカルlocatorを照合し、missing 0件を確認した（外部URLは別集計）。歴史snapshot、旧行、coverage receipt、既存移動auditは変更していない。SHA一覧は同梱JSONにある。

全143 Bindingを親commitと比較した。19件では該当upstream register SHAのleafだけを`520216521f09b7a9bc77a8c9b9a7d7a836f9ff457bfebcbd6560f17700eee5de`から`afa5554face189bd0048fc0f569d08745e553f59f226687c59055bfc6edbdef7`へ更新し、他の124件はbytes不変。全143件でその他のfield/意味差分は0。19件それぞれの旧新blob SHAは同梱JSONに記録した。

## 検証

- register append checker: PASS（base prefix一致、suffix 1行）。
- `python3 scaffold/tools/scfctl.py validate`: 143 bindings、fail 0。`stale`: 0、`residuals`: 0。
- exact tested HEAD `70b04b870387a8ae6f5e736fc472b539943d693b` で研究用validator 137件を実行し、82 pass／55 fail／timeout 0。完全な基準実行は`fff122ada2eccddee11a5738512e2f3c4d8d48fe`の82/55。基準は既存[公開前検証](../requirements-stage/scaffold-research-publication-validation-2026-10-04.md)（JSON SHAと時点register状態は同梱JSONに記録）に保存される。そこでの「register全bytesがbaseと同一」は`fff122`時点の記録である。本fix commitで1行追記した現在の状態は本監査のregister節に別途記録し、旧記録は変更していない。基準実行後の`fb9de1195e614f55364e4e5c46f510fb0b274e61`までの差分は既存公開記録2ファイルのみ。今回の137実行後に追加するのも本監査のMD/JSONだけで、validator、code、schema、main entry、scaffold input、Binding、register bytesは変えていない。
- 137 validatorごとのexit code、stdout/stderr（worktree path正規化後）を比較し、exit差分0、診断差分0、新規fail 0。詳細・全結果は同梱JSONに含む。

旧archive runtime/test/CIおよび旧HELIX CLIは実行していない。
