---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "Codex native worker routing要件"
layer: L3
kind: add-design
status: confirmed
created: 2026-08-21
updated: 2026-08-21
owner: PO / Codex TL
plan: PLAN-L3-63-codex-native-worker-routing
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/codex-native-worker-routing-acceptance.md
next_pair_freeze: L10
refines:
  - HR-FR-HIL-08
  - HR-FR-HIL-21
  - HR-FR-HIL-22
---

# Codex native worker routing要件

## §0 authorityと責務境界

本書はIssue #624のPO決定を、frozen baselineを改変しないRequirement IR refinementとして正本化する。
Codex resident laneの主経路はSol親/TLであり、Lunaはその内部で動くnative workerである。Grok Build／Cursor
resident lane、Claude独立review lane、Grok／Cursor／KimiのCLI worker補完は別契約であり、Lunaと同一laneへ
畳み込まない。

primary system contractはagent team、lease、authority分離を所有する`HR-FR-HIL-08`とする。生成agent contractは
`HR-FR-HIL-21`、model／effortの測定と再routeは`HR-FR-HIL-22`をrelated ownerとしてrefineする。

### CNW-FR-001 Sol親TLとLuna native workerのpolicy routing

Codex resident laneは、親TLとnative workerを別identity、別authority、別receipt fieldとして扱い、current
policyから導出したbounded workerだけをspawnしなければならない。

#### CNW-R-01 親TL identity

`gpt-5.6-sol`はCodex resident laneの親TL／管制に限定する。Solはscope、branch、lease、evidence、Claudeへの
review handoff、merge、Issue terminalを所有し、native subagentとしてspawnしない。

#### CNW-R-02 native worker identityとeffort

Codex native workerのcurrent exact identityは`gpt-5.6-luna`、reasoning effortは`xhigh`とする。Lunaは
bounded taskの調査、実装、targeted test、proposal handbackを担うが、closing、merge、Issue close、独立review
authorityを取得しない。

#### CNW-R-03 policy-derived spawn admission

spawn admissionはparent runtime、worker role、task本文、ownership、allowed／forbidden path、隔離worktree、
policy version／digestを検査する。callerがmodelを直接指定するarbitrary overrideは拒否を維持し、HELIX policyが
Luna＋`xhigh`を導出した場合だけeffective model／effortへ投影する。

#### CNW-R-04 current identityの退役

`gpt-5.6-terra` workerとSol subagent routeをcurrent dispatch候補から除外する。過去PLAN、receipt、audit、価格履歴は
historical evidenceとして保持し、削除やLuna identityへの書換えを行わない。Lunaが利用不能な場合にTerraへsilent
fallbackせず、bounded queue、別runtime提案、または明示failureへ遷移する。

#### CNW-R-05 handbackと独立review

Luna出力はSolへproposalとして返し、Solがscope、diff、test、receiptを再検証する。Claude独立reviewはcandidate
exact HEADへ束縛し、worker自身または同一identityの自己reviewで代替しない。receiptはparent、worker、reviewer、
effective model／effort、policy digest、candidate HEADを別fieldで保持する。

## §1 非対象

- Grok Build／Cursor resident laneの追加。
- Grok／Cursor／Kimi CLI workerのsandbox契約。
- `helix team run`／`pair-agent`の全面廃止。
- release、tag、distribution cutover。
