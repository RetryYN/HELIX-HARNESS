# HIL-FR-42 / HIL-FR-45 現行契約の合成監査

基準HEAD: `fcf944f839a6269fec63f8823d98f51f1d6ec84b`（origin/main）

記録種別: 旧source起点の条件単位・現行採択revision照合。`authority_effect: none`。

目的: HIL-FR-42/45の各条件が現行L2/L11と採択判断でどこに保持されるか、同一revision名の内容変更が誤って有効になる反例があるかを記録する。

範囲外: 旧要求の正式successor割当、旧HR-FR-HIL-17全体のclosure、要求意味変更、実装・実行・受入実績。旧archive内runtime/test/CLI/CIは実行していない。

## 旧sourceとidentity

資産 `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` の旧requirement fileは `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md`、SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。

| 旧ID・物理行 | 旧sourceの条件 | line SHA-256 | carry-forward |
|---|---|---|---|
| HIL-FR-42 `:132` | `source/directive→requirement atom→capability/service→domain object→API/data/state/event/failure/security/observability/lifecycle/operation/test oracle/gate`を双方向に接続し必須義務を生成。未消込・孤児・placeholder・根拠のないN/A・aggregate一括消込のいずれかがあればpair-freezeを拒否。出力はobligation graph、discharge/coverage receipt、未消込finding。 | `346e683c5f9c58018a57c29e652b84b79612466a24a3df6124d271ac0ddeddb8` | `REQSRC-LINE-01883`、`explicit_identity_preserved_pending_rehome`、successorなし。 |
| HIL-FR-45 `:135` | stable requirement ID・immutable revisionとsource atomからdesign obligationまでの型付きedgeを保持。split/merge/rename/supersede/reject/N/Aはbefore/after semantic digest、全source atom disposition、downstream stale、review authorityを持つreceiptがある場合のみ適用。 | `618f08eec7918d50938b2b09914da9be34524d5f9662b5bdfd1dfa43aed4b871` | `REQSRC-LINE-01886`、`explicit_identity_preserved_pending_rehome`、successorなし。 |

旧system contract `archive/legacy-generation-2026-09-14/root/requirements-ir/system_contracts.json#/HR-FR-HIL-17`（SHA-256 `2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab`、semantic digest `46638389e09a375aa1059fb3b6d3321703bfb2763c3777b2c321e06d25bc1fa7`）と、HAC-HIL-17a/b/c、HAT-HIL-17を根拠資料として照合した。2026-09-30のHARNESS-L2-063採択範囲はHR-FR-HIL-17の選択されたBEHAVIOR/TRANSITION/FAILURE-EVIDENCEの3意味sliceである。全列挙ID、IR全体、HAC/HAT全体のformal successorやclosureは主張しない。

## authorityを固定する採択判断と本文

採否は候補見出しのstatus語で推定せず、判断記録のidentity・registration revision・exact digestに従う。本文の候補表記が採択後も残る場合、それは当該decisionの効力を覆さない。

| 契約 | 採択判断 | 固定された本文digest | 監査上の用途・限定 |
|---|---|---|---|
| HARNESS-L2-040 | `po-decision-2026-09-29-57candidates.md:45`、MPR `MPR-RC-HARNESS-L2-040-002` 採択 | L2 `c349606d7798e3f4eb5e6cb31e0618a83dcfa05f9fc888b0ce618f6d160757df`; L11 `366518f8e32ac4dda1e5f4ec88ef0cfed6bc363d597955ffffb1a82d706fc212` | layer/pair/row catalog、stable subject ID、row revision、source span、semantic digest、owner、typed upstream/downstream edge、同revision coverage。 |
| HARNESS-L2-041 | `po-decision-2026-09-29-57candidates.md:46`で-002採択、`po-decision-2026-09-29-11candidates.md:27`で追加oracleを含む-003を採択 | L2 `d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260`; L11 `11759276200a6707762e76eeeefd901443e691bd1b0ff51b55cd3b6551fed58b` | 選択template bytes/revision、scope、applicability、extractorを固定し、各要素をatom/gap化。固定入力の再抽出semantic digest不一致はnondeterminism findingで未解決。L11本文の「未採択」は判断前の候補表記。 |
| HARNESS-L2-053 | `po-decision-2026-09-29-11candidates.md:33`、MPR `MPR-RC-HARNESS-L2-053-001` 採択 | L2 `ebc78869f6d94668d9fed00d0a0415d068d85c0f61c0d98f01a9c4ec39710587`; L11 `c22abfd29780a4016b0fcef74d6b2c29b3628b81c12d0fcb0b1fcabfb48bb61f` | immutable asset ID/revisionとrename/move/split/merge/supersedeのidentity/location/history/authority/oracle/typed-edge対応。本文見出しの候補statusよりdecisionを優先する。 |
| HARNESS-L2-063 | `po-decision-2026-09-30-live26.md:48`、MPR `MPR-RC-HARNESS-L2-063-001` 採択 | L2 `f0a1014c9514d70e8cbee63faca3ae6679c43240c89e095c4b484b161ed75b46`; L11 `fb545fc06feb1b032899cc24e8b579bb2032747a4e65f40ae354103b0bda2233` | 選択3 sliceに限るsource/authority atom binding、challenge/disposition、typed edge/oracle closure、change/stale receipt、未完・unknownのfreeze判定。導入版未指定を維持。 |
| HELIXOS-L2-038 | `po-decision-2026-09-29-57candidates.md:61`で-001採択。`po-decision-2026-09-29-11candidates.md:35,38`で041-003依存の-002と追加negative oracle採択 | -001 L2 `603b5db48045408a85d116071a4ad0f8a470064cd073a05beb9bc118f386fd6c`; L11 `eabb68eaafc76f0080fbe9cb9c6904005c88b72e7cee9563f2515b4488de2e5d`; -002 L2 `c3b0424bd39ac7c91166c87738fbefc1b20a11b904012d9ada768a113ccbe013`; 追加L11 negative section `86287e73d09522940b2a07bf8f304135ff3d495904df055088f07fff077766ed` | OSのsnapshot/proposalはsource/template/ledger revision+digest、source atom set、authority reference、base digest、scopeに束縛。stale/mismatch/non-atomic/nondeterministic findingは成功snapshot/appendにせず隔離し、直前snapshotを保つ。-002は041-003採択時のみ適用。 |

主なdecision file pins: `po-decision-2026-09-29-57candidates.md` SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`; `po-decision-2026-09-29-11candidates.md` `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`; `po-decision-2026-09-30-live26.md` `8249447f758f5b9157f69684ffa6d8fcbcdabd6dd80683e2ed77e302f60ee145`。現行L2/L11の基準main上の全file SHA-256はJSON companionに記録した。

## 条件別の行き先

| 旧条件 | 現行要求・受入への意味対応 | 残る境界 |
|---|---|---|
| FR-42: source/directiveと各atomの出所・authority | HARNESS-041のsource span/template revision/applicability/semantic digest付きatom/gap、063のsource atom identity/span・source authority revision・disposition/challenge・対象revision束縛。 | 063の採択は3 selected slicesのみ。未選択source/templateはunknownであり、旧HR契約全体のclosureではない。 |
| FR-42: atom→capability/service/domain/design/API/state/operation等の双方向typed relation | HARNESS-040の同revision catalogと型付きedge/rowの上流下流参照。HARNESS-038の選択Reverse scopeにおけるsource capabilityごとのidentity/evidence span、個別disposition/reasonとrequirements/design/testの双方向対応。063はfreeze対象の全要求relation・design obligation・L11 oracleを同一scope/revisionで閉じる。 | 列挙された層/機構の意味を選択scope外へ一般化しない。036等の未採択fixture追加は保証欠落の証拠ではない。 |
| FR-42: 必須義務の生成、未消込/orphan/placeholder/無根拠N/A/aggregate時のpair-freeze拒否 | 041は各active template要素を個別atomか理由付きgapへ対応し、空/TBD/抽出不能/重複を未解決にする。063は未解決challenge、orphan/typed-edge不整合、必須oracle欠落・未実行、無根拠N/A、aggregateのみの対応、stale範囲漏れをeligibleにしない。L11はpositive/boundary/negative oracleと実行結果を分離する。 | 旧「全必須義務」の正式移管は主張しない。採択された063の3 slice、明示された対象revision/scopeでの意味条件である。 |
| FR-45: stable requirement ID、immutable revision、typed requirement fields/edge | 040のstable subject ID/row revision/source span/semantic digest/owner/edgesとlayer catalog、041のatomまたは理由付きgap、063のauthority/source/revision/scope/edge/oracle closureを合成する。053は意味変更を新revisionとして記録し、split/merge/supersede lineageのhistory/authority/oracle/typed edgeの欠落をunknownに残す。採択済み035は上流根拠・authority・必要性・受入寄与の導出を担うが、035のscope計測追補は別の受入補助である。 | 各対象は明示されたHARNESS scopeの意味対応であり、FR-45全項目の正式successor assignmentではない。template移行の旧→後継 obligation意味対応はgeneric row/asset identityと同一視しない。 |
| FR-45: split/merge/rename/supersede/reject/N/A receiptのbefore/after digest、全atom disposition、downstream stale、review authority | 053はrename/move履歴とsplit/merge/supersede前後identity/revision/authority/oracle/edge lineageを扱う。063は変更前後revision・source/template/ledger identity・影響edge/oracle・stale範囲を要求し、必須input revision変化後の旧receiptを現revisionの証拠として使わない。atomごとのsource binding/challenge/dispositionを同じ対象revisionへ結ぶ。変更のreview authorityはauthority-state-modelの対象revision/digestに束縛されたhuman decisionとOS038のauthority referenceで照合する。063のindependent gap reviewはtemplate gap固有の条件であり、変更authorityの代替として数えない。OS038は正確なbase/source/ledger/template digestをsnapshotに結び、stale/mismatchを成功状態へ進めない。 | 明示フィールド名の有無だけを不足と数えない。監査は同一の変更operation receiptが全ての旧FR-45属性を単一JSONに格納するとまでは主張しない。必須条件が組み合わさり、偽acceptedを許さないかを判定する。 |

## 同一revision名・異内容の反例検査

反例として、requirement IDとrevision labelを据え置いたままcanonical statementまたはsource-backed requirement contentを変える。新内容ではsemantic digestが変わる。HARNESS-040のrow semantic digestは新本文と旧digestの不一致を表し、authority-state-model.mdのfail-close（人間decisionの欠落、revision不一致、digest不一致なら元状態を保持して停止）が旧decision digestでのactive化を拒む。HARNESS-063はsource authority revision・各source atom・対象revisionを結び、必須入力revisionの変化後に旧receiptを現revisionの有効証拠として使えない。OS-038はsource/template/ledger digestおよびbase digest不一致・staleをsuccess snapshot/appendへ通さず、-002は041-003が示すnondeterministic findingをquarantineする。041-003も同じbytes/revision/scope/applicability/extractorで抽出結果のdigestが異なる場合は未解決にする。

従って、旧decisionの固定digestを保ったまま本文だけを変更して合格させる具体反例は成立しない。改訂本文に新しい対象revision/digestと必要な既存human decisionが付く場合は新revisionとして処理され、旧revisionの誤った再利用ではない。digest項目の名称やreceiptの単一schemaが追加されていないことだけをL2不足としない。このため、同一revision mutation専用のHARNESS-L2-071候補は起こさない。

## FR41 template migration候補との境界

別WorkerのHARNESS-L2-070候補は、FR41のtemplate revision間で旧→後継のapplicability/schema/必須obligation差分と旧義務の後継割当・未対応義務を意味対応として扱う。FR45の一般的なimmutable revision、typed edge、source atom disposition、change/stale receiptはこの意味対応表そのものを保証しない。逆に、070で旧template要素と新template要素の対応が示されても、HARNESS-040/063/OS-038が求めるrequirement row revision、authority、before/after evidence、stale/quarantine運転の代わりにはならない。二候補はそれぞれ「template obligationの意味移行」と「requirement ledger上のrevision/operation/authority/stale境界」に限って区別する。070のsource applicability差が未選択なら、旧sourceの3 OS条件を選択profileだけの条件へ縮めず未決のまま残す。

## 検証と結論

- 基準main `fcf944f839a6269fec63f8823d98f51f1d6ec84b`上で旧source file、carry-forward identity、PO decision行、現行L2/L11節、authority-state-modelを静的に照合した。
- 旧source物理行のline SHA-256を再計算しledger値と一致確認した。現行要求/受入/decision/authority/source各file SHA-256はJSON companionに固定した。
- 判断exact digestはdecision行のregistration revisionとcurrent本文節digestを照合した。decisionの列挙は候補表記より優先し、未採択候補の採択済みrevisionと、未選択scope/未実行を分けた。
- 旧runtime/test/CLI/CIは未実行。静的な契約判定であり実装・受入実績を示さない。

結論: FR-42/45の上記条件は、限定採択scopeにおいて040/041-003/053/063とOS-038の固定digest・authority・stale・gap契約を合成して保持する。同一revision labelの異内容を旧authorityで通す偽pass根拠は確認できず、071は起草しない。FR-41 template移行の意味対応は別残差として070側の判断材料に残す。両旧identityは`preserved_pending_rehome`のままで、正式successorは0件。
