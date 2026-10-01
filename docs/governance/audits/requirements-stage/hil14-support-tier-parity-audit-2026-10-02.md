# HIL-14 support tier/profile対応の限定照合

## 照合範囲

初期監査・候補はmain `72d08ebc1b45c8cf85c0e89359c48f78eb779fee`を基準とし、今回の#2490修正はbase `6f859fc03c9add36d84eb153cb1832b26768d6d1`に基づくroot review WT HEAD `c60dac403890d4c94271e28cbf3f674f656de4f4`へ適用した。旧sourceのsupport tierとprofile結果の対応について、HARNESS-L2/L11-064へ4つの選択source meaning sliceだけを候補化した。候補scope、製品・repository適用、support対象の選択は未決のまま保持する。HAC-HIL-14b/c、HAT-HIL-14全体、supply-chain条件、旧IR全体のclosureは本記録の範囲外である。

## 旧sourceとconsumer

現行起草の起点は旧要求文書`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`（asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）である。

| atom | 旧source path/line | statement digest | 保持する条件 |
|---|---|---|---|
| HIL-TR-04 | 同ファイル:168 | `cdfeddca01d916f1241f11f4c74fe2dcf85e1b95ea8723633e912c1e6a09420b` | Linux primary、macOS first-class portable、Windows compatibility。WSL/Git Bash/PowerShellをcore前提にしない。 |
| HIL-FR-34 | 同ファイル:124 | `427b87551182dc6c28a31d4f9617b0625120b63e983b25663da667e3a404676a` | 同一fixtureをLinux/macOS/Windows adapterへ適用し、OS contract resultとadapter violationを返す。 |
| HIL-NFR-09 | 同ファイル:189 | `bd7c0c8c513f62da48ab6a012a04c35431b32ae1623e880ad1a2c26c33b2350d` | Linux primaryで**全core gate**を実行、macOS/Windows差異をadapter contract testで検出、OS別domain logic forkを作らない。 |
| HIL-NFR-19 | 同ファイル:199 | `07cc796cd8d1ebc6ed1164f6c96551a811b4bca04caa94e51a451155df9fddc7` | Linuxをcore completion platformとし、macOS/Windowsの未実施を明示する。Windows wrapper成功をLinux互換証拠にしない。 |

各原文のline SHA-256、旧asset/path、typed source/acceptance/consumer参照、各sliceの境界とsource holdingに残す残部は[`hil14-support-tier-source-lines-2026-10-02.jsonl`](../requirement-registration/hil14-support-tier-source-lines-2026-10-02.jsonl)へ保存した。旧IR snapshot `requirements-ir/requirements.json`（asset `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）では4 IDが`HR-FR-HIL-14`のtyped linkに属し、全てHAC-HIL-14a/b/cとHAT-HIL-14を参照する。旧契約JSON（asset `LEGACY-ASSET-67761C517521603F844C`、`system_contracts.json` SHA-256 `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`）はHIL-TR-04等を列挙し、Linux full/macOS portable/Windows compatibilityを同じ契約で扱う。

HAC-HIL-14a（旧`acceptance_cases.json`, asset `LEGACY-ASSET-4886CEF2A7AB5B7AA5C8`, SHA-256 `4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19`, line 438 statement digest `4a431379b49f14d084c3771c44e1aef7c9a4e3f8cbc6f71b626ed2f7a6c9fd9b`）は「3 OSが定義scopeをgreen」というpositive oracleである。旧assertion consumer `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md`（asset `LEGACY-ASSET-7B1C7AED3AA401868455`, SHA-256 `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8`）のHST-CASE-014-01..03（lines 121-123）はLinux full contract、macOS portable suite、Windows smokeを個別に結び、014-08（line 389）は同一edge fixtureとdomain logic漏出、014-09（line 405）はtier label、014-10（line 420）はLinux fullとcompatibility profile間でlogic forkなし、014-11（line 430）はLinux未実行時にWindows wrapperだけでcore completionを拒否する条件を置く。これらは全て旧設計consumerであり、source statusは`not-implemented`。旧L6 function design（asset `LEGACY-ASSET-9A01A0B72DB343D5859E`, `os-portability-supply-chain.md:226-231`, SHA-256 `b9976277c2d025b9ab0ae9454be97b679416e44823198d41b9b4aae127ffbc66`）はcase-to-oracle edgeを説明するdesignであって実装・実行証拠ではない。

旧asset ledger `docs/governance/legacy-asset-disposition.jsonl`（HIL L1要求asset row 424、acceptance IR asset row 2863、requirements IR asset row 2866、system-contract asset row 2867、assertion consumer row 975）では、旧source bytesを保持し、要求/contractの`product_target: unresolved`、`carry_forward_state: preserved_pending_rehome`、source statusをread-only/non-executableとして記録している。旧IR carry-forward `docs/governance/legacy-requirement-carry-forward.jsonl`（SHA-256 `51ae96d3fd27cc4aaa6e445c27ff0c6f175199cae09efe4e1566b73c1e8019b0`）のHIL-TR-04、HIL-FR-34、HIL-NFR-09、HIL-NFR-19行も`preserved_pending_rehome`、空の`successor_requirement_ids`、null `decision_record`、`requirement_change_authority: explicit_human_decision_only`を保つ。仮登録`MPR-SH-IR-003`はRequirement IRのsource holdingであり、今回のcandidateから変更していない。

## 選択4sliceの句単位照合

4つのsource atomは既存JSONLどおり変更せず、各原文句を候補本文とpaired L11へ照合した。L11の正常・負fixtureは結果の解釈契約であり、旧test実行や実OSの実測結果、要求stageのpassを示さない。

| Source sliceの句 | L2-064で保持する条件 | L11-064の対応oracle／不成立例 |
|---|---|---|
| HIL-TR-04: Linux `primary`、macOS `first-class portable`、Windows `compatibility`。WSL/Git Bash/PowerShellをcore前提にしない。 | `限定対象`、`tier意味と負境界`、`差分と保留`（L2 1253、1256、1259） | tier別profile positive、Linux証拠の代用、shellをcore前提化（L11 969、972、979）。 |
| HIL-FR-34: 同一fixtureを3 adapterへ適用し、OS contract resultとadapter violationを区別する。 | `限定対象`、`対応保証`、adapter境界で許す差分（L2 1253、1255） | 共通contract/fixture positive、別profile流用・domain fork negative（L11 971、976、978）。fixture内path/process/permission/lock等の個別oracleは選択外。 |
| HIL-NFR-09: Linux primaryで**全core gate**を実行する。 | `tier意味と負境界`で全required core gateをLinuxで実行した結果をLinux core completion条件にする（L2 1256）。 | Positiveで全required core gateを照合し、Negativeで部分実行・missing gateのpassを拒否する（L11 970、973）。 |
| HIL-NFR-09: macOS/Windows差異はadapter contract testで検出し、OS別domain logic forkを作らない。 | test結果を対象profile・contract/fixture・revisionへ束縛し、test未実施・不明とdomain forkを拒否（L2 1256）。 | Positiveで両profileのadapter contract test結果を結び、Negativeでtest欠落/stale/別profile証拠とlogic forkを拒否（L11 970、974、978）。 |
| HIL-NFR-19: Linuxはcore completion platform。macOS/Windows未実施を明示し、Windows wrapper成功をLinux互換証拠にしない。 | Linux completionをLinux側証拠だけへ束縛し、missing/unknown/skipped/interrupted/staleをgreenへ読み替えない（L2 1255–1256）。 | Linux証拠の代用、3 OS positive条件の一部だけ、他profile推定の各Negative（L11 972、975–976）。 |

HIL-NFR-09の「全core gate」と「macOS/Windows差異のadapter contract test検出」は、概要表には記録済みだったがL2/L11候補本文から欠けていたため今回の追補で戻した。source scope、4 atomのID・statement digest・atomset digestは変更していない。

## 採択済み隣接revisionと後続判断

2026-09-28のHARNESS PO判断（`helix-harness-requirements-po-decision-2026-09-28.md`, SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`）は、固定snapshot `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL2/L11一式と明示候補を採用した。HARNESS-L2-005/022はこの採択済みrevisionである。現在のL2/L11本文の当該行は同commitとbyte-for-byte一致することを確認した。L2-005行集合SHAは`70e74fc5d34c46adef1808e1f995d689ce48d1fb11bc8cc47d6fb694df544e65`、L11-005行SHAは`d13efe4614dd4455583bc7fe5f4585829082a4dcbb28e8159b33f4bbb72925eb`、L2-022行SHAは`0a3bbc3ec19e313a4503ef033cc8e38b6d20f2a19b986eec6445a3ecc6cb8454`、L11-022行SHAは`75f4de4a008c8e7dce69c72aad261b1069ef9a4c772b689679af03e52c701755`である。これらは検証義務/oracle/段階証拠の一般契約を採択したrevisionであり、HIL-14の3 OS support tier、同一fixture mapping、Linux core completionのnegative oracleを含まない。

2026-09-28 HELIX-OS PO判断（`helix-os-requirements-po-decision-2026-09-28.md`, SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`）でHELIXOS-L2-020/021と対L11は採択済みである。現在のsectionsは固定snapshotと同一（L2-020 `fa62debc978fba6f5ab4146c0d3515a7ce7b5b4df3e054bd953b0f55e2f8878a`、L2-021 `0656171a926f67d47263a53cdd012b64112c6143399ab5cb4ac35d00e804dc81`、L11-020 `a9e5f9430836d409a7885b548fa8bff7a874184c024e74e28627cb9d7c59c88c`、L11-021 `21ab8d8199d2f8e1d9999a30d6502d6aa8d7dc3017fe394a3d090d4baf7a6462`）。020は選択profileのCI運転・状態・証拠回収を、021は選択HARNESS構成の対象project配布・更新・復旧を扱う。それらはsupport tierの選択契約ではない。

後続の57候補判断（SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`）はHELIXOS-L2-030 `MPR-RC-HELIXOS-L2-030-003`を保留し、本体実行OS、consumer利用先、配布段階、切替条件の決定を残している。これはWindows即時却下やLinux限定を決めない。11候補判断（SHA-256 `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`）は同じ保留を維持する。2026-09-30 live26 decision（SHA-256 `8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145`）のexact-ID照合からHIL-14 scope/adoption/successorの変更は確認していない。決定文が扱う採択済みrevisionと古いcoverage receiptのmetadataを混同せず、採択は対象decisionとfixed content hashに基づけた。

## scope判断の未選択

既存scope frame `hil14c-online-offline-lock-sbom-policy-scope-frame-2026-09-29.md`（比較基準commit `41b9d9a455df647115505e8f6e74bfd205481a8d`, file SHA-256 `74f9f8c872f9a47ba1a33712dd35a9b49b255e399e3f6613596f545e15e636c2`）にある選択肢は以下のとおりで、いずれも未選択である。

| 選択肢 | 適用scope | 推奨と影響 |
|---|---|---|
| A | HELIX-HARNESS製品の明示support scope | a/b/cを製品contractとして扱う。製品対象・OS tier・成果物を選ぶ。 |
| B | HELIX-HARNESS repository固有の構成・依存・配布成果物 | 利用者向け製品platform保証を含めず、repo acceptanceへ限定する。 |
| C | 条件別にscopeを分ける | a/bとcのscopeを分割し、各対象・責務・受入範囲を個別に選ぶ。 |
| D | scope決定まで保全して保留（推奨） | 旧sourceを保全し、A/B/Cを選ぶまで採用版・owner・successorを決めない。 |

影響する上流意味はHIL-TR-04のtier順位、HIL-FR-34の対象profile/fixture、HIL-NFR-09のLinux core gateとOS別logic fork禁止、HIL-NFR-19の未実施明示・WindowsからLinuxを推定しない条件、およびHAC-HIL-14aの「3 OSが定義scopeをgreen」である。L2/L11-064はこれらの選択肢を決めず、scopeが別途明示された後、その選択scope内の結果をprofile/tier別に対応づける意味だけを提案する。HAC-HIL-14aの3 OSがscopeに含まれる場合は3 profile全ての個別green証拠が必要で、1 profileだけgreenでもHACは未完である。scopeが3 OS未満の限定案はHAC-HIL-14aの履行でなく、上流へ提示する未決の意味差として明示する。

## 残差と境界

採択済みHARNESS-L2-005/022とHELIXOS-L2-020/021は検証義務、oracle/evidence契約、実行・回収、選択構成の配布という隣接責務を持つ。既存L11は一般条件に沿うoracle・状態・revisionを扱う。ただし次のHIL-14a固有条件は対応する採択済みpair本文にない。

- tier labelを、選択scope・platform profile・同一contract/fixture・対象revisionに対応づける。
- profileごとのrun/evidence stateを保持し、missing、unknown、未選択、未実行、staleを別profileの結果で相殺しない。
- Linux primary/full completionをLinux証拠に結び、Windows wrapperまたはmacOS portableだけのgreenで成立させない。
- Linux結果をmacOS/Windows coverageへ転用せず、domain logic forkをprofile差として許容しない。

これらの条件をHARNESS-L2/L11-064候補へ4つの選択source meaning sliceで限定追補した。HIL-FR-34のfixture内容（path、process、permission、lock等）の個別oracleはこのsliceに含めず、source holdingに残す。HAC-HIL-14aの3 OS positive conditionは原文に残し、3 OS全てが対象scopeである場合の成立に限り、候補L11は1 profileだけgreenの負例を持つ。scopeを3 OS未満へ限定する候補は旧HACの履行・置換・formal successorではなく、未決意味差として保全する。OS contract resultとadapter violationは旧sourceの別結果型として保持し、異常・不足はverification oracle不足ならHARNESS-L2-005 owner、profile run/environment/receipt mismatchならHELIXOS-L2-020 owner、scope不明なら既存scope/meaning authorityへ戻す。L2はscopeとprofile集合を選択しない。L11は制御fixtureに対するpositive/negative oracleのみ記述し、実OS runtimeの実行、CI、実装、支援実績、要求stageの通過・人判断を要求しない。OS-020のrun運転・receiptは運転結果、HARNESSのtier/profile oracleは要求意味として分離する。

source holding `MPR-SH-IR-003`と旧carry-forward rowsは変更していない。旧HIL要求は引き続き`preserved_pending_rehome`、successor IDなし、明示human decision以外のchange authorityなしである。ここでの`no_loss`はreceiptに記載した4 source meaning sliceだけを未採択候補へ対応した意味であり、HIL-FR-34の個別fixture条件、HIL-14全体や旧IR全体のformal successor、closure、実装・受入成立を示さない。

## 検証

- 旧本文・IR・HAC-HIL-14a・旧assertion consumerの原文、asset ID、file/line hash、relationを静的照合した。
- 2026-09-28固定decisionとcurrent mainの採択済みL2/L11 rowsを比較し、HARNESS-005/022とOS-020/021の本文がfixed revisionと同一であることを確認した。OS-030は後続PO判断で保留のまま確認した。
- L2/L11候補section、source-lines JSONL、coverage receipt、register entryのID、digest、境界、対応関係を静的検証する。旧runtime/test/CI、新世代CIは実行しない。

## 最新mainへの追随

構築時72d08ebの照合は履歴として保持する。追補時点のmainは`6f859fc03c9add36d84eb153cb1832b26768d6d1`。L2/L11本文を照合し、HIL-NFR-09の二条件をpaired 064へ補った。4 source atomのID、原文、statement/atomset digestは不変である。

**#2490修正履歴**：初回candidate sectionはL2 semantic digest `89229ad55e389efab42a9e9bda7454149b4800b3520b456f289ed15ee1d62c29`（全file SHA `6bab0d72be55c0bf46d1d3b73fdd303c982abb5ad988a6d28fabea4137791e19`）、L11 section digest `7e66852d10d4438cccc30b0b99a3afd37625386925c9c1d59b9fe943d84091c4`（全file SHA `a5296268e41a12f6d334cd0e01f629082e5dbb01c4c236a7090b763f90a653f0`）だった。初回本文はHIL-NFR-09の「Linux primaryで全core gate」「macOS/Windows差異をadapter contract testで検出」を落としていた。今回L2/L11で両句を追補し、部分core gateのみ成功するfixture、adapter test欠落/stale/別profile証拠のfixtureを負例として追加した。追補後の確定digest/pinはcoverage receiptと唯一の`MPR-RC-HARNESS-L2-064-001`行に合わせて更新し、MPRに途中revisionを増やさず、初回digestをこの監査に履歴として残す。
