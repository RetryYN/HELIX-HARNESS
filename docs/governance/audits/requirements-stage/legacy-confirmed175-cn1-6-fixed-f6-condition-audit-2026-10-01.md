# confirmed175 resident-lane CN-1〜CN-6 固定f6条件照合監査（2026-10-01）

基準HEAD `a3340369530d06a636db6feb4a99a685a7c2c070`。旧source file SHA-256 `0ff33afc0cf22a4cf1ffb3f33334069f1d624f0f67f56451b16632ed6d5d52fe`、asset `LEGACY-ASSET-2B0DE689AA572DE66181`。対象はsource-qualified identity 6件、固定対象revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。比較はread-onlyの意味照合で、`authority_effect: none`、formal successor 0、closure false。queueは2026-09-30 snapshot。

旧sourceはarchive内に保持され、台帳上`confirmed`／`preserved_pending_rehome`。全件の先行queue状態は`not_individually_compared`。個票の原文、line digest、fixed target pins、旧consumer context pins、後発decision screenの全行digestは[JSON](legacy-confirmed175-cn1-6-fixed-f6-condition-audit-2026-10-01.json)に記録した。旧runtime、CLI、hook、test、CIは実行していない。

## 旧sourceとconsumerの読取範囲

旧sourceのCN行271–276を個別条件として読み、旧`CLAUDE.md`／`AGENTS.md`、ADR-009/010、L12 canonical directive、security capability broker、GitHub security admissionをread-onlyで確認した。これらは説明・consumer contextであり、CN本文にない閾値や移管を追加する根拠に使っていない。

## 個票比較

### CN-1 — `helix/L1-requirements/resident-lane-orchestration-requests.md::CN-1`

旧source line 271 / SHA-256 `b5479ad66b7a16350337918e4ab9e5f4e9ebfb1c23d4b2e714db67f3b129bcfa`。

**原条件atom:** canonical layer set L1-L12；layer meanings: L1 planning; L2 requirement plus screen prototype; L3 requirement definition/freeze；claim boundary: source L1 classification alone does not establish L2 agreement or L11 acceptance.

**固定f6 targets:** HARNESS-L2-002, HARNESS-L2-003, HARNESS-L2-005, HELIXOS-L2-017, HELIXOS-L2-020。

**正常条件:** 要求を現行L1-L12の意味と対で順に配置し、L1の企画・L2要求とprototype・L3要件凍結を混同せず、L2/L11の接続をL1記述だけで済ませない。

**拒否条件:** 旧L0-L14物理番号の再利用、L2要求やprototypeの省略、L3凍結をL2合意扱いすること、L1分類のみをL2/L11接続済みと扱うこと。

**失敗条件:** layer/parent/pairが欠落・不明・不一致なら、HARNESSの合意・oracle・対成果物の不足として未完に保ち、OSはunknown/conflict/依存未解決のticketを実行可能にしない。

**数値照合:** CN-1は層番号と3つの意味区分を列挙するが、閾値・件数・時間・割合の数値oracleを定めない。

**比較結果:** 部分的な意味接点。HARNESS-L2-002は選択/合成方式でもL1-L3と要件承認を保持し、L2-003はprototype/PoC適用判定とL3 freeze前合意、L2-005は層/対別oracle・証拠、OS-017はticket graph/workflowの適格性、OS-020は検証義務の運転を扱う。これらは現行layer/pair全体の明示定義ではなく、CN-1のcanonical layer authorityや旧番号排除を個別に再表明しない。後続採択本文もL1→L2/L11→L3の全順序を同一契約としては固定していない。

**記録上の扱い:** 意味再導出の保持。旧L1-L12列挙をそのまま層authorityへcopyせず、現在のcanonical layer directiveを正本とする。source identityのsuccessor割当てはなし。 formal successorなし、closureなし。

### CN-2 — `helix/L1-requirements/resident-lane-orchestration-requests.md::CN-2`

旧source line 272 / SHA-256 `b5cabe7c6d5fe55bda37f50fcc1b8292515513da4461241d80103924619ce9af`。

**原条件atom:** Python semantic-core authority；TypeScript/Node transactional-boundary authority；layer-specific boundary is preserved.

**固定f6 targets:** HARNESS-L2-008, HELIXOS-L2-017, HELIXOS-L2-019。

**正常条件:** 意味導出をPython semantic coreに置き、state・gate・Git/GitHub等のtransactional writeをTypeScript/Nodeの単一commit boundaryに残す。

**拒否条件:** PythonへDB path, credential, repository, .helix/を渡すこと、Pythonからauthoritative writeやcommand/SQL/code実行を許すこと、writerを二重化すること。

**失敗条件:** semantic schema/lineage/digestまたはNode側の再検証・単一transaction boundaryが不明・不一致ならproposalをauthoritative commitとして受け入れず、境界不成立を記録する。

**数値照合:** 原CN/ADRにこの責務分担の数値閾値はない。versioned schemaと単一writerは定性的・構造的条件。

**比較結果:** 部分接点にとどまる。HARNESS-L2-008はPython意味導出コアと要求/操作権限への自動昇格禁止を明記し、OS-017/019は推進と証拠・event continuityの責務を分ける。しかし固定対象にTS/Node transactional authority、Pythonの禁止入力、単一transaction writerを明示する条件はない。OS対象の存在だけでruntime境界を満たすとは言えない。

**記録上の扱い:** 意味再導出。ADR-009/010の旧技術境界を根拠にし、HARNESS/OS各targetの責務をruntime実装済みと解釈しない。successorなし。 formal successorなし、closureなし。

### CN-3 — `helix/L1-requirements/resident-lane-orchestration-requests.md::CN-3`

旧source line 273 / SHA-256 `e3bcce8ef0d78a2106117113036e2b81372171423074d579e1d0c121e0918289`。

**原条件atom:** new definition is recorded in canonical requirements source before runtime migration；requirements source precedes runtime migration.

**固定f6 targets:** HARNESS-L2-003, HARNESS-L2-005, HELIXOS-L2-017, HELIXOS-L2-020。

**正常条件:** 要求意味を要件正本へ記録・固定してから対応runtimeを移行する。

**拒否条件:** runtimeを先行移行する、L1分類や候補を要件承認済みと扱う、archive sourceやissue/PRから要求意味/承認を生成する。

**失敗条件:** 要求正本・親revision・人間判断・必要なL2/L11合意がmissing/unknown/staleなら下流runtime変更へ進まず、上流条件を未完として返す。

**数値照合:** 順序条件のみ。期間、件数、閾値は明記なし。

**比較結果:** 部分接点。HARNESS-L2-003は合意とfreeze条件を確認し、L2.5結果のBackflowとL3凍結前確認を含む。L2-005は要求からoracle/verification obligationsを導出し、OS-017/020は適格ticketとその検収を扱う。一方、これらは「要件正本登録をruntime移行の前提とする」明示migration orderingを一体で規定せず、現在の対象別authority/層遷移を代替しない。

**記録上の扱い:** 意味再導出。runtime migration gateの新設・successor割当てはしない。旧要求のsource-qualified atomはpendingのまま。 formal successorなし、closureなし。

### CN-4 — `helix/L1-requirements/resident-lane-orchestration-requests.md::CN-4`

旧source line 274 / SHA-256 `90fdcf4861f836ae04fa669dac106ff421cbf807e723726108c0ea5885edbb24`。

**原条件atom:** release action-binding approval boundary；tag action-binding approval boundary；cutover action-binding approval boundary；automatic routing activation action-binding approval boundary.

**固定f6 targets:** HELIXOS-L2-014, HELIXOS-L2-020, HELIXSECURITY-L2-008。

**正常条件:** 不可逆なrelease/tag/cutover/automatic-routing activationはaction, actor, target, scope, parameters and approval evidenceに束縛した許可の下でのみ実行する。

**拒否条件:** 一般的なagent/merge/write許可からrelease, tag, cutover, routing activationを導出すること、approvalをPR stateやCI greenに置換すること。

**失敗条件:** action-bound approval, scope, target, params, expiry or rollback evidence missing/unknown/driftedなら実actionをdeny/stopする。

**数値照合:** CN/consumerで数値の有効時間・release数・routing閾値は指定なし。

**比較結果:** 部分境界のみ。OS-L2-014は段階リリースと本体1.0到達/外部公開を分離し、候補構成・受入・rollback条件を組む。OS-L2-020はCI結果をmerge/releaseへ統合しない。SECURITY-L2-008はoperationごとのauthority tuple完全一致を求める。だが特定release/tag/cutover/自動routing activationのaction-binding approval packet、承認者、parameter binding、approval期限・rollback条件をこれらの固定targetは同一契約として定義していない。

**記録上の扱い:** 保持点を維持し意味再導出。現行SECURITY authorityを用い、L2-014やCIを実行許可としない。successorなし。 formal successorなし、closureなし。

### CN-5 — `helix/L1-requirements/resident-lane-orchestration-requests.md::CN-5`

旧source line 275 / SHA-256 `6515fcecc5703eb3ed3ed6c9f9ab5f4abb771fe69fbb636669fcc5bac2a8c487`。

**原条件atom:** secret non-disclosure；credential non-disclosure；PII non-disclosure；applies to assignment；applies to event；applies to evidence.

**固定f6 targets:** HELIXSECURITY-L2-003, HELIXSECURITY-L2-005, HELIXSECURITY-L2-007, HELIXSECURITY-L2-008, HELIXSECURITY-L2-009, HELIXOS-L2-018, HELIXOS-L2-019。

**正常条件:** assignment/event/evidenceにsecret, credential, PIIの生値を含めず、必要な分類・scope・provenanceだけを許可範囲で扱う。

**拒否条件:** raw secret/credential/PIIをassignment, event, artifact, log, tool result, receiptへ出すこと、またはscope外のproject/worktree/workerへ流すこと。

**失敗条件:** exposure, scope mismatch, revoke, unknown, inspection unavailableを確認した場合はdeny/stopし、該当利用をrevoke/quarantineへ伝播する。

**数値照合:** 数値上限・露出率・retention durationはsource identityに指定なし。0 exposureは定性的な否定条件。

**比較結果:** 強い条件接点だが全体同値ではない。SECURITY-003はproject/tenant/environment/worktree isolation、005はraw secret非露出・credential scope/expiry・artifact/log等の値漏れ拒否、007は制約適用/unknown時停止、008はoperation-specific authority、009はrevoke/quarantine伝播を持つ。OS-018/019はassignmentとevent/evidence provenance・data-use class/未完義務を保つ。しかし固定対象文は旧CNのassignment/event/evidence全3面についてsecret・credential・PIIすべての包括的禁止を単独で明記せず、個票はすべてのdata category同値または実装証明を主張しない。

**記録上の扱い:** 意味再導出。安全条件を保持し、secret値を証拠に記載しない。旧identityの移管・closureなし。 formal successorなし、closureなし。

### CN-6 — `helix/L1-requirements/resident-lane-orchestration-requests.md::CN-6`

旧source line 276 / SHA-256 `c128537593b96a6763f3396e544a56e61703b21256e48438e84a55aba3f23776`。

**原条件atom:** main direct push prohibited；PR is the required integration path；required check harness-check remains unchanged.

**固定f6 targets:** HELIXOS-L2-018, HELIXOS-L2-020, HELIXOS-L2-023。

**正常条件:** archive-era branch policy was mainへdirect pushせずPR経由で統合し、required check harness-checkを維持する。

**拒否条件:** mainへのdirect push、PR bypass、required-check名または保護条件を無断で変更すること。

**失敗条件:** branch/ruleset/required checkの現在状態が未確認、drift、またはrequired gate不成立ならintegration admissionを成立扱いしない。

**数値照合:** branch requirementはboolean; harness-checkはcheck identity。件数/時間の数値条件なし。

**比較結果:** 対象L2/L11による直接支持は限定的。OS-018はassignment/attempt、owner/scope/headの追跡と停止を扱う。OS-020は必要CI運転とsuccess/fail/skipped/staleの区別を扱うが、新世代CI未構築で旧CI代用を禁止する。OS-023はrevision-bound handoffを扱う。どのtargetもmain保護、PR必須、`harness-check`という固定check identityを定義しない。現行GitHub運用は独立の現在規則であり、この固定L2/L11照合のcomplete successorではない。

**記録上の扱い:** 旧branch protection/runtime contractを再活性化しない。現在のmerge admissionは現行運用モデルで照合し、本比較は未移管条件として保持。successorなし。 formal successorなし、closureなし。

## 後発decision proximity screen

57候補（53 adopted registration-decision rows）、11候補（10 adopted rows）、live26（25 adopted rows）、計88 adopted rowsを、全94 decision行と各decision record SHA・行SHAを保ってscreenした。採択状態の行を使って直接matchを数えず、条件が近い候補のみ説明用contextとして扱う。held/non-adopted行を採択扱いせず、screenはsuccessor、owner移管、同値、全consumer closureを生まない。OS-L2-049/-050はCN-6のreview/verification capacityと既存review_merge authority境界への近接候補で、CN-4のrelease/tag/cutover/automatic-routing action-binding承認には対応しない。追加でOS-L2-046/-052をCN-6のdispatch→merge連続性／merge後base drift・再review・自動rebase禁止への近接として、SECURITY-L2-029/-031/-033/-034をCN-5の第三者・追加runtime/MCPのdata・secret/credential境界への近接として記録した。候補ごとに採択decision row、MPR登録行、L2/L11全section digestとidentity rowをJSONへpinした。いずれも条件限定の後発候補であり、CNのsuccessor、全条件移管、runtime実装/実行/受入・closureを生成しない。screen全体とcandidateごとのdecision/MPR/L2/L11 pinsはJSONを参照。

## 結果と限界

6 identityの原条件、failure/negative条件、数値の有無と固定targetを個別に記録した。固定f6 targetはいずれも現行revisionでのL2/L11候補で、採択状態は旧CNの全条件移管・runtime実装・合格を意味しない。未割当条件を未割当のまま保全する。
