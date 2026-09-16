# A-113 PM 前 overview review

日付: 2026-06-09
範囲: PM review 前に、A-110 rework follow-up、L6/G6 governance state、L7 pair/test evidence、improvement backlog、cross-document readability risk を確認する。
reviewer: Codex TL（PM 前 overview であり、PM sign-off ではない）
判定: L6 rework は PM review へ進められる。ただし G6 は、PM/cross-agent review が closure を受け入れるまで `CONDITIONAL PASS` のまま維持する。

## review 方法

- controlling independent re-audit として A-110 を読んだ。
- rework 後に lint、typecheck、vitest、doctor の mechanical gate を再実行した。
- UTF-8 read で L6 design docs と PM-trace L5 PLAN の mojibake marker を scan した。
- A-110 の MUST/SHOULD/Minor finding を current file と照合した。
- 既知の governance risk として、G6 gate wording、L7/REVERSE draft carry、stale agent slot warning、過去の L5 readability debt を確認した。

## PM 前に close 済み

### A-110 MUST-1: L6 readability の解決

解決済み。

- `gate-confirm.md` と `plan-schedule-lint.md` の heading/content は、U+2001/U+FFFD mojibake を含まない。
- `src/lint/readability.ts` と `tests/readability.test.ts` を追加した。
- doctor は現在、L6 design doc readability と PM-trace L5 PLAN readability scope を hard-check し、`readability — OK (freeze review docs 22件 mojibake marker 0)` を報告する。
- improvement backlog の domestication: IMP-089。

### A-110 MUST-2: FR addendum substance の解決

current L6 closure scope では解決済み。

- `function-spec.md` は、FR addendum function 向けに typed input/result body と `implemented pseudocode` または `explicit_l7_defer` を含む。
- `src/lint/l6-fr-coverage.ts` は、ID-only coverage を受け入れず、type/pseudocode/defer substance の欠落を検出する。
- `tests/l6-fr-coverage.test.ts` は synthetic missing-substance と real-repo guard を含む。
- improvement backlog の domestication: IMP-090。

### A-110 SHOULD-3 / SHOULD-4 の解決

L6 design level で解決済み。

- `governance-enforcement.md` は `evaluateGateReview` / `checkReviewEvidence` の type body と pseudocode/defer substance を示す。
- `agent-slots.md` は `resolveRosterCapability` を typed body と pseudocode/defer substance に接続している。

### A-110 Minor fix 適用済み

- `edge-case.md` は、`upstream-coverage`、`id-format`、`glossary-delta`、`backlog-format` を含む IMP-033 rule type 10 件すべてを cover する。
- `L7-unit-test-design.md` は `analyzeTestPerspectiveGate` 向けに `U-FR-L1-21` を拡張している。
- `module-drift.md` は `analyzeAssetDrift` を明示的な §7 carry として記録している。
- `gate-confirm.md` は DbC/fail-open invariant section を持つ。

### IMP-091: L5 PLAN readability debt の解決

PM trace scope では解決済み。

- `PLAN-L5-03-internal-processing.md`、`PLAN-L5-05-roster.md`、`PLAN-L5-06-skill.md`、`PLAN-L5-07-drift.md` の readable body を、known-good pre-corruption revision から復元した。
- current `status: confirmed` と `review_evidence` block は維持した。
- `[直列]` marker、serial reason、§3.1 implementation plan、fixed review step を維持し、§1.10 schedule compliance を保持した。
- `src/lint/readability.ts` / doctor を L6-only scope から L6 + PM-trace L5 PLAN scope へ拡張した。
- improvement backlog の domestication: IMP-091。

## gate / governance 状態

- `gate-design.md` は G6 を正しく `CONDITIONAL PASS` のまま保持している。
- A-109 は A-110 により限定されており、unconditional sign-off として読んではならない。
- この rework は A-110 MUST-1/MUST-2 を close するが、unconditional G6 `PASS` は意図的に PM/cross-agent review へ残している。

## mechanical evidence の記録

この overview rework 後の最新 local evidence:

- `bun run lint`: exit 0
- `bun run typecheck`: exit 0
- `npx vitest run`: 35 files / 288 tests passed
- `bun src\cli.ts doctor`: exit 0
- `git diff --check`: exit 0。markdown file の CRLF normalization warning のみ。

doctor の current report:

- `l6-fr-coverage — OK`
- `readability — OK (freeze review docs 22件 mojibake marker 0)`
- `l6-completion — OK`
- `review-evidence — OK`
- `verification — L4-L6 freeze 完了`
- official `helix session start` self-heal path 実行後、`agent-slots — OK (active=0, peak_parallel=4)`。

## PM aware の残 carry

### Carry-1: L7/REVERSE plan は draft のまま

A-110 は、implementation/test artifact が存在する一方で L7-20/22/23 と REVERSE-21/22 が draft であることをすでに指摘している。これは L6 conditional closure の blocker ではないが、PM は次を判断する必要がある。

- G7 開始まで L7 carry として維持する。
- PM/cross-agent review 後、review evidence を添えて promote する。

### Closed-2: L5 PLAN readability debt の解消

A-111 L5 readability carry は PM trace scope では close 済み。4 つの PLAN file は現在 UTF-8 で clean に読め、doctor readability hard guard の対象になっている。

### Closed-3: agent-slots stale warning の解消

以前の stale slot は `agent_guard` runtime state entry だった。これは意図された `helix session start` self-heal path で clear 済みであり、`doctor` は現在 `agent-slots — OK` を報告する。

## PM review recommendation の内容

G6 を `CONDITIONAL PASS` のまま維持して PM review へ進む。

PM へ確認する事項:

1. A-110 MUST-1/MUST-2 closure を受け入れるか。
2. G6 を conditional から unconditional `PASS` へ promote してよいか。
3. draft の L7/REVERSE plan を今 confirm すべきか、G7 へ carry すべきか。
4. より広い all-confirmed-doc readability coverage を IMP-086 から次の hard gate へ promote すべきか。
