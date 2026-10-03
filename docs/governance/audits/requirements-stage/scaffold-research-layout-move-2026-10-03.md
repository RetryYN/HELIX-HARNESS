# Scaffold研究束の配置整理（2026-10-03）

## 結果

旧HELIX再構築の研究・監査束140ディレクトリを `scaffold/<束>/` から `scaffold/research/<束>/` へまとめた。Binding、schema、tools、checks、evidence、external-references、governance、review-handoff（localを含む）などの現行機構境界は移動していない。研究束内のvalidator・generatorは引き続き研究用の仮成果を検査・生成し、scaffold外への書込み権限は追加していない。Binding内のartifact locatorは正式consumerやauthorityではなく、研究成果の仮locatorとして扱う。

移動は1,198 tracked files。base `7b3001ea516dd880964480ec1082936723a5dd37` と比較し、932ファイルはbytes完全一致、変更266ファイルはすべてPythonで、移動後のroot算出とcurrent物理読取locatorの追随に限る。missing file 0、旧rootを指すcurrent物理path残留0。固定snapshot/output evidenceは全件bytes一致で保持した。Markdownの相対リンクはリンクtokenだけを深さに合わせ、非リンク本文を変えていない。旧commitを指定する `git show` の履歴locatorは書き換えていない。

## 旧sourceとの対応と判断

旧HELIXのrepository-structure、HIL-FR-53、RG14-009、および旧資産明細から確認した研究・監査束の役割を保持し、置き場所だけをscaffold内の `research/` に集約した。根拠は `archive/legacy-generation-2026-09-14/root/docs/governance/repository-structure.md`（asset `LEGACY-ASSET-FDBA655B1CFF75DCDC0E`、SHA-256 `6f8ee784049d03279641151714c3572656eb20c64cfb769853b6e885abf4f262`、57–77行と85–90・112–120行）、同 `docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:53`（asset `LEGACY-ASSET-C7F0C3B79CBAA72960BF`、SHA-256 `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`、HIL-FR-53を含むHR-FR-HIL-19）、および現行の旧rule atom台帳 `docs/governance/legacy-migration/rule-atom/legacy-rule-atom-inventory.jsonl:7034`（RG14-009。出典は旧repository-structure.md:99–100）である。143 Bindingの区分、候補配置比較、140 rootの移動対応・base tree OID、1,198ファイルのbase SHAとroot式/consumer追随候補は、この監査JSONの`source_references`、`move_roots`、`move_files_before_sha`に同梱した。RG14-009を現行の追加gateへ転用せず、現在のゴールどおり最初の文書と同時にdirectoryを用意する。#2555時点で撤去適格0という判定は維持し、研究実績を理由にretireしていない。validator群をdocsへ昇格せず、研究用実行束をscaffold内に留めた。

## locator・Bindingの追随

現行のphysical readerだけを新pathへ追随させ、履歴capture、固定source snapshot、JSON/JSONLの過去locatorは保持した。repo-root算出は、実際に `__file__` またはbundle directoryを起点とする式だけを新しい深さに合わせ、repository rootの解決結果が移動前後で同じことを静的に確認した。Binding 143件の意味field（role、obligations、state、consumer、oracle、negative controls、replacementを含む）はbaseと照合して不変。Bindingの旧時点説明・reason中に残る履歴path tokenはbase bytesのまま保持し、差分はcurrent path locatorと対応するcurrent SHA/byte pinだけにした。更新したvalidator自身のcurrent SHA pinは次のとおり。

| Binding | current validator path | SHA-256（旧 → 新） |
| --- | --- | --- |
| SCF-B-0036 | `scaffold/research/pre-isolation-outside-l1-semantic/validate.py` | `4d07b774bf2120d86facdce1334af5d92840260c59a892f77a98b1f5b01c7ec8` → `9cf05b5c22d42eb039bf0b33e5c232ed04fe0f464a3561c8d655d5861952ade4` |
| SCF-B-0062 | `scaffold/research/rdp001-outside67-product-boundary-062/validate.py` | `656d82f97e2254e0d5a1c23524348cb4075e327e3a377552607e4426f96a8c97` → `2f3900f8e7f9f60d523ebce2da7a02d413240bbf23585c91e9ade51afc09cf44` |
| SCF-B-0066 | `scaffold/research/rdp001-outside67-boundary-evidence-066/validate.py` | `211e24e9a88fa060c0dabc9e3858e3d7e70165d4043c9538b298702a89ae06a1` → `b2526b75fb46c8eaeb5c125fd39adfa4f9dc7050f6f74741c1ad95b23e06d5ef` |
| SCF-B-0091 | `scaffold/research/rdp001-web-webos-vision-coverage-0091/validate.py` | `e076eb717ef227a816c66af17b22fcb1b607e23938b8a6c56010fc05f2ef812a` → `d6d68b1f8939150671ea331feb610e64b797e7ca89ba806023e52f7bb0b91865` |
| SCF-B-0148 | `scaffold/research/legacy-test-design-worker-workflow-0148/validate.py` | `94b06665b187147a718a6651bec43b3f34949eb0d00c0e02fe1a29411a3c8db3` → `7aa79311edd1eb8ca358783e973f41e386f24a6f20fc989a938b0cb994fb0f15` |
| SCF-B-0048 | `scaffold/research/rdp001-delegated-doc002-semantic-atom-048/validate.py` | `b15edd47041f2c9fd01a6d8f3107b287ecd237bc9ad5b45612fc3a6e73667b87` → `3da299dd9978d353fef16b35955c9705775fbd3b4be0de5090b8163ad23f9489` |

旧/new full path・SHAの全対応表は `/tmp/l3-d0-current-upstream-repin-map.json` および `/tmp/l3-d0-final-validator-pin-updates.json` にあり、merge後に統合baseで再生成・再照合する。新しいalias、symlink、承認・登録機構は加えていない。

研究束 `rdp001-delegated-doc002-semantic-atom-048` の固定inventoryは `existing_candidate_connection.binding_sha256` としてSCF-B-0010のSHA `bf507584bc2ac470caff9e3a41072c8b9cd87fdd7ba92040d0fc00ac83c5d816` を保持する。実際に `git show 7b3001ea516dd880964480ec1082936723a5dd37:scaffold/bindings/SCF-B-0010.json` を成功（return code 0）させて読んだ31,765 bytesのSHAと一致し、同じ時点記録は148c033でも同一bytesである。移動branchでcurrent Bindingはlocator変更後の31,873 bytes、SHA `4e7cc967247d7b0b7c3544732730878bbdfb7d548f3f488b90380e668b72283e` となるため、固定inventoryは履歴比較のまま保持した。validatorはgit objectの存在を明示確認し、現行Bindingのschema/current-pin妥当性は `scfctl validate` と `stale` が確認する。これはinventory生成時commitの主張ではなく、移動直前baselineで固定SHA一致を実測した記録である。

## 静的検証

base 7bの137 validator結果（82成功/55失敗）と移動後結果（82成功/55失敗、timeout 0）を比較した。個別pathを対応づけ、絶対worktree pathと移動root表記を正規化して、exitと診断行（error code、例外、missing path、FAIL/AssertionError）を比較し、exit差0・診断追加0・減少0だった。55件の既存失敗を無関係に修正していない。比較結果は `/tmp/l3-d0-validator-before-7b300.json`、`/tmp/l3-d0-validator-after-final.json` に保存した。

current `scfctl` の結果は `validate` が143 Binding・fail 0、`stale` 0、`residuals` 0。これは研究validator実行の成功を意味上の採択・authorityへ変換しない。比較baseがWeb統合前の7bであるため、統合後は新しいexact base上でlocator/pin/validator検証を再実施する。
