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
既存Design Harnessを再実装せず、Design Grounding / Human Reaction Semantics / Design Convergenceを要求候補として追加する。#1556/#1557の要求形成をDesignへ投影する。[L3-PO-1558-001](https://github.com/RetryYN/HELIX-HARNESS/issues/1558#issuecomment-5556057236)でL3候補承認済みだがcanonical未昇格であり、自動承認policyの発効・runtime完成ではない。候補status語彙の正本化は#1580で追跡する。

## 実装調査（main 4667d601）
src/design/screen-applicability.ts に recordWalkthroughIteration / evaluatePrototypeAgreement / validateRequirementsBackprop が存在。現行agreementは反復完結・human approved・revisionを検査するが、今回の設計軸ごとの受容状態や8分類をその検査と同一視しない。
src/design/design-registry.ts と src/design/ui-domain-pattern-profile.ts にrevision/authority/trace/profileの既存機構がある。既存store/transaction/gateを再利用し、別Engine/Registry/Research subsystemを作らない。これは静的調査でありE2E完成の証明ではない。

## 最適化する要求
- **DG-R-01 前提評価**：Design candidate生成前にRequirement、Design、画面、技術・ブランド制約、利用文脈、実装、外部事例を論点に分け、KNOWN / SUPPORTED / CONTESTED / UNKNOWN / STALE / NOT_APPLICABLEを根拠とともに保持する。既知という自己申告を十分な検証と同一視しない。
- **DG-R-02 調査義務**：不足論点から公式規範、実サービス、OSS/Design System、類似製品、自repo UI、a11y、responsive/performance、UX先行事例の必要性を導出する。不要な調査を一律要求せず、未調査の必要論点を件数で相殺しない。
- **DG-R-03 根拠充足**：論点→Evidence→設計含意→採用/非採用理由→未解決点を追跡する。必要証拠が不足する場合はRESEARCH_REQUIRED / POC_REQUIRED / HUMAN_CONTEXT_REQUIRED等を理由付き候補として返し、モデルの事前知識だけでDesign Readyにしない。有効な既存証拠の再利用は許可する。
- **DG-R-04 共通契約への投影**：#1556のPremise/Research契約を再利用するDesign adapterとして設計し、別Premise engine・Research subsystemを作らない。共通契約の未実装をDesign完成と数えず、接続に必要なsliceだけ依存化する。
- **HR-R-01 原文と解釈**：人間反応原文を改変せずproject-owned evidenceへ保持し、AI分類・原因仮説と別の参照/digestにする。機密・保存期限・アクセス境界は既存証拠policyに従い、個人profileやharness memoryへ流用しない。
- **HR-R-02 複数分類**：OBJECTIVE_DEFECT / USABILITY_PROBLEM / INTENT_MISMATCH / VISUAL_PREFERENCE / CONTENT_SEMANTIC_MISMATCH / INSUFFICIENT_RESEARCH / PROTOTYPE_COMMUNICATION_FAILURE / UNRESOLVEDを複数選択可能とし、各分類の根拠と対象revisionを保持する。曖昧な反応を無理に単一分類しない。
- **HR-R-03 意味authority**：AI分類はproposalであり原文・Requirement・人間承認を変更できない。客観欠陥は実証し、美観・ブランド・表現は有効な人間選択/constraintへ束縛する。objective greenとhuman rejectを同時保持する。
- **HR-R-04 再作業の限定**：調査不足はResearch、見せ方不足はPrototype表現、意図不一致はRequirement/Design Re-entry、客観欠陥は対象設計/実装、選好は比較Prototypeへ返す。分類を既存typed routeに接続し、新しい並列制御系や一律全再生成を作らない。
- **DC-R-01 軸状態**：Prototype revisionごとにstable axis IDでTypography、Density、Layout、Navigation、Motion、Card構造等を識別し、ACCEPTED / REJECTED / UNRESOLVED / NOT_EVALUATEDを保持する。軸を固定enumだけに限定せず、名前変更で同一性や受容履歴を失わない。
- **DC-R-02 受容軸の退行**：後続revisionが既受容軸を破壊した場合、変更根拠のRequirement/Evidenceと適用authorityがなければ退行として検出する。新Evidenceの存在だけを新しい好みの承認に読み替えず、scope内の正当な改版と無根拠変更を分離する。
- **DC-R-03 Finding系譜**：発生→仮説→修正→次revision→解消/再発/別原因をstable identityと関係edgeで追跡する。再発を新規IDで隠さず、別原因を同一findingへ強制統合せず、曖昧なら未解決を維持する。
- **DC-R-04 収束評価**：blocking findingなし、受容軸退行なし、人間意味の未解決が明示された許容範囲内、必要客観証拠green、current revision/provenance一致をANDで検査する。単一approveやモデル自己評価では代替しない。許容範囲をAIが発明しない。
- 人間の原文はproject-owned設計証拠へ保存しAI解釈と別digest/参照を持つ。harness memoryや個人profileへ永続化しない。機密原文はアクセス制御された既存証拠保管へ、公開Issue/ログへ複製しない。
- objective UX greenとhuman preference rejectを同時保持する。承認済みconstraint/profile内はscope/revision/取消を検証し毎回再承認しない。未委任の美観・ブランド・表現意味をモデル単独で採用しない。
- L3前の限定research/PoC/prototypeを許可する既存契約を利用し、候補から本実装authorityへ越境しない。予算・反復上限・期限到達は未解決として終端し、合格へ読み替えない。
- Issue階層と形成状態を分離。Requirement/Design problem/Evidence/Prototype revisionへのtrace、影響scope限定保留、stale/差替え拒否を維持する。
- 原稿§9のdogfood後canonical化は是正する。候補→必要な承認・canonical L1/L3/L10→#397 IR→設計・runtime→検証・dogfood→改版還流。事前PoCと本実装を区別する。
- Fullでの検証とLite consumer-safe subsetは別受入。自動Lite昇格・公開はしない。
