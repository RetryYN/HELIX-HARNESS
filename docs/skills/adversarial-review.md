---
schema_version: skill.v1
name: adversarial-review
skill_type: review
applies_to:
  layers:
    - L2
    - L3
    - L4
    - L5
    - L6
    - L7
    - L8
    - L10
    - L12
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Recovery
    - Refactor
---

# adversarial-review（敵対的レビュー）

Forward cycle の judgement gate G2、G4、G5、G6、G7 で必要になる、前提を疑う独立 review
（FR-L1-13 workflow、FR-L1-21 cross-agent review）。Adversarial review は self-review と異なり、
reviewer が成果物を確認するのではなく、積極的に反証しようとする。

## この skill を load するタイミング

- hybrid または intra-runtime-subagent mode で pair-freeze、trace-freeze、accept gate を通過する。
- `ut-tdd review --uncommitted` の finding が曖昧で、独立した judgement が必要である。
- Recovery cycle で、元の failure path が閉じたことを示す必要がある。
- 新しい agent capability を持つ Add-feature PLAN に safety reasoning が必要である。

## Adversarial stance（敵対的姿勢）

reviewer の出発点は、artifact が誤っている、または不完全であるという仮定である。
evidence はその仮定を覆す必要があり、覆い隠してはいけない。特に probing する failure modes は次のとおり。

- **Coverage without substance（中身のない coverage）.** `ut-tdd doctor` が green で `ut-tdd vmodel lint` が pass しても、
  design content が正しいとは限らない。各 design doc を読み、主張が本文で実際に裏付けられているか確認する。
- **Gate evasion（gate 回避）.** すべての `// biome-ignore` と `// @ts-ignore` に、PLAN-linked rationale があることを確認する。
  説明のない suppression は review fail とする。
- **Trace completeness（trace 完全性）.** PLAN の `review_evidence` field に記載されたすべての FR は、
  ID string だけではなく、実在する design doc または test assertion に対応している必要がある。
- **Absent layer artifacts（layer artifact 欠落）.** 新しい function に対する L6 test-design doc が欠けている場合、
  L7 code が存在していても open obligation として記録する。
- **Handover freshness（handover 鮮度）.** session が runtime boundary をまたぐ場合、
  `.ut-tdd/handover/CURRENT.json` が存在し、stale でなく、carry list が `ut-tdd status` output と一致することを確認する。

## Gate 別 review procedure

**G2（pair-freeze: 実装へ進める設計準備）:**
1. `ut-tdd plan lint` が exit 0 になる。
2. `ut-tdd doctor` が exit 0 になる。
3. header table だけでなく、design doc body を読む。
4. design が stated layer の期待 granularity に合っていることを確認する
   （L5 = unit test boundary であり、L3 feature-level prose ではない）。
5. reviewer identity と outcome とともに、finding を PLAN `review_evidence` に記録する。

**G4/G5（trace-freeze: 実装完了）:**
1. `bun run typecheck`、`bun run lint`、`bun run test` がすべて HEAD で exit 0 になる。
2. `ut-tdd doctor` が exit 0 になる。
3. PLAN rationale なしの `.skip` または `todo` が Vitest scope に無いことを確認する。
4. test assertion を3件 spot-check する。指定された behaviour を exercise しているか、
   happy path だけを verify していないかを確認する。
5. finding を記録する。

**G6/G7（accept: final acceptance）:**
1. `ut-tdd review --uncommitted` に blocking findings が無い。
2. すべての G4/G5 conditions が引き続き green である。
3. 該当する ADR が `Accepted` になっている。
4. Handover が updated または closed である。

## Evidence format（証跡形式）

adversarial review evidence は PLAN の `review_evidence` field に記録する。

```
reviewer: <agent-slug or "intra_runtime_subagent">
gate: G5
outcome: PASS | FAIL | CONDITIONAL
findings:
  - <specific finding or "none">
timestamp: <ISO-8601>
```

evidence が記録されていない gate は、`ut-tdd doctor` status に関係なく cleared ではない。

## Anti-patterns（アンチパターン）

- `ut-tdd doctor` green を唯一の required check とみなす。doctor が見るのは structure であり substance ではない。
- partial diff だけを対象に review する。常に full PLAN scope を review する。
- hybrid mode で self-review だけを review evidence とする。hybrid mode では別 runtime または subagent family が必要である。
