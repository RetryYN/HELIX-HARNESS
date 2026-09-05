---
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
canonical_layer: L3
canonical_pair: L10
plan: PLAN-L3-91-design-grounding-human-convergence
parent_design: docs/governance/candidates/design-grounding-human-convergence-requests.md
pair_artifact: docs/governance/candidates/design-grounding-human-convergence-acceptance.md
---

## 目的と境界
既存Design Harnessを再実装せず、Design Grounding / Human Reaction Semantics / Design Convergenceを要求候補として追加する。#1556/#1557の要求形成をDesignへ投影する。要求受付は自動承認policyの発効・runtime完成ではない。

## 実装調査（main 4667d601）
src/design/screen-applicability.ts に recordWalkthroughIteration / evaluatePrototypeAgreement / validateRequirementsBackprop が存在。現行agreementは反復完結・human approved・revisionを検査するが、今回の設計軸ごとの受容状態や8分類をその検査と同一視しない。
src/design/design-registry.ts と src/design/ui-domain-pattern-profile.ts にrevision/authority/trace/profileの既存機構がある。既存store/transaction/gateを再利用し、別Engine/Registry/Research subsystemを作らない。これは静的調査でありE2E完成の証明ではない。

## 最適化する要求
- DG-R-01..04: 前提6状態 KNOWN/SUPPORTED/CONTESTED/UNKNOWN/STALE/NOT_APPLICABLE、論点別調査義務、Evidence→設計含意→採否理由→未解決trace。件数やモデル知識で充足しない。#1556の共通Premise契約をDesignへ投影する。
- HR-R-01..04: 反応原文とAI分類proposalを分離し、OBJECTIVE_DEFECT/USABILITY_PROBLEM/INTENT_MISMATCH/VISUAL_PREFERENCE/CONTENT_SEMANTIC_MISMATCH/INSUFFICIENT_RESEARCH/PROTOTYPE_COMMUNICATION_FAILURE/UNRESOLVEDを複数選択可能とする。分類と根拠を保持し、拒否を全再生成へ短絡しない。客観欠陥、見せ方不足、要求不一致、選好で既存還流先を区別する。
- DC-R-01..04: stable axis IDごとのACCEPTED/REJECTED/UNRESOLVED/NOT_EVALUATED、受容軸の退行、finding lineage・再発・別原因を追跡する。blocking findingなし、受容軸退行なし、人間意味の未解決が明示された許容範囲内、客観証拠green、current revision一致をANDで検査する。許容範囲をAIが発明しない。
- 人間の原文はproject-owned設計証拠へ保存しAI解釈と別digest/参照を持つ。harness memoryや個人profileへ永続化しない。機密原文はアクセス制御された既存証拠保管へ、公開Issue/ログへ複製しない。
- objective UX greenとhuman preference rejectを同時保持する。承認済みconstraint/profile内はscope/revision/取消を検証し毎回再承認しない。未委任の美観・ブランド・表現意味をモデル単独で採用しない。
- L3前の限定research/PoC/prototypeを許可する既存契約を利用し、候補から本実装authorityへ越境しない。予算・反復上限・期限到達は未解決として終端し、合格へ読み替えない。
- Issue階層と形成状態を分離。Requirement/Design problem/Evidence/Prototype revisionへのtrace、影響scope限定保留、stale/差替え拒否を維持する。
- 原稿§9のdogfood後canonical化は是正する。候補→必要な承認・canonical L1/L3/L10→#397 IR→設計・runtime→検証・dogfood→改版還流。事前PoCと本実装を区別する。
- Fullでの検証とLite consumer-safe subsetは別受入。自動Lite昇格・公開はしない。
