# 共通ルール参照とVS Code GUIレーン間通知の仮組み

status: scaffold
authority_effect: none
binding: SCF-B-0003
replacement_issue: 1866

同じVS CodeのClaude Code拡張とCodex拡張の既存セッション間で、PRの作成側→独立review側への依頼と、逆方向の指摘を届ける。向きはレーンではなくPRごとの作成側・review側で決めるため、review_merge laneが作成したPRでも同じ経路を使う。
あわせて、ClaudeまたはCodexから作業側のDevin・Antigravityへ作業依頼を届け、作業結果（提案のcommit）を自分以外の登録済みruntimeへ届ける（省略時はClaude）。runtimeごとの役割は[2026-10-19のPO判断](../../docs/governance/decisions/four-runtime-mailbox-po-decision-2026-10-19.md)と[2026-10-20のPO判断](../../docs/governance/decisions/work-result-any-recipient-po-decision-2026-10-20.md)による。
[作業契約](../../docs/governance/feature-tickets/FT-OS-REVIEWHANDOFF-001.md)、[調査](../../docs/governance/audits/source-rebaseline/rule-review-handoff-investigation-2026-09-20.md)を参照する。
親 #1864、子 #1884、導入PR #1885、再接続revision、推進 #1859、検収 #1860、置換 #1866。旧ルール参照は既存SCF-B-0002を使う。

## 経路

実行GUI → gui_mailbox send → scaffold内の通知箱 → review GUIのnative Stop hook → 明示ACK → review応答send → 実行GUIのnative Stop hook → 明示ACK。
新規CLIセッション、非公開IPC、旧memory、旧hook、旧DBは使わない。通知からmerge許可・要求承認を生成しない。

- Claude: Stopの`asyncRewake`で待受し、通知を確保したときだけ専用exit 42をwrapperでexit 2で同じセッションへ返す。
- Codex: **同期Stop**で待受し、通知があれば`decision: block`とreasonで同じスレッドを継続する。通常async hookだけではidleスレッドを起こせない。
- Devin: Codexと同じく**同期Stop**（5秒）で待受し、通知があれば`decision: block`とreasonで続ける。hook入力に`cwd`が無いため、Devinが設定する`DEVIN_PROJECT_DIR`で同じrepositoryかを確かめる。
- Antigravity: **同期Stop**（5秒）で待受し、通知があれば`decision: continue`とreasonで続ける（reasonはsystem messageとして入る）。hook入力のsessionは`conversationId`、作業directoryは`workspacePaths`（1件の場合だけ使う）で、event名が入力に無いため設定側が`--event`で渡す。
- DevinとAntigravityにも、停止した後に通知で起こす公開の手段は無い。Codexと同じく、作業を待つ間はターンを終えずに`receive --wait 600`で待つ。
- Claudeの待受は最長1時間、Codexの同期Stop待受は5秒、レーンleaseは既定1時間。CodexのStop待受中はGUIがhook処理中になる。中断・lease失効・wait満了後のcold idle再開は対象外で、次のGUI入力で再開・再armが必要。
- native hookが読み込まれていない状態をtransport成功と呼ばない。新hookのtrustが必要な場合は利用者がGUIで確認する。

## 接続準備

```sh
python3 -B scaffold/review-handoff/configure_gui.py
python3 -B scaffold/review-handoff/configure_gui.py --apply
```

previewは追加するhookと、Claude／Codex instructionの同期対象を表示する。applyは利用者の`.claude/settings.json`と`.codex/hooks.json`へ本仮設のSessionStart／Stopと、Claude側のConfigChange回復hookを追加する。計5 command。
同じapplyで、Devinの`~/.config/devin/config.json`の`hooks`と、Antigravityの`~/.gemini/config/hooks.json`のhook名`helix-gui-mailbox`へ、SessionStart／Stopを各2 command追加する。Antigravityの他のhook名（`helix_guard`等）は保持する。
DevinはClaudeの`~/.claude/settings.json`等も読み込み、Claude用のhookとinstructionを自分のセッションで重ねて動かす。このためapplyはDevin設定の`read_config_from.claude`を`false`にする。Devinは各repositoryの`AGENTS.md`を読むため、HELIXの規則はそこから読む。撤去時はこの値を利用者の設定として残す。
DevinとAntigravityの利用者instructionへのHELIX管理区間の同期は行わない。両runtimeはrepositoryの`AGENTS.md`を読む。
同時に[HELIX管理ローダ](claude-current-loader.md)を`~/.claude/CLAUDE.md`と`~/.codex/AGENTS.md`のmarker区間へ同期する。marker外の利用者本文と、無関係な設定を保持し、書込後に再読する。**hook trust、権限、model、provider、marker外のinstructionは変更しない。**
4つのconsumer fileは書込前に全内容を検証し、途中失敗時は変更済みfileを元bytesへ戻す。rollback中に別更新を検出した場合は上書きせずエラーにする。
これによりHELIXの参照先とreview／merge時の照合手順を同じsourceから再現できる。sourceは旧設定のcopyではなく、現行のauthority境界を記述した仮設projectionである。個別PRの操作はrepositoryの現行project rulesとmerge admissionで判断し、通知や本ローダから要求承認・Issue closeを生成しない。
sourceはrevision digestで固定し、個別許可の成立宣言を含む変更を同期前と`residuals`で拒否する。source改訂時はコードと外部参照台帳のdigestも同じreview対象にする。
Codex拡張のHooks画面で新hookを信頼し、必要なら同じsessionを再開する。Claude側もhookを読み込む。
SessionStart／Stopで観測したsessionは`status`に現れるが、自動で作業レーンにはしない。レーンの割当と運転の決まりは[GitHub上流運用モデル](../../docs/governance/github-upstream-operating-model.md)の「GUIレーンの運転と通知」に従う。

```sh
python3 -B scaffold/review-handoff/gui_mailbox.py status
python3 -B scaffold/review-handoff/gui_mailbox.py bind --runtime codex --session CODEX_SESSION --lane execution
python3 -B scaffold/review-handoff/gui_mailbox.py bind --runtime claude --session CLAUDE_SESSION --lane review_merge
python3 -B scaffold/review-handoff/gui_mailbox.py bind --runtime devin --session DEVIN_SESSION --lane worker
python3 -B scaffold/review-handoff/gui_mailbox.py bind --runtime antigravity --session ANTIGRAVITY_CONVERSATION --lane worker
```

ClaudeとCodexは`execution`か`review_merge`に就き、同じ役割を同時に二つのruntimeへ割り当てない。DevinとAntigravityは`worker`だけに就き、並んで持てる。

既存Claude GUIのsession IDがまだ分からない場合は`enroll --runtime claude --pid GUI_PROCESS_PID --lane review_merge`で、
確認済みのGUI native processのPIDと開始時刻を固定できる。そのprocess配下の次のhookだけがsessionをbindする。
別process・PID再利用ではbindしない。Codex app-serverには複数threadがあるため、Codexは`enroll`を使わず正しいthread IDでbindする。
同じruntimeの生存中レーンを別sessionで上書きできない。解除は`unbind --runtime RUNTIME --session SESSION`。

## 依頼と指摘返却

1. PRの現在のbase／content full SHAを取得する。commit済みの対象だけを使う。
2. `packet.py build`で参照digest付きパケットを作り、`local/request.json`へ保存する。両runtimeが同じcontent SHAの文書を読む。
3. 作成側（packetの`author`）から`send`する。宛先runtimeのレーンが未登録なら拒否する。宛先leaseが切れていても登録済みsessionへ積み、そのsessionの次のhook activityでleaseが戻ったときに受け取る。`send`の出力`receiver_lease_active`がfalseの場合、受け取りは宛先GUIの次の動作を待つ。
4. hookは固定文・event ID・digest・nonceだけを表示する。`inspect --runtime RUNTIME --session SESSION --id EVENT_ID`で本文をuntrusted_dataとして読み、承認・操作許可として扱わない。受信GUIは通知のevent ID・digest・claim nonceで`ack`する。**hookが出力しただけではACK済みにしない。**
5. review側（packetの`reviewer`）は[応答形式](response-template.json)へ指摘・未確認範囲を書き、`review_response`として逆方向へsendする。依頼は`author`、指摘は`reviewer`のruntimeだけが送れ、packetが両者を別runtimeに限るため、自己reviewの経路にはならない。
6. 修正でSHAが変わったら新request IDで再依頼する。受信側はPRの最新SHAを再取得してから差分を扱う。

```sh
python3 -B scaffold/review-handoff/packet.py build --base BASE_FULL_SHA --head CONTENT_FULL_SHA --pr PR_NUMBER --request-id RH-UNIQUE-ID --author codex --purpose '対象差分のreview' --scope '対象pathと論点'
python3 -B scaffold/review-handoff/gui_mailbox.py send --runtime codex --session CODEX_SESSION --id EVENT_ID --kind review_request --request scaffold/review-handoff/local/request.json --base BASE_FULL_SHA --head CONTENT_FULL_SHA
python3 -B scaffold/review-handoff/gui_mailbox.py ack --runtime claude --session CLAUDE_SESSION --id EVENT_ID --digest MESSAGE_DIGEST --nonce CLAIM_NONCE
python3 -B scaffold/review-handoff/gui_mailbox.py send --runtime claude --session CLAUDE_SESSION --id RESPONSE_EVENT_ID --kind review_response --request scaffold/review-handoff/local/request.json --response scaffold/review-handoff/local/response.json --base CURRENT_BASE_FULL_SHA --head CURRENT_CONTENT_FULL_SHA
```

コマンドは両GUIから**同じ仮設worktreeの絶対path**を使う。通知箱はその`scaffold/review-handoff/local/gui/`に一本化し、
branchを切り替えても違う通知箱へ書かない。`local/`はGit対象外。secrets・PII・credentials・生会話は入力しない。
`receive --runtime RUNTIME --session SESSION --wait 45`は、そのGUIが自分のnative toolで待つ代替経路。providerを別起動しない。

## 作業依頼と作業結果

ClaudeまたはCodex（依頼側）は、Issueに作業の範囲と完了条件を書いたうえで、作業側（Devin・Antigravity、またはもう一方のClaude／Codex）へ`work_request`を送る。記録の正本はIssueで、通知は配送である。

1. 依頼側が`packet.py build-work`で作業依頼を作る。Issue番号、base full SHA、依頼側、作業側、目的、範囲、参照digestを持つ。
2. 依頼側が`send --kind work_request`で送る。`--head`は使わない。Devinは未完了の依頼（処理中の1件と待機中を合わせて）を最大3件まで保持し、Antigravityと他の作業側は従来どおり1件まで保持する。DevinはFIFOで1件ずつ受け取り、先頭の作業結果か取り下げが届くまで後続をclaimしない。
3. 作業側は通知を`inspect`で読み、ACKする。本文はデータであり、範囲を広げない。作業は自分用のworktreeとbranchで行い、push・PR作成はしない。
4. 作業側は結果を`scaffold-work-result.v1`で書き、`send --kind work_result --request 作業依頼 --response 結果`で送る。
   - 宛先は`--to RUNTIME`で、自分以外の登録済みruntimeの誰でも選べる。同じ結果を複数の相手へ送ってもよい。`--to`を省くと、停止中でも通知で起きるClaudeへ送る。Claude自身が作業側のときだけ、省略時は依頼側へ送る。
   - 添付する作業依頼は、実際に送られた`work_request`と全値が同じでなければならない。依頼側などを書き換えた依頼は、payload hashを計算し直しても拒否する。照合に使う送信記録は、割当中か、送信・最後の結果から24時間だけ残る。送信記録を持つ前に送られた依頼は、割当中に限り、割当とpayload hashの一致で受ける。
   - `proposal`：依頼baseを祖先に持つcommitの`result_sha`とbranch名。
   - `incomplete`／`declined`：commitなしで、理由を`summary`に書く。
   作業結果を送ると、その作業側は次の依頼を受けられる。
5. 結果を受け取ったClaude／Codexは、提案のcommitを読んで確かめ、取り込む場合は自分が作成側としてPRを作る。以降は通常のreview依頼と同じ経路で、もう一方のClaude／Codexがreviewする。
6. 作業結果を送らずに作業を終える場合は、依頼側か作業側が`release-work --worker WORKER`で取り下げる。未完了依頼が複数ある場合は、対象の`event ID`を`--id EVENT_ID`で指定する。取り下げた依頼は、まだ受け取られていなければ`cancelled`で閉じ、後から配送・ACKされない。
   - 作業結果で枠が外れるのは、現在の割当と同じ依頼payload（`payload_sha256`）への結果だけである。取り下げた依頼への遅い結果は届くが、別の割当を外さない。
   - ACKされないまま期限を過ぎた先頭依頼は、終了記録の保持期間（24時間）を待たず、次の作業依頼を送るときに外れる。ACK済みの依頼は期限では外れない。Devinの待機依頼は待機中にTTLが進まず、FIFOの先頭へ昇格した時点から元のTTLを一度だけ数える。昇格後に未ACKのまま期限を過ぎた場合は、従来どおり枠を解放する。

Devinの2件目以降をqueueへ積む切替時は、更新前receiverのwaitが残っていないことを運転側で確かめる。更新前receiverはFIFO制御を知らず後続通知をclaimし得るが、新しいACK処理は先頭以外を拒否する。その場合は先頭の結果またはrelease後に、依頼側が既存の`retry`経路で通知を再送する。既存singleton状態は`work`を先頭として読み、待機分だけを`work_queue`に保持する。

```sh
python3 -B scaffold/review-handoff/packet.py build-work --base BASE_FULL_SHA --issue ISSUE --request-id WR-UNIQUE-ID --dispatcher codex --worker devin --purpose '作業の目的' --scope '対象pathと完了条件'
python3 -B scaffold/review-handoff/gui_mailbox.py send --runtime codex --session CODEX_SESSION --id EVENT_ID --kind work_request --request scaffold/review-handoff/local/work.json --base BASE_FULL_SHA
python3 -B scaffold/review-handoff/gui_mailbox.py send --runtime devin --session DEVIN_SESSION --id RESULT_EVENT_ID --kind work_result --request scaffold/review-handoff/local/work.json --response scaffold/review-handoff/local/work-result.json --base BASE_FULL_SHA [--to codex]
python3 -B scaffold/review-handoff/gui_mailbox.py release-work --runtime codex --session CODEX_SESSION --worker devin --id EVENT_ID
```

PRの`review_request`／`review_response`は、`author`と`reviewer`がClaudeとCodexの組である場合だけ送れる。DevinとAntigravityはPRの作成側にもreview側にもならない。

## 配送状態・再開

`receive`とそれを使うhookは、待受開始時に直ちに通知箱を確認し、空の場合は最大1秒間隔で再確認する。
待受期限まで1秒未満なら残り時間だけsleepする。`--wait 0`は1回だけ確認し、sleepしない。
従来の0.25秒間隔から確認頻度を抑える応急処置で、通知の検出には次の確認までの待ち時間とJSON読取・lock待ちが加わる。
1秒以内の配送保証やCPU負荷の固定削減率を意味しない。稼働中の待受processは起動時のコードを保持するため、変更は次に同じ経路から起動した待受に適用される。
payload、lease、watcher、明示retryの規則は変更しない。通知TTLは通常どおり作成時から数え、DevinのFIFO待機依頼だけは配送可能な先頭へ昇格した時点から元のTTLを一度だけ数える。記録のライフサイクルは次節「通知のライフサイクル」に置く。

旧`archive/legacy-generation-2026-09-14/root/src/runtime/claude-memory-wake.ts:1561–1647`
（`LEGACY-ASSET-0F66E2A823A36187D315`）の待受は、世代照合・claim・timeoutと既定2秒のpollを分離していた。
既存GUIへの通知を未信頼dataとして扱う意味と世代／claimの分離を保持し、旧memory/runtimeは再利用・実行せず、現行仮設の間隔だけを1秒へ変更する。
変更理由は#3079と2026-10-16の待受負荷の実測であり、新しいauthorityや承認経路は追加しない。

`queued`は保存、`claimed`はhook／receiverによる確保、`acked`は受信セッションによる明示受領。意味reviewとmergeは別。
同じevent IDとpayloadの再送、および同じrequest／responseの別ID再送は重複配送しない。
未ACKのclaimを自動で再表示せず、送信側が`retry --runtime RUNTIME --session SESSION --id EVENT_ID`した場合だけ再配送する。
retry時は同じ宛先sessionを維持する。新claim nonceが発行され、古いnonceではACKできない。
期限切れ・既受領の同じrequestを再依頼する場合は、現在のSHAを確認し、新しいrequest IDとevent IDでbuild/sendする。
通知messageは期限付きで、期限切れを復活させない。保存値の`expired`は宛先sessionのclaim時に付くため、宛先sessionが交代した通知は`queued`のまま残る。`status`は保存値を書き換えず、期限を過ぎた未ACKの`queued`／`claimed`を`expired`と表示する。監視ではこの表示を使い、古いsession宛ての通知を処理対象にしない。レーンleaseは同じ登録済みsessionのhook activityで更新し、別sessionへの付替えは`bind`／`enroll`を要する。古い待受は新しい待受世代で無効化する。
保存はfile lockとatomic replaceで直列化する。無変更のpollでは書込み・fsyncしない。observedは各runtime最大64件・2時間で、次のhook時に整理する。
通知本文は128KiB以内。hook継続文へ相手の自由文を注入しない。これは同一OS利用者内の協調機構で、悪意ある同一UIDに対する認証ではない。

## 通知のライフサイクル

`queued` → `claimed` → `acked`、または期限切れの`expired`で終わる。終わった通知は、次に通知箱へ書き込むとき（send・claim・ACK・hook activity）に次のとおり整理する。無変更のpollでは整理せず、書込みもしない。

| 対象 | hot state（`local/gui/state.json`）での扱い | 監査記録 |
|---|---|---|
| `acked`、`expired`、`cancelled` | `messages`から本文ごと外し、`closed`へ識別子だけを残す | 外したときに1行追記する |
| 期限を過ぎた未ACKの`queued`／`claimed` | 期限から24時間は`messages`に残し、`status`で`expired`と表示する。その後に外す。DevinのFIFO待機中はTTLと24時間整理を適用せず、先頭への昇格時に元TTLを一度だけ開始する | 外したときに1行追記する |
| `closed`の記録 | 終わった時刻（ACK時刻、未ACKなら期限）から24時間で捨てる | 書き換えない |
| 未期限の`queued`／`claimed` | そのまま残す | なし |

- `closed`は、event ID、digest、内容の照合値（kind・送受信session・request・responseのcanonical SHA-256）、送受信のruntime／session、claim nonce、終わった時刻だけを持つ。保持期間中は、同じevent IDの再送、同じ内容の別ID再送、同じACKの再送を今までどおり見分ける（再送は重複配送せず、`acked`／`expired`を返す。同じevent IDの異なるpayloadは拒否する）。`inspect`は本文を外した通知を拒否する。
- 監査記録は`local/gui/closed-YYYY-MM-DD.jsonl`（終わった時刻のUTC日付、mode 0600）へのappend-only記録で、書き換え・刈込みをしない。1行に、event ID、kind、status、digest、送受信のruntime／session、request ID、PR番号、base／content SHA、作成・期限・claim・ACK・終了の時刻を持つ。依頼・応答の本文（purpose、scope、findings等）は書かない。state置換の前に追記するため、置換前に落ちた場合は次の書込で同じ行が重ねて書かれることがある（失うことはない）。追記が行の途中で失敗した場合も、次の書込はfile末尾が改行で終わっていなければ先に改行を書いて断片を独立した1行として閉じ、その後に完全な行を書く。既存の行は書き換えない。断片はJSONとして読めない行として残るので、監査記録を読む側は読めない行を飛ばす。
- 書込中に強制終了された一時file（`local/gui/state-*`）は、lock保持中の書込時に、10分以上前のものだけを消す。
- 既存の大きな`state.json`は、変更後のコードで最初に書き込んだときに同じ規則で整理される。移行用の別手順は持たない。2026-10-16の実測（live stateの複製を対象。liveは変更していない）では、8,368件・31,090,203 byteが、`messages` 0件（未期限の`queued`／`claimed`は無かった）・`closed` 499件・244,475 byteになり、監査記録27 file・8,368行（5,596,353 byte）へ全件残った。1回の読取は約0.76秒から約3ミリ秒になった。

旧`archive/legacy-generation-2026-09-14/root/src/runtime/claude-memory-wake.ts`は、1件ごとのone-shot記録の状態（38〜45行：`OFF`〜`DELIVERED`・`REVIEWED`・`TERMINAL`・`SUPERSEDED`）と、配送の識別子と時刻だけを`delivered.jsonl`へ追記する受領記録（1338〜1345行）を分けていた。終端のある状態遷移と、本文を持たない追記専用の受領記録を分ける点を保持し、旧memory/runtimeは再利用・実行しない。変更点は、終わった通知の本文をhot stateから外すことと、重複判定用の記録を24時間で捨てることである。変更理由は[#3079](https://github.com/RetryYN/HELIX-HARNESS/issues/3079)の実測（hot stateの単調増加と、それによる待受の負荷）であり、新しいauthorityや承認経路は追加しない。

## 一時契約と検証

`packet.py`は規則・context・decision・候補参照を種別とfile bytes SHA-256で列挙し、依頼・応答のrevisionとdigestを照合する。
候補参照を指示に昇格せず、一覧だけで必読資料の全量被覆・実読を主張しない。payload digestはcanonical JSON用でGitHub配送byte digestとは別。
`gui_mailbox.py`は通知箱だけを書く。GitHub最新SHAは自動取得しないため、send／review時に各GUIが照合する。
`configure_gui.py`だけが4 runtimeの利用者hook設定と、Claude／CodexのinstructionのHELIX marker区間を追加・同期・撤去する。script本体、instruction source、通知stateはscaffold内。

```sh
python3 -B scaffold/review-handoff/selftest.py
python3 -B scaffold/review-handoff/gui_selftest.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
```

合成入力と別processの往復試験は実GUI受信証拠ではない。運転の確認には両GUIが返すACKを必要とする。
通知だけでは本人性、独立review、正式L11、merge admissionを証明しない。

## 撤去

`configure_gui.py --remove --apply`で今回追加したhookとHELIX marker区間だけを除く。`configure_gui.py --audit`で所有参照0を確認する。
所有command／markerで照合するためprovider注記や利用者本文が増えても撤去できる。無関係な値を保持するがJSON書式は再serializeする。
Bindingのexternal consumer参照台帳を通じ、scfctl residualsでも退役後参照、重複、参照先不在、instruction driftを検査する。各レーンをunbindし、残るqueued／claimedを確認する。
正式側へ役割・義務・接続・検査・否定例を移した後、#1866でcheck-replacement→retireを行う。
利用者設定からhook参照を外す前にこのworktreeやscriptを削除しない。

操作scopeと全指摘の対応は[操作記録](../../docs/governance/audits/source-rebaseline/gui-handoff-operation-scope-2026-09-20.md)を参照する。

外部参照台帳は撤去証跡として保持する。退役時は台帳をBindingの現役artifactから移し、設定とinstructionの残留0を確認してから本体を削除する。台帳欠落は残留0と扱わない。

## 別checkout・参照先消失時の撤去

どのcheckoutからでも `configure_gui.py --remove --apply` → `--audit` を実行できる。hookの所有判定はcheckoutの絶対pathに依存せず、script末尾と `hook --runtime claude|codex|devin|antigravity` で照合し、instructionは固定markerで照合する。
checkout自体が失われた場合は、4 runtimeの利用者設定（`~/.claude/settings.json`、`~/.codex/hooks.json`、`~/.config/devin/config.json`、`~/.gemini/config/hooks.json`）を開き、command内の `/scaffold/review-handoff/gui_mailbox.py hook --runtime` を持つSessionStart／Stop／ConfigChangeの該当子hookと、`~/.claude/CLAUDE.md`・`~/.codex/AGENTS.md`の`HELIX:current-loader:start`から`HELIX:current-loader:end`までだけを削除する。無関係なhook、設定値、marker外本文を残す。復旧したcheckoutでauditとresidualsを実行する。
外部参照台帳はBindingのupstreamにも束縛し、退役後にartifactsから外しても欠落をエラーにする。
wrapperはhook障害の再起動連鎖を避けるため通知専用終了値以外を0にする。state破損等で無音失敗する可能性があり、queuedだけで配送成功とせずlive ACKを確認する。

## 待受消失からの回復

旧実装の起床は共有通知箱→Claudeが起動したStop asyncRewake待受→同じsession再開という方式だった。外から新しいVS Codeを開く処理ではない。
本仮組みではpath切替時に旧待受を止めた後、新待受が無い空白を作った。この状態をqueuedや登録済みleaseだけで稼働中と扱わない。
Claudeの公開ConfigChange（matcher=user_settings）を回復入口とし、同じrepo・登録済みsession・利用者settingsのpathを確認してから既存の待受へ入る。設定変更を繰り返すpollは行わない。

```sh
python3 -B scaffold/review-handoff/configure_gui.py --apply
python3 -B scaffold/review-handoff/configure_gui.py --rearm --apply
```

rearmは所有ConfigChange hookのstatusMessageだけを新しいtokenへ変更してnative eventを発火させる。Codex設定は触らない。ConfigChangeもasyncRewakeと専用終了値wrapperを使い、通知を取得した場合だけ既存Claudeを起こす。
初回登録後はprovider側の設定読込を待ってrearmする。stateのhook_eventsにConfigChangeが現れること、依頼がclaimedになり受信GUI自身がACKすることを段階別に確認する。hook_eventsは64件・2時間のlocal観測記録である。
Claudeの設定変更hookは実機で発火を観測済み。Codexのnative Stop自動受信は引き続き未確認。公開URIによるGUI開き直し、送信欄操作、別providerセッション、非公開IPCは回復経路にしない。
[Claude hooksの公開仕様](https://code.claude.com/docs/en/hooks)を参照する。

## 接続のlifecycle

PR #1885のmerge完了応答後、初回接続は契約どおり撤去され、所有hook 0件と一時worktree削除を確認した。
2026-09-20のPO指示「それで進めて」により正式化作業用に再接続し、続く「期限とかだるいことやる意味がない」により固定日時とOS bootによる接続期限を廃止した。SCF-B-0003がactiveである間は接続を維持し、利用者の停止指示、正式経路への置換、Bindingのreplacing／retired遷移、安全な通知維持ができない不具合のいずれかで撤去する。
hook commandは固定日時やboot IDを条件にせず、provider再起動後も同じconsumer参照を使う。通知messageのTTLとsession leaseは、古い依頼・古いsessionへの誤配送を防ぐため維持する。同じ登録済みsessionのhook activityではleaseを更新し、時刻ごとの手動再bindを不要にする。別sessionへの付替えは自動化しない。
hookは実行前に`scaffold/bindings/SCF-B-0003.json`を読み、`id`不一致、`active`以外、欠落、JSON破損ではfail closedで何も配送しない。これにより`replacing`／`retired`遷移を実行面の停止条件にする。設定参照の物理撤去は別途audit→remove→auditで確認する。
rearmは同じcheckout・現行commandのClaude hookが3件揃っている場合だけ許す。撤去済み接続の復活や別checkoutへの付替えは拒否し、既存ConfigChangeのstatusMessage以外を変えない。
ConfigChange+asyncRewakeの発火と配送確認、provider内部の設定変更block判断、Codex Stop自動受信は別々に扱う。内部の設定適用結果が未観測なら未検証のまま残す。

撤去時は実行側が `configure_gui.py --audit` を行い、所有参照があれば `--remove --apply` → `--audit` で0件を確認する。`scfctl residuals=0`だけを利用者設定からの撤去完了とは扱わない。
接続の継続から正式側への移管成立を生成しない。正式側へ役割・義務・consumer・oracleを移し、`scfctl check-replacement`→`retire`を通してからSCF-B-0003を撤去する。

正式化の移管課題として、通知stateのacked／expired message GCと、設定fileをatomic replaceするときの既存mode保存・復元を#1884／#1859／#1860へ残す。接続を継続する間はstate量を監視し、これらを正式実装済みとは扱わない。
