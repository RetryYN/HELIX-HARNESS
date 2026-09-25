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

## 3.0のローカル学習の追加

続けて、POはINTELLIGENCE-L1-021〜026の本文を示した（[source snapshot](../../helix-intelligence/sources/intelligence-l1-local-learning-po-original-2026-09-26.md)）。

AIの整理：
- AIは、はじめの原文の「3.0への拡張」を、L1企画案で1つの要求（HELIXINTELLIGENCE-L1-021）にまとめていた。これを、POが示した021〜026に置き換える。
- 6つの要求は、次のとおりである。
  - 領域・能力に特化したモデルの学習
  - 学習用と評価用のデータの分離
  - モデルの由来の追跡
  - 今のモデルとの比較
  - 適格な範囲の限定
  - LABOによる独立した効果の評価
- どれもConceptの1.0の土台（データの利用区分、構成版の固定と切戻し）と3.0の行に合う。


## Workerへの統一の反映（2026-09-26）

同じsessionで、POは、作業の実行主体をWorkerへ統一し、HELIXサブエージェント、エージェントレーン、Runner、Sandboxを独立した上位の概念として廃止する要求を示し、「今全部に反映する」を選んだ（未mergeのPR #2149の判断記録HDEC-WORKER-EXECUTION-MODEL-2026-09-26）。

AIの整理：
- 本PRの企画（L1）案の「Runner／Sandbox」を、Worker（実行）とSECURITY（制約とauthority）に置き換える。原文の保存は書き換えない。
- 限定の自動修復の実行はWorkerが担い、INTELLIGENCE自身をWorkerとして扱わない。Botは特定の目的に使うWorkerとして実行する（Workerの原文のRETIRE-WORKER-015、016）。

## 反映先

- [HELIX-INTELLIGENCEのL1企画案](../../helix-intelligence/L1-planning/intelligence-intent.md)を新しく作る。
- [INTELLIGENCEの候補](../../helix-intelligence/candidates/audit-bounded-repair-requirements.md)の親を、L1企画案の要求へ付け替える案を書く。
- Conceptの4.0の行と説明の段落に、INTELLIGENCEを加える。Conceptは名前の表記を改めるPR #2143と同じ行に当たるため、#2143のmerge後に本PRで改める。
