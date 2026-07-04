---
schema_version: skill.v1
name: security-and-hardening
skill_type: verification
applies_to:
  layers:
    - L3
    - L5
    - L7
    - L8
    - L9
    - L10
    - L11
    - L12
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Retrofit
    - Refactor
---

# security and hardening（セキュリティと hardening）

依存 supply-chain の衛生、secret redaction 検証、Biome security-lint rule、
runtime surface reduction をまとめて確認する hardening pass の手順。
これは escalation boundary と agent-guard design を扱う `security.md` とは分ける。
この skill は、PLAN が accept gate を越える前に L7 以上で適用する体系的な hardening sweep を扱う。

## この skill を読む条件

- PLAN が runtime dependency を追加または更新する（`package.json` 変更）。
- Retrofit または Refactor PLAN で、hardened surface が広がっていないことを示す必要がある。
- dependency 変更後に `ut-tdd guardrail` が non-zero で終了する。
- harness release（L11/L12）で full hardening attestation が必要。

## Hardening sweep checklist（実行手順）

accept gate 前に次の順で実行する:

```
ut-tdd guardrail          # 全 text file の secret pattern scan
bun run lint              # Biome check: security-adjacent lint rule を含む
bun run test              # Vitest: fixture file が credential を漏らしていないことを確認
ut-tdd doctor             # structural governance: orphaned hook / agent path が無いことを確認
```

### 1. Dependency supply-chain の確認

`package.json` の新規または更新 entry ごとに確認する:

- [ ] package が既知の registry（npmjs.com）から来ていることを確認する。PO 承認なしに
      `file:`、`git+ssh:`、`http:` protocol reference を使わない。
- [ ] `bun audit`（または同等手段）を実行し、critical / high severity advisory が 0 件であることを確認する。
      advisory がある場合は、accept 前に `docs/design/L5/<plan-id>-dependency-risk.md` へ accepted risk を記録する。
- [ ] version pin が floating range でないことを確認する（`^x.y.z` は可。
      production dependency で `*` または `latest` は禁止）。

### 2. Secret and credential redaction の確認

- [ ] `ut-tdd guardrail` が 0 で終了する。committed file に API key pattern、session token、
      personal absolute path が無いこと。
- [ ] `.env*` file が `.gitignore` に載っていること、`.env` が tracked でないことを確認する。
- [ ] Vitest fixture に real credential-like string が無いこと。
      `"FAKE_KEY_FOR_TESTING"` sentinel string を使う。guardrail はこれを認識して skip すべきであり、
      skip しない場合は改善 entry を起票する。

### 3. Biome security-lint surface の確認

- [ ] `bun run lint` が 0 で終了し、pre-change count を超える suppression が追加されていない。
- [ ] 新しい `// biome-ignore` line は、同じ行に PLAN-linked comment を持つ。
- [ ] `// @ts-ignore` と `// @ts-expect-error` line は 0 件、または PLAN で正当化されている。

### 4. Runtime surface reduction の確認

- [ ] 新しい global environment variable を導入する場合は、variable name、purpose、
      expected value range を `docs/design/` に更新する。新しい harness-owned variable は
      `UT_TDD_` prefix を使う。
- [ ] Hook entry point は package-local の `ut-tdd` command だけを呼ぶ。
      personal absolute path と legacy tool name を使わない。
- [ ] `src/` に新しい network call を追加する場合は、endpoint、authentication method、
      failure behaviour を説明する L5 design doc section を先に用意する。

### 5. Docs と audit artifact の redaction audit

- [ ] `docs/`、`.ut-tdd/handover/`、`.ut-tdd/audit/` 配下の新規 file に PII
      （氏名、メールアドレス、repo-relative path を超える machine identifier）が無い。
- [ ] 新規 documentation file に half-width kana、U+FFFD、mojibake marker が無い。
      commit 前に targeted readability scan を実行する。canonical detector は doctor readability gate であり、
      half-width kana と U+FFFD replacement character を fail closed する。

## Hardening attestation record（証跡）

Retrofit / Refactor PLAN と L11/L12 gate では次を記録する:

```
.ut-tdd/audit/<PLAN-id>-hardening.json
{
  "plan_id": "<id>",
  "gate": "accept | L12",
  "dependency_audit": "pass | advisory-accepted:<reference>",
  "guardrail": "pass | finding:<description>",
  "biome_clean": true | false,
  "surface_reduction": "no-expansion | expansion-justified:<reference>",
  "reviewer": "<agent-slug or intra_runtime_subagent>",
  "timestamp": "<ISO-8601>"
}
```

この file を PLAN の `review_evidence` field から link する。

## Anti-patterns（避けるパターン）

- `ut-tdd guardrail` を sprint 末だけ実行する。
  `docs/`、`.ut-tdd/`、`src/` に触れる commit のたびに実行する。
- floating dependency range を pin する PLAN なしに「今は safe」と扱う。
  floating range は development でも supply-chain risk である。
- この skill と `security.md` を混同する。
  この skill は体系的で checklist-driven な *hardening sweep* を扱う。
  `security.md` は design-time escalation と agent-guard architecture を扱う。
  accept 前には両方を満たす必要がある。
