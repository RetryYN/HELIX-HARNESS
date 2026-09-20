---
title: "旧要求・旧asset直接semantic review wave 6方法"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 6方法

## 対象

wave 6はHELIX-OSの`HIL-FR-28`、`HIL-FR-32`、`HIL-FR-64`を各3 edge、合計9 edgeで直接照合する。
三段CI、agent lifecycle、第三者worker sandboxを対象にする。いずれも現行crosswalkと分解台帳でHELIX-OS unitに
分離済みで、共有source spanはない。

schema 8はschema 7のbounded global search、atom被覆、phase候補のexact転記、同一token anchor規則、
別atom間のsource fragment包含拒否を維持する。要求source snapshotだけを契約保存として`confirmed`にし、designと
未実行sourceは直接対応するatomがあっても`unresolved`に保つ。旧実装、consumer closure、現行replacementは確定しない。

## edge判定

- FR-28のdesignは三段名、SHA/tree/check-set、predecessor receipt、artifact、単調遷移を持つ。implementation候補は
  candidate/base SHAとdeferred receiptを持つが、三段名、tree binding、stage chainを持たない。
- FR-32のdesignはmuster、lease、checkpoint、verification、release、quarantine、retireを持つ。implementation候補は
  `requested→admitted→sandboxed→running→proposal_received→revalidated→terminal`という別状態列であり、共有する
  `running`、`quarantined`、receiptだけを部分候補として残す。
- FR-64のdesignは隔離worktree、scratch、DB／`.helix/`／credential非到達、host外egressとscope外diffのfail-closeを持つ。
  implementation候補はscratch bind、authority path拒否、network namespace deny、sandbox/diff/egress receiptを持つ。
  host+path allowlist、第三者CLI設定のbackup付きmerge/append、template逸脱からquarantine receiptまでの連結はない。

controlled term bindingは英数字anchorを3文字以上かつtoken境界一致、日本語を含むanchorを2文字以上とし、atom原文と
引用内required termに同じtokenがある場合だけ部分証拠にする。部分証拠からatom全体の実装成立を生成しない。

## 探索と停止条件

4,020件のasset catalog全件についてarchive file bytesを読み、要求ID、固有state、symbol、failure codeのいずれかを含む
assetを候補集合へ固定する。FR-28は19件、FR-32は29件、FR-64は564件で、各3件以外は未reviewのまま集合digestへ残す。
検索membershipはsemantic link、phase採否、製品owner、実装成立を生成しない。

現行crosswalkと分解台帳の正規unitにはHELIX-Web／Web-OSがない。本waveからWeb系unitを新造しない。archive内runtime、
test、hook、CI、adapterは実行せず、要求採否、phase採否、再利用、置換、new build許可を生成しない。wave 1〜5の
ledgerとmetadataを入力digestで固定する。
