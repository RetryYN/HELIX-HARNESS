---
title: "PRの原子性とL3／L10のPR単位 decision record（2026-10-05）"
decision_record_id: HDEC-PR-ATOMICITY-UNIT-2026-10-05
decision_status: recorded
decider_role: PO
decided_at: 2026-10-05
recorded_at: 2026-10-05
source_repository_revision: b0a3dd29bfb93336963bfa2f77ef12b0e48bdeee
authority_effect: effective_when_this_record_is_admitted_to_main
---

# PRの原子性とL3／L10のPR単位（2026-10-05）

## 記録の範囲

2026-10-05（Asia/Tokyo）のClaude作業session（`review_merge` lane、session `66d9c527-e899-4091-b8bb-240e5cdce85e`）で、
POがPR #2564の大きさを原子PR原則に照らして問い、運用ルールとして整備するよう指示し、AIの問いに対してL3／L10のPR単位を選んだ。
本書はその記録である。POの発言と選択はそのまま引用し、AIの整理と区別する。POが選んだ選択肢は、選択肢の説明文も含めてPOが選んだ内容として扱う。
本記録から、要求（L2）の合意、要件（L3）の承認、実装許可、release、Issue closeを生成しない。#2564のL3／L10草稿の採否も決めない。

## POの指示

AIが#2564の進みの遅さについて、connectorの戻し規則が消費側の親ごとに書き写されている構造を報告した後の、POの問い：

> PRのサイズが大きいじゃないの？原子PR原則があるのに。

AIが、現行規則（`github-upstream-operating-model.md`のPR class表`design_verification`行と「要求PRは原則として一つの要求identityだけを扱う」）と旧HELIXの「原則5: 1 PR = 1 変更目的」に照らして#2564が範囲違反であることを報告し、分割を提案した後の、POの指示：

> 運用ルールとして整備すること。

## AIの問いとPOの選択

PR #2570の独立review（Codex、`M2570-02`）が、利用者の起草指示`scaffold/review-handoff/local/codex-goals-2026-10-03-l3.md`
（SHA-256 `3561eb221023220ccd6dda9ace008882851eac343ca76611742b07b2e30703e5`）のL3-G1「機構ごとまたは依存のまとまりごとにPRを分けてよい」と、
AIが最初に起草した「1要求 = 1 PR」との適用関係が未整理であると指摘した。AIはこれを受けて次のように問うた。

AIの問い：

> L3/L10のPRは、どの単位で1つにする？（#2564は8機構・全Stageの274件が1つのPRになってて、どの単位にしても分割が必要）

選択肢（POが選ばなかったもの）：

- 「1要求 = 1 PR」：現行のPR class表（:47）を文字どおりに守る。PRは274本になる。ゴール文書の「機構ごとに分けてよい」より厳しい。
- 「依存のまとまり」：ゴール文書の「依存のまとまりごと」。機構をまたいでもいい（例：HARNESS-010/011/023の共通pack契約）。まとまりの切り方はCodexが決める。

POの選択：「機構×Stage（推奨）」

> PO承認の単位（機構またはStageのまとまり）と同じ。ゴール文書のL3-G1にも合う。1本のPRは数件〜数十件の要求になる。例：CONNECT Stage 1。

## AIの整理

- POの選択により、`design_verification`のL3／L10を一つのPRで扱う範囲の上限を、一つの機構の一つのStageに属する承認要求のpair群とする。
  Stageは要求段階の対応順序案とその追補が定めるStageである。
- 起草指示のL3-G1「機構ごとまたは依存のまとまりごと」は分けてよい単位を示し、上限を定めていない。本選択は、その中から
  「機構×Stage」を上限として選んだものである。起草指示の「承認は機構またはStageのまとまりごとに受ける」とPRの範囲を揃える。
- PRの中でも要求identityごとにL3とL10の対を分けて書き、PO承認の記録方法（対象L3／L10のexact revisionとSHA-256を固定した判断記録）は変えない。
- 本選択を反映する運用本文は[GitHub上流運用モデル](../github-upstream-operating-model.md)の「PRの原子性」節とPR class表の`design_verification`行である。
  旧HELIXとの対応（旧source、保持する点、変更する点、理由）は同節に記録する。
- #2564の扱いは本記録で決めない。#2564のreview（範囲違反B1）と切り出しは、同PRのreviewと作成側の対応で進める。
