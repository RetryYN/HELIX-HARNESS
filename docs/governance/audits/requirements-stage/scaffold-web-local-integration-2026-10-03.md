# Scaffold研究束とWeb候補のlocal統合監査（2026-10-03）

## 対象と状態

この時点監査は、Web候補 `596089b85bd8c26ae95a97d973e10c5b91f4b7e9` と研究配置整理 `897c96151edb0be2cd7af30979ee33add6405130` をlocal統合した `401cd9880181fa1c71af7f053563b0efe183457f` のread-afterを記録する。統合commitのparentsは `897c96151edb0be2cd7af30979ee33add6405130` と `596089b85bd8c26ae95a97d973e10c5b91f4b7e9`。Web PR #2558 はClaude独立reviewと正式merge待ちであり、このbranch/記録は準備中のlocal成果で、formal mainの更新、要求承認、artifact authority、retirementを生まない。

## D0の構造判断

140件の研究・監査束を `scaffold/research/<bundle>/` にまとめた。Binding、schema、tools、checks、evidence、external-references、governance、review-handoff（ignored `local/` を含む）は機構境界・位置を維持し、研究validator/generatorを `docs/` へ昇格していない。既存 `scfctl` の `kind=scaffold`、`evidence_kind=scaffold`、scaffold外書込禁止を維持し、新alias・symlink・承認機構を追加していない。

Bindingの `artifacts[]` は研究束にある仮artifact locatorであり、formal consumer locatorやformal registryではない。Bindingのrole、obligation、consumer、oracle、negative control、state等の意味やauthorityは生成・変更しない。#2555時点の撤去適格0を維持し、研究実績の完了だけでretireしない。

この配置判断は、旧repository structureが規則・設計とresearchを役割別に置いた配置意図、旧HIL-FR-53がrequirementsに対するacceptance test designを必要とした点、RG14-009の旧規則原文、および研究資産の実配置を照合した結果である。旧 `repository-structure.md` は `LEGACY-ASSET-FDBA655B1CFF75DCDC0E`、実読SHA-256 `6f8ee784049d03279641151714c3572656eb20c64cfb769853b6e885abf4f262`（57–77、85–90、99–100、112–120行）。旧research文書 `canonical-document-export-research-2026-06-09.md` は `LEGACY-ASSET-D3D07F92587792398436`、実読SHA-256 `664863eacc9b697272f5e577b2651689195275c0023afdba9cb8caf31249897f`（全文）。旧L3要件 `infinity-loop-functional-requirements.md` の53行（HR-FR-HIL-19にHIL-FR-53を含む）は `LEGACY-ASSET-C7F0C3B79CBAA72960BF`、実読SHA-256 `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`。各asset/path/行と実読SHAは監査JSONにも保持する。資産明細台帳の該当行はJSONの `legacy_asset_disposition_read_after` にある。旧repository structure:99–100を記録したRG14-009（rule atom台帳7034行。台帳全体の実読SHA-256 `97a9e0a4cfd5999f5178ec13f758ef71c334191aac51ed43c3bb9570bd762784`）は出典として保持し、ユーザー指示にある「最初の文書と同時」の条件を超えるfreeze gateへ転用しない。資産明細台帳は全体を実読し、SHA-256 `cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c`。

## 1,198ファイルの対応と履歴保持

`scaffold/<bundle>/` から `scaffold/research/<bundle>/` へ140 rootsを移した。596のsource treeから401のtarget treeまで1,198件すべてのpathとSHA-256を監査JSONの `file_mapping.files` に列挙し、各行に7b時点SHA、596 source SHA、401 target SHA、byte countを記録する。source blobを `git show 596089b85bd8c26ae95a97d973e10c5b91f4b7e9:<旧path>` で再読hashし、target worktree実bytesと照合したうえで、rootのGit blob inventory（`/tmp/l3-d0-root-scaffold-web1198-sha-check.json`）全行と一致を確認した。結果は596→401で同一bytes 932、変更266、変更はすべてPython、非Python変更0、missing 0。旧7b時点監査の932/266やvalidator 82/55をこの比較の代用にはしていない。

固定history/source/snapshot/output evidence、JSON/JSONLの過去locator、receipt、reason/noteの履歴文言、`git show` の旧commit/pathは時点記録として保持する。current physical readersとcurrent pinsのみ新pathへ追随した。旧7b時点の `scaffold-research-layout-move-2026-10-03.{md,json}` は不変のまま残す。

## Binding・統合read-after

rootのwhole-field照合は143 Binding、meaning field diff 0、current pins 4,005、current SHA error 0。登録JSONLは1,075行で全bytes一致、SHA-256 `520216521f09b7a9bc77a8c9b9a7d7a836f9ff457bfebcbd6560f17700eee5de`。Binding locator/current pin追随以外のrole・義務・consumer・oracle・negative controls・reason/note履歴は変更していない。rootの統合照合証拠 `/tmp/l3-d0-root-web-scaffold-local-integration-check.json` の値を本JSONへ転記した。

Pythonの共有ファイル39件は統合manifest hash/parse failure 0。`scfctl validate` は143件・fail 0、`stale=0`、`residuals=0`。この静的read-afterは研究束の実行結果や要件採択を意味しない。最終137 validator suiteは未実施で、#2558が正式統合されformal base確定後にexact HEADで実行する。archive runtime・旧testsは実行していない。

## 追跡

完全なroot/path/old-new SHA対応表・140 roots/tree OID・source証拠・Binding/read-after数値は同梱JSONを正とする。JSONは `/tmp` のみを根拠にせず検収可能な値をこの時点記録に含む。
