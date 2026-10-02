# HIL-NFR-32〜40 採択pair照合と残差監査

## 対象・固定根拠

- 旧原文は `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` の212–220行。旧assetは `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、file SHA-256は `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。各要求の原文・行digest・現行対応候補は `docs/governance/audits/requirements-stage/legacy-ir-quality-source-recheck-2026-09-28.md:288-368` に記録済み。
- 旧consumerの起点は `archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-requirement-definition-ledger.md:174-190` と `.../infinity-loop-assertion-coverage-ledger.md:190-198`。このassertion ledgerでは32→HIA-NFR-032/HOT-HIL-49/SemanticRevisionStore、34→HIA-NFR-034/HOT-HIL-52・53/JudgmentPackRegistry・SpecialistMusterGate、35→HIA-NFR-035/HOT-HIL-54/WorkerAcceptanceBench、36→HIA-NFR-036/HOT-HIL-55/EffortRouter、37→DelegationDataClassification、38→BypassGovernance、39→LocalEnforcementPrinciple、40→QuotaResilience（37–40はHOT-HIL-56）と記録する。33→HIA-NFR-033/HOT-HIL-50/ContractPortfolioPlanner・TemplateExampleCalibrator。旧functional/acceptance consumerはそれぞれHR-FR-HIL-19、HR-FR-HIL-21、HR-FR-HIL-22、HR-FR-HIL-23と対応HAT/HACであり、crosswalk上の詳細なL2/L11候補・line refsは上記source-recheckの各節に保持される。archive内のsource・consumerは読み取りのみで、実行していない。
- 2026-09-28 PO decisionが固定する採択済み基本pairのbaseは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。Decision内のL2/L11 whole-file digestを厳密比較に使い、各候補の現在の状態はdecisionと後続decisionの採択対象revisionから読む。後発候補の採択状態は `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:79,85,88,112` と個別receiptから確認した。
- 現行の拡張後ファイル全体はdecision時点のwhole-file hashと異なるため、旧pairとの直接比較は対象IDの原子的section/identity行と対になるL11受入節で実施。HARNESS-004/-005の主要L2行・L11 identity行、OS-004/-009の本文/受入行、およびOS-015..019の対になる受入節をbase commitとcurrent bytesで照合し、対象箇所の一致を確認した。
- これは要求意味の監査であり、L11実行、実装完了、正式successor割当を主張しない。新候補・新IDは作成していない。

## 採択pairとの照合

| 旧要求 | 対象pair／根拠 | 照合結果 |
| --- | --- | --- |
| NFR-32 | HARNESS-004/-005（2026-09-28 HARNESS decisionの固定L2/L11 file pins）、OS-015/-016/-019（OS decision固定L2 `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`、L11 `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`） | authority/revision、meaning impact、pair/oracle、rollback、downstream stale/unfinishedはHARNESS/OS pairに分担される。OS L2 515–532/L11 241–252がscope、authority、atomic consistency、rollback/recovery、downstream staleを同一変更の複合管理経路として記述するため、L2 joint guard欠落とは判定しない。未解決なのは同一change/base revisionに対する六つの独立欠落negativeを現行L11が十分示すかというfixture/oracle coverageである。 |
| NFR-34 | HARNESS-010/-011、INTELLIGENCE-014/-072-004、OS-015/-017/-018/-019。072採択decisionは候補生成とshadow評価まで（candidate pair pinsはdecision 57行85、registration receipt `intelligence-judgment-pack-coverage-receipt-2026-09-28-r4.json`）。 | receipt規則どおり072のL2/L11本文と追補を4部に分けて正規化し、4 part digestと連結digestがdecision pinに一致した。採択意味範囲でも候補packのsource/scope trace、shadow、独立review、既存authorityによる採用は自動化しない。旧NFR-34の全stale triggerとnamed fail-close条件は採択scopeに含まれない。意味残差あり。 |
| NFR-35 | INTELLIGENCE-010/-011、LABO-006/-055/-059、OS-018/-020、およびLABO-064-002。後者はdecision 57行79、L2 digest `e28da5b2f47c3d1327cc091003d14a7ab572a3282040b2ed7ec6614dae7079b8`、L11 digest `4f51be505b3c169f08aa61c2dd192b21b1b185db0f5243f556853bcb3e1a1fe3`。 | 採択064-002 pairは候補名遮蔽、fixture/rubric/judge version/sample/retry固定、smokeとfull benchの分離、重大security/scope/verification failureを平均で相殺しない条件を保持。source-recheck:319-322とaccepted pair pinが一致し、この範囲の残差なし。 |
| NFR-36 | INTELLIGENCE-010/-011/-067、LABO-055/-059、OS-018/-028/-029。INTELLIGENCE-067は2026-09-28固定decisionの採択集合に含まれる（固定pair pinsはJSONに記録）。 | 36の残差なし判定を撤回する。採択pairは比較、品質gate、retry/cost、停止等を分担するが、少なくとも「既定値からの逸脱receipt」と「品質問題へのescalation順序receipt」は条件ごとの採択根拠が示されていない。067は採択済みで、quality gate/priority/tolerance等の入力契約を既存proposalへ提供する。ただし、既定値逸脱と品質問題escalation順序の二receiptを要求する採択条件は確認できず、未証明を維持する。本文のhistorical candidate metadataは固定decisionの採択を覆さない。両receipt条件を未証明として保持する。 |
| NFR-37 | INTELLIGENCE-021/-022/-042、SECURITY-001/-006/-014/-016/-027/-029。SECURITY-029-002は`po-decision-2026-09-29-57candidates.md:88`で採択。decision SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`、選択時の全file SHA-256はL2 `d3103f909e540e35a95310e6741cfd038a87789150577ea182a941d58a5f2bd5`／L11 `e30e63771d58dae2ca69cb9cfff5d2ab6eb71311144aa263b068cb4ae4fbf556`、対象section SHA-256はL2 `0faf8ac952341e621c2f76f7ef44249f03a673ac0a37180f0034914df00f4745`／L11 `3a5d5311fd03cae17db54bd1ad323cb4222d44d43196c3a4d50ce2a8cf2759f0`（main `212cefee88df4b0914c6253aa109fe9d884eae51`の同heading sectionと一致）。 | 採択pairは分類、path allowlist＋secret scan、opt-out前提、未完了時の公開可能コードのみを追加runtime scopeで扱う。decision 57:112はこのscopeをprimary Workerへ広げない。したがってsource全体の残差なしとは判定せず、primary Worker適用範囲を保留する。L2/L11本文の「未採択候補」表示と採択decisionの不整合も記録する。 |
| NFR-38 | OS-018、SECURITY-006/-007/-008（2026-09-28 fixed pairs）、後発採択SECURITY-032-001（decision 57行91）。 | deny-default/operation authorityを既採択pairが保持し、SECURITY-032は有効なrepository-level permanent bypass denyがone-shot marker/provider flagに上書きされない優先順位を保持する（L2 `ccdd634f...`、L11 `5dcf1c19...` exact pins一致）。残差は、実行時だけ有効化する一時bypass設定を終了時に除去する条件と、YOLO許容を明示allowlistのないruntimeへの経過措置だけに限る条件。SECURITY-033はdispatch context bindingであり、このcleanup/allowlist移行条件を代替しない。 |
| NFR-39 | OS-018/-020、SECURITY-006/-007/-029-002（SECURITY-029 pinsは上記）。 | SECURITY-029-002 L2はvendor証拠の排除とlocal sandbox/network allowlist/egress/FS差分証拠を列挙する。L11はvendor-only proofを拒否してlocal evidenceを要求するが、原文の4種それぞれをどのcase/oracleで判定するかは示さない。decision 57:112はprimary Workerを適用scopeから除外する。全条件の閉鎖は未証明として保持し、本文の「未採択候補」表示と採択decisionの不整合も記録する。 |
| NFR-40 | INTELLIGENCE-010、OS-004/-009/-017/-018/-019。OS-017/-018/-019 pairとL11はOS decision固定file pins。 | 一般budget/deadline/累積attempt、停止、未完保持はある。quota/rate exhaustedを予定状態として表現し、fail-closeでqueue holdまたは代替runtime routing提案へ退避し、無計画retryを拒否する記述は見当たらない。SECURITY-029はsource-recheckでquota/rate retreatを明示的に範囲外とする。残差あり。 |

## OS管理経路の追加照合

OS L2 515–532およびL11 241–252は要求正本更新の複合管理経路を記述する。該当line-rangeのUTF-8/LF SHA-256は212cefeeとlatest main e05で同一（L2 `89ae22c348d83783920e5423d7c3bbe076c2b315b1dd6fcc65fbea416461cbd5`、L11 `e39078e65d47e75116e10eeffe9a3791368e1c70c3cda3fa9256da37efeb6ea1`）。対象path/revision/line boundsは併記JSONの`requirements.HIL-NFR-32.current_management_path_evidence`に記録する。

## 旧IR／consumer条件単位の真偽

旧Requirement IR本文は一件ごとの `statement.semantic_digest` と `record.semantic_digest` をJSONに固定し、旧definition ledgerとassertion coverage ledgerの該当行、HR-FR consumer contract、HAC normal/negative/boundary oracle、HAT設計statusも結び付けた（JSONの `legacy_ir_source_and_consumer_records`）。各HATは `designed_not_implemented` であり、実行済みの証拠としていない。

| 旧要求 | 旧consumer oracleで明示している条件 | 現行pairとの条件別判定 |
| --- | --- | --- |
| NFR-32 | HR-FR-HIL-19/HAC-19bはauthority/impact/transaction欠落を拒否、HAC-19cはstaleとrename/split/merge時のidentity/rollbackを検査。 | 現行HARNESS-004/-005とOS-015/-016/-019に条件が分担され、OS管理節は同一変更の複合経路を記述するため、L2 joint guard欠落は主張しない。L11が同一変更/base revisionで六条件を一つずつ欠く独立negativeを列挙していないことを、限定的なfixture/oracle coverage確認点として残す。 |
| NFR-33 | HR-FR-HIL-20/HAC-20b/cはobligation/negative/S4 edge欠落拒否と発見deltaのbackflow。 | 採択pair比較でcoverage正しさと数量合格拒否は確認した。過剰重複のcontext-cost/drift-risk findingは確認済み残差として記録する。IR全条件・全consumerの適用scope別照合を完了したとは証明しておらず、source全体の唯一残差やclosureとは断定しない。比較記録は本監査の「NFR-33 採択pair照合と確認済み残差」節に統合した。 |
| NFR-34 | HR-FR-HIL-21/HAC-21b/cはself-promotion・未許可tool・自己検証拒否、およびcatalog変更時stale化/再生成/retire。 | 採択072-004はcandidate/shadow範囲で非権威/独立review境界を保持するが、全legacy stale triggers、未許可tool、subagent上限、工程外completion authorityの閉包は示さず残差。 |
| NFR-35/-36 | HR-FR-HIL-22/HAC-22a/b/cはblind bench/実task比較、重大failure非相殺、品質低下時model/effort比較rerouteを要求。 | 064-002がNFR-35条件を保持。36は採択pairによる関連範囲を確認したが、既定値逸脱receiptと品質問題escalation順序receiptは未証明。067は固定decisionで採択済みだが、二receipt条件の閉鎖根拠にはならない。 |
| NFR-37/-38/-39/-40 | HR-FR-HIL-23/HAC-23a/b/cはsandbox/分類/opt-out、allowlist外・scope外・機密委譲・persistent bypassの拒否、quota枯渇/egress乖離時fail-close退避/quarantine。 | SECURITY-029-002は追加runtimeに限るdata/opt-out条件を保持するが、decision 57:112はprimary Workerを除外する。39は4種類のlocal enforcement evidenceをL11 oracleへ種類別に対応付けておらず閉鎖未証明。本文には「未採択候補」とありdecisionと不整合。38/40残差も維持する。 |

旧IRでは37–40が共通 `HR-FR-HIL-23`、`HAC-HIL-23a/b/c`、`HAT-HIL-23`を参照する。これらのconsumer oracleを各旧identityの条件へ照合し、全てを一括で「採択済み」または「欠落」とは分類していない。



## NFR-33 採択pair照合と確認済み残差（統合記録）

旧HIL-NFR-33（L1:213、statement digest `fd35b9d635312dc6f0e848c4bcbd28c70b5e8cd7da6aa1af4810053e9481fe35`）は、件数による十分性判定を拒否し、全適用obligation/rule/branch/risk/V-pair oracleの一意coverageに加え、過剰な重複contract/exampleをcontext costとdrift riskのfindingにする。

採択済みpairは次の通り照合した。HARNESS-L2-041-003は11-candidate decision行27で採択され、041のsection pinはL2 `d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260`、L11 `11759276200a6707762e76eeeefd901443e691bd1b0ff51b55cd3b6551fed58b`。HARNESS-L2-043-002および044-002は57-candidate decision行48/49で条件付き採択され、section pinはそれぞれL2/L11 `da678d9181ebe76ae93084c27744d253c617ebe03b709d79f55b79d2abbc6666` / `583bfaf669729d3148e072be3ca74f1ef125997e933f6a1a94f08c732cb6f4b4`、および `690f2bfa866c778be47459baa99139905260d3ca569739a4d4707c61096212f2` / `9c79b73100f4afa63abba7f79d47b8931a1c29983ac08a3e4ded95e56107bfc8`。これらのsection bytesは本監査base `94e7132ecec04043ae18c4a93c2ca35426001199` の現行L2/L11と一致する。

041はactive-template要素の原子的obligation抽出とgap提示、043は全適用validation rule/applicability branchに対する例・oracle・risk coverage、044は適用義務classのcontract/oracle coverage、未被覆と意味重複を扱う。この照合対象の範囲では、数量だけの合格拒否、applicable coverage、semantic overlapの責務が既採択pairに対応する。一方、比較したこれらの本文は「過剰な重複contract/exampleをcontext costとdrift riskとしてfinding化する」明示条件を含まない。この比較で確認できる残差として、過剰な重複contract/exampleをcontext costとdrift riskのfindingにする明示条件を記録する。ただし、この監査はHIL-NFR-33のIR statementと全consumer条件を全採択pair/各適用範囲へ漏れなく写像したことを証明していないため、これを唯一の残差またはsource全体のclosureとは断定しない。別監査ファイルへの参照には依存しない。なお本節はNFR-33の採択状態や正式successorを新たに生成しない。

## 対象pair section/row pins

選択範囲の行またはheading sectionをUTF-8、末尾空行trim、LF終端でhashし、現行bytesとbase commitの値が一致することを確認した。L11のOS acceptance見出しsectionは各見出しから次の同格以上見出し直前まで。

| Pair | L2 selection SHA-256 | L11 selection SHA-256 | 選択方法・revision比較 |
| --- | --- | --- | --- |
| HARNESS-004 | `a0bdbfc0c42286cb33eb6268d22c7a79f223c8e17478008b8e718df45e482108` | `89bc08f991cf39168eb745713fe8623f172f934975935b19f939211833199632` | 一致 |
| HARNESS-005 | `6d4ca115f2d2114ddfa4dd41b4ec0305cb4818954b64ebb66bd2a08a39e5f63f` | `d13efe4614dd4455583bc7fe5f4585829082a4dcbb28e8159b33f4bbb72925eb` | 一致 |
| OS-004 | `84ca221c8917168e8eeb9a7481b7176c0b0484a0077de6b8fe1a6a88512a84a5` | `2c3954ea845306a2120f9119ea3b6503ba4957b5eab2b23b946a2f04cc5a19a1` | 一致 |
| OS-009 | `23a8653051671a6b68bbf8502d04aa7cb76f4286a57cc4d54a50331cae567452` | `276390afe57ef9ae94f40616bca0a756f962c4a3b230ea090080da065cedeed8` | 一致 |
| OS-015 | `f2dc267a0ee538ea6c5e8e96e28f7853c674f0afd7506763fd8277a9181cd6ef` | `79fabc2e1eed7f8ccf3e3ac1ea88c6d5fa0a1bb9cb392835912aa6b0ce04caa0` | 一致 |
| OS-016 | `10242ad9ca2021f29a096b0037c1349dbb332c1ea91f185065bec11ea86a6743` | `2dc46eb36e8ca552c079ade0dad329c2ca0c244f4c2493a06eec4f60647897a3` | 一致 |
| OS-017 | `d8bf7fe2ecbe9c1ef8a709b58af8dec1eeab15171b6932002a834b438f6fd1df` | `33fa3c66d69861c88593bccd1b2c22d2a92b4c6b5ec82c4456f0bf2ce52d3f4a` | 一致 |
| OS-018 | `4ca189ed491490e2ed1ee75095b64d2e294319e6132d4595d631fcd4ba8bc408` | `77e8ef58e9774503379bb3a84a0218fa29dbad536e142122c7bee8e8bc0b1d53` | 一致 |
| OS-019 | `9362a64eef0f04968a8b1e89fde0027a145d5ab5c6aa9a6423d6e05e19ed447a` | `9e17211bf2f7f54a58e2be30e23335954d94e184573912ed4f3ac92246838351` | 一致 |
| SECURITY-006 | section 120–129: `8bcb8c56772c18c8afb3bbd016cade4511da47533cbc39cb0f775860fe4bbee3` | row 30: `a910c8b1352414d2e6e3ad39f093a936f19b8a3c353411eeefa7a877fba3f7e7` | f6 / 94e / 212で同じ選択bytes |
| SECURITY-007 | section 130–139: `1ee4d42a1e4178d598ce11b75268845578ba83bcb8ea471e2642ff8630c49504` | row 31: `bb6dc9697c4bc21ad94cce4f2ad97c796706327d33686858eed1831378b4c155` | f6 / 94e / 212で同じ選択bytes |
| SECURITY-008 | section 140–149: `6135842a799b9883cb29c5ce9e6ffcf601997d66cb3d314c8031ba9cbbae9f2c` | row 32: `05d6af862333dd496de98c2f469b6e50a9d2817442b7b1c83c93ac9348821a25` | f6 / 94e / 212で同じ選択bytes |
| SECURITY-029-002 | `0faf8ac952341e621c2f76f7ef44249f03a673ac0a37180f0034914df00f4745` | `3a5d5311fd03cae17db54bd1ad323cb4222d44d43196c3a4d50ce2a8cf2759f0` | decision 57:88と一致、57:112はprimary Workerを除外 |
| SECURITY-032 | `ccdd634fb92621105310b91465e01bd089238cc430491ff3c8ac51a3d80403c8` | `5dcf1c19728badff041220d610a85c3507a6c6f70fea57c0081ae9902705c6f1` | 一致 |

各pinの機械可読locatorは併記JSONの`exact_pair_section_comparison.pairs`に置き、source path/revision、選択identity、1-based start/end line、境界、正規化、実測digestを記録した。NFR-33の041/043/044と固定010/011/023は`nfr33_adopted_pair_exact_selections`、後発採択064/072は`adopted_pair_pins.later_adopted_pairs.*.exact_selection`に同じ粒度のlocatorとreceipt照合結果を記録する。これらは範囲限定の選択pinであり、全sourceまたは未対応条件の閉鎖を意味しない。

SECURITYのbase decisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`のL2全file SHA-256 `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`、L11全file SHA-256 `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01`を固定する。006/007/008のL2 sectionは006が120–128行（129行の空行をtrim、130行の次heading直前）、007が130–138行（139行の空行をtrim、140行の次heading直前）、008が140–148行（149行の空行をtrim、150行の次heading直前）を選択し、末尾LF一つでSHA-256化した。L11は固定revisionのtable row 30/31/32を行末LF込みでSHA-256化した。各L2 sectionとL11 rowをbase `f6dad2a`, comparison main `94e7132`、latest main `212cefee88df4b0914c6253aa109fe9d884eae51`から抽出し、選択bytesの同一を確認した。Decision自体に個別row SHA pinがあるとは主張しない。従前のL11値`0a48798...`／`982d003...`／`42b074...`は、存在しないL11 ID sectionとして扱った誤選択hashなので撤回する。

HARNESS行hashはIDが先頭列にある原子行だけを選択。OS-004/-009も主要求定義行だけを選択し、OS-015..019/SECURITY-032は各L2見出しsectionとreceipt crosswalkに記録された対応L11受入section digestを使う。SECURITY-006/007/008のL11はID別sectionがないため、f6の固定decision file内table row 30/31/32と比較main 212の同じrowを選び、行末LF込みのdigestを算出した。072-004/064-002/SECURITY-029-002は後続decision/receiptのsection pinと現行sectionを照合した。SECURITY-029-002はdecision 57:88の採択row、L2/L11全file pin、上記section pin、main 212の見出しsectionをそれぞれ照合し、decision 57:112のprimary Worker除外を保持した。

## 静的検証

- 072-004はreceipt R4指定どおりL2 original/supplement、L11 original/supplementを別々に正規化して4 part hashesを照合し、4つすべて一致、連結digestもdecision pinに一致した。064-002とSECURITY-029-002のL2/L11 section pinsも一致した。
- 旧source行の意味・digestとconsumer mappingはsource-recheckに照合した。NFR-35/-37/-39の後発pair状態とNFR-34の条件付き採択範囲は、対応decision/receiptを照合した。
- 旧CLI、runtime、hook、test、CIは実行していない。差分のみを `git diff --check` とJSON parseで検証する。


## 最新mainへの再照合（e05a45ca）

比較revisionは `e05a45ca27104e37909c49388c38ece0cf1c69f0`。固定・歴史revisionの66 locatorの明記した行範囲について、選択した生bytesが最新mainの連続行範囲に完全一致することを再計算した。JSONの `latest_main_e05_comparison` に当時の行位置と全文SHAを履歴として保存した。旧locator・抽出規則・pinは変更していない。072の4部分のcanonical本文連結digestも独立再計算して一致した。



## 最新mainへの追補再照合（43d5ff7f）

e05a45caの66 locator比較は `latest_main_e05_comparison` に保持し、同じ66 locatorを `43d5ff7fdb00152b8b3f7aed2aa459ad8b0cb7b5` で再照合した。e05の各locatorで実際に選ばれたraw bytesを基準に43d5の同じpathを検索し、全66件で一意の連続一致を確認した。選択範囲のSHA、43d5上の行位置、raw full-file SHAはJSONの `latest_main_43d5_comparison` に記録した。旧revision・行範囲・正規化・pinは変更していない。HARNESS-L2-023の固定分類pairも43d5で再hashし、L2 `32ad44e70357315304c5da5ce012f7ba4b9956e27a699f21ecddea1c54eeaf03`、L11 `f505c8e6a2887ac0cf757a78de6617f9a9ee3f9e36084fee70b8a11915815a47` で一致した。

これは選択した範囲の比較であり、旧原文全体の無損失、受入の実行、候補の採択、要求ステージ完了を証明しない。各残差と意味の制限は本文のとおり保持する。

## NFR-37〜40の候補導出用draft材料

ここは旧source条件から将来のL2/L11へ導く材料であり、新しいcandidate本文・ID・MPR登録ではない。現行L2/L11や採択pairを変更しない。機械可読なsource・consumer・pair pinと条件分類は同名JSONの`nfr37_40_candidate_draft_materials`に記録した。

### 固定sourceと採択状態

旧L1 sourceは `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`、asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。旧main `e05a45ca27104e37909c49388c38ece0cf1c69f0` 上のL1 line 217–220はNFR-37..40を保持する。各行SHAはUTF-8の行末LFを除く値で、既存source-recheckのline SHAと照合した。line 84のHIL-BR-32は `3118efe1554c4ca3438938e76112b255450c927e1b10a515ec4b3216e505b830`（末尾LF除外）で、「Claude/Codex以外」のruntimeを明示する。

IR `requirements.json` 全体はSHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。各source conditionを旧IR statementへ照合し、JSONにIR JSON pointer・statement/record semantic digest・対応L1 row pin・原文フレーズを保持した。37はIR `#/HIL-NFR-37`（statement digest `c193885771e85f07857776dbce87ceac9cb91725d64aa68eddd53ff2aa4902db`、L1 line 217 SHA without LF `e493bf6afa43ccf38100d8cec75a25bf7616d8b1d1937553a5b7f813a097923b`）、38は`#/HIL-NFR-38`（`623495c53d8e952d930ee57bc420714a8ed8e9749859fa4597543ff156e8fd9f`、line 218 `34a91d2f4e367f8500455e8dfd2f2283b7fac60b9eb028c3a2da1cef5c0f4c41`）、39は`#/HIL-NFR-39`（`cf1a0879fbc1f7ca13a8fda0f6910ea0be3beedec24ec49e122f4e16d2212cfa`、line 219 `401872570b54c51ecd23f4aee8c09f9ae0a729c10aba0260759038de35a3bc5e`）、40は`#/HIL-NFR-40`（`4171419553664d7150ffe9875c14b6bc5212f14635d339dafc2af08ddc656c54`、line 220 `89e31140c248c2f1bcb7140bd6549f7d86768c2c2bcf2ce88d623e7a06f01f95`）。ここでIR statementが規範source、L1 rowは旧source corroborationである。HR-FR-HIL-23は旧 `system_contracts.json#/HR-FR-HIL-23`（file SHA `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`、record semantic digest `9f4d2db470aaa44878294d41641b87736f43c7dd87c35d650951b134c4465070`）およびL3 requirement line 57（file SHA `8a46a6a75f1c6159b45b09bd975298347f70997b7969231a0514c09db210dab6`）で、HIL-BR-32、HIL-FR-64..69、NFR-37..40を同じ第三者worker委譲契約へ結ぶ。HAC-23aはsandbox完走・proposal再検証、23bはegress/scope/機密/bypass拒否、23cはquota枯渇・egress逸脱時のfail-close退避とquarantine。HAT-23のrequired evidenceはsandbox/egress/payload/FS diff/audit receiptだがstatusは`designed_not_implemented`で、実行済み証拠ではない。旧共有consumerを4つのIRへ無条件に配分せず、各condition mappingは未確定分を残した。

57-candidate decision file（e05上SHA `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`）はSECURITY-029-002をline 88で採択、SECURITY-032-001をline 91で採択する。line 112（SHA `0680cb7a3f6a5f7f0c9f9a0043c33a3a040a7035580c3f95bbaa1e41ba937383`）は029/031の追加runtime向け制限を主Worker全体へ広げないと明記する。候補本文の「未採択」metadataはこの採択を打ち消さない。

| 現行採択pair（e05） | 採択対象L2/L11 section SHA-256 | 条件の範囲 |
| --- | --- | --- |
| SECURITY-029-002 | L2 `0faf8ac952341e621c2f76f7ef44249f03a673ac0a37180f0034914df00f4745`; L11 `3a5d5311fd03cae17db54bd1ad323cb4222d44d43196c3a4d50ce2a8cf2759f0` | 追加runtimeの分類、path allowlist+secret scan、opt-out前提、vendor claimとlocal evidenceの分離。primary Workerは適用外。 |
| SECURITY-032-001 | L2 `ccdd634fb92621105310b91465e01bd089238cc430491ff3c8ac51a3d80403c8`; L11 `5dcf1c19728badff041220d610a85c3507a6c6f70fea57c0081ae9902705c6f1` | 有効なrepository permanent bypass denyがone-shot marker/provider flagに上書きされない優先順位。 |
| OS-018/-019 | L2 `4ca189ed491490e2ed1ee75095b64d2e294319e6132d4595d631fcd4ba8bc408` / `9362a64eef0f04968a8b1e89fde0027a145d5ab5c6aa9a6423d6e05e19ed447a`; L11 `77e8ef58e9774503379bb3a84a0218fa29dbad536e142122c7bee8e8bc0b1d53` / `9e17211bf2f7f54a58e2be30e23335954d94e184573912ed4f3ac92246838351` | assignment・budget/deadline・停止/handoff、累積制約・未完義務・証拠の継続。quota/rateの予定状態と退避選択は明示しない。 |

すべてのpairはe05 mainから見出しidentityで選択した。選択規則は次の同格以上見出し直前まで、末尾空行を除いてUTF-8へLFを1つ付けてSHA-256化。security 029はL2 line 405–415（次heading 417）/L11 89–95（次heading 97）、032はL2 447–453（次heading 455）/L11 116–122（次heading 124）。OS-018はL2 672–680/L11 345–350、OS-019はL2 682–690/L11 352–357を同じ正規化で選択した。ファイルSHA・decision行pinもJSONへ固定した。

NFR-37/39のscope差は断定しない。HIL-BR-32 line 84が追加runtime（Claude/Codex以外）を定義する一方、HR-FR-HIL-23 line 57はNFR-37..40を含む第三者worker委譲契約だが主Worker例外を書かない。NFR-37 line 217は「第三者runtime」、NFR-39 line 219はHELIXのlocal enforcementを規定する。既採択029とdecision line 112のprimary Worker除外が、このより広いHR/NFR組合せをすべて閉じたとは扱わない。029を暗黙に拡張したり、主Workerへ追加runtime条件を自動適用したりしない。scopeを広げる判断が必要ならexact target revisionのPO判断に残す。

HARNESS-L2-023の4依存区分は分類方法として使う。固定採択pairはf6 revision、L2 `docs/helix-harness/L2-requirements/product-requirements.md:463-497` SHA `32ad44e70357315304c5da5ce012f7ba4b9956e27a699f21ecddea1c54eeaf03`、L11 `docs/helix-harness/L11-acceptance/product-acceptance.md:219-233` SHA `f505c8e6a2887ac0cf757a78de6617f9a9ee3f9e36084fee70b8a11915815a47`。見出しsectionから次の同格以上見出し前までを選び、末尾空行を除いてLFを1つ付けたSHA。四区分は常時必須／特定操作時のみ必須／選択sourceに応じて必須／参照資料のみで、定義はこのpairの本文と対L11に記録される。ここでは分類方法としてのみ使う。IR whole source atomはnormative sourceとして常時保持する。旧L1行はそのcorroborationとして記録し、IRとL1はいずれもruntime dependencyではない。HR/HAC/HATは共有consumer/oracle evidenceで、source条件を適切な単位へ割り当てる根拠として保持する。4区分は実行dependencyの分類だけに使い、normative IR、L1 corroboration、consumer condition/oracleをreference-onlyへ降格させない。reference-onlyは023のruntime-dependency分類上のconsumer contextに限り、source条件やoracle義務をそこへ降格させない。

### HIL-NFR-37 — 追加runtime sliceは既採択、primary scopeは未決着

**旧条件**は、委譲dataをpublic/confidential/secret・PIIへ分類し、機密以上の第三者runtime委譲をpath allowlist+secret scanで遮断、runtime採用にはopt-out完了を前提とし、未完了中はpublic codeのみ委譲すること。SECURITY-029-002はこの条件を追加runtime sliceで採択済みなので、分類・opt-out gateを再提案しない。

**L2 draft材料**：BR-32の「Claude/Codex以外」がNFR-37/HR-FR-HIL-23のscopeを限定するか、HRの第三者worker委譲scopeにはprimary Workerも含むかを分けて保持する。BR-32の境界を採るなら既採択029 sliceへ正確にmapする。primary Workerまで含める意味なら、採択済029を編集せず、POが対象範囲を決めた後の対象revisionで別途mapする。

**L11 fixture材料**：追加runtimeのpublic/opt-out完了、opt-out未完了時の非public拒否、機密以上・secret/PII拒否、unknown分類拒否、runtime/version/configをまたぐopt-out evidence流用拒否は現行029 L11にあるため重複しない。source scopeを広げる決定があった場合だけ、主Workerケースを別caseにして006/007/016既存条件との関係を明示する。未決着中のprimaryケースはpass/failを推測しない。

023分類は、常時＝source identity・評価対象revision・既存classification/authority、操作時＝選択したruntimeへのdata delegation gate、選択source＝そのruntime/version/config・payload classification・scan・opt-out evidence、参照のみ＝HR/HAC/HATのconsumer contextだけ（023 runtime-dependency分類上）。共有condition/oracle evidenceは別途保持し、IR whole sourceは規範source、L1行はそのcorroborationとして4区分の外に保持し、どちらも実行dependency分類へ入れない。provider UI/declaration/flagは充足根拠として認めない。

### HIL-NFR-38 — permanent deny優先は既採択、temporary lifecycleは残差

**既採択**SECURITY-032はpermanent repository denyとone-shot/provider flagの優先順位を扱う。deny優先条件を再提案しない。既存006/007/008とOS-018のnetwork・execution constraint・operation authority・assignment/stopも再作成しない。

**L2 draft材料**：残る条件は、選択されたYOLO/bypass/auto-approve設定を実行中だけ有効にし、そのrun終了時に除去すること、およびYOLO許容を明示allowlistを持たないruntimeへの経過措置に限ること。allowlist対応runtimeは明示allowlistを使う。SECURITY-032が扱うdeny優先と、repository設定でdenyを利用できる能力は同一条件とみなさない。後者が現行pairにあるという根拠はこの監査で確認できず、032の前提から存在を推定しない。

**L11 fixture材料**：allowlist対応runtimeでallowlistを使いYOLOを有効化しない正常例、allowlistのないruntimeでの移行中だけの限定利用、成功/失敗/cancelを含むrun終了後に次runから設定が消えている例を分ける。persistent setting、対応runtimeでのYOLO代替、次runへの残置は負例。032のpermanent deny対one-shot/provider flagは現行採択oracleのままとする。

023分類は、常時＝同じsource/revisionと既存操作権限/deny状態、操作時＝bypass/YOLO設定を選んだrunのcleanup/allowlist条件、選択source＝当該runtimeのallowlist能力・run・repository policy、参照のみ＝HR/HAC/HATのconsumer contextだけ（023 runtime-dependency分類上）。IR whole sourceは規範source、L1行はそのcorroborationとして4区分の外に保持し、共有consumer conditionは別途保持する。provider説明はlocal enforcerの証拠ではない。期限、runtime一覧、承認、schemaを追加しない。YOLOの廃止や期限の固定は意味変更としてPO判断へ送る。

### HIL-NFR-39 — local evidence四種類のoracle対応が未証明

**旧条件**はvendorのprivacy UI・修正宣言・remote flagを充足根拠にせず、security充足をlocalに検証・強制できるOS sandbox、network allowlist、egress実測、FS差分検査で判定すること。追加runtime sliceの意味は既採択029にある。残るfixture材料は四種類を一つの曖昧な「local evidence」にまとめず、どのcaseがどの証拠を検査するかを明らかにすること。

**L2 draft材料**：既採択029のlocal enforcement条件を再記述・拡張しない。evidence種類をsource名どおり分離し、selected operation/scopeで該当する証拠を用いる。原文だけから全操作へ四種類全てが一律必須とは推定しない。

**L11 fixture材料**：sandbox欠落/未適用、network allowlist欠落・scope不一致、egress測定欠落・許可範囲外、FS diff欠落・許可外変更を個別negativeにする。positiveでは選択したoperationで適用される各証拠を照合する。vendor UI/宣言/remote flagだけを与えlocal evidenceを欠く独立negativeも置く。一証拠を別証拠の代用にしない。primary Worker適用fixtureはsource/target scope決定まで追加しない。

023分類は、常時＝claimのtarget/revisionと既存security policy、操作時＝sandbox/network/egress/FS各enforcement surfaceに応じた証拠、選択source＝そのruntime/config/scopeのlocal evidence、参照のみ＝HR/HAC/HATのconsumer contextだけ（023 runtime-dependency分類上）。IR whole sourceは規範source、L1行はそのcorroborationとして4区分の外に保持し、consumer oracleは別途保持する。provider claimはlocal proofを満たさない。主Worker適用scopeを広げること、またはlocal-enforcementの意味を変えることはPO判断が必要。

### HIL-NFR-40 — quota/rateを予定状態として扱うlane retreat

**旧条件**はquota枯渇/rate制限を予定状態として扱い、laneがfail-closeで「queue hold」または「別runtimeへのrouting proposal」へ退避し、枯渇を無視した続行や無計画retryを行わないこと。OS-018/-019が持つ一般budget/deadline/attempt stop、handoff、cumulative constraintとevidence continuityは再提案しない。INTELLIGENCE-010のplacement proposalはroute proposalの根拠として有効だが、実行済みroute、dispatch許可、quota/rate状態の証拠ではない。SECURITY-029のdata/opt-out pairからquota retreatを推測しない。

**L2 draft材料**：選択runtimeがquota/rate状態を返した場合、その状態を成功と区別した予定済み非成功状態として扱う。laneはfail-closeし、sourceが示すどちらか一方（queue hold または別runtime routing proposal）を返す。proposalを自動dispatchへ変えず、既存OS assignment/authorityを通してから再開する。無計画retryを拒否する。retry数・時間・quota閾値・reset時刻・provider schemaは新設しない。

**L11 fixture材料**：正常例をqueue holdとroute proposalの二択で別々にする。quota/rate exhaustionを無視した続行、計画されていないretry、generic transient errorとして状態を捨てる例、proposalを承認済みroutingとして即時dispatchする例は独立negative。後刻利用可能状態に戻る場合も、既存assignmentと累積制約を保ったhandoff/restartを確認する。HAC-23cはquarantineも述べるが共有consumerの割当は未確定なので、NFR-40へ自動追加しない。

023分類は、常時＝既存OS assignment/authority/scope/budget/deadline/continuity、操作時＝quota/rate event時だけretreat、選択source＝実際に選択したruntimeからの状態、参照のみ＝HR/HAC/HATのconsumer referencesだけ（023 runtime-dependency分類上）。IR whole sourceは規範source、L1行はそのcorroborationとして4区分の外に保持する。共有quota/fail-close/quarantine条件は別途保持し、正確な割当なしにNFR-40へ配賦しない。INTELLIGENCE-010はplacement/route proposalの証拠になり得るが、実行済みroute、dispatch authority、quota/rate stateの証明にはならない。sourceの二つの退避方法のどちらかを守る限り追加PO選択は不要。自動reroute、hold-only、固定retry計画を要求する変更は意味変更となりPO判断が必要。

### draftの適用限界

これはsource-faithful draft材料であり、requirements candidate、MPR、採択、実行、test passを作っていない。旧test/runtimeは実行していない。SECURITY-029/032、OS-018/019、SECURITY-006/007/008の選択済み本文は変更せず、既存規則と新たな意味条件を重複させない。全caseでIR whole source atomをnormative sourceとして保持し、旧L1行はそのcorroborationとして4区分の外に記録する。HR/HAC/HATはconsumer/oracle evidenceとして保持しつつ、023では実行dependencyにしない。どちらも新authorityにはしない。

## 最新mainへの追補再照合（86ecd59a）

最新main `86ecd59a54f0c612a7f87e1cb4fea038dcc35f3c` の対象ファイルを生bytesで再読し、固定66 locatorを再計算した。全66選択のhashが元pinと一致し、各選択bytesはそのpath内に一意に存在する。HARNESS-L2-023の固定sectionもL2 `32ad44e70357315304c5da5ce012f7ba4b9956e27a699f21ecddea1c54eeaf03`、L11 `f505c8e6a2887ac0cf757a78de6617f9a9ee3f9e36084fee70b8a11915815a47`で一致する。e05と43d5の比較記録は履歴としてJSONに保持した。詳細な行位置・full-file SHAは `latest_main_comparison`、旧比較は`latest_main_e05_comparison`と`latest_main_43d5_comparison`を参照。選択範囲外のsource同値や全条件closureは示さない。
