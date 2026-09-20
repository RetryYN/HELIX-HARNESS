---
title: "旧要求・旧asset直接semantic review wave 8方法"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 8方法

## 対象

wave 8はHELIX-OSのdelegation clusterから`HIL-FR-65`、`HIL-FR-66`、`HIL-FR-67`を各3 edge、合計9 edgeで
直接照合する。3 unitは環境浄化、proposal再検証、payload最小化を分担し、正規分解台帳では共有source spanを持たない。

schema 10はschema 9のbounded global search、atom被覆、phase候補のexact転記、同一token anchor規則、別atom間の
source fragment包含拒否を維持する。Requirement IR snapshotだけを契約保存として`confirmed`にし、designと未実行sourceは
部分対応を`unresolved`に保つ。旧実装、consumer closure、現行replacementは確定しない。

## edge判定

- FR-65はworker wrapper designのenv allowlistとloop bridgeのstdin引渡しだけを部分証拠にする。timeoutやcloseを別sourceから
  推測せず、lint/doctor findingとenv manifestも未被覆に残す。
- FR-66はworker output admissionのclosed schema、canonical digest、sealed capabilityを部分証拠にする。authority policy全体、
  command／SQL／path／codeの非実行、FS差分と指示外副作用rejectは未被覆に残す。
- FR-67はworker isolation design/sourceの`.git`拒否、secret境界、path/digest manifestとreceiptを部分証拠にする。
  sparse worktree、履歴排除、払い出し前secret scanの成立は主張しない。

controlled term bindingは英数字anchorを3文字以上かつtoken境界一致、日本語を含むanchorを2文字以上とする。
部分語の一致からatom全体の実装成立を生成しない。

## 探索と停止条件

4,020件のasset catalog全件についてarchive file bytesを読み、要求IDと要求固有語のいずれかを含むassetを候補集合へ固定する。
FR-65は135件、FR-66は145件、FR-67は35件で、各3件以外は未reviewのまま集合digestへ残す。検索membershipは
semantic link、phase採否、製品owner、実装成立を生成しない。

archive内runtime、test、hook、CI、adapterは実行せず、要求採否、phase採否、再利用、置換、new build許可を生成しない。
wave 1〜7のledgerとmetadataを入力digestで固定する。
