---
plan_id: PLAN-L6-32-mcp-profile-config-safety
title: "PLAN-L6-32 (add-design): MCP profile config and external verification safety"
kind: add-design
layer: L6
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-11
owner: Codex TL / PO
review_evidence:
  - reviewer: codex-intra-runtime-review
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-11"
    tests_green_at: "2026-06-11"
    verdict: pass
    scope: "PLAN-L6-32 close: MCP profile config/safety function contracts, U-MCPPROFILE oracles, PLAN-L7-33 implementation entry, and REVERSE-33 back-fill are present; doctor/review-evidence green."
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5-intra-runtime-review
agent_slots:
  - role: tl
    slot_label: "TL - MCP profile config / safety design"
generates:
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-00-master.md
  requires:
    - .helix/audit/A-125-mcp-external-verification-profile-scope.md
    - docs/research/mcp-external-verification-profile-research-2026-06-09.md
    - docs/plans/PLAN-REVERSE-31-codex-l7-overstep.md
---

# PLAN-L6-32 (add-design): MCP profile config と外部検証 safety

## §0 位置づけ

この PLAN は、生成される local MCP configuration、Docker MCP Toolkit profile の組み込み、profile safety lint に関する A-125 残作業の L6 entry である。PLAN-L6-31 の relation graph 作業とは意図的に分離する。graph impact は何を実行すべきかを判断し、この PLAN は外部 profile が安全で実行準備済みかを定義する。

## §1 範囲

次の function contract を設計する。

- Docker MCP Toolkit を任意の environment profile として含む、完全な verification-profile catalog row。
- committed secrets や user 固有の global mount を含めない、生成 local MCP config の rendering。
- official source、package identity、read-only / narrow toolset、workspace mount、Docker control、credential non-persistence を対象にした external profile safety analysis。
- workflow signal から probe / smoke / human-approval / refusal step へつなぐ activation planning。

## §2 入力

- Requirements §6.8.10.
- Physical-data §9.6.
- ADR-002 A-125 addendum.
- A-125 audit と research memo。
- Existing `src/lint/verification-profile.ts` first slice.

## §3 機能契約

function contract は `function-spec.md` の "MCP Profile Config / Safety Addendum" に記録する。

- `catalogVerificationProfiles`
- `renderGeneratedMcpConfig`
- `analyzeVerificationProfileSafety`
- `planExternalProfileActivation`

## §4 テスト設計

L7 pair artifact は U-MCPPROFILE-001..012 を追加する。これらの oracle は、完全な profile catalog、disabled-by-default policy、Docker MCP Toolkit の任意 profile metadata、生成 config safety、source trust、package readiness、GitHub read-only guard、Docker control、trigger routing、implicit activation の禁止を覆う。

## §5 ワークフローガード

PLAN-L7-33 に TDD Red entry があり、PLAN-REVERSE-33 を要求するまでは、Docker MCP Toolkit profile row、生成 MCP config、profile safety lint の source implementation は許可しない。

## §8 DoD

- [x] L6 function signature を記録した。
- [x] U-MCPPROFILE unit oracle を L7 unit test design に追加した。
- [x] L7 implementation PLAN がこの PLAN を参照する。
- [x] implementation back-fill 用の Reverse pairing PLAN が存在する。

status は `confirmed`。L6 entry、L7 oracle coverage、confirmed の L7 implementation route、Reverse pairing は存在する。External profile execution は、明示的な workflow evidence による gate 下に残す。
