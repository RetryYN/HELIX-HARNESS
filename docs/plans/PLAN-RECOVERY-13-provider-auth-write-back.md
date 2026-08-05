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
mutation_oracle_evidence: "tests/independent-review-fallback.test.ts::U-IRF-010a/010Bに対し2ラウンドのmutationを実測した。(1) 実装初版: symlink検査の除去=2件Red、巻き戻し拒否の除去／空token拒否の除去／key集合一致の除去／backup作成の除去=各1件Red（5 mutation）。(2) Kimi指摘対応後: backupを固定pathへの直接書き込みへ退行=1件Red、backup作成の除去=1件Red。復元後22/22 green。なおhost置換のrenameとstaging directory内の`O_EXCL`はdefense-in-depthであり、決定的なunit testでは固定できていない（前者はatomicity、後者はstaging directoryが新規作成のため事前占有が起こらない）"
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
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-010a, test_path: tests/independent-review-fallback.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-010b, test_path: tests/independent-review-fallback.test.ts }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/independent-review-fallback.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/independent-review-fallback.ts, artifact_type: source_module }
  - { artifact_path: tests/independent-review-fallback.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-12-independent-review-fallback.md
  blocks:
    - issue:390
review_evidence:
  - reviewer: "Kimi Code CLI K3 (independent provider, write-back review)"
    review_kind: cross_agent
    reviewed_at: "2026-08-06T19:05:00Z"
    tests_green_at: "2026-08-06T19:03:00Z"
    verdict: block
    worker_model: claude-opus-5
    reviewer_model: kimi-code/k3-256k
    scope: "HEAD b45c9613の差分 d11b04d7..b45c9613 をsandbox経由でKimi K3へ渡した独立クロスレビュー。verdict=block / 1 finding（Medium、HELIX-IRF-AUTHWB-TEMP-SYMLINK）: staged path側のsymlink誘導はlstatで塞いでいるが、書き込み側のtemp／backup pathが無防備で、事前に植えられたsymlinkを追従してtargetをtruncateし、backup経由ではhost credentialの平文が任意pathへ流出し得る。実在を確認し、固定pathへの直接書き込みをやめてstaging directory（mkdtemp）内で作成しrenameで移す構造へ変更した。output_digest sha256:df42d387aa5b72fc4510de99811fc21e1e96eb7eae55c9f9bb4f716106fc98c7、findings_digest sha256:c00d316edefcac9a7b1e4008e8250240c9356d08e790111a4f13b3bfd6b87ca3、policy_digest sha256:9eba246bb88e45888d5adbec98ab030d5fe0742dfe01fbb43b2ff2712c8f760b、session session_e42df09c-921d-4e5d-89ae-b8b369eb394d。この実行自体が書き戻し実装の初回実機検証でもあり、host digestが7723c500…からb1aa8080…へ変化してstaged rotate後の値と一致した（wrote=true）。S4 admissionもv3 receiptも発行していない（advisory入力のみ）。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --configLoader runner --project fast tests/independent-review-fallback.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-06T19:03:00Z"
        evidence_path: tests/independent-review-fallback.test.ts
        output_digest: "sha256:484b227cc30e0cfdd9691adfc396cfd7874366703cb60d4c36901501b0d83a06"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-06T19:03:00Z"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
---

# PLAN-RECOVERY-13: provider 認証ローテーションの書き戻し

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
- `reclaimRotatedProviderAuth`: staging directory（`mkdtemp`）内で `O_EXCL` 作成（0600、fsync）し、
  backup → host の順に `rename` で確定させる atomic 置換。書き込み側も symlink を追従しない。
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

## 実機検証（2026-08-06）

書き戻し実装を有効にしたsandbox実行で、初回から動作を確認した。

| 対象 | 実行前 | 実行後 |
|---|---|---|
| host credential digest | `7723c500…` | `b1aa8080…` |
| staged copy digest | `7723c500…`（1.0秒） | `b1aa8080…`（2.0秒） |

`provider_auth_write_back` は `action: "write"` / `wrote: true` を返し、host digestがstagedのrotate後の
値と一致した。sandbox実行1回ごとにhost認証が失効する事象は解消している。

## Kimi K3指摘による修正（2026-08-06）

同じ実行で取得した独立レビューがMedium 1件を指摘し、実在を確認して修正した。

**HELIX-IRF-AUTHWB-TEMP-SYMLINK**: staged path側のsymlink誘導は`lstat`で塞いでいたが、書き込み側の
`.helix-tmp`／`.helix-bak`が無防備だった。固定pathへ`"w"`で開くと事前に植えられたsymlinkを追従して
targetをtruncateし、`rename`がhost credential pathをsymlink化し得る。`.helix-bak`がsymlinkの場合は
host credentialの平文が任意pathへ書き出される。読み側だけ塞いで書き側を放置しており、防御が非対称
だった。

修正は固定pathへの直接書き込みをやめ、事前に存在し得ないstaging directory（`mkdtemp`）内で`O_EXCL`で
作成し`rename`で所定pathへ移す構造にした。`rename`は宛先がsymlinkでもlink自体を置き換えるため
targetへ書き込まない。`rm`してから作り直す方式と違い、削除と作成の間に再度植えられるTOCTOU窓を
持たない。backupを固定pathへの直接書き込みへ退行させるmutationで1件Redを実測した。
