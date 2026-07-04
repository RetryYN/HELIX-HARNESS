---
schema_version: skill.v1
name: documentation
skill_type: process
applies_to:
  layers:
    - L1
    - L2
    - L3
    - L4
    - L5
    - L6
    - L8
  drive_models:
    - Forward
    - Reverse
    - Add-feature
    - Retrofit
---

# documentation

UT-TDD における README files、onboarding guides、runbooks、doc-tree prose の作成と保守を扱う。
V-model design docs や ADRs とは別の human-readable operational documentation を作る場合に適用する
（それらは `documentation-and-adrs` が扱う）。

## この skill を読む条件

- `README.md`、onboarding guide、CLI usage reference を作成または更新する。
- recurring operational procedure（例: PAT rotation、`harness.db` rebuild、doctor triage）の runbook を作成する。
- 新しい `ut-tdd` command に対し、既存 doc に usage section が必要。
- PLAN が新しい command、flag、state path を導入した後の doc maintenance。

## Scope: この skill が扱う範囲

| In scope | Out of scope |
|---|---|
| README / onboarding prose の整備 | V-model design docs（`docs/design/`） |
| CLI usage references の作成 | ADR authoring（`documentation-and-adrs` 参照） |
| Runbooks and operational procedures の整備 | PLAN files（`docs/plans/`） |
| doc-tree maintenance（dead links、stale paths）の実施 | L0 glossary back-merge（`gate-planning` 参照） |

## Writing standards（執筆基準）

- **Active voice, named actor.** 「開発者は `ut-tdd doctor` を実行する」と書き、
  「`ut-tdd doctor` が実行されるべき」とは書かない。
- **Executable examples.** すべての code block は、current codebase に対して実際に動く command または output にする。
  pseudocode はそのように label する。
- **No version-drift.** command flag が変わった場合は、同じ commit で doc を更新する。
  removed flag を説明する doc は、doc が無いより悪い。
- **Encoding: UTF-8 without BOM.** Half-width kana（U+FF61-FF9F）と U+FFFD は mojibake marker。
  external editor を通った doc は、commit 前に grep で scan する。

## README structure baseline（README 構成基準）

UT-TDD README は最低限次を含む:

1. **Purpose** — 1 段落。この component が何を行い、どの system に仕えるか。
2. **Prerequisites** — `bun`、`ut-tdd`、外部 dependency と minimum version。
3. **Quick start** — working state を得るための最小 command sequence。
4. **Key commands** — この context でよく使う `ut-tdd` commands の table。
5. **Troubleshooting** — 最も多い failure 2-3 件と remediation（まず `ut-tdd doctor` triage）。

## Runbook structure baseline（runbook 構成基準）

1. **Trigger** — この runbook を起動する exact condition。
2. **Impact** — condition が続く間に何が壊れる、または degraded するか。
3. **Steps** — numbered list。各 step は command または decision と expected output を持つ。
4. **Verification** — procedure 成功の確認方法（`ut-tdd doctor`、`ut-tdd status`、targeted test）。
5. **Escalation** — どこで止まり、human decision を呼ぶか。

## Doc maintenance after a PLAN ships（PLAN 出荷後の doc 保守）

PLAN が `ut-tdd` command、flag、state path を追加または変更した場合:

1. `grep` で existing docs から old command / path の reference を探す。
2. implementation と同じ commit で各 reference を更新する。
3. breaking change（old command がもう動かない）の場合は、old text を黙って置換せず、
   `## Migration` heading の下に migration note を追加する。

## Mojibake check before commit（commit 前の文字化け確認）

```bash
# Scan for half-width kana and replacement character in docs/
grep -rP "[\xFF61-\xFF9F\xEF\xBF\xBD]" docs/
```

clean result は mojibake marker が無いことを意味する。
dirty result は file が transit 中に壊れたことを意味するため、lossy character repair を試みず、
最後の clean git revision から restore する。
