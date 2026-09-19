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

本体・通知state・検査・外部参照台帳はscaffold内へ置く。外部の既存provider設定はconsumerとして扱い、新設SessionStart／Stopの参照だけを接続する。
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
- N2: reviewerが別セッションでのPO発言「今は残す」を報告したが、作成側はその原文を持たない。原文確認を依頼中で、reviewerの報告から承認を生成しない。確認中は2つの利用者設定から4 commandを撤去し、再接続しない。これはcodeの撤去ではなくconsumer接続の停止である。
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

- 対象: `~/.claude/settings.json` と `~/.codex/hooks.json`。各SessionStartとStopの計4 command。
- 作用: 旧 `/tmp` 参照を撤去し、本人所有・他利用者書込不可の `~/.helix-worktrees/rule-review-handoff/scaffold/review-handoff/gui_mailbox.py` 参照へ交換して保持する。
- 保持条件（実行側の制約）: このGUI通知仮組みのreview・指摘往復が必要な期間だけ。scfctl residualsで参照先存在・重複なしを確認し、無関係な設定・trust・権限は変更しない。
- 撤去契機（実行側の制約）: 利用者の停止指示、正式経路への置換、当該worktreeの撤去、または安全な通知維持ができない不具合。所有4 commandを除去しauditで0件確認後に本体を撤去する。
- 本記録のscope: この作業で明示された既存VS Codeの両GUI間通知の可逆なconsumer接続のみ。scaffold外への一般的な仮実装許可、正式要求採否、merge・closeの許可へ拡張しない。

上記4 commandの具体pathと保持条件は作成側が限定した実装内容であり、利用者がそれらの文字列を個別指定したとは主張しない。
原文確認中に行った一時撤去の後、この限定scopeで永続pathから再接続する。再接続後のtrustは利用者のprovider側確認を尊重する。

## 起床経路の是正（利用者指摘と回復処理）

利用者から「送れるはずだが？」、続いて「旧実装に起こす方法あったんじゃないの？VSCodeを新たに立ち上げようとしたお前の方法は間違いだ。」との指摘を受けた。
作成側は公開URIで登録済みsessionを開こうとしたが、この方向を中止した。送信欄には既存draftがあり、内容を変更・送信していない。このGUI操作を通知成功として数えない。
旧 `PLAN-L7-469`、`claude-memory-wake.ts`、Stop設定をreferenceとして再読し、起床は既存のasyncRewake待受からのexit 2であったと確認した。旧コードは実行していない。
障害はpath移行時に待受を無効にして後継を登録する前に止めたことであり、外からVS Codeを開くことでは修復しない。

既存GUIの通知経路を修復する今回の指示に従い、Claudeの公開ConfigChange hookを同じ通知処理の回復入口へ追加した。
対象は従来と同じ2設定fileで、ClaudeにSessionStart／Stop／ConfigChange、CodexにSessionStart／Stopの計5 command。
ConfigChangeはuser_settingsに限定し、同じrepositoryと登録済みsession、settingsのexact pathを確認する。無関係な設定・trust・権限を変更しない。
rearmは所有hookの表示metadataを1回更新するだけで、設定への常時pollや新しいprovider起動は行わない。保持条件・撤去契機は前節を継承する。
native ConfigChangeの発火をlocal hook_eventsで観測した。新依頼の起床・受領ACKは別の証跡で確認し、イベント観測だけで配送成功を宣言しない。
