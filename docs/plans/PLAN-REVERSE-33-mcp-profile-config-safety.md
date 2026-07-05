---
plan_id: PLAN-REVERSE-33-mcp-profile-config-safety
title: "PLAN-REVERSE-33 (reverse): MCP profile config and safety fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-11
owner: Codex TL / PO
forward_routing: L5
promotion_strategy: reuse-as-is
agent_slots:
  - role: tl
    slot_label: "TL - MCP profile safety fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-33-mcp-profile-config-safety.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-33-mcp-profile-config-safety.md
  requires:
    - docs/plans/PLAN-L6-32-mcp-profile-config-safety.md
    - docs/plans/PLAN-L7-33-mcp-profile-config-safety.md
---

# PLAN-REVERSE-33 (reverse): MCP profile config and safety fullback の Reverse 計画

## §0 位置づけ

将来の PLAN-L7-33 実装に対応する Reverse pairing。source implementation が存在するまでは、この PLAN は draft のままとする。

## §1 R0 証跡

L7 後に期待する証跡:

- Docker MCP Toolkit profile metadata と readiness checks。
- generated MCP config の dry-run output。
- source trust、package integrity、read-only toolsets、workspace mounts、Docker controls、credential non-persistence に関する safety findings。
- dry-run command を追加する場合の CLI smoke と evidence records。

## §2 R1 観測された Gap

分類対象として想定する gap:

- requirements §6.8.10 が、より厳密な generated-config command surface を必要とするか。
- physical-data §9.6 が、profile trust と safety findings 用の新しい projection columns を必要とするか。
- ADR-002 A-125 が、Docker MCP Toolkit profile isolation と generic MCP profiles を区別する必要があるか。

## §3 R2 整合

Forward implementation は次と整合させる:

- requirements §6.8.10;
- physical-data §9.6;
- ADR-002 A-125;
- A-125 research memo;
- IMP-121..124 と IMP-125 recovery guard。

## §4 R3 / R4

2026-06-11 時点で、MCP profile config and safety の L7 implementation evidence は存在する:

- PLAN-L7-33: complete profile catalog、Docker MCP Toolkit optional metadata、generated local config rendering、safety findings、external activation planning について、U-MCPPROFILE-001..012 は green。
- Backprop decision: lower-layer requirements / physical-data / ADR の意味変更は発見されていない。generated local config は `.helix/local/` 配下の suggestion に留まり、external execution/profile enablement は scope 外のままとする。
- Safety boundary: package installation、MCP server execution、`.vscode/mcp.json` write、committed secret、user home/global mount は導入しない。

R4 fullback outcome: Forward L7 MCP profile safety implementation はこの Reverse plan へ merge back 済みであり、追加の governance/backlog 追記は不要。

## §8 DoD

- [x] L7 implementation evidence が存在する。
- [x] 新しい lower-layer discoveries は `backprop_decision` で分類されている。
- [x] implementation が意味を変えていないため、Requirements / physical-data / ADR / backlog は変更なし。
- [x] generated local config または external profile execution が explicit approval gates を bypass しない。
