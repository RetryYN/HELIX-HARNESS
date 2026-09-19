# ルール参照とClaude／Codex review引継ぎの仮組み

status: scaffold
authority_effect: none
binding: SCF-B-0003
replacement_issue: 1866

この仮組みは、両runtimeへ同じ版の参照一覧と同じbase／content SHAを渡し、戻った指摘の対応を静的に確認する。
正式なAI context生成器、Worker、配送adapter、review admissionではない。
上流入口が許す仮組みの範囲で置き、S0承認から正式実装の許可を導かない。

## 接続先

- [作業契約](../../docs/governance/feature-tickets/FT-OS-REVIEWHANDOFF-001.md)
- [旧経路の調査](../../docs/governance/audits/source-rebaseline/rule-review-handoff-investigation-2026-09-20.md)
- 親 #1864、推進 #1859、検収 #1860、置換・撤去 #1866。
- `SCF-B-0002`は旧ルール参照集を所有する。本仮組みはそのindexを参照するだけで、規則本文を複製・指示書化しない。

## 最初の使い方

1. 作成側が対象PRの現在のbase／content full SHAを取得する。未commitの変更は対象外。
2. `packet.py build`で依頼JSONを標準出力へ生成する。保存する場合は`scaffold/`内の作業用領域へ置く。
3. 既に許可された連携経路でだけ依頼と対象diffを渡す。経路未許可なら配送待ちで止める。
4. review側はcontent SHAの参照文書を読む。ここにある一覧は最低限の入口であり、作業入口の必読順と対象別資料を代替しない。
5. review側が[応答形式](response-template.json)を埋める。指摘には根拠と必要な変更を付け、未確認範囲を隠さない。
6. 作成側がPRの現在のSHAを再取得し、`check`で照合する。修正でSHAが動いたら新request IDで再依頼する。

```sh
python3 -B scaffold/review-handoff/packet.py build --base BASE_FULL_SHA --head CONTENT_FULL_SHA --pr PR_NUMBER --request-id RH-UNIQUE-ID --author codex --purpose '対象差分の静的review' --scope '対象ファイルと確認事項'
python3 -B scaffold/review-handoff/packet.py check scaffold/review-handoff/local/request.json --base CURRENT_BASE_FULL_SHA --head CURRENT_CONTENT_FULL_SHA --response scaffold/review-handoff/local/response.json
python3 -B scaffold/review-handoff/selftest.py
```

`--author claude`なら宛先はcodex、`--author codex`なら宛先はclaudeとなる。役割の名前を指定するだけで、本人性・独立性や起動許可を証明しない。
`local/`はGit対象外。秘密・PII・生会話・credentialsをpurpose、scope、応答へ入力しない。

## パケットの一時契約

- 現行規則・context・運用文書・decision record・上流参照・候補参照を種別付きで列挙する。承認状態は参照元のdecisionで確認する。
- 旧ルール候補と仮ルール集は`candidate_reference_only`／`scaffold_reference_only`であり、指示への昇格をしない。
- ハッシュはGitのcontent SHAのfile bytesに対するSHA-256。依頼payloadはキーを整列したUTF-8 JSONに対するSHA-256。
- このpayload digestはパケット対応の照合用。GitHub commentの送信byteに対するdigestやdelivery receiptとは別である。
- `check`は入力したexpected base／headとの一致を確認する。GitHubへ接続しないため、expected SHAの最新性は実行者が別途確認する。
- 応答の`no_findings`は指摘なしという申告。配送・署名・reviewの妥当性・merge可否を検証しない。
- JSONには未知fieldを認めず、承認・merge・完了fieldを足せない。本文中の主張の真偽は機械判定しない。

## 許可と停止

toolはPython標準libraryと読み取り専用の`git rev-parse`／`git show`だけを使い、標準出力へ返す。
旧CLI、旧hook、旧runtime、旧testを読込・実行せず、Claude／CodexやGitHubへの配送も起動しない。
AGENTS.md、CLAUDE.md、settings、承認文書、DBを更新しない。
参照不足・digest不一致・SHA変化・別依頼への応答・同一runtime・未知fieldでは検査を拒否する。
次の経路実装は、起動方式・許可scope・timeout・費用・隔離・配送read-afterを別の作業契約で定める。

## 正式な物への置換

HELIX-OSのルール参照・Worker context・review配送／応答照合がL2／L11採否とL3／L10導出を経て成立したら、
SCF-B-0003の役割・義務・接続・検査・否定例を正式側へ対応づける。
#1866で`check-replacement`→`retire`を追跡し、このdirectoryとbindingの残留を確認する。

## 検証の限界

自己検査は一時契約のパケット整合だけを対象とする。Claude×Codexの実通信は未実施であり、連携運転の成立・正式L11 passを主張しない。
