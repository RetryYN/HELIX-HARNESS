---
title: "Execution Ticketと観測接続の総合受入候補"
layer: L10
canonical_layer: L10
canonical_pair: L3
canonical_vmodel: L1-L12
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
related_issue: 1534
plan: PLAN-L3-88-execution-ticket-bench-authority
pair_artifact: docs/governance/candidates/execution-ticket-requirements.md
---

# L3要件の総合受入候補

以下90件は未実行oracleでありgreen evidenceではない。NFRの検証束縛は[trace](execution-ticket-trace.md)へ明示する。
追加の反例: 同一logical Ticketの旧revision有効leaseを残して新revisionをclaimする操作を拒否する。
実path検証を計画path文字列だけで代替する操作、未切替AssignmentへのTicket fieldの黙示追加も拒否する。

<!-- eta-source:12:start -->
## 12. L10受入条件

旧50件はHXT-ACの番号に対応させて継承する。適用scopeを修正した項目も番号を変更しない。各行は独立したpositive/negative fixtureと、実event・receiptを検査するoracleへ展開する。ドキュメント内に文字があるだけの検査で実行境界を証明しない。

### 12.1 Ticket既存受入50件

| ID | 検査内容 | 対応FR |
|---|---|---|
| HXT-AC-001 | 切替済み通常変更経路でTicketなしを拒否し、provider/toolの変更実行0回を確認。bootstrap/read-only/実験は別profileで検査 | HXT-FR-001,004 |
| HXT-AC-002 | freehand文字列だけでは変更権限を発行せず、候補化と通常admissionへ戻す | HXT-FR-002,004 |
| HXT-AC-003 | 同一確定入力のTicket compiler結果がbyte/digestとも一致する | HXT-FR-003,005 |
| HXT-AC-004 | unknown Requirement/Design/scopeから実行Ticketを推測発行しない | HXT-FR-003 |
| HXT-AC-005 | 参照PLAN/Requirementの不適合revisionがREADYまたはdispatch可にならない | HXT-FR-007,008,016 |
| HXT-AC-006 | 複数primary responsibility/behaviorをsplit_requiredへ送る | HXT-FR-006 |
| HXT-AC-007 | Ticket本文にprovider/assignee/branch/lease/progress/scoreを埋め込む入力を拒否する | HXT-FR-001,009 |
| HXT-AC-008 | AssignmentのTicket revision/digest不一致を拒否する | HXT-FR-009 |
| HXT-AC-009 | 同一Ticket revisionの通常変更Assignmentの競合claimにexactly-one winnerがある | HXT-FR-010 |
| HXT-AC-010 | 実験を名目に複数の本番merge-authoritative Assignmentを許可しない。隔離実験は別namespace | HXT-FR-010 |
| HXT-AC-011 | Ticket scope外のwrite/leaseを拒否する | HXT-FR-010 |
| HXT-AC-012 | 通常HELIX packetのTicket binding不一致でproviderを起動しない | HXT-FR-012 |
| HXT-AC-013 | Attempt receiptのTicket/Assignment binding欠落をcurrent証拠にしない | HXT-FR-013 |
| HXT-AC-014 | Attempt ledger取得不能時にretry countを0へ戻さない | HXT-FR-014 |
| HXT-AC-015 | retry上限超過をtyped Recovery/backflowへ送る | HXT-FR-014 |
| HXT-AC-016 | wrong HEADのCI/review/evidenceで通常Ticketをcloseしない | HXT-FR-015 |
| HXT-AC-017 | 移行済みIssueのclose/label変更だけでTicketがcloseしない | HXT-FR-017 |
| HXT-AC-018 | GitHub projection driftを検出し、正本を黙って書き換えずreconcileする | HXT-FR-017 |
| HXT-AC-019 | 手入力進捗やLLM完了申告をclosure/scoreの証拠にしない | HXT-FR-018 |
| HXT-AC-020 | affected source変更後は旧Ticket権限の不適合mergeを拒否。無関係更新では全件失効させない | HXT-FR-016 |
| HXT-AC-021 | scope変更で同revisionを上書きできない | HXT-FR-005,010 |
| HXT-AC-022 | dependency cycle/missing/stale completionをfail-closeする | HXT-FR-007 |
| HXT-AC-023 | split/integration/supersession lineageをreplayし、同じcurrent viewを得る | HXT-FR-007,019 |
| HXT-AC-024 | provider変更だけでは仕事のTicket digestが変化しない | HXT-FR-005,021 |
| HXT-AC-025 | secret/PII/private transcriptを通常Ticket/metricへ保存しない。必要rawはrestricted policyで扱う | HXT-FR-022 |
| HXT-AC-026 | Ticket closeだけでPLAN/Release/System Acceptanceが完了しない | HXT-FR-015,023 |
| HXT-AC-027 | 保全されたcanonical source/eventから空read-model DBを再構築する | HXT-FR-019 |
| HXT-AC-028 | normal projectionとreplay projectionが同一input/as-ofで一致する | HXT-FR-019 |
| HXT-AC-029 | legacy in-flight workを出典付きで追跡・終端でき、過去証拠を失わない | HXT-FR-025 |
| HXT-AC-030 | cutover後のTicket-required経路で新規legacy direct Assignmentを拒否する | HXT-FR-025 |
| HXT-AC-031 | 旧engine削除後にTicket要件が旧CLI surfaceの存在を要求しない | HXT-FR-025 |
| HXT-AC-032 | 同一Ticket/task snapshotをRaw/HELIX群へ束縛し、変化factorと固定条件を区別できる | HXT-FR-020 |
| HXT-AC-033 | formal/shadow Attemptから通常repoのPR merge/publish/deployを実行できない | HXT-FR-010,020 |
| HXT-AC-034 | offline/台帳不明時にTicket identityやREADYを推測しない。既存admitted workの扱いは明示policy | HXT-FR-004,008 |
| HXT-AC-035 | high-impact操作を必要なHuman/Execution/Security Authorityなしに実行しない | HXT-FR-022 |
| HXT-AC-036 | cancellation/supersession/admissionの再送が冪等で、二重副作用を起こさない | HXT-FR-004,016 |
| HXT-AC-037 | Ticket/PLANから要求正本を独自上書きできない | HXT-FR-002 |
| HXT-AC-038 | Issue ID一致だけでTicket同一性を成立させない | HXT-FR-011,017 |
| HXT-AC-039 | behavior contract一致だけでTicket同一性を成立させない | HXT-FR-011 |
| HXT-AC-040 | Assignment終了やmeasurement追補後もTicket contractは不変 | HXT-FR-005,013 |
| HXT-AC-041 | 旧Ticket revisionのclosure receiptを新revisionの完了証拠として流用しない | HXT-FR-015,016 |
| HXT-AC-042 | stale reviewer receiptを拒否する | HXT-FR-015 |
| HXT-AC-043 | worker/reviewerの独立性をidentity/session/context/provenanceで検査し、共有汚染を拒否する | HXT-FR-015,022 |
| HXT-AC-044 | GitHub pagination不完了を全数convergedとして扱わない | HXT-FR-017 |
| HXT-AC-045 | DB read model取得不能を契機に別projectionや記憶を意味authorityへ昇格しない | HXT-FR-019 |
| HXT-AC-046 | scope expansionを必要な独立review/authority receiptなしで認めない | HXT-FR-006,010 |
| HXT-AC-047 | destructive操作を普通のlow-risk作業へ隠して実行できない | HXT-FR-022 |
| HXT-AC-048 | Release配置未解決のTicketを自動Release対象にしない。ただし配置不要の診断作業は別扱い | HXT-FR-023 |
| HXT-AC-049 | Ticket compiler policy変更でaffected契約を再検証し、影響なし/変更ありを証拠付きで区別する | HXT-FR-003,016 |
| HXT-AC-050 | sourceとconsumerで同じcontract/schemaを検証し、未導入capabilityを稼働済みとしない | HXT-FR-021,025 |

### 12.2 Bench接続追加受入40件

| ID | 検査内容 | 対応FR |
|---|---|---|
| HXB-AC-001 | live consumerが全Attemptの成功/失敗/拒否/中断を取り込み、追加model invocationは0回 | HXB-FR-001 |
| HXB-AC-002 | 未割当/起動前拒否をintake母数に残し、存在しないAttemptや成功を作らない | HXB-FR-001 |
| HXB-AC-003 | 重複/順不同eventと再起動を投入し、checkpointから一度だけ集計効果を適用する | HXB-FR-002 |
| HXB-AC-004 | 同一event ID別payload・sequence gapを検出し、未修復状態をconvergedにしない | HXB-FR-002 |
| HXB-AC-005 | subject Ticketと評価作業Ticketを別refで保持し、評価終了が本線closeを変えない | HXB-FR-003 |
| HXB-AC-006 | 同じmodelでもtreatment/replicate/Attemptを区別し、resolved version不明を明示する | HXB-FR-003 |
| HXB-AC-007 | admit時点で観測obligationが存在し、将来の結果/CI/reviewを事前捏造しない | HXB-FR-004 |
| HXB-AC-008 | 本線closureと分析sinkの間に循環待ちがなく、遅着結果を追補できる | HXB-FR-004 |
| HXB-AC-009 | 既存5カテゴリ/12指標exact setを保持し、補助telemetryの追加が旧score意味を変えない | HXB-FR-005 |
| HXB-AC-010 | 同じraw receiptから分子/分母/欠測理由を再計算し、重大failureを平均で相殺しない | HXB-FR-005 |
| HXB-AC-011 | 実請求/配賦/API相当推計を分離し、未知費用を0円にしない | HXB-FR-006 |
| HXB-AC-012 | accepted change=0やbaselineなしで成功あたり費用/削減率を成功値へ変換しない | HXB-FR-006 |
| HXB-AC-013 | 後日finding/rollbackを帰属根拠付き追補へし、元closure/receiptを改ざんしない | HXB-FR-007 |
| HXB-AC-014 | 観測窓未満・未追跡・打切りを0 defectsにせず、通常closeを長期待ちにしない | HXB-FR-007 |
| HXB-AC-015 | 異なるfixture/base/protocol/scorerを同一formal cohortへ混入させない | HXB-FR-008 |
| HXB-AC-016 | 複数Ticketの事前定義cohort集計と同一Ticket比較を区別し、live相関を因果改善としない | HXB-FR-008 |
| HXB-AC-017 | no_harness群にも安全sandbox/共通evaluatorを適用し、HELIX固有task-lensは注入しない | HXB-FR-009 |
| HXB-AC-018 | profile/component変更factorを記録し、結果確認後のscorer/oracle変更で旧結果を再利用しない | HXB-FR-009 |
| HXB-AC-019 | 同一worker/modelの正当なreplicateを上位評価でき、worker identity偽装を必要としない | HXB-FR-010 |
| HXB-AC-020 | 既存worker/judge独立性と下位provenance検査を維持し、同一output複製で標本数を増やせない | HXB-FR-010 |
| HXB-AC-021 | shadow workerから本線patch/正解review/shared memory/他群cache/hidden oracleが読めない | HXB-FR-011 |
| HXB-AC-022 | shadow不適格・snapshot不可・機密対象を理由付きで除外し、選別した対象を全体代表と偽らない | HXB-FR-011 |
| HXB-AC-023 | 同じtrigger/subject/windowの再配信でMeasurementRequestが重複生成されない | HXB-FR-012 |
| HXB-AC-024 | measurement完了→再測定の無限増殖をcause/depth/dedupeで止める | HXB-FR-012 |
| HXB-AC-025 | 有限予算を予約してから追加実験を起動し、retryを含む累積上限で停止する | HXB-FR-013 |
| HXB-AC-026 | 実験backlogでも本線capacity/review在庫を奪い尽くさず、期限切れ再実行を無限catch-upしない | HXB-FR-013 |
| HXB-AC-027 | 空read modelから全measurementを再構築し、mode/version/as-ofを分けて一致する | HXB-FR-014 |
| HXB-AC-028 | 再採点は新receiptとし、旧score/input set/発行者provenanceを上書きしない | HXB-FR-014 |
| HXB-AC-029 | 鮮度/適用task/risk/profile不適合のscoreをregistryのcurrent qualificationに使わない | HXB-FR-015 |
| HXB-AC-030 | Bench単独で配車・権限を変更せず、委譲済み既存policy内では人間の毎回指示なしに評価/提案を処理する | HXB-FR-015 |
| HXB-AC-031 | 分析sink停止中もdurable journal正常なら本線継続でき、復旧後に欠損なく追い付く | HXB-FR-016 |
| HXB-AC-032 | audit/lease記録不能は影響scopeの新規操作を停止し、外部結果不明を盲目的retryしない | HXB-FR-016 |
| HXB-AC-033 | secret/PIIを通常metricへ残さず、artifact中の指示でcollector/judge policyが変わらない | HXB-FR-017 |
| HXB-AC-034 | hidden oracleがworker filesystemからアクセス不能であり、formal/shadowに本番権限がない | HXB-FR-017 |
| HXB-AC-035 | Ticket未採用の既存Bench snapshotをlegacy_subjectで計測でき、新Ticketへ偽装しない | HXB-FR-018 |
| HXB-AC-036 | consumerで未実装/停止中observerをactive表示せず、schema/policy driftを検出する | HXB-FR-018 |
| HXB-AC-037 | 長時間・consumer再起動・backlog試験でSLO/lag/replayを測り、process aliveだけで完了にしない | HXB-FR-019 |
| HXB-AC-038 | observer負荷/保存量を測り、PRごとの全履歴scanや追加LLM呼出しがないことを確認する | HXB-FR-019 |
| HXB-AC-039 | dashboardが母数/欠測/window/mode/cost確度を示し、実装完成率と測定成功率を分離する | HXB-FR-020 |
| HXB-AC-040 | 改善/無効果/劣化/inconclusiveを報告でき、Bench scoreだけでRelease qualifiedとしない | HXB-FR-020 |

### 12.3 横断E2Eシナリオ

**通常開発:** Ticket admission → Assignment → 最初のAttempt失敗 → 同scopeでretry → CI/review → closure → measurement replay。失敗・修正費用が残り、追加LLM観測は0回で、context/Ticket/HEADのbindingが一致する。

**再起動と遅延:** live consumer停止中に通常作業が進行 → outbox重複/順不同配送 → consumer再開 → cost/review遅着 → 同じevent集合から同じas-of projectionへ収束する。分析停止を口実にauditを飛ばさない。

**同一モデルA/B:** 一つのtaskと実験定義を凍結 → 同一model/effortでNo HarnessとHELIX Partial/Fullを反復 → 独立共通採点 → 反復と重複を区別した比較receipt。本番repoの変更や資格昇格は行わない。

**drift還流:** runtime/profile変更またはevidence期限切れ → 重複しないMeasurementRequest → 予算上限付き実験 → qualification candidate → 既存#861/#188 policy評価。再測定が再測定を無限生成しない。

**後日不具合:** 本線Ticketは既にclose → 後日findingと帰属証拠 → OutcomeAmendment → 該当windowのquality再集計 → 必要なら通常Recovery候補。元closureと過去scoreは保存する。

<!-- eta-source:12:end -->
