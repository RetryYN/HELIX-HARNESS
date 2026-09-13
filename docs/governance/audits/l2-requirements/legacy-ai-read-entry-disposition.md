# 現行AI読取り入口38件の意味移管台帳

確認日: 2026-09-14

## 目的と適用境界

現行AIが直接読む、またはAI runtimeを直接接続する38ファイルをexact pathで固定し、旧資産から採取する意味と
新世代で要求を所有する対象を分ける。本台帳は要求源の整理であり、現行ファイルの変更、生成器・manifest・hook・CIの
設計、runtime適用、archive移動を認可しない。

## 直接入口のexact集合

| 区分 | 件数 | exact path | 採取する意味 | 新しい要求owner |
|---|---:|---|---|---|
| repository instruction | 2 | `AGENTS.md`、`CLAUDE.md` | 工程、責務、禁止、停止、正本参照 | HARNESS工程契約とHELIX-OS実行contextへ分割 |
| Claude root | 2 | `.claude/CLAUDE.md`、`.claude/settings.json` | runtime方針、eventとentrypointの接続 | 方針はHARNESS／OSへ分割、接続はHELIX-OS |
| role prompt | 21 | 下記role prompt一覧 | role名、責務、capability、入力、出力、停止条件 | HELIX-OS assignment／Worker要求。工程義務はHARNESS参照 |
| command prompt | 7 | 下記command prompt一覧 | 利用意図、入力、成果物、停止・完了条件 | HARNESS工程要求とHELIX-OS command実行要求へ分割 |
| Claude hook entry | 4 | 下記hook一覧 | event、guardrail、拒否条件、記録要求 | HELIX-OS実行統制。工程上の必須oracleはHARNESS |
| Codex adapter | 2 | `.codex/config.toml`、`.codex/hooks.json` | runtime activation、eventとentrypointの接続 | HELIX-OS Worker／adapter要求 |
| **合計** | **38** | 物理集合を本節で固定 | 旧文面・旧実装は採取対象外 | 承認済み対象別L2へ再採否 |

role prompt 21件:

```text
.claude/agents/advisor-fable.md
.claude/agents/be-api.md
.claude/agents/be-logic.md
.claude/agents/code-reviewer.md
.claude/agents/db-schema.md
.claude/agents/devops-deploy.md
.claude/agents/fe-lead.md
.claude/agents/fe-ui.md
.claude/agents/pdm-innovation-manager.md
.claude/agents/pdm-marketing-innovation.md
.claude/agents/pdm-tech-innovation.md
.claude/agents/pmo-haiku.md
.claude/agents/pmo-project-explorer.md
.claude/agents/pmo-project-scout.md
.claude/agents/pmo-sonnet.md
.claude/agents/pmo-tech-docs.md
.claude/agents/pmo-tech-fork.md
.claude/agents/pmo-tech-news.md
.claude/agents/qa-test.md
.claude/agents/refactor-scout.md
.claude/agents/security-audit.md
```

command prompt 7件:

```text
.claude/commands/build.md
.claude/commands/code-simplify.md
.claude/commands/sdd-plan.md
.claude/commands/sdd-review.md
.claude/commands/ship.md
.claude/commands/spec.md
.claude/commands/test.md
```

Claude hook entry 4件:

```text
.claude/hooks/agent-guard.ts
.claude/hooks/git-command-guard.ts
.claude/hooks/session-log.ts
.claude/hooks/work-guard.ts
```

## 直接配線として確認した依存境界

直接入口38件の存在確認と、設定・hook本文に明記された直結先までを確認した。ここから先を新世代の構造として
継承してはならない。

| 入口 | 確認した直結先 | 要求整理上の扱い |
|---|---|---|
| `.claude/settings.json` | `.claude/hooks/`のentry、`src/cli.ts`のsession／hook command | event、拒否、記録の意味候補だけをOS要求へ採否 |
| `.codex/hooks.json` | `.claude/hooks/`のentry、`src/cli.ts`のsession／hook command | provider間parityを前提にせず、Worker別adapter要求へ採否 |
| `.claude/hooks/agent-guard.ts` | `src/runtime/agent-guard`、`src/runtime/agent-slots`、`.claude/agents/*.md` | assignment、capacity、拒否、記録の意味候補へ分解 |
| `.claude/hooks/git-command-guard.ts` | `git-command-guard-hook`、`work-guard-hook`、`machine-safety-guard-hook`、`secret-egress-hook` | 操作authority、作業scope、machine、secret境界のOS要求へ分解 |
| `.claude/hooks/work-guard.ts` | `work-guard-hook`、`secret-egress-hook` | 作業scopeとsecret境界のOS要求へ分解 |
| `.claude/hooks/session-log.ts` | `src/runtime/session-log`、`src/cli.ts` | log、session lifecycle、read evidenceのOS要求へ分解 |

## closureの状態

| 層 | 状態 | 判明していること | 閉鎖条件 |
|---|---|---|---|
| A: 直接入口 | 完了 | exact 38件、区分、意味移管先を固定 | 新しい直接入口を発見した場合は本台帳へ追加 |
| B: 直接配線 | 確認済み | settings／adapter／hookから直結するentryとruntime moduleを確認 | L2採否時に各意味を要求IDへ接続 |
| C: 文書・template・Skill consumer | 未完 | repository内に多数の文字列参照があり、単純検索件数はconsumer closureではない | source locator、読取り主体、適用条件をrelation単位で確定 |
| D: generated prompt・runtime state・DB projection | 未完 | 直接入口の物理列挙だけでは動的read setを確定できない | 承認済みL2からL3 manifest契約を作った後に実測 |

CとDが未完であるため、本台帳は「AI読取り資産全体38件」や「archive集合38件」を意味しない。38件は直接入口だけの
閉じた集合である。L3 manifestの物理形式や依存graphは、Concept／対象別L1／L2の承認前に固定しない。

## archive判定に必要な証拠

各入口は、次を満たすまでcurrent pathから移動・削除・無効化しない。

1. 採取するsemantic atomが対象別L2要求IDに採択、不採用、未解決のいずれかで記録されている。
2. HARNESS工程契約とHELIX-OS実行統制を同一文書の暗黙責務として残していない。
3. 対応するL3／L10と、新世代AI read pathのreplacement evidenceが承認済みである。
4. C／D closureに旧pathを読むcurrent consumerが残っていない。
5. read-afterで旧prompt、旧hook、旧adapter、旧Core Readが新世代sessionへ注入されない。

現段階で認める処置は、要求源としての読取り、意味分類、対象別要求への適用待ち差分の作成までである。
