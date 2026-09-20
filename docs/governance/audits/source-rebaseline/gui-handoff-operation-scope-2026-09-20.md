# GUI通知仮組みの操作scopeと指摘対応

status: operation_scope_record
authority_effect: none
recorded_at: 2026-09-19T16:44:49.775178+00:00

## 指示の原文と解釈

本作業の会話で利用者が次の順に指示した。元メッセージの正確な送信時刻は取得できないため不明とし、上記は記録時刻だけを示す。

1. 「それを調べてイシューとして接続して、PRとして立てて仮組みでいくのはどうかい？そういう仕組みがあるだろ？」
2. 「GUI同志の通知経路で合っているよね？」
3. 「それでやってくれないとレビューやマージレーンと実行レーンで連携できないだろ。」
4. 通知先確認への回答「はい、VS Code内の両拡張」
5. 利用者共通hookの管理・撤去とscript消失時の誤再起動等の指摘を報告した後、「必要ですならしろ。」

明示対象は同じVS Codeの既存Claude Code拡張とCodex拡張。明示作用は調査、Issue／PRへの接続、仮組み、両GUI間通知、指摘の修正である。
利用者設定ファイルのpathやhook方式そのものを指定した原文はない。既存GUIへ接続するための可逆な最小参照追加・修正・撤去を実装上必要な操作と判断した。この判断を「利用者がpathを明示承認した」とは記録しない。
本記録は上流要求の承認decisionや正式runtime起動許可ではない。S0承認、Feature Ticket、reviewerの指摘から許可を生成しない。

## 仮組みの接続境界

本体・通知state・検査・外部参照台帳はscaffold内へ置く。外部の既存provider設定はconsumerとして扱い、新設SessionStart／StopとClaude ConfigChangeの参照だけを接続する（後述の修正後は計5 command）。
対象は利用者の `.claude/settings.json` と `.codex/hooks.json`。無関係な設定、trust、権限、provider、modelを変更しない。
このconsumer接続をscaffold名前空間制約の例外として一般化しない。仮artifactを設定側へ複製せず、参照台帳で残留を管理する。
初版の未管理な参照は今回いったん撤去し、古い待受世代を無効にした。
修正版だけを再接続し、存在しないscript・引数エラー・例外は再起動通知へ変換しない。
`scaffold/external-references/SCF-B-0003.json` をBinding artifactとして登録し、scfctl residualsで退役後の参照、重複、script不在を調べる。
撤去は所有commandを安定keyとして行い、providerが注記を加えても対象にする。設定全体のJSON書式は再serializeされるが無関係な値は保持する。

## レビュー指摘の処分案

| ID | 対応 | 確認範囲 |
| --- | --- | --- |
| B1 | 初版参照撤去、consumer参照台帳をBindingへ登録しscfctlの残留検査へ接続 | 設定書込みscopeの上記解釈は再review対象 |
| B2 | script内部の通知終了値42だけをshellで2へ変換。script不在・引数エラー・例外は0 | /tmp不在時を含む否定例 |
| M1 | FTを正式Feature候補だけへ限定し、必須metadataとlocal親identityを追加 | 仮組み操作は本記録とBindingへ分離 |
| M2 | 原文・対象・作用と実装判断を分離して記録、Bindingのupstreamへdigest束縛 | 元送信時刻は不明。後付けの承認時刻を作らない |
| M3 | hookには固定文と検証済みID・digest・nonceだけを表示。自由文はinspectでデータとして取得 | payload上限128KiB、同一UIDの悪意ある差込みは防げない |
| m1 | 期限切れ・既受領の同一依頼は復活させず、新request IDで送る手順を明記 | 重複抑止を維持 |
| m2 | state不変時はreplace/fsyncしない | 無更新待受の書込みなしを検査 |
| m3 | Codex enrollをコードで拒否。PID開始時刻不一致は登録しない。競合時はenrollmentを消去 | PID再利用・競合の否定例 |
| m4 | observedをruntime別64件・2時間に制限 | 次のhookで整理 |
| m5 | Codex同期Stopの既定待受を5秒へ縮小 | 実Codex Stop自動受信は未確認のまま |
| m6 | #1883の改番は相手作成側の担当として保持 | 本PRから変更しない |
| m7 | 修正版content commitに対する検証receiptを別途記録 | receipt自体のcommitを自己参照しない |
| m8 | 所有commandで子hook単位に撤去、無関係な子hookを保持、read-afterとaudit | provider注記ありの撤去試験 |
| m9 | 実在する新watcherとqueued通知を使う否定例へ修正、retry/PID/期限切れACKを追加 | 合成試験と実GUIを区別 |

## 実GUI証拠の限界

旧HEAD `e3b65cf2d3cffd2c39d10fee796bde69ab94ccf6` に対する依頼と応答は双方がACKした。
Claudeはnative Stop経由、Codexは既存GUI内のnative toolからreceiveしてACKした。Codex Stopの自動受信成功とは扱わない。
修正版は新HEADへ再依頼する。上記修正の自己検査を独立reviewの指摘解消判断へ代用しない。
merge、post-merge、Issue close、新規providerセッションや非公開IPCは今回の操作対象外。

## 再レビュー（round 2）への対応

- N1: 所有判定をscript末尾とhook引数へ変更し、別checkout・消失したworktreeの参照も監査・撤去できる。参照先が無い場合の手動撤去手順もREADMEへ追加。
- N2: reviewerが別セッションでのPO発言「今は残す」を報告したが、作成側はその原文を持たない。原文確認を依頼中で、reviewerの報告から承認を生成しない。確認中はいったん2つの利用者設定から当時の4 commandを撤去し、再接続を止めた。その後、後述のPO回答に基づく実行責務の判断で再接続した。これはcodeの撤去ではなくconsumer接続の停止である。
- N3: worktreeと通知箱を `/tmp/helix-rule-review-handoff` から `~/.helix-worktrees/rule-review-handoff` へ移動。親directoryは本人所有・他利用者書込不可を確認した。旧pathへのsymlinkや実行fallbackは置かない。
- N4: 期限切れmessageの再送をqueuedと表示せずexpiredへ遷移させる。新request IDでの再依頼手順を維持。
- N5: scaffoldの構成表にexternal-referencesを追加。residualsが実行者のhome設定を読むため環境依存であることを明記。
- N6: 外部参照台帳をBindingのupstreamへ永続束縛。退役時にartifactsから外れても台帳欠落はエラー。
- N7: hook障害が無音化される場合があることとlive ACKの必要性をREADMEへ記録。
- N8: FTにpriority_orderを追加。
- N9: GUI応答はGitHubのmerge admission証跡の代わりにしない。GitHubへ別途projectionしread-afterを記録する。
- N10: Codex native Stopの自動受信は未確認として保持する。

round 2依頼・応答も両GUIがACKした。Claude native StopとCodex GUI内のnative toolによる往復であり、Codex Stopの自動受信証拠ではない。

## PO回答による実行責務の確認（2026-09-20）

作成側が「Claude側のレビューに、あなたがhookを『今は残す』と判断したとの記載があります。そのときの指示原文を教えてください」と確認したところ、利用者は「これはClaude側の作業責務ではないから」と回答した。
回答の受領記録時刻: 2026-09-19T16:58:51.659345+00:00

別セッションの「今は残す」という原文・送信時刻は依然未確認であり、その発言を承認根拠にしない。
今回の直接回答は、hookの保持・変更・撤去を実行レーンの作業として扱う根拠とし、既に受けたGUI通知経路の仮組み・指摘修正指示の範囲で接続を回復する。
Claude側のreview指摘から保持・撤去の実行許可を生成せず、実行側が修正・検査・撤去の責任を持つ。

対象と作用は以下に限定する。

- 対象: `~/.claude/settings.json` と `~/.codex/hooks.json`。ClaudeはSessionStart／Stop／ConfigChange、CodexはSessionStart／Stopの計5 command（ConfigChange追加前は4 command）。
- 作用: 旧 `/tmp` 参照を撤去し、本人所有・他利用者書込不可の `~/.helix-worktrees/rule-review-handoff/scaffold/review-handoff/gui_mailbox.py` 参照へ交換して保持する。
- 保持条件（実行側の制約）: このGUI通知仮組みのreview・指摘往復が必要な期間だけとし、上限は2026-09-20 23:59 JST、現在のOS boot終了、PR #1885のmergeまたはcloseのうち最も早い時点とする。scfctl residualsで参照先存在・重複なしを確認し、無関係な設定・trust・権限は変更しない。
- 撤去契機（実行側の制約）: 上記保持上限、利用者の停止指示、正式経路への置換、当該worktreeの撤去、または安全な通知維持ができない不具合。実行側が所有5 commandを除去しauditで0件確認後に本体を撤去する。
- 本記録のscope: この作業で明示された既存VS Codeの両GUI間通知の可逆なconsumer接続のみ。scaffold外への一般的な仮実装許可、正式要求採否、merge・closeの許可へ拡張しない。

上記5 commandの具体pathと保持条件は作成側が限定した実装内容であり、利用者がそれらの文字列を個別指定したとは主張しない。
原文確認中に行った一時撤去の後、この限定scopeで永続pathから再接続する。再接続後のtrustは利用者のprovider側確認を尊重する。

## 起床経路の是正（利用者指摘と回復処理）

利用者から「送れるはずだが？」、続いて「旧実装に起こす方法あったんじゃないの？VSCodeを新たに立ち上げようとしたお前の方法は間違いだ。」との指摘を受けた。
作成側は公開URIで登録済みsessionを開こうとしたが、この方向を中止した。送信欄には既存draftがあり、内容を変更・送信していない。このGUI操作を通知成功として数えない。
旧 `PLAN-L7-469`、`claude-memory-wake.ts`、Stop設定をreferenceとして再読し、起床は既存のasyncRewake待受からのexit 2であったと確認した。旧コードは実行していない。
障害はpath移行時に待受を無効にして後継を登録する前に止めたことであり、外からVS Codeを開くことでは修復しない。

Claudeの公開ConfigChange hookを回復入口へ追加する方式は、作成側の実装判断である。この追加作業の根拠は先行指示5「必要ですならしろ。」であり、後の起床経路に関する発言をConfigChange指定や新しい許可として扱わない。
対象は従来と同じ2設定fileで、ClaudeにSessionStart／Stop／ConfigChange、CodexにSessionStart／Stopの計5 command。
ConfigChangeはuser_settingsに限定し、同じrepositoryと登録済みsession、settingsのexact pathを確認する。無関係な設定・trust・権限を変更しない。
rearmは所有hookの表示metadataを1回更新するだけで、設定への常時pollや新しいprovider起動は行わない。保持条件・撤去契機は前節を継承する。
native ConfigChangeの発火をlocal hook_eventsで観測した。新依頼の起床・受領ACKは別の証跡で確認し、イベント観測だけで配送成功を宣言しない。

## 原文・時刻の確認と保持上限の確定

本節は、それまで未取得だった原文と時刻をlocal session記録から確認した訂正である。modelのレビュー文に引用された内容と、利用者の回答を区別した。

- Claude側AskUserQuestion（2026-09-19T16:43:58.289Z）の該当質問: 「#1885がuser-globalに登録した /tmp 参照のhook（~/.claude/settings.json と ~/.codex/hooks.json のSessionStart/Stop）を私が撤去してよいですか？撤去するとcodex↔ClaudeのGUI通知レーンは止まります。」
- 対応回答（2026-09-19T16:44:16.787Z）: 「今は残す」。選択肢の説明は「reboot前まで残す」。これは再起動後の保持許可ではない。
- Codex側user_message「必要ですならしろ。」: 2026-09-19T16:39:47.135Z。
- 「これはClaude側の作業責務ではないから」: 2026-09-19T16:58:06.950Z。
- 「送れるはずだが？」: 2026-09-19T17:02:02.823Z。
- 「旧実装に起こす方法あったんじゃないの？VSCodeを新たに立ち上げようとしたお前の方法は間違いだ。」: 2026-09-19T17:04:55.462Z。

上記は各local sessionの入力／回答記録時刻（UTC）であり、POの端末側送信時刻とは区別する。いずれも日本時間2026-09-20。
機械的にも、hook commandを現在のboot IDと2026-09-20 23:59 JSTに束縛した。再起動後・期限後は本体を実行せず0で終了する。稼働中の待受も期限で終了する。
残った不活性な設定参照は実行側の撤去対象であり、停止を撤去完了とは扱わない。PR #1885のmerge/close連絡を受けた場合も実行側が5 commandを撤去してauditする。この作成側はmerge・closeを実行しない。

## Round 3／4指摘の処分

| ID | 処分 | 根拠・対応 |
| --- | --- | --- |
| R3-1 | 解消確認済み | ConfigChangeをcommitし最新HEADへ再依頼。round4 reviewerが稼働コードとの一致を確認 |
| R3-2 | 修正して再review | 原文・時刻を確認し、boot・具体日付・PR merge/closeの上限を追加。再起動後の実行をguardで停止 |
| R3-3 | 修正して再review | 一時撤去は過去の状態で、その後再接続したと追記 |
| R3-4 | 対応 | manifest path注入に変え、共有os.pathのmockを廃止 |
| R4-1 | 修正して再review | 上記の保持上限と実行guard、実行側の撤去責務 |
| R4-2 | 修正して再review | ConfigChangeは先行指示5に基づく作成側実装判断と明記。local入力時刻を追記 |
| R4-3 | 修正して再review | 現行対象を5 commandへ統一し手動撤去にConfigChangeを追加。過去の4 commandは経緯として明示 |
| R4-4 | 修正して再review | rearmは同じcheckout・現行commandの既存3 hookだけを許し、表示metadata以外を変更しない。撤去済み・別checkout・remove併用を拒否 |
| R4-5 | 修正して再review | R3-3と同じ修正 |
| R4-6 | 対応 | 本表へ全round3指摘の処分を記録 |
| R4-7 | 対応 | 誤path・codex runtime・別repoの拒否例を追加し、os.path mockを廃止 |
| R4-8 | 未検証を保持 | ConfigChange発火は確認済みだが、exit2後のprovider内部設定適用判断を独立に観測していない。asyncRewake併用の設定block意味論を断定しない |

## Round 5指摘の処分

round5ではR4-1〜R4-7の解消をreviewerが確認し、Blocker／Majorは0件となった。

- R5-1: 自己検査の通常経路ではEXPIRES_ATを将来へ固定し、期限後も再現可能にした。期限後に入力・stateへ触れず終了すること、待受時間が期限で短縮されることの試験を追加。期限後はconsumer接続を撤去し、自動retireや暗黙延長は行わない。延長には新たなPO判断とrevision束縛が必要。
- R5-2: reviewerの代替案に従い、active時のresiduals=0は失効参照の撤去完了を示さないと明記した。失効後はaudit→必要ならremove→audit=0を必須手順とする。期限後のmergeでも接続を復活させない。
- R5-3: boot ID読込みをguard生成時へ遅延し、通知箱のsend／ack等のimportでは/procを読まないようにした。新たなplatform対応を主張しない。
- R4-8: provider内部設定block判断は未検証を維持する。round5依頼ではclaim.hook_event=ConfigChangeでの取得と、既存ClaudeからのACKを確認済み。これは設定適用判断とは別の証拠。

## PR #1885 merge後の撤去と再接続scope

PR #1885は2026-09-20T11:48:39Zにmerge commit `3a00732031d78f2e19b98b6da39ca317f691bdc2`でmainへ統合された。レビュー／マージレーンの完了応答を受領してACKした後、実行レーンは`configure_gui.py --audit`でClaude 3件／Codex 2件を確認し、`--remove --apply`、再auditの順に所有hook 0件を確認した。その後、初回の一時worktree、通知箱、local branchを撤去した。関連Issueはcloseせずopenで保持した。

利用者へ、現在の通知経路は停止済みであること、仕組みはmainに保持されていること、次は#1884／#1866の記録更新、#1859／#1860への正式要件接続、L3／L10での正式設計、#1866での置換・retireであることを報告した。期限付きで仮経路を復旧しながら正式化を進める案に対し、利用者は「それで進めて」と指示した。受領時刻は2026-09-20T20:59:34+09:00より前、正確な端末送信時刻は取得できない。

この指示に基づく再接続は次へ限定する。

- 対象: 同じVS Codeの既存Claude Code／Codex GUIと、`~/.claude/settings.json`／`~/.codex/hooks.json`内の所有5 command。
- 作用: 最新mainから作った専用worktreeのSCF-B-0003をconsumerへ再接続し、#1884／#1866のmerge後状態訂正と、#1859／#1860へ接続する正式化候補のreview依頼・指摘返却に使用する。
- lifecycle: SCF-B-0003のactive期間は接続を維持し、利用者の停止指示、正式経路への置換、Bindingのreplacing／retired遷移、安全な通知維持ができない不具合で撤去する。
- 境界: 新規provider sessionを起動せず、旧hook・旧runtime・旧CIを実行しない。要求採否、正式実装許可、review完了、merge許可を通知から生成しない。
- 撤去: 上限到達時に実行レーンがaudit→remove→audit=0を確認してから専用worktreeと通知stateを片付ける。

当初は実行側の限定として2026-09-21 23:59 JSTと現在bootを上限に置いた。その報告に対し、利用者は「Scaffold って仕組みがあるだろ？これにつなげよ。」、続いて「期限とかだるいことやる意味がない。」と指示した。この後続指示を優先し、固定日時・boot guard・PR mergeを撤去契機にする案を取り下げ、既存のSCF-B-0003と#1866の置換・撤去lifecycleへ一本化する。

message TTLとsession leaseは古い依頼・sessionへの誤配送防止であり、接続全体の期限ではないため維持する。consumer接続が継続しても正式Featureの採否、要求承認、実装許可、受入、運用成立は生成しない。撤去時はaudit→remove→audit=0を行い、正式置換時は#1866で`check-replacement`→`retire`を経る。

## PR #1887 round 1 reviewの処分

- Major 1: 採用。hookの入口でSCF-B-0003を読み、identity不一致、`active`以外、欠落、JSON破損ではfail closedで配送しない。Binding lifecycleを文書上の契機だけにせず、実行時停止条件へ接続する。
- Minor 1: PR titleから「期限付き」を除く。GitHub metadata変更でありcontent HEADは変えない。
- Minor 2: READMEの「レーン・通知は期限付き」を、message TTLと同一登録sessionのsliding leaseに分けて記述する。
- Info 1: 期限関連2 testの削除、lease更新1 testの追加後は25件。Binding停止の否定例を追加して26件とする。
- Info 2: acked／expired message GCと設定file mode保存・復元を正式化の移管課題としてREADME、#1884、#1859、#1860へ残す。今回の再接続PRで正式実装済みとは扱わない。
