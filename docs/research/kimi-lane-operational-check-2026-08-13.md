# Kimi lane operational check（2026-08-13）

- Issue: #390
- 実行主体: Codex / TL
- 対象: Kimi K3-256kによる独立provider経路の実運用確認

## 目的

Kimi laneの通し稽古に使う低リスクの実PRとして、実行前の対象と境界を固定する。
この文書は結果を先取りせず、成功・失敗の証跡は
`PLAN-RECOVERY-48-kimi-admission-rehearsal`の実行記録へ集約する。

## 変更範囲

変更はこの研究記録1ファイルだけである。runtime実装、設定、workflow、credential、
repository state、認証・認可境界は変更しない。

## 実行境界

- provider実行前にcandidate HEADとcurrent-head CI terminal successを照合する。
- providerへ渡す入力はbounded review packetだけとし、workspace readやtool activityを許可しない。
- providerにはwrite、GitHub mutation、Ready化、mergeを許可しない。
- stale HEAD、schema不一致、tool activity、期限切れcapabilityはfail-closeする。

## 完了判定

このPRのprovider-neutral receiptがcandidate HEAD、CI run、DB convergence、provider sessionへ
束縛され、GitHub commentとlocal receiptをread-afterで照合できた場合にだけ通し稽古の証拠とする。
最終判定と各digestは#566の研究記録へ残す。
