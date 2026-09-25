---
title: "HELIX-SECURITY L1要求アイデアのPO提示と判断 decision record（2026-09-26）"
decision_record_id: HDEC-SECURITY-L1-IDEA-2026-09-26
decision_status: recorded
decider_role: PO
decided_at: 2026-09-26
recorded_at: 2026-09-26
source: docs/helix-security/sources/security-l1-idea-po-original-2026-09-26.md
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-SECURITY L1要求アイデアのPO提示と判断（2026-09-26）

## 記録の範囲

2026-09-26（Asia/Tokyo）のClaude作業sessionで、POがHELIX-SECURITYの企画（L1）の要求アイデアを示した。本書はその会話の記録である。
POの発言はそのまま引用し、AIの整理と区別する。本文の原文は[source snapshot](../../helix-security/sources/security-l1-idea-po-original-2026-09-26.md)に保存した。
本記録から、要求（L2）の合意、要件（L3）の承認、実装許可、release、Issue closeを生成しない。

## POの提示

POは、HELIX-SECURITY Core／L1要求アイデアの本文を示し、「アイディアで」と述べた。

## AIの整理

- 原文の§2〜§21を、HELIXSECURITY-L1-001〜020の企画要求にした。原文§24のとおり、§2〜§15と§21のGuardは1.0、§16〜§20は1.x（Webの開始前）とし、分類・資産のidentity・公開の区分の土台は1.0から入れる。
- 原文§23の流れは、接続の要求と構成体の要求として外へ出した。
- 旧HELIXの旧HR-NFR-P8-02（外部textの分離とinjection・exfiltrationの分類）、旧SEA候補（操作authorityの束縛と停止）、旧securityのmodule（secretの判定の単一の正本）、Capability Lease、Conceptの1.0の土台（隔離の単位、データの利用区分、構成版の固定と切戻し）を起点にした。
- 現行のHARNESSの要求案の「具体的な特権操作・credential管理はHELIX-OSが統制する」は、Conceptの機構の表（HELIX-SECURITYに資格情報）と本書に食い違う。上位のConceptに合わせ、資格情報の方針とauthorityはSECURITY、OSはそれに従う運転とする。HARNESSの要求案の文言は、後続のPRで改める。
- HELIX-SECURITYの新しいフォルダ（`docs/helix-security/`）を作る。


## Workerへの統一の反映（2026-09-26）

同じsessionで、POは、作業の実行主体をWorkerへ統一し、HELIXサブエージェント、エージェントレーン、Runner、Sandboxを独立した上位の概念として廃止する要求を示し、「今全部に反映する」を選んだ（[判断記録](worker-execution-model-po-decisions-2026-09-26.md)、PR #2149）。

AIの整理：
- 本PRの企画（L1）案の「Runner／Sandbox」を、Worker（実行）とSECURITY（制約とauthority）に置き換える。原文の保存は書き換えない。
- 制約とauthorityはSECURITYが決め、Workerの実行環境が強制する。失効の伝達先の「Runner」は「Workerの実行」にする（Workerの原文のRETIRE-SANDBOX-002、RETIRE-WORKER-012）。「Sandboxの方針」のように、隔離の技術そのものを指す語は残す（Workerの原文§7）。

## 反映先

- [HELIX-SECURITYのL1企画案](../../helix-security/L1-planning/security-intent.md)を新しく作る。
- `docs/README.md`と`docs/governance/new-generation-start-here.md`の案内は、名前の表記を改めるPR #2143のmerge後に更新する。
