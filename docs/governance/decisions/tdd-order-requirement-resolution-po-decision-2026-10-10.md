---
decision_record_id: HDEC-TDDORDER-RESOLUTION-2026-10-10
decision_status: recorded
decider_role: PO
decided_at: 2026-10-10
authority_effect: effective_when_this_record_is_admitted_to_main
---

# TDDの検証先行とRed／GreenのPO判断

POは本Codex会話の質問票で、固定案のTDDORDERについて「TDDORDERを採用（推奨）」と回答した（原文）。提示は実装前のtest／oracle定義・凍結、Red＝意図した欠陥の検出、Green＝凍結oracleを最小実装で満たした証拠、検証の後付けを対L11で拒否する案である。

- 提示commit: `d4b439e5c48591749709a8707d0ee319c673f000`
- 提示JSON SHA-256: `64b673cd69579bbbb3a978119ecf3f30fa450cc3cc21420e1457549ec1976d38`
- 固定案: [requirements-resolution-packet](../crosswalks/requirements-resolution-packet.md)、unit `TDDORDER`（3置換、うち1置換は2箇所）。
- HARNESS-L2-015節SHA-256: `6174e604534021aa08addda5911e0fd2d68eafcd3e5855fa3b714beb82059e0e`（###見出しから次の###直前、末尾空白を除きLF一つ）。
- HARNESS-L2-003の対応表行SHA-256: `dee278f2a45aa936f2bd0d3cef179c43c36f005168b857d7a6ef8519037c05f6`（行末LFなし）。
- 対L11 HARNESS-L2-015行SHA-256: `276967897079de3adc98153444e6a82db3303393946f39985c11182bf6e5db48`（行末LFなし）。

実装前に契約と対の検証を固定する。実装後に記録するRedは意図した欠陥を検出した証拠であり、testを書いた時刻をRedの証拠にしない。Greenは凍結したoracleを最小の実装で満たした証拠とする。局所Refactorの境界、同じoracle、Provisional上限、双方向trace、原子CIを品質・受入・Releaseと混同しない条件は保持する。

旧source `archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md:21–24`の契約先行・検証契約を起点に意味を再導出する。9/26のVの谷のPO判断は不変の原文として保持し、その現在の要求表現を本対象revisionで明確にする。未実装や旧runtimeの存在を変更理由にせず、新しい承認gateは作らない。既採択の015と003の他条件・版を保持する。

本判断は対象L2/L11の表現訂正に限る。旧source atomの移管、formal successor割当、他要求採否、L3再開、設計・実装・CIの実行、受入完了、Issue closeを生成しない。
