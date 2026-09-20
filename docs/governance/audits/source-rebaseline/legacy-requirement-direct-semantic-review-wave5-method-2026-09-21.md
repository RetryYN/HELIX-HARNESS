---
title: "旧要求・旧asset直接semantic review wave 5方法"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 5方法

## 対象

wave 5はHELIX-HARNESSの`HIL-BR-05`、`HIL-BR-17`、`HIL-BR-22`を各3 edge、合計9 edgeで直接照合する。
Redesign backflow、review finding disposition、要求からDesign Templateへの接続を対象にし、OS側の実行統制をHARNESSへ複製しない。

schema 7はschema 6のbounded global search、atom被覆、phase候補のexact転記、同一token anchor規則を維持し、
意味が近いだけのdesign sourceも`adjacent_design_nonmatching`として棄却記録へ残す。要求単位は未review候補とconsumer
chainが残る間、実装状態をunknown、縮退評価を`unresolved_legacy_implementation_unknown`に保つ。

## edgeと製品境界

同じ要求IDのsource snapshotは契約保存だけを`confirmed`とする。設計文書は直接対応するatomだけを`unresolved`で
部分被覆し、未実行sourceは同一tokenがあっても要求の作用とconsumerを担わなければ`rejected`にする。

controlled term bindingは、英数字anchorを3文字以上かつ英数字・snake/kebab・camel境界一致、日本語を含むanchorを
2文字以上とし、atom原文と引用内required termの双方に同一tokenがある場合だけ成立させる。短い語幹一致は認めない。

- BR-05はRedesign routeの設計だけを部分証拠とする。静的refactor候補scannerをaudit finding、再freeze、実装entryの実装証拠にしない。
- BR-17はfinding dispositionを要求する。current PR review admissionとreview lane closureは近接するが、`current_pr_fix`、
  `successor_issue`、writer返却、再流入禁止を担わないためdesign/sourceとも棄却する。
- BR-22はRequirement JSONからDesign Templateへ至る設計flowだけを部分証拠とする。設定schemaを設計義務の原子的生成・消込、
  closed-set完全性の実装証拠にしない。

BR-05とBR-17の共有spanは対応するHELIX-OS unitとの境界判断をpendingに保つ。BR-05入力の包含関係にある2つの条件spanは、raw fragmentを両方保持した1 atomへ正規化し、同じ義務を二重計上しない。別atom間のsource fragment包含重複はverifierで拒否する。BR-22はHARNESS exclusive候補である。

## bounded global search

4,020件のasset catalog全件についてarchive file bytesを読み、要求ID、意味語、symbolのいずれかを含むassetを候補にする。
BR-05は86件、BR-17は44件、BR-22は27件で、各3件以外は未reviewのまま集合digestへ固定する。検索membershipは
semantic link、phase採否、製品owner、実装成立を生成しない。

現行crosswalkと分解台帳の正規unitはHELIX-HARNESS 85、HELIX-OS 132、connection 1で、HELIX-Web／Web-OSは0件である。
これはWeb要求不存在の判断ではない。正規unitの無い現行draftをwave ledgerへ混ぜず、製品routingとL2／L11合意後の別工程へ残す。

archive内runtime、test、hook、CI、adapterは実行しない。consumer closure、要求採否、phase採否、製品境界判断、
現行実装、再利用、置換、new build許可も生成しない。wave 1〜4のledgerとmetadataを入力digestで固定する。
