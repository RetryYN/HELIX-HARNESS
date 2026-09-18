---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-COR-02
group: コア
product: HARNESS／OS
atoms_primary: 413
atoms_secondary: 338
issue_projection: none
---

# RUL-COR-02（コア／HARNESS／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

成果物と判断を対象revisionとdigestへ束縛し、対象が変わったら古い結果をstaleにする。digestの計算方法を版で固定する。

## 主として対応づいた規則（413件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-080` | Codex CLI 0.144以降はrepo hook trustをtrusted_hashに束縛し、hash drift時は再確認までfail-closeする。 | tooling_runtime | prose | AGENTS.md:272-272 |
| `RA-248` | 引継ぎ・検証はcommit/push済HEADと自分の意図変更に固定し、他runtimeの未commit scratchを基準やrepo状態として報告しない。 | evidence_claim | prose | AGENTS.md:309-313; CLAUDE.md:240-250 |
| `RB0-077` | 外部author PRの担当者は最初にproviderのrecreateで意図しないhead編集やstale生成物を除去し、再生成後のhead SHAを記録する。 | review_merge | prose | docs/governance/github-operation-rules.md:62-64 |
| `RB0-079` | 外部authorのreceipt作成者は未mergeのexact headをclean worktreeで検査し、external identityとCI完了後・comment投稿前のreviewedAtを記録する。 | evidence_claim | prose | docs/governance/github-operation-rules.md:67-67 |
| `RB0-107` | 再利用blocked成果物はdelta revision・対応oracle・独立review・digest更新が揃うまで下流入力にせず、旧greenやstatus変更だけで解除しない。 | process_gate | prose | docs/governance/downstream-canonical-reuse-authority-2026-07-19.md:20-20 |
| `RB0-120` | boundary作成者はseverity policyと出力schemaのdigestをsha256:と64桁hexで指定し、未用意なら対象文書・schemaのsha256を使う。 | evidence_claim | prose／gate | docs/governance/worker-context-boundary-operator-guide.md:83-87 |
| `RB0-122` | boundary検査側はauthorityをcurrent HEADへ束縛し、HEADが動いたstale boundaryを失敗させる。 | evidence_claim | gate | docs/governance/worker-context-boundary-operator-guide.md:112-113 |
| `RB0-180` | registry整合検査側はuniversal-improvement-source-registryをexact_bytes方針で検証する。 | tooling_runtime | config | config/universal-improvement-source-registry.v1.integrity.json:1-6 |
| `RB01-001` | 実装変更者は、explicit_nonmigrationに分類された箇所について、各箇所のバイト単位の期待出力（byte oracle）が凍結されるまで、登録された既存の出力形式を維持する。 | process_gate | config | config/digest-canonicalization-inventory.json:12-45; config/digest-canonicalization-inventory.json:46-62; config/digest-canonicalization-inventory.json:233-249; config/digest-canonicalization-inventory.json:1185-1201; config/digest-canonicalization-inventory.json:7288-7304 |
| `RB01-002` | typed_utilityに分類された5箇所の実装は、公開成果物のダイジェスト表現として、sha256:接頭辞付きの16進SHA-256を使用する。 | tooling_runtime | config | config/digest-canonicalization-inventory.json:2647-2663; config/digest-canonicalization-inventory.json:2698-2731; config/digest-canonicalization-inventory.json:3072-3088; config/digest-canonicalization-inventory.json:4636-4652 |
| `RB05-056` | freeze担当は失効したsnapshot・packet review HEAD・旧digestを現在の承認やレビュー証拠へ再利用しない。 | evidence_claim | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:18-22; docs/governance/l3-rebaseline-g3-freeze-packet.md:150-153 |
| `RB05-060` | packet参照更新時は過去のfreeze承認を再発行したり実装完了と扱ったりせず、新HEADの独立レビュー・CI・DB証拠を別途取得する。 | evidence_claim | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:134-143; docs/governance/l3-rebaseline-g3-freeze-packet.md:171-177 |
| `RB05-061` | packet担当はreview HEAD・CI run・DB digestをGitHub PR conversationのsame-HEAD receiptへ外部束縛し、SHAを書き戻す循環を作らない。 | evidence_claim | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:126-126; docs/governance/l3-rebaseline-g3-freeze-packet.md:186-187 |
| `RB05-063` | push・base更新・正本digest変更・CI self-healが発生した場合、文脈レビューとDB receiptをstaleにし、同じ新HEADで取り直す。 | review_merge | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:188-189 |
| `RB05-068` | freeze担当は成果物digestをpacket PR current HEADで再計算し、表の値と一致しなければfreezeを拒否する。 | process_gate | prose／gate | docs/governance/l3-rebaseline-g3-freeze-packet.md:273-277 |
| `RB05-069` | packet PRへ新しい正本変更を混載せず、レビュー中にmainが前進した場合は承認提示を止め、別のfreeze rebind episodeで追従する。 | review_merge | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:275-277 |
| `RB05-098` | commit後のchat要求はblob digestへ束縛し、後続deltaを既存行のsilent rewriteで処理せず、新規行またはsupersedesで追加する。 | memory_context | prose | docs/governance/infinity-loop-source-capability-ledger.md:27-28 |
| `RB05-124` | ZIPのentry増減またはdigest変更時はsnapshot節と全capability receiptをstaleにする。 | evidence_claim | prose | docs/governance/infinity-loop-source-capability-ledger.md:302-302 |
| `RB05-125` | 前身Gitのcurrent authorityは指定2 repositoryの生成receiptとし、advertisement A/B、exact OID、object/tree/tag/reachability、sealed mirror、trusted store CASが全てgreenのものだけを認める。 | evidence_claim | prose | docs/governance/infinity-loop-source-capability-ledger.md:306-316 |
| `RB05-128` | 現行sourceの正式baselineはcommit/push済みHEADとし、tracked treeと他runtimeの未commit作業を分離して後者をcapabilityへ誤採用しない。 | memory_context | prose | docs/governance/infinity-loop-source-capability-ledger.md:334-336 |
| `RB05-141` | CIは直前段receiptがない、別SHA系統を指す、またはtree digestが一致しない場合、次段開始やreceipt再利用を拒否する。 | process_gate | ci | docs/governance/infinity-loop-system-assertion-cases.md:39-41; docs/governance/infinity-loop-system-assertion-cases.md:350-350; docs/governance/infinity-loop-system-assertion-cases.md:385-385; docs/governance/infinity-loop-system-assertion-cases.md:426-426 |
| `RB05-143` | external CI成功後にPR HEADが変更された場合、その段以降をstaleにしてmergeを禁止する。 | review_merge | ci | docs/governance/infinity-loop-system-assertion-cases.md:43-43 |
| `RB05-145` | PR監査intakeはpayloadのhead SHAがGitHub current headと異なる場合、stale receiptを残して監査jobを作らない。 | review_merge | hook | docs/governance/infinity-loop-system-assertion-cases.md:47-47 |
| `RB05-175` | product tombstone取込時はentity削除状態とmapping staleを記録し、freshness SLA超過時はsnapshotをstaleとしてcurrent返却しない。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:96-97 |
| `RB05-180` | source entry・Git identity/namespace/advertisement/ref・current symbol・extractorが変わった場合、authorityからsnapshot・atomization・coverageまで依存receiptをstaleにする。 | evidence_claim | prose | docs/governance/infinity-loop-system-assertion-cases.md:102-104; docs/governance/infinity-loop-system-assertion-cases.md:166-166; docs/governance/infinity-loop-system-assertion-cases.md:379-379; docs/governance/infinity-loop-system-assertion-cases.md:433-433 |
| `RB05-183` | no-UI receipt成立後にGUI capabilityを追加した場合、receiptをstaleにしてprototype taskを生成する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:110-110 |
| `RB05-224` | active template digestやrequirement digestが変わった場合、既存verification receiptをstaleにし、major version更新後はmigrationなしでinstanceをcurrent化しない。 | evidence_claim | gate | docs/governance/infinity-loop-system-assertion-cases.md:241-242; docs/governance/infinity-loop-system-assertion-cases.md:249-249 |
| `RB05-234` | requirementのsplit・merge・rename・supersede・N/A変更は対応receiptを必須とし、全atom disposition・semantic digest・authority・downstream staleの証拠欠落を拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:280-284; docs/governance/infinity-loop-system-assertion-cases.md:396-396 |
| `RB05-236` | requirement revision更新時は下流service・template・obligationのreceiptをstaleにする。 | evidence_claim | prose | docs/governance/infinity-loop-system-assertion-cases.md:288-288 |
| `RB05-242` | Vertical Pair Gateはtarget digest旧版、意味revision不一致、source snapshot不一致をstaleとして受理しない。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:304-308; docs/governance/infinity-loop-system-assertion-cases.md:399-399 |
| `RB05-262` | manifest生成はUTF-8・BOMなし・LF、規定path順、小文字SHA-256とsha256接頭辞を用い、foreign stateをsource entryへ混入させない。 | tooling_runtime | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:32-42 |
| `RB05-264` | canonicalization versionのない旧path＋content digestをentry set digestの代替にせず、archive bytes一致を確認してentryと分類manifestを再生成する。 | evidence_claim | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:79-80 |
| `RB05-268` | Git authorityはadvertisement A、exact OID隔離取得、object検証、advertisement B、A/B完全一致、sealed bundle、trusted store CASの順でcurrent化し、取得証拠をreceiptに残す。 | evidence_claim | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:196-200 |
| `RB05-273` | historical seedではlocal branch・index/worktree・reflog・未到達objectをsource entryへ含めず、alias target一致を記録する。 | evidence_claim | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:275-276 |
| `RB05-274` | tagゼロ等の過去観測をcurrent namespace policyへ流用せず、fetch timestamp receiptのないseedはstaleとしてA/B取得から作り直す。 | evidence_claim | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:277-283 |
| `RB05-276` | seed後のHEADでは1,931件を恒久期待値にせず、新しいcountとdigestのsnapshotを発行する。 | evidence_claim | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:314-315 |
| `RB05-277` | modified・untracked fileはHEAD sourceへ含めず、status digest等の別telemetryとして扱い、commit前の設計成果をbaselineにしない。 | memory_context | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:378-381 |
| `RB05-278` | source bytes・ref authority・baseline tree・partition・extractor・分類版・並び順・直列化・repository集合・移管routingの変更時はmanifestをstale化する。 | evidence_claim | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:392-398 |
| `RB05-290` | 新ZIP manifestでは各entryのpath・type・size・content digestを再計算し、canonicalization不明の旧digestとは同一視せず併記する。 | evidence_claim | prose | docs/governance/infinity-loop-source-atomization-contract.md:105-113 |
| `RB05-291` | Git atomizeは指定2 repositoryのall-advertised heads/tags/pullをA/B一致とobject検証済みsealed mirrorからだけ行い、分母をreceiptから導出する。 | process_gate | prose | docs/governance/infinity-loop-source-atomization-contract.md:117-123 |
| `RB05-294` | CURRENT sourceはtracked full treeを含め、root ZIPとZIP内部entryを別identityにし、foreign・untrackedを別working-tree観測へ隔離する。 | evidence_claim | prose | docs/governance/infinity-loop-source-atomization-contract.md:159-162 |
| `RB05-295` | 機械artifactはUTF-8・BOMなし・LFで正規直列化し、JSONLをstable ID順・末尾LF付きにし、pathの区切りとraw bytesを保持してUnicode正規化で別entryを同一化しない。 | tooling_runtime | prose | docs/governance/infinity-loop-source-atomization-contract.md:168-183 |
| `RB05-296` | source entry・atom・decision・edgeをsilent rewriteせず、source・extractor・分類rule・接続先digest変更時は新revisionを発行して旧receiptをstaleにし、ref集合変更時は別snapshotにする。 | evidence_claim | prose | docs/governance/infinity-loop-source-atomization-contract.md:185-187 |
| `RB05-303` | source取得はZIP全entryの危険属性をfinding化し、GitのURL・取得時刻・alias・全refとCURRENTのcommit/treeを固定してraw source・entry・ref digestを先にsealする。 | evidence_claim | prose | docs/governance/infinity-loop-source-atomization-contract.md:244-250 |
| `RB05-308` | coverage receiptは全manifestを正規化してsource snapshotへ束縛し、別snapshotのgreenを再利用しない。 | evidence_claim | gate | docs/governance/infinity-loop-source-atomization-contract.md:283-284 |
| `RB05-341` | 次回の外部source監査ではrefs digestとinventory digestを更新し、前回との差分を突合する。 | evidence_claim | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:363-363 |
| `RB05-368` | route projectionはHEAD・contract・owner・dependency frontierの変更やevidence期限切れでstaleにし、再入にはこれらと右腕証拠のcurrent性を要求する。 | evidence_claim | config | config/drive-route-catalog.json:263-275 |
| `RB06-008` | 変更者は意味変更時に旧revisionを上書きせず、履歴として保持する。 | memory_context | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:98-98 |
| `RB06-027` | AIはbase revision更新時にProposalをstale化してrebaseまたは再生成し、downstream影響未処理時はstale伝播完了まで保留する。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:247-248 |
| `RB06-034` | 分類器はsafe判定を本文SHA-256へ束縛し、本文変更時はneeds_manual_reviewとしてfail-closeする。 | process_gate | ci | docs/governance/l12-hybrid-current-authority-disposition-2026-07-19.md:267-267 |
| `RB06-057` | 監査者は件数をcanonical evidenceにする前に、observed HEAD・tree digest・green commandのsnapshot bindingを付記する。 | evidence_claim | prose | docs/governance/rule-enforcement-gap-audit-2026-08-12.md:227-228 |
| `RB06-072` | 変更者は表示名変更だけでrevisionを増やさず、意味変更時は新revisionとdownstream stale receiptを作る。 | process_gate | prose | docs/governance/infinity-loop-requirement-definition-ledger.md:28-28 |
| `RB06-074` | 変更者はrename・supersede・reject・N/Aに、前後のsemantic digest、authority、全consumer、rollbackまたはreentryを付ける。 | evidence_claim | prose | docs/governance/infinity-loop-requirement-definition-ledger.md:30-30 |
| `RB06-076` | 台帳管理者は要求本文更新時に本文cellのUTF-8 bytesからSHA-256を再計算し、旧revision行をappend-onlyで保持してcurrent件数へ重複算入しない。 | evidence_claim | prose | docs/governance/infinity-loop-requirement-definition-ledger.md:32-32; docs/governance/infinity-loop-requirement-definition-ledger.md:194-197 |
| `RB06-140` | source snapshot変更時はmanifest digestを更新し、依存snapshot・atomization・coverage receiptを同一causalityでstale化する。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:89-89 |
| `RB06-155` | revision更新はrename・split・mergeでもidentityとoracleを保持し、意味変更のsafety edge欠落時はCanonical化しない。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:121-121; docs/governance/infinity-loop-assertion-coverage-ledger.md:190-190 |
| `RB06-208` | 成熟度snapshotは監査対象main commitへ束縛し、candidate・dirty worktree・旧branchを加算せず、merge後のread-afterで該当行だけ更新する。 | evidence_claim | prose | docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md:198-199 |
| `RB07-113` | remote refまたはIssue・PRが変化した場合、監査結果を自動的にstaleとし差分監査を要求する。 | evidence_claim | prose | docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:120-122 |
| `RB07-117` | bootstrap検証ではobject key・table・columnを辞書順、arrayを元順序、binaryをunsigned byte array、文字コードをUTF-8、digestをSHA-256とする。 | evidence_claim | config | docs/governance/l3-g3-logical-db-bootstrap-policy.json:4-12 |
| `RB07-118` | bootstrap検証は非観測列の辞書順で行を整列し、該当しなければ全列を使い、列挙された観測列をrebuild-observation markerで正規化する。 | evidence_claim | config | docs/governance/l3-g3-logical-db-bootstrap-policy.json:13-75 |
| `RB07-156` | requirement・HOT・HST・atomic case・component catalogが変わるたび、管理者は進捗snapshotを再計測する。 | evidence_claim | prose | docs/governance/infinity-loop-design-progress-ledger.md:116-116 |
| `RB07-246` | catalog生成器はregistry versionとrequirements・registry digestを束縛し、doctorはmanual driftを拒否してlegacy greenによるcanonical不一致の相殺を許さない。 | process_gate | prose／doctor | docs/governance/route-classification-surface-inventory-2026-08-15.md:52-53 |
| `RB07-251` | 各slice担当者は前段merge済みHEADへ再束縛し、targeted・全回帰・doctor・DB収束・独立exact-HEAD reviewを同じHEADへ揃え、文言是正だけで完了にしない。 | review_merge | prose | docs/governance/route-classification-surface-inventory-2026-08-15.md:98-99 |
| `RB07-315` | CI責務検証はunit・boundary・globalのreceiptを同一candidate HEADへ束縛し、これらにdefer先を設けない。 | evidence_claim | config | config/ci-responsibility-registry.v1.json:39-51; config/ci-responsibility-registry.v1.json:61-75; config/ci-responsibility-registry.v1.json:83-97 |
| `RB08-280` | freeze packet担当者は着地snapshotとcurrent HEAD digestを区別して記録し、次のfreeze rebindでsnapshotを追従させる。 | evidence_claim | prose | docs/governance/operations-rule-audit-2026-07-26.md:48-48 |
| `RB08-297` | 原稿保全検証者はhistorical本文の改行・行末末尾空白だけを正規化し、欠損・順序変更・文言変更をdigest不一致として検出する。 | evidence_claim | prose | docs/governance/request-source-cleanup-2026-09-06.md:13-14; docs/governance/request-source-cleanup-2026-09-06.md:48-50 |
| `RB08-302` | authority管理者はsetのsourceがstale・missing・競合になった場合、配下の要求definitionを一括stale化する。 | evidence_claim | prose | docs/governance/infinity-loop-requirement-authority-binding.md:19-20 |
| `RB09-001` | レビュー・CI証拠の管理者は、current Claude receiptと2件のCIを最終candidate HEADへ束縛する。 | evidence_claim | prose | docs/governance/universal-improvement-sensitive-field-policy-terminal-fullback-evidence.md:24-24 |
| `RB09-002` | レビュー証拠の管理者は、同期前の履歴receiptをcurrent exact-head証拠として再利用してはならない。 | evidence_claim | prose | docs/governance/universal-improvement-sensitive-field-policy-terminal-fullback-evidence.md:24-24 |
| `RB09-017` | CI Verification Planは、wrong HEADまたはstale registryを拒否する。 | process_gate | prose | docs/governance/ci-verification-plan-terminal-fullback-evidence.md:26-26 |
| `RB09-032` | 後続sliceの担当者は、先行sliceのmain merge後に後続baseを再同期し、exact-HEAD reviewを取り直す。 | review_merge | prose | docs/governance/system-synthesis-rollout-roadmap.md:33-34 |
| `RB09-078` | CLIは、current workflow identityのprimary tupleとして、requirements-owned registryのregistry_version、registry_source_digest、target_axis、target_idを使う。 | tooling_runtime | prose | docs/governance/cli-workflow-identity-terminal-fullback-evidence.md:13-15 |
| `RC0-137` | Issue closure CIは、admission前後のGitHub PR context snapshotが一致しない場合、失敗する。 | process_gate | ci | .github/workflows/harness-check.yml:463-469 |
| `RC0-138` | Impact CI選択は、再取得したPRのHEAD・base・draft状態・本文digestのいずれかが最初のsnapshotと変わった場合、失敗する。 | process_gate | ci | .github/workflows/harness-check.yml:630-640 |
| `RC0-139` | Impact CIは、対象のdraft状態遷移時に、同一HEAD・baseを束縛する期限内full receiptを持つ過去成功runだけを再利用する。取得や照合に失敗した場合はfull実行へ戻す。 | process_gate | ci | .github/workflows/harness-check.yml:644-673 |
| `RC0-149` | Workflow routingは、classification catalogとpolicy projectionのclassification registry digestが一致しない場合、例外で拒否する。 | process_gate | gate | src/workflow/workflow-execution-routing.ts:112-117 |
| `RC0-151` | Workflow routingは、classification catalogとpolicy projectionのrequirements digestが一致しない場合、例外で拒否する。 | process_gate | gate | src/workflow/workflow-execution-routing.ts:118-123 |
| `RC00-004` | native worker policyの読込器は、計算したpolicy digestが期待値と異なる場合に失敗する。 | lane_delegation | config／gate | src/runtime/codex-native-worker-policy.ts:48-57 |
| `RC00-014` | 跨repository仕様store検査は、refがcommit SHAまたはrefs/tags形式に固定されていなければ不合格とする。 | evidence_claim | gate | src/runtime/cross-repo-spec-store.ts:34-48 |
| `RC00-016` | 跨repository仕様store検査は、消費するPLAN IDまたはartifact digestが空なら不合格とする。 | evidence_claim | gate | src/runtime/cross-repo-spec-store.ts:59-69 |
| `RC00-095` | CI branch base解決器は、PR再取得時にHEADまたはbaseが初回観測と異なれば失敗する。 | evidence_claim | ci | src/runtime/ci-branch-base.ts:83-87 |
| `RC00-101` | closure証拠probe判定は、HEADが小文字40桁SHAでなければblockedとする。 | evidence_claim | gate | src/runtime/closure-evidence-probe-context.ts:7-7; src/runtime/closure-evidence-probe-context.ts:47-68 |
| `RC00-102` | closure証拠probe判定は、working treeのstatus出力が空でなければblockedとする。 | evidence_claim | gate | src/runtime/closure-evidence-probe-context.ts:48-48; src/runtime/closure-evidence-probe-context.ts:69-69 |
| `RC00-103` | closure証拠probe判定は、path・HEAD・branchが一致しprunableでないworktreeを1件に特定できなければblockedとする。 | evidence_claim | gate | src/runtime/closure-evidence-probe-context.ts:49-58; src/runtime/closure-evidence-probe-context.ts:70-70 |
| `RC00-106` | closure証拠probe判定は、HEADと一致するremote refがなければblockedとする。branchがある場合はそのbranch refとの一致も要求する。 | evidence_claim | gate | src/runtime/closure-evidence-probe-context.ts:59-65; src/runtime/closure-evidence-probe-context.ts:73-73 |
| `RC00-109` | source mirror完全性検査は、refs digestが有効形式でなければ完了主張を拒否する。 | evidence_claim | gate | src/runtime/source-content-mirror-completeness.ts:49-69; src/runtime/source-content-mirror-completeness.ts:120-124 |
| `RC00-110` | source mirror完全性検査は、default tree digestが有効形式でなければ完了主張を拒否する。 | evidence_claim | gate | src/runtime/source-content-mirror-completeness.ts:71-76; src/runtime/source-content-mirror-completeness.ts:120-124 |
| `RC00-111` | source mirror完全性検査は、default branch本文digestが有効形式でなければ完了主張を拒否する。 | evidence_claim | gate | src/runtime/source-content-mirror-completeness.ts:78-83; src/runtime/source-content-mirror-completeness.ts:120-124 |
| `RC00-127` | review lane closure生成器は、modelが非空文字列でないかCLI binary digestが規定のSHA-256形式でなければ失敗する。 | evidence_claim | gate | src/runtime/review-lane-closure.ts:57-63; src/runtime/review-lane-closure.ts:75-75 |
| `RC00-138` | artifact収束検査は、digestが空白のartifactがあればcritical findingとして完了主張を拒否する。 | evidence_claim | gate | src/runtime/artifact-convergence-analyzer.ts:62-71; src/runtime/artifact-convergence-analyzer.ts:118-122 |
| `RC00-224` | worker出力admissionは、出力のdescriptor digestまたはschema digestが実行bindingと違えば拒否する。 | evidence_claim | gate | src/runtime/worker-output-admission.ts:342-347 |
| `RC00-225` | worker出力admissionは、payload digestが不正形式またはpayloadからの再計算値と違えば拒否する。 | evidence_claim | gate | src/runtime/worker-output-admission.ts:348-351 |
| `RC00-238` | worker独立review検証器は、receiptのproposal digestが認証出力から計算したdigestと異なれば拒否する。 | review_merge | gate | src/runtime/worker-review-receipt.ts:141-142 |
| `RC00-239` | worker独立review検証器は、receiptのfinding digestがreviewer出力のpayload digestと違えば拒否する。 | review_merge | gate | src/runtime/worker-review-receipt.ts:143-144 |
| `RC00-243` | worker独立review admissionは、workerまたはreviewerの出力を現在bindingの実行originへ解決できなければ拒否する。 | evidence_claim | gate | src/runtime/worker-review-receipt.ts:168-175 |
| `RC00-246` | project hook authority解決器は、実行rootとloaderの物理identity不一致、session authority時のsession root不一致、またはroot digest不一致があれば失敗する。 | escalation_authority | gate | src/runtime/project-hook-authority.ts:206-217; src/runtime/project-hook-authority.ts:273-299 |
| `RC00-247` | project hook authority解決器は、repository HEADがcandidate baseまたはcurrent authority HEADと異なれば失敗する。 | escalation_authority | gate | src/runtime/project-hook-authority.ts:283-299 |
| `RC01-009` | 退役artifact loaderは、authority文書のSHA-256が期待digestに一致しない場合、失敗させる。 | escalation_authority | lint | src/lint/artifact-retirement-authority.ts:50-53 |
| `RC01-027` | 証拠ファイル検査は、読取り前後でsize・mtime・ctimeが変わる、現在pathのdevice・inodeが変わる、または読取byte数がsizeと違う場合、拒否する。 | evidence_claim | lint | src/lint/evidence-file-substance.ts:120-132 |
| `RC01-057` | L3 progression authority検査は、指定blocker文書にreview済みdigestの登録がない場合、findingを返す。 | escalation_authority | lint | src/lint/l3-progression-authority.ts:69-78 |
| `RC01-058` | L3 progression authority検査は、指定文書の実SHA-256がreview済みdigestと一致しない場合、findingを返す。 | escalation_authority | lint | src/lint/l3-progression-authority.ts:79-84 |
| `RC01-133` | green-command-digestは、検査対象green_commandにpathとdigestの両方がある場合、digestがsha256:と64桁hexの形式でないと不合格にする。正当なsupersession対象PLANは除く。 | evidence_claim | lint／doctor | src/lint/green-command-digest.ts:53-77; src/lint/green-command-digest.ts:151-168 |
| `RC02-010` | 論理DB receipt生成器は、canonical JSONの契約が実装内の固定契約と一致しない場合、例外で拒否する。 | evidence_claim | gate | src/doctor/l3-g3-logical-db-receipt.ts:60-66; src/doctor/l3-g3-logical-db-receipt.ts:98-100 |
| `RC02-011` | 論理DB receipt生成器は、table_orderがlexicographic_ascendingでない場合、例外で拒否する。 | evidence_claim | gate | src/doctor/l3-g3-logical-db-receipt.ts:101-103 |
| `RC02-012` | 論理DB receipt生成器は、column_orderがlexicographic_ascendingでない場合、例外で拒否する。 | evidence_claim | gate | src/doctor/l3-g3-logical-db-receipt.ts:104-106 |
| `RC02-013` | 論理DB receipt生成器は、row_orderが実装内の行整列契約と一致しない場合、例外で拒否する。 | evidence_claim | gate | src/doctor/l3-g3-logical-db-receipt.ts:67-70; src/doctor/l3-g3-logical-db-receipt.ts:107-109 |
| `RC02-014` | 論理DB receipt生成器は、normalization_markerが実装の固定値と一致しない場合、例外で拒否する。 | evidence_claim | gate | src/doctor/l3-g3-logical-db-receipt.ts:71-71; src/doctor/l3-g3-logical-db-receipt.ts:110-112 |
| `RC02-015` | 論理DB receipt生成器は、observation_columnsのdigestがレビュー済み固定digestと一致しない場合、例外で拒否する。 | evidence_claim | gate | src/doctor/l3-g3-logical-db-receipt.ts:72-73; src/doctor/l3-g3-logical-db-receipt.ts:113-115 |
| `RC02-054` | doctorのtriage-decision-integrity checkは、triage判断とsourceの整合検査が不合格、または検査不能の場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:1403-1423 |
| `RC02-061` | doctorのdigest-inventory checkは、登録済みrowsとproduction AST scan結果がJSON表現で一致しない、または読込・走査失敗の場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:1567-1589 |
| `RC02-098` | doctorのdesign-artifact-source-digest checkは、設計書pinと実ファイルdigestの検査が不合格、または検査不能の場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:4765-4780 |
| `RC02-175` | doctorのcompletion-review-bundle checkは、bundleと同じ生成時刻のdecision packetとの検査不合格、専用packet bridge違反、または検査不能で失敗する。 | review_merge | doctor | src/doctor/index.ts:6989-7027; src/doctor/index.ts:7029-7179 |
| `RC02-188` | full doctorは、green commandのdigestとevidence_pathの実hashを検査するcheckが不合格の場合、総合判定を失敗にする。 | evidence_claim | doctor | src/doctor/index.ts:7529-7530; src/doctor/index.ts:7680-7680; src/doctor/index.ts:7692-7719 |
| `RC03-012` | closure authority drift検査は、sourceの実バイト列のSHA-256が登録digestと一致しない場合、不適格とする。 | evidence_claim | gate | src/policy/closure-authority-registry.ts:173-180; src/policy/closure-authority-registry.ts:242-248 |
| `RC03-032` | closure authority backfill処理は、対応テストreceiptのrepository_headが処理対象HEADと一致しない場合、候補をinvalidとする。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:395-408 |
| `RC03-034` | closure authority backfill処理は、対応するL8行またはテストが欠落するか、それらのsource_digestが所定形式でない場合、候補をinvalidとする。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:409-412 |
| `RC03-048` | closure authority backfill bundle生成処理は、gate allowlistのHEADが処理対象HEADと一致しない場合、失敗する。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:505-506 |
| `RC03-051` | closure authority backfill bundle読込処理は、bundle_digestを除いた内容から再計算したdigestが宣言値と一致しない場合、失敗する。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:540-551 |
| `RC03-052` | historical V-pair authority読込処理は、authority全体の自己digestが再計算値と一致しない場合、失敗する。 | evidence_claim | gate | src/policy/historical-vpair-migration-authority.ts:82-86 |
| `RC03-054` | historical V-pair authority読込処理は、各行の自己digestが再計算値と一致しない場合、失敗する。 | evidence_claim | gate | src/policy/historical-vpair-migration-authority.ts:91-92 |
| `RC03-055` | historical V-pair authority読込処理は、全行から再計算したdigestがinitial_census_digestと一致しない場合、失敗する。 | evidence_claim | gate | src/policy/historical-vpair-migration-authority.ts:94-95 |
| `RC03-062` | historical V-pair移行分類処理は、cutoff由来を示すauthority行のfingerprint、reason、detail、path、blob OID、semantic digestが候補と一致しなければ、historical_unprovenに分類する。 | evidence_claim | gate | src/policy/historical-vpair-migration-authority.ts:124-141 |
| `RC03-065` | historical migration review検証処理は、reviewの自己digestが内容から再計算した値と一致しない場合、受理を拒否する。 | evidence_claim | gate | src/policy/historical-vpair-migration-authority.ts:216-219 |
| `RC03-067` | historical migration review検証処理は、reviewが示すbundle digest、authority artifact digest、authority generationのいずれかが対象と一致しない場合、受理を拒否する。 | evidence_claim | gate | src/policy/historical-vpair-migration-authority.ts:222-230 |
| `RC03-088` | feedback ack処理は、対象sourceが存在しないか要求世代が現在世代と一致しない場合、操作を拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:437-445 |
| `RC03-091` | feedback surface処理は、sourceが存在しない、世代が一致しない、または現在状態がopenでもackでもない場合、操作を拒否する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:593-605 |
| `RC04-051` | durable storeは、退役sourceの本文・digest・ファイル名digestが一致しなければ移行を拒否する。 | evidence_claim | gate | src/orchestration/loop-store.ts:179-186 |
| `RC04-054` | durable storeは、未発行の旧import完了markerを補完するとき、移行元digestがpayloadとファイル名に一致しなければ拒否する。 | evidence_claim | gate | src/orchestration/loop-store.ts:209-218 |
| `RC04-090` | stale claim復旧器は、既存mutexのdigestが承認時の観測から変わっていれば拒否する。 | escalation_authority | gate | src/orchestration/durable-loop-epoch-node.ts:499-500 |
| `RC04-093` | stale claim復旧器は、claim IDまたはclaim・pointer・manifestのdigestが現在状態と復旧packetに一致しなければ拒否する。 | evidence_claim | gate | src/orchestration/durable-loop-epoch-node.ts:536-552 |
| `RC04-130` | AI判断提案検証器は、measurement oracleがcurrentでなければ拒否する。 | evidence_claim | gate | src/workflow/ai-decision-proposal.ts:109-111 |
| `RC04-136` | workflow実行route評価器は、catalogとpolicy projectionのclassification registry digestが異なれば例外にする。 | process_gate | gate | src/workflow/workflow-execution-routing.ts:112-117 |
| `RC04-137` | workflow実行route評価器は、catalogとpolicy projectionのrequirements digestが異なれば例外にする。 | process_gate | gate | src/workflow/workflow-execution-routing.ts:118-123 |
| `RC04-152` | interview評価器は、回答のsource digestまたはrevisionが現在sourceと違えばstaleな未解決事項としてfreezeを拒否する。 | evidence_claim | gate | src/workflow/workflow-interview-unresolved.ts:119-130; src/workflow/workflow-interview-unresolved.ts:194-201 |
| `RC04-207` | workflow envelope検証器は、source・workflow model・runtime orchestrationのsource digestが一致しなければactivationを拒否する。 | evidence_claim | gate | src/workflow/universal-workflow-envelope.ts:283-292; src/workflow/universal-workflow-envelope.ts:425-429 |
| `RC04-213` | 派生trace検証器は、graphのworkflow ID・source revision・snapshotが現在envelopeと一致しなければ失敗する。 | evidence_claim | gate | src/workflow/derived-requirement-trace.ts:289-295 |
| `RC04-216` | 派生trace検証器は、artifactまたはtraceのsource revision・snapshotが現在値と一致しなければ失敗する。 | evidence_claim | gate | src/workflow/derived-requirement-trace.ts:303-306; src/workflow/derived-requirement-trace.ts:413-416 |
| `RC04-248` | CIは、Issue closure admissionの前後で現在PR contextが変わったら失敗する。 | review_merge | ci | .github/workflows/harness-check.yml:463-469 |
| `RC04-258` | Impact CIは、選択処理中にPR HEAD・base・draft状態・body digestが変わったら失敗する。 | review_merge | ci | .github/workflows/harness-check.yml:630-640 |
| `RC04-259` | Impact CIは、Ready/Draft遷移時のfull結果再利用を、別の成功runに未失効receiptがありHEADとbaseが現在値に一致する場合に限る。取得不能ならfull実行へ戻す。 | evidence_claim | ci | .github/workflows/harness-check.yml:649-673 |
| `RC04-269` | 未応答review監査CIは、前回artifactなしでbootstrapを明示指定した場合、bootstrap revisionが無ければ失敗する。 | evidence_claim | ci | .github/workflows/claude-unanswered-review-audit.yml:42-54 |
| `RC04-274` | review観測収集器は、全ページを2回取得したID・updated_at列が一致しなければpagination raceとして失敗する。 | evidence_claim | ci | .github/scripts/collect-claude-review-observation.mjs:23-28 |
| `RD00-005` | wrapper admissionは、adapter planの期待digestと実際のdigestが一致しない場合、起動を拒否する。 | evidence_claim | gate | src/runtime/adapter.ts:406-411 |
| `RD00-006` | wrapper admissionは、解決されたinvocationの期待digestと実際のdigestが一致しない場合、起動を拒否する。 | evidence_claim | gate | src/runtime/adapter.ts:412-417 |
| `RD00-009` | wrapper admissionは、再証明したauthorityまたは有効ルールpacketのdigestがcontext packetと異なる場合、起動を拒否する。 | memory_context | gate | src/runtime/adapter.ts:456-462 |
| `RD00-055` | atomic slice評価は、scope拡張receiptのcandidate HEADまたは元manifest digestが現在のsnapshotと異なる場合、stale_snapshotとscope_expansion_unauthorizedにする。 | evidence_claim | gate | src/runtime/atomic-slice-admission.ts:253-269 |
| `RD00-059` | CI schedulerは、candidate・expected candidate・baseのHEAD形式や一致関係が不正、またはcandidateとbaseが同一の場合、失敗判定にする。 | evidence_claim | ci | src/runtime/ci-critical-path-scheduler.ts:200-208 |
| `RD00-077` | CI schedulerは、artifactの対象capability・source HEAD・実行環境・入出力digestが期待identityと一致しない場合、再利用を拒否して失敗判定にする。 | evidence_claim | ci | src/runtime/ci-critical-path-scheduler.ts:419-447 |
| `RD00-086` | 延期義務の照合は、terminal runのcandidate HEADがassignmentと異なる場合、失敗判定にする。 | evidence_claim | ci | src/runtime/ci-deferred-obligation-recovery.ts:263-268 |
| `RD00-108` | CI検証計画は、candidate HEADが完全SHAでない場合、失敗する。 | evidence_claim | ci | src/runtime/ci-verification-plan.ts:209-213 |
| `RD00-109` | CI検証計画は、expected candidate HEADが不正、またはcandidate HEADと一致しない場合、失敗する。 | evidence_claim | ci | src/runtime/ci-verification-plan.ts:214-221 |
| `RD00-110` | CI検証計画は、base HEADが不正またはcandidate HEADと同一の場合、失敗する。 | evidence_claim | ci | src/runtime/ci-verification-plan.ts:222-224 |
| `RD00-113` | CI検証計画は、registryの再計算digestが期待digestと一致しない場合、失敗する。 | evidence_claim | ci | src/runtime/ci-verification-plan.ts:237-242 |
| `RD00-123` | CI検証計画は、延期assignmentのcandidate HEADが計画対象と異なる場合、拒否する。 | evidence_claim | ci | src/runtime/ci-verification-plan.ts:318-327 |
| `RD00-125` | CI検証計画は、succeededの延期receiptに有効なSHA-256 digestがない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-verification-plan.ts:338-346 |
| `RD00-142` | CI telemetry検証は、source・base・candidateのHEADが完全SHAでない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:523-525 |
| `RD00-143` | CI telemetry検証は、有効なsource HEADとcandidate HEADが異なる場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:526-528 |
| `RD00-149` | CI telemetry検証は、runner attestation digestが不正または再計算値と一致しない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:531-544 |
| `RD00-171` | CI telemetry検証は、artifactのlockfile・input・output digestが不正な場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:670-673 |
| `RD00-179` | CI telemetry検証は、payload digestが不正・再計算不一致・再計算不能のいずれかの場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:716-724 |
| `RD00-180` | CI telemetry検証は、evidence digestが不正・再計算不一致・再計算不能のいずれかの場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:717-730 |
| `RD00-185` | CI telemetryは、batch内でschema・profile・surface・HEAD群・workflow・run・attemptの束縛項目が一致しない場合、失敗する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:782-799 |
| `RD00-186` | CI telemetryは、batch内のrunner attestation digestが一致しない場合、失敗する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:800-804 |
| `RD00-194` | CI telemetryは、連結するartifact transfer間で前段output digestと後段input digestが異なる場合、失敗する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:843-851 |
| `RD00-197` | CI telemetry projectionは、run間でsource・base・candidate HEADが一致しない場合、失敗する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:1058-1062 |
| `RD00-209` | Claude inboxは、OFF・TERMINAL・SUPERSEDEDからのsupersede、同一HEADへのsupersede、または不正HEADへのsupersedeを拒否する。 | process_gate | gate | src/runtime/claude-memory-wake.ts:209-217 |
| `RD00-217` | Claude review dispatchは、HEADが完全SHAでない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-memory-wake.ts:649-651 |
| `RD00-222` | Claude inboxは、既存markerのHEADが通知identityのHEADと異なる場合、arm処理を競合として拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:820-823; src/runtime/claude-memory-wake.ts:839-843 |
| `RD00-235` | Claude inboxは、汎用通知のack digestがclaimのdelivery digestと異なる場合、拒否する。 | evidence_claim | gate | src/runtime/claude-memory-wake.ts:1272-1276 |
| `RD00-241` | Claude inboxは、PR review terminal記録で対象PR・HEAD・CI世代に一致する配信済みentryがない場合、記録せずnullを返す。 | evidence_claim | gate | src/runtime/claude-memory-wake.ts:1511-1525 |
| `RD00-247` | Claude wake watcherは、現在PR HEADが依頼HEADと異なる場合、依頼をsupersededにして配信しない。 | review_merge | gate | src/runtime/claude-memory-wake.ts:1613-1622 |
| `RD00-254` | PR収束処理は、review済みHEADが完全SHAでない場合、merge引数生成を拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:407-407 |
| `RD00-264` | review receipt検証は、repository・PR番号・HEADのidentityが不正な場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:544-552 |
| `RD00-278` | canonical DB receipt束縛は、DB source HEADがreview対象HEADと異なる場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:657-663 |
| `RD00-279` | canonical DB receipt束縛は、source treeが完全SHAでない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:664-666 |
| `RD00-280` | canonical DB receipt束縛は、追跡workspace必須・clean・status件数0の条件が揃わない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:667-673 |
| `RD00-285` | review receipt検証は、receipt IDまたはdigestがschemaに応じた再計算値と一致しない場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:769-776; src/runtime/claude-pr-convergence.ts:789-803; src/runtime/claude-pr-convergence.ts:897-898 |
| `RD00-293` | review commentのread-after検証は、有効なcurrent v4 receiptを復号できない、または期待digestと異なる場合、失敗する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:1004-1010 |
| `RD00-304` | 訂正receipt探索は、訂正内容・対象identity・元slot digest・訂正digest・理由・時刻・authorization IDが完全に対応しない場合、訂正証拠を採用しない。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:1247-1271; src/runtime/claude-pr-convergence.ts:1289-1298 |
| `RD00-321` | CLI-R00構造snapshotは、source HEADが完全SHAでない場合、生成を拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:435-443 |
| `RD00-333` | CLI-R00 condition decoderは、指定されたsource HEADが完全SHAでない場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:573-577 |
| `RD00-361` | CLI-R00 artifact検証は、source HEADが完全SHAの文字列でない場合、失敗する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:890-892 |
| `RD00-371` | CLI-R00構造proxy再測定は、snapshotのsource HEADがartifactと異なる場合、失敗を返す。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:1021-1026 |
| `RD01-009` | retirement journalの検証処理は、checkpointが直前の完了phaseとartifact digestsに一致しない場合に失敗する。 | evidence_claim | gate | src/runtime/continuation.ts:186-195; src/runtime/continuation.ts:220-222 |
| `RD01-023` | rollback判定は、backup manifest digestが不正またはcheckpointのbackup digestと不一致なら拒否する。 | evidence_claim | gate | src/runtime/continuation.ts:491-497 |
| `RD01-024` | rollback判定は、restore digestが不正またはbackup manifest digestと不一致なら拒否する。 | evidence_claim | gate | src/runtime/continuation.ts:498-500 |
| `RD01-038` | continuation読取処理は、保存されたpayload hashが再計算値と一致しなければ拒否する。 | evidence_claim | gate | src/runtime/continuation.ts:792-794 |
| `RD01-060` | delivery journal読取処理は、保存event hashが再計算値と一致しなければ拒否する。 | evidence_claim | gate | src/runtime/continuation.ts:1343-1345 |
| `RD01-103` | checkpoint replay判定は、HEAD・親lane・イベント境界の束縛が不正または不足なら拒否する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-replay.ts:402-412 |
| `RD01-104` | checkpoint replay判定は、checkpointのHEADが現在HEADと異なれば拒否する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-replay.ts:413-415 |
| `RD01-115` | orchestration transactionは、新規イベントまたはjournal内イベントのHEADが現在HEADと異なれば拒否する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-transaction.ts:247-250; src/runtime/event-projection-checkpoint-transaction.ts:522-530 |
| `RD01-148` | PLAN authoring処理は、現在HEADが入力candidate HEADと異なれば拒否する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:397-397 |
| `RD01-149` | PLAN authoring処理は、remote mainが入力のexpected mainまたはobserved mainと異なれば拒否する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:398-402 |
| `RD01-152` | PLAN authoring処理は、fresh予約authorityのdigestがsnapshot再計算値と異なれば拒否する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:413-418 |
| `RD01-156` | PLAN authoring処理は、Forward文書のdigestが予約入力と異なれば拒否する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:429-432 |
| `RD01-157` | PLAN authoring処理は、Reverse文書のdigestがallocation入力と異なれば拒否する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:433-434 |
| `RD01-166` | PLAN authoring処理は、lock取得後にHEADまたはremote mainが変化していれば拒否する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:662-663 |
| `RD01-169` | PLAN authoring処理は、stage集合または各stageのdigestが期待値と異なれば失敗する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:739-747 |
| `RD01-176` | Forward／Reverse予約処理は、allocator receipt digestがallocation payloadの再計算値と異なれば拒否する。 | evidence_claim | gate | src/runtime/forward-reverse-terminal-reservation.ts:103-105 |
| `RD01-177` | Forward／Reverse予約処理は、expected mainとobserved mainが異なれば拒否する。 | evidence_claim | gate | src/runtime/forward-reverse-terminal-reservation.ts:106-106 |
| `RD01-178` | Forward／Reverse予約処理は、snapshotにcurrent main予約がない、またはそのHEADがobserved mainと異なれば拒否する。 | evidence_claim | gate | src/runtime/forward-reverse-terminal-reservation.ts:107-111 |
| `RD01-193` | 回帰shard検証は、inventory digestが期待inventoryの再計算値と異なれば失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:174-174 |
| `RD01-196` | 回帰shard検証は、files digestがfile列の再計算値と異なれば失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:187-189 |
| `RD01-200` | 回帰shard検証は、partition digestがplan全体の再計算値と異なれば失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:206-216 |
| `RD01-205` | 回帰receipt検証は、candidate HEADがplanと異なれば失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:244-246 |
| `RD01-206` | 回帰receipt検証は、base SHAがplanと異なれば失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:247-248 |
| `RD01-207` | 回帰receipt検証は、partition digestがplanと異なれば失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:249-251 |
| `RD01-208` | 回帰receipt検証は、files digestが対応shardと異なれば失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:252-254 |
| `RD01-219` | Git guard hookは、push元commitを解決できなければ拒否する。 | evidence_claim | hook | src/runtime/git-command-guard-hook.ts:99-100 |
| `RD01-220` | Git guard hookは、push差分の基準commitを解決できなければ拒否する。 | evidence_claim | hook | src/runtime/git-command-guard-hook.ts:101-118 |
| `RD01-247` | logical DB receipt検証は、source HEADがcandidate HEADと異なれば不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:221-221 |
| `RD01-258` | logical DB receipt検証は、本体またはreplayのstale件数が0でなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:235-236 |
| `RD01-262` | logical DB receipt検証は、convergedとreceipt digestを除く本文の再計算digestが保存値と異なれば不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:217-217; src/runtime/github-cross-review-admission.ts:242-242 |
| `RD01-267` | Kimi provenance検証は、logical DB receiptが正規検証を通らない、現在receiptと異なる、またはreview receiptのdigestと異なる場合に失敗する。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:366-374 |
| `RD01-268` | Kimi provenance検証は、admission receipt digestがreview receiptの参照値と異なれば失敗する。 | escalation_authority | gate | src/runtime/github-cross-review-admission.ts:407-408 |
| `RD01-269` | Kimi provenance検証は、provider失敗証跡の再計算digest・参照digest・HEAD・失敗理由がreview receiptと整合しなければ失敗する。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:375-385; src/runtime/github-cross-review-admission.ts:409-412 |
| `RD01-272` | Kimi provenance検証は、review出力・findingのdigestまたはHEAD・verdict・blocker件数がreceiptと整合しなければ失敗する。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:399-406; src/runtime/github-cross-review-admission.ts:422-428 |
| `RD01-273` | Kimi provenance検証は、現在review packetのdigestがreceiptと異なれば失敗する。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:429-429 |
| `RD01-274` | Claude DB provenance検証は、正規DB receipt検証またはreceipt内のDB・projection・checkpoint digest束縛が一致しなければ失敗する。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:436-448 |
| `RD01-279` | review候補検証は、receiptのHEADがcandidate HEADと異なれば拒否する。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:521-521 |
| `RD01-295` | merge後再読判定は、candidate commitまたはtreeを取得できなければverifiedにしない。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:710-711 |
| `RD01-296` | merge後再読判定は、取得candidate commitがcandidate HEADと異なればverifiedにしない。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:712-714 |
| `RD01-309` | ベンチdataset検証は、fixture payloadのdigestがtask snapshotと異なれば拒否する。 | evidence_claim | gate | src/runtime/helix-bench-task-dataset.ts:229-231 |
| `RD01-312` | ベンチdataset検証は、hidden oracle全体のdigestがtask snapshotと異なれば拒否する。 | evidence_claim | gate | src/runtime/helix-bench-task-dataset.ts:257-263 |
| `RD01-322` | Lite canary selectorは、digestがstale、candidate HEADが不正、またはfast checkのsource HEADとcandidate HEADが異なる場合に省略を許可しない。 | evidence_claim | ci | src/runtime/impact-ci.ts:327-333 |
| `RD01-347` | CI profile receipt検証は、同HEAD・profile・実行surfaceで項目が重なるterminal証跡が既にあり、base・inventory・body束縛が異なる場合に拒否する。 | evidence_claim | gate | src/runtime/impact-ci.ts:518-532 |
| `RD02-007` | admission検証器は、receipt digestがpayloadの再計算値と一致しない場合に拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:176-201 |
| `RD02-008` | 実装照合器は、実行するlane closure digestが不正またはadmissionの値と異なる場合に拒否する。 | review_merge | gate | src/runtime/independent-review-fallback.ts:210-223 |
| `RD02-012` | admission生成器は、benchmark・negative oracle・独立検証者の実装HEAD、または両試験のclosure digestが一致しない場合に拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:315-326 |
| `RD02-014` | 証跡保存器は、同じdigest名の既存ファイルが異なる内容を持つ場合に上書きを拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:356-362; src/runtime/independent-review-fallback.ts:1674-1680 |
| `RD02-017` | provider選択器は、障害証跡のHEADが候補HEADと異なる場合にfallbackを拒否する。 | review_merge | gate | src/runtime/independent-review-fallback.ts:442-444 |
| `RD02-060` | レビュー出力検証器は、出力内HEADが要求した候補HEADと異なる場合に拒否する。 | review_merge | gate | src/runtime/independent-review-fallback.ts:1476-1478; src/runtime/independent-review-fallback.ts:1739-1739 |
| `RD02-062` | 中立receipt生成器は、admissionと実行closure、障害・lease・出力のHEAD、またはleaseのPR・repository・provider束縛が一致しない場合に拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:1556-1565 |
| `RD02-070` | 中立receipt検証器は、receipt digestがpayloadの再計算値と異なる場合に拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:1660-1662 |
| `RD02-072` | receipt読込器は、ファイル名がreceipt digestに対応するJSON名でない場合に拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:1700-1702 |
| `RD02-074` | receipt読込器は、対応admissionのdigestまたはclosureがレビューreceiptと一致しない場合に拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:1710-1719 |
| `RD02-079` | 中立レビューmerge判定器は、receiptのCIが対象HEADと一致しない場合に失敗理由を返す。 | review_merge | gate | src/runtime/independent-review-fallback.ts:1742-1742 |
| `RD02-165` | lint effect実行器は、preflightまたはdispatch直前の実測snapshotがintentのsnapshotと異なる場合にblockする。 | evidence_claim | gate | src/runtime/lint-effect-executor.ts:195-196; src/runtime/lint-effect-executor.ts:225-235 |
| `RD02-172` | lint effect実行器は、authorizationのcapability・actor・tool・target・params digest・payload digestの束縛がintentと異なる場合にblockする。 | safety_security | gate | src/runtime/lint-effect-executor.ts:210-218 |
| `RD02-175` | lint effect実行器は、実行後のsnapshotが変化した場合、または観測不能の場合に結果をuncertainとし受理しない。 | evidence_claim | gate | src/runtime/lint-effect-executor.ts:238-247; src/runtime/lint-effect-executor.ts:358-373; src/runtime/lint-effect-executor.ts:455-470 |
| `RD02-183` | artifact生成器は、実際のcontentから計算したdigestが宣言値と異なる場合にblockする。 | evidence_claim | gate | src/runtime/lint-effect-executor.ts:447-448 |
| `RD02-236` | 物理同一性再検証器は、現在のidentity・対象集合・repo rootのdigestのいずれかがbindingと異なる場合に拒否する。 | safety_security | gate | src/runtime/physical-filesystem-identity.ts:502-518 |
| `RD02-240` | hook authority処理器は、loader・session・current authority rootのgit common dirが実行repoと異なる場合にstale failureを返す。 | safety_security | gate | src/runtime/project-hook-authority-envelope.ts:228-236 |
| `RD02-241` | hook authority処理器は、current authority rootのHEADがhostから独立取得したdefault refのHEADと異なる場合に拒否する。 | safety_security | gate | src/runtime/project-hook-authority-envelope.ts:237-241 |
| `RD02-242` | hook authority処理器は、実行・loader・session・current authorityのいずれかのroot identityが期待値と異なる場合に拒否する。 | safety_security | gate | src/runtime/project-hook-authority-envelope.ts:243-256 |
| `RD02-243` | hook authority処理器は、実行repo HEADがcandidate base HEADと異なる場合に拒否する。 | evidence_claim | gate | src/runtime/project-hook-authority-envelope.ts:257-258 |
| `RD02-244` | hook authority処理器は、current authority HEADがenvelopeの期待値と異なる場合に拒否する。 | evidence_claim | gate | src/runtime/project-hook-authority-envelope.ts:259-263 |
| `RD02-245` | hook authority処理器は、実行rootのsource materialが期待値と異なる場合に拒否する。 | evidence_claim | gate | src/runtime/project-hook-authority-envelope.ts:264-265 |
| `RD02-246` | hook authority処理器は、current authorityのsource materialが期待値と異なる場合に拒否する。 | evidence_claim | gate | src/runtime/project-hook-authority-envelope.ts:266-272 |
| `RD02-280` | review返却・引継ぎ判定器は、対象HEADまたはremote branch HEADが割当candidate HEADと異なる場合に拒否する。 | review_merge | gate | src/runtime/resident-lane-assignment.ts:256-258; src/runtime/resident-lane-assignment.ts:291-293 |
| `RD02-311` | 保存manifest収集器は、追跡済み保存対象にunstagedまたはstaged差分がある場合に拒否する。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:317-330 |
| `RD02-316` | 保存入力検証器は、source commit・collectorが空、または採取時刻が不正な場合に拒否する。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:541-547 |
| `RD02-333` | provider pointer検証器は、pointerと同一original digestのevidenceがちょうど1件でない場合に失敗とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:827-833 |
| `RD02-342` | 保存phase束縛検証器は、checkpointのpreserve digestがmanifestのpreservedDigestと異なる場合に失敗とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:1021-1029 |
| `RD02-343` | 保存phase束縛検証器は、checkpointのarchive digestがmanifest再計算値と異なる場合に失敗とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:1030-1033 |
| `RD02-345` | 保存phase退出判定器は、inventory digestがpath集合から再計算した値と異なる場合に失敗とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:1070-1079 |
| `RD02-346` | 保存phase退出判定器は、checkpointのinventory digestが対象inventoryと異なる場合に失敗とする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:1080-1082 |
| `RD03-009` | 引用receipt接合評価は、PLANのreviewed_head_shaが欠けるかreceiptのHEADと異なる場合、拒否する。 | review_merge | gate | src/runtime/review-receipt-plan-binding.ts:204-207 |
| `RD03-011` | 引用receipt接合評価は、PLANのCI証拠世代が欠けるかreceiptの世代と一致しない場合、拒否する。 | evidence_claim | gate | src/runtime/review-receipt-plan-binding.ts:212-217 |
| `RD03-072` | frontier再計算は、再検証base HEADがmerged HEADと一致しない場合、拒否する。 | evidence_claim | gate | src/runtime/slot-scheduler-quota-handover.ts:603-605 |
| `RD03-082` | specialist registry検証は、定義の実digestが登録digestと一致しない場合、不合格にする。 | evidence_claim | gate | src/runtime/specialist-agent-registry.ts:161-167 |
| `RD03-133` | finding資格判定は、正規化eventのbaselineが所定構造でないか、current状態・有効なrevision・payload digestを満たさない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:315-327 |
| `RD03-138` | finding資格判定は、正規化event本文から再計算したdigestがevent_digestと一致しない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:380-383 |
| `RD03-139` | finding資格判定は、sourceとobserved情報から導出したevent IDが記録IDと一致しない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:384-394 |
| `RD03-146` | finding資格判定は、event集合から再計算したdigestがexact_set_digestと一致しない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:430-431 |
| `RD03-151` | finding資格判定は、trigger evidenceのevent digest集合が参照eventの実digest集合と一致しない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:472-479 |
| `RD03-153` | finding資格判定は、参照eventのbaselineがcurrentでないかtrigger evidenceのbaseline revisionと一致しない場合、失敗する。 | evidence_claim | gate | src/runtime/universal-improvement-finding-qualification.ts:487-492 |
| `RD03-180` | source registry検証は、evidence contractのdigest_fieldsにpayload_digestまたはevidence_digestが欠ける場合、不合格にする。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:114-114; src/runtime/universal-improvement-source-registry.ts:651-661 |
| `RD03-188` | source registry評価は、exact-bytes integrity記録が存在しない場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:790-808 |
| `RD03-192` | source registry評価は、物理同一性の証明前後でregistry bytesまたはintegrity内容が変わった場合、拒否する。 | safety_security | gate | src/runtime/universal-improvement-source-registry.ts:892-914 |
| `RD03-194` | source registry評価は、実registry bytesのdigestがintegrity記録の期待digestと異なる場合、不合格にする。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:931-940 |
| `RD03-196` | source registry評価は、authorityファイルの実digestが登録digestと異なる場合、不合格にする。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:541-548; src/runtime/universal-improvement-source-registry.ts:941-950; src/runtime/universal-improvement-source-registry.ts:961-969 |
| `RD03-198` | source registry評価は、detector実装の実digestが登録digestと異なる場合、不合格にする。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:541-548; src/runtime/universal-improvement-source-registry.ts:951-959 |
| `RD03-206` | source admissionは、observationのsource revisionが登録revisionの文字列表現と異なる場合、拒否する。 | evidence_claim | gate | src/runtime/universal-improvement-source-registry.ts:1155-1163 |
| `RD03-219` | green evidence評価は、run batch IDが空またはdigest batch IDと一致しない場合、closedを認めない。 | evidence_claim | gate | src/runtime/upstream-adoption.ts:224-227 |
| `RD03-248` | Windows canary lease評価は、assignment・PR・HEAD・Linux artifact・profile・lane・run・attempt・correlation・発行期限のいずれかがcurrent bindingと異なる場合、拒否する。 | evidence_claim | gate | src/runtime/windows-lite-canary-admission.ts:385-399 |
| `RD03-249` | Windows canary完了評価は、expectedまたはcompleted bindingが不正、あるいは両者の完了binding fieldが一つでも異なる場合、完了を拒否する。 | evidence_claim | gate | src/runtime/windows-lite-canary-admission.ts:403-432 |
| `RD04-002` | 独立レビュー検証器は、レビュー内容から再計算したdigestとreceipt_digestが一致しない場合に拒否する。 | evidence_claim | gate | src/runtime/work-graph-receipt-acceptance.ts:150-158 |
| `RD04-009` | 委譲判定器は、lane ready receiptのgraph snapshot digestがnullの場合に拒否する。 | evidence_claim | gate | src/runtime/work-graph-receipt-acceptance.ts:327-330 |
| `RD04-011` | 委譲判定器は、bindingのbase HEADが期待base HEADと異なる場合に拒否する。 | evidence_claim | gate | src/runtime/work-graph-receipt-acceptance.ts:335-337 |
| `RD04-019` | 親受入判定器は、repository HEADが不正、またはcandidate・review・terminalのHEADと一致しない場合に拒否する。 | review_merge | gate | src/runtime/work-graph-receipt-acceptance.ts:382-389 |
| `RD04-020` | 親受入判定器は、terminalのverifier receipt digestと提示レビューのreceipt digestが異なる場合に拒否する。 | evidence_claim | gate | src/runtime/work-graph-receipt-acceptance.ts:390-392 |
| `RD04-042` | blind packet作成器は、実行originの定義・fixture・taskのdigestまたはrisk classがbenchmark定義と異なる場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:175-182 |
| `RD04-047` | benchmark評価器は、packetのbenchmark定義digestが評価対象定義と異なる場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:342-343 |
| `RD04-051` | benchmark評価器は、judge originが別packetを指す場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:357-363 |
| `RD04-060` | context authority認証器とenvelope検証器は、要求または検証時HEADが束縛されたHEADと異なる場合に拒否する。 | memory_context | gate | src/runtime/worker-context-packet.ts:240-240; src/runtime/worker-context-packet.ts:422-422 |
| `RD04-065` | context再認証器は、再取得したauthority digestが元のcapabilityと異なる場合に拒否する。 | memory_context | gate | src/runtime/worker-context-packet.ts:275-284 |
| `RD04-066` | context再認証器は、再取得した有効rule packet digestが元のcapabilityと異なる場合に拒否する。 | memory_context | gate | src/runtime/worker-context-packet.ts:285-287 |
| `RD04-073` | context envelope検証器は、roleから再計算した判断brief digestがpacketと異なる場合に拒否する。 | lane_delegation | gate | src/runtime/worker-context-packet.ts:426-428 |
| `RD04-074` | context envelope検証器は、taskから再計算したlens digestがpacketと異なる場合に拒否する。 | memory_context | gate | src/runtime/worker-context-packet.ts:429-431 |
| `RD04-075` | context envelope検証器は、envelope全体のdigestが封印時と異なる場合に拒否する。 | memory_context | gate | src/runtime/worker-context-packet.ts:432-434 |
| `RD04-077` | descriptor検証器は、descriptorの再計算digestが申告digestと異なる場合に拒否する。 | evidence_claim | gate | src/runtime/worker-descriptor-admission.ts:221-225; src/runtime/worker-descriptor-admission.ts:261-267 |
| `RD04-079` | registry entry検証器は、source recordのdigestが再計算値と異なる、または元recordを検証できない場合に拒否する。 | evidence_claim | gate | src/runtime/worker-descriptor-admission.ts:227-254 |
| `RD04-080` | registry entry検証器は、source entryのdigestが再計算値と異なる場合に拒否する。 | evidence_claim | gate | src/runtime/worker-descriptor-admission.ts:255-258 |
| `RD04-083` | snapshot検証器は、registryを再構成したdigestが申告registry digestと異なる場合に拒否する。 | evidence_claim | gate | src/runtime/worker-descriptor-admission.ts:373-389 |
| `RD04-088` | admission鮮度検証器は、decision自体のdigestが不一致、または現在の要求・snapshotから再評価したdecisionと完全一致しない場合にcurrentと認めない。 | evidence_claim | gate | src/runtime/worker-descriptor-admission.ts:437-447 |
| `RD04-089` | isolation brokerは、benchmark定義capabilityが未封印、またはbindingの定義digestと異なる場合にexecution capabilityを発行しない。 | evidence_claim | gate | src/runtime/worker-isolation-broker.ts:257-266 |
| `RD04-093` | isolation brokerは、blind packet本文の再計算digestがpacket digestと異なる場合にjudge contextを発行しない。 | evidence_claim | gate | src/runtime/worker-isolation-broker.ts:317-324 |
| `RD04-105` | isolation brokerは、policyが未封印、またはpolicyのwrapper origin digestがlaunchと異なる場合に拒否する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:526-531 |
| `RD04-118` | isolation brokerは、benchmark指定時にそのcapabilityが未封印、またはfixture・task・risk classが実際の起動条件と異なる場合に拒否する。 | evidence_claim | gate | src/runtime/worker-isolation-broker.ts:628-644 |
| `RD04-119` | isolation brokerは、blind judge指定時にそのcapabilityが未封印、またはtask digestが実際のtaskと異なる場合に拒否する。 | review_merge | gate | src/runtime/worker-isolation-broker.ts:645-650 |
| `RD04-130` | run receipt解決器は、receiptが対象outputに封印されていない、またはoutput digestが異なる場合に拒否する。 | evidence_claim | gate | src/runtime/worker-isolation-broker.ts:880-890 |
| `RD04-131` | 観測解決器は、observationが対象outputに封印されていない、またはoutput digestが異なる場合に拒否する。 | evidence_claim | gate | src/runtime/worker-isolation-broker.ts:893-903 |
| `RD04-132` | benchmark execution解決器は、outputに登録されたcapabilityと提示capabilityが同一でなければ拒否する。 | evidence_claim | gate | src/runtime/worker-isolation-broker.ts:906-910 |
| `RD04-133` | blind judge context解決器は、outputに登録されたcapabilityと提示capabilityが同一でなければ拒否する。 | review_merge | gate | src/runtime/worker-isolation-broker.ts:913-917 |
| `RD04-134` | 実行origin解決器は、origin欠落、admissionの失効・非許可、またはdescriptor・registry版・registry digest・decision digestの不一致がある場合に拒否する。 | evidence_claim | gate | src/runtime/worker-isolation-broker.ts:920-936 |
| `RD04-150` | lifecycle receipt作成器は、run receiptが対象outputに対応する封印済み証跡として解決できない場合に拒否する。 | evidence_claim | gate | src/runtime/worker-lifecycle-receipt.ts:164-165 |
| `RD04-152` | lifecycle receipt作成器は、outputのproposal digestを取得できない、またはreviewがそのproposalを指していない場合に拒否する。 | review_merge | gate | src/runtime/worker-lifecycle-receipt.ts:168-170 |
| `RD04-158` | lifecycle receipt検証器は、eventの前event digestとの連鎖またはevent本文の再計算digestが一致しない場合に拒否する。 | evidence_claim | gate | src/runtime/worker-lifecycle-receipt.ts:305-325 |
| `RD04-159` | lifecycle receipt検証器は、各eventのevidence digestがreceipt本文から導出される対応証拠と異なる場合に拒否する。 | evidence_claim | gate | src/runtime/worker-lifecycle-receipt.ts:326-348 |
| `RD04-160` | lifecycle receipt検証器は、receipt本文の再計算digestがreceipt_digestと異なる場合に拒否する。 | evidence_claim | gate | src/runtime/worker-lifecycle-receipt.ts:349-350 |
| `RD04-180` | action-binding readiness lintは、右腕工程文書にreviewed_snapshot_binding markerが無い場合に違反とする。 | evidence_claim | lint | src/lint/action-binding-approval-readiness.ts:187-187; src/lint/action-binding-approval-readiness.ts:265-272 |
| `RD04-194` | action-binding readiness lintは、outstanding実装にactivation前のreview証跡・snapshot束縛・失効条件を示す所定markerが無い場合に違反とする。 | evidence_claim | lint | src/lint/action-binding-approval-readiness.ts:204-204; src/lint/action-binding-approval-readiness.ts:273-276 |
| `RD04-204` | action-binding readiness lintは、reviewed_snapshot_binding欠落、またはPLAN種別に応じたactivationSnapshot・cutoverSnapshot・明示的な該当なしの記述が無い場合に違反とする。 | evidence_claim | lint | src/lint/action-binding-approval-readiness.ts:281-289; src/lint/action-binding-approval-readiness.ts:960-966; src/lint/action-binding-approval-readiness.ts:1017-1046; src/lint/action-binding-approval-readiness.ts:1326-1338 |
| `RD04-205` | 承認snapshot checkは、snapshot必須PLANで束縛が将来義務のまま、または具体的なsha256 snapshot IDが無い場合にpending・blockerとする。 | evidence_claim | lint | src/lint/action-binding-approval-readiness.ts:1184-1189; src/lint/action-binding-approval-readiness.ts:1340-1347; src/lint/action-binding-approval-readiness.ts:1369-1377 |
| `RD04-206` | action-binding readiness lintは、version-up snapshotが必要でmode文書があるのにrepoHeadShaが無い場合に検証不能の違反とする。 | evidence_claim | lint | src/lint/action-binding-approval-readiness.ts:969-974; src/lint/action-binding-approval-readiness.ts:1112-1117; src/lint/action-binding-approval-readiness.ts:1349-1357 |
| `RD04-207` | 承認snapshot checkは、cutover snapshotが必要なのに現在snapshot IDの検証入力が無い場合にpending・blockerとする。 | evidence_claim | lint | src/lint/action-binding-approval-readiness.ts:1106-1108; src/lint/action-binding-approval-readiness.ts:1182-1183; src/lint/action-binding-approval-readiness.ts:1359-1367 |
| `RD04-208` | action-binding readiness lintは、照合可能なactivation snapshot IDと承認記録の具体的snapshot IDが異なる場合に違反とする。 | evidence_claim | lint | src/lint/action-binding-approval-readiness.ts:975-984; src/lint/action-binding-approval-readiness.ts:1379-1391 |
| `RD04-209` | action-binding readiness lintは、照合可能なcutover snapshot IDと承認記録の具体的snapshot IDが異なる場合に違反とする。 | evidence_claim | lint | src/lint/action-binding-approval-readiness.ts:985-994; src/lint/action-binding-approval-readiness.ts:1392-1403 |
| `RD05-002` | branch-kindは、PRがopenでない、base SHAが不正、またはhead・branch・双方のrepositoryがローカル識別と一致しない場合、PR snapshotを拒否する。 | review_merge | lint | src/lint/branch-kind.ts:67-96 |
| `RD05-003` | branch-kindは、PR取得の前後でrepository・HEAD・branchのいずれかが変化した場合、取得結果を利用不可にする。 | evidence_claim | lint | src/lint/branch-kind.ts:115-125 |
| `RD05-016` | branch-kindは、working treeを含める検査で実HEADがcandidateHeadと一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/branch-kind.ts:536-538 |
| `RD05-017` | branch-kindは、working treeを含める検査で実branchがdetached HEADでも指定branchでもない場合、失敗させる。 | evidence_claim | lint | src/lint/branch-kind.ts:539-545 |
| `RD05-023` | branch-kindは、snapshot読取り中にHEADが変化した場合、失敗させる。working treeを含む場合はbranchの変化も失敗させる。 | evidence_claim | lint | src/lint/branch-kind.ts:646-652 |
| `RD05-146` | completion-review-bundleは、completionDecisionPacketDigestがdecision packetのJSONから計算したSHA-256に一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:2063-2103; src/lint/completion-decision-packet.ts:2165-2167 |
| `RD05-147` | completion-review-bundleは、humanReviewBundleDigestがdecision packet内のhumanReviewBundleのSHA-256に一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:2063-2103 |
| `RD05-148` | completion-review-bundleは、reviewPacketsDigestが期待review packet配列のSHA-256に一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:2063-2103 |
| `RD05-149` | completion-review-bundleは、semanticBundleDigestが所定の意味digest再計算結果と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:2068-2103 |
| `RD05-150` | completion-review-bundleは、bundleDigestがbundleDigest自身を除くbundle全体のSHA-256に一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:2066-2103 |
| `RD05-164` | cutover-readinessは、現在台帳の確認日と記録済みsource_ledger_freshnessが存在する場合、後者が現在確認日を含まなければ失敗させる。 | evidence_claim | lint | src/lint/cutover-readiness.ts:358-370 |
| `RD05-165` | cutover-readinessは、cutover_snapshot_idにsha256:と小文字16進64桁からなる具体的IDが含まれない場合、失敗させる。 | evidence_claim | lint | src/lint/cutover-readiness.ts:372-376 |
| `RD05-167` | cutover-readinessは、approve_cutoverが選択されていて記録snapshot IDが現在snapshot IDと一致しない場合、失敗させる。 | escalation_authority | lint | src/lint/cutover-readiness.ts:385-390 |
| `RD06-005` | lintは、baseline_digestの形式が不正、または整列したentriesから計算した値と一致しない場合、検証を失敗させる。 | evidence_claim | lint | src/lint/design-artifact-source-digest.ts:151-158; src/lint/design-artifact-source-digest.ts:192-197 |
| `RD06-010` | lintは、現行実装資産のsource_digestが所定のSHA-256形式でない場合、失敗させる。 | evidence_claim | lint | src/lint/design-artifact-source-digest.ts:96-98; src/lint/design-artifact-source-digest.ts:315-324 |
| `RD06-013` | lintは、現行実装資産の実測ダイジェストがsource_digestと異なり、その設計・成果物・固定値の組がbaselineにない場合、失敗させる。baseline内の不一致は既知負債として計上する。 | evidence_claim | lint | src/lint/design-artifact-source-digest.ts:335-359 |
| `RD06-029` | design-coverage lintは、期待baseline fingerprintが指定されているとき、baselineから計算した値と一致しなければ失敗させる。 | evidence_claim | lint | src/lint/design-coverage.ts:391-402 |
| `RD06-035` | design-reality-binding lintは、空failure bindingのbaseline_digestが所定形式でない、または整列したentriesの計算値と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:250-256 |
| `RD06-061` | design-reality-binding lintは、existing_runtime資産を読み取って計算したSHA-256がsource_digestと一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:886-888 |
| `RD06-076` | digest inventory走査器は、cryptoからimportしたcreateHash呼び出しのalgorithmがSHA-256と解釈できず、明示allowlistにも一致しない場合、例外で停止する。 | tooling_runtime | lint | src/lint/digest-inventory.ts:83-94; src/lint/digest-inventory.ts:151-163 |
| `RD06-077` | digest inventory走査器は、SubtleCryptoらしいdigest呼び出しのalgorithmをSHA-256と解釈できない場合、例外で停止する。 | tooling_runtime | lint | src/lint/digest-inventory.ts:166-175 |
| `RD06-078` | digest inventory走査器は、CryptoHasher生成時のalgorithmをSHA-256と解釈できない場合、例外で停止する。 | tooling_runtime | lint | src/lint/digest-inventory.ts:176-180 |
| `RD06-083` | doc-consistency lintは、L3柱別機能要求にsemanticBundleDigestまたはsemantic digestの記載がない場合、不足として返す。 | evidence_claim | lint | src/lint/doc-consistency.ts:157-161; src/lint/doc-consistency.ts:202-204 |
| `RD06-088` | doc-consistency lintは、L6セットアップ設計にsemanticBundleDigestまたはsemantic digestの記載がない場合、不足として返す。 | evidence_claim | lint | src/lint/doc-consistency.ts:183-187; src/lint/doc-consistency.ts:202-204 |
| `RD06-116` | drive-db-registration lintは、期待PLAN registry fingerprintが指定され、実値と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/drive-db-registration.ts:92-97 |
| `RD06-161` | drive-route-catalog lintは、catalogファイルの生bytesのSHA-256がコード固定値と一致しない場合、compatibility inventoryの変更として失敗させる。 | evidence_claim | lint | src/lint/drive-route-catalog.ts:407-421 |
| `RD07-017` | g10-ux-workflowは、必須UXV receiptのdigestが有効なSHA-256形式でなく、または当該coverageの観測成功した証拠ファイルのdigestと一致しなければ失敗する。 | evidence_claim | lint | src/lint/g10-ux-workflow.ts:146-160 |
| `RD07-065` | 証拠コマンド検査は、観測した証拠バイト列のdigestが申告されたoutput_digestと一致しなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:184-186 |
| `RD07-098` | handover切替承認検証は、承認されたHEADが現在のHEADの祖先でなければgit検査の失敗で拒否する。 | escalation_authority | lint | src/lint/handover-cutover-approval.ts:219-222 |
| `RD07-101` | handover復活検査は、baselineのdigestがソートしたfingerprintsから再計算したdigestと一致しなければ拒否する。 | evidence_claim | lint | src/lint/handover-resurrection.ts:330-332; src/lint/handover-resurrection.ts:869-872 |
| `RD07-103` | handover復活検査は、generated baselineのdigestがソートしたfingerprintsから再計算したdigestと一致しなければ拒否する。 | evidence_claim | lint | src/lint/handover-resurrection.ts:361-364 |
| `RD07-104` | handover復活検査は、generated authorityの形式・参照先・revision・OID・digest・decisionIdが不正、またはコード内固定authorityと完全一致しなければ拒否する。 | escalation_authority | lint | src/lint/handover-resurrection.ts:367-386 |
| `RD07-106` | handover復活検査は、baseline authorityがコード内固定値と完全一致しなければ拒否する。 | escalation_authority | lint | src/lint/handover-resurrection.ts:407-410 |
| `RD07-107` | handover復活検査は、preserve authorityのファイルdigest・schema・sourceRevisionが指定値と異なる、またはentriesが非配列・空なら拒否する。 | escalation_authority | lint | src/lint/handover-resurrection.ts:413-423 |
| `RD07-116` | handover復活検査は、complete checkpointのintentDigestが期待値と異なればinvalid_preconditionとして失敗する。 | evidence_claim | lint | src/lint/handover-resurrection.ts:522-533 |
| `RD07-117` | handover復活検査は、complete checkpointのpreserveDigestが期待値と異なればinvalid_preconditionとして失敗する。 | evidence_claim | lint | src/lint/handover-resurrection.ts:522-533 |
| `RD07-118` | handover復活検査は、complete checkpointのarchiveDigestが期待値と異なればinvalid_preconditionとして失敗する。 | evidence_claim | lint | src/lint/handover-resurrection.ts:522-533 |
| `RD07-130` | handover復活検査は、許可artifactの内容digestが申告値と一致しなければ前提条件違反として失敗する。 | evidence_claim | lint | src/lint/handover-resurrection.ts:856-856; src/lint/handover-resurrection.ts:911-915 |
| `RD07-164` | identifier-renameのbackup manifest検査は、checksumRequiredがtrueでなければ違反とする。 | evidence_claim | lint | src/lint/identifier-rename.ts:2150-2155 |
| `RD07-174` | identifier-renameの切替計画は、読み取れるgit HEAD SHAにsnapshotを束縛できなければ準備完了にしない。 | evidence_claim | lint | src/lint/identifier-rename.ts:2427-2429 |
| `RD07-179` | identifier-renameの切替計画は、承認記録の具体性検査を通過していてもcutover_snapshot_idが現行snapshotIdと異なれば準備完了にしない。 | escalation_authority | lint | src/lint/identifier-rename.ts:2507-2512; src/lint/identifier-rename.ts:2519-2524 |
| `RD07-180` | identifier-renameの切替計画は、承認記録の具体性検査を通過していてもreviewed_snapshot_bindingが現行snapshotIdと異なれば準備完了にしない。 | escalation_authority | lint | src/lint/identifier-rename.ts:2513-2517; src/lint/identifier-rename.ts:2519-2524 |
| `RD07-181` | identifier-renameのsnapshot reviewは、いずれかの承認snapshotが記録済みで、切替判断または行為承認のsnapshotが現行値と異なる場合に警告を出し、計画再生成と承認証拠の更新を要求する。 | escalation_authority | lint | src/lint/identifier-rename.ts:2712-2735 |
| `RD07-203` | Issue closure graph監査は、receiptのHEADが対応PRのHEADと一致しなければ失敗する。 | evidence_claim | lint | src/lint/issue-closure-graph.ts:299-305 |
| `RD07-204` | Issue closure graph監査は、receiptのCI run IDがPRのrunと異なる、CI対象HEADがreceiptと異なる、またはCI結果がsuccessでなければ失敗する。 | evidence_claim | lint | src/lint/issue-closure-graph.ts:306-316 |
| `RD07-205` | Issue closure graph監査は、PRのreviewがapproveでない、review対象HEAD・CI run IDがreceiptと異なる、またはreview digestが一致しなければ失敗する。 | review_merge | lint | src/lint/issue-closure-graph.ts:317-328 |
| `RD08-005` | recognition判定器は、候補のcontentDigestが登録済みdigestと異なる場合、登録済み最終判定を再利用せずneeds_manual_reviewにする。 | review_merge | lint | src/lint/l12-hybrid-recognition.ts:138-145; src/lint/l12-hybrid-reviewed-safe-v2.ts:1-2 |
| `RD08-043` | left-arm carry lintは、一致レビューのsemantic_digestとreview_bindingのevidence_digestが異なる、またはdigest形式が不正の場合、失敗させる。 | evidence_claim | lint | src/lint/left-arm-carry-log.ts:253-262 |
| `RD08-050` | left-arm carry lintは、指摘証跡の実digestと申告digestが異なる、または申告digest形式が不正の場合、失敗させる。 | evidence_claim | lint | src/lint/left-arm-carry-log.ts:304-314 |
| `RD08-068` | left-arm carry lintは、gate証跡の実digestとoutput_digestが異なる、またはoutput_digest形式が不正の場合、失敗させる。 | evidence_claim | lint | src/lint/left-arm-carry-log.ts:461-471 |
| `RD08-073` | left-arm carry lintは、legacyBaselineRequiredがtrueの場合、legacy_pinned PLAN IDのソート済み集合のfingerprintが固定値と異なれば失敗させる。 | process_gate | lint | src/lint/left-arm-carry-log.ts:14-18; src/lint/left-arm-carry-log.ts:500-512 |
| `RD08-092` | semantic consumer lintは、形式が正しいledger.source_headでも固定LEDGER_SOURCE_HEADと異なる場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:87-87; src/lint/legacy-orchestration-semantic-consumers.ts:378-379 |
| `RD08-121` | semantic consumer revision検査は、自身のdigest欄を除いたpayloadのcanonical JSON digestがrevision_payload_sha256と異なる場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:493-497; src/lint/legacy-orchestration-semantic-consumers.ts:521-524 |
| `RD08-125` | semantic consumer revision loaderは、形式が正しいbase_ledger_sha256と基底ledger実bytesのdigestが異なる場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:587-595; src/lint/legacy-orchestration-semantic-consumers.ts:608-608 |
| `RD08-126` | semantic consumer revision loaderは、revision.source_headがHEADの祖先であることをGitで確認できない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:598-608 |
| `RD08-129` | legacy orchestration inventory比較器は、候補のsource_headが公開済みinventoryと異なる場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-surface.ts:79-79; src/lint/legacy-orchestration-surface.ts:277-278 |
| `RD08-130` | legacy orchestration inventory比較器は、公開済みinventoryにsemantic_ledger_sha256がある場合、候補の同digestが異なるか欠ければ失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-surface.ts:80-84; src/lint/legacy-orchestration-surface.ts:277-278 |
| `RD08-139` | legacy orchestration lintは、semantic ledger本文のSHA-256がinventoryの指定digestと異なる場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-surface.ts:157-161 |
| `RD08-146` | legacy orchestration loaderは、inventory.source_headが公開baseの祖先であることをGitで確認できない場合、読込を失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-surface.ts:223-234 |
| `RD08-185` | objective evidence auditは、観測した証跡digestがbindingのevidenceDigestと異なる場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:607-608 |
| `RD08-195` | objective evidence auditは、配布version bindingに必要なpackage.jsonのversionを取得できない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:723-731 |
| `RD09-017` | pin-chain導出は、変更対象のinventory行番号がliveの行番号と異なるかlive側に存在しない場合、staleなdeterministic pinとしてrefresh_candidateを返す。 | evidence_claim | lint | src/lint/pin-chain-derivation.ts:121-132 |
| `RD09-020` | pin-chain導出は、変更対象テストの記録digestがlive digestと異なるかファイルがない場合、staleなdigest pinとしてrefresh_candidateを返す。 | evidence_claim | lint | src/lint/pin-chain-derivation.ts:155-170 |
| `RD09-021` | pin-chain導出は、変更対象テストの記録case数がlive case数と異なるかファイルがない場合、staleなcase数pinとしてrefresh_candidateを返す。 | evidence_claim | lint | src/lint/pin-chain-derivation.ts:54-55; src/lint/pin-chain-derivation.ts:155-182 |
| `RD09-065` | V-pair authority検証は、expectedLegacyIdentityDigestが指定され、初期fingerprint集合のdigestが一致しない場合、authorityを無効にする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:616-626 |
| `RD09-066` | V-pair authority検証は、expectedInitialDigestが指定され、初期authority全entryのdigestが一致しない場合、authorityを無効にする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:627-632 |
| `RD09-068` | V-pair authority検証は、expectedTerminalDigestが指定され、tombstone連鎖の末尾digestが一致しない場合、authorityを無効にする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:667-672 |
| `RD09-078` | tombstone検証は、解消PLANの意味とreview_evidenceから再計算したdigestがtombstoneの有効なSHA-256 digestと一致しない場合、解消証拠を拒否する。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:265-272; src/lint/plan-specific-vpair-binding.ts:367-371 |
| `RD09-079` | plan-specific-vpair-bindingは、未解消baselineに属するactive PLANのpathまたはsemantic digestが固定値と異なる場合、違反とする。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:205-225; src/lint/plan-specific-vpair-binding.ts:971-985 |
| `RD09-144` | relation graph投影は、design catalogのreviewed digestがmissingの場合、独立再評価が必要なerrorを返し、impact分析を失敗させる。 | review_merge | lint | src/lint/relation-graph.ts:233-243; src/lint/relation-graph.ts:712-715; src/lint/relation-graph.ts:761-767 |
| `RD10-039` | lintは入力PLAN数が100を超え、歴史的Bun receipt全体のdigestが固定値と異なる場合に失敗させる。 | evidence_claim | lint | src/lint/review-evidence.ts:842-873; src/lint/review-evidence.ts:911-919 |
| `RD10-081` | S4 lintは引用digestが直前の引用fileの観測digestと一致しないか、fileに結び付かない場合に失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:634-662; src/lint/s4-decision-readiness.ts:682-690 |
| `RD10-127` | semantic boundary gateはsemantic tableがIMMUTABLE_RECEIPT_TABLESに登録されていなければ失敗させる。 | evidence_claim | lint／gate | src/lint/semantic-boundary.ts:253-263 |
| `RD11-006` | 図更新計画は、要求形式のartifactのsourceDigestがgraphSnapshotDigestと異なる場合にrefreshを要求し、ok=falseにする。 | evidence_claim | lint | src/lint/tool-adapter.ts:347-362 |
| `RD11-010` | triage lintは、固定done項目のmanifestまたはcatalogのartifactが対応するpinと一致しない場合に違反にする。 | evidence_claim | lint | src/lint/triage-decision-integrity.ts:7-11; src/lint/triage-decision-integrity.ts:136-142 |
| `RD11-117` | activation資料検査は、snapshotがHEADに束縛されていない場合にblockし、activate_future_version選択時はlint違反にもする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:1584-1584; src/lint/version-up-readiness.ts:2515-2520 |
| `RD11-118` | activation資料検査は、activation_decision_recordに具体的なsha256 snapshot IDがない場合にblockする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:2521-2526; src/lint/version-up-readiness.ts:2717-2721; src/lint/version-up-readiness.ts:2744-2745 |
| `RD11-119` | activation資料検査は、activation_decision_recordのsnapshot IDが現在のactivationSnapshotと一致しない場合にblockする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:2527-2533; src/lint/version-up-readiness.ts:2722-2725 |
| `RD11-126` | version-up lintは、activate_future_version選択時、reviewed_snapshot_bindingに具体的snapshot IDがない場合に違反にする。 | review_merge | lint | src/lint/version-up-readiness.ts:2555-2561 |
| `RD11-127` | version-up lintは、activate_future_version選択時、reviewed_snapshot_bindingが現在のactivationSnapshotと一致しない場合に違反にする。 | review_merge | lint | src/lint/version-up-readiness.ts:2562-2568 |
| `RD11-180` | terminal fullback監査は、Forward sliceのHEADが40桁の小文字16進SHAでない場合に失敗させ、そのsliceの後続検査を飛ばす。 | evidence_claim | lint | src/lint/workflow-classification-terminal-fullback.ts:132-132; src/lint/workflow-classification-terminal-fullback.ts:226-233 |
| `RD11-182` | terminal fullback監査は、有効なCI run IDがあっても、CIがsuccessでないかCI HEADがslice HEADと異なる場合に失敗させる。 | evidence_claim | lint | src/lint/workflow-classification-terminal-fullback.ts:240-246 |
| `RD11-186` | terminal fullback監査は、authorityのpath・digest・requirements versionが不正または不一致、あるいはslice集合・consumer集合が空の場合に失敗させる。 | process_gate | lint | src/lint/workflow-classification-terminal-fullback.ts:285-299 |
| `RD11-187` | terminal fullback監査は、registryのrequirements version・source digestがrequirementsと一致しない、またはrequirements・registryのdigest形式が不正な場合に失敗させる。 | evidence_claim | lint | src/lint/workflow-classification-terminal-fullback.ts:300-312 |
| `RD11-188` | terminal fullback監査は、catalogのversion・source digestがregistryの対応値と一致しない、またはdigest形式が不正な場合に失敗させる。 | evidence_claim | lint | src/lint/workflow-classification-terminal-fullback.ts:313-326 |
| `RD11-190` | terminal fullback監査は、consumerのregistry version・digestが不一致または不正、あるいはtargetAxis・targetIdが空白の場合に失敗させる。 | process_gate | lint | src/lint/workflow-classification-terminal-fullback.ts:341-354 |
| `RD11-192` | terminal fullback監査は、current-mainのread-after sourceが指定値でない、measurement digestが不正、またはmain・観測HEADが不正な場合に失敗させる。 | evidence_claim | lint | src/lint/workflow-classification-terminal-fullback.ts:369-389 |
| `RD11-193` | terminal fullback監査は、measurementDigestをnullに置いたread-after payloadの再計算digestが記録値と異なる場合に失敗させる。 | evidence_claim | lint | src/lint/workflow-classification-terminal-fullback.ts:390-397 |
| `RD11-194` | terminal fullback監査は、観測HEADがcurrent-main HEADと異なる場合に失敗させる。 | evidence_claim | lint | src/lint/workflow-classification-terminal-fullback.ts:398-404 |
| `RD11-195` | terminal fullback監査は、read-afterのrequirements version・registry version・registry digestがauthorityと一致しない、またはdigest形式が不正な場合に失敗させる。 | evidence_claim | lint | src/lint/workflow-classification-terminal-fullback.ts:405-416 |
| `RE01-191` | receipt作成処理はversion・digest・IDを記録し、生のprogram argvや旧名をcurrent証拠へ出力しない。 | evidence_claim | gate | docs/governance/helix-harness-requirements_v1.3.md:187-197 |
| `RG09-017` | 旧L12受入の担当者は、version-up/cutover packetがfreshである場合に限り旧L14へ接続する。 | process_gate | prose | docs/governance/document-system-map.md:119-119 |
| `RG12-001` | 要件定義台帳の管理者は、設計stale receiptのdigestをrecord_id、requirement_id、prior_revision、prior_statement_digest、new_revision、new_statement_digest、cause_code、statusの順にLF連結し、末尾LFなしのUTF-8 bytesへSHA-256を適用して算出する。 | evidence_claim | prose | docs/governance/infinity-loop-requirement-definition-ledger.md:194-195 |
| `RG14-019` | cutover完了判定者は、Core Readsのcutover epochまたはlayer mappingが一致しない場合、terminal claimを拒否する。 | evidence_claim | prose | docs/governance/requirements-consistency-audit-2026-07-19.md:37-42 |

## 副として対応づいた規則（338件）

`RA-031`、`RA-134`、`RA-156`、`RA-160`、`RA-176`、`RA-293`、`RB0-064`、`RB0-065`、`RB0-066`、`RB0-071`、`RB0-076`、`RB0-078`、`RB0-080`、`RB0-081`、`RB0-106`、`RB0-129`、`RB04-009`、`RB05-051`、`RB05-062`、`RB05-072`、`RB05-076`、`RB05-083`、`RB05-088`、`RB05-089`、`RB05-091`、`RB05-093`、`RB05-119`、`RB05-138`、`RB05-140`、`RB05-144`、`RB05-167`、`RB05-168`、`RB05-171`、`RB05-172`、`RB05-174`、`RB05-205`、`RB05-206`、`RB05-210`、`RB05-220`、`RB05-226`、`RB05-232`、`RB05-235`、`RB05-239`、`RB05-240`、`RB05-244`、`RB05-249`、`RB05-250`、`RB05-259`、`RB05-260`、`RB05-263`、`RB05-269`、`RB05-283`、`RB05-285`、`RB05-292`、`RB05-298`、`RB05-301`、`RB05-307`、`RB05-309`、`RB05-310`、`RB05-313`、`RB05-328`、`RB05-347`、`RB05-367`、`RB06-007`、`RB06-012`、`RB06-016`、`RB06-023`、`RB06-024`、`RB06-025`、`RB06-049`、`RB06-075`、`RB06-095`、`RB06-108`、`RB06-109`、`RB06-113`、`RB06-118`、`RB06-119`、`RB06-128`、`RB06-129`、`RB06-130`、`RB06-131`、`RB06-139`、`RB06-142`、`RB06-143`、`RB06-152`、`RB06-161`、`RB06-164`、`RB06-209`、`RB06-221`、`RB06-228`、`RB06-229`、`RB06-231`、`RB06-237`、`RB06-238`、`RB06-247`、`RB06-251`、`RB06-274`、`RB06-304`、`RB06-310`、`RB07-009`、`RB07-010`、`RB07-180`、`RB07-271`、`RB07-296`、`RB07-311`、`RB07-312`、`RB07-330`、`RB08-020`、`RB08-089`、`RB08-106`、`RB08-218`、`RB08-241`、`RB08-274`、`RB08-276`、`RB08-277`、`RB08-291`、`RB08-307`、`RB08-313`、`RB08-318`、`RB08-335`、`RB08-339`、`RB09-008`、`RB09-019`、`RB09-034`、`RB09-040`、`RB09-048`、`RB09-067`、`RB09-077`、`RB09-082`、`RC0-104`、`RC0-136`、`RC00-038`、`RC00-058`、`RC00-070`、`RC00-071`、`RC00-089`、`RC00-090`、`RC00-091`、`RC00-094`、`RC00-097`、`RC00-098`、`RC00-114`、`RC00-200`、`RC00-204`、`RC00-207`、`RC00-215`、`RC00-222`、`RC00-248`、`RC01-010`、`RC01-026`、`RC01-134`、`RC02-008`、`RC02-024`、`RC02-067`、`RC02-080`、`RC02-082`、`RC02-093`、`RC02-097`、`RC02-142`、`RC02-165`、`RC03-020`、`RC03-038`、`RC03-045`、`RC03-046`、`RC03-061`、`RC03-074`、`RC03-094`、`RC04-055`、`RC04-077`、`RC04-078`、`RC04-083`、`RC04-086`、`RC04-099`、`RC04-140`、`RC04-262`、`RC04-290`、`RD00-061`、`RD00-062`、`RD00-082`、`RD00-088`、`RD00-195`、`RD00-199`、`RD00-202`、`RD00-206`、`RD00-214`、`RD00-227`、`RD00-229`、`RD00-255`、`RD00-271`、`RD00-272`、`RD00-281`、`RD00-310`、`RD00-313`、`RD00-314`、`RD00-368`、`RD00-377`、`RD00-379`、`RD01-003`、`RD01-005`、`RD01-006`、`RD01-007`、`RD01-020`、`RD01-099`、`RD01-106`、`RD01-107`、`RD01-142`、`RD01-144`、`RD01-145`、`RD01-147`、`RD01-153`、`RD01-154`、`RD01-159`、`RD01-164`、`RD01-170`、`RD01-195`、`RD01-250`、`RD01-251`、`RD01-266`、`RD01-270`、`RD01-277`、`RD01-278`、`RD01-283`、`RD01-284`、`RD01-298`、`RD01-299`、`RD01-300`、`RD01-332`、`RD01-341`、`RD01-342`、`RD01-350`、`RD02-004`、`RD02-076`、`RD02-162`、`RD02-174`、`RD02-182`、`RD02-184`、`RD02-210`、`RD02-229`、`RD02-239`、`RD02-273`、`RD02-320`、`RD02-331`、`RD02-341`、`RD02-347`、`RD03-003`、`RD03-059`、`RD03-061`、`RD03-081`、`RD03-134`、`RD03-135`、`RD03-152`、`RD03-163`、`RD03-164`、`RD03-166`、`RD03-171`、`RD03-178`、`RD03-179`、`RD03-190`、`RD03-200`、`RD03-216`、`RD03-218`、`RD03-234`、`RD04-023`、`RD04-041`、`RD04-053`、`RD04-062`、`RD04-063`、`RD04-106`、`RD04-111`、`RD04-210`、`RD05-012`、`RD05-015`、`RD05-025`、`RD05-166`、`RD05-168`、`RD06-001`、`RD06-003`、`RD06-058`、`RD06-099`、`RD07-031`、`RD07-076`、`RD07-093`、`RD07-095`、`RD07-097`、`RD07-100`、`RD07-102`、`RD07-105`、`RD07-109`、`RD07-110`、`RD07-112`、`RD07-143`、`RD07-146`、`RD07-201`、`RD08-044`、`RD08-061`、`RD08-091`、`RD08-116`、`RD08-117`、`RD08-119`、`RD08-120`、`RD08-136`、`RD08-137`、`RD08-138`、`RD08-145`、`RD08-148`、`RD08-176`、`RD08-179`、`RD08-196`、`RD09-015`、`RD09-016`、`RD09-019`、`RD09-022`、`RD09-023`、`RD09-032`、`RD09-042`、`RD09-064`、`RD09-067`、`RD09-145`、`RD10-037`、`RD11-184`、`RD11-185`、`RD11-196`、`RE01-085`、`RE01-092`、`RE01-168`、`RE01-193`、`RE01-204`、`RE01-208`、`RE01-217`、`RE01-226`、`RE01-251`、`RE01-259`、`RE01-267`、`RG05-014`、`RG05-015`、`RG12-003`、`RG13-010`、`RG17-007`
