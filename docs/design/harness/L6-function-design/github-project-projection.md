---
layer: L6
sub_doc: function-design
status: draft
parent_design: docs/design/helix/L3-requirements/github-operations-projection.md
pair_artifact: docs/test-design/harness/github-project-projection.md
plan: docs/plans/PLAN-L7-463-github-project-projection.md
---

# GitHub Project open work投影 機能設計

## 目的と境界

GitHubのopen Issue / PRをProjectへ一方向投影し、人間が未着手・進行中を一覧できるようにする。
本機能は`harness.db`、PLAN、CI、review evidence、closure receiptを更新せず、Projectを完了判定の正本にしない。

## 現行PoC契約

- 既定はdry-runとし、`--apply`だけが外部状態を変更する。
- open PR、cross-reference、open Issueから暫定Statusを作る現在のadapterはGitHub inventory PoCであり、
  canonical desired-state projectionとしては使用しない。
- 欠落itemを追加し、Status mismatchを是正する。Project内の余剰itemは削除せずdriftとして報告する。
- Status optionは実行時に名前からIDを解決し、固定IDをコードへ埋め込まない。
- apply後はProjectを再取得し、不一致が残る場合は`readback_mismatch`でfail-closeする。
- owner、repository、project numberを検証し、`gh`へ渡す引数は固定配列で組み立てる。
- 認証・`project` scope・API accessが不足する場合はmutationを成功扱いにしない。secret実値は保持・出力しない。

## 要件是正後の実装blocker

canonical化には、`harness.db` / repo-owned ledgerからtyped desired-state packetを生成し、L3 §1.2のStatus写像を
適用する必要がある。これが無い間、PoCのgreenをGOP-FR-04/07/08の完了証拠にしない。roadmap iteration、
PLAN親子からsub-issueへの写像、全page/batch/rate-limit、`helix doctor`常設gate、scheduled workflowも未実装である。
scheduled workflowの有効化には専用GitHub Appまたは最小権限tokenが必要であり、本sliceではcredentialを作成しない。
