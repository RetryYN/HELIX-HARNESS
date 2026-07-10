---
layer: L6
sub_doc: function-spec
status: confirmed
freeze_blocking: false
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-64-memory-cross-runtime-surface.md
---

> **L6 contract marker**: `AdapterContextInjection.memory_lines?: string[]` を受けた
> `buildAdapterPlan` は、委譲 prompt（stdin）へ read-only の memory recall section を決定論で
> 合成する。pre: memory_lines は surface budget 適用済みの行配列。post: MEMX-S1..S4 の oracle が
> 全て green のときだけ合格。invariant: memory_lines 以外の prompt 構成（task / role brief /
> lens / skill 注入）を変えない。secret は write 境界で拒否済み entry のみが到達する。

# harness memory の cross-runtime surface — 機能設計

## §1 目的と境界

harness memory の到達面は現在 Claude Code SessionStart と `helix memory show` のみで、
`helix codex` / `helix claude` 委譲 prompt・Codex 拡張チャット・team run worker には一切届かない
（audit 2026-07-11 §2.2 M3、PLAN-L6-64 §0）。本設計は **memory surface を全 runtime 到達面へ
配る注入契約**を定義する。memory entry 構造そのもの（schema v2 / takeover / lifecycle）は
`harness-memory-structure.md`（PLAN-L6-62）の契約に従属し、本設計は読出・合成のみを扱う
（memory への書込は行わない）。

## §2 注入経路の選定（Codex 拡張チャット）

候補比較（PLAN-L6-64 §1.1）の結論: **(a) 動的 command 出力を正**とする。

| 候補 | 判定 |
|---|---|
| (a) session 初回に `helix session start`（または `helix memory show`）の stdout を注入 | **採用**。surface は常に live 導出で、静的 prose の腐敗（audit H7: ~/.codex/AGENTS.md が実在しない識別子を指した実証）を構造的に回避する |
| (b) AGENTS.md managed block へ生成 snapshot を埋め込み | 不採用（保留）。生成時刻からの stale 化を再導入し、handover markdown と同型の drift 面を作る。(a) が使えない環境の fallback として将来再評価 |
| (c) `.codex/hooks.json` の session-start hook | 現時点で Codex hook engine に SessionStart 相当が無い（実測）。提供され次第 (a) の呼出を hook 化する追随のみ |

- AGENTS.md の session start 手順（現行: CURRENT.json 確認）の書き換えは handover 撤去と同一
  変更セット（PLAN-L6-61 §1.4、rule-drift marker 同期）で行い、本設計では手順文言を確定するだけ:
  「session 初回に `helix session start` の出力（feedback surface + harness-memory）を確認する」。
- `helix memory show` は memory v2 の surface（PLAN-L6-62 §5）へ自動追随する（同一関数を呼ぶ）。

## §3 委譲 prompt 注入契約（helix codex / helix claude / subagent 委譲）

- `AdapterContextInjection` を拡張する:

```ts
interface AdapterContextInjection {
  required_paths: string[];
  optional_paths: string[];
  /** surface budget 適用済みの memory recall 行 (read-only、省略時は section 非生成)。 */
  memory_lines?: string[];
}
```

- `formatAdapterPrompt` は既存 section 順序（task 本文 → role 判断ブリーフ → 思考レンズ →
  skill 注入）の**末尾**に memory recall section を追加する:
  `MEMORY_RECALL_HEADER = "HELIX memory recall (read-only, auto-injected):"` + 行配列。
  memory_lines が空/未定義なら section を生成しない（no-op、既存 prompt と byte 同一）。
- 行の生成は呼出面が `surfaceMemory(deps, DELEGATION_MEMORY_BUDGET)` で行う。adapter は IO を
  持たず、受け取った行を合成するだけ（純関数のまま）。
- 委譲側 CLI（`helix codex` / `helix claude`）は skill 注入 resolver と同一箇所で memory 行を解決し、
  **skill が 0 件でも memory があれば注入する**（skill と memory は独立条件）。

## §4 ランタイム別 budget

| 呼出面 | budget | 根拠 |
|---|---|---|
| SessionStart（chat、人間可読） | `maxEntries=12 / maxBodyChars=240`（既定、PLAN-L6-62 §5） | 既存挙動維持 |
| 委譲 prompt（`helix codex` / `helix claude`） | `DELEGATION_MEMORY_BUDGET = { maxEntries: 6, maxBodyChars: 200 }`（exported policy const） | 委譲 prompt は task 本文 + ブリーフ + skill が主で、recall は補助。token 予算を厳格化 |
| team run worker / task route | `DELEGATION_MEMORY_BUDGET` を継承（6 件 / 200 chars。PLAN-L7-414 で解禁）。注入可否は `composeDelegationInjection` の surface policy として機械固定のまま維持し、U-MEMX-005 が全呼出面注入を保証する。team run の member fan-out でも固定 cap のため member あたりの増分は有界 | 段階導入の第 2 段（delegation 面の稼働実測 2026-07-11 後に解禁） |
| 将来の新呼出面（例: orchestration pair-agent） | 既定 = 非注入。surface policy へ明示追加するまで注入されない | blast radius 制御の恒常則（fail-close 既定） |

## §5 秘匿・漏洩境界

- 注入対象は write 境界で secret 拒否済みの memory entry のみ（PLAN-L6-62 §2 の不変条件を継承）。
  adapter は行を加工しない（新規に path や機密を合成しない、PLAN-L7-145 の教訓）。
- memory recall section は read-only 宣言を header に含め、受領側 runtime に「recall を編集・
  転記して正本化しない」ことを明示する。

## §6 V-pair scenario（L7 unit test-design への降下契約）

| Scenario | 検証 oracle |
|---|---|
| MEMX-S1 | memory_lines 非空のとき委譲 stdin に MEMORY_RECALL_HEADER + 全行が載る。空/未定義では header を含む section が一切生成されず、既存 prompt と同一。 |
| MEMX-S2 | skill 注入（required/optional）と memory recall が共存し、section 順序（task → brief → lens → skills → memory）が決定論で保たれる。 |
| MEMX-S3 | 委譲 budget（6 件 / 200 chars）が surfaceMemory 経由で適用され、超過 entry は隠れ件数 footer に集計される。 |
| MEMX-S4 | skill 0 件 + memory 有りの委譲で context_injection が生成され memory だけが注入される（skill 0 件を理由に memory を落とさない）。 |
| MEMX-S5 | surface policy: `delegation` / `team_run` / `task_route` の全呼出面で memory_lines が注入され、skill 0 件 + memory のみでも section が生成される（§4 第 2 段の解禁、PLAN-L7-414。新呼出面は policy へ明示追加するまで非注入の fail-close 既定を維持）。 |

後続 L7 実装 PLAN（PLAN-L7-406）は MEMX-S1..S4 を `U-MEMX-*` oracle と test citation へ同時に
具体化する。
