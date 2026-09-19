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
