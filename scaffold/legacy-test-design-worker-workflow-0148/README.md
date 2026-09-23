# SCF-B-0148 旧test-design worker/workflow 初回52件の責務・phase静的分類候補

この束は、base `8a9fdc973f3553bea78d022e8d73f109aca526da` の `legacy-asset-phase-product-classification-bootstrap.jsonl` から、次の全条件に一致する資産を独立に再導出した研究候補である。

- `source_path` が `docs/test-design/helix/` 配下
- `candidate_phase_targets` が `PHCAP-07` を含む
- basename に `worker` または `workflow` を含む

選択集合は52件（worker 27件、workflow 25件）、asset ID・source pathとも52件が一意である。各archive sourceの固定BASE Git blob、byte数、SHA-256を照合し、test-design frontmatterが示す親 `pair_artifact`／`parent_design`／`authority` を静的に読んで結び直した。親pairは50件。sourceの全記述を採択したとは主張せず、各レコードに意味を示す選択spanと親pair参照を残す。

## 責務候補

各assetごとに実義務／反例spanと親pairを対応させた。47件はHARNESS+OSの責務split候補、3件はHARNESS単独候補、2件は根拠不足として保留した（正式採択0）。製品境界の「HARNESSのartifact内容とconsumer利用条件はHARNESS、artifact生成/配布/promotion等の実行統制はOS」を適用し、test-design本文の検証義務・反例・証拠・利用条件をHARNESS-L1-004候補、選択spanと親pairが実際に指すWorker/CLI/GitHub/PLAN/registry等のtested runtime authority/behaviorをHELIX-OS候補に分けた。OS候補はasset固有のoracle対象がspanとpairで裏付く場合に限る。workflow/interview/envelope semanticsだけが直接支えられ、別のOS runtime targetがない文書はHARNESS単独、選択spanが直接根拠を示さない2件は保留とした。個々の根拠は各recordの `product_basis` と `responsibility_split` に残した。どの候補も正式ownerとして採択していない。

HELIX-Web／HELIX-Web-OSを含む4製品を確認対象に置いた。52件の選択spanと親pairにはWeb利用者向けConnector SaaS体験や展開後のtenant/service運転を直接支える候補根拠が見つからなかったため、`not_assessed_no_direct_support_in_selected_span` とした。これは反証の発見や永久的な非適用判断ではなく、consumer closure等を含む未調査境界である。

LABOはこの束の4製品スコープに含めておらず、候補・分母・不適用判定のいずれにも含めない。これはLABOへの恒久的な非適用判断ではない。固定BASEのcrosswalk bootstrapでは、選択52 asset中31件が少なくとも1つの `candidate_asset_pool` に出現し、同poolのunit候補参照は各recordに列挙した。`representative_legacy_assets` は1 assetを19 unit候補で参照し、`phase-capability-inventory.json` のrepresentativeも1 assetを参照する。これらは検索候補・文脈上の代表参照であり、直接意味リンク、実装、consumer関係を示さない。52件すべてがcrosswalk poolにあるとは主張しない。

bootstrapの `candidate_product_targets` は全行で原文のまま保持する。bootstrapと今回候補の差分は各recordの `bootstrap_candidate_comparison` で全件列挙し、追加候補はproduct_basisのsource-specific reason／anchor／pair titleに、bootstrapから外す候補は選択span／pair digestに結び付いた限定counterevidenceに接続する。Web-OSの非適用・永久除外は判断しない。空またはHELIX-OS候補のassetも同じ条件でspanを確認し、直接根拠を得られない文書は `insufficient_direct_basis` として保留する。親pairの `responsibility_owner` や歴史的frontmatterも新世代ownerへ昇格させない。

## Phase、実装、failure、consumer

52件すべての `PHCAP-07` は候補のまま、phase admissionは未実施である。`PHCAP-10`（Worker実行）、`PHCAP-12`（Review convergence）、`PHCAP-03`（要求分類）、`PHCAP-17`（Incident）、`PHCAP-20`（Memory／継続再構成）が元ledgerにあるassetでは追加候補として保持した。L8/L9/L10のsource layer、親pairの意味、test-design本文から複数候補を再検討する。`phase-capability-inventory.md` のPHCAP-wide状態は文脈証拠に分け、個別assetの実装・縮退証拠に転用しない。

bootstrapは全52件を `test_design_present_unexecuted`、legacy implementation status `unknown`、consumer closure `pending`、consumer refs空としている。本束もその区別を保つ。文書frontmatterの `confirmed`／`draft` は文書状態だけで、実装、test source存在、test実行、pass、受入を示さない。test pathの引用はconsumer関係を確定しない。testは実行していない。

テスト設計に書かれた反例は「設計されたfailure観測候補」であり、過去に実際に発生したfailureの記録ではない。個別未実装、縮退、実行証拠、failure履歴、runtime consumerは対象source一式の追加調査とconsumer closureまで `unknown`／`pending` とした。PHCAP-wideの縮退評価も個別assetに結びつけない。

## 重複と分母

初回選択BASEは `8a9fdc973f3553bea78d022e8d73f109aca526da`。#2096 merge後の比較時点main snapshot `be9cf8cf99ee94a487e54d372d7a34e9266b1ee3` へ排他照合を更新した。この固定main snapshotは#2094の72件と#2096の57件を含む666 unique asset ID（原ledger行708件）。#2097は提示されたopen HEAD `211712a0aba71ea7461f53e7f824879de5bcff48` の8件を静的Git objectとして比較した。main 666件、open #2097 8件、0148の52件についてasset ID・source path・source SHA-256の各射影を個別に比較し、target overlapはすべて0件。比較集合全726件は候補分類の比較分母であり、正式分類や完了を示さない。

mainと#2097のrevisionはこの検証時点の固定比較snapshotで、追随pinではない。比較前提となるmainまたは#2097のHEADが進んだと確認された場合、この結果をstaleとして扱い、union/overlapを再導出するまで新しい比較結果として利用・報告しない。validatorは記録されたexact Git objectを検証するもので、remote HEADの鮮度を自動取得・保証しない。

より広いworker/workflow調査分母208件のうち、今回52件を記録し、残り156件を未調査として残す。208は本bundleの選択条件で抽出した全件数ではなく、初回cohortの進捗分母である。

## 境界

archiveは固定BASEのGit objectを静的に読み取った。旧source、runtime、test、CI、workflow、hook、adapterを実行していない。現行資産分類ledgerやphaseを更新せず、要求採否、owner、successor、phase admission、実装、CI、consumer closureを生成しない。`authority_effect: none`、`new_build_allowed: false`。

## 確認範囲

必要な静的確認は、対象集合・ID/path/SHA一意性、archive manifest/source digest、親pair path/blob/digest、4製品L1/product-boundary参照、phase候補参照、mainとopen PRの排他、Binding/ledger/参照の整合である。分類record全体は固定validator内のbyte/canonical digest契約に照合する。候補の意味を機械生成・採択したとは主張しない。validatorは固定BASEのbootstrap、archive Git blob／MANIFEST、test-designから宣言された親pairとそのGit blobをledgerから独立に再導出して照合し、各recordの完全一致、型・cardinality、product_basisとother assessmentの非重複、bootstrap候補との差を検査する。比較集合はmainの各pinned ledgerとopen #2097 exact HEADから実際にunionを計算する。 `python3 scaffold/legacy-test-design-worker-workflow-0148/validate.py` で検査する。`python3 scaffold/legacy-test-design-worker-workflow-0148/selfcheck.py` はledger／manifest／Binding digestを同時に再同期した分類改変、bootstrap差分の除去、basis/assessment overlap、main unionの再同期、重複JSON key、malformed inputを含む負例が固定contractまたは個別guardで拒否されることを確認する。加えて `python3 scaffold/tools/scfctl.py validate`、`stale`、`residuals`、`git diff --check` を行う。旧assetのtestは起動しない。
