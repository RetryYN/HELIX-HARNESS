# 旧世代AI読取り入口38件の意味移管台帳

確認日: 2026-09-14

## 目的と適用境界

旧世代AIが直接読んでいた、またはAI runtimeを直接接続していた38ファイルをarchive上のexact pathで固定し、
旧資産から採取する意味と新世代で要求を所有する対象を分ける。本台帳は要求源の整理であり、archive内資産の実行・復元、
生成器・manifest・hook・CIの設計、runtime適用、物理削除を認可しない。

## 直接入口のexact集合

| 区分 | 件数 | exact path | 採取する意味 | 新しい要求owner |
|---|---:|---|---|---|
| repository instruction | 2 | `archive/legacy-generation-2026-09-14/root/AGENTS.md`、`archive/legacy-generation-2026-09-14/root/CLAUDE.md` | 工程、責務、禁止、停止、正本参照 | HARNESS工程契約とHELIX-OS実行contextへ分割 |
| Claude root | 2 | `archive/legacy-generation-2026-09-14/root/.claude/CLAUDE.md`、`archive/legacy-generation-2026-09-14/root/.claude/settings.json` | runtime方針、eventとentrypointの接続 | 方針はHARNESS／OSへ分割、接続はHELIX-OS |
| role prompt | 21 | 下記role prompt一覧 | role名、責務、capability、入力、出力、停止条件 | HELIX-OS assignment／Worker要求。工程義務はHARNESS参照 |
| command prompt | 7 | 下記command prompt一覧 | 利用意図、入力、成果物、停止・完了条件 | HARNESS工程要求とHELIX-OS command実行要求へ分割 |
| Claude hook entry | 4 | 下記hook一覧 | event、guardrail、拒否条件、記録要求 | HELIX-OS実行統制。工程上の必須oracleはHARNESS |
| Codex adapter | 2 | `archive/legacy-generation-2026-09-14/root/.codex/config.toml`、`archive/legacy-generation-2026-09-14/root/.codex/hooks.json` | runtime activation、eventとentrypointの接続 | HELIX-OS Worker／adapter要求 |
| **合計** | **38** | 物理集合を本節で固定 | 旧文面・旧実装は採取対象外 | 承認済み対象別L2へ再採否 |

role prompt 21件:

```text
archive/legacy-generation-2026-09-14/root/.claude/agents/advisor-fable.md
archive/legacy-generation-2026-09-14/root/.claude/agents/be-api.md
archive/legacy-generation-2026-09-14/root/.claude/agents/be-logic.md
archive/legacy-generation-2026-09-14/root/.claude/agents/code-reviewer.md
archive/legacy-generation-2026-09-14/root/.claude/agents/db-schema.md
archive/legacy-generation-2026-09-14/root/.claude/agents/devops-deploy.md
archive/legacy-generation-2026-09-14/root/.claude/agents/fe-lead.md
archive/legacy-generation-2026-09-14/root/.claude/agents/fe-ui.md
archive/legacy-generation-2026-09-14/root/.claude/agents/pdm-innovation-manager.md
archive/legacy-generation-2026-09-14/root/.claude/agents/pdm-marketing-innovation.md
archive/legacy-generation-2026-09-14/root/.claude/agents/pdm-tech-innovation.md
archive/legacy-generation-2026-09-14/root/.claude/agents/pmo-haiku.md
archive/legacy-generation-2026-09-14/root/.claude/agents/pmo-project-explorer.md
archive/legacy-generation-2026-09-14/root/.claude/agents/pmo-project-scout.md
archive/legacy-generation-2026-09-14/root/.claude/agents/pmo-sonnet.md
archive/legacy-generation-2026-09-14/root/.claude/agents/pmo-tech-docs.md
archive/legacy-generation-2026-09-14/root/.claude/agents/pmo-tech-fork.md
archive/legacy-generation-2026-09-14/root/.claude/agents/pmo-tech-news.md
archive/legacy-generation-2026-09-14/root/.claude/agents/qa-test.md
archive/legacy-generation-2026-09-14/root/.claude/agents/refactor-scout.md
archive/legacy-generation-2026-09-14/root/.claude/agents/security-audit.md
```

command prompt 7件:

```text
archive/legacy-generation-2026-09-14/root/.claude/commands/build.md
archive/legacy-generation-2026-09-14/root/.claude/commands/code-simplify.md
archive/legacy-generation-2026-09-14/root/.claude/commands/sdd-plan.md
archive/legacy-generation-2026-09-14/root/.claude/commands/sdd-review.md
archive/legacy-generation-2026-09-14/root/.claude/commands/ship.md
archive/legacy-generation-2026-09-14/root/.claude/commands/spec.md
archive/legacy-generation-2026-09-14/root/.claude/commands/test.md
```

Claude hook entry 4件:

```text
archive/legacy-generation-2026-09-14/root/.claude/hooks/agent-guard.ts
archive/legacy-generation-2026-09-14/root/.claude/hooks/git-command-guard.ts
archive/legacy-generation-2026-09-14/root/.claude/hooks/session-log.ts
archive/legacy-generation-2026-09-14/root/.claude/hooks/work-guard.ts
```

## 直接配線として確認した依存境界

直接入口38件の存在確認と、設定・hook本文に明記された直結先までを確認した。ここから先を新世代の構造として
継承してはならない。

| 入口 | 確認した直結先 | 要求整理上の扱い |
|---|---|---|
| `archive/legacy-generation-2026-09-14/root/.claude/settings.json` | `archive/legacy-generation-2026-09-14/root/.claude/hooks`のentry、`archive/legacy-generation-2026-09-14/root/src/cli.ts`のsession／hook command | event、拒否、記録の意味候補だけをOS要求へ採否 |
| `archive/legacy-generation-2026-09-14/root/.codex/hooks.json` | `archive/legacy-generation-2026-09-14/root/.claude/hooks`のentry、`archive/legacy-generation-2026-09-14/root/src/cli.ts`のsession／hook command | provider間parityを前提にせず、Worker別adapter要求へ採否 |
| `archive/legacy-generation-2026-09-14/root/.claude/hooks/agent-guard.ts` | `archive/legacy-generation-2026-09-14/root/src/runtime/agent-guard`、`archive/legacy-generation-2026-09-14/root/src/runtime/agent-slots`、`archive/legacy-generation-2026-09-14/root/.claude/agents/*.md` | assignment、capacity、拒否、記録の意味候補へ分解 |
| `archive/legacy-generation-2026-09-14/root/.claude/hooks/git-command-guard.ts` | `git-command-guard-hook`、`work-guard-hook`、`machine-safety-guard-hook`、`secret-egress-hook` | 操作authority、作業scope、machine、secret境界のOS要求へ分解 |
| `archive/legacy-generation-2026-09-14/root/.claude/hooks/work-guard.ts` | `work-guard-hook`、`secret-egress-hook` | 作業scopeとsecret境界のOS要求へ分解 |
| `archive/legacy-generation-2026-09-14/root/.claude/hooks/session-log.ts` | `archive/legacy-generation-2026-09-14/root/src/runtime/session-log`、`archive/legacy-generation-2026-09-14/root/src/cli.ts` | log、session lifecycle、read evidenceのOS要求へ分解 |

## closureの状態

| 層 | 状態 | 判明していること | 閉鎖条件 |
|---|---|---|---|
| A: 直接入口 | 完了 | exact 38件、区分、意味移管先を固定 | 新しい直接入口を発見した場合は本台帳へ追加 |
| B: 直接配線 | 確認済み | settings／adapter／hookから直結するentryとruntime moduleを確認 | L2採否時に各意味を要求IDへ接続 |
| C: 文書・template・Skill consumer | relation分類済み | [consumer relation inventory](legacy-ai-consumer-relation-inventory.md)でAICR-01..10を分類。単純検索件数はconsumer closureではない | 承認済みL2に接続後、source locator、読取り主体、適用条件を個別に確定 |
| D: generated prompt・runtime state・DB projection | 未完 | 直接入口の物理列挙だけでは動的read setを確定できない | 承認済みL2からL3 manifest契約を作った後に実測 |

CとDが未完であるため、本台帳は「AI読取り資産全体38件」や「archive集合38件」を意味しない。38件は直接入口だけの
閉じた集合である。L3 manifestの物理形式や依存graphは、Concept／対象別L1／L2の承認前に固定しない。

## 最終退役・削除判定に必要な証拠

各入口は非実行archiveへ隔離済みである。次を満たすまでarchiveから物理削除せず、新世代replacementの完成を主張しない。

1. 採取するsemantic atomが対象別L2要求IDに採択、不採用、未解決のいずれかで記録されている。
2. HARNESS工程契約とHELIX-OS実行統制を同一文書の暗黙責務として残していない。
3. 対応するL3／L10と、新世代AI read pathのreplacement evidenceが承認済みである。
4. C／D closureに旧pathを読むcurrent consumerが残っていない。
5. read-afterで旧prompt、旧hook、旧adapter、旧Core Readが新世代sessionへ注入されない。

現段階で認める処置は、archive sourceとしての読取り、意味分類、対象別要求への適用待ち差分の作成までである。
