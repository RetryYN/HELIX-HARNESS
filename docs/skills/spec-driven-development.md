---
schema_version: skill.v1
name: spec-driven-development
skill_type: design-contract
applies_to:
  layers:
    - L1
    - L3
    - L5
    - L6
    - L8
  drive_models:
    - Forward
    - Add-feature
    - Discovery
    - Scrum
---

# spec driven development（仕様駆動開発）

Specification-driven development は、各 V-model layer の design document を、
paired layer の test design が準拠する contract として扱う。この skill は
FR-L1-50（strict TDD/DDD: tests の前に spec が存在し readable、implementation merge の前に
tests が存在し Green）と、L8 の GWT integration test discipline を強制する。

## この skill を読む条件

- implementation 開始前に、新しい L5 detailed design または L6 unit-test design doc を書く。
- PLAN が pair-freeze にあり、design doc がまだ存在しない、または readable ではない。
- Discovery または Scrum S2 PoC で、coding 前に test を書ける lightweight spec が必要。
- L8 integration test scenario を設計しており、L5 spec に GWT section が必要。

## Spec-first contract（層とペアリング）

すべての implementation unit は、L5（detailed design）以上の spec と、
L6（unit）または L8（integration）の test design へ trace できなければならない。

```
L3 functional spec  <-->  L9 system-test design
L5 detailed design  <-->  L6 unit-test design
L5 detailed design  <-->  L8 integration-test design (GWT)
L6 unit-test design --> L7 implementation (tests must be Red-first)
```

paired design doc と test design doc が両方存在し、readability check
（Objective、Scope、mojibake なし）を pass するまで、PLAN は pair-freeze を越えられない。
`requires` が存在しない design doc を指している PLAN は `ut-tdd plan lint` が reject する。

## usable spec の書き方（L5）

test author が clarification を求めずに assertions を導ける場合、その spec は usable である。
必須 section は次の通り。

1. **Objective** — feature の目的を 1 文で示す。
2. **Inputs / Preconditions** — edge cases を含むすべての inputs の typed names。
3. **Outputs / Postconditions** — すべての outputs と side effects
   （files written、DB rows、exit codes）の exact shapes（TypeScript types または JSON schema）。
4. **Error conditions** — 各 invalid input で function が何をするか。
5. **Out of scope** — この spec が意図的に決めないこと。

2 通りに解釈できる behaviour description は避ける。曖昧な語がある場合は、
L0 glossary（`docs/design/L0-glossary.md`）に追加する。

## L8 の GWT integration tests

L8 integration scenario は Given-When-Then 形式で書く。

- **Given**: `.ut-tdd/`、`harness.db`、input fixtures の state。
- **When**: test 対象の `ut-tdd` command または function を指定 arguments で呼ぶ。
- **Then**: 存在すべき exact output artefacts、exit code、DB state、file changes。

各 GWT block は、L5 spec の Outputs/Postconditions section の行へ trace できなければならない。
L5 line reference の無い GWT block は test ではなく design gap である。

## Spec-freeze checklist（pair-freeze 前）

- [ ] `docs/design/L5-<module>.md` に L5 spec が存在し、5 section すべてを持つ。
- [ ] `docs/test-design/L6-<module>.md` に L6 unit-test design が存在し、
      L5 output/error condition ごとに少なくとも 1 つの test case がある。
- [ ] この PLAN が inter-module boundaries に触れる場合、L8 integration-test design が存在し、
      GWT blocks が L5 postconditions を参照している。
- [ ] `ut-tdd plan lint` exits 0 (PLAN `requires` links resolve).
- [ ] `ut-tdd doctor` が exit 0（orphaned design doc と broken pair が無い）。
- [ ] spec で使った new terms に glossary entry が無い状態がない。

## Discovery / Scrum lightweight path（軽量経路）

Discovery（S2 PoC）または Scrum spikes でも minimal spec は必要。

- 1 文の **Objective**。
- **Spike question** — PoC が答えるべき binary decision。
- **Done condition** — question に答えたことを示す observable evidence。

PoC code を書く前に、done condition を scratch test file の failing assertion として書く。
S4 decide で scratch test を削除するか、正式 artifact へ promote する。

## Anti-patterns（避けるパターン）

- implementation 後に spec を書き、作ったものを後付けで正当化する。
  これは spec-first の design signal 目的を壊す。
- pair-freeze 時点で spec section が "TBD" のまま。
  これは unresolved dependency であり、PLAN blocker として扱う。
- `ut-tdd doctor` green を spec complete の証拠として使う。
  doctor は structural governance（link existence、schema）を確認するが、spec substance は確認しない。
