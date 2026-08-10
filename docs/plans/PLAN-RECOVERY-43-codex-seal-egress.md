---
plan_id: PLAN-RECOVERY-43-codex-seal-egress
title: "PLAN-RECOVERY-43 (troubleshoot): Codex正規委譲経路からreceipt sealできないegress境界の入口監査"
kind: troubleshoot
layer: cross
drive: agent
status: draft
route_mode: incident
entry_signals: ["po_directive:2026-08-10 PLAN-RECOVERY-42 §5.1が約束した恒久解（Codex側でseal可能にする経路）をIssue #540として起票し設計入口を監査する"]
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
github_issue_id: 540
backprop_decision: not_required
backprop_decision_reason: "sandbox境界とseal実行者の責務配置に関するresearch。実装契約は後続の実装PLANでfreezeする。"
agent_slots: [{ role: aim, slot_label: "AIM — seal実行者とattestation信頼源の責務境界" }, { role: se, slot_label: "SE — sandbox network境界とCI側seal経路の実測" }, { role: qa, slot_label: "QA — 申告値検証を弱めない受入oracleの選定" }]
generates: [{ artifact_path: docs/plans/PLAN-RECOVERY-43-codex-seal-egress.md, artifact_type: markdown_doc }]
dependencies: { parent: docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md, requires: [docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md] }
---

# PLAN-RECOVERY-43: Codex 正規委譲経路から receipt を seal できない egress 境界

## §1 事象（実測）

`helix codex --role <role> --execute` は Codex を `--sandbox workspace-write` で起動する
（`src/runtime/adapter.ts` の `buildAdapterPlan`）。この sandbox は network を既定で遮断するため、
Codex worker から `api.github.com` へ到達できない。

PLAN-RECOVERY-42 が導入した authorRuntime attestation gate は、PR head commits の
`Co-Authored-By: Claude` trailer を GitHub API で実測して申告 `authorRuntime` と突き合わせる。
そのため **Codex worker が `github pr-review-receipt` を実行する経路では、常に
`author_runtime_evidence_unavailable` で fail-close する**（2026-08-10 PR #536 で実測。
Codex は fail-close を迂回せず停止した）。

## §2 なぜ塞ぐ必要があるか

HELIX の merge admission は「author と別 runtime が独立レビューし receipt を seal する」ことを前提にする。
Claude 著 PR の canonical receipt は Codex が seal するのが本来の経路だが、その Codex が harness の
正規委譲経路からは seal できない。

- PR #536 では Codex が別 lane（network を持つ経路）で seal・merge できたため実害は出なかった。
  つまり本 gap は **正規委譲経路に依存した運用でのみ顕在化**する。
- 迂回策として author 側が seal を代行すると、Issue #514 / #534 で問題化した
  「author と seal 実行者の分離」が形骸化する方向に働く。PR #536 の PO 承認例外
  （レビュー実体は Codex のまま物理実行のみ Claude 代行）は恒常運用の前例にしないと
  PLAN-RECOVERY-42 §5.1 に明記した。

## §3 候補と評価軸

| 候補 | 内容 | 主な懸念 |
|---|---|---|
| A. CI 側 seal | harness-check（GH_TOKEN と network を持つ中立実行者）が reviewer verdict を入力に seal する | verdict 入力の真正性、CI 権限の拡大 |
| B. evidence 注入 | seal に commit evidence を file で渡せるようにする | 注入者が信頼できないと attestation が無意味化する。出所を CI 等へ限定する仕組みが要る |
| C. network 許可 | 特定 role/intent に限り Codex sandbox の network access を許可する | 境界緩和の blast radius。ADR-009/010 の default deny 方針との整合 |

必須条件（いずれの候補でも緩めない）:

1. 申告 `authorRuntime` の検証強度を PLAN-RECOVERY-42 より弱めない。
2. author 自身が attestation の evidence 出所を左右できない。
3. 新 required check 名を増やさない。

## 工程表

| Step | 実行 | 内容 | 完了条件 |
|---|---|---|---|
| 1 | [並列] | A/B/C 各候補の実測（Codex sandbox の network 挙動、CI 側で利用可能な権限、evidence 出所の限定手段） | 各候補の実現可能性と blast radius が実測で示される |
| 2 | [直列] | 必須条件 1–3 を満たす候補を選定し、責務境界（誰が seal を実行し、誰が evidence を測るか）を決定 | 選定理由と却下理由が記録される |
| 3 | [直列] | 実装 PLAN（契約・oracle・Red-first）へ降下 | 後続 PLAN が verification_bindings を持つ |
| 4 | [review] | Codex 独立レビュー（author=claude のため必須） | review_evidence 記録 |

## 完了条件

- 候補 A/B/C の採否が実測根拠付きで決まる。
- 選定案が §3 の必須条件 1–3 を満たすことを示す oracle 候補が挙がる。
- PLAN-RECOVERY-42 §5.1 の「恒久解は後続 PLAN」という約束が、本 PLAN と後続実装 PLAN で閉じる。
