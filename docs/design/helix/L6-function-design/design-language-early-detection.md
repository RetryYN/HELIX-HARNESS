---
title: "design-language 早期検出機能設計"
layer: L6
kind: recovery
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Claude / TL
plan: docs/plans/PLAN-RECOVERY-110-design-language-early-detection.md
pair_artifact: docs/test-design/helix/L8-design-language-early-detection-unit-test-design.md
---

# design-language 早期検出機能設計

## 1. 責務と非責務

本設計は既存 `design-language` gate の**判定内容を一切変更しない**。変更するのは
「いつ検出するか」と「message から違反箇所を特定できるか」の 2 点だけである。

- 判定の正本は `src/lint/design-language.ts` の `analyzeDesignLanguage` であり続ける。
- `DESIGN_LANGUAGE_BASELINE_VIOLATIONS` と `DESIGN_LANGUAGE_BASELINE_FINGERPRINT` の意味と値は不変。
- 新しい lint、新しい gate、別 authority を追加しない。既存 debt の一括日本語化も行わない。

## 2. 是正する欠陥

`designLanguageMessages` は violation の `path:line:reason` を出す分岐を持つが、`fingerprintDrift` 分岐が
先に return する。`DESIGN_LANGUAGE_BASELINE_VIOLATIONS` は 0 であり、violation が 1 件でもあれば
aggregate fingerprint は baseline と必ず異なるため drift が成立する。したがって
**位置を出す分岐は現行 baseline では到達不能**であった。

```
analyzeDesignLanguage([{ path: "docs/plans/PLAN-X.md", text: "…## Current Recovery V-pair oracle…" }])
  violations 1 / newViolations 1 / fingerprintDrift true
  violation detail  docs/plans/PLAN-X.md:3 english-heading
  message           … fingerprint changed at frozen debt count (total=1, baseline=0, fingerprint=…)
  位置を含むか       含まない
```

analyzer は位置を保持しているのに message へ出さないため、違反箇所の特定を review 側へ押し付けていた。

さらに CI では `doctor` が最終 job の `full-regression-finalize` で実行されるため、英語見出し 1 行の
ために preflight から全 shard を回し切ってから落ちていた。

## 3. 関数設計

| 関数 | シグネチャ | 事前条件 | 事後条件 | 不変条件 | oracle |
|---|---|---|---|---|---|
| `violationSample` | violationSample(result: DesignLanguageResult) => string | `violations` が canonical order で供給される。 | 増加側を優先した先頭最大 8 件を `path:line:reason` で連結し、残件数を付す。 | 判定に影響しない表示専用であり、`ok` を変えない。 | U-DESLANG-013 |
| `runDoctorGate` | runDoctorGate(gate: string, repoRoot: string) => { ok, gate, messages } | `DOCTOR_SINGLE_GATES` に gate が登録されている。 | full doctor と同一の check 関数へ委譲し、その `ok` と `messages` をそのまま返す。 | 単体実行のために判定を複製・加工しない。unknown gate は fail-close する。 | U-DESLANG-014 |

`DOCTOR_SINGLE_GATES` は gate ID から check 関数への写像であり、現時点の登録は `design-language` のみ。
`helix doctor --gate <id>` は判定を持たず `runDoctorGate` へ委譲するだけの入口とする。

## 4. CI 実行位置

`full-regression-preflight` の `npm run test:repo-guards` より**前**に同 gate を実行する。
design-language は repository 上の doc を読むだけで DB も GitHub API も要らないため preflight で成立する。
違反時は shard 起動前に落ち、`full-regression-finalize` の `doctor` へ到達しない。

`full-regression-finalize` の `doctor` 実行は削除しない。前倒しであって置換ではなく、
preflight の gate が外されても finalize 側で必ず検出される二重化を維持する。

## 5. fail-close 条件

- drift message から位置表示が失われる。
- 単体実行経路が full doctor と異なる判定を返す。
- unknown gate が `ok: true` を返す。
- preflight の gate が shard 起動より後ろへ移動する。

検査 oracle は `U-DESLANG-013` / `U-DESLANG-014` / `U-DESLANG-015` の 3 件で固定する。
