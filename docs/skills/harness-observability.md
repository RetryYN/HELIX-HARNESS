---
schema_version: skill.v1
name: harness-observability
skill_type: verification
applies_to:
  layers:
    - L5
    - L6
    - L7
    - L8
    - L11
    - L12
    - L13
    - L14
  drive_models:
    - Forward
    - Add-feature
    - Discovery
    - Recovery
---

# harness observability（観測性）

`harness.db` projection、session log、cross-runtime token/cost telemetry の設計と運用を扱う。
これは HELIX の observability backbone である（FR-L1-06 state SSoT、FR-L1-07 auto-registration、
FR-L1-20 metrics、FR-L1-38 model/cost）。projection、DB を読む `helix doctor` check、
または telemetry capture point を追加する場合に適用する。

## この skill を読む場面

- PLAN が `harness.db` table、`gate_runs` / `model_runs` capture、または metric を追加・変更する。
- doctor check が DB state を読み、missing row で fail-close する必要がある。
- agent call の cost/token telemetry を記録する必要がある。

## harness.db とは何か

`harness.db` は、`docs/plans/*.md`、`.helix/` state、session log から
`src/state-db/projection-writer.ts` 経由で再構築される **deterministic projection** である。
直接書き込んではならない。また、design truth の source として扱ってはならない
（それは `docs/design/` にある）。PLAN trace coverage、gate 実行有無（`gate_runs`）、
run ごとの model/cost（`model_runs`）、skill adoption（`skill_evaluations`）については authoritative である。
再構築は `helix db rebuild`、確認は `helix metrics`、`helix telemetry`、`helix find` を使う。

## 新しい projection の追加（L5→L7）

1. feature design doc の L5 で table を設計する。name、columns、types、そしてその table が答える問いを明記する。
2. projection の L6 test design を書く。seed input state → run projection → assert rows
   （`tests/projection-writer.test.ts` が pattern）。
3. `src/state-db/projection-writer.ts` に実装する。
4. missing/empty projection が silent gap ではなく fail-close condition になるように、
   `helix doctor` へ接続する（`db-projection-coverage` / `-ingestion`）。

## Model / cost telemetry の記録（FR-L1-38）

token と cost の telemetry は `helix telemetry` で exposed され、`model_runs` に projected される。
agent call path を追加する場合は次を確認する。

- [ ] call は raw provider spawn ではなく `helix claude` / `helix codex` / `helix team
      run` 経由にする。lifecycle と cost evidence を capture するのは wrapper だけである。
- [ ] run metadata（runtime、model、role、drive、plan_id、timings）を `model_runs` に記録する。
- [ ] metadata だけを保存する。prompt text、response text、credentials、PII は絶対に保存しない。

## Session log と handover

`SessionStart` と `Stop` hook は各 session を bracket し（`src/runtime/session-log.ts`）、
event を PLAN digest に圧縮する。session boundary では `helix handover` を実行し、
`.helix/handover/CURRENT.json` を flush する。handover carry は truth ではなく claim として扱う。
依拠する前に `git log` と `helix doctor` で検証する。

## Redaction boundary（redaction 境界）

observability layer は API key、token、credential、PII、verbatim prompt/response text を保存してはならない。
capture point にそれらが含まれ得る場合は、`projection-writer.ts` insert 前に redaction step を追加し、
その field が存在しないことを assert する unit test を追加する。

## observability gate の L8 integration test

- [ ] valid input state から projection が正しい row を書く。
- [ ] row が存在すると doctor gate が pass する。
- [ ] row が存在しないと doctor gate が fail する（absence-blindness prevention）。
- [ ] scratch から rebuild しても identical row が生成される（determinism）。

`helix status` + `helix doctor` output を canonical acceptance evidence として
`.helix/audit/` に capture する。DB query output だけでは acceptance proof にならない。
