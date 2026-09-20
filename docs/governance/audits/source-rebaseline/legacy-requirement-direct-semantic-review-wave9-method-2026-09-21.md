---
title: "旧要求・旧asset直接semantic review wave 9方法"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 9方法

## 対象

wave 9はHELIX-OSの同一能力clusterから`HIL-FR-60`、`HIL-FR-61`、`HIL-FR-62`を各3 edge、合計9 edgeで
直接照合する。FR-60はmusterとworker/verifier境界、FR-61は候補runtimeの事前acceptance bench、FR-62はHELIX実taskの
performance scorecardを分担する。FR-61の候補runtime事前benchとFR-62の実task scorecardは別atom・別phase責務として扱い、
正規分解台帳のshared source spanは持たない。

schema 10はwave 8のbounded global search、atom被覆、phase候補のexact転記、同一token anchor規則、別atom間の
source fragment包含拒否を維持する。Requirement IR snapshotだけを契約保存として`confirmed`にし、designと未実行sourceは
部分対応を`unresolved`に保つ。旧実装、consumer closure、現行replacementは確定しない。

## edge判定

- FR-60のdesign/implementationはallowlist済みruntime投影とworker/verifier分離の部分候補だけを束縛する。muster判断、single-agent reuse、lifecycle receiptの成立は主張しない。
- FR-61のdesign/implementationはfixture/rubric、score、admission receiptの部分候補だけを束縛する。候補runtimeの事前benchはHELIX実task scorecardの実績ではない。
- FR-62のdesign/implementationはcost、retry、admit/retireの部分候補だけを束縛する。`first_pass`、`retry_count`、`proposal_diff_size`、`lint_violation_count`を含む実task scorecardの成立は主張しない。

controlled term bindingは英数字anchorを3文字以上かつtoken境界一致、日本語を含むanchorを2文字以上とする。
部分語の一致からatom全体の実装成立を生成しない。

## 探索と停止条件

4,020件のasset catalog全件についてarchive file bytesを読み、unit固有IDまたは要求固有語のいずれかを含むassetを候補集合へ固定する。
FR-60は2,166件、FR-61は53件、FR-62は22件で、各3件以外は未reviewのまま集合digestへ残す。検索membershipは
semantic link、phase採否、製品owner、実装成立を生成しない。

archive内runtime、test、hook、CI、adapterは実行せず、要求採否、phase採否、再利用、置換、new build許可を生成しない。
wave 1〜8のledgerとmetadata、parent revision `0e6c6f8346a1381972b4a8d0b1edf33b0b328389`を入力digestで固定する。
