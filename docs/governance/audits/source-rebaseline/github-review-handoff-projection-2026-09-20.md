# review引継ぎ仮組みのIssue投影receipt

status: projection_receipt
authority_effect: none
recorded_at: 2026-09-19T15:57:05.953167+00:00

- Local identity: FT-OS-REVIEWHANDOFF-001
- Source commit: `8a247115f90cc9b1314b4f3c65d614998e97440a`
- Source path: `docs/governance/feature-tickets/FT-OS-REVIEWHANDOFF-001.md`
- Source file SHA-256: `583a089f4f327ad48fc854391ecb7b6c59fc8351517e9d0f50bb48826bbd4659`
- Remote: [Issue #1884](https://github.com/RetryYN/HELIX-HARNESS/issues/1884)
- Payload SHA-256: `988cea67083b496a266f276edee82dad54691ca36772d8d70e8bd56e265975c3`
- Remote本文SHA-256: `988cea67083b496a266f276edee82dad54691ca36772d8d70e8bd56e265975c3`
- Read-after: 本文byte一致、state OPEN。
- Parent relation: #1864のsub-issuesへ#1884を登録し、API再取得で関係を確認。
- Replacement ledger: #1866へSCF-B-0003を追加。branch上の仮組み・main未統合と明記。
- Ledger payload/read-after SHA-256: `bfd39d5633123ee57ed4bb6199e66783528dcca876cf9f7284a783a29e25d9d3`（一致）。

Issue作成、関係登録、台帳更新だけを記録する。要求採否、実通信、review実施、merge、Issue closeは成立させない。
訂正が必要な場合は本記録を消さず、訂正対象と新しいread-afterを後続receiptへ追記する。

## GUI経路へのscope訂正・投影receipt v2

- correction_of: 上記2026-09-20の初回投影（パケットのみのscope）
- Recorded at: 2026-09-19T16:15:26.866368+00:00
- Source commit: `cbeee32457ec9bed01a8a3ac05edf9673dcbb0ff`
- Source file SHA-256: `3ebae075d0007f6c1fdd103847fd633640f02f88667f668f8440484292f03958`
- Issue #1884 payload／remote本文SHA-256: `d516d0556eee70416033312bcce547b87f27cbecb0c03ddedccd1617052bc387`（read-after一致）
- #1866台帳payload／remote本文SHA-256: `6f8e1fa1f6fbd9535477dacb533f8812a772ee853a11df68ebe93ea63bed55bc`（read-after一致）
- 現在のscope: 同じVS Codeの既存Claude／Codex GUI間で実行・レビュー／マージレーンの通知と指摘を往復させる仮組み。
- 検証: パケット10件、GUI transport・hook形式10件、Scaffold Binding 38 caseが通過。GUI試験は合成入力と別processでありlive受信を代替しない。
- 利用者設定: 新設SessionStart／Stopの参照を追加しread-after一致。無関係な設定・hook trust・権限は変更していない。
- 実GUI: 既存Codex threadを実行レーンに束縛、既存Claude GUI processの次のnative hookを登録待ち。session ID／PIDはlocal通知箱だけに保持。
- 未完: Codex側の新hook trustと両GUIでのnative hook読込、両方向のlive ACK。要求承認・review実施・mergeは記録しない。

## 指摘修正の投影receipt v3

- Recorded at: 2026-09-19T16:47:25.740300+00:00
- Source commit: `189284b52244deb1c53aba2b3b1dd6e41fa8dd68`
- Source file SHA-256: `17133a9604f92e90dfb2db581795e61e533c0cb168f25fc199a2294f5fc8651e`
- issues/1884 本文payload／read-after SHA-256: `d14a524a9e9a2b36222bbc45cc2248fcbe9b4cf121bfab276869d1a3300dc523`（一致）
- issues/1866 本文payload／read-after SHA-256: `8d0a8c9b6955d778b85a4cac327a1cdb250350479783be10f64c38f6a2464aaf`（一致）
- 検証証跡: `scaffold/evidence/gui-review-fixes-2026-09-20.json`。修正版content commitへ束縛。
- 初回依頼／応答は両GUIがACK済み。Codex受信はGUI内のnative toolであり、native Stop自動受信は未確認。
- 修正版の独立reviewとlive受信は未完。
