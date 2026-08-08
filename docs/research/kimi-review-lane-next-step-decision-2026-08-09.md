# Kimi 独立レビュー lane の次工程判断（T0 相談を経た決定、2026-08-09）

PR #481 で受け入れ試験（admission bench）が main に入った（bench 5/5 pass、negative mutation 4/4 kill）。
本書は、その次に何をするかを T0 frontier（`gpt-5.6-sol`）への相談と実測を経て決めた記録である。
PO 指示「SOL に聞いて判断しろ」（2026-08-09）に対する回答であり、実装スライスの起票根拠となる。

## 1. 相談の経路と対象

`helix team run --route --allow-frontier --primary claude --execute` で T0 相談 member を起動した
（実行 args = `codex exec --sandbox workspace-write -m gpt-5.6-sol -c model_reasoning_effort=high -`）。
提示した選択肢は次の 4 つである。

1. 受け入れ試験と receipt 発行を 1 コマンドへ束ねる自動 admission パイプラインを作る
2. HEAD 束縛と 24 時間上限の設計そのものを緩和する
3. 通常 lane 投入をやめ Kimi は controlled bench 用途に留める
4. 汎用 `helix kimi` 委譲面（専用 sandbox profile の新設が必要）へ投資する

## 2. T0 の判断（要旨）

**推奨順位 1 → 3 → 4 → 2。** HEAD 束縛と 24 時間上限は維持し、毎 merge 後の無条件実行ではなく、
利用時に exact key の有効 receipt を再利用して必要な場合だけ再受入する冪等な `admission ensure`
として 1 コマンド化する、というのが第一案である。案 2 は「利便性のために『検証した実装＝実行する
実装』の同一性と鮮度保証を後退させる」ため最下位に置かれた。

T0 が指摘した最重要の見落としは**循環依存**である。本 lane は Claude quota 枯渇時の代替である一方、
admission の必須入力が同一 HEAD の Claude レビュー receipt である。quota 枯渇後に新しい HEAD が
生まれると receipt を作れないため、Kimi は「Claude の代替」ではなく「同一 HEAD を Claude が既に
レビュー済みの場合にだけ使える追加レビュアー」に留まりうる。自動化はこの入力不足を解消しない。

あわせて次も指摘された。

- freshness key が HEAD と 24 時間だけでは不足する（CLI/model version、bench contract、sandbox
  profile、policy の digest も key と consumer 再検証へ含める必要がある）
- bench 実行中の merge による TOCTOU があるため、発行直前と dispatch 時に再検証する
- 実 Kimi 起動は 2 ケースで、残りは決定的 oracle である。live CLI 挙動の全観測とは同義でない
- 案 4 は `--unshare-net` 固定を外すのではなく別 profile・別 authority の設計を要し、
  credential / allowed host / exfiltration / kill switch を含むため PO signoff 境界である

## 3. 指摘の裏取り（実測）

循環依存が仮説か現実かを確かめた。結果は次のとおりである。

| 対象 | 実測 |
|---|---|
| `.helix/runtime/claude-pr-convergence/receipts` | **0 件** |
| `.helix/runtime/review-fallback/admission` | **0 件** |
| receipt 発行経路 | 実装済み（`persistClaudePrReviewReceipt`、`helix github pr-review-receipt --apply`） |

発行経路は存在するが一度も通されていない。すなわち循環依存は仮説ではなく、
**チェーンの上流が一度も閉じたことがない**というのが現状である。

## 4. 決定

**T0 の推奨順位（1 → 3 → 4 → 2）を採用する。ただし最初の一手だけ差し替える。**

`admission ensure` の実装より先に、**エンドツーエンドの通し稽古を 1 回行う**。実 PR に対して
Claude レビュー receipt を 1 件発行し、そのまま admission 発行まで到達するかを確かめる。

理由は、これが案 1 と案 3 を分ける唯一の未知（チェーンが実際に閉じるか）を、既存コマンドだけで
ほぼゼロコストで測れるからである。

- 閉じる場合 → 案 1 へ進み、`ensure` facade による自動化の価値が確定する
- 閉じない場合 → 案 3（controlled bench 限定）が正解であり、使えない lane のための自動化を作らずに済む

これは T0 への反対ではない。T0 自身が受入条件に「実 PR の実 Claude receipt を使う end-to-end
rehearsal を最低 1 件通す」を挙げており、0 件という実測を踏まえて、それを最後の受入から最初の
測定へ前倒しするものである。

採らない選択肢とその理由も固定する。

- 案 2 は採らない。安全性の後退を利便性だけで正当化することになる。将来検討する場合も、単純な
  HEAD 非束縛や TTL 延長ではなく、lane 実装と policy/config closure の material digest への束縛を
  別 PLAN・別 bench で比較する。
- 案 4 は今回着手しない。専用 network sandbox の新設は blast radius が大きく PO 承認境界に触れる。

## 5. 撤退基準（先に固定する）

通し稽古が閉じた場合でも、導入後の最初の 10 回の low/medium fallback 試行を観測し、
`blocked_missing_claude_receipt` が過半を占めるなら通常 lane を停止して案 3 へ戻す。
この場合に案 2（緩和）へ自動的に進まない。

## 6. 参照

- 受け入れ試験の実装と実測: `docs/research/kimi-review-lane-admission-bench-2026-08-08.md`
- PoC の S4 採否: `docs/research/kimi-worker-s4-full-bench-2026-08-08.md`
- lane の契約正本: `docs/design/helix/L3-requirements/worker-common-contract.md`
