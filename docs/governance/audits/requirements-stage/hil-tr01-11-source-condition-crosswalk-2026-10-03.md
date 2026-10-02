# HIL-TR-01〜11 旧source条件別クロスウォーク

## 固定範囲と判定方法

- 監査基準HEAD: `a7f85b4c2fd88510c32de4a1ade4c95662bd98c1`。L2/L11の採択根拠は、各機構の後発PO decisionが固定した `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のrevisionと明示採択集合。固定時L2/L11 file SHA、基準HEAD時のfile SHA、各対象L2本文sectionとL11受入row/section SHA、decision SHAは同名JSONへ記録した。 全L2/L11 section SHAは、JSONに記録した実際の`### <requirement_id>`見出し（CONNECT受入は対応する`### HELIXCONNECT-L11-<nnn>`）から、次の同位または上位heading（depthが3以下）の直前までを実UTF-8 bytesで切り出す。末尾のLF bytesだけをtrimしてLFを1個付けて算出する。L11 acceptance row SHAはJSONに記録した表rowの実UTF-8 bytesを終端LF込みでhashし、parse/reserializeや空白正規化を行わない。JSONにはfixed/currentそれぞれのheading全文、start/end lineと終了境界を記録し、後続の章・sectionを混入させない。固定時と基準HEAD時のSHA一致はbytes一致を示すだけで、採択根拠はPO decisionのexact revisionと明示rowである。
- 旧L1 `infinity-loop-platform-requirements.md` の165〜175行（asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、全file SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）と旧IR `requirements.json`（asset `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）の各record rev1を起点にした。各L1 line SHA、IR semantic/statement digest、typed consumer contract、3 polarityのacceptance case、system-test scenario/evidence/negative boundaryをJSONへ保持した。
- 既存のcondition recheck、quality-source recheck、IR108 disposition matrix/summary、REG06 JSON/MDを参照し、SHAをJSONに固定した。IR108の`implementation_only`は現行L2/L11への対応証明ではなく、REG06もcondition closure・未対応ゼロ・弱化受入全列挙を対象外/未証明と明記する。
- 旧assetは参照のみ。archive workflow/runtime/test/CIは実行していない。正式successorは全11件で未割当、downstreamは`pending_pair_descent`。この監査は実装・実行・受入完了や旧source retirementを主張しない。
- 旧source監査の「implementation_only」は方式選択を切り分ける分類として読む。これをもって同じ行の意味条件、受入、負例、証拠まで消えたとは扱わない。旧source全体の条件closureが無い限り、その意味を「方式だけ」と狭めず未証明を残す。

## 条件別判定

| Source | 原文条件と現在の状態 | 現行採択ペア・意味保持境界 |
|---|---|---|
| TR-01 (L1:165) | TypeScript strict＋Node唯一runtime、Bun固有API/command/lock/CI/distributionをactive surfaceから除く。前半はruntime選択、後半はactive surface全域の残存0という完了条件。13a positive、13b残存検出negative、13c historical/active境界、HAT13のinstall→distribution・証拠一式・部分完了拒否もsource obligation。 | HARNESS-010/011とOS-020が採択済みのpack/call/runtime実行契約を持つ。契約版・対象scope・証拠の意味は保持先になり得るが、この旧runtime選択もBun全surface残存0のoracleも含まない。照合結果: 方式は未決、移行closure/negativeは未証明。 |
| TR-02 (L1:166) | Pythonの4用途をdata/detection planeとして第一級化し、Node control planeとversioned schema/event/CLIで接続。12a normal commit一回、12b IPC異常でterminalかつpartial 0、12c cancel/timeout後late/direct write拒否。HAT12はprotocol/version/sequence/terminal/transaction、invalid/oversize/timeout/crash/late/direct-writeを要求。既存quality crosswalkは「意味照合要」としてPythonをdata/detection planeだけに限定せずADR-010 semantic coreと整合させる要点を記録する（行51、SHAはJSON参照）。配置bootstrapはHELIX-OS単独の候補である（行144、同）。 | HARNESS-022、CONNECT-001/002、OS-019/020にscope/版/契約/receiptやverification意味との接点がある。旧監査の意味照合指摘を保持し、OS配置候補は採択へ読み替えない。Pythonの役割配置、schema/event/CLI方式、および上記個別normal/negative/boundary oracleの現行fixture一致は確認できず、semantic coverage未証明。 |
| TR-03 (L1:167) | ZIP/Python実装は「候補」に留める。state/gate迂回と直接正本writeを禁止し、input digest/output schema/provenance/detector resultをDBへ投影。HAT09の受入3 polarity/negativeを含む旧親契約全体をTR03へ誤帰属しない。 | HARNESS-022とOS-015/019、SECURITY-022/024は検証・authority境界の関連ownerだが、ZIP候補は採択しない。直接write拒否・4種の記録/投影・無効schema/provenance拒否をこの対象のL11条件とfixtureで閉じた証拠はない。一般的な責務近接はclosureではない。 |
| TR-04 (L1:168) | Linux primary、macOS first-class portable、Windows compatibility profile、WSL/Git Bash/PowerShell非前提。これはsupport tierと対象範囲であり単なるadapter方式ではない。既存quality crosswalkはLinux primaryとWSL等をcore前提にしない既存分類を記録する（行53、SHAはJSON参照）。Web製品群の候補判断はLinuxをprimaryとし未実施OSを明示する保持点、およびWeb提供系を検証済みLinuxに限り操作端末OSと対象製品OSを分ける変更点を記す（decision行119、同）。| INFRASTRUCTURE-001/011採択本文から優先順位を導けない。旧A/B上流scope判断は未決として保持する。Web側の候補判断は`authority_effect:none`であり、本体OSの採択・scopeへ変換しない。PO採択revisionも旧matrixを含むとはしない。3 OSの実行状態は別途未実施/未確認であり、scope未決と混同しない。 |
| TR-05 (L1:169) | path/process/signal/file lock/SQLite/executable discoveryをOS adapterへ隔離。Linux CI基準、macOS/Windows smokeを互換性証拠。14b negativeはadapter leak/path/process/lock拒否。 | INFRASTRUCTURE-001/003、OS-020は環境/資源差を扱うが、この列挙のadapter boundaryと漏出negativeは採択L2/L11から確認できない。TR04のmatrixも未決なので、Linux基準・macOS/Windows smokeを既定化しない。差異を見落としてよいという意味には弱めない。 |
| TR-06 (L1:170) | Node/Python双方のdependency lock/runtime version、offline/clean install、SBOM/secret/license scanを再現可能にする。14cはonline/offlineで同一lock/SBOM/policy、HAT14はmatrix/offline digest/SBOM/secret/license evidenceとunlock/policy negative。 | OS-020、SECURITY-003/005/008/012に実行・scope・credential・provenanceの関連意味がある。二runtimeを固定する根拠、clean+offline両立証拠、全scanと14c/HAT14の対応fixtureは不在。既存一般secret境界をSBOM/license reproducibilityまで拡張解釈しない。 |
| TR-07 (L1:171) | SQLite/harness.db event/projection backbone、Python read model対Node write authority分離、write-authority変更はL4で判断。既存quality crosswalkはこのL4条件がADR-010のNode transactional boundaryと衝突するため「意味変更要」と明記する（行56、SHAはJSON参照）。配置bootstrapはHELIX-OS単独の候補である（行149、同）。 | ここは単に条件の証拠が未確認なのではなく、旧L4 decision条件とADR-010の記録済み衝突を維持する。旧L4を現行L4へ転記したり、ADR-010で旧sourceを無言で置換したりせず、意味変更の行先を未解決として残す。routingは候補にすぎず採択ではない。 |
| TR-08 (L1:172) | child process＋versioned JSON Lines over stdio、stdout protocol/stderr diagnostic、schema/run/request/type/sequence/deadline/payload digest envelope。HAT12のprotocol負例・サイズ上限等も保持対象。 | CONNECT-001/002、OS-018/023はversioned connection/worker lifecycleの意味に関連する。transport、channel分離、全envelope field、およびinvalid/oversize/timeout/crash等すべてのnegative oracleは採択ペアに個別指定なし。機構間相互運用の意味と旧方式選択を混同しない。 |
| TR-09 (L1:173) | worker direct DB write禁止、Nodeがschema検証済result/findingをtransactional commit、Pythonへ最小read snapshotのみ。 | OS-015/019、SECURITY-015は責務/authority接続の関連先。Nodeへの固定、transaction、atomic result+finding、最小snapshotおよび逸脱拒否を条件別に実証するpair fixtureは確認できず、意味closure未証明。 |
| TR-10 (L1:174) | storage上でproduct source/snapshot/mapping、engine registry/run/artifact、detector registry/run/finding、IPC run、CI stage/quarantine、agent instance/lifecycleを論理分離。列挙7領域を保持。 | OS-015/016/019の責務owner分割と関係するが、それを旧storage/schema/tableの同値としない。7領域ごとのidentity分離と誤結合/越境書込negativeが現行ペアに対応づいた証拠はない。 |
| TR-11 (L1:175) | Bun cutover完了のNode clean install/build/test/CLI/hooks/package/distribution、Bun binary/loader/API/lockfile残存0。13a/13b/13c、HAT13のinstall→distribution、surface inventory、部分完了rejectを含む。 | HARNESS-010/011/022、OS-020はpack identity/call/verification evidenceの既存責務。8 surfaceの成功集合、Bun残存0、historical allowlist境界・部分完了拒否をこの旧conditionと同じoracleで受け入れた現行証拠はない。TR01と同様に方式未決と条件未証明を分離する。 |

## 旧assertion case台帳の対応（設計のみ・未実装）

旧`infinity-loop-system-assertion-cases.md`はarchive内の読取専用consumer/test設計資料であり、case行はすべて`design-defined`かつ`not-implemented`である。実行や受入完了の証拠ではない。規範sourceは旧IR identityのまま保持し、この台帳は規範本文へ統合しない。JSONには23行それぞれの原文、物理行、行SHA-256、file SHA-256を格納した。23行にはTRへの対応が25件あり、複数TR共用caseは各TRの行先を別々に列挙する。

| TR | 旧case | source locator / 行SHA-256 |
|---|---|---|
| HIL-TR-01 | `HST-CASE-013-01` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:114` — `97187c6cda489e40dcf3704caee30891d0060140a6065e6c0f36ffe29cae05e5`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-01 | `HST-CASE-013-10` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:402` — `268d58cd9b8e35f49a11a7fc25064eb69224386415db5fad2c607b154854d6b1`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-02 | `HST-CASE-007-14` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:403` — `e0404d8eefc15a439cdd176782bc31896e07192aa8a88dd951564d8b895f3acc`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-03 | `HST-CASE-008-12` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:404` — `04c0b0562e9ab0dae4f4cb436bd6486f58010745ae631de042f6eabc4cb5c4d3`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-04 | `HST-CASE-014-02` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:122` — `638cfebbca674c33b7973a55531a8f83f834d762818f8182d61c7cd48a6ec1cf`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-04 | `HST-CASE-014-03` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:123` — `412fd1507a0ca15fe92c9188801e99f7d7bf562cbd037c89f7840d9953ed063f`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-04 | `HST-CASE-014-09` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:405` — `4003dc4351180ccd4424af465071335c4ae972180f896596f15827e776f0c6eb`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-05 | `HST-CASE-014-04` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:124` — `36da444ec889858a385dc1826ed2d09c7110047fe58e0cddddc09eda9bf4ab9e`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-06 | `HST-CASE-017-01` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:139` — `a15980f3ba18d345393ad59b9089b5ec36c458287e49ef1b28a7a4c5e863869a`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-06 | `HST-CASE-017-02` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:140` — `a341ccc78c98fc026c0b5684dd5d31817d217832331819c3888d8ab107662bbc`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-06 | `HST-CASE-017-03` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:141` — `128e6d7830084fdcb7f5b3ab6396ec2a38b04bec5e722e9370bc02b0b4bc9fd0`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-06 | `HST-CASE-017-06` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:144` — `975a73cb0f4d87b53eebad2c1226fabc1212b17338e325098e6d39317ae70101`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-06 | `HST-CASE-017-07` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:406` — `07a2f87dfa17b6cd0c3feb47afb195b5eeed1f9d8c148e0b8d65d6eb869c2036`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-07 | `HST-CASE-007-15` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:407` — `820bba593b4121ed2843bf877920143e73eb15ab8fd69954ccbd3a6bdd4ca1be`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-08 | `HST-CASE-007-01` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:66` — `79e4c8349287547c86e5581f5242e5b4cfe3267444db7c1be2b52dfcace86bd1`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-08 | `HST-CASE-007-12` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:77` — `c024bd29aa6c182445a25639dc39ce7e095b06d2a145d1c09d2799634ce2f336`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-08 | `HST-CASE-007-16` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:408` — `3aa9d531bd5fbea7a8636c90ca3fc08d6911097ffc3ff3ea020cb5618f480dd3`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-09 | `HST-CASE-007-01` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:66` — `79e4c8349287547c86e5581f5242e5b4cfe3267444db7c1be2b52dfcace86bd1`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-09 | `HST-CASE-007-11` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:76` — `04c079dc233f53c6345f423b64a75da04b71c2f27ce3cba7c350e61b26dac6a2`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-09 | `HST-CASE-010-06` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:98` — `40e6b5459a76aa175a0aae0e41f493b65368b0d335a0424832d9397dab382ed1`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-09 | `HST-CASE-007-17` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:409` — `b38a2c31605abf71ee5fefa4da74e26edaa8bcda5df666589adfb174e59a1167`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-10 | `HST-CASE-009-08` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:410` — `20ba258f480f7f4cfddecab27aa5d92093409444d7acf439a048a64eca7cc495`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-11 | `HST-CASE-013-01` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:114` — `97187c6cda489e40dcf3704caee30891d0060140a6065e6c0f36ffe29cae05e5`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-11 | `HST-CASE-013-04` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:117` — `2c54a666850c330a3e207375d3ab57ca15a174713bb1c4f28c91203212f19029`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |
| HIL-TR-11 | `HST-CASE-013-11` | `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:411` — `e9b7ee0584057eb324c86202a4f7e5049f3a02d82c2bf1dfdabe46bc1b0a739d`; 原文はJSON `legacy_assertion_case_source.cases`参照。 |

共用case `HST-CASE-007-01`（行66）はTR-08とTR-09に個別対応し、TR-08ではrequest/response protocol、TR-09ではcommit/write authorityの設計根拠として読む。`HST-CASE-013-01`（行114）はTR-01とTR-11に個別対応し、TR-01のNode control planeとTR-11のBun-free完了条件を分ける。どちらもcase行の共有は要求条件や実装statusの同一化を意味しない。TR-06は5件、TR-09は4件のsource rowを持つ。全て未実装であり、current L2/L11 acceptanceまたは実行結果へ昇格させない。

## 既存TR分類・配置・Web判断のsource pin

- `docs/governance/audits/source-rebaseline/infinity-quality-constraint-crosswalk.md` 全文SHA-256 `89e623cfb9274034c37e52af9fe0598c0052ee2d743bdf7bb648334289b4f6a8`、行50〜60はTR-01〜11の既存評価である。全行の原文・個別行SHAはJSON `related_existing_source_audits.quality_constraint_crosswalk.line_evidence`に保存した。TR-02/04/07への影響は上の各条件行に反映した。
- `docs/governance/legacy-migration/ir/legacy-ir-product-routing-bootstrap.jsonl` 全文SHA-256 `c35934693b273e6cfd03e509886dc22bd1367e78ae1aa4568563a7da252c41e1`、行143〜153の各TR配置候補はauthority effectなしである。各行の原文とSHAはJSON `related_existing_source_audits.product_routing_bootstrap.line_evidence`に保存した。単独OSまたはHARNESS/OS splitの配置提案は、採択や正式successor割当を意味しない。
- `docs/governance/decisions/helix-web-product-group-po-decisions-2026-09-26.md` 全文SHA-256 `32501782b866a888db9536b1b522ee2d1a4d8c70968d78a754bcc508fa34923c`、行119のSHA-256 `d312052a295998944e16a1678c0cb8850a199dff59e703e610eef5b2a960fd45`はTR-04のWeb製品群候補判断である。Linux primaryと他OS未実施の明示を保持しつつWeb提供環境の扱いを記録する内容であり、本体OSの採択scopeを変えない。Web候補を採択済みauthorityへ読み替えない。

## cross-cutting consumerと既存監査の境界

- `HR-FR-HIL-12`（TR02/07/08/09/10を含む複数IR）はNode-supervised Python worker、versioned JSON Lines IPC、validated resultのNode-authority transaction commit、terminal receipt一件、Node-only writeを記す。protocol/JSON/size/timeout/crash/backpressure/late/direct-writeとenvelope/process/schema/transaction/projectionを列挙。親contractをTR02だけの全coverageとして数えず、TR08方式やTR09/10 storage条件の個別対応を省略しない。
- `HR-FR-HIL-13`（TR01/11）はBun-less LinuxからNode install/build/CLI/hooks/tests/package/distribution完了、Node lock、全surface green、active finding 0を記す。failureはBun API/command/lock/CI/distribution残存と部分完了claim、証拠はinventory/workflow logs/lock/package smoke。これは旧suiteの完了仕様であり、現行採択pairが同suiteを証明したことを意味しない。
- `HR-FR-HIL-14`（TR04/05/06）は3 OS scope、adapter隔離、lock/SBOM/policy再現をまとめる。14a positive、14b adapter/path/process/lock negative、14c online/offline境界、HAT14 matrix/offline digest/SBOM/secret/licenseとnegativeを保持する。TR04の上流scope未決を技術ラベルで消さず、TR05/06の検証方式も採択済みと推定しない。
- 旧IRの全11 parent recordは`kind=technical`, `status=specified`, `definition_status=frozen`, `revision=1`; 旧downstreamは`pending_pair_descent`; formal successorは未割当。旧quality-source recheckの`implementation_only` dispositionとREG06のpopulation/join監査は、condition-level closureではない。REG06自身もsource未対応ゼロ・弱化受入全列挙を未証明としている。

## 結論と残作業

分類上の実装方式（Node/Python/ZIP/SQLite/stdio/adapter・CI方式）を現行要求へ自動移植しない判断は維持する。一方で、TR01/11のBun-removal end-state oracle、TR02/03/05/06/07/08/09/10の個別責務・failure/negative evidence、TR04のplatform support scopeを「implementation-only」の一括表示で閉じてはならない。この監査では多くの対応を「関連する採択pair」と「同じ受入条件の証明」に分け、後者が無い条件を未証明として列挙した。

次段階はこの記録の独立reviewと親検収後、真の要求残差だけを既存L2 owner・authorityへ戻すこと。新IDや新しいplatform/runtime要件はこの監査で起草・予約しない。旧scope決定はTR04の判断状態に残し、L3実装方式をL2条件へ昇格しない。

## 最新mainとの別比較

- latest main `a5c83e1991973c03dc0fd3497509b0b9b2aec96c`に対し、audit basis `a7f85b4c2fd88510c32de4a1ade4c95662bd98c1`とfixed revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`は維持した。37 crosswalk pair参照が指す19の一意な採択targetについて、L2 section、L11 section/row、各PO decision fileを最新mainで再hashした。全対象section/rowとdecision fileはa7時点から不変。文書全体の追補有無とsection不変を区別し、監査基準を最新mainへ置換していない。各最新見出し/行の具体locatorはJSON `latest_main_comparison`に記録した。
- 最新mainのHARNESS-L2-083 MPR rows 001/002はいずれも`registered_proposal`・`authority_effect: none`であり、登録やmergeから採択を推定しない。旧L1、11個のIR record、33個のacceptance case、11個のsystem-test根拠と5 source/consumer file hash、および6既存監査入力のhashも最新mainで照合し、全て記録値と一致した。

## 最新mainの追補比較（212cefee88df4b0914c6253aa109fe9d884eae51）

直前のa5比較はその時点の独立照合として保持し、この追補を新しいlatest-main比較とする。監査basis `a7f85b4c2fd88510c32de4a1ade4c95662bd98c1`と固定要求revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`は更新していない。37 crosswalk参照に対応する19の一意な採択pair targetのL2/L11 sectionまたは受入row、PO decision fileを212ceで再照合し、38 locatorすべてがa7基準のSHA-256と一致した。INFRASTRUCTURE-011は次の同階層以上の見出しで範囲を切り、後続章を含めていない。旧L1/IR/consumerの5 source file、IR 11件・acceptance case 33件・system-test 11件の母数、および既存6監査入力も記録SHAと一致する。HARNESS-083のMPR 001/002は`registered_proposal`／`authority_effect: none`のままで、採択を推定しない。全section/row、決定record、sourceと入力のlocator・hashはJSONの`latest_main_comparison`に記録した。

## 最新mainの追補比較（e05a45ca27104e37909c49388c38ece0cf1c69f0）

既存のa7監査基準・固定f6要求revisionと212ceの比較記録を保持し、e05aで19対象のL2/L11全38箇所とPO判断ファイルを再照合した。全選択SHAはa7基準と一致し、最新全文SHAと具体locatorをJSONへ追記した。この一致は旧sourceの条件充足や実行の完了を意味しない。


## 最新main 43d5ff7fへの追随

比較対象は `43d5ff7fdb00152b8b3f7aed2aa459ad8b0cb7b5`。19対象のL2/L11、計38箇所を見出しまたは原文表行から再抽出し、監査基準a7のSHAとすべて一致した。選択した判断記録のSHAも一致した。e05比較はJSONの履歴配列へそのまま保持し、最新のlocatorと全文SHAを追補した。追加された085はNFR33の未採択候補であり、TR原文の全体closureの証拠にしない。
