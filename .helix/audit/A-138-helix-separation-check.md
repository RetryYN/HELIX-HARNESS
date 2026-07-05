# A-138 HELIX 分離チェック

Date: 2026-06-16

目的: PLAN-L7-68 が HELIX runtime state や legacy `helix` command dispatch を HELIX 所有の実行 surface へ戻していないことを確認する。

## 対象範囲

確認した HELIX 所有の runtime / test surface:

- `src`
- `tests`
- `docs/handover`
- `.helix/handover`
- `.helix/audit`
- PLAN-L7-68 が触れた active design / PLAN 参照

Vendor snapshots と archive docs は historical / reference material であり、product runtime ではない。

## 所見

| 検査 | 結果 | 注記 |
|---|---|---|
| Provider binary override 名 | pass | Runtime は `HELIX_CODEX_BIN` と `HELIX_CLAUDE_BIN` を使う。 |
| runtime/test/handover 内の legacy provider override 名 | pass | `src`、`tests`、`docs/handover`、`.helix/handover` の narrow search では old provider override / raw-wrapper 名の literal hit は 0。 |
| Legacy raw-wrapper env coupling | pass | `adapterExecutionEnv` は provider 実行前に legacy raw-wrapper env 名を除去し、それらを emit しない。 |
| product code 内の `helix codex` / `helix claude` 実行経路 | pass | 残る hit は asset-drift tests の negative fixture、または forbidden residue を説明する historical / design text のみ。 |
| Provider JSON と explicit handover | pass | Provider handover package は `handover_kind: "mechanical"` を持ち、explicit judgement は `docs/handover/session-handover-2026-06-16.md` にある。 |

## 証跡コマンド

```powershell
rg -n "HELIX_CODEX_BIN|HELIX_CLAUDE_BIN|HELIX_ALLOW_RAW|HELIX_RAW_.*REASON" src tests docs\handover .helix\handover --glob '!vendor/**'
rg -n "\bhelix\s+(codex|claude|team|handover|plan|gate|doctor|review|code|sprint|skill)\b" src tests .claude docs\templates docs\skills --glob '!vendor/**'
```

1 つ目の command は match なし。2 つ目の command は forbidden legacy command residue を検出する negative test fixture と rule assertion のみを返した。

## Conclusion

確認範囲では、HELIX は historical terminology、migration context、negative-test residue としてのみ残る。PLAN-L7-68 は HELIX runtime state に依存しない。
