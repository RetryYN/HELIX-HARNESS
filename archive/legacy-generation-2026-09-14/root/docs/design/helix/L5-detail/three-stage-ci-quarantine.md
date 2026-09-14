---
title: "HELIX L5 詳細設計 — three-stage CI quarantine"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-06
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-003
  - HST-HIL-022
pair_artifact: docs/test-design/helix/L5-three-stage-ci-quarantine-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-06
  - HAC-HIL-06a
  - HAC-HIL-06b
  - HAC-HIL-06c
  - HIL-BR-16
  - HIL-BR-20
  - HIL-FR-28
  - HIL-FR-29
  - HIL-NFR-15
  - HIL-NFR-16
source_capabilities:
  - HU-CAP-006
---

# HELIX L5 詳細設計 — three-stage CI quarantine

## §0 適用境界

本書はUniversal ReverseのForward合流前簡易CI、Forward合流後の内部CI、GitHub external PR CIを、
`local_prejoin -> internal_postjoin -> github_external`の三段として強制する。各段は自身のsource SHA、tree digest、
required check-set digestと直前段receiptへbindし、別系統green、段飛越、結果未提出check、quarantine済みresultのgreen算入を拒否する。

ここでいう「同一lineage」は三段が同一SHAであるという意味ではない。prejoinはReverse候補SHA/tree、postjoinはForward join receiptが
生成した合流SHA/tree、externalはGitHub PR head SHA/treeを持ち、各変換を直前receiptで一意に結ぶ。self-heal修正でPR headが変わった場合は
旧receiptをstale化し、新SHA/treeからprejoinをやり直す。外部workflowの実変更、GitHub API操作、quarantine ruleのactive化は行わない。

`HST-HIL-015`はmemory compactionの正本であり本sliceのCI acceptanceではない。CI raw logをmemoryへ昇格せず、self-healには
sanitized failure fingerprintとartifact digestだけを渡す。本sliceのcanonical acceptanceはL1/L3/L4に対応する`HST-HIL-003`と
`HST-HIL-022`である。

## §1 source capabilityとpinned evidence

旧UTはruntimeとしてimportせず、`HU-CAP-006`を次のimmutable manifestへbindして意味契約だけを採取する。

| manifest項目 | pinned値 |
|---|---|
| source root | `/tmp/ut-harness-inspect`は検査用cloneで正本ではない。正本remote locatorは`https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS.git` |
| 基準ref／commit／tree | `origin/main`／`e506a67e9c243cc9781ff4a6d8d1870b072fd37b`／`2f0eda9a0ec69213a0a91ea9b1d3030d14f0c720` |
| source側ref／commit／tree | `origin/work/l6-82-universal-pr-trigger`／`9bcdbe5af48345af13485c1d098390cd4de935bc`／`188b01f01db15b17c690bdd28b59ca7d3f493ad8` |
| 共通祖先 | `e506a67e9c243cc9781ff4a6d8d1870b072fd37b` |
| entry set | `git diff --name-only base...source`のUTF-8 byte順11件、SHA-256 `af66836b3277f6d5476fa47b80ddb70b0eec444446fc44918a66cb85226d68e8` |
| 固有delta | `git diff --binary base...source`、SHA-256 `ef3770ec2c8dcf8e4dd961b4e55d109a19fed51831d7a31eb0af5ed43ee0b33a`、284 insertions／8 deletions |

entry setの11件は次のとおり全件を個別dispositionする。blobはsource treeのGit blob ID、spanはbase...sourceの
exact hunkまたは新規file全span、SHA-256はsource blob contentをLFのまま読んだdigestである。

| source entry | blob／SHA-256 | exact delta span | final disposition／採取する意味 |
|---|---|---|---|
| `.github/workflows/harness-check.yml` | `64b775235cb1bf166b9080b057b4e8170e6ebf57`／`7ae0b108c88d5b4b1b652c3f6d5ea930eb4636cf68c5bd1daf61ebae62976c8b` | `@@ -7 +7,2 @@`, `@@ -18 +18,0 @@ on:` | adopt（採用）／source workflowの全base PR trigger |
| `docs/plans/PLAN-L6-82-universal-pr-trigger-contract.md` | `870f6ec993998dd6a0b3367911028200311b0779`／`e5f95df537ade98ae75a48894dcb665481eb7fecbed7adc067f9d43aa597265e` | new L1-L61 | reference-only（参照のみ）／trigger contract。draft PLANをcompletion evidenceにしない |
| `docs/plans/PLAN-L7-434-universal-pr-trigger-impl.md` | `0a89ed3229a4e02054fd2906629f2c31ee652111`／`3cb55ed9e7dd68eac95eff0a49bb787233dc6726ffb5c6fac8ba77d9c7ba4824` | new L1-L67 | reference-only（参照のみ）／11 entryの実装scopeと三面同期 |
| `docs/plans/PLAN-REVERSE-434-universal-pr-trigger-backfill.md` | `09cf1760cb585abd73b10ac64e0beccd13be07b5`／`36b6bfe66e653bfcd70b8274eec2cb01877914acd0940eaaddda2650be769f70` | new L1-L69 | harden（強化）／Reverse pair意図だけ採用。R3 draftをR0–R4完了扱いしない |
| `docs/templates/github/common/harness-check.yml` | `f0b9b34b9eb9b5714a6de5178cfdf323848d8450`／`585a8e97278f3cc6363e28a633e89ae6fb324045c6fd3bbc501b5cd4f35429f7` | `@@ -7 +6,0 @@ on:` | adopt（採用）／source consumer templateのbase filter撤去 |
| `docs/templates/github/common/pack-harness-check.yml` | `b7b18401f6894424d5f520f392171e2d1a3b65e0`／`a9b49d4ce49fa7509bf374c2e42e0db69a5e3823f0ba583afb3cdb21eacab691` | `@@ -15 +14,0 @@ on:` | adopt（採用）／pack templateのbase filter撤去 |
| `docs/test-design/harness/L7-unit-test-design.md` | `511e773db7b2d2a2ac5f7cca3231793f57d9ba24`／`49809e048f94d0abbc732e2cc53777c7f1f03afbad5624cca1afbfc5314b06eb` | `@@ -1400,0 +1401,16 @@` | harden（強化）／U-CIPOL-001..003 design oracleを本slice fixtureへbind |
| `src/lint/github-ci-policy.ts` | `f7bcfbff166c2f6cd4328fba991182c4fde863ab`／`ba12f32efb77326b60c03b4590c39f08b5aa46fe8a46370de4aed00fc23ce482` | `@@ -18,0 +19 @@`, `@@ -202,0 +204,29 @@` | harden（強化）／base限定、branches-ignore、trigger欠落のfail-close |
| `src/setup/templates.ts` | `a4e391ffef25dd9c7e7b0a2e8057db698b4cbdba`／`ac1d416f436d21c48b5ffb8798ef18bebccd0aead073d1b335423fc0cbd86539` | `@@ -536,0 +537 @@`, `@@ -538 +538,0 @@` | adopt（採用）／builtin templateの全base PR trigger |
| `tests/github-ci-policy.test.ts` | `555fc7216123cfef8184bc8db3c1e229478e3b37`／`0cf5c6969ec35204846118b88993f909a693ff8a86f3282b75ad3382a92e8e78` | `@@ -18 +17,0 @@`, `@@ -44 +42,0 @@`, `@@ -74 +72 @@`, `@@ -135,0 +134,35 @@` | harden（強化）／正常、main限定、branches-ignore、missing triggerのfixture |
| `tests/setup.test.ts` | `3918f7041f5a7f2c8a0d587f5d2cde8c9b6b3d79`／`405401f3cef8df7ff72524675134d9006c9db17ad4026c0bd6cb8364a2824ee1` | `@@ -379,0 +380,2 @@` | harden（強化）／generated workflowのtrigger正負assertion |

`docs/plans/PLAN-L7-221-github-ci-policy-gate.md`は11件deltaに含まれない。base/sourceの双方でblob
`ef9046d6e7ceed5383e8598a18d99eb99c90416e`、SHA-256
`63a61a498b7f6d109c08b3694d33c4d4dad48f00675b0597afbe9cc235cbab9a`の既存main assetである。
したがってpolicyの祖先参照には使えるが、HU-CAP-006 unique delta、branch採用、PLAN-L7-434完了の証拠には算入しない。

現行`src/audit/ci-auto-fix-gate.ts`、`tests/ci-auto-fix-gate.test.ts`、`PLAN-L7-418`のdogfood receiptは比較入力である。
confidence 0.75、最大2 attempt、test/typecheck/lintだけを自動修正候補にする現行policyを既定値として継承するが、
本書だけで実runtimeへ配線済みとは主張しない。

## §2 chain、stage、authorityの境界

| component | 責務 | authority | 禁止 |
|---|---|---|---|
| `CiCheckProfileRegistry` | source/pack、phase、required check、command/profile digestをversion管理 | Node registry event | callerによるcheck省略、current workflow再解釈 |
| `ThreeStageCiOrchestrator` | chain、ordinal、predecessor、Forward join、GitHub deliveryを順序制御 | Node CI event | 段飛越、別lineage green再利用 |
| `CiStageEvidenceIngestor` | check result、artifact、provider conclusionをschema検証 | staged observation | raw logのmemory昇格、未提出checkのpass化 |
| `CiQuarantineManager` | exact既知failureとminimum gateを評価 | quarantine event/receipt | wildcard、無期限、新fingerprint、owner/Issueなしrule |
| `CiSelfHealPlanner` | failureを修正、同tree retry、repush、Issueへroute | plan/attempt receipt | security/permission/unknownの自動修正、無限retry |
| `CiMergeEligibilityGate` | external完了とbranch protection結果をmerge eligibilityへ投影 | Node decision event | quarantineをgreen countへ算入、別PR head承認 |

stage ordinalは`local_prejoin=1`、`internal_postjoin=2`、`github_external=3`に固定する。
Reverse実装はprejoinを通るまでForward join 0、Forward join後SHAはpostjoinを通るまでPR作成0、PR headはexternalを通るまでmerge 0とする。
`accepted_with_quarantine`は次段へ進める明示状態だが`passed`ではなく、green件数へ算入しない。

## §3 required workloadと処理量保存

`CiCheckProfileV1`はprofile ID/version、source kind、stage、required check ID、command/argv digest、fixture/input scope digest、
timeout/resource policy、artifact schema、provider expectationを持つ。source profileとconsumer pack profileを混同しない。
universal PR triggerはbase branch filterなしを必須にし、stacked PRをrequired checkなしでmerge可能にしない。

初回、retry、self-heal、quarantine applicationのすべてでrequired check-set digestと各input scope digestを比較する。
failed checkの削除、test file/filter縮小、fixture件数削減、fail-fastによる未実行check、timeout短縮によるskip、source full testをpack smokeへ
置換することを処理量削減として拒否する。quarantineは全required check実行後の結果dispositionであり、minimum gateは追加検証であって
元checkの代替や省略ではない。未提出checkは`HIL_CI_REQUIRED_CHECK_MISSING`、profile縮小は詳細cause
`HIL_CI_WORKLOAD_REDUCTION_FORBIDDEN`として同境界へfail-closeする。

## §4 lineageとstage receipt

chain identityはplan/Issue、causality、Reverse task、source profile、prejoin SHA/tree/check-setから決める。各stage receiptは最低限、
chain/stage/ordinal/attempt、source SHA、tree/check-set/input-scope digest、predecessor receipt、Forward join receiptまたはGitHub delivery、
result/artifact/event digest、started/finished at、failure codeを持つ。

prejoin receiptとForward join receiptはcandidate parent SHA/treeを一致させ、postjoin receiptはjoin result SHA/treeを保持する。
externalはrepository/PR number/head SHA/tree/workflow/check suite/check run/delivery IDを保持し、postjoin SHA/treeとPR headを一致させる。
GitHub rerequestは同head/treeの新attempt、force-pushまたはself-heal commitは新head/treeのsuperseding chainとする。

SHAだけ一致してtreeが違う、treeだけ一致してpredecessorが違う、別chainのgreen、quarantine applicationだけ存在する状態では次段へ進めない。
providerの`neutral`、`skipped`、`cancelled`、`timed_out`、unknown conclusionをgreenへ正規化しない。

## §5 quarantine契約

ruleはcheck ID、exact normalized failure fingerprint、baseline SHA/tree、typed exact scope、reason code/rationale、evidence digest、
remediation Issue、owner、`expires_at`、最大iteration、approval receipt、minimum verification profileを必須とする。
scope atomは`check | test_oracle | platform | source_profile | pack_profile`のkindと非空IDを持ち、byte順に正規化する。
source ruleはsource profile digest、pack ruleはsourceとpack両profile digestを持ち、どちらもcheck profile ID/version/digestへbindする。
scope空集合、同じkind/IDの重複、unknown kind、空ID、glob、directory丸ごと、全check、reason/evidence/source-pack/check-profile/
approval欠落をactive化前に拒否する。Node trusted clockで期限を評価する。

applicationは観測checkを全件評価し、全failureがactive ruleへexact一致し、元workloadが完走し、追加minimum gateがgreenの場合だけ
application stateをcanonical `quarantined`にする。chain stage projectionは非greenの`accepted_with_quarantine`として次段へ進めるが、
canonical HST stateを`accepted_with_quarantine`へrenameしない。一件でも新fingerprint、scope外、期限切れ、owner/Issue欠落、
minimum gate失敗があればstage全体をfailedにする。
ruleのfingerprint、baseline tree、check profile、scope、owner、期限が変われば旧applicationをstale化する。

quarantineは証拠を捨てない。original failure receipt、application decision、minimum gate receipt、remaining iteration、remediation Issueを
append-onlyで残し、releaseは原因修正を含む新SHA/treeの通常三段CIで行う。rule削除や過去receipt書換えでgreen化しない。

## §6 self-heal、retry、repushの証拠

failure intakeはcheck ID、provider conclusion、exit、normalized fingerprint、sanitized diagnostic digest、artifact path/digest、
source SHA/tree/check-set/input-scope、attempt、policy versionを要求する。raw log、secret、credential、PIIをharness.dbやmemoryへ複製しない。

| route | 条件 | lineage | evidence |
|---|---|---|---|
| same-tree retry | provider/transient failureでinput変更なし、attempt上限未満 | 同stageの新attempt、同SHA/tree/check-set | prior attempt、rerequest delivery、全workload receipt |
| self-heal repush | test/typecheck/lint、confidence閾値以上、修正diffあり | 旧chainをstale化し、新SHA/treeでprejoinから再始動 | prior attempt、rerequest、全workload、failure log、root cause、diff、green command、push/PR head、新chain三段receipt |
| quarantine evaluation | exact既知failure、active rule、minimum gateあり | 同stageのapplication、greenとは別状態 | rule/application/minimum gate/remediation Issue |
| Issue escalation | security/permission/unknown、低confidence、retry上限 | 後続stageとmerge 0 | failure packet、試行履歴、owner、next action |

self-heal成功を「再pushした事実」だけで判定しない。repush Resultはprior attempt receipt、provider rerequest/delivery、元profileの
required check/fixture/input全件workload、sanitized failure log digest、root-cause digest、diff digest、green command/exit/output、
push receipt、repository/PR/new head SHA/tree、新chain ID、prejoin/postjoin/external各receiptを不可分に持つ。新chainの三段を全て実行し、
各attemptのcommand、exit、output digest、changed SHA/tree、check-set/input-scope不変または正当なversion差分を保存する。
いずれか一件欠落、旧head、同chain再利用、三段未完ならResultはfailureでmerge eligibility 0とする。attempt上限到達後のsilent retry、
履歴削除、同じ失敗を別fingerprintへrenameする回避を禁止する。

## §7 stateとtransaction

L4の`ci_chains`、`ci_stage_runs`、`ci_check_runs`、`ci_stage_receipts`、`ci_quarantine_rules`、
`ci_quarantine_applications`へ投影する。stage completion transactionはcheck全件、stage receipt、event、lineage edgeを不可分にcommitする。
quarantine ruleのcreate/update/expireはrule row、revision、approval/freshness、event、projection、receiptを不可分にcommitし、
expiryをread-time判定だけで済ませずterminal eventとして永続化する。
partial appendではpassed/currentを0件にし、immutable check evidenceからNodeがreconcileする。

許可chain stateは`created -> prejoin_running -> prejoin_accepted -> postjoin_running -> postjoin_accepted -> external_running ->
external_accepted`とし、任意段から`failed/stale/cancelled`へ遷移できる。terminalまたはstale chainからの再開は行わず、新attemptまたは
superseding chainを作る。同一provider delivery、stage attempt、quarantine applicationの重複は同digestなら増分0、異digestなら拒否する。
HST-HIL-003の正常prejoinは`implemented -> prejoin_accepted`でpassed receiptを発行する。HST-HIL-022の正常quarantineは
applicationが`failed -> quarantined`、chain stageだけが`accepted_with_quarantine`へ投影される。

### §7.1 CI commit bundleの不可分化

stage完了、quarantine application、self-heal attempt/result、quarantine rule create/update/expireは`CiMutationCommitBundleV1`へまとめる。bundleは
`operation_id`、`payload_digest`、chain/stage/attempt、`expected_event_head`、`expected_projection_head`、
check全件、stage receipt、quarantine applicationまたはself-heal outcome、lineage edgeを含む。rule lifecycle bundleはさらにrule ID/revision、
prior revision、rule digest、expected rule head、approval/freshness receiptを含む。Node `CiMutationStoreV1`はmutation kindごとのwrite setを
一つのtransactionでCAS commitし、任意append faultでは当該transactionの全writeをrollbackする。

同operation・同digest再送は同receiptを返すno-op、同operation・異digestとstale headはconflictである。reconcileは
immutable check result、provider delivery、event、lineage evidenceから欠けたprojection/receiptを再構築し、未実行check、
quarantine green、推測したself-heal成功を生成しない。

## §8 failure正本

| token | 条件 |
|---|---|
| `HIL_CI_PREJOIN_FAILED` | prejoin required checkが失敗 |
| `HIL_CI_POSTJOIN_FAILED` | postjoin required checkが失敗 |
| `HIL_CI_EXTERNAL_FAILED` | GitHub external required checkが失敗 |
| `HIL_CI_STAGE_BYPASS` | predecessorなし、ordinal飛越、順序逆転 |
| `HIL_CI_LINEAGE_MISMATCH` | 別chain/SHA/predecessor receipt |
| `HIL_CI_TREE_DIGEST_MISMATCH` | 同SHAでtree/check inputが不一致 |
| `HIL_CI_REQUIRED_CHECK_MISSING` | required result未提出または処理量削減 |
| `HIL_CI_SHA_STALE` | PR head変更後の旧receipt再利用 |
| `HIL_CI_CONCLUSION_NOT_GREEN` | neutral/skipped/cancelled/unknownのgreen化 |
| `HIL_CI_STAGE_LINEAGE_INVALID` | 三段の正順・predecessor bind不成立 |
| `HIL_CI_RECEIPT_LINEAGE_INVALID` | current stage/source receipt bind不成立 |
| `HIL_QUARANTINE_FINGERPRINT_MISMATCH` | observed fingerprintがruleと不一致 |
| `HIL_QUARANTINE_EXPIRED` | trusted clockで期限超過 |
| `HIL_QUARANTINE_MINIMUM_GATE_MISSING` | minimum gate欠落または非green |
| `HIL_QUARANTINE_WILDCARD_FORBIDDEN` | wildcard、directory、all-checkの包括scope |
| `HIL_QUARANTINE_REMEDIATION_MISSING` | remediation Issue、owner、理由/evidence欠落 |
| `HIL_QUARANTINE_EXHAUSTED` | application/self-heal iteration上限 |
| `HIL_CI_QUARANTINE_INVALID` | 新failureまたは混合集合を隔離 |
| `HIL_QUARANTINE_SCOPE_INVALID` | exact scope、baseline、profile不一致 |
| `HIL_QUARANTINE_OVERBROAD` | 無期限、包括scope、変更後rule再利用 |
| `HIL_CI_WORKLOAD_REDUCTION_FORBIDDEN` | retry/quarantineでcheck、fixture、scope、commandを削減する詳細cause |
| `HIL_CI_SELF_HEAL_EVIDENCE_MISSING` | log/root-cause/diff/green command/push lineage不足の詳細cause |

## §9 L8へのexact trace

| L5責務 | L8 oracle | HAC | exact state pair | exact HST disposition |
|---|---|---|---|---|
| 三段正常lineage | `IT-CIQ-001` | `HAC-HIL-06a` | `HST-CASE-003-01`: `implemented -> prejoin_accepted` | `HST-CASE-003-01` → `なし（正常系）` |
| prejoin failure | `IT-CIQ-002` | `HAC-HIL-06b` | `HST-CASE-003-02`: `implemented -> failed` | `HST-CASE-003-02` → `HIL_CI_PREJOIN_FAILED` |
| postjoin failure | `IT-CIQ-003` | `HAC-HIL-06b` | `HST-CASE-003-03`: `postjoin_running -> failed` | `HST-CASE-003-03` → `HIL_CI_POSTJOIN_FAILED` |
| external failure | `IT-CIQ-004` | `HAC-HIL-06b` | `HST-CASE-003-04`: `external_running -> failed` | `HST-CASE-003-04` → `HIL_CI_EXTERNAL_FAILED` |
| stage順序 | `IT-CIQ-005` | `HAC-HIL-06b` | `HST-CASE-003-05`: `created -> created`; `HST-CASE-003-11`: `assertion_input_ready -> assertion_pass`; `HST-CASE-003-12`: `assertion_input_ready -> assertion_pass` | `HST-CASE-003-05` → `HIL_CI_STAGE_BYPASS`; `HST-CASE-003-11` → `HIL_CI_STAGE_BYPASS`; `HST-CASE-003-12` → `HIL_CI_STAGE_LINEAGE_INVALID` |
| SHA/tree/receiptのlineage検証 | `IT-CIQ-006` | `HAC-HIL-06b` | `HST-CASE-003-06`: `prejoin_accepted -> prejoin_accepted`; `HST-CASE-003-07`: `prejoin_accepted -> prejoin_accepted`; `HST-CASE-003-13`: `assertion_input_ready -> assertion_pass` | `HST-CASE-003-06` → `HIL_CI_LINEAGE_MISMATCH`; `HST-CASE-003-07` → `HIL_CI_TREE_DIGEST_MISMATCH`; `HST-CASE-003-13` → `HIL_CI_RECEIPT_LINEAGE_INVALID` |
| check completeness/conclusion | `IT-CIQ-007` | `HAC-HIL-06b` | `HST-CASE-003-08`: `external_running -> failed`; `HST-CASE-003-10`: `external_running -> failed` | `HST-CASE-003-08` → `HIL_CI_REQUIRED_CHECK_MISSING`; `HST-CASE-003-10` → `HIL_CI_CONCLUSION_NOT_GREEN` |
| PR head stale | `IT-CIQ-008` | `HAC-HIL-06b` | `HST-CASE-003-09`: `external_accepted -> stale` | `HST-CASE-003-09` → `HIL_CI_SHA_STALE` |
| exact quarantine正常適用 | `IT-CIQ-009` | `HAC-HIL-06c` | `HST-CASE-022-01`: `failed -> quarantined` | `HST-CASE-022-01` → `なし（正常系）` |
| fingerprint/new failure | `IT-CIQ-010` | `HAC-HIL-06c` | `HST-CASE-022-02`: `failed -> failed`; `HST-CASE-022-08`: `assertion_input_ready -> assertion_pass` | `HST-CASE-022-02` → `HIL_QUARANTINE_FINGERPRINT_MISMATCH`; `HST-CASE-022-08` → `HIL_CI_QUARANTINE_INVALID` |
| expiry/scope | `IT-CIQ-011` | `HAC-HIL-06c` | `HST-CASE-022-03`: `failed -> failed`; `HST-CASE-022-09`: `assertion_input_ready -> assertion_pass` | `HST-CASE-022-03` → `HIL_QUARANTINE_EXPIRED`; `HST-CASE-022-09` → `HIL_QUARANTINE_SCOPE_INVALID` |
| minimum gate/remediation | `IT-CIQ-012` | `HAC-HIL-06c` | `HST-CASE-022-04`: `failed -> failed`; `HST-CASE-022-06`: `proposed -> proposed` | `HST-CASE-022-04` → `HIL_QUARANTINE_MINIMUM_GATE_MISSING`; `HST-CASE-022-06` → `HIL_QUARANTINE_REMEDIATION_MISSING` |
| wildcard/overbroad | `IT-CIQ-013` | `HAC-HIL-06c` | `HST-CASE-022-05`: `proposed -> proposed`; `HST-CASE-022-10`: `assertion_input_ready -> assertion_pass` | `HST-CASE-022-05` → `HIL_QUARANTINE_WILDCARD_FORBIDDEN`; `HST-CASE-022-10` → `HIL_QUARANTINE_OVERBROAD` |
| self-heal/retry上限 | `IT-CIQ-014` | `HAC-HIL-06b`, `HAC-HIL-06c` | `HST-CASE-022-07`: `exhausted -> failed` | `HST-CASE-022-07` → `HIL_QUARANTINE_EXHAUSTED` |

上表は`HST-HIL-003` 13件と`HST-HIL-022` 10件を各一回だけbindする。local self-heal/workload failureはcanonical caseの
詳細causeとして保持し、canonical tokenをrenameしない。

## §10 freeze条件

L6 public resultは`CiSourceBindingV1`から`CiMergeEligibilityV1`までの18 closed V1型、failure codeは`CiFailureCodeV1 = CiFailureV1["code"]`、reconcile evidenceは`CiImmutableEvidenceV1`、event replayはL4基本設計 §2.3の共有semantic shape `ProjectionDigestV1`に固定する。unversioned result/failure名と外部schema importへ縮退しない。

L5/L8 pairは14/14 integration、canonical 23/23 HST disposition、三段の同一lineage、required workload不変、
exact quarantine、self-heal/retry全attempt、HU-CAP-006 pinned evidence、別runtime reviewが揃うまでdraftとする。
外部CIの単発green、GitHub UI表示、quarantine receiptだけ、再pushだけ、check数を減らしたgreenではfreezeしない。
