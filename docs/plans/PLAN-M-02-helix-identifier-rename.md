---
plan_id: PLAN-M-02-helix-identifier-rename
title: "PLAN-M-02 (migration): 機械識別子 ut-tdd → helix atomic 改名 (L1 完了境界 trigger)"
kind: design
layer: L14
drive: fullstack
status: draft
created: 2026-06-28
updated: 2026-06-28
owner: PO (人間 / RetryYN)
master_hub: true   # CLI/dir/marker/hook/docs を 1 工程で揃える atomic migration 駆動 hub
agent_slots:
  - role: tl
    slot_label: "TL — 機械識別子改名の blast-radius 統制・全 gate green 境界条件の検証"
  - role: po
    slot_label: "PO — cutover 承認 (不可逆: state dir 移行を含む)"
generates:
  - artifact_path: docs/plans/PLAN-M-02-helix-identifier-rename.md
    artifact_type: markdown_doc
dependencies:
  parent: PLAN-L1-06-helix-solo-conversion
  blocks: []
  references:
    - docs/plans/PLAN-L1-06-helix-solo-conversion.md
    - docs/adr/ADR-001-ut-tdd-harness-redesign-and-language.md
    - CLAUDE.md
    - AGENTS.md
    - .claude/CLAUDE.md
---

# PLAN-M-02 (migration): 機械識別子 ut-tdd → helix atomic 改名

## §0 本 PLAN の役割 / trigger 条件

CLAUDE.md「リネーム方針（段階）」の後半を実体化する追跡台帳。**製品名・prose は HELIX へ継続移行**するが、
**機械識別子（CLI `ut-tdd`、状態 dir `.ut-tdd/`、`area=harness`、rule-drift adapter marker）は相互ロック**して
いるため、部分改名は `rule-drift` 赤化・hook/state/DB 破断を招く。よって **1 工程で atomic に改名**する。

**trigger（着手前提）= `PLAN-L1-06-helix-solo-conversion` の G-REQ.L1 re-freeze が confirmed**。それ以前は着手しない
（機能作業と大改名を混ぜない）。本 PLAN は draft として **status/forward-convergence に常時可視**であり、
harness メモリ `rename-timing-decision` が SessionStart で surface する。これにより「口頭の later」ではなく
**機械追跡される未了作業**として残り、L1 境界で必ず拾われる（no-ask-and-defer の機械的担保）。

## §1 blast radius (2026-06-28 実測 baseline)

| 対象 | 量 |
|------|----|
| `ut-tdd`（src/） | 55 files / 222 hits |
| `ut-tdd`（tests/） | 56 files |
| `ut-tdd`（docs/） | 451 files |
| `.ut-tdd/` 物理 dir | src 37 hits ＋ 実 dir（harness.db・memory・state・logs 保持） |
| `area=harness` marker | 34 hits |
| rule-drift adapter marker | CLAUDE.md 36 / AGENTS.md 30 / .claude/CLAUDE.md 21 |
| hook 設定 | `.claude/settings.json`・`.codex/hooks.json`（`ut-tdd`/`src/cli.ts` 呼出） |
| package.json | `name`/`bin` = `ut-tdd` |

> 着手時に Step 1 で再計測し baseline を更新（差分 = 取りこぼし検知）。

## §工程表 (Step + 進捗)

### Step 1: [直列] blast-radius 再計測 + 改名表凍結
> 直列理由: downstream_dependency — 全置換の基準集合を固定してからでないと取りこぼしを検知できない。
全 `ut-tdd`/`.ut-tdd/`/`area=harness`/marker サイトを列挙し、機械識別子↔新名の対応表を凍結（製品名 prose は対象外と明示）。
- 進捗: ⬜

### Step 2: [直列] src/ + tests/ 識別子 codemod (behavior 不変)
> 直列理由: downstream_dependency — Step 1 の対応表に従って一括置換するため。
CLI 名・内部参照を helix へ。挙動不変を full vitest で担保。`area=harness` 列挙値も同時更新。
- 進捗: ⬜

### Step 3: [直列] state dir .ut-tdd/ → .helix/ 移行 (不可逆)
> 直列理由: downstream_dependency — コード参照(Step 2)更新後でないと移行中に harness.db パスが割れる。
dir move + harness.db パス + projection-writer + `.gitignore` + loop/jobs/memory store パスを atomic 更新。移行手順は冪等に。
- 進捗: ⬜

### Step 4: [直列] adapter marker + hook 同時更新 (rule-drift green 維持)
> 直列理由: downstream_dependency — Claude/Codex 両 adapter marker を同コミットで揃えないと rule-drift が赤化する。
`.claude/settings.json`・`.codex/hooks.json`・CLAUDE.md/AGENTS.md/.claude の rule-drift marker を一括改名。
- 進捗: ⬜

### Step 5: [直列] docs/prose sweep + governance doc 改名
> 直列理由: downstream_dependency — 機械側確定後に doc 表記・governance ファイル名を揃えるため。
451 docs の機械識別子表記と `ut-tdd-agent-harness-*` 系ファイル名を helix へ。SSoT 参照リンク整合。
- 進捗: ⬜

### Step 6: [直列] review (全 gate green = 境界条件)
> 直列理由: downstream_dependency — Step 1–5 の atomic 性を定量検証してから cutover するため。
`ut-tdd→helix doctor` green（**rule-drift 含む**）/ full vitest / **compiled dist smoke**（rootpath-gotcha 再発防止）/ cross-agent review。
- 進捗: ⬜

### Step 7: [直列] cutover commit + PO サインオフ
> 直列理由: irreversible_operation — state dir 移行を含む不可逆 cutover の確定は PO 承認後。
1 コミット境界で origin と整合 push、PO 承認 → status=confirmed、audit A-NNN 記録。
- 進捗: ⬜

## §3.1 実装計画 (各 Step をどう埋めるか)

| Step | 対象 | 方法 |
|------|------|------|
| 1 | 全機械識別子サイト | 再 grep 計測 → 対応表凍結（prose 除外を明示） |
| 2 | src/ tests/ | codemod + full vitest で behavior 不変担保 |
| 3 | `.ut-tdd/` 実 dir + コード | atomic dir move + harness.db/projection/store パス更新（冪等手順） |
| 4 | hooks + marker | 両 adapter 同コミット改名（rule-drift green 維持） |
| 5 | docs 451 + governance 名 | 表記 sweep + ファイル改名 + リンク整合 |
| 6 | lint/doctor/dist/review | 全 gate green（rule-drift・dist smoke 必須）を境界条件化 |
| 7 | cutover | 不可逆確定 → PO サインオフ + audit |

## §4 DoD (Definition of Done)

- [ ] trigger 充足: PLAN-L1-06 G-REQ.L1 re-freeze が confirmed であることを着手前に確認。
- [ ] CLI `helix`・状態 dir `.helix/`・`area=helix`・marker が全面改名され旧名残渣 0（Step 1 再計測で検証）。
- [ ] `rule-drift` green（両 adapter marker 一致）・full vitest green・compiled dist doctor green。
- [ ] state dir 移行が冪等・不可逆境界で PO 承認済、audit A-NNN 記録。
- [ ] 製品名/prose の HELIX 表記と機械識別子が完全一致（二重名称解消）。

## §5 carry / 次工程への引き継ぎ

- 改名後、外部公開面（README・bin 配布名）の周知は後続で扱う。
- 旧名 alias（`ut-tdd` → `helix` shim）の要否は Step 6 review で判断（後方互換の一時 shim か即時切替か）。
