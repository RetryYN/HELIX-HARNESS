# P08 Backendのbackground job・batch・並行制御・時間に依存する処理の観察（D03 Backend）

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
binding: [SCF-B-0156](../../../bindings/SCF-B-0156.json)
素材の状態：本書の観察はすべて「未評価の候補素材」である。外部repositoryで採られていることは、HELIXでの成立を意味しない。値（閾値、既定値、色、寸法等）は持ち込まない。技術選定・採用推奨ではない。

## 調べたrepository
| repo | URL | 固定commit | ライセンス(SPDX) | archived | 取得日 | 選んだ理由 |
|---|---|---|---|---|---|---|
| riverqueue/river | https://github.com/riverqueue/river | cf809b460d496fd6d7774d5d951fa2b22add8c0e（default branch: master） | MPL-2.0 | false | 2026-10-04 | PostgreSQLをjob storeにしたGo実装。SQL（sqlc）と状態機械の図（docs/state_machine.md）が公開されており、claim、rescue、leader lease、uniqueを行単位で読める |
| oban-bg/oban | https://github.com/oban-bg/oban | bd49ee8fbcbc4cdabcc39299af4bca469aa27ad4（main） | Apache-2.0 | false | 2026-10-04 | Riverと同じくRDB上のjob queue（Elixir）。同じ問題をadvisory lock、leader peer、cronで別のやり方で解いており、比べられる。guidesに保証の限界が明記されている |
| taskforcesh/bullmq | https://github.com/taskforcesh/bullmq | 58159a33e8c1bad94d4430f1975813f90585d442（master） | MIT | false | 2026-10-04 | Redis＋Luaで実装されたqueue。RDBのtransactionを使わず、token付きlock、更新（renewal）、stalled検出、dedup、scheduler chainで同じ問題を解いている |
| quartz-scheduler/quartz | https://github.com/quartz-scheduler/quartz | 741ccc3cff96a32e4ab07d69624eaaa534624245（main） | Apache-2.0 | false | 2026-10-04 | 時刻駆動のscheduler（Java）。misfire（実行予定時刻の取りこぼし）の扱い、leaderを置かないcluster回復、job単位の非並行実行を実装しており、job queue系との対照になる |

（celery/celeryもmetadataだけ取得した。default branchはmain、固定commitは3cfe8de4352e665882f2c4e39cded26fe6c65871、SPDXはNOASSERTION、archivedはfalse。本文は読んでおらず、観察には使っていない。）

## 観察

### P08-O01 業務データと同じtransactionでの投入と完了（transactional enqueue / complete）
- 出典：river、`client.go` 行1901–1918（https://github.com/riverqueue/river/blob/cf809b460d496fd6d7774d5d951fa2b22add8c0e/client.go#L1901-L1918）、`job_complete_tx.go` 行15–33（https://github.com/riverqueue/river/blob/cf809b460d496fd6d7774d5d951fa2b22add8c0e/job_complete_tx.go#L15-L33）。信頼性ラベル：primary（公式source repository）。本文確認：済
- 何をしているか：`Client.InsertTx(ctx, tx, args, opts)` は、呼出し側が持つtransaction `tx` の上でjob行をINSERTする。`Insert` は内部で自前のtransactionを張り、同じ `validateParamsAndInsertMany` を呼ぶ（同ファイル行1884–1899）。`JobCompleteTx[TDriver](ctx, tx, job)` は、worker内で業務更新と同じ `tx` の上でjobを完了状態にする。transactionの所有者は呼出し側で、Riverは行の書込みだけを担う。
- 解いている問題と前提：doc commentによれば、snapshot visibilityにより、commit前のjobはworkerから見えず、rollbackすればjobも消える。jobが必要とするデータがjob開始時にそろっていることを狙う。job storeと業務DBが同じPostgreSQLであることが前提である。`JobCompleteTx` のcommentは、完了をcommitした後にworkerがerrorを返しても、commit済みの完了が優先されると定めている。
- 必要な入力：業務DBとjob storeが同じDB・同じ接続種別であること（driverの型パラメータ `TTx`）。完了を業務更新に含めるjobかどうかの区別。
- trade-off・失敗の仕方：job storeを業務DBと分けられない。BullMQのようにjob storeが別系統（Redis）の場合はこの保証が成立せず、投入と業務更新の間の不整合は利用側に残る（BullMQには対応するAPIを見つけていない）。
- 反例・適用しない場合：BullMQ（Redis）は構造上この方式を採れない。Quartzはjob登録を `executeInNonManagedTXLock` という自前のtransactionで行う（P08-O06）。Obanの `insert_job` は `Repo.transaction` を使い（`lib/oban/engines/basic.ex` 行73–88）、呼出し側transactionとの合成は今回読んでいない。
- 互換・非互換：P08-O02（同じDBでのclaim）、P08-O06（完了時のfencing）と組み合わさる。
- 限界：このrepoで成立していることは、HELIXで成立することを意味しない。製品固有の値は持ち込まない。

### P08-O02 `FOR UPDATE SKIP LOCKED` で取り出しと状態遷移を1文で行う（RDB queueのclaim）
- 出典：river、`riverdriver/riverpgxv5/internal/dbsqlc/river_job.sql` 行203–241（https://github.com/riverqueue/river/blob/cf809b460d496fd6d7774d5d951fa2b22add8c0e/riverdriver/riverpgxv5/internal/dbsqlc/river_job.sql#L203-L241）。oban、`lib/oban/engines/basic.ex` 行99–144（https://github.com/oban-bg/oban/blob/bd49ee8fbcbc4cdabcc39299af4bca469aa27ad4/lib/oban/engines/basic.ex#L99-L144）。quartz、`quartz/src/main/java/org/quartz/impl/jdbcjobstore/JobStoreSupport.java` 行460–480、2748–2875（https://github.com/quartz-scheduler/quartz/blob/741ccc3cff96a32e4ab07d69624eaaa534624245/quartz/src/main/java/org/quartz/impl/jdbcjobstore/JobStoreSupport.java#L2748-L2875）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - River `JobGetAvailable` は、queue・kind・`scheduled_at <= now` で絞った行を `priority, scheduled_at, id` の順に並べ、上限件数だけ `FOR UPDATE SKIP LOCKED` するCTEを置く。続く `UPDATE` で `state='running'`、`attempt+1`、`attempted_at`、`attempted_by`（上限付き配列）を設定して `RETURNING` する。
  - Oban `fetch_jobs` は、paused中や同時実行上限に達した場合は空を返す（関数節の分岐）。残りの需要（limit − 実行中件数）だけをSKIP LOCKEDで取り、`state="executing"`、`attempt` の加算、`attempted_by:[node, uuid]` を1つの `update_all` で行う。
  - Quartz `acquireNextTrigger` は、候補triggerを選んだ後、`updateTriggerStateFromOtherState(..., STATE_ACQUIRED, STATE_WAITING)` の更新件数が0なら次の候補へ進む、という条件付き遷移（compare-and-set）でreserveする。行単位のDB lock（`LOCK_TRIGGER_ACCESS`）を取るのは、設定 `acquireTriggersWithinLock` が有効な場合か、複数件を取る場合に限る。
- 解いている問題と前提：複数worker・複数nodeが同じtableからjobを奪い合うときに、同じjobを二重に取らないことと、待ち合いを起こさないことの両立。Obanのcommentは、PostgreSQLのplannerがLIMIT付きsubqueryをnested loopで実行し、LIMITを超えてUPDATEする（attemptがmax_attemptsを超えうる）事象を挙げ、CTEを「optimization fence」として使う理由を書いている。Quartzのjavadoc（行463–470）は、更新SQLの性質上、明示lockは「多くのDBで不要」と書いている。
- 必要な入力：queue名、並び順のkey（priority・予定時刻）、node識別子、node側の同時実行上限。
- trade-off・失敗の仕方：DBのplanner挙動に依存する（Obanのcomment）。Quartzは明示lockを省くかどうかを設定に委ね、DBごとの差を利用者側に残している。
- 反例・適用しない場合：BullMQはRedisのlist移動とLua scriptの原子性で取り出す（`moveToActive-11.lua`。本文は読んでいない）。
- 互換・非互換：P08-O03（状態機械）とP08-O06（完了時のfencing）が前提になる。P08-O05（lease型）とは、所有権を時間で表すか行の状態で表すかで異なる。
- 限界：件数上限・間隔などの値は持ち込まない。

### P08-O03 jobの明示的な状態機械と、時刻到来による昇格（staging）
- 出典：river、`riverdriver/riverpgxv5/internal/dbsqlc/river_job.sql` 行1–38（schema）と行559–638（`JobSchedule`）、`docs/state_machine.md` 行1–77（https://github.com/riverqueue/river/blob/cf809b460d496fd6d7774d5d951fa2b22add8c0e/docs/state_machine.md#L1-L77）。oban、`lib/oban/engines/basic.ex` 行146–166（`stage_jobs`）、`guides/recipes/reliable-scheduling.md` 行41–47、70–89（https://github.com/oban-bg/oban/blob/bd49ee8fbcbc4cdabcc39299af4bca469aa27ad4/guides/recipes/reliable-scheduling.md#L41-L89）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Riverはenum `river_job_state`（available, cancelled, completed, discarded, pending, retryable, running, scheduled）を持つ。CHECK制約 `finalized_or_finalized_at_null` で「終端状態であることと `finalized_at` が非nullであることが同値」をDB側で強制している。`docs/state_machine.md` はmermaidで遷移を定義しており、fetched・success・error・snooze・rescued・manual retry・manual cancelを含む。
  - `JobSchedule` は、`retryable`／`scheduled` のうち予定時刻が来たものを `available` に昇格させる。このとき同じ `unique_key` を持つ行を `ROW_NUMBER()` で順位付けし、既に一意性の対象状態にある行と衝突する場合は `discarded` にして、metadataに衝突理由を残す。
  - Obanの `stage_jobs` も、`scheduled`／`retryable` で予定時刻が来たものを `available` へ一括更新する。guideは、近い未来に予定したjobでも、stagerの次のtickまで実行されないことを注意している。
- 解いている問題と前提：「予定時刻」「再試行待ち」「実行中」「終端」を状態として分け、遅延実行とretryを同じ取り出し経路（P08-O02）に乗せる。stagerは周期的に動く前提である。
- 必要な入力：状態の集合と許可される遷移、終端状態の定義、手動retry・cancelをどの状態から許すか。
- trade-off・失敗の仕方：予定時刻の精度はstagerの周期で決まる（Obanのguide）。guideは、周期を短くするとDB負荷が増えるとも書いている。Riverは昇格時に一意性の衝突を検出し、後発を `discarded` にする（後発は黙って捨てられ、理由はmetadataにだけ残る）。
- 反例・適用しない場合：BullMQのstalled.mdは「stalledという状態はなく、eventだけ」と明記している（`docs/gitbook/guide/jobs/stalled.md` 行12）。状態としてではなくeventとして表す設計である。Quartzは状態をtrigger側に持つ（WAITING／ACQUIRED／BLOCKED／COMPLETE等、P08-O09・O10）。
- 互換・非互換：P08-O07（一意性）がstaging時にも効く（River）。P08-O04（rescue）は running→retryable／discarded の遷移として図に含まれる。
- 限界：状態名・状態数はこのrepo固有であり、HELIXへ持ち込まない。

### P08-O04 時間の閾値による「止まったjob」の救出（rescuer / lifeline）
- 出典：river、`internal/maintenance/job_rescuer.go` 行100–115、199–300、334–372（https://github.com/riverqueue/river/blob/cf809b460d496fd6d7774d5d951fa2b22add8c0e/internal/maintenance/job_rescuer.go#L199-L300）、`riverdriver/riverpgxv5/internal/dbsqlc/river_job.sql` 行269–276、494–521。oban、`lib/oban/lifeline.ex` 行1–17、170–185（https://github.com/oban-bg/oban/blob/bd49ee8fbcbc4cdabcc39299af4bca469aa27ad4/lib/oban/lifeline.ex#L1-L17）、`lib/oban/engines/basic.ex` 行194–214。issue：riverqueue/river#457（https://github.com/riverqueue/river/issues/457）、#1323（https://github.com/riverqueue/river/issues/1323）、PR #1234（https://github.com/riverqueue/river/pull/1234、mergeされずにclose）、oban-bg/oban#603（https://github.com/oban-bg/oban/issues/603）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - River `JobRescuer.runOnce` は、`attempted_at < stuck_horizon` の running jobをid順のcursorでbatch取得する。jobごとに次の判断をする。cancel要求済みなら `cancelled` にする。kindが未登録なら `discarded` にする。worker固有timeoutがまだ経過していなければ無視する。attemptが残っていればworkerまたはclientのretry policyで次回時刻を決めて `retryable` にし、残っていなければ `discarded` にする。
  - `JobRescueMany` は、更新時にも `state='running' AND attempted_at < stuck_horizon` を再度条件にし、metadataの `river:rescue_count` を加算する。
  - 取得queryがtimeoutし続けると、circuit breakerでbatch sizeを縮小し、process再起動まで戻さない（行107–112のcomment）。
  - Oban `Lifeline` は、leaderのときだけ `rescue_jobs` を呼ぶ。`executing` かつ `attempted_at < cut` の行を、attemptが残っていれば `available` に、尽きていれば `discarded` にする。
- 解いている問題と前提：nodeのcrash、OOM kill、graceful shutdownの時間切れで、`running`／`executing` のまま残る孤児jobの回収（Oban #603の本文）。生存確認はせず、時間だけで判断する（Obanのmoduledocに「Rescuing is purely based on time」とある）。
- 必要な入力：救出までの経過時間の基準、job種別ごとのtimeout、retry policy、救出を実行する主体（leader）。
- trade-off・失敗の仕方：
  - Obanのmoduledocは、本当に実行中のjobを遷移させ、二重実行を起こしうると明記している。
  - Riverは、leaderのworker登録にないkindを `discarded` にする（行336–340）。#457では、jobを処理しない構成のnodeがleaderになると救出が失われると報告された。登録確認を外すPR #1234は、mergeされずにcloseされている。
  - #1323は、引数のunmarshal失敗後に処理が続行し、誤ったretry判断になる不具合の報告である。固定commitでは、unmarshal失敗時はattemptが残っていればretry、尽きていればdiscardという分岐になっている（行343–356）。
- 反例・適用しない場合：BullMQは時間の閾値ではなく、lock失効と2段階のmark-sweepで判定する（P08-O05）。Quartzはnodeのcheck-in途絶で判定し、job単位の救出は `requestsRecovery` を指定したjobに限る（P08-O08）。
- 互換・非互換：P08-O06（完了時のfencing）がないと、救出後に元workerが完了を書き込む競合が残る。P08-O08（leader）に依存する。
- 限界：経過時間の閾値、batch size、breakerの段数は持ち込まない。

### P08-O05 token付きlease lockの更新（heartbeat）と、2段階のstalled検出
- 出典：bullmq、`src/commands/extendLock-2.lua` 行1–23（https://github.com/taskforcesh/bullmq/blob/58159a33e8c1bad94d4430f1975813f90585d442/src/commands/extendLock-2.lua#L1-L23）、`src/classes/lock-manager.ts` 行12–16、46–127、`src/commands/moveStalledJobsToWait-9.lua` 行44–121、`src/commands/includes/removeLock.lua` 行1–19、`src/interfaces/worker-options.ts` 行104–145、`docs/gitbook/guide/jobs/stalled.md` 行7–15。issue：taskforcesh/bullmq#2974（https://github.com/taskforcesh/bullmq/issues/2974）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - workerは取り出したjobごとにtokenを持つ。`LockManager` はtimerで、更新期限が近づいたjobをまとめて `extendJobLocks` する。
  - `extendLock` scriptは、`GET lock == token` の場合だけPX付きでSETし直し、stalled集合からjobを外す。更新に失敗したjobは `lockRenewalFailed` と `error` のeventとして通知される。
  - `moveStalledJobsToWait` は、check keyの存在で同時実行を抑止する（同じ周期内の重複実行を防ぐ）。前回markした集合のうちlockが存在しないものだけを、active listから外してwaitへ戻す。stall回数を加算し、上限を超えた非repeatable jobには失敗理由を付ける。最後に、現在のactive全件を次回の候補としてstalled集合へmarkする。
  - 完了時の `removeLock` は、tokenが一致すればlockを削除し、lockが存在しなければ -2（Missing lock）、別tokenなら -6（not owned）を返す。
- 解いている問題と前提：RDBのtransactionやrow lockを持たないKVS上で、「workerが生きて処理中である」ことを期限付きkeyで表す。stalled.mdは、crashしたworkerや無限loopのworkerがjobをactiveに留め続けることを防ぐと書く。
- 必要な入力：lockの期間、更新周期、stalled検査の周期、stall回数の上限（いずれも値は持ち込まない）。worker単位でstalled検査やlock更新を無効にするかどうか（`skipStalledCheck`、`skipLockRenewal`）。
- trade-off・失敗の仕方：
  - event loopを塞ぐCPU処理ではlockを更新できず、jobがstallとみなされる（stalled.md 行17–19、#2974のmaintainer返信）。
  - #2974では、負荷時にlock更新失敗が一定割合で起き、`Missing lock for job ... moveToFinished` が出てretryに回ると報告されている。返信で引用された旧版のcodeには、「jobを失ったことをprocess関数へ通知するTODO」がcommentとして残っていた。
  - 別系統の対策として、stalled.mdは「sandboxed processor」（別process）を挙げている。
- 反例・適用しない場合：River／ObanはDB行の状態と経過時間で判定し（P08-O04）、heartbeatを持たない。Quartzはjob単位ではなくscheduler instance単位でcheck-inする（P08-O08）。
- 互換・非互換：P08-O06のtoken照合と対になる。P08-O04の時間閾値方式とは代替関係にある。
- 限界：期間・周期・上限の値は持ち込まない。

### P08-O06 完了・失敗の書込みを「まだ自分が所有しているとき」に限るfencing
- 出典：river、`riverdriver/riverpgxv5/internal/dbsqlc/river_job.sql` 行640–719（https://github.com/riverqueue/river/blob/cf809b460d496fd6d7774d5d951fa2b22add8c0e/riverdriver/riverpgxv5/internal/dbsqlc/river_job.sql#L640-L719）。oban、`lib/oban/engines/basic.ex` 行20–21、228–249、570–575（https://github.com/oban-bg/oban/blob/bd49ee8fbcbc4cdabcc39299af4bca469aa27ad4/lib/oban/engines/basic.ex#L570-L575）。bullmq、`src/commands/includes/removeLock.lua` 行1–19。quartz、`JobStoreSupport.java` 行2748–2776、3762–3839（https://github.com/quartz-scheduler/quartz/blob/741ccc3cff96a32e4ab07d69624eaaa534624245/quartz/src/main/java/org/quartz/impl/jdbcjobstore/JobStoreSupport.java#L3790-L3839）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - River `JobSetStateIfRunningMany` は、配列入力をunnestし、`attempt`・`errors`・`finalized_at`・`scheduled_at`・`state` の各列は `river_job.state = 'running'` の行に限って更新する。ただし `metadata` の merge は running 以外の行にも適用される（UPDATEの対象条件が `river_job.state = 'running' OR job_input.metadata_do_merge` であり、行705。`metadata` の CASE は状態を条件にしない、行683–687）。cancel要求済み（metadataに `cancel_attempted_at`）の行が再試行系の状態へ遷移しようとした場合は、`cancelled` へ振り替える。更新されなかった行は現状のまま返す。今回読んだ行の範囲では、attempt番号による照合は見当たらない。
  - Oban `ack_query` は、`id`、状態が `executing`、`attempted_at` が取り出し時の値と一致することを条件にする。
  - BullMQは、lockのtoken一致を条件にする（P08-O05）。
  - Quartz `acquireNextTriggers` は、commitが例外になった場合に `TransactionValidator` で `fired_triggers` に自instanceのfireInstanceIdがあるかを再確認し、実際にはcommit済みであれば成功として扱う。`retryExecuteInNonManagedTXLock` はshutdownまで一定間隔で再試行する。
- 解いている問題と前提：rescue（P08-O04）やlock失効（P08-O05）の後に元のworkerが遅れて書き込む競合、およびcommit結果が不明なまま応答が失われる場合への対処。
- 必要な入力：所有を示す値（状態、取り出し時刻、token、fire instance id）のどれをfencingに使うか。
- trade-off・失敗の仕方：Riverのように状態だけで照合する場合、rescue後に同じjobが再び `running` になっていると、旧workerの書込みと区別する列が条件に入らない。また `metadata` の merge は状態による照合の外にあり、running でなくなった行にも書き込まれる（行683–687、705）。これは今回読んだSQLの範囲での観察であり、実害の報告は確認していない。Obanは時刻の等値を、BullMQはtokenを条件に含める。
- 反例・適用しない場合：Riverの `JobCompleteTx`（P08-O01）は業務transactionに完了を含め、commitを正とする別の経路である。
- 互換・非互換：P08-O04・O05の前提になる。
- 限界：識別子の形式は製品固有である。

### P08-O07 投入時の一意性（unique / deduplication）の表し方
- 出典：river、`insert_opts.go` 行85–240（https://github.com/riverqueue/river/blob/cf809b460d496fd6d7774d5d951fa2b22add8c0e/insert_opts.go#L85-L240）、`river_job.sql` 行12–38（`unique_key`, `unique_states`）、行559–638。oban、`lib/oban/engines/basic.ex` 行73–88、447–505、553–568（https://github.com/oban-bg/oban/blob/bd49ee8fbcbc4cdabcc39299af4bca469aa27ad4/lib/oban/engines/basic.ex#L447-L505）、`guides/learning/unique_jobs.md` 行70–133、165–177。bullmq、`src/commands/includes/deduplicateJob.lua` 行1–78、`src/commands/includes/recoverStaleDeduplicationKey.lua` 行1–28（https://github.com/taskforcesh/bullmq/blob/58159a33e8c1bad94d4430f1975813f90585d442/src/commands/includes/recoverStaleDeduplicationKey.lua#L1-L28）、`docs/gitbook/guide/jobs/deduplication.md` 行5–43、134–190。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Riverの `UniqueOpts` は、`ByArgs`（struct tagで部分指定でき、keyは整列してからhashする）、`ByPeriod`（UTC基準で区間に丸める）、`ByQueue`、`ByState`、`ExcludeKind` を「一意性の次元」として合成する。それらのhashとDBのunique制約で重複を排除する。`ByState` には外せない状態（available, pending, running, scheduled）があり、commentは、外せないのは状態機械を動かす途中で衝突を解けないためだと説明している。
  - Obanは、unique条件からquery（状態集合、期間、fields／keys）とlock keyを作り、transaction内で `pg_try_advisory_xact_lock` を試す。取れなければ投入せず、`conflict?: true` を返す。既存行があれば `replace` 指定に従って一部の列だけ更新する。guideは、DBのunique制約に依らないため競合に弱いと明記している。また、uniqueは投入時の重複防止であって同時実行の制限ではないこと、実行中のjobで `args` を置き換えても実行中の値は変わらないことを書いている。
  - BullMQは `deduplication.id` をkeyにして、TTLなし（完了・失敗まで保持するsimple mode）、TTL（throttle）、TTL＋extend＋replace（debounce）、`keepLastIfActive`（実行中は最新の次jobを1件だけ保持する）を切り替える。`recoverStaleDeduplicationKey` は、期限なしのdedup keyが指すjobがもう存在しない場合（outage等）にkeyを捨て、新しい窓を始める。
- 解いている問題と前提：同じ要求が重複して投入された場合や、周期実行の重複を、投入時に吸収する。
- 必要な入力：何を同一とみなすか（kind、引数の部分集合、queue、期間、状態集合）。衝突したとき既存を残すか置き換えるか。衝突を呼出し側へどう返すか。
- trade-off・失敗の仕方：Obanはadvisory lockを取れなかった場合も衝突として扱い（`{:error, :locked}` → `conflict?: true`）、行の存在とは別の理由で投入を見送る。guideは、`id: nil` かつ `conflict?: true` を「lock取得失敗」として区別する例を示している。BullMQは、dedup keyと実体jobの不整合（stale key）を自己修復するcodeを持つ。
- 反例・適用しない場合：Quartzはjob・triggerのkey（名前とgroup）で同一性を表し、`replaceExisting` で上書きする（`storeJob` 系、行1074–1169付近のlock指定のみ確認）。dedup窓という概念は見当たらなかった。
- 互換・非互換：P08-O03（Riverはstaging時にも一意性を再評価する）、P08-O09（周期jobはuniqueに依存する。Riverの `PeriodicJobEnqueuer` のcomment 行113–114）。P08-O10（非並行実行）とは別物であることをObanのguideが明記している。
- 限界：期間・TTLの値は持ち込まない。

### P08-O08 DBのlease行によるleader選出と、leaderを置かないcluster回復
- 出典：river、`riverdriver/riverpgxv5/internal/dbsqlc/river_leader.sql` 行1–69（https://github.com/riverqueue/river/blob/cf809b460d496fd6d7774d5d951fa2b22add8c0e/riverdriver/riverpgxv5/internal/dbsqlc/river_leader.sql#L1-L69）、`internal/leadership/elector.go` 行225–275、404–453、491–628、715–720。oban、`lib/oban/peers/database.ex` 行1–20、68–85、95–119、150–216（https://github.com/oban-bg/oban/blob/bd49ee8fbcbc4cdabcc39299af4bca469aa27ad4/lib/oban/peers/database.ex#L95-L216）。quartz、`JobStoreSupport.java` 行3314–3357、3393–3398、3400–3540（https://github.com/quartz-scheduler/quartz/blob/741ccc3cff96a32e4ab07d69624eaaa534624245/quartz/src/main/java/org/quartz/impl/jdbcjobstore/JobStoreSupport.java#L3400-L3540）。issue：quartz-scheduler/quartz#1421（https://github.com/quartz-scheduler/quartz/issues/1421）。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Riverは、1行だけ持てるUNLOGGED table `river_leader` を使う。`ON CONFLICT DO NOTHING` で選出し、`elected_at`・`leader_id` が一致し期限内の場合だけ延長する。辞任時は `pg_notify` で他nodeを起こす。localでは `leadershipTerm.trustedUntil` を、TTLから安全余裕を引いた値として、試行開始時刻を基準にmonotonic clockで計算する。延長の期限が尽きると自ら降りる。停止時は親contextのcancelを継がずに辞任を試み、失敗してもTTLが保険になる（commentに記載）。
  - Obanは `oban_peers` に、`conflict_target: :name` と「自nodeの行なら延長する」upsertで選出する。election transactionが失敗した場合は「leaseを保持しているか分からない」としてleaderを降りる（行111–113のcomment）。leaderの更新間隔は短くし、jitterで間隔を減らす方向にずらす。
  - Quartzはleaderを置かない。各instanceが `scheduler_state` にcheck-inし、`calcFailedIfAfter`（最終check-in＋max(間隔, 自分の前回からの経過)＋固定余裕）を過ぎたinstanceを失敗とみなす。失敗instanceの `fired_triggers` を走査し、ACQUIREDはWAITINGへ戻し、BLOCKEDは解放する。`requestsRecovery` のjobだけは回復用のSimpleTriggerを作って再実行する。自分のrecordが消えていれば「他instanceに回復された」とwarnを出す。
- 解いている問題と前提：maintenance（rescue、staging、cron投入）を複数nodeで重複させないこと。DBを唯一の調停点とし、node間の直接通信を要しない（Obanのmoduledoc）。
- 必要な入力：instance識別子の一意性、lease期間と更新間隔、時刻の基準（DBの `now()` かnodeの時計か）。
- trade-off・失敗の仕方：
  - Quartzは各nodeの `System.currentTimeMillis()` で失敗を判定する。#1421では、1台のVMに複数instanceを置いた構成で「still active but was recovered by another instance」が出て、DB queryが遅くなると報告された（maintainerはinstance ID設定を質問しており、未解決）。
  - Obanのguideは、開発環境で停止時にleaderを解放できず、`@reboot` jobが遅れることを注意している（`guides/learning/periodic_jobs.md` 行106–114）。
  - Riverは、local側の信頼期限をDBのTTLより短く取り、時計の差とnetwork遅延への余裕を持たせている。
- 反例・適用しない場合：BullMQは、stalled検査をcheck keyで重複抑止するだけで（P08-O05）、leaderを持たない（今回読んだ範囲）。scheduler chain（P08-O09）もleaderに依存しない。
- 互換・非互換：P08-O04・O09のRiver／Oban実装はleaderを前提にする。Quartzの回復はP08-O10のBLOCKED解放と連動する。
- 限界：TTL・間隔・余裕の値は持ち込まない。

### P08-O09 周期実行と「取りこぼし（misfire）」の扱い
- 出典：quartz、`quartz/src/main/java/org/quartz/Trigger.java` 行99–126、242–253（https://github.com/quartz-scheduler/quartz/blob/741ccc3cff96a32e4ab07d69624eaaa534624245/quartz/src/main/java/org/quartz/Trigger.java#L99-L126）、`quartz/src/main/java/org/quartz/impl/triggers/CronTriggerImpl.java` 行394–414、`JobStoreSupport.java` 行904–911、955–1000、3183–3224。river、`internal/maintenance/periodic_job_enqueuer.go` 行113–114、440–490（https://github.com/riverqueue/river/blob/cf809b460d496fd6d7774d5d951fa2b22add8c0e/internal/maintenance/periodic_job_enqueuer.go#L440-L490）。oban、`lib/oban/cron.ex` 行235–246、339–360（https://github.com/oban-bg/oban/blob/bd49ee8fbcbc4cdabcc39299af4bca469aa27ad4/lib/oban/cron.ex#L339-L360）、`guides/learning/periodic_jobs.md` 行50–51、150–162、`guides/recipes/reliable-scheduling.md` 行1–47。bullmq、`src/commands/updateJobScheduler-12.lua` 行47–114（https://github.com/taskforcesh/bullmq/blob/58159a33e8c1bad94d4430f1975813f90585d442/src/commands/updateJobScheduler-12.lua#L47-L114）、`src/classes/worker.ts` 行950–1023、`docs/gitbook/guide/job-schedulers/README.md` 行20–27。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Quartzは、trigger型ごとにmisfire指示を持つ。共通の指示はSMART_POLICY（型ごとの既定に委ねる）とIGNORE_MISFIRE_POLICY（追いつくまで連続発火する。javadocに注意書きがある）。Cronでは、FIRE_ONCE_NOW（1回だけ即時）とDO_NOTHING（次の予定時刻へ飛ばす。Calendarの除外日も考慮する）。`MisfireHandler` は、現在時刻から閾値を引いた時刻より前の予定を持つWAITING triggerを数え（double-check）、該当があるときだけtrigger lockを取って `updateAfterMisfire` を適用する。
  - Riverの `PeriodicJobEnqueuer` はleader上で動く。各周期jobの `nextRunAt` をmemoryに持ち、timerで到来分をまとめて投入する。次回時刻は、実際の現在時刻ではなく元の予定時刻から計算する（commentに記載）。周期jobは一意性付きで投入する。
  - Obanの `Cron` はleaderだけが毎分評価し、その分にcron式が一致するentryを1つのtransactionで投入する。guideは、実行時間が周期より長いと重なること、解像度が分単位であることを明記している。recipeは、初回attemptでだけ次回を投入する再帰scheduleにより「次回の予定はat-most-once、配信はat-least-once」に近づける方法を示している。
  - BullMQの `updateJobScheduler` は、scheduler hashが存在し、現在jobが `repeat:<id>:<prevMillis>` 自身である場合に限り、次の遅延jobを1件作る。既にあれば `duplicated` eventを出す。jobScheduler READMEは、次のjobは前のjobの処理開始時に作られるため、混雑時には頻度が落ちると書く。
- 解いている問題と前提：停止、leader不在、混雑のときに、予定時刻を過ぎた周期実行を「全部追いつく」「1回だけ」「飛ばす」のどれにするか。
- 必要な入力：job種別ごとの取りこぼし方針、時間帯（timezone）、重なり実行を許すか、周期の解像度。
- trade-off・失敗の仕方：
  - BullMQのworker.tsは、次回の登録に失敗するとerror eventを出すだけで、「次の繰り返しはscheduleされない」とcommentに書いている（行1012–1023）。chain方式は、1回の失敗で途切れうる。
  - Obanのcronは毎分「今が一致するか」を評価する方式で、leader不在の分を後から補う処理は今回読んだ範囲には見当たらない。
  - Riverは `nextRunAt` をmemoryに持つ（行58のcomment「set on service start」）。leaderが交代したときの取りこぼし扱いは、pilot拡張以外では確認できていない。
- 反例・適用しない場合：取りこぼしを明示的な方針（misfire instruction）として型に持つのは、4 repoのうちQuartzだけである。
- 互換・非互換：P08-O07（重複投入の防止）、P08-O08（leader）、P08-O10（重なり実行の抑止）。
- 限界：閾値・周期・解像度の値は持ち込まない。

### P08-O10 job単位の非並行実行（BLOCKED状態による直列化）
- 出典：quartz、`quartz/src/main/java/org/quartz/DisallowConcurrentExecution.java` 行27–35（https://github.com/quartz-scheduler/quartz/blob/741ccc3cff96a32e4ab07d69624eaaa534624245/quartz/src/main/java/org/quartz/DisallowConcurrentExecution.java#L27-L35）、`JobStoreSupport.java` 行2808–2830、3011–3030、3456–3527。oban、`guides/learning/unique_jobs.md` 行81–112。bullmq、`docs/gitbook/guide/jobs/deduplication.md` 行134–190。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Quartzは、annotation `@DisallowConcurrentExecution` が付いたjob（JobKey単位）について、取得batch内で同じJobKeyのtriggerを2つ取らない。発火時には、同じjobの他のtriggerを WAITING／ACQUIRED→BLOCKED、PAUSED→PAUSED_BLOCKED へ一括遷移させ、完了時やcluster回復時（P08-O08）にBLOCKEDを解放する。
  - Obanのguideは、uniqueは投入時の重複防止であり、同時実行の制限はqueueの並行数で行うと区別している。
  - BullMQの `keepLastIfActive` は、実行中は最新の1件だけを次jobとして保持し、並行実行を起こさないと説明されている（deduplication.md 行180）。
- 解いている問題と前提：同じ資源を触るjobの重なり実行（周期より長い実行など）を、実行層で防ぐ。
- 必要な入力：直列化の単位（job定義、key、queue）、待たせたjobを後で実行するか捨てるか。
- trade-off・失敗の仕方：QuartzではBLOCKEDの解放が完了処理と回復処理に依存する。回復処理（P08-O08）は、失敗instanceのfired triggerを見て解放する。
- 反例・適用しない場合：Riverには、今回読んだ範囲でjob単位の非並行実行機構は見当たらなかった（uniqueの `ByState` にrunningを含めると、投入側で重複を防ぐことになる）。Obanのguideは、並行数で制御するよう案内している。
- 互換・非互換：P08-O07とは目的が異なる（Obanのguide）。P08-O09の重なり実行への対処になる。
- 限界：直列化の単位はこのrepo固有である。

### P08-O11 retry・backoff・timeout・snoozeをworkerごとに上書きできる関数として持つ
- 出典：river、`retry_policy.go` 行10–47（https://github.com/riverqueue/river/blob/cf809b460d496fd6d7774d5d951fa2b22add8c0e/retry_policy.go#L10-L47）、`internal/maintenance/job_rescuer.go` 行358–371。oban、`lib/oban/worker.ex` 行96–103、225–262、360–412（https://github.com/oban-bg/oban/blob/bd49ee8fbcbc4cdabcc39299af4bca469aa27ad4/lib/oban/worker.ex#L225-L262）。bullmq、`docs/gitbook/patterns/timeout-jobs.md` 行1–26（https://github.com/taskforcesh/bullmq/blob/58159a33e8c1bad94d4430f1975813f90585d442/docs/gitbook/patterns/timeout-jobs.md#L1-L26）、`docs/gitbook/patterns/idempotent-jobs.md` 行1–11。信頼性ラベル：primary。本文確認：済
- 何をしているか：
  - Riverの `ClientRetryPolicy.NextRetry(job)` は、client全体の既定を与え、workerの `NextRetry` で上書きできる。rescuerもworker側を優先し、未定義ならclientの既定に戻す。既定policyのcommentは、snoozeをattemptに数えないこと、版をまたいで同じ間隔を保つためにattempt数ではなくerror数を使うことを書いている。
  - Obanのworkerは、`backoff/1`、`timeout/1`（jobの引数やattemptに応じて決められる）、`perform/1` の戻り値で `{:cancel, reason}`（retryしない）と `{:snooze, period}`（attemptを消費せず予定を延ばす）を返せる。timeoutは通常の失敗として扱われ、retryの対象になる。
  - BullMQは、jobのtimeoutを組込みで持たないと明記している（timeout-jobs.md 行3）。AbortControllerで中断し、retryさせたくない場合は `UnrecoverableError` を投げるpatternを示す。idempotent-jobs.mdは、retryに耐えるよう、jobを冪等かつ小さく保ち、必要ならflowへ分割することを勧めている。
- 解いている問題と前提：失敗が一時的か恒久的かをworkerが一番よく知っているので、判断をworkerへ委ねる。at-least-once実行（P08-O04・O05）を前提に、冪等性を利用者側の責務にしている。
- 必要な入力：恒久失敗と一時失敗の区別、最大試行回数、job種別ごとのtimeout、外部の待ち（rate limit等）をsnoozeで表すかどうか。
- trade-off・失敗の仕方：Riverのrescuerは、worker固有timeoutが未経過なら救出しない（P08-O04）。timeoutとrescueの閾値が互いに作用する。BullMQは、timeoutを利用者codeに置くため、中断できない処理はlock更新（P08-O05）でしか見えない。
- 反例・適用しない場合：Quartzは時刻駆動であり、job失敗時のretry・backoffを組込みでは持たない（今回の検索範囲では見当たらなかった）。回復は `requestsRecovery`（P08-O08）とmisfire（P08-O09）に限られる。
- 互換・非互換：P08-O04（rescue時のretry判断に使う）、P08-O03（snoozeは running→scheduled の遷移）。
- 限界：backoffの式、上限回数、timeoutの値は持ち込まない。

### P08-O12 batchの依存関係（parent／childのfan-in）を投入時に原子的に作る
- 出典：bullmq、`docs/gitbook/guide/flows/README.md` 行1–28、123（https://github.com/taskforcesh/bullmq/blob/58159a33e8c1bad94d4430f1975813f90585d442/docs/gitbook/guide/flows/README.md#L1-L28）、`docs/gitbook/guide/flows/fail-parent.md` 行5–14、60–72、`docs/gitbook/guide/flows/continue-parent.md` 行5–30、`docs/gitbook/guide/flows/ignore-dependency.md` 行1–5。信頼性ラベル：primary（公式repository内のdocs）。本文確認：済（docsのみ。Lua実装の `moveToWaitingChildren-7.lua` 等は読んでいない）
- 何をしているか：`FlowProducer.add` は、任意の深さのjob木を原子的に投入する（README 行123）。parentは、子がすべて成功するまで待機状態に留まる。子の失敗時の扱いは、子側のoptionで次から選ぶ。`failParentOnFailure`（親を失敗させ、再帰的に伝播する。失敗は親がworkerに処理されるときに遅延して確定する）、`continueParentOnFailure`（直ちに親を開始する。`removeUnprocessedChildren` で未処理の子を掃除できる）、`ignoreDependencyOnFailure`（失敗した子を依存から外す）。flowの子には、dedup・repeatを指定できない（型定義の `Omit`）。
- 解いている問題と前提：batch処理を小さな冪等jobへ分割し（idempotent-jobs.md）、結果の集約をparentに置く。
- 必要な入力：子の失敗時の方針（親を失敗させる、続行する、無視する）、未処理の子の扱い。
- trade-off・失敗の仕方：fail-parentは遅延評価であり、workerが親を処理するまで失敗状態へ遷移しない（fail-parent.md の注記）。
- 反例・適用しない場合：Riverは状態機械に `pending`（前提条件の充足待ち）を持つ（docs/state_machine.md）が、workflow本体は今回読んだ範囲に含まれていない。Obanのguidesも、workflowをPro機能として扱っており、OSS本体には見当たらなかった。
- 互換・非互換：P08-O07（flowの子ではdedupを使えない）、P08-O11（冪等性）。
- 限界：木の深さや件数の制約は持ち込まない。

## 同じ問題の解き方の比較
| 問題 | repoA のやり方 | repoB のやり方 | 違いが生じる前提 |
|---|---|---|---|
| 二重取得の防止（claim） | River／Oban：`FOR UPDATE SKIP LOCKED` と状態更新を1文で行う（O02） | Quartz：WAITING→ACQUIRED の条件付き更新。行lockは設定と件数次第（O02）。BullMQ：Redis Luaの原子性 | job storeがRDBかKVSか。DBごとのlock挙動の差を吸収するかどうか |
| 止まったjobの検出 | River／Oban：`attempted_at` からの経過時間（O04） | BullMQ：token lockの失効と2段階mark-sweep（O05）。Quartz：instanceのcheck-in途絶（O08） | heartbeatを持てるか。job単位かnode単位か |
| 遅れた書込みの排除（fencing） | Oban：`attempted_at` の一致、BullMQ：token一致（O06） | River：`state='running'` の一致（今回読んだSQLの範囲。metadataのmergeはこの照合の外）。Quartz：commit結果をfire instance idで再確認 | 所有を何で表すか（時刻、token、状態、instance id） |
| 投入時の一意性 | River：hash＋DBのunique制約＋状態集合（O07） | Oban：advisory xact lock＋検索（guideが競合に弱いと明記）。BullMQ：dedup key＋TTL・置換・stale回復 | DB制約を使えるか。窓（期間・TTL）で表すか、状態で表すか |
| maintenanceの重複防止 | River／Oban：DBのlease行でleaderを選ぶ（O08） | Quartz：leaderなし。全instanceがcheck-inして相互回復する。BullMQ：check keyによる短期の排他 | DBを調停点にできるか。nodeの時計を信頼するか |
| 周期実行の取りこぼし | Quartz：trigger型ごとのmisfire指示（追いつく／1回／飛ばす）（O09） | Oban：毎分「今一致するか」を評価。River：memory上の `nextRunAt`。BullMQ：前jobの開始時に次を1件作るchain | 時刻駆動schedulerかjob queueの付属機能か。leaderの有無 |
| 重なり実行 | Quartz：`@DisallowConcurrentExecution` でBLOCKEDにする（O10） | Oban：uniqueとは別にqueueの並行数で制御（guide）。BullMQ：`keepLastIfActive` | 直列化をjob定義に持つか、queue設定に持つか |
| timeout | River／Oban：workerの関数で定義する（O11） | BullMQ：組込みなし。利用者codeでabortする | 実行環境（BEAM process／goroutine／Node event loop）の中断手段 |

## 見つからなかったこと・gap
- 4 repoとも、実行はat-least-onceを前提にし、冪等性を利用者側の責務にしている（Obanのmoduledoc、BullMQのidempotent-jobs.md、RiverのInsertTx説明）。業務側の冪等key（外部API呼出しの重複防止）の仕組みは、どのrepoにも組込みでは見当たらなかった。
- Riverで、rescue後に同じjobが再取得されたときに旧workerの完了書込みを区別する列があるかは、`JobSetStateIfRunningMany` のSQLだけからは確認できなかった（Go側の呼出し、`jobcompleter` は読んでいない）。同SQLの `metadata` の merge は running 以外の行にも適用される（行683–687、705）ため、旧workerが送る metadata の更新が、rescue 後や終端後の行に入りうるかも、Go側を読まないと判断できない。
- River／Obanで、leader交代やleader不在の間の周期jobの取りこぼし（misfire相当）をどう扱うかは確認できなかった（Riverのpilot拡張、Oban Proは対象外）。
- global rate limit（queue横断の流量制御）は、BullMQの `rate-limiting.md` の存在を確認しただけで読んでいない。ObanのglobalLimit、workflow、強い一意性はPro機能とされ、OSS本体にない。
- 時刻の扱い：River／Obanは、SQLでDBの `now()` を使う箇所と、node側の `time.Now()`／`DateTime.utc_now()` を使う箇所が混在する（Riverのrescuerの `stuckHorizon` はnode時刻、leaderのSQLはDBの `now()` またはnarg）。時計のずれに関する設計文書は、4 repoとも見つからなかった。Quartzの `docs/` は `index.md` だけで、cluster時刻同期の文書はrepo内になかった。
- ADR形式の設計記録は、4 repoとも見当たらなかった（判断の根拠はcode comment、guides、issueにある）。

## 検索範囲と結果（読んだpath、検索した語、読んでいないもの）
- 方法：4 repoを scratchpad `oss/` 配下へ `git clone --filter=blob:none --no-checkout` し、固定commitをcheckout（core.hooksPathを無効化）。読むだけで、build・test・script・hookは実行していない。gh apiの呼出しは約25回。
- river：`riverdriver/riverpgxv5/internal/dbsqlc/river_job.sql`（1–38, 203–276, 494–719）、`river_leader.sql`（全体）、`internal/maintenance/job_rescuer.go`（100–115, 199–372）、`internal/maintenance/periodic_job_enqueuer.go`（comment全体、440–498）、`internal/leadership/elector.go`（comment全体、225–275, 715–720）、`client.go`（1884–1918）、`insert_opts.go`（85–240）、`job_complete_tx.go`（15–33）、`retry_policy.go`（comment）、`docs/state_machine.md`（全体）。issue #457、#1323、PR #1234（未merge）。読んでいないもの：`producer.go`、`internal/jobcompleter`、`internal/jobexecutor`、`internal/maintenance/queue_maintainer_leader.go` の本体、`riverpro` 系。
- oban：`lib/oban/engines/basic.ex`（20–28, 70–249, 440–578）、`lib/oban/lifeline.ex`（1–70, 120–185）、`lib/oban/peers/database.ex`（1–216）、`lib/oban/cron.ex`（26–48, 230–379）、`lib/oban/worker.ex`（見出し、225–262, 360–412）、`lib/oban/backoff.ex`（見出し）、`guides/learning/unique_jobs.md`（68–178）、`guides/learning/periodic_jobs.md`（44–60, 104–125, 150–170）、`guides/recipes/reliable-scheduling.md`（全体）。issue #603。読んでいないもの：`lib/oban/stager.ex`、`lib/oban/queues/*`（producer）、`engines/lite.ex`・`dolphin.ex`、`notifier`。
- bullmq：`src/commands/extendLock-2.lua`、`moveStalledJobsToWait-9.lua`、`updateJobScheduler-12.lua`（1–114）、`addJobScheduler-11.lua`（1–60）、`includes/deduplicateJob.lua`、`deduplicateJobWithoutReplace.lua`（前半）、`recoverStaleDeduplicationKey.lua`、`removeLock.lua`、`moveToFinished-14.lua`（errorコード部分）、`src/classes/lock-manager.ts`（全体のcommentと46–127）、`src/classes/worker.ts`（950–1025）、`src/interfaces/worker-options.ts`（100–150）、`docs/gitbook/guide/jobs/stalled.md`、`deduplication.md`、`job-schedulers/README.md`（1–30）、`patterns/timeout-jobs.md`（1–30）、`patterns/idempotent-jobs.md`、`guide/flows/README.md`（1–40）、`fail-parent.md`、`continue-parent.md`、`ignore-dependency.md`。issue #2974（#635、#2639、#3295、#3463は題名のみ）。読んでいないもの：`moveToActive-11.lua`、`retryJob-11.lua`、flow系Lua、rate limit、python・elixir・php・rust・dotnet移植、PostgreSQL backend（`postgresql.md`、`vitest.postgres*`）。
- quartz：`JobStoreSupport.java`（80–90, 460–480, 904–1000, 2740–2875, 3000–3035, 3183–3230, 3314–3540, 3762–3846）、`Trigger.java`（99–126, 242–253）、`CronTrigger.java`（定数）、`CronTriggerImpl.java`（389–414）、`SimpleTrigger.java`（定数）、`DisallowConcurrentExecution.java`、`StdRowLockSemaphore.java`（SQL定数）、`docs/index.md` の存在のみ。issue #1421。読んでいないもの：`QuartzSchedulerThread`、`RAMJobStore`、`StdJDBCDelegate` のSQL本体、`JobStoreCMT`。
- 検索した語：`SKIP LOCKED`, `FOR UPDATE`, `unique`, `advisory`, `xact_lock`, `leader`, `rescue`, `stalled`, `lock`, `misfire`, `DisallowConcurrent`, `requestsRecovery`, `timeout`, `snooze`, `clock`/`synchroniz`（quartz docs、該当なし）。GitHub issue検索：「missing lock for job」（bullmq）、「lifeline duplicate」（oban）、「rescuer」（river）、「cluster recover」（quartz）。
- 選ばなかった候補：HangfireIO/Hangfire（今回は4 repoで足りると判断して読んでいない）、celery/celery（metadataのみ。SPDXがNOASSERTIONで、本文は読んでいない）。

## BRAINの属性について未決の事項（由来の種類、scope、評価根拠、版、状態）
- 由来の種類：すべて外部OSSの固定commitから観察した記録（primary source）である。issueは失敗の報告であり、根拠としての強さはcodeやdocsと同列には扱えない。Riverの #1234 のようにmergeされなかったPRは「採られなかった案」で、その扱い（反例とするか、検討履歴とするか）は未決。
- scope：観察はjob store（RDBまたはRedis）と実行層の境界に限っている。HELIXのD03で、どの層（業務transaction、job基盤、運用）へ対応させるかは未決。
- 評価根拠：HELIXでの成功・失敗の証拠はない。外部repoでの採用を、HELIXでの妥当性の根拠にしない（HELIXBRAIN-L2-026／027の経路で扱う）。
- 版：固定commit SHAで版を表す。上流の後続commitで実装が変わりうる（例：Riverのpilot互換fallbackにはTODO commentがある）。再観察の要否は未決。
- 状態：全観察（P08-O01〜O12）は未評価の候補素材である。HELIX-BRAINへの登録・採否・選定は行っていない。
