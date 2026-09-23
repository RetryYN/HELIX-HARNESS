# SCF-B-0148 旧test-design worker/workflow 初回52件の責務・phase静的分類候補

この束は、base `8a9fdc973f3553bea78d022e8d73f109aca526da` の `legacy-asset-phase-product-classification-bootstrap.jsonl` から、次の全条件に一致する資産を独立に再導出した研究候補である。

- `source_path` が `docs/test-design/helix/` 配下
- `candidate_phase_targets` が `PHCAP-07` を含む
- basename に `worker` または `workflow` を含む

選択集合は52件（worker 27件、workflow 25件）、asset ID・source pathとも52件が一意である。各archive sourceの固定BASE Git blob、byte数、SHA-256を照合し、test-design frontmatterが示す親 `pair_artifact`／`parent_design`／`authority` を静的に読んで結び直した。親pairは50件。sourceの全記述を採択したとは主張せず、各レコードに意味を示す選択spanと親pair参照を残す。

## 責務候補

各assetごとに最初の実義務／反例行と親pairの内容を見て候補を分けた。45件は一製品の直接候補（HARNESS 3、OS 42）、5件はworkflow意味契約と実行／projection境界のsplit候補（HARNESS+OS）、2件は選択spanだけでは製品根拠が不足するため候補なしとした。OS候補は、Worker authority/isolation/admission等、またはCLI/GitHub/PLAN/DB/registry/execution/routingの具体的実行・統制spanがある場合に限定した。HARNESS候補はworkflow envelope/interviewの意味契約、またはsplit対象のnormative workflow semanticsにspanと親pairが直接触れる場合に限定した。どの候補も正式ownerとして採択していない。

HELIX-Web／HELIX-Web-OSを含む4製品を確認対象に置いた。52件の選択spanと親pairにはWeb利用者向けConnector SaaS体験や展開後のtenant/service運転を直接支える候補根拠が見つからなかったため、`not_assessed_no_direct_support_in_selected_span` とした。これは反証の発見や永久的な非適用判断ではなく、consumer closure等を含む未調査境界である。

bootstrapの `candidate_product_targets` は横に保持する比較列で、根拠や採択としては使わない。空またはHELIX-OS候補のassetも同じ条件でspanを確認し、直接根拠を得られない文書は `insufficient_direct_basis` として保留する。親pairの `responsibility_owner` や歴史的frontmatterも新世代ownerへ昇格させない。

## Phase、実装、failure、consumer

52件すべての `PHCAP-07` は候補のまま、phase admissionは未実施である。`PHCAP-10`（Worker実行）、`PHCAP-12`（Review convergence）、`PHCAP-03`（要求分類）、`PHCAP-17`（Incident）、`PHCAP-20`（Memory／継続再構成）が元ledgerにあるassetでは追加候補として保持した。L8/L9/L10のsource layer、親pairの意味、test-design本文から複数候補を再検討する。`phase-capability-inventory.md` のPHCAP-wide状態は文脈証拠に分け、個別assetの実装・縮退証拠に転用しない。

bootstrapは全52件を `test_design_present_unexecuted`、legacy implementation status `unknown`、consumer closure `pending`、consumer refs空としている。本束もその区別を保つ。文書frontmatterの `confirmed`／`draft` は文書状態だけで、実装、test source存在、test実行、pass、受入を示さない。test pathの引用はconsumer関係を確定しない。testは実行していない。

テスト設計に書かれた反例は「設計されたfailure観測候補」であり、過去に実際に発生したfailureの記録ではない。個別未実装、縮退、実行証拠、failure履歴、runtime consumerは対象source一式の追加調査とconsumer closureまで `unknown`／`pending` とした。PHCAP-wideの縮退評価も個別assetに結びつけない。

## 重複と分母

初回選択BASEは `8a9fdc973f3553bea78d022e8d73f109aca526da`。作業中に#2094がmergeされたため、排他照合を現main `a577a7cddd1405de27bf01d22b050eb2acaa9ba9` に更新した。現main609件（#2094の72件を含む）、0148の52件とのID/path/SHA重複は0件。open PR比較から#2094を外し、#2096 HEAD `ab0a1faa4e2b310206b97a786c329334a2a0e151` の57件と#2097 HEAD `d233e6e99f705439043a07f0a96bdd9e535a288a` の8件を静的Git objectとして比較し、ID/path/SHA重複は各0件・集計0件。現main609件、open PR65件、0148の52件は候補分類の比較分母であり、正式分類や完了を示さない。

より広いworker/workflow調査分母208件のうち、今回52件を記録し、残り156件を未調査として残す。208は本bundleの選択条件で抽出した全件数ではなく、初回cohortの進捗分母である。

## 境界

archiveは固定BASEのGit objectを静的に読み取った。旧source、runtime、test、CI、workflow、hook、adapterを実行していない。現行資産分類ledgerやphaseを更新せず、要求採否、owner、successor、phase admission、実装、CI、consumer closureを生成しない。`authority_effect: none`、`new_build_allowed: false`。

## 確認範囲

必要な静的確認は、対象集合・ID/path/SHA一意性、archive manifest/source digest、親pair path/blob/digest、4製品L1/product-boundary参照、phase候補参照、mainとopen PRの排他、Binding/ledger/参照の整合である。分類出力は固定manifestと固定BASE bootstrap/archive blobに対して `python3 scaffold/legacy-test-design-worker-workflow-0148/validate.py` で独立照合する。`python3 scaffold/legacy-test-design-worker-workflow-0148/selfcheck.py` はID欠落、製品候補改変、意味span改変、phase admission、authority昇格の5負例をvalidatorが拒否することを確認する。加えて `python3 scaffold/tools/scfctl.py validate`、`stale`、`residuals`、`git diff --check` を行う。旧assetのtestは起動しない。
