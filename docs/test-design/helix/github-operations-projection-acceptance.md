---
title: "GitHub 運用投影 受入テスト設計"
layer: L3
executed_at_layer: L10
artifact_type: test_design
status: proposed
created: 2026-07-20
updated: 2026-07-21
owner: QA
pair_artifact: docs/design/helix/L3-requirements/github-operations-projection.md
---

# GitHub 運用投影 受入テスト設計

- pair: `docs/design/helix/L3-requirements/github-operations-projection.md`
- status: proposed
- 実行層: L10（canonical pair `L3↔L10`）

## テスト束

| Test ID | 対応AC | 入力 | 期待結果 |
|---|---|---|---|
| GOP-T-01 | GOP-AC-01 | Projects board / sub-issue への直接編集 fixture と、Issue 受付ゲート経由の command candidate fixture | 直接編集は正本へ反映されず、command candidate のみ admission される |
| GOP-T-02 | GOP-AC-02 | GitHub 側緑表示 (closed Issue、green check、board 列位置) のみを入力にした completion 判定 fixture | GitHub 表示単独の completion 判定が拒否され、`harness.db` 側 evidence 欠落時は不合格になる |
| GOP-T-03 | GOP-AC-03 | canonical desired-state packetのroadmap遷移、GitHub cross-referenceだけの偽進行fixture、Projects手動列移動を挟んだ再同期fixture | canonical遷移だけがStatus/iterationへ投影され、cross-referenceだけでは進行中へ昇格せず、手動移動は次回同期で正本値へ収束する |
| GOP-T-04 | GOP-AC-04 | PLAN 親子 fixture (層 PLAN=parent、step/派生 Issue=sub-issue) を正常/孤児混入/上限超過で用意 | 正常のみ写像成功、孤児 sub-issue は 0 件で検出され、上限超過は分割/拒否される |
| GOP-T-05 | GOP-AC-05 | item/field/option/sub-issue上限、101件以上のpage、rate-limit中断/再開、同一ID rename、delete/recreate fixture | 上限超過は事前拒否、全page取得、bounded batchとcursor再開を証明する。同一ID renameだけを継続し、delete/recreateはidentity driftで拒否する |
| GOP-T-06 | GOP-AC-06 | `helix status` の active frontier fixture と、対応する Projects board + Issue 階層 snapshot fixture | 両者が同一 roadmap gate/span・Issue 状態を指し、追加ツールなしで一致確認できる |
| GOP-T-07 | GOP-AC-07 | canonical desired-state packetとGitHub read-backを不一致にしたfixture、およびGitHub snapshot同士だけが一致する反例 | `helix doctor`がstale/不一致をfindingにし、GitHub自己比較だけではgreenにしない |
| GOP-T-08 | GOP-AC-08 | `addProjectV2ItemById` 等の書込み成功応答後、read-back API が反映前状態を返す fixture | 書込みステップが silent success を返さず、read-back 不一致を finding として報告する |
| GOP-T-09 | GOP-AC-09 | secret 未設定、誤 scope の PAT、`GITHUB_TOKEN` のみでの Projects API 呼び出し fixture | 呼び出しが fail-close し、secret 実値・token 文字列がログ/出力に含まれない |
| GOP-T-10 | GOP-AC-10 | 外部 PR CI fixture (typecheck + targeted test + critical gate) と内部 CI/nightly fixture (full regression + 全 doctor gate) の実行記録 | 外部レーンは targeted 範囲のみ実行し、省略した full regression が内部レーン記録で必ず実行済みになる (coverage 相殺が起きない) |
| GOP-T-11 | GOP-AC-11 | CI 実測所要時間の悪化を模した再測定トリガ fixture | 再測定イベントが記録され、stale な実測根拠を cite したままの主張が finding として検出される |

## oracle 一覧 (§受入基準相当)

- **GitHub 側編集の正本逆流拒否**: GOP-T-01。command candidate 化を経ない書込みは正本へ到達しない。
- **projection stale 検出**: GOP-T-03, GOP-T-07。手動変更・正本非同期の両方向を検出する。
- **sub-issue 孤児 0**: GOP-T-04。写像規則から外れた sub-issue が 0 件であることを毎回検証する。
- **Forward 再合流 route の Issue 上追跡**: GOP-T-06。active frontier が Issue 階層 + board から
  追加ツールなしで再構成できることを oracle とする。
- **上限超過の事前 fail-close**: GOP-T-05。item/field/option/sub-issue 上限超過は同期実行前に検出する。
- **外部 CI から full 回帰が外れても内部 CI で必ず走る (coverage 相殺禁止)**: GOP-T-10。外部/内部 2 レーンの
  実行記録を突き合わせ、どちらのレーンも実行しなかった gate が存在しないことを検証する。
- **Status終端規則**: GOP-T-02, GOP-T-03。`Done`はtyped closure receiptと終端PR mergeのjoinだけで成立し、
  Issue close、PR merge、CI greenの単独入力では成立しない。archive後もclosure receiptから最終itemを追跡できる。

GOP-T-01〜09（Project投影）とGOP-T-10〜11（CI配分）は別verification groupとして判定し、一方のgreenで
他方の未実行・失敗を相殺しない。

## 実環境照合

fixture だけで合格にしない。GitHub read-only API で Projects board の現在値、sub-issue 階層、workflow
run 履歴を観測し、projection 設計との差分を検証する。Projects API への書込み適用は別途 action-binding
approval を要する運用変更であり、本テスト設計は read-only 観測と fixture 駆動の単体/結合検証を範囲とする。

## 証跡要件

各実行は command、exit code、output digest、HEAD、GitHub observation timestamp を保存する。CI 実測秒数
(GOP-T-10, GOP-T-11) は取得元 workflow run の run ID と実行時刻を記録し、再現不能な手動計測だけを合格
根拠にしない。
