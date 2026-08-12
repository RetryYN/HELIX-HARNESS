---
plan_id: PLAN-RECOVERY-52-closure-probe-reentrancy-closure
title: "PLAN-RECOVERY-52 (recovery): closure probe の再入検知を集合と正規化で閉じる"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-11 PO 指示「別途イシュー回収をしてくれ」。Issue #548（closure probe 再入検知に間接再入 A→B→A と symlink の false negative が残る）を自走で解消する"
created: 2026-08-11
updated: 2026-08-12
owner: Claude / TL
github_issue_id: 548
engineering_discipline_required: true
behavior_contract_id: CLOSURE-EVIDENCE-PROBE-REENTRANCY-001
responsibility_owner: closure-evidence-probe
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: policy
backprop_decision: not_required
backprop_decision_reason: "再入を fail-close するという契約自体は PLAN-L7-548 のまま変更しない。変更するのは同一 repository を同一と判定できる範囲であり、要件・設計契約の追加ではない"
contract_preconditions: "marker HELIX_CLOSURE_EVIDENCE_PROBE_ACTIVE_ROOT は単一の絶対 path で、子 probe が自分の root で上書きする。判定は resolve() 同士の一致のみ。そのため A→B→A の間接再入は 3 段目で activeRoot=B ≠ A となり素通りし、元のハングが再現する。また resolve() は symlink を解決しないため、marker が symlink 経由の path を持つ場合に別 root と誤認する"
contract_postconditions: "marker は active root の集合 (JSON 配列) とし、子 probe は上書きせず追記する。判定は集合への membership とする。比較 key は marker 側・現 root 側の双方を、存在する場合のみ realpath へ寄せて正規化する。marker を JSON として解釈できない場合は非再入を証明できないため fail-close する"
contract_invariants: "同一 root の直接再入を fail-close する挙動、exit code 2、stderr の reentrant execution blocked、証跡未出力、marker 未設定時に通常実行できることをいずれも変更しない"
contract_failures: "同一 root の直接再入、集合内の別 root 経由で戻る間接再入、marker が symlink 経由 path で現 root が実体 path の組、解釈不能な marker はすべて exit 2 で fail-close する"
tdd_red_required: true
red_at: "2026-08-12T01:52:41Z"
green_at: "2026-08-12T01:58:07Z"
mutation_oracle_evidence: "oracle は tests/cli-surface.test.ts::U-CLOSPROBE-001 に置き、実行は `npx --no-install vitest run tests/cli-surface.test.ts -t 'U-CLOSPROBE-001|U-CLOSURE-PROBE-REENTRANCY-001'`。seeded defect 2 種を src/cli.ts へ 1 件ずつ注入し、各 mutant が単独で killed になることを実測した。M-1（closureEvidenceProbeChildActiveRoots の追記を [key] の上書きへ戻し、間接再入の穴を復元）→ U-CLOSPROBE-001 が 1 failed で killed。M-2（closureEvidenceProbeRootKey から realpathSync を外し symlink の穴を復元）→ 同 oracle が 1 failed で killed。両 mutant とも既存 U-CLOSURE-PROBE-REENTRANCY-001 は passed のままであり、既存 oracle がこの 2 経路を fence していなかったこと（= 新 oracle が必要であること）も同じ実測で示している。全 mutant 復元後は 2 oracle とも passed。なお M-2 は当初 survive した。原因は process.cwd() が既に実体 path を返すため symlink が marker 側からしか入らないことで、初版実装は現 root 側しか正規化しておらず穴が残っていた。marker 側の正規化を追加し、oracle も marker 経由へ書き換えたうえで killed を確認した"
complexity_effect: net_neutral
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-CLOSPROBE-001, test_path: tests/cli-surface.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 2 つの false negative の到達経路の特定" }
  - { role: se, slot_label: "SE — marker の集合化と両側の realpath 正規化" }
  - { role: qa, slot_label: "QA — 間接再入・symlink・解釈不能 marker の負例" }
  - { role: tl, slot_label: "TL — fail-close 方向と互換性影響の判定" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-52-closure-probe-reentrancy-closure.md, artifact_type: markdown_doc }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
dependencies:
  parent: null
  requires: []
  blocks:
    - issue:548
review_evidence:
  - reviewer: "Codex / GPT-5"
    review_kind: cross_agent
    tests_green_at: "2026-08-11T22:55:11Z"
    reviewed_at: "2026-08-11T22:56:07Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: gpt-5
    scope: "PR #573 HEAD 7ae911a602788229af3d8497edaaf1ef8e118b92 を clean isolated worktree で独立レビューした。closure probe の active-root 集合化、marker/current root の双方の realpath 正規化、JSON 解釈不能時の fail-close、直接・間接・symlink・parse failure の oracle を照合した。既存 exit 2／reentrant execution blocked／証跡未出力の契約を維持し、correctness・security・data-loss blocker 0 と判定した。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/cli-surface.test.ts -t \"U-CLOSPROBE-001|U-CLOSURE-PROBE-REENTRANCY-001\" --reporter=dot"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-11T22:55:11Z"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:928f7d13096655cc0040ca7976f252d4c02db6630c7b11a2705b733dede4e8cf"
        result: "2 passed / 86 skipped"
---

# PLAN-RECOVERY-52：closure probe の再入検知を集合と正規化で閉じる

## §1 なぜ recovery か

PLAN-L7-548 が導入した再入 fail-close は、契約（`contract_failures`）の文言としては「再入 marker が同一 repo へ解決した場合」を満たしている。しかし安全 gate として見ると **false negative が 2 つ残り、防ごうとした元のハングが再現しうる**。契約違反ではないが gate が守れていないため recovery とする。

## §2 残っていた 2 つの穴

### §2.1 間接再入（A→B→A）

marker は単一値で、子 probe は自分の root で上書きする。

1. repo A の probe が marker=A で子を起動
2. その中で別 root B の probe が走る（`activeRoot=A ≠ B` で通過し marker を **B へ上書き**）
3. さらにその中で A の probe が走る（`activeRoot=B ≠ A` で通過）→ **A の再入が成立**

### §2.2 symlink 経由の誤認

`resolve()` は symlink を解決しない。marker と現 root が同一 repository を指していても、片方が symlink 経由なら別 root と判定する。

## §3 実装

### §3.1 marker を集合にする

marker を JSON 配列とし、子へ渡す際は上書きではなく追記する。

```ts
function closureEvidenceProbeChildActiveRoots(repoRoot: string): string {
  const active = parseClosureEvidenceProbeActiveRoots(process.env[ENV]);
  const key = closureEvidenceProbeRootKey(repoRoot);
  const next = active === null ? [key] : [...active, key];
  return JSON.stringify([...new Set(next)].sort());
}
```

判定は membership へ変える。**marker を JSON として解釈できない場合は fail-close する**（非再入を証明できないため）。

### §3.2 両側を正規化する

**当初は現 root 側だけを realpath へ寄せたが、それでは穴が残る。** `process.cwd()` は実体 path を返すため、**symlink は marker 側からしか入らない**。外部が symlink 経由の path を marker へ入れた場合、片側だけの正規化では依然として別 root と誤認する。

```ts
const key = closureEvidenceProbeRootKey(repoRoot);
return active.some((entry) => closureEvidenceProbeRootKey(entry) === key);
```

`closureEvidenceProbeRootKey` は存在する path のみ `realpathSync` を通し、存在しない場合は `resolve` のみとする（probe 対象が未作成でも判定を落とさない）。

## §4 検証

`U-CLOSPROBE-001`（`tests/cli-surface.test.ts` の既存 reentrancy oracle を拡張）で 4 分岐を押さえる。

1. 同一 root の直接再入 → exit 2（既存挙動の維持）
2. **別 root の marker 配下で実行 → 通過し、子 marker が両 root を含む**（上書きなら 1 件しか入らない）
3. **marker が symlink 経由 path、現 root が実体 path → exit 2**
4. 解釈不能な marker → exit 2（fail-close）

### §4.1 mutation

| mutant | 内容 | 結果 |
|---|---|---|
| M-1 | 追記を上書きへ戻す | `U-CLOSPROBE-001` **killed** |
| M-2 | `realpathSync` を外す | `U-CLOSPROBE-001` **killed** |

**M-2 は当初 survive した。** その理由が §3.2 の設計誤りそのもの（現 root 側しか正規化していなかった）であり、mutation を取らなければ「symlink 対応済み」と誤って報告するところだった。marker 側の正規化を追加し、oracle も marker 経由の負例へ書き換えて killed を確認した。

## §5 互換性

旧形式（bare path）の marker は JSON として解釈できないため **fail-close 側に倒れる**。marker を設定するのは本 CLI 自身だけであり、新実装は常に JSON を書くため、混在は旧 binary から起動された子 probe に限られる。過剰に block する方向であり、ハングを許すよりは安全であるため許容する。1 世代で自然に解消する。

## §6 範囲外

- probe の実行そのもの（command 選択、証跡 schema、出力）には触れない
- `src/cli.ts` 全体 digest を pin している設計文書の再 pin が必要になる場合、その維持コスト自体は Issue #360 の所見 3 として別途追跡中であり、本 PLAN では扱わない
