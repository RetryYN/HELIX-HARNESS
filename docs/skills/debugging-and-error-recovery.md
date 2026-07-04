---
schema_version: skill.v1
name: debugging-and-error-recovery
skill_type: process
applies_to:
  layers:
    - L7
    - L8
    - L9
    - L10
    - L11
    - L12
  drive_models:
    - Recovery
    - Incident
    - Forward
    - Add-feature
    - Reverse
---

# debugging and error recovery（debug と recovery）

本 harness における defects/failures の detection-to-routing protocol
（FR-L1-08 defect detection、FR-L1-10 recovery routing、FR-L1-16 incident classification の方針）。
この skill は triage と routing phase を扱う。root cause が確認され PLAN が開いた後の fix 自体には、
error-fix skill を適用する。

## この skill を読む条件

- `ut-tdd doctor` が non-zero で終了し、root cause が明らかではない。
- `bun run test`、`bun run typecheck`、`bun run lint` が CI または local で失敗する。
- `.ut-tdd/` state または hook entrypoint に runtime error が出る。
- agent/subagent output が expected harness state と一致しない。
- forced stop または unexpected session termination が発生した
  （最も high-severity な Recovery signal）。

## Detection sources と意味

| Signal | Tool | 最初の action |
|--------|------|--------------|
| `ut-tdd doctor` non-zero | `ut-tdd doctor` | full output を読む。`| tail` しない |
| CI harness-check red | CI log | sub-gate（typecheck / lint / test / doctor）を特定 |
| `.ut-tdd/` state inconsistency | `ut-tdd status` | expected と actual state を比較 |
| Hook entrypoint status null | `ut-tdd doctor` | `PATH` に System32 が含まれるか確認（Windows） |
| Subagent output mismatch | `git status` + file read | agent narrative ではなく actual files を確認 |

失敗した command の output は必ず **full** で読む。`| head` や `| tail` で切ると root error が隠れる。
downstream error message を root cause と誤認する false-diagnosis が繰り返し発生している。

## Triage protocol（triage 手順）

### Step 1 — failure を分類する

failure が次のどれかを判断する。

- **Environmental** — PATH、runtime 不足、`.ut-tdd/` directory permissions、
  `CLAUDE_PROJECT_DIR` 未設定。最初に `ut-tdd doctor` environment checks を確認する。
- **Governance** — orphaned PLAN、design doc 欠落、broken dependency link、
  schema mismatch。`ut-tdd doctor` governance checks と `ut-tdd plan lint` を確認する。
- **Implementation** — `src/` の logic error。`bun run test` と targeted test run で確認する。
- **Test oracle** — test が誤った内容を assert している、または false-green が受け入れられた。
  test と、その test が検証すべき spec を読んで確認する。

class が明確になるまで Step 2 へ進まない。environmental を implementation と誤分類すると、
無駄な作業が発生しやすい。

### Step 2 — 正しい PLAN type へ route する

| Class | Route |
|-------|-------|
| Environmental | Recovery PLAN。environment を直し、future detection 用の `ut-tdd doctor` check を追加 |
| Governance | severity に応じて Recovery PLAN または inline fix。relevant design doc を更新 |
| Implementation defect | severity が必要なら Recovery PLAN、軽微なら error-fix skill inline |
| Incident (production / user-visible) | Incident PLAN。他の work より優先 |

user による forced stop は、見かけの technical severity に関係なく Incident-level Recovery として分類する。

### Step 3 — routing 前に再現する

PLAN を開く前に、failure が reproducible であることを確認する。

```
bun run typecheck
bun run lint
bun run test
ut-tdd doctor
ut-tdd status
```

exact failing command、first error line、HEAD SHA を PLAN の `review_evidence` field に記録する。
「以前失敗したが再現できない」は valid PLAN basis ではない。先に flakiness を診断する。

## Recovery routing checklist（routing チェックリスト）

- [ ] failure class が特定済み（environmental / governance / implementation / oracle）。
- [ ] current HEAD で failure が reproducible。
- [ ] failing command と first error line を PLAN または `.ut-tdd/audit/` に記録済み。
- [ ] 正しい PLAN type を開いている（Recovery / Incident / inline fix）。
- [ ] root cause を記録済み。symptom だけでなく、どの condition が defect を許したかを書く。
- [ ] fix 後の prevention measure を特定済み（error-fix skill 参照）。

## Iron Law と 3-attempt escalation（PLAN-RECOVERY-05）

source concept は obra/superpowers の `systematic-debugging` skill
（reference only）。以下の rule は import ではなく、本 harness の Recovery/troubleshoot drive から作成している。

**Iron Law — root-cause なしに fix しない。** code を変更する前に root-cause pass を完了する。
error を full で読み、HEAD で再現し、bad value を upstream の origin まで trace し、
single specific hypothesis を書く。hypothesis は 1 つ、変更する variable も 1 つにし、次へ進む前に検証する。
Recovery exit contract は prevention measure を要求している。これにより root-cause は post-hoc note ではなく、
fix の前にある *gate* になる。

**3-attempt architectural escalation（hard stop）。** 同じ subject（file、gate、test）が
**3 consecutive times** 失敗したら、fix を停止する。3 回の failed attempts は、
次の tweak が当たるという意味ではなく、working hypothesis または architecture が間違っているという意味である。
escalate し、root-cause pass を 1 段上（design / contract / baseline）で再実行するか、
Recovery PLAN を開く。subject の success で streak は reset される。

これは `src/runtime/attempt-escalation.ts`（`evaluateAttemptEscalation`）で機械化されている。
session log から subject ごとの consecutive `error` outcomes を数え、threshold（default 3）で
STOP signal を emit する。signal は `finding` なので、次回 session start 時に takeover feedback surface
（PLAN-L7-110）経由で agent へ届く。prose ではなく DB からの feedback である。

> Worked example（2026-06-23）: takeover session が shared/concurrently mutated working tree を繰り返し測定し、
> shifting test counts を得て、other runtime の責任にしながら各 shift を new fix で追った。
> Iron Law（HEAD に anchor し、moving baseline を先に root-cause する）と 3-attempt stop があれば、
> 3 回目の re-measurement 後に spiral を止められた。

## Doctor signal catalogue（doctor signal 一覧）

よくある `ut-tdd doctor` non-zero causes とその意味。

- **plan-governance**: orphaned PLAN、`requires` target 欠落、broken pair。
  full governance output を読む。各 line は separate violation。
- **readability**: doc 内に mojibake marker（`U+FFFD`、half-width kana）が検出された。
  lossy conversion から復元しようとせず、encoding error 導入前の git history から restore する。
- **env-path**: `PATH` に required directory が無い。Windows では `System32` が存在するか確認する。
  `ut-tdd doctor` は missing segment を emit する。
- **descent-obligation**: L7 source file に paired L5/L6 design doc が無い。
  check を通すための stub doc は作らず、actual design を書く。

## Anti-patterns（避けるパターン）

- `ut-tdd doctor` green を「何も問題がない」と扱う。
  doctor は structural governance を確認する。substance の無い coverage による false-green gate は、
  real defect と共存しうる。
- root cause を特定せず symptom だけを fix する。
  Recovery exit contract は symptom removal だけでなく prevention measure を要求する。
- reproducible failure なしに new PLAN を開く。
  governance noise を作り、future triage を難しくする。
- agent narrative output から診断する。
  必ず `git status`、file reads、`ut-tdd status` で actual harness state を確認する。
