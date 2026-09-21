# outside-67 67 path source_holding 提案

outside-67 reportの67 pathを、要求atomへ分解せず `path_revision_pair` としてsource_holding候補にまとめる静的提案です。各itemはpre-isolation commit `2d499104...` とarchive commit `064280b5...` のGit blob OID、SHA-256、bytes、同一／差異を保持します。

current captureは `3df81ad27157c471e004083783f37a5860eaa2ee` に固定しています。後続main（現時点の観測 `b27e61f079edf64eeddc43eb8095159b19730b94`）はこのcaptureの子孫ですが、候補のhistorical digestを保ったまま正式appendする前に、最新mainでread-afterとBinding upstreamを再baselineする必要があります。

- 67 path items
- archive blob同一 39件、差異 28件
- 13 live holdingへのpre-isolation blob/SHA一致 0件
- 66件はpath文字列も既存holdingに無く、1件（`docs/governance/l2-requirements-source-audit-2026-09-14.md`）だけ `MPR-SH-LEGACY-RULE-004` の `legacy_binding` にpath参照があります（item 6960）。これはblob/SHA包含ではないため、既存source_holdingへの包含完了とは扱いません。
- product／phase／implementationはoutside reportのpath候補メタデータを引用するだけでunknownを維持します。
- semantic disposition、requirement identity、successor、authorityは開始していません。

`proposed-register-record.json` はmanagement registerのappend-only record schemaに合わせた提案行です。source collection scopeは67件のpath revision pairであり、要求atomではありません。提案行の`source_atom_set_ref`は正式source set `docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl`、`coverage_receipt_ref`は正式receipt `docs/governance/audits/source-rebaseline/pre-isolation-outside-holding-67-coverage-receipt-2026-09-22.md`を指します。正式source setは候補mirror `scaffold/pre-isolation-outside-holding-67-proposal/source-items.jsonl`とbyte列・SHA-256が一致し、receiptは67件、39 same／28 changed、13 live holding、archive root 0、authority noneを固定します。正式docsが存在し、mirrorとbyte同一digestを再検証できることがappend前提です。register本体へのappendは実行していません。

appendを止めた理由は、現在のregister SHA `4e43fada...` を固定する既存成果物があるためです。appendするとregister digestが変わり、`phase-capability-inventory.json`、PHCAP-02/03、first15、delegated-doc003、unassessed-atomのhistorical capture/validatorとSCF-B-0027/0029/0034/0035のBindingがstaleまたは不一致になります。さらにfirst15 generatorはlive registerを再読し、13 holding captureを14 holdingとして再生成するため、過去の13 holding観測を上書きしてしまいます。#1975のSCF-B-0036 13-holding validatorも同じく、13 holdingのhistorical captureを先に固定する移行対象です。

必要な移行は、既存captureを3df81ad時点のregister snapshotへ固定して保存し、append後の14 holdingを別read-afterとして追加し、#1975の13-holding validatorを同じsnapshot入力へ切り替え、historical digestを改変せずに影響validatorとBindingを更新することです。今回の候補はこの移行を行わず、阻害条件を記録して停止しています。既存のhistorical digestを書き換えてappendを通すこと、またはfirst15／#1975の観測を14 holdingへ再生成して過去の13 holding観測を置換することは移行条件を満たしません。

一時 detached worktreeで候補register行をappendするprobeも実施しました。first15は `E_INVENTORY_NOT_REGENERATED`、PHCAP-02/03は `E_SOURCE_DIGEST:register`／`E_REGISTER_AUDIT`／`E_REGISTER_CANDIDATE`、delegated-doc003とunassessed-atomはregister digest不一致、候補自身は13 holding固定に対する `E_LIVE_HOLDINGS`／relation不一致となりました。`scfctl validate`はBinding形状だけなので通過しましたが、`scfctl stale`はSCF-B-0027/0029/0034/0035と新SCF-B-0038の5件をstaleとして検出しました。probe worktreeは破棄済みです。

旧archiveはGit objectの静的参照だけです。旧runtime・test・CI・hook・adapterは実行していません。

## 検証

```text
python3 scaffold/pre-isolation-outside-holding-67-proposal/generate.py
python3 scaffold/pre-isolation-outside-holding-67-proposal/validate.py
python3 scaffold/pre-isolation-outside-holding-67-proposal/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```
