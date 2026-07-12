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

Specification-driven development（仕様駆動開発）は、各 V-model layer の design document（設計文書）を、
paired layer の test design（テスト設計）が準拠する contract（契約）として扱う。この skill は
FR-L1-50（strict TDD/DDD: tests の前に spec が存在し readable、implementation merge の前に
tests が存在し Green）と、L8 の GWT integration test discipline（結合テスト規律）を強制する。

## この skill を読む条件

- implementation 開始前に、新しい L5 detailed design または L6 unit-test design doc を書く。
- PLAN が pair-freeze にあり、design doc がまだ存在しない、または readable ではない。
- Discovery または Scrum S2 PoC で、coding 前に test を書ける lightweight spec（軽量仕様）が必要。
- L8 integration test scenario（結合テスト scenario）を設計しており、L5 spec に GWT section が必要。

## 仕様先行 contract（層とペアリング）

すべての implementation unit（実装単位）は、L5（detailed design）以上の spec と、
L6（unit）または L8（integration）の test design へ trace できなければならない。

```
L3 functional spec  <-->  L9 system-test design
L5 detailed design  <-->  L6 unit-test design
L5 detailed design  <-->  L8 integration-test design (GWT)
L6 unit-test design --> L7 implementation (tests must be Red-first)
```

paired design doc と test design doc が両方存在し、readability check
（Objective、Scope、mojibake なし）を pass するまで、PLAN は pair-freeze を越えられない。
`requires` が存在しない design doc を指している PLAN は `helix plan lint` が reject する。

## 利用可能な spec の書き方（L5）

test author（テスト作成者）が clarification（追加確認）を求めずに assertions（検証条件）を導ける場合、その spec は usable（利用可能）である。
必須 section（節）は次の通り。

1. **Objective** — feature の目的を 1 文で示す。
2. **Inputs / Preconditions** — edge cases を含むすべての inputs の typed names。
3. **Outputs / Postconditions** — すべての outputs と side effects
   （files written、DB rows、exit codes）の exact shapes（TypeScript types または JSON schema）。
4. **Error conditions** — 各 invalid input で function が何をするか。
5. **Out of scope** — この spec が意図的に決めないこと。

2 通りに解釈できる behaviour description（振る舞い説明）は避ける。曖昧な語がある場合は、
glossary正本（`docs/design/helix/L3-requirements/glossary-ssot.md`）に追加する。

## L8 の GWT integration tests

L8 integration scenario（結合 scenario）は Given-When-Then 形式で書く。

- **Given**: `.helix/`、`harness.db`、input fixtures の state。
- **When**: test 対象の `helix` command または function を指定 arguments で呼ぶ。
- **Then**: 存在すべき exact output artefacts、exit code、DB state、file changes。

各 GWT block は、L5 spec の Outputs/Postconditions section の行へ trace できなければならない。
L5 line reference の無い GWT block は test ではなく design gap（設計 gap）である。

## 仕様 freeze checklist（pair-freeze 前）

- [ ] `docs/design/L5-<module>.md` に L5 spec が存在し、5 section すべてを持つ。
- [ ] `docs/test-design/L6-<module>.md` に L6 unit-test design が存在し、
      L5 output/error condition ごとに少なくとも 1 つの test case がある。
- [ ] この PLAN が inter-module boundaries に触れる場合、L8 integration-test design が存在し、
      GWT blocks が L5 postconditions を参照している。
- [ ] `helix plan lint` exits 0 (PLAN `requires` links resolve).
- [ ] `helix doctor` が exit 0（orphaned design doc と broken pair が無い）。
- [ ] spec で使った new terms に glossary entry が無い状態がない。

## Discovery / Scrum lightweight path（軽量経路）

Discovery（S2 PoC）または Scrum spikes でも minimal spec（最小仕様）は必要。

- 1 文の **Objective**。
- **Spike question** — PoC が答えるべき binary decision。
- **Done condition** — question に答えたことを示す observable evidence。

PoC code を書く前に、done condition を scratch test file の failing assertion（失敗する検証条件）として書く。
S4 decide で scratch test を削除するか、正式 artifact へ promote する。

## Anti-patterns（避けるパターン）

- implementation 後に spec を書き、作ったものを後付けで正当化する。
  これは spec-first の design signal 目的を壊す。
- pair-freeze 時点で spec section が "TBD" のまま。
  これは unresolved dependency であり、PLAN blocker として扱う。
- `helix doctor` green を spec complete の証拠として使う。
  doctor は構造 governance（link existence、schema）を確認するが、spec substance（仕様の中身）は確認しない。
