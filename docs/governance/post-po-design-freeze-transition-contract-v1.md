# Post-PO Design Freeze transition contract v1 （日本語の契約見出し）

## 0. 境界

本契約はUniversal 6 decision groupと`VMAUTH-PO-01`の計7 decision unitがすべて有効な回答receiptを得た後にだけ使う設計契約である。`CHAT-AUTH-001`により7/7はactivation済みだが、本契約だけからDesign Freeze runtime transition、runtime tag、実装完了を主張しない。remote tag作成は本transaction外であり、最初のL01 recordはlocal `proposed/pending_pair` candidateに限定する。

## 1. Canonical transition bundle （日本語の契約見出し）

`PostPoDesignFreezeTransitionBundleV1`は次をcanonical JSON（UTF-8、key昇順、余分field拒否）へ正規化し、そのSHA-256を`payload_digest`とする。

| field | 拘束 |
|---|---|
| `operation_id`, `idempotency_key`, `expected_heads` | operation一意。`authority_link`、`freeze`、`progress`、`l01_candidate`の4 headをexact CASする。同一key＋同一payloadはexact replay、異payloadは拒否 |
| `universal_answer_receipts[6]` | DG-01..06 exact set。各receiptのpacket/source/answer/actor/co-authority digestがcurrent |
| `vmauth_approval_event` | `VMAUTH-PO-01` exact 1件。packet digest、actor、authority epochをbind |
| `critical_artifact`, `critical_review`, `critical_audit` | canonical pathは`design-freeze-critical-path-v1.json`、`design-freeze-critical-path-independent-review-v1.json`、`design-freeze-critical-path-source-rebound-independent-audit-v1.json`。同一source snapshotで再生成されたexact path＋SHA-256＋status。critical denominator全件と`open=0`をbind |
| `repository` | pushed `HEAD commit`、`tree`、index policy digest。live working tree、untracked、ignoredを入力にしない |
| `design_denominator` | 正本`docs/test-design/helix/fixtures/layer-ledger-pair-gate-progress-s01.manifest`からexact 19 slice／76 artifactを抽出し、authority model、layer ledger revision、task/evidence count/list/content digest/current set digestへbind |
| `expected_heads` | authority event、freeze event、progress event、L01 candidate eventのcommit直前CAS値 |
| `review_authority` | critical reviewの`review_authority`を正本とし、producerと異なるreviewer identity/model/runtime、review event/digest、`runtime_model_separated=true`をbind |
| `expires_at`, `supersedes_receipt_digest` | expiry後はcommit不可。再freezeは旧receiptを物理更新せず後継をappend |

writerは全sourceをcommit直前に再読し、7/7 active、critical `open=0`、review/audit pass、全embedded digest current、pushed HEAD/tree一致、denominator一致を同じsnapshotで確認する。1件でも欠ければincrement 0で`HIL_POST_PO_FREEZE_BUNDLE_INVALID`とする。

## 2. Freeze receipt exact preimage （日本語の契約見出し）

`DesignFreezeReceiptV1`のpreimageは`schema_version`, `receipt_id`, `operation_id`, `payload_digest`, 7 answer/approval receipt digestのsorted exact set、critical artifact/review/audit digest、critical denominator count/list/digestと`open=0`、reviewer identity、HEAD/tree/index-policy digest、design denominator count/list/digest、authority/freeze event heads、issued/expires、previous/supersedes digest、statusを含む。receipt digestはこのpreimageだけのSHA-256であり、pathや件数だけを証拠にしない。working tree bytesはpreimageから除外する。

statusは`proposed`, `current`, `stale`, `revoked`, `superseded`だけを許可する。current receiptはauthority model＋scopeにつき一件。expiry、answer/source/review/HEAD/tree/denominator driftでcurrentを維持しない。

## 3. 単一transactionとoutbox reconcile

`commitPostPoDesignFreezeTransition`は単一SQLite transaction/fence内でCASを取り、次の順でappendする。

1. authority link event（既存のsealed PO7 active event/terminalと7 receipt setを参照し、PO7再activationはwrite 0）
2. `DesignFreezeReceiptV1`
3. Design Freeze current projection （日本語の機械契約記述）
4. progress projection（freeze denominatorを固定し、実装進捗は加算しない）
5. 最初のL01 local candidate event（`proposed/pending_pair/not_frozen/not_counted`）
6. transaction outbox rowとterminal transition receipt

各step後のfaultではtransaction全体をrollbackしpartial rowを0にする。同じoperation/payloadのretryは既存terminal receiptを返す。commit outcome不明時は`reconcilePostPoDesignFreezeTransition`がoperation、payload、event chain、全projection digestを再読し、exact chainだけをterminalへ収束する。異payload、CAS loser、欠落/余剰rowはadoptしない。outboxはlocal reconciliation通知だけであり、remote tagを作らない。

CLI adapterは明示`--execute`時だけこのSQLite transactionを呼び、補助receipt/full-row exportはproject-owned
`.helix/evidence/authority/`配下のcanonical相対pathへ投影する。absolute path、traversal、symlink ancestorは
DB open/migration/commit前に拒否し、receipt/full-row exportの同一path指定も許可しない。同一pathの再試行は
同一bytesのexact replayだけを許可し、既存異bytesはevidence conflictとして拒否する。外部path、source文書、
remote serviceへ書かない。補助export失敗はDB receiptを消去せず、
同一operationのreconcile/replayで回復する。exportとcommand receiptのoperation-bound immutable bytes/path/digestは
authority commitと同じtransactionのevidence outboxへ保存する。filesystem投影はfile/parent directoryを`fsync`し、
no-follow相当のopen、path identity再検査、post-read digestを通過した後だけ別のterminal materialization receiptをappendする。
final pathへ直接writeせず、sibling tempをwrite/fsync/digest検証してからhard-link no-replace publishし、parent directoryをfsyncする。
Linuxでは保持したdirectory fdの`/proc/self/fd/<fd>/<leaf>` capabilityへmkdir、temp、publish、cleanupを拘束し、pathname parentが
assert後・publish直前に交換されても外部へwriteしない。全ancestorのdev/inoをpublish直前・直後に照合し、交換時は元directory inode側を
cleanupしてfail-closeする。capability非対応platformは既存evidenceのexact replayだけを許可し、新規publish/mkdirをfail-closeする。
full export成功後のreceipt失敗や
`ENOSPC`相当ではterminalを発行しない。terminal済みでもevidence欠落を成功扱いせず、immutable outbox bytesから修復後にだけ
replay成功とする。後発の別PO7 operation rowをreplay exportへ混入させない。

L01 eventと同時に`LocalL01TagCandidateHandoffV1`をappendする。preimageはcandidate/event/operation ID、transition payload digest、
Design Freeze receipt digest、HEAD/tree、roadmap/task/evidence denominator digest、expected candidate head、authority epoch、issued/expires、 （日本語の機械契約記述）
statusを含む。LayerFreezeTagGateはこのhandoff digestをremote compare-and-create request、annotated tag canonical payload、
`layer_tag_receipt`へexact bindし、candidate差替え、expiry、head/freeze/authority driftを増分0で拒否する。handoffはremote tag作成権限を
単独では与えず、current gate/receipt/ruleset observationを別途要求する。

canonical `layer_tag_candidate_visibility_query`は`local_candidate_state`、candidate event/handoff digest、
`remote_creation_state`、`visibility_reason`、`expires_at`、remote observation、`live_progress`、`in_progress`、
`freeze_progress`、`last_frozen_chain`、`stale_from_layer`を同時に返す。`proposed/pending_pair/not_frozen/not_counted`、
expired/cancelled、remote未作成はfreeze percentageの分子0であり、tag候補の存在を進捗へ読み替えない。

## 4. Drift state machine （日本語の契約見出し）

| 現状態 | event | atomic結果 |
|---|---|---|
| `candidate` | commit前answer/source/review/HEAD/tree/denominator drift | DB増分0。`cancelled_before_commit`は戻り値のfailure detailだけに記録し、rollback transactionへrowを残さない。critical再生成要求 |
| `current` | commit後answer revisionまたはauthority revoke | freeze=`stale`、critical=`reopened`、progress=`stale`、L01 candidate=`cancelled` |
| `current` | critical source/review digest、HEAD/tree、denominator drift | 同上。旧receipt/eventはappend-only保持 |
| `stale` | current bundle再生成＋独立review pass | 新operation/new receiptを`proposed`。旧receiptを直接currentへ戻さない |
| `current/stale` | explicit revoke | freeze=`revoked`、critical=`reopened`、projection=`stale`、未remote L01 candidate=`cancelled` |
| `stale/revoked` | replacement freeze current | 旧freeze=`superseded`、新freeze=`current` |

drift cascadeは一つの`PostPoFreezeInvalidationBundleV1`と単一transactionでappendし、freezeだけ、projectionだけ、candidateだけの部分失効を許さない。remote tagが存在しない場合はlocal candidateをcancelする。remote tag作成後は`LayerAuthorityInvalidationBundleV1`へhandoffし、remote refをdelete/force/updateせず、authority event、remote observation、layer/tag receipt、V-pair binding/receipt、progress/visibility projectionのexpected CAS headsとappend順を固定する。全件stale/revokedまたは増分0とし、旧pair/freeze creditを0へ落とす。commit outcome不明はoperation/payload/handoff/tag OID/event chainのexact一致だけをreconcileし、immutable remote refはhistorical observationとして保持する。

## 5. Failure codeと非主張

`HIL_POST_PO_FREEZE_BUNDLE_INVALID`, `HIL_POST_PO_FREEZE_CRITICAL_OPEN`, `HIL_POST_PO_FREEZE_SOURCE_DRIFT`, `HIL_POST_PO_FREEZE_CAS_CONFLICT`, `HIL_POST_PO_FREEZE_PARTIAL_WRITE`, `HIL_POST_PO_FREEZE_RECONCILE_CONFLICT`, `HIL_POST_PO_FREEZE_INVALIDATION_PARTIAL`, `HIL_L01_TAG_CANDIDATE_HANDOFF_INVALID`, `HIL_LAYER_AUTHORITY_INVALIDATION_PARTIAL`を固定する。本書は設計のみで、PO回答、runtime execution、remote tag、verified、coverage creditはいずれも0である。
