---
status: draft_candidate
authority_status: approved_pending_canonical_promotion
approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1556#issuecomment-5555999342"
approved_revision: "0.1"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
version: 0.1
owner: Requirement Discovery / Authoring Admission
plan: PLAN-L3-90-requirement-formation-scoped-admission
parent_design: docs/governance/candidates/requirement-formation-scoped-admission-intake.md
pair_artifact: docs/governance/candidates/requirement-formation-scoped-admission-recognition.md
---

# 根拠付き要求形成・影響限定再確定：目的と要求候補

本書は#1556の候補。承認policyの発効、runtime実装許可、既存承認の変更ではない。
未承認の意味はcurrent Requirement IRや実行policyへ投影しない。

| 要求 | 目的・期待結果 | L3要件 |
|---|---|---|
| RFA-BR-01 | 目的・前提・選択肢を証拠で整理し、利用者意図の取り違えと監視負担を減らす | RFA-RF-01..04 |
| RFA-BR-02 | 委任済み意図の技術的具体化を反復承認なしで進め、未委任の意味・権限は保護する | RFA-RC-01..04 |
| RFA-BR-03 | 影響する要求・検証・writerだけを再確定し、無関係な有効作業を継続する | RFA-RC-05, RFA-GH-01..03 |

企画⇔前提整理⇔要求候補⇔調査/限定PoC/画面・動画プロト/反応⇔比較・選択・検証
→L3/L10差分→有効な採否根拠の照合→技術的freeze→IR、という反復であり全件直列ゲートではない。
WPの調査不足・意図逸脱は利用者報告として保持し、個別原因の確定・再現済み不具合とはしない。

人間の採否・選択、要件承認、技術評価、実行認可を分離する。「判断」は半永続的な設計判断をADRに記録する
文脈で用い、既存schemaのdecision名はそのまま参照する。相談・叱責・曖昧なGOを指示や承認に昇格しない。
AIは指示を理由に整合性検討を放棄しない。プロジェクト意味は要求/設計に、長期再利用知識は既存Learning/Skillに、
一時連絡だけをcoordination memoryへ置く。

非対象はHELIXWeb、独立Research/Approval/Requirement Engine、新DB/scheduler/route、
全体plannerの保留解除、Lite全面移植、外部公開・課金・破壊操作の包括認可、独立review/gate削除。
既存CI高速化・Recovery・Cursor限定実行を本候補の完成待ちへ一括変更しない。
