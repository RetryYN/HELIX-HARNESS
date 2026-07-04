# A-125 MCP / 外部検証 profile の適用範囲

日付: 2026-06-09
文脈: ユーザーは A-124 を拡張し、Web 調査済みの MCP server、外部 installable plugin、test foundation、trigger automation、workflow integration を含めるよう求めた。

## 現在の状態

A-125 の前に実装済み:

- A-124 は cross-artifact relation graph、impact expansion、diagram export、tool adapter normalization の範囲を定義した。
- 既存 CLI は `doctor`、`plan lint`、`vmodel lint`、local Bun/vitest test execution を備えている。
- 既存 docs は ADR-006 で将来の MCP serverization に触れていたが、具体的な MCP profile catalog、trigger rule、DB projection、verification profile model は未定義だった。

未実装:

- 実際の MCP Inspector server invocation。
- MCP と external verification profile row 用の DB collector/rebuild。

後続で実装済み:

- `ut-tdd mcp profile list --json`
- `ut-tdd mcp profile probe <name>`
- `ut-tdd mcp inspect <name> --method tools/list`
- `ut-tdd verify recommend --changed <path> [--format text|json|mermaid]`
- `ut-tdd verify run --profile <name> [--dry-run] [--allow-external]`
- profile list/probe/inspect/recommend/run 向けの `--save-evidence`。normalized JSON を `.ut-tdd/evidence/verification-profiles/` 配下へ書き出す。
- `doctor` は changed-file verification profile recommendation count を表示する。
- recommendation output は、後続の `verification_recommendations` DB row に合わせて changed files、signals、profiles、reasons、graph edges を保持する形にした。
- disabled external profile は既定で拒否される。probe は package declaration、executable availability、auth env を確認するが、package install は行わない。

## Web 調査

詳細な source URL と selection matrix は `docs/research/mcp-external-verification-profile-research-2026-06-09.md` に記録した。この audit では routing summary のみを保持する。

確認した primary/official source:

- MCP Registry: public MCP server 向けの official centralized metadata repository。preview status と namespace verification を持つが、security scanner ではない。
- modelcontextprotocol/servers: reference server は filesystem、git、memory、fetch などを含む。repository は reference server が educational であり、threat model に応じた safeguard が必要だと明記している。
- MCP Inspector: MCP server の testing/debugging 用 official tool。`npx` 経由で実行でき、npm/PyPI/local server を inspect できる。
- Microsoft Playwright MCP: `npx @playwright/mcp@latest` で install できる official Playwright MCP server。persistent browser-context automation と exploratory/self-healing loop に有用。
- GitHub MCP Server: configurable toolset と individual tool を持つ official server。狭い toolset は context と tool choice の noise を減らす。
- Docker MCP Toolkit: signed/attested catalog image、SBOM、resource limit、filesystem restriction、OAuth handling を持つ profile-based gateway。
- Vitest Browser Mode: browser-native test を支える。CI では Playwright または WebdriverIO provider を使う前提で、Bun installation も documented されている。
- Testcontainers for Node.js: test 用の disposable database/service/container dependency を提供する。
- MSW: browser と Node.js 向け API mocking library。API-bound test の reusable mock profile として有用。

確認した security signal:

- malicious MCP package impersonation と credential exposure risk に関する public reporting が存在する。このため A-125 は registry/catalog metadata を discovery input として扱い、trust proof とは扱わない。

## 判断

MCP server、plugin、external test foundation は profile として model 化する。

1. Profile catalog は package/source/command/risk/auth/network/Docker/read-only/allowed-tools metadata を保存する。
2. Workflow signal は agent memory ではなく DB projection を通じて profile を recommend する。
3. Profile probe と MCP Inspector smoke は `mcp_server_runs` を作成する。
4. External verification command は `tool_runs`、`test_runs`、normalized `external_tool_findings` を作成する。
5. Gate decision は normalized DB row と bounded evidence を使い、raw MCP/tool output は使わない。

## 変更

- requirements §6.8.10 に MCP / external testing tool scope と workflow trigger を追加した。
- Web research evidence memo として `docs/research/mcp-external-verification-profile-research-2026-06-09.md` を追加した。
- physical-data §9.6 に DB projection table と invariant を追加した。
- ADR-002 A-125 addendum を追加した。
- IMP-121 / IMP-122 / IMP-123 / IMP-124 を追加した。
- MCP verification profile 向けの Forward と mode workflow rule を追加した。
- A-125 を existing FR bundle extension として L1/L3 functional requirements へ back-propagate した。

## Back-Propagation 判断

`backprop_decision`: `requires_requirement_backprop`

理由: この request は harness の verification capability、workflow trigger、security posture を変更する。lower-layer tool-install detail のみではない。

## 残作業

将来の実装では、以下に対応する L6/L7 PLAN を作成する。

- MCP profile schema DB collector と generated local config。generated local config と profile safety lint は、現在 PLAN-L6-32 / PLAN-L7-33 / PLAN-REVERSE-33 を official route とする。
- configured profile 向けの実際の MCP Inspector server invocation。
- DB-backed relation graph impact から verification profile recommendation への接続。
- built-in Bun/Vitest と doctor profile を超える external profile runner implementation。
- doctor/profile の安全性 lint。
- `mcp_server_profiles`、`mcp_profile_triggers`、`mcp_server_runs`、`verification_profiles`、`verification_recommendations`、`external_tool_findings` 向け DB collector/rebuild。
