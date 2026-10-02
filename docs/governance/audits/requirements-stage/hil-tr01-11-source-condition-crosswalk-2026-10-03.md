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
| TR-02 (L1:166) | Pythonの4用途をdata/detection planeとして第一級化し、Node control planeとversioned schema/event/CLIで接続。12a normal commit一回、12b IPC異常でterminalかつpartial 0、12c cancel/timeout後late/direct write拒否。HAT12はprotocol/version/sequence/terminal/transaction、invalid/oversize/timeout/crash/late/direct-writeを要求。 | HARNESS-022、CONNECT-001/002、OS-019/020にscope/版/契約/receiptやverification意味との接点がある。Pythonの役割配置、schema/event/CLI方式、および上記個別normal/negative/boundary oracleの現行fixture一致は確認できず、semantic coverage未証明。 |
| TR-03 (L1:167) | ZIP/Python実装は「候補」に留める。state/gate迂回と直接正本writeを禁止し、input digest/output schema/provenance/detector resultをDBへ投影。HAT09の受入3 polarity/negativeを含む旧親契約全体をTR03へ誤帰属しない。 | HARNESS-022とOS-015/019、SECURITY-022/024は検証・authority境界の関連ownerだが、ZIP候補は採択しない。直接write拒否・4種の記録/投影・無効schema/provenance拒否をこの対象のL11条件とfixtureで閉じた証拠はない。一般的な責務近接はclosureではない。 |
| TR-04 (L1:168) | Linux primary、macOS first-class portable、Windows compatibility profile、WSL/Git Bash/PowerShell非前提。これはsupport tierと対象範囲であり単なるadapter方式ではない。 | INFRASTRUCTURE-001/011採択本文から優先順位を導けない。旧A/B上流scope判断は未決として保持する。PO採択revisionも旧matrixを含むとはしない。3 OSの実行状態は別途未実施/未確認であり、scope未決と混同しない。 |
| TR-05 (L1:169) | path/process/signal/file lock/SQLite/executable discoveryをOS adapterへ隔離。Linux CI基準、macOS/Windows smokeを互換性証拠。14b negativeはadapter leak/path/process/lock拒否。 | INFRASTRUCTURE-001/003、OS-020は環境/資源差を扱うが、この列挙のadapter boundaryと漏出negativeは採択L2/L11から確認できない。TR04のmatrixも未決なので、Linux基準・macOS/Windows smokeを既定化しない。差異を見落としてよいという意味には弱めない。 |
| TR-06 (L1:170) | Node/Python双方のdependency lock/runtime version、offline/clean install、SBOM/secret/license scanを再現可能にする。14cはonline/offlineで同一lock/SBOM/policy、HAT14はmatrix/offline digest/SBOM/secret/license evidenceとunlock/policy negative。 | OS-020、SECURITY-003/005/008/012に実行・scope・credential・provenanceの関連意味がある。二runtimeを固定する根拠、clean+offline両立証拠、全scanと14c/HAT14の対応fixtureは不在。既存一般secret境界をSBOM/license reproducibilityまで拡張解釈しない。 |
| TR-07 (L1:171) | SQLite/harness.db event/projection backbone、Python read model対Node write authority分離、write-authority変更はL4で判断。 | OS-015/019はauthority/lifecycleのowner境界を持つが、SQLite、特定writer/reader、read snapshotおよびこの変更をL4に固定する条件は採択ペアでは確認できない。旧世代L4を現行L4へ機械転記せず、authorityを弱めることも推定しない。 |
| TR-08 (L1:172) | child process＋versioned JSON Lines over stdio、stdout protocol/stderr diagnostic、schema/run/request/type/sequence/deadline/payload digest envelope。HAT12のprotocol負例・サイズ上限等も保持対象。 | CONNECT-001/002、OS-018/023はversioned connection/worker lifecycleの意味に関連する。transport、channel分離、全envelope field、およびinvalid/oversize/timeout/crash等すべてのnegative oracleは採択ペアに個別指定なし。機構間相互運用の意味と旧方式選択を混同しない。 |
| TR-09 (L1:173) | worker direct DB write禁止、Nodeがschema検証済result/findingをtransactional commit、Pythonへ最小read snapshotのみ。 | OS-015/019、SECURITY-015は責務/authority接続の関連先。Nodeへの固定、transaction、atomic result+finding、最小snapshotおよび逸脱拒否を条件別に実証するpair fixtureは確認できず、意味closure未証明。 |
| TR-10 (L1:174) | storage上でproduct source/snapshot/mapping、engine registry/run/artifact、detector registry/run/finding、IPC run、CI stage/quarantine、agent instance/lifecycleを論理分離。列挙7領域を保持。 | OS-015/016/019の責務owner分割と関係するが、それを旧storage/schema/tableの同値としない。7領域ごとのidentity分離と誤結合/越境書込negativeが現行ペアに対応づいた証拠はない。 |
| TR-11 (L1:175) | Bun cutover完了のNode clean install/build/test/CLI/hooks/package/distribution、Bun binary/loader/API/lockfile残存0。13a/13b/13c、HAT13のinstall→distribution、surface inventory、部分完了rejectを含む。 | HARNESS-010/011/022、OS-020はpack identity/call/verification evidenceの既存責務。8 surfaceの成功集合、Bun残存0、historical allowlist境界・部分完了拒否をこの旧conditionと同じoracleで受け入れた現行証拠はない。TR01と同様に方式未決と条件未証明を分離する。 |

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
