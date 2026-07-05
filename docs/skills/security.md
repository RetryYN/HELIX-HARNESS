---
schema_version: skill.v1
name: security
skill_type: verification
applies_to:
  layers:
    - L2
    - L3
    - L5
    - L6
    - L7
    - L8
    - L10
    - L12
    - L14
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Recovery
    - Incident
---

# security（セキュリティ）

HELIX の security review 手順。対象は escalation boundaries、agent-guard design、
secret hygiene、runtime safety constraints の確認である。
（FR-L1-09 safety design、FR-L1-17 escalation、FR-L1-45 guardrail）を支える。
PLAN が agent-callable surface を導入する、trust boundaries を変更する、または
credential-adjacent state に触れるすべての layer で適用する。

## この skill を読む条件

- PLAN が `.claude/settings.json`（agent allowlist または hook configuration）を変更する。
- 新しい `helix` command または MCP endpoint を追加する。
- `helix guardrail` が non-zero で終了する。
- Recovery または Incident PLAN が exploit path close の証明を必要とする。
- Add-feature PLAN が authentication、authorization、session state、external API assumptions に触れる。

## Escalation boundaries（明示 PO sign-off なしに越えない）

次の操作は、implementation を進める前に escalation が必要。

- authentication または authorization logic の変更。
- `.claude/settings.json` の agent-guard allowlist 変更。
- `HELIX_ALLOW_RAW_AGENT=1` bypass paths の追加または削除。
- production infrastructure state または external API configuration への書き込み。
- `.helix/` audit evidence の書き方または保持方法の変更。
- 任意の harness artifact で PII を処理または保存すること。

Escalation とは、current PLAN を停止し、越えようとした boundary を `.helix/audit/` に記録し、
明示 PO confirmation を待ってから再開すること。

## Agent guard security requirements（agent guard security 要件）

`agent-guard.ts` hook は次を強制する。

1. `subagent_type` は allowlist 内でなければならない（現在 14 named agents）。
   unknown type は exit 1。fail-close が唯一安全な default。
2. `model` field の無い agent calls は reject される。
3. model family は agent frontmatter declaration と一致しなければならない。
4. bypass には `HELIX_ALLOW_RAW_AGENT=1` が必要で、さらに `.helix/audit/` へ evidence を書く必要がある。
5. invalid stdin JSON は fail closed。parse errors を silent ignore することは禁止。

agent-guard の挙動を変更する PLAN を review する場合、変更後もこの 5 rules が強制されていることを確認する。

## Secret and credential hygiene（secret/credential 衛生）

`docs/`、`.helix/`、handover files、audit evidence に触れる commit の前に実行する。

```
helix guardrail
```

確認すること:
- repo 配下の text file に API key patterns と一致する文字列が無い。
- committed scripts に `HELIX_ALLOW_RAW_AGENT=1` が残っていない（env-only であるべき）。
- `.helix/handover/CURRENT.json` に credential または session token が無い。
- committed config file に username や machine name を含む personal absolute path が無い。

発見した pattern を `helix guardrail` が cover していない場合、improvement entry を起票し、
new pattern 用の Vitest test fixture を追加する。

## Runtime safety constraints（runtime 安全制約）

- **Native Windows first-class.** Windows での hook execution は WSL2 availability を前提にしない。
  paths は personal absolute paths ではなく `CLAUDE_PROJECT_DIR` を使う。
- **PATH integrity.** runner PATH に `System32` が無い場合、hook entry points は status null で失敗する。
  code regression と扱う前に `helix doctor` で確認する。
- **Hook fail-close.** error condition で exit 0 する hook は security defect。
  その hook のすべての failure mode は L5 design doc に列挙しなければならない。

## Security review evidence（security review 証跡）

PLAN `review_evidence` field に記録する。

```
reviewer: <agent-slug or "intra_runtime_subagent">
gate: trace-freeze | accept
security_axis:
  escalation_boundaries: <not crossed | crossed and escalated>
  agent_guard_rules: <all 5 pass | finding>
  credential_hygiene: <guardrail-pass | finding>
  hook_fail_close: <verified | finding>
outcome: PASS | FAIL | CONDITIONAL
timestamp: <ISO-8601>
```

## Anti-patterns（避けるパターン）

- `helix guardrail` 実行と review evidence 記録なしに、`.claude/settings.json` を
  "quick config change" として変更する。
- `HELIX_ALLOW_RAW_AGENT=1` を通常運用 flag として扱う。
  これは emergency bypass であり、使うたびに audit trail が必要。
- root cause を直さず、comment で `helix guardrail` finding を黙らせる。
  accept 前に fix を land させなければならない。
