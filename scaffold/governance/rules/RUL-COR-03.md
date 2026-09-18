---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-COR-03
group: コア
product: OS
atoms_primary: 250
atoms_secondary: 91
issue_projection: none
---

# RUL-COR-03（コア／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

状態の更新は、中断・再試行・担当の交代があっても、二重に実行されず、古い作業者の結果が新しい状態を上書きしない。同じ操作を繰り返しても結果が変わらない。実現の方式はL3以降で選ぶ。

## 主として対応づいた規則（250件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-067` | harnessはPythonをsemantic core、TypeScript/Nodeをtransactional boundaryとし、Nodeだけをtransaction writerにする。 | tooling_runtime | prose | AGENTS.md:95-100; AGENTS.md:120-123; CLAUDE.md:44-47; CLAUDE.md:62-63; .claude/CLAUDE.md:241-247 |
| `RB04-111` | escalation判定者は失敗回数が満たす最大levelを冪等に算出し、現在levelへ一段加算する方式を使わない。 | escalation_authority | prose | docs/governance/helix-harness-concept_v3.1.md:1008-1010 |
| `RB05-135` | intakeは有効eventを一度だけ受理してcontract・causality・receiptを作り、同一operation IDとdigestの再送ではIssue・queue・memoryの副作用を増やさない。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:27-28; docs/governance/infinity-loop-system-assertion-cases.md:412-412 |
| `RB05-136` | intakeは既存operation IDに異なるpayload digestが届いた場合、conflict receiptを残して既存contractを更新しない。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:29-29 |
| `RB05-144` | PR監査hookはmain以外のbaseやstacked PRを除外せず、create・update・completionをdelivery IDとcurrent head SHAに束縛した監査jobへ一度だけ正規化する。 | review_merge | hook | docs/governance/infinity-loop-system-assertion-cases.md:45-48; docs/governance/infinity-loop-system-assertion-cases.md:336-336; docs/governance/infinity-loop-system-assertion-cases.md:361-361 |
| `RB05-147` | finding昇格transactionが失敗した場合、Issue・Reverse・memory・queueの部分作成を残さない。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:50-50 |
| `RB05-152` | agent leaseの同時claimではactive leaseを一件だけ成立させ、敗者へconflictを返す。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:55-55 |
| `RB05-153` | 期限切れまたは再割当後の旧fenceによるtool call・completion・artifact commitを拒否し、旧processに結果を上書きさせない。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:56-57; docs/governance/infinity-loop-system-assertion-cases.md:429-429 |
| `RB05-154` | crash recoveryは有効なdurable checkpointからだけ再開し、checkpoint digest破損時はresumeしない。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:58-58; docs/governance/infinity-loop-system-assertion-cases.md:429-429 |
| `RB05-161` | Node supervisorは対応versionの正常worker応答だけを受理し、handshake・result・terminal receipt・DB commitを一度だけ成立させる。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:66-66; docs/governance/infinity-loop-system-assertion-cases.md:384-384 |
| `RB05-163` | workerがdeadlineを超過した場合はTERM/KILLしてfailed receiptを残し、部分書込みを残さない。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:71-71 |
| `RB05-164` | running workerへのcancelではcancelled terminal receiptを残してcommitせず、crashではfailedとしてstaged resultを昇格しない。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:72-73 |
| `RB05-165` | supervisor read queue上限超過時はworkerを隔離してresult commitを拒否し、親Nodeの所有権消失時はworker process groupを停止する。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:74-75 |
| `RB05-166` | run lease再割当後の旧worker resultはcommitしない。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:76-76 |
| `RB05-170` | engine result transaction失敗時はrun・artifact・event・provenanceの部分commitを残さず、retired engine versionや未登録detectorにはleaseを発行しない。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:85-86; docs/governance/infinity-loop-system-assertion-cases.md:89-89 |
| `RB05-171` | detectorはcore engineとは別runでversion・fingerprint・provenance付きfindingを保存し、同じ検出の再実行ではfindingを増やさずoccurrenceを残す。 | evidence_claim | prose | docs/governance/infinity-loop-system-assertion-cases.md:87-88; docs/governance/infinity-loop-system-assertion-cases.md:383-383 |
| `RB05-173` | product ingestionはfull syncのsnapshot・entity・mapping・watermarkを原子的にcommitし、incremental syncでは差分versionとcursor前進を記録する。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:93-94 |
| `RB05-177` | product ingestionはwatermarkを後退させるcommitを拒否する。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:99-99 |
| `RB05-189` | cancel時はchild process groupを残さず停止し、SQLite lockのretry上限到達時は部分transactionを残さず失敗する。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:126-127 |
| `RB05-250` | state transitionは正順だけをappendし、各stateをdigestとcauseへ束縛する。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:360-360 |
| `RB06-005` | 正本化処理はMarkdown、asset revision、event、trace、impact、stale記録、DB投影、receiptを原子的に確定し、部分更新をCanonicalとして残さない。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:68-74; docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:163-189 |
| `RB06-012` | 正本化処理はbase_revisionをCAS検査する。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:182-183 |
| `RB06-013` | 正本化処理は同一command_id・同一digestの再送に既存receiptを返し、revisionを増やさない。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:182-184; docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:311-311 |
| `RB06-014` | 正本化処理は同一command_idで異なるdigestまたはpayloadを受けた場合、conflictとして拒否する。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:185-185; docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:250-250 |
| `RB06-015` | 正本化処理は書込み途中で失敗した場合、全write setをrollbackする。 | process_gate | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:186-188 |
| `RB06-016` | 正本化処理はreceipt発行前に全write setを再検査し、receiptへ変更前後のrevisionとwrite countを記録する。 | evidence_claim | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:189-190 |
| `RB06-095` | PR event bridgeはdelivery再送でもHEAD一致の監査jobを一件だけ生成し、冪等receiptを残す。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:32-32; docs/governance/infinity-loop-assertion-coverage-ledger.md:70-70 |
| `RB06-128` | state transition処理は正順だけをappendし、各stateをdigestとcauseへ束縛する。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:69-69 |
| `RB06-142` | product ingestionは冪等projectionとlineageを生成し、schema drift、削除tombstone、watermark逆行・staleを検出する。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:92-92 |
| `RB06-144` | worker brokerはterminal receiptを一度だけ記録し、timeout・cancel等で失効したlate resultをcommitしない。 | lane_delegation | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:95-95 |
| `RB06-154` | Canonical化は全write setをcommitまたはrollbackし、fault後も部分currentをゼロにする。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:120-120; docs/governance/infinity-loop-assertion-coverage-ledger.md:189-189 |
| `RB06-171` | event再送はIssue・実装・memory昇格の副作用を各一件だけにする。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:159-159 |
| `RB06-181` | agent結果commitはlease再割当後のfencing mismatchを拒否し、再開はdurable checkpointからだけ行う。 | lane_delegation | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:176-176 |
| `RB06-209` | discovery event storeは追記専用・digest chain・連続sequenceで操作順序を保持する。 | memory_context | config | config/requirement-discovery-event-schema.json:64-67 |
| `RB07-120` | bootstrap検証は指定4表をcheckpoint対象とし、stale artifactとartifact_progress_eventsの親対応を最低1行で検査し、再構築を2回行う。 | evidence_claim | config | docs/governance/l3-g3-logical-db-bootstrap-policy.json:100-123 |
| `RB07-299` | terminal遷移は同じoperation_idでDB・feedback・必要memoryを確定し、冪等性・fence・crash recoveryを保証して独立prose継続fileを新設しない。 | tooling_runtime | prose | docs/governance/session-handover-retirement-disposition.md:41-42 |
| `RB08-033` | 継続処理はsession eventを先に永続追記し、その後active PLAN・blocker・next action・frontierをDBへ冪等投影する。 | memory_context | prose | docs/skills/requirements-handover.md:34-35 |
| `RB08-077` | 継続処理はevent IDとpayload hashによる冪等投影を行い、projection成功後だけcheckpointを公開する。memoryはDB stateを上書きしない。 | memory_context | prose | docs/skills/context-memory.md:40-42 |
| `RB08-079` | session終了担当者はPLAN完了をevent-firstで反映し、drive-cycle境界でstatus・doctorの出力とevent/projection frontierを監査証跡へ残す。 | memory_context | prose | docs/skills/context-memory.md:51-62; docs/skills/context-memory.md:87-87 |
| `RB08-216` | runtime設計者はPythonをproposal-onlyへ縮退させず、DB・Git・GitHub writeをNodeの単一transaction境界へ限定する。 | safety_security | prose | docs/governance/l3-progression-authority-rebaseline-2026-07-19.md:16-16 |
| `RB08-256` | memory retire処理はtarget検証付きauthority receipt・fencing・冪等性を必須とし、legacy readerもterminal receiptをactive memoryへ戻さない。 | memory_context | prose | docs/governance/harness-memory-reconciliation-audit-2026-07-19.md:82-82 |
| `RB08-337` | GitHub連携設計者はsignalからtyped Issue・durable event・PLAN・PR・CI・merge・memoryまでを冪等episodeとして閉じ、merge後memory更新とprojection清掃を統合する。 | memory_context | prose | docs/governance/github-operations-reference-audit-2026-07-18.md:28-32; docs/governance/github-operations-reference-audit-2026-07-18.md:42-42 |
| `RB09-060` | Requirement IRへの書込み担当者は、JSON transactionだけを通して書込みを行う。 | tooling_runtime | config | config/requirement-ir-authority.json:23-27 |
| `RB09-064` | hosted preflightは、denyの場合にnonceを消費してはならない。 | safety_security | prose | docs/governance/hosted-preflight-nonce-order-terminal-fullback-evidence.md:23-24 |
| `RB09-065` | hosted preflightは、allowの後にnonceをcommitする。 | safety_security | prose | docs/governance/hosted-preflight-nonce-order-terminal-fullback-evidence.md:23-24 |
| `RB09-066` | hosted preflightは、成功nonceの再利用を拒否する。 | safety_security | prose | docs/governance/hosted-preflight-nonce-order-terminal-fullback-evidence.md:23-24 |
| `RB09-080` | CLI workflow identityの終端担当者は、Forward／Reverse PLANのterminal stateを同一transactionで確定する。 | process_gate | prose | docs/governance/cli-workflow-identity-terminal-fullback-evidence.md:17-19 |
| `RC00-043` | agent lock検査は、同一pathに異なる所有sessionのactive lockがある場合に不合格とする。 | lane_delegation | gate | src/runtime/agent-mailbox-conflict-locks.ts:58-83 |
| `RC00-044` | agent lock検査は、staleと分類されたlockについて所有者確認を促す警告を出す。 | lane_delegation | gate | src/runtime/agent-mailbox-conflict-locks.ts:40-50; src/runtime/agent-mailbox-conflict-locks.ts:68-79 |
| `RC00-057` | lint artifact書込器は、対象の排他的lock fileを作成できなければ書込を開始しない。 | tooling_runtime | gate | src/runtime/lint-artifact-write-port.ts:76-82 |
| `RC00-058` | lint artifact書込器は、現在内容のdigestがintentのbeforeDigestと異なる場合に失敗する。 | safety_security | gate | src/runtime/lint-artifact-write-port.ts:83-86 |
| `RC00-070` | 文書metadata書込器は、書込または復元前の内容digestが期待値と違えば失敗する。 | safety_security | gate | src/runtime/document-agent-metadata-write-port.ts:76-87 |
| `RC00-071` | 文書metadata書込器は、書込後の再読込digestが予定内容と違えば失敗する。 | evidence_claim | gate | src/runtime/document-agent-metadata-write-port.ts:80-83 |
| `RC00-077` | 文書metadata適用器は、writeが例外またはdurable=falseなら適用を失敗させ、記録済みの変更を逆順で復元する。 | safety_security | gate | src/runtime/document-agent-metadata-apply.ts:139-161 |
| `RC00-082` | 文書report書込器は、公開後に再読込した内容が予定内容と異なれば失敗する。 | evidence_claim | gate | src/runtime/document-report-write-port.ts:153-158 |
| `RC00-232` | guard override transactionは、監査予約がnonce再利用を報告した場合に例外適用を拒否する。 | escalation_authority | gate | src/runtime/guard-override-transaction.ts:51-57 |
| `RC00-234` | guard override transactionは、marker消費がfalseまたは例外なら適用を拒否し、監査補償が失敗しても拒否を維持する。 | escalation_authority | gate | src/runtime/guard-override-transaction.ts:61-71 |
| `RC02-016` | 論理DB receipt生成器は、policyがちょうど2回の再構築を要求していない場合、例外で拒否する。 | evidence_claim | gate | src/doctor/l3-g3-logical-db-receipt.ts:116-118 |
| `RC02-026` | 論理DB再構築checkは、workspaceの未収束、除外step実行、2回のprojection・checkpoint・schema不一致、母数不足、stale・orphan・finding残存、または未許可の不安定列がある場合にconverged=falseとし、直接起動時は終了コード1にする。 | evidence_claim | gate | src/doctor/l3-g3-logical-db-receipt.ts:168-180; src/doctor/l3-g3-logical-db-receipt.ts:276-359; src/doctor/l3-g3-logical-db-receipt.ts:488-525 |
| `RC03-082` | feedback lifecycle投影処理は、同世代の直前状態とイベントのfromStateが一致しない場合、state_chain_mismatchとして損傷を記録し、そのイベントを投影しない。 | memory_context | gate | src/policy/feedback-lifecycle.ts:261-266 |
| `RC03-085` | feedback操作処理は、同じoperationIdの既存記録が再要求の意味と一致しない場合、operation_intent_conflictとして拒否する。reconcileでは期待イベント列の意味的prefix、ackとsurfaceでは各操作の対象・世代・付随情報との一致を検査する。 | memory_context | gate | src/policy/feedback-lifecycle.ts:331-359; src/policy/feedback-lifecycle.ts:416-435; src/policy/feedback-lifecycle.ts:532-546; src/policy/feedback-lifecycle.ts:572-588; src/policy/feedback-lifecycle.ts:956-980 |
| `RC03-092` | feedback操作処理は、lockや追記などで例外が発生し、journal再読込による所定の回復条件も成立しない場合、ok=falseを返す。 | memory_context | gate | src/policy/feedback-lifecycle.ts:372-395; src/policy/feedback-lifecycle.ts:477-494; src/policy/feedback-lifecycle.ts:637-656 |
| `RC04-022` | ジョブ取得器は、取得処理が失敗した場合に開始済みtransactionをrollbackし、rollback失敗またはSQLite busy以外の例外を送出する。 | tooling_runtime | gate | src/orchestration/job-queue.ts:98-124 |
| `RC04-023` | ジョブ取得器は、SQLite busyの場合には取得結果をnullとする。 | tooling_runtime | gate | src/orchestration/job-queue.ts:112-123 |
| `RC04-039` | ループreceipt生成器は、epochがcommittedでない、またはpayloadが無い場合、receiptをblockedとしてretryを拒否する。 | evidence_claim | gate | src/orchestration/autonomous-loop-run-receipts.ts:88-109 |
| `RC04-040` | ループreceipt生成器は、orchestrationStageが残っていればreceiptをblockedにする。 | evidence_claim | gate | src/orchestration/autonomous-loop-run-receipts.ts:110-137 |
| `RC04-052` | durable storeは、旧importのepoch commitがcommittedでなければ失敗する。 | memory_context | gate | src/orchestration/loop-store.ts:187-196 |
| `RC04-053` | durable storeは、epochがcommittedでない、またはpayloadが無い場合、state読取りを拒否する。 | memory_context | gate | src/orchestration/loop-store.ts:201-208 |
| `RC04-055` | durable storeは、最終化または副作用実行時にmanifestのsnapshotが変わっていれば拒否する。 | memory_context | gate | src/orchestration/loop-store.ts:225-234; src/orchestration/loop-store.ts:297-302 |
| `RC04-056` | durable storeは、stage付き最終化で完了済みverifier、非null結果、次の反復番号、一致するiteration証拠が揃わなければ拒否する。 | evidence_claim | gate | src/orchestration/loop-store.ts:235-252 |
| `RC04-057` | durable storeは、stageが無いepochを更新する際、missingまたはcommitted以外の状態を上書きしない。 | memory_context | gate | src/orchestration/loop-store.ts:253-254 |
| `RC04-058` | durable storeは、初期commitでiterationが0以外、または保留iteration証拠がある場合、拒否する。 | process_gate | gate | src/orchestration/loop-store.ts:255-257 |
| `RC04-059` | durable storeは、stageなしの既存状態遷移を、反復数が不変のstopped状態かつ一致するiteration証拠がある場合に限定する。 | process_gate | gate | src/orchestration/loop-store.ts:258-271 |
| `RC04-060` | durable storeは、最終stateのepoch commitがcommittedでなければ書込みを失敗させる。 | memory_context | gate | src/orchestration/loop-store.ts:273-284 |
| `RC04-061` | durable storeは、副作用実行前のepochがmissingまたはcommitted以外なら実行を拒否する。 | process_gate | gate | src/orchestration/loop-store.ts:286-291 |
| `RC04-062` | durable storeは、副作用へ渡されたstateが永続化済みstateと異なれば拒否する。 | memory_context | gate | src/orchestration/loop-store.ts:292-296 |
| `RC04-063` | durable storeは、workerまたはverifierのstageが無い場合、verifierの副作用実行を拒否する。 | process_gate | gate | src/orchestration/loop-store.ts:303-305 |
| `RC04-064` | durable storeは、同じ反復の該当stageが完了済みならworkerを再実行せず、verifierには保存済み結果を返す。 | tooling_runtime | gate | src/orchestration/loop-store.ts:306-313 |
| `RC04-065` | durable storeは、副作用intentのcommitまたはintent capability取得に失敗した場合、実行を拒否する。 | safety_security | gate | src/orchestration/loop-store.ts:315-332 |
| `RC04-067` | durable storeは、副作用完了のepoch commitがcommittedでなければ失敗する。 | evidence_claim | gate | src/orchestration/loop-store.ts:337-355 |
| `RC04-068` | epoch commit器は、現在manifestが呼出側のpreviousManifestTextと異なれば競合として拒否する。 | memory_context | gate | src/orchestration/durable-loop-epoch.ts:107-117; src/orchestration/durable-loop-epoch.ts:145-154 |
| `RC04-069` | epoch commit器は、snapshot読取りまたは排他claim取得が例外になればdurability_uncertainを返し、capabilityを発行しない。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch.ts:118-135 |
| `RC04-070` | epoch commit器は、排他claimを取得できなければ競合として拒否する。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch.ts:137-143 |
| `RC04-073` | epoch commit器は、payload・manifest・pointerの書込み、fsync、公開またはclaim解放で例外が起きるとdurability_uncertainを返す。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch.ts:205-231 |
| `RC04-074` | 副作用認可器は、正規intent capabilityが無い、PLANが不一致、またはcapabilityが使用済みの場合、実行を拒否する。 | safety_security | gate | src/orchestration/durable-loop-epoch.ts:235-248 |
| `RC04-075` | epoch分類器は、manifestなしでclaimが残る場合live_claimまたはstale_claimとし、payloadだけ残る場合uncommittedとする。 | memory_context | gate | src/orchestration/durable-loop-epoch.ts:386-395 |
| `RC04-077` | epoch分類器は、指定されたprevious manifestとの連番・digest連鎖が一致しなければ競合とする。 | evidence_claim | gate | src/orchestration/durable-loop-epoch.ts:400-411 |
| `RC04-079` | epoch分類器は、同じPLAN・epoch・previous digestから異なるmanifestが分岐していれば競合とする。 | memory_context | gate | src/orchestration/durable-loop-epoch.ts:417-427 |
| `RC04-080` | epoch分類器は、manifest検証後もclaimが残っていればdurability_uncertainとする。 | memory_context | gate | src/orchestration/durable-loop-epoch.ts:429-435 |
| `RC04-081` | epoch分類器は、intent_recordedに対応する完了が無ければambiguous_side_effectとする。 | evidence_claim | gate | src/orchestration/durable-loop-epoch.ts:437-443 |
| `RC04-084` | claim判定器は、不正なclaimまたは生存確認がunknownのclaimをlive扱いする。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:159-178 |
| `RC04-086` | claim取得器は、releasing claimまたはrelease proofが残り、そのproofがPLAN・claim・pointerへ正しく束縛されていなければ失敗する。 | evidence_claim | gate | src/orchestration/durable-loop-epoch-node.ts:210-225; src/orchestration/durable-loop-epoch-node.ts:266-277 |
| `RC04-087` | claim取得器は、claimが既存、または取得直後にreleasing claimを検出した場合、取得失敗を返す。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:279-317 |
| `RC04-089` | stale claim復旧器は、既存の信頼できる復旧mutexがstaleでなければ競合として拒否する。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:490-498 |
| `RC04-091` | stale claim復旧器は、最大2回の取得試行後も復旧mutexを作れなければ競合として拒否する。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:473-527 |
| `RC04-092` | stale claim復旧器は、対象claimが存在しない、またはstaleと証明できない場合、回収を拒否する。 | safety_security | gate | src/orchestration/durable-loop-epoch-node.ts:528-535 |
| `RC04-094` | stale claim復旧器は、releasing claimのrelease proofが存在するのに不正なら削除を拒否する。 | evidence_claim | gate | src/orchestration/durable-loop-epoch-node.ts:569-571 |
| `RC04-095` | stale claim復旧器は、復旧検証または取得済み復旧mutexのcleanupに失敗すればdurability_uncertainとする。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:578-587 |
| `RC04-101` | epoch読取り器は、previous digestの参照先が無い、または直前epochでなければ履歴欠落として拒否する。 | memory_context | gate | src/orchestration/durable-loop-epoch-node.ts:697-710 |
| `RC04-102` | epoch読取り器は、pointer・manifest処理の例外をcorrupt、外側のfilesystem読取り例外をdurability_uncertainとして返す。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:723-752 |
| `RD00-040` | slot管理は、release対象に未releaseのslotが存在しない場合、状態を変更せずfalseを返す。 | tooling_runtime | hook | src/runtime/agent-slots.ts:124-134 |
| `RD00-204` | Claude inboxは、OFF以外のone-shotを通常arm操作で再起動しようとした場合、拒否する。 | process_gate | gate | src/runtime/claude-memory-wake.ts:156-165 |
| `RD00-205` | Claude inboxは、ARMED以外からのclaim、または空の受信sessionによるclaimを拒否する。 | process_gate | gate | src/runtime/claude-memory-wake.ts:166-176 |
| `RD00-206` | Claude inboxは、CLAIMED以外からのdeliver、受信session不一致・空、またはackとdelivery digest不一致の場合、配信確認を拒否する。 | evidence_claim | gate | src/runtime/claude-memory-wake.ts:177-187 |
| `RD00-210` | Claude inboxは、CLAIMED以外、既に1回rearm済み、またはsender runtime不明の場合、明示rearmを拒否する。 | process_gate | gate | src/runtime/claude-memory-wake.ts:221-247 |
| `RD00-214` | Claude review dispatchは、同一PR・HEAD・対象CI世代の通知が既にある場合、既存通知を再利用して新しい通知を作らない。 | memory_context | gate | src/runtime/claude-memory-wake.ts:515-544 |
| `RD00-224` | Claude inbox publisherは、既存projectionが同一内容でも同一canonical PR identityでもない場合、上書きせず競合として拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:863-902 |
| `RD00-226` | Claude inboxは、既存skip tombstoneが同一entry IDを示さない、または解釈不能の場合、上書きせず拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:1019-1044 |
| `RD00-227` | Claude inboxは、既存superseded markerの置換先HEADが要求と異なる場合、拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:1135-1139; src/runtime/claude-memory-wake.ts:1165-1169 |
| `RD00-228` | Claude inboxは、既にterminal markerがある通知を後続HEADの出現でsupersededへ変更しない。 | memory_context | gate | src/runtime/claude-memory-wake.ts:1141-1147 |
| `RD00-229` | Claude inboxは、supersedeの元状態がない、またはcanonical通知のclaimにHEAD一致のarmed markerがない場合、拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:1148-1149; src/runtime/claude-memory-wake.ts:1193-1197 |
| `RD00-231` | Claude inboxは、claim fileの排他的作成に負けた場合、その通知を取得済みとして返さない。 | memory_context | gate | src/runtime/claude-memory-wake.ts:687-701; src/runtime/claude-memory-wake.ts:1209-1213; src/runtime/claude-memory-wake.ts:1628-1639 |
| `RD00-232` | Claude inboxは、claimが存在しない場合、delivery記録を拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:1223-1228 |
| `RD00-234` | Claude inboxは、汎用通知のclaim所有sessionとdelivery記録者sessionが異なる場合、拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:1269-1271 |
| `RD00-236` | Claude inboxは、既存delivery markerが同じ対象・session・digestによる冪等記録でない場合、再記録を拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:1290-1336 |
| `RD00-238` | Claude inboxは、既存review markerが同一reviewerによる有効な記録でない場合、再記録を拒否する。 | review_merge | gate | src/runtime/claude-memory-wake.ts:1367-1386; src/runtime/claude-memory-wake.ts:1399-1413 |
| `RD00-240` | Claude inboxは、既存terminal markerが有効な同一通知の終了記録でない場合、終了記録を拒否する。 | memory_context | gate | src/runtime/claude-memory-wake.ts:1055-1059; src/runtime/claude-memory-wake.ts:1444-1462; src/runtime/claude-memory-wake.ts:1475-1481 |
| `RD00-243` | Claude wake watcherは、自分のsession generationが置き換えられた場合、supersededとして終了する。 | tooling_runtime | gate | src/runtime/claude-memory-wake.ts:1569-1578 |
| `RD00-296` | review receipt slot確認は、対象の保存slotが既に存在する場合、空きslotとしての利用を拒否する。 | review_merge | gate | src/runtime/claude-pr-convergence.ts:1042-1049 |
| `RD00-297` | review receipt slot取得は、pending claimが既に存在する場合、同時生成を拒否する。 | tooling_runtime | gate | src/runtime/claude-pr-convergence.ts:1079-1088 |
| `RD00-299` | review receipt slot解放は、receipt IDまたはtokenが取得時のclaimと異なる場合、拒否する。 | tooling_runtime | gate | src/runtime/claude-pr-convergence.ts:1106-1109 |
| `RD00-303` | review receipt訂正は、既存訂正拒否optionが有効で同じ元slot digestの訂正fileが存在する場合、拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:1197-1206 |
| `RD00-305` | 訂正receipt保存は、既存authorization・訂正receiptが両方存在して内容一致する場合以外、既存fileとの競合を拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:1325-1335 |
| `RD00-306` | review receipt保存は、同じslotに異なる内容が存在する場合、上書きせず拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:1389-1401 |
| `RD01-010` | retirement遷移判定は、同じoperation IDに異なるintent digestが記録されていれば拒否する。 | process_gate | gate | src/runtime/continuation.ts:258-262 |
| `RD01-011` | retirement遷移判定は、完了済みphaseの正常な再実行を除き、最新checkpointとcurrent phaseが一致しなければ拒否する。 | process_gate | gate | src/runtime/continuation.ts:263-269 |
| `RD01-022` | rollback判定は、完了journalの順序が不正、checkpointがない、またはcheckpoint phaseが現在と異なる場合に拒否する。 | process_gate | gate | src/runtime/continuation.ts:482-490 |
| `RD01-029` | continuation writerは、イベント追記が失敗した場合、DB投影やcheckpoint公開へ進まず失敗を返す。 | memory_context | gate | src/runtime/continuation.ts:606-611 |
| `RD01-030` | continuation writerは、DB投影が失敗した場合、checkpointを公開せず失敗を返す。 | memory_context | gate | src/runtime/continuation.ts:612-620 |
| `RD01-031` | continuation writerは、checkpoint公開が失敗した場合、投影済み状態を保持して失敗を返す。 | memory_context | gate | src/runtime/continuation.ts:621-632 |
| `RD01-034` | PLAN完了adapterは、再実行するoperation IDが既存記録と異なるsessionに属していれば拒否する。 | memory_context | gate | src/runtime/continuation.ts:734-744 |
| `RD01-035` | continuationの読取・追記・投影処理は、同じoperation IDに異なるpayload hashを割り当てることを拒否する。 | memory_context | gate | src/runtime/continuation.ts:745-747; src/runtime/continuation.ts:816-819; src/runtime/continuation.ts:899-903; src/runtime/continuation.ts:1028-1034 |
| `RD01-039` | continuation処理は、event IDを異なるoperation・sequence・payloadに再利用することを拒否し、新規追記でも既存event IDを拒否する。 | memory_context | gate | src/runtime/continuation.ts:805-815; src/runtime/continuation.ts:924-926; src/runtime/continuation.ts:1015-1027 |
| `RD01-040` | continuation処理は、同じsession・sequenceに異なるevent IDまたはpayload hashが存在すれば拒否する。 | memory_context | gate | src/runtime/continuation.ts:821-828; src/runtime/continuation.ts:915-923; src/runtime/continuation.ts:1035-1048 |
| `RD01-041` | continuation処理はsession内のsequence逆行を拒否し、新規追記・投影では既存最大値以下のsequenceを拒否する。 | memory_context | gate | src/runtime/continuation.ts:830-834; src/runtime/continuation.ts:927-930; src/runtime/continuation.ts:1049-1054 |
| `RD01-042` | continuation追記処理は、同じoperationの再実行位置をjournalから解決できなければ失敗する。 | memory_context | gate | src/runtime/continuation.ts:904-914 |
| `RD01-043` | continuationとdeliveryのfence処理は、transaction中の例外時にrollbackを試み、元の例外を伝播する。 | tooling_runtime | gate | src/runtime/continuation.ts:859-884 |
| `RD01-062` | delivery journalの読取・追記処理は、同じoperation IDに異なるevent hashがあれば拒否する。 | memory_context | gate | src/runtime/continuation.ts:1355-1361; src/runtime/continuation.ts:1394-1399 |
| `RD01-063` | delivery writerは、journal追記に失敗した場合、receiptへ投影せず失敗を返す。 | memory_context | gate | src/runtime/continuation.ts:1414-1429 |
| `RD01-064` | delivery writerは、投影に失敗した場合、追記結果を保持して失敗を返す。 | memory_context | gate | src/runtime/continuation.ts:1430-1440 |
| `RD01-065` | delivery投影処理は、初期状態pending、pendingからdelivered、deliveredからacknowledgedまたはexpired以外の状態遷移を拒否する。 | process_gate | gate | src/runtime/continuation.ts:1271-1276; src/runtime/continuation.ts:1452-1453; src/runtime/continuation.ts:1500-1502 |
| `RD01-066` | delivery投影処理は、既存identity・payload・元保持期限の不一致、または挿入失敗後に同一記録を確認できない場合に拒否する。 | memory_context | gate | src/runtime/continuation.ts:1467-1492 |
| `RD01-067` | delivery投影処理は、記録日時または保持期限が既存値より後退した場合に拒否する。 | memory_context | gate | src/runtime/continuation.ts:1493-1499 |
| `RD01-068` | delivery投影処理は、更新後のstatusとpayload digestが期待値に一致することを再読で確認できなければ失敗する。 | evidence_claim | gate | src/runtime/continuation.ts:1503-1533 |
| `RD01-075` | Cursor follow-up判定は、active runが1件でもある場合にPOSTを拒否する。 | lane_delegation | gate | src/runtime/cursor-cloud-run-authority.ts:151-159 |
| `RD01-078` | Cursor follow-up判定は、取消可能なstale runが1件ならPOSTを止め、そのrunの取消と再読を要求する。 | lane_delegation | gate | src/runtime/cursor-cloud-run-authority.ts:178-186 |
| `RD01-079` | Cursor follow-up処理はPOST再試行を許可せず、2xxならrun再読、409ならrun一覧更新、それ以外なら失敗とする。 | tooling_runtime | gate | src/runtime/cursor-cloud-run-authority.ts:129-132; src/runtime/cursor-cloud-run-authority.ts:197-210 |
| `RD01-080` | Cursor POST後の再読判定は、active runがちょうど1件でなければ受入を拒否する。 | evidence_claim | gate | src/runtime/cursor-cloud-run-authority.ts:222-223 |
| `RD01-081` | Cursor POST後の再読判定は、唯一のactive runが期待run IDと異なれば受入を拒否する。 | evidence_claim | gate | src/runtime/cursor-cloud-run-authority.ts:224-225 |
| `RD01-084` | Cursor取消後の再読判定は、active・取消可能stale・stale・unknownのrunが残っていればagent解放を認めない。 | lane_delegation | gate | src/runtime/cursor-cloud-run-authority.ts:245-251 |
| `RD01-091` | 因果順序判定は、原因イベントの発生時刻が対象イベントより後なら拒否する。 | process_gate | gate | src/runtime/event-projection-checkpoint-replay.ts:269-271 |
| `RD01-092` | ingestとcheckpoint scope選択は、既存log内にevent IDの重複があれば失敗する。 | memory_context | gate | src/runtime/event-projection-checkpoint-replay.ts:279-281; src/runtime/event-projection-checkpoint-replay.ts:366-368 |
| `RD01-093` | ingest判定は、同じevent IDのpayload digestが既存値と異なる場合に拒否する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-replay.ts:282-287 |
| `RD01-094` | lifecycle判定は、系列の最初のイベントがrequestedでない場合、または定義済み遷移表にない遷移なら拒否する。 | process_gate | gate | src/runtime/event-projection-checkpoint-replay.ts:290-304; src/runtime/event-projection-checkpoint-replay.ts:310-325 |
| `RD01-095` | lifecycle判定は、系列の直前イベントがsealedであれば次の遷移を拒否する。 | process_gate | gate | src/runtime/event-projection-checkpoint-replay.ts:319-321 |
| `RD01-106` | checkpoint replay判定は、再生projection digestが保存値と異なれば失敗する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-replay.ts:423-425 |
| `RD01-107` | checkpoint replay判定は、再生checkpoint digestが保存値と異なれば失敗する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-replay.ts:426-428 |
| `RD01-113` | orchestration transactionは、同一event IDのenvelope全体が既存記録と異なれば拒否する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-transaction.ts:182-189; src/runtime/event-projection-checkpoint-transaction.ts:543-547 |
| `RD01-114` | orchestration journal追記処理は、書込み・同期に失敗した場合、元byte長への復元を試みて失敗を返す。 | memory_context | gate | src/runtime/event-projection-checkpoint-transaction.ts:162-172; src/runtime/event-projection-checkpoint-transaction.ts:194-206 |
| `RD01-116` | orchestration transactionは、journalの因果順序検証が失敗した場合に停止する。 | process_gate | gate | src/runtime/event-projection-checkpoint-transaction.ts:251-253 |
| `RD01-117` | orchestration transactionは、journalの冪等ingest検証が失敗した場合に停止する。 | process_gate | gate | src/runtime/event-projection-checkpoint-transaction.ts:254-255 |
| `RD01-118` | orchestration transactionは、journalのlifecycle遷移検証が失敗した場合に停止する。 | process_gate | gate | src/runtime/event-projection-checkpoint-transaction.ts:256-257 |
| `RD01-119` | orchestration投影構築は、同じlaneの履歴内で親laneが変わっていれば失敗する。 | lane_delegation | gate | src/runtime/event-projection-checkpoint-transaction.ts:273-276 |
| `RD01-120` | orchestration投影構築は、同じlaneの履歴内でPLAN IDが変わっていれば失敗する。 | lane_delegation | gate | src/runtime/event-projection-checkpoint-transaction.ts:277-279 |
| `RD01-125` | orchestration transactionは、projection行の挿入に失敗した場合、journalを保持して失敗する。 | memory_context | gate | src/runtime/event-projection-checkpoint-transaction.ts:415-442 |
| `RD01-126` | orchestration transactionは、投影後の期待行欠落またはprojection drift検証失敗を拒否する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-transaction.ts:457-470 |
| `RD01-127` | orchestration transactionは、checkpoint replay検証が失敗した場合に停止する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-transaction.ts:486-494 |
| `RD01-129` | orchestration transactionは、commit前後のtransaction内例外でrollbackを試み、checkpoint未公開の失敗結果を返す。 | tooling_runtime | gate | src/runtime/event-projection-checkpoint-transaction.ts:571-587 |
| `RD01-130` | orchestration transactionは、最新projectionまたはcheckpointが得られていなければ公開を止めて失敗する。 | evidence_claim | gate | src/runtime/event-projection-checkpoint-transaction.ts:588-597 |
| `RD01-131` | orchestration transactionは、checkpointファイルの公開に失敗した場合、DB commit状態を保持しつつ失敗を返す。 | memory_context | gate | src/runtime/event-projection-checkpoint-transaction.ts:598-608 |
| `RD01-137` | feedback記録処理は、session・PLAN・attention・summary・reasonが既存記録と同じ場合に追記を省略する。 | memory_context | gate | src/runtime/forced-stop.ts:76-79; src/runtime/forced-stop.ts:177-185 |
| `RD01-144` | PLAN authoringのcommitted復旧は、finalが期待内容でなく、必要stageが欠落またはdigest不一致なら失敗する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:353-362 |
| `RD01-145` | PLAN authoring処理は、置換前の予約authorityが欠落または期待digestから変化していれば拒否する。 | process_gate | gate | src/runtime/forward-plan-authoring-transaction.ts:370-374; src/runtime/forward-plan-authoring-transaction.ts:659-661 |
| `RD01-159` | PLAN authoring処理は、全evidence surfaceがavailableでない、またはbranch・assignment・lease・fence・HEADに一致するactive writerがない場合に拒否する。 | lane_delegation | gate | src/runtime/forward-plan-authoring-transaction.ts:438-451 |
| `RD01-164` | PLAN authoring再実行は、保存allocator receiptが欠落・不正、またはissuer・main・assignment・lease・fence・allocationと不一致なら拒否する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:595-615 |
| `RD01-165` | PLAN authoring処理は、実書込み時にlockを取得できなければ拒否する。 | tooling_runtime | gate | src/runtime/forward-plan-authoring-transaction.ts:650-656 |
| `RD01-167` | PLAN authoring処理は、既存3成果物が期待内容と同じでも、予約projectionが期待値と異なれば再実行成功を拒否する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:673-684 |
| `RD01-170` | PLAN authoring処理は、commit直前にHEAD・main・予約authorityが変化するか作成予定pathが出現した場合、復旧を試みて拒否する。 | process_gate | gate | src/runtime/forward-plan-authoring-transaction.ts:748-757 |
| `RD01-171` | PLAN authoring処理は、保存後のauthority・receipt・projectionの再読が期待内容と一致しなければ失敗する。 | evidence_claim | gate | src/runtime/forward-plan-authoring-transaction.ts:761-772 |
| `RD01-172` | PLAN authoring処理は、例外時にjournalが残っていればrecovery_required、なければblockedを返す。 | process_gate | gate | src/runtime/forward-plan-authoring-transaction.ts:779-785 |
| `RD01-179` | Forward／Reverse予約処理は、pairを追加した予約projectionが検証を通らなければ両contractを返さず拒否する。 | process_gate | gate | src/runtime/forward-reverse-terminal-reservation.ts:154-168 |
| `RD01-250` | logical DB receipt検証は、projection digestがreplay側と一致しなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:224-224 |
| `RD01-251` | logical DB receipt検証は、checkpoint digestがreplay側と一致しなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:225-225 |
| `RD01-252` | logical DB receipt検証は、checkpoint table集合がreplay側と一致しなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:226-226 |
| `RD01-253` | logical DB receipt検証は、checkpoint行数がreplay側と一致しなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:227-227 |
| `RD01-255` | logical DB receipt検証は、本体とreplayのschema revisionが一致しなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:230-230 |
| `RD01-261` | logical DB receipt検証は、本体・replayの除外projection step実行一覧または予期しない不安定column一覧が空配列でなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:212-216; src/runtime/github-cross-review-admission.ts:241-241 |
| `RD01-301` | merge再読receipt保存処理は、同名ファイルが既にあり内容が異なる場合に失敗する。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:778-790 |
| `RD01-348` | CI profile receipt検証は、同HEAD・profile・実行surfaceで項目が重なるterminal証跡が既にあり、束縛も同じ場合に重複として拒否する。 | evidence_claim | gate | src/runtime/impact-ci.ts:518-534 |
| `RD02-026` | lease発行器は、同一repository・PR・HEAD・generationのactive leaseが既にある場合に拒否する。 | lane_delegation | gate | src/runtime/independent-review-fallback.ts:619-622 |
| `RD02-029` | lease保存器は、同一PR・HEADのKimi試行数が上限以上、または排他的な試行slotを確保できない場合に拒否する。 | lane_delegation | gate | src/runtime/independent-review-fallback.ts:656-691 |
| `RD02-030` | lease保存器は、leaseファイルを排他的に作成できない場合に予約slotを解放して失敗する。 | tooling_runtime | gate | src/runtime/independent-review-fallback.ts:700-707 |
| `RD02-161` | lint effect実行器は、operation ID・capability ID・idempotency keyのいずれかがないintentを実行前にblockする。 | tooling_runtime | gate | src/runtime/lint-effect-executor.ts:181-188 |
| `RD02-169` | lint effect実行器は、authorizationのrevocation epochが現行値と異なる場合にblockする。 | safety_security | gate | src/runtime/lint-effect-executor.ts:206-206 |
| `RD02-176` | lint effect実行器は、idempotency claimがduplicateを返す場合に再実行をblockする。 | tooling_runtime | gate | src/runtime/lint-effect-executor.ts:249-258 |
| `RD02-177` | lint effect実行器は、idempotency keyが別scopeと競合する場合にblockする。 | tooling_runtime | gate | src/runtime/lint-effect-executor.ts:254-259 |
| `RD02-178` | lint effect実行器は、idempotency claimが例外を投げた場合にblockする。 | tooling_runtime | gate | src/runtime/lint-effect-executor.ts:261-263 |
| `RD02-273` | resident assignment投影器は、同一IDのrevision間でauthority内容が変わる、fenceが1増加でない、laneやlease IDが同じ、または作成時刻が進まない場合にID conflictを返す。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:107-119; src/runtime/resident-lane-assignment.ts:157-175; src/runtime/resident-lane-assignment.ts:218-220 |
| `RD02-275` | resident assignment投影器は、最新割当の期限が観測時刻以前なら失敗とする。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:191-198 |
| `RD02-276` | resident assignment投影器は、同一repository・branchに複数のactive writer所有組がある場合に失敗とする。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:200-209; src/runtime/resident-lane-assignment.ts:221-223 |
| `RD02-281` | review返却判定器は、lease fenceが元割当と一致しない場合に拒否する。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:259-261 |
| `RD02-282` | assignment引継ぎ判定器は、前leaseが終了していない場合に拒否する。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:285-287 |
| `RD02-284` | assignment引継ぎ判定器は、次lease IDが前lease IDと同じ場合に拒否する。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:294-296 |
| `RD02-286` | assignment引継ぎ判定器は、次fenceが前fenceに1を加えた値でない場合に拒否する。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:300-302 |
| `RD02-287` | assignment引継ぎ判定器は、再割当時刻が前割当の作成時刻より後でない場合に拒否する。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:303-305 |
| `RD03-035` | session logは、同じevent_idが保存済みの場合、そのeventを再追記しない。event_id未指定の旧eventは毎回追記する。 | memory_context | hook | src/runtime/session-log.ts:298-315 |
| `RD03-038` | PLAN digest圧縮は、session別watermarkまでのeventを再計上せず、updated_atを巻き戻さず、同じtimestampのfailureを重複記録しない。 | memory_context | hook | src/runtime/session-log.ts:404-450 |
| `RD03-039` | Stop hookは、memoryPromotionNudgeが通知を要求し、その通知eventの新規追記に成功した呼出しだけがwarningを表示する。 | memory_context | hook | src/runtime/session-log.ts:530-547 |
| `RD03-040` | session logのevent lockは、SQLite busyだけを20 ms間隔で再試行し、attemptが100以上またはbusy以外のエラーなら再試行を打ち切る。 | tooling_runtime | hook | src/runtime/session-log.ts:619-638; src/runtime/session-log.ts:313-318 |
| `RD03-053` | dispatch admissionは、同じparent IDとtask IDの実行中rowについてlease ownerまたはfence tokenが候補と異なる場合、二重所有として拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:373-386; src/runtime/slot-scheduler-quota-handover.ts:431-433 |
| `RD03-056` | queue追加は、候補taskがすでに待機または実行中一覧にある場合、拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:452-455 |
| `RD03-058` | quota handoverは、現在のslot_stateがrunningでない場合、拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:491-496 |
| `RD03-060` | quota handoverは、packetがすでにack済みの場合、再配送として拒否する。 | memory_context | gate | src/runtime/slot-scheduler-quota-handover.ts:500-502 |
| `RD03-063` | quota handoverは、packetのlease ownerが現在のrowのownerと異なる場合、二重所有として拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:513-515 |
| `RD03-064` | quota handoverは、前任者のleaseが解放されていない場合、拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:516-518 |
| `RD03-066` | quota handoverは、現在rowのleaseとpacketの期待fence tokenを用いた後任lease取得が失敗した場合、そのWORK_GRAPH失敗コードを変更せず返す。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:522-534 |
| `RD03-067` | slot障害隔離評価は、失敗laneのleaseが解放されていない場合、拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:562-564 |
| `RD03-069` | slot障害隔離評価は、障害前後でqueueの件数または順序が変わった場合、不合格にする。 | tooling_runtime | gate | src/runtime/slot-scheduler-quota-handover.ts:574-579 |
| `RD03-233` | Windows canary policy検証は、heartbeat intervalがlease TTL以上の場合、拒否する。 | tooling_runtime | gate | src/runtime/windows-lite-canary-admission.ts:179-189 |
| `RD03-235` | Windows canary lease binding検証は、共通work graph lease検証が失敗した場合、拒否する。 | lane_delegation | gate | src/runtime/windows-lite-canary-admission.ts:236-244 |
| `RD03-238` | Windows canary queue評価は、activeまたはwaitingの既存lease bindingに不正なものがある場合、不確実状態として拒否する。 | lane_delegation | gate | src/runtime/windows-lite-canary-admission.ts:269-278; src/runtime/windows-lite-canary-admission.ts:298-303 |
| `RD03-240` | Windows canary queue評価は、既存assignment IDが重複するか候補IDが既存一覧にある場合、拒否する。 | lane_delegation | gate | src/runtime/windows-lite-canary-admission.ts:308-314 |
| `RD03-244` | Windows canary lease評価は、観測時刻がexpires_at以上の場合、期限切れとして拒否する。 | lane_delegation | gate | src/runtime/windows-lite-canary-admission.ts:366-368 |
| `RD03-245` | Windows canary lease評価は、heartbeatが発行前・観測後にあるか、最終heartbeatからの経過がpolicy intervalを超える場合、staleとして拒否する。 | tooling_runtime | gate | src/runtime/windows-lite-canary-admission.ts:369-375 |
| `RD03-246` | Windows canary lease評価は、提示bindingのfence tokenがcurrent bindingと異なる場合、拒否する。 | lane_delegation | gate | src/runtime/windows-lite-canary-admission.ts:376-378 |
| `RD03-247` | Windows canary lease評価は、提示bindingのownerまたはlease IDがcurrent bindingと異なる場合、拒否する。 | lane_delegation | gate | src/runtime/windows-lite-canary-admission.ts:379-384 |
| `RD04-003` | lease取得器は、lane・owner・期待fence token・既存leaseが入力検証を満たさない場合に取得を拒否する。 | lane_delegation | gate | src/runtime/work-graph-receipt-acceptance.ts:271-282 |
| `RD04-004` | lease取得器は、現在のfence tokenと期待値が異なる場合に取得を拒否する。 | lane_delegation | gate | src/runtime/work-graph-receipt-acceptance.ts:283-285 |
| `RD04-005` | lease解放器は、解放対象leaseの検証に失敗した場合に解放を拒否する。 | lane_delegation | gate | src/runtime/work-graph-receipt-acceptance.ts:297-302 |
| `RD04-006` | lease解放器は、terminal receiptが無い、またはライフサイクル証跡を検証できない場合に解放を拒否する。 | lane_delegation | gate | src/runtime/work-graph-receipt-acceptance.ts:303-306 |
| `RD04-013` | 委譲判定器は、提示leaseが不正、またはbindingのwriter leaseとfence token・ownerが一致しない場合に拒否する。 | lane_delegation | gate | src/runtime/work-graph-receipt-acceptance.ts:341-347 |
| `RD04-124` | isolation実行器は、封印されていないlaunch、および一度消費したlaunchの再利用を拒否する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:746-760 |
| `RD07-115` | handover復活検査は、complete checkpointが存在する場合、そのoperationIdが期待値と異なればinvalid_preconditionとして失敗する。 | evidence_claim | lint | src/lint/handover-resurrection.ts:518-533 |
| `RD10-126` | semantic boundary gateは許可writerと除外ファイル以外でsemantic_result_*への直接SQLまたは検出可能な動的書込参照を見つけた場合に失敗させる。 | safety_security | lint／gate | src/lint/semantic-boundary.ts:44-51; src/lint/semantic-boundary.ts:228-251 |
| `RD11-185` | terminal fullback監査は、Forward sliceのDB収束が真でない、projection・checkpoint digestが不正、またはそれぞれのreplay結果が一致しない場合に失敗させる。 | evidence_claim | lint | src/lint/workflow-classification-terminal-fullback.ts:265-277 |
| `RD11-196` | terminal fullback監査は、current-mainのprojection・checkpoint digestが不正、またはそれぞれのreplay digestと一致しない場合に失敗させる。 | evidence_claim | lint | src/lint/workflow-classification-terminal-fullback.ts:417-429 |
| `RE01-079` | 完了記録処理はdurableなsession eventを先に残し、冪等なDB checkpointへ反映する。JSONLとSQLiteの同時更新を単一atomic transactionと主張してはならない。 | memory_context | prose | docs/governance/helix-harness-requirements_v1.2.md:1241-1247 |
| `RE01-214` | setup・upgrade・rollback・uninstall処理はmanaged marker内だけを冪等に変更し、consumer所有fileや履歴を変更せず、必要な証拠を保持する。 | safety_security | gate | docs/governance/helix-harness-requirements_v1.3.md:313-315 |
| `RE01-223` | authoring commit処理は関連資産・ledger・trace・DB・receiptをCASと単一transactionで更新し、部分反映を許さない。 | tooling_runtime | gate | docs/governance/helix-harness-requirements_v1.3.md:355-355 |
| `RE01-226` | authoring処理は同じcommandとdigestの再送を冪等に扱い、内容が異なればconflictにする。review後のrevision・HEAD変更をstaleにし、失敗proposalやfindingを消さない。 | memory_context | gate | docs/governance/helix-harness-requirements_v1.3.md:361-361 |
| `RF00-003` | ジョブ取得器はBEGIN IMMEDIATEでtransactionを開始してから対象を選択し、claim更新をCOMMITしてから取得結果を返す。 | tooling_runtime | gate | src/orchestration/job-queue.ts:98-111 |
| `RF00-014` | claim判定器は、claimと現在環境のbootIdentityが両方存在し、一致しない場合、そのclaimをstaleとする。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:159-166 |
| `RF00-015` | claim判定器は、bootIdentity不一致に該当せず、claimのprocessStartTokenが現在のtokenと一致する場合、lease期限に関係なくliveとする。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:159-168 |
| `RF00-016` | claim判定器は、bootIdentity不一致に該当せず、claimと現在のprocessStartTokenが両方存在して一致しない場合、claimをstaleとする。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:165-170 |
| `RF00-017` | claim判定器は、先行するbootIdentity・processStartTokenの判定で確定せず、Linuxで現在のprocessStartTokenがnullの場合、claimをstaleとする。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:127-144; src/orchestration/durable-loop-epoch-node.ts:165-171 |
| `RF00-018` | プロセス生存判定器はsignal 0の送信成功またはEPERMをlive、ESRCHをdeadとし、claim判定器はこの結果がliveならlive、deadならstaleに分類する。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:147-156; src/orchestration/durable-loop-epoch-node.ts:172-175 |
| `RF00-019` | epoch永続化器は、claimとpayload・manifest・pointer・release proofの一時ファイルを排他的作成フラグwx、権限0600で作成し、同名ファイルがある場合にその内容を上書きしない。 | safety_security | gate | src/orchestration/durable-loop-epoch-node.ts:279-280; src/orchestration/durable-loop-epoch-node.ts:326-331; src/orchestration/durable-loop-epoch-node.ts:343-348; src/orchestration/durable-loop-epoch-node.ts:359-364; src/orchestration/durable-loop-epoch-node.ts:374-387 |
| `RF00-022` | epoch読取り器は、通常claimが無く、releasing claimに有効なrelease proofがある場合、そのreleasing claimを残留claimとして扱わない。 | tooling_runtime | gate | src/orchestration/durable-loop-epoch-node.ts:593-600 |
| `RF00-023` | epoch commit器は、payload、manifest、pointerの順に一時書込み・ファイル同期・公開・directory同期を行い、claim解放完了後にだけcommittedを返す。intent capabilityは、その完了したcommitのsideEffectPhaseがintent_recordedの場合にだけ発行する。 | process_gate | gate | src/orchestration/durable-loop-epoch.ts:92-97; src/orchestration/durable-loop-epoch.ts:205-224 |
| `RG12-006` | #214の実装担当者は、L6設計§6.1に定めた呼び出し元のprovenance責任境界を、transactional boundaryで機械強制する。 | evidence_claim | prose | docs/governance/issue-213-work-graph-receipt-closure.md:45-46 |

## 副として対応づいた規則（91件）

`RA-035`、`RA-071`、`RB05-176`、`RB05-207`、`RB06-110`、`RB06-111`、`RB06-169`、`RB06-179`、`RB06-248`、`RB06-251`、`RB06-254`、`RB07-294`、`RB08-081`、`RB08-138`、`RB08-158`、`RB08-290`、`RB08-292`、`RB09-036`、`RC00-080`、`RC00-083`、`RC03-084`、`RC03-089`、`RC04-048`、`RC04-066`、`RC04-071`、`RC04-072`、`RC04-076`、`RC04-082`、`RC04-090`、`RC04-093`、`RC04-097`、`RC04-098`、`RC04-100`、`RC04-289`、`RD00-075`、`RD00-208`、`RD00-209`、`RD00-212`、`RD00-220`、`RD00-221`、`RD00-222`、`RD00-225`、`RD00-233`、`RD00-298`、`RD00-311`、`RD01-015`、`RD01-036`、`RD01-076`、`RD01-077`、`RD01-082`、`RD01-089`、`RD01-090`、`RD01-098`、`RD01-099`、`RD01-105`、`RD01-121`、`RD01-124`、`RD01-140`、`RD01-142`、`RD01-143`、`RD01-150`、`RD01-161`、`RD01-166`、`RD01-168`、`RD01-169`、`RD01-223`、`RD01-229`、`RD02-014`、`RD02-157`、`RD02-184`、`RD02-277`、`RD02-285`、`RD03-059`、`RD03-065`、`RD03-068`、`RD03-234`、`RD03-236`、`RD03-242`、`RD03-243`、`RD03-248`、`RD04-031`、`RD05-168`、`RD07-116`、`RD07-117`、`RD07-118`、`RE01-066`、`RE01-207`、`RE01-278`、`RF00-002`、`RF00-020`、`RF00-021`
