# Commitlint push admission

## 目的

公開済み履歴を書き換えない運用下で、非規約commit件名をremoteへ送る前に拒否する。
既存の`analyzeCommitSubjects`を唯一の判定器として再利用し、CI側commitlintの意味や厳格さは変更しない。

## 入力と境界

Codex／Claude共通の`git-command-guard`が、shell内の通常`git push`を検出する。
実効cwd、push元commit、remote追跡branchを解決し、remote側の既知HEADからpush元HEADまでの件名だけを既存判定器へ渡す。
新規remote branchではremote default branchとのmerge-baseを基準にする。

push先、push元、比較基準を一意に解決できない場合はfail-closeする。force pushは従来のdestructive guardが先に拒否する。
remote deletionは新しいcommitを送らないため、本契約のcommitlint対象外とする。

## 出力

- 全件適合: 既存pushを許可する。
- 非規約件名: `commitlint-pre-push`としてpush前に拒否し、既存reasonを表示する。
- identity／range不明: 推測せずpush前に拒否する。

本機構はcommitの修正、履歴書換え、push実行を行わない。
