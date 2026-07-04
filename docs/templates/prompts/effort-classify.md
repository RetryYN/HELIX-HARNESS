# タスク分類・見積もりプロンプト

このプロンプトは、rule-based classifier が LLM fallback を必要とする場合だけ使う。
通常の実行経路は `src/task/` 配下の TypeScript classifier である。

## 入力

```json
{
  "task_text": "...",
  "files": null,
  "lines": null,
  "api_changes": false,
  "db_changes": false,
  "plan_frontmatter": {
    "kind": "...",
    "drive": "..."
  }
}
```

## 分類ルール

`kind`、`drive`、`size`、`complexity`、`capability_class` をそれぞれ 1 つ返す。

- `kind`: `impl`, `design`, `poc`, `reverse`, `add-design`, `add-impl`,
  `refactor`, `retrofit`, `recovery`, `troubleshoot`, or `research`.
- `drive`: `be`, `fe`, `fullstack`, `db`, or `agent`.
- `size`: `S`, `M`, `L`, or `XL`.
- `complexity`: `low`, `medium`, `high`, or `xhigh`.
- `capability_class`: `frontier-reviewer`, `worker`, or `fast-checker`.

task が production impact、security impact、external API assumption、高い不確実性、大きい size、
または cross-module design risk を持つ場合は `frontier-reviewer` へ escalate する。

## 見積もりルール

simple PERT estimate を使う。

```text
most_likely = low:2h, medium:6h, high:12h, xhigh:24h
optimistic = most_likely * 0.5
pessimistic = most_likely * 2
expected = (optimistic + 4 * most_likely + pessimistic) / 6
buffered = expected * risk_factor
```

不確実性、migration work、cross-platform work、security、external dependency、
不明瞭な requirements に応じて `risk_factor` は `1.0` から `2.0` の範囲で使う。

## 出力

JSON だけを返す。

```json
{
  "classification": {
    "kind": "...",
    "drive": "...",
    "size": "S|M|L|XL",
    "complexity": "low|medium|high|xhigh",
    "split_required": false,
    "recommended_path": "...",
    "recommended_gates": ["G6", "G7"],
    "confidence": 0.82,
    "reasons": ["..."]
  },
  "estimate": {
    "optimistic_hours": 3,
    "most_likely_hours": 6,
    "pessimistic_hours": 12,
    "expected_hours": 6.5,
    "risk_factor": 1.4,
    "buffered_hours": 9.1,
    "story_points": 5,
    "risks": ["..."]
  },
  "orchestration": {
    "capability_class": "frontier-reviewer|worker|fast-checker",
    "reasons": ["..."]
  }
}
```

この prompt から raw provider CLI や SDK を呼ばない。現行 wrapper（`ut-tdd`）が runtime dispatch、
audit evidence、handover state を管理する。
