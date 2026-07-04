---
schema_version: skill.v1
name: agent-design
skill_type: design-contract
applies_to:
  layers:
    - L2
    - L3
    - L4
    - L5
  drive_models:
    - Forward
    - Add-feature
    - Discovery
    - Refactor
---

# agent design（agent 設計）

HELIX における単一 subagent の定義方法を扱う。対象は capability class、
model-family 割り当て、guard allowlist 登録（FR-L1-46 subagent roster）。
新しい agent role の導入、model family の変更、既存 agent definition と実利用の整合監査で使う。

## この skill を読む条件

- `.claude/agents/<name>.md` の frontmatter definition を作成または編集する。
- `PreToolUse(Agent)` guard rejection について、どの rule が失敗したか診断する必要がある。
- Discovery または Add-feature PLAN が、allowlist にまだ無い specialist role を必要とする。
- 既存 agent definition の model-family mismatch を直すために refactor する。

## subagent definition の構造

すべての `.claude/agents/<name>.md` は次を持つ。

| フィールド | 目的 | 強制方法 |
|---|---|---|
| `name`（frontmatter） | kebab filename と一致する必要がある | `agent-guard.ts` の key lookup |
| `model` | 明示的な model string（省略不可） | 省略 model は guard が block。parent は継承しない |
| `description` | 1 行の capability summary | `ut-tdd skill suggest` が利用する |
| `tools` | 宣言された tool list | guard が allowed surfaces と照合 |

Agent call の `subagent_type` は、guard allowlist entries のいずれかと完全一致する必要がある
（case-sensitive）。現在の allowlist:

```
pmo-sonnet  pmo-haiku  pmo-project-explorer  pmo-project-scout
pmo-tech-docs  pmo-tech-fork  pmo-tech-news
pdm-tech-innovation  pdm-marketing-innovation  pdm-innovation-manager
code-reviewer  security-audit  qa-test
```

この list 外の role は fail-close で block される。role を追加する場合は
`agent-guard.ts` allowlist を更新し、capability class をここに記録する。

## Capability class taxonomy（能力分類）

| 分類 | 代表的な role | 適切な model tier |
|---|---|---|
| 調査 / 要約 | `pmo-haiku`, `pmo-tech-news` | 高速 / 低コスト |
| repo state 判断 | `pmo-project-explorer`, `pmo-sonnet` | 中位 tier |
| 設計レビュー / adversarial | `code-reviewer`, `security-audit` | primary 相当 |
| QA / trace verification | `qa-test` | 中位 tier |
| innovation / market analysis | `pdm-*` | 中位 tier |

必要最小限の capable tier を割り当てる。`model` field を省略すると guard が spawn を reject する。
parent を暗黙継承しない。

## Guard bypass（例外迂回）

`UT_TDD_ALLOW_RAW_AGENT=1` は guard を bypass する。診断済み emergency の場合だけ使う。
迂回した場合は `.ut-tdd/audit/` に audit entry を残し、誰が flag を設定したか、
どの agent call を実行したか、通常 path がなぜ不適切だったかを記録する。

## Self-review checklist（自己レビューチェックリスト）

- [ ] frontmatter の `name` が filename と一致している（kebab-case、spaces なし）。
- [ ] `model` field が明示されている。blank でも placeholder でもない。
- [ ] spawn call の `subagent_type` が allowlist entry と完全一致する。
- [ ] Capability class の根拠がある。選んだ model tier は必要最小限。
- [ ] 新しい role の場合、`agent-guard.ts` の allowlist が更新され test 済み。
- [ ] `UT_TDD_ALLOW_RAW_AGENT=1` を設定した場合、bypass evidence を `.ut-tdd/audit/` に書いた。
