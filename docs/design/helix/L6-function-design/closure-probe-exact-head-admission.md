---
title: "closure evidence-probe exact HEAD実行許可"
status: draft
canonical_layer: L6
canonical_pair: L6-L7
plan_id: PLAN-RECOVERY-1753-closure-probe-exact-head
pair_artifact: docs/test-design/helix/closure-probe-exact-head-admission.md
---

# closure evidence-probe exact HEAD実行許可

`closure evidence-probe --execute`はcommand起動前に、物理repository root、40桁HEAD、全untrackedを含む
cleanliness、現在worktreeの一意なidentity、`origin` read-afterで同一HEADが存在することを検証する。

いずれかを証明できない場合はexit 2で停止し、probe record、対象PLANのfailure evidence、DB行を生成しない。
許可時はrepo path、HEAD、branch、dirty digest、git directory、worktree identity、remote exactnessを
execution recordへ保存する。共有root、detached worktree、通常branchを名前で特別扱いせず、同じtyped判定を使う。

## 不変条件

- dirty/conflict/untrackedを既知の変更として免除しない。
- local HEADだけではremote read-afterを満たしたとみなさない。
- execution admission失敗を対象PLANのtest failureへ変換しない。
- release、closure承認、既存foreign変更の削除は行わない。
