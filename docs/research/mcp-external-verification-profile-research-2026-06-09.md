---
artifact_type: research_memo
status: confirmed
created: 2026-06-09
updated: 2026-06-09
related_audit: .helix/audit/A-125-mcp-external-verification-profile-scope.md
related_requirements: docs/governance/helix-harness-requirements_v1.2.md#6810-mcp--external-testing-tool-scope-and-workflow-triggers-a-125-2026-06-09
---

# MCP / External Verification Profile 調査メモ

## 対象範囲

このメモは A-125 の Web 調査根拠を記録する調査成果物であり、implementation behavior の source of truth ではない。正本の範囲は requirements、ADR、physical-data、PLAN、test-design artifacts に残す。

調査観点:

- HELIX が verification profile として model すべき installable MCP servers、developer plugins、test foundations は何か。
- cross-artifact impact analysis、diagram/export workflows、browser verification、GitHub workflow evidence、DB/service integration tests、API mocks のどれを改善できるか。
- profile automation の前に必要な safety boundary は何か。

## Source 確認

2026-06-09 に確認した。

| Source | URL | 関連する確認結果 | HELIX 判断 |
|---|---|---|---|
| MCP Registry announcement | https://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview/ | 公式 MCP Registry は public MCP servers を discover する open catalog/API である。preview status と self-reported registry data のため、trust proof ではなく discovery metadata として扱う。 | discovery metadata としてのみ使う。trusted profile state の前に official-source と package-integrity checks を必須にする。 |
| MCP Inspector docs | https://modelcontextprotocol.io/docs/tools/inspector | Inspector は MCP servers の testing/debugging 用公式 developer tool であり、npm/PyPI/local server inspection を support し、tools/resources/prompts tabs を公開する。 | configured MCP profiles の preferred smoke gate とする。accept 前の minimum method は `tools/list` とする。 |
| modelcontextprotocol reference servers | https://github.com/modelcontextprotocol/servers | reference servers には filesystem、git、memory、fetch、time が含まれるが、repository は educational examples であり threat-model-specific safeguards が必要だと警告している。 | controlled local/reference profiles としてのみ扱う。default では production credentials や broad home-directory mounts を使わない。 |
| Microsoft Playwright MCP | https://github.com/microsoft/playwright-mcp | 公式 Playwright MCP は Codex を含む複数 client で `npx @playwright/mcp@latest` により configure できる。 | optional interactive browser-verification profile とする。deterministic CI では test runners を優先する。 |
| GitHub MCP Server configuration | https://github.com/github/github-mcp-server/blob/main/docs/server-configuration.md | GitHub MCP は toolsets、explicit tool selection、read-only mode を support し、read-only mode は要求されても write tools を無効にする。 | default GitHub profile は read-only/narrow-toolset とする。write operations は別 profile とし、認証済み write 権限、対象 repo scope、audit evidence を必須にする。human approval は高影響・不可逆操作に限定する。 |
| Docker MCP Toolkit | https://docs.docker.com/ai/mcp-catalog-and-toolkit/toolkit/ | Docker MCP Toolkit は profile-based containerized MCP execution、signed/attested catalog images、SBOMs、runtime CPU/memory limits、default no host filesystem access、sensitive request interception、OAuth handling を提供する。 | Docker Desktop が利用可能な場合の preferred team/enterprise runtime profile とする。ただし beta/environment-dependent として扱う。 |
| Vitest Browser Mode | https://vitest.dev/guide/browser/ | Browser Mode は browser で tests を実行する。公式 docs は `vitest @vitest/browser-playwright` の Bun install を示し、CI では Playwright/WebdriverIO を推奨している。 | UI/browser-targeted changes 向けの optional browser-native test profile とする。 |
| Testcontainers for Node.js | https://node.testcontainers.org/ | Docker containers で動く databases、browsers、任意の service について lightweight throwaway instances を提供する。 | Docker が利用可能な場合の DB/service-contract changes 向け optional integration profile とする。 |
| MSW | https://github.com/mswjs/msw | MSW は environment に応じた interception により、browser と Node.js で request handlers を再利用できる。 | API-bound tests と fixture standardization 向けの optional API mock profile とする。 |

## 選定マトリクス

| Profile | Trigger signals | 価値 | default state | 必須条件 |
|---|---|---|---|---|
| `mcp-inspector-smoke` | `mcp_server_added`, `mcp_profile_changed` | workflow accept 前に configured server が expected protocol surface を公開していることを確認する。 | readiness profile として enabled。ただし実際の external inspection には explicit allow-list が必要。 | raw payload は DB に入れず、evidence path と normalized result だけを保存する。 |
| `playwright-mcp` | `ui_flow`, `web_target`, `browser_regression` | agentic browser exploration、screenshots、self-healing investigation に使える。 | default disabled。 | browser/tool output は evidence のみ。approval なしの credentialed browsing は行わない。 |
| `github-mcp-readonly` | `external_issue`, `ci_failure`, `pr_review`, `backlog_sync` | Issue/PR/CI/backlog context を読んで workflow evidence へ正規化できる。 | default disabled。intended default は read-only/narrow toolsets。 | write toolsets は separate authenticated profile と audit evidence が必要。高影響・不可逆操作だけ human residue に escalate する。 |
| `docker-mcp-toolkit` | `team_profile`, `enterprise_runtime`, `profile_isolation_required` | containerized MCP gateway と profile isolation により、local setup と supply-chain drift を減らせる。 | optional environment profile。 | Docker Desktop availability、profile export/import policy、committed user-specific `.vscode/mcp.json` の禁止。 |
| `vitest-browser-playwright` | `ui_flow`, `browser_regression`, `component_interaction` | CI-capable provider で deterministic browser-native tests を実行できる。 | installed まで disabled。 | Bun-compatible package declaration、Playwright provider、broad snapshot-only oracle の禁止。 |
| `testcontainers` | `db_integration`, `migration`, `service_contract` | integration tests 用の disposable DB/service dependencies を得られる。 | Docker available まで disabled。 | Docker availability と bounded image policy。 |
| `msw` | `api_mock_gap`, `flaky_external_api` | reusable browser/Node mocks と shared request-handler fixtures を提供する。 | dependency declared まで disabled。 | mock fixtures は contract-traced にし、real adapter failures を隠さない。 |

## Workflow 統合

profile workflow は次のように動くべきである。

1. relation graph または changed-file signal が 1 つ以上の trigger signals を emit する。
2. `helix verify recommend --changed <path>` が signals を profile recommendations へ map する。
3. `helix mcp profile probe <profile>` が package install なしで local readiness を check する。
4. MCP profiles では accept 前に `helix mcp inspect <profile> --method tools/list` を必須にする。
5. external run results は `.helix/evidence/verification-profiles/` 配下の bounded evidence にする。
6. DB projection は後続で evidence を `mcp_server_runs`、`verification_recommendations`、`external_tool_findings` へ正規化する。
7. gates は raw MCP/tool output ではなく、正規化済み rows だけを消費する。

## 安全ルール

- external profile は registry presence だけでは trust しない。
- external profiles は default disabled とする。
- generated local MCP config は Git-tracked secrets の外に置く。
- filesystem/git profiles は workspace-root scoped とし、home-directory scoped にしない。
- GitHub は default で read-only/narrow toolsets とする。
- Docker MCP Toolkit は profile isolation と runtime controls が利用可能な場合だけ優先する。
- browser traces、screenshots、MCP responses、provider transcripts、secrets は DB rows に保存しない。

## 残作業

- generated local MCP profile config と safety lint は PLAN-L6-32 / PLAN-L7-33 / PLAN-REVERSE-33 へ route する。
- readiness gates 確認後に実際の MCP Inspector invocation を実装する。
- A-125 projection rows の DB collector/rebuild を実装する。
- source verification、package integrity、workspace mounts、credential non-persistence の doctor/profile safety lint を実装する。
