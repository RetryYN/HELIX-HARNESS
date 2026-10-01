# HIL-14b adapter failure boundaryの現行条件照合と限定候補

## 対象・基準

対象は旧HR-FR-HIL-14のうちHAC-HIL-14b、HIL-FR-34/HIL-TR-05のadapter failure結果、旧assertion consumer HST-CASE-014-04..07である。14aのsupport tier、14cのonline/offline parity、HAT-HIL-14全体、IR atom全体のclosureは判定しない。旧source、decision史、test/runtime/CIはread-onlyで照合し、一切起動していない。

現行比較基準はorigin/main 72d08ebc1b45c8cf85c0e89359c48f78eb779fee。親監査 docs/governance/audits/requirements-stage/hil14-auxiliary-platform-and-supply-chain-contract-audit-2026-10-01.md のSHA-256は5d7d3381532138b4c6331a56490b0bd6207abfdf1615a8c35dc17532a42e953b。同監査の旧sourceは次のpinであり、今回も同じbytesを照合した。

| Source | Asset / SHA-256 |
|---|---|
| 旧L1 infinity-loop-platform-requirements.md | LEGACY-ASSET-719D5EC9C06FC4AAD0FF / db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb |
| requirements.json | 80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688 |
| system_contracts.json | 2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab |
| acceptance_cases.json | 4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19 |
| system_tests.json | 7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a |
| infinity-loop-system-assertion-cases.md | LEGACY-ASSET-7B1C7AED3AA401868455 / 98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8 |

旧assertionはnot-implementedであり、実績証拠ではない。

**数値結果の直接source**：HIL-FR-34 line 124はfixture項目（process group/file lock/SQLite）とadapter適用の親条件であり、`0`という結果値を記載しない。cancel terminal時のprocess残存0は直接consumer `HST-CASE-014-06` line 126、SQLite lock競合・再試行上限到達後にfailedとなった際のpartial transaction 0は`HST-CASE-014-07` line 127が規定する。両consumerはasset `LEGACY-ASSET-7B1C7AED3AA401868455`、file SHA-256 `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8` に属する。候補source ledgerでは親要求meaning atom 2件と直接consumer oracle atom 2件を異なる`source_kind`で区別し、同じ候補source set digestへ4件含める。

今回の個別consumer行は上記同一Markdown bytesから次のline SHA-256で再照合した。

| Consumer | 行 | SHA-256 |
|---|---:|---|
| HST-CASE-014-04 | 124 | a5e876aad99005bb57fdd8b6ecdc912638f28ae75f7702d5c3e593ac39c8c1b5 |
| HST-CASE-014-05 | 125 | 82db7fad53774364268f19c3f58c683cf9f8163ac42201a3106bfc17ac3ccf79 |
| HST-CASE-014-06 | 126 | ea1be9ae072245d5b961d1119f7283fea00919d7db85eaa60e697ca61e39972b |
| HST-CASE-014-07 | 127 | c4650ad99a84b5792df72d28de18257e927f25d8b46336e88220ac6173473cca |
| HST-CASE-014-08 | 389 | b7f526a0ca976c30e89bbec229684327fb8e075c75ee50bd57fdc0df1127377f |
| HST-CASE-014-10 | 420 | a198850feb002ba9a6b6c0b7c1989a51d1c06471d1a6fa15321218e1bd844bf8 |

## 旧sourceのfailure意味

- HIL-FR-34 line 124は、同じedge fixtureにpath separator/case/space/Unicode/permission/symlink/signal/process group/file lock/SQLite/executable discoveryを含め、Linux/macOS/Windows adapterへ適用し、OS contract resultとadapter violationを返す。
- HIL-TR-05 line 169はpath/process/signal/file lock/SQLite/executable discoveryをOS adapterへ隔離し、Linux CIを基準、macOS/Windows smokeを互換性証拠とする。
- HR-FR-HIL-14はOS差分をadapterへ隔離し同じcontractで3 profileを検証する。failure/evidenceはadapter leak、process/lock anomaly等を含み、transitionにdomain fork 0を置く。
- HAC-HIL-14bはnegative acceptance「adapter leak/path/process/lock異常拒否」。HAT-HIL-14はdesigned_not_implementedでadapter leak/process/lock/unlock/policy違反をnegative boundaryに挙げる。どちらも個別結果を定義しないのでassertion consumerも照合した。
- HST-CASE-014-04 line 124はdomain platform branchをadapter leakとして拒否。014-05 line 125はroot外を指すsymlinkのpath contractを実行しroot外write 0件。014-06 line 126はrunning child groupへcancel signalを送り、cancelled時点でprocess残存0件。014-07 line 127はSQLite lock競合でretry上限までwriteしfailed時partial transaction 0件を要求する。014-08/10 lines 389/420は共通fixture/domain fork=0、014-09/11はtierとLinux completion/non-inferenceを扱う。

## 採択済み現行条件との照合

2026-09-28のHARNESS/OS/SECURITY PO decisionが固定したL2/L11候補だけをauthorityとして読む。候補metadata、旧要求、MPR、後続PO recordから別の採択を作らない。

| 現行条件・pin | 保持する保証 | 旧014との関係と限界 |
|---|---|---|
| HARNESS-L2/L11-005。L2 SHA 78c32b598f449cf80d90e0e35eab6d39b94bd150abbfd543bc75bdb8be949ae6、L11 SHA a216403173175d9683737b1ab82f7e0ff1a1e85f31b1b155ad63ee3c00cc096e、decision SHA c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23 | 構造ごとのoracle/expected failure/evidence/差戻し。unknownをskipへ変えず、構成体固有義務を下位passだけで消さない。 | 失敗fixtureを置く一般契約だが、子process残存0、partial transaction 0は選択済み本文に特定されない。 |
| HARNESS-L2/L11-022。同decision/file pins上 | 検証・受入の段階、成功/反例と成果物状態を分ける。 | 具体oracleの責任と枠を示すが、この2つの結果内容は明記しない。 |
| HELIXOS-L2/L11-020。L2 SHA bde0dcc4640e7afcf73fbc431d01ee3082fe6fda79c8d1b93b9572507037e3bf、L11 SHA cd0e750cab9e694eed060a619d50527239e1b1291b9550cc0c95dbbd486c7112、decision SHA 5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da | CI profileを組立/運転し、success/fail/denied/skipped/interrupted/staleを区別し同じHEAD/義務/許可境界へ未完状態を引き継ぐ。 | cancelled/interruptedとlock failureのrun state/receipt不足をOSが記録しHARNESSへ返すが、process tree停止やtransaction全体性の意味は定義しない。 |
| SECURITY-L2/L11-007。L2 SHA d3103f909e540e35a95310e6741cfd038a87789150577ea182a941d58a5f2bd5、L11 SHA e30e63771d58dae2ca69cb9cfff5d2ab6eb71311144aa263b068cb4ae4fbf556、decision SHA 7ad58a3f7d7dd68806e6eeb2c4b6ec97f9b8f2145ae9aae7969f1eedf4a7baff | write path、timeout/resource、file diff、rollback、結果回収とWorker実行環境での適用/観測。L11はscope外diff、rollback不能、partial stateを成功としない。 | 014-05 root外symlink write 0はwrite scope・実diff・禁止diff拒否・rollback/unknownの一般保証へ対応する。Security L2 source noteは物理symlink/junction/mount/hardlink/TOCTOU詳細を下流設計へ残す。具体試験未実行は要求レベル保証の欠落と同じでない。 |
| SECURITY-L2/L11-008/009。同じ2026-09-28 SECURITY decision | operation別authority、unknown deny、revoke/quarantineとOS新規割当停止/Worker停止/途中成果隔離。 | 適切なscopeで停止を伝播するが、cancel terminal resultが所有child全終了を待つか、lock失敗後partial stateを許すかは定義しない。 |
| SECURITY-L2/L11-012。同decision | supply-chain provenance fieldの追跡。 | provenanceの近接条件であり、process/state failure result oracleでない。 |
| HELIXOS-L2/L11-018/019/020。同decisionの採択集合 | 018はassignment/attempt、二重claim/実行拒否、途中成果の隔離と未完義務handoff。019はdurable event/projection/replay失敗時にsuccess checkpointを出さず原eventから再構築。020はsuccess/fail/denied/skipped/interrupted/stale区分、隔離/回収/再開を持つ。 | cancel後の未完状態、projection failure、二重作業防止と返却先は保持。これらはcancelled terminal時の全owned child process終了、全選択state operationのfailure atomicityを一律に要求しない。未完handoffはchildが0である証拠でない。 |
| HELIXINFRASTRUCTURE-L2/L11-005/010。同decisionの採択集合 | 005はbefore/after、backup/restore/rollback適格性。010は実操作をSECURITY制約下Workerへ渡し、state-changing operationの実状態、部分operation、該当recovery/rollback義務を記録し、partial executionを成功扱いしない。 | operation contractがpartial effect後の復旧を許す場合は現行のfailed/incomplete + recoveryで扱える。HST-014-07のpartial transaction 0はall-or-none結果を求め、partial executionを記録して回復する一般条件と同じ保証ではない。どのoperationがall-or-noneを選ぶかは未選択。 |

HARNESS decision SHAはc7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23、OS decision SHAは5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da、SECURITY decision SHAは7ad58a3f7d7dd68806e6eeb2c4b6ec97f9b8f2145ae9aae7969f1eedf4a7baff。旧HIL-14の6 IR rowsはMPR-SH-IR-003でpreserved_pending_rehome、successor ids空、decision nullのまま。2026-09-29 57/11 decisionsと2026-09-30 live26をHIL-14 exact IDで照合しても採択・scope・successor・closureはない。OS-030は57件decision line 53と11件decision line 50で本体実行OS/consumer利用先、配布段階/切替条件を保留している。Linux限定やWindows却下の判断ではない。

## 条件別の保持と残差

| 旧condition | 現行保持/closure | 不足または保留 | 065候補への扱い |
|---|---|---|---|
| 014-05 root外symlink経由write 0 | SECURITY-007のwrite path、実diff、禁止diff拒否、rollback/unknownに対応する一般保証。 | 物理symlink/TOCTOUの検査方法は下流設計に残る。具体試験未実施でも上流要求の結果保証は既存で保持。 | 重複候補にしない。 |
| 014-06 cancel後process残存0 | OS-018/019/020はattempt/scope/status、二重実行拒否、interrupted状態と未完義務を持つ。SECURITY-007/009は制約・停止伝播、Worker ownerは起動/停止/回収を担う。 | terminal success前に親が止まること、同じ作業を二重開始しないことは保持されるが、cancelled terminalを返す条件として帰属child全体が停止したことまでは選択済みL2/L11にない。 | 子実行残存があるままcancelled terminalを返す意味差を候補065で提示する。実行・停止・観測の方式は既存Worker/OSに残す。 |
| 014-07 lock timeout時partial transaction 0 | HARNESS-009はconnection設計でtransaction/failure/retry/timeoutを見る。OS-019はprojection failureでsuccess checkpointを出さず原eventから再構築し、INFRA-005/010は適用recovery/rollback/partial operationを記録し成功扱いしない。 | 失敗を成功化しない・復旧義務を保持することは採択済み。反面、operationがpartial side effectを許容し記録後に復旧する現行条件もあり、old strict oracleのpartial transaction 0と全条件で同じではない。 | 失敗atomicityを選んだoperationのstrict result oracleを候補065で提示し、旧partial-0条件が現行operation契約で満たされるかmeaning differenceとしてPOへ残す。技術とrun testは下流へ。 |
| 014-04 adapter leak、014-08/10 domain fork=0、same fixture/profile parity | SECURITYの実enforcement ownerと一般verification枠を保持。Sibling HARNESS-064 local commit 1e766a94e6ee82e6d4b741baaf78f962eae70494/base 72d08eb はHIL-FR-34 common-fixture parity、tier、domain fork=0の限定sliceを起草中。 | 064は未採択でfixture内個別oracleを扱わない。 | 重ねない。065はprofile parity/support tier/domain forkを選択せず、全HIL-14 closureを主張しない。 |
| case/space/Unicode/permission/executable discovery、他profile fixture | SECURITY-007の一般path/permission/diff制約とOS-020のrun/environment分類、HARNESS-005/022のoracle枠を保持。 | HIL-FR-34のfixture項目だが今回選択したfailure結果意味ではなく、選択operation/profileも未決。旧runtimeから個別の期待値を移さない。 | source holdingに残し、適用対象選択後の下流designでoracleを定める。 |

HARNESS-L2/L11-065は、選択operationをcancelled terminalとして返す時点のrun帰属process残存0と、all-or-none意味を選択したstate operationのlock/timeout failure時partial transaction 0という2つのstrict result semanticsを判断材料に残す。既存owner contractが部分効果後の記録・回復を許す場合、その状態はOS/INFRAのfailure/unfinished/recovery保証には対応するがstrict old partial-0 oracleを満たしたことにはならない。HARNESSは意味/oracle/evidence、実行制約/process/state enforcementは既存SECURITY、Worker/OS、operation ownerが担う。旧process-group方式、SQLite、retry limit、timeout値、runtime/schema/API/CIは移植せず、選択技術のtest実行を要求stage gateにしない。

## 064とのsource slice境界

HARNESS-064は別worktreeの未採択candidate commitで、main72dには存在せず、HIL-14 authorityでもない。064のHIL-FR-34 sliceは同一fixture identityをprofile間で対応づける意味だけ。本候補のHIL-FR-34 sliceはcancel後process残存とlock failure後partial stateの結果だけを選ぶ。064のdomain fork=0、support tier、profile green、3 OS scopeを再closureしない。064も旧HAC-HIL-14aやHAT全体の履行を主張しない。

## PO meaning-difference packet: failure outcome

旧HST-CASE-014-06 line 126は取消結果をprocess残存0で判定し、014-07 line 127はSQLite lock retry上限到達後のfailed結果についてpartial transaction 0を判定する。現行OS/INFRAが保証する「失敗を成功としてcheckpointしない・状態と回復義務を記録する」ことは有効な保持だが、これだけでこの2つのstrict outcomeを満たしたとは扱わない。operation選択時にどの結果契約を採るかは、旧sourceの条件を消さず、対象operationへの適用範囲とともにPO判断材料へ残す。

| 選択肢 | 選択operationの結果 | 意味上の影響 |
|---|---|---|
| O1 | cancelled terminalを返す時点でrun所有processを0にする。failure atomicity選択operationはlock/timeout failure後partial stateを0にする。 | 旧014-06/07のstrict outcomeを保持する。065候補はこの結果oracleだけを要求し、技術方式・profile・product/repository scopeは決めない。 |
| O2 | process残存やpartial stateがあり得る場合はcancelled/success terminalにせず、interrupted/failed/unknownと未完義務・recoveryを記録して返す。 | 現行OS/INFRA failure handlingと整合するが、014-06のprocess残存0や014-07のpartial transaction 0と同値ではない。旧条件の意味をこの結果へ変えるなら上流意味差として明示判断が要る。 |
| O3 | 選択operation contractがすでにstrict outcomeを保証するか確認し、保証できないoperationはapplicability/meaning unknownとしてholdingへ戻す。 | 証拠なしにcoverageを主張せず、重複契約を増やさない。source条件と未決義務を保持する。 |

この監査の065本文はO1を未採択候補として提示し、O2を同値の履行とみなさない。どのoperationでO1/O2が適用されるか、HARNESS-L2-065自体を採るかは未選択である。O2による意味変更を選ぶ場合は旧source行、具体的な差、影響するconsumer、戻し先をdecision packetで扱い、単なるfailure記録や下流test未実行を理由にstrict outcomeを落とさない。

## PO meaning-difference packet: scope

これは固定L1の意味変更ではなく、既採択SECURITY/OS/HARNESS責務に旧acceptanceの2 failure resultを限定候補として置く扱いの選択肢である。旧source holdingを維持しformal successorを作らない。candidate selectionを検討する場合の選択肢は次のとおり。

| 選択 | 候補扱い | 影響・残る義務 |
|---|---|---|
| A | 065の2結果条件を限定候補として選ぶ | oracle契約だけを選ぶ。Worker/OS/SECURITYが実行を所有し、profile/product/repo scope/実装は決めない。HAC-14b/HAT全体は未closure。 |
| B | 065を選ばずholdingを継続 | 現行一般failure/rollback/operation責務は残るが、child/state result oracleは候補化しない。旧sourceは未closure。 |
| C | 別機構/層へ同条件の保持を提案 | source line、返却先、L2/L11 oracle ownerを明示してから重複なしで再配置する。HARNESS/SECURITY/OSへ要求意味を黙って移さない。 |
| D | product/repository/consumer scope判断まで保全（推奨） | scope未選択を維持する。既存HIL-14 scope-frameのA/B/C/Dも未選択であり、推奨Dはdecisionでない。 |

候補登録やこのpacketからPO採択、L3承認、下流実行許可、source holding解除を生成しない。

## 静的検証範囲

旧JSON/Markdown、asset pins、現行L2/L11、決定記録、carry-forward状態を静的に照合した。旧test/runtime/CIも新世代runtime/test/CIも起動していない。候補oracleは未実行の記述であり、文書検証から実績やHIL-14 stage closureを主張しない。section digest、MPR/coverage pin、source line hashとpaired MD/L11 parityの具体値をcoverage receiptへ記録する。


## source attribution correction and final pins

- HIL-FR-34 line 124 and HIL-TR-05 line 169 remain the two parent requirement atoms. HST-CASE-014-06 line 126 and HST-CASE-014-07 line 127 are separate direct-consumer oracle atoms; parent condition context and strict numeric result are not conflated.
- 065 source set: 4 atoms (parent requirement slices 2; direct consumer oracle rows 2), digest `sha256:7a8727b3a1589e1b9badfee869112e498d81231f25c5db2fab8f0d786860b0c1`; source-lines JSONL SHA-256 `52b564ab4c35b2d4143e42c776e8b444092a3b16c291e1ac1e2184dc1106f05d`.
- Direct consumer asset `LEGACY-ASSET-7B1C7AED3AA401868455`, full file SHA-256 `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8`; exact physical lines and line SHA are listed above.
- この未統合のローカル候補は、最終内容を `MPR-RC-HARNESS-L2-065-001` に記録する。訂正後継MPR行は追加しない。訂正前のatom数・digestと理由はcoverage receiptのcorrection_historyと本監査に記録する。L2 semantic digestは `sha256:a5f298b035e4dcda868b7fb35aa63cbcb8d76a1f0c8668aa6fb64a81e404f75d`、source atom setは上記4件。
- Candidate L2 file SHA-256 `30f9771c3d494eb9f3bad3b7a909001b00b81ae5ae6302fe619c9cdf4fe217f8`; paired L11 section digest `sha256:fe1aba7f9dd08f64a0e6c5a0e5648beb5e9085ea00d4ae393f6925cdd6aed4bb`, full file SHA-256 `34d25c5db932c03c72a81bb58a9eb665d6acae1e6057b2c90767bb1d95a31f2b`.
- Numeric source meaning remains: 014-06 requires `process残存0件` at cancelled status; 014-07 requires `partial transaction 0件` after SQLite lock contention and retry-limit write reaches failed. Any cross-operation or non-SQLite use remains the candidate's explicit generalized meaning and PO impact, not a source-text attribution.

現行PR比較baseは `7b9d1938fc7699404f68c2b87829df56dc6f690d`。構築時72d08ebと064 local1e766aは履歴であり、現在の064は#2490 mergeで原文二条件の修正も取り込まれた未採択候補である。064本文と既存全要求、台帳646行prefixを保ち065のみ末尾追補した。

最新比較base `fcf944f839a6269fec63f8823d98f51f1d6ec84b` の117候補/台帳647行prefixも保持し065のみを追加。先の7b9d193比較は検収履歴であり、原文4atom・065本文と対受入の意味は不変である。
