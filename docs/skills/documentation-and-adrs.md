---
schema_version: skill.v1
name: documentation-and-adrs
skill_type: design-contract
applies_to:
  layers:
    - L1
    - L2
    - L3
    - L4
    - L5
    - L6
  drive_models:
    - Forward
    - Add-feature
    - Reverse
    - Retrofit
    - Discovery
---

# ドキュメントと ADR

freeze と cross-agent review に耐える V-model design doc または ADR の書き方を扱う。
`docs/design/` doc や `docs/adr/ADR-NNN-*.md` を作成・更新する場合、または freeze gate 前に
readability check が必要な場合に使う。

## この skill を読むタイミング

- 任意の design layer（L1-L6）で design doc を作成または更新する。
- ADR を作成または改訂する。
- pair-freeze または trace-freeze gate を越えようとしている。
- Reverse R2-R4 pass で implementation から design doc を back-fill する。

## Structural baseline（pair-freeze 前）

すべての HELIX design doc は次を必要とする。**Objective/TL;DR**（2-3 文。何が変わるか、
なぜか、どの layer か）、**Scope / Non-goals**、**Prerequisites**（upstream layer docs、
PLAN/ADR IDs）、V-model 粒度の **main content**（unit test が書ける粒度で設計されていること）、
**verification / acceptance criteria**、**terminology**（新語は L0 glossary へ追加）。
ADR はさらに Context、Decision、Consequences、Status を必要とする。

## Writing rules（執筆 rule）

- 1 文に 1 claim。actor を明示する（active voice）。Gate conditions は executable contract として書く。
  "CI must be green and `helix doctor` must exit 0 before pair-freeze" は、
  "tests green なら freeze が通る" より強い。
- 用語を統一する。`helix doctor` / `rule-drift` checks の spelling に合わせる。
  synonym drift は adapter rule-drift failure を引き起こす。
- 明示的な referent の無い bare pronouns（"this", "it"）を使わない。freeze-review failure になる。

## Freeze 前 readability check（pre-pair-freeze）

1. half-width kana (U+FF61-FF9F) と U+FFFD を scan する。これは mojibake-corrupted save の marker なので、
   corrupted doc を freeze しない。
2. Objective/TL;DR が存在し、5 文以下である。
3. 導入したすべての term が L0 glossary spelling と一致する。
4. Scope と Non-goals が存在する。PLAN cross-reference の無い裸の `TODO` が無い。
5. peer review 前に、schema-level issues 用に `helix plan lint`、review findings 用に
   `helix review --uncommitted` を実行する。

## ADR procedure（ADR 手順）

1. 最も近い既存 ADR を structural template として copy する。
2. 先に Context を埋める。decision を強制する observed facts を書く
   （Discovery PLAN / Scrum S2 PoC evidence in `.helix/` を引用する）。
3. Decision は active-voice の 1 文で書く。
4. Consequences を列挙する: positive、negative、risks-to-monitor。
5. Status は `Proposed` にする。`helix review --uncommitted` が clean で、
   `helix doctor` が exit 0 になった後だけ `Accepted` へ進める。ADR は PLAN `dependencies`
   から参照されるため、欠落または誤 title の ADR は governance lint で fail する。

## R2-R4 の Reverse back-fill

R2 は observed code から as-is architecture を記述する（aspirational にしない）。R3 は modules を
L3 functional requirements へ map する。R4 は Forward が作成したかのように L1/L3 requirement update
を書く（scope + acceptance + verification）。back-filled doc も trace-freeze 前に同じ readability check を通す。

## Freeze 前の自己確認 checklist

- [ ] Objective/TL;DR が 5 文以下。Scope と Non-goals が埋まっている。
- [ ] passive-voice gate conditions と bare pronouns が無い。
- [ ] Terms が L0 glossary と一致する、または L0 glossary を拡張している。
- [ ] mojibake markers（half-width kana、U+FFFD）が無い。
- [ ] ADR Status が設定されている。
- [ ] `helix plan lint` と `helix doctor` が exit 0。
