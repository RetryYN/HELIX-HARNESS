---
plan_id: PLAN-RECOVERY-13-provider-auth-write-back
title: "PLAN-RECOVERY-13: provider auth rotation write-back"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:credential ローテーション取りこぼしを Node 境界の書き戻しで直す（2026-08-06 承認）"]
created: 2026-08-06
updated: 2026-08-06
owner: Claude / AIM
github_issue_id: 390
engineering_discipline_required: true
behavior_contract_id: KIMI-REVIEW-FALLBACK-001
responsibility_owner: independent-review-fallback-router
change_slice: atomic
refactor_step: extend_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "sandbox実行で使ったstaged provider authが存在し、host credentialが読める"
contract_postconditions: "rotate済みcredentialだけがNode境界でhostへatomicに書き戻され、backupとbefore/after digestが残る。書き戻しはreviewの成否と無関係に実行される"
contract_invariants: "workerはhost auth stateを直接変更しない。書き戻し判定は純関数でfail-closeし、secret値をログ・receipt・evidenceへ書かない"
contract_failures: "staged不在、regular fileでない（symlink含む）、size上限超過、JSON objectでない、host読取不能、key集合不一致、値の型不一致、token空文字、expires_at非前進をrejectしhostを変更しない"
tdd_red_required: true
red_at: "2026-08-06T18:37:00Z"
green_at: "2026-08-06T18:38:00Z"
mutation_oracle_evidence: "tests/independent-review-fallback.test.ts::U-IRF-010A/010Bに対し5 mutationを実行し各1件以上Redを実測（symlink検査の除去=2件Red、巻き戻し拒否の除去、空token拒否の除去、key集合一致の除去、backup作成の除去=各1件Red）。復元後22/22 green"
complexity_effect: justified_positive
complexity_justification: "sandbox実行1回ごとにhost認証が失効する欠陥を閉じ、再ログインの手作業を不要にする"
removal_trigger: "provider認証が静的API keyへ移行しrotationが発生しなくなった時点で書き戻し経路を撤去する"
parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md
pair_artifact: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — 書き戻し判定と atomic 置換の実装" }
  - { role: qa, slot_label: "QA — fail-close 分岐と symlink 誘導の oracle" }
  - { role: tl, slot_label: "TL — auth surface 変更の承認境界確認" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-010A, test_path: tests/independent-review-fallback.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-010B, test_path: tests/independent-review-fallback.test.ts }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/independent-review-fallback.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/independent-review-fallback.ts, artifact_type: source_module }
  - { artifact_path: tests/independent-review-fallback.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-12-independent-review-fallback.md
  blocks:
    - issue:390
review_evidence: []
---

# PLAN-RECOVERY-13: provider auth rotation write-back

## 背景

PLAN-RECOVERY-12 で導入した Kimi review fallback は、provider auth を scratch copy として sandbox へ
渡す。この構造には rotation 取りこぼしの欠陥が**実在する**ことを 2026-08-06 に実測で確認した。

| 対象 | 観測 |
|---|---|
| staged copy | 実行開始 1.0 秒 `138ee4fe…` → 2.0 秒 `e9ebeaff…` へ変化 |
| host credential | 同区間で digest・mtime とも不変（`138ee4fe…`、size 1502） |

provider は sandbox 起動直後に refresh token をローテーションし、新しい token は破棄される scratch copy
にだけ書かれる。host には古い token が残るため、**sandbox 実行 1 回ごとに host 認証が失効する**。
2026-08-05 01:12 の `Authentication required` はこれで説明が付く。

## 決定

PO 承認（2026-08-06）に基づき、Node 境界（worker 外）での書き戻しを実装する。worker には host を
触らせない。静的 API key への移行という代替案も提示したが、別課金体系になるため採らなかった。

## 範囲

- `evaluateProviderAuthWriteBack`（純関数）: 書き戻し可否の判定。全 reject 分岐を oracle が直接通れる。
- `reclaimRotatedProviderAuth`: backup → temp（0600、fsync）→ rename の atomic 置換。
- `executeKimiFallbackReview` への配線: review の成否と無関係に、ACP 実行後に必ず回収する。
  失敗経路で回収しないと実行 1 回ごとに認証が失効し続けるため、`finally` で実行する。

## 受け入れ条件

- rotate 済み credential のみ書き戻し、無変更なら host を書かない。
- staged 不在 / regular file でない（symlink 含む） / size 上限超過 / JSON object でない /
  host 読取不能 / key 集合不一致 / 値の型不一致 / token 空文字 / `expires_at` 非前進 を
  すべて reject し、host を変更しない。
- 書き戻し時に backup を残し、中断で host credential を失わない。
- secret 値をログ・receipt・audit evidence へ書かない（digest のみ）。

## 残リスク

書き戻しは worker が書いたバイト列を host の認証面へ通す操作である。検証できるのは「形」であって
「中身の正当性」ではない。provider CLI 自体が侵害された場合、攻撃者の token を host へ固定され得る。
blast radius は当該 provider の認証に限定されるという前提で受け入れている。静的 API key へ移行すれば
この構造ごと不要になるため、`removal_trigger` に登録した。

## Kimi fallback の実運用条件（本 PLAN 範囲外）

本 PLAN は認証失効を閉じるだけであり、これだけで fallback が実運用に載るわけではない。
以下は別途必要である。

- S4 admission が未発行のため公開 command は fail-close する。発行には canonical Claude v2 receipt と
  benchmark / negative oracle の検証が要る。発行こそが真の不可逆境界である。
- provider-neutral v3 receipt は構造的に advisory-only であり、Kimi 単独で merge を通すことはできない。
- network が host transport を共有するため、security / credential / PII / release / high risk は admit しない。
