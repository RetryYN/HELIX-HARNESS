# HELIX setup guide（導入ガイド）

> 位置付け: consumer onboarding 用 reference。配布 surface の実切替や `.ut-tdd` 物理 rename は
> `PLAN-M-02-helix-identifier-rename` の cutover approval 後にだけ行う。

## 1. 対象

この guide は、HELIX Harness を既存 repository または新規 repository に導入する人が、初期 setup の
生成物と安全境界を確認するための reference である。開発 repository の dogfood state を consumer の
正本 state と混同しない。

## 2. 前提

| 項目 | 必須条件 |
|---|---|
| runtime | Bun、Git、利用する AI provider CLI が実行可能であること |
| package | `package.json` と lockfile が存在し、`bun install --frozen-lockfile` が通ること |
| command | 現行 cutover 前は `ut-tdd` wrapper を使うこと |
| state | `.ut-tdd/` は現行 runtime state。`.helix/` への移動は PLAN-M-02 承認後 |
| secrets | setup docs、audit、handover、example に credential / PII / secret を書かないこと |

## 3. 新規 repository への導入

1. package root で依存関係を用意する。
2. `bun run ut-tdd setup project --dry-run --json` を実行し、生成予定の adapter、hooks、VS Code tasks、
   GitHub templates、handover baseline を確認する。
3. `bun run ut-tdd doctor --profile consumer --json` で consumer profile の不足を確認する。
4. `bun run ut-tdd status --json` で outstanding と decision packet route を確認する。
5. 生成物を適用する場合は、既存 project-owned instruction と衝突しないことを review してから取り込む。

## 4. 既存 repository への導入

既存 repository では、setup は既存 `AGENTS.md`、`CLAUDE.md`、`.vscode/tasks.json`、GitHub workflow を
無条件に上書きしない。import report を見て、保持する行、managed block、手動 merge が必要な箇所を分ける。

| 確認観点 | 期待 |
|---|---|
| instructions | project-owned instruction を保持し、HELIX managed block を重複させない |
| hooks | global config へ書かず、repo-local `.claude/` / `.codex/` surface に限定する |
| CI | `harness-check` は read-only smoke とし、secret を要求しない |
| handover | `.ut-tdd/handover/CURRENT.json` は runtime pointer。手書き bypass を正本にしない |
| rename | `.ut-tdd` / `ut-tdd` 物理 rename は承認済み cutover runbook が揃うまで行わない |

## 5. 検証 command

consumer setup 後は、少なくとも次を dry-run / read-only で確認する。

```bash
bun run ut-tdd status --json
bun run ut-tdd completion decision-packet --json
bun run ut-tdd completion review-bundle --json
bun run ut-tdd doctor --profile consumer --json
bun run ut-tdd rename plan --json
bun run ut-tdd setup project --dry-run --json
```

`rename plan` は plan-only packet であり、apply 権限を持たない。approval record、snapshot binding、
rollback、state backup、monitoring evidence が無い状態で state move を実行しない。

## 6. GitHub 運用

consumer repository では、`harness-check` を Required Status Check にする前に read-only smoke が通ることを
確認する。branch protection、required review、main merge ルールは repository owner が GitHub 側で設定する。
HELIX setup はそれらの判断材料を作るが、GitHub 権限変更そのものは action-binding approval の対象である。

## 7. トラブル時の切り分け

| 症状 | 初動 |
|---|---|
| `ut-tdd` が PATH に無い | package-local `bun run ut-tdd ...` で smoke し、install/link 手順を確認する |
| consumer doctor が dogfood docs を要求する | `--profile consumer` を指定しているか確認する |
| CI が secret を要求する | generated `harness-check.yml` から secret 参照が混入していないか確認する |
| rename が blocked | `PLAN-M-02` の approval packet、cutover snapshot、rollback evidence を確認する |
