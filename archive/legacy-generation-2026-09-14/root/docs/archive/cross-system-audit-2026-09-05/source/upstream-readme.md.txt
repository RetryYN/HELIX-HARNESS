# HELIX 横断点検パッケージ — 2026-09-05 JST

最初に `HELIX_CROSS_SYSTEM_AUDIT_2026-09-05.md` を参照してください。

本パッケージは読み取り専用の点検結果です。リポジトリ本体への修正、Issue起票、PRへの投稿、CI再実行、承認、merge、releaseは行っていません。

## 検証範囲

main: `b5178c34fe34c956a70713ad942b1f5b8f64e0ab`

PR #1533のみ: `593f55a60b0b7d723d68a194a7113d32789afa62`（未マージ）

ソースから判定ロジックを抽出し、型注釈・無関係な依存・処理を外したローカル反例です。元のTypeScriptモジュールのimport、プロジェクト全回帰、全CLI、実プロバイダー、全OSの動作確認ではありません。SQLiteは合成した一時ディレクトリ／インメモリDBを使用しています。30ケース中8ケースは対照確認であり、30件の独立したバグを意味しません。

**スクリプトの終了コード0は「記録した挙動を再現した」の意味です。HELIXの安全性検証に合格したという意味ではありません。** 原コード修正後の回帰テストへ移す場合は、危険側の観測を期待するassertをそのまま採用せず、報告書の安全側oracleへ反転してください。

## 実行

Python 3とNode.jsが必要です。この環境での実測はNode v22.16.0 / Python sqlite3 3.46.1です。プロジェクト指定のNode >=24.15.0 <25による検証は未実施です。シンボリックリンクを作成できるLinux/WSL環境で実行してください。

```sh
node probes.mjs probe_results.json
python3 readiness_probe.py readiness_results.json
node db_path_probe.mjs db_path_results.json
node path_pattern_probe.mjs path_pattern_results.json
```

ネットワーク・実AI呼び出し・本番データ・実認証情報を使いません。`db_path_probe.mjs`はNodeの実SQLiteドライバーを呼びますが、生成対象は一時ディレクトリのテストDBだけです。`probes.mjs`もシンボリックリンク先を含めて合成ファイルだけを作成し、終了時に消去します。

## ファイル

- `HELIX_CROSS_SYSTEM_AUDIT_2026-09-05.md`: 人間向け所見・責務衝突表・修正済み項目・残余検証範囲
- `findings.json`: 14所見の機械可読台帳。全てレビュー用proposalでありプロジェクトauthorityではない
- `source_index.json`: 使用した固定HEADとソース参照
- `*_results.json`: 実測出力
- `probes.mjs`, `readiness_probe.py`, `db_path_probe.mjs`, `path_pattern_probe.mjs`: 反例再実行用
- `SHA256SUMS.txt`: 同梱ファイルの整合性確認用。内容の正しさや実行者の署名を証明するものではない
- `UPSTREAM_LICENSE.txt`: HELIXから抽出したコードのライセンス表示

完全なリポジトリコピー、全ファイル監査済み台帳、実環境の秘密情報は含みません。
