# 共通ルール参照とVS Code GUIレーン間通知の仮組み

status: scaffold
authority_effect: none
binding: SCF-B-0003
replacement_issue: 1866

同じVS CodeのClaude Code拡張とCodex拡張の既存セッション間で、実行レーン→レビュー／マージレーンへの依頼と、逆方向の指摘を届ける。
[作業契約](../../docs/governance/feature-tickets/FT-OS-REVIEWHANDOFF-001.md)、[調査](../../docs/governance/audits/source-rebaseline/rule-review-handoff-investigation-2026-09-20.md)を参照する。
親 #1864、子 #1884、導入PR #1885、再接続revision、推進 #1859、検収 #1860、置換 #1866。旧ルール参照は既存SCF-B-0002を使う。

## 経路

実行GUI → gui_mailbox send → scaffold内の通知箱 → review GUIのnative Stop hook → 明示ACK → review応答send → 実行GUIのnative Stop hook → 明示ACK。
新規CLIセッション、非公開IPC、旧memory、旧hook、旧DBは使わない。通知からmerge許可・要求承認を生成しない。

- Claude: Stopの`asyncRewake`で待受し、通知を確保したときだけ専用exit 42をwrapperでexit 2で同じセッションへ返す。
- Codex: **同期Stop**で待受し、通知があれば`decision: block`とreasonで同じスレッドを継続する。通常async hookだけではidleスレッドを起こせない。
- Claudeの待受は最長1時間、Codexの同期Stop待受は5秒、レーンleaseは既定1時間。CodexのStop待受中はGUIがhook処理中になる。中断・lease失効・wait満了後のcold idle再開は対象外で、次のGUI入力で再開・再armが必要。
- native hookが読み込まれていない状態をtransport成功と呼ばない。新hookのtrustが必要な場合は利用者がGUIで確認する。

## 接続準備

```sh
python3 -B scaffold/review-handoff/configure_gui.py
python3 -B scaffold/review-handoff/configure_gui.py --apply
```

previewは追加するhookだけを表示する。applyは利用者の`.claude/settings.json`と`.codex/hooks.json`へ本仮設のSessionStart／Stopと、Claude側のConfigChange回復hookを追加する。計5 command。
無関係な設定を保持し、書込後に再読する。**hook trust、権限、model、provider、AGENTS／CLAUDE本文は変更しない。**
Codex拡張のHooks画面で新hookを信頼し、必要なら同じsessionを再開する。Claude側もhookを読み込む。
SessionStart／Stopで観測したsessionは`status`に現れるが、自動で作業レーンにはしない。

```sh
python3 -B scaffold/review-handoff/gui_mailbox.py status
python3 -B scaffold/review-handoff/gui_mailbox.py bind --runtime codex --session CODEX_SESSION --lane execution
python3 -B scaffold/review-handoff/gui_mailbox.py bind --runtime claude --session CLAUDE_SESSION --lane review_merge
```

既存Claude GUIのsession IDがまだ分からない場合は`enroll --runtime claude --pid GUI_PROCESS_PID --lane review_merge`で、
確認済みのGUI native processのPIDと開始時刻を固定できる。そのprocess配下の次のhookだけがsessionをbindする。
別process・PID再利用ではbindしない。Codex app-serverには複数threadがあるため、Codexは`enroll`を使わず正しいthread IDでbindする。
同じruntimeの生存中レーンを別sessionで上書きできない。解除は`unbind --runtime RUNTIME --session SESSION`。

## 依頼と指摘返却

1. PRの現在のbase／content full SHAを取得する。commit済みの対象だけを使う。
2. `packet.py build`で参照digest付きパケットを作り、`local/request.json`へ保存する。両runtimeが同じcontent SHAの文書を読む。
3. 実行レーンから`send`する。宛先sessionが未登録なら拒否する。
4. hookは固定文・event ID・digest・nonceだけを表示する。`inspect --runtime RUNTIME --session SESSION --id EVENT_ID`で本文をuntrusted_dataとして読み、承認・操作許可として扱わない。受信GUIは通知のevent ID・digest・claim nonceで`ack`する。**hookが出力しただけではACK済みにしない。**
5. review側は[応答形式](response-template.json)へ指摘・未確認範囲を書き、`review_response`として逆方向へsendする。
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

## 配送状態・再開

`queued`は保存、`claimed`はhook／receiverによる確保、`acked`は受信セッションによる明示受領。意味reviewとmergeは別。
同じevent IDとpayloadの再送、および同じrequest／responseの別ID再送は重複配送しない。
未ACKのclaimを自動で再表示せず、送信側が`retry --runtime RUNTIME --session SESSION --id EVENT_ID`した場合だけ再配送する。
retry時は同じ宛先sessionを維持する。新claim nonceが発行され、古いnonceではACKできない。
期限切れ・既受領の同じrequestを再依頼する場合は、現在のSHAを確認し、新しいrequest IDとevent IDでbuild/sendする。
通知messageは期限付きで、期限切れを復活させない。レーンleaseは同じ登録済みsessionのhook activityで更新し、別sessionへの付替えは`bind`／`enroll`を要する。古い待受は新しい待受世代で無効化する。
保存はfile lockとatomic replaceで直列化する。無変更のpollでは書込み・fsyncしない。observedは各runtime最大64件・2時間で、次のhook時に整理する。
通知本文は128KiB以内。hook継続文へ相手の自由文を注入しない。これは同一OS利用者内の協調機構で、悪意ある同一UIDに対する認証ではない。

## 一時契約と検証

`packet.py`は規則・context・decision・候補参照を種別とfile bytes SHA-256で列挙し、依頼・応答のrevisionとdigestを照合する。
候補参照を指示に昇格せず、一覧だけで必読資料の全量被覆・実読を主張しない。payload digestはcanonical JSON用でGitHub配送byte digestとは別。
`gui_mailbox.py`は通知箱だけを書く。GitHub最新SHAは自動取得しないため、send／review時に各GUIが照合する。
`configure_gui.py`だけが利用者hook設定を追加・撤去する。script本体と通知stateはscaffold内。

```sh
python3 -B scaffold/review-handoff/selftest.py
python3 -B scaffold/review-handoff/gui_selftest.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
```

合成入力と別processの往復試験は実GUI受信証拠ではない。運転の確認には両GUIが返すACKを必要とする。
通知だけでは本人性、独立review、正式L11、merge admissionを証明しない。

## 撤去

`configure_gui.py --remove --apply`で今回追加したhookだけを除く。`configure_gui.py --audit`で所有参照0を確認する。
所有commandで照合するためprovider注記が増えても撤去できる。無関係な値を保持するがJSON書式は再serializeする。
Bindingのexternal-hooks参照台帳を通じ、scfctl residualsでも退役後参照・重複・参照先不在を検査する。各レーンをunbindし、残るqueued／claimedを確認する。
正式側へ役割・義務・接続・検査・否定例を移した後、#1866でcheck-replacement→retireを行う。
利用者設定からhook参照を外す前にこのworktreeやscriptを削除しない。

操作scopeと全指摘の対応は[操作記録](../../docs/governance/audits/source-rebaseline/gui-handoff-operation-scope-2026-09-20.md)を参照する。

外部参照台帳は撤去証跡として保持する。退役時は台帳をBindingの現役artifactから移し、設定残留0を確認してから本体を削除する。台帳欠落は残留0と扱わない。

## 別checkout・参照先消失時の撤去

どのcheckoutからでも `configure_gui.py --remove --apply` → `--audit` を実行できる。所有判定はcheckoutの絶対pathに依存せず、script末尾と `hook --runtime claude|codex` で照合する。
checkout自体が失われた場合は、両providerの利用者設定を開き、command内の `/scaffold/review-handoff/gui_mailbox.py hook --runtime` を持つSessionStart／Stop／ConfigChangeの該当子hookだけを削除する。無関係なhookと設定値を残す。復旧したcheckoutでauditとresidualsを実行する。
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
