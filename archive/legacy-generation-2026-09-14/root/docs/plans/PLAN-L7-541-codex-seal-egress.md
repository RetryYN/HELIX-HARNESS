---
plan_id: PLAN-L7-541-codex-seal-egress
title: "PLAN-L7-541 (troubleshoot): Codex正規委譲経路からreceipt sealできないegress境界の入口監査"
kind: troubleshoot
layer: L7
drive: agent
status: draft
route_mode: incident
entry_signals: ["po_directive:2026-08-10 PLAN-RECOVERY-42 §5.1が約束した恒久解（Codex側でseal可能にする経路）をIssue #540として起票し設計入口を監査する"]
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
github_issue_id: 540
engineering_discipline_required: true
behavior_contract_id: GITHUB-CROSS-REVIEW-ADMISSION-001
responsibility_owner: github-cross-review-admission
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: none
contract_preconditions: "Claude著PRのcanonical receiptはCodexがsealするのが本来の経路だが、正規委譲経路（`helix codex --execute`）から実行したsealは`author_runtime_evidence_unavailable`でfail-closeする。同一workerからの`gh api`がapi.github.comへ接続できないことは実測済みだが、その原因（sandbox設定／実行環境／認証経路）は未確定である"
contract_postconditions: "到達不能の原因を実測で確定し、候補A（CI側seal）／B（host側evidence broker）／C（限定network許可）から§3の必須条件1-7を満たす案を選定して、契約とoracleを持つ実装PLANへ降ろす。本PLAN自体はcode・境界・権限を変更しない"
contract_invariants: "PLAN-RECOVERY-42が確立したattestationの検証強度を弱めない。4つのfailure codeとfail-close箇所、receipt v3のschema・digest、required check名を本PLANでは一切変更しない。調査はread-onlyであり、network境界・CI権限・token配布の実変更を伴わない"
contract_failures: "調査が原因を確定できないまま候補を選定すること、必須条件1-7のいずれかを緩めた案を採ること、action-binding approvalを経ずに外部API権限・CI権限・network境界を変更することを、本PLANの完了条件で禁じる"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "調査PLANでありcodeを追加しない。後続実装PLANが契約とoracleを持つ"
backprop_decision: not_required
backprop_decision_reason: "sandbox境界とseal実行者の責務配置に関するresearch。実装契約は後続の実装PLANでfreezeする。"
agent_slots: [{ role: aim, slot_label: "AIM — seal実行者とattestation信頼源の責務境界" }, { role: se, slot_label: "SE — sandbox network境界とCI側seal経路の実測" }, { role: qa, slot_label: "QA — 申告値検証を弱めない受入oracleの選定" }]
generates: [{ artifact_path: docs/plans/PLAN-L7-541-codex-seal-egress.md, artifact_type: markdown_doc }]
dependencies: { parent: docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md, requires: [docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md] }
---

# PLAN-L7-541: Codex 正規委譲経路から receipt を seal できない egress 境界

## §1 事象（実測）

2026-08-10、PR #536 の receipt seal を `helix codex --role reviewer --execute` 経由で Codex に
委譲したところ、`github pr-review-receipt` が **`author_runtime_evidence_unavailable` で
fail-close** した。同一 worker が実行した `gh api repos/RetryYN/HELIX-HARNESS/pulls/536/commits` は
`error connecting to api.github.com` を返しており、**当該実行では GitHub API へ到達できなかった**。

到達不能の原因として `src/runtime/adapter.ts` の `buildAdapterPlan` が `intent.execute` 時に
`--sandbox workspace-write` を渡すことが疑われるが、**「この flag が network 遮断を伴う」ことは
本 PLAN 時点で未実測**である（flag 名からの推定にすぎない）。Step 1 で sandbox 設定と実際の
network 挙動を切り分けて実測し、原因を確定する。

PLAN-RECOVERY-42 の attestation gate は、evidence 取得失敗と非正規 base64 を
`author_runtime_evidence_unavailable`、evidence 0 件を `author_runtime_evidence_missing`、
実装 commit 間の trailer 混在を `author_runtime_evidence_mixed`、申告と実測の不一致を
`author_runtime_attestation_mismatch` として区別する。本 PLAN が扱うのは
**`unavailable` に落ちる経路**であり、他 3 コードの妥当性は対象外。

## §2 なぜ塞ぐ必要があるか

HELIX の merge admission は「author と別 runtime が独立レビューし receipt を seal する」ことを前提にする。
Claude 著 PR の canonical receipt は Codex が seal するのが本来の経路だが、その Codex が harness の
正規委譲経路（`helix codex --execute`）からは seal できない。

PR #536 では、Codex が正規委譲経路とは別の lane から receipt を seal し（受理された canonical receipt =
`https://github.com/RetryYN/HELIX-HARNESS/pull/536#issuecomment-5244059263`、HEAD `7f9d4253`、
CI run 31415701899）、merge も成立した（merge commit `97eb0a5103d008eba6b612d3676aef82e5f2c956`）。
一方で正規委譲経路からの seal は同日 `unavailable` で失敗している。すなわち **本 gap は
正規委譲経路に依存した運用で顕在化する**。Step 1 では、この lane 差が何に由来するか
（sandbox 設定 / 実行環境 / 認証経路）を実測で確定する。

迂回策として author 側が seal を代行すると、Issue #514 / #534 で問題化した
「author と seal 実行者の分離」が形骸化する方向に働く。PR #536 の PO 承認例外
（レビュー実体は Codex のまま物理実行のみ Claude 代行）は恒常運用の前例にしないと
PLAN-RECOVERY-42 §5.1 に明記した（同 PR では実際には行使されていない）。

## §3 候補と必須条件

| 候補 | 内容 | 主な懸念 |
|---|---|---|
| A. CI 側 seal | harness-check（GH_TOKEN と network を持つ中立実行者）が reviewer verdict を入力に seal する | verdict 入力の真正性、CI 権限の拡大 |
| B. evidence broker | host 側の既存 Node/harness boundary が GitHub から read-only evidence を取得し、current head に束縛した証拠だけを worker へ渡す | 新規 service 化は L5 設計（新 workflow / service を追加しない）と衝突しうる。broker が author 側に属さないことの担保 |
| C. network 許可 | 特定 role/intent に限り Codex sandbox の network access を許可する | 境界緩和の blast radius、default deny 方針との整合 |

必須条件（いずれの候補でも緩めない。Step 3 で oracle 化する）:

1. `mismatch` / `missing` / `mixed` / `unavailable` の 4 コードを seal と merge の双方で fail-close する。
2. commit evidence は全ページ取得し、repository・PR 番号・current head SHA・取得時刻・digest に束縛する。
3. author 自身が evidence の出所・内容を左右できない（seal 実行者と evidence 測定者の独立性を含む）。
4. reviewer verdict と runtime / model provenance の独立性判定を弱めない。
5. `harness-check` が同一 PR・同一 HEAD で success 完了していることを受理条件に保つ。
   required check 名を増やさないだけでは既存 check の意味を弱める変更を防げないため、
   既存 check の判定内容が弱まらないことを別途 oracle で示す。
6. CI / API token を worker へ渡さない。least privilege・read-only・限定 egress・
   他 role は default deny・監査証跡を満たす。
7. 外部 API 権限・CI 権限・network 境界を変更する案は action-binding approval 対象として扱う。

## 工程表

| Step | 実行 | 内容 | 完了条件 |
|---|---|---|---|
| 1 | [並列] | Codex sandbox の network 挙動と lane 差の原因を実測、CI 側で利用可能な権限、evidence 出所の限定手段を調査 | 到達不能の原因が推定でなく実測で確定し、A/B/C の実現可能性と blast radius が示される |
| 2 | [直列] | 必須条件 1–7 を満たす候補を選定し、責務境界（誰が seal を実行し、誰が evidence を測るか）を決定 | 選定理由と却下理由が記録される |
| 3 | [直列] | 実装 PLAN（契約・oracle・Red-first）へ降下 | 後続 PLAN が verification_bindings を持つ |
| 4 | [review] | Codex 独立レビュー（author=claude のため必須） | review_evidence 記録 |

## 完了条件

- 候補 A/B/C の採否が実測根拠付きで決まる。
- 選定案が §3 の必須条件 1–7 を満たすことを示す oracle 候補が挙がる。
- PLAN-RECOVERY-42 §5.1 の「恒久解は後続 PLAN」という約束が、本 PLAN と後続実装 PLAN で閉じる。
