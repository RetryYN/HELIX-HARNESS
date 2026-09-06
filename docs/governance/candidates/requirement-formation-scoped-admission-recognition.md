---
status: draft_candidate
authority_status: approved_pending_canonical_promotion
approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1556#issuecomment-5555999342"
approved_revision: "0.1"
canonical_vmodel: L1-L12
canonical_layer: L12
canonical_pair: L1
version: 0.1
owner: Requirement Discovery / Authoring Admission
plan: PLAN-L3-90-requirement-formation-scoped-admission
parent_design: docs/governance/candidates/requirement-formation-scoped-admission-requests.md
pair_artifact: docs/governance/candidates/requirement-formation-scoped-admission-requests.md
---

# 運用検証候補

RFA-OP-01（RFA-BR-01）：要求取り違え、意図訂正、採用後手戻り、調査由来の設計改善を測る。
RFA-OP-02（RFA-BR-02）：PO介入回数、重複承認、承認待ち時間、監視時間、権限逸脱を併測する。
RFA-OP-03（RFA-BR-03）：無関係scopeの誤停止、stale writer拒否、成果までの時間/資源/調査費用を測る。
baseline/candidate/post-main、予測/実測/欠測、対象scope・環境・window・適用条件を分離する。
閾値はbaseline後risk別に確定し、介入削減だけやモデル間の一致を正解・成功にしない。
read-only評価から限定scopeへ段階導入し、悪化時は既存rollbackとpolicy撤回で戻す。
RFA-AC-18のE2E後も継続観測する。本書は未実測であり完成率へ加算しない。
