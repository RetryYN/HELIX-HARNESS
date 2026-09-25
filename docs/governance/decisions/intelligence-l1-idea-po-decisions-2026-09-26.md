---
title: "HELIX-INTELLIGENCE L1要求アイデアのPO提示と判断 decision record（2026-09-26）"
decision_record_id: HDEC-INTELLIGENCE-L1-IDEA-2026-09-26
decision_status: recorded
decider_role: PO
decided_at: 2026-09-26
recorded_at: 2026-09-26
source: docs/helix-intelligence/sources/intelligence-l1-idea-po-original-2026-09-26.md
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-INTELLIGENCE L1要求アイデアのPO提示と判断（2026-09-26）

## 記録の範囲

2026-09-26（Asia/Tokyo）のClaude作業sessionで、POがHELIX-INTELLIGENCEの企画（L1）の要求アイデアを示した。本書はその会話の記録である。
POの発言はそのまま引用し、AIの整理と区別する。本文の原文は[source snapshot](../../helix-intelligence/sources/intelligence-l1-idea-po-original-2026-09-26.md)に保存した。
本記録から、要求（L2）の合意、要件（L3）の承認、実装許可、release、Issue closeを生成しない。

## POの提示

POは、HELIX-INTELLIGENCE L1要求アイデアの本文を示し、「アイディアで」と述べた。

## 4.0の構成

原文は「複数機構で成立する能力」で、「将来の動的開発フロー」をBRAIN＋Product Core＋INTELLIGENCE＋OSの構成体とする。
一方、2026-09-25にPOは「4はブレインとコアとOSの複合処理」と答えており（[判断記録](po-optimal-draft-po-decisions-2026-09-25.md)）、Conceptの4.0の行もBRAIN・HELIX-HARNESS-CORE・OSの複合処理としている。
AIが、Conceptの4.0にINTELLIGENCEも加えるかを聞いたところ、POは「INTELLIGENCEも加える」を選んだ。

AIの整理：
- 4.0は、BRAIN・HELIX-HARNESS-CORE・INTELLIGENCE・OSの複合処理とする。
- INTELLIGENCEが計画の候補を出し、OSがそれを進める。これは原文のINTELLIGENCE-L1-005（計画の候補、ticketはOS）と合う。
- 2026-09-25の回答は、2.0と4.0をINTELLIGENCEへ移すかという問いへの答えだった。4.0をINTELLIGENCEだけの仕事にしないという意味は、この回答でも保たれる。

## 反映先

- [HELIX-INTELLIGENCEのL1企画案](../../helix-intelligence/L1-planning/intelligence-intent.md)を新しく作る。
- [INTELLIGENCEの候補](../../helix-intelligence/candidates/audit-bounded-repair-requirements.md)の親を、L1企画案の要求へ付け替える案を書く。
- Conceptの4.0の行と説明の段落に、INTELLIGENCEを加える。Conceptは名前の表記を改めるPR #2143と同じ行に当たるため、#2143のmerge後に本PRで改める。
