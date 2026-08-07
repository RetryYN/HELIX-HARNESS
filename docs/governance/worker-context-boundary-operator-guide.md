# worker context boundary 運用ガイド（`--worker-context-file`）

WCC-FR-09 により、**`--execute` を伴う worker 起動経路はすべて `--worker-context-file <path>` を必須**とする。
本書は operator が boundary JSON をどこに置き、どう書き、何が検査されるかを示す正本である。

正本実装は `src/runtime/worker-context-packet.ts` の `loadWorkerContextBoundaryFile`。
本書の記述と実装が食い違った場合は実装が正であり、本書を是正する。

## 1. 必須になる経路

| コマンド | boundary 必須条件 |
|---|---|
| `helix codex --role <role> --task "..." --execute` | `--execute` 時 |
| `helix claude --role <role> --task "..." --execute` | `--execute` 時 |
| `helix loop run --plan <id>` | `--dry-run` 以外 |
| `helix pair-agent run --execute` | `--execute` 時 |
| `helix team run --definition <path> --execute` | `--execute` 時 |

`--dry-run`（および `--execute` を付けない plan 出力）は boundary 不要である。
boundary が無い、または解決できない状態で `--execute` すると `WORKER_CONTEXT_UNSEALED` /
`WORKER_CONTEXT_SCHEMA_INVALID` で **fail-close** し、provider は一切起動しない。

## 2. 置き場所

boundary JSON は **`.helix/worker-context/<goal-id>.json`** に置く。

- `.helix/` 配下だが `state` / `cache` / `logs` のような生成 runtime state ではなく、
  operator が書く **追跡対象の設定ファイル**である（`.gitignore` は `.helix/state/*` /
  `.helix/cache/*` / `.helix/logs/` などを除外するが `.helix/worker-context/` は除外しない）。
- goal 単位で分ける。1 つの goal に複数 behavior contract がある場合は
  `.helix/worker-context/<goal-id>-<behavior-contract-id>.json` のように分割してよい。
- secrets / token / PII を書かない。boundary は path と数値予算だけを持つ。

`helix setup project` は **現時点では boundary を生成しない**。自動生成は runtime behavior の追加であり、
既定の `goal_id` / `behavior_contract_id` / `allowed_paths` を harness 側が勝手に決めると
scope 契約の意味が失われるため、本書ではテンプレートの手書きを正規手順とする
（自動生成を入れる場合は別 PLAN で `helix setup project` の契約を拡張する）。

## 3. schema

`loadWorkerContextBoundaryFile` が受理する JSON は次のとおり。すべて必須。

```json
{
  "goal_id": "GOAL-2026-08-worker-admission",
  "workflow_style": "v_model",
  "case_model": "none",
  "specialist_process": "none",
  "behavior_contract_id": "WCC-FR-09",
  "responsibility_owner": "worker-context-authority",
  "allowed_paths": ["src/runtime", "tests"],
  "forbidden_paths": ["docs/governance", ".helix"],
  "severity_policy_digest": "sha256:<64 hex>",
  "required_output_schema": "sha256:<64 hex>",
  "budget": { "time_ms": 60000, "token_limit": 8000 }
}
```

### 3 軸（`validAxes`）

| field | 許容値 |
|---|---|
| `workflow_style` | `v_model` / `production_scrum` / `v_design_scrum_implementation_hybrid` |
| `case_model` | `none` / `discovery` / `poc` / `other_admitted_case` |
| `specialist_process` | `none` / `design_harness` / `other_admitted_specialist` |

development style と case-driven model は直交する。Discovery / PoC を回すからといって
`workflow_style` を変えない。

### scope（`validScope`）

- `goal_id` / `behavior_contract_id` / `responsibility_owner` は空文字・空白のみを拒否する。
- `allowed_paths` は **1 件以上**必須。`forbidden_paths` は 0 件でもよい。
- 双方とも repository 相対 path で、`..` 等で外へ出る表現は拒否される。
- 各配列内の**重複を拒否**する。
- `allowed_paths` と `forbidden_paths` が**包含関係を持つと拒否**する
  （`src` と `src/runtime` の同時指定は不可。片方だけを書く）。

### budget（`validBudget`）

`time_ms` と `token_limit` は safe integer で、正の値を指定する。

### digest 2 件

`severity_policy_digest` / `required_output_schema` は `sha256:` + 64 hex の形式検査を受ける。
それぞれ「適用する severity policy」「worker に要求する出力 schema」の digest であり、
運用中の値を貼る。値を用意していない段階では、対象文書 / schema ファイルの sha256 を使う。

```bash
printf 'sha256:%s' "$(sha256sum path/to/severity-policy.json | cut -d' ' -f1)"
```

## 4. authority / rule path は boundary に書かない

worker context authority が固定する authority path と rule path は **実装側の定数**であり、
boundary JSON では指定しない（`src/runtime/worker-context-packet.ts` の
`CURRENT_AUTHORITY_PATHS` / `CURRENT_RULE_PATHS`）。

authority paths:

- `docs/governance/helix-harness-requirements_v1.3.md`
- `docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md`
- `docs/design/helix/L3-requirements/worker-common-contract.md`

rule paths:

- `AGENTS.md`
- `CLAUDE.md`
- `.claude/CLAUDE.md`
- `docs/skills/judgment-core.md`

これらは boundary 読み込み時に current HEAD へ束縛される。HEAD が動いた状態の
stale boundary は `WORKER_CONTEXT_HEAD_DRIFT` で fail-close する。

## 5. 失敗コードの読み方

| failure code | 意味 | 典型的な原因 |
|---|---|---|
| `WORKER_CONTEXT_UNSEALED` | boundary 未指定または未解決のまま `--execute` した | `--worker-context-file` を付け忘れた |
| `WORKER_CONTEXT_SCHEMA_INVALID` | JSON が読めない / schema 不適合 | path 誤り、3 軸の値違い、allowed↔forbidden の包含、digest 形式違い |
| `WORKER_CONTEXT_HEAD_DRIFT` | authority が current HEAD と一致しない | 未 commit の authority 変更、HEAD 移動 |
| `WORKER_CONTEXT_AUTHORITY_UNRESOLVED` | authority path が解決できない | authority 文書の欠落・改名 |
| `WORKER_CONTEXT_RULE_PACKET_UNRESOLVED` | rule path が解決できない | adapter doc の欠落・改名 |

## 6. 実行例

```bash
helix codex --role se --task "implement WCC-FR-09 follow-up" --execute \
  --worker-context-file .helix/worker-context/GOAL-2026-08-worker-admission.json

helix loop run --plan PLAN-L7-177 --once \
  --worker-context-file .helix/worker-context/GOAL-2026-08-worker-admission.json
```

`--dry-run` は boundary 無しで確認できるため、boundary を書く前の疎通確認に使う。

```bash
helix loop run --plan PLAN-L7-177 --dry-run
```
