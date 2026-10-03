# 現行CI・AI読取り資産の新世代移行inventory

確認日: 2026-09-14

## 目的

新世代を上流から組み直す前提で、現行CIとAI読取り資産の入口をarchive対象として固定する。
旧実行面は非実行archiveへ隔離済みである。本inventoryは資産の採択、再利用、実行、復元、物理削除、runtime切替を
認可せず、旧資産を新世代のbaseline、parity oracle、fallbackとして使わない。

## 現行CIの直接入口

旧`.github/workflows/`のtracked workflowは4件で、現在はarchive内にある。

| Path | 現行workflow名 | 新世代での扱い |
|---|---|---|
| `archive/legacy-generation-2026-09-14/root/.github/workflows/harness-check.yml` | `harness-check` | legacy aggregate CI。実行せず、要求・job・failure・証拠形式を採取後に非実行archiveへ移す |
| `archive/legacy-generation-2026-09-14/root/.github/workflows/claude-unanswered-review-audit.yml` | `claude-unanswered-review-audit` | legacy review監査。上流意味reviewの専用laneへそのまま流用しない |
| `archive/legacy-generation-2026-09-14/root/.github/workflows/escalation-stale.yml` | `escalation-stale` | legacy運用監査。新世代OSの通知・期限要求へ意味を再分類する |
| `archive/legacy-generation-2026-09-14/root/.github/workflows/issue-metadata-audit.yml` | `issue-metadata-audit` | legacy GitHub projection監査。要求authority検証へ昇格させない |

`harness-check`は旧`archive/legacy-generation-2026-09-14/root/AGENTS.md`／`archive/legacy-generation-2026-09-14/root/CLAUDE.md`、`archive/legacy-generation-2026-09-14/root/src/cli.ts`、review・merge admissionと結合していた。
新世代要求整理中に起動・修正・required check化せず、既存のgreen／failureを新世代判断へ使用しない。

filename discoveryとして、`src/`内のpath basenameに
`ci|github|review|gate|doctor|workflow|claude|codex|adapter|hook`を含むファイルを82件確認した。
これは依存closureでもarchive件数でもない。L3以降でsymbol・import・call graph・設定・test・consumerを追跡し、
新世代で必要なsemantic atomとlegacy implementationを分けるための発見集合である。

workflowの周囲にあるtrigger、required check、admission、証拠、生成、配布、診断、観測、復元、provider外部状態は
[現行CI consumer relation inventory](legacy-ci-consumer-relation-inventory.md)で11種類に分類した。
これは個別job／symbol／GitHub設定まで閉じた依存closureではない。

## 現行AI読取り入口

確認した直接入口は38ファイルである。

| 集合 | 件数 | 内容 | 新世代での扱い |
|---|---:|---|---|
| repository root | 2 | `archive/legacy-generation-2026-09-14/root/AGENTS.md`、`archive/legacy-generation-2026-09-14/root/CLAUDE.md` | legacy project／runtime instruction。新世代manifestのsourceにせず、archive sourceとして意味採取 |
| `.claude/` root | 2 | `archive/legacy-generation-2026-09-14/root/.claude/CLAUDE.md`、`archive/legacy-generation-2026-09-14/root/.claude/settings.json` | legacy Claude runtime policy／hook wiring |
| `archive/legacy-generation-2026-09-14/root/.claude/agents` | 21 | role prompt | role名・責務・capabilityを採否し、新世代assignment contractへ再導出 |
| `archive/legacy-generation-2026-09-14/root/.claude/commands` | 7 | command prompt | 利用意図・入出力・停止条件を採否し、旧promptを再注入しない |
| `archive/legacy-generation-2026-09-14/root/.claude/hooks` | 4 | TypeScript hook entry | legacy実装。新世代OSの実行統制要求から設計し直す |
| 旧`.codex/` | 2 | `archive/legacy-generation-2026-09-14/root/.codex/config.toml`、`archive/legacy-generation-2026-09-14/root/.codex/hooks.json` | legacy Codex adapter設定。Claude設定とのbyte／shape parityを新世代要件にしない |

この38件のexact path、意味移管先、直接配線は
[現行AI読取り入口38件の意味移管台帳](legacy-ai-read-entry-disposition.md)で固定した。
これは直接入口の物理集合であり、`docs/`内のCore Reads、template、Skill、generated prompt、runtime state、
DB projectionまで閉じた集合ではない。文書consumerと動的read setは未完として分離している。

## 新世代へ採取できる情報

現行資産から採取できるのは、候補としての次の情報に限る。

- 工程・役割・禁止事項・停止条件のsemantic atom。
- 既知failure、false positive、見逃し、運用上の詰まり。
- provider／OS／shell／repository境界の外部制約。
- current consumer、required check、hook、command、read pathの接続先。
- historical decisionと、その当時の根拠・revision。

旧workflow、旧prompt、旧hook、旧adapter、旧required checkを新世代へ直接移植しない。採択した情報は新しい上流ID、
HARNESS契約、OS要求、個別製品要求、対検証へ接続し直す。

## archive後に残る意味移管・最終退役条件

1. Concept、対象別L1、L2／L11、L3／L10が確定している。
2. 各legacy資産のsource provenance、consumer、外部設定、secret参照、起動triggerを確認している。
3. 採取したsemantic atomに採択・不採用・未解決と新しいownerがある。
4. 新世代のruntime／CI／AI read pathが承認要求から生成され、旧資産を参照しない。
5. branch protection、required check、外部schedule等の切替にaction-binding approvalがある。
6. current read／write／execute pathにlegacy資産が残らず、archiveから復元されないことをread-afterで確認する。

要求整理完了前でも非実行archiveへの隔離は成立済みである。このinventoryだけを根拠にarchive sourceを物理削除、
復元、実行せず、新世代replacementの完成を主張しない。

## 調査再現

隔離前に使用したread-only discoveryは次のとおり。現在の再確認では同じpathをarchive root配下に置き換える。

```text
rg --files .github/workflows
find .claude -type f
find .codex -type f
find . -maxdepth 1 -type f -name 'AGENTS*.md' -o -name 'CLAUDE*.md'
rg --files src | rg '(^|/)(ci|github|review|gate|doctor|workflow|claude|codex|adapter|hook)'
```

件数は本branchの調査時点で、workflow 4、`.claude/` 34、`.codex/` 2、root AI文書2、CI関連filename発見集合82である。
