---
schema_version: skill.v1
name: requirements-handover
skill_type: process
applies_to:
  layers:
    - L1
    - L3
  drive_models:
    - Forward
    - Add-feature
    - Discovery
    - Scrum
    - Reverse
    - Recovery
---

# requirements continuity（要件継続）

HELIX で sessions、agents、layer boundaries をまたいで requirements baton を渡す方法を扱う
（FR-L1-42 provider evidence、FR-L1-31 context continuity）。正本は authored requirement/PLAN と
`harness.db` continuation projectionであり、共有memoryはbounded recall、provider evidenceは監査専用である。

## この skill を読む条件

- session が終了し、少なくとも 1 つの L1 または L3 PLAN がまだ `active`。
- agent が L1 elicitation または L3 requirement-authoring task を successor agent/session へ hand off する。
- session boundaryでprojected next actionとauthored PLANの整合をverifyする必要がある。
- Discovery S4 decision outcome を Forward implementation 前に L3 requirement へ forward する必要がある。
- `helix doctor` が continuation projection を stale、missing、event frontier不一致とflagする。

## continuation baton の構造

append-only session eventをdurable appendしてから、`harness.db`へactive PLAN、blocker、next action、
event frontierを冪等投影する。各open itemはPLAN IDまたはrequirement IDへtraceできなければならない。
共有memoryのbreadcrumbはprovenanceとTTLを持つ補助情報であり、DB projectionを上書きしない。

## L1 から L3 への requirement baton procedure

L1-to-L3 descent は Forward drive で最も risk が高い baton transfer である。
L1 の ambiguous FR が clarification なしに L3 へ入ると、L4-L7 まで silent design gap として伝播する。

baton を渡す前の checklist:

- [ ] L1 elicitation の各 FR が unique/stable ID（FR-L1-NN）を持つ。
- [ ] implementation を要するすべての FR に、`docs/plans/` 内の corresponding PLAN がある
      （または defer 理由を説明する `draft` stub がある）。
- [ ] ambiguous FRs は `clarification_pending` marker と、PLAN `review_evidence` field 内の linked open question を持つ。
      prose に放置しない。
- [ ] hand off 対象のすべての L1/L3 PLAN で `helix plan lint` が 0 で終了する。
- [ ] `helix doctor` が 0 で終了する。orphaned FRs と broken PLAN dependencies が無い。
- [ ] `helix status` が `harness.db` projectionのcurrent active PLANとnext actionを反映している。

## Context continuity の保証（FR-L1-31）

successor agent/session は、prior agentのchat historyに頼らず、authored sources、DB projection、bounded memoryからcontextをreconstructできなければならない。

これを保証するために:

1. elicitation 中の non-obvious decision について、PLAN `review_evidence` field に rationale を含める。
2. session 中に導入した new L1 terms は、session boundary 前に L0 glossary へ追加する。
3. Discovery PoC の `decision_outcome` が L3 requirement に影響する場合、link を明示する。
   L3 PLAN `dependencies` field が PoC PLAN ID を参照する。
4. carry items は PLAN ID を参照する。PLAN anchor の無い free-text carry は `helix doctor` から不可視で、
   `helix status` にも拾われない。

## Continuation validation commands（継続検証 command）

```
helix status               # active_plans が実際の PLAN state と一致するか検証する
helix doctor               # orphaned FRs や broken dependencies が無いことを確認する
helix plan lint            # active PLAN を schema 検証する
helix review --uncommitted # session boundary を越える前に review evidence gate を確認する
helix memory list harness  # bounded recallのprovenanceとTTLを確認する
```

session close 宣言前に必要な検証を実行する。green `helix doctor`なしのcontinuationはfalse-clean batonである。

## Stale continuation detection（stale 継続検出）

`helix doctor` はevent frontierとprojection frontierの不一致、terminal PLANを指すopen next action、
存在しないPLAN ID、DBとmemoryの矛盾をflagする。検出時は`helix status`、`git log`、authored sourcesで
verifyし、event replayまたは`helix db rebuild`へ送る。memoryだけを修正してgreen扱いにしない。

## Anti-patterns（避けるパターン）

- previous sessionのmemory itemをcopy forwardし、`helix status`と`git log`でre-verifyしない。
  work完了後も複数sessionsに残るghost itemを生む。
- commit message や chat に continuation prose を書く。
  `helix doctor` から不可視で、session boundary で失われる。
- `clarification_pending` FRs を解決せずに L3 PLAN を successor に渡す。
  ambiguity は L5/L6 の design gap として表面化し、trace back が高コストになる。
- provider evidenceをcontinuation sourceとして扱う。provider evidenceは`helix provider evidence export/status`で
  queryする監査専用artifactであり、recall/continuationへjoinしない。
