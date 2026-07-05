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

# requirements handover（要件引き継ぎ）

HELIX で sessions、agents、layer boundaries をまたいで requirements baton を渡す方法を扱う
（FR-L1-42 provider handover、FR-L1-31 context continuity）。baton は machine-readable JSON snapshot と
human-readable carry list の組であり、どちらも handover 時点の real PLAN と git state と一致していなければならない。

## この skill を読む条件

- session が終了し、少なくとも 1 つの L1 または L3 PLAN がまだ `active`。
- agent が L1 elicitation または L3 requirement-authoring task を successor agent/session へ hand off する。
- `helix handover` output を書く前に stale carry items の有無を verify する必要がある。
- Discovery S4 decision outcome を Forward implementation 前に L3 requirement へ forward する必要がある。
- `helix doctor` が `.helix/handover/CURRENT.json` を stale または missing と flag する。

## handover record の構造（CURRENT.json）

`.helix/handover/CURRENT.json` は canonical baton である。requirements handover に関係する fields:

```json
{
  "session_id": "...",
  "timestamp": "2026-06-17T10:00:00Z",
  "active_plans": ["PLAN-L1-NN", "PLAN-L3-NN"],
  "carry": [
    {
      "id": "C-01",
      "description": "L3 requirement FR-L1-42 は Add-feature から未 back-fill",
      "plan_ref": "PLAN-L3-NN",
      "status": "open",
      "verified_against": "git log + helix status 2026-06-17"
    }
  ],
  "blocked": [],
  "context_snapshot": "..."
}
```

すべての carry item は `verified_against` note を持たなければならない。note には、
item が本当に open であることを確認した command と date を記録する。
re-verification なしに prior handover から copy しない。

## L1 から L3 への requirement baton procedure

L1-to-L3 descent は Forward drive で最も risk が高い handover である。
L1 の ambiguous FR が clarification なしに L3 へ入ると、L4-L7 まで silent design gap として伝播する。

baton を渡す前の checklist:

- [ ] L1 elicitation の各 FR が unique/stable ID（FR-L1-NN）を持つ。
- [ ] implementation を要するすべての FR に、`docs/plans/` 内の corresponding PLAN がある
      （または defer 理由を説明する `draft` stub がある）。
- [ ] ambiguous FRs は `clarification_pending` marker と、PLAN `review_evidence` field 内の linked open question を持つ。
      prose に放置しない。
- [ ] hand off 対象のすべての L1/L3 PLAN で `helix plan lint` が 0 で終了する。
- [ ] `helix doctor` が 0 で終了する。orphaned FRs と broken PLAN dependencies が無い。
- [ ] `helix handover` を実行済みで、`.helix/handover/CURRENT.json` が current state を反映している。

## Context continuity の保証（FR-L1-31）

successor agent/session は、prior agent の chat history に頼らず、handover record だけで context を reconstruct できなければならない。

これを保証するために:

1. elicitation 中の non-obvious decision について、PLAN `review_evidence` field に rationale を含める。
2. session 中に導入した new L1 terms は、handover 前に L0 glossary へ追加する。
3. Discovery PoC の `decision_outcome` が L3 requirement に影響する場合、link を明示する。
   L3 PLAN `dependencies` field が PoC PLAN ID を参照する。
4. carry items は PLAN ID を参照する。PLAN anchor の無い free-text carry は `helix doctor` から不可視で、
   `helix status` にも拾われない。

## Handover validation commands（handover 検証 command）

```
helix handover             # .helix/handover/CURRENT.json を write/refresh する
helix status               # active_plans が実際の PLAN state と一致するか検証する
helix doctor               # orphaned FRs や broken dependencies が無いことを確認する
helix plan lint            # handover に列挙された PLAN を schema 検証する
helix review --uncommitted # session boundary を越える前に review evidence gate を確認する
```

session close 宣言前に 5 つすべてを実行する。green `helix doctor` なしに書かれた handover は false-clean baton である。

## Stale handover detection（stale handover 検出）

`helix doctor` は次の場合に CURRENT.json を stale と flag する。

- `timestamp` が、`active_plans` に列挙された PLAN に触れた最新 commit より古い。
- carry item が `status: done` の PLAN を参照している
  （closed carry が cleanup されていない）。
- `active_plans` が `docs/plans/` にもう存在しない PLAN ID を含む。

stale handover を検出した場合は、各 carry item を `helix status` と `git log` で verify してから
`helix handover` を再実行する。stale CURRENT.json を延長しない。verification 後に overwrite する。

## Anti-patterns（避けるパターン）

- previous handover から carry items を copy forward し、`helix status` と `git log` で re-verify しない。
  work 完了後も複数 sessions に残る ghost carry items を生む。
- commit message や chat に handover prose を書く。
  `helix doctor` から不可視で、session boundary で失われる。
- `clarification_pending` FRs を解決せずに L3 PLAN を successor に渡す。
  ambiguity は L5/L6 の design gap として表面化し、trace back が高コストになる。
- `.helix/handover/CURRENT.json` を live dashboard として扱う。
  これは point-in-time snapshot であり、必ず `helix status` と併用する。
