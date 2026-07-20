---
title: "GitHub 運用投影 受入テスト設計"
layer: L3
executed_at_layer: L11
artifact_type: test_design
status: proposed
created: 2026-07-20
updated: 2026-07-20
owner: QA
pair_artifact: docs/design/helix/L3-requirements/github-operations-projection.md
---

# GitHub 運用投影 受入テスト設計

- pair: `docs/design/helix/L3-requirements/github-operations-projection.md`
- status: proposed
- 実行層: L11

## テスト束

| Test ID | 対応AC | 入力 | 期待結果 |
|---|---|---|---|
| GOP-T-01 | GOP-AC-01 | Projects board / sub-issue への直接編集 fixture と、Issue 受付ゲート経由の command candidate fixture | 直接編集は正本へ反映されず、command candidate のみ admission される |
| GOP-T-02 | GOP-AC-02 | GitHub 側緑表示 (closed Issue、green check、board 列位置) のみを入力にした completion 判定 fixture | GitHub 表示単独の completion 判定が拒否され、`harness.db` 側 evidence 欠落時は不合格になる |
| GOP-T-03 | GOP-AC-03 | roadmap gate/span の正本状態遷移 fixture、および Projects 側の手動列移動を挟んだ再同期 fixture | 正本遷移が Projects view/status field/iteration へ投影され、手動移動は次回同期で正本値へ収束する |
| GOP-T-04 | GOP-AC-04 | PLAN 親子 fixture (層 PLAN=parent、step/派生 Issue=sub-issue) を正常/孤児混入/上限超過で用意 | 正常のみ写像成功、孤児 sub-issue は 0 件で検出され、上限超過は分割/拒否される |
| GOP-T-05 | GOP-AC-05 | item 50,000 件超過、field 50 個超過、option 50 個超過、option 名変更後の再同期 fixture | 上限超過は同期前に fail-close し、option 名ベース再解決で ID 再採番後も同期が破綻しない |
| GOP-T-06 | GOP-AC-06 | `helix status` の active frontier fixture と、対応する Projects board + Issue 階層 snapshot fixture | 両者が同一 roadmap gate/span・Issue 状態を指し、追加ツールなしで一致確認できる |
| GOP-T-07 | GOP-AC-07 | projection 側値と `harness.db` 正本値を意図的に不一致にした drift fixture | `helix doctor` が該当 gate で fail-visible になり、stale/不一致を finding として報告する |
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

## 実環境照合

fixture だけで合格にしない。GitHub read-only API で Projects board の現在値、sub-issue 階層、workflow
run 履歴を観測し、projection 設計との差分を検証する。Projects API への書込み適用は別途 action-binding
approval を要する運用変更であり、本テスト設計は read-only 観測と fixture 駆動の単体/結合検証を範囲とする。

## 証跡要件

各実行は command、exit code、output digest、HEAD、GitHub observation timestamp を保存する。CI 実測秒数
(GOP-T-10, GOP-T-11) は取得元 workflow run の run ID と実行時刻を記録し、再現不能な手動計測だけを合格
根拠にしない。
