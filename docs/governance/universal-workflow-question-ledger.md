---
title: "Universal Workflow canonical question ledger"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: PO / TL
schema: universal-workflow-question-ledger.v1
source: docs/governance/universal-workflow-anchor-ledger.md
---

# Universal Workflow canonical質問台帳

## §0 pointer契約

質問は行番号ではなく、entry blob digestと次のsemantic pointer、質問value digestへbindする。
conditionalはRFC6901、Markdownはheading slug＋ordered-item ordinalを用いる。表内の
`registered-unanswered`はsource catalogの登録時状態を保持する表示であり、現在のinterview disposition正本ではない。
現在値は`docs/governance/generated/universal-workflow-question-dispositions-v1.json`、未閉鎖queueとID migrationは
`docs/governance/generated/universal-workflow-question-migration-queue-v1.json`を正とする。answeredを含む全76件は
requirement/AC/test/gate join未閉鎖のため`freeze_credit=false`である。

## §1 Conditional questions（27/27）

| ID | pointer | question | disposition |
|---|---|---|---|
| UWR-Q-C-APPROVAL-01 | `/approval/questions/0` | 誰が承認できますか | registered-unanswered |
| UWR-Q-C-APPROVAL-02 | `/approval/questions/1` | 承認者が不在の場合はどうしますか | registered-unanswered |
| UWR-Q-C-APPROVAL-03 | `/approval/questions/2` | 承認後の取消は可能ですか | registered-unanswered |
| UWR-Q-C-APPROVAL-04 | `/approval/questions/3` | 差し戻し時はどの状態へ戻しますか | registered-unanswered |
| UWR-Q-C-APPROVAL-05 | `/approval/questions/4` | 多段承認の場合、順序と省略条件は何ですか | registered-unanswered |
| UWR-Q-C-MONEY-01 | `/money/questions/0` | 通貨と税込・税抜の扱いは何ですか | registered-unanswered |
| UWR-Q-C-MONEY-02 | `/money/questions/1` | 金額によって承認経路は変わりますか | registered-unanswered |
| UWR-Q-C-MONEY-03 | `/money/questions/2` | 上限・下限・丸め規則はありますか | registered-unanswered |
| UWR-Q-C-MONEY-04 | `/money/questions/3` | 返金・取消・再請求はありますか | registered-unanswered |
| UWR-Q-C-DEADLINE-01 | `/deadline/questions/0` | 期限は固定ですか、業務日計算ですか | registered-unanswered |
| UWR-Q-C-DEADLINE-02 | `/deadline/questions/1` | 期限超過時に何を発火しますか | registered-unanswered |
| UWR-Q-C-DEADLINE-03 | `/deadline/questions/2` | 自動終了、再通知、エスカレーションのどれですか | registered-unanswered |
| UWR-Q-C-DEADLINE-04 | `/deadline/questions/3` | 延長できる権限者は誰ですか | registered-unanswered |
| UWR-Q-C-EXTERNAL-INTEGRATION-01 | `/external_integration/questions/0` | 同期ですか非同期ですか | registered-unanswered |
| UWR-Q-C-EXTERNAL-INTEGRATION-02 | `/external_integration/questions/1` | 重複実行をどう防ぎますか | registered-unanswered |
| UWR-Q-C-EXTERNAL-INTEGRATION-03 | `/external_integration/questions/2` | 失敗時の再試行回数と間隔は何ですか | registered-unanswered |
| UWR-Q-C-EXTERNAL-INTEGRATION-04 | `/external_integration/questions/3` | 部分成功を許可しますか | registered-unanswered |
| UWR-Q-C-EXTERNAL-INTEGRATION-05 | `/external_integration/questions/4` | 外部側の応答がない場合はどうしますか | registered-unanswered |
| UWR-Q-C-PERSONAL-DATA-01 | `/personal_data/questions/0` | 閲覧できる役割は誰ですか | registered-unanswered |
| UWR-Q-C-PERSONAL-DATA-02 | `/personal_data/questions/1` | マスキング対象は何ですか | registered-unanswered |
| UWR-Q-C-PERSONAL-DATA-03 | `/personal_data/questions/2` | 保存期間と削除条件は何ですか | registered-unanswered |
| UWR-Q-C-PERSONAL-DATA-04 | `/personal_data/questions/3` | 操作履歴をどの粒度で残しますか | registered-unanswered |
| UWR-Q-C-AI-DECISION-01 | `/ai_decision/questions/0` | AIの出力は確定処理ですか、提案ですか | registered-unanswered |
| UWR-Q-C-AI-DECISION-02 | `/ai_decision/questions/1` | 人間の承認が必要な条件は何ですか | registered-unanswered |
| UWR-Q-C-AI-DECISION-03 | `/ai_decision/questions/2` | 信頼度が低い場合の戻り先はどこですか | registered-unanswered |
| UWR-Q-C-AI-DECISION-04 | `/ai_decision/questions/3` | 根拠とモデル情報を記録しますか | registered-unanswered |
| UWR-Q-C-AI-DECISION-05 | `/ai_decision/questions/4` | 再実行時の入力・モデル・設定を固定しますか | registered-unanswered |

## §2 Base questions（24/24）

| ID | pointer | question | disposition |
|---|---|---|---|
| UWR-Q-B-001 | `業務識別/ordered-item/1` | この業務で扱う対象は何ですか | registered-unanswered |
| UWR-Q-B-002 | `業務識別/ordered-item/2` | 誰が関与しますか | registered-unanswered |
| UWR-Q-B-003 | `業務識別/ordered-item/3` | 何をきっかけに開始しますか | registered-unanswered |
| UWR-Q-B-004 | `状態/ordered-item/4` | 開始時点の状態は何ですか | registered-unanswered |
| UWR-Q-B-005 | `状態/ordered-item/5` | 途中で取り得る状態は何ですか | registered-unanswered |
| UWR-Q-B-006 | `状態/ordered-item/6` | 待機・保留・失敗を別状態として扱いますか | registered-unanswered |
| UWR-Q-B-007 | `分岐/ordered-item/7` | どんな場合に対応が変わりますか | registered-unanswered |
| UWR-Q-B-008 | `分岐/ordered-item/8` | 次に進めない条件は何ですか | registered-unanswered |
| UWR-Q-B-009 | `分岐/ordered-item/9` | 誰の判断や権限で分岐しますか | registered-unanswered |
| UWR-Q-B-010 | `処理/ordered-item/10` | 各分岐で何を実行しますか | registered-unanswered |
| UWR-Q-B-011 | `処理/ordered-item/11` | 実行時に必要なデータは何ですか | registered-unanswered |
| UWR-Q-B-012 | `処理/ordered-item/12` | 処理後に何を更新しますか | registered-unanswered |
| UWR-Q-B-013 | `ループ/ordered-item/13` | やり直しになるのはどんな場合ですか | registered-unanswered |
| UWR-Q-B-014 | `ループ/ordered-item/14` | どこへ戻りますか | registered-unanswered |
| UWR-Q-B-015 | `ループ/ordered-item/15` | 何回まで繰り返しますか | registered-unanswered |
| UWR-Q-B-016 | `ループ/ordered-item/16` | ループを止める条件は何ですか | registered-unanswered |
| UWR-Q-B-017 | `終端/ordered-item/17` | 正常終了の条件は何ですか | registered-unanswered |
| UWR-Q-B-018 | `終端/ordered-item/18` | 取消終了はありますか | registered-unanswered |
| UWR-Q-B-019 | `終端/ordered-item/19` | 失敗終了や期限切れ終了はありますか | registered-unanswered |
| UWR-Q-B-020 | `終端/ordered-item/20` | 終了後に発火する処理は何ですか | registered-unanswered |
| UWR-Q-B-021 | `例外・監査/ordered-item/21` | システム障害時はどうしますか | registered-unanswered |
| UWR-Q-B-022 | `例外・監査/ordered-item/22` | 誰へ通知しますか | registered-unanswered |
| UWR-Q-B-023 | `例外・監査/ordered-item/23` | 誰が、いつ、何をしたかをどこまで記録しますか | registered-unanswered |
| UWR-Q-B-024 | `例外・監査/ordered-item/24` | 未定義ケースを誰が判断しますか | registered-unanswered |

## §3 Runtime orchestration questions（25/25）

| ID | pointer | question | disposition |
|---|---|---|---|
| UWR-Q-R-001 | `スイッチング/ordered-item/1` | どの時点で実行候補を切り替えますか | registered-unanswered |
| UWR-Q-R-002 | `スイッチング/ordered-item/2` | 候補には何がありますか | registered-unanswered |
| UWR-Q-R-003 | `スイッチング/ordered-item/3` | 各候補を有効・無効にする条件は何ですか | registered-unanswered |
| UWR-Q-R-004 | `スイッチング/ordered-item/4` | 候補が複数有効な場合、何を優先しますか | registered-unanswered |
| UWR-Q-R-005 | `スイッチング/ordered-item/5` | どの候補も選べない場合の代替先は何ですか | registered-unanswered |
| UWR-Q-R-006 | `スイッチング/ordered-item/6` | 再判定を行うきっかけは何ですか | registered-unanswered |
| UWR-Q-R-007 | `ルーティング/ordered-item/7` | 対象をどこへ送りますか | registered-unanswered |
| UWR-Q-R-008 | `ルーティング/ordered-item/8` | 人、人間チーム、AI、システム、外部サービスのどれですか | registered-unanswered |
| UWR-Q-R-009 | `ルーティング/ordered-item/9` | 受け入れ側に必要な能力・権限・空き容量は何ですか | registered-unanswered |
| UWR-Q-R-010 | `ルーティング/ordered-item/10` | 混雑時の代替経路は何ですか | registered-unanswered |
| UWR-Q-R-011 | `ルーティング/ordered-item/11` | 配送不能時のデッドレター先は何ですか | registered-unanswered |
| UWR-Q-R-012 | `ルーティング/ordered-item/12` | 同じ対象を複数経路へ送ることはありますか | registered-unanswered |
| UWR-Q-R-013 | `リソース/ordered-item/13` | 制約になる資源は何ですか | registered-unanswered |
| UWR-Q-R-014 | `リソース/ordered-item/14` | 人数、同時実行数、予算、トークン、API枠、時間の上限は何ですか | registered-unanswered |
| UWR-Q-R-015 | `リソース/ordered-item/15` | 各資源が持つ能力差は何ですか | registered-unanswered |
| UWR-Q-R-016 | `リソース/ordered-item/16` | 資源はいつ回復・補充されますか | registered-unanswered |
| UWR-Q-R-017 | `リソース/ordered-item/17` | 1タスク当たりの想定コストと時間は何ですか | registered-unanswered |
| UWR-Q-R-018 | `配分/ordered-item/18` | 何を最適化しますか | registered-unanswered |
| UWR-Q-R-019 | `配分/ordered-item/19` | 品質、速度、コスト、成功率の優先順位は何ですか | registered-unanswered |
| UWR-Q-R-020 | `配分/ordered-item/20` | 締切が競合した場合の優先規則は何ですか | registered-unanswered |
| UWR-Q-R-021 | `配分/ordered-item/21` | 高優先タスクが来た場合、実行中タスクを中断できますか | registered-unanswered |
| UWR-Q-R-022 | `配分/ordered-item/22` | 公平性や特定担当への偏りをどう防ぎますか | registered-unanswered |
| UWR-Q-R-023 | `配分/ordered-item/23` | どの条件で再配分しますか | registered-unanswered |
| UWR-Q-R-024 | `配分/ordered-item/24` | 資源不足時に品質・速度・件数のどれを落としますか | registered-unanswered |
| UWR-Q-R-025 | `配分/ordered-item/25` | 完全に処理不能な場合、誰へエスカレーションしますか | registered-unanswered |

## §4 closure

| metric | count | verdict |
|---|---:|---|
| canonical questions | 76/76 | PASS |
| stable ID unique | 76/76 | PASS |
| exact normalized duplicate | 0 | PASS |
| answered / N/A / deferred / unresolved / rejected | 12 / 0 / 40 / 24 / 0 | OPEN |
| source blob/value digest binding | 76/76 | PASS（answer authorityとは別） |
| requirement/AC/test edge | 0/76 | FAIL |

disposition artifactは`docs/governance/generated/universal-workflow-question-dispositions-v1.json`である。answered 12も
requirement/AC/test/gate exact joinが未閉鎖のため`freeze_credit=false`を維持する。deferred 40はtarget authority receipt pending、
unresolved 24は具体値・authority不足であり、推測回答や一括N/Aを許可しない。conditional source IDのunderscore/hyphen drift 14件は
silent rewriteせずmigration/alias receiptを要求する。

## §5 Question ID migrationとinterview queue

machine正本は`docs/governance/generated/universal-workflow-question-migration-queue-v1.json`
（SHA-256 `7259788121ef37795acaaf75144976c70bc04f90e13ce4d4e3847c870b6df524`）である。

| metric | count / state | freeze verdict |
|---|---:|---|
| underscore old ID → hyphen canonical ID | 14 → 14、exact bijection | migration未実行のためBLOCK |
| old / canonical unique | 14 / 14 | collision gate未実行のためBLOCK |
| alias policy | activation前のinput-only＋deprecation receipt | canonical outputへの旧ID漏出禁止 |
| alias expiry | `UWR-QUESTION-ID-V2-ACTIVATED`、遅くともnext major schema activation | 延長は新migration revision必須 |
| consumer impact inventory | 7群 | orphan gate未実行のためBLOCK |
| interview queue | 64 | 全件freeze blocking |
| queue priority | P0=31、P1=29、P2=4 | execution 0 |
| queue disposition | deferred=40、unresolved=24 | answered by queue 0 |
| migration / queue coverage credit | false / false | FAIL |

移行receipt `UWR-QID-MIG-R1`はmapping/source/consumer digest、target registry、dry-run、transaction、
independent review、activation eventを同一receiptへ束ねる。`HIL_UWR_QID_BIJECTION`、
`HIL_UWR_QID_COLLISION`、`HIL_UWR_QID_ORPHAN`、`HIL_UWR_QID_ALIAS_EXPIRY`がすべてgreenになるまで、
旧IDを削除せずcanonical化完了も主張しない。

queue各行は`dependencies`、`ask_when`、`required_authority`、`resume_trigger`を持つ。deferredのcandidate answerは
`candidate_not_authoritative`、unresolvedは`candidate_answer=null`かつ`missing_no_guess`であり、実行前に回答済みへ
昇格しない。money 4件もbudget/costがscope内なので根拠なくN/Aへ送らない。

### §5.1 既存HELIX evidenceによる回答可能性監査

64件の回答可能性監査は
`docs/governance/generated/universal-workflow-interview-answerability-audit-v1.json`をmachine正本とする。
artifact SHA-256は`747e7408fd9decb7ddc13afe700940f12e2c5af7d2ab67aee64fb65e497c22ec`である。
既存queue candidateを超える回答文は生成せず、evidence path内にsource IDまたはrepo rule markerが実在することを検査した。

| classification | count | 意味 |
|---|---:|---|
| `evidence_answered` | 37 | 既存requirements/design/repo ruleが回答方向を一意に拘束するcandidate。未activate |
| `PO_authority_required` | 22 | 既存正本だけでは選択不能。POまたは明示された高影響authorityが必要 |
| `deferred_dependency` | 5 | 数値、canonical state、後続処理のdependency closure待ち |
| `not_applicable_candidate` | 0 | 明示scope evidenceなしにN/A化しない |

total 64/64、queue/question ID重複0、fabricated answer 0、activated answer 0である。
`evidence_answered`はinterview削減候補であってauthority activationやrequirement/AC/test/gate join完了を意味しない。
全64件とも`no_guess=true`、`freeze_credit=false`であり、現在の`answered_by_queue=0`を変更しない。

### §5.2 PO decision packet（22問→6決定群）

`PO_authority_required` 22件の回答surfaceは
`docs/governance/generated/universal-workflow-po-decision-packet-v1.json`
（SHA-256 `9241f722410b369719bc3582eaf3706406bf7618dd0204fd8985e2ecea4d183c`）へexact mappingした。独立completeness reviewは
`docs/governance/generated/universal-vmodel-decision-completeness-review-v1.json`で、22/22 exact、6 group mutual exclusion、
high-impact co-authority、recommended defaultのchat非矛盾を検証し、selected/activated 0を維持する。
6群への圧縮は質問削除ではなくinterview提示単位の変換であり、元question IDとqueue IDは22/22保持する。
推奨defaultは既存chat/L1/L3/L4から導いたproposalにすぎず、選択0、answer activation 0、coverage credit 0である。
PO回答後もgroup回答を元22件の個別answer receiptへ展開し、高影響co-authority、requirement/AC/test/gate join、
独立reviewを閉じるまでfreeze blocker 22を減算しない。

### §5.3 PO7 activation machine contract

選択値は未回答のまま保持し、activation writerだけを次で固定する。`UniversalOptionReceiptV1`は
`receipt_id`、`decision_group_id`、`selected_option_id`、`packet_sha256`、`source_revision_sha256`、
`actor_id`、`actor_authority`、`authority_evidence_sha256`、`idempotency_key`、
`expected_activation_epoch`、`previous_receipt_sha256`、`answer_event_id`、`answer_message_sha256`、
`normalized_answer_sha256`、`status`を必須とする。`status`は`active | stale | revoked | superseded`だけであり、
全遷移はappend-only eventとして保存する。上書き、削除、旧authorityの再利用を禁止する。

各groupはpacket内option ID集合に対するexactly-one `selected_option_id`だけを許可する。unknown、0件、2件以上、
同group競合receiptはmachine validatorとDB CHECK/unique constraintの両方で拒否する。receiptはexact packet bytes SHA-256、
schema version、source artifactのordered set digest、authority epoch/scope、actor authority proofへbindし、write直前に再照合する。
chat回答は`answer_event_id`、raw message SHA-256、verbatim-safe normalized answer SHA-256、actor、trusted timestamp、
packet digestを保持し、prose転記だけをcustodyにしない。

6 group receiptから22 question answer receiptへの展開は`activation_transaction_id`、
`expected_answer_receipt_count=22`、`all_or_nothing=true`を持つ単一transactionとする。group receipt 6件、question receipt
22件、disposition、queue projection、terminal activation receiptを固定順でappendし、途中faultは全rollbackする。
`idempotency_key`同一かつpayload bytes同一は既存receiptを返し、異payloadは拒否する。
`expected_activation_epoch`とprevious event headのcompare-and-swapはsingle winnerだけをcommitし、CAS loserの増分は0とする。

option B/Cは各option recordに`risk_class`、`required_co_authorities`、`authority_scope`、`authority_expiry`を持つ。
co-authority receiptはoption・packet・actor・scope・expiry digestへexact bindし、不足、scope外、期限切れならactivationを
fail-closeする。group-level prose authority listだけでは代用しない。source/packet/authority drift、revokeまたはsupersede時は
旧activeを同transactionで失効し、downstream freeze blockerをreopenする。選択値0、activated 0、runtime credit 0は維持する。
